import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Check, ShieldCheck, Lock, Truck } from 'lucide-react'
import { useShop, type CartItem } from '../components/ShopProvider'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../lib/shop'

const euro = (n: number) => '€ ' + n.toFixed(2).replace('.', ',')

type PaymentMethod = 'card' | 'invoice' | 'paypal' | 'applepay' | 'googlepay'

interface PlacedOrder {
  orderId: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  email: string
  method: PaymentMethod
}

export default function Checkout() {
  const { cart, subtotal, clearCart } = useShop()
  const formRef = useRef<HTMLFormElement>(null)

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [street, setStreet] = useState('')
  const [zip, setZip] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('Deutschland')
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [placed, setPlaced] = useState<PlacedOrder | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shipping

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (cart.length === 0) return
    const order: PlacedOrder = {
      orderId: 'SZ-' + Date.now().toString().slice(-8),
      items: cart,
      subtotal,
      shipping,
      total,
      email,
      method,
    }
    // Simulated capture — no real charge. Replace with a payment provider later.
    try {
      window.localStorage.setItem('sizhu_last_order', JSON.stringify(order))
    } catch { /* ignore */ }
    // eslint-disable-next-line no-console
    console.info('[SizhuAtelier] Bestellung erfasst (Demo, keine echte Zahlung):', order)
    clearCart()
    setPlaced(order)
    window.scrollTo(0, 0)
  }

  const payWithExpress = (m: PaymentMethod) => {
    setMethod(m)
    // run native form validation, then submit
    formRef.current?.requestSubmit()
  }

  /* ── Confirmation view ──────────────────────────────── */
  if (placed) {
    return (
      <main style={{ background: '#E8E1D6', paddingTop: 110, minHeight: '70vh' }}>
        <div className="max-w-[640px] mx-auto text-center" style={{ padding: '40px 24px 80px' }}>
          <div className="flex items-center justify-center mx-auto" style={{ width: 64, height: 64, borderRadius: '50%', background: '#6B7F5C' }}>
            <Check size={32} strokeWidth={2} color="#F5F2ED" />
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(30px,4vw,44px)', color: '#2C2420', marginTop: 24 }}>
            Danke für deine Bestellung
          </h1>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', marginTop: 12, lineHeight: 1.7 }}>
            Bestellnummer <strong style={{ color: '#2C2420' }}>{placed.orderId}</strong>. Eine Bestätigung geht an{' '}
            <strong style={{ color: '#2C2420' }}>{placed.email}</strong>. Personalisierte Poster gehen nach Freigabe deines Designs in den Druck.
          </p>
          <div style={{ background: '#F5F2ED', borderRadius: 8, padding: 24, marginTop: 28, textAlign: 'left' }}>
            {placed.items.map((item) => (
              <div key={item.id} className="flex justify-between" style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#2C2420', marginBottom: 10 }}>
                <span>{item.qty}× {item.name}</span>
                <span>{euro(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between" style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E0D7C8' }}>
              <span>Versand</span><span>{placed.shipping === 0 ? 'Kostenlos' : euro(placed.shipping)}</span>
            </div>
            <div className="flex justify-between" style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, color: '#2C2420', marginTop: 8 }}>
              <span>Gesamt</span><span>{euro(placed.total)}</span>
            </div>
          </div>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: '#A39686', marginTop: 16 }}>
            Demo-Checkout — es wurde keine echte Zahlung ausgelöst.
          </p>
          <Link to="/shop" className="cta-button" style={{ marginTop: 28, textDecoration: 'none' }}>Weiter einkaufen</Link>
        </div>
      </main>
    )
  }

  /* ── Empty cart ─────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <main style={{ background: '#E8E1D6', paddingTop: 140, minHeight: '70vh', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 30, color: '#2C2420' }}>Dein Warenkorb ist leer</p>
        <Link to="/shop" style={{ display: 'inline-block', marginTop: 16, color: '#A0522D', fontFamily: '"Inter", sans-serif' }}>Zum Shop →</Link>
      </main>
    )
  }

  /* ── Checkout form ──────────────────────────────────── */
  return (
    <main style={{ background: '#E8E1D6', paddingTop: 96 }}>
      <div className="max-w-[1100px] mx-auto" style={{ padding: '24px 24px 80px' }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(30px,4vw,44px)', color: '#2C2420' }}>Kasse</h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#8A7E72', marginTop: 6 }}>
          Als Gast bestellen — kein Konto nötig. <Lock size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Sichere, verschlüsselte Übertragung.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,360px)] gap-10 lg:gap-14 items-start" style={{ marginTop: 28 }}>
          {/* Form */}
          <form ref={formRef} onSubmit={placeOrder}>
            {/* Express pay */}
            <Section title="Express-Bezahlung">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ExpressButton label="PayPal" bg="#FFC439" color="#0c1a4b" onClick={() => payWithExpress('paypal')} />
                <ExpressButton label="Apple Pay" bg="#000000" color="#ffffff" onClick={() => payWithExpress('applepay')} />
                <ExpressButton label="Google Pay" bg="#ffffff" color="#3c4043" border onClick={() => payWithExpress('googlepay')} />
              </div>
              <div className="flex items-center gap-4" style={{ margin: '20px 0 4px' }}>
                <span style={{ flex: 1, height: 1, background: '#D5C9B7' }} />
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: '#A39686' }}>oder mit Adresse & Karte</span>
                <span style={{ flex: 1, height: 1, background: '#D5C9B7' }} />
              </div>
            </Section>

            {/* Contact */}
            <Section title="Kontakt">
              <Input label="E-Mail" type="email" value={email} onChange={setEmail} placeholder="deine@email.de" required autoComplete="email" />
            </Section>

            {/* Shipping */}
            <Section title="Lieferadresse">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Vorname" value={firstName} onChange={setFirstName} required autoComplete="given-name" />
                <Input label="Nachname" value={lastName} onChange={setLastName} required autoComplete="family-name" />
              </div>
              <Input label="Straße & Hausnummer" value={street} onChange={setStreet} required autoComplete="street-address" />
              <div className="grid grid-cols-[1fr_2fr] gap-3">
                <Input label="PLZ" value={zip} onChange={setZip} required autoComplete="postal-code" />
                <Input label="Stadt" value={city} onChange={setCity} required autoComplete="address-level2" />
              </div>
              <Input label="Land" value={country} onChange={setCountry} required autoComplete="country-name" />
            </Section>

            {/* Payment */}
            <Section title="Zahlungsart">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Radio label="Kreditkarte" checked={method === 'card'} onChange={() => setMethod('card')} />
                <Radio label="Kauf auf Rechnung" checked={method === 'invoice'} onChange={() => setMethod('invoice')} />
                <Radio label="PayPal" checked={method === 'paypal'} onChange={() => setMethod('paypal')} />
              </div>
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: '#A39686', marginTop: 12 }}>
                Demo-Checkout — es wird keine echte Zahlung ausgelöst.
              </p>
            </Section>

            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: 8, fontSize: 15, padding: '16px 24px' }}>
              Jetzt kaufen · {euro(total)}
            </button>
          </form>

          {/* Summary */}
          <aside className="lg:sticky" style={{ top: 96, background: '#F5F2ED', borderRadius: 8, padding: 24 }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, color: '#2C2420', marginBottom: 18 }}>Bestellübersicht</h2>
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3" style={{ marginBottom: 14 }}>
                <div className="flex items-center justify-center" style={{ width: 44, height: 54, flexShrink: 0, background: '#E8E1D6', borderRadius: 4, fontFamily: '"Cormorant Garamond", serif', fontSize: 22, color: '#A0522D' }}>{item.char}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 500, color: '#2C2420', lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 11.5, color: '#8A7E72', lineHeight: 1.4, marginTop: 2 }}>{item.meta}</p>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: '#8A7E72', marginTop: 2 }}>Menge: {item.qty}</p>
                </div>
                <strong style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#2C2420' }}>{euro(item.price * item.qty)}</strong>
              </div>
            ))}

            <div style={{ borderTop: '1px solid #E0D7C8', marginTop: 8, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8, fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#4A423C' }}>
              <Row label="Zwischensumme" value={euro(subtotal)} />
              <Row label="Versand" value={shipping === 0 ? 'Kostenlos' : euro(shipping)} accent={shipping === 0} />
            </div>
            <div className="flex justify-between items-baseline" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E0D7C8' }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, fontWeight: 600, color: '#2C2420' }}>Gesamt</span>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 20, fontWeight: 600, color: '#2C2420' }}>{euro(total)}</span>
            </div>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 11.5, color: '#A39686', marginTop: 4 }}>inkl. MwSt.</p>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Trust icon={Truck} text={`Kostenloser Versand ab ${euro(FREE_SHIPPING_THRESHOLD)}`} />
              <Trust icon={ShieldCheck} text="Sichere, verschlüsselte Zahlung" />
              <Trust icon={Lock} text="Keine versteckten Kosten" />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

/* ── helpers ─────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#2C2420', marginBottom: 14 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </section>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, required, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; autoComplete?: string
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 500, color: '#2C2420', marginBottom: 6 }}>
        {label}{required && <sup style={{ color: '#A0522D' }}> *</sup>}
      </span>
      <input className="form-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} autoComplete={autoComplete} />
    </label>
  )
}

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3" style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#2C2420', cursor: 'pointer', padding: '12px 14px', border: `1px solid ${checked ? '#A0522D' : '#D4C8B8'}`, borderRadius: 6, background: checked ? 'rgba(160,82,45,0.05)' : '#FAF7F2' }}>
      <input type="radio" name="payment" checked={checked} onChange={onChange} style={{ accentColor: '#A0522D' }} />
      {label}
    </label>
  )
}

function ExpressButton({ label, bg, color, border, onClick }: { label: string; bg: string; color: string; border?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, height: 46, borderRadius: 6,
        background: bg, color, border: border ? '1px solid #D4C8B8' : 'none', cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span style={{ color: accent ? '#6B7F5C' : undefined, fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  )
}

function Trust({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex items-center gap-2" style={{ fontFamily: '"Inter", sans-serif', fontSize: 12.5, color: '#8A7E72' }}>
      <Icon size={15} strokeWidth={1.6} style={{ color: '#A0522D', flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  )
}
