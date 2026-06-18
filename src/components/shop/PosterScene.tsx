import type { ReactNode } from 'react'
import Poster, { type PosterScene as Scene } from '../Poster'
import type { PosterData } from '../../lib/bazi'
import { C } from '../../lib/tokens'

/** Bordered scene box holding a Poster. With `hover`, a `wall`-scene copy
 *  crossfades in on hover (catalog grid). `children` is for overlays (badge). */
export default function PosterScene({
  poster,
  scene = 'plain',
  hover = false,
  aspect = '3 / 4',
  bg = '#fff',
  children,
}: {
  poster: PosterData
  scene?: Scene
  hover?: boolean
  aspect?: string
  bg?: string
  children?: ReactNode
}) {
  return (
    <div className={hover ? 'group' : undefined} style={{ position: 'relative', width: '100%', aspectRatio: aspect, background: bg, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Poster p={poster} scene={scene} />
      </div>
      {hover && (
        // REQ-019: hover image swap — desktop only. .poster-hover-fade is gated
        // behind @media (hover: hover) in index.css, so touch devices never
        // trigger a sticky hover. No layout shift (absolute overlay).
        <div className="poster-hover-fade" style={{ position: 'absolute', inset: 0 }}>
          <Poster p={poster} scene="wall" />
        </div>
      )}
      {children}
    </div>
  )
}
