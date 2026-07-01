/**
 * M14 — Mobile commerce shell evidence. RENDERED [REAL-BOUNDARY] — REQ-007 /
 * REQ-027 / REQ-033 / REQ-034, coupled to the correction STOP-004 ("mobile
 * compresses desktop nav under 480px → not accepted").
 *
 * This spec is the 360/390/430 EVIDENCE the exact-architecture correction demands
 * (EV-002 / STOP: "No M15 without 360/390/430 evidence"). It runs on the
 * playwright.config mobile projects (mobile-360 / mobile-390 / mobile-430) and
 * asserts the mobile commerce shell built across M10–M13 actually works at phone
 * widths: header controls reachable, a real taxonomy DRAWER (not a compressed
 * desktop nav), no horizontal overflow, product sliders present, collection grid
 * ≤2 columns, and a reachable PDP size selector + add-to-cart.
 *
 * STATUS: PLANNED — NOT EXECUTED in the build sandbox (vite dev server + chromium
 * do not boot here; RL-CHROMIUM). It is authored to the real contract so it
 * produces the green 360/390/430 evidence once run on a machine where Playwright
 * has a browser. Nothing marks the mobile shell production-verified until this
 * runs green on all three mobile projects.
 */
import { test, expect, type Page } from '@playwright/test'

// Mobile-only: the mobile projects set viewport ≤ 430; skip on chromium-desktop.
test.skip(({ viewport }) => (viewport?.width ?? 9999) > 480, 'mobile viewports only')

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.scrollingElement as HTMLElement
    return el.scrollWidth - el.clientWidth
  })
}

/** Count how many elements share the top row (same rounded y) — the column count. */
async function firstRowCount(page: Page, testid: string): Promise<number> {
  return page.evaluate((id) => {
    const cards = Array.from(document.querySelectorAll(`[data-testid="${id}"]`)) as HTMLElement[]
    if (cards.length === 0) return 0
    const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top))
    const firstTop = Math.min(...tops)
    return tops.filter((t) => Math.abs(t - firstTop) < 8).length
  }, testid)
}

// ── Header + drawer (REQ-007 / REQ-033 / STOP-004) ────────────────────────────

test.describe('M14 — mobile header + taxonomy drawer', () => {
  test('the header exposes hamburger / logo / search / cart, and the desktop nav is hidden', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('mobile-menu-trigger')).toBeVisible()
    await expect(page.getByTestId('header-logo')).toBeVisible()
    await expect(page.getByTestId('header-search')).toBeVisible()
    await expect(page.getByTestId('header-cart')).toBeVisible()
    // the desktop primary nav row is NOT shown at mobile width (no compression)
    await expect(page.getByTestId('primary-nav')).toBeHidden()
  })

  test('the drawer opens and MIRRORS the six-axis taxonomy (not a compressed desktop nav)', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('mobile-menu-trigger').click()
    await expect(page.getByTestId('mobile-menu')).toBeVisible()
    await page.getByTestId('mobile-collections-toggle').click()
    for (const axis of ['world', 'style', 'room', 'size', 'set', 'campaign']) {
      await expect(page.getByTestId(`mobile-axis-${axis}`)).toBeVisible()
    }
    // language access is reachable inside the drawer
    await expect(page.getByTestId('mobile-menu-lang')).toBeVisible()
  })
})

// ── No horizontal overflow anywhere in the funnel (STOP-004 / REQ-033) ─────────

test.describe('M14 — no horizontal overflow at mobile width', () => {
  for (const path of ['/', '/collections/bundles', '/product/11', '/personalize']) {
    test(`no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path)
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1)
    })
  }
})

// ── Home sliders (REQ-015/018) render as swipeable carousels ───────────────────

test.describe('M14 — home product sliders', () => {
  test('bestseller + new-arrivals sliders render on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('home-module-bestseller')).toBeVisible()
    await expect(page.getByTestId('home-new-arrivals')).toBeVisible()
  })
})

// ── Collection grid ≤2 columns under 480px (REQ-027) ──────────────────────────

test.describe('M14 — collection grid never renders 3 columns on mobile', () => {
  test('the product grid shows at most 2 columns', async ({ page }) => {
    await page.goto('/collections/bundles')
    await expect(page.getByTestId('collection-grid')).toBeVisible()
    expect(await firstRowCount(page, 'collection-product-card')).toBeLessThanOrEqual(2)
  })

  test('the filter matrix is usable (chips wrap, reachable)', async ({ page }) => {
    await page.goto('/collections/bundles')
    await expect(page.getByTestId('collection-filters')).toBeVisible()
    const chip = page.getByTestId('collection-facet').first()
    await expect(chip).toBeVisible()
    await chip.click() // a chip is tappable without horizontal scroll
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1)
  })
})

// ── PDP mobile commerce (REQ-028/033) ─────────────────────────────────────────

test.describe('M14 — PDP size selector + add-to-cart reachable on mobile', () => {
  test('the ready-to-ship PDP shows a reachable size selector and add-to-cart', async ({ page }) => {
    await page.goto('/product/11') // TCM, non-personalizable
    await expect(page.getByTestId('pdp')).toBeVisible()
    const sizeSel = page.getByTestId('pdp-size-selector')
    await expect(sizeSel).toBeVisible()
    // every size option is tappable within the viewport (no clip)
    const opts = sizeSel.getByTestId('pdp-size-option')
    await expect(opts).toHaveCount(3)
    await opts.last().click()
    const cta = page.getByTestId('pdp-add-to-cart')
    await expect(cta).toBeVisible()
    const box = await cta.boundingBox()
    const vw = page.viewportSize()!.width
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(vw + 1) // not clipped off-screen
  })
})
