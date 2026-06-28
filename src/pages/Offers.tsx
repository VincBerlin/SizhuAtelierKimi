import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link } from 'react-router'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'
import { useT } from '../i18n/I18nProvider'
import { OFFERS_SECTIONS, collectionPath, type OffersSection } from '../lib/collections'
import { productsByIds } from '../lib/catalog'
import ProductCarousel from '../components/shop/ProductCarousel'

/**
 * Offers / Sale / Campaign hub (T-305 / REQ-024) — ASSET-LIGHT curated hub.
 *
 * The hub holds SEVERAL curated sections (≥2, AT-024-1), each with the SAME
 * honest anatomy (AT-024-2):
 *   offers-section          — the distinct section anchor (data-section-id)
 *   offers-section-copy     — eyebrow + title + short curated text
 *   offers-section-visual   — asset-light placeholder (data-placeholder, AT-024-3)
 *   offers-section-slider   — a real ProductCarousel of curated catalog products
 *   offers-section-cta      — a CTA link to an EXISTING collection route
 *
 * It is NOT a "Coming Soon" placeholder, makes NO invented sale claims, no fake
 * discounts, no countdowns (FM-11/FM-13 discipline). Each section curates a real
 * catalog slice via `OFFERS_SECTIONS` and links onward to a live collection —
 * the only price signal is each card's own honest anchor → price.
 *
 * Asset-light (OQ-001 / CAN-014 / RISK-001): no campaign photography; every
 * visual slot is a clearly-marked generic placeholder and the page renders no
 * `/images/*.webp` product/campaign image. Real imagery is launch-blocking and
 * intentionally absent in this run (RL-IMAGES RED).
 *
 * The "Angebote" primary-nav entry (REQ-003 / T-201) already targets `/offers`
 * (AT-024-4) — this page is what that live route now renders.
 */

/** A single curated hub section: copy + asset-light visual + product slider + CTA. */
function HubSection({ section }: { section: OffersSection }): ReactElement {
  const { t } = useT()
  const products = productsByIds(section.productIds)
  const base = `offers.sections.${section.id}`

  return (
    <section
      data-testid="offers-section"
      data-section-id={section.id}
      style={{ marginTop: 56 }}
    >
      <div
        data-testid="offers-section-copy"
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}
      >
        <div style={{ maxWidth: 640 }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent, margin: 0 }}>
            {t(`${base}.eyebrow`)}
          </p>
          <h2 style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(24px, 3.4vw, 32px)', color: C.ink, margin: '8px 0 10px', fontWeight: 500, lineHeight: 1.15 }}>
            {t(`${base}.title`)}
          </h2>
          <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>
            {t(`${base}.text`)}
          </p>
        </div>

        {/* Section CTA — a real link onto an existing collection route. */}
        <Link
          data-testid="offers-section-cta"
          to={collectionPath(section.ctaSlug)}
          onClick={() => window.scrollTo(0, 0)}
          style={{
            flexShrink: 0, display: 'inline-block', padding: '12px 22px', borderRadius: 2,
            border: `1px solid ${C.ink}`, background: C.ink, color: C.bg,
            fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {t(`${base}.cta`)} →
        </Link>
      </div>

      {/* Asset-light visual band — a generic, clearly-marked placeholder, NEVER a
          fake campaign visual (CAN-014 / RISK-001). */}
      <div
        data-testid="offers-section-visual"
        data-placeholder="true"
        aria-hidden="true"
        style={{
          height: 96, borderRadius: 2, marginBottom: 24,
          border: `1px dashed ${C.border}`,
          background: `repeating-linear-gradient(45deg, ${C.surfaceWarm} 0 14px, transparent 14px 28px)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textMuted3 }}>
          {t('offers.placeholderLabel')}
        </span>
      </div>

      {/* The product slider — real catalog cards (asset-light per ProductCard). */}
      <div data-testid="offers-section-slider">
        <ProductCarousel products={products} />
      </div>
    </section>
  )
}

export default function Offers(): ReactElement {
  const { t } = useT()

  useEffect(() => {
    document.title = `${t('offers.title')} · SizhuAtelier`
  }, [t])

  return (
    <main data-testid="offers-page" data-route="/offers" style={{ background: C.bg, minHeight: '60vh' }}>
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 24px 80px' }}>
        <header style={{ maxWidth: 720 }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.accent, margin: 0 }}>
            {t('offers.eyebrow')}
          </p>
          <h1 style={{ fontFamily: FONT_SERIF, fontSize: 'clamp(30px, 5vw, 46px)', color: C.ink, margin: '12px 0 16px', fontWeight: 500 }}>
            {t('offers.title')}
          </h1>
          <p style={{ fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>
            {t('offers.intro')}
          </p>
        </header>

        {OFFERS_SECTIONS.map((section) => (
          <HubSection key={section.id} section={section} />
        ))}
      </section>
    </main>
  )
}
