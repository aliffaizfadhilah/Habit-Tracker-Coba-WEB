
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const tokens = {
  primary: '#4361ee',
  primaryLight: '#eef1ff',
  primaryDark: '#3a56d4',
  text: '#1a1a2e',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  white: '#ffffff',
  bg: '#f7f8fc',
  orange: '#f97316',
  green: '#10b981',
  red: '#ef4444',
  purple: '#7c3aed',
  fontBody: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
  fontHeading: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
  fontMono: "'DM Mono', 'Fira Mono', monospace",
  shadow: '0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(67,97,238,.06)',
  shadowLg: '0 8px 32px rgba(67,97,238,.12)',
}

export const NAV_MENU = [
  { id: 'dashboard',    icon: '🏠', label: 'Dashboard',    path: '/dashboard' },
  { id: 'kelola-habit', icon: '📋', label: 'Kelola Habit', path: '/kelola-habit' },
  { id: 'reminder',     icon: '🔔', label: 'Reminder',     path: '/reminder' },
  { id: 'postingan',    icon: '🖼',  label: 'Postingan',    path: '/postingan' },
]
export const NAV_LAINNYA = [
  { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
]

interface SidebarProps {
  open: boolean
  isMobile: boolean
  currentPageId: string
  displayUser: { full_name?: string; username?: string; email?: string }
  onClose: () => void
  onLogout: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  open, isMobile, currentPageId, displayUser, onClose, onLogout,
}) => {
  const navigate = useNavigate()
  const go = (path: string) => {
    navigate(path)
    if (isMobile) onClose()
  }

  const NavBtn: React.FC<{ id: string; icon: string; label: string; path: string }> = ({ id, icon, label, path }) => {
    const active = id === currentPageId
    return (
      <button onClick={() => go(path)} style={{
        display: 'flex', alignItems: 'center', gap: 9, width: '100%',
        padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: active ? tokens.primaryLight : 'transparent',
        color: active ? tokens.primary : tokens.textMuted,
        fontFamily: tokens.fontBody, fontSize: 13.5,
        fontWeight: active ? 700 : 500, transition: 'all .15s', textAlign: 'left',
      }}>
        <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>
        {label}
      </button>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 40, backdropFilter: 'blur(2px)',
        }} />
      )}

      <aside style={{
        width: open ? 230 : 0, flexShrink: 0,
        background: tokens.white, borderRight: `1px solid ${tokens.border}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', transition: 'width .25s ease',
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        } : {}),
      }}>
        <div style={{ padding: '20px 12px', minWidth: 230, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo */}
          <div onClick={() => go('/')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginBottom: 28, paddingLeft: 4 }}>
            <div style={{ width: 32, height: 32, background: tokens.primary, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>
              ✦
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: tokens.text, fontFamily: tokens.fontHeading }}>HabitTracker</span>
          </div>

          {/* Menu section */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: tokens.textMuted, padding: '0 8px', marginBottom: 6, textTransform: 'uppercase' }}>
            Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_MENU.map(item => <NavBtn key={item.id} {...item} />)}
          </nav>

          {/* Lainnya section */}
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: tokens.textMuted, padding: '0 8px', margin: '16px 0 6px', textTransform: 'uppercase' }}>
            Lainnya
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_LAINNYA.map(item => <NavBtn key={item.id} {...item} />)}
          </nav>

          {/* User + logout */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${tokens.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: tokens.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                👤
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: tokens.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayUser.full_name || displayUser.username || 'Pengguna'}
                </div>
                <div style={{ fontSize: 11, color: tokens.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayUser.email || ''}
                </div>
              </div>
            </div>
            <button onClick={onLogout} style={{
              width: '100%', padding: '7px 12px', borderRadius: 8,
              border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c',
              cursor: 'pointer', fontFamily: tokens.fontBody, fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
export function useSidebar() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768)
  const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth >= 768)

  React.useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  return { isMobile, sidebarOpen, setSidebarOpen }
}
export const LogoutModal: React.FC<{ onCancel: () => void; onConfirm: () => void }> = ({ onCancel, onConfirm }) => (
  <div onClick={onCancel} style={{
    position: 'fixed', inset: 0, background: 'rgba(26,26,46,.5)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: 24,
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      background: tokens.white, borderRadius: 20, padding: 32,
      boxShadow: tokens.shadowLg, width: '100%', maxWidth: 400, textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚪</div>
      <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>
        Yakin mau logout?
      </h3>
      <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 24, lineHeight: 1.6, fontFamily: tokens.fontBody }}>
        Kamu akan keluar dari sesi ini dan perlu login kembali.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${tokens.border}`, background: tokens.white, color: tokens.text, cursor: 'pointer', fontFamily: tokens.fontBody, fontSize: 14, fontWeight: 600 }}>
          Batal
        </button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontFamily: tokens.fontBody, fontSize: 14, fontWeight: 600 }}>
          Ya, Logout
        </button>
      </div>
    </div>
  </div>
)