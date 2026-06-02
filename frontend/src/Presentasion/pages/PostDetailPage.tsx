import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { postService, type Post, type PostComment } from '../../BusinessLogic/services/PostService'
import { ArrowLeft, Heart, MessageCircle, Trash2, BarChart2, Send, ImageOff } from 'lucide-react'

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

function CommentRow({ c, currentUsername, onRemove }: {
  c: PostComment; currentUsername: string; onRemove: (id: number) => void
}) {
  return (
    <div className="flex gap-2.5 items-start">
      <Avatar name={c.user.full_name} size={28} />
      <div className="flex-1">
        <div className="bg-[#f8f8f8] rounded-[12px] px-3 py-2">
          <div className="text-[12px] font-bold text-ink mb-0.5">{c.user.full_name ?? c.user.username}</div>
          <div className="text-[13px] text-ink leading-relaxed">{c.content}</div>
        </div>
        <div className="flex items-center gap-2.5 mt-1">
          <span className="text-[11px] text-muted">{timeAgo(c.created_at)}</span>
          {c.user.username === currentUsername && (
            <button onClick={() => onRemove(c.id)} className="bg-transparent border-none cursor-pointer text-[11px] text-[#ef4444] p-0 font-body">Hapus</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PostDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const { user }    = useAuth()

  const [post,            setPost]            = useState<Post | null>(null)
  const [comments,        setComments]        = useState<PostComment[]>([])
  const [loading,         setLoading]         = useState(true)
  const [loadingComments, setLoadingComments] = useState(true)
  const [notFound,        setNotFound]        = useState(false)
  const [liked,           setLiked]           = useState(false)
  const [likesCount,      setLikesCount]      = useState(0)
  const [liking,          setLiking]          = useState(false)
  const [commentsCount,   setCommentsCount]   = useState(0)
  const [commentInput,    setCommentInput]    = useState('')
  const [sending,         setSending]         = useState(false)
  const [imgError,        setImgError]        = useState(false)
  const [confirmDelete,   setConfirmDelete]   = useState(false)
  const [deleting,        setDeleting]        = useState(false)

  useEffect(() => {
    if (!id) return
    postService.getById(Number(id))
      .then(data => {
        if (data) {
          setPost(data)
          setLiked(data.liked_by_me)
          setLikesCount(data.likes_count)
          setCommentsCount(data.comments_count)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    postService.getComments(Number(id))
      .then(data => { setComments(data); setCommentsCount(data.length) })
      .finally(() => setLoadingComments(false))
  }, [id])

  const toggleLike = async () => {
    if (liking || !id) return
    setLiking(true)
    const res = await postService.toggleLike(Number(id))
    if (res.success) { setLiked(res.liked); setLikesCount(res.likes_count) }
    setLiking(false)
  }

  const sendComment = async () => {
    if (!commentInput.trim() || sending || !id) return
    setSending(true)
    const res = await postService.addComment(Number(id), commentInput.trim())
    if (res.success && res.data) {
      setComments(prev => [...prev, res.data!])
      setCommentsCount(c => c + 1)
      setCommentInput('')
    }
    setSending(false)
  }

  const removeComment = async (commentId: number) => {
    if (!id) return
    const res = await postService.deleteComment(Number(id), commentId)
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      setCommentsCount(c => Math.max(0, c - 1))
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    const res = await postService.deletePost(Number(id))
    if (res.success) navigate(-1)
    setDeleting(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-muted text-[14px] font-body">Memuat postingan...</p>
    </div>
  )

  if (notFound || !post) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted text-[14px] font-body mb-4">Postingan tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="text-primary text-[13px] bg-transparent border-none cursor-pointer font-body">← Kembali</button>
      </div>
    </div>
  )

  const isCircular = post.frame_style !== 'rect'
  const currentUsername = user?.username ?? ''

  return (
    <div className="min-h-screen bg-surface font-body">
      <div className="max-w-[480px] mx-auto">

        {/* Top bar */}
        <div className="flex items-center gap-2 px-3.5 py-3 border-b border-border bg-white sticky top-0 z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center bg-[#f3f4f6]"
          ><ArrowLeft size={18} color="#333" /></button>

          <span className="flex-1 font-heading font-bold text-[15px] text-ink truncate">{post.title}</span>

          <div className="flex items-center gap-2">
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

            {post.is_mine && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center bg-[#fef2f2]"
              ><Trash2 size={15} color="#ef4444" /></button>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="bg-white">
          {isCircular ? (
            <div className="w-full flex items-center justify-center py-6" style={{ background: '#f5f5f5' }}>
              <div style={{ width: '75%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                {!imgError ? (
                  <img src={post.image_url} alt={post.title} onError={() => setImgError(true)} className="w-full h-full object-cover block" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageOff size={44} color="#16a34a" /></div>
                )}
              </div>
            </div>
          ) : (
            !imgError ? (
              <img src={post.image_url} alt={post.title} onError={() => setImgError(true)} className="w-full block" />
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-3" style={{ height: 260, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                <ImageOff size={44} color="#16a34a" />
                <span className="text-sm text-muted">Gambar tidak tersedia</span>
              </div>
            )
          )}
        </div>

        {/* Content */}
        <div className="bg-white px-5 pt-5 pb-4 flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-[20px] font-bold text-ink m-0 mb-1 leading-snug">{post.title}</h2>
            {post.caption && <p className="text-[14px] text-muted leading-relaxed m-0">{post.caption}</p>}
          </div>

          {post.habit_title && (
            <div className="flex items-center justify-between bg-[#f0fdf4] rounded-xl px-4 py-2.5">
              <span className="text-[13px] text-[#16a34a] font-semibold flex items-center gap-1.5">
                <BarChart2 size={13} /> {post.habit_title}
              </span>
              {post.progress_percent != null && (
                <span className="text-[14px] font-bold text-[#16a34a]">{Number(post.progress_percent).toFixed(0)}%</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pb-4 border-b border-[#f5f5f5]">
            <Avatar name={post.user.full_name} size={36} />
            <div>
              <div className="text-[13px] font-bold text-ink">{post.user.full_name ?? post.user.username}</div>
              <div className="text-[11px] text-muted">@{post.user.username} · {timeAgo(post.created_at)}</div>
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
                <CommentRow key={c.id} c={c} currentUsername={currentUsername} onRemove={removeComment} />
              ))}
            </div>

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
              ><Send size={15} color="white" /></button>
            </div>
          </div>
        </div>

        {/* Delete confirm */}
        {confirmDelete && (
          <div className="px-4 py-3.5 border-t border-[#fecaca] bg-[#fef2f2]">
            <p className="text-[13px] text-[#dc2626] font-semibold m-0 mb-3 text-center">Hapus postingan ini? Tidak dapat dikembalikan.</p>
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
