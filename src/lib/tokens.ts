// Design tokens — extracted from the prototype inline-styles (DESIGN-SPEC §1).
// These are the source of truth for the ported views; do NOT use the repo's
// older Tailwind brand palette here (different hex values).

export const C = {
  bg: '#FBF8F1',
  ink: '#2A2620',
  accent: '#C0492E',
  // Hover/active state of the one canonical Terracotta accent — a DARKER shade of
  // the same hue (#C0492E ≈ hue 11°, #A0341F ≈ hue 10°), NOT a second accent.
  // Consumed by the inline-style pages (Home/About/Contact) for the accent hover.
  // NOTE: several V2 shop components still hard-code the equivalent
  // `hover:text-[#A0341F]` Tailwind literal; migrating those onto this token is a
  // tracked DRY follow-up — out of REQ-017's orange/gold scope (#A0341F is
  // terracotta-hue, not orange/gold), so not part of this milestone.
  accentHover: '#A0341F',
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

// BaZi-configurator poster background palette (REQ-018 / T-404).
// EXACTLY these 5 hex — no extra, none missing (AT-018-1). It lives here in
// tokens.ts on purpose: bazi.ts stays a placeholder and must NOT own UI palette
// data. The configurator + the /personalize live preview both read this single
// instance, so a swatch list can never drift from the token source.
export interface PosterBgSwatch {
  name: string
  hex: string
}
export const POSTER_BG_PALETTE: readonly PosterBgSwatch[] = [
  { name: 'Ink', hex: '#171C20' },
  { name: 'Graphite', hex: '#2B3034' },
  { name: 'Soft Line', hex: '#70716C' },
  { name: 'Soft White', hex: '#F8F4EE' },
  { name: 'Parchment', hex: '#EFE5D8' },
] as const

/** Resolve a poster-background swatch label from its hex (REQ-018). Falls back to
 *  the first palette entry, so an unrecognised hex can never write an empty
 *  background field into an order line. */
export const posterBgName = (hex: string): string =>
  POSTER_BG_PALETTE.find((p) => p.hex === hex)?.name ?? POSTER_BG_PALETTE[0].name

export const FREE_SHIP_THRESHOLD = 80 // € — EU free-shipping threshold (US/UK ship free; see §13)
export const BRAND_NAME = 'SizhuAtelier'

export const ACCENT_CTA_SHADOW = '0 14px 28px -12px rgba(192,73,46,0.6)'
export const CONTAINER = '1200px'
