import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
            M
          </span>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            MaliksTech PM
          </span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60">
              <Avatar name={user.fullName} />
              <span className="text-sm text-slate-700 font-medium hidden sm:inline">{user.fullName}</span>
              <span className="text-xs text-slate-400">· {user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
