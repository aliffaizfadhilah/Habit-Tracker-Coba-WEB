import { useCallback, useEffect, useState } from 'react'
import { Users, Repeat2, FileText, Eye, Flag } from 'lucide-react'
import { SimpleLineChart } from '../../components/SimpleChart'
import AdminLayout from './AdminLayout'
import { http } from '../../../BusinessLogic/services/HttpService'
import { useAdminRealtime } from '../../../BusinessLogic/hooks/useAdminRealtime'

interface Stats {
  total_users: number
  total_habits: number
  total_posts: number
  total_visitors: number
  pending_reports: number
}

interface ChartPoint { date: string; total: number }

function StatCard({ label, value, icon, color }: {
  label: string; value: number; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <div className="text-[11px] font-semibold text-muted uppercase tracking-[0.5px]">{label}</div>
        <div className="text-[26px] font-bold text-ink leading-tight">{value.toLocaleString()}</div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chart, setChart] = useState<ChartPoint[]>([])

  const load = useCallback(() => {
    http.get<{ success: boolean; data: Stats }>('/api/admin/stats')
      .then(r => { if (r.success) setStats(r.data) })
    http.get<{ success: boolean; data: ChartPoint[] }>('/api/admin/visitors/chart?days=30')
      .then(r => { if (r.success) setChart(r.data) })
  }, [])

  useEffect(() => { load() }, [load])
  useAdminRealtime(load, 20_000)

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-[26px] font-bold text-ink mb-1">Dashboard Admin</h1>
        <p className="text-sm text-muted mb-7">Ringkasan statistik platform HabitTracker</p>

        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total Pengguna"   value={stats.total_users}     icon={<Users    size={20} color="#16a34a" />} color="bg-primary-light" />
            <StatCard label="Total Habit"      value={stats.total_habits}    icon={<Repeat2  size={20} color="#0ea5e9" />} color="bg-[#eff6ff]" />
            <StatCard label="Total Postingan"  value={stats.total_posts}     icon={<FileText size={20} color="#f97316" />} color="bg-[#fff7ed]" />
            <StatCard label="Total Pengunjung" value={stats.total_visitors}  icon={<Eye      size={20} color="#8b5cf6" />} color="bg-[#f5f3ff]" />
            <StatCard label="Laporan Pending"  value={stats.pending_reports} icon={<Flag     size={20} color="#ef4444" />} color="bg-error-bg" />
          </div>
        )}

        <div className="bg-white border border-border rounded-xl p-6 shadow-card">
          <h2 className="text-[15px] font-bold text-ink mb-4">Pengunjung 30 Hari Terakhir</h2>
          <SimpleLineChart data={chart} height={240} />
        </div>
      </div>
    </AdminLayout>
  )
}
