import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { apiMe, type AuthUser } from '../lib/auth'

interface AuthValue {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  setUser: (u: AuthUser | null) => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setUser(await apiMe())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return <AuthContext.Provider value={{ user, loading, refresh, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}
