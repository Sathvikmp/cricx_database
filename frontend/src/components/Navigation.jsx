import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          🏏 Cricx Database
        </Link>
        <div className="flex gap-6">
          <Link
            to="/"
            className={`px-4 py-2 rounded transition font-semibold ${
              isActive('/') 
                ? 'bg-blue-700' 
                : 'hover:bg-blue-700'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/ingest"
            className={`px-4 py-2 rounded transition font-semibold ${
              isActive('/ingest') 
                ? 'bg-blue-700' 
                : 'hover:bg-blue-700'
            }`}
          >
            Ingest Data
          </Link>
        </div>
      </div>
    </nav>
  )
}
