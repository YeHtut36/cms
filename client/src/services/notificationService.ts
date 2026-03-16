import type { NotificationItem } from '../types/models'
import { apiRequest } from './http'

export function getMyNotifications(token: string) {
  return apiRequest<NotificationItem[]>('/api/v1/notifications/my', {}, token)
}

export function sendBroadcastNotification(title: string, message: string, token: string) {
  return apiRequest<{ message: string; recipientCount: number }>('/api/v1/notifications', {
    method: 'POST',
    body: JSON.stringify({
      title,
      message,
      type: 'GENERAL',
      target: 'ALL_STUDENTS',
    }),
  }, token)
}

