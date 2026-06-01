import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }   from './BusinessLogic/context/AuthContext'
import Dashboard          from './Presentasion/pages/Dashboard'
import Login              from './Presentasion/pages/auth/Login'
import Register           from './Presentasion/pages/auth/Register'
import ForgotPassword     from './Presentasion/pages/auth/ForgotPassword'
import LandingPage        from './Presentasion/pages/LandingPage'
import ProfilePage        from './Presentasion/pages/ProfilePage'
import ProtectedRoute     from './Presentasion/components/ProtectedRoute'
import InAppNotification  from './Presentasion/components/InAppNotification'

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
          {/* Protected — FITUR 7: AUTH + FITUR 8: AUTO COMPLETE */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
