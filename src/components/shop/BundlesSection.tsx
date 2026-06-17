import Poster from '../Poster'
import { bundles } from '../../lib/catalog'
import { useShopStore } from '../../store/ShopStore'
import { euro } from '../../lib/format'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

export default function BundlesSection() {
  const { addBundle } = useShopStore()

  return (
    <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ background: C.ink, borderRadius: 16, padding: 44, color: C.inkOnDark }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A28E', marginBottom: 10 }}>Mehr nehmen, weniger zahlen</div>
            <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 32, margin: 0 }}>Sets für Praxis &amp; Studio</h2>
          </div>
          <p style={{ fontSize: 13, color: '#A9A091', maxWidth: 300, margin: 0 }}>Abgestimmte Dreier-Sets — ein stimmiges Gesamtbild für deine Räume, zum Vorteilspreis.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {bundles.map((b) => (
            <div key={b.id} style={{ background: C.bundleCard, border: `1px solid ${C.bundleBorder}`, borderRadius: 12, padding: 22, display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 108, height: 140, flexShrink: 0 }}>
                <div style={{ position: 'absolute', left: 0, top: 8, width: 74, height: 98, transform: 'rotate(-7deg)' }}><Poster p={b.p1} scene="plain" /></div>
                <div style={{ position: 'absolute', right: 0, top: 8, width: 74, height: 98, transform: 'rotate(7deg)' }}><Poster p={b.p2} scene="plain" /></div>
                <div style={{ position: 'absolute', left: 17, top: 0, width: 74, height: 98 }}><Poster p={b.p3} scene="plain" /></div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, margin: '0 0 4px', color: C.inkOnDark }}>{b.title}</h3>
                <p style={{ fontSize: 12, color: '#A9A091', margin: '0 0 14px' }}>{b.sub}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 14 }}>
                  <span style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{euro(b.price)}</span>
                  <span style={{ fontSize: 14, color: '#8f8576', textDecoration: 'line-through' }}>{euro(b.anchor)}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#E4B89F' }}>Spare {euro(b.anchor - b.price)}</span>
                </div>
                <button onClick={() => addBundle(b)} className="transition-[filter] hover:brightness-110" style={{ background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: FONT_SANS }}>Set in den Warenkorb</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
