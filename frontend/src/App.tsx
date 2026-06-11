import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function makeUUID(): string {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
}

function trackVisit() {
  try {
    const TRACKED_KEY = 'habittracker_tracked'
    const SESSION_KEY = 'habittracker_session_id'
    if (sessionStorage.getItem(TRACKED_KEY)) return
    sessionStorage.setItem(TRACKED_KEY, '1')
    let sid = sessionStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = makeUUID()
      sessionStorage.setItem(SESSION_KEY, sid)
    }
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: window.location.pathname, session_id: sid }),
    }).catch(() => {})
  } catch {
    // tracking must never crash the app
  }
}
import { AuthProvider } from './BusinessLogic/context/AuthContext'
import Dashboard         from './Presentasion/pages/Dashboard'
import Login             from './Presentasion/pages/auth/Login'
import Register          from './Presentasion/pages/auth/Register'
import ForgotPassword    from './Presentasion/pages/auth/ForgotPassword'
import LandingPage       from './Presentasion/pages/LandingPage'
import HabitPage         from './Presentasion/pages/HabitPage'
import ProfilePage       from './Presentasion/pages/ProfilePage'
import PostinganPage     from './Presentasion/pages/PostinganPage'
import Reminder          from './Presentasion/pages/Reminder'
import ProtectedRoute    from './Presentasion/components/ProtectedRoute'
import AdminRoute        from './Presentasion/components/AdminRoute'
import InAppNotification from './Presentasion/components/InAppNotification'
import BugReportButton   from './Presentasion/components/BugReportButton'
import NotFoundPage      from './Presentasion/pages/NotFoundPage'
import PostDetailPage    from './Presentasion/pages/PostDetailPage'

// Lazy-load admin pages for code splitting
const AdminDashboardPage = lazy(() => import('./Presentasion/pages/admin/AdminDashboardPage'))
const AdminVisitorsPage  = lazy(() => import('./Presentasion/pages/admin/AdminVisitorsPage'))
const AdminUsersPage     = lazy(() => import('./Presentasion/pages/admin/AdminUsersPage'))
const AdminPostsPage     = lazy(() => import('./Presentasion/pages/admin/AdminPostsPage'))
const AdminReportsPage   = lazy(() => import('./Presentasion/pages/admin/AdminReportsPage'))

export default function App() {
  useEffect(() => { trackVisit() }, [])

  return (
    <AuthProvider>
    <BrowserRouter>
      <InAppNotification />
      <BugReportButton />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected (user) */}
        <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/habits"        element={<ProtectedRoute><HabitPage /></ProtectedRoute>} />
        <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/postingan"     element={<ProtectedRoute><PostinganPage /></ProtectedRoute>} />
        <Route path="/reminder"      element={<ProtectedRoute><Reminder /></ProtectedRoute>} />
        <Route path="/postingan/:id" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />

        {/* Admin — lazy loaded */}
        <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><Suspense fallback={null}><AdminDashboardPage /></Suspense></AdminRoute>} />
        <Route path="/admin/visitors"  element={<AdminRoute><Suspense fallback={null}><AdminVisitorsPage /></Suspense></AdminRoute>} />
        <Route path="/admin/users"     element={<AdminRoute><Suspense fallback={null}><AdminUsersPage /></Suspense></AdminRoute>} />
        <Route path="/admin/posts"     element={<AdminRoute><Suspense fallback={null}><AdminPostsPage /></Suspense></AdminRoute>} />
        <Route path="/admin/reports"   element={<AdminRoute><Suspense fallback={null}><AdminReportsPage /></Suspense></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}
