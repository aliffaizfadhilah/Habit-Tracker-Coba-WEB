// ─── Dashboard Page ────────────────────────────────────────────────────────────
// UI sesuai design token Landing Page. Jembatan ke 14 fitur habit.

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalStyles, Button, Card, Badge } from '../factories/ComponentFactory'
import { tokens } from '../factories/tokens'
import {
  PageHeader, StatCard, HabitCard, EmptyState, ModalOverlay,
} from '../factories/SectionFactory'
import ReminderView from '../components/ReminderView'
import { reminderService } from '../services/ReminderService'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockHabits = [
  { id: 1, name: 'Olahraga Pagi', category: 'Kesehatan', streak: 12, progress: 75, isCompleted: false, isLocked: false },
  { id: 2, name: 'Baca Buku 30 Menit', category: 'Literasi', streak: 7, progress: 100, isCompleted: true, isLocked: true },
  { id: 3, name: 'Meditasi', category: 'Mental', streak: 3, progress: 40, isCompleted: false, isLocked: false },
  { id: 4, name: 'Minum 8 Gelas Air', category: 'Kesehatan', streak: 20, progress: 60, isCompleted: false, isLocked: false },
]

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
    padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
    background: active ? tokens.primaryLight : 'transparent',
    color: active ? tokens.primary : tokens.textMuted,
    fontFamily: tokens.fontBody, fontSize: 14, fontWeight: active ? 600 : 400,
    transition: 'all 0.15s', textAlign: 'left',
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    {label}
  </button>
)

export default function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    // Jalankan scheduler reminder terpusat (Singleton)
    reminderService.startPolling();
  }, []);

  const [activeNav, setActiveNav] = useState('today')
  const [habits, setHabits] = useState(mockHabits)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
  const [newHabit, setNewHabit] = useState({ name: '', category: '' })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const completedCount = habits.filter(h => h.isCompleted).length
  const totalStreak = habits.reduce((a, h) => a + h.streak, 0)
  const avgProgress = habits.length ? Math.round(habits.reduce((a, h) => a + h.progress, 0) / habits.length) : 0

  const handleToggle = (id: number) => {
    setHabits(prev => prev.map(h =>
      h.id === id && !h.isLocked ? { ...h, isCompleted: !h.isCompleted, progress: !h.isCompleted ? 100 : h.progress } : h
    ))
  }

  const handleDelete = (id: number) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    setShowDeleteModal(null)
  }

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return
    setHabits(prev => [...prev, {
      id: Date.now(), name: newHabit.name, category: newHabit.category || 'Umum',
      streak: 0, progress: 0, isCompleted: false, isLocked: false,
    }])
    setNewHabit({ name: '', category: '' })
    setShowAddModal(false)
  }

  const navItems = [
    { id: 'today', icon: '📅', label: 'Hari Ini' },
    { id: 'habits', icon: '✅', label: 'Semua Habit' },
    { id: 'streak', icon: '🔥', label: 'Streak' },
    { id: 'progress', icon: '📊', label: 'Progress' },
    { id: 'report', icon: '📋', label: 'Laporan' },
    { id: 'reminder', icon: '🔔', label: 'Reminder' },
    { id: 'share', icon: '📤', label: 'Share Progress' },
    { id: 'wall', icon: '🖼', label: 'Wall Pribadi' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <GlobalStyles />

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0, flexShrink: 0, background: tokens.white,
        borderRight: `1px solid ${tokens.border}`, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transition: 'width 0.25s ease',
      }}>
        <div style={{ padding: '24px 16px', minWidth: 240 }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 32, paddingLeft: 4 }}>
            <div style={{ width: 34, height: 34, background: tokens.primary, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>✦</div>
            <span style={{ fontFamily: tokens.fontHeading, fontWeight: 700, fontSize: 17, color: tokens.text }}>HabitTracker</span>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => (
              <NavItem key={item.id} {...item} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
            ))}
          </nav>
        </div>

        {/* User */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: `1px solid ${tokens.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: tokens.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>Pengguna</div>
              <div style={{ fontSize: 11, color: tokens.textMuted }}>user@email.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            width: 36, height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8,
            background: tokens.white, cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>☰</button>

          <PageHeader
            title={activeNav === 'today' ? `Halo! 👋` : navItems.find(n => n.id === activeNav)?.label || ''}
            subtitle={activeNav === 'today' ? `Rabu, 29 April 2026 — Semangat hari ini!` : undefined}
            action={
              activeNav === 'today' && (
                <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                  + Tambah Habit
                </Button>
              )
            }
          />
        </div>

        {activeNav === 'reminder' ? (
          <ReminderView />
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard label="Total Habit" value={habits.length} icon="✅" color="blue" trend={`${completedCount} selesai hari ini`} />
              <StatCard label="Total Streak" value={`${totalStreak}d`} icon="🔥" color="orange" trend="Pertahankan terus!" />
              <StatCard label="Avg Progress" value={`${avgProgress}%`} icon="📈" color="green" trend="Rata-rata semua habit" />
              <StatCard label="Completed" value={completedCount} icon="🏆" color="green" trend={`dari ${habits.length} habit`} />
            </div>

            {/* Habit List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 700, color: tokens.text }}>
                  Habit Hari Ini
                </h2>
                <Badge color="blue">{habits.length} habit</Badge>
              </div>

              {habits.length === 0 ? (
                <EmptyState
                  icon="🌱"
                  title="Belum ada habit"
                  description="Mulai tambahkan habit pertamamu dan bangun rutinitas positif!"
                  action={
                    <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                      + Tambah Habit Pertama
                    </Button>
                  }
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {habits.map(habit => (
                    <HabitCard
                      key={habit.id}
                      {...habit}
                      onCheck={() => handleToggle(habit.id)}
                      onEdit={() => { }}
                      onDelete={() => setShowDeleteModal(habit.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── Add Habit Modal ── */}
      {showAddModal && (
        <ModalOverlay onClose={() => setShowAddModal(false)}>
          <Card padding="32px">
            <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 22, fontWeight: 700, color: tokens.text, marginBottom: 24 }}>
              Tambah Habit Baru
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Nama Habit</label>
                <input
                  value={newHabit.name}
                  onChange={e => setNewHabit(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Olahraga 30 menit"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: 14,
                    border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius,
                    fontFamily: tokens.fontBody, color: tokens.text, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: tokens.textMuted, display: 'block', marginBottom: 6 }}>Kategori</label>
                <select
                  value={newHabit.category}
                  onChange={e => setNewHabit(p => ({ ...p, category: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: 14,
                    border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radius,
                    fontFamily: tokens.fontBody, color: tokens.text, outline: 'none',
                    background: tokens.white, boxSizing: 'border-box',
                  }}
                >
                  <option value="">Pilih kategori</option>
                  {['Kesehatan', 'Literasi', 'Mental', 'Produktivitas', 'Olahraga', 'Umum'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>Batal</Button>
                <Button variant="primary" onClick={handleAddHabit}>Tambah Habit</Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal !== null && (
        <ModalOverlay onClose={() => setShowDeleteModal(null)}>
          <Card padding="28px 32px">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>Hapus Habit?</h3>
              <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                Habit <strong>{habits.find(h => h.id === showDeleteModal)?.name}</strong> akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={() => setShowDeleteModal(null)}>Batal</Button>
                <Button variant="danger" onClick={() => handleDelete(showDeleteModal!)}>Ya, Hapus</Button>
              </div>
            </div>
          </Card>
        </ModalOverlay>
      )}
    </div>
  )
}