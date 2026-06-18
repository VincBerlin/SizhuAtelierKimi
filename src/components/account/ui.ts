import type { CSSProperties } from 'react'
import { C, FONT_SANS } from '../../lib/tokens'

// Shared inline styles for the account dashboard sections (keeps every section
// visually in sync with the existing design system — tokens only, no new colors).
export const acctInput: CSSProperties = { border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: FONT_SANS, background: C.surfaceInput, color: C.ink, width: '100%', boxSizing: 'border-box' }
export const acctCard: CSSProperties = { background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }
export const acctLabel: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: C.textMuted2 }
export const acctPrimary: CSSProperties = { background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '12px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: FONT_SANS }
export const acctGhost: CSSProperties = { background: 'none', border: `1px solid ${C.borderInput}`, cursor: 'pointer', padding: '9px 14px', borderRadius: 8, fontSize: 13, fontFamily: FONT_SANS, color: C.ink }
export const acctLink: CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontFamily: FONT_SANS, fontSize: 13, padding: 0 }
export const sectionTitle: CSSProperties = { fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 14 }
