import { useState } from 'react'
import { useAuth } from '../../BusinessLogic/hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { tokens } from '../../BusinessLogic/factories/tokens'
import { Card, Button, Badge, Alert } from '../../BusinessLogic/factories/ComponentFactory'

type ReminderTime = { id: number; habit: string; emoji: string; time: string; days: string[]; active: boolean }

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const ALL_DAYS   = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const defaultReminders: ReminderTime[] = [
  { id: 1, habit: 'Olahraga Pagi', emoji: '🏃', time: '06:00', days: ['Sen','Sel','Rab','Kam','Jum'], active: true },
  { id: 2, habit: 'Baca Buku', emoji: '📚', time: '20:00', days: ['Sen','Rab','Jum'], active: true },
  { id: 3, habit: 'Meditasi', emoji: '🧘', time: '07:00', days: ALL_DAYS, active: false },
]

export default function Reminder() {
  const { user, logout } = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout, setShowLogout] = useState(false)
  const [reminders, setReminders] = useState<ReminderTime[]>(defaultReminders)
  const [showAdd, setShowAdd] = useState(false)
  const [newHabit, setNewHabit] = useState('')
  const [newTime, setNewTime] = useState('08:00')
  const [newDays, setNewDays] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }

  const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const toggleActive = (id: number) => {
    setReminders(r => r.map(rem => rem.id === id ? { ...rem, active: !rem.active } : rem))
  }

  const deleteReminder = (id: number) => {
    setReminders(r => r.filter(rem => rem.id !== id))
    showToastMsg('Reminder dihapus')
  }

  const toggleDay = (day: string) => {
    setNewDays(d => d.includes(day) ? d.filter(x => x !== day) : [...d, day])
  }

  const handleAdd = () => {
    if (!newHabit.trim()) return
    if (newDays.length === 0) return
    const next: ReminderTime = { id: Date.now(), habit: newHabit.trim(), emoji: '⏰', time: newTime, days: newDays, active: true }
    setReminders(r => [...r, next])
    setNewHabit(''); setNewTime('08:00'); setNewDays([])
    setShowAdd(false)
    showToastMsg('Reminder berhasil ditambahkan!')
  }

  const activeCount = reminders.filter(r => r.active).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="reminder"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '32px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{
            width: 36, height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8,
            background: tokens.white, cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>☰</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: tokens.fontHeading, fontSize: 24, fontWeight: 800, color: tokens.text, margin: 0 }}>
              Pengingat ⏰
            </h1>
            <p style={{ fontSize: 13, color: tokens.textMuted, margin: 0, marginTop: 2 }}>
              Atur jadwal pengingat untuk setiap habit-mu
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAdd(true)} style={{ width: 'auto', padding: '8px 18px' }}>
            + Tambah
          </Button>
        </div>

        {toast && <div style={{ marginBottom: 20 }}><Alert type="success" message={toast} /></div>}

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Reminder', value: reminders.length, icon: '⏰', bg: tokens.primaryLight },
            { label: 'Aktif', value: activeCount, icon: '✅', bg: tokens.successBg },
            { label: 'Non-aktif', value: reminders.length - activeCount, icon: '⏸', bg: '#f3f4f6' },
          ].map(s => (
            <div key={s.label} style={{
              background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: tokens.radiusLg,
              padding: '18px 20px', boxShadow: tokens.shadow, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: tokens.fontHeading, color: tokens.text }}>{s.value}</div>
                <div style={{ fontSize: 12, color: tokens.textMuted }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reminder List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reminders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>Belum ada reminder</div>
              <div style={{ fontSize: 13, color: tokens.textMuted }}>Tambahkan pengingat untuk habit-mu</div>
            </div>
          )}

          {reminders.map((rem, i) => (
            <div key={rem.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.06}s both` }}>
              <Card style={{ opacity: rem.active ? 1 : 0.6, transition: tokens.transitionBase }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {/* Emoji + info */}
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: rem.active ? tokens.primaryLight : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {rem.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: tokens.fontHeading, fontSize: 15, fontWeight: 700, color: tokens.text }}>{rem.habit}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 20, fontWeight: 700, fontFamily: tokens.fontHeading, color: rem.active ? tokens.primary : tokens.textMuted }}>{rem.time}</span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {DAY_LABELS.map(d => (
                          <span key={d} style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                            background: rem.days.includes(d) ? tokens.primaryLight : '#f3f4f6',
                            color: rem.days.includes(d) ? tokens.primary : tokens.textLight,
                          }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <Badge color={rem.active ? 'green' : 'gray'}>{rem.active ? 'Aktif' : 'Non-aktif'}</Badge>
                    {/* Toggle switch */}
                    <button onClick={() => toggleActive(rem.id)} style={{
                      width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', padding: 2,
                      background: rem.active ? tokens.primary : '#d1d5db', transition: 'background 0.2s', position: 'relative',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', background: tokens.white,
                        position: 'absolute', top: 2, left: rem.active ? 22 : 2, transition: 'left 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                    <button onClick={() => deleteReminder(rem.id)} style={{
                      width: 32, height: 32, borderRadius: 8, border: `1px solid ${tokens.border}`,
                      background: tokens.white, cursor: 'pointer', fontSize: 14, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: tokens.error,
                      transition: tokens.transitionFast,
                    }}>🗑</button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </main>

      {/* Modal Tambah Reminder */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(11,26,14,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: tokens.white, borderRadius: tokens.radiusXl, padding: 32,
            boxShadow: tokens.shadowLg, width: '100%', maxWidth: 440,
          }}>
            <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 20 }}>
              ⏰ Tambah Reminder
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textBody, display: 'block', marginBottom: 6 }}>Nama Habit</label>
                <input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="Contoh: Olahraga Pagi"
                  style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radiusSm, fontSize: 14, fontFamily: tokens.fontBody, color: tokens.text, background: tokens.white, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textBody, display: 'block', marginBottom: 6 }}>Waktu</label>
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${tokens.border}`, borderRadius: tokens.radiusSm, fontSize: 14, fontFamily: tokens.fontBody, color: tokens.text, background: tokens.white, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: tokens.textBody, display: 'block', marginBottom: 8 }}>Hari</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DAY_LABELS.map(d => (
                    <button key={d} onClick={() => toggleDay(d)} style={{
                      padding: '6px 12px', borderRadius: 8, border: `1.5px solid`, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      borderColor: newDays.includes(d) ? tokens.primary : tokens.border,
                      background: newDays.includes(d) ? tokens.primaryLight : tokens.white,
                      color: newDays.includes(d) ? tokens.primary : tokens.textMuted,
                      transition: tokens.transitionFast,
                    }}>{d}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Button variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Batal</Button>
                <Button variant="primary" onClick={handleAdd} disabled={!newHabit.trim() || newDays.length === 0} style={{ flex: 2 }}>Simpan</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={async () => { setShowLogout(false); await logout() }} />}
    </div>
  )
}