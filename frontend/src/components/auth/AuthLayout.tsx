
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { GlobalStyles } from '../../factories/ComponentFactory'
import {tokens } from '../../factories/tokens'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: ReactNode
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: tokens.bg,
      fontFamily: tokens.fontBody,
    }}>
      <GlobalStyles />

      {/* Left Panel — Branding */}
      <div style={{
        width: 420, flexShrink: 0, background: `linear-gradient(160deg, #1a3fd4 0%, #0f1e5c 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 48px 56px', position: 'relative', overflow: 'hidden',
      }} className="auth-left-panel">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: 60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(43,89,255,0.3)' }} />

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid rgba(255,255,255,0.2)' }}>✦</div>
          <span style={{ fontFamily: tokens.fontHeading, fontWeight: 700, fontSize: 20, color: '#fff' }}>HabitTracker</span>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: tokens.fontHeading, fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 20, letterSpacing: '-0.5px' }}>
            "Bangun kebiasaan baik,<br />satu hari dalam satu waktu."
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🎯', text: 'Pantau progres harian' },
              { icon: '🔥', text: 'Jaga streak tetap berjalan' },
              { icon: '📊', text: 'Lihat laporan mingguan' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{item.icon}</div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: tokens.fontBody }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.4s ease' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: tokens.fontHeading, fontSize: 28, fontWeight: 800,
              color: tokens.text, margin: '0 0 8px', letterSpacing: '-0.5px',
            }}>{title}</h1>
            <p style={{ fontSize: 14, color: tokens.textMuted, lineHeight: 1.6, fontFamily: tokens.fontBody }}>{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      {/* Hide left panel on mobile */}
      <style>{`
        @media (max-width: 768px) { .auth-left-panel { display: none !important; } }
      `}</style>
    </div>
  )
}