const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'cricx.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err)
  } else {
    console.log('✅ Connected to SQLite database')
    initializeDatabase()
  }
})

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS cricket_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playerName TEXT NOT NULL,
      team TEXT NOT NULL,
      matchType TEXT NOT NULL,
      runs INTEGER NOT NULL,
      wickets INTEGER NOT NULL,
      matchDate TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err)
    } else {
      console.log('✅ Cricket stats table ready')
    }
  })
}

const db_operations = {
  getAllStats: (callback) => {
    db.all('SELECT * FROM cricket_stats ORDER BY matchDate DESC', callback)
  },

  addStat: (data, callback) => {
    const { playerName, team, matchType, runs, wickets, matchDate } = data
    db.run(
      `INSERT INTO cricket_stats (playerName, team, matchType, runs, wickets, matchDate)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [playerName, team, matchType, runs, wickets, matchDate],
      function(err) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, { id: this.lastID })
        }
      }
    )
  },

  addMultipleStats: (statsArray, callback) => {
    const stmt = db.prepare(
      `INSERT INTO cricket_stats (playerName, team, matchType, runs, wickets, matchDate)
       VALUES (?, ?, ?, ?, ?, ?)`
    )

    let count = 0
    statsArray.forEach((stat) => {
      stmt.run([stat.playerName, stat.team, stat.matchType, stat.runs, stat.wickets, stat.matchDate], (err) => {
        if (err) {
          console.error('Error inserting stat:', err)
        }
        count++
        if (count === statsArray.length) {
          stmt.finalize(callback)
        }
      })
    })
  }
}

module.exports = { db, db_operations }
