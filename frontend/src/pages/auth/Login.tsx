
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input, Divider, GoogleIcon,  } from '../../factories/ComponentFactory'
import { tokens } from '../../factories/tokens'
import { useLogin } from '../../hooks/useLogin'

export default function Login() {
  const { form, error, loading, showPass, setShowPass, handleChange, handleSubmit, handleGoogle } = useLogin()

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
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: tokens.textMuted, fontSize: 16, padding: 0, lineHeight: 1,
              }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            }
          />

          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: tokens.primary, textDecoration: 'none', fontWeight: 500 }}>
              Lupa password?
            </Link>
          </div>

          <Button type="submit" variant="primary" loading={loading}>
            Masuk →
          </Button>
        </form>

        <Divider label="atau" />

        <Button variant="google" onClick={handleGoogle} type="button">
          <GoogleIcon />
          Lanjutkan dengan Google
        </Button>

        <p style={{ textAlign: 'center', fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
          Belum punya akun?{' '}
          <Link to="/register" style={{ color: tokens.primary, fontWeight: 600, textDecoration: 'none' }}>
            Daftar sekarang
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}