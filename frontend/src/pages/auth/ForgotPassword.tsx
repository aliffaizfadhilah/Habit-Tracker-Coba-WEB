
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import AuthLayout from '../../components/auth/AuthLayout'
import { Alert, Button, Input } from '../../factories/ComponentFactory'
import { tokens } from '../../factories/tokens'
import { OtpInputGroup } from '../../components/auth/OtpInputGroup'
import { PasswordStrengthBar } from '../../components/auth/PasswordStrengthBar'
import { useForgotPassword } from '../../hooks/useForgotPassword'
import type { ForgotPasswordStep } from '../../types/auth.types'
import type { EmailStepConfig, OtpStepConfig, ResetStepConfig, AnyStepConfig } from '../../builders/ForgotPasswordFormBuilder'

const STEPS: ForgotPasswordStep[] = ['email', 'otp', 'reset']

export default function ForgotPassword() {
  const {
    step, setStep, digits, setDigits, passwords, setPasswords,
    error, success, loading, countdown, showPass, setShowPass, formConfig,
  } = useForgotPassword()

const [localEmail, setLocalEmail] = useState('')
const emailStep = formConfig.steps.find((s: AnyStepConfig) => s.id === 'email') as EmailStepConfig | undefined
const otpStep   = formConfig.steps.find((s: AnyStepConfig) => s.id === 'otp')   as OtpStepConfig   | undefined
const resetStep = formConfig.steps.find((s: AnyStepConfig) => s.id === 'reset') as ResetStepConfig  | undefined

const currentStepIndex = STEPS.indexOf(step)

  return (
    <AuthLayout
      title={formConfig.titles[step]}
      subtitle={formConfig.subtitles[step]}
    >
      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {STEPS.map((s, i) => {
          const done    = currentStepIndex > i
          const active  = step === s
          return (
            <React.Fragment key={s}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 12,
                fontWeight: 700, transition: 'all 0.3s', fontFamily: tokens.fontBody,
                background: active ? tokens.primary : done ? tokens.primaryLight : tokens.bg,
                color: active ? '#fff' : done ? tokens.primary : tokens.textLight,
                border: `2px solid ${active ? tokens.primary : done ? tokens.primary : tokens.border}`,
              }}>
                {done ? '✓' : i + 1}
              </div>
              {i < 2 && <div style={{ width: 36, height: 2, borderRadius: 2, background: done ? tokens.primary : tokens.border, transition: 'all 0.3s' }} />}
            </React.Fragment>
          )
        })}
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      <div style={{ marginTop: error || success ? 20 : 0 }}>

        {/* ── Step 1: Email ── */}
        {step === 'email' && (
          <form onSubmit={e => { e.preventDefault(); emailStep?.onSubmit(localEmail) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Alamat Email"
              type="email"
              value={localEmail}
              onChange={e => setLocalEmail(e.target.value)}
              required
              placeholder="email@contoh.com"
              autoFocus
            />
            <Button type="submit" variant="primary" loading={loading}>
              Kirim Kode OTP →
            </Button>
            <p style={{ textAlign: 'center', fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
              Ingat passwordmu?{' '}
              <Link to="/login" style={{ color: tokens.primary, fontWeight: 600, textDecoration: 'none' }}>Masuk</Link>
            </p>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={e => { e.preventDefault(); otpStep?.onSubmit(digits.join('')) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <OtpInputGroup value={digits} onChange={setDigits} />

            <Button type="submit" variant="primary" loading={loading} disabled={digits.join('').length < 6}>
              Verifikasi Kode →
            </Button>

            <div style={{ textAlign: 'center', fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
              {countdown > 0 ? (
                <span>Kirim ulang dalam <strong style={{ color: tokens.primary }}>{countdown}s</strong></span>
              ) : (
                <button type="button" onClick={otpStep?.onResend} disabled={loading} style={{
                  background: 'none', border: 'none', color: tokens.primary, fontWeight: 600,
                  cursor: 'pointer', fontSize: 13, fontFamily: tokens.fontBody,
                }}>
                  Kirim ulang OTP
                </button>
              )}
            </div>

            <button type="button" onClick={() => { setStep('email') }} style={{
              background: 'none', border: 'none', color: tokens.textMuted,
              cursor: 'pointer', fontSize: 13, fontFamily: tokens.fontBody, textAlign: 'center',
            }}>
              ← Ganti email
            </button>
          </form>
        )}

        {/* ── Step 3: Reset Password ── */}
        {step === 'reset' && (
          <form onSubmit={e => { e.preventDefault(); resetStep?.onSubmit(passwords.password, passwords.password_confirmation) }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Input
                label="Password Baru"
                type={showPass ? 'text' : 'password'}
                value={passwords.password}
                onChange={e => setPasswords((p: typeof passwords) => ({ ...p, password: e.target.value }))}
                required
                placeholder="Min. 8 karakter"
                autoFocus
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
                <PasswordStrengthBar password={passwords.password} />
              </div>
            </div>

            <Input
              label="Konfirmasi Password Baru"
              type={showPass ? 'text' : 'password'}
              value={passwords.password_confirmation}
             onChange={e => setPasswords((p: typeof passwords) => ({ ...p, password_confirmation: e.target.value }))}
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