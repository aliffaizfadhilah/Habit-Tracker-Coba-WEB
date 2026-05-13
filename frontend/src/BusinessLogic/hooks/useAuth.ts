
import { useState, useEffect } from 'react'
import { http } from '../services/HttpService'

export interface AuthUser {
  username:   string
  email:      string
  full_name?: string
  is_verified: boolean
}

export interface AuthState {
  user:    AuthUser | null
  loading: boolean
  isLoggedIn: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user:       null,
    loading:    true,
    isLoggedIn: false,
  })

  useEffect(() => {
    http.get<{ success: boolean; user: AuthUser }>('/api/me')
      .then(data => {
        if (data.success && data.user) {
          setState({ user: data.user, loading: false, isLoggedIn: true })
        } else {
          setState({ user: null, loading: false, isLoggedIn: false })
        }
      })
      .catch(() => {
        setState({ user: null, loading: false, isLoggedIn: false })
      })
  }, [])

  const logout = async () => {
    await http.post('/api/auth/logout', {})
    setState({ user: null, loading: false, isLoggedIn: false })
    window.location.href = '/login'
  }

  return { ...state, logout }
}