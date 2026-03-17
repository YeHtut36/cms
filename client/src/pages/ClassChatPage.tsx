import { StudentPanel } from '../sections/StudentPanel'
import { useAuth } from '../hooks/useAuth'

export function ClassChatPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  if (user.role !== 'STUDENT') {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">Class chat is available to students.</p>
  }

  return <StudentPanel mode="chat" token={token} userEmail={user.email} />
}

