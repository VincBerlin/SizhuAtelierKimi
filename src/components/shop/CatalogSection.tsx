import { Link } from 'react-router'
import { products, featuredIds } from '../../lib/catalog'
import ProductCard from './ProductCard'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

export default function CatalogSection() {
  const { t } = useT()
  const featured = featuredIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 34, margin: 0 }}>{t('catalog.title')}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <Link
          to="/kollektion"
          className="transition-colors hover:border-[#C0492E] hover:text-[#C0492E]"
          style={{ display: 'inline-block', fontFamily: FONT_SANS, fontSize: 13, letterSpacing: '0.02em', color: C.ink, textDecoration: 'none', border: `1px solid ${C.borderInput}`, borderRadius: 999, padding: '11px 26px' }}
        >
          {t('catalog.more')}
        </Link>
      </div>
    </section>
  )
}
