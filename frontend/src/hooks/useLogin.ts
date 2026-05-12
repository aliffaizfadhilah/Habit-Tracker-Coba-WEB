
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'
import type { LoginForm } from '../types/auth.types'

export function useLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.login(form)
      if (data.requires_otp) {
        navigate('/otp', { state: { email: data.email } })
        return
      }
      if (!data.success) { setError(data.message || 'Login gagal.'); return }
      navigate('/dashboard')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const data = await authService.getGoogleUrl()
      window.location.href = data.url
    } catch {
      setError('Gagal menghubungi Google.')
    }
  }

  return { form, error, loading, showPass, setShowPass, handleChange, handleSubmit, handleGoogle }
}