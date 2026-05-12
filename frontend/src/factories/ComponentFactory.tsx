
import React from 'react'
import { tokens } from './tokens'
export { tokens } // re-export supaya file lain tidak perlu ubah import

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'google' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading = false, children, disabled, style, ...props
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: tokens.fontBody, fontWeight: 500, letterSpacing: '0.2px',
    transition: 'all 0.2s', borderRadius: tokens.radius, width: '100%',
    opacity: disabled || loading ? 0.6 : 1,
  }

  const sizes = {
    sm: { padding: '10px 16px', fontSize: 13 },
    md: { padding: '14px 20px', fontSize: 15 },
    lg: { padding: '16px 24px', fontSize: 16 },
  }

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: tokens.primary, color: '#fff', boxShadow: '0 2px 8px rgba(43,89,255,0.25)' },
    secondary: { background: tokens.primaryLight, color: tokens.primary, border: `1px solid ${tokens.border}` },
    ghost:     { background: 'transparent', color: tokens.textMuted, border: `1px solid ${tokens.border}` },
    google:    { background: tokens.white, color: tokens.text, border: `1px solid ${tokens.border}`, boxShadow: tokens.shadow },
    danger:    { background: '#fef2f2', color: tokens.error, border: `1px solid #fecaca` },
  }

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            width: 14, height: 14, border: '2px solid currentColor',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite', display: 'inline-block',
          }} />
          Memproses...
        </>
      ) : children}
    </button>
  )
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightElement?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({ label, error, rightElement, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{
        fontSize: 13, fontWeight: 500, color: tokens.textMuted,
        fontFamily: tokens.fontBody, letterSpacing: '0.3px',
      }}>{label}</label>
    )}
    <div style={{ position: 'relative' }}>
      <input
        style={{
          width: '100%', padding: '13px 16px', fontSize: 14,
          fontFamily: tokens.fontBody, color: tokens.text,
          background: tokens.white, border: `1.5px solid ${error ? tokens.error : tokens.border}`,
          borderRadius: tokens.radius, outline: 'none', transition: 'all 0.2s',
          boxSizing: 'border-box', paddingRight: rightElement ? 48 : 16,
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = error ? tokens.error : tokens.primary
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(43,89,255,0.08)'}`
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? tokens.error : tokens.border
          e.currentTarget.style.boxShadow = 'none'
        }}
        {...props}
      />
      {rightElement && (
        <div style={{
          position: 'absolute', right: 14, top: '50%',
          transform: 'translateY(-50%)',
        }}>{rightElement}</div>
      )}
    </div>
    {error && (
      <span style={{ fontSize: 12, color: tokens.error, fontFamily: tokens.fontBody }}>{error}</span>
    )}
  </div>
)

export interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  if (!message) return null
  const styles = {
    error:   { bg: tokens.errorBg,   border: '#fecaca', color: '#b91c1c', icon: '⚠' },
    success: { bg: tokens.successBg, border: '#a7f3d0', color: '#065f46', icon: '✓' },
    info:    { bg: tokens.primaryLight, border: '#bfdbfe', color: '#1e40af', icon: 'ℹ' },
  }
  const s = styles[type]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: tokens.radiusSm,
      padding: '12px 14px', fontSize: 13, color: s.color, fontFamily: tokens.fontBody,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontWeight: 600 }}>{s.icon}</span>
      {message}
    </div>
  )
}

export interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  padding?: number | string
}

export const Card: React.FC<CardProps> = ({ children, style, padding = '28px 32px' }) => (
  <div style={{
    background: tokens.white, border: `1px solid ${tokens.border}`,
    borderRadius: tokens.radiusLg, padding, boxShadow: tokens.shadow,
    ...style,
  }}>
    {children}
  </div>
)

export interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray'
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue' }) => {
  const colors = {
    blue:   { bg: tokens.primaryLight, color: tokens.primary },
    green:  { bg: tokens.successBg, color: '#065f46' },
    orange: { bg: '#fff7ed', color: '#c2410c' },
    red:    { bg: tokens.errorBg, color: tokens.error },
    gray:   { bg: '#f3f4f6', color: tokens.textMuted },
  }
  const c = colors[color]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 100, fontSize: 11, fontWeight: 600,
      fontFamily: tokens.fontBody, letterSpacing: '0.3px',
      background: c.bg, color: c.color,
    }}>{children}</span>
  )
}
export const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
    <div style={{ flex: 1, height: 1, background: tokens.border }} />
    {label && <span style={{ fontSize: 12, color: tokens.textLight, fontFamily: tokens.fontBody }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: tokens.border }} />
  </div>
)

export const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: ${tokens.bg}; color: ${tokens.text}; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    input::placeholder { color: ${tokens.textLight}; }
    input:focus { outline: none; }
  `}</style>
)