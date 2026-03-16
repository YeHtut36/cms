import type { ChatMessage } from '../types/models'
import { apiRequest } from './http'

export function getClassMessages(classId: string, token: string) {
  return apiRequest<ChatMessage[]>(`/api/v1/chat/classes/${classId}/messages`, {}, token)
}

