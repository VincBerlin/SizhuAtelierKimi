import { useEffect, type ReactNode } from 'react'
import SplitHero from '../components/home/SplitHero'
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

/* ===== HERO SECTION =====
 * Operator-Plan Hero/Mega-Menü 2026-07-12 (§2.1/§4): Split-Hero füllt den
 * verbleibenden Viewport unter Announcement-Bar (34px) + Header (72px, fixed).
 * Beim Laden ist KEIN Produktbereich sichtbar (Abnahme §11). Ersetzt den
 * InkWave-Three.js-Hero (VIS-032 vom Operator-Plan superseded; Chunk entfällt
 * vom kritischen Pfad komplett).
 */
function HeroSection() {
  // 100dvh (nicht 100dvh−Header): Announcement-Bar + Header sind FIXED und
  // nehmen keinen Fluss-Platz ein — der Hero füllt den ganzen Viewport, seine
  // oberen ~106px liegen hinter der transparenten Leiste (wie zuvor beim
  // InkWave-Hero). [REAL-BROWSER]-Beweis: hero-megamenu.spec.ts (Fund vom
  // ersten Lauf: calc-Variante ließ Produkte in den ersten Screen ragen).
  return (
    <section id="hero" data-testid="home-viewport-hero" style={{ height: '100dvh', minHeight: 620, overflow: 'hidden' }}>
      <SplitHero />
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
  // purchase path (REQ-017/020 — still reachable via routes/footer). Hero bleibt
  // FIRST — seit dem Operator-Plan Hero/Mega-Menü (2026-07-12) als SplitHero
  // in der Viewport-Shell (InkWave/VIS-032 superseded).
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
