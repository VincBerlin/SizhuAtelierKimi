/**
 * DELTA T-305 — Offers / Sale / Campaign hub full build-out (REQ-024).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md §REQ-024
 *   AT-024-1  the offers-hub route renders ≥2 curated sections (distinct section anchors).
 *   AT-024-2  each section has short text + a product slider (≥1 card) + a CTA link.
 *   AT-024-3  asset-light: hub image fields are marked generic placeholders
 *             (`data-placeholder`), never a real /images/*.webp campaign visual (FM-11).
 *   AT-024-4  the "Angebote" primary-nav entry (REQ-003 / T-201) links to this hub
 *             route — no dead link.
 *
 * Evidence class: `[REAL-BOUNDARY-jsdom]` — every render goes through the REAL
 * `src/App.tsx` composition root (MemoryRouter), so a hub that renders in
 * isolation but is not wired as a production <Route> would still fail. The nav
 * coupling (AT-024-4) is read from the SAME shipped `PRIMARY_NAV` the app renders.
 *
 * RED-line discipline (Reality-Ledger): the hub makes NO invented discounts,
 * countdowns or "Coming Soon" fake — every section curates REAL catalog products
 * via the existing collection routes (RL-PRICES stays RED for FINAL numbers;
 * these tests pin the curated MECHANISM, never a sale figure). Real campaign
 * imagery is launch-blocking (OQ-001, RL-IMAGES RED) — the asset-light
 * placeholder assertion encodes exactly that carry. Nothing here is marked
 * production-verified.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { PRIMARY_NAV } from '../../src/components/Navbar'
import { OFFERS_SECTIONS } from '../../src/lib/collections'

const WEBP_RE = /\/images\/.*\.webp/i
// "Coming Soon" placeholder fakery must not surface as the hub's promise
// (FM-13 coupling / no invented sale claims). NOTE: an honest *disclaimer*
// (e.g. EN "No fake countdowns, no invented discounts") is explicitly allowed —
// it is a truthful negation, exactly the §REQ-010 "documented negation" carve-out
// — so the guard targets an AFFIRMATIVE "coming soon" placeholder claim only,
// not the words "countdown"/"discount" wherever they appear.
const FAKE_COMING_SOON_RE = /coming soon|demnächst verfügbar|bientôt disponible/i
// An invented, hard-coded percentage badge ("−30 %", "50% off") would be a
// fabricated discount; real per-card anchor→price savings render as a currency
// amount via ProductCard, never a hub-level invented percent claim.
const INVENTED_PERCENT_RE = /-?\s?\d{1,3}\s?%\s?(off|rabatt|aus|de remise|réduction)/i

async function renderHub() {
  const utils = render(
    <MemoryRouter initialEntries={['/offers']}>
      <App />
    </MemoryRouter>,
  )
  // The Offers route is lazily code-split behind Suspense; the explicit 15000ms
  // (matching tests/setup.ts asyncUtilTimeout) keeps the combined run deterministic.
  await screen.findByTestId('offers-page', undefined, { timeout: 15000 })
  return utils
}

/**
 * Resolve the hub's curated section anchors once the page has settled. The
 * `offers-page` shell can paint a commit before its curated sections finish
 * rendering under CPU contention, so wait (re-querying inside the retry) until at
 * least the required two sections are present, then return them from that settled
 * snapshot. Race-free without weakening: ≥2 sections still have to appear.
 */
async function findOffersSections(): Promise<HTMLElement[]> {
  let sections: HTMLElement[] = []
  await waitFor(() => {
    const page = screen.getByTestId('offers-page')
    sections = within(page).getAllByTestId('offers-section')
    expect(sections.length).toBeGreaterThanOrEqual(2)
  })
  return sections
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-024-1 — the hub renders ≥2 curated sections (distinct anchors) ─────────

describe('REQ-024 / AT-024-1 — offers hub renders ≥2 curated sections', () => {
  it('exports an OFFERS_SECTIONS config of ≥2 curated sections', () => {
    expect(Array.isArray(OFFERS_SECTIONS)).toBe(true)
    expect(OFFERS_SECTIONS.length).toBeGreaterThanOrEqual(2)
  })

  it('renders ≥2 distinct section anchors via the real App.tsx', async () => {
    await renderHub()
    const sections = await findOffersSections()

    // each section is uniquely identifiable (distinct anchors, no duplicate id)
    const ids = sections.map((s) => s.getAttribute('data-section-id'))
    expect(ids.every((id) => id != null && id.length > 0)).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ── AT-024-2 — each section: short text + slider (≥1 card) + CTA link ─────────

describe('REQ-024 / AT-024-2 — each section has short text + slider + CTA', () => {
  it('every rendered section carries non-empty copy, a populated slider and a real CTA link', async () => {
    await renderHub()
    const sections = await findOffersSections()

    for (const section of sections) {
      const id = section.getAttribute('data-section-id') ?? '(unknown)'

      // Each section's inner copy / slider cards / CTA can paint a commit after
      // the section anchor under load, so resolve them inside `waitFor` (re-reading
      // within the section on each retry). The assertions are unchanged.
      await waitFor(() => {
        // short curated text (eyebrow/title + intro copy), non-empty
        const copy = within(section).getByTestId('offers-section-copy')
        expect(copy.textContent?.trim().length ?? 0, `${id} copy`).toBeGreaterThan(0)

        // a product slider with ≥1 real catalog card
        const slider = within(section).getByTestId('offers-section-slider')
        const cards = within(slider).getAllByTestId('card-cta')
        expect(cards.length, `${id} slider has ≥1 card`).toBeGreaterThanOrEqual(1)
        // each card CTA targets a real PDP route (no dead/ambiguous click)
        for (const card of cards) {
          expect(card.getAttribute('href') ?? '', `${id} card href`).toMatch(/^\/product\/\d+$/)
        }

        // a section CTA link to a real collection/offers route (no dead link)
        const cta = within(section).getByTestId('offers-section-cta')
        const href = cta.getAttribute('href') ?? ''
        expect(href, `${id} section CTA href`).toMatch(/^\/(collections\/[\w-]+|inspiration|personalize|offers)$/)
      })
    }
  })
})

// ── AT-024-3 — asset-light hub image fields (no real .webp campaign visual) ───

describe('REQ-024 / AT-024-3 — hub image fields are asset-light placeholders (FM-11)', () => {
  it('every section image field is a marked placeholder and renders no real .webp photo', async () => {
    await renderHub()
    const sections = await findOffersSections()

    for (const section of sections) {
      const id = section.getAttribute('data-section-id') ?? '(unknown)'
      // the section's visual slot can paint a commit after the section anchor —
      // re-read it inside `waitFor`. The placeholder assertion is unchanged.
      await waitFor(() => {
        const visual = within(section).getByTestId('offers-section-visual')
        expect(visual, `${id} visual`).toHaveAttribute('data-placeholder', 'true')
      })
    }

    // nowhere in the hub does a real /images/*.webp product/campaign photo render
    const page = screen.getByTestId('offers-page')
    for (const img of Array.from(page.querySelectorAll('img'))) {
      expect(WEBP_RE.test(img.getAttribute('src') ?? ''), `img src ${img.getAttribute('src')}`).toBe(false)
    }
  })

  it('does not promise invented discounts, countdowns or "Coming Soon" fakery', async () => {
    await renderHub()
    const page = screen.getByTestId('offers-page')
    const text = page.textContent ?? ''
    // no affirmative "Coming Soon" placeholder claim
    expect(FAKE_COMING_SOON_RE.test(text), 'no affirmative Coming Soon claim').toBe(false)
    // no fabricated hub-level "% off" / "% Rabatt" discount badge
    expect(INVENTED_PERCENT_RE.test(text), 'no invented percent discount').toBe(false)
  })
})

// ── AT-024-4 — the "Angebote" nav entry links to the hub (no dead link) ───────

describe('REQ-024 / AT-024-4 — "Angebote" nav entry targets the hub route', () => {
  it('PRIMARY_NAV has an offers entry whose href is /offers', () => {
    const offers = PRIMARY_NAV.find((e) => e.i18nKey === 'nav.primary.offers')
    expect(offers, 'an offers primary-nav entry exists').toBeDefined()
    expect(offers!.href).toBe('/offers')
  })

  it('navigating to the offers nav href renders the curated hub (not a dead link)', async () => {
    const offers = PRIMARY_NAV.find((e) => e.i18nKey === 'nav.primary.offers')
    expect(offers).toBeDefined()
    render(
      <MemoryRouter initialEntries={[offers!.href]}>
        <App />
      </MemoryRouter>,
    )
    const page = await screen.findByTestId('offers-page', undefined, { timeout: 15000 })
    // it is the FULL hub (≥2 curated sections), not a bare stub. The sections can
    // paint a commit after the page shell under load, so resolve them inside
    // `waitFor` (re-querying on each retry). The ≥2 assertion is unchanged.
    await waitFor(() => {
      expect(within(page).getAllByTestId('offers-section').length).toBeGreaterThanOrEqual(2)
    })
  })
})
