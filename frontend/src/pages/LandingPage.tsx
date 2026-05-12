import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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


export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('tracked')) {
      sessionStorage.setItem('tracked', '1')
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 'landing' }) }).catch(() => {})
    }
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

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f9fc', color: '#1a1a2e', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.04); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

        .nav-link {
          color: #444;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          padding: 6px 4px;
          border-bottom: 2px solid transparent;
          transition: color 0.2s, border-color 0.2s;
        }
        .nav-link:hover { color: #2b59ff; border-bottom-color: #2b59ff; }

        .btn-primary {
          background: #2b59ff;
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
        .btn-primary:hover { background: #1a47e8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(43,89,255,0.3); }

        .btn-outline {
          background: transparent;
          color: #2b59ff;
          border: 2px solid #2b59ff;
          padding: 13px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-outline:hover { background: #2b59ff; color: #fff; }

        .btn-ghost {
          background: transparent;
          color: #555;
          border: 1.5px solid #ddd;
          padding: 13px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { border-color: #2b59ff; color: #2b59ff; }

        .feature-card {
          background: #fff;
          border: 1px solid #e8ecf4;
          border-radius: 16px;
          padding: 32px 28px;
          transition: all 0.3s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .feature-card:hover { border-color: #2b59ff; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(43,89,255,0.1); }

        .stat-card {
          background: #fff;
          border: 1px solid #e8ecf4;
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
        .check-done { background: #2b59ff; color: white; }
        .check-todo { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
        .progress-bar { height: 5px; background: rgba(255,255,255,0.15); border-radius: 100px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #2b59ff, #7c9fff); }
        .streak-badge { background: linear-gradient(135deg, #ff6b35, #f7c59f); border-radius: 10px; padding: 3px 9px; font-size: 12px; font-weight: 600; color: #1a0a00; display: inline-flex; align-items: center; gap: 4px; }

        .faq-item { border-bottom: 1px solid #e8ecf4; }
        .faq-btn { width: 100%; background: none; border: none; text-align: left; padding: 20px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; color: #1a1a2e; }
        .faq-answer { padding: 0 0 20px; font-size: 15px; color: #555; line-height: 1.75; animation: slideDown 0.2s ease; }

        .team-card { background: #fff; border: 1px solid #e8ecf4; border-radius: 16px; padding: 32px 24px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .avatar { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; color: #fff; margin: 0 auto 16px; }

        .section-label { display: inline-block; background: #eef2ff; color: #2b59ff; border-radius: 6px; padding: 6px 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 16px; text-transform: uppercase; }

        .service-card { background: #fff; border: 1px solid #e8ecf4; border-radius: 16px; padding: 36px 28px; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .service-card:hover { border-color: #2b59ff; box-shadow: 0 12px 40px rgba(43,89,255,0.1); }
        .service-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }

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
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrollY > 40 ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e8ecf4',
        transition: 'all 0.3s',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 68,
        boxShadow: scrollY > 40 ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#2b59ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>HabitTracker</span>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <button onClick={() => scrollTo('home')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Home</button>
          <button onClick={() => scrollTo('about')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>About</button>
          <button onClick={() => scrollTo('services')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Services</button>
          <button onClick={() => scrollTo('features')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Fitur</button>
          <button onClick={() => scrollTo('faq')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>FAQ</button>
        </div>

        {/* CTA */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-ghost" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => navigate('/login')}>Masuk</button>
          <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }} onClick={() => navigate('/register')}>Mulai Gratis</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: 5, padding: 4 }}
          onClick={() => setMobileMenuOpen((v: boolean) => !v)}
        >
          {[0,1,2].map(i => <div key={i} style={{ width: 24, height: 2, background: '#1a1a2e', borderRadius: 2 }} />)}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, zIndex: 190,
          background: '#fff', borderBottom: '1px solid #e8ecf4',
          padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          animation: 'slideDown 0.2s ease'
        }}>
          {['home','about','services','features','faq'].map(id => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 16, fontWeight: 600, color: '#1a1a2e', textTransform: 'capitalize', padding: '4px 0' }}>
              {id === 'features' ? 'Fitur' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/login')}>Masuk</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate('/register')}>Daftar</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section id="home" ref={heroRef} style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #0f1e5c 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 68,
      }}>
        {/* BG decoration */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(43,89,255,0.2) 0%, transparent 65%)', animation: 'pulse 8s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,159,255,0.15) 0%, transparent 65%)', animation: 'pulse 10s ease infinite 3s', pointerEvents: 'none' }} />
        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', width: '100%', display: 'flex', alignItems: 'center', gap: 64 }} className="hero-grid">
          {/* Text */}
          <div style={{ flex: 1, animation: 'fadeIn 0.9s ease' }} className="hero-text">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(43,89,255,0.2)', border: '1px solid rgba(43,89,255,0.4)', borderRadius: 6, padding: '7px 16px', marginBottom: 28, fontSize: 13, color: '#7c9fff', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              ✦ Platform Manajemen Habit Terpercaya
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 24px', color: '#fff' }}>
              Bangun Kebiasaan<br />
              <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #4f8aff, #7c9fff)', backgroundClip: 'text' }}>
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
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#4f8aff', fontFamily: 'Syne, sans-serif' }}>2/4</div>
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

      {/* ── STATS BAR ── */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e8ecf4', padding: '40px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#2b59ff', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#888', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '100px 40px', background: '#f8f9fc' }}>
  <div style={{ maxWidth: 1100, margin: '0 auto' }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
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
              <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: 20 }}>
                HabitTracker didirikan pada 2023 dengan visi sederhana: membuat pembentukan kebiasaan positif menjadi terstruktur, terukur, dan menyenangkan bagi semua orang.
              </p>
              <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: 32 }}>
                Kami percaya bahwa perubahan besar dimulai dari langkah kecil yang konsisten. Platform kami dirancang untuk membantu Anda tetap di jalur yang benar, hari demi hari, dengan data dan insight yang mudah dipahami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '100px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">Layanan Kami</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Solusi lengkap untuk setiap kebutuhan
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Dari individu hingga tim kecil, HabitTracker hadir dengan layanan yang dapat disesuaikan dengan kebutuhan Anda.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 24 }} className="services-grid">
            {([
              {
                icon: '🏢', color: '#fff7ed', title: 'Personal Plan',
                desc: 'Cocok untuk individu yang ingin membangun kebiasaan pribadi. Gratis selamanya dengan akses ke semua fitur dasar.',
                bullets: ['Unlimited habit tracking', 'Daily reminders', 'Progress analytics', 'Share & export'],
                badge: undefined as string | undefined,
              },
            ] as { icon: string; color: string; title: string; desc: string; bullets: string[]; badge?: string }[]).map((s, i) => (
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
                {s.badge && (
                  <div style={{ position: 'absolute', top: 20, right: 20, background: '#2b59ff', color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '4px 10px' }}>
                    {s.badge}
                  </div>
                )}
                <div className="service-icon" style={{ background: s.color }}>{s.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#1a1a2e' }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {s.bullets.map((b, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#444' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef2ff', color: '#2b59ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
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
      <section id="features" style={{ padding: '100px 40px', background: '#f8f9fc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">Fitur Platform</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Semua yang kamu butuhkan
            </h2>
            <p style={{ color: '#666', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
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
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, margin: '0 0 10px', letterSpacing: -0.3, color: '#1a1a2e' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature highlight banner */}
          <div style={{ marginTop: 48, background: 'linear-gradient(135deg, #0f1e5c, #2b59ff)', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Siap memulai perjalananmu?</h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: 0 }}>Daftar sekarang dan akses semua fitur secara gratis.</p>
            </div>
            <button className="btn-primary" style={{ background: '#fff', color: '#2b59ff', fontSize: 15, padding: '14px 32px', flexShrink: 0 }} onClick={() => navigate('/register')}>
              Mulai Gratis →
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="section-label">FAQ</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Pertanyaan yang sering diajukan
            </h2>
            <p style={{ color: '#666', fontSize: 16, lineHeight: 1.7 }}>Tidak menemukan jawaban? Hubungi kami melalui email di <a href="mailto:hello@habittracker.id" style={{ color: '#2b59ff', textDecoration: 'none', fontWeight: 600 }}>hello@habittracker.id</a></p>
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
                  <span style={{ fontSize: 20, color: '#2b59ff', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0, marginLeft: 12 }}>+</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '100px 40px', background: 'linear-gradient(135deg, #0f1e5c 0%, #1a1a2e 100%)', textAlign: 'center' }}>
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
          <div style={{ width: 64, height: 64, background: 'rgba(43,89,255,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>✦</div>
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

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0f1e', padding: '56px 40px 32px', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 40 }} className="footer-grid">
            {/* Brand */}
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: '#2b59ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
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
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
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
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}