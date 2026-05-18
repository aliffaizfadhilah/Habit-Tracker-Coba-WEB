import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { postService, type Post, type PostComment } from '../../BusinessLogic/services/PostService'
import { useFeedRealtime } from '../../BusinessLogic/hooks/useFeedRealtime'
import NewPostModal from '../components/NewPostModal'
import {
  Menu, Heart, MessageCircle, Trash2, BarChart2, Inbox,
  ChevronLeft, Send, ImageOff, Check, X, Plus, Search, ArrowUp,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function Avatar({ name, size = 36 }: { name: string | null; size?: number }) {
  const initials = (name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0 font-heading"
      style={{ width: size, height: size, fontSize: size * 0.38, background: 'linear-gradient(135deg,#16a34a,#10b981)' }}
    >{initials}</div>
  )
}

// ─── Pinterest Detail Modal ───────────────────────────────────────────────────
function PinDetailModal({ post: initial, currentUsername, onClose, onDelete, onLikeChange }: {
  post: Post
  currentUsername: string
  onClose: () => void
  onDelete: (id: number) => void
  onLikeChange: (id: number, liked: boolean, count: number) => void
}) {
  const [liked,          setLiked]          = useState(initial.liked_by_me)
  const [likesCount,     setLikesCount]     = useState(initial.likes_count)
  const [liking,         setLiking]         = useState(false)
  const [imgError,       setImgError]       = useState(false)
  const [comments,       setComments]       = useState<PostComment[]>([])
  const [loadingComments,setLoadingComments]= useState(true)
  const [commentInput,   setCommentInput]   = useState('')
  const [sending,        setSending]        = useState(false)
  const [commentsCount,  setCommentsCount]  = useState(initial.comments_count)
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [deleting,       setDeleting]       = useState(false)

  useEffect(() => {
    postService.getComments(initial.id)
      .then(data => { setComments(data); setCommentsCount(data.length) })
      .finally(() => setLoadingComments(false))
  }, [initial.id])

  const toggleLike = async () => {
    if (liking) return
    setLiking(true)
    const res = await postService.toggleLike(initial.id)
    if (res.success) {
      setLiked(res.liked); setLikesCount(res.likes_count)
      onLikeChange(initial.id, res.liked, res.likes_count)
    }
    setLiking(false)
  }

  const sendComment = async () => {
    if (!commentInput.trim() || sending) return
    setSending(true)
    const res = await postService.addComment(initial.id, commentInput.trim())
    if (res.success && res.data) {
      setComments(prev => [...prev, res.data!])
      setCommentsCount(c => c + 1)
      setCommentInput('')
    }
    setSending(false)
  }

  const removeComment = async (commentId: number) => {
    const res = await postService.deleteComment(initial.id, commentId)
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setCommentsCount(c => Math.max(0, c - 1))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await postService.deletePost(initial.id)
    if (res.success) { onDelete(initial.id); onClose() }
    setDeleting(false)
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-3"
      style={{ background: 'rgba(0,0,0,0.78)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] overflow-hidden w-full flex flex-col"
        style={{ maxWidth: 460, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[#f0f0f0] shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center bg-[#f3f4f6]"
          ><ChevronLeft size={18} color="#333" /></button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleLike}
              disabled={liking}
              className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-[13px] font-semibold font-body px-2.5 py-1.5 rounded-full disabled:opacity-60 transition-colors"
              style={{ color: liked ? '#ef4444' : '#555', background: liked ? '#fef2f2' : '#f3f4f6' }}
            >
              <Heart size={16} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#555'} />
              {likesCount}
            </button>

            <span className="flex items-center gap-1.5 text-[13px] text-muted font-semibold font-body px-2.5 py-1.5 rounded-full bg-[#f3f4f6]">
              <MessageCircle size={16} /> {commentsCount}
            </span>

            {initial.is_mine && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center bg-[#fef2f2]"
              ><Trash2 size={15} color="#ef4444" /></button>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1">
          {/* Image */}
          {initial.frame_style !== 'rect' ? (
            <div className="w-full flex items-center justify-center py-6" style={{ background: '#f5f5f5' }}>
              <div style={{ width: '75%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                {!imgError && (
                  <img
                    src={initial.image_url}
                    alt={initial.title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover block"
                  />
                )}
                {imgError && (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff size={44} color="#16a34a" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            !imgError ? (
              <img
                src={initial.image_url}
                alt={initial.title}
                onError={() => setImgError(true)}
                className="w-full block"
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-3" style={{ height: 260, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                <ImageOff size={44} color="#16a34a" />
                <span className="text-sm text-muted">Gambar tidak tersedia</span>
              </div>
            )
          )}

          <div className="p-5 flex flex-col gap-4">
            {/* Title & caption */}
            <div>
              <h2 className="font-heading text-[20px] font-bold text-ink m-0 mb-1 leading-snug">{initial.title}</h2>
              {initial.caption && (
                <p className="text-[14px] text-muted leading-relaxed m-0">{initial.caption}</p>
              )}
            </div>

            {/* Habit badge */}
            {initial.habit_title && (
              <div className="flex items-center justify-between bg-[#f0fdf4] rounded-xl px-4 py-2.5">
                <span className="text-[13px] text-[#16a34a] font-semibold flex items-center gap-1.5">
                  <BarChart2 size={13} /> {initial.habit_title}
                </span>
                {initial.progress_percent != null && (
                  <span className="text-[14px] font-bold text-[#16a34a]">{Number(initial.progress_percent).toFixed(0)}%</span>
                )}
              </div>
            )}

            {/* User info */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#f5f5f5]">
              <Avatar name={initial.user.full_name} size={36} />
              <div>
                <div className="text-[13px] font-bold text-ink">{initial.user.full_name ?? initial.user.username}</div>
                <div className="text-[11px] text-muted">@{initial.user.username} · {timeAgo(initial.created_at)}</div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h4 className="text-[13px] font-bold text-ink m-0 mb-3">{commentsCount} Komentar</h4>
              {loadingComments && <div className="text-xs text-muted py-2">Memuat komentar...</div>}
              {!loadingComments && comments.length === 0 && (
                <div className="text-xs text-muted italic py-2">Belum ada komentar.</div>
              )}
              <div className="flex flex-col gap-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2.5 items-start">
                    <Avatar name={c.user.full_name} size={28} />
                    <div className="flex-1">
                      <div className="bg-[#f8f8f8] rounded-[12px] px-3 py-2">
                        <div className="text-[12px] font-bold text-ink mb-0.5">{c.user.full_name ?? c.user.username}</div>
                        <div className="text-[13px] text-ink leading-relaxed">{c.content}</div>
                      </div>
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className="text-[11px] text-muted">{timeAgo(c.created_at)}</span>
                        {c.user.username === currentUsername && (
                          <button onClick={() => removeComment(c.id)} className="bg-transparent border-none cursor-pointer text-[11px] text-[#ef4444] p-0 font-body">Hapus</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <div className="flex gap-2 items-center">
                <input
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() } }}
                  placeholder="Tulis komentar..."
                  maxLength={500}
                  className="flex-1 px-3.5 py-2 rounded-full border-[1.5px] border-[#e5e7eb] text-[13px] font-body outline-none text-ink bg-[#fafafa] focus:border-[#16a34a]"
                />
                <button
                  onClick={sendComment}
                  disabled={sending || !commentInput.trim()}
                  className="w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center disabled:opacity-40 transition-colors"
                  style={{ background: commentInput.trim() ? '#16a34a' : '#e5e7eb' }}
                >
                  <Send size={15} color="white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete confirm panel */}
        {confirmDelete && (
          <div className="px-4 py-3.5 border-t border-[#fecaca] bg-[#fef2f2] shrink-0">
            <p className="text-[13px] text-[#dc2626] font-semibold m-0 mb-3 text-center">
              Hapus postingan ini? Tidak dapat dikembalikan.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl border border-[#d1d5db] bg-white cursor-pointer text-[13px] font-body text-muted">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl border-none bg-[#ef4444] cursor-pointer text-[13px] font-bold font-body text-white disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pinterest Pin Card ───────────────────────────────────────────────────────
function PinCard({ post, onLikeChange, onClick }: {
  post: Post
  onLikeChange: (id: number, liked: boolean, count: number) => void
  onClick: (post: Post) => void
}) {
  const [liked,    setLiked]    = useState(post.liked_by_me)
  const [hovering, setHovering] = useState(false)
  const [liking,   setLiking]   = useState(false)
  const [imgError, setImgError] = useState(false)

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    setLiked(post.liked_by_me)
  }, [post.liked_by_me])

  const isCircular = post.frame_style !== 'rect'

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (liking) return
    setLiking(true)
    const res = await postService.toggleLike(post.id)
    if (res.success) {
      setLiked(res.liked)
      onLikeChange(post.id, res.liked, res.likes_count)
    }
    setLiking(false)
  }

  if (isCircular) {
    return (
      <div
        className="relative rounded-[16px] cursor-pointer bg-white"
        style={{ breakInside: 'avoid', marginBottom: 8, border: '1.5px solid #f0f0f0', overflow: 'hidden' }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => onClick(post)}
      >
        <div className="p-4 pb-2">
          <div className="relative" style={{ aspectRatio: '1/1' }}>
            {/* Circular image */}
            <div
              className="w-full h-full overflow-hidden"
              style={{ borderRadius: '50%', background: '#f3f4f6' }}
            >
              {!imgError ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                  <BarChart2 size={28} color="#16a34a" />
                </div>
              )}
            </div>

            {/* Hover overlay on circle */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{ borderRadius: '50%', background: 'rgba(0,0,0,0.10)', opacity: hovering ? 1 : 0 }}
            />

            {/* Like button */}
            <div
              className="absolute top-1 right-1 transition-all duration-200"
              style={{ opacity: hovering || liked ? 1 : 0, transform: hovering || liked ? 'scale(1)' : 'scale(0.8)' }}
            >
              <button
                onClick={toggleLike}
                disabled={liking}
                className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center shadow-md transition-transform active:scale-90 disabled:opacity-60"
                style={{ background: liked ? '#ef4444' : 'rgba(255,255,255,0.95)' }}
              >
                <Heart size={15} fill={liked ? 'white' : 'none'} color={liked ? 'white' : '#333'} strokeWidth={liked ? 0 : 2} />
              </button>
            </div>
          </div>
        </div>

        {/* Text below circle */}
        <div className="px-3 pb-3 text-center">
          <div className="text-[12px] font-bold text-ink leading-snug truncate">{post.title}</div>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: liked ? 60 : 0, opacity: liked ? 1 : 0 }}
          >
            {post.caption && (
              <div className="text-[11px] text-muted mt-1 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.caption}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Rect card — full-width image masonry style
  return (
    <div
      className="relative rounded-[16px] overflow-hidden cursor-pointer bg-[#efefef]"
      style={{ breakInside: 'avoid', marginBottom: 8 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => onClick(post)}
    >
      {!imgError ? (
        <img
          src={post.image_url}
          alt={post.title}
          onError={() => setImgError(true)}
          className="w-full block"
          style={{ display: 'block' }}
        />
      ) : (
        <div className="w-full flex flex-col items-center justify-center gap-2" style={{ height: 200, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
          <BarChart2 size={32} color="#16a34a" />
          <span className="text-xs text-muted">Habit Progress</span>
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-200"
        style={{ background: 'rgba(0,0,0,0.10)', opacity: hovering ? 1 : 0 }}
      />

      <div
        className="absolute top-2.5 right-2.5 transition-all duration-200"
        style={{ opacity: hovering || liked ? 1 : 0, transform: hovering || liked ? 'scale(1)' : 'scale(0.8)' }}
      >
        <button
          onClick={toggleLike}
          disabled={liking}
          className="w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center shadow-md transition-transform active:scale-90 disabled:opacity-60"
          style={{ background: liked ? '#ef4444' : 'rgba(255,255,255,0.95)' }}
        >
          <Heart size={17} fill={liked ? 'white' : 'none'} color={liked ? 'white' : '#333'} strokeWidth={liked ? 0 : 2} />
        </button>
      </div>

      {(post.title || post.caption) && (
        <div className="px-3 py-2.5 bg-white border-t border-[#f0f0f0]">
          {post.title && (
            <div className="text-[13px] font-bold text-ink leading-snug">{post.title}</div>
          )}
          {post.caption && (
            <div className="text-[12px] text-muted mt-0.5 leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.caption}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── PostinganPage ────────────────────────────────────────────────────────────
export default function PostinganPage() {
  const { user, logout }                          = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout,    setShowLogout]    = useState(false)
  const [posts,         setPosts]         = useState<Post[]>([])
  const [loading,       setLoading]       = useState(true)
  const [activePost,    setActivePost]    = useState<Post | null>(null)
  const [showNewPost,   setShowNewPost]   = useState(false)
  const [toast,         setToast]         = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [cursor,        setCursor]        = useState(0)
  const [rtReady,       setRtReady]       = useState(false)

  const { pendingPosts, transport, clearPending } = useFeedRealtime(cursor, rtReady)

  const displayUser = { full_name: user?.full_name ?? 'Pengguna', email: user?.email ?? '', username: user?.username ?? 'Pengguna' }

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, message: msg })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    postService.getPosts()
      .then(data => {
        setPosts(data)
        setCursor(data.length > 0 ? Math.max(...data.map(p => p.id)) : 0)
        setRtReady(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLikeChange = (id: number, liked: boolean, count: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked_by_me: liked, likes_count: count } : p))
  }

  const handleLoadNew = () => {
    const existingIds = new Set(posts.map(p => p.id))
    const fresh = pendingPosts.filter(p => !existingIds.has(p.id))
    if (fresh.length > 0) {
      setPosts(prev => [...fresh, ...prev])
      setCursor(Math.max(...fresh.map(p => p.id), cursor))
    }
    clearPending()
  }

  const transportLabel: Record<string, string> = { ws: 'WS', sse: 'SSE', polling: 'Polling' }

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    showToast('success', 'Postingan berhasil dihapus.')
  }

  const cols = isMobile ? 2 : 3
  const colWidth = `calc((100% - ${(cols - 1) * 8}px) / ${cols})`

  const q = searchQuery.trim().toLowerCase()
  const filteredPosts = q
    ? posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.caption?.toLowerCase().includes(q)) ||
        (p.habit_title?.toLowerCase().includes(q)) ||
        (p.user.full_name?.toLowerCase().includes(q)) ||
        p.user.username.toLowerCase().includes(q),
      )
    : posts

  // Split posts into columns for proper masonry
  const columns: Post[][] = Array.from({ length: cols }, () => [])
  filteredPosts.forEach((post, i) => columns[i % cols].push(post))

  return (
    <div className="flex min-h-screen bg-surface font-body">
      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="postingan"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 ${isMobile ? 'p-4' : 'p-6 px-8'}`}>
        {/* Header */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="w-9 h-9 border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
            ><Menu size={16} /></button>
            <div>
              <h1 className="font-heading text-xl font-extrabold text-ink m-0">Feed</h1>
              <p className="text-[12px] text-muted m-0 mt-0.5">Progres habit semua pengguna</p>
            </div>
          </div>
          {/* Search bar */}
          <div className="relative">
            <Search size={15} color="#9ca3af"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari postingan, habit, atau pengguna..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-white text-[13px] font-body outline-none text-ink focus:border-[#16a34a] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e5e7eb] border-none cursor-pointer flex items-center justify-center"
              >
                <X size={11} color="#6b7280" />
              </button>
            )}
          </div>
        </div>

        {/* New-posts banner */}
        {pendingPosts.length > 0 && (
          <button
            onClick={handleLoadNew}
            className="w-full mb-3 py-2.5 px-4 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 text-[13px] font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#16a34a,#10b981)' }}
          >
            <ArrowUp size={15} />
            {pendingPosts.length} postingan baru — Klik untuk lihat
          </button>
        )}

        {/* Transport indicator (dev helper) */}
        {transport !== 'idle' && (
          <div className="mb-2 flex justify-end">
            <span className="text-[10px] text-muted px-2 py-0.5 rounded-full bg-[#f3f4f6]">
              {transportLabel[transport] ?? transport}
            </span>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 border ${
              toast.type === 'error'
                ? 'bg-[#fee2e2] border-[#fca5a5] text-[#dc2626]'
                : 'bg-[#dcfce7] border-[#86efac] text-[#16a34a]'
            }`}
          >
            {toast.type === 'error' ? <X size={13} /> : <Check size={13} />}
            {toast.message}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex gap-2">
            {Array.from({ length: cols }).map((_, ci) => (
              <div key={ci} style={{ width: colWidth }}>
                {[320, 240, 280, 200].slice(0, ci === 0 ? 4 : 3).map((h, i) => (
                  <div key={i} className="rounded-[16px] bg-border animate-pulse mb-2" style={{ height: h }} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state — no posts at all */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-[60px] px-6">
            <div className="mb-4 flex justify-center"><Inbox size={56} color="#4b7a54" strokeWidth={1.5} /></div>
            <h3 className="font-heading text-xl font-bold text-ink m-0 mb-2">Belum ada postingan</h3>
            <p className="text-sm text-muted m-0 leading-relaxed">
              Jadilah yang pertama berbagi progres habit kamu!<br />
              Buka laporan habit → klik Share → Post ke Feed.
            </p>
          </div>
        )}

        {/* Empty state — no search results */}
        {!loading && posts.length > 0 && filteredPosts.length === 0 && (
          <div className="text-center py-[60px] px-6">
            <div className="mb-4 flex justify-center"><Search size={48} color="#9ca3af" strokeWidth={1.5} /></div>
            <h3 className="font-heading text-lg font-bold text-ink m-0 mb-2">Tidak ditemukan</h3>
            <p className="text-sm text-muted m-0">
              Tidak ada postingan yang cocok dengan "<strong>{searchQuery}</strong>"
            </p>
          </div>
        )}

        {/* Masonry grid */}
        {!loading && filteredPosts.length > 0 && (
          <div className="flex gap-2">
            {columns.map((col, ci) => (
              <div key={ci} style={{ width: colWidth }}>
                {col.map(post => (
                  <PinCard
                    key={post.id}
                    post={post}
                    onLikeChange={handleLikeChange}
                    onClick={setActivePost}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB — tombol posting bulat */}
      <button
        onClick={() => setShowNewPost(true)}
        className="fixed z-[400] border-none cursor-pointer flex items-center justify-center shadow-lg transition-transform active:scale-95 hover:scale-105"
        style={{
          bottom: 28, right: 28,
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#16a34a,#10b981)',
          boxShadow: '0 4px 18px rgba(22,163,74,0.45)',
        }}
        title="Buat Postingan"
      >
        <Plus size={26} color="white" strokeWidth={2.5} />
      </button>

      {/* New Post Modal */}
      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onPosted={() => {
            setShowNewPost(false)
            showToast('success', 'Postingan berhasil dibuat!')
            setLoading(true)
            postService.getPosts()
              .then(data => {
                setPosts(data)
                if (data.length > 0) setCursor(Math.max(...data.map(p => p.id)))
              })
              .catch(() => {})
              .finally(() => setLoading(false))
          }}
        />
      )}

      {/* Pinterest detail modal */}
      {activePost && (
        <PinDetailModal
          post={posts.find(p => p.id === activePost.id) ?? activePost}
          currentUsername={user?.username ?? ''}
          onClose={() => setActivePost(null)}
          onDelete={id => { handleDelete(id); setActivePost(null) }}
          onLikeChange={handleLikeChange}
        />
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
