import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../BusinessLogic/hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { postService, type Post, type PostComment } from '../../BusinessLogic/services/PostService'
import {
  Menu, X, Check, Camera, Heart, MessageCircle,
  ChevronUp, ChevronDown, Trash2, BarChart2, Inbox,
} from 'lucide-react'

function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 font-heading"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: 'linear-gradient(135deg,#16a34a,#10b981)',
      }}
    >{initials}</div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d} hari lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CommentSection({ postId, count, currentUsername }: {
  postId: number; count: number; currentUsername: string
}) {
  const [open,     setOpen]     = useState(false)
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading,  setLoading]  = useState(false)
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [total,    setTotal]    = useState(count)

  const load = async () => {
    setLoading(true)
    const data = await postService.getComments(postId)
    setComments(data); setTotal(data.length); setLoading(false)
  }

  const toggle = () => { if (!open) load(); setOpen(o => !o) }

  const send = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const res = await postService.addComment(postId, input.trim())
    if (res.success && res.data) { setComments(prev => [...prev, res.data!]); setTotal(t => t + 1); setInput('') }
    setSending(false)
  }

  const remove = async (commentId: number) => {
    const res = await postService.deleteComment(postId, commentId)
    if (res.success) { setComments(prev => prev.filter(c => c.id !== commentId)); setTotal(t => Math.max(0, t - 1)) }
  }

  return (
    <div>
      <button
        onClick={toggle}
        className="bg-transparent border-none cursor-pointer text-[13px] text-muted p-0 flex items-center gap-[5px] font-body"
      >
        <MessageCircle size={13} /> {total} komentar {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {open && (
        <div className="mt-3 border-t border-border pt-3">
          {loading && <div className="text-xs text-muted">Memuat komentar...</div>}
          {!loading && comments.length === 0 && (
            <div className="text-xs text-muted italic">Belum ada komentar.</div>
          )}
          <div className="flex flex-col gap-2.5 mb-3.5">
            {comments.map(c => (
              <div key={c.id} className="flex gap-2.5 items-start">
                <Avatar name={c.user.full_name} size={28} />
                <div className="flex-1">
                  <div className="bg-surface rounded-[10px] px-3 py-2 border border-border">
                    <div className="text-xs font-bold text-ink mb-0.5">{c.user.full_name ?? c.user.username}</div>
                    <div className="text-[13px] text-ink leading-relaxed">{c.content}</div>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="text-[11px] text-muted">{timeAgo(c.created_at)}</span>
                    {c.user.username === currentUsername && (
                      <button onClick={() => remove(c.id)} className="bg-transparent border-none cursor-pointer text-[11px] text-[#ef4444] p-0 font-body">Hapus</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Tulis komentar..."
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-full border-[1.5px] border-border text-[13px] font-body outline-none text-ink bg-surface"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="px-3.5 py-2 rounded-full border-none text-white text-[13px] font-semibold font-body cursor-pointer"
              style={{ background: input.trim() ? '#16a34a' : '#d1fae5' }}
            >
              {sending ? '...' : 'Kirim'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PostCard({ post, currentUsername, onDelete }: {
  post: Post; currentUsername: string; onDelete: (id: number) => void
}) {
  const [liked,      setLiked]      = useState(post.liked_by_me)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [liking,     setLiking]     = useState(false)
  const [imgError,   setImgError]   = useState(false)

  const toggleLike = async () => {
    if (liking) return
    setLiking(true)
    const res = await postService.toggleLike(post.id)
    if (res.success) { setLiked(res.liked); setLikesCount(res.likes_count) }
    setLiking(false)
  }

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-card">
      {!imgError ? (
        <img
          src={post.image_url} alt={post.title}
          onError={() => setImgError(true)}
          className="w-full object-cover block"
          style={{ aspectRatio: '9/16' }}
        />
      ) : (
        <div
          className="w-full flex flex-col items-center justify-center gap-3"
          style={{ aspectRatio: '9/16', background: 'linear-gradient(135deg,#dcfce7,#dcfce7)' }}
        >
          <BarChart2 size={48} color="#16a34a" />
          <div className="text-sm text-muted">Gambar tidak tersedia</div>
        </div>
      )}

      <div className="px-[18px] py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name={post.user.full_name} size={36} />
            <div>
              <div className="text-[13px] font-bold text-ink">{post.user.full_name ?? post.user.username}</div>
              <div className="text-[11px] text-muted">@{post.user.username} · {timeAgo(post.created_at)}</div>
            </div>
          </div>
          {post.is_mine && (
            <button
              onClick={() => onDelete(post.id)}
              className="bg-transparent border-none cursor-pointer text-[13px] text-[#ef4444] font-body px-2 py-1 inline-flex items-center gap-1"
            ><Trash2 size={13} /> Hapus</button>
          )}
        </div>

        <div>
          <div className="text-[15px] font-bold text-ink mb-1">{post.title}</div>
          {post.caption && <div className="text-[13px] text-muted leading-relaxed">{post.caption}</div>}
        </div>

        {post.habit_title && (
          <div className="flex items-center justify-between bg-primary-lighter rounded-md px-3 py-2">
            <span className="text-[13px] text-primary font-semibold flex items-center gap-1.5">
              <BarChart2 size={13} className="shrink-0" /> {post.habit_title}
            </span>
            {post.progress_percent != null && (
              <span className="text-[13px] font-bold text-primary">{Number(post.progress_percent).toFixed(0)}%</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLike}
            disabled={liking}
            className="bg-transparent border-none cursor-pointer flex items-center gap-1.5 text-[13px] font-semibold font-body p-0 transition-colors"
            style={{ color: liked ? '#ef4444' : '#4b7a54' }}
          >
            <Heart size={14} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#4b7a54'} /> {likesCount}
          </button>
        </div>

        <CommentSection postId={post.id} count={post.comments_count} currentUsername={currentUsername} />
      </div>
    </div>
  )
}

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[600] bg-black/50 flex items-center justify-center p-5">
      <div className="bg-white rounded-[16px] p-7 max-w-[360px] w-full text-center">
        <div className="mb-3 flex justify-center"><Trash2 size={40} color="#ef4444" /></div>
        <h3 className="m-0 mb-2 font-heading text-lg text-ink">Hapus Postingan?</h3>
        <p className="m-0 mb-5 text-[13px] text-muted">Postingan yang dihapus tidak dapat dikembalikan.</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-[10px] border border-border bg-white cursor-pointer text-sm font-body text-muted">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-[10px] border-none bg-[#ef4444] cursor-pointer text-sm font-bold font-body text-white">Hapus</button>
        </div>
      </div>
    </div>
  )
}

export default function PostinganPage() {
  const { user, logout }                          = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout,   setShowLogout]   = useState(false)
  const [posts,        setPosts]        = useState<Post[]>([])
  const [loading,      setLoading]      = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [toast,        setToast]        = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayUser = { full_name: user?.full_name ?? 'Pengguna', email: user?.email ?? '', username: user?.username ?? 'Pengguna' }

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, message: msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    postService.getPosts().then(data => setPosts(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await postService.deletePost(deleteTarget)
    if (res.success) { setPosts(prev => prev.filter(p => p.id !== deleteTarget)); showToast('success', 'Postingan berhasil dihapus.') }
    else showToast('error', 'Gagal menghapus postingan. Coba lagi.')
    setDeleteTarget(null); setDeleting(false)
  }

  return (
    <div className="flex min-h-screen bg-surface font-body">
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="postingan"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 ${isMobile ? 'p-5 px-4' : 'p-8 px-10'}`}>
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-7">
          <button
            onClick={() => setSidebarOpen((o: boolean) => !o)}
            className="w-9 h-9 border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
          ><Menu size={16} /></button>
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-ink m-0">Postingan</h1>
            <p className="text-[13px] text-muted m-0 mt-0.5">Feed publik — bagikan dan lihat progres habit semua pengguna</p>
          </div>
        </div>

        {toast && (
          <div className={`mb-5 px-[18px] py-3 rounded-[10px] text-[13px] font-semibold flex items-center gap-1.5 border ${toast.type === 'error' ? 'bg-[#fee2e2] border-error text-error' : 'bg-success-bg border-primary text-primary'}`}>
            {toast.type === 'error' ? <X size={13} /> : <Check size={13} />} {toast.message}
          </div>
        )}

        {/* Stats bar */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-7">
            {[
              { icon: <Camera size={20} color="#16a34a" />,       label: 'Total Post',      value: posts.length },
              { icon: <Heart size={20} color="#ef4444" />,         label: 'Total Likes',     value: posts.reduce((a, p) => a + p.likes_count, 0) },
              { icon: <MessageCircle size={20} color="#16a34a" />, label: 'Total Komentar',  value: posts.reduce((a, p) => a + p.comments_count, 0) },
            ].map(s => (
              <div key={s.label} className="bg-white border border-border rounded-lg px-4 py-3.5 shadow-card text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-xl font-bold font-heading text-ink">{s.value}</div>
                <div className="text-[11px] text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-5" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {[1,2,3].map(i => <div key={i} className="h-[500px] bg-border rounded-lg opacity-50" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-[60px] px-6">
            <div className="mb-4 flex justify-center"><Inbox size={56} color="#4b7a54" /></div>
            <h3 className="font-heading text-xl font-bold text-ink m-0 mb-2">Belum ada postingan</h3>
            <p className="text-sm text-muted m-0">
              Jadilah yang pertama berbagi progres habit kamu!<br />
              Buka laporan habit → klik Share → Post ke Feed.
            </p>
          </div>
        )}

        {/* Feed grid */}
        {!loading && posts.length > 0 && (
          <div className="grid gap-5" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))' }}>
            {posts.map((post, i) => (
              <div key={post.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                <PostCard post={post} currentUsername={user?.username ?? ''} onDelete={id => setDeleteTarget(id)} />
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteTarget && <DeleteConfirm onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {deleting && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center">
          <div className="text-sm text-muted">Menghapus...</div>
        </div>
      )}

      {showLogout && (
        <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={async () => { setShowLogout(false); await logout() }} />
      )}
    </div>
  )
}
