/**
 * DELTA T-201 — Shop-oriented primary navigation (REQ-003). `[REAL-BOUNDARY-jsdom]`
 * + `[SHIPPED-SCAN]`.
 *
 * Acceptance contracts (docs/tests/desenio-acceptance-design.md §REQ-003):
 *   AT-003-1  primary-nav exposes EXACTLY the 8 spec labels, i18n-key-based, in
 *             spec order: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing,
 *             Angebote, Poster Sets, Inspiration.
 *   AT-003-2  NEGATIVE — no primary-nav entry links to /faq, /about, /contact or
 *             /blog (FM-03: V2 NAV_LINKS shipped blog/faq/about/contact).
 *   AT-003-3  every one of the 8 entries has an href on an EXISTING route
 *             (/collections/<slug>, /inspiration, /personalize, or the offers
 *             hub) — no dead link.
 *   AT-003-4  i18n keys for all 8 nav labels exist in EN/DE/FR (ES coupled to
 *             REQ-015 / T-501 — asserted PLANNED below, not faked here).
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-003): the 8 entries may exist as a
 * component config yet never be rendered into the REAL Navbar; or FAQ/About/
 * Contact/Blog may still sit in the primary bar. So these tests drive the REAL
 * src/App.tsx composition root (production Navbar) via MemoryRouter and read the
 * shipped translations module — the same instances the app renders.
 *
 * RED-line discipline: this is structure/routing only. No claim is made that any
 * collection target is content-final (images = OQ-001, RED) or that the offers
 * hub holds curated content yet (T-305). The offers route is a minimal honest
 * stub so AT-003-3 has no dead link — see cross-milestone note in the test.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { translations, type Lang } from '../../src/i18n/translations'
import { COLLECTION_SLUGS } from '../../src/lib/collections'
import { PRIMARY_NAV } from '../../src/components/Navbar'

// The exact, frozen 8-entry primary nav (REQ-003 / AC-003), in spec order. Each
// is referenced by its i18n key (not hardcoded visible text) per AT-003-1.
const EXPECTED_NAV = [
  { i18nKey: 'nav.primary.bestseller' },
  { i18nKey: 'nav.primary.new' },
  { i18nKey: 'nav.primary.posters' },
  { i18nKey: 'nav.primary.tcm' },
  { i18nKey: 'nav.primary.wuxing' },
  { i18nKey: 'nav.primary.offers' },
  { i18nKey: 'nav.primary.posterSets' },
  { i18nKey: 'nav.primary.inspiration' },
] as const

// Routes a customer can actually reach (no dead link, AT-003-3). The offers hub
// is added by T-201 as a minimal honest stub; its curated content lands in
// T-305 (cross-milestone dependency, reported in the coder output).
const EXISTING_ROUTES = new Set<string>([
  ...COLLECTION_SLUGS.map((s) => `/collections/${s}`),
  '/collections',
  '/inspiration',
  '/personalize',
  '/offers',
])

const FORBIDDEN_PRIMARY_HREFS = ['/faq', '/about', '/contact', '/blog']
const LANGS_SHIPPED: Lang[] = ['EN', 'DE', 'FR']

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function resolveKey(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj)
}

/** The 8 shop-oriented primary entries are tagged `data-nav-primary` (distinct
 *  from `data-nav-top`, which marks the utility / mega-menu trigger budget). */
function primaryNavLinks(): HTMLAnchorElement[] {
  const nav = screen.getByTestId('primary-nav')
  return Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[data-nav-primary]'))
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-003-1 — exactly the 8 spec labels, i18n-key-based, in spec order ───────

describe('REQ-003 / AT-003-1 — primary nav is exactly the 8 shop entries', () => {
  it('exports a PRIMARY_NAV config of exactly 8 entries in spec order', () => {
    expect(PRIMARY_NAV.map((e) => e.i18nKey)).toEqual(EXPECTED_NAV.map((e) => e.i18nKey))
  })

  it('renders exactly the 8 primary-nav link entries via the real App.tsx', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    const links = primaryNavLinks()
    expect(links).toHaveLength(EXPECTED_NAV.length)

    // each rendered entry's text equals its i18n EN value (key-driven, not a
    // hardcoded string) — proves the label flows through t(), in spec order.
    const en = translations.EN
    links.forEach((link, i) => {
      const expectedText = resolveKey(en, EXPECTED_NAV[i].i18nKey)
      expect(typeof expectedText).toBe('string')
      expect(link.textContent?.trim()).toBe((expectedText as string).trim())
    })
  })
})

// ── AT-003-2 — NEGATIVE: no FAQ/About/Contact/Blog in the primary nav ─────────

describe('REQ-003 / AT-003-2 — FAQ/About/Contact/Blog are NOT in primary nav (FM-03)', () => {
  it('no primary-nav entry links to /faq, /about, /contact or /blog', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    const hrefs = primaryNavLinks().map((a) => a.getAttribute('href') ?? '')
    for (const forbidden of FORBIDDEN_PRIMARY_HREFS) {
      expect(hrefs).not.toContain(forbidden)
    }
  })

  it('the PRIMARY_NAV config itself never references a forbidden secondary route', () => {
    const configured = PRIMARY_NAV.map((e) => e.href)
    for (const forbidden of FORBIDDEN_PRIMARY_HREFS) {
      expect(configured).not.toContain(forbidden)
    }
  })
})

// ── AT-003-3 — every entry targets an existing route (no dead link) ──────────

describe('REQ-003 / AT-003-3 — every primary entry is a live route', () => {
  it('every PRIMARY_NAV href resolves to an existing route', () => {
    for (const entry of PRIMARY_NAV) {
      expect(EXISTING_ROUTES.has(entry.href), `${entry.i18nKey} -> ${entry.href} must be a real route`).toBe(true)
    }
  })

  it('every rendered primary-nav link has a non-empty href on an existing route', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    const hrefs = primaryNavLinks().map((a) => a.getAttribute('href') ?? '')
    expect(hrefs).toHaveLength(EXPECTED_NAV.length)
    for (const href of hrefs) {
      expect(href.length).toBeGreaterThan(0)
      expect(EXISTING_ROUTES.has(href), `${href} must be a real route`).toBe(true)
    }
  })
})

// ── AT-003-4 — i18n keys for all 8 labels exist in EN/DE/FR ───────────────────
// ES part is coupled to REQ-015 / T-501 (BLK-ES-CONTENT) — asserted PLANNED, not
// faked here. When translations.ES lands with key parity, this naturally extends.

describe('REQ-003 / AT-003-4 — nav i18n keys exist in EN/DE/FR (ES = PLANNED, REQ-015)', () => {
  it('every nav label key resolves to a non-empty string in EN/DE/FR', () => {
    for (const lang of LANGS_SHIPPED) {
      for (const entry of EXPECTED_NAV) {
        const value = resolveKey(translations[lang], entry.i18nKey)
        expect(typeof value, `${lang} ${entry.i18nKey}`).toBe('string')
        expect((value as string).trim().length, `${lang} ${entry.i18nKey}`).toBeGreaterThan(0)
      }
    }
  })

  it('[PLANNED — REQ-015 / T-501 / BLK-ES-CONTENT] ES nav keys land with the ES locale', () => {
    // Coupled to T-501 (ES as 4th locale, key parity). Not faked here: ES is only
    // present once REQ-015 ships full machine translation under user review.
    const es = (translations as Record<string, unknown>).ES
    if (es === undefined) {
      expect(es).toBeUndefined() // documents the open coupling — ES not yet shipped
    } else {
      for (const entry of EXPECTED_NAV) {
        expect(typeof resolveKey(es, entry.i18nKey)).toBe('string')
      }
    }
  })
})
