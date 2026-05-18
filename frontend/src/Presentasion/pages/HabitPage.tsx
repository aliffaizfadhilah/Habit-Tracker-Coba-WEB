import { useState, useMemo } from 'react'
import { Button, Alert } from '../../BusinessLogic/factories/ComponentFactory'
import { PageHeader, EmptyState, ModalOverlay } from '../../BusinessLogic/factories/SectionFactory'
import { Menu, AlertTriangle, Sprout, Search } from 'lucide-react'
import {
  HabitActionBar, HabitGridCard, HabitFormCard, DeleteConfirmCard, FilterTabBar,
  type HabitFormData, type HabitGridItem, type FilterType,
} from '../../BusinessLogic/factories/HabitFormFactory'
import { useHabit } from '../../BusinessLogic/hooks/useHabit'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import HabitReportModal from '../components/HabitReportModal'
import { habitCompletionService } from '../../BusinessLogic/services/HabitCompletionService'

const defaultForm = (): HabitFormData => ({
  title: '', category: '', customCategory: '', periode_start: '', periode_end: '', reminder_time: '',
})

const validateForm = (form: HabitFormData): Partial<Record<keyof HabitFormData, string>> => {
  const errors: Partial<Record<keyof HabitFormData, string>> = {}
  if (!form.title.trim())   errors.title    = 'Judul habit wajib diisi.'
  if (!form.category)       errors.category = 'Pilih kategori habit.'
  if (form.category === 'lainnya' && !form.customCategory.trim()) errors.customCategory = 'Nama kategori kustom wajib diisi.'
  if (!form.periode_start)  errors.periode_start = 'Tanggal mulai wajib diisi.'
  if (!form.periode_end)    errors.periode_end   = 'Tanggal selesai wajib diisi.'
  if (form.periode_start && form.periode_end && form.periode_start > form.periode_end)
    errors.periode_end = 'Tanggal selesai harus setelah tanggal mulai.'
  if (!form.reminder_time)  errors.reminder_time = 'Waktu pengingat wajib diisi.'
  return errors
}

export default function HabitPage() {
  const { user, logout } = useAuth()
  const { habits, loading, error, refetch, createHabit, updateHabit, deleteHabit } = useHabit()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [search, setSearch]             = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('semua')
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState<HabitGridItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HabitGridItem | null>(null)
  const [reportTarget, setReportTarget] = useState<HabitGridItem | null>(null)
  const [form, setForm]                 = useState<HabitFormData>(defaultForm())
  const [formErrors, setFormErrors]     = useState<Partial<Record<keyof HabitFormData, string>>>({})
  const [submitting, setSubmitting]     = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [toast, setToast]               = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const filterCounts = useMemo(() => ({
    semua:            habits.length,
    belum_selesai:    habits.filter(h => Number(h.progress_percent) < 100).length,
    selesai:          habits.filter(h => Number(h.progress_percent) === 100).length,
    selesai_hari_ini: habits.filter(h => h.checked_today).length,
  }), [habits])

  const filteredHabits = useMemo(() =>
    habits
      .filter(h => h.title.toLowerCase().includes(search.toLowerCase()))
      .filter(h => {
        if (activeFilter === 'belum_selesai')   return Number(h.progress_percent) < 100
        if (activeFilter === 'selesai')          return Number(h.progress_percent) === 100
        if (activeFilter === 'selesai_hari_ini') return h.checked_today
        return true
      }),
    [habits, search, activeFilter]
  )

  const handleChange = (field: keyof HabitFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setFormErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleTambah = () => {
    setEditTarget(null); setForm(defaultForm()); setFormErrors({}); setShowForm(true)
  }

  const handleEdit = (habit: HabitGridItem) => {
    if (habitCompletionService.isComplete(habit)) return
    setEditTarget(habit)
    const isCustom = !['kesehatan','ilmu_pengetahuan','spiritual','finansial','personal'].includes(habit.category)
    setForm({
      title: habit.title,
      category: isCustom ? 'lainnya' : habit.category,
      customCategory: isCustom ? habit.category : '',
      periode_start: habit.periode_start,
      periode_end: habit.periode_end,
      reminder_time: habit.reminder_time ?? '',
    })
    setFormErrors({}); setShowForm(true)
  }

  const handleSubmit = async () => {
    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    const result = editTarget
      ? await updateHabit(editTarget.id_habit, form)
      : await createHabit(form)
    setSubmitting(false)
    if (result.success) {
      setShowForm(false)
      showToast('success', editTarget ? 'Habit berhasil diupdate!' : 'Habit berhasil ditambahkan!')
    } else showToast('error', result.message)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteHabit(deleteTarget.id_habit)
    setDeleting(false); setDeleteTarget(null)
    if (result.success) showToast('success', 'Habit berhasil dihapus.')
    else showToast('error', result.message)
  }

  return (
    <div className="flex min-h-screen bg-surface font-body">
      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="habits"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 ${isMobile ? 'p-5 px-4' : 'p-8 px-10'}`}>
        {/* Top bar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
          ><Menu size={16} /></button>
          <PageHeader title="Kelola Habit" subtitle="Tambah, edit, atau hapus habit kamu di sini." />
        </div>

        {toast && <div className="mb-5"><Alert type={toast.type === 'success' ? 'success' : 'error'} message={toast.message} /></div>}

        {error && (
          <div className="bg-error-bg border border-[#fecaca] rounded-md px-5 py-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-[#b91c1c] flex items-center gap-1.5"><AlertTriangle size={14} /> {error}</span>
            <Button variant="ghost" size="sm" onClick={refetch}>Coba Lagi</Button>
          </div>
        )}

        <HabitActionBar search={search} onSearch={setSearch} onTambah={handleTambah} />

        <div className="mb-5">
          <FilterTabBar active={activeFilter} onChange={setActiveFilter} counts={filterCounts} />
        </div>

        {loading && (
          <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-[200px] bg-border rounded-[16px] opacity-50" />
            ))}
          </div>
        )}

        {!loading && habits.length === 0 && (
          <EmptyState
            icon={<Sprout size={36} color="#16a34a" />}
            title="Belum ada habit"
            description="Mulai perjalananmu! Tambahkan habit pertama dan lacak progresmu setiap hari."
            action={<Button variant="primary" size="sm" onClick={handleTambah}>+ Tambah Habit Pertama</Button>}
          />
        )}

        {!loading && habits.length > 0 && filteredHabits.length === 0 && (
          <EmptyState
            icon={<Search size={36} color="#16a34a" />}
            title="Habit tidak ditemukan"
            description={`Tidak ada habit dengan kata kunci "${search}".`}
          />
        )}

        {!loading && filteredHabits.length > 0 && (
          <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {filteredHabits.map(habit => (
              <HabitGridCard
                key={habit.id_habit}
                habit={habit}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onReport={setReportTarget}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <HabitFormCard
            mode={editTarget ? 'edit' : 'create'}
            form={form}
            errors={formErrors}
            loading={submitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </ModalOverlay>
      )}

      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <DeleteConfirmCard
            habitTitle={deleteTarget.title}
            loading={deleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        </ModalOverlay>
      )}

      {reportTarget && (
        <HabitReportModal habit={reportTarget} onClose={() => setReportTarget(null)} />
      )}

      {showLogoutConfirm && (
        <LogoutModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={async () => { setShowLogoutConfirm(false); await logout() }}
        />
      )}
    </div>
  )
}
