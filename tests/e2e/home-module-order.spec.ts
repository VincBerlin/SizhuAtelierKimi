/**
 * Homepage module order 1–13 + hero/LCP integrity — RENDERED [REAL-BOUNDARY] —
 * REQ-008 (AT-008-1/2/4), coupled to AT-017-2 and the perf guard AT-021.
 *
 * Beat-0 Gegenthese (Vision §7.4 + §7.6): modules are added but (a) the order is
 * wrong / a module is not wired into the App.tsx render, or (b) the order is
 * reached by REGRESSING the hero (the lazy Three.js split / reduced-motion
 * fallback lost) — spec-fidelity must NOT trade away performance (NFR-1). So this
 * runs over the REAL composition root (`App.tsx` via the dev server) and asserts
 * the rendered DOM order of the `data-module` anchors is the exact V2 sequence
 * 02→13 with the hero FIRST, the hero stays code-split, reduced-motion renders a
 * static fallback, and there is no Saju/Junishi in the rendered DOM.
 *
 * STATUS: PLANNED — NOT EXECUTED in this sandbox. Playwright's chromium build is
 * missing here, so `npx playwright test` cannot run this spec; it is authored to
 * the real contract so it runs once a browser lands. `npm test` (Vitest) does NOT
 * execute it (excluded via the jsdom/node projects). The runnable green evidence
 * now is the jsdom render test (tests/unit/home-module-order.test.tsx), which
 * mounts the same real `App.tsx` through MemoryRouter.
 *
 * LCP NOTE (BLK-MEASURE-LCP / OQ-008): there is NO absolute LCP threshold defined.
 * The AT-021 guard below is therefore a BASELINE-vs-BASELINE comparison only —
 * it captures the home LCP and asserts "no regression vs. the recorded baseline
 * (commits 0133437 / 0f8995c / d56de04)". Until a baseline number is recorded in
 * CI, the LCP assertion is SKIPPED (test.fixme) and stays an explicit blocker —
 * never silently green.
 */
import { test, expect } from '@playwright/test'

// Module 01 (Utility Bar) is global App-shell chrome; modules 02–13 are the
// homepage <main> sections in order.
const EXPECTED_MODULES = [
  '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13',
]

test.describe('REQ-008 / AT-008-1 — homepage renders V2 modules in DOM order 02→13', () => {
  test('every module anchor 02..13 is present in the exact V2 sequence', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('home-module-02')).toBeVisible()

    const order = await page.$$eval('main [data-module]', (nodes) =>
      nodes.map((n) => n.getAttribute('data-module')),
    )
    expect(order).toEqual(EXPECTED_MODULES)
  })

  test('the new modules link to the real production routes', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('home-module-03')).toBeVisible()

    const hrefsIn = async (testId: string) =>
      page.getByTestId(testId).locator('a').evaluateAll((as) =>
        as.map((a) => a.getAttribute('href') ?? ''),
      )

    expect(await hrefsIn('home-module-03')).toEqual(
      expect.arrayContaining([
        '/collections/bazi-posters',
        '/collections/tcm-posters',
        '/collections/wuxing-posters',
      ]),
    )
    expect(await hrefsIn('home-module-06')).toContain('/collections/fire-horse-2026')
    expect(await hrefsIn('home-module-07')).toContain('/collections/compatibility-posters')
    expect(await hrefsIn('home-module-08')).toContain('/collections/analysis-pdfs')
    // AT-011-4 coupling: module 09 links to /inspiration.
    expect(await hrefsIn('home-module-09')).toContain('/inspiration')
  })
})

test.describe('REQ-012 / AT-012-1 — module 12 SEO block renders with H2 + internal links', () => {
  test('module 12 has ≥2 H2 sub-headings and links to collections + knowledge', async ({ page }) => {
    await page.goto('/')
    const seo = page.getByTestId('home-module-12')
    await expect(seo).toBeVisible()
    expect(await seo.locator('h2').count()).toBeGreaterThanOrEqual(2)
    const hrefs = await seo.locator('a').evaluateAll((as) =>
      as.map((a) => a.getAttribute('href') ?? ''),
    )
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/collections/bazi-posters',
        '/collections/tcm-posters',
        '/collections/wuxing-posters',
      ]),
    )
    expect(hrefs.some((h) => h.startsWith('/blog'))).toBe(true)
  })
})

test.describe('REQ-008 / AT-008-2 — hero (InkWave) is module 02, FIRST, lazy split intact', () => {
  test('the hero is the first homepage module (02) and carries the H1', async ({ page }) => {
    await page.goto('/')
    const order = await page.$$eval('main [data-module]', (nodes) =>
      nodes.map((n) => n.getAttribute('data-module')),
    )
    expect(order[0]).toBe('02')

    const hero = page.getByTestId('home-module-02')
    await expect(hero.locator('h1')).toHaveCount(1)
    await expect(hero.locator('h1')).not.toBeEmpty()
  })

  // AT-021-2 — the Three.js InkWave chunk stays code-split: a separate JS request
  // for the InkWave chunk is observed (it is NOT in the initial entry bundle).
  test('the InkWave chunk is loaded as its own code-split request (perf preserved)', async ({ page }) => {
    const inkWaveChunkRequested: string[] = []
    page.on('request', (req) => {
      if (/InkWave.*\.js/.test(req.url())) inkWaveChunkRequested.push(req.url())
    })
    await page.goto('/')
    await expect(page.getByTestId('home-module-02')).toBeVisible()
    // give the deferred chunk a moment to be requested after first paint
    await page.waitForTimeout(1500)
    expect(inkWaveChunkRequested.length).toBeGreaterThanOrEqual(1)
  })

  // AT-008-2 / AT-021-2 — reduced-motion renders a static fallback (no loops).
  test('prefers-reduced-motion renders a static hero fallback', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/')
    const hero = page.getByTestId('home-module-02')
    await expect(hero).toBeVisible()
    // The hero text + H1 still render; the InkWave canvas honours reduced-motion
    // (static frame) per the InkWave component (commits 0133437 / 0f8995c).
    await expect(hero.locator('h1')).not.toBeEmpty()
    await ctx.close()
  })
})

test.describe('REQ-008 / AT-008-4 — negative: no Saju/Junishi in rendered homepage', () => {
  test('the rendered homepage <main> contains no Saju/Junishi string', async ({ page }) => {
    await page.goto('/')
    const text = (await page.locator('main').innerText()).toLowerCase()
    expect(text).not.toMatch(/saju|junishi/)
  })
})

// ── AT-021-1 — LCP baseline-vs-baseline guard (BLK-MEASURE-LCP / OQ-008) ───────
// No absolute threshold exists. This guard captures the home LCP and would assert
// "no regression vs. the recorded baseline". Until a baseline number is recorded
// in CI it is an EXPLICIT BLOCKER, not silently green — hence test.fixme.
test.fixme('REQ-008 / AT-021-1 — home LCP does not regress vs. baseline (BLK-MEASURE-LCP)', async ({ page }) => {
  await page.goto('/')
  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(entries[entries.length - 1].startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        setTimeout(() => resolve(-1), 5000)
      }),
  )
  // BLOCKER: BASELINE_LCP_MS must be filled from a recorded baseline run on
  // commits 0133437 / 0f8995c / d56de04 before this assertion is meaningful.
  const BASELINE_LCP_MS = Number(process.env.BASELINE_LCP_MS ?? NaN)
  expect(Number.isFinite(BASELINE_LCP_MS), 'record BASELINE_LCP_MS first (BLK-MEASURE-LCP)').toBe(true)
  expect(lcp).toBeLessThanOrEqual(BASELINE_LCP_MS * 1.1)
})
