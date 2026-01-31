import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import {
  TrendingUp, Users, DollarSign, BarChart3,
  FileText, Building2, Menu, X, ChevronRight
} from 'lucide-react'
import axios from 'axios'

// API Configuration
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// =============================================================================
// COMPONENTS
// =============================================================================

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">WageWatch</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2">Dashboard</Link>
            <Link to="/compare" className="text-gray-600 hover:text-primary-600 px-3 py-2">Compare</Link>
            <Link to="/analytics" className="text-gray-600 hover:text-primary-600 px-3 py-2">Analytics</Link>
            <Link to="/negotiate" className="text-gray-600 hover:text-primary-600 px-3 py-2">Negotiate</Link>
            <Link to="/submit" className="btn-primary">Submit Data</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link to="/dashboard" className="block px-3 py-2 text-gray-600">Dashboard</Link>
            <Link to="/compare" className="block px-3 py-2 text-gray-600">Compare</Link>
            <Link to="/analytics" className="block px-3 py-2 text-gray-600">Analytics</Link>
            <Link to="/negotiate" className="block px-3 py-2 text-gray-600">Negotiate</Link>
            <Link to="/submit" className="block px-3 py-2 text-primary-600 font-semibold">Submit Data</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// =============================================================================
// HOME PAGE
// =============================================================================

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Know Your Worth.
              <span className="text-primary-600"> Close the Gap.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              WageWatch empowers women with data-driven salary insights, helping you negotiate
              fair pay and close the gender wage gap.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/compare" className="btn-primary text-lg px-8 py-3">
                Compare Your Salary
              </Link>
              <Link to="/analytics" className="btn-secondary text-lg px-8 py-3">
                View Pay Gap Data
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">82¢</div>
              <p className="text-gray-600">Women earn per dollar men earn</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">$10K+</div>
              <p className="text-gray-600">Average annual wage gap</p>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
              <p className="text-gray-600">Women can benefit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powered by Snowflake Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Salary Comparison"
              description="Compare your compensation against industry benchmarks by role, experience, and location."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Pay Gap Analysis"
              description="Identify disparities with advanced analytics showing gender and ethnicity pay gaps."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Negotiation Tools"
              description="Generate personalized scripts and reports backed by real market data."
            />
            <FeatureCard
              icon={<Building2 className="w-8 h-8" />}
              title="Company Directory"
              description="Find employers committed to pay transparency and equal compensation."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Close Your Pay Gap?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of women using data to negotiate fair compensation.
          </p>
          <Link to="/compare" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors inline-flex items-center">
            Compare Your Salary <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

// =============================================================================
// DASHBOARD
// =============================================================================

function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to WageWatch!</h1>
        <p className="text-gray-600 mt-2">Here's your pay equity overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<DollarSign />} label="Market Median" value="$95,000" change="+5.2%" />
        <StatCard icon={<TrendingUp />} label="Your Percentile" value="65th" change="+12%" />
        <StatCard icon={<Users />} label="Data Points" value="1,247" />
        <StatCard icon={<BarChart3 />} label="Pay Gap" value="18%" negative />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/compare" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">Compare My Salary</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link to="/submit" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">Submit Salary Data</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link to="/negotiate" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">Generate Negotiation Script</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Insights</h3>
          <div className="space-y-4">
            <InsightItem
              title="Tech industry gap widening"
              description="The gender pay gap in tech increased 2% this quarter."
              type="warning"
            />
            <InsightItem
              title="Remote work premium"
              description="Remote positions pay 8% more on average in your field."
              type="info"
            />
            <InsightItem
              title="Negotiation success"
              description="Users who used our scripts achieved 15% higher raises."
              type="success"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change, negative }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-medium ${negative ? 'text-red-600' : 'text-green-600'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function InsightItem({ title, description, type }) {
  const colors = {
    warning: 'border-yellow-400 bg-yellow-50',
    info: 'border-blue-400 bg-blue-50',
    success: 'border-green-400 bg-green-50',
  }

  return (
    <div className={`border-l-4 p-3 rounded-r-lg ${colors[type]}`}>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

// =============================================================================
// COMPARE PAGE
// =============================================================================

function ComparePage() {
  const [form, setForm] = useState({
    job_title: '',
    industry: '',
    years_experience: '',
    salary: '',
    location: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Marketing']
  const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Remote']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/salary/compare', {
        ...form,
        years_experience: parseInt(form.years_experience),
        salary: parseFloat(form.salary)
      })
      setResult(data.comparison)
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed. We may not have enough data for your criteria.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compare Your Salary</h1>
        <p className="text-gray-600 mt-2">See how your compensation stacks up against market data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="card space-y-6">
          <h3 className="text-lg font-semibold">Your Information</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="label">Job Title</label>
            <input
              type="text"
              value={form.job_title}
              onChange={e => setForm({...form, job_title: e.target.value})}
              className="input"
              placeholder="e.g., Software Engineer"
              required
            />
          </div>

          <div>
            <label className="label">Industry</label>
            <select
              value={form.industry}
              onChange={e => setForm({...form, industry: e.target.value})}
              className="input"
              required
            >
              <option value="">Select industry</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Years of Experience</label>
            <input
              type="number"
              value={form.years_experience}
              onChange={e => setForm({...form, years_experience: e.target.value})}
              className="input"
              min="0"
              max="50"
              required
            />
          </div>

          <div>
            <label className="label">Current Salary ($)</label>
            <input
              type="number"
              value={form.salary}
              onChange={e => setForm({...form, salary: e.target.value})}
              className="input"
              min="0"
              placeholder="e.g., 85000"
              required
            />
          </div>

          <div>
            <label className="label">Location</label>
            <select
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className="input"
              required
            >
              <option value="">Select location</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Analyzing...' : 'Compare Salary'}
          </button>
        </form>

        {result && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Your Results</h3>
              <div className="space-y-4">
                <ResultRow label="Your Salary" value={`$${result.your_salary.toLocaleString()}`} />
                <ResultRow label="Market Median" value={`$${result.median_salary.toLocaleString()}`} />
                <ResultRow label="Your Percentile" value={`${result.percentile_rank}th`} highlight />
                <ResultRow
                  label="Gap from Median"
                  value={`${result.gap_percentage > 0 ? '+' : ''}${result.gap_percentage}%`}
                  highlight
                  positive={result.gap_percentage >= 0}
                />
              </div>
            </div>

            <div className={`card border-l-4 ${
              result.recommendation.status === 'below_market' ? 'border-red-500' :
              result.recommendation.status === 'below_median' ? 'border-yellow-500' :
              result.recommendation.status === 'competitive' ? 'border-green-500' :
              'border-blue-500'
            }`}>
              <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
              <p className="text-gray-700 mb-2">{result.recommendation.message}</p>
              <p className="text-sm text-gray-600">{result.recommendation.action}</p>
              {result.recommendation.potential_increase && (
                <p className="mt-2 font-semibold text-primary-600">{result.recommendation.potential_increase}</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Salary Distribution</h3>
              <div className="space-y-2 text-sm">
                <DistributionBar label="25th Percentile" value={result.p25_salary} max={result.p90_salary} />
                <DistributionBar label="Median (50th)" value={result.median_salary} max={result.p90_salary} />
                <DistributionBar label="75th Percentile" value={result.p75_salary} max={result.p90_salary} />
                <DistributionBar label="90th Percentile" value={result.p90_salary} max={result.p90_salary} />
              </div>
              <p className="text-xs text-gray-500 mt-4">Based on {result.sample_size} data points</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultRow({ label, value, highlight, positive }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${highlight ? (positive === false ? 'text-red-600' : positive ? 'text-green-600' : 'text-primary-600') : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}

function DistributionBar({ label, value, max }) {
  const percentage = (value / max) * 100

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">${value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// =============================================================================
// ANALYTICS PAGE
// =============================================================================

function AnalyticsPage() {
  const [payGapData, setPayGapData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/pay-gap')
      .then(({ data }) => setPayGapData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pay Gap Analytics</h1>
        <p className="text-gray-600 mt-2">Data-driven insights into compensation disparities</p>
      </div>

      {payGapData?.gap_summary?.gender_gap_percentage && (
        <div className="card mb-8 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Gender Pay Gap</h2>
            <div className="text-6xl font-bold text-primary-600 mb-2">
              {payGapData.gap_summary.female_cents_per_dollar}¢
            </div>
            <p className="text-gray-600">Women earn per dollar men earn</p>
            <p className="text-sm text-gray-500 mt-2">
              {payGapData.gap_summary.gender_gap_percentage}% gender pay gap
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Salary by Gender</h3>
          {payGapData?.gender_breakdown?.length > 0 ? (
            <div className="space-y-4">
              {payGapData.gender_breakdown.map((item) => (
                <div key={item.gender} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.gender}</div>
                    <div className="text-sm text-gray-500">{item.count} respondents</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${Math.round(item.avg_salary).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">avg salary</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Salary by Ethnicity</h3>
          {payGapData?.ethnicity_breakdown?.length > 0 ? (
            <div className="space-y-4">
              {payGapData.ethnicity_breakdown.map((item) => (
                <div key={item.ethnicity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.ethnicity}</div>
                    <div className="text-sm text-gray-500">{item.count} respondents</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${Math.round(item.avg_salary).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">avg salary</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      <div className="card mt-8">
        <h3 className="text-lg font-semibold mb-4">Why This Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">$400K+</div>
            <p className="text-gray-600">Lost earnings over a 40-year career due to pay gap</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">42 Years</div>
            <p className="text-gray-600">Time to close the gap at current rate of progress</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">63¢</div>
            <p className="text-gray-600">Latina women earn per dollar white men earn</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// NEGOTIATE PAGE
// =============================================================================

function NegotiatePage() {
  const [form, setForm] = useState({
    current_salary: '',
    target_salary: '',
    job_title: '',
    achievements: ['', '', '']
  })
  const [script, setScript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/negotiation/script', {
        ...form,
        current_salary: parseFloat(form.current_salary),
        target_salary: parseFloat(form.target_salary),
        achievements: form.achievements.filter(a => a.trim())
      })
      setScript(data.script)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate script')
    } finally {
      setLoading(false)
    }
  }

  const updateAchievement = (index, value) => {
    const newAchievements = [...form.achievements]
    newAchievements[index] = value
    setForm({ ...form, achievements: newAchievements })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Negotiation Tools</h1>
        <p className="text-gray-600 mt-2">Generate a personalized script backed by market data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="card space-y-6">
          <h3 className="text-lg font-semibold">Build Your Script</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="label">Job Title</label>
            <input
              type="text"
              value={form.job_title}
              onChange={e => setForm({...form, job_title: e.target.value})}
              className="input"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label className="label">Current Salary ($)</label>
            <input
              type="number"
              value={form.current_salary}
              onChange={e => setForm({...form, current_salary: e.target.value})}
              className="input"
              min="0"
              required
            />
          </div>

          <div>
            <label className="label">Target Salary ($)</label>
            <input
              type="number"
              value={form.target_salary}
              onChange={e => setForm({...form, target_salary: e.target.value})}
              className="input"
              min="0"
              required
            />
          </div>

          <div>
            <label className="label">Key Achievements (list 3)</label>
            {form.achievements.map((a, i) => (
              <input
                key={i}
                type="text"
                value={a}
                onChange={e => updateAchievement(i, e.target.value)}
                className="input mb-2"
                placeholder={`Achievement ${i + 1}`}
              />
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Generating...' : 'Generate Script'}
          </button>
        </form>

        {script && (
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Your Negotiation Script</h3>
              <div className="space-y-4">
                <ScriptSection title="Opening" content={script.opening} />
                <ScriptSection title="Market Data" content={script.market_data} />
                <ScriptSection title="Your Value" content={script.achievements} />
                <ScriptSection title="The Ask" content={script.ask} />
                <ScriptSection title="Closing" content={script.closing} />
              </div>
            </div>

            <div className="card bg-accent-50">
              <h3 className="text-lg font-semibold mb-3">Tips for Success</h3>
              <ul className="space-y-2">
                {script.tips.map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-accent-600 mr-2">✓</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ScriptSection({ title, content }) {
  return (
    <div className="border-l-4 border-primary-300 pl-4">
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-700">{content}</p>
    </div>
  )
}

// =============================================================================
// SUBMIT SALARY PAGE
// =============================================================================

function SubmitPage() {
  const [form, setForm] = useState({
    job_title: '', industry: '', years_experience: '', salary: '', location: '',
    gender: '', ethnicity: '', education_level: '', company_size: '', remote_status: ''
  })
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/salary/submit', {
        ...form,
        years_experience: parseInt(form.years_experience),
        salary: parseFloat(form.salary)
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="card">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your anonymous salary data helps close the pay gap for everyone.</p>
          <Link to="/compare" className="btn-primary">Compare Your Salary</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Salary Data</h1>
        <p className="text-gray-600 mt-2">Your anonymous contribution helps others negotiate fair pay</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Job Title *</label>
            <input type="text" value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="label">Industry *</label>
            <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="input" required>
              <option value="">Select</option>
              {['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Marketing'].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Years of Experience *</label>
            <input type="number" value={form.years_experience} onChange={e => setForm({...form, years_experience: e.target.value})} className="input" min="0" required />
          </div>
          <div>
            <label className="label">Annual Salary ($) *</label>
            <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="input" min="0" required />
          </div>
          <div>
            <label className="label">Location *</label>
            <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="input" required>
              <option value="">Select</option>
              {['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Remote'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Gender (optional)</label>
            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="input">
              <option value="">Prefer not to say</option>
              {['Female', 'Male', 'Non-binary', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ethnicity (optional)</label>
            <select value={form.ethnicity} onChange={e => setForm({...form, ethnicity: e.target.value})} className="input">
              <option value="">Prefer not to say</option>
              {['Asian', 'Black/African American', 'Hispanic/Latino', 'White', 'Mixed/Multiple', 'Other'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Education Level</label>
            <select value={form.education_level} onChange={e => setForm({...form, education_level: e.target.value})} className="input">
              <option value="">Select</option>
              {['High School', 'Associate', 'Bachelor', 'Master', 'PhD'].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Company Size</label>
            <select value={form.company_size} onChange={e => setForm({...form, company_size: e.target.value})} className="input">
              <option value="">Select</option>
              {['startup', 'small', 'medium', 'large', 'enterprise'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Work Status</label>
            <select value={form.remote_status} onChange={e => setForm({...form, remote_status: e.target.value})} className="input">
              <option value="">Select</option>
              {['remote', 'hybrid', 'onsite'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
          <strong>Privacy Note:</strong> Your data is anonymized and aggregated. Individual submissions cannot be traced back to you.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Anonymously'}
        </button>
      </form>
    </div>
  )
}

// =============================================================================
// MAIN APP
// =============================================================================

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/negotiate" element={<NegotiatePage />} />
        <Route path="/submit" element={<SubmitPage />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>Built for Hack Violet 2026 | Powered by Snowflake</p>
          <p className="text-sm mt-2">Closing the pay gap, one data point at a time.</p>
        </div>
      </footer>
    </div>
  )
}
