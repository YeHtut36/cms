import type { UserProfile } from '../types/models'
import { apiRequest } from './http'

export function getPendingStudents(token: string) {
  return apiRequest<UserProfile[]>('/api/v1/users/students/pending', {}, token)
}

