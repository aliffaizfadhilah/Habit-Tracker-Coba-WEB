import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input } from '../../../BusinessLogic/factories/ComponentFactory'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { useRegister } from '../../../BusinessLogic/hooks/useRegister'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { form, errors, loading, showPass, setShowPass, handleChange, handleSubmit, emailWarning } = useRegister()

  return (
    <AuthLayout title="Buat akun baru" subtitle="Mulai perjalanan habitmu hari ini, gratis">
      <div className="flex flex-col gap-5">
        {errors.general && <Alert type="error" message={errors.general[0]} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input label="Nama Lengkap" type="text"  name="full_name" value={form.full_name} onChange={handleChange} required placeholder="John Doe"           error={errors.full_name?.[0]} />
          <Input label="Username"     type="text"  name="username"  value={form.username}  onChange={handleChange} required placeholder="johndoe"             error={errors.username?.[0]} />
          <div>
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="email@contoh.com" error={errors.email?.[0]} />
            {emailWarning && (
              <div className="mt-1.5 flex items-start gap-1.5 text-[12px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-[8px] px-2.5 py-2">
                <span className="shrink-0 mt-[1px]">⚠️</span>
                <span>{emailWarning}</span>
              </div>
            )}
          </div>

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
                <button type="button" onClick={() => setShowPass(!showPass)} className="bg-transparent border-none cursor-pointer text-muted p-0 leading-none">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <div className="mt-2"><PasswordStrengthBar password={form.password} /></div>
          </div>

          <Input label="Konfirmasi Password" type={showPass ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required placeholder="Ulangi password" error={errors.password_confirmation?.[0]} />

          <Button type="submit" variant="primary" loading={loading} style={{ marginTop: 4 }}>Buat Akun →</Button>
        </form>

        <p className="text-center text-[13px] text-muted font-body">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary font-semibold no-underline">Masuk</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
