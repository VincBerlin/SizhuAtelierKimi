/**
 * DELTA T-204 — Utility / Promo bar above the header (REQ-021 / REQ-016).
 * `[REAL-BOUNDARY-jsdom]` + `[SHIPPED-SCAN]` (pure region-mapping logic).
 *
 * Acceptance contract (docs/tests/desenio-acceptance-design.md §REQ-016/REQ-021):
 *   AT-016-6  The utility/promo bar (`AnnouncementBar`) renders ABOVE the navbar
 *             in the DOM (its anchor comes before `primary-nav`); it shows for
 *             us/uk Free-Shipping directly and for eu the local shipping logic
 *             (threshold) — a region-dependent i18n text.
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-016): the region/free-shipping is a
 * purely CLIENT-side display string while the SERVER reprices differently and can
 * be overstummed by a client `shippingCents` (RISK-002/003). That server-authority
 * falsifier is AT-016-1..5 (T-502, supertest against the real /api/checkout) — NOT
 * this test. This test asserts ONLY the client communication contract:
 *   (1) the promo bar is composed ABOVE the navbar in the real src/App.tsx, and
 *   (2) the region→announcement mapping is the right SHAPE per region:
 *       us/uk → free-shipping directly, eu → local threshold logic, other →
 *       neutral fallback (no free-shipping promise it can't keep), and the i18n
 *       key differs by region (region-dependent text).
 *
 * Server coupling note (frozen): the SERVER-authoritative price/shipping logic is
 * Iteration 5 / T-502 and is NOT touched here — server/* stays byte-untouched. The
 * promo bar is client-only region COMMUNICATION; it never reprices.
 *
 * RED-carry: real region detection is an IP/geo boundary; jsdom defaults to the EU
 * market (fetch is stubbed to reject in tests/setup.ts), so the rendered-bar branch
 * proved here is the EU default. The us/uk/other branches are proved through the
 * pure region-mapping (deterministic, no network) — exactly the falsifiable logic.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import {
  regionAnnouncement,
  type Region,
  type RegionAnnouncement,
} from '../../src/lib/region'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-016-6 (a) — the promo bar is composed ABOVE the navbar in the real App ──

describe('REQ-021 / AT-016-6 — the promo bar renders above the navbar', () => {
  it('renders the announcement / promo bar through the real App shell', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    expect(screen.getByTestId('announcement-bar')).toBeInTheDocument()
  })

  it('places the announcement bar BEFORE the primary-nav in DOM order', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const bar = screen.getByTestId('announcement-bar')
    const nav = screen.getByTestId('primary-nav')
    // DOCUMENT_POSITION_FOLLOWING means `nav` comes AFTER `bar` in the document —
    // i.e. the promo bar is composed above the header, not after it.
    const rel = bar.compareDocumentPosition(nav)
    expect(rel & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(rel & Node.DOCUMENT_POSITION_PRECEDING).toBeFalsy()
  })

  it('tags the rendered bar with its region (default EU market under jsdom)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const bar = screen.getByTestId('announcement-bar')
    // The real ShopStore defaults to the EU market and the network region probe is
    // stubbed to reject in jsdom — so the rendered branch is the EU threshold one.
    expect(bar).toHaveAttribute('data-region', 'eu')
  })
})

// ── AT-016-6 (b) — region→announcement mapping is the right shape per region ──

describe('REQ-016 / AT-016-6 — region-dependent shipping communication', () => {
  it('us and uk communicate Free Shipping directly', () => {
    for (const region of ['us', 'uk'] as Region[]) {
      const a: RegionAnnouncement = regionAnnouncement(region)
      expect(a.mode).toBe('free')
    }
  })

  it('eu communicates the local shipping logic (threshold), not a blanket free-ship', () => {
    const a = regionAnnouncement('eu')
    expect(a.mode).toBe('threshold')
    expect(a.mode).not.toBe('free')
  })

  it('falls back to a neutral message for other regions (no free-ship promise it cannot keep)', () => {
    const a = regionAnnouncement('other')
    expect(a.mode).toBe('fallback')
    expect(a.mode).not.toBe('free')
  })

  it('uses a region-dependent i18n key (us/uk differ from eu)', () => {
    const free = regionAnnouncement('us').i18nKey
    const threshold = regionAnnouncement('eu').i18nKey
    const fallback = regionAnnouncement('other').i18nKey
    expect(free).not.toBe(threshold)
    expect(threshold).not.toBe(fallback)
    expect(free).not.toBe(fallback)
    // every branch resolves to a non-empty announce.* key
    for (const k of [free, threshold, fallback]) {
      expect(typeof k).toBe('string')
      expect(k.startsWith('announce.')).toBe(true)
    }
  })

  it('uk maps to the same direct-free communication as us (parity, no special-casing)', () => {
    expect(regionAnnouncement('uk')).toEqual(regionAnnouncement('us'))
  })
})

// ── AT-016-6 — region-dependent i18n text exists in EN/DE/FR (no silent gap) ──

describe('REQ-016 / AT-016-6 — the announce keys resolve in every shipped locale', () => {
  it('every announce key used by the bar exists in EN/DE/FR', async () => {
    const { translations } = await import('../../src/i18n/translations')
    const keys = (['us', 'eu', 'other'] as Region[]).map(
      (r) => regionAnnouncement(r).i18nKey,
    )
    for (const locale of ['EN', 'DE', 'FR'] as const) {
      for (const dotted of keys) {
        const value = dotted
          .split('.')
          .reduce<any>((o, k) => (o == null ? undefined : o[k]), translations[locale])
        expect(value, `${locale} is missing ${dotted}`).toBeTruthy()
        expect(typeof value).toBe('string')
      }
    }
  })
})
