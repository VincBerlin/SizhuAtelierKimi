import { useEffect } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/I18nProvider'
import InkWave from '../components/InkWave'
import TrustBar from '../components/shop/TrustBar'
import CatalogSection from '../components/shop/CatalogSection'
import BundlesSection from '../components/shop/BundlesSection'
import NewsletterSection from '../components/shop/NewsletterSection'
import WissenSection from '../components/shop/WissenSection'
import FaqSection from '../components/shop/FaqSection'

/* ===== HERO SECTION ===== */
function HeroSection() {
  const { t } = useT()
  return (
    <section id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <InkWave />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 0 80px 80px',
          maxWidth: 600,
        }}
        className="px-6 sm:px-10 lg:px-20 pb-16 sm:pb-20"
      >
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#A0522D',
            marginBottom: 16,
            textShadow: '0 0 40px rgba(232, 225, 214, 0.6)',
          }}
        >
          {t('hero.eyebrow')}
        </p>
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(48px, 6vw, 84px)',
            lineHeight: 1.05,
            color: '#2C2420',
            textShadow: '0 0 40px rgba(232, 225, 214, 0.6)',
          }}
        >
          {t('hero.title1')}<br />{t('hero.title2')}
        </h1>
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 17,
            fontWeight: 400,
            color: '#8A7E72',
            maxWidth: 440,
            marginTop: 20,
            lineHeight: 1.7,
            textShadow: '0 0 40px rgba(232, 225, 214, 0.6)',
          }}
        >
          {t('hero.subtitle')}
        </p>
        <div className="flex flex-wrap gap-4" style={{ marginTop: 36 }}>
          <Link
            to="/personalize"
            style={{
              background: '#A0522D',
              color: '#F5F2ED',
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '14px 32px',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#B5652B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#A0522D' }}
          >
            {t('hero.cta1')}
          </Link>
          <Link
            to="/collections"
            style={{
              background: 'transparent',
              color: '#2C2420',
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '14px 32px',
              border: '1px solid rgba(44, 36, 32, 0.15)',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A0522D'; e.currentTarget.style.color = '#A0522D' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(44, 36, 32, 0.15)'; e.currentTarget.style.color = '#2C2420' }}
          >
            {t('hero.cta2')}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ===== MAIN HOME PAGE ===== */
export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      <HeroSection />
      <TrustBar />
      <CatalogSection />
      <BundlesSection />
      <WissenSection />
      <FaqSection />
      <NewsletterSection />
    </main>
  )
}
