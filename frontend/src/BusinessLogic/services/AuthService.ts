// ─── AuthService — Singleton Pattern ──────────────────────────────────────────
// Lokasi : frontend/src/services/AuthService.ts
// Pattern: Singleton — satu instance untuk seluruh app
// Perubahan:
//  - Hapus getGoogleUrl() & setGoogleCookie() (Google OAuth dihapus)
//  - verifyOtp() & resendOtp() dipertahankan (dipakai backend, jaga-jaga)

import { http } from './HttpService'
import type {
  LoginForm,
  RegisterForm,
  LoginResponse,
  ApiResponse,
} from '../types/Auth.types'

class AuthService {
  private static instance: AuthService

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // ── Auth ────────────────────────────────────────────────────────────────────
  login(form: LoginForm) {
    return http.post<LoginResponse>('/api/auth/login', form)
  }

  register(form: RegisterForm) {
    return http.post<ApiResponse>('/api/auth/register', form)
  }

  // ── Forgot Password (3-step: email → OTP → reset) ─────────────────────────
  forgotPassword(email: string) {
    return http.post<ApiResponse>('/api/auth/forgot-password', { email })
  }

  verifyForgotOtp(email: string, otp: string) {
    return http.post<ApiResponse>('/api/auth/forgot-password/verify', { email, otp })
  }

  resetPassword(
    email: string,
    otp: string,
    password: string,
    password_confirmation: string
  ) {
    return http.post<ApiResponse>('/api/auth/reset-password', {
      email, otp, password, password_confirmation,
    })
  }
}

export const authService = AuthService.getInstance()