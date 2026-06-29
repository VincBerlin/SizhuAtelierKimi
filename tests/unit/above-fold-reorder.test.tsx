/**
 * Above-fold re-order — REQ-002 (AT-002-1/2/3), T-702.
 * `[REAL-BOUNDARY]` (jsdom render through the real src/App.tsx).
 *
 * REQ-002 / AC-002: the ABOVE-FOLD band must be EXACTLY
 *   [Hero → Bestseller Product Slider → Kategorie-Banner].
 * Today's V2 was Hero → CategoryBanner(03) → Bestseller(04); T-702 swaps the two
 * so the bestseller carousel (module 04) renders BEFORE the shop-by-world banner
 * (module 03). The data-module NUMBERS are STABLE IDENTITIES (04 = the bestseller
 * carousel, 03 = shop-by-world) referenced by other suites, so they are NOT
 * renumbered — only the DOM order changes. A `data-band="above-fold"` /
 * `data-band="below-fold"` marker wraps each band so both are machine-checkable.
 *
 * These jsdom checks mount the SAME real `App.tsx` through MemoryRouter and are
 * the runnable green evidence NOW. The real-browser proof (mobile 360/390/430,
 * mega-menu, LCP-vs-baseline) is AT-002-4 — PLANNED, see the `it.skip` marker
 * below: chromium is not installed in this sandbox (BLK-CHROMIUM).
 *
 * MERGE-GATE DISCIPLINE (the point of REQ-002): even with these jsdom checks
 * green, REQ-002 stays value-risk / merge-gate-held — the Playwright specs are
 * UNRUN here and RL-EVENT reads no real event data. NOTHING in this file marks
 * REQ-002 aligned / done / production-verified.
 *
 * RED-line discipline: this polices DOM ORDER + band structure only. It asserts
 * nothing about the BaZi chart (bazi.ts stays a placeholder, RED for ACCURACY)
 * and nothing about real analytics data (RL-EVENT RED).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

// Above-fold band: Hero(02) → Bestseller slider(04) → Kategorie-Banner(03).
const ABOVE_FOLD = ['02', '04', '03']
// Below-fold band keeps the V2 order (no 13-module resequence — deferred).
const BELOW_FOLD = ['05', '06', '07', '08', '09', '10', '11', '12', '13']
const ALL_MODULES = [...ABOVE_FOLD, ...BELOW_FOLD]

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

// The lazy Home chunk paints its anchors across more than one React commit under
// CPU contention, so wait until EVERY expected anchor is in the document before
// snapshotting a single settled DOM-ordered state (re-queries inside the retry —
// race-free without weakening any assertion).
async function waitForAllModules() {
  await screen.findByTestId('home-module-02', undefined, { timeout: 15000 })
  await waitFor(() => {
    for (const m of ALL_MODULES) {
      expect(
        document.querySelector(`[data-module="${m}"]`),
        `module ${m} must be wired into the homepage render`,
      ).not.toBeNull()
    }
  })
}

function modulesIn(selector: string): (string | null)[] {
  return Array.from(document.querySelectorAll(`${selector} [data-module]`)).map((n) =>
    n.getAttribute('data-module'),
  )
}

describe('REQ-002 / AT-002-1 — above-fold band is [Hero → Bestseller(04) → Kategorie-Banner(03)]', () => {
  it('the data-band="above-fold" region renders exactly 02 → 04 → 03 in DOM order', async () => {
    renderHome()
    await waitForAllModules()
    const band = document.querySelector('[data-band="above-fold"]')
    expect(band, 'an above-fold band marker must exist').not.toBeNull()
    expect(modulesIn('[data-band="above-fold"]')).toEqual(ABOVE_FOLD)
  })

  it('module 04 (bestseller carousel) renders BEFORE module 03 (shop-by-world banner)', async () => {
    renderHome()
    await waitForAllModules()
    const all = Array.from(document.querySelectorAll('[data-module]')).map((n) =>
      n.getAttribute('data-module'),
    )
    expect(all.indexOf('04')).toBeLessThan(all.indexOf('03'))
  })

  it('module 03 stays the shop-by-world banner (identity preserved, not renumbered)', async () => {
    renderHome()
    await waitForAllModules()
    // The shop-by-world banner keeps id=03 and its per-world collection links, so
    // the cross-suite references (e2e shop-by-world, SEO) do not drift.
    await waitFor(() => {
      const banner = screen.getByTestId('home-module-03')
      const hrefs = Array.from(banner.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '')
      expect(hrefs.length, 'module-03 banner has rendered its links').toBeGreaterThan(0)
      expect(hrefs).toContain('/collections/bazi-posters')
    })
  })
})

describe('REQ-002 / AT-002-2 — below-fold band keeps the V2 order (no full resequence)', () => {
  it('the data-band="below-fold" region renders 05→13 unchanged', async () => {
    renderHome()
    await waitForAllModules()
    const band = document.querySelector('[data-band="below-fold"]')
    expect(band, 'a below-fold band marker must exist').not.toBeNull()
    // Negative proof: REQ-002 re-orders ONLY the above-fold band. The lower band
    // is byte-for-byte the V2 sequence — the 13-module resequence is deferred.
    expect(modulesIn('[data-band="below-fold"]')).toEqual(BELOW_FOLD)
  })
})

describe('REQ-002 / AT-002-3 — Hero (module 02) stays DOM-index-0 (REQ-001 untouched)', () => {
  it('module 02 is the very first data-module anchor in the document', async () => {
    renderHome()
    await waitForAllModules()
    const first = document.querySelectorAll('[data-module]')[0]
    expect(first.getAttribute('data-module')).toBe('02')
  })

  it('the hero is the first child of the above-fold band', async () => {
    renderHome()
    await waitForAllModules()
    expect(modulesIn('[data-band="above-fold"]')[0]).toBe('02')
  })
})

// REQ-002 / AT-002-4 — PLANNED (real-browser). The mobile 360/390/430 layout,
// no-horizontal-scroll, mega-menu and LCP-vs-baseline proofs live in the
// Playwright spec (tests/e2e/home-module-order.spec.ts) and are NOT executed
// here: chromium is missing in this sandbox (BLK-CHROMIUM). REQ-002 therefore
// stays value-risk / merge-gate-held — this skipped case is the explicit,
// never-silently-green marker for that blocker.
describe('REQ-002 / AT-002-4 — real-browser above-fold proof (PLANNED, BLK-CHROMIUM)', () => {
  it.skip('mobile above-fold order + no-horizontal-scroll + LCP — runs once chromium lands', () => {
    // Intentionally skipped: see tests/e2e/home-module-order.spec.ts (PLANNED).
  })
})
