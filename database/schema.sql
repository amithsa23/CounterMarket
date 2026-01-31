-- WageWatch Database Schema for Snowflake
-- Hack Violet 2026 - Pay Equity Analytics Platform

-- =============================================================================
-- CREATE DATABASE AND SCHEMA
-- =============================================================================

CREATE DATABASE IF NOT EXISTS WAGEWATCH;
USE DATABASE WAGEWATCH;

CREATE SCHEMA IF NOT EXISTS PUBLIC;
USE SCHEMA PUBLIC;

-- =============================================================================
-- USERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(512) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    is_verified BOOLEAN DEFAULT FALSE,
    profile_complete BOOLEAN DEFAULT FALSE
);

-- =============================================================================
-- SALARY SUBMISSIONS TABLE (Core Data)
-- =============================================================================

CREATE TABLE IF NOT EXISTS salary_submissions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),

    -- Job Information
    job_title VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    years_experience INTEGER NOT NULL,
    education_level VARCHAR(50),

    -- Compensation
    salary DECIMAL(12, 2) NOT NULL,
    bonus DECIMAL(12, 2),
    stock_options DECIMAL(12, 2),
    total_compensation DECIMAL(12, 2),

    -- Location
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    remote_status VARCHAR(50), -- 'remote', 'hybrid', 'onsite'

    -- Demographics (Optional, for analytics)
    gender VARCHAR(50),
    ethnicity VARCHAR(100),
    age_range VARCHAR(20),

    -- Company Info
    company_name VARCHAR(255),
    company_size VARCHAR(50), -- 'startup', 'small', 'medium', 'large', 'enterprise'
    company_type VARCHAR(50), -- 'public', 'private', 'nonprofit', 'government'

    -- Metadata
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    is_verified BOOLEAN DEFAULT FALSE,
    data_quality_score DECIMAL(3, 2)
);

-- =============================================================================
-- TRANSPARENT COMPANIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS transparent_companies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(255),
    website VARCHAR(500),

    -- Transparency Metrics
    transparency_score INTEGER, -- 0-100
    has_pay_bands BOOLEAN DEFAULT FALSE,
    publishes_salary_ranges BOOLEAN DEFAULT FALSE,
    equal_pay_certified BOOLEAN DEFAULT FALSE,
    conducts_pay_audits BOOLEAN DEFAULT FALSE,

    -- Additional Info
    employee_count INTEGER,
    founded_year INTEGER,
    description TEXT,

    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- =============================================================================
-- NEGOTIATION HISTORY TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS negotiation_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),

    -- Before/After
    previous_salary DECIMAL(12, 2),
    new_salary DECIMAL(12, 2),
    increase_percentage DECIMAL(5, 2),

    -- Context
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    negotiation_type VARCHAR(50), -- 'new_job', 'promotion', 'annual_review', 'market_adjustment'

    -- Outcome
    was_successful BOOLEAN,
    notes TEXT,

    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- =============================================================================
-- ANALYTICS VIEWS (Advanced Snowflake Features)
-- =============================================================================

-- Gender Pay Gap View
CREATE OR REPLACE VIEW v_gender_pay_gap AS
SELECT
    industry,
    gender,
    COUNT(*) as sample_size,
    AVG(salary) as avg_salary,
    MEDIAN(salary) as median_salary,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75,
    STDDEV(salary) as salary_stddev
FROM salary_submissions
WHERE gender IS NOT NULL
GROUP BY industry, gender
HAVING COUNT(*) >= 5;

-- Industry Benchmark View
CREATE OR REPLACE VIEW v_industry_benchmarks AS
SELECT
    industry,
    job_title,
    years_experience,
    COUNT(*) as sample_size,
    AVG(salary) as avg_salary,
    MEDIAN(salary) as median_salary,
    MIN(salary) as min_salary,
    MAX(salary) as max_salary,
    PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY salary) as p10,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75,
    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary) as p90
FROM salary_submissions
GROUP BY industry, job_title, years_experience
HAVING COUNT(*) >= 3;

-- Location-Based Salary View
CREATE OR REPLACE VIEW v_location_salaries AS
SELECT
    location,
    industry,
    COUNT(*) as sample_size,
    AVG(salary) as avg_salary,
    MEDIAN(salary) as median_salary,
    AVG(CASE WHEN gender = 'Female' THEN salary END) as avg_female_salary,
    AVG(CASE WHEN gender = 'Male' THEN salary END) as avg_male_salary
FROM salary_submissions
GROUP BY location, industry
HAVING COUNT(*) >= 5;

-- Monthly Trends View with Window Functions
CREATE OR REPLACE VIEW v_salary_trends AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    industry,
    COUNT(*) as submissions,
    AVG(salary) as avg_salary,
    MEDIAN(salary) as median_salary,
    LAG(AVG(salary)) OVER (PARTITION BY industry ORDER BY DATE_TRUNC('month', created_at)) as prev_month_avg,
    AVG(AVG(salary)) OVER (
        PARTITION BY industry
        ORDER BY DATE_TRUNC('month', created_at)
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as moving_avg_3mo
FROM salary_submissions
GROUP BY DATE_TRUNC('month', created_at), industry;

-- =============================================================================
-- SECURE VIEWS (Privacy Protection)
-- =============================================================================

-- Anonymized salary data for public sharing
CREATE OR REPLACE SECURE VIEW v_anonymous_salaries AS
SELECT
    job_title,
    industry,
    FLOOR(years_experience / 2) * 2 as experience_band, -- Round to 2-year bands
    location,
    ROUND(salary, -3) as salary_rounded, -- Round to nearest $1000
    gender,
    remote_status,
    company_size,
    DATE_TRUNC('quarter', created_at) as submission_quarter
FROM salary_submissions
WHERE data_quality_score >= 0.7 OR data_quality_score IS NULL;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Note: Snowflake uses micro-partitions and automatic clustering
-- These are clustering keys for optimal query performance

ALTER TABLE salary_submissions CLUSTER BY (industry, job_title, years_experience);

-- =============================================================================
-- SAMPLE DATA GENERATION PROCEDURE
-- =============================================================================

CREATE OR REPLACE PROCEDURE generate_sample_data(num_records INTEGER)
RETURNS STRING
LANGUAGE JAVASCRIPT
AS
$$
    var industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Marketing'];
    var titles = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Marketing Manager', 'Sales Representative', 'HR Manager', 'Financial Analyst', 'Project Manager'];
    var locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Atlanta, GA'];
    var genders = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
    var education = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD'];
    var company_sizes = ['startup', 'small', 'medium', 'large', 'enterprise'];
    var remote_statuses = ['remote', 'hybrid', 'onsite'];

    var sql = `INSERT INTO salary_submissions (id, job_title, industry, years_experience, salary, location, gender, education_level, company_size, remote_status, created_at) VALUES `;
    var values = [];

    for (var i = 0; i < NUM_RECORDS; i++) {
        var id = 'sample_' + i + '_' + Date.now();
        var title = titles[Math.floor(Math.random() * titles.length)];
        var industry = industries[Math.floor(Math.random() * industries.length)];
        var experience = Math.floor(Math.random() * 20) + 1;
        var baseSalary = 50000 + (experience * 5000) + (Math.random() * 30000);
        var gender = genders[Math.floor(Math.random() * genders.length)];

        // Add pay gap simulation for realistic data
        if (gender === 'Female') {
            baseSalary = baseSalary * 0.82; // 18% pay gap
        }

        var location = locations[Math.floor(Math.random() * locations.length)];
        var edu = education[Math.floor(Math.random() * education.length)];
        var size = company_sizes[Math.floor(Math.random() * company_sizes.length)];
        var remote = remote_statuses[Math.floor(Math.random() * remote_statuses.length)];

        values.push(`('${id}', '${title}', '${industry}', ${experience}, ${Math.round(baseSalary)}, '${location}', '${gender}', '${edu}', '${size}', '${remote}', DATEADD('day', -${Math.floor(Math.random() * 365)}, CURRENT_DATE()))`);
    }

    sql += values.join(', ');

    snowflake.execute({sqlText: sql});

    return 'Generated ' + NUM_RECORDS + ' sample records';
$$;

-- Generate 1000 sample records
-- CALL generate_sample_data(1000);
