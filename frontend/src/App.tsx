
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute  from './components/ProtectedRoute'
import Dashboard       from './pages/Dashboard'
import HabitPage       from './pages/HabitPage'
import ProfilePage     from './pages/ProfilePage'
import ReminderPage    from './pages/Reminder'
import LandingPage     from './pages/LandingPage'
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import OtpVerify       from './pages/auth/OtpVerify'
import AuthCallback    from './pages/auth/AuthCallback'
import ForgotPassword  from './pages/auth/ForgotPassword'
import PostinganPage from './pages/PostinganPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"                element={<LandingPage />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/otp"             element={<OtpVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback"   element={<AuthCallback />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/kelola-habit" element={
          <ProtectedRoute><HabitPage /></ProtectedRoute>
        } />
        <Route path="/reminder" element={
          <ProtectedRoute><ReminderPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        { <Route path="/postingan" element={<ProtectedRoute><PostinganPage /></ProtectedRoute>} 
        /> }

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}