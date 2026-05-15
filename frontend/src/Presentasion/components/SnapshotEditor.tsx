import React, { useState, useRef, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { tokens } from '../../BusinessLogic/factories/tokens'
import {
  SnapshotBuilder,
  type DiagramType, type ElementId, type SnapshotElement,
} from '../../BusinessLogic/builders/SnapshotBuilder'
import type { ReportableHabit } from './HabitReportModal'
import PostFormModal from './PostFormModal'

interface Props {
  habit:    ReportableHabit
  onClose:  () => void
  onPosted: () => void
}

const PREVIEW_W = 300
const PREVIEW_H = 533   // 9:16

const ELEMENT_LABELS: Record<ElementId, string> = {
  title:    'Judul & Kategori',
  diagram:  'Diagram Progress',
  stats:    'Statistik',
  branding: 'Watermark',
}

// ─── SVG: Donut ───────────────────────────────────────────────────────────────
const DonutChart: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const r  = size * 0.34
  const cx = size / 2, cy = size / 2
  const C  = 2 * Math.PI * r
  const offset = C - (Math.min(progress, 100) / 100) * C
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(255,255,255,0.22)" strokeWidth={r * 0.32} />
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="white" strokeWidth={r * 0.32}
        strokeDasharray={`${C}`} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={size * 0.2} fontWeight="800"
        fontFamily="system-ui,sans-serif">
        {progress}%
      </text>
      <text x={cx} y={cy + size * 0.17} textAnchor="middle"
        fill="rgba(255,255,255,0.75)" fontSize={size * 0.1}
        fontFamily="system-ui,sans-serif">
        Progress
      </text>
    </svg>
  )
}

// ─── SVG: Arc ─────────────────────────────────────────────────────────────────
const ArcChart: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const cx = size / 2
  const cy = size * 0.72
  const r  = size * 0.37
  const sw = r * 0.24
  const p  = Math.min(progress, 100)
  const angle = Math.PI * (1 - p / 100)
  const endX  = cx + r * Math.cos(angle)
  const endY  = cy - r * Math.sin(angle)
  const la    = p > 50 ? 1 : 0
  return (
    <svg width={size} height={size * 0.78}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
        fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={sw} strokeLinecap="round" />
      {p > 0 && (
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${la} 0 ${endX} ${endY}`}
          fill="none" stroke="white" strokeWidth={sw} strokeLinecap="round" />
      )}
      <text x={cx} y={cy - r * 0.38} textAnchor="middle"
        fill="white" fontSize={r * 0.5} fontWeight="800"
        fontFamily="system-ui,sans-serif">
        {progress}%
      </text>
      <text x={cx} y={cy - r * 0.06} textAnchor="middle"
        fill="rgba(255,255,255,0.75)" fontSize={r * 0.24}
        fontFamily="system-ui,sans-serif">
        Progress
      </text>
    </svg>
  )
}

// ─── SnapshotEditor ───────────────────────────────────────────────────────────
export default function SnapshotEditor({ habit, onClose, onPosted }: Props) {
  const progress = Number(habit.progress_percent)

  // State
  const [elements,      setElements]      = useState<SnapshotElement[]>(
    () => new SnapshotBuilder().build().elements
  )
  const [bgImage,       setBgImage]       = useState<string | null>(null)
  const [diagramType,   setDiagramType]   = useState<DiagramType>('donut')
  const [selectedId,    setSelectedId]    = useState<ElementId | null>(null)
  const [exporting,     setExporting]     = useState(false)
  const [showPostForm,  setShowPostForm]  = useState(false)
  const [postBlob,      setPostBlob]      = useState<Blob | null>(null)
  const [postPreviewUrl, setPostPreviewUrl] = useState<string>('')

  // Drag state
  const draggingId  = useRef<ElementId | null>(null)
  const dragOffset  = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const previewRef  = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedEl = elements.find(e => e.id === selectedId) ?? null

  // ─── Drag handlers ────────────────────────────────────────────────────────
  const startDrag = useCallback((id: ElementId, clientX: number, clientY: number) => {
    const el   = elements.find(e => e.id === id)
    const rect = previewRef.current?.getBoundingClientRect()
    if (!el || !rect) return
    const elPxX = (el.x / 100) * rect.width  + rect.left
    const elPxY = (el.y / 100) * rect.height + rect.top
    dragOffset.current = { dx: elPxX - clientX, dy: elPxY - clientY }
    draggingId.current = id
    setSelectedId(id)
  }, [elements])

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingId.current || !previewRef.current) return
      const rect    = previewRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const x = ((clientX + dragOffset.current.dx - rect.left)  / rect.width)  * 100
      const y = ((clientY + dragOffset.current.dy - rect.top)   / rect.height) * 100
      setElements(prev => prev.map(el =>
        el.id === draggingId.current
          ? { ...el, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
          : el
      ))
    }
    const onUp = () => { draggingId.current = null }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('mouseup',   onUp)
    document.addEventListener('touchend',  onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('touchend',  onUp)
    }
  }, [])

  // ─── Font size ────────────────────────────────────────────────────────────
  const changeFontSize = (id: ElementId, delta: number) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, fontSize: Math.max(8, Math.min(48, el.fontSize + delta)) } : el
    ))
  }

  // ─── Background upload ────────────────────────────────────────────────────
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setBgImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  // ─── Capture canvas → Blob ────────────────────────────────────────────────
  const captureCanvas = async (): Promise<{ blob: Blob; url: string } | null> => {
    if (!previewRef.current) return null
    const canvas = await html2canvas(previewRef.current, {
      useCORS: true, scale: 2, logging: false,
      width: PREVIEW_W, height: PREVIEW_H,
    })
    const url = canvas.toDataURL('image/png')
    const blob = await (await fetch(url)).blob()
    return { blob, url }
  }

  // ─── Export (download / share) ────────────────────────────────────────────
  const handleExport = async () => {
    if (!previewRef.current) return
    setExporting(true)
    try {
      const captured = await captureCanvas()
      if (!captured) return
      const { blob, url } = captured

      if (navigator.canShare) {
        try {
          const file = new File([blob], 'habit-progress.png', { type: 'image/png' })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: `${habit.title} — Progress` })
            return
          }
        } catch { /* fallback to download */ }
      }

      const a    = document.createElement('a')
      a.href     = url
      a.download = `habit-${habit.title.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

  // ─── Capture for posting ──────────────────────────────────────────────────
  const handleOpenPostForm = async () => {
    setExporting(true)
    try {
      const captured = await captureCanvas()
      if (!captured) return
      setPostBlob(captured.blob)
      setPostPreviewUrl(captured.url)
      setShowPostForm(true)
    } finally {
      setExporting(false)
    }
  }

  // ─── Element content ──────────────────────────────────────────────────────
  const renderElementContent = (el: SnapshotElement) => {
    const fs = el.fontSize
    switch (el.id) {
      case 'title':
        return (
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{
              fontSize: fs, fontWeight: 800, color: 'white', lineHeight: 1.2,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: 'system-ui,sans-serif',
            }}>
              {habit.title}
            </div>
            <div style={{
              fontSize: fs * 0.55, color: 'rgba(255,255,255,0.8)', marginTop: 4,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'system-ui,sans-serif',
            }}>
              {habit.category}
            </div>
          </div>
        )

      case 'diagram':
        return diagramType === 'donut'
          ? <DonutChart progress={progress} size={fs * 8} />
          : <ArcChart   progress={progress} size={fs * 8} />

      case 'stats':
        return (
          <div style={{ display: 'flex', gap: fs * 1.1, pointerEvents: 'none' }}>
            {[
              { icon: '🔥', val: habit.current_streak,       label: 'Streak' },
              { icon: '✅', val: habit.total_completed_days,  label: 'Selesai' },
              { icon: '🏆', val: habit.longest_streak,        label: 'Longest' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: fs * 1.1, fontWeight: 800, color: 'white',
                  textShadow: '0 1px 6px rgba(0,0,0,0.5)', fontFamily: 'system-ui,sans-serif',
                }}>
                  {s.icon} {s.val}
                </div>
                <div style={{
                  fontSize: fs * 0.75, color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'system-ui,sans-serif',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )

      case 'branding':
        return (
          <div style={{
            fontSize: fs, color: 'rgba(255,255,255,0.65)',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            fontFamily: 'system-ui,sans-serif', pointerEvents: 'none',
          }}>
            🌿 HabitTracker
          </div>
        )
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: tokens.white, borderRadius: tokens.radiusXl,
          boxShadow: tokens.shadowLg, width: '100%', maxWidth: 720,
          maxHeight: '95vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: `1px solid ${tokens.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: tokens.white, zIndex: 1,
          borderRadius: `${tokens.radiusXl} ${tokens.radiusXl} 0 0`,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: tokens.text, fontFamily: tokens.fontHeading }}>
              📸 Buat Snapshot
            </div>
            <div style={{ fontSize: 12, color: tokens.textMuted, marginTop: 2 }}>
              Drag elemen untuk memindahkan • Klik untuk memilih & ubah ukuran
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: `1px solid ${tokens.border}`,
            background: tokens.bg, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 20, padding: 20,
          alignItems: 'flex-start', justifyContent: 'center',
        }}>

          {/* ── Preview ── */}
          <div style={{ flexShrink: 0 }}>
            <div
              ref={previewRef}
              onClick={() => setSelectedId(null)}
              style={{
                width: PREVIEW_W, height: PREVIEW_H,
                position: 'relative', overflow: 'hidden',
                borderRadius: 20,
                backgroundImage:    bgImage ? `url(${bgImage})` : undefined,
                backgroundColor:    bgImage ? undefined : '#0f2018',
                backgroundSize:     'cover',
                backgroundPosition: 'center',
                cursor: 'default',
                boxShadow: tokens.shadowLg,
                border: `2px solid ${tokens.border}`,
              }}
            >
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: bgImage
                  ? 'linear-gradient(180deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.62) 100%)'
                  : 'linear-gradient(145deg,rgba(43,89,255,0.55) 0%,rgba(16,185,129,0.35) 100%)',
              }} />

              {/* No background hint */}
              {!bgImage && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    Pilih foto latar dari panel kanan
                  </div>
                </div>
              )}

              {/* Draggable elements */}
              {elements.map(el => {
                const isSelected = selectedId === el.id
                return (
                  <div
                    key={el.id}
                    onMouseDown={e => { e.stopPropagation(); startDrag(el.id, e.clientX, e.clientY) }}
                    onTouchStart={e => { e.stopPropagation(); startDrag(el.id, e.touches[0].clientX, e.touches[0].clientY) }}
                    onClick={e => { e.stopPropagation(); setSelectedId(el.id) }}
                    style={{
                      position: 'absolute',
                      left:      `${el.x}%`,
                      top:       `${el.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex:    isSelected ? 3 : 2,
                      cursor:    'grab',
                      userSelect: 'none',
                      touchAction: 'none',
                      padding:   '6px 10px',
                      borderRadius: 8,
                      outline:   isSelected ? '2px dashed rgba(255,255,255,0.8)' : 'none',
                      outlineOffset: 4,
                      background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
                      backdropFilter: isSelected ? 'blur(2px)' : 'none',
                      transition: 'outline 0.15s, background 0.15s',
                    }}
                  >
                    {renderElementContent(el)}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Controls Panel ── */}
          <div style={{
            flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 16,
          }}>

            {/* Background */}
            <div style={{ background: tokens.bg, borderRadius: tokens.radius, border: `1px solid ${tokens.border}`, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tokens.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📷 Foto Latar
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '10px', borderRadius: tokens.radiusSm,
                  border: `1.5px dashed ${tokens.borderMid}`, background: tokens.white,
                  cursor: 'pointer', fontSize: 13, color: tokens.primary,
                  fontWeight: 600, fontFamily: tokens.fontBody,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                📁 {bgImage ? 'Ganti Foto' : 'Pilih dari Galeri'}
              </button>
              {bgImage && (
                <button
                  onClick={() => setBgImage(null)}
                  style={{
                    width: '100%', marginTop: 8, padding: '7px', borderRadius: tokens.radiusSm,
                    border: `1px solid ${tokens.border}`, background: 'transparent',
                    cursor: 'pointer', fontSize: 12, color: tokens.textMuted,
                    fontFamily: tokens.fontBody,
                  }}
                >
                  ✕ Hapus foto
                </button>
              )}
            </div>

            {/* Diagram type */}
            <div style={{ background: tokens.bg, borderRadius: tokens.radius, border: `1px solid ${tokens.border}`, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tokens.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📊 Tipe Diagram
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['donut', 'arc'] as DiagramType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setDiagramType(t)}
                    style={{
                      flex: 1, padding: '9px 8px', borderRadius: tokens.radiusSm,
                      border: `1.5px solid ${diagramType === t ? tokens.primary : tokens.border}`,
                      background: diagramType === t ? tokens.primaryLight : tokens.white,
                      color:      diagramType === t ? tokens.primary : tokens.textMuted,
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      fontFamily: tokens.fontBody, transition: 'all 0.15s',
                    }}
                  >
                    {t === 'donut' ? '⭕ Donut' : '🌙 Arc'}
                  </button>
                ))}
              </div>
            </div>

            {/* Element controls */}
            <div style={{ background: tokens.bg, borderRadius: tokens.radius, border: `1px solid ${tokens.border}`, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tokens.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🎯 Elemen Terpilih
              </div>
              {selectedEl ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, marginBottom: 12, fontFamily: tokens.fontBody }}>
                    {ELEMENT_LABELS[selectedEl.id]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: tokens.textMuted }}>Ukuran:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={() => changeFontSize(selectedEl.id, -2)}
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: `1px solid ${tokens.border}`,
                          background: tokens.white, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.text,
                        }}
                      >−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text, minWidth: 30, textAlign: 'center' }}>
                        {selectedEl.fontSize}
                      </span>
                      <button
                        onClick={() => changeFontSize(selectedEl.id, 2)}
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: `1px solid ${tokens.border}`,
                          background: tokens.white, cursor: 'pointer', fontSize: 14, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.text,
                        }}
                      >+</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: tokens.textMuted, marginTop: 8 }}>
                    💡 Drag elemen di preview untuk memindahkan posisinya.
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: tokens.textMuted, fontStyle: 'italic' }}>
                  Klik elemen di preview untuk memilihnya.
                </div>
              )}
            </div>

            {/* All elements quick-select */}
            <div style={{ background: tokens.bg, borderRadius: tokens.radius, border: `1px solid ${tokens.border}`, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tokens.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📋 Semua Elemen
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {elements.map(el => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    style={{
                      padding: '8px 10px', borderRadius: tokens.radiusSm,
                      border: `1.5px solid ${selectedId === el.id ? tokens.primary : tokens.border}`,
                      background: selectedId === el.id ? tokens.primaryLight : tokens.white,
                      cursor: 'pointer', textAlign: 'left', fontFamily: tokens.fontBody,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: selectedId === el.id ? tokens.primary : tokens.text }}>
                      {ELEMENT_LABELS[el.id]}
                    </span>
                    <span style={{ fontSize: 11, color: tokens.textMuted }}>
                      {el.fontSize}px • ({Math.round(el.x)}%, {Math.round(el.y)}%)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                width: '100%', padding: '13px', borderRadius: tokens.radius,
                border: 'none', cursor: exporting ? 'wait' : 'pointer',
                background: exporting ? tokens.primaryLight : `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})`,
                color: exporting ? tokens.primary : 'white',
                fontSize: 14, fontWeight: 700, fontFamily: tokens.fontBody,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: exporting ? 'none' : tokens.shadowMd,
                transition: 'all 0.2s',
              }}
            >
              {exporting ? '⏳ Membuat gambar...' : '📥 Download / Share'}
            </button>

            {/* Post ke Feed */}
            <button
              onClick={handleOpenPostForm}
              disabled={exporting}
              style={{
                width: '100%', padding: '13px', borderRadius: tokens.radius,
                border: `2px solid ${tokens.primary}`,
                cursor: exporting ? 'wait' : 'pointer',
                background: tokens.white,
                color: tokens.primary,
                fontSize: 14, fontWeight: 700, fontFamily: tokens.fontBody,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              📤 Post ke Feed
            </button>

          </div>
        </div>
      </div>
    </div>

    {showPostForm && postBlob && (
      <PostFormModal
        imageBlob={postBlob}
        previewUrl={postPreviewUrl}
        habitId={habit.id_habit}
        habitTitle={habit.title}
        progressPercent={Number(habit.progress_percent)}
        onClose={() => setShowPostForm(false)}
        onPosted={onPosted}
      />
    )}
    </>
  )
}
