// ─── ForgotPasswordFormBuilder — Builder Pattern ──────────────────────────────
// Membangun konfigurasi form multi-step secara bertahap menggunakan method chaining.
// Setiap step terdefinisi jelas dan terpisah, menghindari kondisional yang rumit.

import type { ForgotPasswordStep } from '../types/Auth.types'

export interface EmailStepConfig {
  id: 'email'
  onSubmit: (email: string) => Promise<void>
}

export interface OtpStepConfig {
  id: 'otp'
  email: string
  onSubmit: (otp: string) => Promise<void>
  onResend: () => Promise<void>
}

export interface ResetStepConfig {
  id: 'reset'
  onSubmit: (password: string, confirmation: string) => Promise<void>
}

export interface ForgotPasswordFormConfig {
  steps: (EmailStepConfig | OtpStepConfig | ResetStepConfig)[]
  currentStep: ForgotPasswordStep
  titles: Record<ForgotPasswordStep, string>
  subtitles: Record<ForgotPasswordStep, string>
}

export class ForgotPasswordFormBuilder {
  private config: ForgotPasswordFormConfig = {
    steps: [],
    currentStep: 'email',
    titles: {
      email: 'Lupa password?',
      otp: 'Verifikasi OTP',
      reset: 'Password baru',
    },
    subtitles: {
      email: 'Masukkan emailmu dan kami kirimkan kode OTP',
      otp: '',
      reset: 'Buat password baru yang kuat untuk akunmu',
    },
  }

  addEmailStep(onSubmit: EmailStepConfig['onSubmit']): this {
    this.config.steps.push({ id: 'email', onSubmit })
    return this
  }

  addOtpStep(
    email: string,
    onSubmit: OtpStepConfig['onSubmit'],
    onResend: OtpStepConfig['onResend']
  ): this {
    this.config.steps.push({ id: 'otp', email, onSubmit, onResend })
    this.config.subtitles.otp = `Kode 6 digit dikirim ke ${email}`
    return this
  }

  addResetStep(onSubmit: ResetStepConfig['onSubmit']): this {
    this.config.steps.push({ id: 'reset', onSubmit })
    return this
  }

  setCurrentStep(step: ForgotPasswordStep): this {
    this.config.currentStep = step
    return this
  }

  build(): ForgotPasswordFormConfig {
    return { ...this.config }
  }
}