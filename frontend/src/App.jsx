import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  TrendingUp, Users, DollarSign, BarChart3,
  FileText, Building2, Menu, X, ChevronRight,
  MapPin, Lightbulb, ArrowRight, Target, Zap,
  MessageCircle, Send, Bot, Sparkles, LogIn, LogOut, User
} from 'lucide-react'
import axios from 'axios'
import { AuthProvider, useAuth } from './context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'

// API Configuration
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Chart Colors
const COLORS = ['#7C3AED', '#1E3A5F', '#10b981', '#f59e0b', '#ef4444']
const CHART_PURPLE = '#7C3AED'
const CHART_NAVY = '#1E3A5F'

// Cost of Living Data
const COST_OF_LIVING = {
  'San Francisco, CA': { index: 179, housing: 2800, food: 450, transport: 150 },
  'New York, NY': { index: 187, housing: 3200, food: 500, transport: 130 },
  'Seattle, WA': { index: 149, housing: 2200, food: 400, transport: 120 },
  'Boston, MA': { index: 152, housing: 2400, food: 420, transport: 110 },
  'Los Angeles, CA': { index: 166, housing: 2500, food: 430, transport: 180 },
  'Austin, TX': { index: 103, housing: 1600, food: 350, transport: 140 },
  'Denver, CO': { index: 128, housing: 1800, food: 380, transport: 130 },
  'Chicago, IL': { index: 107, housing: 1500, food: 360, transport: 105 },
  'Atlanta, GA': { index: 100, housing: 1400, food: 340, transport: 120 },
  'Dallas, TX': { index: 102, housing: 1450, food: 345, transport: 135 },
  'Phoenix, AZ': { index: 97, housing: 1350, food: 330, transport: 125 },
  'Remote': { index: 100, housing: 1400, food: 340, transport: 100 },
}

// =============================================================================
// COMPONENTS
// =============================================================================

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                CounterMarket
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            <Link to="/negotiate" className="nav-link">Negotiate</Link>
            <Link to="/ai-advisor" className="nav-link flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              AI Advisor
            </Link>
            <Link to="/submit" className="btn-primary ml-4">Compare</Link>
            {user ? (
              <button onClick={handleSignOut} className="ml-2 nav-link flex items-center text-red-500 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            ) : (
              <Link to="/auth" className="ml-2 nav-link flex items-center">
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-secondary-500 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            <Link to="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-primary-50 text-secondary-600 font-medium">Dashboard</Link>
            <Link to="/analytics" className="block px-4 py-3 rounded-lg hover:bg-primary-50 text-secondary-600 font-medium">Analytics</Link>
            <Link to="/negotiate" className="block px-4 py-3 rounded-lg hover:bg-primary-50 text-secondary-600 font-medium">Negotiate</Link>
            <Link to="/ai-advisor" className="block px-4 py-3 rounded-lg hover:bg-primary-50 text-secondary-600 font-medium flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />AI Advisor
            </Link>
            <Link to="/submit" className="block px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold text-center mt-2">Compare</Link>
            {user ? (
              <button onClick={handleSignOut} className="block w-full px-4 py-3 rounded-lg text-red-500 font-medium text-left flex items-center mt-2">
                <LogOut className="w-4 h-4 mr-2" />Logout
              </button>
            ) : (
              <Link to="/auth" className="block px-4 py-3 rounded-lg hover:bg-primary-50 text-secondary-600 font-medium flex items-center">
                <LogIn className="w-4 h-4 mr-2" />Login / Register
              </Link>
            )}
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
      <section className="hero-gradient py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powered by Snowflake Analytics
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-700 mb-6 leading-tight">
              Know Your Worth.
              <span className="block mt-2 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                Counter the Market.
              </span>
            </h1>
            <p className="text-xl text-secondary-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              CounterMarket empowers you with real salary data, cost of living insights,
              and negotiation tools to ensure you're paid what you're worth.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/submit" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
                Compare Your Data
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/ai-advisor" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Advisor
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card text-center group">
              <div className="text-5xl font-bold text-primary-600 mb-3 group-hover:scale-110 transition-transform">82¢</div>
              <p className="text-secondary-500 font-medium">Women earn per dollar men earn</p>
            </div>
            <div className="stat-card text-center group">
              <div className="text-5xl font-bold text-primary-600 mb-3 group-hover:scale-110 transition-transform">$10K+</div>
              <p className="text-secondary-500 font-medium">Average annual wage gap</p>
            </div>
            <div className="stat-card text-center group">
              <div className="text-5xl font-bold text-primary-600 mb-3 group-hover:scale-110 transition-transform">15%</div>
              <p className="text-secondary-500 font-medium">Higher raises with data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-700 mb-4">
              Data-Driven Salary Intelligence
            </h2>
            <p className="text-lg text-secondary-400 max-w-2xl mx-auto">
              Make informed decisions with comprehensive market insights and analytics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Salary Comparison"
              description="Compare against benchmarks by role, experience, and location with real-time data."
            />
            <FeatureCard
              icon={<MapPin className="w-7 h-7" />}
              title="Cost of Living"
              description="Understand your purchasing power with city-by-city cost comparisons."
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Market Trends"
              description="Track salary trends and identify the best opportunities in your field."
            />
            <FeatureCard
              icon={<Target className="w-7 h-7" />}
              title="Smart Suggestions"
              description="Get personalized recommendations based on your profile and market data."
            />
          </div>
        </div>
      </section>

      {/* Market Data Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-medium mb-4">
                <BarChart3 className="w-4 h-4 mr-2" />
                Pay Gap Analytics
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-700 mb-6">
                Explore Market Data
              </h2>
              <p className="text-lg text-secondary-500 mb-6 leading-relaxed">
                Dive deep into salary analytics across industries, demographics, and locations.
                Understand pay gaps, see how different factors affect compensation, and make
                data-driven career decisions.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-secondary-600">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  </div>
                  Gender & ethnicity pay gap analysis
                </li>
                <li className="flex items-center text-secondary-600">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  </div>
                  Industry salary comparisons
                </li>
                <li className="flex items-center text-secondary-600">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  </div>
                  Location-based salary insights
                </li>
              </ul>
              <Link to="/analytics" className="btn-secondary inline-flex items-center">
                View Market Data
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">10+</div>
                <p className="text-secondary-500 text-sm">Industries Tracked</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">12+</div>
                <p className="text-secondary-500 text-sm">Metro Areas</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                <p className="text-secondary-500 text-sm">Data Points</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">Live</div>
                <p className="text-secondary-500 text-sm">Real-time Updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-600 via-secondary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Counter the Market?
          </h2>
          <p className="text-secondary-100 mb-10 text-lg max-w-2xl mx-auto">
            Join thousands using data to negotiate fair compensation and make informed career decisions.
          </p>
          <Link to="/submit" className="bg-white text-secondary-600 font-semibold px-10 py-4 rounded-xl hover:bg-gray-50 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl">
            Get Started Free <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card group hover:border-primary-200 border border-transparent">
      <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-secondary-700 mb-3">{title}</h3>
      <p className="text-secondary-400 leading-relaxed">{description}</p>
    </div>
  )
}

// =============================================================================
// DASHBOARD
// =============================================================================

function DashboardPage() {
  const [industryData, setIndustryData] = useState([])

  useEffect(() => {
    api.get('/analytics/industry-comparison')
      .then(({ data }) => {
        if (data.industries) {
          setIndustryData(data.industries.slice(0, 6).map(i => ({
            name: i.industry,
            salary: Math.round(i.median_salary)
          })))
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-700">Welcome to CounterMarket</h1>
        <p className="text-secondary-400 mt-2">Your market intelligence dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<DollarSign />} label="Market Median" value="$125,000" change="+5.2%" />
        <StatCard icon={<TrendingUp />} label="Avg Growth" value="8.3%" change="+2.1%" />
        <StatCard icon={<Users />} label="Data Points" value="500+" />
        <StatCard icon={<BarChart3 />} label="Industries" value="10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-700 mb-6">Median Salary by Industry</h3>
          {industryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={industryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Median Salary']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="salary" fill={CHART_PURPLE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-secondary-400">Loading chart...</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-secondary-700 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/compare" className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-xl hover:from-primary-100 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mr-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="font-semibold text-secondary-700">Compare My Salary</span>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/submit" className="flex items-center justify-between p-4 bg-gradient-to-r from-secondary-50 to-transparent rounded-xl hover:from-secondary-100 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-600 mr-4">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-semibold text-secondary-700">Submit Salary Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/negotiate" className="flex items-center justify-between p-4 bg-gradient-to-r from-accent-50 to-transparent rounded-xl hover:from-accent-100 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center text-accent-600 mr-4">
                  <Target className="w-5 h-5" />
                </div>
                <span className="font-semibold text-secondary-700">Negotiation Tools</span>
              </div>
              <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-secondary-700 mb-4">Market Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightItem
            title="Tech salaries rising"
            description="Software engineering roles up 8% this quarter in major tech hubs."
            type="success"
          />
          <InsightItem
            title="Remote premium stable"
            description="Remote positions maintain 5-10% premium over on-site roles."
            type="info"
          />
          <InsightItem
            title="SF vs Austin gap"
            description="Austin offers 85% of SF salaries at 58% of the cost of living."
            type="warning"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change, negative }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center text-primary-600">
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${negative ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-secondary-700">{value}</div>
      <div className="text-sm text-secondary-400 mt-1">{label}</div>
    </div>
  )
}

function InsightItem({ title, description, type }) {
  const styles = {
    warning: 'border-l-4 border-yellow-400 bg-yellow-50',
    info: 'border-l-4 border-blue-400 bg-blue-50',
    success: 'border-l-4 border-green-400 bg-green-50',
  }

  return (
    <div className={`p-4 rounded-r-xl ${styles[type]}`}>
      <h4 className="font-semibold text-secondary-700 mb-1">{title}</h4>
      <p className="text-sm text-secondary-500">{description}</p>
    </div>
  )
}

// =============================================================================
// COMPARE PAGE
// =============================================================================

function ComparePage() {
  const location = useLocation()
  const prefillData = location.state?.prefill

  const [form, setForm] = useState({
    job_title: prefillData?.job_title || '',
    industry: prefillData?.industry || '',
    years_experience: prefillData?.years_experience || '',
    salary: prefillData?.salary || '',
    location: prefillData?.location || ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [compareCity, setCompareCity] = useState('')
  const [autoCompared, setAutoCompared] = useState(false)

  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Marketing', 'E-commerce', 'Nonprofit']
  const locations = Object.keys(COST_OF_LIVING)

  // Auto-compare if coming from Submit page with prefilled data
  useEffect(() => {
    if (prefillData && !autoCompared && !result) {
      setAutoCompared(true)
      runComparison()
    }
  }, [prefillData, autoCompared])

  const runComparison = async () => {
    const formData = prefillData || form
    if (!formData.job_title || !formData.industry || !formData.years_experience || !formData.salary || !formData.location) {
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/salary/compare', {
        ...formData,
        years_experience: parseInt(formData.years_experience),
        salary: parseFloat(formData.salary)
      })
      setResult(data.comparison)
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed. We may not have enough data for your criteria.')
    } finally {
      setLoading(false)
    }
  }

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

  const getAdjustedSalary = (salary, city) => {
    const baseIndex = COST_OF_LIVING[form.location]?.index || 100
    const targetIndex = COST_OF_LIVING[city]?.index || 100
    return Math.round(salary * (targetIndex / baseIndex))
  }

  const getSuggestions = () => {
    if (!result) return []
    const suggestions = []

    if (result.percentile_rank < 25) {
      suggestions.push({
        type: 'urgent',
        icon: '🚨',
        title: 'Below Market Rate',
        text: `Your salary is in the bottom 25%. Consider negotiating for a ${Math.round(((result.median_salary - result.your_salary) / result.your_salary) * 100)}% increase to reach market median.`
      })
    } else if (result.percentile_rank < 50) {
      suggestions.push({
        type: 'warning',
        icon: '📈',
        title: 'Room for Growth',
        text: 'You\'re below median. Document your achievements and consider a salary discussion at your next review.'
      })
    } else if (result.percentile_rank >= 75) {
      suggestions.push({
        type: 'success',
        icon: '🎯',
        title: 'Strong Position',
        text: 'You\'re in the top quartile! Focus on equity, bonuses, and career growth opportunities.'
      })
    }

    // Location-based suggestion
    const cheaperCities = locations.filter(l =>
      l !== form.location &&
      COST_OF_LIVING[l].index < COST_OF_LIVING[form.location]?.index * 0.8
    )
    if (cheaperCities.length > 0) {
      suggestions.push({
        type: 'info',
        icon: '🏠',
        title: 'Cost of Living Opportunity',
        text: `Consider ${cheaperCities[0]} - similar salary with ${Math.round((1 - COST_OF_LIVING[cheaperCities[0]].index / COST_OF_LIVING[form.location].index) * 100)}% lower cost of living.`
      })
    }

    return suggestions
  }

  const chartData = result ? [
    { name: 'P25', value: result.p25_salary, fill: '#e2e8f0' },
    { name: 'Median', value: result.median_salary, fill: CHART_NAVY },
    { name: 'P75', value: result.p75_salary, fill: '#94a3b8' },
    { name: 'P90', value: result.p90_salary, fill: '#64748b' },
    { name: 'You', value: result.your_salary, fill: CHART_PURPLE },
  ] : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-700">Compare Your Salary</h1>
        <p className="text-secondary-400 mt-2">See how your compensation stacks up against market data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="card space-y-5">
          <h3 className="text-lg font-bold text-secondary-700">Your Information</h3>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

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
              className="select"
              required
            >
              <option value="">Select industry</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="85000"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Location</label>
            <select
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className="select"
              required
            >
              <option value="">Select location</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4">
            {loading ? 'Analyzing...' : 'Compare Salary'}
          </button>
        </form>

        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-700 mb-4">Your Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">{result.percentile_rank}th</div>
                  <div className="text-sm text-secondary-500">Percentile</div>
                </div>
                <div className={`rounded-xl p-4 text-center ${result.gap_percentage >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-3xl font-bold ${result.gap_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.gap_percentage > 0 ? '+' : ''}{result.gap_percentage}%
                  </div>
                  <div className="text-sm text-secondary-500">vs Median</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Salary']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-secondary-400 mt-2 text-center">Based on {result.sample_size} data points</p>
            </div>

            {/* Cost of Living Comparison */}
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-700 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                Cost of Living Comparison
              </h3>
              <div className="mb-4">
                <label className="label">Compare with another city</label>
                <select
                  value={compareCity}
                  onChange={e => setCompareCity(e.target.value)}
                  className="select"
                >
                  <option value="">Select a city to compare</option>
                  {locations.filter(l => l !== form.location).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {compareCity && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div className="bg-secondary-50 rounded-xl p-4">
                    <div className="text-sm text-secondary-500 mb-1">{form.location}</div>
                    <div className="text-2xl font-bold text-secondary-700">${result.your_salary.toLocaleString()}</div>
                    <div className="text-xs text-secondary-400 mt-2">
                      COL Index: {COST_OF_LIVING[form.location]?.index}
                    </div>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="text-sm text-primary-600 mb-1">{compareCity}</div>
                    <div className="text-2xl font-bold text-primary-700">
                      ${getAdjustedSalary(result.your_salary, compareCity).toLocaleString()}
                    </div>
                    <div className="text-xs text-primary-500 mt-2">
                      Equivalent purchasing power
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Suggestions */}
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-700 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Smart Suggestions
              </h3>
              <div className="space-y-3">
                {getSuggestions().map((s, i) => (
                  <div key={i} className={`p-4 rounded-xl ${
                    s.type === 'urgent' ? 'bg-red-50 border border-red-100' :
                    s.type === 'warning' ? 'bg-yellow-50 border border-yellow-100' :
                    s.type === 'success' ? 'bg-green-50 border border-green-100' :
                    'bg-blue-50 border border-blue-100'
                  }`}>
                    <div className="flex items-start">
                      <span className="text-xl mr-3">{s.icon}</span>
                      <div>
                        <h4 className="font-semibold text-secondary-700">{s.title}</h4>
                        <p className="text-sm text-secondary-500 mt-1">{s.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// ANALYTICS PAGE
// =============================================================================

function AnalyticsPage() {
  const [payGapData, setPayGapData] = useState(null)
  const [industryData, setIndustryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/pay-gap'),
      api.get('/analytics/industry-comparison')
    ])
      .then(([gapRes, industryRes]) => {
        setPayGapData(gapRes.data)
        if (industryRes.data.industries) {
          setIndustryData(industryRes.data.industries.map(i => ({
            name: i.industry,
            median: Math.round(i.median_salary),
            p75: Math.round(i.p75 || i.median_salary * 1.2)
          })))
        }
      })
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

  const genderChartData = payGapData?.gender_breakdown?.map(g => ({
    name: g.gender,
    value: Math.round(g.avg_salary),
    count: g.count
  })) || []

  const ethnicityChartData = payGapData?.ethnicity_breakdown?.map(e => ({
    name: e.ethnicity,
    salary: Math.round(e.avg_salary)
  })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-700">Pay Gap Analytics</h1>
        <p className="text-secondary-400 mt-2">Data-driven insights into compensation disparities</p>
      </div>

      {payGapData?.gap_summary?.gender_gap_percentage && (
        <div className="card mb-8 bg-gradient-to-r from-primary-50 via-white to-secondary-50 border border-primary-100">
          <div className="text-center py-6">
            <h2 className="text-xl font-semibold text-secondary-600 mb-4">Current Gender Pay Gap</h2>
            <div className="text-7xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent mb-3">
              {payGapData.gap_summary.female_cents_per_dollar}¢
            </div>
            <p className="text-secondary-500 text-lg">Women earn per dollar men earn</p>
            <div className="inline-block mt-4 px-4 py-2 bg-primary-100 rounded-full">
              <span className="text-primary-700 font-semibold">{payGapData.gap_summary.gender_gap_percentage}% gender pay gap</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-bold text-secondary-700 mb-6">Salary by Gender</h3>
          {genderChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: $${(value/1000).toFixed(0)}k`}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Avg Salary']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-secondary-400 text-center py-12">No data available</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-secondary-700 mb-6">Salary by Ethnicity</h3>
          {ethnicityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ethnicityChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Avg Salary']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="salary" fill={CHART_NAVY} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-secondary-400 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      <div className="card mb-8">
        <h3 className="text-lg font-bold text-secondary-700 mb-6">Industry Salary Comparison</h3>
        {industryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={industryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar dataKey="median" name="Median Salary" fill={CHART_PURPLE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-secondary-400 text-center py-12">No data available</p>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-secondary-700 mb-6">Why This Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-transparent rounded-xl">
            <div className="text-4xl font-bold text-primary-600 mb-2">$400K+</div>
            <p className="text-secondary-500">Lost earnings over a 40-year career due to pay gap</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-secondary-50 to-transparent rounded-xl">
            <div className="text-4xl font-bold text-secondary-600 mb-2">42 Years</div>
            <p className="text-secondary-500">Time to close the gap at current rate of progress</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-accent-50 to-transparent rounded-xl">
            <div className="text-4xl font-bold text-accent-600 mb-2">63¢</div>
            <p className="text-secondary-500">Latina women earn per dollar white men earn</p>
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
        <h1 className="text-3xl font-bold text-secondary-700">Negotiation Tools</h1>
        <p className="text-secondary-400 mt-2">Generate a personalized script backed by market data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="card space-y-5">
          <h3 className="text-lg font-bold text-secondary-700">Build Your Script</h3>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="label">Key Achievements</label>
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

          <button type="submit" disabled={loading} className="btn-primary w-full py-4">
            {loading ? 'Generating...' : 'Generate Script'}
          </button>
        </form>

        {script && (
          <div className="space-y-4 animate-fadeIn">
            <div className="card">
              <h3 className="text-lg font-bold text-secondary-700 mb-4">Your Negotiation Script</h3>
              <div className="space-y-4">
                <ScriptSection title="Opening" content={script.opening} color="primary" />
                <ScriptSection title="Market Data" content={script.market_data} color="secondary" />
                <ScriptSection title="Your Value" content={script.achievements} color="accent" />
                <ScriptSection title="The Ask" content={script.ask} color="primary" />
                <ScriptSection title="Closing" content={script.closing} color="secondary" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-accent-50 to-transparent border border-accent-100">
              <h3 className="text-lg font-bold text-secondary-700 mb-4">Tips for Success</h3>
              <ul className="space-y-3">
                {script.tips.map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 mr-3 mt-0.5 text-sm font-bold">{i + 1}</span>
                    <span className="text-secondary-600">{tip}</span>
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

function ScriptSection({ title, content, color }) {
  const colors = {
    primary: 'border-primary-400 bg-primary-50',
    secondary: 'border-secondary-400 bg-secondary-50',
    accent: 'border-accent-400 bg-accent-50'
  }

  return (
    <div className={`border-l-4 pl-4 py-2 ${colors[color]}`}>
      <h4 className="font-semibold text-secondary-700 mb-1">{title}</h4>
      <p className="text-secondary-600">{content}</p>
    </div>
  )
}

// =============================================================================
// SUBMIT SALARY PAGE
// =============================================================================

function SubmitPage() {
  const navigate = useNavigate()
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

  const handleCompare = () => {
    // Navigate to Compare page with submitted data pre-filled
    navigate('/compare', {
      state: {
        prefill: {
          job_title: form.job_title,
          industry: form.industry,
          years_experience: form.years_experience,
          salary: form.salary,
          location: form.location
        }
      }
    })
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="card">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-700 mb-3">Thank You!</h2>
          <p className="text-secondary-500 mb-4">Your anonymous salary data helps everyone make better decisions.</p>
          <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-secondary-700 mb-2">Your Submission:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-secondary-400">Role:</span> <span className="text-secondary-700">{form.job_title}</span></div>
              <div><span className="text-secondary-400">Industry:</span> <span className="text-secondary-700">{form.industry}</span></div>
              <div><span className="text-secondary-400">Experience:</span> <span className="text-secondary-700">{form.years_experience} years</span></div>
              <div><span className="text-secondary-400">Salary:</span> <span className="text-secondary-700">${parseInt(form.salary).toLocaleString()}</span></div>
              <div className="col-span-2"><span className="text-secondary-400">Location:</span> <span className="text-secondary-700">{form.location}</span></div>
            </div>
          </div>
          <button onClick={handleCompare} className="btn-primary">
            See How You Compare
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-700">Submit Salary Data</h1>
        <p className="text-secondary-400 mt-2">Your anonymous contribution helps others make informed decisions</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label">Job Title *</label>
            <input type="text" value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="label">Industry *</label>
            <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="select" required>
              <option value="">Select</option>
              {['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Consulting', 'Marketing', 'E-commerce', 'Nonprofit'].map(i => (
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
            <select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="select" required>
              <option value="">Select</option>
              {Object.keys(COST_OF_LIVING).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Gender</label>
            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="select">
              <option value="">Prefer not to say</option>
              {['Female', 'Male', 'Non-binary', 'Other'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ethnicity</label>
            <select value={form.ethnicity} onChange={e => setForm({...form, ethnicity: e.target.value})} className="select">
              <option value="">Prefer not to say</option>
              {['Asian', 'Black/African American', 'Hispanic/Latino', 'White', 'Mixed/Multiple', 'Other'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Education Level</label>
            <select value={form.education_level} onChange={e => setForm({...form, education_level: e.target.value})} className="select">
              <option value="">Select</option>
              {['High School', 'Associate', 'Bachelor', 'Master', 'PhD'].map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Company Size</label>
            <select value={form.company_size} onChange={e => setForm({...form, company_size: e.target.value})} className="select">
              <option value="">Select</option>
              {['startup', 'small', 'medium', 'large', 'enterprise'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Work Status</label>
            <select value={form.remote_status} onChange={e => setForm({...form, remote_status: e.target.value})} className="select">
              <option value="">Select</option>
              {['remote', 'hybrid', 'onsite'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-xl text-sm text-secondary-600 border border-secondary-100">
          <strong>Privacy Note:</strong> Your data is anonymized and aggregated. Individual submissions cannot be traced back to you.
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4">
          {loading ? 'Submitting...' : 'Submit Anonymously'}
        </button>
      </form>
    </div>
  )
}

// =============================================================================
// AI ADVISOR PAGE (Snowflake Cortex)
// =============================================================================

function AIAdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI salary advisor powered by Snowflake Cortex. I can help you understand your market value and provide negotiation strategies. To get personalized advice, tell me about your role, salary, and what you'd like help with!"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userContext, setUserContext] = useState({
    job_title: '',
    salary: '',
    industry: 'Technology',
    location: 'San Francisco, CA',
    percentile: 50,
    median_salary: 120000
  })
  const [showContext, setShowContext] = useState(true)

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const { data } = await api.post('/chatbot/advice', {
        message: userMessage,
        job_title: userContext.job_title || 'professional',
        salary: parseFloat(userContext.salary) || 100000,
        industry: userContext.industry,
        location: userContext.location,
        percentile: userContext.percentile,
        median_salary: userContext.median_salary
      })

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        model: data.model,
        powered_by: data.powered_by
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    "How do I ask for a raise?",
    "What should I say in a salary negotiation?",
    "Am I being paid fairly?",
    "How do I research market rates?"
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary-700">AI Salary Advisor</h1>
            <p className="text-secondary-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Powered by Snowflake Cortex AI (Llama)
            </p>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      {showContext && (
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-700 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              Your Profile (for personalized advice)
            </h3>
            <button
              onClick={() => setShowContext(false)}
              className="text-secondary-400 hover:text-secondary-600 text-sm"
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-secondary-500 block mb-1">Job Title</label>
              <input
                type="text"
                value={userContext.job_title}
                onChange={e => setUserContext({...userContext, job_title: e.target.value})}
                className="input text-sm py-2"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="text-xs text-secondary-500 block mb-1">Current Salary</label>
              <input
                type="number"
                value={userContext.salary}
                onChange={e => setUserContext({...userContext, salary: e.target.value})}
                className="input text-sm py-2"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="text-xs text-secondary-500 block mb-1">Industry</label>
              <select
                value={userContext.industry}
                onChange={e => setUserContext({...userContext, industry: e.target.value})}
                className="select text-sm py-2"
              >
                {['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Consulting'].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-secondary-500 block mb-1">Location</label>
              <select
                value={userContext.location}
                onChange={e => setUserContext({...userContext, location: e.target.value})}
                className="select text-sm py-2"
              >
                {Object.keys(COST_OF_LIVING).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {!showContext && (
        <button
          onClick={() => setShowContext(true)}
          className="text-primary-600 text-sm mb-4 hover:underline flex items-center gap-1"
        >
          <Target className="w-4 h-4" /> Show profile settings
        </button>
      )}

      {/* Chat Container */}
      <div className="card p-0 overflow-hidden">
        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-gray-100 text-secondary-700 rounded-2xl rounded-bl-md'
              } px-4 py-3`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-secondary-400">
                    <Bot className="w-4 h-4" />
                    {msg.powered_by || 'AI Advisor'}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-secondary-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-secondary-400 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about salary negotiation, market rates, or career advice..."
              className="flex-1 input bg-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary px-6 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 p-4 bg-secondary-50 rounded-xl border border-secondary-100">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-secondary-500 mt-0.5" />
          <div className="text-sm text-secondary-600">
            <p className="font-medium mb-1">About this AI</p>
            <p>This advisor uses Snowflake Cortex AI with Llama to provide personalized salary negotiation advice based on market data. Your conversations are not stored.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// AUTH PAGE
// =============================================================================

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('Check your email for a confirmation link!')
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-700">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-secondary-400 mt-2">
              {isLogin ? 'Sign in to access your dashboard' : 'Join CounterMarket today'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 border border-green-100">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setMessage('')
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-secondary-400 text-sm mt-6">
          By continuing, you agree to CounterMarket's Terms of Service
        </p>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN APP
// =============================================================================

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/negotiate" element={<NegotiatePage />} />
        <Route path="/ai-advisor" element={<AIAdvisorPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-secondary-700 text-white mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">CounterMarket</span>
            </div>
            <div className="text-secondary-300 text-sm text-center md:text-right">
              <p>Built for Hack Violet 2026 | Powered by Snowflake + Cortex AI</p>
              <p className="mt-1">Making salary data transparent, one submission at a time.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
