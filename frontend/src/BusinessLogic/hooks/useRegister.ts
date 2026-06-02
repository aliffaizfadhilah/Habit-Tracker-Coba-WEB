
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'
import { isDummyEmail, DUMMY_EMAIL_WARNING } from '../utils/emailValidation'
import type { RegisterForm } from '../types/Auth.types'

export function useRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({
    username: '', email: '', full_name: '', password: '', password_confirmation: '',
  })
  const [errors, setErrors]     = useState<Record<string, string[]>>({})
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [emailWarning, setEmailWarning] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'email') {
      setEmailWarning(value && isDummyEmail(value) ? DUMMY_EMAIL_WARNING : '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const data = await authService.register(form)
      if (!data.success) {
        console.error('[Register] Gagal:', data.message || 'Pendaftaran gagal.', data.errors)
        setErrors(data.errors || { general: [data.message || 'Pendaftaran gagal.'] })
        return
      }
      console.log('[Register] Berhasil:', form.email)
      navigate('/dashboard')
    } catch (err) {
      console.error('[Register] Error:', err)
      setErrors({ general: ['Terjadi kesalahan. Coba lagi.'] })
    } finally {
      setLoading(false)
    }
  }

  return { form, errors, loading, showPass, setShowPass, handleChange, handleSubmit, emailWarning }
}