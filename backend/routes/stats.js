const express = require('express')
const { db_operations } = require('../db')
const router = express.Router()

// Get all statistics
router.get('/', (req, res) => {
  db_operations.getAllStats((err, rows) => {
    if (err) {
      console.error('Error fetching stats:', err)
      return res.status(500).json({ error: 'Failed to fetch stats' })
    }
    res.json(rows || [])
  })
})

// Add single statistic
router.post('/', (req, res) => {
  const { playerName, team, matchType, runs, wickets, matchDate } = req.body

  if (!playerName || !team || !matchType || runs === undefined || wickets === undefined || !matchDate) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const data = {
    playerName,
    team,
    matchType,
    runs: parseInt(runs),
    wickets: parseInt(wickets),
    matchDate
  }

  db_operations.addStat(data, (err, result) => {
    if (err) {
      console.error('Error adding stat:', err)
      return res.status(500).json({ error: 'Failed to add stat' })
    }
    res.json({ success: true, id: result.id })
  })
})

// Bulk upload statistics
router.post('/upload', (req, res) => {
  const stats = req.body

  if (!Array.isArray(stats) || stats.length === 0) {
    return res.status(400).json({ error: 'Invalid data format' })
  }

  const validatedStats = stats.map(stat => ({
    playerName: stat.playerName,
    team: stat.team,
    matchType: stat.matchType,
    runs: parseInt(stat.runs),
    wickets: parseInt(stat.wickets),
    matchDate: stat.matchDate
  }))

  db_operations.addMultipleStats(validatedStats, (err) => {
    if (err) {
      console.error('Error uploading stats:', err)
      return res.status(500).json({ error: 'Failed to upload stats' })
    }
    res.json({ success: true, count: validatedStats.length })
  })
})

module.exports = router
