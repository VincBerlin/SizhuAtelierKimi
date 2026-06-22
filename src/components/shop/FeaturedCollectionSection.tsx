import { Link } from 'react-router'
import { collectionPath } from '../../lib/collections'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// V2 homepage module 06 — "Featured Collection: Fire Horse 2026" (REQ-008). A
// light, striking dark banner teaser that links to the real limited-edition
// collection route (REQ-010) and the product. Honest framing — a collector's
// edition, ships ready to hang; not personalized, no precision/health claim.
export default function FeaturedCollectionSection() {
  const { t } = useT()
  return (
    <section style={{ background: C.ink, color: C.inkOnDark }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '64px 32px' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 14 }}>{t('home.firehorse.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(28px,3.4vw,42px)', color: C.inkOnDark, margin: '0 0 14px', lineHeight: 1.1 }}>{t('home.firehorse.title')}</h2>
          <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.7, color: '#A9A091', margin: '0 0 26px' }}>{t('home.firehorse.copy')}</p>
          <Link
            to={collectionPath('fire-horse-2026')}
            className="transition-[filter] hover:brightness-110"
            style={{ display: 'inline-block', background: C.accent, color: '#fff', textDecoration: 'none', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, padding: '13px 28px', borderRadius: 4 }}
          >
            {t('home.firehorse.cta')} →
          </Link>
        </div>
      </div>
    </section>
  )
}
