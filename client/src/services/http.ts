import type { ApiError } from '../types/auth'

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body != null) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(path, { ...options, headers })
  if (!response.ok) {
    let errorMessage = 'Request failed.'

    try {
      const body = (await response.json()) as ApiError
      if (body.message) {
        errorMessage = body.message
      }
    } catch {
      errorMessage = response.statusText || errorMessage
    }

    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

