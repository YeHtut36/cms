import type { ClassCreatePayload, ClassItem } from '../types/models'
import { apiRequest } from './http'

export function getPublicClasses() {
  return apiRequest<ClassItem[]>('/api/v1/public/classes')
}

export function createClass(payload: ClassCreatePayload, token: string) {
  return apiRequest<ClassItem>('/api/v1/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

