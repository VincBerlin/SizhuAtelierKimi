/**
 * DELTA T-103 — TCM & Wuxing as REAL product worlds (REQ-006). `[SHIPPED-SCAN]`.
 *
 * Acceptance contract: AT-006-3 from docs/tests/desenio-acceptance-design.md:
 *   catalog.ts has ≥1 product with product_world==='tcm' AND ≥1 with 'wuxing',
 *   each with price > 0. (The render parts AT-006-1/2/4 — product cards with
 *   title+price+CTA on /collections/tcm-posters & /wuxing-posters — land in
 *   T-303, the Collection template.)
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-006): TCM/Wuxing could appear as a
 * pure text list (no real purchasable unit) — no price, not CTA-able, not wired
 * into a collection a customer can reach. So the SHIPPED-SCAN here asserts they
 * are REAL catalog units: non-empty title + price>0 + a `tcm-posters` /
 * `wuxing-posters` collection that resolves to them via the product_world axis.
 *
 * RED-line discipline: prices are placeholders (OQ-002, RED for FINAL NUMBERS).
 * This pins price > 0 (purchasable mechanism), never a final figure.
 */
import { describe, it, expect } from 'vitest'
import { products, filterByWorld, type Product } from '../../src/lib/catalog'
import { getCollectionConfig } from '../../src/lib/collections'

function realUnit(p: Product): boolean {
  return typeof p.title === 'string' && p.title.trim().length > 0 && p.price > 0
}

// ── AT-006-3 — TCM has ≥1 real, priced unit ──────────────────────────────────

describe('REQ-006 / AT-006-3 — TCM is a real product world', () => {
  const tcm = filterByWorld(products, 'tcm')

  it('has ≥1 product with product_world === "tcm"', () => {
    expect(tcm.length).toBeGreaterThanOrEqual(1)
  })

  it('every tcm product has a non-empty title and price > 0 (purchasable)', () => {
    for (const p of tcm) {
      expect(realUnit(p), `tcm product #${p.id} must have title + price>0`).toBe(true)
    }
  })

  it('the tcm-posters collection resolves to the tcm world (CTA-reachable grid)', () => {
    const cfg = getCollectionConfig('tcm-posters')
    expect(cfg, 'tcm-posters collection config must exist').toBeDefined()
    expect(cfg!.world).toBe('tcm')
    // grid sourced from the real catalog over product_world — never empty.
    expect(filterByWorld(products, cfg!.world!).length).toBeGreaterThanOrEqual(1)
  })
})

// ── AT-006-3 — Wuxing has ≥1 real, priced unit ───────────────────────────────

describe('REQ-006 / AT-006-3 — Wuxing is a real product world', () => {
  const wuxing = filterByWorld(products, 'wuxing')

  it('has ≥1 product with product_world === "wuxing"', () => {
    expect(wuxing.length).toBeGreaterThanOrEqual(1)
  })

  it('every wuxing product has a non-empty title and price > 0 (purchasable)', () => {
    for (const p of wuxing) {
      expect(realUnit(p), `wuxing product #${p.id} must have title + price>0`).toBe(true)
    }
  })

  it('the wuxing-posters collection resolves to the wuxing world (CTA-reachable grid)', () => {
    const cfg = getCollectionConfig('wuxing-posters')
    expect(cfg, 'wuxing-posters collection config must exist').toBeDefined()
    expect(cfg!.world).toBe('wuxing')
    expect(filterByWorld(products, cfg!.world!).length).toBeGreaterThanOrEqual(1)
  })
})

// ── AT-006-3 — both worlds populated together (the delta requirement) ────────

describe('REQ-006 / AT-006-3 — TCM and Wuxing both ship as worlds', () => {
  it('catalog has ≥1 priced tcm AND ≥1 priced wuxing product simultaneously', () => {
    const tcmPriced = products.filter((p) => p.product_world === 'tcm' && p.price > 0)
    const wuxingPriced = products.filter((p) => p.product_world === 'wuxing' && p.price > 0)
    expect(tcmPriced.length).toBeGreaterThanOrEqual(1)
    expect(wuxingPriced.length).toBeGreaterThanOrEqual(1)
  })
})
