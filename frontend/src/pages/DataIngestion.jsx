import { useState } from 'react'
import axios from 'axios'

export default function DataIngestion() {
  const [formData, setFormData] = useState({
    playerName: '',
    team: '',
    matchType: 'ODI',
    runs: '',
    wickets: '',
    matchDate: '',
  })
  const [csvFile, setCsvFile] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0])
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5001/api/stats', formData)
      setMessage({ type: 'success', text: 'Data added successfully!' })
      setFormData({
        playerName: '',
        team: '',
        matchType: 'ODI',
        runs: '',
        wickets: '',
        matchDate: '',
      })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add data. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCsvUpload = async (e) => {
    e.preventDefault()
    if (!csvFile) {
      setMessage({ type: 'error', text: 'Please select a CSV file' })
      return
    }

    setLoading(true)
    const formDataObj = new FormData()
    formDataObj.append('file', csvFile)

    try {
      const response = await axios.post('http://localhost:5001/api/stats/upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage({ type: 'success', text: `Successfully uploaded ${response.data.count} records!` })
      setCsvFile(null)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload CSV. Please check the format.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Data Ingestion</h1>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-400' 
            : 'bg-red-100 text-red-800 border border-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Submission */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Manual Entry</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player Name
              </label>
              <input
                type="text"
                name="playerName"
                value={formData.playerName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter player name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <input
                type="text"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter team name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Type
              </label>
              <select
                name="matchType"
                value={formData.matchType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="ODI">ODI</option>
                <option value="T20">T20</option>
                <option value="Test">Test</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Runs
                </label>
                <input
                  type="number"
                  name="runs"
                  value={formData.runs}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wickets
                </label>
                <input
                  type="number"
                  name="wickets"
                  value={formData.wickets}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Date
              </label>
              <input
                type="date"
                name="matchDate"
                value={formData.matchDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-semibold"
            >
              {loading ? 'Adding...' : 'Add Entry'}
            </button>
          </form>
        </div>

        {/* CSV Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Bulk Upload</h2>
          <form onSubmit={handleCsvUpload} className="space-y-4">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <label className="cursor-pointer block">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-600 font-semibold">Select CSV File</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {csvFile && (
                <p className="text-green-600 mt-2 text-sm font-medium">
                  ✓ {csvFile.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">CSV Format</h3>
              <pre className="text-xs text-gray-600 overflow-x-auto">
{`playerName,team,matchType,runs,wickets,matchDate
Virat Kohli,India,ODI,85,0,2024-01-15
Rohit Sharma,India,T20,92,0,2024-01-15`}
              </pre>
            </div>

            <button
              type="submit"
              disabled={loading || !csvFile}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-semibold"
            >
              {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
