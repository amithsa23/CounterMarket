"""
WageWatch: Pay Equity Analytics Platform
Flask Backend with Snowflake Integration
Hack Violet 2026 - Snowflake API Category
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
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))

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

    # Check if we need sample data
    count = execute_query("SELECT COUNT(*) as cnt FROM salary_submissions")
    if count and count[0]['cnt'] == 0:
        print("Inserting sample data...")
        insert_snowflake_sample_data()
    else:
        print(f"Found {count[0]['cnt']} existing records")

    print("Snowflake initialization complete!")

def insert_snowflake_sample_data():
    """Insert realistic sample salary data into Snowflake based on 2024-2025 market rates."""

    # Realistic base salaries by job title (entry-level baseline)
    title_base_salaries = {
        'Software Engineer': 95000,
        'Senior Software Engineer': 145000,
        'Data Analyst': 70000,
        'Senior Data Analyst': 95000,
        'Data Scientist': 110000,
        'Product Manager': 120000,
        'Senior Product Manager': 160000,
        'Marketing Manager': 85000,
        'Sales Representative': 60000,
        'HR Manager': 75000,
        'Financial Analyst': 75000,
        'Project Manager': 85000,
        'UX Designer': 85000,
        'DevOps Engineer': 105000,
        'Engineering Manager': 175000,
    }

    # Industry multipliers
    industry_multipliers = {
        'Technology': 1.15,
        'Finance': 1.12,
        'Healthcare': 1.0,
        'Consulting': 1.08,
        'E-commerce': 1.10,
        'Education': 0.85,
        'Retail': 0.88,
        'Manufacturing': 0.95,
        'Marketing': 0.95,
        'Nonprofit': 0.80,
    }

    # Location multipliers (cost of living adjusted)
    location_multipliers = {
        'San Francisco, CA': 1.45,
        'New York, NY': 1.40,
        'Seattle, WA': 1.30,
        'Boston, MA': 1.25,
        'Los Angeles, CA': 1.20,
        'Austin, TX': 1.10,
        'Denver, CO': 1.08,
        'Chicago, IL': 1.05,
        'Atlanta, GA': 1.0,
        'Dallas, TX': 1.0,
        'Phoenix, AZ': 0.95,
        'Remote': 1.05,
    }

    genders = ['Female', 'Male', 'Non-binary']
    gender_weights = [0.35, 0.55, 0.10]  # Approximate tech industry breakdown

    ethnicities = ['Asian', 'Black/African American', 'Hispanic/Latino', 'White', 'Mixed/Multiple']
    education_levels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD']
    education_weights = [0.05, 0.08, 0.50, 0.30, 0.07]

    company_sizes = ['startup', 'small', 'medium', 'large', 'enterprise']
    company_multipliers = {'startup': 0.90, 'small': 0.95, 'medium': 1.0, 'large': 1.08, 'enterprise': 1.15}

    remote_statuses = ['remote', 'hybrid', 'onsite']

    conn = get_snowflake_connection()
    cursor = conn.cursor()

    titles = list(title_base_salaries.keys())
    industries = list(industry_multipliers.keys())
    locations = list(location_multipliers.keys())

    for i in range(500):  # Generate 500 records for better statistics
        salary_id = secrets.token_hex(16)
        title = random.choice(titles)
        industry = random.choice(industries)
        location = random.choice(locations)
        experience = random.randint(0, 20)

        # Start with base salary for the role
        base = title_base_salaries[title]

        # Experience scaling (realistic progression)
        # Entry (0-2): 1.0x, Mid (3-5): 1.15-1.35x, Senior (6-10): 1.4-1.8x, Staff+ (11+): 1.8-2.5x
        if experience <= 2:
            exp_multiplier = 1.0 + (experience * 0.05)
        elif experience <= 5:
            exp_multiplier = 1.1 + ((experience - 2) * 0.08)
        elif experience <= 10:
            exp_multiplier = 1.35 + ((experience - 5) * 0.09)
        else:
            exp_multiplier = 1.80 + ((experience - 10) * 0.07)

        base = base * exp_multiplier

        # Apply location multiplier
        base = base * location_multipliers[location]

        # Apply industry multiplier
        base = base * industry_multipliers[industry]

        # Company size impact
        size = random.choice(company_sizes)
        base = base * company_multipliers[size]

        # Education bonus
        edu = random.choices(education_levels, weights=education_weights)[0]
        edu_bonus = {'High School': 0.90, 'Associate': 0.95, 'Bachelor': 1.0, 'Master': 1.08, 'PhD': 1.12}
        base = base * edu_bonus[edu]

        # Add some random variance (±10%)
        base = base * random.uniform(0.90, 1.10)

        # Gender selection with documented pay gaps
        gender = random.choices(genders, weights=gender_weights)[0]
        if gender == 'Female':
            base = base * 0.85  # 15% pay gap (women earn 85 cents per dollar)
        elif gender == 'Non-binary':
            base = base * 0.90  # 10% pay gap

        # Ethnicity with documented pay gaps
        ethnicity = random.choice(ethnicities)
        ethnicity_multipliers = {
            'Asian': 1.0,
            'White': 1.0,
            'Mixed/Multiple': 0.95,
            'Black/African American': 0.92,
            'Hispanic/Latino': 0.88,
        }
        base = base * ethnicity_multipliers[ethnicity]

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
            (id, job_title, industry, years_experience, salary, location, gender, ethnicity, education_level, company_size, remote_status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP())
        """, [
            salary_id, data['job_title'], data['industry'],
            int(data['years_experience']), float(data['salary']), data['location'],
            data.get('gender'), data.get('ethnicity'), data.get('education_level'),
            data.get('company_size'), data.get('remote_status')
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
        median = float(stat['median_salary'])
        avg = float(stat['avg_salary'])
        p25 = float(stat['p25_salary'])
        p75 = float(stat['p75_salary'])
        p90 = float(stat['p90_salary'])

        # Calculate percentile rank
        percentile_result = execute_query("""
            SELECT (COUNT(CASE WHEN salary < %s THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)) as percentile_rank
            FROM salary_submissions
            WHERE LOWER(industry) = LOWER(%s)
              AND years_experience BETWEEN %s - 2 AND %s + 2
        """, [user_salary, data['industry'], experience, experience])

        percentile = float(percentile_result[0]['percentile_rank']) if percentile_result and percentile_result[0]['percentile_rank'] else 50
        gap_percentage = ((user_salary - median) / median) * 100 if median > 0 else 0

        # Generate recommendation
        if percentile < 25:
            recommendation = {
                'status': 'below_market',
                'message': 'Your salary is significantly below market rate. You may have strong grounds for negotiation.',
                'action': 'Consider requesting a salary review with documented market data.',
                'potential_increase': f"${abs(int(median - user_salary)):,} to reach median"
            }
        elif percentile < 50:
            recommendation = {
                'status': 'below_median',
                'message': 'Your salary is below the median for your role and experience.',
                'action': 'Document your achievements and consider discussing compensation.',
                'potential_increase': f"${abs(int(median - user_salary)):,} potential increase"
            }
        elif percentile < 75:
            recommendation = {
                'status': 'competitive',
                'message': 'Your salary is competitive and above median.',
                'action': 'Focus on maintaining performance and exploring growth opportunities.',
                'potential_increase': None
            }
        else:
            recommendation = {
                'status': 'above_market',
                'message': 'Your salary is in the top quartile for your role.',
                'action': 'Continue excelling and consider mentoring others.',
                'potential_increase': None
            }

        return jsonify({
            'comparison': {
                'your_salary': user_salary,
                'median_salary': median,
                'average_salary': avg,
                'percentile_rank': round(percentile, 1),
                'gap_percentage': round(gap_percentage, 1),
                'p25_salary': p25,
                'p75_salary': p75,
                'p90_salary': p90,
                'sample_size': stat['sample_size'],
                'recommendation': recommendation
            }
        })
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

# =============================================================================
# NEGOTIATION TOOLS
# =============================================================================

@app.route('/api/negotiation/script', methods=['POST'])
def generate_negotiation_script():
    """Generate a personalized salary negotiation script."""
    data = request.json
    required = ['current_salary', 'target_salary', 'job_title', 'achievements']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing required fields'}), 400

    current = float(data['current_salary'])
    target = float(data['target_salary'])
    increase_pct = ((target - current) / current) * 100

    achievements_list = [a for a in data.get('achievements', []) if a and a.strip()]
    achievements_text = "; ".join(achievements_list[:5]) if achievements_list else "my consistent high performance"

    script = {
        'opening': f"Thank you for meeting with me. I wanted to discuss my compensation as a {data['job_title']}. Based on my research and contributions, I believe an adjustment is warranted.",
        'market_data': f"According to market data, the median salary for my role and experience level is ${target:,.0f}. My current salary of ${current:,.0f} is below this benchmark.",
        'achievements': f"My key contributions include: {achievements_text}",
        'ask': f"I am requesting a salary adjustment to ${target:,.0f}, which represents a {increase_pct:.1f}% increase and aligns with market rates.",
        'closing': "I am committed to continuing to deliver strong results and would appreciate your consideration of this request.",
        'tips': [
            "Practice your script beforehand",
            "Maintain confident but respectful tone",
            "Be prepared to discuss specific achievements",
            "Have a backup ask (e.g., additional PTO, flexible work)",
            "Get any agreement in writing"
        ]
    }

    return jsonify({'script': script})

# =============================================================================
# CORTEX AI CHATBOT
# =============================================================================

@app.route('/api/chatbot/advice', methods=['POST'])
def get_chatbot_advice():
    """Generate salary negotiation advice using Snowflake Cortex AI with Llama."""
    data = request.json

    # Extract user context
    job_title = data.get('job_title', 'professional')
    salary = data.get('salary', 0)
    percentile = data.get('percentile', 50)
    industry = data.get('industry', 'technology')
    location = data.get('location', '')
    median_salary = data.get('median_salary', 0)
    user_message = data.get('message', '')

    # Build context-aware prompt
    context = f"""You are a helpful salary negotiation advisor for CounterMarket, a pay equity platform.

User's Profile:
- Job Title: {job_title}
- Current Salary: ${salary:,.0f}
- Industry: {industry}
- Location: {location}
- Percentile Rank: {percentile}th percentile
- Market Median: ${median_salary:,.0f}

The user is asking: {user_message}

Provide helpful, specific advice for their salary negotiation. Be encouraging but realistic.
Keep your response concise (2-3 paragraphs max). Focus on actionable advice.
If they're below median, suggest how to negotiate. If above, suggest how to maintain their position."""

    try:
        # Use Snowflake Cortex COMPLETE with Llama model
        result = execute_query("""
            SELECT SNOWFLAKE.CORTEX.COMPLETE(
                'llama3.1-8b',
                %s
            ) as response
        """, [context])

        if result and result[0].get('response'):
            response_text = result[0]['response']
            # Clean up the response if needed
            if isinstance(response_text, str):
                response_text = response_text.strip()
            return jsonify({
                'response': response_text,
                'model': 'llama3.1-8b',
                'powered_by': 'Snowflake Cortex AI'
            })
        else:
            return jsonify({
                'response': get_fallback_advice(percentile, salary, median_salary),
                'model': 'fallback',
                'powered_by': 'CounterMarket'
            })

    except Exception as e:
        print(f"Cortex AI error: {e}")
        # Fallback to rule-based advice if Cortex fails
        return jsonify({
            'response': get_fallback_advice(percentile, salary, median_salary),
            'model': 'fallback',
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
        'version': '1.0.0',
        'description': 'Pay Equity Analytics Platform with Cortex AI',
        'database': 'Snowflake',
        'ai': 'Snowflake Cortex (Llama)',
        'hackathon': 'Hack Violet 2026'
    })

if __name__ == '__main__':
    print(f"\n{'='*50}")
    print("CounterMarket API - Snowflake + Cortex AI")
    print("Hack Violet 2026")
    print(f"{'='*50}\n")
    app.run(debug=True, port=5000)
