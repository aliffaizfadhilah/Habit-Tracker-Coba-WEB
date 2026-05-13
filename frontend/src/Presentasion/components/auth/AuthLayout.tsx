// ─── AuthLayout — Green Theme ─────────────────────────────────────────────────
// Lokasi  : frontend/src/components/auth/AuthLayout.tsx
// Perubahan: Update gradient panel kiri dari biru → forest green theme

import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalStyles } from '../../../BusinessLogic/factories/ComponentFactory'
import { tokens } from '../../../BusinessLogic/factories/tokens'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: ReactNode
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: tokens.bg, fontFamily: tokens.fontBody,
    }}>
      <GlobalStyles />

      {/* ── Left Panel — Branding ──────────────────────────────────────────── */}
      <div
        className="auth-left-panel"
        style={{
          width: 420, flexShrink: 0,
          background: `linear-gradient(160deg, ${tokens.primaryMid} 0%, ${tokens.primaryDark} 100%)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 48px 56px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(110,231,183,0.07)',
        }} />
        <div style={{
          position: 'absolute', bottom: 60, left: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, right: 40,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(22,163,74,0.25)',
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', position: 'relative', zIndex: 1,
          }}
        >
          <div style={{
            width: 38, height: 38,
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, border: '1px solid rgba(255,255,255,0.18)',
          }}>✦</div>
          <span style={{
            fontFamily: tokens.fontHeading, fontWeight: 700,
            fontSize: '20px', color: '#fff',
          }}>HabitTracker</span>
        </div>

        {/* Quote + Features */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontFamily: tokens.fontHeading, fontSize: '26px', fontWeight: 700,
            color: '#fff', lineHeight: 1.4, marginBottom: 24, letterSpacing: '-0.5px',
          }}>
            "Bangun kebiasaan baik,<br />satu hari dalam satu waktu."
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🎯', text: 'Pantau progres harian' },
              { icon: '🔥', text: 'Jaga streak tetap berjalan' },
              { icon: '📊', text: 'Lihat laporan mingguan' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34,
                  background: 'rgba(255,255,255,0.10)',
                  borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                }}>{item.icon}</div>
                <span style={{
                  fontSize: '14px', color: 'rgba(255,255,255,0.75)',
                  fontFamily: tokens.fontBody,
                }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Stats mini */}
          <div style={{
            marginTop: 32, display: 'flex', gap: 20,
            borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24,
          }}>
            {[{ v: '100%', l: 'Gratis' }, { v: '∞', l: 'Habit' }, { v: '4.9★', l: 'Rating' }].map(s => (
              <div key={s.l}>
                <div style={{
                  fontFamily: tokens.fontHeading, fontSize: '22px',
                  fontWeight: 800, color: tokens.accentLight,
                }}>{s.v}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease' }}>

          {/* Brand mark mobile (hidden on desktop via left panel) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32,
          }}>
            <div style={{
              width: 32, height: 32, background: tokens.primary, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            }}>✦</div>
            <span style={{
              fontFamily: tokens.fontHeading, fontWeight: 800,
              fontSize: '17px', color: tokens.text,
            }}>HabitTracker</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: tokens.fontHeading, fontSize: '28px', fontWeight: 800,
              color: tokens.text, margin: '0 0 8px', letterSpacing: '-0.5px',
            }}>{title}</h1>
            <p style={{
              fontSize: '14px', color: tokens.textMuted,
              lineHeight: 1.65, fontFamily: tokens.fontBody,
            }}>{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}