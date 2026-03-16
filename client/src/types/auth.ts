export type Role = 'ADMIN' | 'HR' | 'STUDENT'

export type AuthResponse = {
  accessToken: string
  tokenType: string
  userId: string
  fullName: string
  email: string
  studentId: string | null
  role: Role
}

export type AuthState = {
  token: string | null
}

export type ApiError = {
  message?: string
}

