import { useState, useEffect, useMemo } from 'react'
import { http } from '../../BusinessLogic/services/HttpService'
import { tokens } from '../../BusinessLogic/factories/tokens'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'
import { createReport, type SectionType } from '../../BusinessLogic/services/HabitReportPrototype'
import SnapshotEditor from './SnapshotEditor'

export interface ReportableHabit {
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
  habit:   ReportableHabit
  onClose: () => void
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const DAY_NAMES  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

function generateDates(start: string, end: string): string[] {
  const dates: string[] = []
  const d    = new Date(start + 'T00:00:00')
  const endD = new Date(end   + 'T00:00:00')
  while (d <= endD) {
    dates.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
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

function getBadge(progress: number) {
  if (progress >= 100) return { icon: '🏆', label: 'Luar Biasa!',          color: '#15803d', bg: '#dcfce7', desc: 'Kamu berhasil menyelesaikan semua target habit ini dengan sempurna!' }
  if (progress >= 80)  return { icon: '🥈', label: 'Hampir Sempurna',      color: '#1d4ed8', bg: '#dbeafe', desc: 'Konsistensimu sangat baik. Sedikit lagi kamu bisa mencapai 100%!' }
  if (progress >= 50)  return { icon: '🥉', label: 'Cukup Baik',           color: '#b45309', bg: '#fef3c7', desc: 'Kamu sudah berusaha lebih dari setengahnya. Terus tingkatkan!' }
  return                      { icon: '💪', label: 'Perlu Ditingkatkan',   color: '#dc2626', bg: '#fee2e2', desc: 'Jadikan pengalaman ini pelajaran berharga untuk habit berikutnya.' }
}

const LEGEND_LABELS: Record<DayStatus, string> = {
  'done':          '✓ Selesai',
  'missed':        '✗ Terlewat',
  'future':        '· Belum',
  'today-done':    '✓ Selesai',
  'today-pending': '! Hari ini',
}

export default function HabitReportModal({ habit, onClose }: Props) {
  const [checkedDates,   setCheckedDates]   = useState<Set<string>>(new Set())
  const [calLoading,     setCalLoading]     = useState(true)
  const [showSnapshot,   setShowSnapshot]   = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    http.get<{ success: boolean; data: string[] }>(`/api/habits/${habit.id_habit}/checklist`)
      .then(res => { if (res.success) setCheckedDates(new Set(res.data)) })
      .catch(() => {})
      .finally(() => setCalLoading(false))
  }, [habit.id_habit])

  const isFinal  = habitCompletionService.isComplete(habit) || today > habit.periode_end
  const report   = useMemo(() => createReport(isFinal), [isFinal])
  const progress = Number(habit.progress_percent)
  const badge    = getBadge(progress)

  const allDates = useMemo(() => generateDates(habit.periode_start, habit.periode_end), [habit.periode_start, habit.periode_end])
  const weeks    = useMemo(() => groupIntoWeeks(allDates), [allDates])

  const missedDays = useMemo(
    () => allDates.filter(d => d < today && !checkedDates.has(d)).length,
    [allDates, checkedDates, today]
  )

  const { dowChecked, dowTotal } = useMemo(() => {
    const dowChecked = Array(7).fill(0)
    const dowTotal   = Array(7).fill(0)
    for (const d of allDates) {
      if (d > today) continue
      const dow = (new Date(d + 'T00:00:00').getDay() + 6) % 7
      dowTotal[dow]++
      if (checkedDates.has(d)) dowChecked[dow]++
    }
    return { dowChecked, dowTotal }
  }, [allDates, checkedDates, today])

  const bestIdx  = dowChecked.reduce((b, c, i) => c > dowChecked[b] ? i : b, 0)
  const worstIdx = dowChecked.reduce((w, c, i) => dowTotal[i] > 0 && c < dowChecked[w] ? i : w, bestIdx)
  const maxDow   = Math.max(...dowChecked, 1)

  const renderSection = (section: SectionType) => {
    switch (section) {

      case 'badge':
        return (
          <div key="badge" style={{
            background: badge.bg, border: `2px solid ${badge.color}33`,
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>{badge.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: badge.color, fontFamily: tokens.fontHeading, marginBottom: 4 }}>
                {badge.label}
              </div>
              <div style={{ fontSize: 13, color: badge.color, opacity: 0.85, fontFamily: tokens.fontBody, lineHeight: 1.5 }}>
                {badge.desc}
              </div>
            </div>
          </div>
        )

      case 'summary_text':
        return (
          <div key="summary_text" style={{
            background: tokens.bg, borderRadius: tokens.radius,
            border: `1px solid ${tokens.border}`, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontBody, marginBottom: 8 }}>
              📋 Ringkasan Performa
            </div>
            <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.8, fontFamily: tokens.fontBody }}>
              Selama periode <strong style={{ color: tokens.text }}>{habit.periode_start}</strong> hingga{' '}
              <strong style={{ color: tokens.text }}>{habit.periode_end}</strong>, kamu berhasil menyelesaikan{' '}
              <strong style={{ color: tokens.primary }}>{habit.total_completed_days} dari {habit.total_period_days} hari</strong> target
              dengan progress akhir <strong style={{ color: tokens.primary }}>{progress}%</strong>.
              Streak terpanjangmu adalah <strong style={{ color: '#f97316' }}>{habit.longest_streak} hari</strong> berturut-turut.
            </div>
          </div>
        )

      case 'stats':
        return (
          <div key="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Progress',  value: `${progress}%`,                icon: '📈', color: tokens.primary },
              { label: 'Selesai',   value: `${habit.total_completed_days} hari`, icon: '✅', color: '#16a34a' },
              { label: 'Terlewat',  value: `${missedDays} hari`,          icon: '❌', color: '#dc2626' },
              { label: 'Streak',    value: `🔥 ${habit.current_streak}`,  icon: '🏆', color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{
                background: tokens.bg, borderRadius: tokens.radius,
                border: `1px solid ${tokens.border}`, padding: '12px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color, fontFamily: tokens.fontHeading }}>{s.value}</div>
                <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )

      case 'progress_bar':
        return (
          <div key="progress_bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
                Progress ({habit.total_completed_days}/{habit.total_period_days} hari)
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isFinal ? tokens.primary : tokens.textMuted }}>
                {progress}%
              </span>
            </div>
            <div style={{ height: 8, background: tokens.border, borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 100, transition: 'width 0.8s ease',
                width: `${progress}%`,
                background: isFinal
                  ? `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`
                  : tokens.primary,
              }} />
            </div>
          </div>
        )

      case 'day_analysis':
        return (
          <div key="day_analysis">
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading, marginBottom: 14 }}>
              📆 Konsistensi per Hari
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 72 }}>
              {DAY_LABELS.map((label, i) => {
                const done  = dowChecked[i]
                const total = dowTotal[i]
                const pct   = total > 0 ? (done / maxDow) * 100 : 0
                const isBest  = i === bestIdx && total > 0
                const isWorst = i === worstIdx && total > 0 && bestIdx !== worstIdx
                return (
                  <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isBest ? tokens.primary : isWorst ? '#dc2626' : tokens.textMuted }}>
                      {total > 0 ? done : '–'}
                    </div>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      minHeight: 4,
                      height: `${Math.max(pct * 0.52, total > 0 ? 6 : 4)}px`,
                      background: isBest
                        ? `linear-gradient(180deg, ${tokens.primary}, ${tokens.accent})`
                        : isWorst ? '#fca5a5'
                        : total > 0 ? tokens.primaryLight
                        : tokens.border,
                      transition: 'height 0.5s ease',
                    }} />
                    <div style={{ fontSize: 10, color: isBest ? tokens.primary : isWorst ? '#dc2626' : tokens.textMuted, fontWeight: 600 }}>
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
              {dowTotal[bestIdx] > 0 && (
                <span style={{ fontSize: 12, color: tokens.primary, fontFamily: tokens.fontBody }}>
                  ⭐ Terbaik: <strong>{DAY_NAMES[bestIdx]}</strong>
                </span>
              )}
              {bestIdx !== worstIdx && dowTotal[worstIdx] > 0 && (
                <span style={{ fontSize: 12, color: '#dc2626', fontFamily: tokens.fontBody }}>
                  • Perlu perhatian: <strong>{DAY_NAMES[worstIdx]}</strong>
                </span>
              )}
            </div>
          </div>
        )

      case 'calendar':
        return (
          <div key="calendar">
            <div style={{ fontSize: 14, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading, marginBottom: 12 }}>
              📅 Riwayat Hari-hari
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {(['done', 'missed', 'future', 'today-pending'] as DayStatus[]).map(status => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: tokens.textMuted }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 700,
                  }}>{STATUS_STYLE[status].label}</div>
                  {LEGEND_LABELS[status]}
                </div>
              ))}
            </div>
            {calLoading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: tokens.textMuted, fontSize: 13 }}>
                Memuat kalender...
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4, minWidth: 280 }}>
                  {DAY_LABELS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: tokens.textMuted, padding: '2px 0' }}>{d}</div>
                  ))}
                </div>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4, minWidth: 280 }}>
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} />
                      const status = dayStatus(dateStr, checkedDates, today)
                      const st     = STATUS_STYLE[status]
                      const dayNum = new Date(dateStr + 'T00:00:00').getDate()
                      return (
                        <div key={di} title={dateStr} style={{
                          background: st.bg, color: st.color,
                          borderRadius: 6, padding: '5px 2px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          fontSize: 10, fontWeight: 600,
                          border: dateStr === today ? `2px solid ${tokens.primary}` : '2px solid transparent',
                        }}>
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
        )

      case 'streak_info':
        return (
          <div key="streak_info" style={{
            background: tokens.bg, borderRadius: tokens.radius,
            border: `1px solid ${tokens.border}`, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>🏆</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontBody }}>
                Longest Streak: {habit.longest_streak} hari berturut-turut
              </div>
              <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>
                Current streak: {habit.current_streak} hari
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

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
          boxShadow: tokens.shadowLg, width: '100%', maxWidth: 580,
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
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                background: isFinal ? tokens.primaryLight : '#eff6ff',
                color:      isFinal ? tokens.primary       : '#1d4ed8',
              }}>
                {isFinal ? '📊 Laporan Final' : '📊 Laporan Progress'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: tokens.textMuted }}>{habit.category}</span>
              <span style={{ fontSize: 12, color: tokens.textLight }}>•</span>
              <span style={{ fontSize: 12, color: tokens.textMuted }}>{habit.periode_start} s/d {habit.periode_end}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setShowSnapshot(true)}
              title="Buat snapshot"
              style={{
                height: 32, padding: '0 12px', borderRadius: 8,
                border: `1px solid ${tokens.border}`, background: tokens.primaryLight,
                cursor: 'pointer', fontSize: 12, fontWeight: 700,
                color: tokens.primary, fontFamily: tokens.fontBody,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >📸 Share</button>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${tokens.border}`,
              background: tokens.bg, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* Body — render sections from cloned prototype */}
        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {report.sections.map(section => renderSection(section))}
        </div>
      </div>

      {showSnapshot && (
        <SnapshotEditor
          habit={habit}
          onClose={() => setShowSnapshot(false)}
          onPosted={() => { setShowSnapshot(false) }}
        />
      )}
    </div>
  )
}
