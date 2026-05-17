import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostBuilder } from '../../BusinessLogic/builders/PostBuilder'
import { postService } from '../../BusinessLogic/services/PostService'
import { X, BarChart2, Send } from 'lucide-react'

interface Props {
  imageBlob:        Blob
  previewUrl:       string
  habitId?:         number
  habitTitle?:      string
  progressPercent?: number
  onClose:          () => void
  onPosted:         () => void
}

export default function PostFormModal({
  imageBlob, previewUrl, habitId, habitTitle, progressPercent, onClose, onPosted,
}: Props) {
  const navigate = useNavigate()
  const [title,   setTitle]   = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handlePost = async () => {
    if (!title.trim()) { setError('Judul postingan wajib diisi.'); return }
    setLoading(true)
    setError('')
    try {
      const builder = new PostBuilder()
        .withTitle(title)
        .withCaption(caption)
        .withImage(imageBlob)
      if (habitId != null && habitTitle != null && progressPercent != null) {
        builder.withHabit(habitId, habitTitle, progressPercent)
      }
      const payload = builder.build()
      const res = await postService.createPost(payload)
      if (res.success) { onPosted(); navigate('/postingan') }
      else setError(res.message ?? 'Gagal membuat postingan.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.')
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-[700] bg-black/60 flex items-center justify-center p-5"
      onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-xl p-7 w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-heading text-xl font-extrabold text-ink">Buat Postingan</h2>
          <button type="button" onClick={onClose} className="bg-transparent border-none cursor-pointer text-muted flex">
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <img
            src={previewUrl}
            alt="Snapshot preview"
            className="w-[120px] h-[213px] object-cover rounded-md border border-border"
          />
        </div>

        {/* Habit info */}
        {habitTitle && (
          <div className="bg-primary-lighter rounded-[10px] px-3.5 py-2.5 flex items-center gap-2.5">
            <span className="text-sm text-primary font-semibold inline-flex items-center gap-1.5">
              <BarChart2 size={14} /> {habitTitle}
            </span>
            {progressPercent != null && (
              <span className="text-[13px] text-muted ml-auto">{progressPercent}%</span>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-[13px] font-semibold text-ink block mb-1.5">
            Judul <span className="text-[#ef4444]">*</span>
          </label>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); setError('') }}
            placeholder="Contoh: 30 Hari Olahraga Berhasil!"
            maxLength={150}
            className={`w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] ${error ? 'border-[#ef4444]' : 'border-border'} text-sm font-body outline-none text-ink bg-surface`}
          />
          {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
        </div>

        {/* Caption */}
        <div>
          <label className="text-[13px] font-semibold text-ink block mb-1.5">
            Caption <span className="text-xs text-muted font-normal">(opsional)</span>
          </label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Ceritakan perjalanan habitmu..."
            maxLength={1000}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border text-sm font-body outline-none text-ink bg-surface resize-y min-h-[80px]"
          />
          <p className="mt-0.5 text-[11px] text-muted text-right">{caption.length}/1000</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-[11px] rounded-[10px] border-[1.5px] border-border bg-white text-sm font-semibold text-muted cursor-pointer disabled:cursor-not-allowed font-body"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={loading}
            className="flex-[2] py-[11px] rounded-[10px] border-none text-sm font-bold text-white cursor-pointer disabled:cursor-not-allowed font-body flex items-center justify-center gap-1.5 transition-all"
            style={{ background: loading ? '#d1fae5' : 'linear-gradient(135deg,#16a34a,#10b981)' }}
          >
            {loading ? 'Memposting...' : <><Send size={14} />Posting ke Feed</>}
          </button>
        </div>
      </div>
    </div>
  )
}
