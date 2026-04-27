import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
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
      const res = await fetch('/api/auth/google', { credentials: 'include' })
      const data = await res.json()
      window.location.href = data.url
    } catch {
      setError('Gagal menghubungi Google.')
    }
  }

  return (
    <AuthLayout title="Selamat datang kembali" subtitle="Masuk untuk melanjutkan perjalanan habitmu">
      {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Email</label>
          <input
            className="auth-input"
            type="email" name="email" value={form.email}
            onChange={handleChange} required placeholder="email@contoh.com"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="label" style={{ margin: 0 }}>Password</label>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: 13 }}>Lupa password?</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className="auth-input"
              type={showPass ? 'text' : 'password'} name="password" value={form.password}
              onChange={handleChange} required placeholder="••••••••"
              style={{ paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,245,0.4)', fontSize: 16, padding: 0, lineHeight: 1 }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Memproses...' : 'Masuk →'}
        </button>
      </form>

      <div className="divider" style={{ margin: '24px 0', fontSize: 13, color: 'rgba(240,240,245,0.35)' }}>atau</div>

      <button className="btn-google" onClick={handleGoogle}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Lanjutkan dengan Google
      </button>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(240,240,245,0.4)' }}>
        Belum punya akun?{' '}
        <Link to="/register" className="auth-link">Daftar sekarang</Link>
      </p>
    </AuthLayout>
  )
}