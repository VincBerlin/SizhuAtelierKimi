import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { shopProducts, bundles, getProduct, type Bundle } from '../lib/shop'
import ProductCard from '../components/ProductCard'
import TrustBar from '../components/TrustBar'
import Testimonials from '../components/Testimonials'
import { useShop } from '../components/ShopProvider'

const ALL = 'Alle'

export default function Shop() {
  const [active, setActive] = useState(ALL)
  const location = useLocation()
  const { addItem } = useShop()

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [location])

  const addBundle = (bundle: Bundle) => {
    const titles = bundle.productIds
      .map((pid) => getProduct(pid)?.title)
      .filter((t): t is string => Boolean(t))
    addItem({
      id: `bundle:${bundle.id}`,
      productId: bundle.id,
      name: bundle.title,
      price: bundle.bundlePrice,
      qty: 1,
      char: '套',
      meta: titles.join(' + '),
    })
  }

  const categories = useMemo(() => {
    const seen: string[] = [ALL]
    for (const p of shopProducts) if (!seen.includes(p.category)) seen.push(p.category)
    return seen
  }, [])

  const products = useMemo(() => {
    const list = active === ALL ? shopProducts : shopProducts.filter((p) => p.category === active)
    // Available first, coming-soon last.
    return [...list].sort((a, b) => Number(a.status === 'coming-soon') - Number(b.status === 'coming-soon'))
  }, [active])

  return (
    <main style={{ background: '#E8E1D6', paddingTop: 72 }}>
      {/* Intro */}
      <section className="max-w-[1320px] mx-auto" style={{ padding: '56px 24px 32px' }}>
        <p className="section-eyebrow" style={{ color: '#A0522D' }}>KOLLEKTION</p>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(36px, 5vw, 56px)', color: '#2C2420', lineHeight: 1.1, marginTop: 8 }}>
          Astrologie- & Element-Poster
        </h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, color: '#8A7E72', maxWidth: 560, marginTop: 16, lineHeight: 1.7 }}>
          Personalisierte BaZi-Charts und ruhige Wuxing-Poster für Zuhause, Praxis und Studio — handveredelt im Atelier.
        </p>
      </section>

      <TrustBar />

      {/* Filter */}
      <section className="max-w-[1320px] mx-auto" style={{ padding: '32px 24px 0' }}>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = cat === active
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  padding: '8px 18px',
                  borderRadius: 9999,
                  border: `1px solid ${isActive ? '#A0522D' : 'rgba(44,36,32,0.15)'}`,
                  background: isActive ? '#A0522D' : 'transparent',
                  color: isActive ? '#F5F2ED' : '#2C2420',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1320px] mx-auto" style={{ padding: '32px 24px 64px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials background="#F5F2ED" />

      {/* Bundles */}
      <section id="bundles" style={{ background: '#E8E1D6', borderTop: '1px solid #E0D7C8' }}>
        <div className="max-w-[1320px] mx-auto" style={{ padding: '64px 24px' }}>
          <div className="text-center" style={{ marginBottom: 36 }}>
            <p className="section-eyebrow" style={{ color: '#A0522D' }}>SETS · VORTEILSPREIS</p>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(28px, 3.5vw, 40px)', color: '#2C2420', marginTop: 6 }}>
              Zusammen sparen
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bundles.map((bundle) => {
              const items = bundle.productIds.map(getProduct).filter(Boolean)
              const regular = items.reduce((sum, p) => sum + (p?.priceFrom ?? 0), 0)
              const save = regular - bundle.bundlePrice
              return (
                <div key={bundle.id} className="flex gap-5" style={{ background: '#F5F2ED', borderRadius: 8, padding: 20 }}>
                  <div className="overflow-hidden rounded" style={{ width: 130, flexShrink: 0, aspectRatio: '4/5' }}>
                    <img src={bundle.image} alt={bundle.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0522D' }}>
                      {bundle.label}
                    </span>
                    <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, color: '#2C2420', marginTop: 6, lineHeight: 1.2 }}>
                      {bundle.title}
                    </h3>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, color: '#8A7E72', marginTop: 8, lineHeight: 1.6 }}>
                      {bundle.description}
                    </p>
                    <div className="flex items-center gap-3" style={{ marginTop: 'auto', paddingTop: 12 }}>
                      <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 17, fontWeight: 600, color: '#2C2420' }}>€ {bundle.bundlePrice},00</span>
                      {save > 0 && (
                        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#8A7E72', textDecoration: 'line-through' }}>€ {regular},00</span>
                      )}
                      {save > 0 && (
                        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, fontWeight: 600, color: '#6B7F5C' }}>−€ {save}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => addBundle(bundle)}
                      className="cta-button"
                      style={{ marginTop: 14, alignSelf: 'flex-start', minHeight: 44, padding: '11px 22px', fontSize: 13 }}
                    >
                      Set in den Warenkorb
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-center" style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#8A7E72', marginTop: 28 }}>
            Set-Posten einzeln im{' '}
            <Link to="/shop" style={{ color: '#A0522D' }}>Shop</Link> ansehen.
          </p>
        </div>
      </section>
    </main>
  )
}
