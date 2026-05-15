import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../BusinessLogic/hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { tokens } from '../../BusinessLogic/factories/tokens'
import { postService, type Post, type PostComment } from '../../BusinessLogic/services/PostService'

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size * 0.38, fontWeight: 700,
      flexShrink: 0, fontFamily: tokens.fontHeading,
    }}>
      {initials}
    </div>
  )
}

// ─── Time ago ─────────────────────────────────────────────────────────────────
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

// ─── Comment section ──────────────────────────────────────────────────────────
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
    setComments(data)
    setTotal(data.length)
    setLoading(false)
  }

  const toggle = () => {
    if (!open) load()
    setOpen(o => !o)
  }

  const send = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const res = await postService.addComment(postId, input.trim())
    if (res.success && res.data) {
      setComments(prev => [...prev, res.data!])
      setTotal(t => t + 1)
      setInput('')
    }
    setSending(false)
  }

  const remove = async (commentId: number) => {
    const res = await postService.deleteComment(postId, commentId)
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setTotal(t => Math.max(0, t - 1))
    }
  }

  return (
    <div>
      <button onClick={toggle} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 13, color: tokens.textMuted, padding: 0,
        display: 'flex', alignItems: 'center', gap: 5,
        fontFamily: tokens.fontBody,
      }}>
        💬 {total} komentar {open ? '▲' : '▼'}
      </button>

      {open && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${tokens.border}`, paddingTop: 12 }}>
          {loading && <div style={{ fontSize: 12, color: tokens.textMuted }}>Memuat komentar...</div>}
          {!loading && comments.length === 0 && (
            <div style={{ fontSize: 12, color: tokens.textMuted, fontStyle: 'italic' }}>Belum ada komentar.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Avatar name={c.user.full_name} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    background: tokens.bg, borderRadius: 10, padding: '8px 12px',
                    border: `1px solid ${tokens.border}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tokens.text, marginBottom: 2 }}>
                      {c.user.full_name ?? c.user.username}
                    </div>
                    <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.5 }}>{c.content}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: tokens.textMuted }}>{timeAgo(c.created_at)}</span>
                    {c.user.username === currentUsername && (
                      <button onClick={() => remove(c.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 11, color: '#ef4444', padding: 0, fontFamily: tokens.fontBody,
                      }}>Hapus</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Tulis komentar..."
              maxLength={500}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 20,
                border: `1.5px solid ${tokens.border}`, fontSize: 13,
                fontFamily: tokens.fontBody, outline: 'none', color: tokens.text,
                background: tokens.bg,
              }}
            />
            <button onClick={send} disabled={sending || !input.trim()} style={{
              padding: '8px 14px', borderRadius: 20, border: 'none',
              background: input.trim() ? tokens.primary : tokens.border,
              color: 'white', fontSize: 13, fontWeight: 600,
              cursor: input.trim() ? 'pointer' : 'default',
              fontFamily: tokens.fontBody,
            }}>
              {sending ? '...' : 'Kirim'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────────────────────
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
    <div style={{
      background: tokens.white, border: `1px solid ${tokens.border}`,
      borderRadius: tokens.radiusLg, overflow: 'hidden',
      boxShadow: tokens.shadow,
    }}>
      {/* Image */}
      {!imgError ? (
        <img
          src={post.image_url}
          alt={post.title}
          onError={() => setImgError(true)}
          style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', aspectRatio: '9/16',
          background: `linear-gradient(135deg, ${tokens.primaryLight}, ${tokens.successBg})`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12,
        }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <div style={{ fontSize: 14, color: tokens.textMuted }}>Gambar tidak tersedia</div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={post.user.full_name} size={36} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tokens.text }}>
                {post.user.full_name ?? post.user.username}
              </div>
              <div style={{ fontSize: 11, color: tokens.textMuted }}>
                @{post.user.username} · {timeAgo(post.created_at)}
              </div>
            </div>
          </div>
          {post.is_mine && (
            <button onClick={() => onDelete(post.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#ef4444', fontFamily: tokens.fontBody,
              padding: '4px 8px',
            }}>🗑 Hapus</button>
          )}
        </div>

        {/* Title & caption */}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: tokens.text, marginBottom: 4 }}>
            {post.title}
          </div>
          {post.caption && (
            <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.6 }}>
              {post.caption}
            </div>
          )}
        </div>

        {/* Habit info */}
        {post.habit_title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: tokens.primaryLighter, borderRadius: tokens.radius,
            padding: '8px 12px',
          }}>
            <span style={{ fontSize: 13, color: tokens.primary, fontWeight: 600 }}>
              📊 {post.habit_title}
            </span>
            {post.progress_percent != null && (
              <span style={{ fontSize: 13, fontWeight: 700, color: tokens.primary }}>
                {Number(post.progress_percent).toFixed(0)}%
              </span>
            )}
          </div>
        )}

        {/* Like row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={toggleLike} disabled={liking} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, fontFamily: tokens.fontBody,
            color: liked ? '#ef4444' : tokens.textMuted,
            padding: 0, transition: 'color 0.15s',
          }}>
            {liked ? '❤️' : '🤍'} {likesCount}
          </button>
        </div>

        {/* Comments */}
        <CommentSection
          postId={post.id}
          count={post.comments_count}
          currentUsername={currentUsername}
        />
      </div>
    </div>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: tokens.white, borderRadius: 16, padding: 28,
        maxWidth: 360, width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
        <h3 style={{ margin: '0 0 8px', fontFamily: tokens.fontHeading, fontSize: 18, color: tokens.text }}>
          Hapus Postingan?
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: tokens.textMuted }}>
          Postingan yang dihapus tidak dapat dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px', borderRadius: 10,
            border: `1px solid ${tokens.border}`, background: tokens.white,
            cursor: 'pointer', fontSize: 14, fontFamily: tokens.fontBody, color: tokens.textMuted,
          }}>Batal</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none',
            background: '#ef4444', cursor: 'pointer',
            fontSize: 14, fontWeight: 700, fontFamily: tokens.fontBody, color: 'white',
          }}>Hapus</button>
        </div>
      </div>
    </div>
  )
}

// ─── PostinganPage ────────────────────────────────────────────────────────────
export default function PostinganPage() {
  const { user, logout }                    = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout,   setShowLogout]   = useState(false)
  const [posts,        setPosts]        = useState<Post[]>([])
  const [loading,      setLoading]      = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [toast,        setToast]        = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displayUser = {
    full_name: user?.full_name ?? 'Pengguna',
    email:     user?.email     ?? '',
    username:  user?.username  ?? 'Pengguna',
  }

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, message: msg })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    postService.getPosts()
      .then(data => { setPosts(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await postService.deletePost(deleteTarget)
    if (res.success) {
      setPosts(prev => prev.filter(p => p.id !== deleteTarget))
      showToast('success', 'Postingan berhasil dihapus.')
    } else {
      showToast('error', 'Gagal menghapus postingan. Coba lagi.')
    }
    setDeleteTarget(null)
    setDeleting(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="postingan"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '32px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button onClick={() => setSidebarOpen((o: boolean) => !o)} style={{
            width: 36, height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8,
            background: tokens.white, cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>☰</button>
          <div>
            <h1 style={{ fontFamily: tokens.fontHeading, fontSize: 24, fontWeight: 800, color: tokens.text, margin: 0 }}>
              Postingan 📸
            </h1>
            <p style={{ fontSize: 13, color: tokens.textMuted, margin: '2px 0 0' }}>
              Feed publik — bagikan dan lihat progres habit semua pengguna
            </p>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            marginBottom: 20, padding: '12px 18px', borderRadius: 10,
            background: toast.type === 'error' ? '#fee2e2' : tokens.successBg,
            border: `1px solid ${toast.type === 'error' ? '#dc2626' : tokens.success}`,
            fontSize: 13, color: toast.type === 'error' ? '#dc2626' : tokens.success,
            fontWeight: 600,
          }}>
            {toast.type === 'error' ? '✕' : '✓'} {toast.message}
          </div>
        )}

        {/* Stats bar */}
        {!loading && posts.length > 0 && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 12, marginBottom: 28,
          }}>
            {[
              { icon: '📸', label: 'Total Post',   value: posts.length },
              { icon: '❤️',  label: 'Total Likes',  value: posts.reduce((a, p) => a + p.likes_count, 0) },
              { icon: '💬', label: 'Total Komentar', value: posts.reduce((a, p) => a + p.comments_count, 0) },
            ].map(s => (
              <div key={s.label} style={{
                background: tokens.white, border: `1px solid ${tokens.border}`,
                borderRadius: tokens.radiusLg, padding: '14px 16px',
                boxShadow: tokens.shadow, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: tokens.fontHeading, color: tokens.text }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: tokens.textMuted }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 500, background: tokens.border,
                borderRadius: tokens.radiusLg, opacity: 0.5,
              }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
            <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text, margin: '0 0 8px' }}>
              Belum ada postingan
            </h3>
            <p style={{ fontSize: 14, color: tokens.textMuted, margin: 0 }}>
              Jadilah yang pertama berbagi progres habit kamu!<br />
              Buka laporan habit → klik 📸 Share → Post ke Feed.
            </p>
          </div>
        )}

        {/* Feed grid */}
        {!loading && posts.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {posts.map((post, i) => (
              <div key={post.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                <PostCard
                  post={post}
                  currentUsername={user?.username ?? ''}
                  onDelete={id => setDeleteTarget(id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {deleteTarget && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, color: tokens.textMuted }}>Menghapus...</div>
        </div>
      )}

      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={async () => { setShowLogout(false); await logout() }}
        />
      )}
    </div>
  )
}
