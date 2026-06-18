import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

/* Gift ideas by occasion (§8.2 — 11 occasions). Personalizable occasions route
   into /personalize (CTA "Create a Personalized Gift"); non-personalizable ones
   route to their ready-to-ship Fire Horse / TCM product (CTA "Shop This Gift"). */
const GIFTS = [
  { key: 'wedding', img: '/images/gifts/wedding.webp', to: '/personalize', personalizable: true },
  { key: 'birthday', img: '/images/gifts/birthday.webp', to: '/personalize', personalizable: true },
  { key: 'anniversary', img: '/images/gifts/anniversary.webp', to: '/personalize', personalizable: true },
  { key: 'baby', img: '/images/gifts/baby.webp', to: '/personalize', personalizable: true },
  { key: 'newbeginning', img: '/images/posters/bazi-personal.webp', to: '/personalize', personalizable: true },
  { key: 'spiritual', img: '/images/posters/wuxing-wall.webp', to: '/personalize', personalizable: true },
  { key: 'couple', img: '/images/categories/bazi.webp', to: '/personalize', personalizable: true },
  { key: 'housewarming', img: '/images/posters/fire-horse.webp', to: '/product/8', personalizable: false },
  { key: 'wellness', img: '/images/posters/tcm-elements.webp', to: '/product/13', personalizable: false },
  { key: 'yoga', img: '/images/categories/tcm.webp', to: '/product/14', personalizable: false },
  { key: 'tcmpractice', img: '/images/categories/tcm.webp', to: '/product/12', personalizable: false },
] as const

function GiftCard({ gkey, img, to, personalizable }: { gkey: string; img: string; to: string; personalizable: boolean }) {
  const { t } = useT()
  return (
    <Link to={to} className="group" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden', background: '#fff' }}>
      <div style={{ aspectRatio: '4 / 3', overflow: 'hidden', background: C.surfaceWarm, position: 'relative' }}>
        <img src={img} alt="" loading="lazy" className="transition-transform duration-500 group-hover:scale-[1.04]" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <span style={{ position: 'absolute', top: 12, left: 12, fontFamily: FONT_SANS, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', background: personalizable ? C.accent : 'rgba(42,38,32,0.82)', borderRadius: 2, padding: '4px 9px' }}>
          {personalizable ? t('gifts.personalizedTag') : t('gifts.shopTag')}
        </span>
      </div>
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 20, color: C.ink, margin: '0 0 7px', lineHeight: 1.2 }}>{t(`gifts.cards.${gkey}.title`)}</h3>
        <p style={{ fontSize: 13.5, color: C.textMuted, lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>{t(`gifts.cards.${gkey}.copy`)}</p>
        <span className="transition-colors group-hover:text-[#A0341F]" style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent }}>{t(personalizable ? 'gifts.ctaPersonalize' : 'gifts.ctaShop')} →</span>
      </div>
    </Link>
  )
}

export default function Gifts() {
  const { t } = useT()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  useEffect(() => { window.scrollTo(0, 0) }, [])
  const faqs = (t('gifts.faqs') as { q: string; a: string }[]) || []

  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 16px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('gifts.eyebrow')}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>{t('gifts.title')}</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 620, margin: '0 0 8px', lineHeight: 1.65 }}>{t('gifts.sub')}</p>
      </div>

      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {GIFTS.map((g) => (
            <GiftCard key={g.key} gkey={g.key} img={g.img} to={g.to} personalizable={g.personalizable} />
          ))}
        </div>
      </section>

      {faqs.length > 0 && (
        <section style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 72px' }}>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 28, color: C.ink, margin: '0 0 18px' }}>{t('gifts.faqTitle')}</h2>
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {faqs.map((f, i) => {
              const open = openFaq === i
              return (
                <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <button onClick={() => setOpenFaq(open ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, color: C.ink, textAlign: 'left' }}>
                    {f.q}<span style={{ fontSize: 20, color: C.textMuted3, fontWeight: 300 }}>{open ? '−' : '+'}</span>
                  </button>
                  {open && <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textMuted, margin: 0, padding: '0 2px 20px' }}>{f.a}</p>}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
