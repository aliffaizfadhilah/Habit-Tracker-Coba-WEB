import { http } from '../services/HttpService'
import { useAuth } from '../context/AuthContext'

export interface ProfileData {
  username:    string
  email:       string
  full_name:   string
  is_verified: boolean
  google_id?:  string | null
}

export function useProfile() {
  const { user, loading, refetch } = useAuth()

  const profile: ProfileData | null = user
    ? { username: user.username, email: user.email, full_name: user.full_name ?? '', is_verified: user.is_verified }
    : null

  const updateProfile = async (payload: {
    full_name: string
    username:  string
    email:     string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await http.put<{ success: boolean; message: string }>('/api/profile', payload)
      if (data.success) await refetch()
      return data
    } catch {
      return { success: false, message: 'Terjadi kesalahan saat update profil.' }
    }
  }

  const requestChangePasswordOtp = async (): Promise<{ success: boolean; message: string }> => {
    try {
      return await http.post<{ success: boolean; message: string }>(
        '/api/profile/change-password/request', {}
      )
    } catch {
      return { success: false, message: 'Gagal mengirim OTP.' }
    }
  }
  const verifyChangePasswordOtp = async (otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await http.post<{ success: boolean; message: string }>(
        '/api/profile/change-password/verify', { otp }
      )
    } catch {
      return { success: false, message: 'Gagal memverifikasi OTP.' }
    }
  }

  const changePassword = async (payload: {
    otp:                   string
    password:              string
    password_confirmation: string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      return await http.post<{ success: boolean; message: string }>(
        '/api/profile/change-password', payload
      )
    } catch {
      return { success: false, message: 'Gagal mengganti password.' }
    }
  }

  return {
    profile,
    loading,
    error: '',
    refetch,
    updateProfile,
    requestChangePasswordOtp,
    verifyChangePasswordOtp,
    changePassword,
  }
}