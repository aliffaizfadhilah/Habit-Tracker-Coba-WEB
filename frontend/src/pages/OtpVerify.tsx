import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from './AuthLayout'

export default function OtpVerify() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as any)?.email || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) navigate('/login')
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otp.join('') }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message || 'Kode OTP salah.'); return }
      setSuccess('Email berhasil diverifikasi!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('OTP dikirim ulang ke email kamu.')
        setCountdown(60)
        setOtp(['', '', '', '', '', ''])
        inputs.current[0]?.focus()
      } else setError(data.message)
    } catch { setError('Gagal mengirim ulang OTP.') }
    finally { setResending(false) }
  }

  return (
    <AuthLayout
      title="Verifikasi Email"
      subtitle={<>Kode OTP dikirim ke <span style={{ color: '#a78bfa', fontWeight: 500 }}>{email}</span></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* OTP Input */}
          <div>
            <label className="label" style={{ textAlign: 'center', display: 'block', marginBottom: 16 }}>
              Masukkan 6 digit kode OTP
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`otp-input ${digit ? 'filled' : ''}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.join('').length < 6}
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi Email'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(240,240,245,0.45)' }}>
          {countdown > 0 ? (
            <span>Kirim ulang dalam <span style={{ color: '#a78bfa', fontWeight: 500 }}>{countdown}s</span></span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 500, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}
            >
              {resending ? 'Mengirim...' : 'Kirim ulang OTP'}
            </button>
          )}
        </div>

        {/* Back to login */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(240,240,245,0.45)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
          Salah email?{' '}
          <a onClick={() => navigate('/login')} className="auth-link" style={{ cursor: 'pointer' }}>
            Kembali ke Login
          </a>
        </div>
      </div>
    </AuthLayout>
  )
}
