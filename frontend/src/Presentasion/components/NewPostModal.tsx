import React, { useState, useRef, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { postService } from '../../BusinessLogic/services/PostService'
import { PostBuilder } from '../../BusinessLogic/builders/PostBuilder'
import { http } from '../../BusinessLogic/services/HttpService'
import {
  SnapshotBuilder,
  type DiagramType, type ElementId, type SnapshotElement,
} from '../../BusinessLogic/builders/SnapshotBuilder'
import type { HabitGridItem } from '../../BusinessLogic/factories/HabitFormFactory'
import CameraCapture from './CameraCapture'
import {
  X, ChevronLeft, ChevronRight, Send, Lock, Globe,
  BarChart2, Loader2, Camera, FolderOpen, Circle, Moon,
  Target, Info, ClipboardList, ZoomIn, ZoomOut, Search,
  Inbox,
} from 'lucide-react'

const PREVIEW_W = 260
const PREVIEW_H = 462   // 9:16 scaled down (fits in modal)

const DonutChart: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const r = size * 0.34, cx = size / 2, cy = size / 2
  const C = 2 * Math.PI * r
  const offset = C - (Math.min(progress, 100) / 100) * C
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={r * 0.32} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth={r * 0.32}
        strokeDasharray={`${C}`} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={size * 0.2} fontWeight="800" fontFamily="system-ui,sans-serif">
        {progress}%
      </text>
      <text x={cx} y={cy + size * 0.17} textAnchor="middle"
        fill="rgba(255,255,255,0.75)" fontSize={size * 0.1} fontFamily="system-ui,sans-serif">
        Progress
      </text>
    </svg>
  )
}

const ArcChart: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const cx = size / 2, cy = size * 0.72
  const r = size * 0.37, sw = r * 0.24
  const p = Math.min(progress, 100)
  const angle = Math.PI * (1 - p / 100)
  const endX = cx + r * Math.cos(angle), endY = cy - r * Math.sin(angle)
  const la = p > 50 ? 1 : 0
  return (
    <svg width={size} height={size * 0.78}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
        fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={sw} strokeLinecap="round" />
      {p > 0 && (
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${la} 0 ${endX} ${endY}`}
          fill="none" stroke="white" strokeWidth={sw} strokeLinecap="round" />
      )}
      <text x={cx} y={cy - r * 0.38} textAnchor="middle"
        fill="white" fontSize={r * 0.5} fontWeight="800" fontFamily="system-ui,sans-serif">
        {progress}%
      </text>
      <text x={cx} y={cy - r * 0.06} textAnchor="middle"
        fill="rgba(255,255,255,0.75)" fontSize={r * 0.24} fontFamily="system-ui,sans-serif">
        Progress
      </text>
    </svg>
  )
}

function HabitPickerItem({ h, selected, onSelect }: {
  h: HabitGridItem
  selected: boolean
  onSelect: () => void
}) {
  const arc = 2 * Math.PI * 14 * h.progress_percent / 100
  const C   = 2 * Math.PI * 14
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer text-left transition-all font-body"
      style={{ borderColor: selected ? '#16a34a' : '#e5e7eb', background: selected ? '#f0fdf4' : 'white' }}
    >
      <svg width={38} height={38} className="shrink-0">
        <circle cx={19} cy={19} r={14} fill="none" stroke="#e5e7eb" strokeWidth={4} />
        <circle cx={19} cy={19} r={14} fill="none" stroke="#16a34a" strokeWidth={4}
          strokeLinecap="round" strokeDasharray={`${arc} ${C - arc}`}
          transform="rotate(-90 19 19)" />
        <text x={19} y={19} textAnchor="middle" dominantBaseline="central"
          fill="#15803d" fontSize={8} fontWeight="800" fontFamily="system-ui">
          {Math.round(h.progress_percent)}
        </text>
      </svg>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-ink truncate">{h.title}</div>
        <div className="text-[11px] text-muted mt-0.5">
          {h.category} • 🔥 {h.current_streak} streak • ✅ {h.total_completed_days} hari
        </div>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0">
          <div className="w-2 h-2 border-r-2 border-b-2 border-white rotate-45 mb-0.5" />
        </div>
      )}
    </button>
  )
}

function BgZoomControls({ bgZoom, onZoomChange, onReset, onRemove }: {
  bgZoom: number
  onZoomChange: (v: number) => void
  onReset: () => void
  onRemove: () => void
}) {
  return (
    <div className="mt-2.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button onClick={() => onZoomChange(bgZoom - 0.1)}
          className="w-6 h-6 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center cursor-pointer shrink-0">
          <ZoomOut size={12} color="#555" />
        </button>
        <input type="range" min={100} max={300} step={5}
          value={Math.round(bgZoom * 100)}
          onChange={e => onZoomChange(Number(e.target.value) / 100)}
          className="flex-1 accent-[#16a34a]" />
        <button onClick={() => onZoomChange(bgZoom + 0.1)}
          className="w-6 h-6 rounded-full border border-[#e5e7eb] bg-white flex items-center justify-center cursor-pointer shrink-0">
          <ZoomIn size={12} color="#555" />
        </button>
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-muted">Zoom: {Math.round(bgZoom * 100)}% • Drag preview untuk geser</span>
        <button onClick={onReset}
          className="text-[10px] text-[#16a34a] cursor-pointer bg-transparent border-none font-body">Reset</button>
      </div>
      <button onClick={onRemove}
        className="w-full py-1.5 rounded-lg border border-[#e5e7eb] bg-transparent cursor-pointer text-[11px] text-muted font-body flex items-center justify-center gap-1">
        <X size={11} /> Hapus foto
      </button>
    </div>
  )
}

interface Props { onClose: () => void; onPosted: () => void }
type Step = 1 | 2 | 3

export default function NewPostModal({ onClose, onPosted }: Props) {
  const [habits,        setHabits]        = useState<HabitGridItem[]>([])
  const [loadingHabits, setLoadingHabits] = useState(true)
  const [selectedHabit, setSelectedHabit] = useState<HabitGridItem | null>(null)
  const [habitSearch,   setHabitSearch]   = useState('')

  const [elements,     setElements]     = useState<SnapshotElement[]>(
    () => new SnapshotBuilder().build().elements
  )
  const [bgImage,      setBgImage]      = useState<string | null>(null)
  const [bgZoom,       setBgZoom]       = useState(1)
  const [bgPanX,       setBgPanX]       = useState(0)
  const [bgPanY,       setBgPanY]       = useState(0)
  const [diagramType,  setDiagramType]  = useState<DiagramType>('donut')
  const [selectedId,   setSelectedId]   = useState<ElementId | null>(null)
  const [showCamera,   setShowCamera]   = useState(false)

  const [title,        setTitle]        = useState('')
  const [caption,      setCaption]      = useState('')
  const [isPrivate,    setIsPrivate]    = useState(false)
  const [posting,      setPosting]      = useState(false)
  const [capturing,    setCapturing]    = useState(false)
  const [snapshotBlob, setSnapshotBlob] = useState<Blob | null>(null)
  const [error,        setError]        = useState('')

  const [step, setStep] = useState<Step>(1)

  const previewRef   = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const draggingId   = useRef<ElementId | null>(null)
  const dragOffset   = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const bgDragging   = useRef(false)
  const bgLastPos    = useRef({ x: 0, y: 0 })

  const selectedEl = elements.find(e => e.id === selectedId) ?? null
  const progress   = selectedHabit ? Number(selectedHabit.progress_percent) : 0

  useEffect(() => {
    http.get<{ success: boolean; data: HabitGridItem[] }>('/api/habits')
      .then(res => { if (res.success) setHabits(res.data) })
      .catch(() => {})
      .finally(() => setLoadingHabits(false))
  }, [])

  useEffect(() => {
    if (selectedHabit && !title) setTitle(selectedHabit.title)
  }, [selectedHabit])

  const applyZoom = (newZoom: number) => {
    const z = Math.max(1, Math.min(3, newZoom))
    const maxPan = (z - 1) * Math.max(PREVIEW_W, PREVIEW_H) * 0.5
    setBgZoom(z)
    setBgPanX(px => Math.max(-maxPan, Math.min(maxPan, px)))
    setBgPanY(py => Math.max(-maxPan, Math.min(maxPan, py)))
  }

  const startDrag = useCallback((id: ElementId, clientX: number, clientY: number) => {
    const el   = elements.find(e => e.id === id)
    const rect = previewRef.current?.getBoundingClientRect()
    if (!el || !rect) return
    dragOffset.current = {
      dx: (el.x / 100) * rect.width  + rect.left - clientX,
      dy: (el.y / 100) * rect.height + rect.top  - clientY,
    }
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
        const x = ((clientX + dragOffset.current.dx - rect.left) / rect.width)  * 100
        const y = ((clientY + dragOffset.current.dy - rect.top)  / rect.height) * 100
        setElements(prev => prev.map(el =>
          el.id === draggingId.current
            ? { ...el, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
            : el,
        ))
      } else if (bgDragging.current && bgImage) {
        const dx = clientX - bgLastPos.current.x
        const dy = clientY - bgLastPos.current.y
        bgLastPos.current = { x: clientX, y: clientY }
        setBgPanX(px => {
          const maxPan = (bgZoom - 1) * PREVIEW_W * 0.5 + 80
          return Math.max(-maxPan, Math.min(maxPan, px + dx))
        })
        setBgPanY(py => {
          const maxPan = (bgZoom - 1) * PREVIEW_H * 0.5 + 80
          return Math.max(-maxPan, Math.min(maxPan, py + dy))
        })
      }
    }
    const onUp = () => { draggingId.current = null; bgDragging.current = false }

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
      el.id === id ? { ...el, fontSize: Math.max(8, Math.min(48, el.fontSize + delta)) } : el,
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
    const f = e.target.files?.[0]; if (f) loadBgFromBlob(f); e.target.value = ''
  }

  const handleCameraCapture = (blob: Blob) => {
    loadBgFromBlob(blob)
    setShowCamera(false)
  }

  const renderElementContent = (el: SnapshotElement) => {
    if (!selectedHabit) return null
    const fs = el.fontSize
    switch (el.id) {
      case 'title':
        return (
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: fs, fontWeight: 800, color: 'white', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: 'system-ui,sans-serif' }}>
              {selectedHabit.title}
            </div>
            <div style={{ fontSize: fs * 0.55, color: 'rgba(255,255,255,0.8)', marginTop: 4, textShadow: '0 1px 4px rgba(0,0,0,0.5)', fontFamily: 'system-ui,sans-serif' }}>
              {selectedHabit.category}
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
              { icon: '🔥', val: selectedHabit.current_streak,      label: 'Streak' },
              { icon: '✅', val: selectedHabit.total_completed_days, label: 'Selesai' },
              { icon: '🏆', val: selectedHabit.longest_streak,       label: 'Longest' },
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
            🌿 HabitTracker
          </div>
        )
    }
  }

  const captureAndNext = async () => {
    if (!previewRef.current) return
    setCapturing(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true, scale: 2, logging: false,
        width: PREVIEW_W, height: PREVIEW_H,
      })
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Canvas empty')), 'image/png'),
      )
      setSnapshotBlob(blob)
      setStep(3)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal mengambil snapshot.')
    }
    setCapturing(false)
  }

  const handlePost = async () => {
    if (!title.trim()) { setError('Judul wajib diisi.'); return }
    if (!selectedHabit) { setError('Pilih habit terlebih dahulu.'); return }
    if (!snapshotBlob)  { setError('Kembali ke langkah sebelumnya dan coba lagi.'); return }
    setPosting(true); setError('')
    try {
      const builder = new PostBuilder()
        .withTitle(title)
        .withCaption(caption)
        .withImage(snapshotBlob)
        .withPrivacy(isPrivate)
        .withFrameStyle('rect')
        .withHabit(selectedHabit.id_habit, selectedHabit.title, Number(selectedHabit.progress_percent))

      const res = await postService.createPost(builder.build())
      if (res.success) onPosted()
      else setError(res.message ?? 'Gagal membuat postingan.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan.')
    }
    setPosting(false)
  }

  const q = habitSearch.trim().toLowerCase()
  const filteredHabits = q
    ? habits.filter(h =>
        h.title.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q),
      )
    : habits

  const ELEMENT_LABELS: Record<ElementId, string> = {
    title:    'Judul & Kategori',
    diagram:  'Diagram Progress',
    stats:    'Statistik',
    branding: 'Watermark',
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[700] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.72)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col"
          style={{ maxWidth: step === 2 ? 760 : 440, maxHeight: '95vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0f0f0] shrink-0">
            {step > 1 ? (
              <button onClick={() => setStep(s => (s - 1) as Step)}
                className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center bg-[#f3f4f6]">
                <ChevronLeft size={18} />
              </button>
            ) : (
              <button onClick={onClose}
                className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center bg-[#f3f4f6]">
                <X size={16} />
              </button>
            )}
            <div className="flex-1 text-center font-body font-bold text-[15px] text-ink">
              {step === 1 ? 'Pilih Habit' : step === 2 ? 'Buat Snapshot' : 'Detail Postingan'}
            </div>
            <div className="flex gap-1.5">
              {([1, 2, 3] as Step[]).map(s => (
                <div key={s} className="rounded-full transition-all duration-200"
                  style={{ width: step === s ? 18 : 6, height: 6, background: step >= s ? '#16a34a' : '#e5e7eb' }} />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">

            {/* ── STEP 1: Habit Picker ── */}
            {step === 1 && (
              <div className="p-5 flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <Search size={15} color="#9ca3af" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    value={habitSearch}
                    onChange={e => setHabitSearch(e.target.value)}
                    placeholder="Cari habit..."
                    className="w-full pl-9 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#fafafa] text-[13px] font-body outline-none text-ink focus:border-[#16a34a] transition-colors"
                  />
                </div>

                {loadingHabits ? (
                  <div className="flex justify-center py-10"><Loader2 size={28} color="#16a34a" className="animate-spin" /></div>
                ) : habits.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center gap-3">
                    <Inbox size={48} color="#9ca3af" strokeWidth={1.5} />
                    <p className="text-[13px] text-muted">Belum ada habit. Buat habit dulu untuk bisa posting snapshot.</p>
                  </div>
                ) : filteredHabits.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[13px] text-muted">Tidak ada habit yang cocok dengan "{habitSearch}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filteredHabits.map(h => (
                      <HabitPickerItem
                        key={h.id_habit}
                        h={h}
                        selected={selectedHabit?.id_habit === h.id_habit}
                        onSelect={() => setSelectedHabit(h)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Snapshot Editor ── */}
            {step === 2 && selectedHabit && (
              <div className="flex flex-wrap gap-5 p-5 items-start justify-center">

                {/* Preview card */}
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
                    className="relative overflow-hidden rounded-[20px] border-2 border-[#e5e7eb] shadow-lg select-none touch-none"
                    style={{
                      width: PREVIEW_W, height: PREVIEW_H,
                      backgroundColor: '#0f2018',
                      cursor: bgImage ? 'grab' : 'default',
                    }}
                  >
                    {/* Background image */}
                    {bgImage && (
                      <img src={bgImage} alt=""
                        style={{
                          position: 'absolute', objectFit: 'cover',
                          width:  `${bgZoom * 100}%`,
                          height: `${bgZoom * 100}%`,
                          left:  `calc(50% + ${bgPanX}px)`,
                          top:   `calc(50% + ${bgPanY}px)`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 0, pointerEvents: 'none', userSelect: 'none',
                        }}
                        draggable={false}
                      />
                    )}

                    {/* Gradient overlay */}
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

                    {/* Draggable elements */}
                    {elements.map(el => {
                      const isSelected = selectedId === el.id
                      return (
                        <div key={el.id}
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
                  <p className="text-[11px] text-muted mt-2 text-center">
                    Drag elemen untuk memindahkan
                  </p>
                </div>

                {/* Controls */}
                <div className="flex-1 min-w-[200px] flex flex-col gap-3">

                  {/* Background */}
                  <div className="bg-[#fafafa] rounded-xl border border-[#e5e7eb] px-4 py-3">
                    <div className="text-xs font-bold text-muted mb-2 uppercase tracking-[0.05em] flex items-center gap-1.5">
                      <Camera size={12} /> Foto Latar
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*"
                      onChange={handleBgUpload} className="hidden" />
                    <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 rounded-lg border-[1.5px] border-dashed border-[#d1d5db] bg-white cursor-pointer text-[12px] text-[#16a34a] font-semibold font-body flex items-center justify-center gap-1">
                        <FolderOpen size={13} /> Galeri
                      </button>
                      <button onClick={() => setShowCamera(true)}
                        className="flex-1 py-2 rounded-lg border-none text-white cursor-pointer text-[12px] font-semibold font-body flex items-center justify-center gap-1"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#10b981)' }}>
                        <Camera size={13} /> Kamera
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

                  {/* Diagram type */}
                  <div className="bg-[#fafafa] rounded-xl border border-[#e5e7eb] px-4 py-3">
                    <div className="text-xs font-bold text-muted mb-2 uppercase tracking-[0.05em] flex items-center gap-1.5">
                      <BarChart2 size={12} /> Tipe Diagram
                    </div>
                    <div className="flex gap-2">
                      {(['donut', 'arc'] as DiagramType[]).map(t => (
                        <button key={t} onClick={() => setDiagramType(t)}
                          className={`flex-1 py-2 px-2 rounded-lg border-[1.5px] cursor-pointer text-[12px] font-semibold font-body transition-all flex items-center justify-center gap-1 ${
                            diagramType === t ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]' : 'border-[#e5e7eb] bg-white text-muted'
                          }`}
                        >
                          {t === 'donut' ? <><Circle size={12} /> Donut</> : <><Moon size={12} /> Arc</>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Element controls */}
                  <div className="bg-[#fafafa] rounded-xl border border-[#e5e7eb] px-4 py-3">
                    <div className="text-xs font-bold text-muted mb-2 uppercase tracking-[0.05em] flex items-center gap-1.5">
                      <Target size={12} /> Elemen Terpilih
                    </div>
                    {selectedEl ? (
                      <>
                        <div className="text-[12px] font-semibold text-ink mb-2 font-body">{ELEMENT_LABELS[selectedEl.id]}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted">Ukuran:</span>
                          <button onClick={() => changeFontSize(selectedEl.id, -2)}
                            className="w-6 h-6 rounded-[6px] border border-[#e5e7eb] bg-white cursor-pointer font-bold flex items-center justify-center text-ink text-sm">−</button>
                          <span className="text-[12px] font-semibold text-ink min-w-[24px] text-center">{selectedEl.fontSize}</span>
                          <button onClick={() => changeFontSize(selectedEl.id, 2)}
                            className="w-6 h-6 rounded-[6px] border border-[#e5e7eb] bg-white cursor-pointer font-bold flex items-center justify-center text-ink text-sm">+</button>
                        </div>
                        <div className="text-[10px] text-muted mt-1.5 flex items-center gap-1">
                          <Info size={10} /> Drag elemen di preview untuk memindahkan.
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-muted italic">Klik elemen di preview untuk memilihnya.</div>
                    )}
                  </div>

                  {/* All elements list */}
                  <div className="bg-[#fafafa] rounded-xl border border-[#e5e7eb] px-4 py-3">
                    <div className="text-xs font-bold text-muted mb-2 uppercase tracking-[0.05em] flex items-center gap-1.5">
                      <ClipboardList size={12} /> Semua Elemen
                    </div>
                    <div className="flex flex-col gap-1">
                      {elements.map(el => (
                        <button key={el.id} onClick={() => setSelectedId(el.id)}
                          className={`px-2.5 py-1.5 rounded-lg border-[1.5px] cursor-pointer text-left font-body flex justify-between items-center ${
                            selectedId === el.id ? 'border-[#16a34a] bg-[#f0fdf4]' : 'border-[#e5e7eb] bg-white'
                          }`}
                        >
                          <span className={`text-[11px] font-semibold ${selectedId === el.id ? 'text-[#16a34a]' : 'text-ink'}`}>
                            {ELEMENT_LABELS[el.id]}
                          </span>
                          <span className="text-[10px] text-muted">
                            {el.fontSize}px • ({Math.round(el.x)}%, {Math.round(el.y)}%)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 3 && selectedHabit && (
              <div className="p-5 flex flex-col gap-4">
                {/* Mini preview */}
                <div className="flex justify-center">
                  <div className="rounded-xl overflow-hidden border border-[#e5e7eb] shadow-md"
                    style={{ width: 90, height: 160, background: '#0f2018', position: 'relative' }}>
                    {bgImage && (
                      <img src={bgImage} alt=""
                        style={{ position: 'absolute', objectFit: 'cover', width: `${bgZoom * 100}%`, height: `${bgZoom * 100}%`, left: `calc(50% + ${bgPanX * 90 / PREVIEW_W}px)`, top: `calc(50% + ${bgPanY * 160 / PREVIEW_H}px)`, transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}
                        draggable={false}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: bgImage ? 'linear-gradient(180deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.62) 100%)' : 'linear-gradient(145deg,rgba(43,89,255,0.55) 0%,rgba(16,185,129,0.35) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'white', fontFamily: 'system-ui', lineHeight: 1.2 }}>{selectedHabit.title}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.7)', fontFamily: 'system-ui', marginTop: 2 }}>{progress}% Progress</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Habit badge */}
                <div className="flex items-center gap-2 bg-[#f0fdf4] rounded-xl px-3.5 py-2.5">
                  <BarChart2 size={14} color="#16a34a" />
                  <span className="text-[13px] font-semibold text-[#15803d] flex-1 truncate">{selectedHabit.title}</span>
                  <span className="text-[13px] font-bold text-[#15803d]">{progress}%</span>
                </div>

                <div>
                  <label className="text-[13px] font-bold text-ink block mb-1.5">
                    Judul <span className="text-[#ef4444]">*</span>
                  </label>
                  <input value={title} onChange={e => { setTitle(e.target.value); setError('') }}
                    placeholder="Contoh: 30 Hari Olahraga Berhasil!"
                    maxLength={150}
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#e5e7eb] text-[14px] font-body outline-none text-ink focus:border-[#16a34a] transition-colors" />
                  {error && <p className="mt-1 text-[12px] text-[#ef4444]">{error}</p>}
                </div>

                <div>
                  <label className="text-[13px] font-bold text-ink block mb-1.5">
                    Caption <span className="text-[12px] text-muted font-normal">(opsional)</span>
                  </label>
                  <textarea value={caption} onChange={e => setCaption(e.target.value)}
                    placeholder="Ceritakan perjalanan habitmu..."
                    maxLength={1000} rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-[#e5e7eb] text-[14px] font-body outline-none text-ink resize-y min-h-[72px] focus:border-[#16a34a] transition-colors" />
                  <p className="mt-0.5 text-[11px] text-muted text-right">{caption.length}/1000</p>
                </div>

                {/* Privacy */}
                <div className="flex items-center gap-3 bg-[#fafafa] rounded-xl px-4 py-3 border border-[#e5e7eb]">
                  <div className="flex-1">
                    <div className="text-[14px] font-bold text-ink flex items-center gap-2">
                      {isPrivate ? <Lock size={15} color="#6b7280" /> : <Globe size={15} color="#16a34a" />}
                      {isPrivate ? 'Privat' : 'Publik'}
                    </div>
                    <div className="text-[12px] text-muted mt-0.5">
                      {isPrivate ? 'Hanya di dinding profilmu' : 'Muncul di feed publik'}
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsPrivate(p => !p)}
                    className="relative shrink-0 border-none cursor-pointer p-0 bg-transparent"
                    style={{ width: 44, height: 24 }}>
                    <div className="w-full h-full rounded-full transition-colors duration-200"
                      style={{ background: isPrivate ? '#6b7280' : '#16a34a' }} />
                    <div className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200"
                      style={{ left: isPrivate ? 23 : 3 }} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[#f0f0f0] shrink-0">
            {step === 1 ? (
              <button
                onClick={() => { if (selectedHabit) setStep(2) }}
                disabled={!selectedHabit}
                className="w-full py-3 rounded-xl border-none font-bold text-[14px] font-body cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                style={{ background: 'linear-gradient(135deg,#16a34a,#10b981)' }}
              >
                Lanjut <ChevronRight size={16} />
              </button>
            ) : step === 2 ? (
              <button
                onClick={captureAndNext}
                disabled={capturing}
                className="w-full py-3 rounded-xl border-none font-bold text-[14px] font-body cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-white"
                style={{ background: capturing ? '#d1fae5' : 'linear-gradient(135deg,#16a34a,#10b981)' }}
              >
                {capturing
                  ? <><Loader2 size={16} className="animate-spin" />Memproses...</>
                  : <>Lanjut <ChevronRight size={16} /></>}
              </button>
            ) : (
              <button
                onClick={handlePost}
                disabled={posting || !title.trim()}
                className="w-full py-3 rounded-xl border-none font-bold text-[14px] font-body cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-white"
                style={{ background: posting ? '#d1fae5' : 'linear-gradient(135deg,#16a34a,#10b981)' }}
              >
                {posting ? <><Loader2 size={16} className="animate-spin" />Memposting...</> : <><Send size={15} />Posting</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}
    </>
  )
}
