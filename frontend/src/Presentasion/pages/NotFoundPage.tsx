import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../BusinessLogic/context/AuthContext'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate    = useNavigate()
  const { isLoggedIn } = useAuth()

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-5 font-body">
      <div className="text-center max-w-md w-full">

        {/* Ilustrasi angka 404 */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <span
            className="font-heading font-extrabold select-none"
            style={{ fontSize: 'clamp(96px, 20vw, 160px)', lineHeight: 1, color: '#e8f5e9', letterSpacing: '-4px' }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center shadow-float">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
        </div>

        <h1 className="font-heading text-2xl font-extrabold text-ink m-0 mb-3">
          Halaman tidak ditemukan
        </h1>
        <p className="text-muted text-[15px] font-body leading-relaxed m-0 mb-8">
          Sepertinya halaman yang kamu cari sudah pindah atau tidak pernah ada.
          Tidak apa-apa, yuk kembali ke jalur yang benar.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-white text-ink text-[14px] font-semibold cursor-pointer transition-all hover:border-primary hover:text-primary"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <button
            onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-[14px] font-semibold cursor-pointer transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(22,163,74,0.28)] border-0"
          >
            <Home size={16} />
            {isLoggedIn ? 'Ke Dashboard' : 'Ke Beranda'}
          </button>
        </div>

      </div>
    </div>
  )
}
