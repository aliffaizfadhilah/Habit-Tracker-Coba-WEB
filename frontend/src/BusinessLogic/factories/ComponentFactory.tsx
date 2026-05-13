// ─── ComponentFactory — Factory Pattern ───────────────────────────────────────
// Lokasi : frontend/src/factories/ComponentFactory.tsx
// Pattern: Factory — satu pintu pembuatan komponen UI
// Perubahan:
//  - Hapus GoogleIcon (Google OAuth dihapus)
//  - Update semua warna ke green theme (tokens v2)
//  - Update shadow & focus ring ke green

import React from 'react'
import { tokens } from './tokens'
export { tokens }

// ─── Button ───────────────────────────────────────────────────────────────────
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
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
    fontFamily: tokens.fontBody, fontWeight: 600, letterSpacing: '0.2px',
    transition: 'all 0.2s', borderRadius: tokens.radiusSm, width: '100%',
    opacity: disabled || loading ? 0.6 : 1,
  }

  const sizes = {
    sm: { padding: '10px 16px', fontSize: '13px' },
    md: { padding: '14px 20px', fontSize: '15px' },
    lg: { padding: '16px 24px', fontSize: '16px' },
  }

  const variants: Record<string, React.CSSProperties> = {
    primary:   {
      background: tokens.primary,
      color: '#fff',
      boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
    },
    secondary: {
      background: tokens.primaryLight,
      color: tokens.primary,
      border: `1px solid ${tokens.border}`,
    },
    ghost: {
      background: 'transparent',
      color: tokens.textMuted,
      border: `1.5px solid ${tokens.border}`,
    },
    danger: {
      background: '#fef2f2',
      color: tokens.error,
      border: `1px solid #fecaca`,
    },
  }

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (disabled || loading) return
        if (variant === 'primary') {
          e.currentTarget.style.background = tokens.primaryHover
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.30)'
        }
        if (variant === 'ghost') {
          e.currentTarget.style.borderColor = tokens.primary
          e.currentTarget.style.color = tokens.primary
          e.currentTarget.style.background = tokens.primaryLighter
        }
      }}
      onMouseLeave={e => {
        if (disabled || loading) return
        if (variant === 'primary') {
          e.currentTarget.style.background = tokens.primary
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,163,74,0.25)'
        }
        if (variant === 'ghost') {
          e.currentTarget.style.borderColor = tokens.border
          e.currentTarget.style.color = tokens.textMuted
          e.currentTarget.style.background = 'transparent'
        }
      }}
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

// ─── Input ────────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightElement?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({ label, error, rightElement, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && (
      <label style={{
        fontSize: '13px', fontWeight: 500, color: tokens.textMuted,
        fontFamily: tokens.fontBody, letterSpacing: '0.3px',
      }}>{label}</label>
    )}
    <div style={{ position: 'relative' }}>
      <input
        style={{
          width: '100%', padding: '13px 16px', fontSize: '14px',
          fontFamily: tokens.fontBody, color: tokens.text,
          background: tokens.white,
          border: `1.5px solid ${error ? tokens.error : tokens.border}`,
          borderRadius: tokens.radiusSm, outline: 'none', transition: 'all 0.2s',
          boxSizing: 'border-box', paddingRight: rightElement ? '48px' : '16px',
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = error ? tokens.error : tokens.primary
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error
            ? 'rgba(220,38,38,0.10)'
            : 'rgba(22,163,74,0.12)'}`
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
      <span style={{ fontSize: '12px', color: tokens.error, fontFamily: tokens.fontBody }}>
        {error}
      </span>
    )}
  </div>
)

// ─── Alert ────────────────────────────────────────────────────────────────────
export interface AlertProps {
  type: 'error' | 'success' | 'info'
  message: string
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  if (!message) return null
  const styles = {
    error:   { bg: tokens.errorBg,     border: '#fecaca', color: '#b91c1c', icon: '⚠' },
    success: { bg: tokens.successBg,   border: tokens.borderMid, color: '#14532d', icon: '✓' },
    info:    { bg: tokens.primaryLight, border: tokens.border,    color: '#14532d', icon: 'ℹ' },
  }
  const s = styles[type]
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: tokens.radiusSm,
      padding: '12px 14px', fontSize: '13px', color: s.color,
      fontFamily: tokens.fontBody,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{s.icon}</span>
      {message}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
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

// ─── Badge ────────────────────────────────────────────────────────────────────
export interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'emerald' | 'orange' | 'red' | 'gray'
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'green' }) => {
  const colors = {
    green:   { bg: tokens.primaryLight, color: tokens.primary },
    emerald: { bg: tokens.successBg,    color: '#065f46' },
    orange:  { bg: '#fff7ed',           color: '#c2410c' },
    red:     { bg: tokens.errorBg,      color: tokens.error },
    gray:    { bg: '#f3f4f6',           color: tokens.textMuted },
  }
  const c = colors[color]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 100, fontSize: '11px', fontWeight: 600,
      fontFamily: tokens.fontBody, letterSpacing: '0.3px',
      background: c.bg, color: c.color,
    }}>{children}</span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
    <div style={{ flex: 1, height: 1, background: tokens.border }} />
    {label && (
      <span style={{ fontSize: '12px', color: tokens.textLight, fontFamily: tokens.fontBody }}>
        {label}
      </span>
    )}
    <div style={{ flex: 1, height: 1, background: tokens.border }} />
  </div>
)

// ─── Global Styles ────────────────────────────────────────────────────────────
export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: ${tokens.bg}; color: ${tokens.text}; }
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes fadeUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    input::placeholder { color: ${tokens.textLight}; }
    input:focus { outline: none; }
    a { color: ${tokens.primary}; }
    a:hover { color: ${tokens.primaryHover}; }
  `}</style>
)