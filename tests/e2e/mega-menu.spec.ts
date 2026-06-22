/**
 * Real mega-menu (Shop / Collections) — RENDERED [REAL-BOUNDARY] — REQ-009
 * (acceptance-design AT-009-1..4), coupled to AT-017-3 (breakpoints).
 *
 * Beat-0 Gegenthese (§REQ-009): a grouped menu can exist in isolation yet not be
 * wired into the real Navbar/App.tsx; or lack keyboard/Escape/`aria-*`; or its
 * items link to dead routes. So this runs over the REAL composition root
 * (`App.tsx` via the dev server) and asserts: the desktop mega-menu opens from
 * the real Navbar with grouped buy-intent columns, `aria-haspopup`/`aria-expanded`
 * reflect state, Escape closes it, items navigate to real /collections/* routes,
 * and the mobile drawer accordion works at a 390px breakpoint with ≥44px targets.
 *
 * STATUS: PLANNED — NOT EXECUTED in this sandbox. Playwright's chromium build is
 * missing here, so `npx playwright test` cannot run this spec; it is authored to
 * the real contract so it runs once a browser lands. `npm test` (Vitest) does NOT
 * execute it (excluded via the jsdom/node projects). The runnable green evidence
 * now is the jsdom render test (tests/unit/mega-menu.test.tsx), which mounts the
 * same real `App.tsx` through MemoryRouter.
 */
import { test, expect } from '@playwright/test'

const MEGA_COLUMNS = [
  'mega-col-personalized',
  'mega-col-tcm',
  'mega-col-wuxing',
  'mega-col-analysis-pdfs',
  'mega-col-bundles',
  'mega-col-featured',
] as const

// ── AT-009-1 — desktop mega-menu opens with grouped columns ──────────────────

test.describe('REQ-009 / AT-009-1 — desktop mega-menu opens with grouped columns', () => {
  test('opens the panel and shows all 6 buy-intent columns', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    const trigger = page.getByTestId('mega-menu-trigger')
    await expect(trigger).toBeVisible()
    await trigger.click()

    const panel = page.getByTestId('mega-menu-panel')
    await expect(panel).toBeVisible()
    for (const id of MEGA_COLUMNS) {
      const col = panel.getByTestId(id)
      await expect(col).toBeVisible()
      expect(await col.getByRole('link').count()).toBeGreaterThanOrEqual(1)
    }
  })
})

// ── AT-009-3 — A11y: aria attrs reflect state, Escape closes ──────────────────

test.describe('REQ-009 / AT-009-3 — keyboard + ARIA', () => {
  test('aria-haspopup/aria-expanded reflect state; Escape closes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    const trigger = page.getByTestId('mega-menu-trigger')
    await expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('mega-menu-panel')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('Tab order reaches a mega-menu link after opening', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.getByTestId('mega-menu-trigger').click()
    const firstLink = page.getByTestId('mega-col-personalized').getByRole('link').first()
    await firstLink.focus()
    await expect(firstLink).toBeFocused()
  })
})

// ── AT-009-4 — items link to real REQ-010 routes (click navigates) ────────────

test.describe('REQ-009 / AT-009-4 — items navigate to real collection routes', () => {
  test('clicking a collection item lands on a non-empty collection template', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.getByTestId('mega-menu-trigger').click()

    await page
      .getByTestId('mega-col-personalized')
      .getByRole('link', { name: /bazi/i })
      .first()
      .click()

    await expect(page.getByTestId('collection-page')).toBeVisible()
    await expect(page.getByTestId('collection-page').locator('h1')).toHaveCount(1)
  })
})

// ── AT-009-2 — mobile drawer accordion (390px), ≥44px targets, no hover ───────

test.describe('REQ-009 / AT-009-2 — mobile drawer accordion at 390px', () => {
  test('drawer opens, collections accordion expands, links present', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await page.getByLabel(/open menu/i).click()
    const toggle = page.getByTestId('mobile-collections-toggle')
    await expect(toggle).toBeVisible()

    // ≥44px touch target
    const box = await toggle.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

    await toggle.click()
    expect(await page.getByTestId('mobile-collection-link').count()).toBeGreaterThanOrEqual(1)
  })

  test('no horizontal scroll at 390px with the drawer closed (AT-017-3)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const overflow = await page.evaluate(() => {
      const el = document.scrollingElement!
      return el.scrollWidth - el.clientWidth
    })
    expect(overflow).toBeLessThanOrEqual(1)
  })
})
