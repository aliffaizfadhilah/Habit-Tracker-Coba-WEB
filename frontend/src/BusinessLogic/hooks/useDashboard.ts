import { useState, useEffect, useCallback, useMemo } from 'react'
import { http } from '../services/HttpService'
import type { HabitStreak } from './useStreak'
import { useHabitRealtime } from './useHabitRealtime'

interface ActivityLog {
  id:          number
  id_habit:    number
  habit_title: string | null
  date:        string
  status:      number
}

export interface WeeklyBar {
  day:     string
  val:     number
  isToday: boolean
}

export interface DashboardInsight {
  icon:  'flame' | 'trending-up' | 'star' | 'zap'
  bg:    string
  title: string
  sub:   string
}

export interface AtRiskItem {
  name:  string
  label: string
  level: 'high' | 'mid' | 'ok'
}

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function useDashboard(habits: HabitStreak[]) {
  const [logs, setLogs]           = useState<ActivityLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const data = await http.get<{ success: boolean; data: ActivityLog[] }>('/api/activity-logs')
      if (data.success) setLogs(data.data)
    } catch { /* silent */ }
    finally { setLogsLoading(false) }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])
  useHabitRealtime(fetchLogs)

  const weeklyData = useMemo((): WeeklyBar[] =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().slice(0, 10)
      return {
        day:     DAY_NAMES[d.getDay()],
        val:     logs.filter(l => l.date === dateStr && l.status === 1).length,
        isToday: i === 6,
      }
    }),
  [logs])

  const insights = useMemo((): DashboardInsight[] => {
    if (habits.length === 0) return []

    const cutoff = (() => {
      const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10)
    })()
    const thisWeek = logs.filter(l => l.date >= cutoff && l.status === 1)

    const byHabit: Record<number, number> = {}
    const byDay:   Record<string, number> = {}
    thisWeek.forEach(l => {
      byHabit[l.id_habit] = (byHabit[l.id_habit] ?? 0) + 1
      const name = DAY_NAMES[new Date(l.date + 'T00:00:00').getDay()]
      byDay[name] = (byDay[name] ?? 0) + 1
    })

    const bestHabitEntry = Object.entries(byHabit).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
    const bestHabit = bestHabitEntry ? habits.find(h => h.id_habit === Number(bestHabitEntry[0])) : null
    const bestCount = bestHabitEntry ? Number(bestHabitEntry[1]) : 0
    const bestDayEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]

    const today = new Date().toISOString().slice(0, 10)
    const needsAttention = [...habits]
      .filter(h => Number(h.progress_percent) < 100 && h.periode_end >= today)
      .sort((a, b) => Number(a.progress_percent) - Number(b.progress_percent))[0]

    const completedFull = habits.filter(h => Number(h.progress_percent) === 100).length
    const avgProgress   = Math.round(habits.reduce((s, h) => s + Number(h.progress_percent), 0) / habits.length)

    const result: DashboardInsight[] = []

    if (bestHabit && bestCount > 0) {
      result.push({
        icon: 'flame', bg: '#fff7ed',
        title: `${bestHabit.title} paling konsisten minggu ini`,
        sub:   `${bestCount}/7 hari selesai — pertahankan!`,
      })
    }

    result.push({
      icon: 'trending-up', bg: '#f0fdf4',
      title: `Rata-rata progress ${avgProgress}%`,
      sub:   completedFull > 0
        ? `${completedFull} habit sudah selesai 100%!`
        : 'Terus tingkatkan progressmu!',
    })

    if (bestDayEntry) {
      result.push({
        icon: 'star', bg: '#eef1ff',
        title: `${bestDayEntry[0]} paling produktif minggu ini`,
        sub:   `${bestDayEntry[1]} habit selesai hari ${bestDayEntry[0]}`,
      })
    }

    if (needsAttention) {
      const weekCount = byHabit[needsAttention.id_habit] ?? 0
      result.push({
        icon: 'zap', bg: '#fef2f2',
        title: `${needsAttention.title} butuh perhatian`,
        sub:   `${weekCount}/7 hari selesai, progress ${Number(needsAttention.progress_percent).toFixed(0)}%`,
      })
    }

    return result
  }, [habits, logs])

  const atRisk = useMemo((): AtRiskItem[] => {
    const today = new Date().toISOString().slice(0, 10)
    return habits
      .filter(h => Number(h.progress_percent) < 100 && h.periode_end >= today)
      .map(h => {
        if (h.current_streak === 0 && h.total_completed_days > 0)
          return { name: h.title, label: 'Streak terputus',               level: 'high' as const }
        if (!h.checked_today && h.current_streak <= 2)
          return { name: h.title, label: `Streak ${h.current_streak} hari`, level: 'mid' as const }
        return   { name: h.title, label: 'On track ✓',                    level: 'ok'   as const }
      })
      .slice(0, 5)
  }, [habits])

  return { weeklyData, insights, atRisk, logsLoading }
}
