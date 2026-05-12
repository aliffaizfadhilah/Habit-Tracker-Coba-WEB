
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/AuthService'
import { GlobalStyles } from '../../factories/ComponentFactory'
import { tokens } from '../../factories/tokens'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) { navigate('/login'); return }

    authService.setGoogleCookie(token)
      .then(data => {
        if (data.success) navigate('/dashboard')
        else navigate('/login')
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: tokens.bg,
      gap: 16,
    }}>
      <GlobalStyles />
      <div style={{
        width: 44, height: 44, border: `3px solid ${tokens.border}`,
        borderTopColor: tokens.primary, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: tokens.textMuted, fontFamily: tokens.fontBody }}>
        Memproses login Google...
      </p>
    </div>
  )
}