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
  { value: '14', label: 'Fitur Lengkap' },
  { value: '100%', label: 'Gratis' },
  { value: '∞', label: 'Habit Tanpa Batas' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!sessionStorage.getItem('tracked')) { sessionStorage.setItem('tracked', '1'); fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: 'landing' }) }).catch(() => {}) }
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
      { threshold: 0.15 }
    )
    document.querySelectorAll('[data-observe]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0a0a0f', color: '#f0f0f5', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes orbit { from { transform: rotate(0deg) translateX(120px) rotate(0deg); } to { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
        .hero-title { font-family: 'Syne', sans-serif; font-size: clamp(48px, 8vw, 96px); font-weight: 800; line-height: 1.0; letter-spacing: -3px; }
        .btn-primary { background: #7c5cfc; color: #fff; border: none; padding: 16px 36px; border-radius: 100px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-primary:hover { background: #9478fd; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,92,252,0.4); }
        .btn-outline { background: transparent; color: #f0f0f5; border: 1px solid rgba(240,240,245,0.2); padding: 16px 36px; border-radius: 100px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-outline:hover { border-color: rgba(240,240,245,0.5); background: rgba(240,240,245,0.05); }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; transition: all 0.3s; }
        .feature-card:hover { background: rgba(124,92,252,0.08); border-color: rgba(124,92,252,0.3); transform: translateY(-4px); }
        .animate-in { animation: fadeUp 0.6s ease forwards; }
        .nav-link { color: rgba(240,240,245,0.6); text-decoration: none; font-size: 15px; transition: color 0.2s; }
        .nav-link:hover { color: #f0f0f5; }
        .streak-badge { background: linear-gradient(135deg, #ff6b35, #f7c59f); border-radius: 12px; padding: 4px 10px; font-size: 13px; font-weight: 600; color: #1a0a00; display: inline-flex; align-items: center; gap: 4px; }
        .progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 100px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #7c5cfc, #c084fc); transition: width 0.6s ease; }
        .mockup-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; }
        .checkmark { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }
        .check-done { background: #7c5cfc; color: white; }
        .check-todo { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 50 ? 'rgba(10,10,15,0.9)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s',
        padding: '20px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#7c5cfc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>HabitTracker</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" className="nav-link">Fitur</a>
          <a href="#preview" className="nav-link">Preview</a>
          <button className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => navigate('/login')}>Masuk</button>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '120px 40px 80px', textAlign: 'center' }}>
        {/* BG orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)', animation: 'pulse 6s ease infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)', animation: 'pulse 8s ease infinite 2s', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.8s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 100, padding: '8px 18px', marginBottom: 32, fontSize: 14, color: '#c084fc' }}>
            <span>✦</span> Bangun kebiasaan terbaik hidupmu
          </div>

          <h1 className="hero-title" style={{ margin: '0 0 24px' }}>
            Habit yang
            <span style={{ display: 'block', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundImage: 'linear-gradient(135deg, #7c5cfc, #c084fc, #f472b6)', backgroundClip: 'text' }}>
              konsisten
            </span>
            mengubah hidup.
          </h1>

          <p style={{ fontSize: 20, color: 'rgba(240,240,245,0.6)', marginBottom: 48, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px' }}>
            Lacak habit harian, pantau streak, dapatkan laporan, dan bagikan progress kamu — semua dalam satu platform.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 18, padding: '18px 44px' }} onClick={() => navigate('/register')}>
              Mulai Gratis →
            </button>
            <button className="btn-outline" style={{ fontSize: 18, padding: '18px 44px' }} onClick={() => navigate('/login')}>
              Sudah punya akun
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 80, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: '#7c5cfc' }}>{s.value}</div>
                <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.5)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Mockup */}
      <section id="preview" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div id="preview-box" data-observe style={{ opacity: visible['preview-box'] ? 1 : 0, transform: visible['preview-box'] ? 'none' : 'translateY(40px)', transition: 'all 0.7s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
              Semua dalam satu tampilan
            </h2>
            <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 18 }}>Desain yang bersih, intuitif, dan fokus pada produktivitas.</p>
          </div>

          {/* Mockup UI */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left: Habit list */}
            <div>
              <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Hari ini — Minggu, 26 Apr</p>
              {[
                { name: 'Meditasi 10 menit', done: true, streak: 14, prog: 82 },
                { name: 'Baca buku 30 menit', done: true, streak: 7, prog: 65 },
                { name: 'Olahraga pagi', done: false, streak: 5, prog: 48 },
                { name: 'Minum 8 gelas air', done: false, streak: 3, prog: 30 },
              ].map((h, i) => (
                <div key={i} className="mockup-card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className={`checkmark ${h.done ? 'check-done' : 'check-todo'}`}>{h.done ? '✓' : ''}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: h.done ? 'rgba(240,240,245,0.5)' : '#f0f0f5', textDecoration: h.done ? 'line-through' : 'none' }}>{h.name}</span>
                      <span className="streak-badge">🔥 {h.streak}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${h.prog}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Stats cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="mockup-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 8 }}>Current Streak Terbaik</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: '#ff6b35' }}>14 🔥</div>
                <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>Meditasi harian</div>
              </div>
              <div className="mockup-card">
                <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)', marginBottom: 12 }}>Progress Minggu Ini</div>
                {[
                  { day: 'Sen', v: 100 }, { day: 'Sel', v: 75 }, { day: 'Rab', v: 100 },
                  { day: 'Kam', v: 50 }, { day: 'Jum', v: 100 }, { day: 'Sab', v: 75 }, { day: 'Min', v: 60 },
                ].map(d => (
                  <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', width: 28 }}>{d.day}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${d.v}%`, background: d.v === 100 ? '#7c5cfc' : 'linear-gradient(90deg, #7c5cfc, #c084fc)' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', width: 32, textAlign: 'right' }}>{d.v}%</span>
                  </div>
                ))}
              </div>
              <div className="mockup-card" style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#c084fc' }}>4</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>Habit Aktif</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>2</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>Selesai Hari Ini</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
            Semua yang kamu butuhkan
          </h2>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 18 }}>14 fitur lengkap untuk mendukung perjalanan habit kamu.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={i}
              id={`feat-${i}`}
              data-observe
              className="feature-card"
              style={{
                opacity: visible[`feat-${i}`] ? 1 : 0,
                transform: visible[`feat-${i}`] ? 'none' : 'translateY(24px)',
                transition: `all 0.5s ease ${i * 0.08}s`
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, margin: '0 0 10px', letterSpacing: -0.3 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.55)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px 120px', textAlign: 'center' }}>
        <div id="cta" data-observe style={{
          maxWidth: 640, margin: '0 auto',
          opacity: visible['cta'] ? 1 : 0,
          transform: visible['cta'] ? 'none' : 'translateY(32px)',
          transition: 'all 0.7s ease'
        }}>
          <div style={{ width: 64, height: 64, background: 'rgba(124,92,252,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28 }}>✦</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: -1 }}>
            Mulai sekarang, gratis.
          </h2>
          <p style={{ color: 'rgba(240,240,245,0.5)', fontSize: 18, marginBottom: 40 }}>
            Bergabung dan bangun kebiasaan terbaik hidupmu hari ini.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 18, padding: '18px 44px' }} onClick={() => navigate('/register')}>
              Daftar Sekarang →
            </button>
            <button className="btn-outline" style={{ fontSize: 18, padding: '18px 44px' }} onClick={() => navigate('/login')}>
              Masuk
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 40px', textAlign: 'center', color: 'rgba(240,240,245,0.3)', fontSize: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, background: '#7c5cfc', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✦</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'rgba(240,240,245,0.6)' }}>HabitTracker</span>
        </div>
        <p style={{ margin: 0 }}>© 2026 HabitTracker. Dibuat dengan ♥ untuk kebiasaan yang lebih baik.</p>
      </footer>
    </div>
  )
}