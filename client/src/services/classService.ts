import type { ClassCreatePayload, ClassItem } from '../types/models'
import { apiRequest } from './http'

export function getPublicClasses() {
  return apiRequest<ClassItem[]>('/api/v1/public/classes')
}

export function getPublicClass(classId: string) {
  return apiRequest<ClassItem>(`/api/v1/public/classes/${classId}`)
}

export function createClass(payload: ClassCreatePayload, token: string) {
  return apiRequest<ClassItem>('/api/v1/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export function getMyClasses(token: string) {
  return apiRequest<ClassItem[]>('/api/v1/classes', {}, token)
}

export function deleteClass(classId: string, token: string) {
  return apiRequest(`/api/v1/classes/${classId}`, { method: 'DELETE' }, token)
}

export function updateClass(classId: string, payload: ClassCreatePayload, token: string) {
  return apiRequest<ClassItem>(`/api/v1/classes/${classId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, token)
}

export function uploadKbzQrImage(file: File, token: string) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest<{ url: string }>('/api/v1/uploads/kbz-qr', {
    method: 'POST',
    body: formData,
  }, token)
}

