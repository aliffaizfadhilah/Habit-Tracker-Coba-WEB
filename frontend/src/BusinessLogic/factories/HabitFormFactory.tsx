
import React from 'react'
import { tokens, Button, Input, Badge } from './ComponentFactory'
import { habitCompletionService } from '../services/HabitCompletionService'

export interface HabitFormData {
  title:          string
  category:       string
  customCategory: string
  periode_start:  string
  periode_end:    string
  reminder_time:  string
}

export interface HabitGridItem {
  id_habit:             number
  title:                string
  category:             string
  periode_start:        string
  periode_end:          string
  current_streak:       number
  longest_streak:       number
  progress_percent:     number
  total_completed_days: number
  total_period_days:    number
  checked_today:        boolean
  reminder_time:        string | null
  reminder_enabled:     boolean
}

export const HABIT_CATEGORIES = [
  { value: 'kesehatan',         label: '💪 Kesehatan' },
  { value: 'ilmu_pengetahuan',  label: '📚 Ilmu Pengetahuan' },
  { value: 'spiritual',         label: '🕌 Spiritual' },
  { value: 'finansial',         label: '💰 Finansial' },
  { value: 'personal',          label: '🌱 Personal' },
  { value: 'lainnya',           label: '✏️ Lainnya' },
]

export const getCategoryLabel = (value: string): string => {
  const found = HABIT_CATEGORIES.find(c => c.value === value)
  return found ? found.label : value
}

export type FilterType = 'semua' | 'selesai_hari_ini' | 'selesai' | 'belum_selesai'

export interface FilterTabBarProps {
  active:   FilterType
  onChange: (filter: FilterType) => void
 counts:   { semua: number; belum_selesai: number; selesai: number; selesai_hari_ini: number }
}

export const FilterTabBar: React.FC<FilterTabBarProps> = ({ active, onChange, counts }) => {
  const tabs: { id: FilterType; label: string }[] = [
    { id: 'semua',         label: 'Semua' },
    { id: 'belum_selesai', label: 'Belum Selesai' },
    { id: 'selesai_hari_ini', label: 'Selesai Hari ini' },
    { id: 'selesai',       label: 'Selesai' }
  ]

  return (
    <div style={{
      display: 'flex', gap: 8, padding: '4px',
      background: tokens.border, borderRadius: 12,
      width: 'fit-content',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontFamily: tokens.fontBody, fontSize: 13, fontWeight: active === tab.id ? 600 : 400,
            background: active === tab.id ? tokens.white : 'transparent',
            color: active === tab.id ? tokens.text : tokens.textMuted,
            boxShadow: active === tab.id ? tokens.shadow : 'none',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {tab.label}
          <span style={{
            padding: '1px 7px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: active === tab.id ? tokens.primaryLight : 'transparent',
            color: active === tab.id ? tokens.primary : tokens.textMuted,
          }}>
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  )
}

export interface HabitActionBarProps {
  search:        string
  onSearch:      (v: string) => void
  onTambah:      () => void
}

export const HabitActionBar: React.FC<HabitActionBarProps> = ({ search, onSearch, onTambah }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
    {/* Search */}
    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        fontSize: 15, color: tokens.textLight, pointerEvents: 'none',
      }}>🔍</span>
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Cari habit..."
        style={{
          width: '100%', padding: '10px 14px 10px 40px', fontSize: 13,
          fontFamily: tokens.fontBody, color: tokens.text,
          background: tokens.white, border: `1.5px solid ${tokens.border}`,
          borderRadius: tokens.radius, outline: 'none', transition: 'all 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = tokens.primary; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(43,89,255,0.08)` }}
        onBlur={e => { e.currentTarget.style.borderColor = tokens.border; e.currentTarget.style.boxShadow = 'none' }}
      />
    </div>

    {/* Tombol Tambah */}
    <Button
      variant="primary"
      size="sm"
      onClick={onTambah}
      style={{ width: 'auto', whiteSpace: 'nowrap' }}
    >
      + Tambah Habit
    </Button>
  </div>
)

export interface CategorySelectProps {
  value:    string
  onChange: (v: string) => void
  error?:   string
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{
      fontSize: 13, fontWeight: 500, color: tokens.textMuted,
      fontFamily: tokens.fontBody, letterSpacing: '0.3px',
    }}>Kategori</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '13px 16px', fontSize: 14,
        fontFamily: tokens.fontBody, color: value ? tokens.text : tokens.textLight,
        background: tokens.white, border: `1.5px solid ${error ? tokens.error : tokens.border}`,
        borderRadius: tokens.radius, outline: 'none', cursor: 'pointer',
        transition: 'all 0.2s', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = tokens.primary; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(43,89,255,0.08)` }}
      onBlur={e => { e.currentTarget.style.borderColor = error ? tokens.error : tokens.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      <option value="" disabled>Pilih kategori...</option>
      {HABIT_CATEGORIES.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
    {error && <span style={{ fontSize: 12, color: tokens.error, fontFamily: tokens.fontBody }}>{error}</span>}
  </div>
)

export interface CategoryOtherInputProps {
  value:    string
  onChange: (v: string) => void
  error?:   string
}

export const CategoryOtherInput: React.FC<CategoryOtherInputProps> = ({ value, onChange, error }) => (
  <div style={{
    overflow: 'hidden',
    maxHeight: 80,
    opacity: 1,
    transition: 'max-height 0.25s ease, opacity 0.2s ease',
  }}>
    <Input
      label="Nama kategori kustom"
      placeholder="Contoh: Hobi, Sosial, dll..."
      value={value}
      onChange={e => onChange(e.target.value)}
      error={error}
    />
  </div>
)

export interface HabitFormCardProps {
  mode:       'create' | 'edit'
  form:       HabitFormData
  errors:     Partial<Record<keyof HabitFormData, string>>
  loading:    boolean
  onChange:   (field: keyof HabitFormData, value: string) => void
  onSubmit:   () => void
  onCancel:   () => void
}

export const HabitFormCard: React.FC<HabitFormCardProps> = ({
  mode, form, errors, loading, onChange, onSubmit, onCancel,
}) => {
  const isOther = form.category === 'lainnya'

  return (
    <div style={{
      background: tokens.white, border: `1px solid ${tokens.border}`,
      borderRadius: tokens.radiusLg, padding: '28px 32px',
      boxShadow: tokens.shadowMd, width: '100%', maxWidth: 520,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{
          fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700,
          color: tokens.text, marginBottom: 4,
        }}>
          {mode === 'create' ? '✨ Tambah Habit Baru' : '✏️ Edit Habit'}
        </h3>
        <p style={{ fontSize: 13, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
          {mode === 'create'
            ? 'Mulai perjalanan kebiasaan barumu!'
            : 'Perbarui detail habit kamu.'}
        </p>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Judul Habit"
          placeholder="Contoh: Baca buku 30 menit..."
          value={form.title}
          onChange={e => onChange('title', e.target.value)}
          error={errors.title}
        />

        <CategorySelect
          value={form.category}
          onChange={v => onChange('category', v)}
          error={errors.category}
        />

        {/* Conditional input untuk "Lainnya" */}
        {isOther && (
          <CategoryOtherInput
            value={form.customCategory}
            onChange={v => onChange('customCategory', v)}
            error={errors.customCategory}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input
            label="Tanggal Mulai"
            type="date"
            value={form.periode_start}
            onChange={e => onChange('periode_start', e.target.value)}
            error={errors.periode_start}
          />
          <Input
            label="Tanggal Selesai"
            type="date"
            value={form.periode_end}
            onChange={e => onChange('periode_end', e.target.value)}
            error={errors.periode_end}
          />
        </div>

        {/* Reminder */}
        <div style={{ borderTop: `1px solid ${tokens.border}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>⏰</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.textBody, fontFamily: tokens.fontBody }}>
              Pengingat Harian
            </span>
            <span style={{ fontSize: 11, color: tokens.error, fontWeight: 600 }}>*wajib</span>
          </div>
          <Input
            label="Jam pengingat"
            type="time"
            value={form.reminder_time}
            onChange={e => onChange('reminder_time', e.target.value)}
            error={errors.reminder_time}
          />
          <p style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody, marginTop: 6 }}>
            Notifikasi akan muncul setiap hari pada jam ini saat browser terbuka.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <Button variant="ghost" onClick={onCancel} disabled={loading} style={{ flex: 1 }}>
          Batal
        </Button>
        <Button variant="primary" onClick={onSubmit} loading={loading} style={{ flex: 2 }}>
          {mode === 'create' ? 'Simpan Habit' : 'Update Habit'}
        </Button>
      </div>
    </div>
  )
}

export interface HabitGridCardProps {
  habit:      HabitGridItem
  onEdit:     (habit: HabitGridItem) => void
  onDelete:   (habit: HabitGridItem) => void
  onReport?:  (habit: HabitGridItem) => void
}

export const HabitGridCard: React.FC<HabitGridCardProps> = ({ habit, onEdit, onDelete, onReport }) => {
  const progress   = Number(habit.progress_percent)
  const isComplete = habitCompletionService.isComplete(habit)

  const lockedBtnStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8, border: `1px solid ${tokens.border}`,
    background: '#f9fafb', fontSize: 14, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    opacity: 0.35, cursor: 'not-allowed', pointerEvents: 'none',
  }

  return (
    <div style={{
      background: tokens.white,
      border: `1.5px solid ${isComplete ? tokens.borderMid : tokens.border}`,
      borderRadius: tokens.radiusLg, padding: '20px 22px',
      boxShadow: tokens.shadow, transition: 'all 0.2s',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Top accent jika selesai */}
      {isComplete && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`,
        }} />
      )}

      {/* Header: title + badge + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{
              fontFamily: tokens.fontBody, fontWeight: 600, fontSize: 15,
              color: tokens.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {habit.title}
            </span>
            {isComplete && <Badge color="emerald">Selesai 🎉</Badge>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Badge color="green">{getCategoryLabel(habit.category)}</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 8 }}>
          {/* Laporan — always visible */}
          {onReport && (
            <button
              onClick={() => onReport(habit)}
              title="Lihat laporan"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1px solid ${tokens.border}`, background: tokens.primaryLight,
                cursor: 'pointer', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
            >📊</button>
          )}

          {/* Edit — dikunci jika selesai */}
          {isComplete ? (
            <div style={lockedBtnStyle} title="Habit selesai — tidak bisa diedit">✏️</div>
          ) : (
            <button
              onClick={() => onEdit(habit)}
              title="Edit"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1px solid ${tokens.border}`, background: tokens.bg,
                cursor: 'pointer', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
            >✏️</button>
          )}

          {/* Delete — dikunci jika selesai */}
          {isComplete ? (
            <div style={lockedBtnStyle} title="Habit selesai — tidak bisa dihapus">🗑</div>
          ) : (
            <button
              onClick={() => onDelete(habit)}
              title="Hapus"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid #fecaca', background: '#fef2f2',
                cursor: 'pointer', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
            >🗑</button>
          )}
        </div>
      </div>

      {/* Periode */}
      <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
        📅 {habit.periode_start} s/d {habit.periode_end}
      </span>

      {/* Locked banner */}
      {isComplete && (
        <div style={{
          background: tokens.primaryLight, border: `1px solid ${tokens.borderMid}`,
          borderRadius: tokens.radiusSm, padding: '8px 12px',
          fontSize: 12, color: tokens.primaryMid, fontFamily: tokens.fontBody,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🔒 Habit ini sudah selesai dan tidak dapat diubah lagi.
        </div>
      )}

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
            Progress ({habit.total_completed_days}/{habit.total_period_days} hari)
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700, fontFamily: tokens.fontBody,
            color: isComplete ? tokens.primary : tokens.primary,
          }}>
            {progress}%
          </span>
        </div>
        <div style={{ height: 7, background: tokens.border, borderRadius: 100, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 100, transition: 'width 0.6s ease',
            width: `${progress}%`,
            background: isComplete
              ? `linear-gradient(90deg, ${tokens.primary}, ${tokens.accent})`
              : `linear-gradient(90deg, ${tokens.primary}, #6b8fff)`,
          }} />
        </div>
      </div>

      {/* Footer: streak */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', fontFamily: tokens.fontBody }}>
            {habit.current_streak} hari streak
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, color: tokens.textMuted, fontFamily: tokens.fontBody }}>🏆</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: tokens.text, fontFamily: tokens.fontBody }}>
            {habit.longest_streak} hari
          </span>
        </div>
      </div>
    </div>
  )
}

export interface DeleteConfirmCardProps {
  habitTitle: string
  loading:    boolean
  onConfirm:  () => void
  onCancel:   () => void
}

export const DeleteConfirmCard: React.FC<DeleteConfirmCardProps> = ({
  habitTitle, loading, onConfirm, onCancel,
}) => (
  <div style={{
    background: tokens.white, borderRadius: 20, padding: '32px',
    boxShadow: tokens.shadow, width: '100%', maxWidth: 400, textAlign: 'center',
  }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
    <h3 style={{
      fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700,
      color: tokens.text, marginBottom: 8,
    }}>Hapus Habit?</h3>
    <p style={{
      fontSize: 14, color: tokens.textMuted, marginBottom: 6,
      lineHeight: 1.6, fontFamily: tokens.fontBody,
    }}>
      Kamu akan menghapus habit:
    </p>
    <p style={{
      fontSize: 15, fontWeight: 600, color: tokens.text,
      fontFamily: tokens.fontBody, marginBottom: 20,
    }}>
      "{habitTitle}"
    </p>
    <p style={{
      fontSize: 13, color: tokens.textMuted, marginBottom: 24,
      fontFamily: tokens.fontBody,
    }}>
      Data streak & progress tetap tersimpan untuk laporan.
    </p>
    <div style={{ display: 'flex', gap: 10 }}>
      <Button variant="ghost" onClick={onCancel} disabled={loading} style={{ flex: 1 }}>
        Batal
      </Button>
      <Button variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1 }}>
        Ya, Hapus
      </Button>
    </div>
  </div>
)