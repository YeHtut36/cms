import { AdminPanel } from '../sections/AdminPanel'
import { useAuth } from '../hooks/useAuth'

export function BroadcastPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  if (user.role !== 'ADMIN') {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Only admins can broadcast announcements.</p>
  }

  return <AdminPanel mode="broadcast" token={token} />
}

