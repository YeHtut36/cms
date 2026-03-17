import { AdminPanel } from '../sections/AdminPanel'
import { useAuth } from '../hooks/useAuth'

export function ClassManagementPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  if (user.role !== 'ADMIN') {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Only admins can manage classes.</p>
  }

  return <AdminPanel mode="classes" token={token} />
}

