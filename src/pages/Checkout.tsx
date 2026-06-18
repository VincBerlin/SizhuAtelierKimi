import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import Poster from '../components/Poster'
import { useShopStore } from '../store/ShopStore'
import { useT } from '../i18n/I18nProvider'
import { startCheckout, cartHasIncompletePersonalization } from '../lib/checkout'
import { euro } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, ACCENT_CTA_SHADOW } from '../lib/tokens'

const inputStyle: CSSProperties = {
  border: `1px solid ${C.borderInput}`,
  borderRadius: 10,
  padding: '13px 14px',
  fontSize: 14,
  fontFamily: FONT_SANS,
  background: C.surfaceInput,
  color: C.ink,
  width: '100%',
}

export default function Checkout() {
  const { cart, subtotal, shipCost, total, tax, openCart, showToast } = useShopStore()
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  // Personalized items: block until birth data is complete (REQ-016) AND the
  // correctness confirmation is ticked (REQ-017/042). Enforced HERE — the actual
  // order-placement boundary — so a direct /checkout URL cannot bypass the gate.
  const incomplete = cartHasIncompletePersonalization(cart)
  const canPlace = confirmed && !incomplete

  const placeOrder = async () => {
    if (cart.length === 0 || placing || !canPlace) return
    setPlacing(true)
    showToast(t('checkout.starting'))
    const r = await startCheckout(cart, shipCost, lang.toLowerCase())
    if (!r.ok) {
      if (r.error && r.error !== 'empty' && r.error !== 'Checkout failed') console.error('[checkout]', r.error)
      showToast(t('checkout.payError'))
      setPlacing(false)
    }
    // on success the browser is redirected to Stripe by startCheckout
  }

  if (cart.length === 0) {
    return (
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 30, color: C.ink }}>{t('checkout.emptyTitle')}</h1>
        <button onClick={() => { navigate('/'); window.scrollTo(0, 0) }} style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontFamily: FONT_SANS, fontSize: 14 }}>{t('checkout.toShop')}</button>
      </main>
    )
  }

  const shipText = shipCost === 0 ? t('checkout.shipFree') : euro(shipCost)

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 32px 80px' }}>
      <button onClick={openCart} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted2, padding: '8px 0', fontFamily: FONT_SANS }}>{t('checkout.back')}</button>
      <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 34, margin: '6px 0 28px' }}>{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div>
          {/* express */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: C.textMuted2, textAlign: 'center', marginBottom: 14 }}>{t('checkout.expressHint')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, opacity: canPlace ? 1 : 0.5 }}>
              <button onClick={placeOrder} disabled={!canPlace} style={{ background: '#FFC439', color: '#0a0a0a', border: 'none', cursor: canPlace ? 'pointer' : 'not-allowed', padding: 14, borderRadius: 10, fontWeight: 600, fontFamily: FONT_SANS, fontSize: 14 }}>PayPal</button>
              <button onClick={placeOrder} disabled={!canPlace} style={{ background: '#000', color: '#fff', border: 'none', cursor: canPlace ? 'pointer' : 'not-allowed', padding: 14, borderRadius: 10, fontWeight: 500, fontFamily: FONT_SANS, fontSize: 15 }}> Pay</button>
              <button onClick={placeOrder} disabled={!canPlace} style={{ background: '#fff', color: '#3c4043', border: '1px solid #dadce0', cursor: canPlace ? 'pointer' : 'not-allowed', padding: 14, borderRadius: 10, fontWeight: 500, fontFamily: FONT_SANS, fontSize: 14 }}>G Pay</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 4px', color: C.strike, fontSize: 12 }}>
              <span style={{ flex: 1, height: 1, background: C.border }} />{t('checkout.orGuest')}<span style={{ flex: 1, height: 1, background: C.border }} />
            </div>
          </div>

          {/* guest form */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{t('checkout.contact')} <span style={{ fontWeight: 400, fontSize: 12, color: C.textMuted3 }}>{t('checkout.noAccount')}</span></div>
            <input type="email" placeholder={t('checkout.email')} autoComplete="email" style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input type="text" placeholder={t('checkout.firstName')} autoComplete="given-name" style={inputStyle} />
              <input type="text" placeholder={t('checkout.lastName')} autoComplete="family-name" style={inputStyle} />
            </div>
            <input type="text" placeholder={t('checkout.street')} autoComplete="street-address" style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <input type="text" placeholder={t('checkout.zip')} autoComplete="postal-code" style={inputStyle} />
              <input type="text" placeholder={t('checkout.city')} autoComplete="address-level2" style={inputStyle} />
            </div>
            {incomplete && <div style={{ fontSize: 12.5, color: C.accent }}>{t('cart.incompleteWarn')}</div>}
            <div style={{ fontSize: 11.5, color: C.textMuted2, lineHeight: 1.5, background: C.surfaceWarm, borderRadius: 8, padding: '10px 12px' }}>{t('cart.returnNotice')}</div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.accent, flexShrink: 0 }} />
              <span>{t('cart.confirmLabel')}</span>
            </label>
            <button onClick={placeOrder} disabled={placing || !canPlace} className="transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" style={{ marginTop: 6, width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 17, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, boxShadow: ACCENT_CTA_SHADOW }}>{placing ? t('checkout.starting') : `${t('checkout.placeOrder')} · ${euro(total)}`}</button>
            <div style={{ fontSize: 12, color: C.textMuted2, textAlign: 'center' }}>{t('checkout.noHidden')}</div>
          </div>
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-24" style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{t('checkout.summary')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
            {cart.map((i) => (
              <div key={i.key} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 46, height: 60, flexShrink: 0, border: `1px solid ${C.borderInput}`, position: 'relative', overflow: 'hidden', background: '#fff' }}>
                  {i.poster && <Poster p={i.poster} scene="plain" />}
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 500, color: C.ink }}>{i.title}</div>
                  <div style={{ color: C.textMuted2, fontSize: 12 }}>{i.meta}{i.qty > 1 ? ` · ×${i.qty}` : ''}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{euro(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.borderInput}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14, color: '#4A4438' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('checkout.subtotal')}</span><span>{euro(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('checkout.shipping')}</span><span>{shipText}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, color: C.ink, borderTop: `1px solid ${C.borderInput}`, paddingTop: 10, marginTop: 4 }}><span>{t('checkout.total')}</span><span>{euro(total)}</span></div>
            <div style={{ fontSize: 11, color: C.textMuted2 }}>{t('checkout.vat', { amount: euro(tax) })}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
