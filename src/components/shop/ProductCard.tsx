import { useNavigate } from 'react-router'
import PosterScene from './PosterScene'
import StarRating from './StarRating'
import { euro, de } from '../../lib/format'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'
import { COMMERCE_ENABLED } from '../../lib/config'
import type { Product } from '../../lib/catalog'

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate()
  const { t, lang } = useT()
  const hasAnchor = product.anchor != null
  const starPct = (product.rating / 5) * 100 + '%'
  const go = () => {
    navigate(`/product/${product.id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div onClick={go} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      <PosterScene poster={product.poster} hover aspect="3 / 4">
        {COMMERCE_ENABLED && hasAnchor && (
          <span style={{ position: 'absolute', top: 14, left: 14, background: C.accent, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '5px 10px', borderRadius: 4, zIndex: 2 }}>
            −{euro((product.anchor as number) - product.price)}
          </span>
        )}
      </PosterScene>
      <div style={{ padding: '16px 2px 0' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted4, marginBottom: 5 }}>{product.category}</div>
        <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 21, margin: '0 0 6px', lineHeight: 1.15 }}>{t(`content.products.${product.id}.title`)}</h3>
        <p style={{ fontSize: 12.5, color: C.textMuted2, margin: '0 0 10px', lineHeight: 1.45 }}>{t('card.personalLine')}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <StarRating pct={starPct} />
          <span style={{ fontSize: 12, color: C.textMuted2 }}>{lang === 'EN' ? product.rating.toFixed(1) : product.rating.toFixed(1).replace('.', ',')} · {de(product.sold)}× {t('card.bought')}</span>
        </div>
        {COMMERCE_ENABLED ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{euro(product.price)}</span>
            {hasAnchor && <span style={{ fontSize: 14, color: C.strike, textDecoration: 'line-through' }}>{euro(product.anchor as number)}</span>}
          </div>
        ) : (
          <span style={{ fontSize: 12, letterSpacing: '0.04em', color: C.textMuted3 }}>{t('preview.soon')}</span>
        )}
        <div style={{ marginTop: 12, fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent }}>{t('card.personalize')} →</div>
      </div>
    </div>
  )
}
