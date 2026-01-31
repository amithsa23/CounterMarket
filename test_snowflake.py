"""Test Snowflake connection"""
import os
from dotenv import load_dotenv
import snowflake.connector

load_dotenv()

print("Testing Snowflake connection...")
print(f"Account: {os.getenv('SNOWFLAKE_ACCOUNT')}")
print(f"User: {os.getenv('SNOWFLAKE_USER')}")
print(f"Warehouse: {os.getenv('SNOWFLAKE_WAREHOUSE')}")

try:
    # Connect without database first
    print("\n1. Connecting to Snowflake...")
    conn = snowflake.connector.connect(
        account=os.getenv('SNOWFLAKE_ACCOUNT'),
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        warehouse=os.getenv('SNOWFLAKE_WAREHOUSE')
    )
    print("   Connected!")

    cursor = conn.cursor()

    # Create database
    print("\n2. Creating WAGEWATCH database...")
    cursor.execute("CREATE DATABASE IF NOT EXISTS WAGEWATCH")
    print("   Database created!")

    # Use database
    print("\n3. Using WAGEWATCH database...")
    cursor.execute("USE DATABASE WAGEWATCH")
    cursor.execute("USE SCHEMA PUBLIC")
    print("   Using WAGEWATCH.PUBLIC")

    # Create table
    print("\n4. Creating salary_submissions table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS salary_submissions (
            id VARCHAR(64),
            job_title VARCHAR(255),
            industry VARCHAR(100),
            years_experience INTEGER,
            salary NUMBER(12, 2),
            location VARCHAR(255),
            gender VARCHAR(50),
            ethnicity VARCHAR(100),
            education_level VARCHAR(50),
            company_size VARCHAR(50),
            remote_status VARCHAR(50),
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        )
    """)
    print("   Table created!")

    # Check count
    print("\n5. Checking existing data...")
    cursor.execute("SELECT COUNT(*) FROM salary_submissions")
    count = cursor.fetchone()[0]
    print(f"   Found {count} records")

    # Insert test record if empty
    if count == 0:
        print("\n6. Inserting test record...")
        cursor.execute("""
            INSERT INTO salary_submissions (id, job_title, industry, years_experience, salary, location, gender)
            VALUES ('test123', 'Software Engineer', 'Technology', 5, 100000, 'San Francisco, CA', 'Female')
        """)
        conn.commit()
        print("   Test record inserted!")

    # Test query
    print("\n7. Testing MEDIAN query...")
    cursor.execute("SELECT MEDIAN(salary) as median_salary FROM salary_submissions")
    result = cursor.fetchone()
    print(f"   Median salary: {result[0]}")

    conn.close()
    print("\n✅ All tests passed! Snowflake is working correctly.")

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nPlease check your Snowflake credentials in .env file")
