import { useEffect, lazy, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/I18nProvider'
// Three.js hero is split into its own chunk and streamed in after the hero
// text paints — keeps Three.js (~150KB gzip) off the critical path.
const InkWave = lazy(() => import('../components/InkWave'))
import PathToPoster from '../components/shop/PathToPoster'
import CatalogSection from '../components/shop/CatalogSection'
import NewsletterSection from '../components/shop/NewsletterSection'
import WissenSection from '../components/shop/WissenSection'
import HowItWorksSection from '../components/shop/HowItWorksSection'
import ShopByWorldSection from '../components/shop/ShopByWorldSection'
import FeaturedCollectionSection from '../components/shop/FeaturedCollectionSection'
import CompatibilitySection from '../components/shop/CompatibilitySection'
import AnalysisPdfsSection from '../components/shop/AnalysisPdfsSection'
import InspirationTeaserSection from '../components/shop/InspirationTeaserSection'
import SeoTextSection from '../components/shop/SeoTextSection'

/**
 * Stable, machine-checkable module anchor for the V2 homepage order (REQ-008).
 * Wraps each section with a `data-module="NN"` + `data-testid="home-module-NN"`
 * so the DOM order is verifiable through the real App.tsx (acceptance-design
 * AT-008-1) without coupling each reusable section component to its position.
 */
function ModuleAnchor({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-module={id} data-testid={`home-module-${id}`}>
      {children}
    </div>
  )
}

/* ===== HERO SECTION ===== */
function HeroSection() {
  const { t } = useT()
  return (
    <section id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#E8E1D6' }} />}>
        <InkWave />
      </Suspense>
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

  // V2 homepage module order 02→13 (REQ-008 AK-1). Module 01 (Utility Bar) lives
  // in the App shell (AnnouncementBar). Module 13 (Newsletter + Footer): the
  // SiteFooter is rendered globally by AppShell, so module 13 carries the
  // Newsletter here. Hero stays module 02 — FIRST — and is untouched (NFR-1):
  // the lazy InkWave chunk + Suspense boundary above is byte-equivalent.
  return (
    <main>
      <ModuleAnchor id="02"><HeroSection /></ModuleAnchor>
      <ModuleAnchor id="03"><ShopByWorldSection /></ModuleAnchor>
      <ModuleAnchor id="04"><CatalogSection /></ModuleAnchor>
      <ModuleAnchor id="05"><HowItWorksSection /></ModuleAnchor>
      <ModuleAnchor id="06"><FeaturedCollectionSection /></ModuleAnchor>
      <ModuleAnchor id="07"><CompatibilitySection /></ModuleAnchor>
      <ModuleAnchor id="08"><AnalysisPdfsSection /></ModuleAnchor>
      <ModuleAnchor id="09"><InspirationTeaserSection /></ModuleAnchor>
      <ModuleAnchor id="10"><WissenSection /></ModuleAnchor>
      <ModuleAnchor id="11"><PathToPoster /></ModuleAnchor>
      <ModuleAnchor id="12"><SeoTextSection /></ModuleAnchor>
      <ModuleAnchor id="13"><NewsletterSection /></ModuleAnchor>
    </main>
  )
}
