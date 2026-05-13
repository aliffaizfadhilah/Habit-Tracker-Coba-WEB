import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard      from './Presentasion/pages/Dashboard'
import Login          from './Presentasion/pages/auth/Login'
import Register       from './Presentasion/pages/auth/Register'
import ForgotPassword from './Presentasion/pages/auth/ForgotPassword'
import OtpVerify      from './Presentasion/pages/auth/OtpVerify'
import LandingPage    from './Presentasion/pages/LandingPage'
import HabitPage      from './Presentasion/pages/HabitPage'
import ProfilePage    from './Presentasion/pages/ProfilePage'
import PostinganPage  from './Presentasion/pages/PostinganPage'
import Reminder       from './Presentasion/pages/Reminder'
import ProtectedRoute from './Presentasion/components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify"      element={<OtpVerify />} />

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