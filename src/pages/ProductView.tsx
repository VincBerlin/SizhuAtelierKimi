import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import Poster from '../components/Poster'
import PosterScene from '../components/shop/PosterScene'
import StarRating from '../components/shop/StarRating'
import Configurator from '../components/shop/Configurator'
import { getProduct, products, activeProducts, faqDefs } from '../lib/catalog'
import { isPersonalizable, productKind } from '../lib/productTypes'
// Batch #12 R4 (#10): EIN Format-System — auch Katalog-PDPs verkaufen die
// cm-Formate (30×40/50×70/70×100); die A-Serie bleibt nur server-seitig für
// Alt-Warenkörbe gültig (pricing.js kennt beide).
import { computeChart, personalizedSizes as sizes, frames, type PosterData } from '../lib/bazi'
import { birthTimeMeta } from '../lib/personalization'
import { useShopStore, useMoney } from '../store/ShopStore'
import { useT } from '../i18n/I18nProvider'
import { COMMERCE_ENABLED, REVIEWS_ENABLED } from '../lib/config'
import { posterProductId, buildVariantId } from '../lib/checkout'
import { track, EVENTS } from '../lib/analytics'
import { de } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, FREE_SHIP_THRESHOLD, ACCENT_CTA_SHADOW, CONTAINER } from '../lib/tokens'

export default function ProductView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cfg, addItem, showToast, openFaqId, setOpenFaqId } = useShopStore()
  const money = useMoney()
  const { t, lang } = useT()
  // M13 / REQ-008/028 — size for the NON-personalizable PDP path (ready-to-ship
  // SKUs). Personalizable products carry size in the configurator (cfg.size).
  // Size availability/pricing stays NON-FINAL (OQ-001).
  const [pdpSize, setPdpSize] = useState('50x70')
  // Batch #12 R5 (#9): Rahmen-Achse auch für Ready-to-ship-Poster — ohne sie
  // ist die Gelato-Produkt-Variante (PRODUCT_UIDS: Format×Rahmen) nicht
  // bestimmbar. Preisneutral (server/pricing.js ignoriert die frame-Achse).
  const [pdpFrameHex, setPdpFrameHex] = useState(frames[0].hex)

  const prod = getProduct(Number(id)) ?? products[0]
  // Batch #12 (#4/#14): stillgelegte Personalisierungs-Duplikate leiten auf die
  // ZENTRALE Personalisierungsseite um — alte Links bleiben ohne 404 gültig.
  if (prod.retired) {
    return <Navigate to={prod.id === 15 ? '/personalize?type=couple' : '/personalize'} replace />
  }
  // SINGLE source of truth for the personalization gate (REQ-007 / REQ-025):
  // reads ONLY the explicit `personalizable` flag, never `personalization_level`
  // — the FM-04 trap is treating Fire Horse's 'yearly' tier as personalizable.
  const personalizable = isPersonalizable(prod)
  const kind = productKind(prod)
  // Review-gate (REQ-008 / AT-008-3, OQ-004 RED-carry): a review block may only
  // render when reviews are globally enabled AND this product has a real,
  // non-zero review count. Until then NO stars / review summary are shown — the
  // catalog's placeholder `rating`/`reviews` are never surfaced as social proof.
  const showReviews = REVIEWS_ENABLED && prod.reviews > 0

  useEffect(() => { window.scrollTo(0, 0); setPdpSize('50x70'); setPdpFrameHex(frames[0].hex) }, [id])

  // PDP-view funnel event (T-701, instrumentation only — RL-EVENT RED). Keyed on
  // the resolved product id so it fires once per product view, not per re-render.
  useEffect(() => { track(EVENTS.pdpView, { id: prod.id }) }, [prod.id])

  // Empty time → disclosed noon fallback (REQ-018). place + the flag are threaded
  // into the placeholder chart (accepted, not used to vary it — ADR-002 pt.3/4).
  const birthTimeUnknown = !cfg.time
  const bt = birthTimeMeta(cfg.time, birthTimeUnknown)
  const chart = computeChart(cfg.date, bt.time, cfg.place, birthTimeUnknown)
  const livePoster: PosterData = { frame: cfg.frameHex, bg: cfg.bgHex, name: cfg.name || 'Dein Name', element: chart.element, animal: chart.animal, pillars: chart.pillars }
  // M13 — size is a first-class axis on EVERY PDP. Personalizable → cfg.size (the
  // configurator); non-personalizable → the standalone pdpSize selector. The
  // server (server/pricing.js) already prices size deltas for ANY poster id, so
  // the money path is UNCHANGED — the client just wires the size in for ready-to-
  // ship SKUs (default A2 = delta 0 = base price, no regression).
  const size = sizes.find((z) => z.id === (personalizable ? cfg.size : pdpSize)) ?? sizes[1]
  const livePrice = prod.price + size.delta
  const liveAnchor = prod.anchor != null ? prod.anchor + size.delta : null
  const starPct = (prod.rating / 5) * 100 + '%'
  // Batch #12 R4 (#11/#15): Empfehlungen NUR aus aktiven Produkten — die
  // soft-retirten BaZi-Duplikate (R2) erschienen hier weiter als Karten.
  const related = activeProducts.filter((p) => p.id !== prod.id).slice(0, 3)
  // Breadcrumb trail: Home → the product's world collection → this product. The
  // world→slug map points only at EXISTING /collections routes (no dead link).
  const worldSlug: Record<string, string> = { bazi: 'bazi-posters', tcm: 'tcm-posters', wuxing: 'wuxing-posters' }
  const collectionSlug = kind === 'fire-horse' ? 'fire-horse-2026' : worldSlug[prod.product_world] ?? 'bazi-posters'
  const ratingTxt = lang === 'EN' ? prod.rating.toFixed(1) : prod.rating.toFixed(1).replace('.', ',')
  const bullets = (t(`content.products.${prod.id}.bullets`) as string[]) || []

  // Operator-Vorgabe 2026-07-13: die Paar-SKU (personalization_level 'couple')
  // braucht ZWEI Geburtsdatensätze — der Single-Konfigurator dieser PDP kann
  // das nicht ehrlich abbilden. Der CTA führt in den vollständigen Paar-Flow
  // (/personalize?type=couple → /api/match → exaktes Paar-Chart → Warenkorb).
  const isCoupleSku = prod.personalization_level === 'couple'

  const addToCart = () => {
    const title = t(`content.products.${prod.id}.title`)
    if (isCoupleSku) {
      navigate('/personalize?type=couple')
      window.scrollTo(0, 0)
      return
    }
    if (!personalizable) {
      // Non-personalizable (Fire Horse / TCM lehrposter): NO birth data, but M13
      // gives it a first-class size axis. Size + frame travel in the variantId so
      // the server prices authoritatively AND the fulfillment can resolve the
      // Gelato productUid (Format×Rahmen) — R5 (#9).
      const frameName = t(`options.frames.${pdpFrameHex}`)
      addItem({ title, price: livePrice, qty: 1, poster: null, image: prod.image, meta: `${prod.category} · ${size.label} · ${frameName}`, productId: posterProductId(prod.id), variantId: buildVariantId({ size: size.id, frame: pdpFrameHex }) })
      showToast(t('cart.toastAdded'))
      return
    }
    // Same required-field discipline as the /personalize flow (REQ-009/016): don't
    // add a half-personalized line that would only be caught later at checkout.
    if (!cfg.name.trim() || !cfg.date || !cfg.place.trim()) { showToast(t('personalize.errFix')); return }
    const frameName = t(`options.frames.${cfg.frameHex}`)
    const bgName = t(`options.backgrounds.${cfg.bgHex}`)
    // posterBg (REQ-018 5-Hex-Palette) entfernt — Operator-Vorgabe 2026-07-13.
    // place/date/time + the canonical birthTimeUnknown flag are carried so the
    // planned calculation API can dock without loss (REQ-004 AK-1).
    // sizeId zusätzlich zum Label (R4 #10): der Druckpfad mappt über die ID.
    const personalization = { date: cfg.date, time: bt.time, timeDisplay: bt.timeDisplay, birthTimeUnknown: bt.birthTimeUnknown, unknownTime: bt.unknownTime, timeFallbackUsed: bt.timeFallbackUsed, fallbackReason: bt.fallbackReason, place: cfg.place, name: cfg.name.trim(), palette: bgName, frame: frameName, size: size.label, sizeId: size.id }
    addItem({ title, price: livePrice, qty: 1, poster: livePoster, meta: `${frameName} · ${bgName} · ${size.label}`, personalization, productId: posterProductId(prod.id), variantId: buildVariantId({ size: size.id, frame: cfg.frameHex }) })
    showToast(t('cart.toastAdded'))
  }

  const placeholderThumb = (label: string) => {
    // Gate B (security): render real JSX instead of dangerouslySetInnerHTML. The
    // labels carry only a literal <br/>; split on it and render <br/> elements so
    // the innerHTML sink is gone and the surface stays immune to future interpolation.
    const lines = label.split(/<br\s*\/?>/i)
    return (
      <div style={{ aspectRatio: '4 / 5', background: '#F2ECE0', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted5, textAlign: 'center', padding: 8 }}>
          {lines.map((ln, i) => (
            <span key={i}>{i > 0 && <br />}{ln}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main data-testid="pdp" data-personalizable={personalizable} data-product-kind={kind} style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 64px' }}>
      <nav data-testid="pdp-breadcrumb" aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 12.5, color: C.textMuted2, fontFamily: FONT_SANS, padding: '4px 0' }}>
        <Link to="/" style={{ color: C.textMuted2, textDecoration: 'none' }}>{t('nav.home')}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/collections/${collectionSlug}`} style={{ color: C.textMuted2, textDecoration: 'none' }}>{prod.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" style={{ color: C.ink }}>{t(`content.products.${prod.id}.title`)}</span>
      </nav>
      <button onClick={() => { navigate('/'); window.scrollTo(0, 0) }} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted2, padding: '8px 0', fontFamily: FONT_SANS }}>{t('product.back')}</button>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" style={{ marginTop: 8 }}>
        <div className="lg:sticky lg:top-24">
          {personalizable ? (
            <div data-testid="pdp-gallery">
              {/* Poster-BG-Palette entfernt (Operator 2026-07-13) — feste neutrale Fläche. */}
              <div data-testid="pdp-chart-preview">
                <PosterScene poster={livePoster} scene="plain" aspect="4 / 5" bg={C.surfaceWarm} />
                <div className="grid grid-cols-3 gap-3" style={{ marginTop: 12 }}>
                  <PosterScene poster={livePoster} scene="wall" aspect="4 / 5" />
                  {placeholderThumb(t('product.detail'))}
                  {placeholderThumb(t('product.lifestyle'))}
                </div>
                <p style={{ fontSize: 12, color: C.textMuted5, margin: '12px 2px 0', lineHeight: 1.5 }}>{t('product.caption')}</p>
              </div>
            </div>
          ) : (
            // Asset-light gallery for ready-to-ship SKUs (FM-11 / RISK-001 /
            // RL-IMAGES RED): a marked generic placeholder, never a real
            // /images/*.webp photo that would read as the finished product.
            <div data-testid="pdp-gallery" data-placeholder="true" style={{ aspectRatio: '4 / 5', border: `1px solid ${C.border}`, overflow: 'hidden', background: C.surfaceWarm, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted5, textAlign: 'center', padding: 16 }}>{prod.category}</span>
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted4, marginBottom: 8 }}>{prod.category}</div>
          <h1 data-testid="pdp-name" style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 36, lineHeight: 1.1, margin: '0 0 14px' }}>{t(`content.products.${prod.id}.title`)}</h1>
          {/* Review block is gated (REQ-008 / AT-008-3, OQ-004): no stars and no
              review/sold summary until real reviews exist — placeholder numbers
              must never read as social proof. */}
          {showReviews && (
            <div data-testid="pdp-reviews" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18, flexWrap: 'wrap' }}>
              <StarRating pct={starPct} size={15} />
              <span style={{ fontSize: 13, color: C.textMuted }}>{ratingTxt} · {de(prod.reviews)} {t('product.reviews')} · <strong style={{ color: C.ink, fontWeight: 600 }}>{de(prod.sold)}×</strong> {t('product.sold')}</span>
            </div>
          )}

          {COMMERCE_ENABLED && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                <span data-testid="pdp-price" style={{ fontSize: 30, fontWeight: 600, color: C.ink }}>{money(livePrice)}</span>
                {liveAnchor != null && (
                  <>
                    <span style={{ fontSize: 18, color: C.strike, textDecoration: 'line-through' }}>{money(liveAnchor)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.accent, background: C.accentSoftBg, padding: '3px 9px', borderRadius: 5 }}>{t('product.save')} {money(liveAnchor - livePrice)}</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 20 }}>{t('product.inclVat', { amount: money(FREE_SHIP_THRESHOLD) })}</div>
            </>
          )}

          <ul data-testid="pdp-description" style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {bullets.map((b) => (
              <li key={b} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.5, color: '#4A4438' }}><span style={{ color: C.accent }}>—</span><span>{b}</span></li>
            ))}
          </ul>

          {/* Personalization configurator — BaZi only (REQ-007 / AT-007-1). The
              size / frame / background colour axes ARE the product variants
              (REQ-008 AT-008-1). The stable anchors let the gating test assert
              presence/absence and the inventory test assert the variants block. */}
          {personalizable && !isCoupleSku && (
            <div data-testid="pdp-variants">
              <div data-testid="pdp-configurator">
                <Configurator />
              </div>
            </div>
          )}

          {/* Paar-SKU: kein Single-Konfigurator — beide Geburtsdatensätze werden
              im Paar-Flow erfasst (exakte 合婚-Berechnung, Ehrlichkeits-Gate). */}
          {isCoupleSku && (
            <div data-testid="pdp-couple-note" style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, background: C.surfaceWarm, padding: '14px 16px', margin: '0 0 14px' }}>
              {t('product.coupleNote')}
            </div>
          )}

          {/* M13 / REQ-008/028/029 — first-class size selector for NON-personalizable
              (ready-to-ship) PDPs: NO birth data, NO chart preview (REQ-030 gate
              preserved). Size drives the live price (base + delta) and is carried
              into the cart. The axis is NON-FINAL (OQ-001): real per-product size
              availability/pricing is operator-owned; every A3/A2/A1 is available
              for now and none is offered as an unavailable-but-purchasable size. */}
          {/* R5 (#9): Rahmen-Achse für Ready-to-ship-Poster — die Wahl wandert
              (preisneutral) in die Variante, damit die Gelato-Zuordnung
              (Format×Rahmen) bestimmbar ist. Gleiche Optik wie /personalize. */}
          {!personalizable && (
            <div data-testid="pdp-frame-selector" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.textMuted, margin: '0 0 10px' }}>
                {t('configurator.step2').replace(/^\d+ · /, '')} — {t(`options.frames.${pdpFrameHex}`)}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {frames.map((f) => {
                  const sel = f.hex === pdpFrameHex
                  return (
                    <button key={f.hex} type="button" data-testid="pdp-frame-option" data-frame={f.hex} aria-pressed={sel} onClick={() => setPdpFrameHex(f.hex)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${C.borderInput}`, background: C.surfaceInput, padding: '8px 14px 8px 8px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13, color: '#4A4438' }}>
                      <span className="color-swatch-circle" style={{ width: 26, height: 26, background: f.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />{t(`options.frames.${f.hex}`)}
                      {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!personalizable && (
            <div data-testid="pdp-size-selector" data-nonfinal="true" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.textMuted, margin: '0 0 10px' }}>
                {t('tax.size')}<span style={{ color: C.textMuted4, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> · vorläufig</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {sizes.map((z) => {
                  const sel = z.id === pdpSize
                  const deltaText = z.delta > 0 ? '+ ' + money(z.delta) : z.delta < 0 ? '− ' + money(-z.delta) : t('configurator.inclusive')
                  return (
                    <button
                      key={z.id}
                      type="button"
                      data-testid="pdp-size-option"
                      data-size={z.id}
                      aria-pressed={sel}
                      onClick={() => setPdpSize(z.id)}
                      style={{ position: 'relative', border: `1px solid ${sel ? C.accent : C.borderInput}`, background: C.surfaceInput, padding: '12px 8px', cursor: 'pointer', textAlign: 'center', fontFamily: FONT_SANS }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{z.label}</div>
                      <div style={{ fontSize: 11, color: C.textMuted3, margin: '3px 0 4px' }}>{z.sub}</div>
                      {COMMERCE_ENABLED && <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{deltaText}</div>}
                      {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {personalizable && <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.55, background: C.surfaceWarm, padding: '12px 14px', margin: '0 0 14px' }}>{t('product.personalNotice')}</div>}

          {COMMERCE_ENABLED ? (
            /* Gate C/D remediation: the PDP express-pay buttons (PayPal / Apple Pay)
               were a FAKE affordance — they toasted "Redirecting to express payment…"
               but never redirected (no express flow exists; RL-STRIPE). Removed, so
               the PDP no longer claims a capability it does not have. The honest
               purchase path is add-to-cart → cart → checkout. */
            <button onClick={addToCart} data-testid={personalizable ? 'pdp-personalize-cta' : 'pdp-add-to-cart'} className="transition-[filter,transform] hover:brightness-110 active:translate-y-[1px]" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 18, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, letterSpacing: '0.01em', boxShadow: ACCENT_CTA_SHADOW }}>{t('product.addToCart')} · {money(livePrice)}</button>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', background: C.surfaceWarm, border: `1px solid ${C.border}`, padding: '16px 18px', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: C.textMuted }}>{t('preview.notForSale')}</div>
          )}
          <div data-testid="pdp-trust" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 16, fontSize: 12, color: C.textMuted2, flexWrap: 'wrap' }}>
            <span>{t('product.secure')}</span><span>{t('product.returns')}</span>
          </div>

          <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}` }}>
            {faqDefs.map((q) => {
              const open = openFaqId === q.id
              return (
                <div key={q.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <button onClick={() => setOpenFaqId(open ? '' : q.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, color: C.ink, textAlign: 'left' }}>
                    {t(`content.faqDefs.${q.id}.q`)}<span style={{ fontSize: 20, color: C.textMuted3, fontWeight: 300 }}>{open ? '−' : '+'}</span>
                  </button>
                  {open && <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textMuted, margin: 0, padding: '0 2px 20px' }}>{t(`content.faqDefs.${q.id}.a`)}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Cross-sells — "frequently bought together" (REQ-008 AT-008-1). Each card
          is a REAL in-app <Link> to /product/:id, so the inventory test's
          dead-link guard passes and keyboard navigation works. */}
      <section data-testid="pdp-cross-sells" style={{ marginTop: 64, borderTop: `1px solid ${C.border}`, paddingTop: 40 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 28, margin: '0 0 24px' }}>{t('product.related')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 24 }}>
          {related.map((r) => (
            <Link key={r.id} data-testid="pdp-cross-sell-card" to={`/product/${r.id}`} onClick={() => window.scrollTo(0, 0)} style={{ display: 'block', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '3/4', background: '#fff', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}><Poster p={r.poster} scene="plain" /></div>
              <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 18, margin: '12px 0 4px' }}>{t(`content.products.${r.id}.title`)}</h3>
              {COMMERCE_ENABLED ? <span style={{ fontSize: 14, fontWeight: 600 }}>{money(r.price)}</span> : <span style={{ fontSize: 12, color: C.textMuted3 }}>{t('preview.soon')}</span>}
            </Link>
          ))}
        </div>
      </section>

      {/* Inspiration context (REQ-008 AT-008-1) — a quiet pointer to the real
          /inspiration gallery so the customer can see posters in a room. */}
      <section data-testid="pdp-inspiration" style={{ marginTop: 48, borderTop: `1px solid ${C.border}`, paddingTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 22, margin: '0 0 6px' }}>{t('product.inspirationTitle')}</h2>
          <p style={{ fontSize: 13.5, color: C.textMuted, margin: 0, maxWidth: 460, lineHeight: 1.55 }}>{t('home.inspiration.copy')}</p>
        </div>
        <Link to="/inspiration" onClick={() => window.scrollTo(0, 0)} style={{ whiteSpace: 'nowrap', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent, textDecoration: 'none' }}>{t('product.inspirationCta')} →</Link>
      </section>
    </main>
  )
}
