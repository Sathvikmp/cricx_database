import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import DataIngestion from './pages/DataIngestion'
import StatsDashboard from './pages/StatsDashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StatsDashboard />} />
            <Route path="/ingest" element={<DataIngestion />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
