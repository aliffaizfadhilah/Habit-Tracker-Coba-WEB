// ─── Login Page ────────────────────────────────────────────────────────────────
// Lokasi  : frontend/src/pages/auth/Login.tsx
// Perubahan:
//  - Hapus Google login button & Divider (Google OAuth dihapus)
//  - UI disesuaikan green theme via tokens

import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input } from '../../../BusinessLogic/factories/ComponentFactory'
import { tokens } from '../../../BusinessLogic/factories/tokens'
import { useLogin } from '../../../BusinessLogic/hooks/useLogin'

export default function Login() {
  const {
    form, error, loading, showPass, setShowPass, handleChange, handleSubmit,
  } = useLogin()

  return (
    <AuthLayout
      title="Selamat datang kembali"
      subtitle="Masuk untuk melanjutkan perjalanan habitmu"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="email@contoh.com"
            autoFocus
          />

          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tokens.textMuted, fontSize: '16px', padding: 0, lineHeight: 1,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            }
          />

          <div style={{ textAlign: 'right', marginTop: -6 }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '13px', color: tokens.primary,
                textDecoration: 'none', fontWeight: 500,
              }}
            >
              Lupa password?
            </Link>
          </div>

          <Button type="submit" variant="primary" loading={loading}>
            Masuk →
          </Button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: '13px',
          color: tokens.textMuted, fontFamily: tokens.fontBody,
        }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: tokens.primary, fontWeight: 600, textDecoration: 'none' }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}