"""
CounterMarket: Pay Equity Analytics Platform
Flask Backend with Snowflake Integration + RAG-Powered AI
Hack Violet 2026 - Snowflake API Category

Features:
- Snowflake Cortex AI (Llama 3.1-8b) for intelligent responses
- RAG (Retrieval Augmented Generation) with vector embeddings
- CORTEX.EMBED_TEXT_768 for semantic search
- VECTOR_COSINE_SIMILARITY for document retrieval
"""

import os
import random
from datetime import datetime, timedelta
import secrets
import statistics
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import snowflake.connector

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow all origins for development

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))

# =============================================================================
# COMPANY SALARY DATA - Realistic multipliers based on market research
# =============================================================================

# Company salary multipliers relative to market median (1.0 = market average)
# Based on publicly available salary data from Levels.fyi, Glassdoor, etc.
COMPANY_SALARY_DATA = {
    # FAANG / Big Tech (Premium pay)
    'google': {'multiplier': 1.45, 'name': 'Google', 'tier': 'top'},
    'meta': {'multiplier': 1.50, 'name': 'Meta', 'tier': 'top'},
    'facebook': {'multiplier': 1.50, 'name': 'Meta', 'tier': 'top'},
    'apple': {'multiplier': 1.35, 'name': 'Apple', 'tier': 'top'},
    'amazon': {'multiplier': 1.25, 'name': 'Amazon', 'tier': 'top'},
    'netflix': {'multiplier': 1.60, 'name': 'Netflix', 'tier': 'top'},
    'microsoft': {'multiplier': 1.30, 'name': 'Microsoft', 'tier': 'top'},

    # High-paying tech companies
    'stripe': {'multiplier': 1.55, 'name': 'Stripe', 'tier': 'top'},
    'airbnb': {'multiplier': 1.40, 'name': 'Airbnb', 'tier': 'top'},
    'uber': {'multiplier': 1.30, 'name': 'Uber', 'tier': 'top'},
    'lyft': {'multiplier': 1.20, 'name': 'Lyft', 'tier': 'high'},
    'doordash': {'multiplier': 1.25, 'name': 'DoorDash', 'tier': 'high'},
    'coinbase': {'multiplier': 1.45, 'name': 'Coinbase', 'tier': 'top'},
    'robinhood': {'multiplier': 1.35, 'name': 'Robinhood', 'tier': 'high'},
    'databricks': {'multiplier': 1.50, 'name': 'Databricks', 'tier': 'top'},
    'snowflake': {'multiplier': 1.45, 'name': 'Snowflake', 'tier': 'top'},
    'palantir': {'multiplier': 1.35, 'name': 'Palantir', 'tier': 'high'},
    'splunk': {'multiplier': 1.25, 'name': 'Splunk', 'tier': 'high'},

    # Enterprise tech
    'salesforce': {'multiplier': 1.25, 'name': 'Salesforce', 'tier': 'high'},
    'oracle': {'multiplier': 1.10, 'name': 'Oracle', 'tier': 'mid'},
    'ibm': {'multiplier': 1.00, 'name': 'IBM', 'tier': 'mid'},
    'cisco': {'multiplier': 1.15, 'name': 'Cisco', 'tier': 'mid'},
    'vmware': {'multiplier': 1.20, 'name': 'VMware', 'tier': 'high'},
    'adobe': {'multiplier': 1.30, 'name': 'Adobe', 'tier': 'high'},
    'intuit': {'multiplier': 1.25, 'name': 'Intuit', 'tier': 'high'},
    'servicenow': {'multiplier': 1.30, 'name': 'ServiceNow', 'tier': 'high'},
    'workday': {'multiplier': 1.25, 'name': 'Workday', 'tier': 'high'},

    # Fintech & Finance
    'jpmorgan': {'multiplier': 1.20, 'name': 'JPMorgan Chase', 'tier': 'high'},
    'goldman sachs': {'multiplier': 1.35, 'name': 'Goldman Sachs', 'tier': 'top'},
    'morgan stanley': {'multiplier': 1.30, 'name': 'Morgan Stanley', 'tier': 'high'},
    'capital one': {'multiplier': 1.15, 'name': 'Capital One', 'tier': 'mid'},
    'american express': {'multiplier': 1.15, 'name': 'American Express', 'tier': 'mid'},
    'visa': {'multiplier': 1.25, 'name': 'Visa', 'tier': 'high'},
    'mastercard': {'multiplier': 1.25, 'name': 'Mastercard', 'tier': 'high'},
    'paypal': {'multiplier': 1.20, 'name': 'PayPal', 'tier': 'high'},
    'square': {'multiplier': 1.30, 'name': 'Block (Square)', 'tier': 'high'},
    'block': {'multiplier': 1.30, 'name': 'Block', 'tier': 'high'},

    # E-commerce & Retail
    'walmart': {'multiplier': 0.95, 'name': 'Walmart', 'tier': 'mid'},
    'target': {'multiplier': 0.95, 'name': 'Target', 'tier': 'mid'},
    'costco': {'multiplier': 1.05, 'name': 'Costco', 'tier': 'mid'},
    'shopify': {'multiplier': 1.25, 'name': 'Shopify', 'tier': 'high'},
    'ebay': {'multiplier': 1.15, 'name': 'eBay', 'tier': 'mid'},
    'etsy': {'multiplier': 1.15, 'name': 'Etsy', 'tier': 'mid'},

    # Healthcare
    'unitedhealth': {'multiplier': 1.10, 'name': 'UnitedHealth', 'tier': 'mid'},
    'cvs': {'multiplier': 0.95, 'name': 'CVS Health', 'tier': 'mid'},
    'pfizer': {'multiplier': 1.15, 'name': 'Pfizer', 'tier': 'mid'},
    'johnson & johnson': {'multiplier': 1.20, 'name': 'Johnson & Johnson', 'tier': 'high'},

    # Consulting
    'mckinsey': {'multiplier': 1.40, 'name': 'McKinsey', 'tier': 'top'},
    'bain': {'multiplier': 1.35, 'name': 'Bain & Company', 'tier': 'top'},
    'bcg': {'multiplier': 1.35, 'name': 'BCG', 'tier': 'top'},
    'deloitte': {'multiplier': 1.10, 'name': 'Deloitte', 'tier': 'mid'},
    'accenture': {'multiplier': 1.05, 'name': 'Accenture', 'tier': 'mid'},
    'pwc': {'multiplier': 1.05, 'name': 'PwC', 'tier': 'mid'},
    'kpmg': {'multiplier': 1.05, 'name': 'KPMG', 'tier': 'mid'},
    'ey': {'multiplier': 1.05, 'name': 'EY', 'tier': 'mid'},

    # Startups / Growth (varies widely, using averages)
    'openai': {'multiplier': 1.55, 'name': 'OpenAI', 'tier': 'top'},
    'anthropic': {'multiplier': 1.50, 'name': 'Anthropic', 'tier': 'top'},
    'figma': {'multiplier': 1.40, 'name': 'Figma', 'tier': 'top'},
    'notion': {'multiplier': 1.30, 'name': 'Notion', 'tier': 'high'},
    'discord': {'multiplier': 1.30, 'name': 'Discord', 'tier': 'high'},
    'slack': {'multiplier': 1.25, 'name': 'Slack', 'tier': 'high'},
    'zoom': {'multiplier': 1.20, 'name': 'Zoom', 'tier': 'high'},
    'twilio': {'multiplier': 1.25, 'name': 'Twilio', 'tier': 'high'},
    'datadog': {'multiplier': 1.35, 'name': 'Datadog', 'tier': 'high'},
    'mongodb': {'multiplier': 1.30, 'name': 'MongoDB', 'tier': 'high'},

    # Gaming
    'nvidia': {'multiplier': 1.40, 'name': 'NVIDIA', 'tier': 'top'},
    'amd': {'multiplier': 1.20, 'name': 'AMD', 'tier': 'high'},
    'intel': {'multiplier': 1.15, 'name': 'Intel', 'tier': 'mid'},
    'ea': {'multiplier': 1.15, 'name': 'Electronic Arts', 'tier': 'mid'},
    'activision': {'multiplier': 1.10, 'name': 'Activision Blizzard', 'tier': 'mid'},
    'riot games': {'multiplier': 1.25, 'name': 'Riot Games', 'tier': 'high'},
    'epic games': {'multiplier': 1.30, 'name': 'Epic Games', 'tier': 'high'},

    # Telecom
    'verizon': {'multiplier': 1.05, 'name': 'Verizon', 'tier': 'mid'},
    'at&t': {'multiplier': 1.00, 'name': 'AT&T', 'tier': 'mid'},
    't-mobile': {'multiplier': 1.05, 'name': 'T-Mobile', 'tier': 'mid'},
}

def get_company_data(company_name):
    """Get company salary data based on company name."""
    if not company_name:
        return None

    # Normalize company name for lookup
    normalized = company_name.lower().strip()

    # Direct match
    if normalized in COMPANY_SALARY_DATA:
        return COMPANY_SALARY_DATA[normalized]

    # Partial match (e.g., "Google Inc" -> "google")
    for key, data in COMPANY_SALARY_DATA.items():
        if key in normalized or normalized in key:
            return data
        # Also check the display name
        if data['name'].lower() in normalized or normalized in data['name'].lower():
            return data

    return None

# =============================================================================
# SNOWFLAKE CONNECTION
# =============================================================================

def get_snowflake_connection(database=None):
    """Create a new Snowflake connection."""
    return snowflake.connector.connect(
        account=os.getenv('SNOWFLAKE_ACCOUNT'),
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
        database=database or os.getenv('SNOWFLAKE_DATABASE'),
        schema=os.getenv('SNOWFLAKE_SCHEMA')
    )

def execute_query(query, params=None, fetch=True, database=None):
    """Execute a Snowflake query and return results."""
    conn = get_snowflake_connection(database)
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        if fetch:
            if cursor.description:
                columns = [desc[0].lower() for desc in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                return results
            return []
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()

# =============================================================================
# DATABASE INITIALIZATION
# =============================================================================

def init_snowflake_database():
    """Initialize Snowflake database and tables."""
    print("Initializing Snowflake database...")

    # First, create database (connect without specifying database)
    conn = snowflake.connector.connect(
        account=os.getenv('SNOWFLAKE_ACCOUNT'),
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        warehouse=os.getenv('SNOWFLAKE_WAREHOUSE')
    )
    try:
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS WAGEWATCH")
        cursor.execute("USE DATABASE WAGEWATCH")
        cursor.execute("CREATE SCHEMA IF NOT EXISTS PUBLIC")
        conn.commit()
        print("Database WAGEWATCH created/verified")
    finally:
        conn.close()

    # Now create tables
    print("Creating tables...")

    execute_query("""
        CREATE TABLE IF NOT EXISTS salary_submissions (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64),
            job_title VARCHAR(255) NOT NULL,
            industry VARCHAR(100) NOT NULL,
            years_experience INTEGER NOT NULL,
            salary NUMBER(12, 2) NOT NULL,
            location VARCHAR(255) NOT NULL,
            gender VARCHAR(50),
            ethnicity VARCHAR(100),
            education_level VARCHAR(50),
            company_size VARCHAR(50),
            company_name VARCHAR(255),
            remote_status VARCHAR(50),
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        )
    """, fetch=False)

    print("Tables created!")

    # Create RAG knowledge base table
    print("Creating RAG knowledge base table...")
    execute_query("""
        CREATE TABLE IF NOT EXISTS negotiation_knowledge (
            id VARCHAR(64) PRIMARY KEY,
            category VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        )
    """, fetch=False)
    print("Knowledge base table created!")

    # Check if we need sample data
    count = execute_query("SELECT COUNT(*) as cnt FROM salary_submissions")
    if count and count[0]['cnt'] == 0:
        print("Inserting sample data...")
        insert_snowflake_sample_data()
    else:
        print(f"Found {count[0]['cnt']} existing records")

    # Initialize knowledge base
    kb_count = execute_query("SELECT COUNT(*) as cnt FROM negotiation_knowledge")
    if kb_count and kb_count[0]['cnt'] == 0:
        print("Initializing RAG knowledge base...")
        init_knowledge_base()
    else:
        print(f"Found {kb_count[0]['cnt']} knowledge base articles")

    print("Snowflake initialization complete!")

def insert_snowflake_sample_data():
    """Insert realistic sample salary data into Snowflake based on 2024-2025 market rates."""

    # Industry-specific job titles with realistic median salaries
    # These are median salaries (not top-tier) for each role in that industry
    industry_roles = {
        'Technology': {
            'Software Engineer': 105000,
            'Senior Software Engineer': 145000,
            'Data Analyst': 75000,
            'Data Scientist': 115000,
            'Product Manager': 125000,
            'UX Designer': 95000,
            'DevOps Engineer': 115000,
            'Engineering Manager': 165000,
            'Project Manager': 95000,
        },
        'Finance': {
            'Financial Analyst': 85000,
            'Senior Financial Analyst': 115000,
            'Data Analyst': 80000,
            'Software Engineer': 110000,
            'Project Manager': 100000,
            'Risk Analyst': 90000,
            'Investment Analyst': 95000,
            'Compliance Officer': 85000,
        },
        'Healthcare': {
            'Data Analyst': 65000,
            'Project Manager': 75000,
            'HR Manager': 70000,
            'Healthcare Administrator': 80000,
            'Clinical Data Analyst': 72000,
            'Marketing Manager': 75000,
            'IT Specialist': 70000,
            'Financial Analyst': 72000,
        },
        'Consulting': {
            'Consultant': 85000,
            'Senior Consultant': 115000,
            'Data Analyst': 80000,
            'Project Manager': 95000,
            'Business Analyst': 82000,
            'Strategy Analyst': 90000,
            'Management Consultant': 105000,
        },
        'E-commerce': {
            'Software Engineer': 100000,
            'Product Manager': 115000,
            'Data Analyst': 72000,
            'UX Designer': 88000,
            'Marketing Manager': 85000,
            'Operations Manager': 78000,
            'Supply Chain Analyst': 68000,
        },
        'Education': {
            'Teacher': 52000,
            'Administrator': 65000,
            'Data Analyst': 55000,
            'IT Specialist': 58000,
            'HR Manager': 60000,
            'Financial Analyst': 58000,
            'Program Coordinator': 50000,
            'Research Analyst': 55000,
        },
        'Retail': {
            'Store Manager': 55000,
            'District Manager': 75000,
            'Marketing Manager': 68000,
            'Data Analyst': 58000,
            'HR Manager': 62000,
            'Supply Chain Analyst': 60000,
            'Buyer': 58000,
            'Operations Manager': 65000,
        },
        'Manufacturing': {
            'Operations Manager': 85000,
            'Quality Engineer': 75000,
            'Supply Chain Manager': 90000,
            'Project Manager': 82000,
            'Data Analyst': 65000,
            'HR Manager': 70000,
            'Financial Analyst': 72000,
            'Production Manager': 78000,
        },
        'Marketing': {
            'Marketing Manager': 82000,
            'Digital Marketing Specialist': 62000,
            'Content Strategist': 65000,
            'Brand Manager': 85000,
            'Data Analyst': 68000,
            'Marketing Analyst': 65000,
            'Creative Director': 105000,
            'Social Media Manager': 55000,
        },
        'Nonprofit': {
            'Program Manager': 58000,
            'Development Director': 72000,
            'Data Analyst': 52000,
            'HR Manager': 55000,
            'Marketing Manager': 55000,
            'Grant Writer': 52000,
            'Operations Manager': 60000,
            'Finance Manager': 62000,
        },
    }

    # Location multipliers (cost of living adjusted)
    location_multipliers = {
        'San Francisco, CA': 1.35,
        'New York, NY': 1.30,
        'Seattle, WA': 1.22,
        'Boston, MA': 1.18,
        'Los Angeles, CA': 1.15,
        'Austin, TX': 1.05,
        'Denver, CO': 1.03,
        'Chicago, IL': 1.0,
        'Atlanta, GA': 0.95,
        'Dallas, TX': 0.95,
        'Phoenix, AZ': 0.92,
        'Remote': 1.0,
    }

    genders = ['Female', 'Male', 'Non-binary']
    gender_weights = [0.40, 0.52, 0.08]

    ethnicities = ['Asian', 'Black/African American', 'Hispanic/Latino', 'White', 'Mixed/Multiple']
    education_levels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD']
    education_weights = [0.08, 0.10, 0.50, 0.27, 0.05]

    company_sizes = ['startup', 'small', 'medium', 'large', 'enterprise']
    company_weights = [0.15, 0.20, 0.25, 0.25, 0.15]
    company_multipliers = {'startup': 0.92, 'small': 0.96, 'medium': 1.0, 'large': 1.05, 'enterprise': 1.10}

    remote_statuses = ['remote', 'hybrid', 'onsite']

    conn = get_snowflake_connection()
    cursor = conn.cursor()

    industries = list(industry_roles.keys())
    locations = list(location_multipliers.keys())

    for i in range(500):  # Generate 500 records for better statistics
        salary_id = secrets.token_hex(16)

        # Pick a random industry, then pick a role valid for that industry
        industry = random.choice(industries)
        roles = industry_roles[industry]
        title = random.choice(list(roles.keys()))

        location = random.choice(locations)
        experience = random.randint(0, 15)

        # Start with the median base salary for this role in this industry
        base = roles[title]

        # Experience scaling (more realistic - diminishing returns)
        # Entry (0-2): 0.85-1.0x, Mid (3-6): 1.0-1.20x, Senior (7-12): 1.15-1.40x, Staff+ (13+): 1.35-1.55x
        if experience <= 2:
            exp_multiplier = 0.85 + (experience * 0.075)
        elif experience <= 6:
            exp_multiplier = 1.0 + ((experience - 2) * 0.05)
        elif experience <= 12:
            exp_multiplier = 1.20 + ((experience - 6) * 0.035)
        else:
            exp_multiplier = 1.40 + ((experience - 12) * 0.05)

        base = base * exp_multiplier

        # Apply location multiplier
        base = base * location_multipliers[location]

        # Company size impact
        size = random.choices(company_sizes, weights=company_weights)[0]
        base = base * company_multipliers[size]

        # Education bonus (smaller impact)
        edu = random.choices(education_levels, weights=education_weights)[0]
        edu_bonus = {'High School': 0.92, 'Associate': 0.96, 'Bachelor': 1.0, 'Master': 1.05, 'PhD': 1.08}
        base = base * edu_bonus[edu]

        # Add some random variance (±8%)
        base = base * random.uniform(0.92, 1.08)

        # Gender selection with documented pay gaps
        gender = random.choices(genders, weights=gender_weights)[0]
        if gender == 'Female':
            base = base * 0.87  # 13% pay gap
        elif gender == 'Non-binary':
            base = base * 0.91  # 9% pay gap

        # Ethnicity with documented pay gaps
        ethnicity = random.choice(ethnicities)
        ethnicity_gaps = {
            'Asian': 1.0,
            'White': 1.0,
            'Mixed/Multiple': 0.96,
            'Black/African American': 0.93,
            'Hispanic/Latino': 0.90,
        }
        base = base * ethnicity_gaps[ethnicity]

        # Round to nearest thousand for realism
        final_salary = round(base / 1000) * 1000

        remote = random.choice(remote_statuses)
        days_ago = random.randint(1, 365)

        cursor.execute("""
            INSERT INTO salary_submissions
            (id, job_title, industry, years_experience, salary, location, gender, ethnicity, education_level, company_size, remote_status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, DATEADD('day', -%s, CURRENT_DATE()))
        """, [salary_id, title, industry, experience, final_salary, location, gender, ethnicity, edu, size, remote, days_ago])

        if (i + 1) % 100 == 0:
            print(f"  Inserted {i + 1} records...")

    conn.commit()
    conn.close()
    print(f"Inserted 500 realistic sample salary records!")

# =============================================================================
# RAG KNOWLEDGE BASE
# =============================================================================

def init_knowledge_base():
    """Initialize the RAG knowledge base with salary negotiation articles."""

    knowledge_articles = [
        {
            "category": "negotiation_basics",
            "title": "How to Start a Salary Negotiation",
            "content": """Starting a salary negotiation requires preparation and confidence. First, research market rates for your role using sites like Glassdoor, LinkedIn Salary, and Levels.fyi. Know your worth before entering any discussion. Schedule a dedicated meeting with your manager - don't ambush them. Open with gratitude for the opportunity, then present your case with specific achievements and market data. Use phrases like 'Based on my research and contributions, I'd like to discuss adjusting my compensation to align with market rates.' Always have a specific number in mind, and aim slightly higher than your target to leave room for negotiation."""
        },
        {
            "category": "negotiation_tactics",
            "title": "Proven Negotiation Tactics That Work",
            "content": """Effective negotiation tactics include: 1) Anchoring - state your desired salary first to set the reference point. 2) Silence - after making your ask, stay quiet and let them respond. 3) The Flinch - show mild surprise at low offers to signal it's below expectations. 4) Never accept the first offer - there's almost always room for improvement. 5) Get it in writing - verbal promises mean nothing without documentation. 6) Consider the total package - salary, bonus, equity, PTO, remote work, and benefits all have value. 7) Have alternatives - knowing you have other options gives you leverage and confidence."""
        },
        {
            "category": "pay_equity",
            "title": "Understanding Pay Gaps and Your Rights",
            "content": """Pay gaps exist across gender, race, and other demographics. Women earn approximately 82 cents for every dollar men earn. The gap is wider for women of color - Black women earn 63 cents and Latina women earn 57 cents per dollar compared to white men. Know your rights: many states now have pay transparency laws requiring salary ranges in job postings. Some states prohibit asking about salary history. You can ask HR about your company's pay equity practices and whether they conduct regular pay audits. If you suspect discrimination, document everything and consider consulting with an employment attorney or filing a complaint with the EEOC."""
        },
        {
            "category": "market_research",
            "title": "How to Research Your Market Value",
            "content": """To determine your market value, use multiple sources: Glassdoor and LinkedIn Salary provide self-reported data. Levels.fyi is excellent for tech roles. The Bureau of Labor Statistics has official government data. Talk to recruiters - they know current market rates. Network with peers in similar roles. Consider factors that affect pay: location (SF pays 40% more than average), company size (enterprise pays 15% more than startups), industry (tech and finance pay premiums), years of experience, and specialized skills. Create a salary range with low, mid, and high points based on your research."""
        },
        {
            "category": "timing",
            "title": "Best Times to Ask for a Raise",
            "content": """Timing matters for salary negotiations. Best times: 1) During annual performance reviews - companies expect these discussions. 2) After completing a major project successfully. 3) When taking on new responsibilities. 4) After receiving a competing job offer (use carefully). 5) When the company is doing well financially. 6) 3-6 months after a promotion if salary didn't increase proportionally. Avoid asking during layoffs, budget cuts, right after starting, or during your manager's stressful periods. If told 'not now,' ask when would be appropriate and get a specific timeline."""
        },
        {
            "category": "scripts",
            "title": "What to Say When Negotiating Salary",
            "content": """Key phrases for negotiation: 'Based on my research of market rates and my contributions to the team, I believe a salary of $X would be appropriate.' 'I'm excited about this opportunity. To make this work, I'd need the compensation to be in the range of $X-$Y.' 'Thank you for the offer. I was expecting something closer to $X based on my experience and the market rate for this role.' If they say no: 'I understand budget constraints. What would it take for me to reach $X in the next 6-12 months?' or 'If base salary is fixed, are there other components we could discuss like signing bonus, equity, or additional PTO?'"""
        },
        {
            "category": "remote_work",
            "title": "Negotiating Salary for Remote Positions",
            "content": """Remote work adds complexity to salary negotiations. Some companies pay based on location (geo-adjusted), while others pay the same regardless of where you live. If relocating from a high-cost area, negotiate to keep your current salary or accept a smaller adjustment than proposed. Highlight that remote workers often have higher productivity and lower overhead costs for the company. If the company insists on location-based pay, negotiate for other benefits: home office stipend, coworking space allowance, or annual travel budget for team meetings. Remote work itself has value - factor this into your total compensation calculation."""
        },
        {
            "category": "new_job",
            "title": "Negotiating Salary for a New Job Offer",
            "content": """New job offers are your best opportunity to negotiate. Never accept immediately - always ask for time to consider. Research the company's pay practices and typical ranges. Start negotiations after receiving a written offer, not during interviews. Focus on the total package: base salary, signing bonus, annual bonus, equity/RSUs, PTO, 401k match, and other benefits. If the base is firm, push for a signing bonus or accelerated review. Get everything in writing before accepting. It's okay to negotiate multiple rounds - employers expect it. The worst they can say is no, and offers are rarely rescinded for reasonable negotiations."""
        },
        {
            "category": "promotion",
            "title": "Getting Paid Fairly After a Promotion",
            "content": """Promotions should come with significant pay increases, typically 10-20%. If offered less, negotiate before accepting the new title. Research what the new role pays in the market - your raise should bring you to at least the market median for the new level. Document your expanded responsibilities and how they differ from your current role. If the raise is below expectations, ask: 'This promotion comes with significantly more responsibility. Based on market data for this role, I expected the compensation to be closer to $X. Can we discuss bridging that gap?' Consider negotiating a timeline for an additional raise after proving yourself in the new role."""
        },
        {
            "category": "confidence",
            "title": "Building Confidence for Salary Discussions",
            "content": """Confidence in negotiation comes from preparation. Know your worth by researching thoroughly. Write down your achievements and practice articulating them. Role-play the conversation with a friend or mentor. Remember that negotiating is expected and professional - you won't lose an offer for asking professionally. Reframe nervousness as excitement. Use power poses before important meetings. Focus on facts and data rather than emotions. It's not personal - it's business. Companies have budgets for negotiations and often start low expecting pushback. You're advocating for your value, which is a professional skill, not a character flaw. The more you negotiate, the easier it becomes."""
        }
    ]

    conn = get_snowflake_connection()
    cursor = conn.cursor()

    for article in knowledge_articles:
        article_id = secrets.token_hex(16)
        cursor.execute("""
            INSERT INTO negotiation_knowledge (id, category, title, content)
            VALUES (%s, %s, %s, %s)
        """, [article_id, article['category'], article['title'], article['content']])

    conn.commit()
    conn.close()
    print(f"Inserted {len(knowledge_articles)} knowledge base articles!")


def retrieve_relevant_context(user_question, top_k=3):
    """
    RAG: Retrieve relevant documents using Snowflake Cortex embeddings.
    Uses EMBED_TEXT_768 for semantic search and VECTOR_COSINE_SIMILARITY for matching.
    Returns tuple of (context_string, list_of_sources)
    """
    try:
        # Use Snowflake Cortex to find semantically similar documents
        results = execute_query("""
            WITH question_embedding AS (
                SELECT SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', %s) as embedding
            )
            SELECT
                nk.title,
                nk.category,
                nk.content,
                VECTOR_COSINE_SIMILARITY(
                    SNOWFLAKE.CORTEX.EMBED_TEXT_768('e5-base-v2', nk.content),
                    qe.embedding
                ) as similarity_score
            FROM negotiation_knowledge nk, question_embedding qe
            ORDER BY similarity_score DESC
            LIMIT %s
        """, [user_question, top_k])

        if results:
            context_parts = []
            sources = []
            for doc in results:
                context_parts.append(f"**{doc['title']}**\n{doc['content']}")
                sources.append({
                    'title': doc['title'],
                    'category': doc['category'],
                    'similarity': round(float(doc['similarity_score']) * 100, 1)
                })
            return "\n\n---\n\n".join(context_parts), sources
        return "", []
    except Exception as e:
        print(f"RAG retrieval error: {e}")
        return "", []


# Initialize on startup
try:
    init_snowflake_database()
except Exception as e:
    print(f"Snowflake init error: {e}")
    print("Make sure your Snowflake credentials are correct in .env")

# =============================================================================
# SALARY ROUTES
# =============================================================================

@app.route('/api/salary/submit', methods=['POST'])
def submit_salary():
    """Submit anonymous salary data to Snowflake."""
    data = request.json
    required = ['job_title', 'industry', 'years_experience', 'salary', 'location']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    salary_id = secrets.token_hex(16)

    try:
        execute_query("""
            INSERT INTO salary_submissions
            (id, job_title, industry, years_experience, salary, location, gender, ethnicity, education_level, company_size, company_name, remote_status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP())
        """, [
            salary_id, data['job_title'], data['industry'],
            int(data['years_experience']), float(data['salary']), data['location'],
            data.get('gender'), data.get('ethnicity'), data.get('education_level'),
            data.get('company_size'), data.get('company_name'), data.get('remote_status')
        ], fetch=False)

        return jsonify({'message': 'Salary data submitted successfully', 'id': salary_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/salary/compare', methods=['POST'])
def compare_salary():
    """Compare salary using Snowflake analytics (MEDIAN, PERCENTILE_CONT)."""
    data = request.json
    required = ['job_title', 'industry', 'years_experience', 'salary', 'location']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    user_salary = float(data['salary'])
    experience = int(data['years_experience'])
    company_name = data.get('company_name', '').strip()

    # Get company-specific data if available
    company_data = get_company_data(company_name) if company_name else None

    try:
        # Use Snowflake's advanced analytics functions
        stats = execute_query("""
            SELECT
                COUNT(*) as sample_size,
                AVG(salary) as avg_salary,
                MEDIAN(salary) as median_salary,
                PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25_salary,
                PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75_salary,
                PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary) as p90_salary,
                STDDEV(salary) as salary_stddev
            FROM salary_submissions
            WHERE LOWER(industry) = LOWER(%s)
              AND years_experience BETWEEN %s - 2 AND %s + 2
        """, [data['industry'], experience, experience])

        if not stats or stats[0]['sample_size'] == 0:
            # Broader search
            stats = execute_query("""
                SELECT
                    COUNT(*) as sample_size,
                    AVG(salary) as avg_salary,
                    MEDIAN(salary) as median_salary,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25_salary,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75_salary,
                    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary) as p90_salary
                FROM salary_submissions
                WHERE years_experience BETWEEN %s - 3 AND %s + 3
            """, [experience, experience])

        if not stats or stats[0]['sample_size'] == 0:
            return jsonify({'error': 'Insufficient data', 'sample_size': 0}), 404

        stat = stats[0]
        market_median = float(stat['median_salary'])
        market_avg = float(stat['avg_salary'])
        market_p25 = float(stat['p25_salary'])
        market_p75 = float(stat['p75_salary'])
        market_p90 = float(stat['p90_salary'])

        # Apply company-specific adjustments if we have company data
        if company_data:
            multiplier = company_data['multiplier']
            # Adjust expected salaries for this company
            company_median = market_median * multiplier
            company_avg = market_avg * multiplier
            company_p25 = market_p25 * multiplier
            company_p75 = market_p75 * multiplier
            company_p90 = market_p90 * multiplier

            # Calculate percentile within company context
            # User's salary compared to what this company typically pays
            if user_salary >= company_p90:
                company_percentile = 90 + (10 * (user_salary - company_p90) / (company_p90 * 0.2)) if company_p90 > 0 else 95
                company_percentile = min(99, company_percentile)
            elif user_salary >= company_p75:
                company_percentile = 75 + (15 * (user_salary - company_p75) / (company_p90 - company_p75)) if (company_p90 - company_p75) > 0 else 82
            elif user_salary >= company_median:
                company_percentile = 50 + (25 * (user_salary - company_median) / (company_p75 - company_median)) if (company_p75 - company_median) > 0 else 62
            elif user_salary >= company_p25:
                company_percentile = 25 + (25 * (user_salary - company_p25) / (company_median - company_p25)) if (company_median - company_p25) > 0 else 37
            else:
                company_percentile = max(1, 25 * user_salary / company_p25) if company_p25 > 0 else 10

            gap_percentage = ((user_salary - company_median) / company_median) * 100 if company_median > 0 else 0

            # Use company-adjusted values for display
            median = company_median
            avg = company_avg
            p25 = company_p25
            p75 = company_p75
            p90 = company_p90
            percentile = company_percentile
        else:
            # No company data, use market rates
            median = market_median
            avg = market_avg
            p25 = market_p25
            p75 = market_p75
            p90 = market_p90

            # Calculate percentile rank against market
            percentile_result = execute_query("""
                SELECT (COUNT(CASE WHEN salary < %s THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as percentile_rank
                FROM salary_submissions
                WHERE LOWER(industry) = LOWER(%s)
                  AND years_experience BETWEEN %s - 2 AND %s + 2
            """, [user_salary, data['industry'], experience, experience])

            percentile = float(percentile_result[0]['percentile_rank']) if percentile_result and percentile_result[0]['percentile_rank'] else 50
            gap_percentage = ((user_salary - median) / median) * 100 if median > 0 else 0

        # Generate recommendation based on company context
        context_label = f"at {company_data['name']}" if company_data else "in the market"

        if percentile < 25:
            recommendation = {
                'status': 'below_market',
                'message': f'Your salary is significantly below typical pay {context_label}. You may have strong grounds for negotiation.',
                'action': 'Consider requesting a salary review with documented market data.',
                'potential_increase': f"${abs(int(median - user_salary)):,} to reach median"
            }
        elif percentile < 50:
            recommendation = {
                'status': 'below_median',
                'message': f'Your salary is below the median {context_label} for your role and experience.',
                'action': 'Document your achievements and consider discussing compensation.',
                'potential_increase': f"${abs(int(median - user_salary)):,} potential increase"
            }
        elif percentile < 75:
            recommendation = {
                'status': 'competitive',
                'message': f'Your salary is competitive and above median {context_label}.',
                'action': 'Focus on maintaining performance and exploring growth opportunities.',
                'potential_increase': None
            }
        else:
            recommendation = {
                'status': 'above_market',
                'message': f'Your salary is in the top quartile {context_label}.',
                'action': 'Continue excelling and consider mentoring others.',
                'potential_increase': None
            }

        response = {
            'comparison': {
                'your_salary': user_salary,
                'median_salary': round(median, 0),
                'average_salary': round(avg, 0),
                'percentile_rank': round(percentile, 1),
                'gap_percentage': round(gap_percentage, 1),
                'p25_salary': round(p25, 0),
                'p75_salary': round(p75, 0),
                'p90_salary': round(p90, 0),
                'sample_size': stat['sample_size'],
                'recommendation': recommendation
            }
        }

        # Add company-specific insights if available
        if company_data:
            response['comparison']['company_insights'] = {
                'company_name': company_data['name'],
                'pay_tier': company_data['tier'],
                'market_position': f"{int((company_data['multiplier'] - 1) * 100):+d}% vs market average",
                'typical_range': f"${int(p25):,} - ${int(p90):,}",
                'note': f"{company_data['name']} typically pays {'above' if company_data['multiplier'] > 1.15 else 'at or near'} market rates"
            }
            # Also include raw market data for reference
            response['comparison']['market_reference'] = {
                'market_median': round(market_median, 0),
                'market_p25': round(market_p25, 0),
                'market_p75': round(market_p75, 0),
                'market_p90': round(market_p90, 0)
            }

        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# ANALYTICS ROUTES - Showcasing Snowflake Features
# =============================================================================

@app.route('/api/analytics/pay-gap', methods=['GET'])
def get_pay_gap_analytics():
    """Get pay gap analytics using Snowflake GROUP BY and aggregations."""
    try:
        # Gender breakdown with Snowflake MEDIAN
        gender_gap = execute_query("""
            SELECT
                gender,
                COUNT(*) as count,
                AVG(salary) as avg_salary,
                MEDIAN(salary) as median_salary
            FROM salary_submissions
            WHERE gender IS NOT NULL
            GROUP BY gender
            HAVING COUNT(*) >= 5
            ORDER BY avg_salary DESC
        """)

        # Calculate gap percentage
        gap_summary = {}
        male_salary = next((float(g['avg_salary']) for g in gender_gap if g['gender'] == 'Male'), None)
        female_salary = next((float(g['avg_salary']) for g in gender_gap if g['gender'] == 'Female'), None)

        if male_salary and female_salary:
            gap_summary['gender_gap_percentage'] = round(((male_salary - female_salary) / male_salary) * 100, 1)
            gap_summary['female_cents_per_dollar'] = round((female_salary / male_salary) * 100, 0)

        # Ethnicity breakdown
        ethnicity_gap = execute_query("""
            SELECT
                ethnicity,
                COUNT(*) as count,
                AVG(salary) as avg_salary,
                MEDIAN(salary) as median_salary
            FROM salary_submissions
            WHERE ethnicity IS NOT NULL
            GROUP BY ethnicity
            HAVING COUNT(*) >= 5
            ORDER BY avg_salary DESC
        """)

        return jsonify({
            'gender_breakdown': gender_gap,
            'ethnicity_breakdown': ethnicity_gap,
            'gap_summary': gap_summary
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/industry-comparison', methods=['GET'])
def get_industry_comparison():
    """Compare salaries across industries using Snowflake PERCENTILE_CONT."""
    try:
        comparison = execute_query("""
            SELECT
                industry,
                COUNT(*) as sample_size,
                AVG(salary) as avg_salary,
                MEDIAN(salary) as median_salary,
                PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25,
                PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75,
                PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary) as p90
            FROM salary_submissions
            GROUP BY industry
            HAVING COUNT(*) >= 5
            ORDER BY median_salary DESC
        """)

        return jsonify({'industries': comparison})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/location-comparison', methods=['GET'])
def get_location_comparison():
    """Compare salaries across locations."""
    try:
        comparison = execute_query("""
            SELECT
                location,
                COUNT(*) as sample_size,
                AVG(salary) as avg_salary,
                MEDIAN(salary) as median_salary,
                MIN(salary) as min_salary,
                MAX(salary) as max_salary
            FROM salary_submissions
            GROUP BY location
            HAVING COUNT(*) >= 3
            ORDER BY median_salary DESC
            LIMIT 20
        """)

        return jsonify({'locations': comparison})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/company-comparison', methods=['GET'])
def get_company_comparison():
    """Get salary analytics for specific companies (like Glassdoor)."""
    company = request.args.get('company', '')

    try:
        if company:
            # Get company-specific data
            comparison = execute_query("""
                SELECT
                    company_name,
                    COUNT(*) as sample_size,
                    AVG(salary) as avg_salary,
                    MEDIAN(salary) as median_salary,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75,
                    MIN(salary) as min_salary,
                    MAX(salary) as max_salary
                FROM salary_submissions
                WHERE LOWER(company_name) LIKE LOWER(%s)
                  AND company_name IS NOT NULL
                  AND company_name != ''
                GROUP BY company_name
                HAVING COUNT(*) >= 2
                ORDER BY sample_size DESC
                LIMIT 10
            """, [f'%{company}%'])
        else:
            # Get top companies by submission count
            comparison = execute_query("""
                SELECT
                    company_name,
                    COUNT(*) as sample_size,
                    AVG(salary) as avg_salary,
                    MEDIAN(salary) as median_salary,
                    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) as p25,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) as p75
                FROM salary_submissions
                WHERE company_name IS NOT NULL
                  AND company_name != ''
                GROUP BY company_name
                HAVING COUNT(*) >= 3
                ORDER BY sample_size DESC
                LIMIT 20
            """)

        return jsonify({'companies': comparison})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# NEGOTIATION TOOLS
# =============================================================================

@app.route('/api/negotiation/script', methods=['POST'])
def generate_negotiation_script():
    """Generate a personalized salary negotiation script with real market data."""
    data = request.json
    required = ['current_salary', 'target_salary', 'job_title', 'achievements']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    current = float(data['current_salary'])
    target = float(data['target_salary'])
    increase_pct = ((target - current) / current) * 100
    industry = data.get('industry', 'Technology')
    location = data.get('location', '')

    # Fetch real market data from Snowflake
    market_data = get_negotiation_market_data(industry, location)

    achievements_list = [a for a in data.get('achievements', []) if a and a.strip()]
    achievements_text = "; ".join(achievements_list[:5]) if achievements_list else "my consistent high performance"

    # Calculate percentile position
    percentile = calculate_percentile_position(current, market_data)
    target_percentile = calculate_percentile_position(target, market_data)

    # Build data-driven market data section
    market_data_text = build_market_data_script(current, target, market_data, industry, location, percentile)

    # Build data-driven ask with specific numbers
    ask_text = build_ask_script(current, target, increase_pct, market_data, target_percentile)

    script = {
        'opening': f"Thank you for meeting with me. I wanted to discuss my compensation as a {data['job_title']}. Based on my research and contributions over the past year, I believe an adjustment is warranted.",
        'market_data': market_data_text,
        'achievements': f"My key contributions include: {achievements_text}",
        'ask': ask_text,
        'closing': "I am committed to continuing to deliver strong results and would appreciate your consideration of this request. I'm open to discussing how we can make this work.",
        'tips': [
            f"Your current salary is at the {percentile}th percentile - use this as leverage",
            "Practice your script until it feels natural",
            "Maintain confident but collaborative tone",
            f"If they counter, don't go below ${market_data['median']:,.0f} (the market median)",
            "Have a backup ask ready (signing bonus, extra PTO, remote flexibility)",
            "Get any agreement in writing within 48 hours"
        ],
        # Include raw data for frontend display
        'data_points': {
            'your_salary': current,
            'target_salary': target,
            'your_percentile': percentile,
            'target_percentile': target_percentile,
            'market_median': market_data['median'],
            'market_p25': market_data['p25'],
            'market_p75': market_data['p75'],
            'market_p90': market_data['p90'],
            'sample_size': market_data['sample_size'],
            'industry': industry,
            'location': location,
            'increase_percent': round(increase_pct, 1),
            'increase_amount': target - current,
            'gap_to_median': market_data['median'] - current,
            'gap_to_median_percent': round(((market_data['median'] - current) / current) * 100, 1) if current > 0 else 0
        }
    }

    return jsonify({'script': script})


def get_negotiation_market_data(industry, location):
    """Fetch real market data from Snowflake for negotiation context."""
    try:
        # Query for industry + location specific data
        query = """
            SELECT
                COUNT(*) as sample_size,
                ROUND(AVG(salary), 0) as avg_salary,
                ROUND(MEDIAN(salary), 0) as median_salary,
                ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary), 0) as p25,
                ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary), 0) as p75,
                ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary), 0) as p90,
                ROUND(MIN(salary), 0) as min_salary,
                ROUND(MAX(salary), 0) as max_salary
            FROM salary_submissions
            WHERE industry = %s
        """
        params = [industry]

        if location:
            query += " AND location = %s"
            params.append(location)

        results = execute_query(query, params)

        if results and results[0]['sample_size'] >= 5:
            return {
                'sample_size': results[0]['sample_size'],
                'avg': results[0]['avg_salary'],
                'median': results[0]['median_salary'],
                'p25': results[0]['p25'],
                'p75': results[0]['p75'],
                'p90': results[0]['p90'],
                'min': results[0]['min_salary'],
                'max': results[0]['max_salary']
            }

        # Fallback to industry-only data if location-specific is too small
        if location:
            return get_negotiation_market_data(industry, None)

        # Fallback to all data
        results = execute_query("""
            SELECT
                COUNT(*) as sample_size,
                ROUND(AVG(salary), 0) as avg_salary,
                ROUND(MEDIAN(salary), 0) as median_salary,
                ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary), 0) as p25,
                ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary), 0) as p75,
                ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary), 0) as p90
            FROM salary_submissions
        """)

        if results:
            return {
                'sample_size': results[0]['sample_size'],
                'avg': results[0]['avg_salary'],
                'median': results[0]['median_salary'],
                'p25': results[0]['p25'],
                'p75': results[0]['p75'],
                'p90': results[0]['p90'],
                'min': results[0].get('min_salary', results[0]['p25']),
                'max': results[0].get('max_salary', results[0]['p90'])
            }

    except Exception as e:
        print(f"Error fetching market data: {e}")

    # Return defaults if all else fails
    return {
        'sample_size': 100,
        'avg': 95000,
        'median': 90000,
        'p25': 70000,
        'p75': 115000,
        'p90': 140000,
        'min': 50000,
        'max': 200000
    }


def calculate_percentile_position(salary, market_data):
    """Calculate which percentile a salary falls into."""
    if salary <= market_data['p25']:
        # Interpolate between 0-25
        pct = (salary / market_data['p25']) * 25 if market_data['p25'] > 0 else 10
        return max(1, min(25, int(pct)))
    elif salary <= market_data['median']:
        # Interpolate between 25-50
        range_size = market_data['median'] - market_data['p25']
        position = salary - market_data['p25']
        pct = 25 + (position / range_size * 25) if range_size > 0 else 37
        return int(pct)
    elif salary <= market_data['p75']:
        # Interpolate between 50-75
        range_size = market_data['p75'] - market_data['median']
        position = salary - market_data['median']
        pct = 50 + (position / range_size * 25) if range_size > 0 else 62
        return int(pct)
    elif salary <= market_data['p90']:
        # Interpolate between 75-90
        range_size = market_data['p90'] - market_data['p75']
        position = salary - market_data['p75']
        pct = 75 + (position / range_size * 15) if range_size > 0 else 82
        return int(pct)
    else:
        # Above P90
        return min(99, 90 + int((salary - market_data['p90']) / market_data['p90'] * 10))


def build_market_data_script(current, target, market_data, industry, location, percentile):
    """Build a data-driven market data section for the negotiation script."""
    location_text = f" in {location}" if location else ""

    if percentile < 25:
        position_text = f"significantly below market rate (bottom 25%)"
        urgency = "This represents a meaningful gap that I'd like to address."
    elif percentile < 50:
        position_text = f"below the market median"
        urgency = "Bringing my compensation to median would reflect my market value."
    elif percentile < 75:
        position_text = f"around the market median"
        urgency = "Given my contributions, I believe I should be compensated in the upper quartile."
    else:
        position_text = f"in the upper range"
        urgency = "I'd like to ensure my compensation continues to reflect my performance."

    script = (
        f"I've researched compensation data for {industry} professionals{location_text}. "
        f"Based on {market_data['sample_size']} data points, the market median is ${market_data['median']:,.0f}, "
        f"with the 75th percentile at ${market_data['p75']:,.0f} and the 90th percentile at ${market_data['p90']:,.0f}. "
        f"My current salary of ${current:,.0f} places me at the {percentile}th percentile, which is {position_text}. "
        f"{urgency}"
    )

    return script


def build_ask_script(current, target, increase_pct, market_data, target_percentile):
    """Build a data-driven ask section for the negotiation script."""
    if target <= market_data['median']:
        justification = f"This would bring me to the market median, which is a fair baseline for my experience."
    elif target <= market_data['p75']:
        justification = f"This would place me at the {target_percentile}th percentile, reflecting my above-average contributions."
    elif target <= market_data['p90']:
        justification = f"This would position me at the {target_percentile}th percentile, appropriate for a high performer."
    else:
        justification = f"This reflects top-tier compensation for exceptional contributors in this field."

    script = (
        f"I am requesting a salary adjustment to ${target:,.0f}, "
        f"which represents a {increase_pct:.1f}% increase (${target - current:,.0f}). "
        f"{justification} "
        f"This is well within the market range of ${market_data['p25']:,.0f} to ${market_data['p90']:,.0f}."
    )

    return script

# =============================================================================
# CORTEX AI CHATBOT
# =============================================================================

@app.route('/api/chatbot/advice', methods=['POST'])
def get_chatbot_advice():
    """
    Generate salary negotiation advice using Snowflake Cortex AI with RAG.

    This endpoint demonstrates three Snowflake Cortex AI features:
    1. EMBED_TEXT_768 - Creates embeddings for semantic search
    2. VECTOR_COSINE_SIMILARITY - Finds similar documents
    3. COMPLETE - Generates responses with Llama 3.1
    """
    data = request.json

    # Extract user context
    job_title = data.get('job_title', 'professional')
    salary = data.get('salary', 0)
    percentile = data.get('percentile', 50)
    industry = data.get('industry', 'technology')
    location = data.get('location', '')
    median_salary = data.get('median_salary', 0)
    user_message = data.get('message', '')

    # RAG: Retrieve relevant knowledge base articles
    retrieved_context, rag_sources = retrieve_relevant_context(user_message, top_k=3)

    # Build context-aware prompt with RAG context
    rag_section = ""
    if retrieved_context:
        rag_section = f"""
RELEVANT KNOWLEDGE BASE ARTICLES:
{retrieved_context}

Use the above articles to inform your response when relevant.

"""

    prompt = f"""You are a helpful salary negotiation advisor for CounterMarket, a pay equity platform.
{rag_section}
USER'S PROFILE:
- Job Title: {job_title}
- Current Salary: ${salary:,.0f}
- Industry: {industry}
- Location: {location}
- Percentile Rank: {percentile}th percentile
- Market Median: ${median_salary:,.0f}

USER'S QUESTION: {user_message}

INSTRUCTIONS:
- Provide helpful, specific advice for their salary negotiation
- Reference the knowledge base articles when applicable
- Be encouraging but realistic
- Keep your response concise (2-3 paragraphs max)
- Focus on actionable advice
- If they're below median, suggest how to negotiate
- If above, suggest how to maintain their position"""

    try:
        # Use Snowflake Cortex COMPLETE with Llama model
        result = execute_query("""
            SELECT SNOWFLAKE.CORTEX.COMPLETE(
                'llama3.1-8b',
                %s
            ) as response
        """, [prompt])

        if result and result[0].get('response'):
            response_text = result[0]['response']
            # Clean up the response if needed
            if isinstance(response_text, str):
                response_text = response_text.strip()
            return jsonify({
                'response': response_text,
                'model': 'llama3.1-8b',
                'rag_enabled': bool(retrieved_context),
                'sources': rag_sources,
                'powered_by': 'Snowflake Cortex AI + RAG'
            })
        else:
            return jsonify({
                'response': get_fallback_advice(percentile, salary, median_salary),
                'model': 'fallback',
                'rag_enabled': False,
                'powered_by': 'CounterMarket'
            })

    except Exception as e:
        print(f"Cortex AI error: {e}")
        # Fallback to rule-based advice if Cortex fails
        return jsonify({
            'response': get_fallback_advice(percentile, salary, median_salary),
            'model': 'fallback',
            'rag_enabled': False,
            'error': str(e),
            'powered_by': 'CounterMarket'
        })

def get_fallback_advice(percentile, salary, median_salary):
    """Fallback advice when Cortex AI is unavailable."""
    if percentile < 25:
        gap = median_salary - salary
        return f"""Your salary is in the bottom quartile, which suggests you have strong grounds for negotiation.

Based on market data, you could potentially earn ${gap:,.0f} more to reach the median. I recommend:
1. Document your key achievements and contributions
2. Research comparable salaries at other companies
3. Schedule a meeting with your manager to discuss your compensation
4. Be prepared to discuss your value with specific examples

Remember, the data is on your side - use it confidently!"""
    elif percentile < 50:
        gap = median_salary - salary
        return f"""You're earning below the market median, which means there's room for improvement.

The gap to median is about ${gap:,.0f}. Here's how to approach this:
1. Prepare a list of your accomplishments from the past year
2. Highlight any additional responsibilities you've taken on
3. Frame your ask around your value, not just the market data
4. Consider timing - performance reviews are ideal moments

Stay positive and focus on your contributions!"""
    elif percentile < 75:
        return """Congratulations! You're earning above the market median, which is a strong position.

To maintain and grow your compensation:
1. Continue documenting your wins and impact
2. Seek stretch opportunities that increase your visibility
3. Build relationships with leadership
4. Stay current on market trends in your field

You're doing well - keep up the great work!"""
    else:
        return """Excellent! You're in the top quartile of earners for your role.

To maintain this position:
1. Focus on high-impact projects that demonstrate your value
2. Consider mentoring others - it showcases leadership
3. Stay visible to decision-makers
4. Keep developing skills that are in high demand

You've earned your position through strong performance. Continue to deliver results!"""

# =============================================================================
# DATA MANAGEMENT
# =============================================================================

@app.route('/api/admin/reset-data', methods=['POST'])
def reset_sample_data():
    """Reset and regenerate sample data with realistic salaries."""
    try:
        # Clear existing data
        execute_query("DELETE FROM salary_submissions", fetch=False)
        print("Cleared existing data...")

        # Insert new realistic data
        insert_snowflake_sample_data()

        # Get new count
        result = execute_query("SELECT COUNT(*) as cnt FROM salary_submissions")
        count = result[0]['cnt'] if result else 0

        return jsonify({
            'message': 'Sample data regenerated successfully',
            'records_created': count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check with Snowflake connection test."""
    try:
        result = execute_query("SELECT COUNT(*) as cnt FROM salary_submissions")
        count = result[0]['cnt'] if result else 0
        return jsonify({
            'status': 'healthy',
            'database': 'Snowflake connected',
            'data_points': count,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'database': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/')
def index():
    """Root endpoint."""
    return jsonify({
        'name': 'CounterMarket API',
        'version': '2.0.0',
        'description': 'Pay Equity Analytics Platform with RAG-Powered AI',
        'database': 'Snowflake',
        'ai_features': {
            'llm': 'Snowflake Cortex COMPLETE (Llama 3.1-8b)',
            'embeddings': 'Snowflake Cortex EMBED_TEXT_768 (e5-base-v2)',
            'similarity': 'VECTOR_COSINE_SIMILARITY',
            'rag': 'Retrieval Augmented Generation with knowledge base'
        },
        'hackathon': 'Hack Violet 2026 - Best Use of Snowflake API'
    })

if __name__ == '__main__':
    print(f"\n{'='*50}")
    print("CounterMarket API - Snowflake + Cortex AI")
    print("Hack Violet 2026")
    print(f"{'='*50}\n")
    app.run(debug=True, port=5001)
