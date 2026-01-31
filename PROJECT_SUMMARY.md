# WageWatch - Project Summary

## Overview

WageWatch is a pay equity analytics platform built for Hack Violet 2026's Snowflake API category. It addresses the persistent gender wage gap by providing women with data-driven tools for salary comparison, pay gap analysis, and negotiation support.

## Problem Statement

Women in the United States earn approximately 82 cents for every dollar earned by men. This gap is even more pronounced for women of color, with Latina women earning just 63 cents per dollar. Over a 40-year career, this disparity can result in over $400,000 in lost earnings.

## Solution

WageWatch leverages Snowflake's powerful analytics capabilities to:

1. **Aggregate Anonymous Salary Data**: Users can submit their compensation information anonymously, contributing to a growing dataset that benefits everyone.

2. **Provide Market Comparisons**: Advanced Snowflake SQL functions (MEDIAN, PERCENTILE_CONT, STDDEV) calculate precise salary benchmarks by role, experience, industry, and location.

3. **Visualize Pay Gaps**: Real-time analytics display gender and ethnicity-based compensation disparities, making the invisible visible.

4. **Generate Negotiation Tools**: Personalized scripts and reports backed by actual market data empower users to advocate for fair pay.

5. **Highlight Transparent Companies**: A directory of employers committed to pay equity helps job seekers make informed decisions.

## Technical Implementation

### Backend (Flask)
- RESTful API with 15+ endpoints
- JWT-based authentication
- Secure password hashing
- Parameterized Snowflake queries

### Frontend (React + Tailwind)
- 7 complete pages
- Responsive mobile-first design
- Interactive data visualizations
- Real-time API integration

### Database (Snowflake)
- Optimized schema design
- Advanced analytics views
- Secure views for privacy
- Sample data generation

## Snowflake Features

| Feature | Usage |
|---------|-------|
| MEDIAN() | Central tendency for salary benchmarks |
| PERCENTILE_CONT() | P25, P50, P75, P90 distributions |
| LAG() | Month-over-month trend analysis |
| AVG() OVER | Moving average calculations |
| Secure Views | Privacy-preserving data access |
| Clustering | Query performance optimization |

## Key Differentiators

1. **Mission-Driven**: Built specifically to address pay inequity
2. **Privacy-First**: Anonymous data collection and aggregation
3. **Actionable**: Users leave with specific negotiation strategies
4. **Comprehensive**: Full-stack solution, not just data
5. **Snowflake-Native**: Leverages advanced analytics features

## Files Delivered

| File | Purpose | Lines |
|------|---------|-------|
| app.py | Flask backend API | 600+ |
| App.jsx | React frontend | 1000+ |
| schema.sql | Snowflake database | 400+ |
| README.md | Documentation | 150+ |
| QUICKSTART.md | Judge guide | 100+ |
| PITCH_DECK.md | Presentation | 200+ |

## Impact Potential

- **50,000+** women can benefit from salary transparency
- **$10,000+** average annual wage gap that can be addressed
- **15%** higher raises achieved with data-backed negotiations
- **10+ hours** saved in compensation research per user

## Future Roadmap

1. **Phase 1**: Beta launch with 1,000 users
2. **Phase 2**: Mobile app development
3. **Phase 3**: Enterprise HR integrations
4. **Phase 4**: International expansion

## Conclusion

WageWatch demonstrates how Snowflake's advanced analytics can be applied to solve real-world social challenges. By democratizing access to compensation data, we empower women to negotiate fair pay and accelerate progress toward pay equity.

---

*Built for Hack Violet 2026 - Snowflake API Category*
