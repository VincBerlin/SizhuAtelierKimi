import { Link } from 'react-router'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// V2 homepage module 09 — "Inspiration / Gallery teaser" (REQ-008 / REQ-011
// AT-011-4). Links to the real /inspiration route. The full gallery (with
// placeholder-marked tiles) lives on /inspiration; this is the homepage entry.
export default function InspirationTeaserSection() {
  const { t } = useT()
  return (
    <section style={{ background: C.surfaceWarm, borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('home.inspiration.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: '0 0 12px', lineHeight: 1.15 }}>{t('home.inspiration.title')}</h2>
          <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.7, color: C.textMuted, margin: '0 0 24px' }}>{t('home.inspiration.copy')}</p>
          <Link
            to="/inspiration"
            className="transition-colors hover:text-[#A0341F]"
            style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none' }}
          >
            {t('home.inspiration.cta')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
