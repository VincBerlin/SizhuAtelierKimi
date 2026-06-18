import { useNavigate } from 'react-router'
import Poster from '../Poster'
import { digitalProduct, getProduct } from '../../lib/catalog'
import { useShopStore } from '../../store/ShopStore'
import { useAuth } from '../../store/AuthProvider'
import { useT } from '../../i18n/I18nProvider'
import { cartHasIncompletePersonalization } from '../../lib/checkout'
import { euro } from '../../lib/format'
import { C, FONT_SERIF, FONT_SANS, FREE_SHIP_THRESHOLD } from '../../lib/tokens'

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, subtotal, shipCost, reached, remaining, setQty, removeLine, addItem, clearCart, showToast } = useShopStore()
  const { user } = useAuth()
  const { t } = useT()
  const navigate = useNavigate()
  const goAccount = () => { closeCart(); navigate('/account'); window.scrollTo(0, 0) }
  const open = cartOpen
  const hasCart = cart.length > 0
  const shipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100) + '%'
  const shipMessage = reached ? t('cart.reached') : t('cart.remaining', { amount: euro(remaining) })
  const shipText = shipCost === 0 ? t('cart.shipFree') : t('cart.ship', { amount: euro(shipCost) })
  const totalCredits = cart.reduce((sum, i) => sum + (i.creditsEarned || 0) * i.qty, 0)
  // Block checkout when a personalized line is missing required birth data (REQ-016).
  // The personalization-correctness confirmation (REQ-017/042) is required on the
  // Checkout page itself (the order-placement boundary), so a direct /checkout URL
  // cannot bypass it.
  const incomplete = cartHasIncompletePersonalization(cart)
  const canCheckout = !incomplete
  const goCheckout = () => { if (!canCheckout) return; closeCart(); navigate('/checkout'); window.scrollTo(0, 0) }
  const goShop = () => { closeCart(); navigate('/'); window.scrollTo(0, 0) }
  const editPersonalization = () => { closeCart(); navigate('/personalize'); window.scrollTo(0, 0) }
  // Cross-sell REAL, purchasable products (not accessories): the digital BaZi
  // analysis plus a couple of ready-to-ship posters not already in the cart.
  type Cross = { title: string; price: number; meta: string; image?: string }
  const inCart = (title: string) => cart.some((l) => l.title === title)
  const crossSell: Cross[] = [
    { title: digitalProduct.title, price: digitalProduct.price, meta: digitalProduct.subtitle },
    ...([8, 11].map((id) => { const p = getProduct(id); return p ? { title: p.title, price: p.price, meta: '', image: p.image } : null }).filter(Boolean) as Cross[]),
  ].filter((x) => !inCart(x.title)).slice(0, 3)
  const addCross = (x: Cross) => {
    addItem({ title: x.title, price: x.price, qty: 1, poster: null, meta: x.meta, image: x.image })
    showToast(t('cart.toastAdded'))
  }

  return (
    <>
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(28,24,18,0.42)', zIndex: 65, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .35s ease' }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 'min(440px, 100vw)', background: C.bg, zIndex: 70, boxShadow: '-20px 0 50px -20px rgba(28,24,18,0.4)', transform: `translateX(${open ? '0' : '100%'})`, transition: 'transform .4s cubic-bezier(0.4,0,0.2,1)', display: open ? 'flex' : 'none', flexDirection: 'column' }}>
        <div style={{ padding: '22px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: FONT_SERIF, fontSize: 24 }}>{t('cart.title')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {hasCart && <button onClick={clearCart} className="transition-colors hover:text-[#C0492E]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: C.textMuted2, fontFamily: FONT_SANS, textDecoration: 'underline' }}>{t('cart.clear')}</button>}
            <button onClick={closeCart} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.textMuted2, lineHeight: 1 }}>×</button>
          </div>
        </div>

        {hasCart && (
          <div style={{ padding: '16px 24px', background: C.surfaceWarm, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, color: '#4A4438', marginBottom: 9 }}>{shipMessage}</div>
            <div style={{ height: 7, background: '#E4DBC9', borderRadius: 999, overflow: 'hidden' }}>
              <div className={reached ? 'stardust-glow' : undefined} style={{ height: '100%', width: shipPct, background: C.accent, borderRadius: 999, transition: 'width .4s ease' }} />
            </div>
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 24px' }}>
          {!hasCart && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted3 }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.textMuted, marginBottom: 8 }}>{t('cart.empty')}</div>
              <p style={{ fontSize: 14, margin: '0 0 20px' }}>{t('cart.emptyHint')}</p>
              <button onClick={goShop} style={{ background: C.ink, color: C.bg, border: 'none', cursor: 'pointer', padding: '12px 22px', borderRadius: 999, fontSize: 14, fontFamily: FONT_SANS }}>{t('cart.toCollection')}</button>
            </div>
          )}

          {cart.map((i) => (
            <div key={i.key} style={{ display: 'flex', gap: 14, padding: '18px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 60, height: 78, flexShrink: 0, border: `1px solid ${C.borderInput}`, position: 'relative', overflow: 'hidden', background: '#fff' }}>
                {i.image ? <img src={i.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : i.poster && <Poster p={i.poster} scene="plain" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.25 }}>{i.title}</div>
                  <button onClick={() => removeLine(i.key)} className="transition-colors hover:text-[#C0492E]" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.strike, fontSize: 13, flexShrink: 0 }}>{t('cart.remove')}</button>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted2, margin: '4px 0 8px' }}>{i.meta}</div>
                {i.personalization && <PersonalizationSummary p={i.personalization} t={t} />}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.borderInput}`, borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => setQty(i.key, -1)} style={{ background: '#fff', border: 'none', cursor: 'pointer', width: 30, height: 30, fontSize: 16, color: C.textMuted }}>−</button>
                    <span style={{ width: 30, textAlign: 'center', fontSize: 13 }}>{i.qty}</span>
                    <button onClick={() => setQty(i.key, 1)} style={{ background: '#fff', border: 'none', cursor: 'pointer', width: 30, height: 30, fontSize: 16, color: C.textMuted }}>+</button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{euro(i.price * i.qty)}</span>
                    {i.creditsEarned ? <div style={{ fontSize: 11, color: C.success }}>+{i.creditsEarned * i.qty} C.</div> : null}
                  </div>
                </div>
                {i.personalization && (
                  <button onClick={editPersonalization} className="transition-colors hover:text-[#C0492E]" style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted2, fontSize: 12, textDecoration: 'underline', padding: 0 }}>{t('cart.editPersonalization')}</button>
                )}
              </div>
            </div>
          ))}

          {hasCart && crossSell.length > 0 && (
            <div style={{ padding: '18px 0 8px' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted3, marginBottom: 12 }}>{t('cart.alsoLike')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {crossSell.map((x) => (
                  <div key={x.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: `1px solid ${C.border}`, borderRadius: 10, background: '#fff' }}>
                    <div style={{ width: 38, height: 48, borderRadius: 6, background: '#F2ECE0', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: C.accent }}>
                      {x.image ? <img src={x.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{x.title}</div>
                      {x.meta && <div style={{ fontSize: 11, color: C.textMuted2 }}>{x.meta}</div>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{euro(x.price)}</span>
                    <button onClick={() => addCross(x)} aria-label={t('cart.toastAdded')} className="transition-colors hover:bg-[#3a352c]" style={{ background: C.ink, color: C.bg, border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>+</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasCart && (
          <div style={{ borderTop: `1px solid ${C.border}`, padding: '18px 24px 22px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: C.textMuted }}>{t('cart.subtotal')}</span>
              <span style={{ fontSize: 20, fontWeight: 700 }}>{euro(subtotal)}</span>
            </div>
            <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{shipText} {t('cart.inclVat')}</div>
            {totalCredits > 0 && <div style={{ fontSize: 12.5, color: C.success, fontWeight: 600, marginBottom: 12 }}>✦ {t('cart.creditsEarn', { n: totalCredits })}</div>}
            {!user && (
              <div style={{ fontSize: 11.5, color: C.textMuted2, lineHeight: 1.5, marginBottom: 12 }}>
                {totalCredits > 0 ? t('cart.saveCredits') : t('cart.signInPrompt')}{' '}
                <button onClick={goAccount} className="underline transition-colors hover:text-[#A0341F]" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontWeight: 600, fontSize: 11.5, padding: 0 }}>{t('cart.signInCta')}</button>
              </div>
            )}
            <div style={{ fontSize: 11.5, color: C.textMuted2, lineHeight: 1.5, background: C.surfaceWarm, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: C.textMuted, marginBottom: 3 }}>{t('cart.reviewBirth')}</div>
              {t('cart.returnNotice')}
            </div>
            {incomplete && <div style={{ fontSize: 12, color: C.accent, marginBottom: 12 }}>{t('cart.incompleteWarn')}</div>}
            <button onClick={goCheckout} disabled={!canCheckout} className="transition-[filter] hover:brightness-110" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: canCheckout ? 'pointer' : 'not-allowed', opacity: canCheckout ? 1 : 0.5, padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, boxShadow: '0 12px 24px -12px rgba(192,73,46,0.6)' }}>{t('cart.checkout')}</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 14, fontSize: 11, color: C.textMuted3 }}>
              <span style={{ fontWeight: 600, color: C.textMuted }}>PayPal</span><span style={{ fontWeight: 600, color: C.textMuted }}> Pay</span><span style={{ fontWeight: 600, color: C.textMuted }}>G Pay</span><span>{t('cart.ssl')}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

/** Compact per-line personalization summary in the cart (REQ-015): birth data,
 *  poster language, design and size, plus partner data for couple orders. */
function PersonalizationSummary({ p, t }: { p: Record<string, string>; t: (k: string, v?: Record<string, string | number>) => any }) {
  const unknownTime = p.unknownTime === 'true'
  const time = unknownTime ? t('personalize.timeUnknown') : p.time
  const timeB = unknownTime ? t('personalize.timeUnknown') : p.timeB
  const line1 = [p.name, p.date, time, p.place].filter(Boolean).join(' · ')
  const partner = p.nameB ? [p.nameB, p.dateB, timeB, p.placeB].filter(Boolean).join(' · ') : ''
  const line2 = [p.language, p.palette, p.frame, p.size].filter(Boolean).join(' · ')
  return (
    <div style={{ fontSize: 11.5, color: C.textMuted2, lineHeight: 1.5, margin: '0 0 8px', borderLeft: `2px solid ${C.border}`, paddingLeft: 8 }}>
      {line1 && <div>{line1}</div>}
      {partner && <div>{t('personalize.partnerName')}: {partner}</div>}
      {line2 && <div>{line2}</div>}
      {unknownTime && <div style={{ color: C.accent, marginTop: 3 }}>{t('cart.unknownTimeNotice')}</div>}
    </div>
  )
}
