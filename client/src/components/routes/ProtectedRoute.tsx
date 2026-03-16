import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const location = useLocation()
  const { token, loadingUser } = useAuth()

  if (loadingUser) {
    return <p className="p-6 text-center text-slate-500">Checking your account...</p>
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

