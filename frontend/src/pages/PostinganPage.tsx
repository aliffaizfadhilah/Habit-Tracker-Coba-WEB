import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar, tokens } from './shared/Sidebar'

export default function PostinganPage() {
  const { user, logout } = useAuth()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()
  const [showLogout, setShowLogout] = useState(false)
  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="postingan"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogout(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '28px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ width: 34, height: 34, border: `1px solid ${tokens.border}`, borderRadius: 8, background: tokens.white, cursor: 'pointer', fontSize: 15 }}>☰</button>
          <div style={{ fontSize: 22, fontWeight: 800, color: tokens.text, fontFamily: tokens.fontHeading }}>Postingan 🖼</div>
        </div>

        {/* Konten halaman postingan di sini */}
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🖼</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>Halaman Postingan</div>
          <div style={{ fontSize: 14, color: tokens.textMuted }}>Coming soon...</div>
        </div>
      </main>

      {showLogout && <LogoutModal onCancel={() => setShowLogout(false)} onConfirm={async () => { setShowLogout(false); await logout() }} />}
    </div>
  )
}