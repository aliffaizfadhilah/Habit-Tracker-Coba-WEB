// ─── useLogin — Custom Hook ────────────────────────────────────────────────────
// Lokasi  : frontend/src/hooks/auth/useLogin.ts
// Perubahan:
//  - Hapus handleGoogle() (Google OAuth dihapus)
//  - Hapus requires_otp check (OTP tidak ada di alur login)
//  - Login sukses → langsung /dashboard

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'
import type { LoginForm } from '../types/Auth.types'

export function useLogin() {
  const navigate = useNavigate()
  const [form, setForm]       = useState<LoginForm>({ email: '', password: '' })
  const [error, setError]     = useState('')
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
      if (!data.success) {
        setError(data.message || 'Email atau password salah.')
        return
      }
      navigate('/dashboard')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return { form, error, loading, showPass, setShowPass, handleChange, handleSubmit }
}