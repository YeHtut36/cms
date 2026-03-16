import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { getPendingPayments, verifyPayment } from '../services/paymentService'
import type { PaymentItem } from '../types/models'

export function PaymentReviewPanel({ token }: { token: string }) {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [error, setError] = useState<string>('')

  const load = () => {
    getPendingPayments(token)
      .then((items) => {
        setPayments(items)
        setError('')
      })
      .catch((err: Error) => setError(err.message))
  }

  useEffect(load, [token])

  const review = async (paymentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await verifyPayment(paymentId, status, token)
      load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Card>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Pending Payment Verification</h3>
        {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {payments.length === 0 && <p className="text-sm text-slate-500">No pending payments.</p>}

        <div className="space-y-2">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-800">{payment.classTitle}</p>
              <p className="text-slate-600">
                Student: {payment.studentName} | Tx: {payment.kpayTransactionId} | Amount: {payment.amountMmk.toLocaleString()} MMK
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500"
                  onClick={() => review(payment.id, 'VERIFIED')}
                  type="button"
                >
                  Verify
                </button>
                <button
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-500"
                  onClick={() => review(payment.id, 'REJECTED')}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

