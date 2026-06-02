
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
      if (!data.success) {
        console.error('[ForgotPassword] Gagal kirim OTP:', data.message)
        setError(data.message || 'Email tidak ditemukan.')
        return
      }
      console.log('[ForgotPassword] OTP berhasil dikirim ke:', emailVal)
      setEmail(emailVal)
      setStep('otp')
      setCountdown(60)
      setSuccess('Kode OTP telah dikirim ke emailmu.')
    } catch (err) {
      console.error('[ForgotPassword] Error kirim OTP:', err)
      setError('Terjadi kesalahan. Coba lagi.')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (otp: string) => {
    setError(''); setLoading(true)
    try {
      const data = await authService.verifyForgotOtp(email, otp)
      if (!data.success) {
        console.error('[ForgotPassword] OTP tidak valid:', data.message)
        setError(data.message || 'Kode OTP salah atau kadaluarsa.')
        return
      }
      console.log('[ForgotPassword] OTP berhasil diverifikasi.')
      setStep('reset'); setSuccess(''); setError('')
    } catch (err) {
      console.error('[ForgotPassword] Error verifikasi OTP:', err)
      setError('Terjadi kesalahan. Coba lagi.')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setError(''); setLoading(true)
    try {
      const data = await authService.forgotPassword(email)
      if (data.success) {
        console.log('[ForgotPassword] OTP baru berhasil dikirim ulang ke:', email)
        setSuccess('OTP baru telah dikirim ke emailmu.')
        setCountdown(60)
        setDigits(Array(6).fill(''))
      } else {
        console.error('[ForgotPassword] Gagal kirim ulang OTP:', data.message)
        setError(data.message || 'Gagal mengirim ulang.')
      }
    } catch (err) {
      console.error('[ForgotPassword] Error kirim ulang OTP:', err)
      setError('Gagal mengirim ulang.')
    } finally { setLoading(false) }
  }

  const handleResetPassword = async (password: string, confirmation: string) => {
    if (password !== confirmation) { setError('Password tidak cocok.'); return }
    setError(''); setLoading(true)
    try {
      const data = await authService.resetPassword(
        email, digits.join(''), password, confirmation
      )
      if (!data.success) {
        console.error('[ForgotPassword] Gagal reset password:', data.message)
        setError(data.message || 'Gagal reset password.')
        return
      }
      console.log('[ForgotPassword] Password berhasil direset untuk:', email)
      setSuccess('Password berhasil diubah!')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      console.error('[ForgotPassword] Error reset password:', err)
      setError('Terjadi kesalahan. Coba lagi.')
    } finally { setLoading(false) }
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