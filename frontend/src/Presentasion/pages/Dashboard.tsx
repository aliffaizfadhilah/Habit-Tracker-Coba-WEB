import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStreak, type HabitStreak } from '../../BusinessLogic/hooks/useStreak'
import HabitReportModal from '../components/HabitReportModal'
import { useDashboard } from '../../BusinessLogic/hooks/useDashboard'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { http } from '../../BusinessLogic/services/HttpService'
import { notifyHabitUpdated } from '../../BusinessLogic/hooks/useHabitRealtime'
import { habitRepository } from '../../BusinessLogic/repositories/HabitRepository'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import RiwayatDrawer from '../components/RiwayatDrawer'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'
import {
  CheckSquare, Flame, Trophy, TrendingUp,
  BarChart2, Lock, Loader2, Check, Sprout,
  Search, AlertTriangle, Menu, Sparkles, Star, Zap, History,
} from 'lucide-react'

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  'flame':       <Flame size={16} color="#f97316" />,
  'trending-up': <TrendingUp size={16} color="#16a34a" />,
  'star':        <Star size={16} color="#f59e0b" />,
  'zap':         <Zap size={16} color="#ef4444" />,
}

type FilterType = 'semua' | 'selesai_hari_ini' | 'selesai' | 'belum_selesai'

const StatCard: React.FC<{
  label: string; value: string; icon: React.ReactNode
  iconBg: string; barColor: string; barWidth: number
}> = ({ label, value, icon, iconBg, barColor, barWidth }) => (
  <div className="bg-white border border-border rounded-[16px] px-5 py-[18px] shadow-card transition-all cursor-default hover:-translate-y-0.5 hover:shadow-green hover:border-border-mid">
    <div className="flex justify-between items-start mb-3">
      <span className="text-[11px] font-bold tracking-[.05em] uppercase text-muted">{label}</span>
      <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: iconBg }}>{icon}</div>
    </div>
    <div className="text-[28px] font-bold text-ink font-body leading-tight">{value}</div>
    <div className="h-[3px] bg-primary-light rounded-full mt-3 overflow-hidden">
      <div className="h-full rounded-full transition-[width_0.8s_ease]" style={{ width: `${barWidth}%`, background: barColor }} />
    </div>
  </div>
)

const DashCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-border rounded-[18px] p-[22px_24px] shadow-card ${className}`}>
    {children}
  </div>
)

const FilterTabBar: React.FC<{
  active: FilterType
  onChange: (f: FilterType) => void
  counts: Record<FilterType, number>
}> = ({ active, onChange, counts }) => {
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'semua',            label: 'Semua'           },
    { key: 'selesai_hari_ini', label: 'Selesai Hari Ini' },
    { key: 'selesai',          label: 'Selesai'         },
    { key: 'belum_selesai',    label: 'Belum Selesai'   },
  ]
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3.5 py-[7px] rounded-[10px] border-[1.5px] font-body text-[13px] cursor-pointer transition-all flex items-center gap-1.5
            ${active === t.key ? 'border-primary bg-primary-light text-primary font-bold' : 'border-border bg-white text-muted font-medium'}`}
        >
          {t.label}
          <span className={`text-[11px] font-bold px-[7px] py-[1px] rounded-[10px] ${active === t.key ? 'bg-primary text-white' : 'bg-primary-light text-primary'}`}>
            {counts[t.key]}
          </span>
        </button>
      ))}
    </div>
  )
}

const InsightItem: React.FC<{ icon: string; bg: string; title: string; sub: string }> = ({ icon, bg, title, sub }) => (
  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-[12px] bg-surface border border-border">
    <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shrink-0" style={{ background: bg }}>
      {INSIGHT_ICONS[icon] ?? null}
    </div>
    <div>
      <div className="text-[12.5px] font-semibold text-ink leading-snug">{title}</div>
      <div className="text-[11px] text-muted mt-0.5">{sub}</div>
    </div>
  </div>
)

const WeeklyBar: React.FC<{ day: string; val: number; maxBar: number; isToday: boolean }> = ({ day, val, maxBar, isToday }) => {
  const h = Math.max(8, (val / maxBar) * 100)
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <span className="text-[11px] font-bold text-muted">{val}</span>
      <div
        className="w-full rounded-t-[6px] transition-all duration-[600ms] cubic-bezier(.34,1.56,.64,1)"
        style={{ background: isToday ? '#16a34a' : '#a7f3d0', height: h }}
      />
      <span className={`text-[11px] ${isToday ? 'text-primary font-bold' : 'text-muted font-medium'}`}>{day}</span>
    </div>
  )
}

const AtRiskItem: React.FC<{ name: string; label: string; level: 'high' | 'mid' | 'ok' }> = ({ name, label, level }) => {
  const s = {
    high: { bg: '#fef2f2', color: '#dc2626', itemBg: '#fff8f8' },
    mid:  { bg: '#fff7ed', color: '#ea580c', itemBg: '#fffbf5' },
    ok:   { bg: '#dcfce7', color: '#16a34a', itemBg: '#f0fdf4' },
  }[level]
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] border border-border" style={{ background: s.itemBg }}>
      <div
        className="w-[10px] h-[10px] rounded-full shrink-0"
        style={{ background: level === 'high' ? '#ef4444' : level === 'mid' ? '#f59e0b' : '#22c55e' }}
      />
      <span className="text-[13px] font-semibold text-ink flex-1">{name}</span>
      <span className="text-[11px] font-bold px-[9px] py-[3px] rounded-[20px]" style={{ background: s.bg, color: s.color }}>{label}</span>
    </div>
  )
}

const HabitStreakCard: React.FC<{
  habit:     HabitStreak
  onRefetch: () => Promise<void>
  onReport:  (habit: HabitStreak) => void
}> = ({ habit, onRefetch, onReport }) => {
  const today      = new Date().toISOString().slice(0, 10)
  const progress   = Number(habit.progress_percent)
  const isComplete = habitCompletionService.isComplete(habit)
  const isExpired  = !isComplete && habit.periode_end < today
  const isLocked   = isComplete || isExpired
  const [checking, setChecking] = useState(false)

  const handleToggleCheck = async () => {
    if (isLocked) return
    setChecking(true)
    try {
      await http.post(`/api/habits/${habit.id_habit}/check-today`, {})
      habitRepository.invalidate()
      notifyHabitUpdated()
    }
    catch { /* silent */ }
    finally { setChecking(false) }
  }

  const catColor: Record<string, string> = {
    'Ilmu Pengetahuan': '#10b981',
    'Kesehatan':        '#f97316',
    'Mental':           '#16a34a',
    'Produktivitas':    '#7c3aed',
  }
  const barColor = catColor[habit.category] ?? '#16a34a'

  return (
    <div className={`bg-white border-[1.5px] ${isComplete ? 'border-border-mid' : isExpired ? 'border-[#fde68a]' : 'border-border'} rounded-[16px] px-6 py-5 shadow-card transition-all relative overflow-hidden hover:border-border-mid hover:shadow-green`}>
      {isComplete && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-accent" />
      )}
      {isExpired && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]" />
      )}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-[15px] text-ink">{habit.title}</span>
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-primary-light text-primary">
              {habit.category}
            </span>
            {isComplete && (
              <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-success-bg text-[#065f46]">Selesai</span>
            )}
            {isExpired && (
              <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[#fff7ed] text-[#c2410c]">Periode Berakhir</span>
            )}
            {!isLocked && habit.checked_today && (
              <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-success-bg text-[#065f46]">Hari Ini ✓</span>
            )}
          </div>
          <span className="text-xs text-muted">{habit.periode_start} s/d {habit.periode_end}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReport(habit)}
            title="Lihat laporan"
            className="w-9 h-9 rounded-[9px] border border-border bg-primary-light cursor-pointer flex items-center justify-center transition-all"
          ><BarChart2 size={16} color="#16a34a" /></button>

          {isLocked ? (
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center opacity-50 cursor-not-allowed shrink-0"
              style={{ borderColor: isExpired ? '#fde68a' : undefined }}
              title={isExpired ? 'Periode berakhir' : 'Habit selesai'}
            >
              <Lock size={16} />
            </div>
          ) : (
            <button
              onClick={handleToggleCheck}
              disabled={checking}
              title={habit.checked_today ? 'Batalkan check hari ini' : 'Check hari ini'}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
              style={{
                borderColor: habit.checked_today ? '#16a34a' : '#d1fae5',
                background: habit.checked_today ? '#16a34a' : checking ? '#dcfce7' : '#fff',
                color: habit.checked_today ? '#fff' : '#16a34a',
                cursor: checking ? 'wait' : 'pointer',
              }}
            >
              {checking ? <Loader2 size={18} className="animate-spin-fast" /> : <Check size={18} />}
            </button>
          )}

          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Flame size={16} color="#f97316" />
              <span className="text-lg font-bold text-[#f97316] font-body">{habit.current_streak}</span>
            </div>
            <span className="text-[11px] text-muted">current streak</span>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="bg-primary-light border border-border-mid rounded-[8px] px-3 py-[7px] mb-2.5 text-xs text-primary-mid flex items-center gap-1.5">
          <Lock size={13} /> Habit ini sudah selesai dan tidak dapat diubah lagi.
        </div>
      )}
      {isExpired && (
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[8px] px-3 py-[7px] mb-2.5 text-xs text-[#92400e] flex items-center gap-1.5">
          <Lock size={13} /> Periode habit ini sudah berakhir dan tidak dapat diubah lagi.
        </div>
      )}

      <div className="mb-2.5">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-muted">Progress ({habit.total_completed_days}/{habit.total_period_days} hari)</span>
          <span className={`text-xs font-bold ${isComplete ? 'text-primary' : 'text-muted'}`}>{progress}%</span>
        </div>
        <div className="h-2 bg-primary-light rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width_0.6s_ease]"
            style={{ width: `${progress}%`, background: isComplete ? 'linear-gradient(90deg,#16a34a,#10b981)' : barColor }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted flex items-center gap-1"><Trophy size={12} color="#10b981" /> Longest streak:</span>
        <span className="text-xs font-semibold text-ink">{habit.longest_streak} hari</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout, setShowLogout]       = useState(false)
  const [filter, setFilter]               = useState<FilterType>('semua')
  const [showRiwayat, setShowRiwayat]     = useState(false)
  const [reportTarget, setReportTarget]   = useState<HabitStreak | null>(null)
  const { habits, summary, loading, error, refetch } = useStreak()
  const { user, logout } = useAuth()
  const { weeklyData, insights, atRisk } = useDashboard(habits)

  const completedToday = useMemo(() => habits.filter(h => h.checked_today).length, [habits])
  const displayUser = {
    full_name: user?.full_name ?? 'Pengguna',
    email:     user?.email    ?? '',
    username:  user?.username ?? 'Pengguna',
  }
  const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const maxBar = Math.max(...weeklyData.map(d => d.val), 1)

  const filteredHabits = useMemo(() => {
    if (filter === 'selesai_hari_ini') return habits.filter(h => h.checked_today)
    if (filter === 'selesai')          return habits.filter(h => Number(h.progress_percent) === 100)
    if (filter === 'belum_selesai')    return habits.filter(h => Number(h.progress_percent) < 100)
    return habits
  }, [habits, filter])

  const filterCounts = useMemo(() => ({
    semua:            habits.length,
    selesai_hari_ini: habits.filter(h => h.checked_today).length,
    selesai:          habits.filter(h => Number(h.progress_percent) === 100).length,
    belum_selesai:    habits.filter(h => Number(h.progress_percent) < 100).length,
  }), [habits])

  return (
    <div className="flex min-h-screen bg-surface font-body">
      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="dashboard"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 flex flex-col gap-6 ${isMobile ? 'p-5 px-4' : 'p-7 px-8'}`}>

        {/* TOP BAR */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen((o: boolean) => !o)}
              className="w-[34px] h-[34px] border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
            ><Menu size={16} /></button>
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-[22px]'} font-bold text-ink font-body`}>Dashboard</div>
              {!isMobile && <div className="text-[13px] text-muted mt-0.5">{dateStr} — Semangat hari ini!</div>}
            </div>
          </div>
          <button
            onClick={() => setShowRiwayat(true)}
            className="px-5 py-[9px] bg-white text-ink border border-border rounded-[10px] font-body text-[13px] font-bold cursor-pointer flex items-center gap-1.5 shadow-card hover:border-primary hover:text-primary transition-colors"
          ><History size={15} /> Riwayat</button>
        </div>

        {/* GREETING BANNER */}
        <div
          className={`rounded-xl ${isMobile ? 'p-5' : 'p-6 px-7'} flex items-center justify-between overflow-hidden relative`}
          style={{ background: 'linear-gradient(125deg,#16a34a 0%,#10b981 60%,#34d399 100%)' }}
        >
          <div className="absolute -right-10 -top-10 w-[220px] h-[220px] rounded-full bg-white/[.07]" />
          <div className="absolute right-[60px] -bottom-[60px] w-[140px] h-[140px] rounded-full bg-white/[.05]" />
          <div className="relative z-[1]">
            <h1 className={`${isMobile ? 'text-[17px]' : 'text-[21px]'} font-bold text-white mb-1 font-body`}>
              Halo, {displayUser.full_name || displayUser.username}! 👋
            </h1>
            <p className="text-[13px] text-white/85 m-0">
              Kamu sudah {summary.total_current_streak} hari berturut-turut — terus pertahankan!
            </p>
            <div className="flex gap-2 mt-3.5 flex-wrap">
              {[
                { icon: <Flame size={12} />,       text: `${summary.total_current_streak} hari streak` },
                { icon: <CheckSquare size={12} />, text: `${completedToday}/${summary.total_habits} selesai hari ini` },
                { icon: <TrendingUp size={12} />,  text: `${summary.avg_progress}% avg progress` },
              ].map((b, i) => (
                <span key={i} className="bg-white/[.18] border border-white/25 rounded-[30px] px-3 py-[5px] text-xs font-semibold text-white inline-flex items-center gap-[5px]">
                  {b.icon}{b.text}
                </span>
              ))}
            </div>
          </div>
          {!isMobile && <div className="text-[64px] relative z-[1] drop-shadow-[0_4px_12px_rgba(0,0,0,.15)]">🌿</div>}
        </div>

        {/* STAT CARDS */}
        <div className={`grid gap-3.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <StatCard label="Total Habit"    value={loading ? '...' : String(summary.total_habits)}        icon={<CheckSquare size={18} color="#16a34a" />}  iconBg="#dcfce7"  barColor="#16a34a"  barWidth={80} />
          <StatCard label="Total Streak"   value={loading ? '...' : `${summary.total_current_streak}d`}  icon={<Flame size={18} color="#f97316" />}         iconBg="#fff7ed"  barColor="#f97316"  barWidth={65} />
          <StatCard label="Longest Streak" value={loading ? '...' : `${summary.longest_streak}d`}        icon={<Trophy size={18} color="#10b981" />}        iconBg="#dcfce7"  barColor="#10b981"  barWidth={90} />
          <StatCard label="Avg Progress"   value={loading ? '...' : `${summary.avg_progress}%`}          icon={<TrendingUp size={18} color="#16a34a" />}    iconBg="#f0fdf4"  barColor="#16a34a"  barWidth={summary.avg_progress} />
        </div>

        {/* CHART + INSIGHTS */}
        <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_340px]'}`}>
          <DashCard>
            <div className="flex items-start justify-between mb-[18px]">
              <div>
                <div className="text-[15px] font-bold text-ink font-body">Penyelesaian Mingguan</div>
                <div className="text-xs text-muted mt-0.5">Jumlah habit selesai per hari</div>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-[20px] bg-primary-light text-primary">7 hari</span>
            </div>
            <div className="flex items-end gap-2 h-[120px]">
              {weeklyData.map(d => (
                <WeeklyBar key={d.day} day={d.day} val={d.val} maxBar={maxBar} isToday={d.isToday ?? false} />
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-3.5">
              {[['#a7f3d0', 'Hari lalu'], ['#16a34a', 'Hari ini']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-[5px] text-[11px] text-muted">
                  <div className="w-[10px] h-[10px] rounded-[3px]" style={{ background: color }} />{label}
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard>
            <div className="flex items-center justify-between mb-[18px]">
              <div>
                <div className="text-[15px] font-bold text-ink font-body">Insight Minggu Ini</div>
                <div className="text-xs text-muted mt-0.5">Analisis otomatis untukmu</div>
              </div>
              <Sparkles size={18} color="#16a34a" />
            </div>
            <div className="flex flex-col gap-2.5">
              {insights.map((ins, i) => (
                <InsightItem key={i} icon={ins.icon} bg={ins.bg} title={ins.title} sub={ins.sub} />
              ))}
            </div>
          </DashCard>
        </div>

        {/* HABIT STREAK LIST */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="font-body text-lg font-bold text-ink m-0">Streak & Progress Habitmu</h2>
              <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-primary-light text-primary">
                {summary.total_habits} habit
              </span>
            </div>
            <button
              onClick={() => navigate('/habits')}
              className="px-[18px] py-2 bg-primary text-white border-none rounded-[10px] text-[13px] font-bold cursor-pointer shadow-green"
            >+ Tambah Habit</button>
          </div>

          {error && (
            <div className="bg-error-bg border border-[#fecaca] rounded-md px-5 py-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-error flex items-center gap-1.5"><AlertTriangle size={14} /> {error}</span>
              <button onClick={refetch} className="px-3.5 py-1.5 rounded-[8px] border border-border bg-white text-ink cursor-pointer text-[13px] font-semibold">Coba Lagi</button>
            </div>
          )}

          {!loading && habits.length > 0 && (
            <div className="mb-5"><FilterTabBar active={filter} onChange={setFilter} counts={filterCounts} /></div>
          )}

          {loading && (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-[120px] bg-primary-light rounded-[16px] opacity-40" />)}
            </div>
          )}

          {!loading && habits.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-[72px] h-[72px] rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                <Sprout size={32} color="#16a34a" />
              </div>
              <div className="text-base font-bold text-ink mb-2 font-body">Belum ada habit</div>
              <div className="text-sm text-muted mb-5 leading-relaxed">Tambahkan habit pertamamu untuk mulai melacak streak dan progress!</div>
              <button onClick={() => navigate('/habits')} className="px-[18px] py-2 bg-primary text-white border-none rounded-[10px] text-[13px] font-bold cursor-pointer">
                + Tambah Habit
              </button>
            </div>
          )}

          {!loading && habits.length > 0 && filteredHabits.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-[72px] h-[72px] rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                <Search size={32} color="#16a34a" />
              </div>
              <div className="text-base font-bold text-ink mb-2 font-body">Tidak ada habit</div>
              <div className="text-sm text-muted leading-relaxed">
                {filter === 'selesai'          ? 'Belum ada habit yang selesai 100%.' :
                 filter === 'selesai_hari_ini' ? 'Belum ada habit yang diceklis hari ini.' :
                 'Semua habit sudah selesai!'}
              </div>
            </div>
          )}

          {!loading && filteredHabits.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredHabits.map(habit => (
                <HabitStreakCard key={habit.id_habit} habit={habit} onRefetch={refetch} onReport={setReportTarget} />
              ))}
            </div>
          )}
        </div>

        {/* AT RISK */}
        <DashCard className="max-w-[600px]">
          <div className="text-[15px] font-bold text-ink font-body mb-3 flex items-center gap-1.5">
            <AlertTriangle size={15} color="#f97316" /> Perlu Perhatian
          </div>
          <div className="flex flex-col gap-2">
            {atRisk.map(r => (
              <AtRiskItem key={r.name} name={r.name} label={r.label} level={r.level} />
            ))}
          </div>
        </DashCard>

      </main>

      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={async () => { setShowLogout(false); await logout() }} />}
      <RiwayatDrawer habits={habits} open={showRiwayat} onClose={() => setShowRiwayat(false)} />
      {reportTarget && <HabitReportModal habit={reportTarget} onClose={() => setReportTarget(null)} />}
    </div>
  )
}
