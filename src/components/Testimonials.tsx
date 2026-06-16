import { Quote } from 'lucide-react'
import { testimonials, averageRating } from '../lib/content'
import StarRating from './StarRating'

interface TestimonialsProps {
  heading?: string
  limit?: number
  background?: string
}

/**
 * Social-proof testimonial grid. NOTE: testimonial copy is placeholder —
 * replace with real reviews before launch.
 */
export default function Testimonials({ heading = 'Was Kund:innen sagen', limit, background = '#E8E1D6' }: TestimonialsProps) {
  const list = limit ? testimonials.slice(0, limit) : testimonials

  return (
    <section aria-label="Kundenstimmen" style={{ background }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '64px 24px' }}>
        <div className="text-center" style={{ marginBottom: 36 }}>
          <p className="section-eyebrow" style={{ color: '#A0522D' }}>BEWERTUNGEN</p>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(28px, 3.5vw, 40px)', color: '#2C2420', marginTop: 6 }}>
            {heading}
          </h2>
          <div className="flex items-center justify-center gap-3" style={{ marginTop: 12 }}>
            <StarRating rating={averageRating} showCount={false} size={18} />
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72' }}>
              {averageRating.toFixed(1)} von 5 · {testimonials.length}+ Bewertungen
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((t) => (
            <figure key={t.id} style={{ background: '#F5F2ED', borderRadius: 8, padding: 24, margin: 0, display: 'flex', flexDirection: 'column' }}>
              <Quote size={22} style={{ color: '#C4A265', marginBottom: 12 }} />
              <StarRating rating={t.rating} showCount={false} size={14} />
              <blockquote style={{ fontFamily: '"Inter", sans-serif', fontSize: 14.5, color: '#4A423C', lineHeight: 1.65, margin: '12px 0 0', flex: 1 }}>
                „{t.text}"
              </blockquote>
              <figcaption style={{ marginTop: 16, fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#2C2420' }}>
                <strong style={{ fontWeight: 600 }}>{t.name}</strong>
                <span style={{ color: '#8A7E72' }}> · {t.location}</span>
                {t.context && (
                  <span style={{ display: 'block', fontSize: 12, color: '#A0522D', marginTop: 2 }}>{t.context}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
