import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input } from '../../../BusinessLogic/factories/ComponentFactory'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { useRegister } from '../../../BusinessLogic/hooks/useRegister'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { form, errors, loading, showPass, setShowPass, handleChange, handleSubmit } = useRegister()

  const fields = [
    { label: 'Nama Lengkap', name: 'full_name', type: 'text',  placeholder: 'John Doe' },
    { label: 'Username',     name: 'username',  type: 'text',  placeholder: 'johndoe' },
    { label: 'Email',        name: 'email',     type: 'email', placeholder: 'email@contoh.com' },
  ] as const

  return (
    <AuthLayout title="Buat akun baru" subtitle="Mulai perjalanan habitmu hari ini, gratis">
      <div className="flex flex-col gap-5">
        {errors.general && <Alert type="error" message={errors.general[0]} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {fields.map(({ label, name, type, placeholder }) => (
            <Input key={name} label={label} type={type} name={name} value={form[name]} onChange={handleChange} required placeholder={placeholder} error={errors[name]?.[0]} />
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
