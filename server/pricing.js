// SizhuAtelier — server-owned AUTHORITATIVE price + shipping source (ADR-001).
//
// The checkout route MUST derive `unit_amount` and shipping from THIS module and
// IGNORE the client-supplied `unitAmount` / `shippingCents`. A stable identity
// (`productId` + `variantId`) maps each cart line to its authoritative price so a
// tampered payload cannot buy at 1 cent (REQ-001) or ship for free (REQ-002).
//
// ── PLACEHOLDER PRICES (OQ-002) ──────────────────────────────────────────────
// These mirror the current client display values 1:1 (single source of truth,
// ADR-001 pt.4) and are deliberately the *placeholder* prototype prices:
//   - catalog posters  → `src/lib/catalog.ts` product `price`
//   - size deltas      → `src/lib/bazi.ts`     `sizes[].delta`
//   - product types    → `src/pages/Personalize.tsx` `PRODUCT_TYPES[].basePrice`
//   - PDF add-on       → `src/pages/Personalize.tsx` `PDF_ADDON_PRICE`
//   - shipping rule    → `src/store/ShopStore.tsx` (FREE_SHIP_THRESHOLD = 80 €)
// The operator replaces these with real prices later; the Client display values
// must keep matching this table (AT-001-4 / AT-002-4 parity tests).

// Identity prefixes — the client tags every cart line with one of these so the
// server can resolve the base price without trusting a free-text title.
export const POSTER_PRODUCT_PREFIX = 'poster:' // catalog.ts products, e.g. "poster:1"
export const PTYPE_PRODUCT_PREFIX = 'ptype:' //  Personalize types, e.g. "ptype:couple"
export const BUNDLE_PRODUCT_PREFIX = 'bundle:' // catalog.ts bundles, e.g. "bundle:b1"
export const ADDON_PRODUCT_PREFIX = 'addon:' //   catalog.ts add-ons, e.g. "addon:a1"
export const DIGITAL_PRODUCT_PREFIX = 'digital:' // catalog.ts digitalProduct

// Catalog poster base prices in EUR (mirror of catalog.ts `price`, keyed by id).
const POSTER_BASE_EUR = {
  1: 49, 2: 69, 3: 45, 4: 39, 5: 52, 6: 42, 7: 49, 8: 65,
  11: 39, 12: 49, 13: 45, 14: 45,
}

// Personalize product-type base prices in EUR (mirror of PRODUCT_TYPES).
const PTYPE_BASE_EUR = {
  bazi: 49,
  birthchart: 49,
  couple: 69,
  digital: 39,
  bundle: 79,
}
// Which product types are physical posters (carry size/pdf axes) vs digital-only.
const PTYPE_IS_POSTER = { bazi: true, birthchart: true, couple: true, digital: false, bundle: true }
// Bundles already include the PDF → no separate add-on is priced for them.
const PTYPE_PDF_INCLUDED = { bazi: false, birthchart: false, couple: false, digital: true, bundle: true }

// Size deltas in EUR (mirror of bazi.ts `sizes`).
const SIZE_DELTA_EUR = { A3: -10, A2: 0, A1: 20 }

const PDF_ADDON_EUR = 30 // Personalize.tsx PDF_ADDON_PRICE

// Bundle prices in EUR (mirror of catalog.ts `bundles` + digitalBundle).
const BUNDLE_BASE_EUR = { b1: 129, b2: 119, 'b-digital': 79 }
// Add-on prices in EUR (mirror of catalog.ts `addons`).
const ADDON_BASE_EUR = { a1: 9, a2: 6, a3: 7, a4: 5 }
// Standalone digital PDF product (mirror of catalog.ts `digitalProduct`).
const DIGITAL_BASE_EUR = { 'digital-bazi': 39 }

const FREE_SHIP_THRESHOLD_CENTS = 8000 // 80 € (tokens.ts FREE_SHIP_THRESHOLD)
const FLAT_SHIP_CENTS = 490 //            4.90 € (ShopStore.tsx)

// Parse a `variantId` like "size=A2;frame=#B98A5E;pdf=1" into a plain object.
// Frame is identity-only (does not affect price); size + pdf are priced axes.
function parseVariant(variantId) {
  const out = {}
  for (const part of String(variantId || '').split(';')) {
    const i = part.indexOf('=')
    if (i > -1) out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

// Resolve the authoritative price for one cart line, in integer cents.
// Returns `null` for any unknown product, unknown size, or otherwise unresolvable
// variant — the route maps a null to a 4xx and NEVER calls Stripe (REQ-001 AK-3).
export function priceLineItemCents(productId, variantId) {
  const id = String(productId || '')
  const v = parseVariant(variantId)

  // ── catalog posters ──
  // Personalizable posters carry a `size` axis (delta applies). Non-personalizable
  // posters (Fire Horse, TCM lehrposter) carry no size → base price only.
  if (id.startsWith(POSTER_PRODUCT_PREFIX)) {
    const numId = Number(id.slice(POSTER_PRODUCT_PREFIX.length))
    const baseEur = POSTER_BASE_EUR[numId]
    if (baseEur === undefined) return null
    let totalEur = baseEur
    if (v.size !== undefined && v.size !== '') {
      const delta = sizeDeltaEur(v.size)
      if (delta === null) return null
      totalEur += delta
    }
    return Math.round(totalEur * 100)
  }

  // ── Personalize product types ──
  if (id.startsWith(PTYPE_PRODUCT_PREFIX)) {
    const typeId = id.slice(PTYPE_PRODUCT_PREFIX.length)
    const baseEur = PTYPE_BASE_EUR[typeId]
    if (baseEur === undefined) return null
    let totalEur = baseEur
    if (PTYPE_IS_POSTER[typeId]) {
      const delta = sizeDeltaEur(v.size)
      if (delta === null) return null
      totalEur += delta
      // PDF add-on is only priced for poster types that do not already include it.
      if (!PTYPE_PDF_INCLUDED[typeId] && v.pdf === '1') totalEur += PDF_ADDON_EUR
    }
    return Math.round(totalEur * 100)
  }

  // ── bundles ──
  if (id.startsWith(BUNDLE_PRODUCT_PREFIX)) {
    const baseEur = BUNDLE_BASE_EUR[id.slice(BUNDLE_PRODUCT_PREFIX.length)]
    return baseEur === undefined ? null : Math.round(baseEur * 100)
  }

  // ── add-ons ──
  if (id.startsWith(ADDON_PRODUCT_PREFIX)) {
    const baseEur = ADDON_BASE_EUR[id.slice(ADDON_PRODUCT_PREFIX.length)]
    return baseEur === undefined ? null : Math.round(baseEur * 100)
  }

  // ── standalone digital PDF ──
  if (id.startsWith(DIGITAL_PRODUCT_PREFIX)) {
    const baseEur = DIGITAL_BASE_EUR[id.slice(DIGITAL_PRODUCT_PREFIX.length)]
    return baseEur === undefined ? null : Math.round(baseEur * 100)
  }

  return null
}

// A poster line REQUIRES a known size. A digital/non-poster line passes `size`
// undefined; callers only invoke this for poster paths, so an absent size on a
// poster is an unknown variant (null). For the size to be valid it must be in
// the table.
function sizeDeltaEur(size) {
  if (size === undefined || size === '') return null
  const d = SIZE_DELTA_EUR[size]
  return d === undefined ? null : d
}

// Server-side shipping in integer cents, replicating the ShopStore rule exactly
// (REQ-002 / AT-002-4). US & UK ship free; EU and "other" get free shipping at or
// above the 80 € threshold, otherwise a flat 4.90 €. An empty cart ships nothing.
export function computeShippingCents(region, subtotalCents) {
  const r = String(region || '').toLowerCase()
  if (r === 'us' || r === 'uk') return 0
  if (!Number.isFinite(subtotalCents) || subtotalCents <= 0) return 0
  return subtotalCents >= FREE_SHIP_THRESHOLD_CENTS ? 0 : FLAT_SHIP_CENTS
}

// Map a CDN/host country header to a shipping region (mirror of /api/region and
// the EU country set). Exposed so the checkout route shares one source of truth.
const EU_COUNTRIES = new Set(['DE', 'AT', 'FR', 'NL', 'BE', 'LU', 'IT', 'ES', 'PT', 'IE', 'FI', 'EE', 'LV', 'LT', 'SK', 'SI', 'GR', 'CY', 'MT', 'HR', 'BG', 'RO', 'HU', 'PL', 'CZ', 'DK', 'SE'])
export function regionFromCountry(country, defaultRegion = 'eu') {
  const c = String(country || '').toUpperCase()
  if (c === 'US') return 'us'
  if (c === 'GB') return 'uk'
  if (EU_COUNTRIES.has(c)) return 'eu'
  if (c) return 'other'
  return String(defaultRegion || 'eu').toLowerCase()
}
