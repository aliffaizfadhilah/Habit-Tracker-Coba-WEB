
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'
import { ForgotPasswordFormBuilder } from '../builders/ForgotPasswordFormBuilder'
import type { ForgotPasswordStep } from '../types/Auth.types'

export function useForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep]         = useState<ForgotPasswordStep>('email')
  const [email, setEmail]       = useState('')
  const [digits, setDigits]     = useState<string[]>(Array(6).fill(''))
  const [passwords, setPasswords] = useState({ password: '', password_confirmation: '' })
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendOtp = async (emailVal: string) => {
    setError(''); setLoading(true)
    try {
      const data = await authService.forgotPassword(emailVal)
      if (!data.success) { setError(data.message || 'Email tidak ditemukan.'); return }
      setEmail(emailVal)
      setStep('otp')
      setCountdown(60)
      setSuccess('Kode OTP telah dikirim ke emailmu.')
    } catch { setError('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }

  const handleVerifyOtp = async (otp: string) => {
    setError(''); setLoading(true)
    try {
      const data = await authService.verifyForgotOtp(email, otp)
      if (!data.success) { setError(data.message || 'Kode OTP salah atau kadaluarsa.'); return }
      setStep('reset'); setSuccess(''); setError('')
    } catch { setError('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    setError(''); setLoading(true)
    try {
      const data = await authService.forgotPassword(email)
      if (data.success) {
        setSuccess('OTP baru telah dikirim ke emailmu.')
        setCountdown(60)
        setDigits(Array(6).fill(''))
      } else { setError(data.message || 'Gagal mengirim ulang.') }
    } catch { setError('Gagal mengirim ulang.') }
    finally { setLoading(false) }
  }

  const handleResetPassword = async (password: string, confirmation: string) => {
    if (password !== confirmation) { setError('Password tidak cocok.'); return }
    setError(''); setLoading(true)
    try {
      const data = await authService.resetPassword(
        email, digits.join(''), password, confirmation
      )
      if (!data.success) { setError(data.message || 'Gagal reset password.'); return }
      setSuccess('Password berhasil diubah!')
      setTimeout(() => navigate('/login'), 1800)
    } catch { setError('Terjadi kesalahan. Coba lagi.') }
    finally { setLoading(false) }
  }

  const formConfig = new ForgotPasswordFormBuilder()
    .addEmailStep(handleSendOtp)
    .addOtpStep(email, handleVerifyOtp, handleResend)
    .addResetStep(handleResetPassword)
    .setCurrentStep(step)
    .build()

  return {
    step, setStep, email, digits, setDigits,
    passwords, setPasswords,
    error, success, loading, countdown,
    showPass, setShowPass,
    formConfig,
  }
}