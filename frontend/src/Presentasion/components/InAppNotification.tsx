import { useEffect, useState, useCallback, useRef } from 'react'
import { IN_APP_NOTIFICATION_EVENT } from '../../BusinessLogic/services/NotificationService'
import { Bell, X } from 'lucide-react'

interface ToastItem {
  id:    number
  title: string
  body:  string
}

const DURATION = 5000
let nextId = 0

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const [progress, setProgress] = useState(100)
  const startRef = useRef(Date.now())
  const rafRef   = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const elapsed  = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(remaining)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="bg-white border border-border rounded-xl shadow-float overflow-hidden animate-slide-in-right pointer-events-auto w-80">
      <div className="flex gap-3 items-start p-4 pb-3">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
          <Bell size={15} color="#16a34a" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="m-0 text-[13px] font-bold text-ink font-heading leading-snug">{toast.title}</p>
          <p className="m-0 mt-1 text-xs text-muted font-body leading-relaxed">{toast.body}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(toast.id)}
          className="bg-transparent border-none cursor-pointer text-subtle p-0 shrink-0 flex items-center justify-center w-5 h-5 rounded hover:bg-surface transition-colors"
        >
          <X size={13} />
        </button>
      </div>
      <div className="h-[3px] bg-border">
        <div
          className="h-full bg-primary transition-none rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default function InAppNotification() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { title, body } = (e as CustomEvent<{ title: string; body: string }>).detail
      const id = nextId++
      setToasts(prev => [...prev, { id, title, body }])
      setTimeout(() => removeToast(id), DURATION)
    }
    window.addEventListener(IN_APP_NOTIFICATION_EVENT, handler)
    return () => window.removeEventListener(IN_APP_NOTIFICATION_EVENT, handler)
  }, [removeToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
