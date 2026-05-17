// ─── SectionFactory — Factory Pattern ─────────────────────────────────────────
import React from 'react'
import { Badge } from './ComponentFactory'
import { Check, Lock, Flame, Pencil, Trash2 } from 'lucide-react'

// ─── PageHeader ───────────────────────────────────────────────────────────────
export interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
    <div>
      <h1 className="font-heading text-[28px] font-bold text-ink m-0 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted mt-1 font-body">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)

// ─── StatCard ─────────────────────────────────────────────────────────────────
export interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: 'green' | 'emerald' | 'orange' | 'red' | 'blue'
  trend?: string
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'green', trend }) => {
  const iconBg = {
    green:   'bg-primary-light',
    emerald: 'bg-success-bg',
    orange:  'bg-[#fff7ed]',
    red:     'bg-error-bg',
    blue:    'bg-[#eff6ff]',
  }[color]

  return (
    <div
      className="bg-white border border-border rounded-lg p-5 px-6 shadow-card transition-all hover:border-border-mid hover:shadow-green"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-muted font-body tracking-[0.5px] uppercase">{label}</span>
        <div className={`w-9 h-9 rounded-[10px] ${iconBg} flex items-center justify-center`}>{icon}</div>
      </div>
      <div className="font-heading text-[32px] font-bold text-ink tracking-[-1px]">{value}</div>
      {trend && <div className="text-xs text-muted mt-1 font-body">{trend}</div>}
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
  <div className={`bg-white border-[1.5px] ${isCompleted ? 'border-border-mid' : 'border-border'} rounded-lg p-5 px-6 shadow-card transition-all hover:shadow-green relative overflow-hidden`}>
    {isCompleted && (
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-accent" />
    )}
    <div className="flex items-start gap-3.5">
      <button
        onClick={isLocked ? undefined : onCheck}
        className={`w-6 h-6 rounded-[8px] border-2 ${isCompleted ? 'border-primary bg-primary' : 'border-border bg-white'} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-center shrink-0 mt-0.5 transition-all`}
      >
        {isCompleted && <Check size={13} color="#fff" strokeWidth={3} />}
        {isLocked && !isCompleted && <Lock size={11} color="#4b7a54" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`font-body font-semibold text-[15px] text-ink transition-all ${isCompleted ? 'line-through opacity-55' : ''}`}>{name}</span>
          <Badge color="green">{category}</Badge>
          {isLocked && <Badge color="gray">Terkunci</Badge>}
        </div>

        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-[11px] text-muted font-body">Progress</span>
            <span className="text-[11px] font-semibold text-primary font-body">{progress}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width_0.5s_ease]"
              style={{
                width: `${progress}%`,
                background: progress === 100
                  ? 'linear-gradient(90deg,#16a34a,#10b981)'
                  : 'linear-gradient(90deg,#16a34a,#6ee7b7)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Flame size={13} color="#f97316" />
          <span className="text-xs text-[#f97316] font-semibold font-body">{streak} hari streak</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        <ActionButton icon={<Pencil size={14} />} onClick={onEdit}   title="Edit" />
        <ActionButton icon={<Trash2 size={14} />} onClick={onDelete} title="Hapus" danger />
      </div>
    </div>
  </div>
)

const ActionButton: React.FC<{
  icon: React.ReactNode; onClick: () => void; title: string; danger?: boolean
}> = ({ icon, onClick, title, danger }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-8 h-8 rounded-[8px] border ${danger ? 'border-[#fecaca] bg-error-bg' : 'border-border bg-surface'} cursor-pointer flex items-center justify-center transition-all hover:scale-[1.08] hover:shadow-card`}
  >{icon}</button>
)

// ─── EmptyState ───────────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-5">{icon}</div>
    <h3 className="font-heading text-xl font-bold text-ink mb-2">{title}</h3>
    <p className="text-sm text-muted font-body max-w-[320px] leading-relaxed mb-6">{description}</p>
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
    className="fixed inset-0 bg-[rgba(11,26,14,0.55)] backdrop-blur-[4px] flex items-center justify-center z-[300] p-6 animate-fade-in"
  >
    <div
      onClick={e => e.stopPropagation()}
      className="animate-fade-up w-full max-w-[480px]"
    >
      {children}
    </div>
  </div>
)
