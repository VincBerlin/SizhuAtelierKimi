/**
 * Legal DE/FR localization — RENDERED [REAL-BOUNDARY] — REQ-007 (AT-007-1/2/4).
 *
 * STATUS: PLANNED — NOT EXECUTED in this sandbox (no chromium build). [REAL-BROWSER-PLANNED]
 * Authored to the real contract so it runs once a browser lands; `npm test` (Vitest)
 * does NOT execute this Playwright spec. The runnable green evidence now is the jsdom
 * render test tests/unit/legal-localization-render.test.tsx.
 *
 * Beat-0 Gegenthese (Vision §7.7(a) "created but never displayed"): the localized
 * legal docs + per-language review banner exist in src/lib/legal.ts, but if
 * Legal.tsx keeps consuming the flat EN-only export and hard-codes the English
 * banner, a DE/FR visitor still sees English prose. So these run over the REAL
 * composition root (`App.tsx` via the dev server) and assert, per doc-key in
 * DE/FR:
 *   - AT-007-1: the localized heading renders in the active language (and is NOT
 *               the EN-only title),
 *   - AT-007-2: every [MISSING — …] marker is still present (no invented operator
 *               data — identical marker count vs the EN source),
 *   - AT-007-4: the review banner renders in the active language.
 *
 * Reality-Ledger: this proves the localized prose + banner are DISPLAYED. It does
 * NOT certify any legal fact — the [MISSING — …] markers stay verbatim and the
 * banner keeps stating a professional review is required before go-live.
 *
 * NOTE: Playwright browsers are NOT installed in the current iteration (see
 * playwright.config.ts scaffold note). This spec is authored so `npx playwright
 * test` runs it once browsers land; `npm test` (Vitest) does not execute it. The
 * jsdom render test (tests/unit/legal-localization-render.test.tsx) is the
 * runnable green evidence over the real `Legal` page in the meantime.
 */
import { test, expect, type Page } from '@playwright/test'
import { LEGAL_DOCS_BY_LANG, LEGAL_REVIEW_BANNER } from '../../src/lib/legal'
import type { Lang } from '../../src/i18n/translations'

const LANGS: Lang[] = ['DE', 'FR']
const ROUTES: Record<string, string> = {
  impressum: '/impressum',
  privacy: '/privacy',
  terms: '/terms',
  returns: '/returns',
  shipping: '/shipping',
}
const MISSING_RE = /\[MISSING — [^\]]*\]/g

// Seed the persisted language before the app boots so the first render is in the
// target language (I18nProvider reads `sizhu_lang` from localStorage on mount).
async function bootInLang(page: Page, lang: Lang, path: string) {
  await page.addInitScript((l) => {
    window.localStorage.setItem('sizhu_lang', l)
  }, lang)
  await page.goto(path)
  // The legal route is lazy-loaded (code-split). Wait for its H1 + first body
  // section to paint BEFORE any one-shot read below — `allTextContents()` does NOT
  // auto-retry, so without this it races the lazy chunk and reads 0 markers.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('main section').first()).toBeVisible()
}

/** Canonical [MISSING — …] marker count for a doc-key, taken from the EN source. */
function expectedMarkerCount(docKey: string): number {
  const doc = LEGAL_DOCS_BY_LANG.EN[docKey]
  const all = doc.sections.flatMap((s) => s.body).join('\n')
  return (all.match(MISSING_RE) ?? []).length
}

test.describe('REQ-007 / AT-007-1 — localized legal heading renders in DE/FR', () => {
  for (const lang of LANGS) {
    for (const docKey of Object.keys(ROUTES)) {
      test(`[${lang}] ${ROUTES[docKey]} renders the ${lang} title (not the EN title)`, async ({ page }) => {
        await bootInLang(page, lang, ROUTES[docKey])
        const langTitle = LEGAL_DOCS_BY_LANG[lang][docKey].title
        const enTitle = LEGAL_DOCS_BY_LANG.EN[docKey].title

        const heading = page.getByRole('heading', { level: 1 })
        await expect(heading).toHaveText(langTitle)
        if (langTitle !== enTitle) {
          await expect(heading).not.toHaveText(enTitle)
        }
      })
    }
  }
})

test.describe('REQ-007 / AT-007-2 — [MISSING — …] markers stay verbatim in DE/FR', () => {
  for (const lang of LANGS) {
    for (const docKey of Object.keys(ROUTES)) {
      test(`[${lang}] ${ROUTES[docKey]} keeps all markers (no invented operator data)`, async ({ page }) => {
        await bootInLang(page, lang, ROUTES[docKey])
        // Count markers in the document body only — the review banner intentionally
        // contains the literal phrase "[MISSING — …]" as documentation.
        const bodyText = (await page.locator('main section').allTextContents()).join('\n')
        const found = (bodyText.match(MISSING_RE) ?? []).length
        expect(found).toBe(expectedMarkerCount(docKey))
      })
    }
  }
})

test.describe('REQ-007 / AT-007-4 — per-language review banner renders in DE/FR', () => {
  for (const lang of LANGS) {
    test(`[${lang}] the legal review banner is shown in ${lang} (not English)`, async ({ page }) => {
      await bootInLang(page, lang, ROUTES.impressum)
      const banner = page.getByTestId('legal-review-banner')
      await expect(banner).toBeVisible()
      await expect(banner).toHaveText(LEGAL_REVIEW_BANNER[lang])
      await expect(banner).not.toHaveText(LEGAL_REVIEW_BANNER.EN)
    })
  }
})
