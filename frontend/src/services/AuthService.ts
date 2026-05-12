
import { http } from './HttpService'
import type {
  LoginForm,
  RegisterForm,
  LoginResponse,
  GoogleAuthResponse,
  SetCookieResponse,
  ApiResponse,
} from '../types/auth.types'

class AuthService {
  private static instance: AuthService

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  login(form: LoginForm) {
    return http.post<LoginResponse>('/api/auth/login', form)
  }

  register(form: RegisterForm) {
    return http.post<ApiResponse>('/api/auth/register', form)
  }

  verifyOtp(email: string, otp: string) {
    return http.post<ApiResponse>('/api/auth/otp/verify', { email, otp })
  }

  resendOtp(email: string) {
    return http.post<ApiResponse>('/api/auth/otp/resend', { email })
  }

  getGoogleUrl() {
    return http.get<GoogleAuthResponse>('/api/auth/google')
  }

  setGoogleCookie(token: string) {
    return http.post<SetCookieResponse>('/api/auth/google/set-cookie', { token })
  }

  forgotPassword(email: string) {
    return http.post<ApiResponse>('/api/auth/forgot-password', { email })
  }

  verifyForgotOtp(email: string, otp: string) {
    return http.post<ApiResponse>('/api/auth/forgot-password/verify', { email, otp })
  }

  resetPassword(email: string, otp: string, password: string, password_confirmation: string) {
    return http.post<ApiResponse>('/api/auth/reset-password', {
      email, otp, password, password_confirmation,
    })
  }
}

export const authService = AuthService.getInstance()