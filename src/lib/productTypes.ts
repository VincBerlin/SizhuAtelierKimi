// Personalize product-type catalogue (current MVP only — no Saju/Junishi).
//
// This is the SINGLE CLIENT SOURCE for product-type base prices and the PDF
// add-on price. It is a pure data module (no React) so it can be consumed by
// both the Personalize page (display) and the server-parity tests, which assert
// that `server/pricing.js` mirrors these values 1:1 (ADR-001 pt.4). Any drift
// here that is not mirrored into the server table must turn the parity test RED.

export type ProductTypeId = 'bazi' | 'birthchart' | 'couple' | 'digital' | 'bundle'

export interface PTDef {
  id: ProductTypeId
  basePrice: number
  couple: boolean
  /** physical poster → has frame/palette/size; false = digital-only */
  poster: boolean
  /** PDF is already included (bundle) → no separate add-on */
  pdfIncluded: boolean
}

export const PRODUCT_TYPES: PTDef[] = [
  { id: 'bazi', basePrice: 49, couple: false, poster: true, pdfIncluded: false },
  { id: 'birthchart', basePrice: 49, couple: false, poster: true, pdfIncluded: false },
  { id: 'couple', basePrice: 69, couple: true, poster: true, pdfIncluded: false },
  { id: 'digital', basePrice: 39, couple: false, poster: false, pdfIncluded: true },
  { id: 'bundle', basePrice: 79, couple: false, poster: true, pdfIncluded: true },
]

export const PDF_ADDON_PRICE = 30

// ── Personalization gating (REQ-007 / REQ-025) ────────────────────────────────
//
// SINGLE source of truth for "may this product be personalized?". T-104 (PDP
// gating) and T-105 (cart gating) MUST both read this so the Fire-Horse FM-04
// trap can never re-appear in one place and not the other.
//
// Structural typing against the catalog Product without importing it (avoids a
// cycle: catalog.ts imports from this module). We only read the fields we gate
// on, so any object carrying them — a real Product or a test fixture — works.
export interface PersonalizationFacts {
  id: number
  /** Curated browse axis. Fire Horse lives in the 'mixed' world today. */
  product_world: string
  /** false = explicit opt-out (Fire Horse, TCM/Wuxing). undefined = default. */
  personalizable?: boolean
  /** Marketing tier — NEVER a personalization gate (FM-04: 'yearly' ⇏ birth data). */
  personalization_level?: string
}

/** Catalog ids that ARE the Fire Horse limited edition (REQ-007 / FM-04). A
 *  declared list, not id/title sniffing scattered across the UI — extend here
 *  when a new yearly edition ships. */
export const FIRE_HORSE_IDS: readonly number[] = [8] as const

/** True iff the product is a Fire Horse yearly edition (non-personalizable). */
export function isFireHorse(p: PersonalizationFacts): boolean {
  return FIRE_HORSE_IDS.includes(p.id)
}

/**
 * Whether a product may be personalized (REQ-007 / REQ-025).
 *
 * Gates ONLY on the explicit `personalizable` flag: `false` opts out, anything
 * else (incl. `undefined`) is the personalizable default. It deliberately
 * IGNORES `personalization_level` — the FM-04 trap is reading `'yearly'` (the
 * Fire Horse marketing tier) as "personalizable" and showing birth-data UI.
 */
export function isPersonalizable(p: PersonalizationFacts): boolean {
  return p.personalizable !== false
}

/** Coarse product kind for gating/branching — a clean discriminator instead of
 *  id/title sniffing. Fire Horse is detected by id (it lives in the 'mixed'
 *  world), then the curated worlds, else 'other'. */
export type ProductKind = 'bazi' | 'tcm' | 'wuxing' | 'fire-horse' | 'other'

export function productKind(p: PersonalizationFacts): ProductKind {
  if (isFireHorse(p)) return 'fire-horse'
  if (p.product_world === 'bazi') return 'bazi'
  if (p.product_world === 'tcm') return 'tcm'
  if (p.product_world === 'wuxing') return 'wuxing'
  return 'other'
}
