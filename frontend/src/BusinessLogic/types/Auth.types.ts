// ─── Auth Types ───────────────────────────────────────────────────────────────
// Lokasi: frontend/src/types/auth.types.ts
// Perubahan: Hapus GoogleAuthResponse & SetCookieResponse (Google OAuth dihapus)

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

// Login langsung → dashboard, tidak ada requires_otp di alur login
export interface LoginResponse extends ApiResponse {
  token?: string
}

export type ForgotPasswordStep = 'email' | 'otp' | 'reset'

export interface OtpState {
  digits: string[]
  countdown: number
  loading: boolean
  resending: boolean
  error: string
  success: string
}