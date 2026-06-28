/**
 * DELTA T — Collections HUB (/collections) trust-cleanup
 * (VIS-021 / CAN-014 / CAN-017 / CAN-018 / REQ-010).
 *
 * `[REAL-BOUNDARY-jsdom]` — navigates the REAL `src/App.tsx` composition root via
 * MemoryRouter to `/collections` (the Kollektion hub, distinct from the per-world
 * `/collections/:slug` Collection template) and certifies that the visible shop UI
 * no longer carries the removed coming-soon / Patron-Vault / Celestial trust debt:
 *
 *   - NO "Patron Vault" fold
 *   - NO "Coming soon" / "Bald verfügbar" / "Bientôt disponible" wording
 *   - NO "Celestial Vault" / "Celestial Credit(s)" affordance
 *   - NO standalone "Vault" eyebrow/heading
 *
 * Mutation guard: re-introducing the patron fold, the CelestialVault section, or any
 * coming-soon copy on this hub turns a case RED. The hub's LEGITIMATE content
 * (collection cards, the all-posters grid, FAQ, newsletter) MUST stay intact — this
 * is a removal of trust debt, not a teardown of the page — so the positive assertions
 * below certify the surrounding hub still renders.
 *
 * RED-line discipline: this certifies UI absence + hub integrity only; it asserts
 * nothing about chart accuracy or pricing math.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

// ── trust-debt patterns (EN/DE/FR) ───────────────────────────────────────────
// "Patron Vault" brand fold (language-independent).
const PATRON = /Patron Vault/i
// "Coming soon" in all three shipped languages.
const COMING_SOON = /Coming soon|Bald verf[üu]gbar|Bient[ôo]t disponible/i
// "Celestial Vault" / "Celestial Credit(s)" affordance.
const CELESTIAL = /Celestial (?:Vault|Credit)/i
// The CelestialVault section CTA copy ("Unlock the Unbuyable" / DE / FR).
const UNLOCK_UNBUYABLE = /Unlock the Unbuyable|Unkäufliche|inachetable/i

/** Render the real App at a given path and wait for the hub to mount. */
async function renderHub() {
  const utils = render(
    <MemoryRouter initialEntries={['/collections']}>
      <App />
    </MemoryRouter>,
  )
  // The hub's H1 is the stable anchor (lazy route + Suspense). The explicit
  // 15000ms matches tests/setup.ts asyncUtilTimeout so the combined run stays
  // deterministic under CPU contention.
  await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })
  return utils
}

beforeEach(() => {
  localStorage.clear()
})

// ── trust-debt ABSENCE on the hub ─────────────────────────────────────────────

describe('VIS-021 / REQ-010 — /collections hub carries no coming-soon / Patron / Celestial debt', () => {
  it('renders NO Patron Vault fold', async () => {
    await renderHub()
    const main = document.querySelector('main')!
    expect(main.innerHTML).not.toMatch(PATRON)
  })

  it('renders NO "Coming soon" wording (EN/DE/FR)', async () => {
    await renderHub()
    const main = document.querySelector('main')!
    expect(main.innerHTML).not.toMatch(COMING_SOON)
    expect(main.textContent ?? '').not.toMatch(COMING_SOON)
  })

  it('renders NO Celestial Vault / Celestial Credit affordance', async () => {
    await renderHub()
    const main = document.querySelector('main')!
    expect(main.innerHTML).not.toMatch(CELESTIAL)
    expect(main.innerHTML).not.toMatch(UNLOCK_UNBUYABLE)
  })

  it('renders NO standalone "Vault" heading/eyebrow', async () => {
    await renderHub()
    const main = document.querySelector('main')!
    // Any heading on the hub must not be a Vault fold.
    for (const h of Array.from(main.querySelectorAll('h1,h2,h3'))) {
      expect(h.textContent ?? '').not.toMatch(/Vault/i)
    }
  })
})

// ── hub integrity — legitimate content still renders ──────────────────────────

describe('REQ-010 — /collections hub keeps its legitimate content', () => {
  it('renders the hub H1 and the all-posters grid heading', async () => {
    await renderHub()
    // The hub paints its sections across more than one commit under load, so the
    // all-posters section can arrive after the H1 anchor. Re-read <main> and its
    // content inside `waitFor`; the presence assertions are unchanged.
    await waitFor(() => {
      const main = document.querySelector('main')!
      // Exactly one H1 (the hub title) and it is non-empty.
      const h1s = main.querySelectorAll('h1')
      expect(h1s.length).toBe(1)
      expect(h1s[0].textContent?.trim().length ?? 0).toBeGreaterThan(0)
      // The "All personalized posters" section (EN/DE/FR) still renders.
      expect(
        within(main).getByText(/All personalized posters|Alle personalisierten Poster|Toutes les affiches personnalisées/i),
      ).toBeInTheDocument()
    })
  })

  it('renders ≥1 collection card link and ≥1 product card', async () => {
    await renderHub()
    await waitFor(() => {
      const main = document.querySelector('main')!
      // Collection cards link out to product/personalize/digital/bundles routes.
      const links = main.querySelectorAll('a[href]')
      expect(links.length).toBeGreaterThanOrEqual(1)
      // The catalog product grid renders product headings (the all-posters section).
      const headings = main.querySelectorAll('h2,h3')
      expect(headings.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders the FAQ + newsletter sections (hub is not thin)', async () => {
    await renderHub()
    // FAQ + newsletter sit near the bottom of the hub and can paint a commit
    // after the H1, so re-read the text inside `waitFor`. The match assertions
    // are unchanged.
    await waitFor(() => {
      const main = document.querySelector('main')!
      const text = main.textContent ?? ''
      // FAQ (EN/DE/FR) — FaqSection heading.
      expect(text).toMatch(/Frequently asked|Häufig|questions fréquentes|FAQ/i)
      // Newsletter eyebrow/title (EN/DE/FR Atelier Circle).
      expect(text).toMatch(/Atelier Circle|Cosmic Pulse|Energy Charts|Energiecharts|cosmique/i)
    })
  })
})
