import { useState, useEffect } from 'react'
import { http } from '../../BusinessLogic/services/HttpService'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'
import { X, TrendingUp, CheckCircle, XCircle, Trophy, Flame, PartyPopper } from 'lucide-react'

export interface DetailableHabit {
  id_habit:             number
  title:                string
  category:             string
  periode_start:        string
  periode_end:          string
  current_streak:       number
  longest_streak:       number
  progress_percent:     number
  total_completed_days: number
  total_period_days:    number
}

interface Props {
  habit:   DetailableHabit
  onClose: () => void
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function generateDates(start: string, end: string): string[] {
  const dates: string[] = []
  const d = new Date(start + 'T00:00:00')
  const endD = new Date(end + 'T00:00:00')
  while (d <= endD) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  return dates
}

function colIndex(dateStr: string): number {
  return (new Date(dateStr + 'T00:00:00').getDay() + 6) % 7
}

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
  if (isDone)  return 'done'
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

export default function HabitDetailModal({ habit, onClose }: Props) {
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    http.get<{ success: boolean; data: string[] }>(`/api/habits/${habit.id_habit}/checklist`)
      .then(res => { if (res.success) setCheckedDates(new Set(res.data)) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [habit.id_habit])

  const today      = new Date().toISOString().slice(0, 10)
  const allDates   = generateDates(habit.periode_start, habit.periode_end)
  const weeks      = groupIntoWeeks(allDates)
  const isComplete = habitCompletionService.isComplete(habit)
  const progress   = Number(habit.progress_percent)
  const doneDays   = allDates.filter(d => checkedDates.has(d)).length
  const missedDays = allDates.filter(d => d < today && !checkedDates.has(d)).length

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-[rgba(11,26,14,0.6)] backdrop-blur-[5px] flex items-center justify-center p-5"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-float w-full max-w-[560px] max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-border flex justify-between items-start gap-3 sticky top-0 bg-white z-[1] rounded-t-xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-heading text-lg font-extrabold text-ink m-0">{habit.title}</h2>
              {isComplete && (
                <span className="text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-primary-light text-primary inline-flex items-center gap-1">
                  Selesai <PartyPopper size={11} />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted font-body">{habit.category}</span>
              <span className="text-xs text-subtle">•</span>
              <span className="text-xs text-muted font-body">{habit.periode_start} s/d {habit.periode_end}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] border border-border bg-surface cursor-pointer flex items-center justify-center shrink-0"
          ><X size={16} /></button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-5">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Progress', value: `${progress}%`,       icon: <TrendingUp size={18} color="#16a34a" />,  color: '#16a34a' },
              { label: 'Selesai',  value: `${doneDays} hari`,   icon: <CheckCircle size={18} color="#16a34a" />, color: '#16a34a' },
              { label: 'Terlewat', value: `${missedDays} hari`, icon: <XCircle size={18} color="#dc2626" />,     color: '#dc2626' },
              { label: 'Streak',   value: habit.current_streak,  icon: <Trophy size={18} color="#f97316" />,      color: '#f97316' },
            ].map(s => (
              <div key={s.label} className="bg-surface rounded-md border border-border px-2.5 py-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-[15px] font-bold font-heading flex items-center justify-center gap-[3px]" style={{ color: s.color }}>
                  {s.label === 'Streak' && <Flame size={13} color="#f97316" />}{s.value}
                </div>
                <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-muted font-body">Progress ({habit.total_completed_days}/{habit.total_period_days} hari)</span>
              <span className={`text-[13px] font-bold ${isComplete ? 'text-primary' : 'text-muted'}`}>{progress}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width_0.8s_ease]"
                style={{
                  width: `${progress}%`,
                  background: isComplete ? 'linear-gradient(90deg,#16a34a,#10b981)' : '#16a34a',
                }}
              />
            </div>
          </div>

          {/* Calendar grid */}
          <div>
            <div className="text-sm font-bold text-ink font-heading mb-3">Riwayat Hari-hari</div>
            <div className="flex gap-3 mb-3.5 flex-wrap">
              {(['done','missed','future','today-pending'] as DayStatus[]).map(status => (
                <div key={status} className="flex items-center gap-[5px] text-[11px] text-muted">
                  <div
                    className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[9px] font-bold"
                    style={{ background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color }}
                  >{STATUS_STYLE[status].label}</div>
                  {status === 'done' ? '✓ Selesai' : status === 'missed' ? '✗ Terlewat' : status === 'future' ? '· Belum' : '! Hari ini'}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-6 text-muted text-[13px]">Memuat kalender...</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1 mb-1 min-w-[280px]">
                  {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-muted py-[2px]">{d}</div>
                  ))}
                </div>
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1 mb-1 min-w-[280px]">
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} />
                      const st     = STATUS_STYLE[dayStatus(dateStr, checkedDates, today)]
                      const dayNum = new Date(dateStr + 'T00:00:00').getDate()
                      return (
                        <div
                          key={di}
                          title={dateStr}
                          className="rounded-[6px] py-[5px] px-[2px] flex flex-col items-center text-[10px] font-semibold border-2"
                          style={{
                            background: st.bg, color: st.color,
                            borderColor: dateStr === today ? '#16a34a' : 'transparent',
                          }}
                        >
                          <span className="text-[9px] opacity-70">{dayNum}</span>
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
          <div className="bg-surface rounded-md border border-border px-4 py-3 flex items-center gap-2.5">
            <Trophy size={20} color="#10b981" />
            <div>
              <div className="text-[13px] font-bold text-ink font-body">
                Longest Streak: {habit.longest_streak} hari berturut-turut
              </div>
              <div className="text-xs text-muted">Current streak: {habit.current_streak} hari</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
