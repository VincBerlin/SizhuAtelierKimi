import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import Poster from '../components/Poster'
import PosterScene from '../components/shop/PosterScene'
import StarRating from '../components/shop/StarRating'
import Configurator from '../components/shop/Configurator'
import { getProduct, products, faqDefs } from '../lib/catalog'
import { computeChart, sizes, type PosterData } from '../lib/bazi'
import { useShopStore } from '../store/ShopStore'
import { euro, de } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, FREE_SHIP_THRESHOLD, ACCENT_CTA_SHADOW, CONTAINER } from '../lib/tokens'

export default function ProductView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cfg, addCurrent, openFaqId, setOpenFaqId, showToast } = useShopStore()

  const prod = getProduct(Number(id)) ?? products[0]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const chart = computeChart(cfg.date, cfg.time)
  const livePoster: PosterData = { frame: cfg.frameHex, bg: cfg.bgHex, name: cfg.name || 'Dein Name', element: chart.element, animal: chart.animal, pillars: chart.pillars }
  const size = sizes.find((z) => z.id === cfg.size) ?? sizes[1]
  const livePrice = prod.price + size.delta
  const liveAnchor = prod.anchor != null ? prod.anchor + size.delta : null
  const starPct = (prod.rating / 5) * 100 + '%'
  const related = products.filter((p) => p.id !== prod.id).slice(0, 3)

  const placeholderThumb = (label: string) => (
    <div style={{ aspectRatio: '4 / 5', background: '#F2ECE0', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted5, textAlign: 'center', padding: 8 }} dangerouslySetInnerHTML={{ __html: label }} />
    </div>
  )

  return (
    <main style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 64px' }}>
      <button onClick={() => { navigate('/'); window.scrollTo(0, 0) }} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted2, padding: '8px 0', fontFamily: FONT_SANS }}>← Zurück zur Kollektion</button>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" style={{ marginTop: 8 }}>
        {/* gallery */}
        <div className="lg:sticky lg:top-24">
          <PosterScene poster={livePoster} scene="plain" aspect="4 / 5" />
          <div className="grid grid-cols-3 gap-3" style={{ marginTop: 12 }}>
            <PosterScene poster={livePoster} scene="wall" aspect="4 / 5" />
            {placeholderThumb('Detail<br/>Rahmen-Makro')}
            {placeholderThumb('Lifestyle<br/>Praxis-Mockup')}
          </div>
          <p style={{ fontSize: 12, color: C.textMuted5, margin: '12px 2px 0', lineHeight: 1.5 }}>Live-Vorschau — Rahmen, Hintergrund und deine Daten werden sofort übernommen.</p>
        </div>

        {/* buy box */}
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.textMuted4, marginBottom: 8 }}>{prod.category}</div>
          <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 36, lineHeight: 1.1, margin: '0 0 14px' }}>{prod.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
            <StarRating pct={starPct} size={15} />
            <span style={{ fontSize: 13, color: C.textMuted }}>{prod.rating.toFixed(1).replace('.', ',')} · {de(prod.reviews)} Bewertungen · <strong style={{ color: C.ink, fontWeight: 600 }}>{de(prod.sold)}×</strong> verkauft</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 30, fontWeight: 600, color: C.ink }}>{euro(livePrice)}</span>
            {liveAnchor != null && (
              <>
                <span style={{ fontSize: 18, color: C.strike, textDecoration: 'line-through' }}>{euro(liveAnchor)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.accent, background: C.accentSoftBg, padding: '3px 9px', borderRadius: 5 }}>Spare {euro(liveAnchor - livePrice)}</span>
              </>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 20 }}>inkl. MwSt. · Kostenloser Versand ab {euro(FREE_SHIP_THRESHOLD)}</div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {prod.bullets.map((b) => (
              <li key={b} style={{ display: 'flex', gap: 10, fontSize: 14, lineHeight: 1.5, color: '#4A4438' }}><span style={{ color: C.accent }}>—</span><span>{b}</span></li>
            ))}
          </ul>

          <Configurator />

          {/* add to cart */}
          <button onClick={() => addCurrent(prod.id)} className="transition-[filter,transform] hover:brightness-110 active:translate-y-[1px]" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 18, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, letterSpacing: '0.01em', boxShadow: ACCENT_CTA_SHADOW }}>In den Warenkorb · {euro(livePrice)}</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <button onClick={() => showToast('Weiterleitung zur Express-Zahlung …')} className="transition-[filter] hover:brightness-95" style={{ background: '#FFC439', color: '#0a0a0a', border: 'none', cursor: 'pointer', padding: 13, borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: FONT_SANS }}>PayPal</button>
            <button onClick={() => showToast('Weiterleitung zur Express-Zahlung …')} className="transition-[filter] hover:brightness-125" style={{ background: '#000', color: '#fff', border: 'none', cursor: 'pointer', padding: 13, borderRadius: 10, fontSize: 15, fontWeight: 500, fontFamily: FONT_SANS }}> Pay</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 16, fontSize: 12, color: C.textMuted2 }}>
            <span>🔒 Sichere Zahlung</span><span>↺ 30 Tage Rückgabe</span><span>✺ Klimaneutral</span>
          </div>

          {/* faq accordions */}
          <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}` }}>
            {faqDefs.map((q) => {
              const open = openFaqId === q.id
              return (
                <div key={q.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <button onClick={() => setOpenFaqId(open ? '' : q.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, color: C.ink, textAlign: 'left' }}>
                    {q.q}<span style={{ fontSize: 20, color: C.textMuted3, fontWeight: 300 }}>{open ? '−' : '+'}</span>
                  </button>
                  {open && <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textMuted, margin: 0, padding: '0 2px 20px' }}>{q.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* cross-sell */}
      <section style={{ marginTop: 64, borderTop: `1px solid ${C.border}`, paddingTop: 40 }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 28, margin: '0 0 24px' }}>Wird oft zusammen gekauft</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 24 }}>
          {related.map((r) => (
            <div key={r.id} onClick={() => { navigate(`/produkt/${r.id}`); window.scrollTo(0, 0) }} style={{ cursor: 'pointer' }}>
              <div style={{ aspectRatio: '3/4', background: '#fff', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}><Poster p={r.poster} scene="plain" /></div>
              <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 18, margin: '12px 0 4px' }}>{r.title}</h3>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{euro(r.price)}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
