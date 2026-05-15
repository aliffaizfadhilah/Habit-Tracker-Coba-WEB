import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}