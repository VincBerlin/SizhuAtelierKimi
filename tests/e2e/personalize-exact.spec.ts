/**
 * [REAL-BROWSER] + [REAL-BOUNDARY-LIVE] — läuft gegen `npm start` MIT echten
 * FUFIRE-Env-Variablen (kein Mock): Käufer gibt Geburtsdaten ein → das Poster
 * zeigt die live berechneten EXAKTEN Säulen des kanonischen Falls.
 * Screenshot → docs/evidence/fufire-gelato/personalize-exact-live.png (Ledger).
 *
 * Start: npm run build && FUFIRE_API_URL=… FUFIRE_API_KEY=… PORT=3000 npm start
 */
import { test, expect } from '@playwright/test'

const BASE = process.env.EVIDENCE_BASE_URL || 'http://localhost:3000'

test('buyer enters birth data and sees the exact live-computed pillars', async ({ page }) => {
  await page.goto(BASE + '/personalize')
  const place = page.getByTestId('place-of-birth-input')
  await place.fill('Berlin')
  await page.getByRole('option', { name: /Berlin/ }).first().click()
  await expect(page.getByTestId('place-resolved-note')).toBeVisible({ timeout: 10_000 })
  await page.locator('input[type="date"]').first().fill('1990-06-15')
  await page.locator('input[type="time"]').first().fill('12:30')

  const preview = page.getByTestId('poster-svg-preview')
  for (const glyph of ['庚', '壬', '辛', '乙', '亥', '未']) {
    await expect(preview.getByText(glyph).first()).toBeVisible({ timeout: 15_000 })
  }
  // Operator 2026-07-13: Poster-Texte in der GEWÄHLTEN Poster-Sprache —
  // EN-Browser → posterLang EN → HORSE/METAL (posterLocale übersetzt die
  // kanonisch deutschen FuFirE-Werte identisch für Vorschau und Druck).
  await expect(preview.getByText('HORSE').first()).toBeVisible()
  await expect(preview.getByText('METAL').first()).toBeVisible()
  await expect(preview.getByText('BAZI · FOUR PILLARS').first()).toBeVisible()

  // Chart-Review (Operator 2026-07-13): Tagesmeister (Tag-Stamm 辛 · Metal)
  // + Säulen als lesbare Zusammenfassung.
  const review = page.getByTestId('chart-review')
  await expect(review).toBeVisible()
  await expect(review).toContainText('辛')
  await expect(review).toContainText('庚午')
  await page.screenshot({ path: 'docs/evidence/fufire-gelato/personalize-exact-live.png', fullPage: false })
})
