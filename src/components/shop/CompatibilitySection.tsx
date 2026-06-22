import { Link } from 'react-router'
import { collectionPath } from '../../lib/collections'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// V2 homepage module 07 — "Couples / Compatibility" (REQ-008). A light teaser
// that links to the real compatibility collection (REQ-010) and into the
// personalization flow. Honest framing — a symbolic artwork inspired by shared
// birth data, not a precise computed chart.
export default function CompatibilitySection() {
  const { t } = useT()
  return (
    <section style={{ background: C.surfaceWarm, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('home.compatibility.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: '0 0 12px', lineHeight: 1.15 }}>{t('home.compatibility.title')}</h2>
          <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.7, color: C.textMuted, margin: '0 0 24px' }}>{t('home.compatibility.copy')}</p>
          <div className="flex flex-wrap" style={{ gap: 14 }}>
            <Link
              to={collectionPath('compatibility-posters')}
              className="transition-colors hover:border-[#C0492E] hover:text-[#C0492E]"
              style={{ display: 'inline-block', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', color: C.ink, textDecoration: 'none', border: `1px solid ${C.borderInput}`, borderRadius: 999, padding: '11px 24px' }}
            >
              {t('home.compatibility.ctaCollection')}
            </Link>
            <Link
              to="/personalize"
              className="transition-[filter] hover:brightness-110"
              style={{ display: 'inline-block', background: C.accent, color: '#fff', textDecoration: 'none', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, padding: '11px 24px', borderRadius: 999 }}
            >
              {t('home.compatibility.ctaPersonalize')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
