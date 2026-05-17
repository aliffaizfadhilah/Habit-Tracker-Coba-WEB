import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button } from '../../../BusinessLogic/factories/ComponentFactory'
import { OtpInputGroup } from '../../components/auth/OtpInputGroup'
import { useOtp } from '../../../BusinessLogic/hooks/UseOtp'

export default function OtpVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email || ''
  const { digits, setDigits, error, success, loading, resending, countdown, handleSubmit, handleResend } = useOtp(email)

  return (
    <AuthLayout
      title="Verifikasi Email"
      subtitle={<>Kode OTP dikirim ke <strong className="text-primary">{email}</strong></>}
    >
      <div className="flex flex-col gap-6">
        {error   && <Alert type="error"   message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <p className="text-[13px] text-muted text-center mb-4 font-body">Masukkan 6 digit kode OTP</p>
            <OtpInputGroup value={digits} onChange={setDigits} />
          </div>
          <Button type="submit" variant="primary" loading={loading} disabled={digits.join('').length < 6}>
            Verifikasi Email ✓
          </Button>
        </form>

        <div className="text-center text-[13px] text-muted font-body">
          {countdown > 0 ? (
            <span>Kirim ulang dalam <strong className="text-primary">{countdown}s</strong></span>
          ) : (
            <button onClick={handleResend} disabled={resending} className="bg-transparent border-none text-primary font-semibold cursor-pointer text-[13px] font-body">
              {resending ? 'Mengirim...' : 'Kirim ulang OTP'}
            </button>
          )}
        </div>

        <div className="text-center text-[13px] text-muted border-t border-border pt-5 font-body">
          Salah email?{' '}
          <button onClick={() => navigate('/login')} className="bg-transparent border-none text-primary font-semibold cursor-pointer text-[13px] font-body">
            Kembali ke Login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
