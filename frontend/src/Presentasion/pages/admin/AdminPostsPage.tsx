import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { http } from '../../../BusinessLogic/services/HttpService'

interface AdminPost {
  id: number
  title: string | null
  caption: string | null
  user: { username: string; full_name: string | null }
  likes_count: number
  comments_count: number
  is_private: boolean
  created_at: string
}

export default function AdminPostsPage() {
  const [posts,    setPosts]    = useState<AdminPost[]>([])
  const [page,     setPage]     = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    http.get<any>(`/api/admin/posts?per_page=20&page=${page}`)
      .then(r => { if (r.success) { setPosts(r.data.data); setLastPage(r.data.last_page) } })
  }, [page])

  const deletePost = async (id: number) => {
    if (!confirm('Hapus postingan ini?')) return
    setDeleting(id)
    const r = await http.delete<any>(`/api/admin/posts/${id}`)
    if (r.success) setPosts(ps => ps.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-[26px] font-bold text-ink mb-1">Postingan</h1>
        <p className="text-sm text-muted mb-6">Moderasi semua postingan publik</p>

        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-card overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-surface">
                {['Pengguna', 'Caption', 'Like', 'Komentar', 'Visibilitas', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-muted uppercase tracking-[0.5px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{p.user?.full_name || p.user?.username}</div>
                    <div className="text-xs text-muted">@{p.user?.username}</div>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="line-clamp-2 text-muted">{p.caption || <span className="italic opacity-40">—</span>}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{p.likes_count}</td>
                  <td className="px-4 py-3 text-center">{p.comments_count}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ` +
                      (p.is_private ? 'bg-surface text-muted border border-border' : 'bg-primary-light text-primary')}>
                      {p.is_private ? 'Privat' : 'Publik'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deletePost(p.id)}
                      disabled={deleting === p.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#fecaca] bg-error-bg cursor-pointer transition-all hover:scale-105 disabled:opacity-40"
                    >
                      <Trash2 size={14} className="text-error" />
                    </button>
                  </td>
                </tr>
              ))}
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
