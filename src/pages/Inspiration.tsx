import { useEffect } from 'react'
import { Link } from 'react-router'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'
import { COLLECTION_SLUGS } from '../lib/collections'

/**
 * Inspiration / Gallery page (REQ-011 / T-17).
 *
 * A curated inspiration wall: each tile links to a real collection (or product)
 * route so the page is a genuine browse entry-point, never a dead gallery.
 *
 * RED-line / honesty discipline (REQ-011 AK-3, OQ-006): real product/interior
 * photography does not exist yet, so every tile here is backed by a PLACEHOLDER
 * visual and is CLEARLY marked as a placeholder (`data-placeholder="true"` + a
 * visible badge). No tile is presented as a real "customer example" or
 * testimonial — we never invent social proof. When real imagery lands, the
 * `placeholder` flag flips to false and the badge disappears.
 *
 * Layout: a single vertical column on mobile, a 2-column masonry-style grid from
 * tablet up (CSS `columns`), per PRD §9 / §18.
 */

interface InspirationTile {
  /** Destination: an existing collection slug (preferred) or product id. */
  href: string
  /** Short caption shown on the tile. */
  caption: string
  /** Eyebrow / context label (room / use-case). */
  context: string
  /** Background tint for the placeholder visual. */
  tint: string
  /** Whether this tile uses placeholder imagery (true until real photos land). */
  placeholder: boolean
}

// Curated set — every href is a real route (collection slug or product). All are
// placeholder visuals for now (no invented customer photography). Kept terse so
// the wall is curated, not overloaded.
const collPath = (slug: string) => `/collections/${slug}`

const TILES: InspirationTile[] = [
  { href: collPath('bazi-posters'), context: 'Wohnzimmer', caption: 'Persönliches BaZi-Poster über dem Sofa', tint: '#E9DFCB', placeholder: true },
  { href: collPath('tcm-posters'), context: 'Behandlungsraum', caption: 'TCM-Lehrtafel im Praxisflur', tint: '#AFBCA6', placeholder: true },
  { href: collPath('wuxing-posters'), context: 'Ruheraum', caption: 'Wuxing-Fünf-Elemente in der Wellness-Ecke', tint: '#C8B89A', placeholder: true },
  { href: collPath('compatibility-posters'), context: 'Schlafzimmer', caption: 'Paar-Kompatibilität als Geschenk zum Einzug', tint: '#D8C3B4', placeholder: true },
  { href: collPath('fire-horse-2026'), context: 'Arbeitszimmer', caption: 'Feuerpferd 2026 — Limited Edition an der Galeriewand', tint: '#BC7A5E', placeholder: true },
  { href: collPath('analysis-pdfs'), context: 'Digital', caption: 'Digitale BaZi-Analyse als 10–15-seitiges PDF', tint: '#D9D0C1', placeholder: true },
  { href: collPath('personalized-posters'), context: 'Eingangsbereich', caption: 'Personalisiertes Motiv als Blickfang im Flur', tint: '#E2DACB', placeholder: true },
  { href: collPath('bundles'), context: 'Studio', caption: 'Stimmiges Poster-Set für Studio & Wartebereich', tint: '#CFC4B2', placeholder: true },
]

// Safety net: every tile destination must be a known route. Filtering here keeps
// a stray edit from shipping a dead link to the wall.
const KNOWN_COLLECTION_PATHS = new Set<string>([
  ...COLLECTION_SLUGS.map((s) => `/collections/${s}`),
  '/collections',
])

function isLiveTile(t: InspirationTile): boolean {
  if (t.href.startsWith('/collections')) return KNOWN_COLLECTION_PATHS.has(t.href)
  return /^\/product\/\d+$/.test(t.href)
}

export default function Inspiration() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const tiles = TILES.filter(isLiveTile)

  return (
    <main data-testid="inspiration-page" style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 8px' }}>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          style={{ fontFamily: FONT_SANS, fontSize: 12.5, color: C.textMuted2, marginBottom: 18 }}
        >
          <Link to="/" style={{ color: C.textMuted2, textDecoration: 'none' }}>Start</Link>
          <span aria-hidden style={{ margin: '0 8px', color: C.textMuted4 }}>/</span>
          <span style={{ color: C.ink }}>Inspiration</span>
        </nav>

        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>
          Inspiration
        </div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>
          Poster im Raum — eine Inspirations-Wand
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 640, margin: '0 0 8px', lineHeight: 1.65 }}>
          Wie unsere Motive in Wohnräumen, Praxen und Studios wirken. Jede Kachel führt direkt zur passenden Kollektion.
        </p>
        {/* Honest disclosure: these are placeholder visuals, not customer photos. */}
        <p
          data-testid="inspiration-placeholder-disclosure"
          style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2, maxWidth: 640, margin: '0 0 24px', lineHeight: 1.55 }}
        >
          Hinweis: Die abgebildeten Szenen sind Platzhalter-Visualisierungen — noch keine echten Kunden-Fotos. Echte Produktbilder folgen.
        </p>
      </div>

      {/* Masonry gallery: vertical on mobile, 2 columns from tablet via CSS columns. */}
      <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '0 32px 64px' }}>
        <div
          data-testid="inspiration-gallery"
          style={{ columnGap: 24 }}
          className="inspiration-masonry"
        >
          {tiles.map((tile, i) => (
            <article
              key={`${tile.href}-${i}`}
              data-testid="inspiration-tile"
              data-placeholder={tile.placeholder ? 'true' : 'false'}
              style={{
                breakInside: 'avoid',
                marginBottom: 24,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                overflow: 'hidden',
                background: C.surface,
                display: 'inline-block',
                width: '100%',
              }}
            >
              <Link to={tile.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                {/* Placeholder visual slot — a tinted panel, NOT a fabricated photo. */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    background: tile.tint,
                    // Vary the aspect a little so the masonry reads as a wall.
                    aspectRatio: i % 3 === 0 ? '3 / 4' : i % 3 === 1 ? '4 / 5' : '1 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: FONT_SERIF, fontSize: 22, color: 'rgba(42,38,32,0.45)', letterSpacing: '0.04em' }}>
                    {tile.context}
                  </span>
                  {tile.placeholder && (
                    <span
                      data-testid="inspiration-placeholder-badge"
                      style={{
                        position: 'absolute', top: 10, left: 10,
                        fontFamily: FONT_SANS, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: C.ink,
                        background: 'rgba(251,248,241,0.92)', border: `1px solid ${C.borderInput}`,
                        borderRadius: 999, padding: '4px 9px',
                      }}
                    >
                      Placeholder
                    </span>
                  )}
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent, marginBottom: 6 }}>
                    {tile.context}
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.ink, lineHeight: 1.45 }}>
                    {tile.caption}
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.accent, fontWeight: 600, marginTop: 10 }}>
                    Kollektion ansehen →
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
