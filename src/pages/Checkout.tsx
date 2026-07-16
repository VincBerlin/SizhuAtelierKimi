import { useState, useEffect, type CSSProperties } from 'react'
import { useNavigate, Link } from 'react-router'
import Poster from '../components/Poster'
import { useShopStore, useMoney } from '../store/ShopStore'
import { useAuth } from '../store/AuthProvider'
import { useT } from '../i18n/I18nProvider'
import { startCheckout, cartHasIncompletePersonalization } from '../lib/checkout'
import { apiAddresses } from '../lib/auth'
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
  const money = useMoney()
  const { user } = useAuth()
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [street, setStreet] = useState('')
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')

  // §5.3 — prefill contact + delivery from the logged-in customer's saved default
  // shipping address (never overwrites a field the user already typed).
  useEffect(() => {
    if (!user) return
    setEmail((e) => e || user.email)
    let active = true
    apiAddresses().then((all) => {
      if (!active) return
      const def = all.find((a) => a.type === 'shipping' && a.is_default) || all.find((a) => a.type === 'shipping')
      if (!def) return
      const parts = (def.full_name || '').trim().split(/\s+/).filter(Boolean)
      setFirstName((v) => v || parts[0] || '')
      setLastName((v) => v || parts.slice(1).join(' '))
      setStreet((v) => v || [def.line1, def.line2].filter(Boolean).join(', '))
      setZip((v) => v || def.postal_code || '')
      setCity((v) => v || def.city || '')
    })
    return () => { active = false }
  }, [user])
  // Personalized items: block until birth data is complete (REQ-016) AND the
  // correctness confirmation is ticked (REQ-017/042). Enforced HERE — the actual
  // order-placement boundary — so a direct /checkout URL cannot bypass the gate.
  // Operator-Batch #8: die Checkbox gilt NUR für personalisierte Artikel — ein
  // Warenkorb ohne Personalisierung checkt sofort aus (kein Häkchen nötig).
  const incomplete = cartHasIncompletePersonalization(cart)
  const personalizedLines = cart.filter((l) => !!l.personalization)
  const hasPersonalized = personalizedLines.length > 0
  const canPlace = !incomplete && (!hasPersonalized || confirmed)

  const placeOrder = async () => {
    if (cart.length === 0 || placing || !canPlace) return
    setPlacing(true)
    showToast(t('checkout.starting'))
    const r = await startCheckout(cart, shipCost, lang.toLowerCase(), email.trim() || undefined)
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

  const shipText = shipCost === 0 ? t('checkout.shipFree') : money(shipCost)

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 32px 80px' }}>
      <button onClick={openCart} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted2, padding: '8px 0', fontFamily: FONT_SANS }}>{t('checkout.back')}</button>
      <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 34, margin: '6px 0 28px' }}>{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <div>
          {/* Operator-Batch #8: Bestätigung + Daten-Review ZUERST — der Nutzer
              sieht sofort, was er bestätigt und dass Express danach freischaltet.
              Nur bei personalisierten Artikeln; normale Poster checken direkt aus. */}
          {hasPersonalized && (
            <div data-testid="personalization-confirm-card" style={{ background: '#fff', border: `1px solid ${confirmed ? C.border : C.accent}`, borderRadius: 14, padding: 22, marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t('checkout.reviewTitle')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {personalizedLines.map((l) => {
                  const p = l.personalization!
                  return (
                    <div key={l.key} data-testid="personalization-review-box" style={{ background: C.surfaceWarm, border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '12px 14px', fontSize: 12.5, lineHeight: 1.65, color: C.textMuted }}>
                      <div style={{ fontWeight: 600, color: C.ink, marginBottom: 2 }}>{p.productTypeLabel || l.title}</div>
                      <div><strong style={{ color: C.ink }}>{p.name}</strong> · {p.date} · {p.timeDisplay || p.time} · {p.placeResolved || p.place}</div>
                      {p.nameB && (
                        <div><strong style={{ color: C.ink }}>{p.nameB}</strong> · {p.dateB} · {p.timeDisplayB || p.timeB} · {p.placeResolvedB || p.placeB}</div>
                      )}
                      {p.language && <div style={{ fontSize: 11.5, color: C.textMuted2 }}>{t('checkout.posterLangLabel')}: {p.language}</div>}
                    </div>
                  )
                })}
              </div>
              {incomplete && <div style={{ fontSize: 12.5, color: C.accent, marginBottom: 10 }}>{t('cart.incompleteWarn')}</div>}
              <div style={{ fontSize: 11.5, color: C.textMuted2, lineHeight: 1.5, background: C.surfaceWarm, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>{t('cart.returnNotice')}</div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: C.ink, lineHeight: 1.5, fontWeight: 500 }}>
                <input type="checkbox" data-testid="personalization-confirm" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.accent, flexShrink: 0 }} />
                <span>{t('cart.confirmLabel')}</span>
              </label>
            </div>
          )}

          {/* guest form */}
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {user ? (
              <div style={{ fontSize: 12.5, color: C.textMuted, background: C.surfaceWarm, borderRadius: 8, padding: '9px 12px' }}>{t('checkout.signedInAs')} <strong style={{ color: C.ink }}>{user.email}</strong></div>
            ) : (
              <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.5 }}>
                {t('checkout.signInPrompt')} <Link to="/account" className="underline transition-colors hover:text-[#A0341F]" style={{ color: C.accent, fontWeight: 600 }}>{t('checkout.signInCta')}</Link>
              </div>
            )}
            <div style={{ fontSize: 15, fontWeight: 600 }}>{t('checkout.contact')} <span style={{ fontWeight: 400, fontSize: 12, color: C.textMuted3 }}>{t('checkout.noAccount')}</span></div>
            <input type="email" placeholder={t('checkout.email')} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input type="text" placeholder={t('checkout.firstName')} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
              <input type="text" placeholder={t('checkout.lastName')} autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
            </div>
            <input type="text" placeholder={t('checkout.street')} autoComplete="street-address" value={street} onChange={(e) => setStreet(e.target.value)} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <input type="text" placeholder={t('checkout.zip')} autoComplete="postal-code" value={zip} onChange={(e) => setZip(e.target.value)} style={inputStyle} />
              <input type="text" placeholder={t('checkout.city')} autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} />
            </div>
            {incomplete && <div style={{ fontSize: 12.5, color: C.accent }}>{t('cart.incompleteWarn')}</div>}
            {hasPersonalized && !confirmed && (
              <div style={{ fontSize: 12, color: C.accent }}>{t('checkout.confirmFirst')}</div>
            )}
            <button onClick={placeOrder} disabled={placing || !canPlace} className="transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50" style={{ marginTop: 6, width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 17, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, boxShadow: ACCENT_CTA_SHADOW }}>{placing ? t('checkout.starting') : `${t('checkout.placeOrder')} · ${money(total)}`}</button>
            <div style={{ fontSize: 12, color: C.textMuted2, textAlign: 'center' }}>{t('checkout.noHidden')}</div>
            {/* Operator-Batch #10: KEINE separaten Wallet-Buttons mehr — alle
                führten zum selben Stripe-Checkout (Fake-Differenzierung). Die
                Wallets erscheinen dort gerätespezifisch; hier nur ehrliche
                Trust-Zeile mit den Logos. */}
            <div data-testid="wallet-trust-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 2, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, color: C.textMuted3, fontFamily: FONT_SANS }}>{t('checkout.expressHint')}</span>
              <span aria-label="Apple Pay" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: C.ink }}>
                <svg viewBox="0 0 384 512" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 12 }}>Pay</span>
              </span>
              <span aria-label="Google Pay" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#3c4043' }}>
                <svg viewBox="0 0 48 48" width="13" height="13" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 12 }}>Pay</span>
              </span>
              <span aria-label="Amazon Pay" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', color: '#131921' }}>
                <span style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 11, letterSpacing: '-0.02em', lineHeight: 1 }}>amazon <span style={{ fontWeight: 400 }}>pay</span></span>
                <svg viewBox="0 0 60 12" width="34" height="7" aria-hidden="true"><path d="M2 2 Q30 14 54 4" fill="none" stroke="#F90" strokeWidth="2.4" strokeLinecap="round"/><path d="M54 4 l-1 -3.4 M54 4 l-3.5 .4" fill="none" stroke="#F90" strokeWidth="2.4" strokeLinecap="round"/></svg>
              </span>
            </div>
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
                <div style={{ fontSize: 13, fontWeight: 600 }}>{money(i.price * i.qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${C.borderInput}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14, color: '#4A4438' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('checkout.subtotal')}</span><span>{money(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('checkout.shipping')}</span><span>{shipText}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, color: C.ink, borderTop: `1px solid ${C.borderInput}`, paddingTop: 10, marginTop: 4 }}><span>{t('checkout.total')}</span><span>{money(total)}</span></div>
            <div style={{ fontSize: 11, color: C.textMuted2 }}>{t('checkout.vat', { amount: money(tax) })}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
