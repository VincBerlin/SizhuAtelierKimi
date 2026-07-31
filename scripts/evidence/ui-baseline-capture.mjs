/**
 * T-001 UI-Baseline-Capture — [REAL-BROWSER]
 *
 * Screenshots der Kernrouten × 375/768/1280 px gegen die laufende Produktion,
 * VOR jeder fachlichen Änderung der CJK-Migration
 * (Plan: docs/plans/2026-07-31-cjk-migration.md, Phase 0 / T-001).
 *
 * Aufruf:  node scripts/evidence/ui-baseline-capture.mjs
 * Env:     BASELINE_BASE_URL  (Default: Railway-Produktion)
 *          BASELINE_OUT_DIR   (Default: docs/evidence/cjk-migration/ui-baseline)
 *
 * Ehrlichkeitsregel: Das Script bricht mit Exit 1 ab, wenn auch nur ein
 * Screenshot fehlschlägt — kein stilles Auslassen. Ergebnis-Manifest:
 * <OUT>/manifest.json mit Commit, Datum, URL und Status je Aufnahme.
 */
import { chromium } from '@playwright/test'
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const BASE = process.env.BASELINE_BASE_URL || 'https://sizhuatelier-shop-production.up.railway.app'
const OUT = process.env.BASELINE_OUT_DIR || 'docs/evidence/cjk-migration/ui-baseline'

const WIDTHS = [
  { tag: 'w0375', width: 375, height: 812, isMobile: true, hasTouch: true },
  { tag: 'w0768', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { tag: 'w1280', width: 1280, height: 900, isMobile: false, hasTouch: false },
]

const ROUTES = [
  ['home', '/'],
  ['collections', '/collections'],
  ['personalize', '/personalize'],
  ['product-7', '/product/7'],
  ['checkout', '/checkout'],
  ['tcm', '/tcm'],
  ['how-it-works', '/how-it-works'],
  ['faq', '/faq'],
]

const results = []

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 45000 })
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(700)
}

async function shot(page, name, tag, opts = {}) {
  const file = `${name}--${tag}.png`
  await page.screenshot({ path: join(OUT, file), fullPage: opts.fullPage !== false })
  const bytes = statSync(join(OUT, file)).size
  results.push({ name, tag, file, bytes, ok: true })
  console.log(`  ok  ${file} (${bytes} B)`)
}

async function run() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const vp of WIDTHS) {
    console.log(`--- ${vp.tag} (${vp.width}x${vp.height}) ---`)
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      deviceScaleFactor: 1,
    })
    const page = await ctx.newPage()

    for (const [name, path] of ROUTES) {
      try {
        const resp = await page.goto(BASE + path, { waitUntil: 'commit' })
        await settle(page)
        if (!resp || resp.status() >= 400) throw new Error(`HTTP ${resp && resp.status()}`)
        await shot(page, name, vp.tag)
      } catch (e) {
        results.push({ name, tag: vp.tag, ok: false, error: String(e && e.message || e) })
        console.log(`  FAIL ${name}--${vp.tag}: ${e.message}`)
      }
    }

    // erste echte Collection-Detailseite (Slug zur Laufzeit von /collections)
    try {
      await page.goto(BASE + '/collections', { waitUntil: 'commit' })
      await settle(page)
      const hrefs = await page
        .locator('a[href^="/collections/"]')
        .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))])
      if (!hrefs.length) throw new Error('kein Collection-Link auf /collections gefunden')
      let captured = false
      for (const href of hrefs) {
        await page.goto(BASE + href, { waitUntil: 'commit' })
        await settle(page)
        // Retirierte Kollektionen redirecten (z. B. bazi-posters → /personalize):
        // solche Aufnahmen wären KEINE Kollektionsseite und werden übersprungen.
        if (new URL(page.url()).pathname !== href) continue
        await shot(page, 'collection-first', vp.tag)
        results[results.length - 1].slug = href
        captured = true
        break
      }
      if (!captured) throw new Error('alle Collection-Links redirecten — keine echte Kollektionsseite gefunden')
    } catch (e) {
      results.push({ name: 'collection-first', tag: vp.tag, ok: false, error: String(e.message) })
      console.log(`  FAIL collection-first--${vp.tag}: ${e.message}`)
    }

    // Interaktionszustände
    try {
      await page.goto(BASE + '/', { waitUntil: 'commit' })
      await settle(page)
      if (vp.tag === 'w1280') {
        await page.getByTestId('mega-menu-trigger').click({ timeout: 10000 })
        await page.getByTestId('mega-menu-panel').waitFor({ state: 'visible', timeout: 10000 })
        await page.waitForTimeout(400)
        await shot(page, 'megamenu-open', vp.tag, { fullPage: false })
      } else {
        await page.getByTestId('mobile-menu-trigger').click({ timeout: 10000 })
        await page.getByTestId('mobile-menu').waitFor({ state: 'visible', timeout: 10000 })
        await page.waitForTimeout(400)
        await shot(page, 'mobile-menu-open', vp.tag, { fullPage: false })
        await page.keyboard.press('Escape').catch(() => {})
      }
      // Warenkorb-Drawer (Leerzustand gehört zur Baseline)
      await page.goto(BASE + '/', { waitUntil: 'commit' })
      await settle(page)
      await page.getByTestId('header-cart').click({ timeout: 10000 })
      await page.waitForTimeout(700)
      await shot(page, 'cart-drawer', vp.tag, { fullPage: false })
    } catch (e) {
      results.push({ name: 'interactions', tag: vp.tag, ok: false, error: String(e.message) })
      console.log(`  FAIL interactions--${vp.tag}: ${e.message}`)
    }

    await ctx.close()
  }
  await browser.close()

  const commit = execSync('git rev-parse HEAD').toString().trim()
  const branch = execSync('git branch --show-current').toString().trim()
  const failed = results.filter((r) => r.ok === false)
  const manifest = {
    task: 'T-001 UI-Baseline (CJK-Migration Phase 0)',
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    commit,
    branch,
    railwayDeploymentId: process.env.RAILWAY_DEPLOYMENT_ID || null,
    total: results.length,
    failedCount: failed.length,
    shots: results,
  }
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\n${results.length - failed.length}/${results.length} Aufnahmen ok → ${OUT}/manifest.json`)
  if (failed.length) {
    console.error('FEHLGESCHLAGEN:', failed.map((f) => `${f.name}--${f.tag}`).join(', '))
    process.exit(1)
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
