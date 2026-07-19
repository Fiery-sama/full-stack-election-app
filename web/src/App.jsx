import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

function App() {
  const [constituencies, setConstituencies] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [booths, setBooths] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [sortConfig, setSortConfig] = useState({ key: 'number', direction: 'asc' })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Set default axios header for authenticated requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token])

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/constituencies`)
      .then(res => {
        setConstituencies(res.data)
        if (res.data.length > 0) {
          setSelectedId(res.data[0].id)
        }
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load constituencies')
      })
  }, [token])

  useEffect(() => {
    if (!selectedId) return

    setLoading(true)
    axios.get(`${API_URL}/constituencies/${selectedId}/booths`)
      .then(res => {
        setBooths(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load booths')
        setLoading(false)
      })
  }, [selectedId])

  const tableData = useMemo(() => {
    return booths.map(booth => {
      const totalVotesCast = booth.votes.reduce((acc, v) => acc + v.votes, 0)
      const turnout = booth.total_voters > 0 ? ((totalVotesCast / booth.total_voters) * 100).toFixed(1) : 0

      let leadingCandidate = 'N/A'
      let maxVotes = -1
      booth.votes.forEach(v => {
        if (v.votes > maxVotes) {
          maxVotes = v.votes
          leadingCandidate = v.candidate.name
        }
      })

      return {
        ...booth,
        totalVotesCast,
        turnout: parseFloat(turnout),
        leadingCandidate
      }
    })
  }, [booths])



  const candidatesList = useMemo(() => {
    const map = {}
    booths.forEach(booth => {
      booth.votes.forEach(v => {
        if (!map[v.candidate.id]) {
          map[v.candidate.id] = v.candidate
        }
      })
    })
    return Object.values(map)
  }, [booths])

  const chartData = useMemo(() => {
    const candidateTotals = {}
    booths.forEach(booth => {
      booth.votes.forEach(v => {
        if (!candidateTotals[v.candidate.name]) {
          candidateTotals[v.candidate.name] = 0
        }
        candidateTotals[v.candidate.name] += v.votes
      })
    })

    const data = Object.keys(candidateTotals).map(name => ({
      name,
      votes: candidateTotals[name]
    }))

    data.sort((a, b) => b.votes - a.votes)
    return data
  }, [booths])

  const [filterText, setFilterText] = useState('')

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const filteredAndSortedTableData = useMemo(() => {
    let result = [...tableData]

    if (filterText) {
      const lowerFilter = filterText.toLowerCase()
      result = result.filter(row =>
        row.name.toLowerCase().includes(lowerFilter) ||
        row.number.toString().includes(lowerFilter)
      )
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return result
  }, [tableData, sortConfig, filterText])

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    axios.post(`${API_URL}/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(res => {
        const t = res.data.access_token
        setToken(t)
        localStorage.setItem('token', t)
      })
      .catch(err => {
        setLoginError('Invalid username or password')
      })
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  if (!token) {
    return (
      <div className="login-wrapper">
        <div className="login-glass-card">
          <h2 className="login-title">Analytics Secure Login</h2>
          {loginError && <div className="error" style={{ marginBottom: '1.5rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.5rem', textAlign: 'center', fontWeight: '500' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label className="login-label">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="login-input"
                placeholder="Enter admin"
                required 
              />
            </div>
            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="login-input"
                placeholder="Enter password123"
                required 
              />
            </div>
            <button type="submit" className="login-btn">
              Log In
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (error) return <div className="error">{error}</div>

  return (
    <div className="app-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Election Data Dashboard</h1>
        <div className="select-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="constituency-select">Constituency:</label>
          <div className="custom-dropdown-container">
            <div 
              className="custom-dropdown-header"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{constituencies.find(c => c.id === selectedId)?.name || 'Select Constituency'}</span>
              <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>
            {isDropdownOpen && (
              <div className="custom-dropdown-list">
                {constituencies.map(c => (
                  <div 
                    key={c.id} 
                    className={`custom-dropdown-item ${selectedId === c.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedId(c.id)
                      setIsDropdownOpen(false)
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>
      <div className="dashboard-container">
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2>Candidate Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {candidatesList.map(c => (
              <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-primary)' }}>
                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{c.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{c.party}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {loading ? (
        <div className="loading">Loading data...</div>
      ) : (
        <div className="dashboard-container">
          <div className="dashboard-grid">
            <div className="card table-section">
              <h2>Booth Wise Data</h2>
              <div className="filter-container" style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search booths by name or number..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  style={{ padding: '8px', width: '100%', maxWidth: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => requestSort('number')}>
                        Booth # <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '5px' }} />
                      </th>
                      <th onClick={() => requestSort('name')}>
                        Name <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '5px' }} />
                      </th>
                      <th onClick={() => requestSort('total_voters')}>
                        Total Voters <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '5px' }} />
                      </th>
                      <th onClick={() => requestSort('turnout')}>
                        Turnout % <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '5px' }} />
                      </th>
                      <th onClick={() => requestSort('leadingCandidate')}>
                        Leading Candidate <ArrowUpDown size={14} style={{ display: 'inline', marginLeft: '5px' }} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTableData.map(row => (
                      <tr key={row.id}>
                        <td>{row.number}</td>
                        <td>{row.name}</td>
                        <td>{row.total_voters}</td>
                        <td>{row.turnout}%</td>
                        <td>{row.leadingCandidate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card chart-section">
              <h2>Top Candidates (Overall Votes)</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="var(--accent-color)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}

export default App
