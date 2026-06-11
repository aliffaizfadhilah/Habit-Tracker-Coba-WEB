import { useState, useEffect, useCallback } from 'react'
import { http } from '../services/HttpService'
import { reminderService } from '../services/ReminderService'
import type { HabitGridItem } from '../factories/HabitFormFactory'
import { useHabitRealtime } from './useHabitRealtime'

export function useReminder() {
  const [habits, setHabits]   = useState<HabitGridItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await http.get<{ success: boolean; data: HabitGridItem[] }>('/api/habits')
      if (!data.success) {
        console.error('[Reminder] Gagal memuat data habit.')
        setError('Gagal memuat data.')
        return
      }
      console.log('[Reminder] Data habit dimuat:', data.data.length, 'habit')
      setHabits(data.data)
      reminderService.update(data.data)
      reminderService.start()
    } catch (err) {
      console.error('[Reminder] Error memuat habit:', err)
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const _silentFetchHabits = useCallback(async () => {
    try {
      const data = await http.get<{ success: boolean; data: HabitGridItem[] }>('/api/habits')
      if (!data.success) return
      setHabits(data.data)
      reminderService.update(data.data)
    } catch { /* ignore */ }
  }, [])
  useHabitRealtime(_silentFetchHabits)

  const toggleReminder = async (id: number, enabled: boolean): Promise<{ success: boolean; message: string }> => {
    const habit = habits.find(h => h.id_habit === id)
    if (!habit) return { success: false, message: 'Habit tidak ditemukan.' }
    try {
      const data = await http.patch<{ success: boolean; message: string }>(`/api/habits/${id}/reminder`, {
        reminder_time:    habit.reminder_time,
        reminder_enabled: enabled,
      })
      if (data.success) {
        console.log('[Reminder] Toggle reminder id:', id, '→', enabled ? 'aktif' : 'nonaktif')
        const updated = habits.map(h => h.id_habit === id ? { ...h, reminder_enabled: enabled } : h)
        setHabits(updated)
        reminderService.update(updated)
      } else {
        console.error('[Reminder] Gagal toggle reminder id:', id, data.message)
      }
      return data
    } catch (err) {
      console.error('[Reminder] Error toggle reminder:', err)
      return { success: false, message: 'Terjadi kesalahan.' }
    }
  }

  const updateReminderTime = async (id: number, time: string): Promise<{ success: boolean; message: string }> => {
    const habit = habits.find(h => h.id_habit === id)
    if (!habit) return { success: false, message: 'Habit tidak ditemukan.' }
    try {
      const data = await http.patch<{ success: boolean; message: string }>(`/api/habits/${id}/reminder`, {
        reminder_time:    time,
        reminder_enabled: habit.reminder_enabled,
      })
      if (data.success) {
        console.log('[Reminder] Waktu reminder id:', id, '→', time)
        const updated = habits.map(h => h.id_habit === id ? { ...h, reminder_time: time } : h)
        setHabits(updated)
        reminderService.update(updated)
      } else {
        console.error('[Reminder] Gagal update waktu reminder id:', id, data.message)
      }
      return data
    } catch (err) {
      console.error('[Reminder] Error update waktu reminder:', err)
      return { success: false, message: 'Terjadi kesalahan.' }
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  const habitsWithReminder = habits.filter(h => h.reminder_time !== null)

  const isLocked = (h: HabitGridItem) =>
    Number(h.progress_percent) >= 100 || h.periode_end < today

  const activeReminders  = habitsWithReminder.filter(h => !isLocked(h))
  const lockedReminders  = habitsWithReminder.filter(h =>  isLocked(h))
  const completedLocked  = lockedReminders.filter(h => Number(h.progress_percent) >= 100)
  const expiredLocked    = lockedReminders.filter(h => Number(h.progress_percent) < 100 && h.periode_end < today)

  return {
    habits,
    habitsWithReminder,
    activeReminders,
    lockedReminders,
    completedLocked,
    expiredLocked,
    loading, error, toggleReminder, updateReminderTime, refetch: fetchHabits,
  }
}
