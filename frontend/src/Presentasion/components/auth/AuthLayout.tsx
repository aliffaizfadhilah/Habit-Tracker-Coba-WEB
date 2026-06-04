import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalStyles } from '../../../BusinessLogic/factories/ComponentFactory'
import { Target, Flame, BarChart2 } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: ReactNode
}

function FeatureItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[34px] h-[34px] bg-white/10 rounded-[9px] border border-white/10 flex items-center justify-center">{icon}</div>
      <span className="text-sm text-white/75 font-body">{text}</span>
    </div>
  )
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-surface font-body">
      <GlobalStyles />

      {/* ── Left Panel ─────────────────────────────────────── */}
      <div
        className="auth-left-panel w-[420px] shrink-0 flex flex-col justify-between px-12 pt-12 pb-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#166534 0%,#14532d 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full" style={{ background: 'rgba(110,231,183,0.07)' }} />
        <div className="absolute bottom-[60px] -left-[60px] w-[200px] h-[200px] rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="absolute -bottom-10 right-10 w-[140px] h-[140px] rounded-full" style={{ background: 'rgba(22,163,74,0.25)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Logo */}
        <div onClick={() => navigate('/')} className="flex items-center gap-2.5 cursor-pointer relative z-[1]">
          <div className="w-[38px] h-[38px] bg-white/10 backdrop-blur-[8px] rounded-[10px] flex items-center justify-center text-xl border border-white/20">✦</div>
          <span className="font-body font-bold text-xl text-white">HabitTracker</span>
        </div>

        {/* Quote + Features */}
        <div className="relative z-[1]">
          <p className="font-body text-[26px] font-bold text-white leading-[1.4] mb-6 tracking-tight">
            "Bangun kebiasaan baik,<br />satu hari dalam satu waktu."
          </p>
          <div className="flex flex-col gap-3">
            <FeatureItem icon={<Target size={16} color="rgba(255,255,255,0.85)" />}    text="Pantau progres harian" />
            <FeatureItem icon={<Flame size={16} color="rgba(255,255,255,0.85)" />}     text="Jaga streak tetap berjalan" />
            <FeatureItem icon={<BarChart2 size={16} color="rgba(255,255,255,0.85)" />} text="Lihat laporan mingguan" />
          </div>
          <div className="mt-8 flex gap-5 border-t border-white/10 pt-6">
            {[{ v: '100%', l: 'Gratis' }, { v: '∞', l: 'Habit' }, { v: '4.9★', l: 'Rating' }].map(s => (
              <div key={s.l}>
                <div className="font-body text-[22px] font-bold text-accent-light">{s.v}</div>
                <div className="text-[11px] text-white/45 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-12 px-8 overflow-y-auto">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center text-sm text-white">✦</div>
            <span className="font-body font-bold text-[17px] text-ink">HabitTracker</span>
          </div>
          <div className="mb-7">
            <h1 className="font-body text-[28px] font-bold text-ink m-0 mb-2">{title}</h1>
            <p className="text-sm text-muted leading-relaxed font-body">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .auth-left-panel { display: none !important; } }`}</style>
    </div>
  )
}
