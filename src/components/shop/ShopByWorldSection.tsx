import { Link } from 'react-router'
import { collectionPath } from '../../lib/collections'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// V2 homepage module 03 — "Shop by product world" (REQ-008). Four curated entry
// cards, each linking to a real per-world collection route (REQ-010). No invented
// inventory: the slugs are the frozen MVP set from lib/collections.ts.
const WORLD_CARDS = [
  { key: 'bazi', slug: 'bazi-posters' },
  { key: 'tcm', slug: 'tcm-posters' },
  { key: 'wuxing', slug: 'wuxing-posters' },
  { key: 'personalized', slug: 'personalized-posters' },
] as const

export default function ShopByWorldSection() {
  const { t } = useT()
  return (
    <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('home.world.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: '0 0 10px', lineHeight: 1.15 }}>{t('home.world.title')}</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>{t('home.world.sub')}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        {WORLD_CARDS.map(({ key, slug }) => (
          <Link
            key={key}
            to={collectionPath(slug)}
            className="transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_30px_-20px_rgba(42,38,32,0.4)]"
            style={{ display: 'flex', flexDirection: 'column', gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, textDecoration: 'none' }}
          >
            <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, margin: 0, lineHeight: 1.2, color: C.ink }}>{t(`home.world.cards.${key}.title`)}</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.55, color: C.textMuted, margin: 0 }}>{t(`home.world.cards.${key}.desc`)}</p>
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent, marginTop: 4 }}>{t('home.world.cta')} →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
