import type { Role } from './auth'

export type UserProfile = {
  id: string
  studentId: string | null
  fullName: string
  phone: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
}

export type ClassItem = {
  id: string
  title: string
  description: string | null
  category: string | null
  priceMmk: number
  kbzQrImageUrl: string | null
  courseIncludes: string | null
  kbzPayPhone: string | null
  startDate: string
  endDate: string | null
  durationWeeks: number | null
  maxCapacity: number
  currentEnrollment: number
  status: string
  instructorName: string | null
}

export type ClassStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'FULL'

export type ClassCreatePayload = {
  title: string
  description: string | null
  category: string | null
  priceMmk: number
  kbzQrImageUrl: string | null
  courseIncludes: string | null
  kbzPayPhone: string | null
  startDate: string
  endDate: string | null
  durationWeeks: number | null
  maxCapacity: number
  status: ClassStatus
  instructorName: string | null
}

export type PaymentItem = {
  id: string
  enrollmentId: string
  classId: string
  classTitle: string
  studentId: string
  studentName: string
  amountMmk: number
  kpayTransactionId: string
  paymentProofUrl: string | null
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejectionReason: string | null
  createdAt: string
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  classId: string | null
  classTitle: string | null
  createdAt: string
}

export type ChatMessage = {
  id: string
  classId: string
  senderId: string
  senderName: string
  message: string
  createdAt: string
}
