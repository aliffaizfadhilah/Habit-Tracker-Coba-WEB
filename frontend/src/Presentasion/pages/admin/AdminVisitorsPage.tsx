import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { http } from '../../../BusinessLogic/services/HttpService'

interface Visitor {
  id: number
  ip_address: string
  country: string | null
  city: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  page: string | null
  created_at: string
}

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [page,     setPage]     = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    setLoading(true)
    http.get<any>(`/api/admin/visitors?per_page=20&page=${page}`)
      .then(r => { if (r.success) { setVisitors(r.data.data); setLastPage(r.data.last_page) } })
      .finally(() => setLoading(false))
  }, [page])

  const exportCsv = () => window.open('/api/admin/visitors/export', '_blank')

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-ink mb-1">Pengunjung</h1>
            <p className="text-sm text-muted">Data pengunjung website</p>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-primary/90 transition-all"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                {['IP', 'Negara', 'Kota', 'Device', 'Browser', 'OS', 'Halaman', 'Waktu'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-muted uppercase tracking-[0.5px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted text-sm">Memuat...</td></tr>
              ) : visitors.map(v => (
                <tr key={v.id} className="border-b border-border/60 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{v.ip_address}</td>
                  <td className="px-4 py-3">{v.country ?? <span className="text-muted/50">-</span>}</td>
                  <td className="px-4 py-3">{v.city ?? <span className="text-muted/50">-</span>}</td>
                  <td className="px-4 py-3 capitalize">{v.device_type ?? '-'}</td>
                  <td className="px-4 py-3">{v.browser ?? '-'}</td>
                  <td className="px-4 py-3">{v.os ?? '-'}</td>
                  <td className="px-4 py-3 max-w-[140px] truncate text-muted">{v.page ?? '-'}</td>
                  <td className="px-4 py-3 text-muted text-xs">{new Date(v.created_at).toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted">Halaman {page} dari {lastPage}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 cursor-pointer hover:bg-surface transition-all">Sebelumnya</button>
            <button disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 cursor-pointer hover:bg-surface transition-all">Berikutnya</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
