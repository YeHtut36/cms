import { AppSidebar } from '../components/layout/AppSidebar'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { AdminPanel } from '../sections/AdminPanel'
import { PaymentReviewPanel } from '../sections/PaymentReviewPanel'
import { StudentPanel } from '../sections/StudentPanel'

export function DashboardPage() {
  const { token, user, logout } = useAuth()

  if (!token || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-[1440px]">
        <AppSidebar role={user.role} />

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Dashboard</p>
                <h2 className="text-xl font-semibold text-slate-900">Welcome, {user.fullName}</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{user.role}</span>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={logout}
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="space-y-5 px-4 py-5 md:px-6 md:py-6">
            <section id="overview">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{user.email}</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Student ID</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{user.studentId || 'Awaiting assignment'}</p>
                </Card>
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Account</p>
                  <p className="mt-2 text-sm font-medium text-emerald-700">{user.isActive ? 'Active' : 'Pending Approval'}</p>
                </Card>
              </div>
            </section>

            {(user.role === 'HR' || user.role === 'ADMIN') && (
              <section id="payments">
                <PaymentReviewPanel token={token} />
              </section>
            )}

            {user.role === 'ADMIN' && (
              <section id="classes">
                <AdminPanel token={token} />
              </section>
            )}

            {user.role === 'STUDENT' && (
              <section id="notifications">
                <StudentPanel token={token} userEmail={user.email} />
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

