
import React, { useRef } from 'react'
import { tokens } from '../../factories/tokens'

export interface OtpInputGroupProps {
  value: string[]
  onChange: (digits: string[]) => void
  length?: number
}

export const OtpInputGroup: React.FC<OtpInputGroupProps> = ({ value, onChange, length = 6 }) => {
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
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = [...value]
    pasted.split('').forEach((char, i) => { next[i] = char })
    onChange(next)
    const nextFocus = Math.min(pasted.length, length - 1)
    inputs.current[nextFocus]?.focus()
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
            width: 52, height: 58, textAlign: 'center', fontSize: 22, fontWeight: 700,
            background: tokens.white, border: `1.5px solid ${value[i] ? tokens.primary : tokens.border}`,
            borderRadius: tokens.radius, color: value[i] ? tokens.primary : tokens.text,
            outline: 'none', transition: 'all 0.2s', fontFamily: tokens.fontBody,
            boxShadow: value[i] ? `0 0 0 3px rgba(43,89,255,0.08)` : 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = tokens.primary; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,89,255,0.08)' }}
          onBlur={e => {
            e.currentTarget.style.borderColor = value[i] ? tokens.primary : tokens.border
            e.currentTarget.style.boxShadow = value[i] ? '0 0 0 3px rgba(43,89,255,0.08)' : 'none'
          }}
        />
      ))}
    </div>
  )
}