import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { AdminPanel } from '../sections/AdminPanel'
import { PaymentReviewPanel } from '../sections/PaymentReviewPanel'
import { StudentPanel } from '../sections/StudentPanel'

export function DashboardPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  return (
    <section className="space-y-5">
      <Card>
        <p className="text-xs uppercase tracking-[0.18em] text-indigo-600">{user.role}</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">{user.fullName}</h2>
        <p className="text-sm text-slate-600">
          Email: {user.email} {user.studentId ? `| Student ID: ${user.studentId}` : '| Awaiting student ID'}
        </p>
      </Card>

      {(user.role === 'HR' || user.role === 'ADMIN') && <PaymentReviewPanel token={token} />}
      {user.role === 'ADMIN' && <AdminPanel token={token} />}
      {user.role === 'STUDENT' && <StudentPanel token={token} userEmail={user.email} />}
    </section>
  )
}

