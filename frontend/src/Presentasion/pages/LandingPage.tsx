// ─── LandingPage.tsx ──────────────────────────────────────────────────────────
// Lokasi  : frontend/src/pages/LandingPage.tsx
// Theme   : Natural Growth — Forest Green (tokens.ts v2)
// Cookie  : Banner + Customize modal (Cookiebot-style)
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: '＋', title: 'Tambah & Kelola Habit', desc: 'Buat, edit, dan hapus habit dengan mudah. Atur periode dan target sesuai kebutuhanmu.' },
  { icon: '✓', title: 'Checklist Harian', desc: 'Centang habit setiap hari. Checklist otomatis terkunci setelah periode selesai.' },
  { icon: '🔥', title: 'Streak & Progress', desc: 'Pantau current streak, longest streak, dan persentase progress habit kamu secara real-time.' },
  { icon: '📊', title: 'Laporan Final', desc: 'Dapatkan laporan lengkap setiap habit yang selesai — ringkasan pencapaian dalam satu halaman.' },
  { icon: '🔔', title: 'Reminder Otomatis', desc: 'Set waktu pengingat harian dan terima notifikasi tepat waktu agar tidak melewatkan satu haripun.' },
  { icon: '📸', title: 'Share & Arsip', desc: 'Generate snapshot visual progress dan upload ke wall pribadimu untuk berbagi pencapaian.' },
]

const stats = [
  { value: '14+', label: 'Fitur Lengkap' },
  { value: '100%', label: 'Gratis Selamanya' },
  { value: '∞', label: 'Habit Tanpa Batas' },
]

const faqs = [
  {
    q: 'Apakah HabitTracker benar-benar gratis?',
    a: 'Ya, HabitTracker 100% gratis tanpa biaya tersembunyi. Semua fitur dapat diakses tanpa perlu berlangganan atau memasukkan informasi kartu kredit.',
  },
  {
    q: 'Berapa banyak habit yang bisa saya buat?',
    a: 'Tidak ada batasan. Anda dapat membuat habit sebanyak yang Anda butuhkan, tanpa batas waktu maupun jumlah.',
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Keamanan data adalah prioritas kami. Data Anda disimpan secara terenkripsi dan tidak pernah dibagikan kepada pihak ketiga manapun.',
  },
  {
    q: 'Apakah tersedia untuk iOS dan Android?',
    a: 'Saat ini HabitTracker tersedia sebagai aplikasi web yang responsif di semua perangkat. Versi native iOS dan Android sedang dalam tahap pengembangan.',
  },
  {
    q: 'Bagaimana cara kerja reminder otomatis?',
    a: 'Anda dapat mengatur waktu pengingat harian untuk setiap habit. Sistem kami akan mengirimkan notifikasi tepat waktu agar Anda tidak melewatkan satu hari pun.',
  },
]

// ── Cookie Consent Types ──────────────────────────────────────────────────────
interface CookiePreferences {
  essential:   boolean
  analytics:   boolean
  marketing:   boolean
  preferences: boolean
}

interface CookieConsent {
  accepted:    boolean
  timestamp:   string
  preferences: CookiePreferences
}

const COOKIE_KEY = 'habittracker_cookie_consent'

const defaultPrefs: CookiePreferences = {
  essential:   true,   // always on
  analytics:   false,
  marketing:   false,
  preferences: false,
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef  = useRef<HTMLDivElement>(null)

  const [scrollY,         setScrollY]         = useState(0)
  const [visible,         setVisible]         = useState<Record<string, boolean>>({})
  const [openFaq,         setOpenFaq]         = useState<number | null>(null)
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false)

  // Cookie consent state
  const [showCookieBanner,   setShowCookieBanner]   = useState(false)
  const [showCookieModal,    setShowCookieModal]     = useState(false)
  const [cookiePrefs,        setCookiePrefs]         = useState<CookiePreferences>(defaultPrefs)

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Session tracking
    if (!sessionStorage.getItem('tracked')) {
      sessionStorage.setItem('tracked', '1')
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 'landing' }) }).catch(() => {})
    }

    // Cookie consent check
    const stored = localStorage.getItem(COOKIE_KEY)
    if (!stored) {
      // Delay sedikit agar tidak langsung muncul saat load
      const timer = setTimeout(() => setShowCookieBanner(true), 800)
      return () => clearTimeout(timer)
    } else {
      const parsed: CookieConsent = JSON.parse(stored)
      setCookiePrefs(parsed.preferences)
    }

    // Scroll listener
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true }))
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  // ── Cookie Handlers ────────────────────────────────────────────────────────
  const saveCookieConsent = (prefs: CookiePreferences) => {
    const consent: CookieConsent = {
      accepted:    true,
      timestamp:   new Date().toISOString(),
      preferences: prefs,
    }
    localStorage.setItem(COOKIE_KEY, JSON.stringify(consent))
    setCookiePrefs(prefs)
    setShowCookieBanner(false)
    setShowCookieModal(false)
  }

  const acceptAllCookies = () => {
    saveCookieConsent({ essential: true, analytics: true, marketing: true, preferences: true })
  }

  const rejectAllCookies = () => {
    saveCookieConsent({ essential: true, analytics: false, marketing: false, preferences: false })
  }

  const saveCustomCookies = () => {
    saveCookieConsent(cookiePrefs)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f7faf8', color: '#0f1f12', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp    { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float     { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse     { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.04); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp   { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

        .nav-link {
          color: #4b7a54;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          padding: 6px 4px;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .nav-link:hover { color: #16a34a; border-bottom-color: #16a34a; }

        .btn-primary {
          background: #16a34a;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.2px;
        }
        .btn-primary:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.28); }

        .btn-outline {
          background: transparent;
          color: #16a34a;
          border: 2px solid #16a34a;
          padding: 13px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover { background: #16a34a; color: #fff; }

        .btn-ghost {
          background: transparent;
          color: #4b7a54;
          border: 1.5px solid #d1fae5;
          padding: 13px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }

        .feature-card {
          background: #fff;
          border: 1px solid #d1fae5;
          border-radius: 16px;
          padding: 32px 28px;
          transition: all 0.3s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .feature-card:hover { border-color: #16a34a; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(22,163,74,0.12); }

        .stat-card {
          background: #fff;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          padding: 28px 24px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .mockup-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          padding: 18px;
        }
        .checkmark { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
        .check-done { background: #16a34a; color: white; }
        .check-todo { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
        .progress-bar { height: 5px; background: rgba(255,255,255,0.15); border-radius: 100px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #16a34a, #6ee7b7); }
        .streak-badge { background: linear-gradient(135deg, #ff6b35, #f7c59f); border-radius: 10px; padding: 3px 9px; font-size: 12px; font-weight: 600; color: #1a0a00; display: inline-flex; align-items: center; gap: 4px; }

        .faq-item { border-bottom: 1px solid #d1fae5; }
        .faq-btn { width: 100%; background: none; border: none; text-align: left; padding: 20px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; color: #0f1f12; }
        .faq-answer { padding: 0 0 20px; font-size: 15px; color: #4b7a54; line-height: 1.75; animation: slideDown 0.2s ease; }

        .team-card { background: #fff; border: 1px solid #d1fae5; border-radius: 16px; padding: 32px 24px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .avatar { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; color: #fff; margin: 0 auto 16px; }

        .section-label { display: inline-block; background: #dcfce7; color: #16a34a; border-radius: 6px; padding: 6px 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 16px; text-transform: uppercase; }

        .service-card { background: #fff; border: 1px solid #d1fae5; border-radius: 16px; padding: 36px 28px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .service-card:hover { border-color: #16a34a; box-shadow: 0 12px 40px rgba(22,163,74,0.12); }
        .service-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }

        /* ── Cookie Toggle Switch ── */
        .cookie-toggle {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .cookie-toggle input { opacity: 0; width: 0; height: 0; }
        .cookie-toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #d1d5db;
          border-radius: 9999px;
          transition: background 0.2s;
        }
        .cookie-toggle-slider::before {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          left: 3px;
          top: 3px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .cookie-toggle input:checked + .cookie-toggle-slider { background: #16a34a; }
        .cookie-toggle input:checked + .cookie-toggle-slider::before { transform: translateX(20px); }
        .cookie-toggle input:disabled + .cookie-toggle-slider { cursor: not-allowed; opacity: 0.6; }

        /* ── Cookie Modal Overlay ── */
        .cookie-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11,26,14,0.55);
          backdrop-filter: blur(4px);
          z-index: 350;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .cookie-modal {
          background: #fff;
          border-radius: 20px;
          max-width: 540px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 32px 80px rgba(0,0,0,0.25);
          animation: fadeInScale 0.25s ease;
        }
        .cookie-category {
          border: 1px solid #d1fae5;
          border-radius: 12px;
          padding: 16px 20px;
          transition: border-color 0.2s;
        }
        .cookie-category:hover { border-color: #a7f3d0; }

        /* ── Cookie Banner ── */
        .cookie-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 900px;
          background: #fff;
          border: 1px solid #d1fae5;
          border-radius: 16px;
          padding: 20px 28px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          z-index: 300;
          animation: slideUp 0.35s ease;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hero-grid { flex-direction: column !important; }
          .hero-text { text-align: center !important; }
          .hero-mockup { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .footer-grid { flex-direction: column !important; gap: 32px !important; }
          .cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .cookie-banner { flex-direction: column !important; align-items: stretch !important; bottom: 16px; padding: 20px; }
          .cookie-banner-btns { flex-direction: column !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrollY > 40 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #d1fae5',
        transition: 'all 0.3s',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
        boxShadow: scrollY > 40 ? '0 2px 20px rgba(0,0,0,0.07)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#16a34a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#0f1f12' }}>HabitTracker</span>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <button onClick={() => scrollTo('home')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Home</button>
          <button onClick={() => scrollTo('about')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>About</button>
          <button onClick={() => scrollTo('services')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Services</button>
          <button onClick={() => scrollTo('features')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Fitur</button>
          <button onClick={() => scrollTo('faq')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>FAQ</button>
        </div>

        {/* CTA Buttons */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-ghost" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => navigate('/login')}>Masuk</button>
          <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => navigate('/register')}>Mulai Gratis</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}
          onClick={() => setMobileMenuOpen(v => !v)}
        >
          {[0,1,2].map(i => <div key={i} style={{ width: 24, height: 2, background: '#0f1f12', borderRadius: 2 }} />)}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, zIndex: 190,
          background: '#fff', borderBottom: '1px solid #d1fae5',
          padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          animation: 'slideDown 0.2s ease'
        }}>
          {['home','about','services','features','faq'].map(id => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 16, fontWeight: 600, color: '#0f1f12', textTransform: 'capitalize', padding: '4px 0' }}>
              {id === 'features' ? 'Fitur' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/login')}>Masuk</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/register')}>Daftar</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="home" ref={heroRef} style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #0f1f12 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 68,
      }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(22,163,74,0.22) 0%, transparent 65%)', animation: 'pulse 8s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 65%)', animation: 'pulse 10s ease infinite 3s', pointerEvents: 'none' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', width: '100%', display: 'flex', alignItems: 'center', gap: 64 }} className="hero-grid">
          {/* Text */}
          <div style={{ flex: 1, animation: 'fadeIn 0.9s ease' }} className="hero-text">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 6, padding: '7px 16px', marginBottom: 28, fontSize: 13, color: '#6ee7b7', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              ✦ Platform Manajemen Habit Terpercaya
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 24px', color: '#fff' }}>
              Bangun Kebiasaan<br />
              <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #6ee7b7, #a7f3d0)', backgroundClip: 'text' }}>
                Produktif
              </span>{' '}
              <span style={{ color: '#fff' }}>Setiap Hari</span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', marginBottom: 16, lineHeight: 1.75, maxWidth: 520 }}>
              HabitTracker adalah platform enterprise-grade untuk individu dan tim yang ingin membangun, memantau, dan mempertahankan kebiasaan positif secara konsisten.
            </p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 44, lineHeight: 1.7, maxWidth: 480 }}>
              Didukung teknologi analitik real-time, sistem reminder cerdas, dan laporan komprehensif yang membantu Anda mencapai tujuan.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }} className="cta-btns">
              <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }} onClick={() => navigate('/register')}>
                Mulai Gratis →
              </button>
              <button className="btn-outline" style={{ fontSize: 16, padding: '15px 40px', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} onClick={() => scrollTo('features')}>
                Lihat Fitur
              </button>
            </div>

            <div style={{ marginTop: 48, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[{ v: '4.9★', l: 'Rating Pengguna' }, { v: '100%', l: 'Gratis' }].map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#fff' }}>{s.v}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="hero-mockup" style={{ flex: '0 0 420px', animation: 'float 5s ease infinite' }}>
            <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 16 }}>Habit Hari Ini</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Senin, 28 Apr</span>
              </div>
              {[
                { name: 'Meditasi 10 menit', done: true, streak: 14, prog: 100 },
                { name: 'Baca buku 30 menit', done: true, streak: 7, prog: 100 },
                { name: 'Olahraga pagi', done: false, streak: 5, prog: 65 },
                { name: 'Minum 8 gelas air', done: false, streak: 3, prog: 38 },
              ].map((h, i) => (
                <div key={i} className="mockup-card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`checkmark ${h.done ? 'check-done' : 'check-todo'}`}>{h.done ? '✓' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: h.done ? 'rgba(255,255,255,0.45)' : '#fff', textDecoration: h.done ? 'line-through' : 'none' }}>{h.name}</span>
                      <span className="streak-badge">🔥 {h.streak}</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${h.prog}%` }} /></div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#6ee7b7', fontFamily: 'Syne, sans-serif' }}>2/4</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Selesai Hari Ini</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#ff6b35', fontFamily: 'Syne, sans-serif' }}>14🔥</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Streak Terbaik</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', borderBottom: '1px solid #d1fae5', padding: '40px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#86a98d', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── ABOUT ──────────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ padding: '100px 40px', background: '#f7faf8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              id="about-text"
              data-observe
              style={{
                maxWidth: 700,
                textAlign: 'center',
                opacity: visible['about-text'] ? 1 : 0,
                transform: visible['about-text'] ? 'none' : 'translateY(32px)',
                transition: 'all 0.7s ease',
              }}
            >
              <span className="section-label">Tentang Kami</span>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 20px', letterSpacing: -1, lineHeight: 1.15 }}>
                Misi kami adalah membantu setiap orang tumbuh melalui kebiasaan
              </h2>
              <p style={{ fontSize: 16, color: '#4b7a54', lineHeight: 1.8, marginBottom: 20 }}>
                HabitTracker didirikan pada 2023 dengan visi sederhana: membuat pembentukan kebiasaan positif menjadi terstruktur, terukur, dan menyenangkan bagi semua orang.
              </p>
              <p style={{ fontSize: 16, color: '#4b7a54', lineHeight: 1.8, marginBottom: 32 }}>
                Kami percaya bahwa perubahan besar dimulai dari langkah kecil yang konsisten. Platform kami dirancang untuk membantu Anda tetap di jalur yang benar, hari demi hari, dengan data dan insight yang mudah dipahami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── SERVICES ───────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="services" style={{ padding: '100px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">Layanan Kami</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Solusi lengkap untuk setiap kebutuhan
            </h2>
            <p style={{ color: '#4b7a54', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Dari individu hingga tim kecil, HabitTracker hadir dengan layanan yang dapat disesuaikan dengan kebutuhan Anda.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24 }} className="services-grid">
            {[
              {
                icon: '🏢', color: '#f0fdf4', title: 'Personal Plan',
                desc: 'Cocok untuk individu yang ingin membangun kebiasaan pribadi. Gratis selamanya dengan akses ke semua fitur dasar.',
                bullets: ['Unlimited habit tracking', 'Daily reminders', 'Progress analytics', 'Share & export'],
              },
            ].map((s, i) => (
              <div
                key={i}
                id={`svc-${i}`}
                data-observe
                className="service-card"
                style={{
                  opacity: visible[`svc-${i}`] ? 1 : 0,
                  transform: visible[`svc-${i}`] ? 'none' : 'translateY(24px)',
                  transition: `all 0.5s ease ${i * 0.1}s`,
                  position: 'relative',
                }}
              >
                <div className="service-icon" style={{ background: s.color }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#0f1f12' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#4b7a54', lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {s.bullets.map((b, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#1e3a22' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 40px', background: '#f7faf8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">Fitur Platform</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Semua yang kamu butuhkan
            </h2>
            <p style={{ color: '#4b7a54', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              14 fitur lengkap yang dirancang untuk mendukung perjalanan habit kamu dari awal hingga pencapaian tertinggi.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }} className="features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                id={`feat-${i}`}
                data-observe
                className="feature-card"
                style={{
                  opacity: visible[`feat-${i}`] ? 1 : 0,
                  transform: visible[`feat-${i}`] ? 'none' : 'translateY(24px)',
                  transition: `all 0.5s ease ${i * 0.08}s`,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, margin: '0 0 10px', letterSpacing: -0.3, color: '#0f1f12' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#4b7a54', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature highlight banner */}
          <div style={{ marginTop: 48, background: 'linear-gradient(135deg, #14532d, #16a34a)', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Siap memulai perjalananmu?</h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Daftar sekarang dan akses semua fitur secara gratis.</p>
            </div>
            <button className="btn-primary" style={{ background: '#fff', color: '#16a34a', fontSize: 15, padding: '14px 32px', flexShrink: 0 }} onClick={() => navigate('/register')}>
              Mulai Gratis →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section id="faq" style={{ padding: '100px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="section-label">FAQ</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Pertanyaan yang sering diajukan
            </h2>
            <p style={{ color: '#4b7a54', fontSize: 16, lineHeight: 1.7 }}>Tidak menemukan jawaban? Hubungi kami melalui email di <a href="mailto:hello@habittracker.id" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>hello@habittracker.id</a></p>
          </div>

          <div
            id="faq-list"
            data-observe
            style={{
              opacity: visible['faq-list'] ? 1 : 0,
              transform: visible['faq-list'] ? 'none' : 'translateY(24px)',
              transition: 'all 0.6s ease',
            }}
          >
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span style={{ fontSize: 20, color: '#16a34a', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 12 }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #14532d 0%, #0f1f12 100%)', textAlign: 'center' }}>
        <div
          id="cta"
          data-observe
          style={{
            maxWidth: 640, margin: '0 auto',
            opacity: visible['cta'] ? 1 : 0,
            transform: visible['cta'] ? 'none' : 'translateY(32px)',
            transition: 'all 0.7s ease',
          }}
        >
          <div style={{ width: 64, height: 64, background: 'rgba(22,163,74,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>✦</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1, color: '#fff' }}>
            Mulai sekarang, gratis.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 17, marginBottom: 44, lineHeight: 1.7 }}>
            Ayo bergabung dengan pengguna lainnya yang sudah membangun kebiasaan terbaik mereka bersama HabitTracker.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }} className="cta-btns">
            <button className="btn-primary" style={{ fontSize: 16, padding: '16px 44px' }} onClick={() => navigate('/register')}>
              Daftar Sekarang →
            </button>
            <button className="btn-outline" style={{ fontSize: 16, padding: '15px 44px', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }} onClick={() => navigate('/login')}>
              Masuk
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0b1a0e', padding: '56px 40px 32px', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 40 }} className="footer-grid">
            {/* Brand */}
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: '#16a34a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: '#fff' }}>HabitTracker</span>
              </div>
              <p style={{ lineHeight: 1.75, margin: '0 0 20px' }}>Platform manajemen kebiasaan yang membantu Anda tumbuh setiap hari, secara konsisten dan terukur.</p>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>📍 Surabaya, Indonesia</div>
            </div>

            {/* Links */}
            {[
              { title: 'Produk', links: ['Fitur', 'Roadmap', 'Changelog', 'Status'] },
              { title: 'Perusahaan', links: ['Tentang Kami', 'Tim', 'Blog', 'Karir'] },
              { title: 'Dukungan', links: ['Dokumentasi', 'FAQ', 'Hubungi Kami', 'Komunitas'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 16, letterSpacing: 0.3 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span>© 2026 HabitTracker. Hak cipta dilindungi.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Cookie'].map(l => (
                <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6ee7b7')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── COOKIE CONSENT BANNER ──────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showCookieBanner && !showCookieModal && (
        <div className="cookie-banner">
          {/* Icon + Text */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🍪</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0f1f12', marginBottom: 4 }}>
                Kami menggunakan cookie
              </div>
              <div style={{ fontSize: 13, color: '#4b7a54', lineHeight: 1.6 }}>
                Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, dan mempersonalisasi konten.{' '}
                <a href="#" style={{ color: '#16a34a', textDecoration: 'underline', fontWeight: 500 }}>Pelajari selengkapnya</a>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="cookie-banner-btns" style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => rejectAllCookies()}
              style={{ background: 'transparent', border: '1.5px solid #d1fae5', color: '#4b7a54', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.color = '#4b7a54' }}
            >
              Tolak
            </button>
            <button
              onClick={() => { setShowCookieModal(true) }}
              style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', color: '#16a34a', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4' }}
            >
              ⚙ Kustomisasi
            </button>
            <button
              onClick={() => acceptAllCookies()}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: 13, whiteSpace: 'nowrap' }}
            >
              Terima Semua
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── COOKIE CUSTOMIZE MODAL ─────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showCookieModal && (
        <div className="cookie-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCookieModal(false) }}>
          <div className="cookie-modal">
            {/* Modal Header */}
            <div style={{ padding: '28px 28px 0', borderBottom: '1px solid #d1fae5', paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍪</div>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: '#0f1f12' }}>Pengaturan Cookie</div>
                    <div style={{ fontSize: 12, color: '#86a98d', marginTop: 2 }}>Kontrol preferensi privasi Anda</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCookieModal(false)}
                  style={{ width: 32, height: 32, border: '1px solid #d1fae5', borderRadius: 8, background: '#f7faf8', cursor: 'pointer', fontSize: 16, color: '#4b7a54', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.color = '#16a34a' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f7faf8'; e.currentTarget.style.color = '#4b7a54' }}
                >✕</button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#4b7a54', lineHeight: 1.65, margin: '0 0 8px' }}>
                Pilih jenis cookie yang Anda izinkan. Cookie esensial selalu aktif karena diperlukan agar website berfungsi dengan benar. Anda dapat mengubah pengaturan ini kapan saja melalui halaman Kebijakan Cookie kami.
              </p>

              {/* Category: Essential */}
              <div className="cookie-category">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🔒</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f1f12' }}>Cookie Esensial</div>
                      <div style={{ fontSize: 12, color: '#86a98d', marginTop: 1 }}>Selalu aktif — wajib untuk fungsi dasar</div>
                    </div>
                  </div>
                  <label className="cookie-toggle">
                    <input type="checkbox" checked={true} disabled onChange={() => {}} />
                    <span className="cookie-toggle-slider" />
                  </label>
                </div>
                <p style={{ fontSize: 12, color: '#86a98d', margin: 0, lineHeight: 1.6 }}>
                  Cookie ini diperlukan untuk login, keamanan sesi, dan navigasi halaman. Tidak dapat dinonaktifkan.
                </p>
              </div>

              {/* Category: Analytics */}
              <div className="cookie-category">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📊</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f1f12' }}>Cookie Analitik</div>
                      <div style={{ fontSize: 12, color: '#86a98d', marginTop: 1 }}>Membantu kami memahami penggunaan</div>
                    </div>
                  </div>
                  <label className="cookie-toggle">
                    <input type="checkbox" checked={cookiePrefs.analytics} onChange={e => setCookiePrefs(p => ({ ...p, analytics: e.target.checked }))} />
                    <span className="cookie-toggle-slider" />
                  </label>
                </div>
                <p style={{ fontSize: 12, color: '#86a98d', margin: 0, lineHeight: 1.6 }}>
                  Mengumpulkan data anonim tentang cara Anda menggunakan platform kami untuk membantu meningkatkan layanan. Contoh: Google Analytics.
                </p>
              </div>

              {/* Category: Marketing */}
              <div className="cookie-category">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>📣</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f1f12' }}>Cookie Pemasaran</div>
                      <div style={{ fontSize: 12, color: '#86a98d', marginTop: 1 }}>Untuk konten dan iklan yang relevan</div>
                    </div>
                  </div>
                  <label className="cookie-toggle">
                    <input type="checkbox" checked={cookiePrefs.marketing} onChange={e => setCookiePrefs(p => ({ ...p, marketing: e.target.checked }))} />
                    <span className="cookie-toggle-slider" />
                  </label>
                </div>
                <p style={{ fontSize: 12, color: '#86a98d', margin: 0, lineHeight: 1.6 }}>
                  Digunakan untuk menampilkan konten dan iklan yang dipersonalisasi berdasarkan minat Anda, baik di platform kami maupun di situs lain.
                </p>
              </div>

              {/* Category: Preferences */}
              <div className="cookie-category">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>⚙️</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f1f12' }}>Cookie Preferensi</div>
                      <div style={{ fontSize: 12, color: '#86a98d', marginTop: 1 }}>Menyimpan pilihan tampilan Anda</div>
                    </div>
                  </div>
                  <label className="cookie-toggle">
                    <input type="checkbox" checked={cookiePrefs.preferences} onChange={e => setCookiePrefs(p => ({ ...p, preferences: e.target.checked }))} />
                    <span className="cookie-toggle-slider" />
                  </label>
                </div>
                <p style={{ fontSize: 12, color: '#86a98d', margin: 0, lineHeight: 1.6 }}>
                  Menyimpan pengaturan seperti bahasa, tema, dan preferensi UI lainnya agar pengalaman Anda konsisten di setiap kunjungan.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #d1fae5', display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button
                onClick={() => rejectAllCookies()}
                style={{ background: 'transparent', border: '1.5px solid #d1fae5', color: '#4b7a54', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.color = '#16a34a' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1fae5'; e.currentTarget.style.color = '#4b7a54' }}
              >
                Tolak Semua
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => saveCustomCookies()}
                  style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', color: '#16a34a', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4' }}
                >
                  Simpan Pilihan
                </button>
                <button
                  onClick={() => acceptAllCookies()}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  Terima Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}