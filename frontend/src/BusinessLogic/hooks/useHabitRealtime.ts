import { useCallback, useEffect, useRef } from 'react'

const _listeners = new Set<() => void>()
let _es: EventSource | null = null
let _pollId: ReturnType<typeof setInterval> | null = null
let _refCount = 0

function _notifyAll() {
  _listeners.forEach(fn => fn())
}

function _clearPoll() {
  if (_pollId !== null) {
    clearInterval(_pollId)
    _pollId = null
  }
}

function _startPoll() {
  if (_pollId !== null) return
  _pollId = setInterval(_notifyAll, 15_000)
}

function _connectSSE() {
  if (_es) return
  const es = new EventSource('/api/habits/stream', { withCredentials: true })
  _es = es
  es.addEventListener('habits_updated', _notifyAll)
  es.onopen = () => _clearPoll()
  es.onerror = () => {
    es.close()
    if (_es === es) _es = null
    if (_refCount > 0) {
      _startPoll()
      setTimeout(() => { if (_refCount > 0) _connectSSE() }, 30_000)
    }
  }
}

function _disconnectAll() {
  _es?.close()
  _es = null
  _clearPoll()
}


export function useHabitRealtime(onUpdate: () => void): void {
  const latestRef = useRef(onUpdate)
  useEffect(() => { latestRef.current = onUpdate })

  const stableFn = useCallback(() => latestRef.current(), [])

  useEffect(() => {
    _listeners.add(stableFn)
    _refCount++
    if (_refCount === 1) _connectSSE()
    return () => {
      _listeners.delete(stableFn)
      _refCount--
      if (_refCount === 0) _disconnectAll()
    }
  }, [stableFn])
}
