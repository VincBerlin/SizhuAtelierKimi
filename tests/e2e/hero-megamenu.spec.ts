/**
 * [REAL-BROWSER] — Operator-Abnahmekriterien Hero + Mega-Menü (Plan §11),
 * maschinell geprüft gegen den GEBAUTEN Server (npm run build && npm start).
 * Screenshots → docs/evidence/fufire-gelato/hero-*.png (Ledger).
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.EVIDENCE_BASE_URL || 'http://localhost:3000'

test.describe('Hero (Operator-Plan §2.1/§4)', () => {
  test('hero fills the remaining viewport; NO product visible on load', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE + '/')
    const hero = page.getByTestId('home-viewport-hero')
    await expect(hero).toBeVisible()
    const heroBox = (await hero.boundingBox())!
    // Hero endet erst an/unter der Viewport-Unterkante → kein Produkt sichtbar.
    expect(heroBox.y + heroBox.height).toBeGreaterThanOrEqual(898)
    const bestseller = page.getByTestId('home-module-bestseller')
    const bb = await bestseller.boundingBox()
    expect(bb!.y).toBeGreaterThanOrEqual(900) // unterhalb des ersten Screens
    await expect(page.getByTestId('split-hero-brand')).toBeVisible()
    await expect(page.getByTestId('split-hero-media').locator('img')).toBeVisible()
    await page.screenshot({ path: 'docs/evidence/fufire-gelato/hero-desktop.png' })
  })

  test('mobile: hero stacks brand above photo, no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto(BASE + '/')
    const brand = (await page.getByTestId('split-hero-brand').boundingBox())!
    const media = (await page.getByTestId('split-hero-media').boundingBox())!
    expect(brand.y).toBeLessThan(media.y) // Brand oben, Foto darunter (§7)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: 'docs/evidence/fufire-gelato/hero-mobile.png' })
  })
})

test.describe('Mega-Menü (Operator-Plan §5/§6)', () => {
  test('opens on hover, spans the FULL viewport width, closes on Escape, no layout shift', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE + '/')
    const heroBefore = (await page.getByTestId('home-viewport-hero').boundingBox())!
    await page.getByTestId('mega-menu-landing-link').hover()
    const panel = page.getByTestId('mega-menu-panel')
    await expect(panel).toBeVisible()
    const box = (await panel.boundingBox())!
    expect(box.x).toBeLessThanOrEqual(1)                 // linke Browserkante
    expect(box.width).toBeGreaterThanOrEqual(1438)       // volle Breite, keine Restfläche
    // Hero wird überlagert, nicht verschoben:
    const heroAfter = (await page.getByTestId('home-viewport-hero').boundingBox())!
    expect(heroAfter.y).toBeCloseTo(heroBefore.y, 0)
    // Editorial-Spalte + genau 2 Bildkarten + keine Pills:
    await expect(page.getByTestId('mega-editorial')).toBeVisible()
    await expect(page.getByTestId('mega-tile')).toHaveCount(2)
    await page.screenshot({ path: 'docs/evidence/fufire-gelato/megamenu-open.png' })
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
  })

  test('landing link and menu trigger are separate; keyboard reaches the panel', async ({ page }) => {
    await page.goto(BASE + '/')
    const link = page.getByTestId('mega-menu-landing-link')
    await expect(link).toHaveAttribute('href', '/collections')
    const trigger = page.getByTestId('mega-menu-trigger')
    await expect(trigger).toHaveAttribute('aria-controls', 'mega-menu-panel')
    await trigger.click()
    await expect(page.getByTestId('mega-menu-panel')).toBeVisible()
  })
})
