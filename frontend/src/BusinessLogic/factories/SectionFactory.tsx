// ─── SectionFactory — Factory Pattern ─────────────────────────────────────────
// Lokasi : frontend/src/factories/SectionFactory.tsx
// Pattern: Factory — section-level components: PageHeader, StatCard, HabitCard
// Perubahan: Update semua warna ke green theme (tokens v2)

import React from 'react'
import { Badge } from './ComponentFactory'
import { tokens } from './tokens'

// ─── PageHeader ───────────────────────────────────────────────────────────────
export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 32, flexWrap: 'wrap', gap: 16,
  }}>
    <div>
      <h1 style={{
        fontFamily: tokens.fontHeading, fontSize: '28px', fontWeight: 700,
        color: tokens.text, margin: 0, letterSpacing: '-0.5px',
      }}>{title}</h1>
      {subtitle && (
        <p style={{
          fontSize: '14px', color: tokens.textMuted,
          marginTop: 4, fontFamily: tokens.fontBody,
        }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
)

// ─── StatCard ─────────────────────────────────────────────────────────────────
export interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color?: 'green' | 'emerald' | 'orange' | 'red' | 'blue'
  trend?: string
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'green', trend }) => {
  const colors = {
  green:   { bg: tokens.primaryLight,  iconColor: tokens.primary },
  emerald: { bg: tokens.successBg,     iconColor: tokens.accent },
  orange:  { bg: '#fff7ed',            iconColor: '#f97316' },
  red:     { bg: tokens.errorBg,       iconColor: tokens.error },
  blue:    { bg: '#eff6ff',            iconColor: '#3b82f6' }, // ← tambah ini
}
  const c = colors[color]
  return (
    <div style={{
      background: tokens.white, border: `1px solid ${tokens.border}`,
      borderRadius: tokens.radiusLg, padding: '20px 24px', boxShadow: tokens.shadow,
      transition: tokens.transitionBase,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = tokens.borderMid
        e.currentTarget.style.boxShadow = tokens.shadowMd
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = tokens.border
        e.currentTarget.style.boxShadow = tokens.shadow
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: tokens.textMuted,
          fontFamily: tokens.fontBody, letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>{label}</span>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: c.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>{icon}</div>
      </div>
      <div style={{
        fontFamily: tokens.fontHeading, fontSize: '32px', fontWeight: 700,
        color: tokens.text, letterSpacing: '-1px',
      }}>{value}</div>
      {trend && (
        <div style={{ fontSize: '12px', color: tokens.textMuted, marginTop: 4, fontFamily: tokens.fontBody }}>
          {trend}
        </div>
      )}
    </div>
  )
}

// ─── HabitCard ────────────────────────────────────────────────────────────────
export interface HabitCardProps {
  name: string
  category: string
  streak: number
  progress: number
  isCompleted: boolean
  isLocked?: boolean
  onCheck: () => void
  onEdit: () => void
  onDelete: () => void
}

export const HabitCard: React.FC<HabitCardProps> = ({
  name, category, streak, progress, isCompleted, isLocked, onCheck, onEdit, onDelete,
}) => (
  <div style={{
    background: tokens.white,
    border: `1.5px solid ${isCompleted ? tokens.borderMid : tokens.border}`,
    borderRadius: tokens.radiusLg, padding: '20px 24px', boxShadow: tokens.shadow,
    transition: tokens.transitionBase, position: 'relative', overflow: 'hidden',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = tokens.shadowMd }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = tokens.shadow }}
  >
    {/* Completed top bar */}
    {isCompleted && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`,
      }} />
    )}

    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      {/* Checkbox */}
      <button
        onClick={isLocked ? undefined : onCheck}
        style={{
          width: 24, height: 24, borderRadius: 8,
          border: `2px solid ${isCompleted ? tokens.primary : tokens.border}`,
          background: isCompleted ? tokens.primary : tokens.white,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 2, transition: 'all 0.2s',
        }}>
        {isCompleted && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>✓</span>}
        {isLocked && !isCompleted && <span style={{ fontSize: '11px' }}>🔒</span>}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: tokens.fontBody, fontWeight: 600, fontSize: '15px',
            color: tokens.text, textDecoration: isCompleted ? 'line-through' : 'none',
            opacity: isCompleted ? 0.55 : 1, transition: 'all 0.2s',
          }}>{name}</span>
          <Badge color="green">{category}</Badge>
          {isLocked && <Badge color="gray">Terkunci</Badge>}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '11px', color: tokens.textMuted, fontFamily: tokens.fontBody }}>
              Progress
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: tokens.primary, fontFamily: tokens.fontBody }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: 6, background: tokens.border, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 100, transition: 'width 0.5s ease',
              width: `${progress}%`,
              background: progress === 100
                ? `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`
                : `linear-gradient(90deg, ${tokens.primary}, ${tokens.accentLight})`,
            }} />
          </div>
        </div>

        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '13px' }}>🔥</span>
          <span style={{ fontSize: '12px', color: '#f97316', fontWeight: 600, fontFamily: tokens.fontBody }}>
            {streak} hari streak
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionButton icon="✏️" onClick={onEdit}   title="Edit" />
        <ActionButton icon="🗑"  onClick={onDelete} title="Hapus" danger />
      </div>
    </div>
  </div>
)

const ActionButton: React.FC<{
  icon: string; onClick: () => void; title: string; danger?: boolean
}> = ({ icon, onClick, title, danger }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 8,
      border: `1px solid ${danger ? '#fecaca' : tokens.border}`,
      background: danger ? '#fef2f2' : tokens.bg,
      cursor: 'pointer', fontSize: '14px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'scale(1.08)'
      e.currentTarget.style.boxShadow = tokens.shadow
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'scale(1)'
      e.currentTarget.style.boxShadow = 'none'
    }}
  >{icon}</button>
)

// ─── EmptyState ───────────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '64px 32px', textAlign: 'center',
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: '50%', background: tokens.primaryLight,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '36px', marginBottom: 20,
    }}>{icon}</div>
    <h3 style={{
      fontFamily: tokens.fontHeading, fontSize: '20px', fontWeight: 700,
      color: tokens.text, marginBottom: 8,
    }}>{title}</h3>
    <p style={{
      fontSize: '14px', color: tokens.textMuted, fontFamily: tokens.fontBody,
      maxWidth: 320, lineHeight: 1.65, marginBottom: 24,
    }}>{description}</p>
    {action}
  </div>
)

// ─── ModalOverlay ─────────────────────────────────────────────────────────────
export const ModalOverlay: React.FC<{
  children: React.ReactNode
  onClose: () => void
}> = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(11,26,14,0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: 24, animation: 'fadeIn 0.2s ease',
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ animation: 'fadeUp 0.25s ease', width: '100%', maxWidth: 480 }}
    >
      {children}
    </div>
  </div>
)