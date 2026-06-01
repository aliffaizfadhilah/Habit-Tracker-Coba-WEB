import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, BarChart2, Bell, Camera, Building2, Cookie, Lock, MapPin, Megaphone, Settings, X, Plus, Check } from 'lucide-react'

const features = [
  { icon: <Plus size={32} color="#16a34a" />,      title: 'Tambah & Kelola Habit',  desc: 'Buat, edit, dan hapus habit dengan mudah. Atur periode dan target sesuai kebutuhanmu.' },
  { icon: <Check size={32} color="#16a34a" />,     title: 'Checklist Harian',        desc: 'Centang habit setiap hari. Checklist otomatis terkunci setelah periode selesai.' },
  { icon: <Flame size={32} color="#f97316" />,     title: 'Streak & Progress',       desc: 'Pantau current streak, longest streak, dan persentase progress habit kamu secara real-time.' },
  { icon: <BarChart2 size={32} color="#16a34a" />, title: 'Laporan Final',           desc: 'Dapatkan laporan lengkap setiap habit yang selesai — ringkasan pencapaian dalam satu halaman.' },
  { icon: <Bell size={32} color="#16a34a" />,      title: 'Reminder Otomatis',       desc: 'Set waktu pengingat harian dan terima notifikasi tepat waktu agar tidak melewatkan satu haripun.' },
  { icon: <Camera size={32} color="#16a34a" />,    title: 'Share & Arsip',           desc: 'Generate snapshot visual progress dan upload ke wall pribadimu untuk berbagi pencapaian.' },
]

const stats = [
  { value: '14+',  label: 'Fitur Lengkap' },
  { value: '100%', label: 'Gratis Selamanya' },
  { value: '∞',    label: 'Habit Tanpa Batas' },
]

const faqs = [
  { q: 'Apakah HabitTracker benar-benar gratis?',   a: 'Ya, HabitTracker 100% gratis tanpa biaya tersembunyi. Semua fitur dapat diakses tanpa perlu berlangganan atau memasukkan informasi kartu kredit.' },
  { q: 'Berapa banyak habit yang bisa saya buat?',   a: 'Tidak ada batasan. Anda dapat membuat habit sebanyak yang Anda butuhkan, tanpa batas waktu maupun jumlah.' },
  { q: 'Apakah data saya aman?',                     a: 'Keamanan data adalah prioritas kami. Data Anda disimpan secara terenkripsi dan tidak pernah dibagikan kepada pihak ketiga manapun.' },
  { q: 'Apakah tersedia untuk iOS dan Android?',     a: 'Saat ini HabitTracker tersedia sebagai aplikasi web yang responsif di semua perangkat. Versi native iOS dan Android sedang dalam tahap pengembangan.' },
  { q: 'Bagaimana cara kerja reminder otomatis?',    a: 'Anda dapat mengatur waktu pengingat harian untuk setiap habit. Sistem kami akan mengirimkan notifikasi tepat waktu agar Anda tidak melewatkan satu hari pun.' },
]

interface CookiePreferences { essential: boolean; analytics: boolean; marketing: boolean; preferences: boolean }
interface CookieConsent     { accepted: boolean; timestamp: string; preferences: CookiePreferences }

const COOKIE_KEY          = 'habittracker_cookie_consent'
const SESSION_KEY         = 'habittracker_session_id'
const TRACKED_KEY         = 'habittracker_tracked'
const SESSION_ANSWERED_KEY = 'habittracker_consent_session'
const defaultPrefs: CookiePreferences = { essential: true, analytics: false, marketing: false, preferences: false }

function getOrCreateSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function sendTrackingHit(): void {
  if (sessionStorage.getItem(TRACKED_KEY)) return
  sessionStorage.setItem(TRACKED_KEY, '1')
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: 'landing', session_id: getOrCreateSessionId() }),
  }).catch(() => {})
}

const btnPrimary   = 'bg-primary text-white border-0 rounded-sm font-semibold cursor-pointer transition-all duration-200 font-body tracking-wide hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(22,163,74,0.28)]'
const btnGhost     = 'bg-transparent text-muted border border-border rounded-sm font-medium cursor-pointer transition-all duration-200 font-body hover:border-primary hover:text-primary hover:bg-primary-lighter'
const navLink      = 'text-muted text-[15px] font-medium pb-1.5 px-1 border-b-2 border-transparent transition-all duration-200 hover:text-primary hover:border-primary bg-transparent border-0 cursor-pointer font-body'
const sectionLabel = 'inline-block bg-primary-light text-primary rounded px-3.5 py-1.5 text-[13px] font-semibold tracking-[0.5px] mb-4 uppercase'

function HeroHabitRow({ name, done, streak, prog }: { name: string; done: boolean; streak: number; prog: number }) {
  return (
    <div className="rounded-[14px] p-[18px] mb-2.5 flex items-center gap-3 bg-white/[0.08] border border-white/[0.15]">
      <div className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-primary text-white border-0' : 'bg-white/10 text-transparent border border-white/20'}`}>
        {done ? '✓' : ''}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className={`text-[13px] font-medium ${done ? 'text-white/45 line-through' : 'text-white'}`}>{name}</span>
          <span className="rounded-[10px] py-0.5 px-2.5 text-[12px] font-semibold inline-flex items-center gap-1" style={{ background: 'linear-gradient(135deg, #ff6b35, #f7c59f)', color: '#1a0a00' }}>
            <Flame size={12} /> {streak}
          </span>
        </div>
        <div className="h-[5px] rounded-full overflow-hidden bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent-light" style={{ width: `${prog}%` }} />
        </div>
      </div>
    </div>
  )
}

function CookieCategoryItem({ icon, title, sub, desc, disabled, checked, onChange }: {
  icon: ReactNode
  title: string
  sub: string
  desc: string
  disabled?: boolean
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="border border-border rounded-md px-5 py-4 transition-colors duration-200 hover:border-border-mid">
      <div className="flex items-center gap-2.5 mb-2">
        {icon}
        <span className="flex-1 flex flex-col">
          <span className="font-semibold text-sm text-ink">{title}</span>
          <span className="text-xs text-subtle mt-px">{sub}</span>
        </span>
        <label className="cookie-toggle ml-auto flex-shrink-0">
          <input
            type="checkbox"
            checked={disabled ? true : checked}
            disabled={disabled}
            onChange={disabled ? () => {} : e => onChange(e.target.checked)}
          />
          <span className="cookie-toggle-slider" />
        </label>
      </div>
      <p className="text-xs text-subtle m-0 leading-[1.6]">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef  = useRef<HTMLDivElement>(null)

  const [scrollY,        setScrollY]        = useState(0)
  const [visible,        setVisible]        = useState<Record<string, boolean>>({})
  const [openFaq,        setOpenFaq]        = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCookieBanner, setShowCookieBanner] = useState(false)
  const [showCookieModal,  setShowCookieModal]  = useState(false)
  const [cookiePrefs,      setCookiePrefs]      = useState<CookiePreferences>(defaultPrefs)

  useEffect(() => {
    const stored        = localStorage.getItem(COOKIE_KEY)
    const sessionAnswered = sessionStorage.getItem(SESSION_ANSWERED_KEY)

    if (stored) {
      const consent = JSON.parse(stored) as CookieConsent
      setCookiePrefs(consent.preferences)
      if (consent.preferences.analytics) sendTrackingHit()
    }

    if (!sessionAnswered) {
      const timer = setTimeout(() => setShowCookieBanner(true), 800)
      const onScroll = () => setScrollY(window.scrollY)
      window.addEventListener('scroll', onScroll)
      return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
    }

    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.id]: true })) }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false) }

  const saveCookieConsent = (prefs: CookiePreferences, declined = false) => {
    const consent: CookieConsent = { accepted: !declined, timestamp: new Date().toISOString(), preferences: prefs }
    localStorage.setItem(COOKIE_KEY, JSON.stringify(consent))
    sessionStorage.setItem(SESSION_ANSWERED_KEY, '1')
    setCookiePrefs(prefs)
    setShowCookieBanner(false)
    setShowCookieModal(false)
    if (prefs.analytics) sendTrackingHit()
  }
  const acceptAllCookies  = () => saveCookieConsent({ essential: true, analytics: true, marketing: true, preferences: true })
  const rejectAllCookies  = () => saveCookieConsent({ essential: true, analytics: false, marketing: false, preferences: false }, true)
  const saveCustomCookies = () => saveCookieConsent(cookiePrefs)

  return (
    <div className="font-body bg-surface text-ink min-h-screen overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-[200] backdrop-blur-[16px] border-b border-border transition-all duration-300 px-10 flex items-center justify-between h-[68px]"
        style={{
          background: scrollY > 40 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.93)',
          boxShadow:  scrollY > 40 ? '0 2px 20px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-primary rounded-sm flex items-center justify-center text-base text-white">✦</div>
          <span className="font-heading font-extrabold text-[18px] text-ink">HabitTracker</span>
        </div>

        <div className="hidden md:flex items-center gap-9">
          {(['home','about','services','features','faq'] as const).map(id => (
            <button key={id} onClick={() => scrollTo(id)} className={navLink}>
              {id === 'features' ? 'Fitur' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        <div className="hidden md:flex gap-3 items-center">
          <button className={`${btnGhost} py-2.5 px-5 text-sm`} onClick={() => navigate('/login')}>Masuk</button>
          <button className={`${btnPrimary} py-2.5 px-5 text-sm`} onClick={() => navigate('/register')}>Mulai Gratis</button>
        </div>

        <button
          className="flex md:hidden bg-transparent border-0 cursor-pointer flex-col gap-[5px] p-1"
          onClick={() => setMobileMenuOpen(v => !v)}
        >
          {[0,1,2].map(i => <div key={i} className="w-6 h-0.5 bg-ink rounded-sm" />)}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-[68px] left-0 right-0 z-[190] bg-white border-b border-border py-6 px-8 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] animate-slide-down">
          {(['home','about','services','features','faq'] as const).map(id => (
            <button key={id} onClick={() => scrollTo(id)} className="bg-transparent border-0 cursor-pointer text-left text-base font-semibold text-ink capitalize py-1">
              {id === 'features' ? 'Fitur' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <div className="flex gap-3 pt-2">
            <button className={`${btnGhost} py-3.5 px-7 flex-1`} onClick={() => navigate('/login')}>Masuk</button>
            <button className={`${btnPrimary} py-3.5 px-7 flex-1`} onClick={() => navigate('/register')}>Daftar</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section
        id="home"
        ref={heroRef}
        className="min-h-screen flex items-center relative overflow-hidden pt-[68px]"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #0f1f12 100%)' }}
      >
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.22) 0%, transparent 65%)', animation: 'landingPulse 8s ease infinite' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] pointer-events-none rounded-full" style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.12) 0%, transparent 65%)', animation: 'landingPulse 10s ease infinite 3s' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-[1200px] mx-auto py-20 px-10 w-full flex items-center gap-16 flex-col md:flex-row">
          {/* Text */}
          <div className="flex-1 animate-fade-in text-center md:text-left">
            <div className="inline-flex items-center gap-2 border rounded px-4 py-[7px] mb-7 text-[13px] font-semibold tracking-[0.5px] uppercase bg-primary/20 border-primary/40 text-accent-light">
              ✦ Platform Manajemen Habit Terpercaya
            </div>

            <h1 className="font-heading font-extrabold leading-[1.08] tracking-[-2px] mb-6 text-white" style={{ fontSize: 'clamp(40px, 6vw, 76px)' }}>
              Bangun Kebiasaan<br />
              <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #6ee7b7, #a7f3d0)', backgroundClip: 'text' }}>Produktif</span>{' '}
              <span className="text-white">Setiap Hari</span>
            </h1>

            <p className="text-[18px] mb-4 leading-[1.75] max-w-[520px] text-white/65">
              HabitTracker adalah platform enterprise-grade untuk individu dan tim yang ingin membangun, memantau, dan mempertahankan kebiasaan positif secara konsisten.
            </p>
            <p className="text-[15px] mb-11 leading-[1.7] max-w-[480px] text-white/40">
              Didukung teknologi analitik real-time, sistem reminder cerdas, dan laporan komprehensif yang membantu Anda mencapai tujuan.
            </p>

            <div className="flex gap-3.5 flex-wrap flex-col sm:flex-row">
              <button className={`${btnPrimary} text-base py-4 px-10`} onClick={() => navigate('/register')}>Mulai Gratis →</button>
              <button
                className="bg-transparent border-2 border-white/30 rounded-sm font-semibold cursor-pointer transition-all duration-200 font-body text-base py-[15px] px-10 text-white hover:bg-white/10"
                onClick={() => scrollTo('features')}
              >Lihat Fitur</button>
            </div>

            <div className="mt-12 flex gap-8 flex-wrap">
              {[{ v: '4.9★', l: 'Rating Pengguna' }, { v: '100%', l: 'Gratis' }].map(s => (
                <div key={s.l}>
                  <div className="font-heading text-[26px] font-extrabold text-white">{s.v}</div>
                  <div className="text-[13px] mt-0.5 text-white/45">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="hidden md:block flex-[0_0_420px] animate-float">
            <div className="rounded-[24px] p-7 bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between mb-5">
                <span className="font-heading font-bold text-white text-base">Habit Hari Ini</span>
                <span className="text-[13px] text-white/40">Senin, 28 Apr</span>
              </div>
              {[
                { name: 'Meditasi 10 menit',  done: true,  streak: 14, prog: 100 },
                { name: 'Baca buku 30 menit', done: true,  streak: 7,  prog: 100 },
                { name: 'Olahraga pagi',      done: false, streak: 5,  prog: 65  },
                { name: 'Minum 8 gelas air',  done: false, streak: 3,  prog: 38  },
              ].map((h, i) => (
                <HeroHabitRow key={i} {...h} />
              ))}
              <div className="mt-5 flex gap-3">
                <div className="flex-1 rounded-[10px] py-[14px] px-3 text-center bg-white/5">
                  <div className="text-[22px] font-bold font-heading text-accent-light">2/4</div>
                  <div className="text-[11px] mt-[3px] text-white/40">Selesai Hari Ini</div>
                </div>
                <div className="flex-1 rounded-[10px] py-[14px] px-3 text-center bg-white/5">
                  <div className="text-[22px] font-bold font-heading flex items-center justify-center gap-1 text-[#ff6b35]">14 <Flame size={18} color="#ff6b35" /></div>
                  <div className="text-[11px] mt-[3px] text-white/40">Streak Terbaik</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-b border-border py-10 px-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-border rounded-md p-7 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="font-heading text-[36px] font-extrabold text-primary leading-none">{s.value}</div>
              <div className="text-sm text-subtle mt-2 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-[100px] px-10 bg-surface">
        <div className="max-w-[1100px] mx-auto flex justify-center">
          <div
            id="about-text"
            data-observe
            className="max-w-[700px] text-center transition-all duration-700 ease-out"
            style={{ opacity: visible['about-text'] ? 1 : 0, transform: visible['about-text'] ? 'none' : 'translateY(32px)' }}
          >
            <span className={sectionLabel}>Tentang Kami</span>
            <h2 className="font-heading font-extrabold mb-5 tracking-[-1px] leading-[1.15]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Misi kami adalah membantu setiap orang tumbuh melalui kebiasaan
            </h2>
            <p className="text-base text-muted leading-[1.8] mb-5">
              HabitTracker didirikan pada 2023 dengan visi sederhana: membuat pembentukan kebiasaan positif menjadi terstruktur, terukur, dan menyenangkan bagi semua orang.
            </p>
            <p className="text-base text-muted leading-[1.8]">
              Kami percaya bahwa perubahan besar dimulai dari langkah kecil yang konsisten. Platform kami dirancang untuk membantu Anda tetap di jalur yang benar, hari demi hari, dengan data dan insight yang mudah dipahami.
            </p>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-[100px] px-10 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <span className={sectionLabel}>Layanan Kami</span>
            <h2 className="font-heading font-extrabold mb-4 tracking-[-1px]" style={{ fontSize: 'clamp(28px, 4vw, 46px)' }}>
              Solusi lengkap untuk setiap kebutuhan
            </h2>
            <p className="text-muted text-[17px] max-w-[520px] mx-auto leading-[1.7]">
              Dari individu hingga tim kecil, HabitTracker hadir dengan layanan yang dapat disesuaikan dengan kebutuhan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {[{
              icon: <Building2 size={24} color="#16a34a" />, iconBg: 'bg-primary-lighter', title: 'Personal Plan',
              desc: 'Cocok untuk individu yang ingin membangun kebiasaan pribadi. Gratis selamanya dengan akses ke semua fitur dasar.',
              bullets: ['Unlimited habit tracking', 'Daily reminders', 'Progress analytics', 'Share & export'],
            }].map((s, i) => (
              <div
                key={i}
                id={`svc-${i}`}
                data-observe
                className="bg-white border border-border rounded-[16px] p-9 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-primary hover:shadow-float relative"
                style={{
                  opacity: visible[`svc-${i}`] ? 1 : 0,
                  transform: visible[`svc-${i}`] ? 'none' : 'translateY(24px)',
                  transition: `all 0.5s ease ${i * 0.1}s`,
                }}
              >
                <div className={`w-[52px] h-[52px] rounded-[12px] flex items-center justify-center mb-5 ${s.iconBg}`}>{s.icon}</div>
                <h3 className="font-heading text-[20px] font-bold mb-3 text-ink">{s.title}</h3>
                <p className="text-[15px] text-muted leading-[1.7] mb-5">{s.desc}</p>
                <ul className="list-none p-0 m-0 flex flex-col gap-2">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-ink-body">
                      <span className="w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-[100px] px-10 bg-surface">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <span className={sectionLabel}>Fitur Platform</span>
            <h2 className="font-heading font-extrabold mb-4 tracking-[-1px]" style={{ fontSize: 'clamp(28px, 4vw, 46px)' }}>
              Semua yang kamu butuhkan
            </h2>
            <p className="text-muted text-[17px] max-w-[520px] mx-auto leading-[1.7]">
              14 fitur lengkap yang dirancang untuk mendukung perjalanan habit kamu dari awal hingga pencapaian tertinggi.
            </p>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {features.map((f, i) => (
              <div
                key={i}
                id={`feat-${i}`}
                data-observe
                className="bg-white border border-border rounded-[16px] p-8 shadow-card hover:border-primary hover:-translate-y-1 hover:shadow-float"
                style={{
                  opacity: visible[`feat-${i}`] ? 1 : 0,
                  transform: visible[`feat-${i}`] ? 'none' : 'translateY(24px)',
                  transition: `all 0.5s ease ${i * 0.08}s`,
                }}
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-heading text-[18px] font-bold mb-2.5 tracking-[-0.3px] text-ink">{f.title}</h3>
                <p className="text-[15px] text-muted leading-[1.75] m-0">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[20px] p-10 flex items-center justify-between flex-wrap gap-6" style={{ background: 'linear-gradient(135deg, #14532d, #16a34a)' }}>
            <div>
              <h3 className="font-heading text-2xl font-extrabold text-white mb-2">Siap memulai perjalananmu?</h3>
              <p className="text-base m-0 text-white/65">Daftar sekarang dan akses semua fitur secara gratis.</p>
            </div>
            <button
              className="border-0 rounded-sm font-semibold cursor-pointer transition-all duration-200 font-body text-[15px] py-3.5 px-8 flex-shrink-0 bg-white text-primary hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              onClick={() => navigate('/register')}
            >Mulai Gratis →</button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-[100px] px-10 bg-white">
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-14">
            <span className={sectionLabel}>FAQ</span>
            <h2 className="font-heading font-extrabold mb-4 tracking-[-1px]" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Pertanyaan yang sering diajukan
            </h2>
            <p className="text-muted text-base leading-[1.7]">
              Tidak menemukan jawaban? Hubungi kami melalui email di{' '}
              <a href="mailto:hello@habittracker.id" className="text-primary no-underline font-semibold">hello@habittracker.id</a>
            </p>
          </div>

          <div
            id="faq-list"
            data-observe
            className="transition-all duration-[600ms] ease-out"
            style={{ opacity: visible['faq-list'] ? 1 : 0, transform: visible['faq-list'] ? 'none' : 'translateY(24px)' }}
          >
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-border">
                <button
                  className="w-full bg-transparent border-0 text-left py-5 cursor-pointer flex justify-between items-center font-body text-base font-semibold text-ink"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className={`text-[20px] text-primary flex-shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && <div className="pb-5 text-[15px] text-muted leading-[1.75] animate-slide-down">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[100px] px-10 text-center" style={{ background: 'linear-gradient(135deg, #14532d 0%, #0f1f12 100%)' }}>
        <div
          id="cta"
          data-observe
          className="max-w-[640px] mx-auto transition-all duration-700 ease-out"
          style={{ opacity: visible['cta'] ? 1 : 0, transform: visible['cta'] ? 'none' : 'translateY(32px)' }}
        >
          <div className="w-16 h-16 rounded-[16px] flex items-center justify-center mx-auto mb-6 text-[28px] text-white bg-primary/25">✦</div>
          <h2 className="font-heading font-extrabold mb-4 tracking-[-1px] text-white" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
            Mulai sekarang, gratis.
          </h2>
          <p className="text-[17px] mb-11 leading-[1.7] text-white/55">
            Ayo bergabung dengan pengguna lainnya yang sudah membangun kebiasaan terbaik mereka bersama HabitTracker.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className={`${btnPrimary} text-base py-4 px-11`} onClick={() => navigate('/register')}>Daftar Sekarang →</button>
            <button
              className="bg-transparent border-2 border-white/30 rounded-sm font-semibold cursor-pointer transition-all duration-200 font-body text-base py-[15px] px-11 text-white hover:bg-white/10"
              onClick={() => navigate('/login')}
            >Masuk</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14 px-10 pb-8 text-white/50 text-sm bg-[#0b1a0e]">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex justify-between mb-12 flex-wrap gap-10 flex-col md:flex-row">
            <div className="max-w-[280px]">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-sm text-white">✦</div>
                <span className="font-heading font-extrabold text-[17px] text-white">HabitTracker</span>
              </div>
              <p className="leading-[1.75] mb-5">Platform manajemen kebiasaan yang membantu Anda tumbuh setiap hari, secara konsisten dan terukur.</p>
              <div className="text-[13px] text-white/30 flex items-center gap-1"><MapPin size={13} /> Surabaya, Indonesia</div>
            </div>

            {[
              { title: 'Produk',     links: ['Fitur', 'Roadmap', 'Changelog', 'Status'] },
              { title: 'Perusahaan', links: ['Tentang Kami', 'Tim', 'Blog', 'Karir'] },
              { title: 'Dukungan',   links: ['Dokumentasi', 'FAQ', 'Hubungi Kami', 'Komunitas'] },
            ].map((col, i) => (
              <div key={i}>
                <div className="font-heading font-bold text-white text-sm mb-4 tracking-[0.3px]">{col.title}</div>
                <div className="flex flex-col gap-2.5">
                  {col.links.map(l => (
                    <a key={l} href="#" className="text-white/45 text-sm no-underline transition-colors duration-200 hover:text-accent-light">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.07] pt-7 flex justify-between flex-wrap gap-3">
            <span>© 2026 HabitTracker. Hak cipta dilindungi.</span>
            <div className="flex gap-6">
              {['Kebijakan Privasi', 'Syarat & Ketentuan', 'Cookie'].map(l => (
                <a key={l} href="#" className="text-white/35 text-[13px] no-underline transition-colors duration-200 hover:text-accent-light">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── COOKIE BANNER ── */}
      {showCookieBanner && !showCookieModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[900px] bg-white border border-border rounded-[16px] py-5 px-7 shadow-[0_8px_40px_rgba(0,0,0,0.12)] z-[300] animate-slide-up flex items-center gap-5 flex-wrap flex-col md:flex-row">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-[38px] h-[38px] bg-primary-light rounded-[10px] flex items-center justify-center flex-shrink-0"><Cookie size={18} color="#16a34a" /></div>
            <div>
              <p className="font-heading font-bold text-[15px] text-ink mb-1 m-0">Kami menggunakan cookie</p>
              <p className="text-[13px] text-muted leading-[1.6] m-0">
                Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas situs, dan mempersonalisasi konten.{' '}
                <a href="#" className="text-primary underline font-medium">Pelajari selengkapnya</a>
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-shrink-0 items-center flex-wrap flex-col md:flex-row">
            <button onClick={rejectAllCookies} className="bg-transparent border border-border text-muted rounded-sm py-2.5 px-[18px] text-[13px] font-medium cursor-pointer font-body whitespace-nowrap transition-all duration-200 hover:border-primary hover:text-primary">
              Tolak
            </button>
            <button onClick={() => setShowCookieModal(true)} className="bg-primary-lighter border border-border-mid text-primary rounded-sm py-2.5 px-[18px] text-[13px] font-semibold cursor-pointer font-body whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1.5 hover:bg-primary-light">
              <Settings size={13} /> Kustomisasi
            </button>
            <button onClick={acceptAllCookies} className={`${btnPrimary} py-2.5 px-5 text-[13px] whitespace-nowrap`}>
              Terima Semua
            </button>
          </div>
        </div>
      )}

      {/* ── COOKIE MODAL ── */}
      {showCookieModal && (
        <div
          className="fixed inset-0 z-[350] flex items-center justify-center p-5 animate-fade-in bg-[#0b1a0e]/55 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowCookieModal(false) }}
        >
          <div className="bg-white rounded-[20px] max-w-[540px] w-full max-h-[90vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.25)] animate-fade-in-scale">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-[10px] flex items-center justify-center"><Cookie size={20} color="#16a34a" /></div>
                <div>
                  <h3 className="font-heading font-extrabold text-[17px] text-ink m-0">Pengaturan Cookie</h3>
                  <p className="text-xs text-subtle mt-0.5 m-0">Kontrol preferensi privasi Anda</p>
                </div>
              </div>
              <button onClick={() => setShowCookieModal(false)} className="w-8 h-8 border border-border rounded-sm bg-surface cursor-pointer text-muted flex items-center justify-center transition-all duration-150 hover:bg-primary-light hover:text-primary">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-5 flex flex-col gap-3">
              <p className="text-[13px] text-muted leading-[1.65] mb-2">
                Pilih jenis cookie yang Anda izinkan. Cookie esensial selalu aktif karena diperlukan agar website berfungsi dengan benar.
              </p>

              {[
                { key: 'essential' as const,   icon: <Lock size={18} color="#4b7a54" />,     title: 'Cookie Esensial',   sub: 'Selalu aktif — wajib untuk fungsi dasar',       desc: 'Cookie ini diperlukan untuk login, keamanan sesi, dan navigasi halaman. Tidak dapat dinonaktifkan.', disabled: true },
                { key: 'analytics' as const,   icon: <BarChart2 size={18} color="#4b7a54" />, title: 'Cookie Analitik',   sub: 'Membantu kami memahami penggunaan',              desc: 'Mengumpulkan data anonim tentang cara Anda menggunakan platform kami untuk membantu meningkatkan layanan. Contoh: Google Analytics.' },
                { key: 'marketing' as const,   icon: <Megaphone size={18} color="#4b7a54" />, title: 'Cookie Pemasaran',  sub: 'Untuk konten dan iklan yang relevan',            desc: 'Digunakan untuk menampilkan konten dan iklan yang dipersonalisasi berdasarkan minat Anda, baik di platform kami maupun di situs lain.' },
                { key: 'preferences' as const, icon: <Settings size={18} color="#4b7a54" />,  title: 'Cookie Preferensi', sub: 'Menyimpan pilihan tampilan Anda',                desc: 'Menyimpan pengaturan seperti bahasa, tema, dan preferensi UI lainnya agar pengalaman Anda konsisten di setiap kunjungan.' },
              ].map(cat => (
                <CookieCategoryItem
                  key={cat.key}
                  icon={cat.icon}
                  title={cat.title}
                  sub={cat.sub}
                  desc={cat.desc}
                  disabled={cat.disabled}
                  checked={cookiePrefs[cat.key]}
                  onChange={v => setCookiePrefs(p => ({ ...p, [cat.key]: v }))}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-7 pb-6 pt-4 border-t border-border flex gap-2.5 justify-between flex-wrap">
              <button onClick={rejectAllCookies} className="bg-transparent border border-border text-muted rounded-sm py-2.5 px-[18px] text-[13px] font-medium cursor-pointer font-body transition-all duration-200 hover:border-border-mid hover:text-primary">
                Tolak Semua
              </button>
              <div className="flex gap-2.5">
                <button onClick={saveCustomCookies} className="bg-primary-lighter border border-border-mid text-primary rounded-sm py-2.5 px-[18px] text-[13px] font-semibold cursor-pointer font-body transition-all duration-200 hover:bg-primary-light">
                  Simpan Pilihan
                </button>
                <button onClick={acceptAllCookies} className={`${btnPrimary} py-2.5 px-5 text-[13px]`}>
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
