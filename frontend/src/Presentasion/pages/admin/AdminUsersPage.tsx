import { useEffect, useState } from 'react'
import { ShieldOff, ShieldCheck } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { http } from '../../../BusinessLogic/services/HttpService'

interface AdminUser {
  id: number
  username: string
  full_name: string | null
  email: string
  is_active: boolean
  habits_count: number
  ranking: number
  created_at: string
  roles: { role_name: string }[]
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<AdminUser[]>([])
  const [page,     setPage]     = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading,  setLoading]  = useState(false)

  const load = (p: number) => {
    setLoading(true)
    http.get<any>(`/api/admin/users?per_page=20&page=${p}`)
      .then(r => { if (r.success) { setUsers(r.data.data); setLastPage(r.data.last_page) } })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const toggleSuspend = async (id: number) => {
    const r = await http.patch<any>(`/api/admin/users/${id}/suspend`, {})
    if (r.success) setUsers(us => us.map(u => u.id === id ? { ...u, is_active: r.is_active } : u))
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-[26px] font-bold text-ink mb-1">Pengguna</h1>
        <p className="text-sm text-muted mb-6">Kelola semua akun pengguna</p>

        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                {['#', 'Pengguna', 'Email', 'Role', 'Habit', 'Status', 'Bergabung', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-muted uppercase tracking-[0.5px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted text-sm">Memuat...</td></tr>
              ) : users.map(u => {
                const isAdmin = u.roles.some(r => r.role_name === 'ADMIN')
                return (
                  <tr key={u.id} className="border-b border-border/60 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ` +
                        (u.ranking === 1 ? 'bg-yellow-100 text-yellow-700' :
                         u.ranking === 2 ? 'bg-slate-100 text-slate-600' :
                         u.ranking === 3 ? 'bg-orange-100 text-orange-600' :
                         'bg-surface text-muted')}>
                        {u.ranking}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">{u.full_name || u.username}</div>
                      <div className="text-xs text-muted">@{u.username}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ` +
                        (isAdmin ? 'bg-primary-light text-primary' : 'bg-surface text-muted border border-border')}>
                        {isAdmin ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{u.habits_count}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ` +
                        (u.is_active ? 'bg-success-bg text-success' : 'bg-error-bg text-error')}>
                        {u.is_active ? 'Aktif' : 'Suspend'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3">
                      {!isAdmin && (
                        <button
                          onClick={() => toggleSuspend(u.id)}
                          title={u.is_active ? 'Suspend' : 'Aktifkan'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-all hover:scale-105 ` +
                            (u.is_active ? 'border-[#fecaca] bg-error-bg' : 'border-border bg-success-bg')}
                        >
                          {u.is_active
                            ? <ShieldOff  size={14} className="text-error" />
                            : <ShieldCheck size={14} className="text-success" />
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted">Halaman {page} dari {lastPage}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 cursor-pointer hover:bg-surface transition-all">
              Sebelumnya
            </button>
            <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 cursor-pointer hover:bg-surface transition-all">
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
