import type { AuthResponse } from '../types/auth'
import type { UserProfile } from '../types/models'
import { apiRequest } from './http'

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMyProfile(token: string) {
  return apiRequest<UserProfile>('/api/v1/users/me', {}, token)
}

