import { StudentPanel } from '../sections/StudentPanel'
import { useAuth } from '../hooks/useAuth'

export function NotificationsPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  if (user.role !== 'STUDENT') {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Notifications are available to students.</p>
  }

  return <StudentPanel mode="notifications" token={token} userEmail={user.email} />
}

