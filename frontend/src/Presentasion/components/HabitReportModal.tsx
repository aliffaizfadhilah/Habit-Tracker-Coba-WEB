import { useState, useEffect, useMemo } from 'react'
import { http } from '../../BusinessLogic/services/HttpService'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'
import { createReport, type SectionType } from '../../BusinessLogic/services/HabitReportPrototype'
import SnapshotEditor from './SnapshotEditor'
import { Trophy, Medal, Dumbbell, TrendingUp, CheckCircle, XCircle, Flame, Camera, X, BarChart2, Calendar, Star, ClipboardList } from 'lucide-react'

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

interface Props { habit: ReportableHabit; onClose: () => void }

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const DAY_NAMES  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

function generateDates(start: string, end: string): string[] {
  const dates: string[] = []
  const d = new Date(start + 'T00:00:00'), endD = new Date(end + 'T00:00:00')
  while (d <= endD) { dates.push(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  return dates
}

function colIndex(dateStr: string): number { return (new Date(dateStr + 'T00:00:00').getDay() + 6) % 7 }

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

function getBadge(progress: number) {
  if (progress >= 100) return { icon: <Trophy   size={52} color="#15803d" />, label: 'Luar Biasa!',        color: '#15803d', bg: '#dcfce7', desc: 'Kamu berhasil menyelesaikan semua target habit ini dengan sempurna!' }
  if (progress >= 80)  return { icon: <Medal    size={52} color="#1d4ed8" />, label: 'Hampir Sempurna',    color: '#1d4ed8', bg: '#dbeafe', desc: 'Konsistensimu sangat baik. Sedikit lagi kamu bisa mencapai 100%!' }
  if (progress >= 50)  return { icon: <Medal    size={52} color="#b45309" />, label: 'Cukup Baik',         color: '#b45309', bg: '#fef3c7', desc: 'Kamu sudah berusaha lebih dari setengahnya. Terus tingkatkan!' }
  return                      { icon: <Dumbbell size={52} color="#dc2626" />, label: 'Perlu Ditingkatkan', color: '#dc2626', bg: '#fee2e2', desc: 'Jadikan pengalaman ini pelajaran berharga untuk habit berikutnya.' }
}

const LEGEND_LABELS: Record<DayStatus, string> = {
  'done': '✓ Selesai', 'missed': '✗ Terlewat', 'future': '· Belum',
  'today-done': '✓ Selesai', 'today-pending': '! Hari ini',
}

function CalendarGrid({ weeks, checkedDates, today }: {
  weeks: (string | null)[][]
  checkedDates: Set<string>
  today: string
}) {
  return (
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
                style={{ background: st.bg, color: st.color, borderColor: dateStr === today ? '#16a34a' : 'transparent' }}
              >
                <span className="text-[9px] opacity-70">{dayNum}</span>
                <span className="text-[11px]">{st.label}</span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function HabitReportModal({ habit, onClose }: Props) {
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set())
  const [calLoading, setCalLoading]     = useState(true)
  const [showSnapshot, setShowSnapshot] = useState(false)

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

  const allDates   = useMemo(() => generateDates(habit.periode_start, habit.periode_end), [habit.periode_start, habit.periode_end])
  const weeks      = useMemo(() => groupIntoWeeks(allDates), [allDates])
  const missedDays = useMemo(() => allDates.filter(d => d < today && !checkedDates.has(d)).length, [allDates, checkedDates, today])

  const { dowChecked, dowTotal } = useMemo(() => {
    const dowChecked = Array(7).fill(0), dowTotal = Array(7).fill(0)
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
          <div key="badge" className="rounded-[16px] px-6 py-5 flex items-center gap-4 border-2" style={{ background: badge.bg, borderColor: `${badge.color}33` }}>
            <div className="shrink-0">{badge.icon}</div>
            <div>
              <div className="text-xl font-extrabold font-heading mb-1" style={{ color: badge.color }}>{badge.label}</div>
              <div className="text-[13px] leading-relaxed font-body" style={{ color: badge.color, opacity: 0.85 }}>{badge.desc}</div>
            </div>
          </div>
        )

      case 'summary_text':
        return (
          <div key="summary_text" className="bg-surface rounded-md border border-border px-[18px] py-3.5">
            <div className="text-[13px] font-bold text-ink font-body mb-2 flex items-center gap-1.5">
              <ClipboardList size={14} /> Ringkasan Performa
            </div>
            <div className="text-[13px] text-muted leading-[1.8] font-body">
              Selama periode <strong className="text-ink">{habit.periode_start}</strong> hingga{' '}
              <strong className="text-ink">{habit.periode_end}</strong>, kamu berhasil menyelesaikan{' '}
              <strong className="text-primary">{habit.total_completed_days} dari {habit.total_period_days} hari</strong> target
              dengan progress akhir <strong className="text-primary">{progress}%</strong>.
              Streak terpanjangmu adalah <strong className="text-[#f97316]">{habit.longest_streak} hari</strong> berturut-turut.
            </div>
          </div>
        )

      case 'stats':
        return (
          <div key="stats" className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'Progress', value: `${progress}%`,                      icon: <TrendingUp size={18} color="#16a34a" />, color: '#16a34a' },
              { label: 'Selesai',  value: `${habit.total_completed_days} hari`, icon: <CheckCircle size={18} color="#16a34a" />, color: '#16a34a' },
              { label: 'Terlewat', value: `${missedDays} hari`,                 icon: <XCircle size={18} color="#dc2626" />,     color: '#dc2626' },
              { label: 'Streak',   value: habit.current_streak,                 icon: <Trophy size={18} color="#f97316" />,      color: '#f97316' },
            ].map(s => (
              <div key={s.label} className="bg-surface rounded-md border border-border px-2 py-3 text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-sm font-bold font-heading flex items-center justify-center gap-[3px]" style={{ color: s.color }}>
                  {s.label === 'Streak' && <Flame size={13} color="#f97316" />}{s.value}
                </div>
                <div className="text-[11px] text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )

      case 'progress_bar':
        return (
          <div key="progress_bar">
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-muted font-body">Progress ({habit.total_completed_days}/{habit.total_period_days} hari)</span>
              <span className={`text-[13px] font-bold ${isFinal ? 'text-primary' : 'text-muted'}`}>{progress}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width_0.8s_ease]"
                style={{
                  width: `${progress}%`,
                  background: isFinal ? 'linear-gradient(90deg,#16a34a,#10b981)' : '#16a34a',
                }}
              />
            </div>
          </div>
        )

      case 'day_analysis':
        return (
          <div key="day_analysis">
            <div className="text-sm font-bold text-ink font-heading mb-3.5 flex items-center gap-1.5">
              <Calendar size={14} /> Konsistensi per Hari
            </div>
            <div className="flex gap-1.5 items-end h-[72px]">
              {DAY_LABELS.map((label, i) => {
                const done  = dowChecked[i], total = dowTotal[i]
                const pct   = total > 0 ? (done / maxDow) * 100 : 0
                const isBest  = i === bestIdx && total > 0
                const isWorst = i === worstIdx && total > 0 && bestIdx !== worstIdx
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] font-bold" style={{ color: isBest ? '#16a34a' : isWorst ? '#dc2626' : '#4b7a54' }}>
                      {total > 0 ? done : '–'}
                    </div>
                    <div
                      className="w-full rounded-t-[4px] transition-[height_0.5s_ease]"
                      style={{
                        minHeight: 4,
                        height: `${Math.max(pct * 0.52, total > 0 ? 6 : 4)}px`,
                        background: isBest ? 'linear-gradient(180deg,#16a34a,#10b981)'
                          : isWorst ? '#fca5a5'
                          : total > 0 ? '#dcfce7' : '#d1fae5',
                      }}
                    />
                    <div className="text-[10px] font-semibold" style={{ color: isBest ? '#16a34a' : isWorst ? '#dc2626' : '#4b7a54' }}>
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3.5 mt-2.5 flex-wrap">
              {dowTotal[bestIdx] > 0 && (
                <span className="text-xs text-primary font-body inline-flex items-center gap-1">
                  <Star size={12} color="#16a34a" fill="#16a34a" /> Terbaik: <strong>{DAY_NAMES[bestIdx]}</strong>
                </span>
              )}
              {bestIdx !== worstIdx && dowTotal[worstIdx] > 0 && (
                <span className="text-xs text-error font-body">• Perlu perhatian: <strong>{DAY_NAMES[worstIdx]}</strong></span>
              )}
            </div>
          </div>
        )

      case 'calendar':
        return (
          <div key="calendar">
            <div className="text-sm font-bold text-ink font-heading mb-3 flex items-center gap-1.5">
              <Calendar size={14} /> Riwayat Hari-hari
            </div>
            <div className="flex gap-3 mb-3.5 flex-wrap">
              {(['done','missed','future','today-pending'] as DayStatus[]).map(status => (
                <div key={status} className="flex items-center gap-[5px] text-[11px] text-muted">
                  <div
                    className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[9px] font-bold"
                    style={{ background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color }}
                  >{STATUS_STYLE[status].label}</div>
                  {LEGEND_LABELS[status]}
                </div>
              ))}
            </div>
            {calLoading ? (
              <div className="text-center py-6 text-muted text-[13px]">Memuat kalender...</div>
            ) : (
              <CalendarGrid weeks={weeks} checkedDates={checkedDates} today={today} />
            )}
          </div>
        )

      case 'streak_info':
        return (
          <div key="streak_info" className="bg-surface rounded-md border border-border px-4 py-3 flex items-center gap-3">
            <Trophy size={22} color="#10b981" />
            <div>
              <div className="text-[13px] font-bold text-ink font-body">
                Longest Streak: {habit.longest_streak} hari berturut-turut
              </div>
              <div className="text-xs text-muted mt-0.5">Current streak: {habit.current_streak} hari</div>
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
      className="fixed inset-0 z-[400] bg-[rgba(11,26,14,0.6)] backdrop-blur-[5px] flex items-center justify-center p-5"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl shadow-float w-full max-w-[580px] max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-border flex justify-between items-start gap-3 sticky top-0 bg-white z-[1] rounded-t-xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-heading text-lg font-extrabold text-ink m-0">{habit.title}</h2>
              <span className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full inline-flex items-center gap-1 ${isFinal ? 'bg-primary-light text-primary' : 'bg-[#eff6ff] text-[#1d4ed8]'}`}>
                <BarChart2 size={11} /> {isFinal ? 'Laporan Final' : 'Laporan Progress'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted">{habit.category}</span>
              <span className="text-xs text-subtle">•</span>
              <span className="text-xs text-muted">{habit.periode_start} s/d {habit.periode_end}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowSnapshot(true)}
              title="Buat snapshot"
              className="h-8 px-3 rounded-[8px] border border-border bg-primary-light cursor-pointer text-xs font-bold text-primary font-body flex items-center gap-[5px]"
            ><Camera size={14} /> Share</button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] border border-border bg-surface cursor-pointer flex items-center justify-center"
            ><X size={16} /></button>
          </div>
        </div>

        <div className="px-7 py-5 flex flex-col gap-5">
          {report.sections.map(section => renderSection(section))}
        </div>
      </div>

      {showSnapshot && (
        <SnapshotEditor
          habit={habit}
          onClose={() => setShowSnapshot(false)}
          onPosted={() => setShowSnapshot(false)}
        />
      )}
    </div>
  )
}
