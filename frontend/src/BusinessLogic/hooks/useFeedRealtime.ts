import { useCallback, useEffect, useRef, useState } from 'react'
import type { Post } from '../services/PostService'
import { postService } from '../services/PostService'

export type FeedTransport = 'ws' | 'sse' | 'polling' | 'idle'

export interface FeedRealtimeResult {
  pendingPosts: Post[]
  transport:    FeedTransport
  connected:    boolean
  clearPending: () => void
}

/**
 * Real-time feed updates via WebSocket → SSE → Polling fallback chain.
 *
 * WebSocket: set VITE_WS_URL env variable (e.g. ws://localhost:6001)
 * SSE:       default transport, requires /api/feed/stream endpoint
 * Polling:   fallback every 30 s when SSE is unavailable
 *
 * @param cursor   Highest post ID already loaded (0 = empty feed)
 * @param enabled  Start connection only when true (after initial load)
 */
export function useFeedRealtime(cursor: number, enabled: boolean): FeedRealtimeResult {
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [transport,    setTransport]    = useState<FeedTransport>('idle')
  const [connected,    setConnected]    = useState(false)

  const cursorRef  = useRef(cursor)
  const esRef      = useRef<EventSource | null>(null)
  const wsRef      = useRef<WebSocket | null>(null)
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef  = useRef(false) // prevents re-entry

  useEffect(() => { cursorRef.current = cursor }, [cursor])

  const clearPending = useCallback(() => setPendingPosts([]), [])

  const appendPending = useCallback((incoming: Post[]) => {
    if (!incoming.length) return
    const latest = Math.max(...incoming.map(p => p.id))
    if (latest > cursorRef.current) cursorRef.current = latest
    setPendingPosts(prev => {
      const seen = new Set(prev.map(p => p.id))
      const fresh = incoming.filter(p => !seen.has(p.id))
      return fresh.length > 0 ? [...fresh, ...prev] : prev
    })
  }, [])

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    setTransport('polling')
    setConnected(true)

    pollRef.current = setInterval(async () => {
      if (!activeRef.current) return
      try {
        const posts = await postService.getPostsSince(cursorRef.current)
        appendPending(posts)
      } catch { /* ignore */ }
    }, 30_000)
  }, [appendPending])

  const connectSSE = useCallback(() => {
    esRef.current?.close()

    const url = `/api/feed/stream?cursor=${cursorRef.current}`
    const es   = new EventSource(url, { withCredentials: true })
    esRef.current = es

    es.addEventListener('new_posts', (e: MessageEvent) => {
      if (!activeRef.current) return
      try {
        const payload = JSON.parse(e.data) as { posts: Post[]; cursor: number }
        appendPending(payload.posts)
      } catch { /* ignore */ }
    })

    es.onopen  = () => { setConnected(true); setTransport('sse') }
    es.onerror = () => {
      es.close()
      setConnected(false)
      if (activeRef.current) startPolling()
    }
  }, [appendPending, startPolling])

  const connectWS = useCallback((): boolean => {
    const wsUrl = (import.meta.env.VITE_WS_URL ?? '') as string
    if (!wsUrl) return false

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => { setConnected(true); setTransport('ws') }

      ws.onmessage = (e) => {
        if (!activeRef.current) return
        try {
          const msg = JSON.parse(e.data) as { type: string; posts?: Post[]; cursor?: number }
          if (msg.type === 'new_posts' && msg.posts?.length) {
            appendPending(msg.posts)
          }
        } catch { /* ignore */ }
      }

      ws.onerror = () => { ws.close() }
      ws.onclose = () => { if (activeRef.current) connectSSE() }
      return true
    } catch {
      return false
    }
  }, [appendPending, connectSSE])

  const start = useCallback(() => {
    if (!connectWS()) connectSSE()
  }, [connectWS, connectSSE])

  const stop = useCallback(() => {
    esRef.current?.close()
    wsRef.current?.close()
    if (pollRef.current) clearInterval(pollRef.current)
    setConnected(false)
    setTransport('idle')
  }, [])

  useEffect(() => {
    if (!enabled) return

    activeRef.current = true
    start()

    const onVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        activeRef.current = true
        start()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      activeRef.current = false
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled, start, stop])

  return { pendingPosts, transport, connected, clearPending }
}
