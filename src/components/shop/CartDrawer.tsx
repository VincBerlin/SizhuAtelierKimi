import { useNavigate } from 'react-router'
import Poster from '../Poster'
import { addons } from '../../lib/catalog'
import { useShopStore } from '../../store/ShopStore'
import { useT } from '../../i18n/I18nProvider'
import { euro } from '../../lib/format'
import { C, FONT_SERIF, FONT_SANS, FREE_SHIP_THRESHOLD } from '../../lib/tokens'

export default function CartDrawer() {
  const { cart, cartOpen, closeCart, subtotal, shipCost, reached, remaining, setQty, removeLine, addItem, showToast } = useShopStore()
  const { t } = useT()
  const navigate = useNavigate()
  const open = cartOpen
  const hasCart = cart.length > 0
  const shipPct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100) + '%'
  const shipMessage = reached ? t('cart.reached') : t('cart.remaining', { amount: euro(remaining) })
  const shipText = shipCost === 0 ? t('cart.shipFree') : t('cart.ship', { amount: euro(shipCost) })
  const goCheckout = () => { closeCart(); navigate('/checkout'); window.scrollTo(0, 0) }
  const goShop = () => { closeCart(); navigate('/'); window.scrollTo(0, 0) }
  const addAddon = (a: (typeof addons)[number]) => {
    addItem({ title: t(`content.addons.${a.id}.title`), price: a.price, qty: 1, poster: null, meta: t(`content.addons.${a.id}.note`) })
    showToast(t('cart.toastAdded'))
  }

  return (
    <>
      <div onClick={closeCart} style={{ position: 'fixed', inset: 0, background: 'rgba(28,24,18,0.42)', zIndex: 50, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .35s ease' }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 'min(440px, 100vw)', background: C.bg, zIndex: 51, boxShadow: '-20px 0 50px -20px rgba(28,24,18,0.4)', transform: `translateX(${open ? '0' : '100%'})`, transition: 'transform .4s cubic-bezier(0.4,0,0.2,1)', display: open ? 'flex' : 'none', flexDirection: 'column' }}>
        <div style={{ padding: '22px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: FONT_SERIF, fontSize: 24 }}>{t('cart.title')}</span>
          <button onClick={closeCart} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.textMuted2, lineHeight: 1 }}>×</button>
        </div>

        {hasCart && (
          <div style={{ padding: '16px 24px', background: C.surfaceWarm, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, color: '#4A4438', marginBottom: 9 }}>{shipMessage}</div>
            <div style={{ height: 7, background: '#E4DBC9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: shipPct, background: C.accent, borderRadius: 999, transition: 'width .4s ease' }} />
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
                {i.poster && <Poster p={i.poster} scene="plain" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, lineHeight: 1.25 }}>{i.title}</div>
                  <button onClick={() => removeLine(i.key)} className="transition-colors hover:text-[#C0492E]" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.strike, fontSize: 13, flexShrink: 0 }}>{t('cart.remove')}</button>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted2, margin: '4px 0 10px' }}>{i.meta}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.borderInput}`, borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => setQty(i.key, -1)} style={{ background: '#fff', border: 'none', cursor: 'pointer', width: 30, height: 30, fontSize: 16, color: C.textMuted }}>−</button>
                    <span style={{ width: 30, textAlign: 'center', fontSize: 13 }}>{i.qty}</span>
                    <button onClick={() => setQty(i.key, 1)} style={{ background: '#fff', border: 'none', cursor: 'pointer', width: 30, height: 30, fontSize: 16, color: C.textMuted }}>+</button>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{euro(i.price * i.qty)}</span>
                </div>
              </div>
            </div>
          ))}

          {hasCart && (
            <div style={{ padding: '18px 0 8px' }}>
              <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted3, marginBottom: 12 }}>{t('cart.alsoLike')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addons.slice(0, 3).map((a) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: `1px solid ${C.border}`, borderRadius: 10, background: '#fff' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#F2ECE0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: C.accent }}>{a.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{t(`content.addons.${a.id}.title`)}</div>
                      <div style={{ fontSize: 11, color: C.textMuted2 }}>{t(`content.addons.${a.id}.note`)}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{euro(a.price)}</span>
                    <button onClick={() => addAddon(a)} className="transition-colors hover:bg-[#3a352c]" style={{ background: C.ink, color: C.bg, border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 18, lineHeight: 1 }}>+</button>
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
            <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 14 }}>{shipText} {t('cart.inclVat')}</div>
            <button onClick={goCheckout} className="transition-[filter] hover:brightness-110" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, boxShadow: '0 12px 24px -12px rgba(192,73,46,0.6)' }}>{t('cart.checkout')}</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 14, fontSize: 11, color: C.textMuted3 }}>
              <span style={{ fontWeight: 600, color: C.textMuted }}>PayPal</span><span style={{ fontWeight: 600, color: C.textMuted }}> Pay</span><span style={{ fontWeight: 600, color: C.textMuted }}>G Pay</span><span>{t('cart.ssl')}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
