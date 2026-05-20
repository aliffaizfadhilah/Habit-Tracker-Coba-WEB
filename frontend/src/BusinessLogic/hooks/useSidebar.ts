
import { useState, useEffect } from 'react'

export function useSidebar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)

  useEffect(() => {
    const handler = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return { isMobile, sidebarOpen, setSidebarOpen }
}