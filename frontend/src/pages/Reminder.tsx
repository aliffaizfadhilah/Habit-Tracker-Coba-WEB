
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar, tokens } from '../pages/shared/Sidebar'

interface Reminder {
  id: number
  habitId: number
  habitName: string
  category: string
  time: string       // format "HH:MM"
  days: number[]     // 0=Min, 1=Sen, 2=Sel, 3=Rab, 4=Kam, 5=Jum, 6=Sab
  enabled: boolean
}

const DUMMY_REMINDERS: Reminder[] = [
  { id: 1, habitId: 1, habitName: 'Baca Buku',     category: 'Ilmu Pengetahuan', time: '07:00', days: [1,2,3,4,5],    enabled: true  },
  { id: 2, habitId: 2, habitName: 'Olahraga Pagi', category: 'Kesehatan',        time: '06:00', days: [1,3,5],        enabled: true  },
  { id: 3, habitId: 3, habitName: 'Meditasi',      category: 'Mental',           time: '20:00', days: [0,1,2,3,4,5,6],enabled: false },
  { id: 4, habitId: 4, habitName: 'Coding 30min',  category: 'Produktivitas',    time: '21:00', days: [1,2,3,4,5],    enabled: true  },
  { id: 5, habitId: 5, habitName: 'Jurnal Harian', category: 'Mental',           time: '22:00', days: [0,1,2,3,4,5,6],enabled: false },
]

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAY_FULL   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const CATEGORY_COLOR: Record<string, { bg: string; text: string }> = {
  'Ilmu Pengetahuan': { bg: '#f0fdf4', text: '#10b981' },
  'Kesehatan':        { bg: '#fff7ed', text: '#f97316' },
  'Mental':           { bg: '#eef1ff', text: '#4361ee' },
  'Produktivitas':    { bg: '#f5f3ff', text: '#7c3aed' },
}
const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button onClick={onChange} style={{
    width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
    background: checked ? tokens.primary : tokens.border,
    transition: 'background .2s', position: 'relative', flexShrink: 0,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: 3, transition: 'left .2s',
      left: checked ? 22 : 4,
      boxShadow: '0 1px 4px rgba(0,0,0,.2)',
    }} />
  </button>
)

const DayPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${active ? tokens.primary : tokens.border}`,
    background: active ? tokens.primary : tokens.white,
    color: active ? '#fff' : tokens.textMuted,
    fontFamily: tokens.fontBody, fontSize: 11, fontWeight: active ? 700 : 500,
    cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {label}
  </button>
)
const EditModal: React.FC<{
  reminder: Reminder
  onSave: (r: Reminder) => void
  onCancel: () => void
}> = ({ reminder, onSave, onCancel }) => {
  const [time, setTime]   = useState(reminder.time)
  const [days, setDays]   = useState<number[]>(reminder.days)

  const toggleDay = (d: number) =>
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a,b) => a-b))

  const formatted = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    const period = h >= 12 ? 'PM' : 'AM'
    const hour   = h % 12 || 12
    return `${hour}:${String(m).padStart(2,'0')} ${period}`
  }

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,46,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: tokens.white, borderRadius: 20, padding: 32, boxShadow: tokens.shadowLg, width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: tokens.textMuted, marginBottom: 4 }}>Edit Reminder</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading }}>{reminder.habitName}</div>
        </div>

        {/* Time picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, marginBottom: 8 }}>Jam Pengingat</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{
              padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${tokens.border}`,
              fontFamily: tokens.fontMono, fontSize: 18, fontWeight: 700, color: tokens.text,
              background: tokens.bg, outline: 'none', cursor: 'pointer',
            }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: tokens.primary, fontFamily: tokens.fontMono }}>{formatted(time)}</span>
          </div>
        </div>

        {/* Day picker */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, marginBottom: 12 }}>Hari Aktif</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DAY_LABELS.map((label, i) => (
              <DayPill key={i} label={label} active={days.includes(i)} onClick={() => toggleDay(i)} />
            ))}
          </div>
          {days.length === 0 && <div style={{ fontSize: 12, color: tokens.red, marginTop: 8 }}>Pilih minimal 1 hari.</div>}
          <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 10 }}>
            {days.length > 0 ? days.map(d => DAY_FULL[d]).join(', ') : 'Belum ada hari dipilih'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${tokens.border}`, background: tokens.white, color: tokens.text, cursor: 'pointer', fontFamily: tokens.fontBody, fontSize: 14, fontWeight: 600 }}>Batal</button>
          <button
            onClick={() => { if (days.length === 0) return; onSave({ ...reminder, time, days }) }}
            disabled={days.length === 0}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: days.length === 0 ? tokens.border : tokens.primary, color: days.length === 0 ? tokens.textMuted : '#fff', cursor: days.length === 0 ? 'not-allowed' : 'pointer', fontFamily: tokens.fontBody, fontSize: 14, fontWeight: 700 }}
          >
            Simpan Reminder
          </button>
        </div>
      </div>
    </div>
  )
}

const ReminderCard: React.FC<{
  reminder: Reminder
  onToggle: (id: number) => void
  onEdit: (r: Reminder) => void
}> = ({ reminder, onToggle, onEdit }) => {
  const cat   = CATEGORY_COLOR[reminder.category] || { bg: tokens.primaryLight, text: tokens.primary }
  const [h, m] = reminder.time.split(':').map(Number)
  const period  = h >= 12 ? 'PM' : 'AM'
  const hour    = h % 12 || 12
  const timeStr = `${hour}:${String(m).padStart(2,'0')} ${period}`

  return (
    <div style={{
      background: tokens.white, border: `1.5px solid ${reminder.enabled ? tokens.border : tokens.border}`,
      borderRadius: 16, padding: '18px 20px', boxShadow: tokens.shadow,
      transition: 'all .2s', opacity: reminder.enabled ? 1 : 0.6,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: tokens.text, fontFamily: tokens.fontHeading }}>{reminder.habitName}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, background: cat.bg, color: cat.text }}>{reminder.category}</span>
          </div>
          {/* Time display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: reminder.enabled ? tokens.primary : tokens.textMuted, fontFamily: tokens.fontMono, letterSpacing: '-1px' }}>{timeStr}</span>
          </div>
        </div>
        <Toggle checked={reminder.enabled} onChange={() => onToggle(reminder.id)} />
      </div>

      {/* Days */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
        {DAY_LABELS.map((label, i) => (
          <div key={i} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: reminder.days.includes(i) ? (reminder.enabled ? tokens.primaryLight : '#f3f4f6') : 'transparent',
            color: reminder.days.includes(i) ? (reminder.enabled ? tokens.primary : tokens.textMuted) : tokens.border,
            border: `1.5px solid ${reminder.days.includes(i) ? (reminder.enabled ? tokens.primary : tokens.textMuted) : tokens.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, fontFamily: tokens.fontBody,
          }}>
            {label}
          </div>
        ))}
      </div>

      {/* Summary text */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
          🔔 {reminder.days.length === 7 ? 'Setiap hari' : reminder.days.length === 0 ? 'Tidak aktif' : `${reminder.days.length}x seminggu`}
          {' · '}{reminder.enabled ? 'Aktif' : 'Nonaktif'}
        </span>
        <button onClick={() => onEdit(reminder)} style={{
          padding: '5px 12px', borderRadius: 8, border: `1px solid ${tokens.border}`,
          background: tokens.bg, color: tokens.textMuted, cursor: 'pointer',
          fontFamily: tokens.fontBody, fontSize: 12, fontWeight: 600, transition: 'all .15s',
        }}>
          ✏ Edit
        </button>
      </div>
    </div>
  )
}
export default function ReminderPage() {
  const { user, logout } = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()

  const [showLogout, setShowLogout]       = useState(false)
  const [reminders, setReminders]         = useState<Reminder[]>(DUMMY_REMINDERS)
  const [editTarget, setEditTarget]       = useState<Reminder | null>(null)
  const [filterEnabled, setFilterEnabled] = useState<'semua' | 'aktif' | 'nonaktif'>('semua')

  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }

  const handleToggle = (id: number) =>
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))

  const handleSave = (updated: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updated.id ? { ...updated, enabled: true } : r))
    setEditTarget(null)
  }

  const filtered = reminders.filter(r =>
    filterEnabled === 'aktif'    ? r.enabled :
    filterEnabled === 'nonaktif' ? !r.enabled : true
  )

  const aktifCount    = reminders.filter(r => r.enabled).length
  const nonaktifCount = reminders.filter(r => !r.enabled).length

  const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="reminder"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '28px 36px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{ width: 34, height: 34, border: `1px solid ${tokens.border}`, borderRadius: 8, background: tokens.white, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>☰</button>
            <div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: tokens.text, letterSpacing: '-.3px', fontFamily: tokens.fontHeading }}>Reminder 🔔</div>
              {!isMobile && <div style={{ fontSize: 13, color: tokens.textMuted, marginTop: 2 }}>{dateStr}</div>}
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Total Habit', value: reminders.length,  icon: '📋', iconBg: tokens.primaryLight, bar: tokens.primary, pct: 100 },
            { label: 'Aktif',       value: aktifCount,         icon: '🔔', iconBg: '#f0fdf4',           bar: tokens.green,   pct: Math.round(aktifCount / reminders.length * 100) },
            { label: 'Nonaktif',    value: nonaktifCount,      icon: '🔕', iconBg: '#fef2f2',           bar: tokens.red,     pct: Math.round(nonaktifCount / reminders.length * 100) },
          ].map(c => (
            <div key={c.label} style={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: 16, padding: '18px 20px', boxShadow: tokens.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: tokens.textMuted }}>{c.label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{c.icon}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: tokens.text, fontFamily: tokens.fontMono, letterSpacing: '-1px' }}>{c.value}</div>
              <div style={{ height: 3, background: tokens.border, borderRadius: 100, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 100, width: `${c.pct}%`, background: c.bar, transition: 'width .8s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['semua', 'aktif', 'nonaktif'] as const).map(f => (
            <button key={f} onClick={() => setFilterEnabled(f)} style={{
              padding: '7px 18px', borderRadius: 10,
              border: `1.5px solid ${filterEnabled === f ? tokens.primary : tokens.border}`,
              background: filterEnabled === f ? tokens.primaryLight : tokens.white,
              color: filterEnabled === f ? tokens.primary : tokens.textMuted,
              fontFamily: tokens.fontBody, fontSize: 13, fontWeight: filterEnabled === f ? 700 : 500,
              cursor: 'pointer', transition: 'all .15s', textTransform: 'capitalize',
            }}>
              {f === 'semua' ? `Semua (${reminders.length})` : f === 'aktif' ? `Aktif (${aktifCount})` : `Nonaktif (${nonaktifCount})`}
            </button>
          ))}
        </div>

        {/* INFO BANNER */}
        <div style={{ background: tokens.primaryLight, border: `1px solid #c7d7fe`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: tokens.primary, marginBottom: 2 }}>Cara Kerja Reminder</div>
            <div style={{ fontSize: 12, color: tokens.textMuted, lineHeight: 1.6 }}>
              Reminder akan mengingatkan kamu untuk mengerjakan habit sesuai jadwal. Aktifkan notifikasi di browser untuk pengingat terbaik. Kamu bisa atur jam dan hari sesuai rutinitasmu.
            </div>
          </div>
        </div>

        {/* REMINDER LIST */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading, marginBottom: 16 }}>
            Daftar Reminder
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>Tidak ada reminder</div>
              <div style={{ fontSize: 14, color: tokens.textMuted }}>
                {filterEnabled === 'aktif' ? 'Belum ada reminder yang aktif.' : 'Belum ada reminder yang nonaktif.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
              {filtered.map(r => (
                <ReminderCard key={r.id} reminder={r} onToggle={handleToggle} onEdit={setEditTarget} />
              ))}
            </div>
          )}
        </div>

      </main>

      {editTarget && <EditModal reminder={editTarget} onSave={handleSave} onCancel={() => setEditTarget(null)} />}
      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={async () => { setShowLogout(false); await logout() }} />}
    </div>
  )
}