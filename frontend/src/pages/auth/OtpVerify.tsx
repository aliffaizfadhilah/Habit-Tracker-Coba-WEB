
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button } from '../../factories/ComponentFactory'
import { tokens } from '../../factories/tokens'
import { OtpInputGroup } from '../../components/auth/OtpInputGroup'
import { useOtp } from '../../hooks/useOtp'

export default function OtpVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email || ''
  const { digits, setDigits, error, success, loading, resending, countdown, handleSubmit, handleResend } = useOtp(email)

  return (
    <AuthLayout
      title="Verifikasi Email"
      subtitle={<>Kode OTP dikirim ke <strong style={{ color: tokens.primary }}>{email}</strong></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {error   && <Alert type="error"   message={error} />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <p style={{ fontSize: 13, color: tokens.textMuted, textAlign: 'center', marginBottom: 16, fontFamily: tokens.fontBody }}>
              Masukkan 6 digit kode OTP
            </p>
            <OtpInputGroup value={digits} onChange={setDigits} />
          </div>

          <Button type="submit" variant="primary" loading={loading} disabled={digits.join('').length < 6}>
            Verifikasi Email ✓
          </Button>
        </form>

        {/* Resend */}
        <div style={{ textAlign: 'center', fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
          {countdown > 0 ? (
            <span>Kirim ulang dalam <strong style={{ color: tokens.primary }}>{countdown}s</strong></span>
          ) : (
            <button onClick={handleResend} disabled={resending} style={{
              background: 'none', border: 'none', color: tokens.primary, fontWeight: 600,
              cursor: 'pointer', fontSize: 13, fontFamily: tokens.fontBody,
            }}>
              {resending ? 'Mengirim...' : 'Kirim ulang OTP'}
            </button>
          )}
        </div>

        {/* Back */}
        <div style={{
          textAlign: 'center', fontSize: 13, color: tokens.textMuted,
          borderTop: `1px solid ${tokens.border}`, paddingTop: 20, fontFamily: tokens.fontBody,
        }}>
          Salah email?{' '}
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', color: tokens.primary,
            fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: tokens.fontBody,
          }}>
            Kembali ke Login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}