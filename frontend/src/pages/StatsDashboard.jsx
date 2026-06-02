import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function StatsDashboard() {
  const [stats, setStats] = useState([])
  const [filteredStats, setFilteredStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    playerName: '',
    team: '',
    matchType: 'all',
  })
  const [sortBy, setSortBy] = useState('matchDate')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [stats, filters, sortBy, sortOrder])

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...stats]

    if (filters.playerName) {
      filtered = filtered.filter(s =>
        s.playerName.toLowerCase().includes(filters.playerName.toLowerCase())
      )
    }

    if (filters.team) {
      filtered = filtered.filter(s =>
        s.team.toLowerCase().includes(filters.team.toLowerCase())
      )
    }

    if (filters.matchType !== 'all') {
      filtered = filtered.filter(s => s.matchType === filters.matchType)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredStats(filtered)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getChartData = () => {
    const playerStats = {}
    filteredStats.forEach(stat => {
      if (!playerStats[stat.playerName]) {
        playerStats[stat.playerName] = { playerName: stat.playerName, runs: 0, wickets: 0, matches: 0 }
      }
      playerStats[stat.playerName].runs += stat.runs
      playerStats[stat.playerName].wickets += stat.wickets
      playerStats[stat.playerName].matches += 1
    })
    return Object.values(playerStats).slice(0, 10)
  }

  const totalRuns = filteredStats.reduce((sum, s) => sum + s.runs, 0)
  const totalWickets = filteredStats.reduce((sum, s) => sum + s.wickets, 0)
  const totalMatches = filteredStats.length

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Statistics Dashboard</h1>

      {/* Key Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-semibold">Total Runs</p>
          <p className="text-3xl font-bold text-blue-600">{totalRuns}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
          <p className="text-gray-600 text-sm font-semibold">Total Wickets</p>
          <p className="text-3xl font-bold text-red-600">{totalWickets}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-semibold">Total Matches</p>
          <p className="text-3xl font-bold text-green-600">{totalMatches}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Filters & Search</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player Name
            </label>
            <input
              type="text"
              name="playerName"
              value={filters.playerName}
              onChange={handleFilterChange}
              placeholder="Search player..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <input
              type="text"
              name="team"
              value={filters.team}
              onChange={handleFilterChange}
              placeholder="Search team..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Match Type
            </label>
            <select
              name="matchType"
              value={filters.matchType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="ODI">ODI</option>
              <option value="T20">T20</option>
              <option value="Test">Test</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="matchDate">Date</option>
                <option value="runs">Runs</option>
                <option value="wickets">Wickets</option>
                <option value="playerName">Player Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {getChartData().length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Runs by Player</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="playerName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="runs" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Wickets by Player</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="playerName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="wickets" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          All Statistics ({filteredStats.length})
        </h2>

        {loading ? (
          <p className="text-center text-gray-600 py-4">Loading...</p>
        ) : filteredStats.length === 0 ? (
          <p className="text-center text-gray-600 py-4">No statistics found. Start by ingesting data!</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">Player</th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">Team</th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">Match Type</th>
                <th className="px-4 py-3 text-center text-gray-700 font-semibold">Runs</th>
                <th className="px-4 py-3 text-center text-gray-700 font-semibold">Wickets</th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-800 font-medium">{stat.playerName}</td>
                  <td className="px-4 py-3 text-gray-600">{stat.team}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {stat.matchType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-green-600 font-semibold">{stat.runs}</td>
                  <td className="px-4 py-3 text-center text-red-600 font-semibold">{stat.wickets}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(stat.matchDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
