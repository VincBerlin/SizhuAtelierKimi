import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Poster from '../components/Poster'
import PosterScene from '../components/shop/PosterScene'
import StarRating from '../components/shop/StarRating'
import Configurator from '../components/shop/Configurator'
import { getProduct, products, faqDefs, addons } from '../lib/catalog'
import { isPersonalizable, productKind } from '../lib/productTypes'
import { computeChart, sizes, type PosterData } from '../lib/bazi'
import { birthTimeMeta } from '../lib/personalization'
import { useShopStore, useMoney } from '../store/ShopStore'
import { useT } from '../i18n/I18nProvider'
import { COMMERCE_ENABLED, REVIEWS_ENABLED } from '../lib/config'
import { posterProductId, buildVariantId } from '../lib/checkout'
import { de } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, FREE_SHIP_THRESHOLD, ACCENT_CTA_SHADOW, CONTAINER, posterBgName } from '../lib/tokens'

export default function ProductView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cfg, addItem, showToast, openFaqId, setOpenFaqId, posterBgHex } = useShopStore()
  const money = useMoney()
  const { t, lang } = useT()

  const prod = getProduct(Number(id)) ?? products[0]
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

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  // Empty time → disclosed noon fallback (REQ-018). place + the flag are threaded
  // into the placeholder chart (accepted, not used to vary it — ADR-002 pt.3/4).
  const birthTimeUnknown = !cfg.time
  const bt = birthTimeMeta(cfg.time, birthTimeUnknown)
  const chart = computeChart(cfg.date, bt.time, cfg.place, birthTimeUnknown)
  const livePoster: PosterData = { frame: cfg.frameHex, bg: cfg.bgHex, name: cfg.name || 'Dein Name', element: chart.element, animal: chart.animal, pillars: chart.pillars }
  const size = sizes.find((z) => z.id === cfg.size) ?? sizes[1]
  const livePrice = personalizable ? prod.price + size.delta : prod.price
  const liveAnchor = prod.anchor != null ? prod.anchor + (personalizable ? size.delta : 0) : null
  const starPct = (prod.rating / 5) * 100 + '%'
  const related = products.filter((p) => p.id !== prod.id).slice(0, 3)
  // Breadcrumb trail: Home → the product's world collection → this product. The
  // world→slug map points only at EXISTING /collections routes (no dead link).
  const worldSlug: Record<string, string> = { bazi: 'bazi-posters', tcm: 'tcm-posters', wuxing: 'wuxing-posters' }
  const collectionSlug = kind === 'fire-horse' ? 'fire-horse-2026' : worldSlug[prod.product_world] ?? 'bazi-posters'
  const ratingTxt = lang === 'EN' ? prod.rating.toFixed(1) : prod.rating.toFixed(1).replace('.', ',')
  const bullets = (t(`content.products.${prod.id}.bullets`) as string[]) || []

  const addToCart = () => {
    const title = t(`content.products.${prod.id}.title`)
    if (!personalizable) {
      // Non-personalizable (Fire Horse / TCM lehrposter): plain line, no birth data,
      // no size axis → server prices at base (empty variantId).
      addItem({ title, price: livePrice, qty: 1, poster: null, image: prod.image, meta: prod.category, productId: posterProductId(prod.id), variantId: '' })
      showToast(t('cart.toastAdded'))
      return
    }
    // Same required-field discipline as the /personalize flow (REQ-009/016): don't
    // add a half-personalized line that would only be caught later at checkout.
    if (!cfg.name.trim() || !cfg.date || !cfg.place.trim()) { showToast(t('personalize.errFix')); return }
    const frameName = t(`options.frames.${cfg.frameHex}`)
    const bgName = t(`options.backgrounds.${cfg.bgHex}`)
    // REQ-018 poster background (the 5-hex palette) is a real product attribute:
    // carry the chosen swatch into the order line so the selection is never a
    // silent drop (FM-15). Like `palette`, it is descriptive-only and stays OUT of
    // the variantId — the server prices solely from size + frame (money path
    // unchanged).
    const posterBg = posterBgName(posterBgHex)
    // place/date/time + the canonical birthTimeUnknown flag are carried so the
    // planned calculation API can dock without loss (REQ-004 AK-1).
    const personalization = { date: cfg.date, time: bt.time, timeDisplay: bt.timeDisplay, birthTimeUnknown: bt.birthTimeUnknown, unknownTime: bt.unknownTime, timeFallbackUsed: bt.timeFallbackUsed, fallbackReason: bt.fallbackReason, place: cfg.place, name: cfg.name.trim(), palette: bgName, posterBg, frame: frameName, size: size.label }
    addItem({ title, price: livePrice, qty: 1, poster: livePoster, meta: `${frameName} · ${bgName} · ${posterBg} · ${size.label}`, personalization, productId: posterProductId(prod.id), variantId: buildVariantId({ size: size.id, frame: cfg.frameHex }) })
    showToast(t('cart.toastAdded'))
  }

  const placeholderThumb = (label: string) => (
    <div style={{ aspectRatio: '4 / 5', background: '#F2ECE0', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted5, textAlign: 'center', padding: 8 }} dangerouslySetInnerHTML={{ __html: label }} />
    </div>
  )

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
              <div data-testid="pdp-chart-preview" data-bg-hex={posterBgHex}>
                <PosterScene poster={livePoster} scene="plain" aspect="4 / 5" bg={posterBgHex} />
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
          {personalizable && (
            <div data-testid="pdp-variants">
              <div data-testid="pdp-configurator">
                <Configurator />
              </div>
            </div>
          )}

          {personalizable && <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.55, background: C.surfaceWarm, borderRadius: 10, padding: '12px 14px', margin: '0 0 14px' }}>{t('product.personalNotice')}</div>}

          {COMMERCE_ENABLED ? (
            <>
              <button onClick={addToCart} data-testid={personalizable ? 'pdp-personalize-cta' : 'pdp-add-to-cart'} className="transition-[filter,transform] hover:brightness-110 active:translate-y-[1px]" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 18, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, letterSpacing: '0.01em', boxShadow: ACCENT_CTA_SHADOW }}>{t('product.addToCart')} · {money(livePrice)}</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                <button onClick={() => showToast(t('product.express'))} className="transition-[filter] hover:brightness-95" style={{ background: '#FFC439', color: '#0a0a0a', border: 'none', cursor: 'pointer', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: FONT_SANS }}>PayPal</button>
                <button onClick={() => showToast(t('product.express'))} className="transition-[filter] hover:brightness-125" style={{ background: '#000', color: '#fff', border: 'none', cursor: 'pointer', padding: 13, borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: FONT_SANS }}> Pay</button>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: C.textMuted }}>{t('preview.notForSale')}</div>
          )}
          <div data-testid="pdp-trust" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 16, fontSize: 12, color: C.textMuted2, flexWrap: 'wrap' }}>
            <span>{t('product.secure')}</span><span>{t('product.returns')}</span><span>{t('product.climate')}</span>
          </div>

          {/* Frame & accessory options (REQ-008 AT-008-1). Honest framing: the
              frame finishes are the poster's real frame choices; the accessories
              are the catalog add-ons with their list prices. No invented bundle. */}
          <div data-testid="pdp-accessories" style={{ marginTop: 24 }}>
            <h2 style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.textMuted, margin: '0 0 12px' }}>{t('product.accessories')}</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {addons.map((a) => (
                <li key={a.id} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, fontSize: 13.5, color: '#4A4438' }}>
                  <span>{t(`content.addons.${a.id}.title`)} <span style={{ color: C.textMuted3 }}>· {t(`content.addons.${a.id}.note`)}</span></span>
                  {COMMERCE_ENABLED && <span style={{ whiteSpace: 'nowrap', color: C.textMuted, fontWeight: 600 }}>+{money(a.price)}</span>}
                </li>
              ))}
            </ul>
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
