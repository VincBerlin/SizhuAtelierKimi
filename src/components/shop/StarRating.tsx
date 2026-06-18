import { C } from '../../lib/tokens'

/** Star rating via the prototype overlay technique: a muted full row with an
 *  accent-coloured clipped overlay of width `pct` (e.g. "98%"). */
export default function StarRating({ pct, size = 13 }: { pct: string; size?: number }) {
  return (
    <div style={{ position: 'relative', fontSize: size, lineHeight: 1, letterSpacing: '1px' }}>
      <span style={{ color: '#DDD4C4' }}>★★★★★</span>
      <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', whiteSpace: 'nowrap', width: pct, color: C.accent }}>★★★★★</span>
    </div>
  )
}
