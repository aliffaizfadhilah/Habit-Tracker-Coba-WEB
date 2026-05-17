import React, { useState, useEffect } from 'react'
import { Button, Input, Alert, Card } from '../../BusinessLogic/factories/ComponentFactory'
import { PageHeader, ModalOverlay } from '../../BusinessLogic/factories/SectionFactory'
import { useProfile } from '../../BusinessLogic/hooks/useProfile'
import { useAuth } from '../../BusinessLogic/hooks/useAuth'
import { Sidebar, LogoutModal, useSidebar } from './shared/sideBar'
import { Menu, KeyRound, MailOpen, Key, Check, Link2, Lock } from 'lucide-react'

interface ChangePasswordModalProps {
  email: string; onClose: () => void; onSuccess: () => void
  requestOtp:     () => Promise<{ success: boolean; message: string }>
  verifyOtp:      (otp: string) => Promise<{ success: boolean; message: string }>
  changePassword: (payload: { otp: string; password: string; password_confirmation: string }) => Promise<{ success: boolean; message: string }>
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  email, onClose, onSuccess, requestOtp, verifyOtp, changePassword,
}) => {
  const [step, setStep]                   = useState<'current_password' | 'otp' | 'new_password'>('current_password')
  const [otp, setOtp]                     = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [otpCode, setOtpCode]             = useState('')

  const TITLES    = { current_password: 'Verifikasi Identitas', otp: 'Masukkan Kode OTP', new_password: 'Buat Password Baru' }
  const SUBTITLES = { current_password: 'Kode OTP akan dikirim ke emailmu untuk verifikasi.', otp: 'Masukkan 6 digit kode yang dikirim ke emailmu.', new_password: 'Buat password baru yang kuat minimal 8 karakter.' }

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

  const steps = ['current_password', 'otp', 'new_password'] as const
  const stepIndex = steps.indexOf(step)

  return (
    <div className="bg-white rounded-xl p-8 shadow-card w-full max-w-[440px]">
      <div className="mb-6 text-center">
        <div className="mb-2.5 flex justify-center text-primary">
          {step === 'current_password' ? <Lock size={36} /> : step === 'otp' ? <MailOpen size={36} /> : <Key size={36} />}
        </div>
        <h3 className="font-heading text-xl font-bold text-ink mb-1.5">{TITLES[step]}</h3>
        <p className="text-[13px] text-muted leading-relaxed">{SUBTITLES[step]}</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: step === s ? 24 : 8,
              background: step === s ? '#16a34a' : stepIndex > i ? '#a7f3d0' : '#d1fae5',
            }}
          />
        ))}
      </div>

      {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

      {step === 'current_password' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted text-center">Kode OTP akan dikirim ke <strong className="text-ink">{email}</strong></p>
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleRequestOtp} loading={loading} style={{ flex: 2 }}>Kirim Kode OTP</Button>
          </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="flex flex-col gap-4">
          <Input
            label="Kode OTP (6 digit)"
            placeholder="000000"
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g,'').slice(0,6)); setError('') }}
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: 700 }}
          />
          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={onClose} disabled={loading} style={{ flex: 1 }}>Batal</Button>
            <Button variant="primary" onClick={handleVerifyOtp} loading={loading} style={{ flex: 2 }}>Verifikasi OTP</Button>
          </div>
          <button
            onClick={handleRequestOtp}
            disabled={loading}
            className="bg-transparent border-none cursor-pointer text-primary text-[13px] text-center disabled:opacity-50"
          >Kirim ulang OTP</button>
        </div>
      )}

      {step === 'new_password' && (
        <div className="flex flex-col gap-4">
          <Input label="Password Baru" type="password" placeholder="Minimal 8 karakter" value={password} onChange={e => { setPassword(e.target.value); setError('') }} />
          <Input label="Konfirmasi Password Baru" type="password" placeholder="Ulangi password baru" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} />
          <div className="flex gap-2.5">
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

  const displayUser = { full_name: user?.full_name ?? 'Pengguna', email: user?.email ?? '', username: user?.username ?? 'Pengguna' }
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
    <div className="flex min-h-screen bg-surface font-body">
      <Sidebar
        open={sidebarOpen} isMobile={isMobile} currentPageId="profile"
        displayUser={displayUser} onClose={() => setSidebarOpen(false)} onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className={`flex-1 overflow-y-auto min-w-0 ${isMobile ? 'p-5 px-4' : 'p-8 px-10'}`}>
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="w-9 h-9 border border-border rounded-[8px] bg-white cursor-pointer flex items-center justify-center shrink-0"
          ><Menu size={16} /></button>
          <PageHeader title="Profil Saya" subtitle="Kelola informasi akun dan keamanan kamu." />
        </div>

        {toast && <div className="mb-5"><Alert type={toast.type} message={toast.message} /></div>}
        {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-9 h-9 border-[3px] border-border border-t-primary rounded-full animate-spin-fast" />
          </div>
        )}

        {!loading && profile && (
          <div className="flex flex-col gap-6 max-w-[560px]">
            {/* Avatar */}
            <Card>
              <div className="flex items-center gap-5 flex-wrap">
                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-[#6b8fff] flex items-center justify-center text-[28px] text-white font-bold font-heading shrink-0">
                  {(profile.full_name || profile.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-heading text-xl font-bold text-ink">{profile.full_name || profile.username}</div>
                  <div className="text-[13px] text-muted mt-0.5">@{profile.username}</div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {profile.is_verified && (
                      <span className="text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-[#ecfdf5] text-[#065f46] inline-flex items-center gap-1">
                        <Check size={10} strokeWidth={3} /> Terverifikasi
                      </span>
                    )}
                    {isGoogleUser && (
                      <span className="text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-[#eff6ff] text-[#1d4ed8] inline-flex items-center gap-1">
                        <Link2 size={10} /> Google
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Edit Profil */}
            <Card>
              <h3 className="font-heading text-[17px] font-bold text-ink mb-5">Informasi Akun</h3>
              <div className="flex flex-col gap-4">
                <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={fullName} onChange={e => { setFullName(e.target.value); setProfileErrors(p => ({ ...p, full_name: '' })) }} error={profileErrors.full_name} />
                <Input label="Username" placeholder="Masukkan username" value={username} onChange={e => { setUsername(e.target.value); setProfileErrors(p => ({ ...p, username: '' })) }} error={profileErrors.username} />
                <Input label="Email" type="email" placeholder="Masukkan email" value={email} onChange={e => { setEmail(e.target.value); setProfileErrors(p => ({ ...p, email: '' })) }} error={profileErrors.email} />
                <Button variant="primary" onClick={handleSaveProfile} loading={saving}>Simpan Perubahan</Button>
              </div>
            </Card>

            {/* Keamanan */}
            <Card>
              <h3 className="font-heading text-[17px] font-bold text-ink mb-2">Keamanan Akun</h3>
              <p className="text-[13px] text-muted mb-5 leading-relaxed">
                {isGoogleUser ? 'Akun ini menggunakan Google login. Ganti password tidak tersedia.' : 'Ganti password secara berkala untuk menjaga keamanan akunmu. Kode OTP akan dikirim ke emailmu.'}
              </p>
              <Button
                variant="secondary"
                onClick={() => setShowChangePassword(true)}
                disabled={isGoogleUser}
                style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              ><KeyRound size={14} /> Ganti Password</Button>
            </Card>
          </div>
        )}
      </main>

      {showChangePassword && profile && (
        <ModalOverlay onClose={() => setShowChangePassword(false)}>
          <ChangePasswordModal
            email={profile.email}
            onClose={() => setShowChangePassword(false)}
            onSuccess={() => { setShowChangePassword(false); showToast('success', 'Password berhasil diganti!') }}
            requestOtp={requestChangePasswordOtp}
            verifyOtp={verifyChangePasswordOtp}
            changePassword={changePassword}
          />
        </ModalOverlay>
      )}

      {showLogoutConfirm && (
        <LogoutModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={async () => { setShowLogoutConfirm(false); await logout() }}
        />
      )}
    </div>
  )
}
