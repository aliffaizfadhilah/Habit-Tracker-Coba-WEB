


export const colorPalette = {
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

  dark: {
    900: '#0b1a0e',
    800: '#0f1f12',
    700: '#14532d',
    overlay: 'rgba(11,26,14,0.85)',
  },
}


export const typography = {
  family: {
    heading: "'Syne', sans-serif",
    body:    "'DM Sans', sans-serif",
    mono:    "'JetBrains Mono', monospace",
  },

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

  weight: {
    light:   300,
    normal:  400,
    medium:  500,
    semi:    600,
    bold:    700,
    black:   800,
  },

  tracking: {
    tight:   '-1px',
    tighter: '-2px',
    wide:    '0.3px',
    wider:   '0.5px',
    widest:  '1px',
  },

  leading: {
    tight:   1.08,
    snug:    1.15,
    normal:  1.5,
    relaxed: 1.7,
    loose:   1.8,
  },
}


export const spacing = {

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


export const radius = {
  xs:   '4px',   // badge kecil, tag
  sm:   '8px',   // tombol, input field
  md:   '12px',  // card kecil, modal inner
  lg:   '16px',  // feature card, service card
  xl:   '20px',  // banner, hero box
  '2xl': '24px', // mockup card besar
  full: '9999px', // pill, avatar, toggle
}


export const shadows = {

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


export const transitions = {
  fast:   'all 0.15s ease',
  base:   'all 0.25s ease',
  slow:   'all 0.4s ease',
  bounce: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
}


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


export const breakpoints = {

  sm:  '480px',
  md:  '768px',   // ← titik utama mobile → desktop
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1440px',
}


export const components = {
  navbar: {
    height:          '68px',
    background:      'rgba(255,255,255,0.93)',
    backgroundScroll: 'rgba(255,255,255,0.98)',
    borderColor:     '#d1fae5',
    backdropFilter:  'blur(16px)',
  },

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

  card: {
    bg:           '#ffffff',
    border:       '1px solid #d1fae5',
    borderRadius: '16px',
    padding:      '32px 28px',
    shadow:       '0 2px 12px rgba(0,0,0,0.05)',
    borderHover:  '#16a34a',
    shadowHover:  '0 12px 40px rgba(22,163,74,0.14)',
  },

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

  faq: {
    borderColor:    '#d1fae5',
    questionColor:  '#0f1f12',
    accentColor:    '#16a34a',
    answerColor:    '#4b7a54',
  },

  cookieConsent: {
    bg:           '#ffffff',
    border:       '1px solid #d1fae5',
    shadow:       '0 -4px 40px rgba(0,0,0,0.08)',
    borderRadius: '16px',
    toggleActive: '#16a34a',
    toggleInactive: '#d1d5db',
  },
}


export const animations = {

  fadeUp:    { duration: '0.5s', easing: 'ease', delay: '0s' },
  fadeIn:    { duration: '0.9s', easing: 'ease', delay: '0s' },
  float:     { duration: '5s',   easing: 'ease', delay: '0s', iteration: 'infinite' },
  pulse:     { duration: '8s',   easing: 'ease', delay: '0s', iteration: 'infinite' },
  slideDown: { duration: '0.2s', easing: 'ease', delay: '0s' },
  stagger:   { baseDelay: 0.08, unit: 's' }, // per item: i * 0.08s
}


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