/**
 * DELTA T-306 + T-301-Lock — Newsletter/SEO buy-path cleanup (REQ-019) and the
 * Home trust-regression LOCK (REQ-010).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md
 *   AT-019-1  SEO block (home-module-12 / SeoTextSection) contains NO /blog links
 *             directly under the offer summaries (the buy-path band).
 *   AT-019-2  Blog links appear only in the Inspiration / Footer context, never in
 *             the offer-summary buy-path band.
 *   AT-019-3  Newsletter copy (EN/DE/FR) carries no precision over-claim
 *             (coupled to the existing truthful-claims list).
 *   AT-010-1  translations[EN/DE/FR] carry no coming-soon / patron / credit
 *             buy-path string (documented negations/disclaimers excepted).
 *   AT-010-2  rendered Home <main> shows no Coming-Soon / Patron / Credit block
 *             and no invented star ratings.
 *
 * Evidence class: `[REAL-BOUNDARY-jsdom]` — every render goes through the REAL
 * `src/App.tsx` composition root (MemoryRouter), so the SEO/Newsletter blocks and
 * the trust lock are asserted against the exact tree the app ships, not an isolated
 * component. The `[SHIPPED-SCAN]` copy checks run over the exported `translations`
 * instance the app actually renders.
 *
 * Mutation guard: re-introducing a /blog link into the SEO buy-path band, a
 * precision over-claim into the newsletter copy, or any Coming-Soon / Patron /
 * Credit / invented-star affordance into the Home <main> turns a case RED. This
 * test CLOSES the Home trust-cleanup (already shipped by T-301) and prevents
 * regression — it is the lock, not the original removal.
 *
 * RED-line discipline (Reality-Ledger): this polices copy + render presence only.
 * It certifies nothing about the BaZi chart math (RL-BAZI RED), pricing (RL-PRICES
 * RED) or images (RL-IMAGES RED); nothing here is production-verified.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { translations, type Lang } from '../../src/i18n/translations'

const LANGS: Lang[] = ['EN', 'DE', 'FR']
const BLOG_HREF_RE = /^\/blog(?:\/|$)/

// The buy-path band: the offer-summary / SEO modules a buyer scrolls through on
// the way to a purchase. A /blog link directly under these is the exact "störende
// Bloglink unter Angebotszusammenfassungen" REQ-019 removes. Module 09 is the
// Inspiration teaser (allowed inspiration context) and is intentionally excluded.
const OFFER_SUMMARY_MODULES = ['03', '04', '05', '06', '07', '08', '10', '11', '12'] as const
// The SEO block carries the offer summaries (per-world sections) at module 12.
const SEO_MODULE = 'home-module-12'

// ── shared scan helpers (mirror truthful-claims.test.ts / home-seo-block) ─────

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out)
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out)
  }
  return out
}

function firstHit(haystack: string, phrases: string[]): string | null {
  const lower = haystack.toLowerCase()
  for (const p of phrases) if (lower.includes(p.toLowerCase())) return p
  return null
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

/** Resolve once the lazy Home chunk has mounted its module anchors. */
async function findHomeMain() {
  await screen.findByTestId('home-module-12', undefined, { timeout: 15000 })
  return document.querySelector('main') as HTMLElement
}

beforeEach(() => {
  localStorage.clear()
})

// ══════════════════════════════════════════════════════════════════════════
//  T-306 / REQ-019 — Newsletter/SEO buy-path cleanup
// ══════════════════════════════════════════════════════════════════════════

// ── AT-019-1 — SEO block has no /blog link under the offer summaries ─────────

describe('REQ-019 / AT-019-1 — SEO block carries no /blog link', () => {
  it('the rendered SEO block (module 12) links to collections but never to /blog', async () => {
    renderHome()
    await findHomeMain()
    // The module-12 anchor can exist a commit before its inner links finish
    // painting under load, so re-read the links inside waitFor (mirrors AT-009-2).
    await waitFor(() => {
      const seo = screen.getByTestId(SEO_MODULE)
      const hrefs = within(seo)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      // positive: the SEO block still links into the real collection routes …
      expect(hrefs).toContain('/collections/bazi-posters')
      expect(hrefs).toContain('/collections/tcm-posters')
      expect(hrefs).toContain('/collections/wuxing-posters')
      // negative (the lock): NO /blog link sits in this offer-summary band.
      expect(hrefs.some((h) => BLOG_HREF_RE.test(h)), `SEO block still links to /blog: ${hrefs.join(', ')}`).toBe(false)
    })
  })
})

// ── AT-019-2 — blog links only in Inspiration/Footer, not in the buy-path band ─

describe('REQ-019 / AT-019-2 — blog links only in Inspiration/Footer context', () => {
  it('no offer-summary module in the buy-path band renders a /blog link', async () => {
    renderHome()
    await findHomeMain()
    await waitFor(() => {
      for (const id of OFFER_SUMMARY_MODULES) {
        const mod = screen.getByTestId(`home-module-${id}`)
        const blog = within(mod)
          .queryAllByRole('link')
          .filter((a) => BLOG_HREF_RE.test(a.getAttribute('href') ?? ''))
        expect(blog.length, `module ${id} renders a /blog link in the buy-path band`).toBe(0)
      }
    })
  })

  it('the Inspiration teaser routes to /inspiration (its own context, not /blog in the SEO band)', async () => {
    renderHome()
    await findHomeMain()
    await waitFor(() => {
      const insp = screen.getByTestId('home-module-09')
      const hrefs = within(insp)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      expect(hrefs).toContain('/inspiration')
    })
  })
})

// ── AT-019-3 — newsletter copy carries no precision over-claim ───────────────

// The same precision/over-claim phrases the global truthful scan polices — the
// newsletter "Cosmic Pulse" copy must obey them too (REQ-019 / FM-16 coupling).
const NEWSLETTER_OVERCLAIM: string[] = [
  // EN
  'celestial precision', 'exact energetic roadmap', 'precise reading', 'guaranteed accuracy',
  'we calculate your', 'exact mathematical', 'precision api',
  // DE
  'kosmische präzision', 'genaue energetische roadmap', 'präzise lesung', 'garantierte genauigkeit',
  'berechnen wir deine', 'exakte mathematische', 'präzisions-api',
  // FR
  'précision céleste', 'feuille de route énergétique précise', 'lecture précise', 'précision garantie',
  'nous calculons vos', 'calcul mathématique exact', 'api de précision',
]

describe('REQ-019 / AT-019-3 — newsletter copy trips no precision over-claim', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}].newsletter copy makes no precision over-claim`, () => {
      const newsletter = (translations[lang] as Record<string, unknown>).newsletter
      const strings = collectStrings(newsletter)
      // the newsletter subtree must exist and carry copy in every language
      expect(strings.length, `newsletter missing in ${lang}`).toBeGreaterThan(0)
      const blob = strings.join(' ')
      expect(firstHit(blob, NEWSLETTER_OVERCLAIM), `over-claim in ${lang} newsletter: ${blob.slice(0, 160)}`).toBeNull()
    })
  }
})

// ══════════════════════════════════════════════════════════════════════════
//  T-301-Lock / REQ-010 — Home trust regression lock
// ══════════════════════════════════════════════════════════════════════════

// Buy-path strings that must NOT appear as visible affordances in the shipped
// translations (documented negations/disclaimers are excluded by construction:
// the shop copy carries none of these tokens). "Coming Soon" / "Patron" /
// "Credits"/"Guthaben" are the removed celestial-credits + coming-soon affordances.
const COMING_SOON_RE = /coming soon|demnächst|bientôt disponible/i
const PATRON_RE = /\bpatron\b|patron fold|förder/i
const CREDIT_RE = /celestial credit|\bcredits?\b|guthaben|\bcrédits?\b/i
// A digit followed by the credits unit token "C." — the earn line / per-line badge.
const CREDIT_UNIT_RE = /\d\s*C\.(?:\s|$|<)/
// "★ 4.8 (123 reviews)"-style invented social proof in the rendered Home main.
const STAR_GLYPH_RE = /★/

// ── AT-010-1 — translations carry no coming-soon / patron / credit buy-path string ─

describe('REQ-010 / AT-010-1 — translations carry no coming-soon/patron/credit string', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}] (home + newsletter + cart + product subtrees) has no coming-soon/patron/credit copy`, () => {
      const root = translations[lang] as Record<string, unknown>
      // Scope to the buyer-visible shop subtrees (home/newsletter/cart/checkout/
      // product/footer); legal disclaimers live elsewhere and are not buy-path copy.
      const subtrees = ['home', 'newsletter', 'cart', 'checkout', 'product', 'footer', 'wissen']
        .map((k) => root[k])
      const blob = collectStrings(subtrees).join(' ')
      expect(firstHit(blob, ['coming soon', 'demnächst', 'bientôt disponible']), `coming-soon in ${lang}`).toBeNull()
      expect(firstHit(blob, ['celestial credit', 'guthaben']), `credit affordance in ${lang}`).toBeNull()
      expect(PATRON_RE.test(blob), `patron affordance in ${lang}`).toBe(false)
    })
  }
})

// ── AT-010-2 — rendered Home <main> shows no coming-soon/patron/credit/stars ──

describe('REQ-010 / AT-010-2 — Home <main> renders no coming-soon/patron/credit/invented-stars (mutation lock)', () => {
  it('the rendered Home <main> shows none of the removed trust affordances', async () => {
    renderHome()
    await findHomeMain()
    // Re-read the whole <main> subtree inside waitFor: lazy lower-band modules
    // (SEO, Newsletter) paint a commit later under CPU contention, so a synchronous
    // read after the module-12 anchor could miss a regression that mounts late.
    await waitFor(() => {
      const main = document.querySelector('main') as HTMLElement
      // the lower band must be settled — the newsletter (module 13) is mounted
      expect(within(main).getByTestId('home-module-13')).toBeInTheDocument()
      const html = main.innerHTML
      const text = main.textContent ?? ''

      expect(COMING_SOON_RE.test(text), 'Home <main> shows a "Coming Soon" affordance').toBe(false)
      expect(PATRON_RE.test(text), 'Home <main> shows a "Patron" affordance').toBe(false)
      expect(CREDIT_RE.test(text), 'Home <main> shows a credit affordance').toBe(false)
      expect(CREDIT_UNIT_RE.test(html), 'Home <main> renders a "<n> C." credits badge').toBe(false)
      // No invented star ratings: StarRating renders ★ glyphs and is only used
      // behind the review gate (REVIEWS_ENABLED && reviews > 0), which is off, so
      // no ★ may surface in the Home buy path.
      expect(STAR_GLYPH_RE.test(text), 'Home <main> renders an invented star rating').toBe(false)
    })
  })

  it('the Home buy path renders its real commerce CTAs (flow intact, not blanked)', async () => {
    renderHome()
    const main = await findHomeMain()
    // Positive guard so the negative lock above cannot be satisfied by an empty
    // render: the hero personalize CTA + a real collection link still ship.
    await waitFor(() => {
      const hrefs = within(main)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      expect(hrefs).toContain('/personalize')
      expect(hrefs.some((h) => h.startsWith('/collections/')), 'a real collection link ships in Home').toBe(true)
    })
  })
})
