
import { useState, useEffect, useCallback } from 'react'
import { reminderService } from '../services/ReminderService'
import type { HabitGridItem, HabitFormData } from '../factories/HabitFormFactory'
import { useHabitRealtime } from './useHabitRealtime'
import { habitRepository } from '../repositories/HabitRepository'

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
      const habits = await habitRepository.getAll()
      setState({ habits, loading: false, error: '' })
      reminderService.update(habits)
      reminderService.start()
    } catch (err) {
      console.error('[Habit] Error memuat habit:', err)
      setState(prev => ({ ...prev, loading: false, error: 'Terjadi kesalahan. Coba lagi.' }))
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const _silentFetchHabits = useCallback(async () => {
    try {
      habitRepository.invalidate()
      const habits = await habitRepository.getAll()
      setState(prev => ({ ...prev, habits }))
      reminderService.update(habits)
      reminderService.start()
    } catch { /* ignore */ }
  }, [])
  useHabitRealtime(_silentFetchHabits)

  const createHabit = async (form: HabitFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const payload = {
        title:         form.title.trim(),
        category:      form.category === 'lainnya' ? form.customCategory.trim() : form.category,
        periode_start: form.periode_start,
        periode_end:   form.periode_end,
        reminder_time: form.reminder_time,
      }
      const res = await habitRepository.create(payload)
      if (res.success) await fetchHabits()
      return res
    } catch (err) {
      console.error('[Habit] Error membuat habit:', err)
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
        reminder_time: form.reminder_time,
      }
      const res = await habitRepository.update(id, payload)
      if (res.success) await fetchHabits()
      return res
    } catch (err) {
      console.error('[Habit] Error update habit:', err)
      return { success: false, message: 'Terjadi kesalahan saat mengupdate habit.' }
    }
  }

  const deleteHabit = async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await habitRepository.remove(id)
      if (res.success) await fetchHabits()
      return res
    } catch (err) {
      console.error('[Habit] Error hapus habit:', err)
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