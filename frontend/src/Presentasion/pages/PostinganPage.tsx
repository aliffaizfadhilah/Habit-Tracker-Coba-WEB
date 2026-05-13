import { useState } from 'react'
import { useAuth } from '../../BusinessLogic/hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { tokens } from '../../BusinessLogic/factories/tokens'
import { Badge } from '../../BusinessLogic/factories/ComponentFactory'

const mockPosts = [
  { id: 1, habit: 'Olahraga Pagi', streak: 12, date: '13 Mei 2026', emoji: '🏃', category: 'Kesehatan', progress: 85 },
  { id: 2, habit: 'Baca Buku 30 Menit', streak: 7, date: '12 Mei 2026', emoji: '📚', category: 'Edukasi', progress: 70 },
  { id: 3, habit: 'Meditasi', streak: 21, date: '11 Mei 2026', emoji: '🧘', category: 'Mindfulness', progress: 100 },
  { id: 4, habit: 'Minum Air 2L', streak: 5, date: '10 Mei 2026', emoji: '💧', category: 'Kesehatan', progress: 60 },
]

export default function PostinganPage() {
  const { user, logout } = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout, setShowLogout] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'semua' | 'streak' | 'progress'>('semua')

  const displayUser = {
    full_name: user?.full_name ?? 'Pengguna',
    email: user?.email ?? '',
    username: user?.username ?? 'Pengguna',
  }

  const sortedPosts = [...mockPosts].sort((a, b) => {
    if (activeFilter === 'streak') return b.streak - a.streak
    if (activeFilter === 'progress') return b.progress - a.progress
    return 0
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="postingan"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button onClick={() => setSidebarOpen((o: boolean) => !o)} style={{
            width: 36, height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8,
            background: tokens.white, cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>☰</button>
          <div>
            <h1 style={{ fontFamily: tokens.fontHeading, fontSize: 24, fontWeight: 800, color: tokens.text, margin: 0 }}>
              Wall Pribadi 🖼
            </h1>
            <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, marginTop: 2 }}>
              Riwayat progress habit yang kamu bagikan
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Post', value: mockPosts.length, icon: '🖼', bg: tokens.primaryLight },
            { label: 'Streak Terbaik', value: Math.max(...mockPosts.map(p => p.streak)), icon: '🔥', bg: '#fff7ed' },
            { label: 'Avg Progress', value: `${Math.round(mockPosts.reduce((a, p) => a + p.progress, 0) / mockPosts.length)}%`, icon: '📈', bg: tokens.successBg },
          ].map(s => (
            <div key={s.label} style={{
              background: tokens.white, border: `1px solid ${tokens.border}`,
              borderRadius: tokens.radiusLg, padding: '18px 20px',
              boxShadow: tokens.shadow, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: s.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: tokens.fontHeading, color: tokens.text }}>{s.value}</div>
                <div style={{ fontSize: 12, color: tokens.textMuted }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['semua', 'streak', 'progress'] as const).map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: '7px 18px', borderRadius: tokens.radiusFull,
              border: `1.5px solid ${activeFilter === f ? tokens.primary : tokens.border}`,
              background: activeFilter === f ? tokens.primaryLight : tokens.white,
              color: activeFilter === f ? tokens.primary : tokens.textMuted,
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: tokens.fontBody, transition: tokens.transitionFast,
            }}>
              {f === 'semua' ? '✨ Semua' : f === 'streak' ? '🔥 Streak' : '📈 Progress'}
            </button>
          ))}
        </div>

        {/* Post Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {sortedPosts.map((post, i) => (
            <div key={post.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
              <div
                style={{
                  background: tokens.white, border: `1px solid ${tokens.border}`,
                  borderRadius: tokens.radiusLg, padding: '24px',
                  boxShadow: tokens.shadow, cursor: 'pointer',
                  transition: tokens.transitionBase,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = tokens.shadowMd
                  e.currentTarget.style.borderColor = tokens.borderMid
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = tokens.shadow
                  e.currentTarget.style.borderColor = tokens.border
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, background: tokens.primaryLight,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>{post.emoji}</div>
                    <div>
                      <div style={{ fontFamily: tokens.fontHeading, fontSize: 15, fontWeight: 700, color: tokens.text }}>{post.habit}</div>
                      <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>{post.date}</div>
                    </div>
                  </div>
                  <Badge color="green">{post.category}</Badge>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: tokens.textMuted }}>Progress</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: post.progress === 100 ? tokens.primary : tokens.textMuted,
                    }}>{post.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: tokens.primaryLight, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${post.progress}%`, borderRadius: 100,
                      background: post.progress === 100
                        ? `linear-gradient(90deg,${tokens.primary},${tokens.accent})`
                        : tokens.primary,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>

                {/* Streak */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: tokens.primaryLighter, borderRadius: tokens.radius,
                }}>
                  <span style={{ fontSize: 13, color: tokens.textMuted }}>🔥 Streak aktif</span>
                  <span style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 700, color: tokens.primary }}>
                    {post.streak} hari
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', padding: '32px 24px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: tokens.textMuted }}>
            🚀 Fitur share ke sosial media <strong style={{ color: tokens.primary }}>segera hadir!</strong>
          </p>
        </div>

      </main>

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={async () => { setShowLogout(false); await logout() }}
        />
      )}
    </div>
  )
}