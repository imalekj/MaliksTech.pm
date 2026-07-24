import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-indigo-600">
          MaliksTech PM
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              {user.fullName} <span className="text-slate-400">· {user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
