
import { useState, useEffect } from 'react'
import { http } from '../services/HttpService'

export interface ProfileData {
  username:    string
  email:       string
  full_name:   string
  is_verified: boolean
  google_id?:  string | null
}

export interface ProfileState {
  profile:  ProfileData | null
  loading:  boolean
  error:    string
}

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    profile: null,
    loading: true,
    error:   '',
  })

  const fetchProfile = async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const data = await http.get<{ success: boolean; user: ProfileData }>('/api/me')
      if (data.success) {
        setState({ profile: data.user, loading: false, error: '' })
      } else {
        setState(prev => ({ ...prev, loading: false, error: 'Gagal memuat profil.' }))
      }
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Terjadi kesalahan.' }))
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const updateProfile = async (payload: {
    full_name: string
    username:  string
    email:     string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await http.put<{ success: boolean; message: string }>('/api/profile', payload)
      if (data.success) await fetchProfile()
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
        '/api/profile/change-password/reset', payload
      )
    } catch {
      return { success: false, message: 'Gagal mengganti password.' }
    }
  }

  return {
    ...state,
    refetch: fetchProfile,
    updateProfile,
    requestChangePasswordOtp,
    verifyChangePasswordOtp,
    changePassword,
  }
}