# WageWatch - Quick Start Guide for Judges

**5-Minute Demo Setup**

## 1. Start the Backend (1 min)

```bash
# Activate virtual environment
source venv/bin/activate

# Run Flask server
python app.py
```

Server runs at: `http://localhost:5000`

## 2. Start the Frontend (1 min)

```bash
cd frontend
npm install  # First time only
npm run dev
```

App runs at: `http://localhost:5173`

## 3. Demo Flow (3 min)

### Homepage
- View the pay gap statistics (82 cents on the dollar)
- See the value proposition

### Create Account
- Click "Get Started"
- Register with any email/password

### Compare Salary
- Navigate to "Compare"
- Enter sample data:
  - Job Title: Software Engineer
  - Industry: Technology
  - Years Experience: 5
  - Salary: 85000
  - Location: San Francisco, CA
- View your percentile ranking and recommendations

### Analytics Dashboard
- Navigate to "Analytics"
- View real-time pay gap visualizations
- See gender and ethnicity breakdowns

### Negotiation Tools
- Navigate to "Negotiate"
- Enter current salary: 85000
- Enter target salary: 100000
- Add achievements
- Generate personalized negotiation script

## Key Snowflake Features Demonstrated

1. **Advanced Analytics**
   - `MEDIAN()` for robust central tendency
   - `PERCENTILE_CONT()` for salary distributions
   - `STDDEV()` for variance analysis

2. **Window Functions**
   - `LAG()` for month-over-month comparisons
   - Moving averages for trend smoothing

3. **Data Privacy**
   - Secure views for anonymized data
   - Aggregation-only access patterns

## API Testing

Test the API directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Get pay gap analytics
curl http://localhost:5000/api/analytics/pay-gap

# Compare salary (requires auth)
curl -X POST http://localhost:5000/api/salary/compare \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"job_title":"Engineer","industry":"Technology","years_experience":5,"salary":85000,"location":"San Francisco, CA"}'
```

## What Makes This Special

1. **Real Problem**: $10K+ annual wage gap affects millions
2. **Technical Excellence**: Full Snowflake integration with advanced SQL
3. **Production Ready**: Complete auth, API, and frontend
4. **Actionable**: Users leave with negotiation scripts and data
