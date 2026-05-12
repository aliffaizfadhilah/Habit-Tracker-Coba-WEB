// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  full_name: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordForm {
  email: string
  otp: string[]
  password: string
  password_confirmation: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, string[]>
}

export interface LoginResponse extends ApiResponse {
  requires_otp?: boolean
  email?: string
}

export interface GoogleAuthResponse extends ApiResponse {
  url: string
}

export type SetCookieResponse = ApiResponse

export type ForgotPasswordStep = 'email' | 'otp' | 'reset'

export interface OtpState {
  digits: string[]
  countdown: number
  loading: boolean
  resending: boolean
  error: string
  success: string
}
