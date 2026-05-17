import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input } from '../../../BusinessLogic/factories/ComponentFactory'
import { useLogin } from '../../../BusinessLogic/hooks/useLogin'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { form, error, loading, showPass, setShowPass, handleChange, handleSubmit } = useLogin()

  return (
    <AuthLayout title="Selamat datang kembali" subtitle="Masuk untuk melanjutkan perjalanan habitmu">
      <div className="flex flex-col gap-5">
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@contoh.com" autoFocus />

          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            rightElement={
              <button type="button" onClick={() => setShowPass(!showPass)} className="bg-transparent border-none cursor-pointer text-muted p-0 leading-none">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <div className="text-right -mt-1.5">
            <Link to="/forgot-password" className="text-[13px] text-primary no-underline font-medium">
              Lupa password?
            </Link>
          </div>

          <Button type="submit" variant="primary" loading={loading}>Masuk →</Button>
        </form>

        <p className="text-center text-[13px] text-muted font-body">
          Belum punya akun?{' '}
          <Link to="/register" className="text-primary font-semibold no-underline">Daftar sekarang</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
