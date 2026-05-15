import { useEffect, useState, useCallback } from 'react'
import { IN_APP_NOTIFICATION_EVENT } from '../../BusinessLogic/services/NotificationService'
import { tokens } from '../../BusinessLogic/factories/tokens'

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
    <>
      <style>{`
        @keyframes ht-slide-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: 320,
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: tokens.white,
              border: `1.5px solid ${tokens.border}`,
              borderLeft: `4px solid ${tokens.primary}`,
              borderRadius: tokens.radius,
              padding: '14px 16px',
              boxShadow: tokens.shadowLg,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              animation: 'ht-slide-in 0.25s ease',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>🔔</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: tokens.text,
                fontFamily: tokens.fontHeading,
              }}>
                {toast.title}
              </p>
              <p style={{
                margin: '3px 0 0',
                fontSize: 12,
                color: tokens.textMuted,
                fontFamily: tokens.fontBody,
                lineHeight: 1.4,
              }}>
                {toast.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                color: tokens.textLight,
                lineHeight: 1,
                padding: 0,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
