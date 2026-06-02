import React, { useRef } from 'react'

export interface OtpInputGroupProps {
  value: string[]
  onChange: (digits: string[]) => void
  length?: number
}

export const OtpInputGroup: React.FC<OtpInputGroupProps> = ({ value, onChange, length = 6 }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...value]; next[i] = val; onChange(next)
    if (val && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft'  && i > 0)             inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < length - 1)    inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = [...value]; pasted.split('').forEach((char, i) => { next[i] = char }); onChange(next)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div className="flex justify-center gap-2.5">
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
          className="w-[52px] h-[58px] text-center text-[22px] font-bold rounded-sm border-[1.5px] outline-none transition-all font-body"
          style={{
            background: value[i] ? '#f0fdf4' : '#fff',
            borderColor: value[i] ? '#16a34a' : '#d1fae5',
            color: value[i] ? '#16a34a' : '#0f1f12',
            boxShadow: value[i] ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = '#16a34a'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.12)'
            e.currentTarget.style.background = '#f0fdf4'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = value[i] ? '#16a34a' : '#d1fae5'
            e.currentTarget.style.boxShadow = value[i] ? '0 0 0 3px rgba(22,163,74,0.12)' : 'none'
            e.currentTarget.style.background = value[i] ? '#f0fdf4' : '#fff'
          }}
        />
      ))}
    </div>
  )
}
