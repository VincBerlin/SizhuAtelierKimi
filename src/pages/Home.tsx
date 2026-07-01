import { useEffect, lazy, Suspense, type ReactNode } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/I18nProvider'
import { C } from '../lib/tokens'
import { track, EVENTS } from '../lib/analytics'
// Three.js hero is split into its own chunk and streamed in after the hero
// text paints — keeps Three.js (~150KB gzip) off the critical path.
const InkWave = lazy(() => import('../components/InkWave'))
import CatalogSection from '../components/shop/CatalogSection'
import NewsletterSection from '../components/shop/NewsletterSection'
import HowItWorksSection from '../components/shop/HowItWorksSection'
import ShopByWorldSection from '../components/shop/ShopByWorldSection'
import InspirationTeaserSection from '../components/shop/InspirationTeaserSection'
import SeoTextSection from '../components/shop/SeoTextSection'
import NewArrivalsSection from '../components/shop/NewArrivalsSection'
import CampaignBannerRow from '../components/shop/CampaignBannerRow'
import TrustSection from '../components/shop/TrustSection'

/**
 * Stable, machine-checkable module anchor for the homepage target sequence
 * (M11 / REQ-014). Wraps each section with a `data-module="<id>"` +
 * `data-testid="home-module-<id>"` so the DOM order is verifiable through the
 * real App.tsx without coupling each reusable section component to its position.
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
            color: C.accent,
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
            // Hero primary-CTA click funnel event (T-701, instrumentation only —
            // RL-EVENT RED).
            onClick={() => track(EVENTS.heroCta, { cta: 'personalize' })}
            style={{
              background: C.accent,
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
            onMouseEnter={(e) => { e.currentTarget.style.background = C.accentHover }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.accent }}
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
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
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

  // M11 / REQ-014 — FULL homepage target sequence. This SUPERSEDES the delta
  // above-fold-only reorder + unchanged below-fold V2 chain (STOP-003): the old
  // data-band split and the 05→13 module numbers are removed. The new order is a
  // shopper funnel with semantic anchors:
  //   hero → bestseller → category-banners → editorial → new-arrivals →
  //   campaign-row → inspiration → seo → trust → newsletter (→ global footer).
  // Changes vs the old chain: New Arrivals is now a SEPARATE slider (REQ-018);
  // Fire Horse / Compatibility / Digital Analysis / Poster Sets are unified into
  // one visual CampaignBannerRow (REQ-019, no more isolated text-bands); Trust is
  // a STANDALONE band (REQ-022, honest service badges only); the standalone Blog
  // (Wissen) + duplicate process (PathToPoster) blocks are removed from the
  // purchase path (REQ-017/020 — still reachable via routes/footer). Hero stays
  // FIRST and untouched (REQ-003 / VIS-032): the lazy InkWave chunk is unchanged.
  //
  // NOTE: real-browser order/LCP + mobile evidence stay Playwright-only
  // (RL-CHROMIUM); RL-EVENT reads no real data. Nothing here is production-claimed.
  return (
    <main data-testid="home">
      <ModuleAnchor id="hero"><HeroSection /></ModuleAnchor>
      <ModuleAnchor id="bestseller"><CatalogSection /></ModuleAnchor>
      <ModuleAnchor id="category-banners"><ShopByWorldSection /></ModuleAnchor>
      <ModuleAnchor id="editorial"><HowItWorksSection /></ModuleAnchor>
      <ModuleAnchor id="new-arrivals"><NewArrivalsSection /></ModuleAnchor>
      <ModuleAnchor id="campaign-row"><CampaignBannerRow /></ModuleAnchor>
      <ModuleAnchor id="inspiration"><InspirationTeaserSection /></ModuleAnchor>
      <ModuleAnchor id="seo"><SeoTextSection /></ModuleAnchor>
      <ModuleAnchor id="trust"><TrustSection /></ModuleAnchor>
      <ModuleAnchor id="newsletter"><NewsletterSection /></ModuleAnchor>
    </main>
  )
}
