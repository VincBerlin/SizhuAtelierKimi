import { useEffect } from 'react'
import { Link } from 'react-router'
import { products } from '../lib/catalog'
import ProductCard from '../components/shop/ProductCard'
import FaqSection from '../components/shop/FaqSection'
import NewsletterSection from '../components/shop/NewsletterSection'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

/* Collections hub (REQ-021/022) — current MVP collections only (no Saju/Junishi).
   Each card links to the best available destination; the dedicated couple/gift
   flows deepen in later iterations. */
const COLLECTIONS = [
  { key: 'bazi', img: '/images/categories/bazi.jpg', to: '/product/1' },
  { key: 'birthchart', img: '/images/posters/bazi-personal.jpg', to: '/personalize' },
  { key: 'couple', img: '/images/gifts/wedding.jpg', to: '/personalize' },
  { key: 'firehorse', img: '/images/posters/fire-horse.jpg', to: '/product/8' },
  { key: 'digital', img: '/images/posters/tcm-elements.jpg', to: '/digital' },
  { key: 'bundles', img: '/images/posters/wuxing-wall.jpg', to: '/bundles' },
  { key: 'gifts', img: '/images/gifts/birthday.jpg', to: '/personalize' },
] as const

function CollectionCard({ ckey, img, to }: { ckey: string; img: string; to: string }) {
  const { t } = useT()
  return (
    <Link to={to} className="group" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
      <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', background: C.surfaceWarm }}>
        <img src={img} alt="" loading="lazy" className="transition-transform duration-500 group-hover:scale-[1.04]" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 20, color: C.ink, margin: '0 0 7px', lineHeight: 1.2 }}>{t(`coll.cards.${ckey}.title`)}</h3>
        <p style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>{t(`coll.cards.${ckey}.desc`)}</p>
        <span className="transition-colors group-hover:text-[#A0341F]" style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent }}>{t(`coll.cards.${ckey}.cta`)} →</span>
      </div>
    </Link>
  )
}

export default function Kollektion() {
  const { t } = useT()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      {/* Collection hero */}
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 8px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('pages.kollEyebrow')}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>{t('pages.kollTitle')}</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 560, margin: '0 0 8px', lineHeight: 1.65 }}>{t('pages.kollIntro')}</p>
      </div>

      {/* Collection cards */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
          {COLLECTIONS.map((c) => (
            <CollectionCard key={c.key} ckey={c.key} img={c.img} to={c.to} />
          ))}
        </div>
      </section>

      {/* All personalized posters */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '40px 32px 16px' }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 30, color: C.ink, margin: '0 0 24px' }}>{t('coll.allPosters')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 28 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Patron Vault — coming soon (REQ-021 #9) */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '32px 32px 8px' }}>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, background: C.surfaceWarm, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent }}>{t('coll.patron.eyebrow')}</div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 26, color: C.ink }}>{t('coll.patron.title')}</div>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6, margin: 0, maxWidth: 620 }}>{t('coll.patron.desc')}</p>
        </div>
      </section>

      {/* FAQ + Newsletter (REQ-021 #10, #11) */}
      <FaqSection />
      <NewsletterSection />
    </main>
  )
}
