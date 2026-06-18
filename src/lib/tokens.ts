// Design tokens — extracted from the prototype inline-styles (DESIGN-SPEC §1).
// These are the source of truth for the ported views; do NOT use the repo's
// older Tailwind brand palette here (different hex values).

export const C = {
  bg: '#FBF8F1',
  ink: '#2A2620',
  accent: '#C0492E',
  surface: '#FFFFFF',
  surfaceWarm: '#F5F0E6',
  surfaceInput: '#FBF8F1',
  border: '#ECE5D8',
  borderInput: '#E2DACB',
  borderWarm: '#E7DFCF',
  textMuted: '#6A6356',
  textMuted2: '#8A8276',
  textMuted3: '#9A9286',
  textMuted4: '#A39A8B',
  textMuted5: '#A8A093',
  inkOnDark: '#F3EEE3',
  inkOnDark2: '#EDE6D6',
  accentSoftBg: '#F6E7E0',
  bundleCard: '#322D25',
  bundleBorder: '#423c31',
  posterPasse: '#F5F0E4',
  sceneWall: '#D9D0C1',
  strike: '#B0A899',
  success: '#3F7A4F',
  successBg: '#EEF4EC',
} as const

export const FONT_SERIF = "'Cormorant Garamond', serif"
export const FONT_SANS = "'Inter', sans-serif"

export const FREE_SHIP_THRESHOLD = 80 // € — EU free-shipping threshold (US/UK ship free; see §13)
export const BRAND_NAME = 'SizhuAtelier'

export const ACCENT_CTA_SHADOW = '0 14px 28px -12px rgba(192,73,46,0.6)'
export const CONTAINER = '1200px'
