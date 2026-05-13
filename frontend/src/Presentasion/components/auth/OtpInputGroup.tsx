// ─── OtpInputGroup — Reusable Component ──────────────────────────────────────
// Lokasi  : frontend/src/components/auth/OtpInputGroup.tsx
// Dipakai : ForgotPassword.tsx (step OTP) — HANYA untuk forgot password
// Perubahan: Update warna focus/active ke green theme

import React, { useRef } from 'react'
import { tokens } from '../../../BusinessLogic/factories/tokens'

export interface OtpInputGroupProps {
  value: string[]
  onChange: (digits: string[]) => void
  length?: number
}

export const OtpInputGroup: React.FC<OtpInputGroupProps> = ({
  value, onChange, length = 6,
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...value]
    next[i] = val
    onChange(next)
    if (val && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft'  && i > 0)            inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < length - 1)   inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = [...value]
    pasted.split('').forEach((char, i) => { next[i] = char })
    onChange(next)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={i === 0}
          style={{
            width: 52, height: 58, textAlign: 'center',
            fontSize: '22px', fontWeight: 700,
            background: value[i] ? tokens.primaryLighter : tokens.white,
            border: `1.5px solid ${value[i] ? tokens.primary : tokens.border}`,
            borderRadius: tokens.radiusSm,
            color: value[i] ? tokens.primary : tokens.text,
            outline: 'none', transition: 'all 0.2s',
            fontFamily: tokens.fontBody,
            boxShadow: value[i] ? `0 0 0 3px rgba(22,163,74,0.12)` : 'none',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = tokens.primary
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'
            e.currentTarget.style.background = tokens.primaryLighter
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = value[i] ? tokens.primary : tokens.border
            e.currentTarget.style.boxShadow = value[i] ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none'
            e.currentTarget.style.background = value[i] ? tokens.primaryLighter : tokens.white
          }}
        />
      ))}
    </div>
  )
}