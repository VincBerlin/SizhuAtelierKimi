/**
 * Per-world collection routes — RENDERED [REAL-BOUNDARY] — REQ-010 (AT-010-1/3/4),
 * coupled to AT-017-1.
 *
 * Beat-0 Gegenthese (Vision §7.6 "apparent reachability"): a Collection template
 * can render green in isolation yet never be wired as a <Route> in the production
 * composition root — built, not reachable; or a collection is empty/thin. So this
 * runs over the REAL composition root (`App.tsx` via the dev server) and asserts,
 * for every MVP route, that the template is reachable AND non-empty: breadcrumb,
 * exactly one H1, intro, ≥1 product card, SEO block (H2), FAQ, trust. The negative
 * cases prove no Saju/Junishi collection route is reachable (AT-010-4 / AT-NEG-SAJU).
 *
 * STATUS: PLANNED — NOT EXECUTED in this sandbox. Playwright's chromium build is
 * missing here, so `npx playwright test` cannot run this spec; it is authored to
 * the real contract so it runs once a browser lands. `npm test` (Vitest) does NOT
 * execute it (excluded via the jsdom/node projects). The runnable green evidence
 * now is the jsdom render test (tests/unit/collections-routes.test.tsx), which
 * mounts the same real `App.tsx` through MemoryRouter.
 */
import { test, expect } from '@playwright/test'

// The 8 MVP slugs from REQ-010 AK-1 — the exact, frozen set.
const MVP_SLUGS = [
  'bazi-posters',
  'tcm-posters',
  'wuxing-posters',
  'personalized-posters',
  'compatibility-posters',
  'fire-horse-2026',
  'analysis-pdfs',
  'bundles',
] as const

test.describe('REQ-010 / AT-010-1+3 — every MVP collection route is reachable and non-empty', () => {
  for (const slug of MVP_SLUGS) {
    test(`/collections/${slug} renders a full collection template`, async ({ page }) => {
      await page.goto(`/collections/${slug}`)

      const pageEl = page.getByTestId('collection-page')
      await expect(pageEl).toBeVisible()

      // breadcrumb (internal links)
      await expect(pageEl.getByTestId('collection-breadcrumb')).toBeVisible()

      // exactly one H1 within the collection page subtree
      await expect(pageEl.locator('h1')).toHaveCount(1)
      await expect(pageEl.locator('h1')).not.toBeEmpty()

      // intro
      await expect(pageEl.getByTestId('collection-intro')).not.toBeEmpty()

      // product grid with ≥1 card
      const cards = pageEl.getByTestId('collection-product-card')
      expect(await cards.count()).toBeGreaterThanOrEqual(1)

      // SEO block with an H2 sub-structure
      const seo = pageEl.getByTestId('collection-seo')
      await expect(seo).toBeVisible()
      expect(await seo.locator('h2').count()).toBeGreaterThanOrEqual(1)

      // FAQ with ≥1 item
      const faqItems = pageEl.getByTestId('collection-faq-item')
      expect(await faqItems.count()).toBeGreaterThanOrEqual(1)

      // trust block
      await expect(pageEl.getByTestId('collection-trust')).toBeVisible()
    })
  }
})

test.describe('REQ-010 / AT-010-4 — no Saju/Junishi collection route is reachable', () => {
  for (const path of ['/collections/saju-posters', '/collections/junishi-posters']) {
    test(`${path} does not render a collection template (redirects to the hub)`, async ({ page }) => {
      await page.goto(path)
      // Unknown slug → redirect to /collections hub; the collection-page anchor
      // must NOT be present.
      await expect(page.getByTestId('collection-page')).toHaveCount(0)
    })
  }
})

test.describe('REQ-010 — legacy /tcm keeps working', () => {
  test('/tcm renders a product overview (kept or redirected), never blank', async ({ page }) => {
    await page.goto('/tcm')
    await expect(page.locator('main h1')).toHaveCount(1)
    await expect(page.locator('main h1')).not.toBeEmpty()
  })
})
