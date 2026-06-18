import type { PosterData } from '../lib/bazi'
import { FONT_SERIF, FONT_SANS } from '../lib/tokens'

/**
 * Live-rendered BaZi poster — ported 1:1 from Poster.dc.html.
 * Text colour is chosen by luminance of `p.bg`; all inner sizes are
 * container-relative (`cqh`) so it scales in any container (grid card,
 * gallery, bundle fan). Fills its positioned parent (absolute inset:0).
 */
function lum(hex: string): number {
  const c = (hex || '#E9DFCB').replace('#', '')
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export type PosterScene = 'plain' | 'wall'

export default function Poster({ p, scene = 'plain' }: { p: PosterData; scene?: PosterScene }) {
  const bg = p.bg || '#E9DFCB'
  const light = lum(bg) > 0.55
  const textColor = light ? '#2A2620' : '#EDE6D6'
  const ruleColor = light ? 'rgba(42,38,32,0.22)' : 'rgba(237,230,214,0.30)'
  const sceneBg = scene === 'wall' ? '#D9D0C1' : '#FFFFFF'
  const pillars = p.pillars || []

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sceneBg, padding: '9%', boxSizing: 'border-box', transition: 'background .5s ease' }}>
      <div style={{ position: 'relative', height: '88%', aspectRatio: '1 / 1.414', background: p.frame, padding: '5%', boxSizing: 'border-box', boxShadow: '0 24px 50px -22px rgba(30,24,16,0.5), 0 6px 14px rgba(30,24,16,0.14)', transition: 'background .35s ease' }}>
        <div style={{ height: '100%', width: '100%', background: '#F5F0E4', padding: '6.5%', boxSizing: 'border-box' }}>
          <div style={{ height: '100%', width: '100%', background: bg, color: textColor, display: 'flex', flexDirection: 'column', padding: '8% 7%', boxSizing: 'border-box', containerType: 'size', fontFamily: FONT_SERIF, transition: 'background .35s ease, color .35s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: FONT_SANS, fontSize: '2.7cqh', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.78 }}>
              <span>{p.element}</span>
              <span>{p.animal}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7%' }}>
              {pillars.map((col, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5cqh' }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: '2.4cqh', opacity: 0.5, letterSpacing: '0.1em' }}>{col.label}</div>
                  <div style={{ fontSize: '9.5cqh', lineHeight: 1 }}>{col.stem}</div>
                  <div style={{ fontSize: '9.5cqh', lineHeight: 1 }}>{col.branch}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${ruleColor}`, paddingTop: '5%', textAlign: 'center' }}>
              <div style={{ fontSize: '7cqh', lineHeight: 1.1, letterSpacing: '0.01em' }}>{p.name}</div>
              <div style={{ fontFamily: FONT_SANS, fontSize: '2.1cqh', letterSpacing: '0.24em', textTransform: 'uppercase', marginTop: '1.4cqh', opacity: 0.62 }}>BaZi · Vier Säulen</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
