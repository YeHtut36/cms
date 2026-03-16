import type { PaymentItem } from '../types/models'
import { apiRequest } from './http'

export function getPendingPayments(token: string) {
  return apiRequest<PaymentItem[]>('/api/v1/payments/pending', {}, token)
}

export function verifyPayment(
  paymentId: string,
  status: 'VERIFIED' | 'REJECTED',
  token: string,
  rejectionReason?: string,
) {
  return apiRequest(`/api/v1/payments/${paymentId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason ?? 'Rejected by reviewer.' : null,
    }),
  }, token)
}

