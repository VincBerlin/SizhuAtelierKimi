import { featuredProducts, type PosterVariant, type ShopProduct } from '../lib/shop'
import { useShop } from './ShopProvider'

function PosterPreview({ variant }: { variant: PosterVariant }) {
  if (variant === 'saju') {
    return (
      <div className="featured-poster featured-poster-saju" aria-hidden="true">
        <div className="poster-border">
          <span className="poster-title">사주팔자</span>
          <span className="poster-subtitle">SAJU CHART</span>
          <span className="poster-rule" />
          <div className="saju-grid">
            <span>甲</span><span>乙</span><span>丙</span><span>丁</span>
            <span>寅</span><span>卯</span><span>午</span><span>酉</span>
          </div>
          <span className="poster-mark">命</span>
          <span className="poster-brand">SIZHU ATELIER</span>
        </div>
      </div>
    )
  }

  if (variant === 'compatibility') {
    return (
      <div className="featured-poster featured-poster-compatibility" aria-hidden="true">
        <div className="poster-border">
          <span className="poster-title compatibility-title">Kompatibilitäts-Poster</span>
          <span className="poster-subtitle">PARTNERSCHAFT</span>
          <div className="compatibility-names">
            <span>Anna</span>
            <strong>♥</strong>
            <span>Max</span>
          </div>
          <div className="compatibility-circles">
            <div>
              <strong>火</strong>
              <span>Feuer</span>
            </div>
            <em>相生</em>
            <div>
              <strong>木</strong>
              <span>Holz</span>
            </div>
          </div>
          <span className="poster-note">Erzeugendes Element</span>
          <span className="poster-brand">SIZHU ATELIER</span>
        </div>
      </div>
    )
  }

  if (variant === 'wuxing') {
    return (
      <div className="featured-poster featured-poster-wuxing" aria-hidden="true">
        <div className="poster-border">
          <span className="poster-title">五行</span>
          <span className="poster-subtitle">WUXING POSTER</span>
          <svg className="wuxing-diagram" viewBox="0 0 220 190" role="img">
            <line x1="110" y1="30" x2="185" y2="90" />
            <line x1="185" y1="90" x2="155" y2="165" />
            <line x1="155" y1="165" x2="65" y2="165" />
            <line x1="65" y1="165" x2="35" y2="90" />
            <line x1="35" y1="90" x2="110" y2="30" />
            <line x1="110" y1="30" x2="155" y2="165" />
            <line x1="185" y1="90" x2="65" y2="165" />
            <line x1="35" y1="90" x2="155" y2="165" />
            <line x1="110" y1="30" x2="65" y2="165" />
            <circle cx="110" cy="30" r="28" className="wood" />
            <circle cx="185" cy="90" r="28" className="fire" />
            <circle cx="155" cy="165" r="28" className="earth" />
            <circle cx="65" cy="165" r="28" className="metal" />
            <circle cx="35" cy="90" r="28" className="water" />
            <text x="110" y="29">木</text>
            <text x="185" y="89">火</text>
            <text x="155" y="164">土</text>
            <text x="65" y="164">金</text>
            <text x="35" y="89">水</text>
          </svg>
          <span className="poster-brand">SIZHU ATELIER</span>
        </div>
      </div>
    )
  }

  return (
    <div className="featured-poster featured-poster-bazi" aria-hidden="true">
      <div className="poster-border">
        <span className="poster-title">四柱命理</span>
        <span className="poster-subtitle">BAZI CHART</span>
        <span className="poster-rule" />
        <div className="bazi-grid">
          <span>庚</span><span>戊</span><span>丙</span><span>甲</span>
          <span>子</span><span>申</span><span>午</span><span>子</span>
        </div>
        <div className="element-row">
          <span>木</span>
          <span>火</span>
          <span>水</span>
        </div>
        <span className="poster-brand">SIZHU ATELIER</span>
      </div>
    </div>
  )
}

export default function DominoGallery() {
  const { configureProduct } = useShop()

  const openProduct = (product: ShopProduct) => {
    configureProduct(product)
  }

  return (
    <section id="ausgewaehlte-werke" className="featured-works-section" aria-labelledby="featured-works-title">
      <div className="featured-works-inner">
        <div className="featured-works-header">
          <div>
            <p className="section-eyebrow">AUSGEWÄHLTE WERKE</p>
            <h2 id="featured-works-title">Ausgewählte Werke</h2>
          </div>
          <a href="#shop" className="featured-works-link">
            Alle ansehen <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="featured-products-grid">
          {featuredProducts.map((product, index) => (
            <article className={`featured-product-card ${index === 0 ? 'featured-product-card-primary' : ''}`} data-product-id={product.id} key={product.id}>
              <button type="button" className="featured-product-media-link" aria-label={`${product.title} auswählen`} onClick={() => openProduct(product)}>
                <div className="featured-product-media" style={{ backgroundColor: product.background }}>
                  {product.badge && (
                    <span className={`featured-badge featured-badge-${product.badgeTone ?? 'red'}`}>
                      {product.badge}
                    </span>
                  )}
                  <PosterPreview variant={product.posterVariant} />
                  <div className="featured-product-quick">
                    <span>{product.status === 'coming-soon' ? 'Early Access sichern' : 'In den Warenkorb'}</span>
                  </div>
                </div>
              </button>
              <div className="featured-product-copy">
                <button type="button" className="featured-product-text-link" aria-label={`${product.title} auswählen`} onClick={() => openProduct(product)}>
                  <p>{product.label}</p>
                  <h3>{product.title}</h3>
                  <span>{product.priceLabel}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
