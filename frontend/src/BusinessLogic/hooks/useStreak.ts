
import { useState, useEffect, useCallback } from 'react'
import { http } from '../services/HttpService'
import { useHabitRealtime } from './useHabitRealtime'

export interface HabitStreak {
  id_habit:             number
  title:                string
  category:             string
  periode_start:        string
  periode_end:          string
  current_streak:       number
  longest_streak:       number
  progress_percent:     number
  total_period_days:    number
  total_completed_days: number
  checked_today:        boolean
  reminder_time:        string | null
  reminder_enabled:     boolean
}

export interface StreakSummary {
  total_habits:         number
  total_current_streak: number
  longest_streak:       number
  avg_progress:         number
}

export interface StreakState {
  habits:   HabitStreak[]
  summary:  StreakSummary
  loading:  boolean
  error:    string
}

const defaultSummary: StreakSummary = {
  total_habits:         0,
  total_current_streak: 0,
  longest_streak:       0,
  avg_progress:         0,
}

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    habits:  [],
    summary: defaultSummary,
    loading: true,
    error:   '',
  })

const fetchStreak = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }))
    try {
      const data = await http.get<{ success: boolean; data: HabitStreak[]; summary: StreakSummary }>(
        '/api/streak'
      )

      if (!data.success) {
        setState(prev => ({ ...prev, loading: false, error: 'Gagal memuat data streak.' }))
        return
      }

      setState({
        habits:  data.data,
        summary: data.summary,
        loading: false,
        error:   '',
      })
    } catch {
      setState(prev => ({ ...prev, loading: false, error: 'Terjadi kesalahan. Coba lagi.' }))
    }
  }, []) // ✅

  useEffect(() => { fetchStreak() }, [fetchStreak])

  const _silentFetchStreak = useCallback(async () => {
    try {
      const data = await http.get<{ success: boolean; data: HabitStreak[]; summary: StreakSummary }>('/api/streak')
      if (data.success) setState({ habits: data.data, summary: data.summary, loading: false, error: '' })
    } catch { /* ignore */ }
  }, [])
  useHabitRealtime(_silentFetchStreak)

  return { ...state, refetch: fetchStreak }
}