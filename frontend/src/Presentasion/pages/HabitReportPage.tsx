import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { http } from '../../BusinessLogic/services/HttpService'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'
import { createReport, type SectionType } from '../../BusinessLogic/services/HabitReportPrototype'
import SnapshotEditor from '../components/SnapshotEditor'
import type { ReportableHabit } from '../components/HabitReportModal'
import { ArrowLeft, Trophy, Medal, Dumbbell, TrendingUp, CheckCircle, XCircle, Flame, Camera, BarChart2, Calendar, Star, ClipboardList } from 'lucide-react'

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const DAY_NAMES  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

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

function dayStatus(d: string, checked: Set<string>, today: string): DayStatus {
  if (d === today) return checked.has(d) ? 'today-done' : 'today-pending'
  if (checked.has(d)) return 'done'
  if (d < today) return 'missed'
  return 'future'
}

const STATUS_STYLE: Record<DayStatus, { bg: string; color: string; label: string }> = {
  'done':          { bg: '#dcfce7', color: '#16a34a', label: '✓' },
  'missed':        { bg: '#fee2e2', color: '#dc2626', label: '✗' },
  'future':        { bg: '#f3f4f6', color: '#86a98d', label: '·' },
  'today-done':    { bg: '#16a34a', color: '#fff',    label: '✓' },
  'today-pending': { bg: '#fff7ed', color: '#ea580c', label: '!' },
}

const LEGEND_LABELS: Record<DayStatus, string> = {
  'done': '✓ Selesai', 'missed': '✗ Terlewat', 'future': '· Belum',
  'today-done': '✓ Selesai', 'today-pending': '! Hari ini',
}

function getBadge(progress: number) {
  if (progress >= 100) return { icon: <Trophy   size={52} color="#15803d" />, label: 'Luar Biasa!',        color: '#15803d', bg: '#dcfce7', desc: 'Kamu berhasil menyelesaikan semua target habit ini dengan sempurna!' }
  if (progress >= 80)  return { icon: <Medal    size={52} color="#1d4ed8" />, label: 'Hampir Sempurna',    color: '#1d4ed8', bg: '#dbeafe', desc: 'Konsistensimu sangat baik. Sedikit lagi kamu bisa mencapai 100%!' }
  if (progress >= 50)  return { icon: <Medal    size={52} color="#b45309" />, label: 'Cukup Baik',         color: '#b45309', bg: '#fef3c7', desc: 'Kamu sudah berusaha lebih dari setengahnya. Terus tingkatkan!' }
  return                      { icon: <Dumbbell size={52} color="#dc2626" />, label: 'Perlu Ditingkatkan', color: '#dc2626', bg: '#fee2e2', desc: 'Jadikan pengalaman ini pelajaran berharga untuk habit berikutnya.' }
}

export default function HabitReportPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const [habit,        setHabit]        = useState<ReportableHabit | null>(null)
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set())
  const [loading,      setLoading]      = useState(true)
  const [calLoading,   setCalLoading]   = useState(true)
  const [showSnapshot, setShowSnapshot] = useState(false)
  const [notFound,     setNotFound]     = useState(false)

  useEffect(() => {
    if (!id) return
    http.get<{ success: boolean; data: ReportableHabit }>(`/api/habits/${id}`)
      .then(res => { if (res.success) setHabit(res.data); else setNotFound(true) })
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
      <p className="text-muted text-[14px] font-body">Memuat laporan...</p>
    </div>
  )

  if (notFound || !habit) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted text-[14px] font-body mb-4">Habit tidak ditemukan.</p>
        <button onClick={() => navigate('/habits')} className="text-primary text-[13px] bg-transparent border-none cursor-pointer font-body">← Kembali ke Habits</button>
      </div>
    </div>
  )

  const today      = new Date().toISOString().slice(0, 10)
  const isFinal    = habitCompletionService.isComplete(habit) || today > habit.periode_end
  const report     = createReport(isFinal)
  const progress   = Number(habit.progress_percent)
  const badge      = getBadge(progress)
  const allDates   = useMemo(() => generateDates(habit.periode_start, habit.periode_end), [habit])
  const weeks      = useMemo(() => groupIntoWeeks(allDates), [allDates])
  const missedDays = allDates.filter(d => d < today && !checkedDates.has(d)).length

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
          <div key="summary_text" className="bg-white rounded-lg border border-border px-[18px] py-3.5 shadow-card">
            <div className="text-[13px] font-bold text-ink font-body mb-2 flex items-center gap-1.5"><ClipboardList size={14} /> Ringkasan Performa</div>
            <div className="text-[13px] text-muted leading-[1.8] font-body">
              Selama periode <strong className="text-ink">{habit.periode_start}</strong> hingga <strong className="text-ink">{habit.periode_end}</strong>, kamu berhasil menyelesaikan <strong className="text-primary">{habit.total_completed_days} dari {habit.total_period_days} hari</strong> target dengan progress akhir <strong className="text-primary">{progress}%</strong>. Streak terpanjangmu adalah <strong className="text-[#f97316]">{habit.longest_streak} hari</strong> berturut-turut.
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
              <div key={s.label} className="bg-white rounded-lg border border-border px-2 py-3 text-center shadow-card">
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
          <div key="progress_bar" className="bg-white rounded-lg border border-border p-4 shadow-card">
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-muted font-body">Progress ({habit.total_completed_days}/{habit.total_period_days} hari)</span>
              <span className={`text-[13px] font-bold ${isFinal ? 'text-primary' : 'text-muted'}`}>{progress}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-[width_0.8s_ease]"
                style={{ width: `${progress}%`, background: isFinal ? 'linear-gradient(90deg,#16a34a,#10b981)' : '#16a34a' }}
              />
            </div>
          </div>
        )
      case 'day_analysis':
        return (
          <div key="day_analysis" className="bg-white rounded-lg border border-border p-4 shadow-card">
            <div className="text-sm font-bold text-ink font-heading mb-3.5 flex items-center gap-1.5"><Calendar size={14} /> Konsistensi per Hari</div>
            <div className="flex gap-1.5 items-end h-[72px]">
              {DAY_LABELS.map((label, i) => {
                const done = dowChecked[i], total = dowTotal[i]
                const pct  = total > 0 ? (done / maxDow) * 100 : 0
                const isBest = i === bestIdx && total > 0, isWorst = i === worstIdx && total > 0 && bestIdx !== worstIdx
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] font-bold" style={{ color: isBest ? '#16a34a' : isWorst ? '#dc2626' : '#4b7a54' }}>{total > 0 ? done : '–'}</div>
                    <div className="w-full rounded-t-[4px]" style={{ minHeight: 4, height: `${Math.max(pct * 0.52, total > 0 ? 6 : 4)}px`, background: isBest ? 'linear-gradient(180deg,#16a34a,#10b981)' : isWorst ? '#fca5a5' : total > 0 ? '#dcfce7' : '#d1fae5' }} />
                    <div className="text-[10px] font-semibold" style={{ color: isBest ? '#16a34a' : isWorst ? '#dc2626' : '#4b7a54' }}>{label}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3.5 mt-2.5 flex-wrap">
              {dowTotal[bestIdx] > 0 && <span className="text-xs text-primary font-body inline-flex items-center gap-1"><Star size={12} color="#16a34a" fill="#16a34a" /> Terbaik: <strong>{DAY_NAMES[bestIdx]}</strong></span>}
              {bestIdx !== worstIdx && dowTotal[worstIdx] > 0 && <span className="text-xs text-error font-body">• Perlu perhatian: <strong>{DAY_NAMES[worstIdx]}</strong></span>}
            </div>
          </div>
        )
      case 'calendar':
        return (
          <div key="calendar" className="bg-white rounded-lg border border-border p-4 shadow-card">
            <div className="text-sm font-bold text-ink font-heading mb-3 flex items-center gap-1.5"><Calendar size={14} /> Riwayat Hari-hari</div>
            <div className="flex gap-3 mb-3.5 flex-wrap">
              {(['done','missed','future','today-pending'] as DayStatus[]).map(status => (
                <div key={status} className="flex items-center gap-[5px] text-[11px] text-muted">
                  <div className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[9px] font-bold" style={{ background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color }}>{STATUS_STYLE[status].label}</div>
                  {LEGEND_LABELS[status]}
                </div>
              ))}
            </div>
            {calLoading ? <div className="text-center py-6 text-muted text-[13px]">Memuat kalender...</div> : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1 mb-1 min-w-[280px]">{DAY_LABELS.map(d => <div key={d} className="text-center text-[10px] font-bold text-muted py-[2px]">{d}</div>)}</div>
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1 mb-1 min-w-[280px]">
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} />
                      const st = STATUS_STYLE[dayStatus(dateStr, checkedDates, today)]
                      return (
                        <div key={di} title={dateStr} className="rounded-[6px] py-[5px] px-[2px] flex flex-col items-center text-[10px] font-semibold border-2"
                          style={{ background: st.bg, color: st.color, borderColor: dateStr === today ? '#16a34a' : 'transparent' }}>
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
        )
      case 'streak_info':
        return (
          <div key="streak_info" className="bg-white rounded-lg border border-border px-4 py-3 shadow-card flex items-center gap-3">
            <Trophy size={22} color="#10b981" />
            <div>
              <div className="text-[13px] font-bold text-ink font-body">Longest Streak: {habit.longest_streak} hari berturut-turut</div>
              <div className="text-xs text-muted mt-0.5">Current streak: {habit.current_streak} hari</div>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body">
      <div className="max-w-[620px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg border border-border bg-white cursor-pointer flex items-center justify-center shrink-0"><ArrowLeft size={16} /></button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl font-extrabold text-ink m-0">{habit.title}</h1>
              <span className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full inline-flex items-center gap-1 ${isFinal ? 'bg-primary-light text-primary' : 'bg-[#eff6ff] text-[#1d4ed8]'}`}>
                <BarChart2 size={11} /> {isFinal ? 'Laporan Final' : 'Laporan Progress'}
              </span>
            </div>
            <p className="text-xs text-muted m-0 mt-0.5">{habit.category} · {habit.periode_start} s/d {habit.periode_end}</p>
          </div>
          <button onClick={() => setShowSnapshot(true)} className="h-8 px-3 rounded-lg border border-border bg-primary-light cursor-pointer text-xs font-bold text-primary font-body flex items-center gap-1.5 shrink-0">
            <Camera size={13} /> Share
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {report.sections.map(section => renderSection(section))}
        </div>
      </div>

      {showSnapshot && (
        <SnapshotEditor habit={habit} onClose={() => setShowSnapshot(false)} onPosted={() => setShowSnapshot(false)} />
      )}
    </div>
  )
}
