
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'
import { useAuth } from '../context/AuthContext'
import type { LoginForm } from '../types/Auth.types'

export function useLogin() {
  const navigate = useNavigate()
  const { refetch, isLoggedIn, loading: authLoading } = useAuth()
  const [form, setForm]       = useState<LoginForm>({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, authLoading, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login(form) 
      if (!data.success) {
        setError(data.message || 'Email atau password salah.')
        return
      }
      await refetch()
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return { form, error, loading, showPass, setShowPass, handleChange, handleSubmit }
}