import { apiRequest } from './http'

export type OnboardingPayload = {
  fullName: string
  phone: string
  email: string
  password: string
  classId: string
  amountMmk: number
  kpayTransactionId: string
  paymentProofUrl: string | null
}

export function submitOnboarding(payload: OnboardingPayload) {
  return apiRequest('/api/v1/public/onboarding/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function uploadPaymentProof(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<{ url: string }>('/api/v1/uploads/payment-proof', {
    method: 'POST',
    body: formData,
  })
}

