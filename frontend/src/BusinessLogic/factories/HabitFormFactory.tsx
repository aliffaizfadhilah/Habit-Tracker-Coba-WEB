
import React from 'react'
import { Button, Input, Badge } from './ComponentFactory'
import { habitCompletionService } from '../services/HabitCompletionService'
import { Search, Sparkles, Pencil, Trash2, BarChart2, Clock, Calendar, Lock, Flame, Trophy } from 'lucide-react'

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
  { value: 'kesehatan',         label: 'Kesehatan' },
  { value: 'ilmu_pengetahuan',  label: 'Ilmu Pengetahuan' },
  { value: 'spiritual',         label: 'Spiritual' },
  { value: 'finansial',         label: 'Finansial' },
  { value: 'personal',          label: 'Personal' },
  { value: 'lainnya',           label: 'Lainnya' },
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
    { id: 'semua',            label: 'Semua' },
    { id: 'belum_selesai',    label: 'Belum Selesai' },
    { id: 'selesai_hari_ini', label: 'Selesai Hari ini' },
    { id: 'selesai',          label: 'Selesai' }
  ]

  return (
    <div className="flex gap-2 p-1 bg-border rounded-xl w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-[9px] border-0 cursor-pointer font-body text-[13px] flex items-center gap-1.5 transition-all duration-200 ${
            active === tab.id
              ? 'font-semibold bg-white text-ink shadow-card'
              : 'font-normal bg-transparent text-muted'
          }`}
        >
          {tab.label}
          <span className={`py-px px-[7px] rounded-full text-[11px] font-semibold ${
            active === tab.id ? 'bg-primary-light text-primary' : 'bg-transparent text-muted'
          }`}>
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  )
}

export interface HabitActionBarProps {
  search:   string
  onSearch: (v: string) => void
  onTambah: () => void
}

export const HabitActionBar: React.FC<HabitActionBarProps> = ({ search, onSearch, onTambah }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="relative flex-1 max-w-xs">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none flex items-center">
        <Search size={15} />
      </span>
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Cari habit..."
        className="w-full py-2.5 pl-10 pr-3.5 text-[13px] font-body text-ink bg-white border-[1.5px] border-border rounded-md outline-none transition-all duration-200 box-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(43,89,255,0.08)]"
      />
    </div>
    <Button variant="primary" size="sm" onClick={onTambah} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
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
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-medium text-muted font-body tracking-[0.3px]">
      Kategori
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full py-[13px] px-4 text-sm font-body appearance-none bg-white border-[1.5px] rounded-md outline-none cursor-pointer transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(43,89,255,0.08)] ${
        value ? 'text-ink' : 'text-subtle'
      } ${error ? 'border-error' : 'border-border'}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
      }}
    >
      <option value="" disabled>Pilih kategori...</option>
      {HABIT_CATEGORIES.map(c => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
    {error && <span className="text-xs text-error font-body">{error}</span>}
  </div>
)

export interface CategoryOtherInputProps {
  value:    string
  onChange: (v: string) => void
  error?:   string
}

export const CategoryOtherInput: React.FC<CategoryOtherInputProps> = ({ value, onChange, error }) => (
  <div className="overflow-hidden max-h-20 opacity-100" style={{ transition: 'max-height 0.25s ease, opacity 0.2s ease' }}>
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
  mode:     'create' | 'edit'
  form:     HabitFormData
  errors:   Partial<Record<keyof HabitFormData, string>>
  loading:  boolean
  onChange: (field: keyof HabitFormData, value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

export const HabitFormCard: React.FC<HabitFormCardProps> = ({
  mode, form, errors, loading, onChange, onSubmit, onCancel,
}) => {
  const isOther = form.category === 'lainnya'

  return (
    <div className="bg-white border border-border rounded-lg p-7 shadow-green w-full max-w-[520px]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-heading text-xl font-bold text-ink mb-1 flex items-center gap-2">
          {mode === 'create'
            ? <><Sparkles size={18} /> Tambah Habit Baru</>
            : <><Pencil size={18} /> Edit Habit</>}
        </h3>
        <p className="text-[13px] text-muted font-body">
          {mode === 'create'
            ? 'Mulai perjalanan kebiasaan barumu!'
            : 'Perbarui detail habit kamu.'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
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

        {isOther && (
          <CategoryOtherInput
            value={form.customCategory}
            onChange={v => onChange('customCategory', v)}
            error={errors.customCategory}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
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
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock size={16} color="#1e3a22" />
            <span className="text-[13px] font-semibold text-ink-body font-body">Pengingat Harian</span>
            <span className="text-[11px] text-error font-semibold">*wajib</span>
          </div>
          <Input
            label="Jam pengingat"
            type="time"
            value={form.reminder_time}
            onChange={e => onChange('reminder_time', e.target.value)}
            error={errors.reminder_time}
          />
          <p className="text-xs text-muted font-body mt-1.5">
            Notifikasi akan muncul setiap hari pada jam ini saat browser terbuka.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-6">
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
  habit:     HabitGridItem
  onEdit:    (habit: HabitGridItem) => void
  onDelete:  (habit: HabitGridItem) => void
  onReport?: (habit: HabitGridItem) => void
}

export const HabitGridCard: React.FC<HabitGridCardProps> = ({ habit, onEdit, onDelete, onReport }) => {
  const progress   = Number(habit.progress_percent)
  const isComplete = habitCompletionService.isComplete(habit)

  const lockedBtnCls = 'w-8 h-8 rounded-sm border border-border bg-[#f9fafb] flex items-center justify-center opacity-35 cursor-not-allowed pointer-events-none'

  return (
    <div className={`bg-white border-[1.5px] ${isComplete ? 'border-border-mid' : 'border-border'} rounded-lg px-[22px] py-5 shadow-card transition-all duration-200 relative overflow-hidden flex flex-col gap-3`}>
      {/* Top accent jika selesai */}
      {isComplete && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-accent" />
      )}

      {/* Header: title + badge + actions */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-body font-semibold text-[15px] text-ink overflow-hidden text-ellipsis whitespace-nowrap">
              {habit.title}
            </span>
            {isComplete && <Badge color="emerald">Selesai</Badge>}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge color="green">{getCategoryLabel(habit.category)}</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 flex-shrink-0 ml-2">
          {onReport && (
            <button
              onClick={() => onReport(habit)}
              title="Lihat laporan"
              className="w-8 h-8 rounded-sm border border-border bg-primary-light cursor-pointer flex items-center justify-center transition-all duration-150"
            >
              <BarChart2 size={14} color="#16a34a" />
            </button>
          )}

          {isComplete ? (
            <div className={lockedBtnCls} title="Habit selesai — tidak bisa diedit"><Pencil size={14} /></div>
          ) : (
            <button
              onClick={() => onEdit(habit)}
              title="Edit"
              className="w-8 h-8 rounded-sm border border-border bg-surface cursor-pointer flex items-center justify-center transition-all duration-150"
            >
              <Pencil size={14} />
            </button>
          )}

          {isComplete ? (
            <div className={lockedBtnCls} title="Habit selesai — tidak bisa dihapus"><Trash2 size={14} /></div>
          ) : (
            <button
              onClick={() => onDelete(habit)}
              title="Hapus"
              className="w-8 h-8 rounded-sm border border-[#fecaca] bg-[#fef2f2] cursor-pointer flex items-center justify-center transition-all duration-150"
            >
              <Trash2 size={14} color="#dc2626" />
            </button>
          )}
        </div>
      </div>

      {/* Periode */}
      <span className="text-xs text-muted font-body inline-flex items-center gap-1">
        <Calendar size={12} /> {habit.periode_start} s/d {habit.periode_end}
      </span>

      {/* Locked banner */}
      {isComplete && (
        <div className="bg-primary-light border border-border-mid rounded-sm px-3 py-2 text-xs text-primary-mid font-body flex items-center gap-1.5">
          <Lock size={12} /> Habit ini sudah selesai dan tidak dapat diubah lagi.
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-muted font-body">
            Progress ({habit.total_completed_days}/{habit.total_period_days} hari)
          </span>
          <span className="text-xs font-bold font-body text-primary">{progress}%</span>
        </div>
        <div className="h-[7px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-[600ms] ease"
            style={{
              width: `${progress}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #16a34a, #10b981)'
                : 'linear-gradient(90deg, #16a34a, #6b8fff)',
            }}
          />
        </div>
      </div>

      {/* Footer: streak */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Flame size={14} color="#f97316" />
          <span className="text-xs font-semibold text-[#f97316] font-body">
            {habit.current_streak} hari streak
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy size={12} color="#4b7a54" />
          <span className="text-xs font-semibold text-ink font-body">
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
  <div className="bg-white rounded-[20px] p-8 shadow-card w-full max-w-sm text-center">
    <div className="mb-3 flex justify-center">
      <Trash2 size={40} color="#dc2626" />
    </div>
    <h3 className="font-heading text-xl font-bold text-ink mb-2">Hapus Habit?</h3>
    <p className="text-sm text-muted mb-1.5 leading-[1.6] font-body">
      Kamu akan menghapus habit:
    </p>
    <p className="text-[15px] font-semibold text-ink font-body mb-5">
      "{habitTitle}"
    </p>
    <p className="text-[13px] text-muted mb-6 font-body">
      Data streak & progress tetap tersimpan untuk laporan.
    </p>
    <div className="flex gap-2.5">
      <Button variant="ghost" onClick={onCancel} disabled={loading} style={{ flex: 1 }}>
        Batal
      </Button>
      <Button variant="danger" onClick={onConfirm} loading={loading} style={{ flex: 1 }}>
        Ya, Hapus
      </Button>
    </div>
  </div>
)
