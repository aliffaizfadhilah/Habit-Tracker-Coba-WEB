// ─── Sidebar Component ─────────────────────────────────────────────────────────
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokens } from '../../../BusinessLogic/factories/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SidebarProps {
  open?: boolean
  isMobile?: boolean
  currentPageId?: string
  displayUser?: { full_name?: string; email?: string; username?: string }
  onClose?: () => void
  onLogout?: () => void
}

export { useSidebar } from '../../../BusinessLogic/hooks/useSidebar'

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard',      path: '/dashboard'  },
  { id: 'habits',     icon: '✅', label: 'Semua Habit',     path: '/habits'     },
  { id: 'streak',     icon: '🔥', label: 'Streak',          path: '/streak'     },
  { id: 'reminder',   icon: '🔔', label: 'Reminder',        path: '/reminder'   },
  { id: 'postingan',  icon: '🖼',  label: 'Wall Pribadi',   path: '/postingan'  },
  { id: 'profile',    icon: '👤', label: 'Profil',          path: '/profile'    },
]

// ─── LogoutModal ──────────────────────────────────────────────────────────────
export const LogoutModal: React.FC<{
  onCancel: () => void
  onConfirm: () => Promise<void>
}> = ({ onCancel, onConfirm }) => (
  <div onClick={onCancel} style={{
    position: 'fixed', inset: 0, background: 'rgba(11,26,14,0.55)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 400, padding: 24,
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      background: tokens.white, borderRadius: tokens.radiusXl, padding: 32,
      boxShadow: tokens.shadowLg, width: '100%', maxWidth: 380, textAlign: 'center',
    }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
      <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>
        Keluar dari Akun?
      </h3>
      <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 28, lineHeight: 1.6 }}>
        Kamu akan keluar dari sesi ini. Progress habit tetap tersimpan.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '11px', borderRadius: tokens.radiusSm,
          border: `1.5px solid ${tokens.border}`, background: tokens.white,
          color: tokens.text, cursor: 'pointer', fontFamily: tokens.fontBody,
          fontSize: 14, fontWeight: 600,
        }}>Batal</button>
        <button onClick={onConfirm} style={{
          flex: 2, padding: '11px', borderRadius: tokens.radiusSm,
          border: 'none', background: tokens.error, color: tokens.white,
          cursor: 'pointer', fontFamily: tokens.fontBody, fontSize: 14, fontWeight: 700,
        }}>Ya, Keluar</button>
      </div>
    </div>
  </div>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  open = true,
  isMobile = false,
  currentPageId,
  displayUser,
  onClose,
  onLogout,
}) => {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hoveredLogout, setHoveredLogout] = useState(false)

  const handleNav = (path: string) => {
    navigate(path)
    if (isMobile) onClose?.()
  }

  if (!open) return null

  return (
    <>
      {/* Overlay mobile */}
      {isMobile && (
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          zIndex: 190, backdropFilter: 'blur(2px)',
        }} />
      )}

      <aside style={{
        width: 230, flexShrink: 0,
        background: tokens.white,
        borderRight: `1px solid ${tokens.border}`,
        display: 'flex', flexDirection: 'column',
        height: '100vh',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, left: 0,
        zIndex: isMobile ? 200 : 'auto',
        boxShadow: isMobile ? tokens.shadowLg : 'none',
        transition: tokens.transitionBase,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 16px 18px',
          borderBottom: `1px solid ${tokens.primaryLighter}`,
        }}>
          <div onClick={() => handleNav('/dashboard')} style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: `linear-gradient(135deg,${tokens.primary},${tokens.accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: tokens.white,
            }}>✦</div>
            <span style={{
              fontFamily: tokens.fontHeading, fontWeight: 700,
              fontSize: 15, color: tokens.text,
            }}>HabitTracker</span>
          </div>
          {isMobile && (
            <button onClick={onClose} style={{
              width: 28, height: 28, border: `1px solid ${tokens.border}`,
              borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: tokens.textMuted,
            }}>✕</button>
          )}
        </div>

        {/* User info */}
        {displayUser && (
          <div style={{
            margin: '12px 10px 4px', padding: '12px 12px',
            background: tokens.primaryLighter, borderRadius: tokens.radius,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg,${tokens.primary},${tokens.accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: tokens.white, fontWeight: 700,
              }}>
                {(displayUser.full_name || displayUser.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: tokens.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{displayUser.full_name || displayUser.username}</div>
                <div style={{
                  fontSize: 11, color: tokens.textMuted,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>@{displayUser.username}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => {
            const active = currentPageId === item.id
            const hovered = hoveredId === item.id
            return (
              <button key={item.id}
                onClick={() => handleNav(item.path)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px', borderRadius: 10,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? tokens.primaryLight : hovered ? tokens.primaryLighter : 'transparent',
                  color: active ? tokens.primaryMid : hovered ? tokens.primary : tokens.textMuted,
                  fontFamily: tokens.fontBody, fontSize: 13.5,
                  fontWeight: active ? 600 : 400,
                  transition: tokens.transitionFast,
                }}
              >
                <span style={{ fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: tokens.primary, flexShrink: 0 }} />}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px 16px', borderTop: `1px solid ${tokens.primaryLighter}` }}>
          <button
            onClick={onLogout}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px', borderRadius: 10,
              border: 'none', cursor: 'pointer', textAlign: 'left',
              background: hoveredLogout ? tokens.errorBg : 'transparent',
              color: hoveredLogout ? tokens.error : tokens.textMuted,
              fontFamily: tokens.fontBody, fontSize: 13.5, fontWeight: 500,
              transition: tokens.transitionFast,
            }}
          >
            <span style={{ fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 }}>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar