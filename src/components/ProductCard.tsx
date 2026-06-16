import { Link } from 'react-router'
import type { ShopProduct } from '../lib/shop'
import StarRating from './StarRating'

const badgeColors: Record<NonNullable<ShopProduct['badgeTone']>, string> = {
  red: '#A0522D',
  green: '#6B7F5C',
  gold: '#C4A265',
}

/**
 * Category-grid product card. Clean image with a seamless hover image-swap
 * (product → lifestyle/detail), minimal chrome so products "breathe".
 */
export default function ProductCard({ product }: { product: ShopProduct }) {
  const comingSoon = product.status === 'coming-soon'

  return (
    <Link
      to={`/produkt/${product.id}`}
      className="group block"
      style={{ textDecoration: 'none' }}
    >
      <div
        className="relative overflow-hidden rounded"
        style={{ aspectRatio: '4/5', background: product.background }}
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: 1 }}
        />
        {product.hoverImage && (
          <img
            src={product.hoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {product.badge && (
          <span
            className="absolute"
            style={{
              top: 14,
              left: 14,
              fontFamily: '"Inter", sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#F5F2ED',
              background: badgeColors[product.badgeTone ?? 'gold'],
              padding: '5px 10px',
              borderRadius: 3,
            }}
          >
            {product.badge}
          </span>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0522D' }}>
          {product.category}
        </p>
        <h3
          className="transition-colors duration-300 group-hover:text-terracotta"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 21, fontWeight: 400, color: '#2C2420', marginTop: 4, lineHeight: 1.2 }}
        >
          {product.title}
        </h3>
        {product.rating && (
          <div style={{ marginTop: 8 }}>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size={14} />
          </div>
        )}
        <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, fontWeight: 600, color: '#2C2420' }}>
            {comingSoon ? 'Bald verfügbar' : product.priceLabel}
          </span>
          {product.compareAtPrice && !comingSoon && (
            <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#8A7E72', textDecoration: 'line-through' }}>
              € {product.compareAtPrice},00
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
