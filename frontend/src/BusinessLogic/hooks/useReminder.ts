import { useState, useEffect, useCallback } from 'react'
import { http } from '../services/HttpService'
import { reminderService } from '../services/ReminderService'
import type { HabitGridItem } from '../factories/HabitFormFactory'

export function useReminder() {
  const [habits, setHabits]   = useState<HabitGridItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await http.get<{ success: boolean; data: HabitGridItem[] }>('/api/habits')
      if (!data.success) { setError('Gagal memuat data.'); return }
      setHabits(data.data)
      reminderService.update(data.data)
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleReminder = async (id: number, enabled: boolean): Promise<{ success: boolean; message: string }> => {
    const habit = habits.find(h => h.id_habit === id)
    if (!habit) return { success: false, message: 'Habit tidak ditemukan.' }
    try {
      const data = await http.patch<{ success: boolean; message: string }>(`/api/habits/${id}/reminder`, {
        reminder_time:    habit.reminder_time,
        reminder_enabled: enabled,
      })
      if (data.success) {
        const updated = habits.map(h => h.id_habit === id ? { ...h, reminder_enabled: enabled } : h)
        setHabits(updated)
        reminderService.update(updated)
      }
      return data
    } catch {
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
        const updated = habits.map(h => h.id_habit === id ? { ...h, reminder_time: time } : h)
        setHabits(updated)
        reminderService.update(updated)
      }
      return data
    } catch {
      return { success: false, message: 'Terjadi kesalahan.' }
    }
  }

  const habitsWithReminder = habits.filter(h => h.reminder_time !== null)

  return { habits, habitsWithReminder, loading, error, toggleReminder, updateReminderTime, refetch: fetchHabits }
}
