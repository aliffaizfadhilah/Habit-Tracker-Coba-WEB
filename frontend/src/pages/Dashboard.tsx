import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0a0a0f; color: #f0f0f5; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } }
  .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; color: rgba(240,240,245,0.5); cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; background: none; width: 100%; }
  .sidebar-link:hover { background: rgba(255,255,255,0.05); color: rgba(240,240,245,0.8); }
  .sidebar-link.active { background: rgba(124,92,252,0.15); color: #a78bfa; }
  .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 24px; transition: all 0.2s; animation: fadeUp 0.5s ease both; }
  .stat-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(124,92,252,0.2); transform: translateY(-2px); }
  .habit-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; transition: all 0.2s; cursor: pointer; }
  .habit-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(124,92,252,0.2); }
  .check-btn { width: 24px; height: 24px; border-radius: 7px; border: 1.5px solid rgba(255,255,255,0.15); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
  .check-btn.done { background: #7c5cfc; border-color: #7c5cfc; }
  .progress-bar { height: 4px; background: rgba(255,255,255,0.08); border-radius: 100px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 100px; transition: width 0.6s ease; }
  .badge { padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .nav-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; padding: 8px 16px; font-size: 13px; color: rgba(240,240,245,0.6); cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .nav-btn:hover { background: rgba(255,255,255,0.08); color: #f0f0f5; }
  .nav-btn.active { background: rgba(124,92,252,0.2); border-color: rgba(124,92,252,0.4); color: #a78bfa; }
  .add-btn { background: #7c5cfc; color: #fff; border: none; border-radius: 12px; padding: 12px 18px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; }
  .add-btn:hover { background: #9478fd; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,92,252,0.35); }
  .insight-card { background: linear-gradient(135deg, rgba(124,92,252,0.2), rgba(192,132,252,0.1)); border: 1px solid rgba(124,92,252,0.3); border-radius: 20px; padding: 24px; }
`

const navItems = [
  { icon: '⊞', label: 'Dashboard', id: 'dashboard' },
  { icon: '◎', label: 'Habits', id: 'habits' },
  { icon: '〜', label: 'Analytics', id: 'analytics' },
  { icon: '≡', label: 'Activity', id: 'activity' },
]

const habits = [
  { name: 'Meditasi 10 menit', streak: 14, prog: 82, color: '#7c5cfc' },
  { name: 'Baca buku 30 menit', streak: 7, prog: 65, color: '#34d399' },
  { name: 'Olahraga pagi', streak: 5, prog: 48, color: '#f59e0b' },
  { name: 'Minum 8 gelas air', streak: 3, prog: 30, color: '#60a5fa' },
  { name: 'Jurnal harian', streak: 10, prog: 70, color: '#f472b6' },
]

const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const weekData = [100, 75, 100, 50, 100, 75, 60]

function CircleProgress({ value, color, size = 80 }: { value: number, color: string, size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [activeView, setActiveView] = useState('weekly')
  const [checkedHabits, setCheckedHabits] = useState<Record<number, boolean>>({ 0: true, 1: true })
  const toggleHabit = (i: number) => setCheckedHabits(prev => ({ ...prev, [i]: !prev[i] }))

  const stats = [
    { label: 'Overall Success', value: 82, color: '#7c5cfc', sub: 'Semua habit' },
    { label: 'Target Mingguan', value: 94, color: '#34d399', sub: 'Progress minggu ini' },
    { label: 'Fokus Pagi', value: 65, color: '#f59e0b', sub: 'Sesi pagi' },
    { label: 'Konsistensi', value: 45, color: '#f472b6', sub: '30 hari terakhir' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: 'DM Sans, sans-serif', color: '#f0f0f5' }}>
      <style>{dashStyles}</style>
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)', animation: 'pulse 7s ease infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Sidebar */}
      <aside style={{ width: 220, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px', marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, background: '#7c5cfc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>HabitTracker</div>
            <div style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)' }}>Premium Tier</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(n => (
            <button key={n.id} className={`sidebar-link ${activeNav === n.id ? 'active' : ''}`} onClick={() => setActiveNav(n.id)}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto' }}>
          <button className="add-btn"><span style={{ fontSize: 18, fontWeight: 300 }}>+</span> Tambah Habit</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button className="sidebar-link"><span>⚙</span> Settings</button>
          <button className="sidebar-link" onClick={() => navigate('/login')}><span>↩</span> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, padding: '8px 20px' }}>
            <span style={{ fontSize: 14, color: 'rgba(240,240,245,0.3)' }}>🔍 Cari habit...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className={`nav-btn ${activeView === 'weekly' ? 'active' : ''}`} onClick={() => setActiveView('weekly')}>Weekly View</button>
            <button className={`nav-btn ${activeView === 'monthly' ? 'active' : ''}`} onClick={() => setActiveView('monthly')}>Monthly View</button>
            <div style={{ width: 36, height: 36, background: 'rgba(124,92,252,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginLeft: 8, cursor: 'pointer' }}>👤</div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 6 }}>Analytics Dashboard</h1>
          <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.45)' }}>Visualisasi progress dan konsistensi habit kamu</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s`, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <CircleProgress value={s.value} color={s.color} size={80} />
                <div style={{ position: 'absolute', fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800 }}>{s.value}%</div>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="stat-card" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Habit Hari Ini</div>
                <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>Minggu, 26 Apr 2026</div>
              </div>
              <span className="badge" style={{ background: 'rgba(124,92,252,0.15)', color: '#a78bfa' }}>
                {Object.values(checkedHabits).filter(Boolean).length}/{habits.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {habits.map((h, i) => (
                <div key={i} className="habit-row" onClick={() => toggleHabit(i)}>
                  <button className={`check-btn ${checkedHabits[i] ? 'done' : ''}`}>
                    {checkedHabits[i] && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: checkedHabits[i] ? 'rgba(240,240,245,0.4)' : '#f0f0f5', textDecoration: checkedHabits[i] ? 'line-through' : 'none' }}>{h.name}</span>
                      <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>🔥 {h.streak}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${h.prog}%`, background: `linear-gradient(90deg, ${h.color}, ${h.color}99)` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="stat-card" style={{ animationDelay: '0.35s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Consistency Score</div>
                  <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>Frekuensi penyelesaian harian</div>
                </div>
                <span className="badge" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>Current Week</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: '100%', background: weekData[i] === 100 ? '#7c5cfc' : 'rgba(124,92,252,0.3)', borderRadius: 6, height: `${weekData[i] * 0.6}px`, transition: 'height 0.5s ease', minHeight: 8 }} />
                    <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="stat-card" style={{ animationDelay: '0.4s', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#7c5cfc', marginBottom: 4 }}>14🔥</div>
                <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>Streak Terpanjang</div>
              </div>
              <div className="stat-card" style={{ animationDelay: '0.45s', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: '#34d399', marginBottom: 4 }}>5</div>
                <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>Habit Aktif</div>
              </div>
            </div>

            <div className="insight-card" style={{ animationDelay: '0.5s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>✦</span> Optimization Insight
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.6)', lineHeight: 1.6 }}>
                    Data kamu menunjukkan peningkatan <span style={{ color: '#a78bfa', fontWeight: 600 }}>22%</span> kualitas fokus saat habit diselesaikan sebelum jam 12 siang.
                  </p>
                </div>
                <button style={{ background: 'rgba(124,92,252,0.3)', border: '1px solid rgba(124,92,252,0.4)', borderRadius: 10, padding: '10px 14px', color: '#a78bfa', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>Apply →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
