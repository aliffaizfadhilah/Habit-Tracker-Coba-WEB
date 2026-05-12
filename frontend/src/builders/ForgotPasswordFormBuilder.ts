
export type ForgotPasswordStep = 'email' | 'otp' | 'reset'
export type ChangePasswordStep = 'current_password' | 'otp' | 'new_password'
export type FormMode           = 'forgot' | 'change'

export interface EmailStepConfig {
  id: 'email'
  onSubmit: (email: string) => Promise<void>
}

export interface OtpStepConfig {
  id:       'otp'
  email:    string
  onSubmit: (otp: string) => Promise<void>
  onResend: () => Promise<void>
}

export interface ResetStepConfig {
  id:       'reset'
  onSubmit: (password: string, confirmation: string) => Promise<void>
}

export interface CurrentPasswordStepConfig {
  id:       'current_password'
  onSubmit: () => Promise<void>
}

export interface ChangeOtpStepConfig {
  id:       'otp'
  email:    string
  onSubmit: (otp: string) => Promise<void>
  onResend: () => Promise<void>
}

export interface NewPasswordStepConfig {
  id:       'new_password'
  onSubmit: (password: string, confirmation: string) => Promise<void>
}

export type AnyStepConfig =
  | EmailStepConfig
  | OtpStepConfig
  | ResetStepConfig
  | CurrentPasswordStepConfig
  | ChangeOtpStepConfig
  | NewPasswordStepConfig

export interface PasswordFormConfig {
  mode:        FormMode
  steps:       AnyStepConfig[]
  currentStep: string
  titles:      Record<string, string>
  subtitles:   Record<string, string>
}

export class ForgotPasswordFormBuilder {
  private config: PasswordFormConfig = {
    mode:        'forgot',
    steps:       [],
    currentStep: 'email',
    titles:      {},
    subtitles:   {},
  }

  setMode(mode: FormMode): this {
    this.config.mode = mode
    return this
  }

  setCurrentStep(step: string): this {
    this.config.currentStep = step
    return this
  }

  addEmailStep(onSubmit: EmailStepConfig['onSubmit']): this {
    this.config.steps.push({ id: 'email', onSubmit })
    this.config.titles['email']    = 'Lupa password?'
    this.config.subtitles['email'] = 'Masukkan emailmu dan kami kirimkan kode OTP'
    return this
  }

  addOtpStep(
    email:    string,
    onSubmit: OtpStepConfig['onSubmit'],
    onResend: OtpStepConfig['onResend'],
  ): this {
    this.config.steps.push({ id: 'otp', email, onSubmit, onResend })
    this.config.titles['otp']    = 'Verifikasi OTP'
    this.config.subtitles['otp'] = `Kode 6 digit dikirim ke ${email}`
    return this
  }

  addResetStep(onSubmit: ResetStepConfig['onSubmit']): this {
    this.config.steps.push({ id: 'reset', onSubmit })
    this.config.titles['reset']    = 'Password baru'
    this.config.subtitles['reset'] = 'Buat password baru yang kuat untuk akunmu'
    return this
  }

  addCurrentPasswordStep(onSubmit: CurrentPasswordStepConfig['onSubmit']): this {
    this.config.steps.push({ id: 'current_password', onSubmit })
    this.config.titles['current_password']    = 'Ganti Password'
    this.config.subtitles['current_password'] = 'Kami akan mengirim kode OTP ke email kamu untuk konfirmasi'
    return this
  }

  addChangeOtpStep(
    email:    string,
    onSubmit: ChangeOtpStepConfig['onSubmit'],
    onResend: ChangeOtpStepConfig['onResend'],
  ): this {
    this.config.steps.push({ id: 'otp', email, onSubmit, onResend })
    this.config.titles['otp']    = 'Verifikasi OTP'
    this.config.subtitles['otp'] = `Kode 6 digit dikirim ke ${email}`
    return this
  }

  addNewPasswordStep(onSubmit: NewPasswordStepConfig['onSubmit']): this {
    this.config.steps.push({ id: 'new_password', onSubmit })
    this.config.titles['new_password']    = 'Password Baru'
    this.config.subtitles['new_password'] = 'Buat password baru yang kuat untuk akunmu'
    return this
  }

  build(): PasswordFormConfig {
    return { ...this.config, steps: [...this.config.steps] }
  }
}