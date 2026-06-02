import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Alert, Card } from '../../BusinessLogic/factories/ComponentFactory'
import { PageHeader, ModalOverlay } from '../../BusinessLogic/factories/SectionFactory'
import { useProfile } from '../../BusinessLogic/hooks/useProfile'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { postService, type Post, type PostComment } from '../../BusinessLogic/services/PostService'
import {
  Menu, KeyRound, MailOpen, Key, Check, Link2, Lock,
  Camera, Heart, MessageCircle, BarChart2, Trash2, X, ImageOff,
} from 'lucide-react'

interface ChangePasswordModalProps {
  email: string; onClose: () => void; onSuccess: () => void
  requestOtp:     () => Promise<{ success: boolean; message: string }>
  verifyOtp:      (otp: string) => Promise<{ success: boolean; message: string }>
  changePassword: (payload: { otp: string; password: string; password_confirmation: string }) => Promise<{ success: boolean; message: string }>
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  email, onClose, onSuccess, requestOtp, verifyOtp, changePassword,
}) => {
  const [step, setStep]                   = useState<'current_password' | 'otp' | 'new_password'>('current_password')
  const [otp, setOtp]                     = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [otpCode, setOtpCode]             = useState('')

  const TITLES    = { current_password: 'Verifikasi Identitas', otp: 'Masukkan Kode OTP', new_password: 'Buat Password Baru' }
  const SUBTITLES = { current_password: 'Kode OTP akan dikirim ke emailmu untuk verifikasi.', otp: 'Masukkan 6 digit kode yang dikirim ke emailmu.', new_password: 'Buat password baru yang kuat minimal 8 karakter.' }

  const handleRequestOtp = async () => {
    setLoading(true); setError('')
    const result = await requestOtp()
    setLoading(false)
    if (result.success) setStep('otp'); else setError(result.message)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Masukkan 6 digit kode OTP.'); return }
    setLoading(true); setError('')
    const result = await verifyOtp(otp)
    setLoading(false)
    if (result.success) { setOtpCode(otp); setStep('new_password') } else setError(result.message)
  }

  const handleChangePassword = async () => {
    if (!password || password.length < 8) { setError('Password minimal 8 karakter.'); return }
    if (password !== confirmPassword) { setError('Konfirmasi password tidak cocok.'); return }
    setLoading(true); setError('')
    const result = await changePassword({ otp: otpCode, password, password_confirmation: confirmPassword })
    setLoading(false)
    if (result.success) onSuccess(); else setError(result.message)
  }

  const steps = ['current_password', 'otp', 'new_password'] as const
  const stepIndex = steps.indexOf(step)

  return (
    <div className="bg-white rounded-xl p-8 shadow-card w-full max-w-[440px]">
      <div className="mb-6 text-center">
        <div className="mb-2.5 flex justify-center text-primary">
          {step === 'current_password' ? <Lock size={36} /> : step === 'otp' ? <MailOpen size={36} /> : <Key size={36} />}
        </div>
        <h3 className="font-heading text-xl font-bold text-ink mb-1.5">{TITLES[step]}</h3>
        <p className="text-[13px] text-muted leading-relaxed">{SUBTITLES[step]}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: step === s ? 24 : 8,
              background: step === s ? '#16a34a' : stepIndex > i ? '#a7f3d0' : '#d1fae5',
            }}
          />
        ))}
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {step === 'current_password' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted text-center">Kode OTP akan dikirim ke <strong className="text-ink">{email}</strong></p>
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleRequestOtp} loading={loading} style={{ flex: 2 }}>Kirim Kode OTP</Button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="flex flex-col gap-4">
          <Input
            label="Kode OTP (6 digit)"
            placeholder="000000"
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setError('') }}
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 700 }}
          />
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleVerifyOtp} loading={loading} style={{ flex: 2 }}>Verifikasi OTP</Button>
          </div>
          <button
            onClick={handleRequestOtp}
            disabled={loading}
            className="bg-transparent border-none cursor-pointer text-primary text-[13px] text-center disabled:opacity-50"
          >Kirim ulang OTP</button>
        </div>
      )}

      {step === 'new_password' && (
        <div className="flex flex-col gap-4">
          <Input label="Password Baru" type="password" placeholder="Minimal 8 karakter" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
          <Input label="Konfirmasi Password Baru" type="password" placeholder="Ulangi password baru" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} />
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleChangePassword} loading={loading} style={{ flex: 2 }}>Simpan Password</Button>
          </div>
        </div>
      )}
    </div>
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

function userInitials(u: { full_name: string | null; username: string }): string {
  const name = u.full_name || u.username || 'U'
  const words = name.trim().split(' ').filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name[0]?.toUpperCase() ?? 'U'
}

function CommentItem({ c, currentUsername, onDelete }: {
  c: PostComment
  currentUsername: string | null
  onDelete: (id: number) => void
}) {
  return (
    <div className="flex gap-2.5 py-2.5">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold font-heading text-[11px] shrink-0 mt-0.5"
        style={{ background: 'linear-gradient(135deg,#16a34a,#6b8fff)' }}
      >
        {userInitials(c.user)}
      </div>
      <div className="flex-1 bg-[#f9fafb] rounded-xl px-3 py-2 border border-[#f0f0f0]">
        <div className="text-[12px] font-bold text-ink">{c.user.full_name || c.user.username}</div>
        <div className="text-[13px] text-ink mt-0.5">{c.content}</div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[11px] text-muted">{timeAgo(c.created_at)}</span>
          {currentUsername && currentUsername === c.user.username && (
            <button
              onClick={() => onDelete(c.id)}
              className="text-[11px] font-semibold text-[#ef4444] bg-transparent border-none cursor-pointer p-0"
            >Hapus</button>
          )}
        </div>
      </div>
    </div>
  )
}

function PostLightbox({ post, onClose, onDelete, currentUsername }: {
  post: Post; onClose: () => void; onDelete: (id: number) => void; currentUsername: string | null
}) {
  const [imgError,        setImgError]        = useState(false)
  const [liked,           setLiked]           = useState(post.liked_by_me)
  const [likesCount,      setLikesCount]      = useState(post.likes_count)
  const [liking,          setLiking]          = useState(false)
  const [confirmDelete,   setConfirmDelete]   = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [comments,        setComments]        = useState<PostComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText,     setCommentText]     = useState('')
  const [sendingComment,  setSendingComment]  = useState(false)
  const [commentsCount,   setCommentsCount]   = useState(post.comments_count)
  const commentInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    postService.getComments(post.id)
      .then(setComments)
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [post.id])

  const toggleLike = async () => {
    if (liking) return
    setLiking(true)
    const res = await postService.toggleLike(post.id)
    if (res.success) { setLiked(res.liked); setLikesCount(res.likes_count) }
    setLiking(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await postService.deletePost(post.id)
    if (res.success) { onDelete(post.id); onClose() }
    setDeleting(false)
  }

  const sendComment = async () => {
    const text = commentText.trim()
    if (!text || sendingComment) return
    setSendingComment(true)
    const res = await postService.addComment(post.id, text)
    if (res.success && res.data) {
      setComments(prev => [...prev, res.data!])
      setCommentsCount(c => c + 1)
      setCommentText('')
    }
    setSendingComment(false)
  }

  const deleteComment = async (commentId: number) => {
    await postService.deleteComment(post.id, commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
    setCommentsCount(c => Math.max(0, c - 1))
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden w-full shadow-2xl flex flex-col"
        style={{ maxWidth: 480, maxHeight: '92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gambar */}
        <div className="relative shrink-0" style={{ overflow: 'hidden', background: '#111' }}>
          {post.frame_style !== 'rect' ? (
            <div className="w-full flex items-center justify-center py-6" style={{ background: '#f5f5f5' }}>
              <div style={{ width: '72%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                {!imgError ? (
                  <img src={post.image_url} alt={post.title} onError={() => setImgError(true)} className="w-full h-full object-cover block" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageOff size={44} color="#16a34a" /></div>
                )}
              </div>
            </div>
          ) : (
            !imgError ? (
              <img
                src={post.image_url}
                alt={post.title}
                onError={() => setImgError(true)}
                className="w-full block"
                style={{ maxHeight: '55vh', objectFit: 'contain' }}
              />
            ) : (
              <div className="w-full flex flex-col items-center justify-center gap-3" style={{ height: 220, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                <ImageOff size={44} color="#16a34a" />
                <span className="text-sm text-muted">Gambar tidak tersedia</span>
              </div>
            )
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center text-white"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          ><X size={16} /></button>
        </div>

        {/* Konten scrollable */}
        <div className="flex flex-col gap-0 overflow-y-auto">

          {/* ── Info Postingan ── */}
          <div className="px-5 pt-4 pb-3 flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-heading font-bold text-ink text-[17px] leading-tight">{post.title}</div>
                {post.is_private && (
                  <span className="mt-1 text-[10px] font-semibold px-1.5 py-[1px] rounded-full bg-[#f3f4f6] text-[#6b7280] inline-flex items-center gap-0.5">
                    <Lock size={9} /> Privat
                  </span>
                )}
              </div>
              {post.is_mine && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="bg-transparent border-none cursor-pointer text-[#ef4444] text-[12px] font-body inline-flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg hover:bg-[#fee2e2]"
                ><Trash2 size={13} /> Hapus</button>
              )}
            </div>

            {post.caption && (
              <p className="text-[13px] text-muted leading-relaxed m-0">{post.caption}</p>
            )}

            {post.habit_title && (
              <div className="flex items-center justify-between bg-[#f0fdf4] rounded-lg px-3 py-2">
                <span className="text-[13px] text-[#16a34a] font-semibold flex items-center gap-1.5">
                  <BarChart2 size={13} className="shrink-0" /> {post.habit_title}
                </span>
                {post.progress_percent != null && (
                  <span className="text-[13px] font-bold text-[#16a34a]">{Number(post.progress_percent).toFixed(0)}%</span>
                )}
              </div>
            )}
          </div>

          {/* ── Info Pengguna ── */}
          <div className="px-5 py-3 flex items-center gap-3 border-t border-[#f0f0f0]">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold font-heading text-[13px] shrink-0"
              style={{ background: 'linear-gradient(135deg,#16a34a,#6b8fff)' }}
            >
              {userInitials(post.user)}
            </div>
            <div>
              <div className="text-[14px] font-bold text-ink leading-tight">{post.user.full_name || post.user.username}</div>
              <div className="text-[12px] text-muted">@{post.user.username} · {timeAgo(post.created_at)}</div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <button
                onClick={toggleLike}
                disabled={liking}
                className="bg-transparent border-none cursor-pointer flex items-center gap-1 text-[13px] font-semibold font-body p-0 transition-colors"
                style={{ color: liked ? '#ef4444' : '#4b7a54' }}
              >
                <Heart size={15} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#4b7a54'} />
                {likesCount}
              </button>
              <span className="text-[13px] text-muted flex items-center gap-1">
                <MessageCircle size={15} /> {commentsCount}
              </span>
            </div>
          </div>

          {/* ── Konfirmasi Hapus ── */}
          {confirmDelete && (
            <div className="mx-5 mb-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4">
              <p className="text-[13px] text-[#dc2626] font-semibold m-0 mb-3 text-center">
                Hapus postingan ini? Tindakan tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-lg border border-[#d1d5db] bg-white cursor-pointer text-[13px] font-body text-muted"
                >Batal</button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg border-none bg-[#ef4444] cursor-pointer text-[13px] font-bold font-body text-white disabled:opacity-60"
                >{deleting ? 'Menghapus...' : 'Ya, Hapus'}</button>
              </div>
            </div>
          )}

          {/* ── Section Komentar ── */}
          <div className="border-t border-[#f0f0f0]">
            <div className="px-5 pt-4 pb-2">
              <span className="font-heading font-bold text-ink text-[15px]">
                {commentsLoading ? 'Komentar' : `${comments.length} Komentar`}
              </span>
            </div>

            {commentsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin-fast" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-[13px] text-muted py-6 m-0">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            ) : (
              <div className="flex flex-col gap-0 px-5 pb-3">
                {comments.map(c => (
                  <CommentItem key={c.id} c={c} currentUsername={currentUsername} onDelete={deleteComment} />
                ))}
              </div>
            )}

            {/* Input komentar */}
            <div className="px-4 pb-4 pt-2 border-t border-[#f0f0f0] flex gap-2 items-center">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendComment() }}
                placeholder="Tulis komentar..."
                className="flex-1 rounded-full px-4 py-2 text-[13px] border border-border bg-surface outline-none focus:border-primary"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                onClick={sendComment}
                disabled={sendingComment || !commentText.trim()}
                className="w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center disabled:opacity-40"
                style={{ background: '#16a34a' }}
              >
                {sendingComment
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function WallGrid({ posts, onSelect }: { posts: Post[]; onSelect: (p: Post) => void }) {
  const [hoverId, setHoverId] = useState<number | null>(null)

  if (posts.length === 0) {
    return (
      <div className="text-center py-14 px-6 border-2 border-dashed border-[#bbf7d0] rounded-2xl bg-[#f0fdf4]">
        <div className="mb-3 flex justify-center"><Camera size={40} color="#16a34a" strokeWidth={1.5} /></div>
        <p className="text-[13px] text-muted m-0 leading-relaxed">
          Belum ada postingan di dinding kamu.<br />
          Share progres habitmu dari halaman Laporan!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
      {posts.map(post => {
        const isCircular = post.frame_style !== 'rect'
        const isHovered  = hoverId === post.id
        return (
          <div
            key={post.id}
            className="relative cursor-pointer overflow-hidden"
            style={{ aspectRatio: '1/1', background: isCircular ? '#f3f4f6' : undefined }}
            onMouseEnter={() => setHoverId(post.id)}
            onMouseLeave={() => setHoverId(null)}
            onClick={() => onSelect(post)}
          >
            {isCircular ? (
              <div className="w-full h-full flex items-center justify-center p-[10%]">
                <div
                  className="w-full overflow-hidden transition-transform duration-300"
                  style={{ aspectRatio: '1/1', borderRadius: '50%', transform: isHovered ? 'scale(1.07)' : 'scale(1)' }}
                >
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover block" />
                </div>
              </div>
            ) : (
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover block transition-transform duration-300"
                style={{ transform: isHovered ? 'scale(1.07)' : 'scale(1)' }}
              />
            )}

            {/* Hover overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-200"
              style={{ background: 'rgba(0,0,0,0.48)', opacity: isHovered ? 1 : 0 }}
            >
              <span className="text-white text-[13px] font-bold flex items-center gap-1 drop-shadow">
                <Heart size={14} fill="white" color="white" /> {post.likes_count}
              </span>
              <span className="text-white text-[13px] font-bold flex items-center gap-1 drop-shadow">
                <MessageCircle size={14} fill="white" color="white" /> {post.comments_count}
              </span>
            </div>

            {/* Lock badge */}
            {post.is_private && (
              <div
                className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.55)' }}
              >
                <Lock size={10} color="white" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { profile, loading, error, updateProfile, requestChangePasswordOtp, verifyChangePasswordOtp, changePassword } = useProfile()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const navigate = useNavigate()

  const [showLogoutConfirm,  setShowLogoutConfirm]  = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [fullName,           setFullName]           = useState('')
  const [username,           setUsername]           = useState('')
  const [email,              setEmail]              = useState('')
  const [profileErrors,      setProfileErrors]      = useState<Record<string, string>>({})
  const [saving,             setSaving]             = useState(false)
  const [toast,              setToast]              = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [myPosts,    setMyPosts]    = useState<Post[]>([])
  const [wallLoading, setWallLoading] = useState(true)

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setUsername(profile.username || ''); setEmail(profile.email || '') }
  }, [profile])

  useEffect(() => {
    postService.getMyPosts()
      .then(data => setMyPosts(data))
      .catch(() => {})
      .finally(() => setWallLoading(false))
  }, [])

  const totalLikes    = myPosts.reduce((a, p) => a + p.likes_count, 0)
  const totalComments = myPosts.reduce((a, p) => a + p.comments_count, 0)

  const displayUser = { full_name: user?.full_name ?? 'Pengguna', email: user?.email ?? '', username: user?.username ?? 'Pengguna' }
  const isGoogleUser = !!profile?.google_id

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message }); setTimeout(() => setToast(null), 3500)
  }

  const validateProfile = () => {
    const errors: Record<string, string> = {}
    if (!fullName.trim()) errors.full_name = 'Nama lengkap wajib diisi.'
    if (!username.trim()) errors.username  = 'Username wajib diisi.'
    if (!email.trim())    errors.email     = 'Email wajib diisi.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.'
    return errors
  }

  const handleSaveProfile = async () => {
    const errors = validateProfile()
    if (Object.keys(errors).length > 0) { setProfileErrors(errors); return }
    setSaving(true); setProfileErrors({})
    const result = await updateProfile({ full_name: fullName, username, email })
    setSaving(false)
    if (result.success) showToast('success', 'Profil berhasil diperbarui!')
    else showToast('error', result.message)
  }

  const handleDeletePost = (id: number) => {
    setMyPosts(prev => prev.filter(p => p.id !== id))
    showToast('success', 'Postingan berhasil dihapus.')
  }

  return (
    <div className="flex min-h-screen bg-surface font-body">
      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="profile"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 ${isMobile ? 'p-5 px-4' : 'p-8 px-10'}`}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
          ><Menu size={16} /></button>
          <PageHeader title="Profil Saya" subtitle="Kelola informasi akun dan keamanan kamu." />
        </div>

        {toast && <div className="mb-5"><Alert type={toast.type} message={toast.message} /></div>}
        {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-9 h-9 border-[3px] border-border border-t-primary rounded-full animate-spin-fast" />
          </div>
        )}

        {!loading && profile && (
          <>
            {/* ── Info Profil ── */}
            <div className="flex flex-col gap-6">

              {/* Avatar + Stats */}
              <Card>
                {/* Avatar Row */}
                <div className="flex items-center gap-5 flex-wrap mb-5">
                  <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-[#6b8fff] flex items-center justify-center text-[28px] text-white font-bold font-heading shrink-0">
                    {(profile.full_name || profile.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-heading text-xl font-bold text-ink">{profile.full_name || profile.username}</div>
                    <div className="text-[13px] text-muted mt-0.5">@{profile.username}</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {profile.is_verified && (
                        <span className="text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-[#ecfdf5] text-[#065f46] inline-flex items-center gap-1">
                          <Check size={10} strokeWidth={3} /> Terverifikasi
                        </span>
                      )}
                      {isGoogleUser && (
                        <span className="text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-[#eff6ff] text-[#1d4ed8] inline-flex items-center gap-1">
                          <Link2 size={10} /> Google
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                  {[
                    { icon: <Camera size={18} color="#16a34a" />,       label: 'Postingan',  value: wallLoading ? '–' : myPosts.length },
                    { icon: <Heart size={18} color="#ef4444" />,         label: 'Total Suka', value: wallLoading ? '–' : totalLikes },
                    { icon: <MessageCircle size={18} color="#16a34a" />, label: 'Komentar',   value: wallLoading ? '–' : totalComments },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col items-center gap-1 py-2">
                      {s.icon}
                      <span className="font-heading text-[20px] font-bold text-ink leading-none">{s.value}</span>
                      <span className="text-[11px] text-muted">{s.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Edit Profil */}
              <Card>
                <h3 className="font-heading text-[17px] font-bold text-ink mb-5">Informasi Akun</h3>
                <div className="flex flex-col gap-4">
                  <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={fullName} onChange={e => { setFullName(e.target.value); setProfileErrors(p => ({ ...p, full_name: '' })) }} error={profileErrors.full_name} />
                  <Input label="Username" placeholder="Masukkan username" value={username} onChange={e => { setUsername(e.target.value); setProfileErrors(p => ({ ...p, username: '' })) }} error={profileErrors.username} />
                  <Input label="Email" type="email" placeholder="Masukkan email" value={email} onChange={e => { setEmail(e.target.value); setProfileErrors(p => ({ ...p, email: '' })) }} error={profileErrors.email} />
                  <Button variant="primary" onClick={handleSaveProfile} loading={saving}>Simpan Perubahan</Button>
                </div>
              </Card>

              {/* Keamanan */}
              <Card>
                <h3 className="font-heading text-[17px] font-bold text-ink mb-2">Keamanan Akun</h3>
                <p className="text-[13px] text-muted mb-5 leading-relaxed">
                  {isGoogleUser ? 'Akun ini menggunakan Google login. Ganti password tidak tersedia.' : 'Ganti password secara berkala untuk menjaga keamanan akunmu. Kode OTP akan dikirim ke emailmu.'}
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setShowChangePassword(true)}
                  disabled={isGoogleUser}
                  style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                ><KeyRound size={14} /> Ganti Password</Button>
              </Card>
            </div>

            {/* ── Dinding Foto ── */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <Camera size={18} color="#16a34a" />
                <h3 className="font-heading text-[17px] font-bold text-ink m-0">Dinding Foto</h3>
                {!wallLoading && myPosts.length > 0 && (
                  <span className="ml-auto text-[12px] text-muted">{myPosts.length} postingan</span>
                )}
              </div>

              {wallLoading ? (
                <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-border animate-pulse" style={{ aspectRatio: '1/1' }} />
                  ))}
                </div>
              ) : (
                <WallGrid posts={myPosts} onSelect={p => navigate(`/postingan/${p.id}`)} />
              )}
            </div>
          </>
        )}
      </main>


      {showChangePassword && profile && (
        <ModalOverlay onClose={() => setShowChangePassword(false)}>
          <ChangePasswordModal
            email={profile.email}
            onClose={() => setShowChangePassword(false)}
            onSuccess={() => {
              setShowChangePassword(false)
              showToast('success', 'Password berhasil diganti! Silakan login kembali.')
              setTimeout(() => logout(), 1500)
            }}
            requestOtp={requestChangePasswordOtp}
            verifyOtp={verifyChangePasswordOtp}
            changePassword={changePassword}
          />
        </ModalOverlay>
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
