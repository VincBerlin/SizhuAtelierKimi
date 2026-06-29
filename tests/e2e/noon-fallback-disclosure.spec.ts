/**
 * Noon-fallback disclosure — RENDERED — REQ-018 (acceptance-design AT-018-2/3).
 *
 * STATUS: PLANNED — NOT EXECUTED in this sandbox (no chromium build). [REAL-BROWSER-PLANNED]
 * Authored to the real contract so it runs once a browser lands; `npm test` (Vitest)
 * does NOT execute this Playwright spec. The runnable green evidence now is the jsdom
 * render test tests/unit/noon-fallback-render.test.tsx.
 *
 * Beat-0 Gegenthese (Vision §7.5 "12:00-Noon-Fallback still setzen"): the fallback
 * is set, but the disclosure never renders (missing key in a language, or hint only
 * in code) → a silent default, exactly the concealment REQ-018 must close. So these
 * run over the REAL composition root (`App.tsx` via the dev server) and assert the
 * disclosure is in the DOM:
 *   - AT-018-2: at the birth-time field on /personalize, after checking
 *     "I don't know my birth time" — in EN/DE/FR, mentioning 12:00.
 *   - AT-018-3: in the cart/summary (PersonalizationSummary) once the line is added.
 *
 * Reality-Ledger: couples to BLK-RED-BAZI — the chart stays a placeholder. This
 * only proves the ASSUMPTION is disclosed, never that the artwork is computed.
 *
 * NOTE: Playwright browsers are NOT installed in the current iteration (see
 * playwright.config.ts scaffold note). This spec is authored so `npx playwright
 * test` runs it once browsers land; `npm test` (Vitest) does not execute it.
 */
import { test, expect, type Page } from '@playwright/test'

type Lang = 'EN' | 'DE' | 'FR'
const LANGS: Lang[] = ['EN', 'DE', 'FR']

// Seed the persisted language before the app boots so the first render is in the
// target language (I18nProvider reads `sizhu_lang` from localStorage on mount).
async function bootInLang(page: Page, lang: Lang, path: string) {
  await page.addInitScript((l) => {
    window.localStorage.setItem('sizhu_lang', l)
  }, lang)
  await page.goto(path)
}

// Language-specific anchor for "we use 12:00 (noon)" so the assertion is not a
// brittle exact-string match but still proves the 12:00 disclosure rendered.
const NOON_RE = /12[:.]?0?0|midi|mittags|noon/i

test.describe('REQ-018 / AT-018-2 — noon-fallback disclosure renders at the birth-time field', () => {
  for (const lang of LANGS) {
    test(`[${lang}] checking "birth time unknown" reveals the 12:00 hint in the DOM`, async ({ page }) => {
      await bootInLang(page, lang, '/personalize')

      // The unknown-time checkbox lives next to its hint label.
      const checkbox = page.getByRole('checkbox').first()
      await checkbox.check()

      // The field-level disclosure hint must be visible and reference 12:00.
      const hint = page.getByTestId('noon-fallback-field-hint')
      await expect(hint).toBeVisible()
      await expect(hint).toHaveText(NOON_RE)
    })
  }
})

test.describe('REQ-018 / AT-018-3 — noon-fallback disclosure renders in the cart summary', () => {
  for (const lang of LANGS) {
    test(`[${lang}] an unknown-time line shows the noon notice in the cart`, async ({ page }) => {
      await bootInLang(page, lang, '/personalize')

      // Fill the minimum required birth data (name, date, place) + mark time unknown.
      await page.getByRole('checkbox').first().check()
      // Name + place are the first two text inputs; date is the date input.
      const textInputs = page.locator('input[type="text"]')
      await textInputs.nth(0).fill('Mara') // name
      await textInputs.nth(1).fill('München') // place
      await page.locator('input[type="date"]').first().fill('1990-06-15')

      // Add to cart — this opens the CartDrawer with the personalization summary.
      await page.getByRole('button', { name: /add|warenkorb|panier/i }).last().click()

      const notice = page.getByTestId('cart-noon-fallback-notice').first()
      await expect(notice).toBeVisible()
      await expect(notice).toHaveText(NOON_RE)
    })
  }
})
