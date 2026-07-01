import { Link } from 'react-router'
import { products, newArrivalsIds } from '../../lib/catalog'
import ProductCarousel from './ProductCarousel'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// M11 / REQ-018 — New Arrivals as a SEPARATE product slider (distinct from the
// Bestseller carousel), with its own CTA and real product links. Sourced from
// newArrivalsIds (real catalog SKUs) — no invented inventory.
export default function NewArrivalsSection() {
  const { t } = useT()
  const items = newArrivalsIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <section data-testid="home-new-arrivals" style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 40px' }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>{t('home.newArrivals.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 34, margin: 0 }}>{t('home.newArrivals.title')}</h2>
        </div>
        <Link
          to="/collections"
          className="transition-colors hover:border-[#C0492E] hover:text-[#C0492E]"
          style={{ display: 'inline-block', flexShrink: 0, fontFamily: FONT_SANS, fontSize: 13, letterSpacing: '0.02em', color: C.ink, textDecoration: 'none', border: `1px solid ${C.borderInput}`, borderRadius: 999, padding: '10px 22px' }}
        >
          {t('home.newArrivals.more')}
        </Link>
      </div>
      <ProductCarousel products={items} />
    </section>
  )
}
