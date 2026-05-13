
import { useState, useEffect, useCallback } from 'react'
import { http } from '../services/HttpService'
import type { HabitGridItem, HabitFormData } from '../factories/HabitFormFactory'

export interface HabitState {
  habits:  HabitGridItem[]
  loading: boolean
  error:   string
}

export function useHabit() {
  const [state, setState] = useState<HabitState>({
    habits:  [],
    loading: true,
    error:   '',
  })

  const fetchHabits = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const data = await http.get<{ success: boolean; data: HabitGridItem[] }>('/api/habits')
      if (!data.success) {
        setState(prev => ({ ...prev, loading: false, error: 'Gagal memuat data habit.' }))
        return
      }
      setState({ habits: data.data, loading: false, error: '' })
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Terjadi kesalahan. Coba lagi.' }))
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const createHabit = async (form: HabitFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const payload = {
        title:         form.title.trim(),
        category:      form.category === 'lainnya' ? form.customCategory.trim() : form.category,
        periode_start: form.periode_start,
        periode_end:   form.periode_end,
      }
      const data = await http.post<{ success: boolean; message: string }>('/api/habits', payload)
      if (data.success) await fetchHabits()
      return data
    } catch {
      return { success: false, message: 'Terjadi kesalahan saat menyimpan habit.' }
    }
  }

  const updateHabit = async (id: number, form: HabitFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const payload = {
        title:         form.title.trim(),
        category:      form.category === 'lainnya' ? form.customCategory.trim() : form.category,
        periode_start: form.periode_start,
        periode_end:   form.periode_end,
      }
      const data = await http.put<{ success: boolean; message: string }>(`/api/habits/${id}`, payload)
      if (data.success) await fetchHabits()
      return data
    } catch {
      return { success: false, message: 'Terjadi kesalahan saat mengupdate habit.' }
    }
  }

  const deleteHabit = async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await http.delete<{ success: boolean; message: string }>(`/api/habits/${id}`)
      if (data.success) await fetchHabits()
      return data
    } catch {
      return { success: false, message: 'Terjadi kesalahan saat menghapus habit.' }
    }
  }

  return {
    ...state,
    refetch:      fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
  }
}