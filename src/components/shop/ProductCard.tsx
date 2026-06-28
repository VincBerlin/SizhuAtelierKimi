import type { ReactElement } from 'react'
import { Link } from 'react-router'
import PosterScene from './PosterScene'
import StarRating from './StarRating'
import { euro, de } from '../../lib/format'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'
import { COMMERCE_ENABLED, REVIEWS_ENABLED } from '../../lib/config'
import type { Product } from '../../lib/catalog'

/**
 * Product Card (T-302 / REQ-023) — ASSET-LIGHT anatomy.
 *
 * The whole card is EXACTLY ONE CTA link to the PDP (`/product/:id`) — a single,
 * unambiguous, addressable target (no div+programmatic navigate, which was a
 * dead, un-addressable CTA in V2). Anatomy parts carry stable `data-*` anchors:
 *   card-image  — asset-light placeholder image field (data-placeholder)
 *   card-title  — product title
 *   card-claim  — short claim (present on EVERY card)
 *   card-price  — formatted price
 *   card-cta    — the visible CTA affordance
 *   card-badge  — OPTIONAL discount badge (absent when no anchor — allowed)
 *
 * ASSET-LIGHT (REQ-023 / FM-11 / CAN-014 / RISK-001): the image field is a
 * generic placeholder and NEVER renders a real `/images/*.webp` product photo —
 * the personalizable branch shows the generated BaZi poster (a render, not a
 * photo); the non-personalizable branch shows a tonal placeholder panel. Real
 * imagery is launch-blocking (OQ-001) and intentionally absent in this run.
 *
 * SOCIAL-PROOF GATE (M2 invariant — UNCHANGED): the SAME switch as the PDP
 * (`REVIEWS_ENABLED && reviews > 0`). Until real reviews exist (OQ-004 RED-carry)
 * NO stars / rating / bought-count are shown — placeholder `rating`/`sold`
 * numbers are never surfaced as invented social proof. Do NOT soften this.
 */
export default function ProductCard({ product }: { product: Product }): ReactElement {
  const { t, lang } = useT()
  const hasAnchor = product.anchor != null
  const showReviews = REVIEWS_ENABLED && product.reviews > 0
  const starPct = (product.rating / 5) * 100 + '%'
  const personalizable = product.personalizable !== false
  // Short claim on EVERY card: the personalization line for personalizable SKUs,
  // else the product's own first catalog bullet (real copy — nothing invented).
  const claim = personalizable ? t('card.personalLine') : product.bullets[0] ?? ''

  const badge =
    COMMERCE_ENABLED && hasAnchor ? (
      <span
        data-testid="card-badge"
        style={{ position: 'absolute', top: 14, left: 14, background: C.accent, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '5px 10px', borderRadius: 4, zIndex: 2 }}
      >
        −{euro((product.anchor as number) - product.price)}
      </span>
    ) : null

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid="card-cta"
      onClick={() => window.scrollTo(0, 0)}
      style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}
    >
      {personalizable ? (
        // Asset-light field: a generated BaZi render (NOT a photo), so it is a
        // legitimate placeholder for the personalized poster the customer creates.
        <div data-testid="card-image" data-placeholder="true">
          <PosterScene poster={product.poster} hover aspect="3 / 4">
            {badge}
          </PosterScene>
        </div>
      ) : (
        // Asset-light field: a generic tonal panel — NO real product photo. The
        // category label keeps it informative without implying a finished visual.
        <div
          data-testid="card-image"
          data-placeholder="true"
          style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', border: `1px solid ${C.border}`, background: `repeating-linear-gradient(135deg, ${C.surfaceWarm}, ${C.surfaceWarm} 14px, ${C.bg} 14px, ${C.bg} 28px)` }}
        >
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted4 }}>
            {product.category}
          </span>
          {badge}
        </div>
      )}
      <div style={{ padding: '16px 2px 0' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted4, marginBottom: 5 }}>{product.category}</div>
        <h3 data-testid="card-title" style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 21, margin: '0 0 6px', lineHeight: 1.15 }}>{t(`content.products.${product.id}.title`)}</h3>
        <p data-testid="card-claim" style={{ fontSize: 12.5, color: C.textMuted2, margin: '0 0 10px', lineHeight: 1.45 }}>{claim}</p>
        {showReviews && (
          <div data-testid="card-social-proof" style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <StarRating pct={starPct} />
            <span style={{ fontSize: 12, color: C.textMuted2 }}>{lang === 'EN' ? product.rating.toFixed(1) : product.rating.toFixed(1).replace('.', ',')} · {de(product.sold)}× {t('card.bought')}</span>
          </div>
        )}
        {COMMERCE_ENABLED ? (
          <div data-testid="card-price" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{euro(product.price)}</span>
            {hasAnchor && <span style={{ fontSize: 14, color: C.strike, textDecoration: 'line-through' }}>{euro(product.anchor as number)}</span>}
          </div>
        ) : (
          <span data-testid="card-price" style={{ fontSize: 12, letterSpacing: '0.04em', color: C.textMuted3 }}>{t('preview.soon')}</span>
        )}
        <div data-testid="card-cta-label" style={{ marginTop: 12, fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent }}>{personalizable ? t('card.personalize') : t('card.shop')} →</div>
      </div>
    </Link>
  )
}
