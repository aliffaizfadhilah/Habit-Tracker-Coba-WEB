// ─── ComponentFactory — Factory Pattern ───────────────────────────────────────
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
  variant = 'primary', size = 'md', loading = false, children, disabled, className = '', style, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 border-none font-body font-semibold tracking-wide transition-all rounded-sm w-full'

  const sizeClass = {
    sm: 'py-2.5 px-4 text-[13px]',
    md: 'py-3.5 px-5 text-[15px]',
    lg: 'py-4 px-6 text-base',
  }[size]

  const variantClass = {
    primary:   'bg-primary text-white shadow-[0_2px_8px_rgba(22,163,74,0.25)] hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(22,163,74,0.30)]',
    secondary: 'bg-primary-light text-primary border border-border',
    ghost:     'bg-transparent text-muted border-[1.5px] border-border hover:border-primary hover:text-primary hover:bg-primary-lighter',
    danger:    'bg-error-bg text-error border border-[#fecaca]',
  }[variant]

  const disabledClass = (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizeClass} ${variantClass} ${disabledClass} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin-fast inline-block" />
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

export const Input: React.FC<InputProps> = ({ label, error, rightElement, className = '', style, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[13px] font-medium text-muted font-body tracking-wide">{label}</label>
    )}
    <div className="relative">
      <input
        className={`w-full py-[13px] px-4 text-sm font-body text-ink bg-white border-[1.5px] ${error ? 'border-error' : 'border-border'} rounded-sm outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)] ${rightElement ? 'pr-12' : ''} ${className}`}
        style={style}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
    {error && (
      <span className="text-xs text-error font-body">{error}</span>
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
  const cls = {
    error:   'bg-error-bg border-[#fecaca] text-[#b91c1c]',
    success: 'bg-success-bg border-border-mid text-[#14532d]',
    info:    'bg-primary-light border-border text-[#14532d]',
  }[type]
  const icon = { error: '⚠', success: '✓', info: 'ℹ' }[type]
  return (
    <div className={`${cls} border rounded-sm px-3.5 py-3 text-[13px] font-body flex items-center gap-2`}>
      <span className="font-bold shrink-0">{icon}</span>
      {message}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  padding?: number | string
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, padding }) => (
  <div
    className={`bg-white border border-border rounded-lg shadow-card ${className}`}
    style={{ padding: padding ?? '28px 32px', ...style }}
  >
    {children}
  </div>
)

// ─── Badge ────────────────────────────────────────────────────────────────────
export interface BadgeProps {
  children: React.ReactNode
  color?: 'green' | 'emerald' | 'orange' | 'red' | 'gray'
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'green' }) => {
  const cls = {
    green:   'bg-primary-light text-primary',
    emerald: 'bg-success-bg text-[#065f46]',
    orange:  'bg-[#fff7ed] text-[#c2410c]',
    red:     'bg-error-bg text-error',
    gray:    'bg-[#f3f4f6] text-muted',
  }[color]
  return (
    <span className={`${cls} inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold font-body tracking-wide`}>
      {children}
    </span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-border" />
    {label && <span className="text-xs text-subtle font-body">{label}</span>}
    <div className="flex-1 h-px bg-border" />
  </div>
)

// ─── GlobalStyles ─────────────────────────────────────────────────────────────
export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
  `}</style>
)
