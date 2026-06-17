import { useState } from 'react'
import { products, categories } from '../../lib/catalog'
import ProductCard from './ProductCard'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

export default function CatalogSection() {
  const [activeCat, setActiveCat] = useState('Alle')
  const list = activeCat === 'Alle' ? products : products.filter((p) => p.category === activeCat)

  return (
    <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 34, margin: 0 }}>Die Kollektion</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((c) => {
            const sel = c === activeCat
            return (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                style={{ background: sel ? C.ink : C.bg, color: sel ? C.bg : '#5A5346', border: `1px solid ${sel ? C.ink : C.borderInput}`, cursor: 'pointer', padding: '8px 16px', borderRadius: 999, fontSize: 13, fontFamily: FONT_SANS, transition: 'all .2s' }}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
