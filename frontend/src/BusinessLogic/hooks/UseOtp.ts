// ─── useOtp — Custom Hook ──────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/AuthService'

export function useOtp(email: string) {
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

useEffect(() => {
  if (!email) navigate('/login')
}, [email, navigate])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authService.verifyOtp(email, digits.join(''))
      if (!data.success) { setError(data.message || 'Kode OTP salah.'); return }
      setSuccess('Email berhasil diverifikasi!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('')
    try {
      const data = await authService.resendOtp(email)
      if (data.success) {
        setSuccess('OTP dikirim ulang ke emailmu.')
        setCountdown(60)
        setDigits(Array(6).fill(''))
      } else {
        setError(data.message || 'Gagal mengirim ulang.')
      }
    } catch {
      setError('Gagal mengirim ulang OTP.')
    } finally {
      setResending(false)
    }
  }

  return { digits, setDigits, error, success, loading, resending, countdown, handleSubmit, handleResend }
}