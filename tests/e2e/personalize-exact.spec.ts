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

test('couple: pair poster head shows the DAY MASTER (not the year animal) + structured compat explainer', async ({ page }) => {
  await page.goto(BASE + '/personalize?type=couple')
  // Person A — kanonischer Fall (Berlin).
  const places = page.getByTestId('place-of-birth-input')
  await places.fill('Berlin')
  await page.getByRole('option', { name: /Berlin/ }).first().click()
  await expect(page.getByTestId('place-resolved-note')).toBeVisible({ timeout: 10_000 })
  await page.locator('input[type="date"]').first().fill('1990-06-15')
  await page.locator('input[type="time"]').first().fill('12:30')
  // Person B — Lissabon (stabile testid; blur committet die Orts-Auflösung).
  await page.locator('input[type="date"]').nth(1).fill('1988-03-02')
  await page.locator('input[type="time"]').nth(1).fill('08:15')
  const placeB = page.getByTestId('place-of-birth-input-b')
  await placeB.fill('Lissabon')
  await placeB.blur()
  // Geocoder kann direkt auflösen ODER Kandidaten anbieten — beides abdecken.
  const noteB = page.getByTestId('place-b-resolved-note')
  const candB = page.getByTestId('place-b-candidates')
  await expect(noteB.or(candB)).toBeVisible({ timeout: 15_000 })
  if (await candB.isVisible()) {
    await candB.getByRole('button').first().click()
  }
  await expect(noteB).toBeVisible({ timeout: 10_000 })

  const preview = page.getByTestId('poster-svg-preview')
  // Tagesmeister-Kopf Person A: 辛 · METAL — plus (Operator 2026-07-14,
  // zweiter Auftrag) das Jahres-Tier als EIGENE Zeile darunter.
  await expect(preview.getByText('辛 · METAL').first()).toBeVisible({ timeout: 20_000 })
  await expect(preview.getByText('HORSE').first()).toBeVisible()
  await expect(preview.getByText('BAZI · PARTNERSHIP').first()).toBeVisible()

  // Strukturierte Kompatibilitäts-Erklärung unter den eingetragenen Daten.
  const explainer = page.getByTestId('compat-explainer')
  await expect(explainer).toBeVisible()
  await expect(explainer).toContainText('辛')
  await expect(explainer).toContainText(/not a judgement/i)
  await page.screenshot({ path: 'docs/evidence/fufire-gelato/personalize-couple-live.png', fullPage: false })
})

test('birth chart: western zodiac live — sun core GEMINI, big three, review + explanations', async ({ page }) => {
  await page.goto(BASE + '/personalize?type=birthchart')
  const place = page.getByTestId('place-of-birth-input')
  await place.fill('Berlin')
  await page.getByRole('option', { name: /Berlin/ }).first().click()
  await expect(page.getByTestId('place-resolved-note')).toBeVisible({ timeout: 10_000 })
  await page.locator('input[type="date"]').first().fill('1990-06-15')
  await page.locator('input[type="time"]').first().fill('12:30')

  const preview = page.getByTestId('poster-svg-preview')
  // Live-Western (FuFirE Swiss Ephemeris): Sonne Zwillinge, Mond Fische,
  // ASC Jungfrau — EN-Poster-Sprache.
  await expect(preview.getByText('Gemini').first()).toBeVisible({ timeout: 20_000 })
  await expect(preview.getByText('Pisces').first()).toBeVisible()
  await expect(preview.getByText('Virgo').first()).toBeVisible()
  await expect(preview.getByText('WESTERN · BIRTH CHART').first()).toBeVisible()

  const review = page.getByTestId('western-review')
  await expect(review).toBeVisible()
  await expect(review).toContainText('Gemini')
  const explain = page.getByTestId('western-explain')
  await expect(explain).toContainText(/core identity/i)
  await page.screenshot({ path: 'docs/evidence/fufire-gelato/personalize-western-live.png', fullPage: false })
})
