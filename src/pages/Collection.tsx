import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { products, filterByWorld, productsByIds, type Product } from '../lib/catalog'
import { getCollectionConfig, type CollectionConfig } from '../lib/collections'
import ProductCard from '../components/shop/ProductCard'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

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
  if (cfg.world) return filterByWorld(products, cfg.world)
  return []
}

function sortProducts(list: Product[], sort: SortKey): Product[] {
  if (sort === 'price-asc') return [...list].sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return [...list].sort((a, b) => b.price - a.price)
  return list // 'featured' = config order
}

export default function Collection() {
  const { slug } = useParams<{ slug: string }>()
  const cfg = slug ? getCollectionConfig(slug) : undefined

  const [personalizableOnly, setPersonalizableOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('featured')
  // How many cards are revealed (pagination / show-more). Reset whenever the
  // collection or the filter changes so the count never carries over stale state.
  const [shownCount, setShownCount] = useState(PAGE_SIZE)

  useEffect(() => {
    window.scrollTo(0, 0)
    setShownCount(PAGE_SIZE)
    setPersonalizableOnly(false)
    setSort('featured')
  }, [slug])

  // Resolve + filter + sort. Always ≥1 in the base set per config (REQ-010 AK-3);
  // the personalizable toggle is purely a display refinement that we guard so the
  // grid can still show the base set rather than ever rendering empty.
  const base = useMemo(() => (cfg ? resolveProducts(cfg) : []), [cfg])
  const sorted = useMemo(() => {
    const filtered = personalizableOnly
      ? base.filter((p) => p.personalizable !== false)
      : base
    // Defensive: never let a refinement empty an otherwise-stocked collection.
    const shown = filtered.length > 0 ? filtered : base
    return sortProducts(shown, sort)
  }, [base, personalizableOnly, sort])

  // The visible slice the grid maps. Count + pagination derive from THIS, so the
  // displayed number can never drift from the rendered cards (AT-009-2).
  const visible = useMemo(() => sorted.slice(0, shownCount), [sorted, shownCount])
  const hasMore = sorted.length > visible.length

  // Toggling the filter must not strand the user on a higher page than the new
  // (smaller) result set has — snap back to the first page.
  function onToggleFilter(checked: boolean): void {
    setPersonalizableOnly(checked)
    setShownCount(PAGE_SIZE)
  }

  // Unknown slug → back to the hub (no empty/thin collection page).
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

      {/* Toolbar: filter + sort */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 8px' }}>
        <div
          data-testid="collection-toolbar"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '14px 0' }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_SANS, fontSize: 13.5, color: C.textMuted, cursor: 'pointer' }}>
            <input
              type="checkbox"
              data-testid="collection-filter"
              checked={personalizableOnly}
              onChange={(e) => onToggleFilter(e.target.checked)}
              aria-label="Nur personalisierbare anzeigen"
            />
            Nur personalisierbare
          </label>
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
