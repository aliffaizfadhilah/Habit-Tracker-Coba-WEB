import React, { useState, useRef, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import {
  Camera, X, BarChart2, Circle, Moon, Target, Info, ClipboardList,
  Loader2, Download, Send, FolderOpen, ZoomIn, ZoomOut,
} from 'lucide-react'
import {
  SnapshotBuilder,
  type DiagramType, type ElementId, type SnapshotElement,
} from '../../BusinessLogic/builders/SnapshotBuilder'
import type { ReportableHabit } from './HabitReportModal'
import PostFormModal from './PostFormModal'
import CameraCapture from './CameraCapture'

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

function BgZoomControls({ bgZoom, onZoomChange, onReset, onRemove }: {
  bgZoom: number
  onZoomChange: (v: number) => void
  onReset: () => void
  onRemove: () => void
}) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button onClick={() => onZoomChange(bgZoom - 0.1)}
          className="w-7 h-7 rounded-full border border-border bg-white flex items-center justify-center cursor-pointer shrink-0">
          <ZoomOut size={13} color="#555" />
        </button>
        <input
          type="range" min={100} max={300} step={5}
          value={Math.round(bgZoom * 100)}
          onChange={e => onZoomChange(Number(e.target.value) / 100)}
          className="flex-1 accent-[#16a34a]"
        />
        <button onClick={() => onZoomChange(bgZoom + 0.1)}
          className="w-7 h-7 rounded-full border border-border bg-white flex items-center justify-center cursor-pointer shrink-0">
          <ZoomIn size={13} color="#555" />
        </button>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-muted">Zoom: {Math.round(bgZoom * 100)}%</span>
        <button onClick={onReset} className="text-[11px] text-primary cursor-pointer bg-transparent border-none font-body">Reset posisi</button>
      </div>
      <p className="text-[11px] text-muted">Drag preview untuk menggeser posisi foto</p>
      <button onClick={onRemove}
        className="w-full py-[7px] rounded-sm border border-border bg-transparent cursor-pointer text-xs text-muted font-body flex items-center justify-center gap-1">
        <X size={12} /> Hapus foto
      </button>
    </div>
  )
}

export default function SnapshotEditor({ habit, onClose, onPosted }: Props) {
  const progress = Number(habit.progress_percent)

  const [elements,       setElements]      = useState<SnapshotElement[]>(
    () => new SnapshotBuilder().build().elements
  )
  const [bgImage,        setBgImage]       = useState<string | null>(null)
  const [bgZoom,         setBgZoom]        = useState(1)
  const [bgPanX,         setBgPanX]        = useState(0)
  const [bgPanY,         setBgPanY]        = useState(0)
  const [diagramType,    setDiagramType]   = useState<DiagramType>('donut')
  const [selectedId,     setSelectedId]    = useState<ElementId | null>(null)
  const [exporting,      setExporting]     = useState(false)
  const [showPostForm,   setShowPostForm]  = useState(false)
  const [postBlob,       setPostBlob]      = useState<Blob | null>(null)
  const [postPreviewUrl, setPostPreviewUrl] = useState<string>('')
  const [showCamera,     setShowCamera]    = useState(false)

  const draggingId   = useRef<ElementId | null>(null)
  const dragOffset   = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const bgDragging   = useRef(false)
  const bgLastPos    = useRef({ x: 0, y: 0 })
  const previewRef   = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedEl = elements.find(e => e.id === selectedId) ?? null

  const clampPan = useCallback((zoom: number, px: number, py: number) => {
    return {
      x: Math.max(-(zoom - 1) * PREVIEW_W * 0.5, Math.min((zoom - 1) * PREVIEW_W * 0.5, px)),
      y: Math.max(-(zoom - 1) * PREVIEW_H * 0.5, Math.min((zoom - 1) * PREVIEW_H * 0.5, py)),
    }
  }, [])

  const applyZoom = (newZoom: number) => {
    const z = Math.max(1, Math.min(3, newZoom))
    const { x, y } = clampPan(z, bgPanX, bgPanY)
    setBgZoom(z); setBgPanX(x); setBgPanY(y)
  }

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
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      const rect    = previewRef.current?.getBoundingClientRect()
      if (!rect) return

      if (draggingId.current) {
        const x = ((clientX + dragOffset.current.dx - rect.left)  / rect.width)  * 100
        const y = ((clientY + dragOffset.current.dy - rect.top)   / rect.height) * 100
        setElements(prev => prev.map(el =>
          el.id === draggingId.current
            ? { ...el, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
            : el
        ))
      } else if (bgDragging.current && bgImage) {
        const dx = clientX - bgLastPos.current.x
        const dy = clientY - bgLastPos.current.y
        bgLastPos.current = { x: clientX, y: clientY }
        setBgPanX(px => {
          const maxPan = (bgZoom - 1) * PREVIEW_W * 0.5
          return Math.max(-maxPan, Math.min(maxPan, px + dx))
        })
        setBgPanY(py => {
          const maxPan = (bgZoom - 1) * PREVIEW_H * 0.5
          return Math.max(-maxPan, Math.min(maxPan, py + dy))
        })
      }
    }
    const onUp = () => {
      draggingId.current = null
      bgDragging.current = false
    }

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
  }, [bgImage, bgZoom])

  const changeFontSize = (id: ElementId, delta: number) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, fontSize: Math.max(8, Math.min(48, el.fontSize + delta)) } : el
    ))
  }

  const loadBgFromBlob = (blob: Blob) => {
    const reader = new FileReader()
    reader.onload = () => {
      setBgImage(reader.result as string)
      setBgZoom(1); setBgPanX(0); setBgPanY(0)
    }
    reader.readAsDataURL(blob)
  }

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    loadBgFromBlob(file)
    e.target.value = ''
  }

  const handleCameraCapture = (blob: Blob) => {
    loadBgFromBlob(blob)
    setShowCamera(false)
  }

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
            await navigator.share({ files: [file], title: `${habit.title} - Progress` })
            return
          }
        } catch { /* fallback */ }
      }

      const a    = document.createElement('a')
      a.href     = url
      a.download = `habit-${habit.title.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
    } finally {
      setExporting(false)
    }
  }

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

  const renderElementContent = (el: SnapshotElement) => {
    const fs = el.fontSize
    switch (el.id) {
      case 'title':
        return (
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: fs, fontWeight: 800, color: 'white', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: 'system-ui,sans-serif' }}>
              {habit.title}
            </div>
            <div style={{ fontSize: fs * 0.55, color: 'rgba(255,255,255,0.8)', marginTop: 4, textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'system-ui,sans-serif' }}>
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
          <div style={{ display: 'flex', gap: fs * 1.6, pointerEvents: 'none' }}>
            {[
              { icon: '🔥', val: habit.current_streak,      label: 'Streak' },
              { icon: '✓',  val: habit.total_completed_days, label: 'Selesai' },
              { icon: '🏆', val: habit.longest_streak,       label: 'Longest' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: fs * 1.5, lineHeight: 1.1 }}>{s.icon}</div>
                <div style={{ fontSize: fs * 1.1, fontWeight: 800, color: 'white', textShadow: '0 1px 6px rgba(0,0,0,0.5)', fontFamily: 'system-ui,sans-serif' }}>
                  {s.val}
                </div>
                <div style={{ fontSize: fs * 0.75, color: 'rgba(255,255,255,0.75)', fontFamily: 'system-ui,sans-serif' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )
      case 'branding':
        return (
          <div style={{ fontSize: fs, color: 'rgba(255,255,255,0.65)', textShadow: '0 1px 3px rgba(0,0,0,0.5)', fontFamily: 'system-ui,sans-serif', pointerEvents: 'none' }}>
            ✦ HabitTracker
          </div>
        )
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-[6px] flex items-center justify-center p-4"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-xl shadow-float w-full max-w-[720px] max-h-[95vh] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-[18px] border-b border-border flex justify-between items-center sticky top-0 bg-white z-[1] rounded-t-xl">
            <div>
              <div className="text-base font-bold text-ink font-heading flex items-center gap-1.5">
                <Camera size={16} /> Buat Snapshot
              </div>
              <div className="text-xs text-muted mt-0.5">
                Drag elemen untuk memindahkan • Klik untuk memilih & ubah ukuran
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-sm border border-border bg-surface cursor-pointer flex items-center justify-center">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-wrap gap-5 p-5 items-start justify-center">

            {/* Preview */}
            <div className="flex-shrink-0">
              <div
                ref={previewRef}
                onClick={() => setSelectedId(null)}
                onMouseDown={e => {
                  if (draggingId.current) return
                  bgDragging.current = true
                  bgLastPos.current  = { x: e.clientX, y: e.clientY }
                }}
                onTouchStart={e => {
                  if (draggingId.current) return
                  bgDragging.current = true
                  bgLastPos.current  = { x: e.touches[0].clientX, y: e.touches[0].clientY }
                }}
                className="relative overflow-hidden rounded-[20px] border-2 border-border shadow-float select-none touch-none"
                style={{
                  width: PREVIEW_W, height: PREVIEW_H,
                  backgroundColor: '#0f2018',
                  cursor: bgImage ? 'grab' : 'default',
                }}
              >
                {bgImage && (
                  <img
                    src={bgImage} alt=""
                    style={{
                      position: 'absolute',
                      objectFit: 'cover',
                      width:  `${bgZoom * 100}%`,
                      height: `${bgZoom * 100}%`,
                      left:  `calc(50% + ${bgPanX}px)`,
                      top:   `calc(50% + ${bgPanY}px)`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                    draggable={false}
                  />
                )}

                <div style={{
                  position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
                  background: bgImage
                    ? 'linear-gradient(180deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.62) 100%)'
                    : 'linear-gradient(145deg,rgba(43,89,255,0.55) 0%,rgba(16,185,129,0.35) 100%)',
                }} />

                {!bgImage && (
                  <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none">
                    <div className="text-xs text-white/40 text-center">Pilih foto latar dari panel kanan</div>
                  </div>
                )}

                {elements.map(el => {
                  const isSelected = selectedId === el.id
                  return (
                    <div
                      key={el.id}
                      onMouseDown={e => { e.stopPropagation(); startDrag(el.id, e.clientX, e.clientY) }}
                      onTouchStart={e => { e.stopPropagation(); startDrag(el.id, e.touches[0].clientX, e.touches[0].clientY) }}
                      onClick={e => { e.stopPropagation(); setSelectedId(el.id) }}
                      className="absolute cursor-grab select-none touch-none px-2.5 py-1.5 rounded-sm"
                      style={{
                        left: `${el.x}%`, top: `${el.y}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isSelected ? 3 : 2,
                        outline: isSelected ? '2px dashed rgba(255,255,255,0.8)' : 'none',
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

            {/* Controls Panel */}
            <div className="flex-1 min-w-[220px] flex flex-col gap-4">

              <div className="bg-surface rounded-md border border-border px-4 py-[14px]">
                <div className="text-xs font-bold text-muted mb-2.5 uppercase tracking-[0.05em] flex items-center gap-1.5">
                  <Camera size={12} /> Foto Latar
                </div>
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleBgUpload} className="hidden" />
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 rounded-sm border-[1.5px] border-dashed border-border-mid bg-white cursor-pointer text-[13px] text-primary font-semibold font-body flex items-center justify-center gap-1.5"
                  >
                    <FolderOpen size={14} /> {bgImage ? 'Galeri' : 'Pilih Galeri'}
                  </button>
                  <button
                    onClick={() => setShowCamera(true)}
                    className="flex-1 py-2.5 rounded-sm border-none text-white cursor-pointer text-[13px] font-semibold font-body flex items-center justify-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg,#16a34a,#10b981)' }}
                  >
                    <Camera size={14} /> Kamera
                  </button>
                </div>
                {bgImage && (
                  <BgZoomControls
                    bgZoom={bgZoom}
                    onZoomChange={applyZoom}
                    onReset={() => { setBgZoom(1); setBgPanX(0); setBgPanY(0) }}
                    onRemove={() => { setBgImage(null); setBgZoom(1); setBgPanX(0); setBgPanY(0) }}
                  />
                )}
              </div>

              <div className="bg-surface rounded-md border border-border px-4 py-[14px]">
                <div className="text-xs font-bold text-muted mb-2.5 uppercase tracking-[0.05em] flex items-center gap-1.5">
                  <BarChart2 size={12} /> Tipe Diagram
                </div>
                <div className="flex gap-2">
                  {(['donut', 'arc'] as DiagramType[]).map(t => (
                    <button key={t} onClick={() => setDiagramType(t)}
                      className={`flex-1 py-[9px] px-2 rounded-sm border-[1.5px] cursor-pointer text-[13px] font-semibold font-body transition-all duration-150 flex items-center justify-center gap-1 ${
                        diagramType === t ? 'border-primary bg-primary-light text-primary' : 'border-border bg-white text-muted'
                      }`}
                    >
                      {t === 'donut' ? <><Circle size={13} /> Donut</> : <><Moon size={13} /> Arc</>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface rounded-md border border-border px-4 py-[14px]">
                <div className="text-xs font-bold text-muted mb-2.5 uppercase tracking-[0.05em] flex items-center gap-1.5">
                  <Target size={12} /> Elemen Terpilih
                </div>
                {selectedEl ? (
                  <>
                    <div className="text-[13px] font-semibold text-ink mb-3 font-body">{ELEMENT_LABELS[selectedEl.id]}</div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-muted">Ukuran:</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => changeFontSize(selectedEl.id, -2)}
                          className="w-7 h-7 rounded-[6px] border border-border bg-white cursor-pointer text-sm font-bold flex items-center justify-center text-ink">−</button>
                        <span className="text-[13px] font-semibold text-ink min-w-[30px] text-center">{selectedEl.fontSize}</span>
                        <button onClick={() => changeFontSize(selectedEl.id, 2)}
                          className="w-7 h-7 rounded-[6px] border border-border bg-white cursor-pointer text-sm font-bold flex items-center justify-center text-ink">+</button>
                      </div>
                    </div>
                    <div className="text-[11px] text-muted mt-2 flex items-center gap-1">
                      <Info size={11} /> Drag elemen di preview untuk memindahkan.
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted italic">Klik elemen di preview untuk memilihnya.</div>
                )}
              </div>

              <div className="bg-surface rounded-md border border-border px-4 py-[14px]">
                <div className="text-xs font-bold text-muted mb-2.5 uppercase tracking-[0.05em] flex items-center gap-1.5">
                  <ClipboardList size={12} /> Semua Elemen
                </div>
                <div className="flex flex-col gap-1.5">
                  {elements.map(el => (
                    <button key={el.id} onClick={() => setSelectedId(el.id)}
                      className={`px-2.5 py-2 rounded-sm border-[1.5px] cursor-pointer text-left font-body flex justify-between items-center ${
                        selectedId === el.id ? 'border-primary bg-primary-light' : 'border-border bg-white'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${selectedId === el.id ? 'text-primary' : 'text-ink'}`}>
                        {ELEMENT_LABELS[el.id]}
                      </span>
                      <span className="text-[11px] text-muted">
                        {el.fontSize}px • ({Math.round(el.x)}%, {Math.round(el.y)}%)
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleExport} disabled={exporting}
                className={`w-full py-[13px] rounded-md border-0 text-sm font-bold font-body flex items-center justify-center gap-2 transition-all duration-200 ${
                  exporting ? 'bg-primary-light text-primary cursor-wait' : 'text-white cursor-pointer shadow-green'
                }`}
                style={!exporting ? { background: 'linear-gradient(135deg, #16a34a, #10b981)' } : undefined}
              >
                {exporting
                  ? <><Loader2 size={14} className="animate-spin" /> Membuat gambar...</>
                  : <><Download size={14} /> Download / Share</>}
              </button>

              <button onClick={handleOpenPostForm} disabled={exporting}
                className={`w-full py-[13px] rounded-md border-2 border-primary bg-white text-primary text-sm font-bold font-body flex items-center justify-center gap-2 transition-all duration-200 ${exporting ? 'cursor-wait' : 'cursor-pointer'}`}
              >
                <Send size={14} /> Post ke Feed
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

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
