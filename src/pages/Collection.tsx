import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { activeProducts, filterByWorld, productsByIds, type Product } from '../lib/catalog'
import { getCollectionConfig, type CollectionConfig } from '../lib/collections'
import ProductCard from '../components/shop/ProductCard'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'
import { useT } from '../i18n/I18nProvider'

/**
 * Reusable per-world collection template (REQ-009 / REQ-006-render / T-303).
 *
 * One component renders all eight MVP collection routes, driven entirely by the
 * declarative config in `lib/collections.ts`. The product grid is always real
 * catalog data filtered over `product_world` (REQ-013 AK-3) or a curated id list
 * for cross-world collections — never an invented assortment, never empty.
 *
 * Full inventory (AT-009-1), top to bottom: breadcrumb, back-nav, eyebrow, H1,
 * intro, hero/category visual slot, toolbar (filter + sort), product count,
 * product grid, pagination / show-more, SEO text block (H2 + paragraphs), FAQ,
 * trust block. The persistent <SiteFooter> chrome (App.tsx) completes the footer
 * slot. Stable `data-testid` anchors back the real-boundary tests.
 *
 * AT-009-2: the visible count and the pagination control are derived from the
 * SAME `visible` slice the grid maps — the count is never a dummy literal, it is
 * `visible.length`, so it cannot drift from the rendered cards.
 *
 * AT-009-4: the personalizable filter and the price sort are real refinements —
 * they recompute the slice and the grid re-renders fewer / re-ordered cards.
 *
 * An unknown slug redirects to the /collections hub (no thin 404 page).
 */

type SortKey = 'featured' | 'price-asc' | 'price-desc'

/** How many cards a collection shows before the "show more" control appears. */
const PAGE_SIZE = 4

/** Resolve the product grid for a config — curated ids win, else world filter. */
function resolveProducts(cfg: CollectionConfig): Product[] {
  if (cfg.productIds && cfg.productIds.length > 0) return productsByIds(cfg.productIds)
  if (cfg.world) return filterByWorld(activeProducts, cfg.world)
  return []
}

function sortProducts(list: Product[], sort: SortKey): Product[] {
  if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price)
  return list // 'featured' = config order
}

// M12 / REQ-026 — collection filter matrix. Style/room facet VALUES are derived
// per-collection from the REAL products (never invented); price buckets cover the
// real catalog range. NOTE (M13 reconciliation): size/format is NOT a collection
// product-facet — every poster ships in every size (server/pricing.js prices any
// poster id × size), so a size filter would not differentiate products. Size stays
// a nav path (M10 mega-menu) + PDP selector (M13); REQ-026's size-in-collection is
// PARTIAL / deferred (OQ-001) until per-product size availability actually differs.
const PRICE_BUCKETS: { id: string; label: string; test: (p: Product) => boolean }[] = [
  { id: 'lt45', label: 'unter 45 €', test: (p) => p.price < 45 },
  { id: 'mid', label: '45–59 €', test: (p) => p.price >= 45 && p.price < 60 },
  { id: 'gte60', label: 'ab 60 €', test: (p) => p.price >= 60 },
]

/** One labelled facet row (a filter dimension) in the collection toolbar. */
function FilterRow({ testid, label, nonFinal, children }: { testid: string; label: string; nonFinal?: boolean; children: ReactNode }) {
  return (
    <div data-testid={testid} role="group" aria-label={label} data-nonfinal={nonFinal ? 'true' : undefined} style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted2, minWidth: 108 }}>
        {label}{nonFinal && <span style={{ color: C.textMuted4, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> · vorläufig</span>}
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

/** A single toggle chip for a facet value. */
function Chip({ active, nonFinal, onClick, children }: { active: boolean; nonFinal?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      data-testid="collection-facet"
      data-active={active ? 'true' : undefined}
      data-nonfinal={nonFinal ? 'true' : undefined}
      aria-pressed={active}
      onClick={onClick}
      style={{ fontFamily: FONT_SANS, fontSize: 13, color: active ? '#fff' : C.ink, background: active ? C.accent : C.surface, border: `1px solid ${active ? C.accent : C.borderInput}`, borderRadius: 999, padding: '6px 14px', cursor: 'pointer' }}
    >
      {children}
    </button>
  )
}

// Batch #12 (#4/R7-Nachfix): Kollektionen, deren Produkte auf die zentrale
// Personalisierungsseite umgezogen sind — Deep-Links bleiben ohne 404. Als
// MAP vor den Hooks aufgelöst und erst NACH allen Hooks returned
// (rules-of-hooks: die frühen Returns standen vor useT/useState/useMemo).
const SLUG_REDIRECTS: Record<string, string> = {
  'bazi-posters': '/personalize',
  'personalized-posters': '/personalize',
  'compatibility-posters': '/personalize?type=couple',
  // Batch #12 R3 (#5): Premium-Analyse lebt auf der Personalisierungsseite.
  'analysis-pdfs': '/personalize?type=digital',
  bundles: '/bundles',
}

export default function Collection() {
  const { slug } = useParams<{ slug: string }>()
  const redirect = slug ? SLUG_REDIRECTS[slug] : undefined
  const cfg = slug && !redirect ? getCollectionConfig(slug) : undefined

  const { t } = useT()
  const [searchParams, setSearchParams] = useSearchParams()
  // M17 — the facet matrix (style/room/price) is URL-DRIVEN: the query string is
  // the source of truth, so a filtered view is shareable + back/forward-navigable
  // and consistent with the M16 hub deep-link contract (?style/?room[/?price]).
  const styleFilter = searchParams.get('style')
  const roomFilter = searchParams.get('room')
  const priceFilter = searchParams.get('price')
  const [sort, setSort] = useState<SortKey>('featured')
  // How many cards are revealed (pagination / show-more). Reset whenever the
  // collection or any filter changes so the count never carries over stale state.
  const [shownCount, setShownCount] = useState(PAGE_SIZE)

  const anyFilter = !!styleFilter || !!roomFilter || !!priceFilter

  // Toggle a facet in the URL (immutable update). Clearing a facet removes its
  // param entirely so the URL stays clean; every change snaps pagination back.
  function setFacet(key: 'style' | 'room' | 'price', value: string | null): void {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === null) next.delete(key)
      else next.set(key, value)
      return next
    })
    setShownCount(PAGE_SIZE)
  }

  function resetFilters(): void {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('style')
      next.delete('room')
      next.delete('price')
      return next
    })
    setShownCount(PAGE_SIZE)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    // Reset only LOCAL controls on collection change; the URL facets
    // (style/room/price) are intentionally left intact so a deep-link like
    // /collections/x?style=minimal is honored on load. In-app links that carry no
    // query naturally clear the facets (empty search → null filters).
    setSort('featured')
    setShownCount(PAGE_SIZE)
  }, [slug])

  const base = useMemo(() => (cfg ? resolveProducts(cfg) : []), [cfg])

  // Facets available in THIS collection — derived from the REAL products (never
  // invented). Size uses the canonical taxonomy sizes (non-final, OQ-001).
  const styleFacets = useMemo(() => [...new Set(base.map((p) => p.design_family))], [base])
  const roomFacets = useMemo(() => [...new Set(base.map((p) => p.use_case))], [base])
  // Price facets are derived per-collection too — only buckets that actually have
  // a product in THIS collection are offered (never an invariant global list).
  const priceFacets = useMemo(() => PRICE_BUCKETS.filter((b) => base.some(b.test)), [base])

  // Resolve + filter + sort. Style/room/price refine over real product fields;
  // the size refinement is non-final (see the PRICE_BUCKETS note above).
  const sorted = useMemo(() => {
    let filtered = base
    if (styleFilter) filtered = filtered.filter((p) => p.design_family === styleFilter)
    if (roomFilter) filtered = filtered.filter((p) => p.use_case === roomFilter)
    if (priceFilter) {
      const bucket = PRICE_BUCKETS.find((b) => b.id === priceFilter)
      if (bucket) filtered = filtered.filter(bucket.test)
    }
    // Honest faceting: with NO user filter active, guard against an empty base
    // (REQ-010 AK-3 — bad slug / empty world). With a user filter active, show the
    // REAL filtered result (which may be empty → an explicit empty state), NEVER
    // silently the full set — a fallback there would defeat the user's filter.
    const active = !!styleFilter || !!roomFilter || !!priceFilter
    const shown = active ? filtered : base
    return sortProducts(shown, sort)
  }, [base, styleFilter, roomFilter, priceFilter, sort])

  // The visible slice the grid maps. Count + pagination derive from THIS, so the
  // displayed number can never drift from the rendered cards (AT-009-2).
  const visible = useMemo(() => sorted.slice(0, shownCount), [sorted, shownCount])
  const hasMore = sorted.length > visible.length

  // Redirect-Slugs (nach den Hooks — rules-of-hooks) + unbekannter Slug → Hub.
  if (redirect) return <Navigate to={redirect} replace />
  if (!cfg) return <Navigate to="/collections" replace />

  return (
    <main data-testid="collection-page" style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '40px 32px 8px' }}>
        {/* Breadcrumb — internal links (REQ-010 AK-3) */}
        <nav
          data-testid="collection-breadcrumb"
          aria-label="Breadcrumb"
          style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: C.textMuted2, marginBottom: 18 }}
        >
          <Link to="/" style={{ color: C.textMuted2, textDecoration: 'none' }}>Start</Link>
          <span aria-hidden style={{ margin: '0 8px', color: C.textMuted4 }}>/</span>
          <Link to="/collections" style={{ color: C.textMuted2, textDecoration: 'none' }}>Kollektionen</Link>
          <span aria-hidden style={{ margin: '0 8px', color: C.textMuted4 }}>/</span>
          <span style={{ color: C.ink }}>{cfg.title}</span>
        </nav>

        {/* Back-nav — a distinct "return to all collections" affordance, separate
            from the breadcrumb (AT-009-1). */}
        <Link
          to="/collections"
          data-testid="collection-back"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT_SANS, fontSize: 13, color: C.accent, textDecoration: 'none', marginBottom: 16 }}
        >
          <span aria-hidden>←</span> Zurück zu allen Kollektionen
        </Link>

        {/* Eyebrow + H1 + intro */}
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{cfg.eyebrow}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>{cfg.title}</h1>
        <p data-testid="collection-intro" style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 620, margin: '0 0 24px', lineHeight: 1.65 }}>{cfg.intro}</p>
      </div>

      {/* Hero / category visual slot */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '0 32px 8px' }}>
        <div
          data-testid="collection-hero"
          style={{ border: `1px solid ${C.border}`, borderRadius: 4, background: C.surfaceWarm, padding: '36px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}
        >
          <span style={{ fontFamily: FONT_SERIF, fontSize: 28, color: C.ink, letterSpacing: '0.02em' }}>{cfg.heroLabel}</span>
        </div>
      </section>

      {/* Category toolbar + filter matrix (REQ-025 / REQ-026) */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 8px' }}>
        <div data-testid="collection-filters" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {styleFacets.length > 1 && (
            <FilterRow testid="collection-filter-style" label="Stil">
              {styleFacets.map((f) => (
                <Chip key={f} active={styleFilter === f} onClick={() => setFacet('style', styleFilter === f ? null : f)}>{t(`taxonomy.style.${f}`) || f}</Chip>
              ))}
            </FilterRow>
          )}
          {roomFacets.length > 1 && (
            <FilterRow testid="collection-filter-room" label="Raum & Anlass">
              {roomFacets.map((r) => (
                <Chip key={r} active={roomFilter === r} onClick={() => setFacet('room', roomFilter === r ? null : r)}>{t(`taxonomy.room.${r}`) || r}</Chip>
              ))}
            </FilterRow>
          )}
          {priceFacets.length > 1 && (
            <FilterRow testid="collection-filter-price" label="Preis">
              {priceFacets.map((b) => (
                <Chip key={b.id} active={priceFilter === b.id} onClick={() => setFacet('price', priceFilter === b.id ? null : b.id)}>{b.label}</Chip>
              ))}
            </FilterRow>
          )}
          {anyFilter && (
            <button type="button" data-testid="collection-filter-reset" onClick={resetFilters} style={{ alignSelf: 'flex-start', fontFamily: FONT_SANS, fontSize: 12.5, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textDecoration: 'underline' }}>Filter zurücksetzen</button>
          )}
        </div>
        <div
          data-testid="collection-toolbar"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '14px 0', marginTop: 12 }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_SANS, fontSize: 13.5, color: C.textMuted }}>
            Sortieren
            <select
              value={sort}
              data-testid="collection-sort"
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sortieren"
              style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: C.ink, padding: '6px 8px', border: `1px solid ${C.borderInput}`, borderRadius: 4, background: C.surface }}
            >
              <option value="featured">Empfohlen</option>
              <option value="price-asc">Preis aufsteigend</option>
              <option value="price-desc">Preis absteigend</option>
            </select>
          </label>
        </div>
      </section>

      {/* Product count — derived from the same `visible` slice the grid maps,
          so it can never drift from the rendered cards (AT-009-2). */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '20px 32px 0' }}>
        <p
          data-testid="collection-count"
          aria-live="polite"
          style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2, margin: 0 }}
        >
          {visible.length} {visible.length === 1 ? 'Produkt' : 'Produkte'}
        </p>
      </section>

      {/* Product grid (≥1, real catalog) */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '14px 32px 16px' }}>
        {sorted.length === 0 ? (
          /* Honest empty state — a user filter matched nothing; we say so and
             offer a reset rather than silently showing the unfiltered set. */
          <div data-testid="collection-empty" style={{ textAlign: 'center', padding: '48px 0', border: `1px dashed ${C.border}`, borderRadius: 4 }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.textMuted, margin: '0 0 14px' }}>Keine Produkte entsprechen den gewählten Filtern.</p>
            <button type="button" data-testid="collection-empty-reset" onClick={resetFilters} style={{ fontFamily: FONT_SANS, fontSize: 13.5, fontWeight: 600, color: C.accent, background: 'none', border: `1px solid ${C.borderInput}`, borderRadius: 999, padding: '8px 18px', cursor: 'pointer' }}>Filter zurücksetzen</button>
          </div>
        ) : (
          <>
            <div
              data-testid="collection-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 28 }}
            >
              {visible.map((p) => (
                <div data-testid="collection-product-card" data-product-id={p.id} key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {/* Pagination / show-more — reveals the next page; when nothing remains
                it states the full set is shown (the anchor is always present). */}
            <div
              data-testid="collection-pagination"
              style={{ display: 'flex', justifyContent: 'center', padding: '28px 0 0' }}
            >
              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setShownCount((n) => n + PAGE_SIZE)}
                  style={{ fontFamily: FONT_SANS, fontSize: 13.5, fontWeight: 600, color: C.ink, background: C.surface, border: `1px solid ${C.borderInput}`, borderRadius: 4, padding: '11px 24px', cursor: 'pointer' }}
                >
                  Mehr anzeigen ({sorted.length - visible.length})
                </button>
              ) : (
                <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted4 }}>
                  Alle {sorted.length} {sorted.length === 1 ? 'Produkt' : 'Produkte'} angezeigt
                </span>
              )}
            </div>
          </>
        )}
      </section>

      {/* SEO text block (H2 + paragraphs) */}
      <section
        data-testid="collection-seo"
        style={{ maxWidth: 820, margin: '0 auto', padding: '40px 32px 8px' }}
      >
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 30, color: C.ink, margin: '0 0 18px' }}>{cfg.seo.heading}</h2>
        {cfg.seo.body.map((para, i) => (
          <p key={i} style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.textMuted, lineHeight: 1.7, margin: '0 0 14px' }}>{para}</p>
        ))}
        {/* internal links to sibling worlds (REQ-010 AK-3) */}
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, margin: '8px 0 0' }}>
          <Link to="/collections" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>Alle Kollektionen ansehen →</Link>
        </p>
      </section>

      {/* FAQ */}
      <section
        data-testid="collection-faq"
        style={{ maxWidth: 820, margin: '0 auto', padding: '32px 32px 8px' }}
      >
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 26, color: C.ink, margin: '0 0 18px' }}>Häufige Fragen</h2>
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {cfg.faq.map((f, i) => (
            <div data-testid="collection-faq-item" key={i} style={{ borderBottom: `1px solid ${C.border}`, padding: '16px 2px' }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{f.q}</div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust block */}
      <section
        data-testid="collection-trust"
        style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '32px 32px 64px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
          {[
            { t: 'Auf Bestellung gefertigt', d: 'Archiv-Pigmentdruck in Museumsqualität, Produktion in 3 Werktagen.' },
            { t: 'Kostenloser Versand ab 80 €', d: 'Klimaneutraler Versand, weltweit. US & UK versandkostenfrei.' },
            { t: 'Sichere Bezahlung', d: 'Verschlüsselt über PayPal, Apple Pay und Google Pay.' },
          ].map((b, i) => (
            <div key={i}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 6 }}>{b.t}</div>
              <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: C.textMuted, lineHeight: 1.55, margin: 0 }}>{b.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
