# CounterMarket

**Pay Equity Analytics Platform** | Hack Violet 2026

CounterMarket empowers workers—especially women and underrepresented groups—to understand their market value and negotiate fair compensation using Snowflake Cortex AI.

![Hack Violet](https://img.shields.io/badge/Hack%20Violet-2026-purple)
![Snowflake](https://img.shields.io/badge/Powered%20by-Snowflake%20Cortex%20AI-blue)

## The Problem

Women earn **82 cents** for every dollar men earn. The gap widens for women of color—Latina women earn just **57 cents**. This translates to over **$400,000** in lost earnings over a career.

## Our Solution

CounterMarket provides:
- **Salary Comparison** - Compare your compensation against market data with percentile rankings
- **Pay Gap Analytics** - Visualize gender and ethnicity pay disparities with real data
- **AI Salary Advisor** - RAG-powered chatbot using Snowflake Cortex (Llama 3.1-8b)
- **Negotiation Toolkit** - Generate data-backed negotiation scripts with market data
- **Cost of Living Comparison** - Compare salaries across 12+ metro areas
- **Company-Specific Insights** - Glassdoor-style company salary analytics

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python Flask | REST API server |
| Snowflake | Cloud data warehouse |
| Snowflake Cortex AI | LLM (Llama 3.1-8b), Embeddings, RAG |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | Component-based UI |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Recharts | Data visualization |

### Authentication
| Technology | Purpose |
|------------|---------|
| Supabase Auth | User authentication |

## Snowflake Cortex AI Features

1. **SNOWFLAKE.CORTEX.COMPLETE** - LLM responses using Llama 3.1-8b
2. **SNOWFLAKE.CORTEX.EMBED_TEXT_768** - Vector embeddings for semantic search
3. **VECTOR_COSINE_SIMILARITY** - RAG document retrieval

## Prerequisites

- Python 3.9+
- Node.js 18+
- Snowflake Account ([free trial](https://signup.snowflake.com/))
- Supabase Account ([free](https://supabase.com/))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/amithsa23/CounterMarket.git
cd CounterMarket
```

### 2. Backend Setup

Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask flask-cors python-dotenv snowflake-connector-python
```

Create a `.env` file in the root directory:

```env
# Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_account_identifier
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=WAGEWATCH
SNOWFLAKE_SCHEMA=PUBLIC
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the Application

### Start the Backend (Terminal 1)

```bash
# From the root directory
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

The Flask API will start on `http://localhost:5001`

### Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The React app will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Database Initialization

The application automatically:
1. Creates the `WAGEWATCH` database
2. Creates the `salary_submissions` table
3. Creates the `negotiation_knowledge` table (for RAG)
4. Inserts 500 sample salary records with realistic data
5. Inserts 10 knowledge base articles for AI advisor

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/salary/submit` | POST | Submit salary data |
| `/api/salary/compare` | POST | Compare your salary |
| `/api/analytics/pay-gap` | GET | Get pay gap analytics |
| `/api/analytics/industry-comparison` | GET | Industry salary comparison |
| `/api/analytics/location-comparison` | GET | Location salary comparison |
| `/api/analytics/company-comparison` | GET | Company-specific analytics |
| `/api/negotiation/script` | POST | Generate negotiation script |
| `/api/chatbot/advice` | POST | AI advisor (Snowflake Cortex) |
| `/api/health` | GET | Health check |

## Project Structure

```
CounterMarket/
├── app.py                 # Flask backend with Snowflake + Cortex AI
├── .env                   # Environment variables (create this)
├── .gitignore
├── README.md
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main React application
    │   ├── main.jsx       # React entry point
    │   ├── index.css      # Tailwind styles
    │   ├── lib/
    │   │   └── supabase.js
    │   └── context/
    │       └── AuthContext.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env               # Frontend environment variables
```

## Key Statistics

- **500+** salary data points
- **10** industries tracked
- **12** metro areas with cost of living data
- **10** knowledge base articles for RAG
- **82¢** - what women earn per dollar men earn

## Team

Built for **Hack Violet 2026** - Best Use of Snowflake API

## License

MIT License

---

**CounterMarket** - Making salary data transparent, one submission at a time.
