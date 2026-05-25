import { useEffect, useState, useCallback } from 'react'
import { IN_APP_NOTIFICATION_EVENT } from '../../BusinessLogic/services/NotificationService'
import { Bell, X } from 'lucide-react'

interface ToastItem {
  id: number
  title: string
  body: string
}

let nextId = 0

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
      setTimeout(() => removeToast(id), 5000)
    }
    window.addEventListener(IN_APP_NOTIFICATION_EVENT, handler)
    return () => window.removeEventListener(IN_APP_NOTIFICATION_EVENT, handler)
  }, [removeToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-80 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-white border-[1.5px] border-border border-l-[4px] border-l-primary rounded-md p-3.5 px-4 shadow-float flex gap-3 items-start animate-slide-in-right pointer-events-auto"
        >
          <Bell size={18} color="#16a34a" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-ink font-heading">{toast.title}</p>
            <p className="m-0 mt-[3px] text-xs text-muted font-body leading-snug">{toast.body}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="bg-transparent border-none cursor-pointer text-subtle p-0 shrink-0 flex"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
