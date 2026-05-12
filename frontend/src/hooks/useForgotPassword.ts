import { useState, useEffect } from 'react'
import { ForgotPasswordFormBuilder } from '../builders/ForgotPasswordFormBuilder'
import type { ForgotPasswordStep } from '../types/auth.types'
import type { PasswordFormConfig } from '../builders/ForgotPasswordFormBuilder'
import { http } from '../services/HttpService'

export const useForgotPassword = () => {
  const [step, setStep]           = useState<ForgotPasswordStep>('email')
  const [email, setEmail]         = useState('')
  const [digits, setDigits]       = useState<string[]>(Array(6).fill(''))
  const [passwords, setPasswords] = useState({ password: '', password_confirmation: '' })
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPass, setShowPass]   = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendEmail = async (inputEmail: string) => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await http.post('/api/forgot-password', { email: inputEmail })
      setEmail(inputEmail)
      setSuccess('Kode OTP telah dikirim ke email kamu')
      setCountdown(60)
      setStep('otp')
    } catch {
      setError('Gagal mengirim OTP. Periksa email kamu.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await http.post('/api/verify-otp', { email, otp })
      setSuccess('OTP berhasil diverifikasi')
      setStep('reset')
    } catch {
      setError('Kode OTP salah atau sudah kadaluarsa.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await http.post('/api/forgot-password', { email })
      setSuccess('Kode OTP baru telah dikirim')
      setCountdown(60)
      setDigits(Array(6).fill(''))
    } catch {
      setError('Gagal mengirim ulang OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (password: string, password_confirmation: string) => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await http.post('/api/reset-password', { email, password, password_confirmation })
      setSuccess('Password berhasil diubah! Silakan login.')
    } catch {
      setError('Gagal mengubah password. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const formConfig: PasswordFormConfig = new ForgotPasswordFormBuilder()
    .setMode('forgot')
    .addEmailStep(handleSendEmail)
    .addOtpStep(email, handleVerifyOtp, handleResendOtp)
    .addResetStep(handleResetPassword)
    .setCurrentStep(step)
    .build()

  return {
    step, setStep,
    email, setEmail,
    digits, setDigits,
    passwords, setPasswords,
    error, success, loading,
    countdown,
    showPass, setShowPass,
    formConfig,
  }
}