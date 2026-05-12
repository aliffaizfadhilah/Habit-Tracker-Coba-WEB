
import React, { useState, useEffect } from 'react'
import { Button, Input, Alert, Card, tokens } from '../factories/ComponentFactory'
import { PageHeader, ModalOverlay } from '../factories/SectionFactory'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { ForgotPasswordFormBuilder } from '../builders/ForgotPasswordFormBuilder'
import { Sidebar, LogoutModal, useSidebar } from '../pages/shared/Sidebar'
interface ChangePasswordModalProps {
  email: string; onClose: () => void; onSuccess: () => void
  requestOtp:     () => Promise<{ success: boolean; message: string }>
  verifyOtp:      (otp: string) => Promise<{ success: boolean; message: string }>
  changePassword: (payload: { otp: string; password: string; password_confirmation: string }) => Promise<{ success: boolean; message: string }>
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ email, onClose, onSuccess, requestOtp, verifyOtp, changePassword }) => {
  const [step, setStep]             = useState<'current_password' | 'otp' | 'new_password'>('current_password')
  const [otp, setOtp]               = useState('')
  const [password, setPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [otpCode, setOtpCode]       = useState('')

  const formConfig = new ForgotPasswordFormBuilder()
    .setMode('change')
    .addCurrentPasswordStep(async () => {})
    .addChangeOtpStep(email, async () => {}, async () => {})
    .addNewPasswordStep(async () => {})
    .setCurrentStep(step)
    .build()

  const title    = formConfig.titles[step]    || 'Ganti Password'
  const subtitle = formConfig.subtitles[step] || ''

  const handleRequestOtp = async () => {
    setLoading(true); setError('')
    const result = await requestOtp()
    setLoading(false)
    if (result.success) setStep('otp'); else setError(result.message)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Masukkan 6 digit kode OTP.'); return }
    setLoading(true); setError('')
    const result = await verifyOtp(otp)
    setLoading(false)
    if (result.success) { setOtpCode(otp); setStep('new_password') } else setError(result.message)
  }

  const handleChangePassword = async () => {
    if (!password || password.length < 8) { setError('Password minimal 8 karakter.'); return }
    if (password !== confirmPassword) { setError('Konfirmasi password tidak cocok.'); return }
    setLoading(true); setError('')
    const result = await changePassword({ otp: otpCode, password, password_confirmation: confirmPassword })
    setLoading(false)
    if (result.success) onSuccess(); else setError(result.message)
  }

  return (
    <div style={{ background: tokens.white, borderRadius: 20, padding: '32px', boxShadow: tokens.shadow, width: '100%', maxWidth: 440 }}>
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>{step === 'current_password' ? '🔐' : step === 'otp' ? '📨' : '🔑'}</div>
        <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text, marginBottom: 6 }}>{title}</h3>
        <p style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.6 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {(['current_password', 'otp', 'new_password'] as const).map((s, i) => (
          <div key={s} style={{ width: step === s ? 24 : 8, height: 8, borderRadius: 100, background: step === s ? tokens.primary : (['current_password','otp','new_password'].indexOf(step) > i ? '#a7f3d0' : tokens.border), transition: 'all 0.3s' }} />
        ))}
      </div>
      {error && <div style={{ marginBottom: 16 }}><Alert type="error" message={error} /></div>}

      {step === 'current_password' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: tokens.textMuted, textAlign: 'center' }}>Kode OTP akan dikirim ke <strong style={{ color: tokens.text }}>{email}</strong></p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleRequestOtp} loading={loading} style={{ flex: 2 }}>Kirim Kode OTP</Button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Kode OTP (6 digit)" placeholder="000000" value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setError('') }}
            maxLength={6} style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 700 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleVerifyOtp} loading={loading} style={{ flex: 2 }}>Verifikasi OTP</Button>
          </div>
          <button onClick={handleRequestOtp} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tokens.primary, fontSize: 13, textAlign: 'center', opacity: loading ? 0.5 : 1 }}>
            Kirim ulang OTP
          </button>
        </div>
      )}

      {step === 'new_password' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Password Baru" type="password" placeholder="Minimal 8 karakter" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
          <Input label="Konfirmasi Password Baru" type="password" placeholder="Ulangi password baru" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleChangePassword} loading={loading} style={{ flex: 2 }}>Simpan Password</Button>
          </div>
        </div>
      )}
    </div>
  )
}
export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { profile, loading, error, updateProfile, requestChangePasswordOtp, verifyChangePasswordOtp, changePassword } = useProfile()
  const { isMobile, sidebarOpen, setSidebarOpen } = useSidebar()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setUsername(profile.username || ''); setEmail(profile.email || '') }
  }, [profile])

  const displayUser = user || { full_name: 'Pengguna', email: '', username: 'Pengguna' }
  const isGoogleUser = !!profile?.google_id

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message }); setTimeout(() => setToast(null), 3500)
  }

  const validateProfile = () => {
    const errors: Record<string, string> = {}
    if (!fullName.trim()) errors.full_name = 'Nama lengkap wajib diisi.'
    if (!username.trim()) errors.username  = 'Username wajib diisi.'
    if (!email.trim())    errors.email     = 'Email wajib diisi.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.'
    return errors
  }

  const handleSaveProfile = async () => {
    const errors = validateProfile()
    if (Object.keys(errors).length > 0) { setProfileErrors(errors); return }
    setSaving(true); setProfileErrors({})
    const result = await updateProfile({ full_name: fullName, username, email })
    setSaving(false)
    if (result.success) showToast('success', 'Profil berhasil diperbarui!')
    else showToast('error', result.message)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: tokens.bg, fontFamily: tokens.fontBody }}>
      <Sidebar open={sidebarOpen} isMobile={isMobile} currentPageId="profile"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogoutConfirm(true)} />

      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, padding: isMobile ? '20px 16px' : '32px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ width: 36, height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8, background: tokens.white, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>☰</button>
          <PageHeader title="Profil Saya 👤" subtitle="Kelola informasi akun dan keamanan kamu." />
        </div>

        {toast && <div style={{ marginBottom: 20 }}><Alert type={toast.type === 'success' ? 'success' : 'error'} message={toast.message} /></div>}
        {error && <div style={{ marginBottom: 20 }}><Alert type="error" message={error} /></div>}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${tokens.border}`, borderTopColor: tokens.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {!loading && profile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 560 }}>
            {/* Avatar */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg,${tokens.primary},#6b8fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: tokens.white, fontWeight: 700, fontFamily: tokens.fontHeading, flexShrink: 0 }}>
                  {(profile.full_name || profile.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, color: tokens.text }}>{profile.full_name || profile.username}</div>
                  <div style={{ fontSize: 13, color: tokens.textMuted, marginTop: 2 }}>@{profile.username}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {profile.is_verified && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, background: '#ecfdf5', color: '#065f46' }}>✓ Terverifikasi</span>}
                    {isGoogleUser && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 100, background: '#eff6ff', color: '#1d4ed8' }}>🔗 Google</span>}
                  </div>
                </div>
              </div>
            </Card>

            {/* Edit Profil */}
            <Card>
              <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 17, fontWeight: 700, color: tokens.text, marginBottom: 20 }}>Informasi Akun</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={fullName} onChange={e => { setFullName(e.target.value); setProfileErrors(p => ({ ...p, full_name: '' })) }} error={profileErrors.full_name} />
                <Input label="Username" placeholder="Masukkan username" value={username} onChange={e => { setUsername(e.target.value); setProfileErrors(p => ({ ...p, username: '' })) }} error={profileErrors.username} />
                <Input label="Email" type="email" placeholder="Masukkan email" value={email} onChange={e => { setEmail(e.target.value); setProfileErrors(p => ({ ...p, email: '' })) }} error={profileErrors.email} />
                <Button variant="primary" onClick={handleSaveProfile} loading={saving}>Simpan Perubahan</Button>
              </div>
            </Card>

            {/* Ganti Password */}
            <Card>
              <h3 style={{ fontFamily: tokens.fontHeading, fontSize: 17, fontWeight: 700, color: tokens.text, marginBottom: 8 }}>Keamanan Akun</h3>
              <p style={{ fontSize: 13, color: tokens.textMuted, marginBottom: 20, lineHeight: 1.6 }}>
                {isGoogleUser ? 'Akun ini menggunakan Google login. Ganti password tidak tersedia.' : 'Ganti password secara berkala untuk menjaga keamanan akunmu. Kode OTP akan dikirim ke emailmu.'}
              </p>
              <Button variant="secondary" onClick={() => setShowChangePassword(true)} disabled={isGoogleUser} style={{ width: 'auto' }}>🔐 Ganti Password</Button>
            </Card>
          </div>
        )}
      </main>

      {showChangePassword && profile && (
        <ModalOverlay onClose={() => setShowChangePassword(false)}>
          <ChangePasswordModal email={profile.email} onClose={() => setShowChangePassword(false)}
            onSuccess={() => { setShowChangePassword(false); showToast('success', 'Password berhasil diganti!') }}
            requestOtp={requestChangePasswordOtp} verifyOtp={verifyChangePasswordOtp} changePassword={changePassword} />
        </ModalOverlay>
      )}

      {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={async () => { setShowLogoutConfirm(false); await logout() }} />}
    </div>
  )
}