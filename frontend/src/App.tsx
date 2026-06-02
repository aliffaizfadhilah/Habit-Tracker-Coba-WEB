import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './BusinessLogic/context/AuthContext'
import Dashboard          from './Presentasion/pages/Dashboard'
import Login              from './Presentasion/pages/auth/Login'
import Register           from './Presentasion/pages/auth/Register'
import ForgotPassword     from './Presentasion/pages/auth/ForgotPassword'
import LandingPage        from './Presentasion/pages/LandingPage'
import HabitPage          from './Presentasion/pages/HabitPage'
import ProfilePage        from './Presentasion/pages/ProfilePage'
import PostinganPage      from './Presentasion/pages/PostinganPage'
import Reminder           from './Presentasion/pages/Reminder'
import ProtectedRoute     from './Presentasion/components/ProtectedRoute'
import InAppNotification  from './Presentasion/components/InAppNotification'
import NotFoundPage       from './Presentasion/pages/NotFoundPage'
import PostDetailPage     from './Presentasion/pages/PostDetailPage'

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <InAppNotification />
      <Routes>
        {/* Public */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected */}
        <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/habits"     element={<ProtectedRoute><HabitPage /></ProtectedRoute>} />
        <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/postingan"  element={<ProtectedRoute><PostinganPage /></ProtectedRoute>} />
        <Route path="/reminder"   element={<ProtectedRoute><Reminder /></ProtectedRoute>} />
        <Route path="/postingan/:id"     element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}