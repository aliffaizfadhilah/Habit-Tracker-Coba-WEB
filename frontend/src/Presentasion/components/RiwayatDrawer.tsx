import { useMemo } from 'react'
import { X, CheckCircle2, Trophy, BellOff, Clock } from 'lucide-react'
import type { HabitStreak } from '../../BusinessLogic/hooks/useStreak'

interface Props {
  habits: HabitStreak[]
  open:   boolean
  onClose: () => void
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-[13px] font-bold text-ink font-heading">{title}</span>
      <span className="ml-auto text-[11px] font-bold px-2 py-[2px] rounded-full bg-primary-light text-primary">{count}</span>
    </div>
  )
}

function EmptySection({ message }: { message: string }) {
  return (
    <p className="text-[12px] text-muted font-body text-center py-3">{message}</p>
  )
}

export default function RiwayatDrawer({ habits, open, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const now   = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const dikerjakanHariIni = useMemo(
    () => habits.filter(h => h.checked_today),
    [habits]
  )

  const habitSelesai = useMemo(
    () => habits.filter(h => Number(h.progress_percent) >= 100),
    [habits]
  )

  const reminderTerlewat = useMemo(
    () => habits.filter(h =>
      h.reminder_enabled &&
      h.reminder_time !== null &&
      h.reminder_time <= currentTime &&
      !h.checked_today &&
      Number(h.progress_percent) < 100 &&
      h.periode_end >= today
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habits, today]
  )

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-[rgba(11,26,14,0.4)] backdrop-blur-[2px] z-[400]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-float z-[401] flex flex-col transition-transform duration-300"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-heading text-[17px] font-extrabold text-ink m-0">Riwayat</h2>
            <p className="text-[12px] text-muted font-body m-0 mt-0.5">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] border border-border bg-white flex items-center justify-center cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {/* ── Dikerjakan Hari Ini ────────────────────────────────── */}
          <section>
            <SectionHeader
              icon={<CheckCircle2 size={15} color="#16a34a" />}
              title="Dikerjakan Hari Ini"
              count={dikerjakanHariIni.length}
            />
            {dikerjakanHariIni.length === 0
              ? <EmptySection message="Belum ada habit yang dikerjakan hari ini." />
              : (
                <div className="flex flex-col gap-2">
                  {dikerjakanHariIni.map(h => (
                    <div
                      key={h.id_habit}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[#f0fdf4] border border-[#bbf7d0]"
                    >
                      <CheckCircle2 size={16} color="#16a34a" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-semibold text-ink truncate">{h.title}</p>
                        <p className="m-0 text-[11px] text-muted">{h.category}</p>
                      </div>
                      <span className="text-[11px] font-bold text-primary shrink-0">{Number(h.progress_percent).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )
            }
          </section>

          {/* ── Reminder Terlewat ──────────────────────────────────── */}
          <section>
            <SectionHeader
              icon={<BellOff size={15} color="#f97316" />}
              title="Reminder Terlewat"
              count={reminderTerlewat.length}
            />
            {reminderTerlewat.length === 0
              ? <EmptySection message="Tidak ada reminder yang terlewat hari ini." />
              : (
                <div className="flex flex-col gap-2">
                  {reminderTerlewat.map(h => (
                    <div
                      key={h.id_habit}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[#fff7ed] border border-[#fed7aa]"
                    >
                      <Clock size={15} color="#f97316" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-semibold text-ink truncate">{h.title}</p>
                        <p className="m-0 text-[11px] text-muted">Pengingat pukul {h.reminder_time}</p>
                      </div>
                      <span className="text-[11px] font-bold text-[#f97316] shrink-0">Belum dikerjakan</span>
                    </div>
                  ))}
                </div>
              )
            }
          </section>

          {/* ── Habit Selesai ──────────────────────────────────────── */}
          <section>
            <SectionHeader
              icon={<Trophy size={15} color="#10b981" />}
              title="Habit Selesai"
              count={habitSelesai.length}
            />
            {habitSelesai.length === 0
              ? <EmptySection message="Belum ada habit yang selesai 100%." />
              : (
                <div className="flex flex-col gap-2">
                  {habitSelesai.map(h => (
                    <div
                      key={h.id_habit}
                      className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[#f0fdf4] border border-[#bbf7d0]"
                    >
                      <Trophy size={15} color="#10b981" className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-semibold text-ink truncate">{h.title}</p>
                        <p className="m-0 text-[11px] text-muted">{h.periode_start} s/d {h.periode_end}</p>
                      </div>
                      <span className="text-[11px] font-bold text-[#10b981] shrink-0">100%</span>
                    </div>
                  ))}
                </div>
              )
            }
          </section>

        </div>
      </div>
    </>
  )
}
