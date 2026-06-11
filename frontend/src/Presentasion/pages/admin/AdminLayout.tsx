import { type ReactNode, useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, Flag, Globe,
  LogOut, ShieldCheck, Menu, X,
} from 'lucide-react'
import { useAuth } from '../../../BusinessLogic/context/AuthContext'
import { LogoutModal } from '../shared/sideBar'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/visitors',  icon: Globe,           label: 'Pengunjung' },
  { to: '/admin/users',     icon: Users,           label: 'Pengguna'   },
  { to: '/admin/posts',     icon: FileText,        label: 'Postingan'  },
  { to: '/admin/reports',   icon: Flag,            label: 'Laporan'    },
]

function useAdminSidebar() {
  const [isMobile,    setIsMobile]    = useState(window.innerWidth < 768)
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, user }                  = useAuth()
  const navigate                          = useNavigate()
  const { isMobile, sidebarOpen, setSidebarOpen } = useAdminSidebar()
  const [showLogout, setShowLogout]       = useState(false)

  const handleLogout = async () => {
    logout()
    navigate('/login', { replace: true })
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-surface font-body">

      {/* ── Sidebar ── */}
      {sidebarOpen && isMobile && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/35 z-[190] backdrop-blur-[2px]"
        />
      )}

      <aside className={`
        w-[230px] shrink-0 bg-white border-r border-border flex flex-col h-screen
        ${isMobile ? 'fixed top-0 left-0 z-[200] shadow-float' : 'sticky top-0'}
        overflow-y-auto transition-all
        ${!sidebarOpen ? 'hidden' : ''}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-5 pb-[18px] border-b border-primary-lighter">
          <div
            onClick={() => { navigate('/admin/dashboard'); if (isMobile) closeSidebar() }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[9px] shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <ShieldCheck size={15} color="#fff" />
            </div>
            <span className="font-body font-bold text-[15px] text-ink">Admin Panel</span>
          </div>
          {isMobile && (
            <button
              onClick={closeSidebar}
              className="w-7 h-7 border border-border rounded-[6px] bg-transparent cursor-pointer flex items-center justify-center text-muted"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Admin info */}
        <div className="mx-2.5 mt-3 mb-1 px-3 py-3 bg-primary-lighter rounded-md">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-full shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm text-white font-bold">
              A
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-ink truncate">{user?.full_name || user?.username || 'Admin'}</div>
              <div className="text-[11px] text-muted truncate">Administrator</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2.5 flex flex-col gap-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { if (isMobile) closeSidebar() }}
              className={({ isActive }) =>
                `flex items-center gap-2.5 w-full px-3 py-[9px] rounded-[10px] text-[13.5px] font-body transition-all ` +
                (isActive
                  ? 'bg-primary-light text-primary-mid font-semibold'
                  : 'text-muted hover:bg-primary-lighter hover:text-primary font-normal')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  {isActive && <span className="w-[5px] h-[5px] rounded-full bg-primary shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 pt-2.5 border-t border-primary-lighter">
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-2.5 w-full px-3 py-[9px] rounded-[10px] border-none cursor-pointer text-left font-body text-[13.5px] font-medium transition-all text-muted hover:bg-error-bg hover:text-error"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">

        {/* Header bar dengan tombol ☰ */}
        <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 pt-5 pb-1">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-[34px] h-[34px] border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0 hover:border-primary hover:text-primary transition-colors"
          >
            <Menu size={16} />
          </button>
        </div>

        {children}
      </main>

      {/* Logout modal */}
      {showLogout && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
      )}
    </div>
  )
}
