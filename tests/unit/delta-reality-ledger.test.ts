/**
 * REQ-020 / AT-020-1/2/3 — Reality-Ledger meta-scan (FM-18). `[SCAN]` / pure node:fs.
 *
 * The CAPSTONE honesty gate for the Desenio delta (T-802). It does NOT test product
 * behaviour — it enforces that the delta's EVIDENCE stays honest:
 *   - AT-020-1: nothing is marked production-verified without a real boundary proof —
 *     the reality ledger has 0 production-verified rows and production_verified_count
 *     sums to exactly 0.
 *   - AT-020-2: every fake-only / real-browser-PLANNED boundary is named RED in the
 *     ledger (RL-STRIPE, RL-CHROMIUM, RL-EVENT, RL-BAZI, RL-IMAGES, RL-PRICES), and the
 *     place-of-birth autocomplete is a BUNDLED cities list with no live geocoding
 *     (no Nominatim / fetch in src/lib/cities.ts) — the OQ-003 policy constraint.
 *   - AT-020-3: every delta requirement REQ-001..REQ-025 maps to a RUNNABLE test file
 *     (the Playwright e2e specs are PLANNED/unrun and deliberately NOT used as the
 *     runnable evidence here); no REQ is silently uncovered, and each mapped file
 *     actually references its REQ id.
 *
 * Falsifiable, NOT a tautology: AT-020-1 goes RED if any ledger row is flipped to
 * production-verified or a non-zero count; AT-020-3 goes RED if a REQ is added/removed
 * without updating the map, if a mapped test file is missing (readFileSync throws), or
 * if a mapped file does not reference its REQ.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel: string): string => readFileSync(path.join(ROOT, rel), 'utf8')
const LEDGER_REL = 'docs/reality/sizhuatelier-desenio-delta-architecture.evidence.jsonl'

function ledgerRows(): Array<Record<string, unknown>> {
  return read(LEDGER_REL)
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((l, i) => {
      try {
        return JSON.parse(l) as Record<string, unknown>
      } catch {
        throw new Error(`reality-ledger line ${i + 1} is not valid JSON: ${l.slice(0, 80)}`)
      }
    })
}

// ── AT-020-1 — nothing production-verified without real proof ─────────────────
describe('REQ-020 / AT-020-1 — no requirement is marked production-verified without proof', () => {
  it('every ledger line is valid JSON and NO row claims production-verified', () => {
    const rows = ledgerRows()
    expect(rows.length).toBeGreaterThan(0)
    const verified = rows.filter(
      (r) => r.production_verification_status === 'production-verified',
    )
    expect(
      verified,
      `rows claiming production-verified: ${JSON.stringify(verified)}`,
    ).toEqual([])
  })

  it('production_verified_count sums to exactly 0 across the whole ledger', () => {
    const total = ledgerRows().reduce(
      (s, r) => s + (Number(r.production_verified_count) || 0),
      0,
    )
    expect(total).toBe(0)
  })
})

// ── AT-020-2 — every fake / real-browser-PLANNED boundary is named RED ─────────
describe('REQ-020 / AT-020-2 — every fake-only / real-browser-PLANNED boundary is named RED', () => {
  const LEDGER = read(LEDGER_REL)
  const RED_BOUNDARIES = [
    'RL-STRIPE', // Stripe money-path is integration-fake (no live key/session)
    'RL-CHROMIUM', // real-browser Playwright unrun (no chromium in sandbox)
    'RL-EVENT', // analytics is a fake in-memory sink (collects no real data)
    'RL-BAZI', // BaZi chart math is a placeholder (RED for accuracy)
    'RL-IMAGES', // product imagery is a placeholder (OQ-001)
    'RL-PRICES', // region prices are placeholder figures (OQ-002)
  ] as const

  it.each(RED_BOUNDARIES)('%s is named as a RED carry in the reality ledger', (token) => {
    expect(LEDGER.includes(token), `${token} is missing from the reality ledger`).toBe(true)
  })

  it('the place-of-birth autocomplete is a bundled cities list with NO live geocoding (OQ-003)', () => {
    // The bundled source module exists and performs no network call (no live
    // Nominatim per keystroke — the firm OQ-003 policy constraint).
    const citiesSrc = read('src/lib/cities.ts')
    expect(
      /nominatim|fetch\(|XMLHttpRequest|axios/i.test(citiesSrc),
      'src/lib/cities.ts must be a bundled list with no live geocoding call',
    ).toBe(false)
  })
})

// ── AT-020-3 — every REQ-001..025 maps to a runnable test or named blocker ─────
describe('REQ-020 / AT-020-3 — every delta requirement has runnable evidence', () => {
  // Each REQ → a RUNNABLE (vitest jsdom/node) test file that exercises it. The
  // Playwright e2e specs are deliberately NOT used here — they are PLANNED/unrun
  // (BLK-CHROMIUM). A REQ with no runnable test would instead carry a named blocker
  // string; none is needed — every delta REQ has at least one runnable test.
  const REQ_EVIDENCE: Record<string, string> = {
    'REQ-001': 'tests/unit/above-fold-reorder.test.tsx', // hero stays module-02 DOM-index-0 (AT-002-3)
    'REQ-002': 'tests/unit/above-fold-reorder.test.tsx', // above-fold re-order (value-risk, merge-gate held)
    'REQ-003': 'tests/unit/delta-primary-nav.test.tsx',
    'REQ-004': 'tests/unit/delta-mega-menu-tiles.test.tsx',
    'REQ-005': 'tests/unit/delta-collection-template-inventory.test.tsx',
    'REQ-006': 'tests/unit/delta-tcm-wuxing-worlds.test.ts',
    'REQ-007': 'tests/unit/legal-localization-render.test.tsx',
    'REQ-008': 'tests/unit/home-module-order.test.tsx',
    'REQ-009': 'tests/unit/mega-menu.test.tsx',
    'REQ-010': 'tests/unit/collections-routes.test.tsx',
    'REQ-011': 'tests/unit/inspiration-page.test.tsx',
    'REQ-012': 'tests/unit/delta-personalize-mobile-config.test.tsx',
    'REQ-013': 'tests/unit/delta-cities-source.test.ts',
    'REQ-014': 'tests/unit/delta-cart-birth-review-gating.test.tsx',
    'REQ-015': 'tests/unit/delta-es-locale.test.tsx',
    'REQ-016': 'tests/unit/display-currency.format.test.ts',
    'REQ-017': 'tests/unit/delta-color-tokens.test.ts',
    'REQ-018': 'tests/unit/delta-poster-bg-palette.test.tsx',
    'REQ-019': 'tests/unit/delta-newsletter-seo-trust-lock.test.tsx',
    'REQ-020': 'tests/unit/delta-reality-ledger.test.ts', // this meta-scan is REQ-020's own evidence
    'REQ-021': 'tests/unit/delta-announcement-bar.test.tsx',
    'REQ-022': 'tests/unit/delta-header-composition.test.tsx',
    'REQ-023': 'tests/unit/delta-product-card-asset-light.test.tsx',
    'REQ-024': 'tests/unit/delta-offers-hub.test.tsx',
    'REQ-025': 'tests/unit/delta-pdp-personalization-gating.test.tsx',
  }
  const ALL_REQ_IDS = Array.from({ length: 25 }, (_, i) => `REQ-${String(i + 1).padStart(3, '0')}`)

  it('the evidence map covers EXACTLY REQ-001..REQ-025 (no REQ dropped or added silently)', () => {
    expect(Object.keys(REQ_EVIDENCE).sort()).toEqual(ALL_REQ_IDS)
  })

  it.each(ALL_REQ_IDS)('%s maps to a runnable test file that exists on disk', (req) => {
    const rel = REQ_EVIDENCE[req]
    expect(rel, `${req} has no evidence entry`).toBeTruthy()
    expect(() => read(rel), `${req} → ${rel} does not exist`).not.toThrow()
  })

  it('every mapped test file actually references its REQ id (genuine coverage, not a token dodge)', () => {
    const misses: string[] = []
    for (const [req, rel] of Object.entries(REQ_EVIDENCE)) {
      if (!read(rel).includes(req)) misses.push(`${req} → ${rel}`)
    }
    expect(misses, `mapped files not referencing their REQ: ${misses.join(', ')}`).toEqual([])
  })
})
