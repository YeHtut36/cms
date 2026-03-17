import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { AppSidebar } from '../components/layout/AppSidebar'
import { useAuth } from '../hooks/useAuth'

const TITLES: Record<string, string> = {
  '/app/overview': 'Overview',
  '/app/payments': 'Payment Review',
  '/app/classes': 'Class Management',
  '/app/broadcast': 'Broadcast',
  '/app/students': 'Pending Students',
  '/app/notifications': 'Notifications',
  '/app/chat': 'Class Chat',
}

export function AppLayout() {
  const { token, user, logout } = useAuth()
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const pathname = location.pathname.replace(/\/$/, '') || '/app/overview'
  const title = TITLES[pathname] ?? 'Dashboard'

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-[1440px]">
        <AppSidebar role={user.role} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Dashboard</p>
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{user.role}</span>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  onClick={logout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

