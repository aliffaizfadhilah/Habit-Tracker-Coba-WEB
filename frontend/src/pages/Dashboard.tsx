import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStreak, type HabitStreak } from '../hooks/useStreak'
import { useAuth } from '../hooks/useAuth'
import { http } from '../services/HttpService'
import { Sidebar, LogoutModal, useSidebar, tokens } from '../pages/shared/Sidebar'

const WEEKLY_DATA = [
  { day: 'Sen', val: 3 },
  { day: 'Sel', val: 2 },
  { day: 'Rab', val: 4 },
  { day: 'Kam', val: 1 },
  { day: 'Jum', val: 3 },
  { day: 'Sab', val: 2 },
  { day: 'Min', val: 4, isToday: true },
]
const INSIGHTS = [
  { icon: '🔥', bg: '#fff7ed', title: 'Baca Buku paling konsisten minggu ini', sub: '7/7 hari selesai — sempurna!' },
  { icon: '📈', bg: '#f0fdf4', title: 'Progress naik 12% vs minggu lalu',       sub: 'Pertahankan ritme ini!' },
  { icon: '⭐', bg: '#eef1ff', title: 'Senin–Rabu paling produktif',             sub: 'Rata-rata 3.2 habit selesai/hari' },
  { icon: '⚡', bg: '#fef2f2', title: 'Olahraga butuh perhatian lebih',          sub: 'Hanya 3/7 hari selesai minggu ini' },
]
const AT_RISK = [
  { name: 'Olahraga',     label: '4 hari absen', level: 'high' as const },
  { name: 'Coding 30min', label: '2 hari absen', level: 'mid'  as const },
  { name: 'Meditasi',     label: 'On track ✓',   level: 'ok'   as const },
]

type FilterType = 'semua' | 'selesai_hari_ini' | 'selesai' | 'belum_selesai'

const StatCard: React.FC<{
  label: string; value: string; icon: string
  iconBg: string; barColor: string; barWidth: number
}> = ({ label, value, icon, iconBg, barColor, barWidth }) => (
  <div style={{
    background: tokens.white, border: `1px solid ${tokens.border}`,
    borderRadius: 16, padding: '18px 20px', boxShadow: tokens.shadow,
    transition: 'all .2s', cursor: 'default',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadowLg }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = tokens.shadow }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: tokens.textMuted }}>{label}</span>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: tokens.text, letterSpacing: '-.5px', fontFamily: tokens.fontMono, lineHeight: 1 }}>{value}</div>
    <div style={{ height: 3, background: tokens.border, borderRadius: 100, marginTop: 12, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 100, width: `${barWidth}%`, background: barColor, transition: 'width .8s ease' }} />
    </div>
  </div>
)

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: 18, padding: '22px 24px', boxShadow: tokens.shadow, ...style }}>
    {children}
  </div>
)

const Badge: React.FC<{ color: 'blue' | 'green' | 'orange' | 'red'; children: React.ReactNode }> = ({ color, children }) => {
  const c = { blue: { bg: tokens.primaryLight, text: tokens.primary }, green: { bg: '#f0fdf4', text: '#10b981' }, orange: { bg: '#fff7ed', text: '#f97316' }, red: { bg: '#fef2f2', text: '#ef4444' } }[color]
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.text, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{children}</span>
}

const FilterTabBar: React.FC<{ active: FilterType; onChange: (f: FilterType) => void; counts: Record<FilterType, number> }> = ({ active, onChange, counts }) => {
  const tabs: { key: FilterType; label: string }[] = [
    { key: 'semua', label: 'Semua' }, { key: 'selesai_hari_ini', label: 'Selesai Hari Ini' },
    { key: 'selesai', label: 'Selesai' }, { key: 'belum_selesai', label: 'Belum Selesai' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${active === t.key ? tokens.primary : tokens.border}`,
          background: active === t.key ? tokens.primaryLight : tokens.white,
          color: active === t.key ? tokens.primary : tokens.textMuted,
          fontFamily: tokens.fontBody, fontSize: 13, fontWeight: active === t.key ? 700 : 500,
          cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {t.label}
          <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: active === t.key ? tokens.primary : tokens.border, color: active === t.key ? '#fff' : tokens.textMuted }}>{counts[t.key]}</span>
        </button>
      ))}
    </div>
  )
}

const EmptyState: React.FC<{ icon: string; title: string; description: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
    <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 8, fontFamily: tokens.fontHeading }}>{title}</div>
    <div style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 20, lineHeight: 1.6 }}>{description}</div>
    {action}
  </div>
)

const HabitStreakCard: React.FC<{ habit: HabitStreak; onRefetch: () => Promise<void> }> = ({ habit, onRefetch }) => {
  const progress = Number(habit.progress_percent)
  const [checking, setChecking] = useState(false)

  const handleToggleCheck = async () => {
    setChecking(true)
    try {
      await http.post(`/api/habits/${habit.id_habit}/check-today`, {})
      await onRefetch()
    } catch { /* silent */ }
    finally { setChecking(false) }
  }

  const color = ({ 'Ilmu Pengetahuan': tokens.green, 'Kesehatan': tokens.orange, 'Mental': tokens.primary, 'Produktivitas': tokens.purple } as Record<string, string>)[habit.category] || tokens.primary

  return (
    <div style={{ background: tokens.white, border: `1.5px solid ${progress === 100 ? '#a7f3d0' : tokens.border}`, borderRadius: 16, padding: '20px 24px', boxShadow: tokens.shadow, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
      {progress === 100 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#10b981,#34d399)' }} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: tokens.text }}>{habit.title}</span>
            <Badge color="blue">{habit.category}</Badge>
            {progress === 100 && <Badge color="green">Selesai ✓</Badge>}
            {habit.checked_today && <Badge color="green">Hari Ini ✓</Badge>}
          </div>
          <span style={{ fontSize: 12, color: tokens.textMuted }}>{habit.periode_start} s/d {habit.periode_end}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* ✅ Hapus disabled, ganti icon supaya keliatan bisa di-toggle */}
          <button
            onClick={handleToggleCheck}
            disabled={checking}
            title={habit.checked_today ? 'Klik untuk batalkan check hari ini' : 'Klik untuk check hari ini'}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `2px solid ${habit.checked_today ? '#10b981' : tokens.primary}`,
              background: habit.checked_today ? '#10b981' : checking ? tokens.primaryLight : tokens.white,
              color: habit.checked_today ? '#fff' : tokens.primary,
              cursor: checking ? 'wait' : 'pointer',   // ← tidak pernah not-allowed
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            {checking ? '⏳' : '✓'}
          </button>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <span>🔥</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#f97316', fontFamily: tokens.fontHeading }}>{habit.current_streak}</span>
            </div>
            <span style={{ fontSize: 11, color: tokens.textMuted }}>current streak</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: tokens.textMuted }}>Progress ({habit.total_completed_days}/{habit.total_period_days} hari)</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: progress === 100 ? '#10b981' : tokens.primary }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: tokens.border, borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 100, transition: 'width 0.6s ease', width: `${progress}%`, background: progress === 100 ? '#10b981' : `linear-gradient(90deg,${color},#6b8fff)` }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: tokens.textMuted }}>🏆 Longest streak:</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: tokens.text }}>{habit.longest_streak} hari</span>
      </div>
    </div>
  )
}
export default function Dashboard() {
  const navigate = useNavigate()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout, setShowLogout] = useState(false)
  const [filter, setFilter] = useState<FilterType>('semua')
  const { habits, summary, loading, error, refetch } = useStreak()
  const { user, logout } = useAuth()
  const completedToday = useMemo(() => habits.filter(h => h.checked_today).length, [habits])
  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }
  const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const maxBar = Math.max(...WEEKLY_DATA.map(d => d.val))

  const filteredHabits = useMemo(() => {
    if (filter === 'selesai_hari_ini') return habits.filter(h => h.checked_today)
    if (filter === 'selesai')          return habits.filter(h => Number(h.progress_percent) === 100)
    if (filter === 'belum_selesai')    return habits.filter(h => Number(h.progress_percent) < 100)
    return habits
  }, [habits, filter])

  const filterCounts = useMemo(() => ({
    semua: habits.length,
    selesai_hari_ini: habits.filter(h => h.checked_today).length,
    selesai: habits.filter(h => Number(h.progress_percent) === 100).length,
    belum_selesai: habits.filter(h => Number(h.progress_percent) < 100).length,
  }), [habits])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="dashboard"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ width: 34, height: 34, border: `1px solid ${tokens.border}`, borderRadius: 8, background: tokens.white, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>☰</button>
            <div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: tokens.text, letterSpacing: '-.3px', fontFamily: tokens.fontHeading }}>Dashboard</div>
              {!isMobile && <div style={{ fontSize: 13, color: tokens.textMuted, marginTop: 2 }}>{dateStr} — Semangat hari ini!</div>}
            </div>
          </div>
          <button onClick={() => navigate('/kelola-habit')} style={{ padding: '9px 20px', background: tokens.primary, color: '#fff', border: 'none', borderRadius: 10, fontFamily: tokens.fontBody, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(67,97,238,.3)' }}>
            ＋ Tambah Habit
          </button>
        </div>

        {/* GREETING BANNER */}
        <div style={{ background: 'linear-gradient(125deg,#4361ee 0%,#6b8fff 60%,#818cf8 100%)', borderRadius: 20, padding: isMobile ? '20px' : '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
          <div style={{ position: 'absolute', right: 60, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: isMobile ? 17 : 21, fontWeight: 800, color: '#fff', letterSpacing: '-.2px', marginBottom: 4, fontFamily: tokens.fontHeading }}>
              Halo, {displayUser.full_name || displayUser.username}! 👋
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.85)' }}>Kamu sudah {summary.total_current_streak} hari berturut-turut — terus pertahankan!</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {[`🔥 ${summary.total_current_streak} hari streak`, `✅ ${completedToday}/${summary.total_habits} selesai hari ini`, `📈 ${summary.avg_progress}% avg progress`].map(b => (
                <span key={b} style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 30, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#fff' }}>{b}</span>
              ))}
            </div>
          </div>
          {!isMobile && <div style={{ fontSize: 64, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.15))' }}>🏆</div>}
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14 }}>
          <StatCard label="Total Habit"    value={loading ? '...' : String(summary.total_habits)}       icon="✅" iconBg="#eef1ff" barColor={tokens.primary} barWidth={80} />
          <StatCard label="Total Streak"   value={loading ? '...' : `${summary.total_current_streak}d`} icon="🔥" iconBg="#fff7ed" barColor={tokens.orange}  barWidth={65} />
          <StatCard label="Longest Streak" value={loading ? '...' : `${summary.longest_streak}d`}       icon="🏆" iconBg="#f0fdf4" barColor={tokens.green}   barWidth={90} />
          <StatCard label="Avg Progress"   value={loading ? '...' : `${summary.avg_progress}%`}         icon="📈" iconBg="#f5f3ff" barColor={tokens.purple}  barWidth={summary.avg_progress} />
        </div>

        {/* WEEKLY CHART + INSIGHTS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: 20 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading }}>Penyelesaian Mingguan</div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>Jumlah habit selesai per hari</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: tokens.primaryLight, color: tokens.primary }}>7 hari</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
              {WEEKLY_DATA.map(d => {
                const h = Math.max(8, (d.val / maxBar) * 100)
                const isToday = d.isToday ?? false
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: tokens.textMuted, fontFamily: tokens.fontMono }}>{d.val}</span>
                    <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: isToday ? tokens.primary : '#c7d7fe', height: h, transition: 'all .6s cubic-bezier(.34,1.56,.64,1)' }} />
                    <span style={{ fontSize: 11, color: isToday ? tokens.primary : tokens.textMuted, fontWeight: isToday ? 700 : 500 }}>{d.day}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
              {[['#c7d7fe', 'Hari lalu'], [tokens.primary, 'Hari ini']].map(([color, label]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: tokens.textMuted }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color as string }} />{label}
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading }}>Insight Minggu Ini</div>
                <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>Analisis otomatis untukmu</div>
              </div>
              <span style={{ fontSize: 18 }}>✨</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {INSIGHTS.map((ins, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, background: tokens.bg, border: `1px solid ${tokens.border}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: ins.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{ins.icon}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: tokens.text, lineHeight: 1.5 }}>{ins.title}</div>
                    <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 2 }}>{ins.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* HABIT STREAK LIST */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 700, color: tokens.text }}>Streak & Progress Habitmu</h2>
              <Badge color="blue">{summary.total_habits} habit</Badge>
            </div>
            <button onClick={() => navigate('/kelola-habit')} style={{ padding: '8px 18px', background: tokens.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(67,97,238,.3)' }}>+ Tambah Habit</button>
          </div>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: '#b91c1c' }}>⚠ {error}</span>
              <button onClick={refetch} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${tokens.border}`, background: tokens.white, color: tokens.text, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Coba Lagi</button>
            </div>
          )}
          {!loading && habits.length > 0 && <div style={{ marginBottom: 20 }}><FilterTabBar active={filter} onChange={setFilter} counts={filterCounts} /></div>}
          {loading && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <div key={i} style={{ height: 120, background: tokens.border, borderRadius: 16, opacity: 0.5 }} />)}</div>}
          {!loading && habits.length === 0 && <EmptyState icon="🌱" title="Belum ada habit" description="Tambahkan habit pertamamu untuk mulai melacak streak dan progress!" action={<button onClick={() => navigate('/kelola-habit')} style={{ padding: '8px 18px', background: tokens.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Tambah Habit</button>} />}
          {!loading && habits.length > 0 && filteredHabits.length === 0 && <EmptyState icon="🔍" title="Tidak ada habit" description={filter === 'selesai' ? 'Belum ada habit yang selesai 100%.' : filter === 'selesai_hari_ini' ? 'Belum ada habit yang diceklis hari ini.' : 'Semua habit sudah selesai! 🎉'} />}
          {!loading && filteredHabits.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredHabits.map(habit => <HabitStreakCard key={habit.id_habit} habit={habit} onRefetch={refetch} />)}
            </div>
          )}
        </div>

        {/* AT RISK */}
        <Card style={{ maxWidth: 600 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading, marginBottom: 12 }}>⚠ Perlu Perhatian</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AT_RISK.map(r => {
              const s = { high: { bg: '#fef2f2', color: '#dc2626', itemBg: '#fff5f5' }, mid: { bg: '#fff7ed', color: '#ea580c', itemBg: '#fffbf5' }, ok: { bg: '#f0fdf4', color: '#16a34a', itemBg: '#f7fdf7' } }[r.level]
              return (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: s.itemBg, border: `1px solid ${tokens.border}` }}>
                  <span style={{ fontSize: 17 }}>{r.level === 'high' ? '🔴' : r.level === 'mid' ? '🟡' : '🟢'}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text, flex: 1 }}>{r.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color }}>{r.label}</span>
                </div>
              )
            })}
          </div>
        </Card>

      </main>

      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={async () => { setShowLogout(false); await logout() }} />}
    </div>
  )
}