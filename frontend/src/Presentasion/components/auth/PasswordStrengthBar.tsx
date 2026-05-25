import React from 'react'

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
const colors  = ['', '#ef4444', '#f97316', '#eab308', '#16a34a']

export interface PasswordStrengthBarProps { password: string }

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const strength = getStrength(password)
  if (!password) return null

  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: n <= strength ? colors[strength] : '#d1fae5' }}
          />
        ))}
      </div>
      <p className="text-xs font-medium font-body" style={{ color: colors[strength] || '#86a98d' }}>
        {labels[strength]}
      </p>
    </div>
  )
}
