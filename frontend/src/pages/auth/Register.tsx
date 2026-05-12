
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input, Divider, GoogleIcon } from '../../factories/ComponentFactory'
import { tokens } from '../../factories/tokens'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { useRegister } from '../../hooks/useRegister'

export default function Register() {
  const { form, errors, loading, showPass, setShowPass, handleChange, handleSubmit, handleGoogle } = useRegister()

  const fields = [
    { label: 'Nama Lengkap', name: 'full_name', type: 'text', placeholder: 'John Doe' },
    { label: 'Username',     name: 'username',  type: 'text', placeholder: 'johndoe' },
    { label: 'Email',        name: 'email',     type: 'email', placeholder: 'email@contoh.com' },
  ] as const

  return (
    <AuthLayout title="Buat akun baru" subtitle="Mulai perjalanan habitmu hari ini, gratis">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {errors.general && <Alert type="error" message={errors.general[0]} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(({ label, name, type, placeholder }) => (
            <Input
              key={name}
              label={label}
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              placeholder={placeholder}
              error={errors[name]?.[0]}
            />
          ))}

          <div>
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Min. 8 karakter"
              error={errors.password?.[0]}
              rightElement={
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: tokens.textMuted, fontSize: 16, padding: 0, lineHeight: 1,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              }
            />
            <div style={{ marginTop: 8 }}>
              <PasswordStrengthBar password={form.password} />
            </div>
          </div>

          <Input
            label="Konfirmasi Password"
            type={showPass ? 'text' : 'password'}
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            required
            placeholder="Ulangi password"
            error={errors.password_confirmation?.[0]}
          />

          <Button type="submit" variant="primary" loading={loading} style={{ marginTop: 4 }}>
            Buat Akun →
          </Button>
        </form>

        <Divider label="atau" />

        <Button variant="google" onClick={handleGoogle} type="button">
          <GoogleIcon />
          Daftar dengan Google
        </Button>

        <p style={{ textAlign: 'center', fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: tokens.primary, fontWeight: 600, textDecoration: 'none' }}>
            Masuk
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}