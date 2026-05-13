// ─── PasswordStrengthBar — Reusable Component ────────────────────────────────
// Lokasi  : frontend/src/components/auth/PasswordStrengthBar.tsx
// Dipakai : Register.tsx & ForgotPassword.tsx (step reset)
// Perubahan: Bar tertinggi (sangat kuat) pakai warna hijau brand

import React from 'react'
import { tokens } from '../../../BusinessLogic/factories/tokens'

function getStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 8)           score++
  if (/[A-Z]/.test(password))         score++
  if (/\d/.test(password))            score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return score
}

const labels = ['', 'Terlalu lemah', 'Lemah', 'Cukup kuat', 'Sangat kuat']
const colors  = [
  '',
  '#ef4444',        // 1 — merah
  '#f97316',        // 2 — oranye
  '#eab308',        // 3 — kuning
  tokens.primary,   // 4 — hijau brand ✅
]

export interface PasswordStrengthBarProps {
  password: string
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const strength = getStrength(password)
  if (!password) return null

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{
            flex: 1, height: 4, borderRadius: 100, transition: 'all 0.3s',
            background: n <= strength ? colors[strength] : tokens.border,
          }} />
        ))}
      </div>
      <p style={{
        fontSize: '12px',
        color: colors[strength] || tokens.textLight,
        fontFamily: tokens.fontBody,
        fontWeight: 500,
      }}>
        {labels[strength]}
      </p>
    </div>
  )
}