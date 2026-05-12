
import React from 'react'
import { Badge } from './ComponentFactory'
import { tokens } from './tokens'

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
        fontFamily: tokens.fontHeading, fontSize: 28, fontWeight: 700,
        color: tokens.text, margin: 0, letterSpacing: '-0.5px',
      }}>{title}</h1>
      {subtitle && (
        <p style={{ fontSize: 14, color: tokens.textMuted, marginTop: 4, fontFamily: tokens.fontBody }}>
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
)

export interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color?: 'blue' | 'green' | 'orange' | 'red'
  trend?: string
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'blue', trend }) => {
  const colors = {
    blue:   { bg: tokens.primaryLight, iconColor: tokens.primary },
    green:  { bg: tokens.successBg,    iconColor: '#10b981' },
    orange: { bg: '#fff7ed',            iconColor: '#f97316' },
    red:    { bg: '#fef2f2',            iconColor: '#ef4444' },
  }
  const c = colors[color]
  return (
    <div style={{
      background: tokens.white, border: `1px solid ${tokens.border}`,
      borderRadius: tokens.radiusLg, padding: '20px 24px', boxShadow: tokens.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: tokens.textMuted, fontFamily: tokens.fontBody, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      </div>
      <div style={{ fontFamily: tokens.fontHeading, fontSize: 32, fontWeight: 700, color: tokens.text, letterSpacing: '-1px' }}>{value}</div>
      {trend && <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 4, fontFamily: tokens.fontBody }}>{trend}</div>}
    </div>
  )
}

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
    background: tokens.white, border: `1.5px solid ${isCompleted ? '#a7f3d0' : tokens.border}`,
    borderRadius: tokens.radiusLg, padding: '20px 24px', boxShadow: tokens.shadow,
    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
  }}>
    {isCompleted && (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
    )}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      {/* Checkbox */}
      <button onClick={isLocked ? undefined : onCheck} style={{
        width: 24, height: 24, borderRadius: 8, border: `2px solid ${isCompleted ? '#10b981' : tokens.border}`,
        background: isCompleted ? '#10b981' : tokens.white, cursor: isLocked ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
        transition: 'all 0.2s',
      }}>
        {isCompleted && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
        {isLocked && !isCompleted && <span style={{ fontSize: 11 }}>🔒</span>}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: tokens.fontBody, fontWeight: 600, fontSize: 15,
            color: tokens.text, textDecoration: isCompleted ? 'line-through' : 'none',
            opacity: isCompleted ? 0.6 : 1,
          }}>{name}</span>
          <Badge color="blue">{category}</Badge>
          {isLocked && <Badge color="gray">Terkunci</Badge>}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: tokens.textMuted, fontFamily: tokens.fontBody }}>Progress</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: tokens.primary, fontFamily: tokens.fontBody }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: tokens.border, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 100, transition: 'width 0.5s ease',
              width: `${progress}%`,
              background: progress === 100 ? '#10b981' : `linear-gradient(90deg, ${tokens.primary}, #6b8fff)`,
            }} />
          </div>
        </div>

        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 12, color: '#f97316', fontWeight: 600, fontFamily: tokens.fontBody }}>{streak} hari streak</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <ActionButton icon="✏️" onClick={onEdit} title="Edit" />
        <ActionButton icon="🗑" onClick={onDelete} title="Hapus" danger />
      </div>
    </div>
  </div>
)

const ActionButton: React.FC<{ icon: string; onClick: () => void; title: string; danger?: boolean }> = ({ icon, onClick, title, danger }) => (
  <button onClick={onClick} title={title} style={{
    width: 32, height: 32, borderRadius: 8, border: `1px solid ${danger ? '#fecaca' : tokens.border}`,
    background: danger ? '#fef2f2' : tokens.bg, cursor: 'pointer', fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
  }}>{icon}</button>
)
export interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '64px 32px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
    <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>{title}</h3>
    <p style={{ fontSize: 14, color: tokens.textMuted, fontFamily: tokens.fontBody, maxWidth: 320, lineHeight: 1.6, marginBottom: 24 }}>{description}</p>
    {action}
  </div>
)
export const ModalOverlay: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div onClick={onClose} style={{
    position: 'fixed', inset: 0, background: 'rgba(26,26,46,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: 24, animation: 'fadeIn 0.2s ease',
  }}>
    <div onClick={e => e.stopPropagation()} style={{ animation: 'fadeUp 0.25s ease', width: '100%', maxWidth: 480 }}>
      {children}
    </div>
  </div>
)