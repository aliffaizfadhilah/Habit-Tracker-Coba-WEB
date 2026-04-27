import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'

type Step = 'email' | 'otp' | 'reset'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [passwords, setPasswords] = useState({ password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message || 'Email tidak ditemukan.'); return }
      setStep('otp')
      setCountdown(60)
      setSuccess('Kode OTP telah dikirim ke emailmu.')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otp.join('') }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message || 'Kode OTP salah.'); return }
      setStep('reset')
      setSuccess('')
      setError('')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) { setSuccess('OTP baru telah dikirim.'); setCountdown(60); setOtp(['','','','','','']); inputs.current[0]?.focus() }
      else setError(data.message)
    } catch { setError('Gagal mengirim ulang.') }
    finally { setLoading(false) }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.password !== passwords.password_confirmation) {
      setError('Password tidak cocok.'); return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otp.join(''), ...passwords }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message || 'Gagal reset password.'); return }
      setSuccess('Password berhasil diubah!')
      setTimeout(() => navigate('/login'), 1800)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const stepInfo = {
    email: { title: 'Lupa password?', subtitle: 'Masukkan emailmu dan kami kirimkan kode OTP' },
    otp:   { title: 'Verifikasi OTP', subtitle: `Kode 6 digit dikirim ke ${email}` },
    reset: { title: 'Password baru', subtitle: 'Buat password baru yang kuat untuk akunmu' },
  }

  return (
    <AuthLayout title={stepInfo[step].title} subtitle={stepInfo[step].subtitle}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {(['email', 'otp', 'reset'] as Step[]).map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, transition: 'all 0.3s',
              background: step === s ? '#7c5cfc' : (['email', 'otp', 'reset'].indexOf(step) > i ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.06)'),
              color: step === s ? '#fff' : (['email', 'otp', 'reset'].indexOf(step) > i ? '#a78bfa' : 'rgba(240,240,245,0.3)'),
              border: step === s ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}>{['email', 'otp', 'reset'].indexOf(step) > i ? '✓' : i + 1}</div>
            {i < 2 && <div style={{ width: 32, height: 1, background: ['email', 'otp', 'reset'].indexOf(step) > i ? 'rgba(124,92,252,0.5)' : 'rgba(255,255,255,0.08)' }} />}
          </div>
        ))}
      </div>

      {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}
      {success && <div className="success-box" style={{ marginBottom: 20 }}>{success}</div>}

      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Alamat Email</label>
            <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="email@contoh.com" autoFocus />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Mengirim...' : 'Kirim Kode OTP →'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(240,240,245,0.4)', marginTop: 4 }}>
            Ingat passwordmu?{' '}
            <Link to="/login" className="auth-link">Masuk</Link>
          </p>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {otp.map((digit, i) => (
              <input key={i} ref={el => { inputs.current[i] = el }}
                className={`otp-input${digit ? ' filled' : ''}`}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || otp.join('').length < 6}>
            {loading ? 'Memverifikasi...' : 'Verifikasi Kode →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(240,240,245,0.4)' }}>
            {countdown > 0
              ? <>Kirim ulang dalam <span style={{ color: '#a78bfa', fontWeight: 500 }}>{countdown}s</span></>
              : <button type="button" onClick={handleResend} disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#a78bfa', fontWeight: 500, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
                  Kirim ulang OTP
                </button>
            }
          </p>

          <button type="button" onClick={() => { setStep('email'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: 'rgba(240,240,245,0.4)', cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            ← Ganti email
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Password Baru</label>
            <div style={{ position: 'relative' }}>
              <input className="auth-input" type={showPass ? 'text' : 'password'}
                value={passwords.password} onChange={e => setPasswords({ ...passwords, password: e.target.value })}
                required placeholder="Min. 8 karakter" style={{ paddingRight: 48 }} autoFocus
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,245,0.4)', fontSize: 16, padding: 0, lineHeight: 1 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <input className="auth-input" type={showPass ? 'text' : 'password'}
              value={passwords.password_confirmation}
              onChange={e => setPasswords({ ...passwords, password_confirmation: e.target.value })}
              required placeholder="Ulangi password baru"
            />
          </div>

          {/* Password strength */}
          {passwords.password && (
            <div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {[1,2,3,4].map(n => {
                  const len = passwords.password.length
                  const hasUpper = /[A-Z]/.test(passwords.password)
                  const hasNum = /\d/.test(passwords.password)
                  const hasSpecial = /[^a-zA-Z0-9]/.test(passwords.password)
                  const strength = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0)
                  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
                  return <div key={n} style={{ flex: 1, height: 4, borderRadius: 100, background: n <= strength ? colors[strength - 1] : 'rgba(255,255,255,0.08)', transition: 'all 0.3s' }} />
                })}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>
                {(() => {
                  const len = passwords.password.length
                  const s = (len >= 8 ? 1 : 0) + (/[A-Z]/.test(passwords.password) ? 1 : 0) + (/\d/.test(passwords.password) ? 1 : 0) + (/[^a-zA-Z0-9]/.test(passwords.password) ? 1 : 0)
                  return ['Terlalu lemah', 'Lemah', 'Cukup kuat', 'Kuat', 'Sangat kuat'][s]
                })()}
              </p>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Menyimpan...' : 'Simpan Password Baru →'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}