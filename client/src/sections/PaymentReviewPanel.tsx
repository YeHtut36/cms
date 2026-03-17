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
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Pending Payment Verification</h3>
          <p className="text-sm text-slate-500">Review KBZ transaction IDs and approve or reject submitted payments.</p>
        </div>

        {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {payments.length === 0 && <p className="text-sm text-slate-500">No pending payments.</p>}

        {payments.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Proof</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{payment.classTitle}</td>
                    <td className="px-4 py-3">{payment.studentName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{payment.kpayTransactionId}</td>
                    <td className="px-4 py-3">{payment.amountMmk.toLocaleString()} MMK</td>
                    <td className="px-4 py-3">
                      {payment.paymentProofUrl ? (
                        <a
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                          href={payment.paymentProofUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          View proof
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500"
                          onClick={() => review(payment.id, 'VERIFIED')}
                          type="button"
                        >
                          Verify
                        </button>
                        <button
                          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-700 hover:bg-rose-100"
                          onClick={() => review(payment.id, 'REJECTED')}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}

