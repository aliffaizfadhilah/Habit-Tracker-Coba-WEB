import { useEffect, useRef } from 'react'

/**
 * Auto-refresh hook for admin pages.
 * Fires onRefresh at the given interval, pauses when the tab is hidden,
 * and triggers an immediate refresh when the tab becomes visible again.
 */
export function useAdminRealtime(onRefresh: () => void, intervalMs = 30_000): void {
  const latestRef = useRef(onRefresh)
  useEffect(() => { latestRef.current = onRefresh })

  useEffect(() => {
    let timerId: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (timerId !== null) return
      timerId = setInterval(() => latestRef.current(), intervalMs)
    }
    const stop = () => {
      if (timerId !== null) { clearInterval(timerId); timerId = null }
    }
    const onVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        latestRef.current()
        start()
      }
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])
}
