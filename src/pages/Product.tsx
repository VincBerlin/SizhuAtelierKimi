import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { Check } from 'lucide-react'
import {
  getProduct,
  posterSizes,
  frameOptions,
  backgroundOptions,
  productMaterial,
  productSizeGuide,
  productShipping,
} from '../lib/shop'
import { useShop } from '../components/ShopProvider'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion'
import StarRating from '../components/StarRating'
import TrustBar from '../components/TrustBar'
import ProductCard from '../components/ProductCard'
import FaqAccordion from '../components/FaqAccordion'
import { faqs } from '../lib/content'

const euro = (n: number) => '€ ' + n.toFixed(2).replace('.', ',')

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const product = id ? getProduct(id) : undefined
  const { addConfiguredProduct } = useShop()

  const [galleryIndex, setGalleryIndex] = useState(0)
  const [sizeId, setSizeId] = useState(posterSizes[1].id)
  const [frameId, setFrameId] = useState(frameOptions[0].id)
  const [backgroundId, setBackgroundId] = useState(backgroundOptions[0].id)
  const [personName, setPersonName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [note, setNote] = useState('')
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setGalleryIndex(0)
  }, [id])

  if (!product) {
    return (
      <main style={{ background: '#E8E1D6', paddingTop: 140, minHeight: '70vh', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, color: '#2C2420' }}>Produkt nicht gefunden</p>
        <Link to="/shop" style={{ display: 'inline-block', marginTop: 16, color: '#A0522D', fontFamily: '"Inter", sans-serif' }}>
          Zurück zum Shop →
        </Link>
      </main>
    )
  }

  const size = posterSizes.find((o) => o.id === sizeId) ?? posterSizes[1]
  const frame = frameOptions.find((o) => o.id === frameId) ?? frameOptions[0]
  const background = backgroundOptions.find((o) => o.id === backgroundId) ?? backgroundOptions[0]
  const comingSoon = product.status === 'coming-soon'
  const liveTotal = (size.price ?? product.priceFrom) + (frame.price ?? 0)
  const gallery = product.gallery?.length ? product.gallery : [product.image]
  const crossSellProducts = (product.crossSell ?? []).map(getProduct).filter(Boolean)
  const baseSaving = product.compareAtPrice ? product.compareAtPrice - product.priceFrom : 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (comingSoon) {
      setJoined(true)
      return
    }
    addConfiguredProduct({ product, size, frame, background, personName, birthDate, birthTime, birthPlace, note })
  }

  return (
    <main style={{ background: '#E8E1D6', paddingTop: 72 }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '24px 24px 8px' }}>
        <nav style={{ fontFamily: '"Inter", sans-serif', fontSize: 12.5, color: '#8A7E72' }}>
          <Link to="/shop" style={{ color: '#8A7E72', textDecoration: 'none' }}>Shop</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{product.category}</span>
        </nav>
      </div>

      <div className="max-w-[1320px] mx-auto" style={{ padding: '8px 24px 48px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(380px,420px)] gap-10 lg:gap-14 items-start">
          {/* ── Gallery ──────────────────────────────────── */}
          <div>
            <div className="overflow-hidden rounded" style={{ aspectRatio: '4/5', background: product.background }}>
              <img src={gallery[galleryIndex]} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3" style={{ marginTop: 14 }}>
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className="overflow-hidden rounded"
                    aria-label={`Bild ${i + 1} ansehen`}
                    style={{
                      width: 72,
                      height: 90,
                      flexShrink: 0,
                      border: `2px solid ${i === galleryIndex ? '#A0522D' : 'transparent'}`,
                      padding: 0,
                      cursor: 'pointer',
                      background: product.background,
                    }}
                  >
                    <img src={src} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Buy box (sticky) ─────────────────────────── */}
          <div className="lg:sticky" style={{ top: 96 }}>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A0522D' }}>
              {product.label}
            </p>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(30px, 4vw, 42px)', color: '#2C2420', lineHeight: 1.1, marginTop: 8 }}>
              {product.title}
            </h1>

            {product.rating && (
              <div style={{ marginTop: 12 }}>
                <StarRating rating={product.rating} reviewCount={product.reviewCount} />
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3" style={{ marginTop: 16 }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 26, fontWeight: 600, color: '#2C2420' }}>
                {comingSoon ? 'Bald verfügbar' : euro(liveTotal)}
              </span>
              {product.compareAtPrice && !comingSoon && (
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, color: '#8A7E72', textDecoration: 'line-through' }}>
                  {euro(product.compareAtPrice)}
                </span>
              )}
              {baseSaving > 0 && !comingSoon && (
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, color: '#F5F2ED', background: '#6B7F5C', padding: '3px 8px', borderRadius: 3 }}>
                  Spare € {baseSaving}
                </span>
              )}
            </div>
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12.5, color: '#8A7E72', marginTop: 4 }}>
              inkl. MwSt. · zzgl. Versand · {size.label}
              {frame.price ? ` + Rahmen ${frame.label}` : ''}
            </p>

            {/* Bullets */}
            {product.bullets && (
              <ul style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5" style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#4A423C', lineHeight: 1.5 }}>
                    <Check size={17} strokeWidth={2} style={{ color: '#A0522D', flexShrink: 0, marginTop: 2 }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              {/* Personalization */}
              {product.personalize && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <Field label="Name der Person" required={!comingSoon}>
                    <input className="form-input" value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="z.B. Marie Müller" required={!comingSoon} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Geburtsdatum" required={!comingSoon}>
                      <input className="form-input" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required={!comingSoon} />
                    </Field>
                    <Field label="Geburtszeit" required={!comingSoon}>
                      <input className="form-input" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} required={!comingSoon} />
                    </Field>
                  </div>
                  <Field label="Geburtsort" required={!comingSoon}>
                    <input className="form-input" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="z.B. Berlin, Deutschland" required={!comingSoon} />
                  </Field>
                </div>
              )}

              {/* Size */}
              <OptionGroup label="Größe">
                {posterSizes.map((o) => (
                  <Pill key={o.id} active={sizeId === o.id} onClick={() => setSizeId(o.id)}>{o.label}</Pill>
                ))}
              </OptionGroup>

              {/* Frame */}
              <OptionGroup label="Rahmen">
                {frameOptions.map((o) => (
                  <Pill key={o.id} active={frameId === o.id} onClick={() => setFrameId(o.id)}>
                    {o.swatch && o.swatch !== 'transparent' && (
                      <span style={{ width: 12, height: 12, borderRadius: 2, background: o.swatch, display: 'inline-block', marginRight: 7, verticalAlign: 'middle' }} />
                    )}
                    {o.label}{o.price ? ` +€ ${o.price}` : ''}
                  </Pill>
                ))}
              </OptionGroup>

              {/* Background */}
              <div style={{ marginTop: 18 }}>
                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#2C2420', marginBottom: 10 }}>
                  Hintergrundfarbe: <span style={{ color: '#8A7E72', fontWeight: 400, textTransform: 'none' }}>{background.label}</span>
                </p>
                <div className="flex gap-2.5">
                  {backgroundOptions.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setBackgroundId(o.id)}
                      aria-label={o.label}
                      title={o.label}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: o.swatch,
                        border: `2px solid ${backgroundId === o.id ? '#A0522D' : 'rgba(44,36,32,0.18)'}`,
                        boxShadow: backgroundId === o.id ? '0 0 0 2px #E8E1D6 inset' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* CTA */}
              {comingSoon ? (
                <div style={{ marginTop: 24 }}>
                  <label style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, color: '#2C2420' }}>
                    E-Mail eintragen & 25% Early-Access sichern
                  </label>
                  <div className="flex gap-2" style={{ marginTop: 10 }}>
                    <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" required style={{ flex: 1 }} />
                    <button type="submit" className="cta-button" style={{ whiteSpace: 'nowrap' }}>25% sichern</button>
                  </div>
                  {joined && <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#6B7F5C', marginTop: 10 }}>Danke — dein Early-Access-Vorteil ist vorgemerkt.</p>}
                </div>
              ) : (
                <>
                  <Field label="Persönliche Notiz (optional)">
                    <input className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z.B. Für Papa zum Geburtstag" />
                  </Field>
                  <button type="submit" className="cta-button" style={{ width: '100%', marginTop: 18, fontSize: 15, padding: '16px 24px' }}>
                    In den Warenkorb · {euro(liveTotal)}
                  </button>
                </>
              )}
            </form>

            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #D5C9B7' }}>
              <TrustBar variant="compact" />
            </div>

            {/* Accordions */}
            <div style={{ marginTop: 22 }}>
              <Accordion type="single" collapsible className="w-full" style={{ color: '#2C2420' }}>
                <AccordionItem value="details">
                  <AccordionTrigger style={{ fontFamily: '"Inter", sans-serif', fontSize: 14 }}>Details & Beschreibung</AccordionTrigger>
                  <AccordionContent>
                    {(product.details ?? product.longDescription).map((p) => (
                      <p key={p} style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#6A615A', lineHeight: 1.7, marginBottom: 8 }}>{p}</p>
                    ))}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="material">
                  <AccordionTrigger style={{ fontFamily: '"Inter", sans-serif', fontSize: 14 }}>Material & Druck</AccordionTrigger>
                  <AccordionContent>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#6A615A', lineHeight: 1.7 }}>{productMaterial}</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="size">
                  <AccordionTrigger style={{ fontFamily: '"Inter", sans-serif', fontSize: 14 }}>Größenberater</AccordionTrigger>
                  <AccordionContent>
                    <ul style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#6A615A', lineHeight: 1.7, listStyle: 'disc', paddingLeft: 18 }}>
                      {productSizeGuide.map((s) => <li key={s} style={{ marginBottom: 4 }}>{s}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger style={{ fontFamily: '"Inter", sans-serif', fontSize: 14 }}>Versand & Rückgabe</AccordionTrigger>
                  <AccordionContent>
                    <ul style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#6A615A', lineHeight: 1.7, listStyle: 'disc', paddingLeft: 18 }}>
                      {productShipping.map((s) => <li key={s} style={{ marginBottom: 4 }}>{s}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Product FAQ */}
      <section style={{ background: '#F5F2ED', borderTop: '1px solid #E0D7C8' }}>
        <div className="max-w-[760px] mx-auto" style={{ padding: '56px 24px' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(26px, 3vw, 34px)', color: '#2C2420', marginBottom: 20 }}>
            Häufige Fragen
          </h2>
          <FaqAccordion items={faqs.slice(0, 5)} />
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#8A7E72', marginTop: 18 }}>
            Mehr Antworten im <Link to="/faq" style={{ color: '#A0522D' }}>FAQ-Bereich</Link>.
          </p>
        </div>
      </section>

      {/* Cross-sell */}
      {crossSellProducts.length > 0 && (
        <section style={{ background: '#E8E1D6', borderTop: '1px solid #E0D7C8' }}>
          <div className="max-w-[1320px] mx-auto" style={{ padding: '56px 24px' }}>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(26px, 3vw, 34px)', color: '#2C2420', marginBottom: 28 }}>
              Das passt dazu
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {crossSellProducts.map((p) => p && <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

/* ── small inline helpers ───────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', color: '#2C2420', marginBottom: 6 }}>
        {label}{required && <sup style={{ color: '#A0522D' }}> *</sup>}
      </span>
      {children}
    </label>
  )
}

function OptionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#2C2420', marginBottom: 10 }}>{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: '"Inter", sans-serif',
        fontSize: 13,
        fontWeight: 500,
        padding: '9px 16px',
        borderRadius: 6,
        border: `1px solid ${active ? '#A0522D' : 'rgba(44,36,32,0.18)'}`,
        background: active ? 'rgba(160,82,45,0.08)' : 'transparent',
        color: active ? '#A0522D' : '#2C2420',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  )
}
