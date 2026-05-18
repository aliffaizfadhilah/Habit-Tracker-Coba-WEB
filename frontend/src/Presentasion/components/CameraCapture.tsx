import React, { useState, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { X, RotateCcw, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  onCapture: (blob: Blob) => void
  onClose:   () => void
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [ready,      setReady]      = useState(false)
  const [error,      setError]      = useState('')
  const [capturing,  setCapturing]  = useState(false)

  const startCamera = async (facing: 'user' | 'environment') => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setReady(false)
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setReady(true)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('NotAllowed') || msg.includes('Permission') || msg.includes('denied')) {
        setError('Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera.')
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setError('Kamera tidak ditemukan di perangkat ini.')
      } else {
        setError('Gagal membuka kamera. Pastikan tidak ada aplikasi lain yang menggunakan kamera.')
      }
    }
  }

  useEffect(() => {
    startCamera('environment')
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    startCamera(next)
  }

  const capture = () => {
    const video = videoRef.current
    if (!video || !ready) return
    setCapturing(true)
    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    if (facingMode === 'user') {
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0)
    } else {
      ctx.drawImage(video, 0, 0)
    }
    canvas.toBlob(blob => {
      if (blob) {
        streamRef.current?.getTracks().forEach(t => t.stop())
        onCapture(blob)
      }
      setCapturing(false)
    }, 'image/jpeg', 0.92)
  }

  const stopAndClose = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    onClose()
  }

  const content = (
    <div
      className="fixed inset-0 z-[950] flex flex-col items-center justify-center bg-black"
      onClick={e => e.stopPropagation()}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <button
          onClick={flipCamera}
          className="w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
          title="Ganti kamera"
        >
          <RotateCcw size={20} color="white" />
        </button>
        <span className="text-white text-[13px] font-semibold opacity-80">
          {facingMode === 'user' ? 'Kamera Depan' : 'Kamera Belakang'}
        </span>
        <button
          onClick={stopAndClose}
          className="w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <X size={20} color="white" />
        </button>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-5 px-8 text-center max-w-sm">
          <AlertCircle size={56} color="#f87171" />
          <p className="text-white text-[14px] leading-relaxed">{error}</p>
          <button
            onClick={stopAndClose}
            className="px-7 py-3 rounded-xl bg-white text-[14px] font-bold text-ink cursor-pointer border-none"
          >
            Tutup
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-[80vh]"
            style={{ objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={48} color="white" className="animate-spin" />
            </div>
          )}
          {/* Shutter button */}
          <button
            onClick={capture}
            disabled={!ready || capturing}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full border-[4px] border-white cursor-pointer disabled:opacity-50 flex items-center justify-center"
            style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.2)' }}
          >
            {capturing
              ? <Loader2 size={28} color="white" className="animate-spin" />
              : <div className="rounded-full bg-white" style={{ width: 54, height: 54 }} />
            }
          </button>
        </>
      )}
    </div>
  )

  return ReactDOM.createPortal(content, document.body)
}
