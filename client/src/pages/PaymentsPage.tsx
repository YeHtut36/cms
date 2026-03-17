import { PaymentReviewPanel } from '../sections/PaymentReviewPanel'
import { useAuth } from '../hooks/useAuth'

export function PaymentsPage() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return null
  }

  if (user.role !== 'ADMIN' && user.role !== 'HR') {
    return <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">You do not have access to payment review.</p>
  }

  return <PaymentReviewPanel token={token} />
}

