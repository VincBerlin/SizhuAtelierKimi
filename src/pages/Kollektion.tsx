import { useEffect } from 'react'
import { products } from '../lib/catalog'
import ProductCard from '../components/shop/ProductCard'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

export default function Kollektion() {
  const { t } = useT()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 64px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('pages.kollEyebrow')}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>{t('pages.kollTitle')}</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 560, margin: '0 0 40px', lineHeight: 1.65 }}>
          {t('pages.kollIntro')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 28 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </main>
  )
}
