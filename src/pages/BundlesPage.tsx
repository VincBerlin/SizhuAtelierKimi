import { useEffect } from 'react'
import BundlesSection from '../components/shop/BundlesSection'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

export default function BundlesPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main style={{ background: C.bg }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 8px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>Sets · Vorteilspreis</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>Bundles</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 560, margin: 0, lineHeight: 1.65 }}>
          Abgestimmte Sets — Poster und digitale Analyse kombiniert, zum Vorteilspreis.
        </p>
      </div>
      <BundlesSection />
    </main>
  )
}
