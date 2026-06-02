const express = require('express')
const cors = require('cors')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')
const statsRouter = require('./routes/stats')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

// Multer configuration
const upload = multer({
  dest: uploadsDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'), false)
    }
  }
})

// Routes
app.use('/api/stats', statsRouter)

// CSV Upload endpoint
app.post('/api/stats/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const stats = []
  const filePath = req.file.path

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      stats.push({
        playerName: row.playerName,
        team: row.team,
        matchType: row.matchType,
        runs: parseInt(row.runs),
        wickets: parseInt(row.wickets),
        matchDate: row.matchDate
      })
    })
    .on('end', () => {
      const { db_operations } = require('./db')
      db_operations.addMultipleStats(stats, (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }

        if (err) {
          return res.status(500).json({ error: 'Failed to process CSV' })
        }
        res.json({ success: true, count: stats.length })
      })
    })
    .on('error', (err) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      res.status(500).json({ error: 'Error parsing CSV' })
    })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cricx Backend is running' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🏏 Cricx Backend Server Started`)
  console.log(`📡 Running on http://localhost:${PORT}`)
  console.log(`📊 API available at http://localhost:${PORT}/api`)
  console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`)
})
