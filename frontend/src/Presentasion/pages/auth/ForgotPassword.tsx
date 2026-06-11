import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input } from '../../../BusinessLogic/factories/ComponentFactory'
import { isDummyEmail, DUMMY_EMAIL_WARNING } from '../../../BusinessLogic/utils/emailValidation'
import { OtpInputGroup } from '../../components/auth/OtpInputGroup'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { useForgotPassword } from '../../../BusinessLogic/hooks/useForgotPassword'
import { Eye, EyeOff, Check, Mail } from 'lucide-react'
import type { ForgotPasswordStep } from '../../../BusinessLogic/types/Auth.types'
import type {
  EmailStepConfig, OtpStepConfig, ResetStepConfig,
} from '../../../BusinessLogic/builders/ForgotPasswordFormBuilder'

const STEPS: ForgotPasswordStep[] = ['email', 'otp', 'reset']

export default function ForgotPassword() {
  const {
    step, setStep, digits, setDigits, passwords, setPasswords,
    error, success, loading, countdown, showPass, setShowPass, formConfig,
  } = useForgotPassword()

  const [localEmail, setLocalEmail] = useState('')
  const emailWarning = localEmail && isDummyEmail(localEmail) ? DUMMY_EMAIL_WARNING : ''

  const emailStep = formConfig.steps.find((s: EmailStepConfig | OtpStepConfig | ResetStepConfig) => s.id === 'email') as EmailStepConfig | undefined
  const otpStep   = formConfig.steps.find((s: EmailStepConfig | OtpStepConfig | ResetStepConfig) => s.id === 'otp')   as OtpStepConfig   | undefined
  const resetStep = formConfig.steps.find((s: EmailStepConfig | OtpStepConfig | ResetStepConfig) => s.id === 'reset') as ResetStepConfig  | undefined

  const currentStepIndex = STEPS.indexOf(step)

  return (
    <AuthLayout title={formConfig.titles[step]} subtitle={formConfig.subtitles[step]}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-7">
        {STEPS.map((s, i) => {
          const done   = currentStepIndex > i
          const active = step === s
          return (
            <React.Fragment key={s}>
              <div
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 font-body border-2"
                style={{
                  background: active ? '#16a34a' : done ? '#dcfce7' : '#f7faf8',
                  color: active ? '#fff' : done ? '#16a34a' : '#86a98d',
                  borderColor: active || done ? '#16a34a' : '#d1fae5',
                }}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              {i < 2 && (
                <div
                  className="w-9 h-0.5 rounded-sm transition-all duration-300"
                  style={{ background: done ? '#16a34a' : '#d1fae5' }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      <div className={error || success ? 'mt-5' : ''}>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={e => { e.preventDefault(); emailStep?.onSubmit(localEmail) }} className="flex flex-col gap-4">
            <div>
              <Input label="Alamat Email" type="email" value={localEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalEmail(e.target.value)} required placeholder="email@contoh.com" autoFocus />
              {emailWarning && (
                <div className="mt-1.5 flex items-start gap-1.5 text-[12px] text-[#b45309] bg-[#fffbeb] border border-[#fde68a] rounded-[8px] px-2.5 py-2">
                  <span className="shrink-0 mt-[1px]">⚠️</span>
                  <span>{emailWarning}</span>
                </div>
              )}
            </div>
            <Button type="submit" variant="primary" loading={loading}>Kirim Kode OTP →</Button>
            <p className="text-center text-[13px] text-muted font-body">
              Ingat passwordmu?{' '}
              <Link to="/login" className="text-primary font-semibold no-underline">Masuk</Link>
            </p>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={e => { e.preventDefault(); otpStep?.onSubmit(digits.join('')) }} className="flex flex-col gap-5">
            <div className="bg-primary-light border border-border rounded-sm px-3.5 py-2.5 text-[13px] text-primary font-body flex items-center gap-2">
              <Mail size={14} />
              Kode OTP dikirim ke email{' '}
              <strong>{formConfig.subtitles.otp.replace('Kode 6 digit dikirim ke ', '')}</strong>
            </div>

            <OtpInputGroup value={digits} onChange={setDigits} />

            <Button type="submit" variant="primary" loading={loading} disabled={digits.join('').length < 6}>
              Verifikasi Kode →
            </Button>

            <div className="text-center text-[13px] text-muted font-body">
              {countdown > 0 ? (
                <span>Kirim ulang dalam <strong className="text-primary">{countdown}s</strong></span>
              ) : (
                <button type="button" onClick={otpStep?.onResend} disabled={loading} className="bg-transparent border-none text-primary font-semibold cursor-pointer text-[13px] font-body">
                  Kirim ulang OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="bg-transparent border-none text-muted cursor-pointer text-[13px] font-body text-center transition-colors hover:text-primary"
            >
              ← Ganti email
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <form onSubmit={e => { e.preventDefault(); resetStep?.onSubmit(passwords.password, passwords.password_confirmation) }} className="flex flex-col gap-4">
            <div>
              <Input
                label="Password Baru"
                type={showPass ? 'text' : 'password'}
                value={passwords.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswords((p: { password: string; password_confirmation: string }) => ({ ...p, password: e.target.value }))}
                required
                placeholder="Min. 8 karakter"
                autoFocus
                rightElement={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="bg-transparent border-none cursor-pointer text-muted p-0 leading-none">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <div className="mt-2"><PasswordStrengthBar password={passwords.password} /></div>
            </div>

            <Input
              label="Konfirmasi Password Baru"
              type={showPass ? 'text' : 'password'}
              value={passwords.password_confirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswords((p: { password: string; password_confirmation: string }) => ({ ...p, password_confirmation: e.target.value }))}
              required
              placeholder="Ulangi password baru"
            />

            <Button type="submit" variant="primary" loading={loading} style={{ marginTop: 4 }}>
              Simpan Password Baru →
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
