
export const tokens = {
  primary:          '#16a34a',
  primaryHover:     '#15803d',
  primaryDark:      '#14532d',
  primaryMid:       '#166534',
  primaryLight:     '#dcfce7',
  primaryLighter:   '#f0fdf4',
  primaryGlow:      'rgba(22,163,74,0.18)',
  primaryGlowSoft:  'rgba(22,163,74,0.10)',

  accent:           '#10b981',
  accentLight:      '#6ee7b7',

  bg:               '#f7faf8',
  bgAlt:            '#ffffff',
  white:            '#ffffff',
  border:           '#d1fae5',
  borderMid:        '#a7f3d0',
  borderNeutral:    '#e4e7ec',

  text:             '#0f1f12',
  textBody:         '#1e3a22',
  textMuted:        '#4b7a54',
  textLight:        '#86a98d',

  success:          '#16a34a',
  successBg:        '#dcfce7',
  error:            '#dc2626',
  errorBg:          '#fef2f2',
  warning:          '#f59e0b',
  warningBg:        '#fffbeb',

  fontHeading:      "'Syne', sans-serif",
  fontBody:         "'DM Sans', sans-serif",

  radiusXs:   '4px',
  radiusSm:   '8px',
  radius:     '12px',
  radiusLg:   '16px',
  radiusXl:   '20px',
  radiusFull: '9999px',

  shadow:     '0 2px 12px rgba(0,0,0,0.05)',
  shadowMd:   '0 4px 24px rgba(22,163,74,0.10)',
  shadowLg:   '0 12px 40px rgba(22,163,74,0.14)',
  shadowNav:  '0 2px 20px rgba(0,0,0,0.07)',

  transitionFast: 'all 0.15s ease',
  transitionBase: 'all 0.25s ease',
  transitionSlow: 'all 0.4s ease',
}

export type Tokens = typeof tokens
export default tokens