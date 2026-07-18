import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { products } from '../lib/catalog'
import ProductCard from '../components/shop/ProductCard'
import FaqSection from '../components/shop/FaqSection'
import NewsletterSection from '../components/shop/NewsletterSection'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

/* Collections hub (REQ-021/022) — current MVP collections only (no Saju/Junishi).
   Each card links to the best available destination; the dedicated couple/gift
   flows deepen in later iterations. */
const COLLECTIONS = [
  { key: 'birthchart', img: '/images/posters/bazi-personal.webp', to: '/personalize' },
  { key: 'couple', img: '/images/gifts/wedding.webp', to: '/personalize' },
  { key: 'firehorse', img: '/images/posters/fire-horse.webp', to: '/product/8' },
  { key: 'digital', img: '/images/posters/tcm-elements.webp', to: '/digital' },
  { key: 'bundles', img: '/images/posters/wuxing-wall.webp', to: '/bundles' },
] as const

function CollectionCard({ ckey, img, to }: { ckey: string; img: string; to: string }) {
  const { t } = useT()
  return (
    <Link to={to} className="group" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
      <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', background: C.surfaceWarm }}>
        <img src={img} alt="" loading="lazy" className="transition-transform duration-500 group-hover:scale-[1.04]" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 20, color: C.ink, margin: '0 0 7px', lineHeight: 1.2 }}>{t(`coll.cards.${ckey}.title`)}</h3>
        <p style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>{t(`coll.cards.${ckey}.desc`)}</p>
        <span className="transition-colors group-hover:text-[#A0341F]" style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent }}>{t(`coll.cards.${ckey}.cta`)} →</span>
      </div>
    </Link>
  )
}

export default function Kollektion() {
  const { t } = useT()
  const [params] = useSearchParams()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // M16 / REQ-004..007 × REQ-026 — nav→filter deep-link handoff (closes the
  // disclosed PARTIAL). The mega-menu style/room facets resolve to
  // /collections?style=<design_family> and /collections?room=<use_case>
  // (resolveTaxonomyHref); the hub now CONSUMES that query and pre-filters the
  // all-posters grid to the matching REAL catalog products, with the active facet
  // shown + a reset. Size is the M13-reconciliation special case: every poster
  // ships in every size, so ?size=<id> does NOT narrow the grid — it is disclosed
  // ("available in this size"), never faked into a bogus filter.
  const styleFacet = params.get('style')
  const roomFacet = params.get('room')
  const sizeFacet = params.get('size')
  // ONLY style/room actually narrow the grid, so ONLY they count as an active
  // filter. Size is deliberately excluded: per the M13 reconciliation every poster
  // ships in every size, so ?size never hides products, never flips the hub into a
  // filtered view (no "Filtered by" banner, cards stay, heading unchanged) — it
  // surfaces an honest disclosure note only. This keeps the size axis from
  // masquerading as a real product filter.
  const facetActive = !!(styleFacet || roomFacet)

  const filtered = useMemo(() => {
    let list: typeof products = products
    if (styleFacet) list = list.filter((p) => p.design_family === styleFacet)
    if (roomFacet) list = list.filter((p) => p.use_case === roomFacet)
    return list
  }, [styleFacet, roomFacet])

  const facetLabel = styleFacet
    ? t(`taxonomy.style.${styleFacet}`) || styleFacet
    : roomFacet
      ? t(`taxonomy.room.${roomFacet}`) || roomFacet
      : ''
  const gridProducts = facetActive ? filtered : products

  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      {/* Collection hero */}
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 8px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('pages.kollEyebrow')}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>{t('pages.kollTitle')}</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 560, margin: '0 0 8px', lineHeight: 1.65 }}>{t('pages.kollIntro')}</p>
      </div>

      {/* M16 — size deep-link is DISCLOSED, never a filter (M13: uniform size). A
          ?size link lands on the NORMAL hub (cards + full grid) plus this honest
          note — no narrowing, no "Filtered by" framing. */}
      {sizeFacet && (
        <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '8px 32px 0' }}>
          <p data-testid="hub-size-note" style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: C.textMuted2, margin: 0, border: `1px solid ${C.border}`, borderRadius: 4, background: C.surfaceWarm, padding: '10px 14px' }}>{t('coll.filter.sizeNote')}</p>
        </section>
      )}

      {/* M16 — active nav→filter banner (ONLY style/room, which actually narrow) */}
      {facetActive && (
        <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '8px 32px 0' }}>
          <div data-testid="hub-active-filter" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, border: `1px solid ${C.border}`, borderRadius: 4, background: C.surfaceWarm, padding: '12px 16px' }}>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted2 }}>{t('coll.filter.label')}</span>
            <span data-testid="hub-facet-value" style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.ink }}>{facetLabel}</span>
            <span data-testid="hub-filter-count" style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted }}>· {gridProducts.length} {t('coll.filter.posters')}</span>
            <Link to="/collections" data-testid="hub-filter-reset" style={{ marginLeft: 'auto', fontFamily: FONT_SANS, fontSize: 12.5, color: C.accent, textDecoration: 'underline' }}>{t('coll.filter.reset')}</Link>
          </div>
        </section>
      )}

      {/* Collection cards — hidden when a facet deep-link is active so the filtered
          listing is the focus (a nav facet click lands ON the pre-filtered grid). */}
      {!facetActive && (
        <section data-testid="hub-collection-cards" style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {COLLECTIONS.map((c) => (
              <CollectionCard key={c.key} ckey={c.key} img={c.img} to={c.to} />
            ))}
          </div>
        </section>
      )}

      {/* All / filtered posters */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '40px 32px 16px' }}>
        <h2 data-testid="hub-posters-heading" style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 30, color: C.ink, margin: '0 0 24px' }}>{facetActive ? facetLabel : t('coll.allPosters')}</h2>
        {gridProducts.length === 0 ? (
          <div data-testid="hub-filter-empty" style={{ border: `1px solid ${C.border}`, borderRadius: 4, background: C.surface, padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.textMuted, margin: '0 0 12px' }}>{t('coll.filter.empty')}</p>
            <Link to="/collections" data-testid="hub-empty-reset" style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.accent, textDecoration: 'underline' }}>{t('coll.filter.reset')}</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 28 }}>
            {gridProducts.map((p) => (
              <div key={p.id} data-testid="hub-poster-card" data-product-id={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ + Newsletter (REQ-021 #10, #11) */}
      <FaqSection />
      <NewsletterSection />
    </main>
  )
}
