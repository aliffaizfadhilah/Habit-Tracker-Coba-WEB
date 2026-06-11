import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, CheckSquare, Bell, Camera, User,
  LogOut, X,
} from 'lucide-react'

export interface SidebarProps {
  open?: boolean
  isMobile?: boolean
  currentPageId?: string
  displayUser?: { full_name?: string; email?: string; username?: string }
  onClose?: () => void
  onLogout?: () => void
}

export { useSidebar } from '../../../BusinessLogic/hooks/useSidebar'

const NAV_ITEMS = [
  { id: 'dashboard',  Icon: Home,        label: 'Dashboard',    path: '/dashboard'  },
  { id: 'habits',     Icon: CheckSquare, label: 'Kelola Habit', path: '/habits'     },
  { id: 'reminder',   Icon: Bell,        label: 'Reminder',     path: '/reminder'   },
  { id: 'postingan',  Icon: Camera,      label: 'Postingan',    path: '/postingan'  },
  { id: 'profile',    Icon: User,        label: 'Profil',       path: '/profile'    },
]

export const LogoutModal: React.FC<{
  onCancel: () => void
  onConfirm: () => Promise<void>
}> = ({ onCancel, onConfirm }) => (
  <div
    onClick={onCancel}
    className="fixed inset-0 bg-[rgba(11,26,14,0.55)] backdrop-blur-[4px] flex items-center justify-center z-[400] p-6"
  >
    <div
      onClick={e => e.stopPropagation()}
      className="bg-white rounded-xl p-8 shadow-float w-full max-w-[380px] text-center"
    >
      <div className="text-[44px] mb-3">👋</div>
      <h3 className="font-body text-xl font-bold text-ink mb-2">Keluar dari Akun?</h3>
      <p className="text-sm text-muted mb-7 leading-relaxed">
        Kamu akan keluar dari sesi ini. Progress habit tetap tersimpan.
      </p>
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          className="flex-1 py-[11px] rounded-sm border-[1.5px] border-border bg-white text-ink cursor-pointer font-body text-sm font-semibold"
        >Batal</button>
        <button
          onClick={onConfirm}
          className="flex-[2] py-[11px] rounded-sm border-none bg-error text-white cursor-pointer font-body text-sm font-bold"
        >Ya, Keluar</button>
      </div>
    </div>
  </div>
)

function UserInfoSection({ user }: { user: { full_name?: string; username?: string } }) {
  return (
    <div className="mx-2.5 mt-3 mb-1 px-3 py-3 bg-primary-lighter rounded-md">
      <div className="flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm text-white font-bold">
          {(user.full_name || user.username || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-ink truncate">{user.full_name || user.username}</div>
          <div className="text-[11px] text-muted truncate">@{user.username}</div>
        </div>
      </div>
    </div>
  )
}

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
      {isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/35 z-[190] backdrop-blur-[2px]"
        />
      )}

      <aside className={`
        w-[230px] shrink-0 bg-white border-r border-border flex flex-col h-screen
        ${isMobile ? 'fixed top-0 left-0 z-[200] shadow-float' : 'sticky top-0'}
        overflow-y-auto transition-all
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-5 pb-[18px] border-b border-primary-lighter">
          <div
            onClick={() => handleNav('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[9px] shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[15px] text-white">
              ✦
            </div>
            <span className="font-body font-bold text-[15px] text-ink">HabitTracker</span>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="w-7 h-7 border border-border rounded-[6px] bg-transparent cursor-pointer flex items-center justify-center text-muted"
            ><X size={12} /></button>
          )}
        </div>

        {/* User info */}
        {displayUser && <UserInfoSection user={displayUser} />}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-2.5 flex flex-col gap-0.5">
          {NAV_ITEMS.map(item => {
            const active  = currentPageId === item.id
            const hovered = hoveredId === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  flex items-center gap-2.5 w-full px-3 py-[9px] rounded-[10px]
                  border-none cursor-pointer text-left font-body text-[13.5px]
                  transition-[background,color_0.15s_ease]
                  ${active   ? 'bg-primary-light text-primary-mid font-semibold' :
                    hovered  ? 'bg-primary-lighter text-primary' :
                    'bg-transparent text-muted font-normal'}
                `}
              >
                <item.Icon size={16} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <span className="w-[5px] h-[5px] rounded-full bg-primary shrink-0" />}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 pt-2.5 border-t border-primary-lighter">
          <button
            onClick={onLogout}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            className={`
              flex items-center gap-2.5 w-full px-3 py-[9px] rounded-[10px]
              border-none cursor-pointer text-left font-body text-[13.5px] font-medium
              transition-all
              ${hoveredLogout ? 'bg-error-bg text-error' : 'bg-transparent text-muted'}
            `}
          >
            <LogOut size={16} className="shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
