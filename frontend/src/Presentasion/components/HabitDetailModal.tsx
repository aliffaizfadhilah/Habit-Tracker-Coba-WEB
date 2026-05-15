import { useState, useEffect } from 'react'
import { http } from '../../BusinessLogic/services/HttpService'
import { tokens } from '../../BusinessLogic/factories/tokens'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'

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
  while (d <= endD) {
    dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

// 0 = Mon … 6 = Sun  (shift JS's Sun=0 to position 6)
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
  if (isDone)            return 'done'
  if (dateStr < today)   return 'missed'
  return 'future'
}

const STATUS_STYLE: Record<DayStatus, { bg: string; color: string; label: string }> = {
  'done':          { bg: tokens.primaryLight, color: tokens.primary,   label: '✓' },
  'missed':        { bg: '#fee2e2',           color: '#dc2626',        label: '✗' },
  'future':        { bg: '#f3f4f6',           color: tokens.textLight, label: '·' },
  'today-done':    { bg: tokens.primary,      color: '#fff',           label: '✓' },
  'today-pending': { bg: '#fff7ed',           color: '#ea580c',        label: '!' },
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

  const today     = new Date().toISOString().slice(0, 10)
  const allDates  = generateDates(habit.periode_start, habit.periode_end)
  const weeks     = groupIntoWeeks(allDates)
  const isComplete = habitCompletionService.isComplete(habit)
  const progress   = Number(habit.progress_percent)

  const doneDays   = allDates.filter(d => checkedDates.has(d)).length
  const missedDays = allDates.filter(d => d < today && !checkedDates.has(d)).length

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(11,26,14,0.6)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: tokens.white, borderRadius: tokens.radiusXl,
          boxShadow: tokens.shadowLg, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px', borderBottom: `1px solid ${tokens.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
          position: 'sticky', top: 0, background: tokens.white, zIndex: 1,
          borderRadius: `${tokens.radiusXl} ${tokens.radiusXl} 0 0`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 800, color: tokens.text, margin: 0 }}>
                {habit.title}
              </h2>
              {isComplete && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: tokens.primaryLight, color: tokens.primary }}>
                  Selesai 🎉
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
                {habit.category}
              </span>
              <span style={{ fontSize: 12, color: tokens.textLight }}>•</span>
              <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
                {habit.periode_start} s/d {habit.periode_end}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${tokens.border}`,
              background: tokens.bg, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >✕</button>
        </div>

        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Progress',  value: `${progress}%`,                   icon: '📈', color: tokens.primary },
              { label: 'Selesai',   value: `${doneDays} hari`,               icon: '✅', color: '#16a34a' },
              { label: 'Terlewat',  value: `${missedDays} hari`,             icon: '❌', color: '#dc2626' },
              { label: 'Streak',    value: `🔥 ${habit.current_streak}`,     icon: '🏆', color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{
                background: tokens.bg, borderRadius: tokens.radius,
                border: `1px solid ${tokens.border}`, padding: '12px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.color, fontFamily: tokens.fontHeading }}>{s.value}</div>
                <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
                Progress ({habit.total_completed_days}/{habit.total_period_days} hari)
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isComplete ? tokens.primary : tokens.textMuted }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 8, background: tokens.border, borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 100, transition: 'width 0.8s ease',
                width: `${progress}%`,
                background: isComplete
                  ? `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`
                  : tokens.primary,
              }} />
            </div>
          </div>

          {/* Calendar grid */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading, marginBottom: 12 }}>
              Riwayat Hari-hari
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {([
                ['done',          '✓ Selesai'],
                ['missed',        '✗ Terlewat'],
                ['future',        '· Belum'],
                ['today-pending', '! Hari ini'],
              ] as [DayStatus, string][]).map(([status, label]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: tokens.textMuted }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: STATUS_STYLE[status].bg,
                    color: STATUS_STYLE[status].color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700,
                  }}>{STATUS_STYLE[status].label}</div>
                  {label}
                </div>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: tokens.textMuted, fontSize: 13 }}>
                Memuat kalender...
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4, minWidth: 280 }}>
                  {DAY_LABELS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: tokens.textMuted, padding: '2px 0' }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4, minWidth: 280 }}>
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} />
                      const status = dayStatus(dateStr, checkedDates, today)
                      const st     = STATUS_STYLE[status]
                      const dayNum = new Date(dateStr + 'T00:00:00').getDate()
                      return (
                        <div
                          key={di}
                          title={dateStr}
                          style={{
                            background: st.bg, color: st.color,
                            borderRadius: 6, padding: '5px 2px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            fontSize: 10, fontWeight: 600,
                            border: dateStr === today ? `2px solid ${tokens.primary}` : '2px solid transparent',
                          }}
                        >
                          <span style={{ fontSize: 9, opacity: 0.7 }}>{dayNum}</span>
                          <span style={{ fontSize: 11 }}>{st.label}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Longest streak info */}
          <div style={{
            background: tokens.bg, borderRadius: tokens.radius,
            border: `1px solid ${tokens.border}`, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontBody }}>
                Longest Streak: {habit.longest_streak} hari berturut-turut
              </div>
              <div style={{ fontSize: 12, color: tokens.textMuted }}>
                Current streak: {habit.current_streak} hari
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
