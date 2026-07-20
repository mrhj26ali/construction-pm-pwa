import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { loginRequest, getLoggedUser, logoutRequest } from './api'
import type { User } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getLoggedUser().then(setUser).catch(() => setUser(null)).finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    await loginRequest({ usr: email, pwd: password })
    setUser(await getLoggedUser())
  }

  async function logout() {
    await logoutRequest()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}