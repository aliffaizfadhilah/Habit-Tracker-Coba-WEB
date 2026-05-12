
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { tokens } from '../factories/tokens'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: tokens.bg, gap: 16,
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 40, height: 40, border: `3px solid ${tokens.border}`,
          borderTopColor: tokens.primary, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: 14, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
          Memeriksa sesi...
        </p>
      </div>
    )
  }

  // Belum login → redirect ke /login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}