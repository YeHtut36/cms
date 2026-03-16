import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function TopNav() {
  const { token, user, loadingUser, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
          CMS Myanmar
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" to="/">
            Classes
          </Link>
          <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" to="/onboarding">
            Join
          </Link>

          {token && user ? (
            <>
              <Link className="rounded-lg px-3 py-2 hover:bg-slate-100" to="/app">
                Dashboard
              </Link>
              <button
                className="rounded-lg bg-slate-900 px-3 py-2 text-white hover:bg-slate-700"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500" to="/login">
              Login
            </Link>
          )}

          {loadingUser && <span className="text-xs text-slate-400">Loading...</span>}
        </nav>
      </div>
    </header>
  )
}

