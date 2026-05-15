import { useState } from 'react'
import { useAuth } from '../../BusinessLogic/hooks/useAuth'
import { useReminder } from '../../BusinessLogic/hooks/useReminder'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { tokens, Card, Badge, Button, Alert } from '../../BusinessLogic/factories/ComponentFactory'
import type { HabitGridItem } from '../../BusinessLogic/factories/HabitFormFactory'

function ReminderCard({
  habit,
  onToggle,
  onEdit,
}: {
  habit: HabitGridItem
  onToggle: (id: number, enabled: boolean) => void
  onEdit: (habit: HabitGridItem) => void
}) {
  const active = habit.reminder_enabled

  return (
    <Card style={{ opacity: active ? 1 : 0.65, transition: tokens.transitionBase }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: active ? tokens.primaryLight : '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>
          ⏰
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: tokens.fontHeading, fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
            {habit.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 22, fontWeight: 700, fontFamily: tokens.fontHeading,
              color: active ? tokens.primary : tokens.textMuted,
            }}>
              {habit.reminder_time}
            </span>
            <Badge color="green">{habit.category}</Badge>
          </div>
          <p style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody, marginTop: 4 }}>
            Setiap hari pukul {habit.reminder_time}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Badge color={active ? 'green' : 'gray'}>{active ? 'Aktif' : 'Nonaktif'}</Badge>

          {/* Edit */}
          <button
            onClick={() => onEdit(habit)}
            title="Edit waktu"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${tokens.border}`, background: tokens.bg,
              cursor: 'pointer', fontSize: 14, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >✏️</button>

          {/* Toggle switch */}
          <button
            onClick={() => onToggle(habit.id_habit, !active)}
            style={{
              width: 44, height: 24, borderRadius: 100, border: 'none',
              cursor: 'pointer', padding: 2, position: 'relative',
              background: active ? tokens.primary : '#d1d5db',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: tokens.white,
              position: 'absolute', top: 2, transition: 'left 0.2s',
              left: active ? 22 : 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>
    </Card>
  )
}

function EditReminderModal({
  habit,
  onClose,
  onSave,
}: {
  habit: HabitGridItem
  onClose: () => void
  onSave: (id: number, time: string) => Promise<void>
}) {
  const [time, setTime] = useState(habit.reminder_time ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!time) { setError('Waktu wajib diisi.'); return }
    setLoading(true)
    setError('')
    await onSave(habit.id_habit, time)
    setLoading(false)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(11,26,14,0.55)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 300, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: tokens.white, borderRadius: tokens.radiusXl,
          padding: 32, boxShadow: tokens.shadowLg, width: '100%', maxWidth: 400,
        }}
      >
        <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>
          ✏️ Edit Waktu Pengingat
        </h3>
        <p style={{ fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody, marginBottom: 20 }}>
          {habit.title}
        </p>

        {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} /></div>}

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textBody, display: 'block', marginBottom: 6, fontFamily: tokens.fontBody }}>
            Jam Pengingat
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', fontSize: 15,
              fontFamily: tokens.fontBody, color: tokens.text,
              background: tokens.white, border: `1.5px solid ${tokens.border}`,
              borderRadius: tokens.radiusSm, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
          <Button variant="primary" onClick={handleSave} loading={loading} style={{ flex: 2 }}>Simpan</Button>
        </div>
      </div>
    </div>
  )
}

export default function Reminder() {
  const { user, logout } = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const { habitsWithReminder, loading, error, toggleReminder, updateReminderTime, refetch } = useReminder()

  const [showLogout, setShowLogout]   = useState(false)
  const [editTarget, setEditTarget]   = useState<HabitGridItem | null>(null)
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggle = async (id: number, enabled: boolean) => {
    const result = await toggleReminder(id, enabled)
    if (result.success) showToast('success', enabled ? 'Pengingat diaktifkan.' : 'Pengingat dinonaktifkan.')
    else showToast('error', result.message)
  }

  const handleSaveTime = async (id: number, time: string) => {
    const result = await updateReminderTime(id, time)
    if (result.success) showToast('success', 'Waktu pengingat diperbarui!')
    else showToast('error', result.message)
  }

  const activeCount = habitsWithReminder.filter(h => h.reminder_enabled).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="reminder"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)}
      />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '32px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ width: 36, height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8, background: tokens.white, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >☰</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: tokens.fontHeading, fontSize: 24, fontWeight: 800, color: tokens.text, margin: 0 }}>
              Pengingat ⏰
            </h1>
            <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, marginTop: 2 }}>
              Kelola jadwal pengingat untuk setiap habit-mu
            </p>
          </div>
        </div>

        {toast && <div style={{ marginBottom: 20 }}><Alert type={toast.type} message={toast.message} /></div>}

        {error && (
          <div style={{ marginBottom: 20 }}>
            <Alert type="error" message={error} />
            <button onClick={refetch} style={{ marginTop: 8, fontSize: 13, color: tokens.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: tokens.fontBody }}>
              Coba lagi
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Reminder', value: habitsWithReminder.length, icon: '⏰', bg: tokens.primaryLight },
              { label: 'Aktif',          value: activeCount,                icon: '✅', bg: tokens.successBg },
              { label: 'Nonaktif',       value: habitsWithReminder.length - activeCount, icon: '⏸', bg: '#f3f4f6' },
            ].map(s => (
              <div key={s.label} style={{
                background: tokens.white, border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radiusLg, padding: '18px 20px',
                boxShadow: tokens.shadow, display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: tokens.fontHeading, color: tokens.text }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: tokens.textMuted }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 90, background: tokens.border, borderRadius: tokens.radiusLg, opacity: 0.5 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && habitsWithReminder.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>
              Belum ada pengingat
            </div>
            <div style={{ fontSize: 13, color: tokens.textMuted }}>
              Tambahkan habit baru dan set jam pengingatnya agar muncul di sini.
            </div>
          </div>
        )}

        {/* Reminder Cards */}
        {!loading && habitsWithReminder.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {habitsWithReminder.map((habit, i) => (
              <div key={habit.id_habit} style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
                <ReminderCard habit={habit} onToggle={handleToggle} onEdit={setEditTarget} />
              </div>
            ))}
          </div>
        )}
      </main>

      {editTarget && (
        <EditReminderModal
          habit={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveTime}
        />
      )}

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={async () => { setShowLogout(false); await logout() }}
        />
      )}
    </div>
  )
}
