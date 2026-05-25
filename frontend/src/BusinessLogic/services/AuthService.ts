
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

  login(form: LoginForm) {
    return http.post<LoginResponse>('/api/auth/login', form)
  }

  register(form: RegisterForm) {
    return http.post<ApiResponse>('/api/auth/register', form)
  }

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