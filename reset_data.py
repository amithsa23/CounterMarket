"""Reset Snowflake data with realistic salaries"""
import os
from dotenv import load_dotenv
import snowflake.connector

load_dotenv()

print("Connecting to Snowflake...")
conn = snowflake.connector.connect(
    account=os.getenv('SNOWFLAKE_ACCOUNT'),
    user=os.getenv('SNOWFLAKE_USER'),
    password=os.getenv('SNOWFLAKE_PASSWORD'),
    warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
    database='WAGEWATCH',
    schema='PUBLIC'
)

cursor = conn.cursor()

print("Clearing existing data...")
cursor.execute("DELETE FROM salary_submissions")
conn.commit()

print("Data cleared! Now restart your Flask server (python app.py) to generate new realistic data.")
conn.close()
