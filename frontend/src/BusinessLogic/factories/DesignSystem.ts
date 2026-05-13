// ─── HabitTracker Design System ───────────────────────────────────────────────
// Lokasi: frontend/src/styles/designSystem.ts
// Deskripsi: Dokumentasi lengkap design language HabitTracker
//            Referensi tunggal untuk warna, tipografi, spacing, komponen.
// Sinkron dengan: factories/tokens.ts
// ──────────────────────────────────────────────────────────────────────────────

/**
 * DESIGN PHILOSOPHY
 * ─────────────────
 * HabitTracker menggunakan tema "Natural Growth" — terinspirasi dari
 * pertumbuhan organik dan konsistensi alam. Palet hijau forest/emerald
 * merepresentasikan progress yang berkelanjutan, kesehatan, dan kepercayaan.
 *
 * Prinsip utama:
 *  1. Clarity first  — informasi mudah dibaca, hierarchy jelas
 *  2. Green-anchored — semua aksen mengacu ke keluarga hijau
 *  3. Trustworthy    — kontras cukup, tidak bermain-main dengan keterbacaan
 *  4. Responsive     — mobile-first, semua breakpoint terdefinisi
 */

// ─── 1. COLOR PALETTE ─────────────────────────────────────────────────────────

export const colorPalette = {
  // Primary Brand — Forest Green
  // Digunakan untuk: tombol utama, ikon aktif, link, badge, progress
  green: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#a7f3d0', // ← border hover
    300: '#6ee7b7', // ← accent gradient pair
    500: '#10b981', // ← emerald accent
    600: '#16a34a', // ← PRIMARY — gunakan ini untuk brand utama
    700: '#15803d', // ← hover state
    800: '#166534', // ← gradient mid, navbar dark
    900: '#14532d', // ← hero section bg, dark section
    950: '#0f1f12', // ← text heading tua
  },

  // Neutrals — dengan undertone hijau sangat subtle
  neutral: {
    white:  '#ffffff',
    50:     '#f7faf8',  // ← background halaman (bukan putih murni)
    100:    '#e4e7ec',  // ← border netral
    200:    '#d1d5db',
    400:    '#86a98d',  // ← text placeholder
    500:    '#4b7a54',  // ← text muted
    700:    '#1e3a22',  // ← text body
    900:    '#0f1f12',  // ← text heading
    black:  '#030a04',
  },

  // Semantic
  semantic: {
    successText:  '#16a34a',
    successBg:    '#dcfce7',
    errorText:    '#dc2626',
    errorBg:      '#fef2f2',
    warningText:  '#d97706',
    warningBg:    '#fffbeb',
    infoText:     '#0284c7',
    infoBg:       '#e0f2fe',
  },

  // Dark surfaces (footer, hero, modal backdrop)
  dark: {
    900: '#0b1a0e',
    800: '#0f1f12',
    700: '#14532d',
    overlay: 'rgba(11,26,14,0.85)',
  },
}

// ─── 2. TYPOGRAPHY ────────────────────────────────────────────────────────────

export const typography = {
  /**
   * Font Families
   * - Syne       : Display & heading — bold, geometric, karakter kuat
   * - DM Sans    : Body & UI — humanis, mudah dibaca semua ukuran
   * - JetBrains  : Monospace (code, badge teknis)
   *
   * Google Fonts import (tambahkan di index.html atau App.tsx):
   * https://fonts.googleapis.com/css2?
   *   family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;
   *     0,9..40,600;0,9..40,700;1,9..40,400
   *   &family=Syne:wght@600;700;800
   *   &display=swap
   */
  family: {
    heading: "'Syne', sans-serif",
    body:    "'DM Sans', sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },

  // Font Size Scale
  size: {
    xs:      '11px',
    sm:      '12px',
    caption: '13px',
    base:    '15px',
    md:      '16px',
    lg:      '18px',
    xl:      '20px',
    '2xl':   '24px',
    h3:      '24px',
    h2:      'clamp(28px, 4vw, 46px)',
    h1:      'clamp(40px, 6vw, 76px)',
  },

  // Font Weight
  weight: {
    light:   300,
    normal:  400,
    medium:  500,
    semi:    600,
    bold:    700,
    black:   800,
  },

  // Letter Spacing
  tracking: {
    tight:   '-1px',
    tighter: '-2px',
    wide:    '0.3px',
    wider:   '0.5px',
    widest:  '1px',
  },

  // Line Height
  leading: {
    tight:   1.08,
    snug:    1.15,
    normal:  1.5,
    relaxed: 1.7,
    loose:   1.8,
  },
}

// ─── 3. SPACING ───────────────────────────────────────────────────────────────

export const spacing = {
  /**
   * Menggunakan skala 4px base unit.
   * Dipakai untuk: padding, margin, gap
   */
  0:    '0px',
  1:    '4px',
  2:    '8px',
  3:    '12px',
  4:    '16px',
  5:    '20px',
  6:    '24px',
  7:    '28px',
  8:    '32px',
  10:   '40px',
  12:   '48px',
  14:   '56px',
  16:   '64px',
  20:   '80px',
  24:   '100px',
  // Named aliases
  xs:   '4px',
  sm:   '8px',
  md:   '16px',
  lg:   '24px',
  xl:   '32px',
  '2xl': '48px',
  '3xl': '64px',
  section: '100px',  // padding vertical antar section
  container: '40px', // padding horizontal container
  maxWidth: '1100px', // max-width konten
  maxWidthWide: '1200px',
  maxWidthNarrow: '760px',
}

// ─── 4. BORDER RADIUS ─────────────────────────────────────────────────────────

export const radius = {
  xs:   '4px',   // badge kecil, tag
  sm:   '8px',   // tombol, input field
  md:   '12px',  // card kecil, modal inner
  lg:   '16px',  // feature card, service card
  xl:   '20px',  // banner, hero box
  '2xl': '24px', // mockup card besar
  full: '9999px', // pill, avatar, toggle
}

// ─── 5. SHADOWS ───────────────────────────────────────────────────────────────

export const shadows = {
  /**
   * Semua shadow menggunakan warna hijau (bukan hitam) untuk
   * konsistensi brand. Shadow netral hanya untuk overlay/modal.
   */
  xs:   '0 1px 4px rgba(0,0,0,0.04)',
  sm:   '0 2px 12px rgba(0,0,0,0.05)',
  md:   '0 4px 24px rgba(22,163,74,0.10)',
  lg:   '0 12px 40px rgba(22,163,74,0.14)',
  xl:   '0 24px 60px rgba(22,163,74,0.18)',
  hero: '0 32px 80px rgba(0,0,0,0.35)',
  nav:  '0 2px 20px rgba(0,0,0,0.07)',
  card: '0 2px 12px rgba(0,0,0,0.05)',
  cardHover: '0 12px 40px rgba(22,163,74,0.14)',
  none: 'none',
}

// ─── 6. TRANSITIONS ───────────────────────────────────────────────────────────

export const transitions = {
  fast:   'all 0.15s ease',
  base:   'all 0.25s ease',
  slow:   'all 0.4s ease',
  bounce: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
}

// ─── 7. Z-INDEX SCALE ─────────────────────────────────────────────────────────

export const zIndex = {
  base:     0,
  raised:   10,
  dropdown: 100,
  sticky:   150,
  navbar:   200,
  drawer:   190,
  modal:    300,
  toast:    400,
  tooltip:  500,
}

// ─── 8. BREAKPOINTS ───────────────────────────────────────────────────────────

export const breakpoints = {
  /**
   * Mobile-first. Gunakan dengan @media (max-width: ...) untuk override.
   */
  sm:  '480px',
  md:  '768px',   // ← titik utama mobile → desktop
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1440px',
}

// ─── 9. COMPONENT TOKENS ──────────────────────────────────────────────────────

export const components = {
  // Navbar
  navbar: {
    height:          '68px',
    background:      'rgba(255,255,255,0.93)',
    backgroundScroll: 'rgba(255,255,255,0.98)',
    borderColor:     '#d1fae5',
    backdropFilter:  'blur(16px)',
  },

  // Buttons
  button: {
    primary: {
      bg:           '#16a34a',
      bgHover:      '#15803d',
      color:        '#ffffff',
      shadow:       '0 6px 20px rgba(22,163,74,0.28)',
      paddingX:     '32px',
      paddingY:     '14px',
      borderRadius: '8px',
    },
    outline: {
      bg:           'transparent',
      color:        '#16a34a',
      border:       '2px solid #16a34a',
      bgHover:      '#16a34a',
      colorHover:   '#ffffff',
    },
    ghost: {
      bg:           'transparent',
      color:        '#4b7a54',
      border:       '1.5px solid #d1fae5',
      bgHover:      '#f0fdf4',
    },
    white: {
      bg:           '#ffffff',
      color:        '#16a34a',
      bgHover:      '#f0fdf4',
    },
  },

  // Cards
  card: {
    bg:           '#ffffff',
    border:       '1px solid #d1fae5',
    borderRadius: '16px',
    padding:      '32px 28px',
    shadow:       '0 2px 12px rgba(0,0,0,0.05)',
    borderHover:  '#16a34a',
    shadowHover:  '0 12px 40px rgba(22,163,74,0.14)',
  },

  // Section Label (badge kecil di atas judul)
  sectionLabel: {
    bg:           '#dcfce7',
    color:        '#16a34a',
    borderRadius: '6px',
    padding:      '6px 14px',
    fontSize:     '13px',
    fontWeight:   600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },

  // FAQ
  faq: {
    borderColor:    '#d1fae5',
    questionColor:  '#0f1f12',
    accentColor:    '#16a34a',
    answerColor:    '#4b7a54',
  },

  // Cookie Consent
  cookieConsent: {
    bg:           '#ffffff',
    border:       '1px solid #d1fae5',
    shadow:       '0 -4px 40px rgba(0,0,0,0.08)',
    borderRadius: '16px',
    toggleActive: '#16a34a',
    toggleInactive: '#d1d5db',
  },
}

// ─── 10. ANIMATION KEYFRAMES (reference) ─────────────────────────────────────

export const animations = {
  /**
   * Definisi keyframe diimplementasikan di <style> tag komponen.
   * Daftar ini sebagai referensi nama dan durasi standar.
   */
  fadeUp:    { duration: '0.5s', easing: 'ease', delay: '0s' },
  fadeIn:    { duration: '0.9s', easing: 'ease', delay: '0s' },
  float:     { duration: '5s',   easing: 'ease', delay: '0s', iteration: 'infinite' },
  pulse:     { duration: '8s',   easing: 'ease', delay: '0s', iteration: 'infinite' },
  slideDown: { duration: '0.2s', easing: 'ease', delay: '0s' },
  stagger:   { baseDelay: 0.08, unit: 's' }, // per item: i * 0.08s
}

// ─── 11. FILE STRUCTURE (Sesuai Layering Pattern Project) ────────────────────

/**
 * PENEMPATAN FILE — mengikuti struktur frontend/src/ yang sudah ada:
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * frontend/src/
 * │
 * ├── ── LAYER 1: PRESENTATION ───────────────────────────────────────────────
 * │   pages/
 * │   └── LandingPage.tsx              ← ✅ Taruh di sini (sejajar Dashboard.tsx)
 * │
 * │   components/
 * │   └── (tidak ada subfolder landing) ← LandingPage dibiarkan monolitik
 * │                                        sesuai pola file lain di project ini.
 * │                                        Jika kelak dipecah, ikuti pola:
 * │                                        components/landing/CookieConsent.tsx
 * │
 * ├── ── LAYER 2: BUSINESS LOGIC ────────────────────────────────────────────
 * │   factories/
 * │   ├── tokens.ts                    ← ✅ Update file ini (green theme)
 * │   ├── ComponentFactory.tsx
 * │   └── SectionFactory.tsx
 * │
 * │   (designSystem.ts tidak masuk layer ini — lihat keterangan di bawah)
 * │
 * └── App.tsx / main.tsx / index.css
 *
 *
 * PENEMPATAN designSystem.ts:
 * ────────────────────────────
 * File ini adalah dokumentasi murni (tidak di-import komponen manapun).
 * Tidak ada folder styles/ di struktur project ini, jadi letakkan sejajar
 * dengan factories/ sebagai referensi tim developer:
 *
 *   frontend/src/factories/designSystem.ts   ← ✅ Taruh di sini
 *
 * Alasan: factories/ sudah menampung tokens.ts yang sifatnya sama
 * (konfigurasi/konstanta design), sehingga designSystem.ts cocok berada
 * di folder yang sama sebagai dokumentasi pendampingnya.
 *
 *
 * RINGKASAN PENEMPATAN AKHIR:
 * ────────────────────────────
 *   frontend/src/pages/LandingPage.tsx       ← halaman utama (Layer 1)
 *   frontend/src/factories/tokens.ts         ← design tokens (Layer 2, replace)
 *   frontend/src/factories/designSystem.ts   ← dokumentasi design system (Layer 2, baru)
 *
 *
 * ROUTING (App.tsx):
 * ──────────────────
 * import LandingPage from './pages/LandingPage'
 *
 * <Routes>
 *   <Route path="/"          element={<LandingPage />} />
 *   <Route path="/login"     element={<Login />} />
 *   <Route path="/register"  element={<Register />} />
 *   ...
 * </Routes>
 *
 *
 * COOKIE CONSENT — DATA YANG DISIMPAN (localStorage):
 * ─────────────────────────────────────────────────────
 * Key   : 'habittracker_cookie_consent'
 * Value (JSON):
 * {
 *   "accepted":    true,
 *   "timestamp":   "ISO string",
 *   "preferences": {
 *     "essential":   true,     // selalu true, tidak bisa dimatikan
 *     "analytics":   boolean,  // Google Analytics, dsb
 *     "marketing":   boolean,  // iklan, remarketing
 *     "preferences": boolean   // tema, bahasa, UI state
 *   }
 * }
 *
 * CARA MEMBACA CONSENT DI SERVICE/HOOK LAIN:
 * ────────────────────────────────────────────
 * // Contoh di NotificationService.ts atau StreakService.ts
 * const raw = localStorage.getItem('habittracker_cookie_consent')
 * const consent = raw ? JSON.parse(raw) : null
 * if (consent?.preferences?.analytics) {
 *   // inisialisasi Google Analytics / tracking
 * }
 */

export default {
  colorPalette,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  components,
  animations,
}