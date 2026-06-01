import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { http } from '../services/HttpService'

export interface AuthUser {
  username:    string
  email:       string
  full_name?:  string
  is_verified: boolean
}

export interface AuthState {
  user:       AuthUser | null
  loading:    boolean
  isLoggedIn: boolean
}

interface AuthContextValue extends AuthState {
  logout:  () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:       null,
    loading:    true,
    isLoggedIn: false,
  })

  const fetchMe = useCallback(async () => {
    try {
      const data = await http.get<{ success: boolean; user: AuthUser }>('/api/me')
      if (data.success && data.user) {
        setState({ user: data.user, loading: false, isLoggedIn: true })
      } else {
        setState({ user: null, loading: false, isLoggedIn: false })
      }
    } catch {
      setState({ user: null, loading: false, isLoggedIn: false })
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const logout = async () => {
    await http.post('/api/auth/logout', {})
    setState({ user: null, loading: false, isLoggedIn: false })
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ ...state, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
