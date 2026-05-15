import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokens } from '../../BusinessLogic/factories/tokens'
import { PostBuilder } from '../../BusinessLogic/builders/PostBuilder'
import { postService } from '../../BusinessLogic/services/PostService'

interface Props {
  imageBlob:       Blob
  previewUrl:      string
  habitId?:        number
  habitTitle?:     string
  progressPercent?: number
  onClose:         () => void
  onPosted:        () => void
}

export default function PostFormModal({
  imageBlob, previewUrl, habitId, habitTitle, progressPercent, onClose, onPosted,
}: Props) {
  const navigate = useNavigate()
  const [title,     setTitle]     = useState('')
  const [caption,   setCaption]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

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
      if (res.success) {
        onPosted()
        navigate('/postingan')
      } else {
        setError(res.message ?? 'Gagal membuat postingan.')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: tokens.white, borderRadius: 20, padding: 28,
        width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 800, color: tokens.text }}>
            Buat Postingan
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: tokens.textMuted }}>✕</button>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={previewUrl}
            alt="Snapshot preview"
            style={{ width: 120, height: 213, objectFit: 'cover', borderRadius: 12, border: `1px solid ${tokens.border}` }}
          />
        </div>

        {/* Habit info (auto) */}
        {habitTitle && (
          <div style={{
            background: tokens.primaryLighter, borderRadius: 10,
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 14, color: tokens.primary, fontWeight: 600 }}>📊 {habitTitle}</span>
            {progressPercent != null && (
              <span style={{ fontSize: 13, color: tokens.textMuted, marginLeft: 'auto' }}>{progressPercent}%</span>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: tokens.text, display: 'block', marginBottom: 6 }}>
            Judul <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); setError('') }}
            placeholder="Contoh: 30 Hari Olahraga Berhasil!"
            maxLength={150}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 14px', borderRadius: 10,
              border: `1.5px solid ${error ? '#ef4444' : tokens.border}`,
              fontSize: 14, fontFamily: tokens.fontBody, outline: 'none',
              color: tokens.text, background: tokens.bg,
            }}
          />
          {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>{error}</p>}
        </div>

        {/* Caption */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: tokens.text, display: 'block', marginBottom: 6 }}>
            Caption <span style={{ fontSize: 12, color: tokens.textMuted, fontWeight: 400 }}>(opsional)</span>
          </label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Ceritakan perjalanan habitmu..."
            maxLength={1000}
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 14px', borderRadius: 10,
              border: `1.5px solid ${tokens.border}`,
              fontSize: 14, fontFamily: tokens.fontBody, outline: 'none',
              color: tokens.text, background: tokens.bg,
              resize: 'vertical', minHeight: 80,
            }}
          />
          <p style={{ margin: '2px 0 0', fontSize: 11, color: tokens.textMuted, textAlign: 'right' }}>{caption.length}/1000</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={onClose} disabled={loading} style={{
            flex: 1, padding: '11px 0', borderRadius: 10,
            border: `1.5px solid ${tokens.border}`, background: tokens.white,
            fontSize: 14, fontWeight: 600, color: tokens.textMuted,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: tokens.fontBody,
          }}>
            Batal
          </button>
          <button type="button" onClick={handlePost} disabled={loading} style={{
            flex: 2, padding: '11px 0', borderRadius: 10, border: 'none',
            background: loading ? tokens.border : `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
            fontSize: 14, fontWeight: 700, color: tokens.white,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: tokens.fontBody,
            transition: tokens.transitionFast,
          }}>
            {loading ? 'Memposting...' : '📤 Posting ke Feed'}
          </button>
        </div>
      </div>
    </div>
  )
}
