import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { http } from '../../BusinessLogic/services/HttpService'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, Trophy, Flame, PartyPopper, BarChart2 } from 'lucide-react'
import type { DetailableHabit } from '../components/HabitDetailModal'

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function generateDates(start: string, end: string): string[] {
  const dates: string[] = []
  const d = new Date(start + 'T00:00:00'), endD = new Date(end + 'T00:00:00')
  while (d <= endD) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  return dates
}

function colIndex(dateStr: string) { return (new Date(dateStr + 'T00:00:00').getDay() + 6) % 7 }

function groupIntoWeeks(dates: string[]): (string | null)[][] {
  const weeks: (string | null)[][] = []
  let week: (string | null)[] = Array(colIndex(dates[0])).fill(null)
  for (const d of dates) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week) }
  return weeks
}

type DayStatus = 'done' | 'missed' | 'future' | 'today-done' | 'today-pending'

function dayStatus(dateStr: string, checked: Set<string>, today: string): DayStatus {
  const isDone = checked.has(dateStr)
  if (dateStr === today) return isDone ? 'today-done' : 'today-pending'
  if (isDone) return 'done'
  if (dateStr < today) return 'missed'
  return 'future'
}

const STATUS_STYLE: Record<DayStatus, { bg: string; color: string; label: string }> = {
  'done':          { bg: '#dcfce7', color: '#16a34a', label: '✓' },
  'missed':        { bg: '#fee2e2', color: '#dc2626', label: '✗' },
  'future':        { bg: '#f3f4f6', color: '#86a98d', label: '·' },
  'today-done':    { bg: '#16a34a', color: '#fff',    label: '✓' },
  'today-pending': { bg: '#fff7ed', color: '#ea580c', label: '!' },
}

export default function HabitDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [habit,         setHabit]         = useState<DetailableHabit | null>(null)
  const [checkedDates,  setCheckedDates]  = useState<Set<string>>(new Set())
  const [loading,       setLoading]       = useState(true)
  const [calLoading,    setCalLoading]    = useState(true)
  const [notFound,      setNotFound]      = useState(false)

  useEffect(() => {
    if (!id) return
    http.get<{ success: boolean; data: DetailableHabit }>(`/api/habits/${id}`)
      .then(res => {
        if (res.success) setHabit(res.data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    http.get<{ success: boolean; data: string[] }>(`/api/habits/${id}/checklist`)
      .then(res => { if (res.success) setCheckedDates(new Set(res.data)) })
      .catch(() => {})
      .finally(() => setCalLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-muted text-[14px] font-body">Memuat...</p>
    </div>
  )

  if (notFound || !habit) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted text-[14px] font-body mb-4">Habit tidak ditemukan.</p>
        <button onClick={() => navigate('/habits')} className="text-primary text-[13px] font-body bg-transparent border-none cursor-pointer">
          ← Kembali ke Habits
        </button>
      </div>
    </div>
  )

  const today      = new Date().toISOString().slice(0, 10)
  const allDates   = generateDates(habit.periode_start, habit.periode_end)
  const weeks      = groupIntoWeeks(allDates)
  const isComplete = habitCompletionService.isComplete(habit)
  const progress   = Number(habit.progress_percent)
  const doneDays   = allDates.filter(d => checkedDates.has(d)).length
  const missedDays = allDates.filter(d => d < today && !checkedDates.has(d)).length

  return (
    <div className="min-h-screen bg-surface font-body">
      <div className="max-w-[600px] mx-auto px-5 py-8">

        {/* Back button + header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg border border-border bg-white cursor-pointer flex items-center justify-center shrink-0"
          ><ArrowLeft size={16} /></button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl font-extrabold text-ink m-0">{habit.title}</h1>
              {isComplete && (
                <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-primary-light text-primary inline-flex items-center gap-1">
                  Selesai <PartyPopper size={11} />
                </span>
              )}
            </div>
            <p className="text-xs text-muted m-0 mt-0.5">{habit.category} · {habit.periode_start} s/d {habit.periode_end}</p>
          </div>
          <button
            onClick={() => navigate(`/habits/${id}/report`)}
            className="h-8 px-3 rounded-lg border border-border bg-primary-light cursor-pointer text-xs font-bold text-primary font-body flex items-center gap-1.5 shrink-0"
          ><BarChart2 size={13} /> Laporan</button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Progress', value: `${progress}%`,       icon: <TrendingUp size={18} color="#16a34a" />,  color: '#16a34a' },
              { label: 'Selesai',  value: `${doneDays} hari`,   icon: <CheckCircle size={18} color="#16a34a" />, color: '#16a34a' },
              { label: 'Terlewat', value: `${missedDays} hari`, icon: <XCircle size={18} color="#dc2626" />,     color: '#dc2626' },
              { label: 'Streak',   value: habit.current_streak,  icon: <Trophy size={18} color="#f97316" />,      color: '#f97316' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg border border-border px-2.5 py-3 text-center shadow-card">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-[15px] font-bold font-heading flex items-center justify-center gap-[3px]" style={{ color: s.color }}>
                  {s.label === 'Streak' && <Flame size={13} color="#f97316" />}{s.value}
                </div>
                <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-lg border border-border p-4 shadow-card">
            <div className="flex justify-between mb-2">
              <span className="text-[13px] text-muted font-body">Progress ({habit.total_completed_days}/{habit.total_period_days} hari)</span>
              <span className={`text-[13px] font-bold ${isComplete ? 'text-primary' : 'text-muted'}`}>{progress}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width_0.8s_ease]"
                style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg,#16a34a,#10b981)' : '#16a34a' }}
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg border border-border p-5 shadow-card">
            <div className="text-sm font-bold text-ink font-heading mb-3">Riwayat Hari-hari</div>
            <div className="flex gap-3 mb-3.5 flex-wrap">
              {(['done','missed','future','today-pending'] as DayStatus[]).map(status => (
                <div key={status} className="flex items-center gap-[5px] text-[11px] text-muted">
                  <div className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[9px] font-bold"
                    style={{ background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color }}
                  >{STATUS_STYLE[status].label}</div>
                  {status === 'done' ? '✓ Selesai' : status === 'missed' ? '✗ Terlewat' : status === 'future' ? '· Belum' : '! Hari ini'}
                </div>
              ))}
            </div>
            {calLoading ? (
              <div className="text-center py-6 text-muted text-[13px]">Memuat kalender...</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1 mb-1 min-w-[280px]">
                  {DAY_LABELS.map(d => <div key={d} className="text-center text-[10px] font-bold text-muted py-[2px]">{d}</div>)}
                </div>
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1 mb-1 min-w-[280px]">
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} />
                      const st = STATUS_STYLE[dayStatus(dateStr, checkedDates, today)]
                      return (
                        <div key={di} title={dateStr}
                          className="rounded-[6px] py-[5px] px-[2px] flex flex-col items-center text-[10px] font-semibold border-2"
                          style={{ background: st.bg, color: st.color, borderColor: dateStr === today ? '#16a34a' : 'transparent' }}
                        >
                          <span className="text-[9px] opacity-70">{new Date(dateStr + 'T00:00:00').getDate()}</span>
                          <span className="text-[11px]">{st.label}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Streak info */}
          <div className="bg-white rounded-lg border border-border px-4 py-3 shadow-card flex items-center gap-2.5">
            <Trophy size={20} color="#10b981" />
            <div>
              <div className="text-[13px] font-bold text-ink font-body">Longest Streak: {habit.longest_streak} hari berturut-turut</div>
              <div className="text-xs text-muted">Current streak: {habit.current_streak} hari</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
