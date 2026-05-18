import { useState } from 'react'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { useReminder } from '../../BusinessLogic/hooks/useReminder'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { Alert, Button } from '../../BusinessLogic/factories/ComponentFactory'
import type { HabitGridItem } from '../../BusinessLogic/factories/HabitFormFactory'
import { notificationService } from '../../BusinessLogic/services/NotificationService'
import { Clock, Pencil, Menu, CheckCircle, PauseCircle, BellOff } from 'lucide-react'

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
    <div className={`bg-white border border-border rounded-lg p-7 shadow-card transition-all ${active ? 'opacity-100' : 'opacity-[0.65]'}`}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-[14px] shrink-0 ${active ? 'bg-primary-light' : 'bg-[#f3f4f6]'} flex items-center justify-center`}>
          <Clock size={22} color={active ? '#16a34a' : '#4b7a54'} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-heading text-[15px] font-bold text-ink mb-1">{habit.title}</div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`text-[22px] font-bold font-heading ${active ? 'text-primary' : 'text-muted'}`}>
              {habit.reminder_time}
            </span>
            <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-body bg-primary-light text-primary">
              {habit.category}
            </span>
          </div>
          <p className="text-xs text-muted font-body mt-1">Setiap hari pukul {habit.reminder_time}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-body ${active ? 'bg-primary-light text-primary' : 'bg-[#f3f4f6] text-muted'}`}>
            {active ? 'Aktif' : 'Nonaktif'}
          </span>

          <button
            onClick={() => onEdit(habit)}
            title="Edit waktu"
            className="w-8 h-8 rounded-[8px] border border-border bg-white cursor-pointer flex items-center justify-center"
          ><Pencil size={14} /></button>

          <button
            onClick={() => onToggle(habit.id_habit, !active)}
            className="w-11 h-6 rounded-full border-none cursor-pointer p-0.5 relative transition-[background_0.2s]"
            style={{ background: active ? '#16a34a' : '#d1d5db' }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-[left_0.2s] shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
              style={{ left: active ? 22 : 2 }}
            />
          </button>
        </div>
      </div>
    </div>
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
  const [time, setTime]     = useState(habit.reminder_time ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

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
      className="fixed inset-0 bg-[rgba(11,26,14,0.55)] backdrop-blur-[4px] flex items-center justify-center z-[300] p-6"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-xl p-8 shadow-float w-full max-w-[400px]"
      >
        <h3 className="font-heading text-lg font-bold text-ink mb-1.5">
          <span className="flex items-center gap-2"><Pencil size={16} /> Edit Waktu Pengingat</span>
        </h3>
        <p className="text-[13px] text-muted font-body mb-5">{habit.title}</p>

        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

        <div className="mb-6">
          <label className="text-[13px] font-semibold text-ink-body block mb-1.5 font-body">Jam Pengingat</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full py-3 px-4 text-[15px] font-body text-ink bg-white border-[1.5px] border-border rounded-sm outline-none"
          />
        </div>

        <div className="flex gap-2.5">
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

  const [showLogout, setShowLogout]         = useState(false)
  const [editTarget, setEditTarget]         = useState<HabitGridItem | null>(null)
  const [toast, setToast]                   = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    notificationService.isSupported ? Notification.permission : 'denied'
  )

  const handleRequestNotifPermission = async () => {
    const granted = await notificationService.requestPermission()
    setNotifPermission(granted ? 'granted' : 'denied')
    if (granted) showToast('success', 'Izin notifikasi diterima!')
    else showToast('error', 'Izin notifikasi ditolak. Aktifkan melalui pengaturan browser.')
  }

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
    <div className="flex min-h-screen bg-surface font-body">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="reminder"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 ${isMobile ? 'p-5 px-4' : 'p-8 px-10'}`}>
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-7">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
          ><Menu size={16} /></button>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-extrabold text-ink m-0">Pengingat</h1>
            <p className="text-[13px] text-muted m-0 mt-0.5">Kelola jadwal pengingat untuk setiap habit-mu</p>
          </div>
        </div>

        {toast && <div className="mb-5"><Alert type={toast.type} message={toast.message} /></div>}

        {/* Notification permission banner */}
        {notifPermission === 'default' && (
          <div className="mb-5 flex items-center gap-3.5 bg-[#fffbeb] border border-[#fcd34d] rounded-lg px-5 py-4">
            <BellOff size={18} className="shrink-0 text-[#d97706]" />
            <p className="flex-1 text-[13px] text-[#92400e] font-body m-0">
              Izinkan notifikasi agar pengingat habit bisa muncul tepat waktu.
            </p>
            <Button variant="primary" onClick={handleRequestNotifPermission} style={{ flexShrink: 0 }}>
              Izinkan
            </Button>
          </div>
        )}

        {notifPermission === 'denied' && notificationService.isSupported && (
          <div className="mb-5 flex items-center gap-3.5 bg-[#fff1f2] border border-[#fca5a5] rounded-lg px-5 py-4">
            <BellOff size={18} className="shrink-0 text-[#dc2626]" />
            <p className="flex-1 text-[13px] text-[#991b1b] font-body m-0">
              Notifikasi diblokir. Aktifkan melalui pengaturan browser untuk menerima pengingat.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-5">
            <Alert type="error" message={error} />
            <button onClick={refetch} className="mt-2 text-[13px] text-primary bg-transparent border-none cursor-pointer font-body">
              Coba lagi
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {!loading && (
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mb-7`}>
            {[
              { label: 'Total Reminder', value: habitsWithReminder.length,              icon: <Clock size={20} color="#16a34a" />,       bg: 'bg-primary-light' },
              { label: 'Aktif',          value: activeCount,                            icon: <CheckCircle size={20} color="#16a34a" />,  bg: 'bg-success-bg'   },
              { label: 'Nonaktif',       value: habitsWithReminder.length - activeCount, icon: <PauseCircle size={20} color="#4b7a54" />, bg: 'bg-[#f3f4f6]'   },
            ].map(s => (
              <div key={s.label} className="bg-white border border-border rounded-lg px-5 py-[18px] shadow-card flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-[12px] ${s.bg} flex items-center justify-center shrink-0`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[22px] font-bold font-heading text-ink">{s.value}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-3.5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[90px] bg-border rounded-lg opacity-50" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && habitsWithReminder.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="mb-3"><Clock size={48} color="#4b7a54" /></div>
            <div className="text-base font-bold text-ink mb-1.5">Belum ada pengingat</div>
            <div className="text-[13px] text-muted">
              Tambahkan habit baru dan set jam pengingatnya agar muncul di sini.
            </div>
          </div>
        )}

        {/* Reminder Cards */}
        {!loading && habitsWithReminder.length > 0 && (
          <div className="flex flex-col gap-3.5">
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
