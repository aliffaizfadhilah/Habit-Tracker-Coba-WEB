
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'
import type { RegisterForm } from '../types/auth.types'

export function useRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({
    username: '', email: '', full_name: '', password: '', password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const data = await authService.register(form)
      if (!data.success) { setErrors(data.errors || { general: [data.message || 'Pendaftaran gagal.'] }); return }
      navigate('/otp', { state: { email: form.email } })
    } catch {
      setErrors({ general: ['Terjadi kesalahan. Coba lagi.'] })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const data = await authService.getGoogleUrl()
      window.location.href = data.url
    } catch {
      setErrors({ general: ['Gagal menghubungi Google.'] })
    }
  }

  return { form, errors, loading, showPass, setShowPass, handleChange, handleSubmit, handleGoogle }
}