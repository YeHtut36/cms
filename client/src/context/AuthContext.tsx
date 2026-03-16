import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getMyProfile } from '../services/authService'
import type { UserProfile } from '../types/models'

type AuthContextValue = {
  token: string | null
  user: UserProfile | null
  loadingUser: boolean
  loginWithToken: (token: string) => void
  logout: () => void
}

const TOKEN_KEY = 'cms_token'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loadingUser, setLoadingUser] = useState<boolean>(false)

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    setLoadingUser(true)
    getMyProfile(token)
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoadingUser(false))
  }, [token])

  const loginWithToken = useCallback((nextToken: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    setToken(nextToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      loadingUser,
      loginWithToken,
      logout,
    }),
    [token, user, loadingUser, loginWithToken, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

