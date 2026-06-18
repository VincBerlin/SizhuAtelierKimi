import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Product } from '../../lib/catalog'
import { C, FONT_SANS } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

const GAP = 16 // px gap between cards on the mobile track (keep in sync with .carousel-track)

// §3.3 — the home collection: a minimalist white-space grid on desktop, a
// horizontal touch-swipe carousel on mobile (arrows, dots, "swipe to explore").
// Layout switch lives in CSS (.carousel-track); the JS here only drives the
// mobile arrow visibility, dot state and smooth scroll-by-card.
export default function ProductCarousel({ products }: { products: Product[] }) {
  const { t } = useT()
  const ref = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const [active, setActive] = useState(0)
  // Swipe UI is mobile-only — on desktop/tablet the track is a static grid you
  // cannot swipe, so arrows/dots/hint must not appear there.
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)

  const cardStep = () => {
    const el = ref.current
    const first = el?.children[0] as HTMLElement | undefined
    return (first?.offsetWidth || (el ? el.clientWidth * 0.82 : 0)) + GAP
  }

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanPrev(scrollLeft > 8)
    setCanNext(scrollLeft + clientWidth < scrollWidth - 8)
    const step = cardStep()
    if (step > 0) setActive(Math.round(scrollLeft / step))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [update, products.length])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setIsMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const scrollByCard = (dir: number) => ref.current?.scrollBy({ left: dir * cardStep(), behavior: 'smooth' })
  const scrollToCard = (i: number) => ref.current?.scrollTo({ left: i * cardStep(), behavior: 'smooth' })

  const arrow = (side: 'prev' | 'next', enabled: boolean) => (
    <button
      onClick={() => scrollByCard(side === 'prev' ? -1 : 1)}
      disabled={!enabled}
      tabIndex={enabled ? 0 : -1}
      aria-hidden={!enabled}
      aria-label={t(side === 'prev' ? 'carousel.prev' : 'carousel.next')}
      style={{
        position: 'absolute', top: 'calc(50% - 60px)', [side === 'prev' ? 'left' : 'right']: 2, zIndex: 3,
        width: 44, height: 44, borderRadius: 999, border: `1px solid ${C.border}`,
        background: 'rgba(251,248,241,0.92)', backdropFilter: 'blur(4px)', color: C.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0, pointerEvents: enabled ? 'auto' : 'none',
        transition: 'opacity .2s', boxShadow: '0 6px 18px -8px rgba(28,24,18,0.45)',
      }}
    >
      {side === 'prev' ? <ChevronLeft size={20} strokeWidth={1.6} /> : <ChevronRight size={20} strokeWidth={1.6} />}
    </button>
  )

  return (
    <div style={{ position: 'relative' }}>
      {isMobile && arrow('prev', canPrev)}
      {isMobile && arrow('next', canNext)}

      <div ref={ref} className="carousel-track">
        {products.map((p) => (
          <div className="carousel-item" key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* dots + swipe hint — mobile only */}
      {isMobile && (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {products.map((_, i) => (
            <button
              key={i} onClick={() => scrollToCard(i)} aria-label={`${t('carousel.goto')} ${i + 1}`}
              style={{ width: i === active ? 20 : 7, height: 7, borderRadius: 999, border: 'none', cursor: 'pointer', background: i === active ? C.accent : C.borderInput, transition: 'width .25s, background .25s', padding: 0 }}
            />
          ))}
        </div>
        <span style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textMuted3 }}>{t('carousel.hint')}</span>
      </div>
      )}
    </div>
  )
}
