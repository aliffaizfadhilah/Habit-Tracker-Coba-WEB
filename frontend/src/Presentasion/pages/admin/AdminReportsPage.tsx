import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { http } from '../../../BusinessLogic/services/HttpService'

interface AdminReport {
  id: number
  type: 'bug' | 'post' | 'user'
  reason: string | null
  note: string | null
  page: string | null
  browser: string | null
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  user: { username: string; full_name: string | null } | null
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-[#fef9c3] text-[#92400e]',
  resolved:  'bg-success-bg text-success',
  dismissed: 'bg-surface text-muted border border-border',
}

const TYPE_LABEL: Record<string, string> = { bug: 'Bug', post: 'Postingan', user: 'Pengguna' }

export default function AdminReportsPage() {
  const [reports,     setReports]     = useState<AdminReport[]>([])
  const [filter,      setFilter]      = useState<string>('')
  const [typeFilter,  setTypeFilter]  = useState<string>('')
  const [page,        setPage]        = useState(1)
  const [lastPage,    setLastPage]    = useState(1)

  const load = () => {
    let url = `/api/admin/reports?per_page=20&page=${page}`
    if (filter)     url += `&status=${filter}`
    if (typeFilter) url += `&type=${typeFilter}`
    http.get<any>(url).then(r => {
      if (r.success) { setReports(r.data.data); setLastPage(r.data.last_page) }
    })
  }

  useEffect(() => { load() }, [page, filter, typeFilter])

  const resolve = async (id: number) => {
    const r = await http.patch<any>(`/api/admin/reports/${id}/resolve`, {})
    if (r.success) setReports(rs => rs.map(rep => rep.id === id ? { ...rep, status: 'resolved' } : rep))
  }

  const dismiss = async (id: number) => {
    const r = await http.patch<any>(`/api/admin/reports/${id}/dismiss`, {})
    if (r.success) setReports(rs => rs.map(rep => rep.id === id ? { ...rep, status: 'dismissed' } : rep))
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-[26px] font-bold text-ink mb-1">Laporan</h1>
        <p className="text-sm text-muted mb-6">Inbox laporan dari pengguna — bug & konten</p>

        <div className="flex gap-2 mb-5 flex-wrap">
          {[['', 'Semua'], ['pending', 'Pending'], ['resolved', 'Selesai'], ['dismissed', 'Diabaikan']].map(([v, l]) => (
            <button key={v} onClick={() => { setFilter(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all border ` +
                (filter === v ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border hover:text-ink')}>
              {l}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          {[['', 'Semua Tipe'], ['bug', 'Bug'], ['post', 'Postingan'], ['user', 'Pengguna']].map(([v, l]) => (
            <button key={v} onClick={() => { setTypeFilter(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all border ` +
                (typeFilter === v ? 'bg-ink text-white border-ink' : 'bg-white text-muted border-border hover:text-ink')}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {reports.length === 0 && (
            <div className="bg-white border border-border rounded-xl p-12 text-center text-muted text-sm shadow-card">
              Tidak ada laporan
            </div>
          )}
          {reports.map(rep => (
            <div key={rep.id} className="bg-white border border-border rounded-xl p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-muted`}>
                      {TYPE_LABEL[rep.type]}
                    </span>
                    {rep.reason && (
                      <span className="text-[11px] text-muted">{rep.reason}</span>
                    )}
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[rep.status]}`}>
                      {rep.status === 'pending' ? 'Pending' : rep.status === 'resolved' ? 'Selesai' : 'Diabaikan'}
                    </span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">{rep.note}</p>
                  <div className="flex gap-3 mt-2 text-xs text-muted flex-wrap">
                    {rep.user && <span>dari <strong>@{rep.user.username}</strong></span>}
                    {rep.page && <span>halaman: <code className="bg-surface px-1 rounded">{rep.page}</code></span>}
                    <span>{new Date(rep.created_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => resolve(rep.id)} title="Tandai selesai"
                      className="w-9 h-9 rounded-lg bg-success-bg border border-success/30 flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                      <CheckCircle size={16} className="text-success" />
                    </button>
                    <button onClick={() => dismiss(rep.id)} title="Abaikan"
                      className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
                      <XCircle size={16} className="text-muted" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-between mt-5">
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
        )}
      </div>
    </AdminLayout>
  )
}
