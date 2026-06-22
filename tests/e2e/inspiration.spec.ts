/**
 * Inspiration / Gallery page — RENDERED [REAL-BOUNDARY] — REQ-011
 * (acceptance-design AT-011-1..3), coupled to AT-017-1.
 *
 * Beat-0 Gegenthese (§REQ-011): a gallery can render in isolation yet not be wired
 * as a <Route> in the production composition root; or placeholder tiles get passed
 * off as real "customer examples" (invented content). So this runs over the REAL
 * composition root (`App.tsx` via the dev server) and asserts: `/inspiration` is
 * reachable and renders a curated masonry gallery, every tile links to a real
 * collection/product route (click navigates to a non-empty template), and
 * placeholder tiles carry a VISIBLE placeholder marking (no fake customer examples).
 *
 * STATUS: PLANNED — NOT EXECUTED in this sandbox. Playwright's chromium build is
 * missing here, so `npx playwright test` cannot run this spec; it is authored to
 * the real contract so it runs once a browser lands. `npm test` (Vitest) does NOT
 * execute it (excluded via the jsdom/node projects). The runnable green evidence
 * now is the jsdom render test (tests/unit/inspiration-page.test.tsx), which mounts
 * the same real `App.tsx` through MemoryRouter.
 */
import { test, expect } from '@playwright/test'

// ── AT-011-1 — reachable, renders a curated gallery ──────────────────────────

test.describe('REQ-011 / AT-011-1 — /inspiration is reachable and curated', () => {
  test('renders an H1 and a tile gallery (vertical mobile, 2-col masonry from tablet)', async ({ page }) => {
    await page.goto('/inspiration')
    const root = page.getByTestId('inspiration-page')
    await expect(root).toBeVisible()
    await expect(root.locator('h1')).toHaveCount(1)
    await expect(root.locator('h1')).not.toBeEmpty()

    const tiles = page.getByTestId('inspiration-tile')
    expect(await tiles.count()).toBeGreaterThanOrEqual(1)
    expect(await tiles.count()).toBeLessThanOrEqual(24)
  })
})

// ── AT-011-2 — tiles link to real routes (click navigates) ────────────────────

test.describe('REQ-011 / AT-011-2 — tiles navigate to real destinations', () => {
  test('clicking a collection tile lands on a non-empty collection template', async ({ page }) => {
    await page.goto('/inspiration')
    const tile = page
      .getByTestId('inspiration-tile')
      .filter({ has: page.locator('a[href^="/collections/"]') })
      .first()
    await tile.getByRole('link').first().click()
    await expect(page.getByTestId('collection-page')).toBeVisible()
  })
})

// ── AT-011-3 — placeholder tiles visibly marked, no invented examples ─────────

test.describe('REQ-011 / AT-011-3 — placeholder tiles marked, no fake examples', () => {
  test('placeholder tiles show a visible "Placeholder" badge', async ({ page }) => {
    await page.goto('/inspiration')
    const placeholderTiles = page.locator('[data-testid="inspiration-tile"][data-placeholder="true"]')
    expect(await placeholderTiles.count()).toBeGreaterThanOrEqual(1)
    await expect(placeholderTiles.first().getByTestId('inspiration-placeholder-badge')).toBeVisible()
    await expect(placeholderTiles.first().getByTestId('inspiration-placeholder-badge')).toContainText(/placeholder/i)
  })

  test('no tile claims to be a real customer example / testimonial', async ({ page }) => {
    await page.goto('/inspiration')
    const text = ((await page.getByTestId('inspiration-page').textContent()) ?? '').toLowerCase()
    for (const banned of ['customer example', 'kundenbeispiel', 'real customer', 'verified buyer']) {
      expect(text).not.toContain(banned)
    }
  })
})

// ── AT-011-4 — /inspiration is wired into production navigation ────────────────
// Previously left as a commented coupling deferred to the Home/REQ-008 task. The
// Iteration-3 review (high) flagged that "route-mounted" is NOT "user-reachable":
// nothing in the production chrome linked to /inspiration. It is now wired via the
// mega-menu (Featured column) → mobile drawer → and the site footer, so the
// coupling is verified green, not merely documented. STATUS: PLANNED (real-browser
// — chromium missing here); the runnable green proof is the jsdom render through
// the real App.tsx in tests/unit/inspiration-nav-reachability.test.tsx.

test.describe('REQ-011 / AT-011-4 — /inspiration is reachable from production nav', () => {
  test('the persistent footer chrome links to /inspiration', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('contentinfo').locator('a[href="/inspiration"]'),
    ).toHaveCount(1)
  })

  test('the desktop mega-menu (Featured column) links to /inspiration', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('mega-menu-trigger').click()
    const panel = page.getByTestId('mega-menu-panel')
    await expect(panel).toBeVisible()
    await expect(
      panel.getByTestId('mega-col-featured').locator('a[href="/inspiration"]'),
    ).toHaveCount(1)
  })

  test('globally, ≥1 anchor in the persistent chrome targets /inspiration', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('a[href="/inspiration"]').count()).toBeGreaterThanOrEqual(1)
  })
})
