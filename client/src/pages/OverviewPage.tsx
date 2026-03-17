import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

export function OverviewPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  const cards = [
    {
      label: 'Email',
      value: user.email,
    },
    {
      label: 'Account',
      value: user.isActive ? 'Active' : 'Pending Approval',
      valueClass: user.isActive ? 'text-emerald-700' : 'text-amber-700',
    },
  ]

  if (user.role === 'STUDENT') {
    cards.splice(1, 0, {
      label: 'Student ID',
      value: user.studentId || 'Awaiting assignment',
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{card.label}</p>
            <p className={`mt-2 text-sm font-medium text-slate-900 ${card.valueClass ?? ''}`}>{card.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

