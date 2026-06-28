/**
 * Homepage module order 1–13 + hero integrity — REQ-008 (AT-008-1/2/4).
 * `[REAL-BOUNDARY]` (jsdom render through the real src/App.tsx).
 *
 * Beat-0 Gegenthese (Vision §7.4 + §7.6): modules are added but (a) the order is
 * wrong / a module is not wired into the App.tsx render, or (b) the order is
 * achieved by regressing the hero (the lazy Three.js split / the suspense
 * boundary lost) — spec-fidelity must NOT trade away performance (NFR-1).
 *
 * These tests drive the REAL `src/App.tsx` composition root via MemoryRouter and
 * assert the rendered DOM order of the stable `data-module="NN"` anchors is the
 * exact V2 sequence 02 → 13, with the hero FIRST. They also pin the hero
 * integrity invariant: the InkWave lazy/code-split boundary stays intact and the
 * hero is module 02 (the first homepage section).
 *
 * The Playwright spec (tests/e2e/home-module-order.spec.ts) is the real-browser
 * proof (reduced-motion + LCP baseline-vs-baseline guard) and is authored but
 * PLANNED — chromium is not installed in this sandbox. This jsdom render through
 * the same real App.tsx is the runnable green evidence now.
 *
 * RED-line discipline (Reality-Ledger): nothing here asserts the BaZi chart is
 * computed/accurate (bazi.ts stays a placeholder, RED for ACCURACY). The hero is
 * NOT modified by this feature — the InkWave chunk must stay byte-equivalent.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import App from '../../src/App'

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

// The exact V2 module sequence that must render on the homepage (module 01 is the
// global Utility Bar in the App shell, not a homepage <main> section; modules
// 02–13 are the homepage sections in order).
const EXPECTED_MODULES = [
  '02', // Hero / InkWave (FIRST, untouched)
  '03', // Shop by product world
  '04', // Bestseller / Featured slider
  '05', // How it works
  '06', // Featured Collection — Fire Horse 2026
  '07', // Couples / Compatibility
  '08', // Analysis PDFs
  '09', // Inspiration / Gallery teaser
  '10', // Knowledge teaser
  '11', // Trust block
  '12', // SEO text block
  '13', // Newsletter / Footer
]

beforeEach(() => {
  localStorage.clear()
})

async function findHomeModules() {
  // Wait for the lazy Home chunk to resolve (its first section anchor appears).
  await screen.findByTestId('home-module-02', undefined, { timeout: 15000 })
  // The lazy Home chunk can paint its module anchors across more than one React
  // commit under CPU contention (the Three.js/InkWave hero + code-split sections
  // mount progressively). Reading the DOM synchronously right after the FIRST
  // anchor appears therefore races a partially-rendered tree — `home-module-02`
  // can be present while a later anchor (e.g. 12/13) is still pending. Wait until
  // EVERY expected anchor is in the document, then snapshot the DOM-ordered list
  // from that single settled state. This re-queries inside the retry, so it is
  // race-free without weakening any assertion (each anchor still has to appear).
  await waitFor(() => {
    for (const m of EXPECTED_MODULES) {
      expect(
        document.querySelector(`[data-module="${m}"]`),
        `module ${m} must be wired into the homepage render`,
      ).not.toBeNull()
    }
  })
  // Collect every homepage module anchor in DOM (document) order.
  const nodes = Array.from(
    document.querySelectorAll('[data-module]'),
  ) as HTMLElement[]
  return nodes
}

describe('REQ-008 / AT-008-1 — homepage renders V2 modules in order 02→13', () => {
  it('renders every module anchor 02..13 (no module missing)', async () => {
    renderHome()
    const nodes = await findHomeModules()
    const found = nodes.map((n) => n.getAttribute('data-module'))
    for (const m of EXPECTED_MODULES) {
      expect(found, `module ${m} must be wired into the homepage render`).toContain(m)
    }
  })

  it('renders the modules in the exact V2 DOM sequence 02→13', async () => {
    renderHome()
    const nodes = await findHomeModules()
    const found = nodes.map((n) => n.getAttribute('data-module'))
    expect(found).toEqual(EXPECTED_MODULES)
  })

  it('each module anchor is a top-level section under <main> (stable, machine-checkable)', async () => {
    renderHome()
    await findHomeModules()
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
    const inMain = Array.from(main!.querySelectorAll('[data-module]')).map((n) =>
      n.getAttribute('data-module'),
    )
    expect(inMain).toEqual(EXPECTED_MODULES)
  })
})

describe('REQ-008 / AT-008-2 — hero (InkWave) is module 02, FIRST, lazy boundary intact', () => {
  it('the hero is the first homepage module (02) in DOM order', async () => {
    renderHome()
    const nodes = await findHomeModules()
    expect(nodes[0].getAttribute('data-module')).toBe('02')
  })

  it('the hero section contains the H1 birth-chart headline (real hero, not a stub)', async () => {
    renderHome()
    await findHomeModules()
    // The hero H1 sits behind the InkWave Suspense boundary, so it can paint a
    // commit after the module-02 anchor exists. Re-read the hero + its H1 inside
    // `waitFor` so this is race-free without weakening the assertion.
    await waitFor(() => {
      const hero = screen.getByTestId('home-module-02')
      const h1 = hero.querySelector('h1')
      expect(h1).toBeTruthy()
      expect((h1!.textContent ?? '').trim().length).toBeGreaterThan(0)
    })
  })

  // NFR-1 hero-integrity guard (static-source assertion): the recently-landed
  // perf wins MUST stay — Home.tsx keeps the lazy() InkWave import and the
  // Suspense boundary around it (the Three.js code-split). This reads the real
  // source so a refactor that inlines/eagerly-imports InkWave (undoing
  // d56de04 / 0f8995c / 0133437) fails loudly.
  it('Home.tsx keeps InkWave lazy-loaded behind a Suspense boundary (perf split preserved)', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../../src/pages/Home.tsx'),
      'utf8',
    )
    // lazy import of the InkWave chunk
    expect(src).toMatch(/lazy\(\s*\(\)\s*=>\s*import\(['"][^'"]*InkWave['"]\)\s*\)/)
    // a Suspense boundary still wraps the hero canvas
    expect(src).toContain('<Suspense')
    expect(src).toContain('<InkWave')
    // and InkWave is NOT eagerly imported (no top-level `import InkWave from`)
    expect(src).not.toMatch(/^\s*import\s+InkWave\s+from/m)
  })
})

describe('REQ-008 / AT-008-4 — negative: no Saju/Junishi in rendered homepage', () => {
  it('the rendered homepage <main> contains no Saju/Junishi string', async () => {
    renderHome()
    await findHomeModules()
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
    expect(main!.textContent ?? '').not.toMatch(/saju|junishi/i)
  })
})

// ── REQ-008 module wiring: the new modules link to the real production routes ──

describe('REQ-008 — new home modules link to real /collections + /personalize routes', () => {
  // The module ANCHOR can be in the DOM while its inner links are still painting
  // a commit later under load, so resolve each module's hrefs inside `waitFor`
  // (re-querying the anchor AND its links on every retry). The assertion is
  // unchanged — the required href still has to be present.
  async function modHrefs(testId: string): Promise<string[]> {
    let hrefs: string[] = []
    await waitFor(() => {
      const m = screen.getByTestId(testId)
      hrefs = within(m)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      expect(hrefs.length, `${testId} has rendered its links`).toBeGreaterThan(0)
    })
    return hrefs
  }

  it('module 03 (shop by world) links to per-world collection routes', async () => {
    renderHome()
    await findHomeModules()
    const hrefs = await modHrefs('home-module-03')
    // at least the four MVP product-world collections are linked
    expect(hrefs).toContain('/collections/bazi-posters')
    expect(hrefs).toContain('/collections/tcm-posters')
    expect(hrefs).toContain('/collections/wuxing-posters')
  })

  it('module 06 (Fire Horse 2026) links to /collections/fire-horse-2026', async () => {
    renderHome()
    await findHomeModules()
    const hrefs = await modHrefs('home-module-06')
    expect(hrefs).toContain('/collections/fire-horse-2026')
  })

  it('module 07 (couples/compatibility) links to the compatibility collection', async () => {
    renderHome()
    await findHomeModules()
    const hrefs = await modHrefs('home-module-07')
    expect(hrefs).toContain('/collections/compatibility-posters')
  })

  it('module 08 (analysis PDFs) links to /collections/analysis-pdfs', async () => {
    renderHome()
    await findHomeModules()
    const hrefs = await modHrefs('home-module-08')
    expect(hrefs).toContain('/collections/analysis-pdfs')
  })

  // AT-011-4 coupling: module 09 (inspiration) links to /inspiration.
  it('module 09 (inspiration) links to /inspiration (AT-011-4 coupling)', async () => {
    renderHome()
    await findHomeModules()
    const hrefs = await modHrefs('home-module-09')
    expect(hrefs).toContain('/inspiration')
  })
})
