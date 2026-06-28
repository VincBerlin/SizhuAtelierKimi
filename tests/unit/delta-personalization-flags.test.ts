/**
 * DELTA T-102 — Catalog personalization flags: ONLY BaZi is personalizable
 * (REQ-007 / REQ-025). `[SHIPPED-SCAN]` / pure.
 *
 * Acceptance contract: AT-007-5 from docs/tests/desenio-acceptance-design.md:
 *   every product with product_world ∈ {tcm,wuxing} OR Fire Horse has
 *   personalizable === false; every BaZi product is personalizable.
 *
 * Beat-0 Gegenthese / FM-04 (THE load-bearing trap): Fire Horse carries
 * `personalization_level: 'yearly'`. A naive reader could treat any non-'none'
 * level as "personalizable" and show birth-data UI on the Fire Horse PDP
 * (REQ-007 violation). The fix is a SINGLE shared predicate that gates on the
 * explicit `personalizable` flag (default true, `false` opts out) and NEVER
 * infers personalizability from `personalization_level`. These tests pin that
 * predicate so T-104 (PDP gating) and T-105 (cart gating) build on one source.
 *
 * RED-line discipline: data/flag conformance only — certifies no astrological
 * accuracy (bazi.ts stays a placeholder, RED for ACCURACY).
 */
import { describe, it, expect } from 'vitest'
import { products, type Product } from '../../src/lib/catalog'
import {
  isPersonalizable,
  isFireHorse,
  productKind,
  FIRE_HORSE_IDS,
} from '../../src/lib/productTypes'

const NON_PERSONALIZABLE_WORLDS = new Set(['tcm', 'wuxing'])

// ── AT-007-5 — only BaZi is personalizable; tcm/wuxing/fire-horse are not ─────

describe('REQ-007 / AT-007-5 — only BaZi products are personalizable', () => {
  it('every tcm/wuxing product has personalizable === false', () => {
    const offenders = products
      .filter((p) => NON_PERSONALIZABLE_WORLDS.has(p.product_world))
      .filter((p) => p.personalizable !== false)
      .map((p) => `${p.id}:${p.product_world}`)
    expect(offenders, `tcm/wuxing products must be personalizable:false`).toEqual([])
  })

  it('every Fire Horse product has personalizable === false', () => {
    const offenders = products
      .filter((p) => isFireHorse(p))
      .filter((p) => p.personalizable !== false)
      .map((p) => `${p.id}`)
    expect(offenders, `Fire Horse must be personalizable:false`).toEqual([])
  })

  it('every BaZi product is personalizable (personalizable !== false)', () => {
    const baziProducts = products.filter((p) => p.product_world === 'bazi')
    expect(baziProducts.length).toBeGreaterThan(0)
    for (const p of baziProducts) {
      expect(isPersonalizable(p), `BaZi product #${p.id} must be personalizable`).toBe(true)
    }
  })
})

// ── FM-04 — `personalization_level:'yearly'` must NOT read as personalizable ──

describe('REQ-007 / FM-04 — yearly Fire Horse is NOT personalizable', () => {
  it('Fire Horse is present, has personalization_level "yearly" AND is non-personalizable', () => {
    const fireHorses = products.filter((p) => isFireHorse(p))
    expect(fireHorses.length).toBeGreaterThanOrEqual(1)
    for (const fh of fireHorses) {
      // the trap input is present...
      expect(fh.personalization_level).toBe('yearly')
      // ...and the predicate still reports NOT personalizable.
      expect(isPersonalizable(fh)).toBe(false)
    }
  })

  it('isPersonalizable ignores personalization_level entirely (gates on the flag)', () => {
    // A synthetic product with a non-none level but the explicit opt-out flag
    // must still be non-personalizable — the predicate gates on `personalizable`,
    // never on the level.
    const trap: Product = {
      ...products[0],
      id: 9001,
      personalization_level: 'yearly',
      personalizable: false,
    }
    expect(isPersonalizable(trap)).toBe(false)

    // ...and a product with level 'none' but no explicit flag stays the default
    // (personalizable) — proving the level is not the gate in either direction.
    const levelNoneNoFlag: Product = {
      ...products[0],
      id: 9002,
      personalization_level: 'none',
      personalizable: undefined,
    }
    expect(isPersonalizable(levelNoneNoFlag)).toBe(true)
  })
})

// ── productKind discriminator — a clean type, not id/title sniffing ──────────

describe('REQ-007 — productKind classifies every shipped product', () => {
  it('classifies bazi/tcm/wuxing/fire-horse and never throws', () => {
    for (const p of products) {
      const kind = productKind(p)
      expect(['bazi', 'tcm', 'wuxing', 'fire-horse', 'other']).toContain(kind)
    }
  })

  it('every fire-horse kind is non-personalizable and vice-versa for the flag', () => {
    for (const p of products) {
      if (productKind(p) === 'fire-horse') {
        expect(isPersonalizable(p)).toBe(false)
      }
    }
  })

  it('FIRE_HORSE_IDS is non-empty and every listed id resolves to a Fire Horse', () => {
    expect(FIRE_HORSE_IDS.length).toBeGreaterThanOrEqual(1)
    for (const id of FIRE_HORSE_IDS) {
      const p = products.find((x) => x.id === id)
      expect(p, `FIRE_HORSE_IDS lists id ${id} that has no product`).toBeDefined()
      expect(isFireHorse(p!)).toBe(true)
    }
  })
})
