import { Link } from 'react-router'
import { useT } from '../../i18n/I18nProvider'
import { track, EVENTS } from '../../lib/analytics'

/**
 * Split-Hero (Operator-Plan Hero/Mega-Menü 2026-07-12, §4):
 * 50/50 — links vollflächige Markenfarbe (#2C2420) mit H1 + Absatz + EINEM CTA,
 * rechts vollflächige Fotografie (object-fit: cover, kein Lazy-Loading,
 * fetchpriority=high). Keine Eyebrow, keine Karten, keine Banner im Hero.
 * Mobil gestapelt: Brandfläche oben (≥56%), Foto darunter (§7).
 *
 * HERO-ASSET (Ledger-RED): das finale Interior-Foto liefert der Operator
 * (Plan §4.5/§8); bis dahin bestes vorhandenes Asset (hero-bg-fallback).
 */
// Ink Black kommt aus der EINEN kanonischen Quelle (src/index.css
// --ink-black: #2C2420) — Operator-Vorgabe 2026-07-13: die linke Markenfläche
// trägt exakt diese Farbe. Hex-Fallback für Umgebungen ohne Stylesheet (jsdom).
const BRAND_INK = 'var(--ink-black, #2C2420)'
const BRAND_IVORY = '#FBF8F1'
const BRAND_TERRACOTTA = '#A0522D'

export default function SplitHero() {
  const { t } = useT()
  return (
    <section
      data-testid="split-hero"
      className="split-hero grid grid-cols-1 md:grid-cols-2"
      style={{ minBlockSize: '100%', height: '100%' }}
    >
      {/* Mobile-first Kopffreiheit: Announcement-Bar (34px) + fixierter Header
          (~72px) liegen ÜBER dem Hero. Unterhalb md ist die Markenfläche das
          oberste Element — ohne pt-[130px] rutschte die H1 unter das Logo
          (Fund hero-mobile.png 2026-07-12). Ab md zentriert die volle
          Viewport-Höhe die Inhalte ohnehin weit unterhalb des Headers. */}
      <div
        data-testid="split-hero-brand"
        className="flex flex-col justify-center px-8 pt-[130px] pb-14 md:py-14 sm:px-12 lg:px-20"
        style={{ background: BRAND_INK, minBlockSize: 'max(56vh, min-content)' }}
      >
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 400,
            fontSize: 'clamp(38px, 4.5vw, 72px)',
            lineHeight: 1.08,
            color: BRAND_IVORY,
            margin: 0,
          }}
        >
          {t('hero.title1')} {t('hero.title2')}
        </h1>
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 16,
            color: 'rgba(251,248,241,0.78)',
            maxWidth: 460,
            marginTop: 22,
            lineHeight: 1.7,
          }}
        >
          {t('hero.subtitle')}
        </p>
        <div style={{ marginTop: 36 }}>
          <Link
            to="/collections"
            data-testid="split-hero-cta"
            onClick={() => track(EVENTS.heroCta, { cta: 'collections' })}
            className="inline-block transition-[filter] hover:brightness-110"
            style={{
              background: BRAND_TERRACOTTA,
              color: BRAND_IVORY,
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '15px 34px',
              textDecoration: 'none',
            }}
          >
            {t('hero.cta2')}
          </Link>
        </div>
      </div>
      <picture data-testid="split-hero-media" className="split-hero__media block" style={{ minBlockSize: 'max(44vh, 220px)' }}>
        <source srcSet="/images/hero-bg-fallback.webp" type="image/webp" />
        <img
          src="/images/hero-bg-fallback.jpg"
          alt={t('hero.imageAlt')}
          width={1344}
          height={768}
          // @ts-expect-error — fetchpriority ist valides HTML-Attribut (React <19 Typen kennen es klein geschrieben nicht)
          fetchpriority="high"
          decoding="sync"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </picture>
    </section>
  )
}
