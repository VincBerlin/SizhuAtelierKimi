import { Sparkles, Palette, Truck, ShieldCheck } from 'lucide-react'
import { C, FONT_SANS, CONTAINER } from '../../lib/tokens'

const items = [
  { icon: Sparkles, title: 'Persönlich', sub: 'Unikat aus deinen Geburtsdaten' },
  { icon: Palette, title: 'Individuell gestaltet', sub: 'Stile, Farben, Rahmen' },
  { icon: Truck, title: 'Schnelle Lieferung', sub: '5–7 Werktage, weltweit' },
  { icon: ShieldCheck, title: 'Sichere Zahlung', sub: 'pay' },
]

/** Mini payment "logos" — styled text chips (replace with brand SVGs later). */
function PayChips() {
  const chip = (bg: string, color: string, label: string, border?: boolean) => (
    <span style={{ fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, lineHeight: 1, padding: '3px 5px', borderRadius: 3, background: bg, color, border: border ? '1px solid #dadce0' : 'none' }}>{label}</span>
  )
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {chip('#FFC439', '#0a0a0a', 'PayPal')}
      {chip('#000', '#fff', ' Pay')}
      {chip('#fff', '#3c4043', 'G Pay', true)}
    </span>
  )
}

/**
 * Slim trust / payment strip directly under the hero. Replaces the old
 * 3-column block. Wraps on small screens (no squeezing).
 */
export default function TrustBar() {
  return (
    <section aria-label="Vorteile" style={{ background: C.surfaceWarm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div className="max-w-[1200px] mx-auto" style={{ maxWidth: CONTAINER, padding: '0 32px' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: '12px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px 22px' }}>
          {items.map((it) => (
            <li key={it.title} style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <it.icon size={17} strokeWidth={1.6} style={{ color: C.accent, flexShrink: 0 }} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: C.textMuted, lineHeight: 1.3 }}>
                <strong style={{ color: C.ink, fontWeight: 600 }}>{it.title}</strong>
                {it.sub === 'pay' ? ' · ' : <> · {it.sub}</>}
                {it.sub === 'pay' && <PayChips />}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
