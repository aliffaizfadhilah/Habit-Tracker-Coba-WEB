import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from './AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setErrors(data.errors || { general: [data.message] }); return }
      navigate('/otp', { state: { email: form.email } })
    } catch {
      setErrors({ general: ['Terjadi kesalahan. Coba lagi.'] })
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
      setErrors({ general: ['Gagal menghubungi Google.'] })
    }
  }

  const fields = [
    { label: 'Nama Lengkap', name: 'full_name', type: 'text', placeholder: 'John Doe' },
    { label: 'Username', name: 'username', type: 'text', placeholder: 'johndoe' },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'email@contoh.com' },
  ]

  return (
    <AuthLayout title="Buat akun baru" subtitle="Mulai perjalanan habitmu hari ini, gratis">
      {errors.general && <div className="error-box" style={{ marginBottom: 20 }}>{errors.general[0]}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map(({ label, name, type, placeholder }) => (
          <div key={name}>
            <label className="label">{label}</label>
            <input
              className={`auth-input${errors[name] ? ' error' : ''}`}
              type={type} name={name}
              value={form[name as keyof typeof form]}
              onChange={handleChange} required placeholder={placeholder}
            />
            {errors[name] && <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 6 }}>{errors[name][0]}</p>}
          </div>
        ))}

        <div>
          <label className="label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className={`auth-input${errors.password ? ' error' : ''}`}
              type={showPass ? 'text' : 'password'} name="password"
              value={form.password} onChange={handleChange} required placeholder="Min. 8 karakter"
              style={{ paddingRight: 48 }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,240,245,0.4)', fontSize: 16, padding: 0, lineHeight: 1 }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 6 }}>{errors.password[0]}</p>}
        </div>

        <div>
          <label className="label">Konfirmasi Password</label>
          <input
            className={`auth-input${errors.password_confirmation ? ' error' : ''}`}
            type={showPass ? 'text' : 'password'} name="password_confirmation"
            value={form.password_confirmation} onChange={handleChange} required placeholder="Ulangi password"
          />
          {errors.password_confirmation && <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 6 }}>{errors.password_confirmation[0]}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? 'Mendaftarkan...' : 'Buat Akun →'}
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
        Daftar dengan Google
      </button>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'rgba(240,240,245,0.4)' }}>
        Sudah punya akun?{' '}
        <Link to="/login" className="auth-link">Masuk</Link>
      </p>
    </AuthLayout>
  )
}