/**
 * Catalog V2 data-model conformance — REQ-013 (AT-013-1..4). `[UNIT]` / pure.
 *
 * Beat-0: `pure` — type/data-model logic, no boundary, no invented failure modes.
 * This pins the additive V2 dimensions on every catalog Product WITHOUT changing
 * any existing field, the enum discipline, and that filterByWorld is total +
 * deterministic and filters over `product_world` (not the inconsistent free-text
 * `category`).
 *
 *   - AT-013-1: every product carries product_world ∈ {bazi,tcm,wuxing,mixed},
 *               personalization_level ∈ {single,couple,yearly,none}, use_case
 *               (non-empty string), design_family ∈
 *               {minimal,japandi,wabi_sabi,classic_ink}; the existing fields
 *               (id, category, title, price, anchor, rating, reviews, sold,
 *               bullets, poster, personalizable, image, usage) are unchanged.
 *   - AT-013-2: no product carries an enum value outside the allowed sets.
 *   - AT-013-3: filterByWorld(products, world) is deterministic + total — every
 *               world with stock returns ≥1 product; it filters over
 *               product_world, not category.
 *   - AT-013-4: the annotation invents no prices/reviews (values == the existing
 *               stock; OQ-002).
 *
 * RED-line discipline: this is data-model conformance only — it certifies no
 * astrological accuracy (bazi.ts stays a placeholder/RED).
 */
import { describe, it, expect } from 'vitest'
import {
  products,
  filterByWorld,
  PRODUCT_WORLDS,
  PERSONALIZATION_LEVELS,
  DESIGN_FAMILIES,
  type Product,
  type ProductWorld,
} from '../../src/lib/catalog'

const WORLD_SET = new Set<string>(PRODUCT_WORLDS)
const LEVEL_SET = new Set<string>(PERSONALIZATION_LEVELS)
const FAMILY_SET = new Set<string>(DESIGN_FAMILIES)

// ── AT-013-1 — every product carries the four additive V2 enum fields ────────

describe('REQ-013 / AT-013-1 — every product carries the V2 dimensions', () => {
  it('annotates a non-empty catalog', () => {
    expect(products.length).toBeGreaterThan(0)
  })

  for (const p of products) {
    it(`product #${p.id} (${p.title}) carries all four V2 fields`, () => {
      expect(WORLD_SET.has(p.product_world)).toBe(true)
      expect(LEVEL_SET.has(p.personalization_level)).toBe(true)
      expect(typeof p.use_case).toBe('string')
      expect(p.use_case.length).toBeGreaterThan(0)
      expect(FAMILY_SET.has(p.design_family)).toBe(true)
    })
  }
})

// ── AT-013-1 — existing fields are unchanged (additive, not destructive) ──────
// Snapshot of the legacy shape, captured field-by-field from the frozen source.
// If a later edit silently drops/renames an existing field this fails.

const EXISTING_FIELDS: (keyof Product)[] = [
  'id',
  'category',
  'title',
  'price',
  'rating',
  'reviews',
  'sold',
  'bullets',
  'poster',
]

describe('REQ-013 / AT-013-1 — existing fields stay intact (additive only)', () => {
  for (const p of products) {
    it(`product #${p.id} keeps all required legacy fields`, () => {
      for (const f of EXISTING_FIELDS) {
        expect(p[f]).not.toBeUndefined()
      }
      expect(typeof p.id).toBe('number')
      expect(typeof p.category).toBe('string')
      expect(typeof p.title).toBe('string')
      expect(typeof p.price).toBe('number')
      expect(typeof p.rating).toBe('number')
      expect(typeof p.reviews).toBe('number')
      expect(typeof p.sold).toBe('number')
      expect(Array.isArray(p.bullets)).toBe(true)
      expect(p.poster).toBeTruthy()
    })
  }

  // Optional legacy fields keep their exact type when present (not coerced away).
  it('optional legacy fields (anchor/personalizable/image/usage) keep their types', () => {
    for (const p of products) {
      if (p.anchor !== undefined) expect(typeof p.anchor).toBe('number')
      if (p.personalizable !== undefined) expect(typeof p.personalizable).toBe('boolean')
      if (p.image !== undefined) expect(typeof p.image).toBe('string')
      if (p.usage !== undefined) expect(typeof p.usage).toBe('string')
    }
  })

  // The non-personalizable SKUs that already shipped (fire horse + TCM lehr-
  // poster) keep personalizable:false — a load-bearing legacy invariant.
  it('keeps the known non-personalizable SKUs (8, 11, 12, 13, 14) as personalizable:false', () => {
    for (const id of [8, 11, 12, 13, 14]) {
      const p = products.find((x) => x.id === id)
      expect(p).toBeDefined()
      expect(p!.personalizable).toBe(false)
    }
  })
})

// ── AT-013-2 — enum discipline: no value outside the allowed sets ─────────────

describe('REQ-013 / AT-013-2 — enum discipline over all products', () => {
  it('no product_world outside {bazi,tcm,wuxing,mixed}', () => {
    const bad = products.filter((p) => !WORLD_SET.has(p.product_world))
    expect(bad.map((p) => `${p.id}:${p.product_world}`)).toEqual([])
  })
  it('no personalization_level outside {single,couple,yearly,none}', () => {
    const bad = products.filter((p) => !LEVEL_SET.has(p.personalization_level))
    expect(bad.map((p) => `${p.id}:${p.personalization_level}`)).toEqual([])
  })
  it('no design_family outside {minimal,japandi,wabi_sabi,classic_ink}', () => {
    const bad = products.filter((p) => !FAMILY_SET.has(p.design_family))
    expect(bad.map((p) => `${p.id}:${p.design_family}`)).toEqual([])
  })
})

// ── AT-013-3 — filterByWorld is total + deterministic, over product_world ─────

describe('REQ-013 / AT-013-3 — filterByWorld is total + deterministic', () => {
  it('is total: returns an array for every declared world (never throws)', () => {
    for (const w of PRODUCT_WORLDS) {
      expect(() => filterByWorld(products, w)).not.toThrow()
      expect(Array.isArray(filterByWorld(products, w))).toBe(true)
    }
  })

  it('is total for an unknown world: returns [] rather than throwing', () => {
    // Cast through unknown — filterByWorld must be defensive at the boundary.
    const out = filterByWorld(products, 'not-a-world' as unknown as ProductWorld)
    expect(out).toEqual([])
  })

  it('filters strictly over product_world (not the free-text category field)', () => {
    for (const w of PRODUCT_WORLDS) {
      for (const p of filterByWorld(products, w)) {
        expect(p.product_world).toBe(w)
      }
    }
  })

  it('is deterministic: two calls return an identical id sequence', () => {
    for (const w of PRODUCT_WORLDS) {
      const a = filterByWorld(products, w).map((p) => p.id)
      const b = filterByWorld(products, w).map((p) => p.id)
      expect(a).toEqual(b)
    }
  })

  it('every world that has stock returns ≥1 product (MVP worlds populated)', () => {
    // At least bazi, tcm and wuxing must be populated for the MVP collections.
    for (const w of ['bazi', 'tcm', 'wuxing'] as ProductWorld[]) {
      expect(filterByWorld(products, w).length).toBeGreaterThanOrEqual(1)
    }
  })
})

// ── AT-013-4 — annotation invents no prices/reviews ──────────────────────────
// The four V2 fields are pure metadata; they must not have moved any price or
// review number. We pin the known stock values from the frozen catalog.

describe('REQ-013 / AT-013-4 — annotation invents no prices/reviews (OQ-002)', () => {
  const KNOWN: Record<number, { price: number; reviews: number; sold: number }> = {
    1: { price: 49, reviews: 318, sold: 2140 },
    2: { price: 69, reviews: 196, sold: 870 },
    3: { price: 45, reviews: 241, sold: 1320 },
    4: { price: 39, reviews: 158, sold: 990 },
    5: { price: 52, reviews: 134, sold: 640 },
    6: { price: 42, reviews: 205, sold: 1510 },
    7: { price: 49, reviews: 142, sold: 760 },
    8: { price: 65, reviews: 88, sold: 210 },
    11: { price: 39, reviews: 0, sold: 0 },
    12: { price: 49, reviews: 0, sold: 0 },
    13: { price: 45, reviews: 0, sold: 0 },
    14: { price: 45, reviews: 0, sold: 0 },
  }

  for (const [idStr, expected] of Object.entries(KNOWN)) {
    const id = Number(idStr)
    it(`product #${id} keeps its frozen price/reviews/sold`, () => {
      const p = products.find((x) => x.id === id)
      expect(p).toBeDefined()
      expect(p!.price).toBe(expected.price)
      expect(p!.reviews).toBe(expected.reviews)
      expect(p!.sold).toBe(expected.sold)
    })
  }
})
