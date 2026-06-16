import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: number
  showCount?: boolean
}

/**
 * Social-proof star rating. NOTE: rating/reviewCount come from product data
 * that is currently placeholder — show real review data before launch.
 */
export default function StarRating({ rating, reviewCount, size = 16, showCount = true }: StarRatingProps) {
  const rounded = Math.round(rating * 2) / 2

  return (
    <div className="flex items-center gap-2" aria-label={`${rating} von 5 Sternen`}>
      <div className="flex items-center" style={{ color: '#C4A265' }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = rounded - i >= 1 ? 1 : rounded - i === 0.5 ? 0.5 : 0
          return (
            <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
              <Star size={size} strokeWidth={1.5} className="absolute inset-0" style={{ color: '#D5C9B7' }} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star size={size} strokeWidth={1.5} fill="#C4A265" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      {showCount && (
        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#8A7E72' }}>
          {rating.toFixed(1)}
          {reviewCount ? ` · ${reviewCount} Bewertungen` : ''}
        </span>
      )}
    </div>
  )
}
