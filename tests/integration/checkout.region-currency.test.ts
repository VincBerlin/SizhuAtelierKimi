/**
 * REQ-016 (T-502) — Server-authoritative REGION → CURRENCY + shipping.
 *
 * [INTEGRATION-FAKE] — the highest evidence class reachable in this run:
 *   - The REAL Express `/api/checkout` route runs (real route code, real
 *     Stripe-line-item build via `server/index.js` `createApp`); ONLY the
 *     external Stripe SDK is stubbed (no live key, no live session).
 *   - RL-STRIPE stays RED (BLK-STRIPE-REAL): a real Stripe session against live
 *     keys is intentionally out of this run.
 *   - VR-OQ002-PRICES: the currency NUMBERS are PLACEHOLDER prototype amounts
 *     (OQ-002, operator-owned, launch-blocking). These tests prove the
 *     MECHANISM — region-derived currency + server-authoritative shipping — and
 *     deliberately NOT the final live prices.
 *
 * Written BEFORE the T-502 fix and MUST be RED against the pre-fix route, which
 * stamps a SINGLE hardcoded currency ('eur') on every region (AT-016-7 violation,
 * FM-06) and has no `currencyForRegion` / `REGION_CURRENCY` mapping in
 * region.ts / pricing.js / catalog.ts — proving these tests catch the
 * "one currency for the whole world" hole.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
// The server exposes `createApp({ stripe })` so the route can be driven with a
// stubbed Stripe (ADR-001 / REQ-015 AK-4: no real key in tests).
import { createApp } from '../../server/index.js'
// Server-owned AUTHORITATIVE region→currency + shipping source (T-502).
import {
  computeShippingCents,
  currencyForRegion as serverCurrencyForRegion,
  regionFromCountry,
  REGION_CURRENCY as SERVER_REGION_CURRENCY,
  POSTER_PRODUCT_PREFIX,
} from '../../server/pricing.js'
// Client-side declarative mapping (display source of truth) + its catalog re-export.
// AT-016-7 scans these SHIPPED modules — the same instances the app renders.
import {
  REGION_CURRENCY as CLIENT_REGION_CURRENCY,
  currencyForRegion as clientCurrencyForRegion,
} from '../../src/lib/region'
import { REGION_CURRENCY as CATALOG_REGION_CURRENCY } from '../../src/lib/catalog'
// Threshold lives in ONE place; never hardcode the cents here (parity, no literals).
import { FREE_SHIP_THRESHOLD } from '../../src/lib/tokens'

const eurToCents = (eur: number) => Math.round(eur * 100)

// ── Stripe stub ─────────────────────────────────────────────────────────────
// Captures exactly what the real route passes to `checkout.sessions.create`,
// so we assert on the line items (and their currency) the route actually built.
function makeStripeStub() {
  const create = vi.fn(async (params: any) => ({
    id: 'cs_test_stub_123',
    url: 'https://stripe.test/checkout/cs_test_stub_123',
    _params: params,
  }))
  const customersCreate = vi.fn(async () => ({ id: 'cus_test_stub' }))
  return {
    create,
    customersCreate,
    stripe: {
      checkout: { sessions: { create } },
      customers: { create: customersCreate },
    },
  }
}

// A valid poster line: catalog product #1 (49 €), size A2 (delta 0) → 4900 cents.
const VALID_POSTER = {
  productId: `${POSTER_PRODUCT_PREFIX}1`,
  variantId: 'size=A2;frame=#B98A5E',
  qty: 1,
}

let stub: ReturnType<typeof makeStripeStub>
let app: any

beforeEach(() => {
  stub = makeStripeStub()
  app = createApp({ stripe: stub.stripe })
})

function lineItemsFromLastCall() {
  const params = stub.create.mock.calls.at(-1)?.[0]
  return params?.line_items ?? []
}
function shippingLine() {
  return lineItemsFromLastCall().find(
    (li: any) => li.price_data?.product_data?.name === 'Shipping',
  )
}
function allCurrencies() {
  return lineItemsFromLastCall().map((li: any) => li.price_data?.currency)
}

describe('[SHIPPED-SCAN] REQ-016 AT-016-7 — declarative region→currency mapping (us→USD, uk→GBP, eu→EUR)', () => {
  it('region.ts exposes a DECLARATIVE map us→USD / uk→GBP / eu→EUR (not one currency for all)', () => {
    expect(CLIENT_REGION_CURRENCY).toMatchObject({ us: 'USD', uk: 'GBP', eu: 'EUR' })
    expect(clientCurrencyForRegion('us')).toBe('USD')
    expect(clientCurrencyForRegion('uk')).toBe('GBP')
    expect(clientCurrencyForRegion('eu')).toBe('EUR')
    // The three primary markets settle in three distinct currencies — proof that
    // the mapping is genuinely per-region, not a hardcoded "€" over all regions.
    const distinct = new Set([
      clientCurrencyForRegion('us'),
      clientCurrencyForRegion('uk'),
      clientCurrencyForRegion('eu'),
    ])
    expect(distinct.size).toBe(3)
  })

  it('catalog.ts re-exports the SAME declarative mapping (one currency source, no divergent literal)', () => {
    // Same object reference: catalog reads currency from the single region source,
    // so a second hardcoded "€" table cannot drift away from it.
    expect(CATALOG_REGION_CURRENCY).toBe(CLIENT_REGION_CURRENCY)
  })

  it('server/pricing.js mirrors the client mapping exactly — drift is RED, server is authoritative', () => {
    expect(serverCurrencyForRegion('us')).toBe('USD')
    expect(serverCurrencyForRegion('uk')).toBe('GBP')
    expect(serverCurrencyForRegion('eu')).toBe('EUR')
    for (const region of ['us', 'uk', 'eu', 'other'] as const) {
      expect(serverCurrencyForRegion(region)).toBe(clientCurrencyForRegion(region))
      expect(SERVER_REGION_CURRENCY[region]).toBe(CLIENT_REGION_CURRENCY[region])
    }
  })

  it('unknown region falls back to EUR (primary settlement currency), never undefined', () => {
    expect(serverCurrencyForRegion('zz' as any)).toBe('EUR')
    expect(serverCurrencyForRegion('' as any)).toBe('EUR')
  })
})

describe('[INTEGRATION-FAKE] REQ-016 AT-016-1..4 — checkout currency follows region; client currency/shipping ignored', () => {
  it('AT-016-1: cf-ipcountry US, client shippingCents:9999 + client currency:aud → free shipping, all lines USD, client ignored', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('cf-ipcountry', 'US')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }], shippingCents: 9999, currency: 'aud' })

    expect(res.status).toBe(200)
    expect(shippingLine()).toBeUndefined() // US ships free — client 9999 ignored
    expect(new Set(allCurrencies())).toEqual(new Set(['usd'])) // region currency, lowercased for Stripe
    expect(allCurrencies()).not.toContain('aud') // client currency ignored
  })

  it('AT-016-2: cf-ipcountry GB → free shipping, all lines GBP', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('cf-ipcountry', 'GB')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }], shippingCents: 9999, currency: 'aud' })

    expect(res.status).toBe(200)
    expect(shippingLine()).toBeUndefined()
    expect(new Set(allCurrencies())).toEqual(new Set(['gbp']))
  })

  it('AT-016-3: cf-ipcountry DE, subtotal < threshold, shippingCents:0 → server shipping 490, all lines EUR', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('cf-ipcountry', 'DE')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }], shippingCents: 0, currency: 'aud' })

    expect(res.status).toBe(200)
    const ship = shippingLine()
    expect(ship).toBeTruthy()
    expect(ship.price_data.unit_amount).toBe(490) // placeholder flat rate, client 0 ignored
    expect(ship.price_data.currency).toBe('eur')
    expect(new Set(allCurrencies())).toEqual(new Set(['eur'])) // product + shipping both EUR
  })

  it('AT-016-4: cf-ipcountry DE, subtotal ≥ FREE_SHIP_THRESHOLD, shippingCents:9999 → free shipping, all lines EUR', async () => {
    // size A1 (+20) on product #1 (49) = 69 € → qty 2 = 138 € ≥ 80 € threshold.
    const res = await request(app)
      .post('/api/checkout')
      .set('cf-ipcountry', 'DE')
      .send({
        items: [{ productId: `${POSTER_PRODUCT_PREFIX}1`, variantId: 'size=A1', qty: 2, unitAmount: 9999 }],
        shippingCents: 9999,
        currency: 'aud',
      })

    expect(res.status).toBe(200)
    expect(shippingLine()).toBeUndefined() // free at/over threshold, client 9999 ignored
    expect(new Set(allCurrencies())).toEqual(new Set(['eur']))
  })
})

describe('[INTEGRATION-FAKE] REQ-016 FM-06 — /api/region (display) and regionFromCountry (charge) share ONE country→region source', () => {
  // Guards the failure mode one layer ABOVE the currency map: the country→region
  // classification. The display route (/api/region → what the shopper SEES) and
  // the charge route (/api/checkout → what the shopper is CHARGED) must derive the
  // region from the SAME function. If a future edit re-inlines /api/region with a
  // diverging country set, these turn RED instead of silently showing one currency
  // while charging another. Sample spans US, UK, the EU set boundary, a non-EU
  // "other", and the empty/default case.
  const DEFAULT_REGION = process.env.DEFAULT_REGION || 'eu'
  const SAMPLE = ['US', 'GB', 'DE', 'FR', 'ES', 'NL', 'IT', 'PL', 'SE', 'IE', 'HR', 'CY', 'MT', 'CH', 'JP', 'AU', 'BR', '']

  async function routeRegion(country: string) {
    const r = request(app).get('/api/region')
    if (country) r.set('cf-ipcountry', country)
    const res = await r
    expect(res.status).toBe(200)
    return res.body.region
  }

  it('AT-016-8: /api/region returns regionFromCountry(country) for EVERY sampled country (display==charge region)', async () => {
    for (const country of SAMPLE) {
      expect(await routeRegion(country)).toBe(regionFromCountry(country, DEFAULT_REGION))
    }
  })

  it('AT-016-9: every EU-set member resolves to eu on BOTH route and function (no one-sided drift)', async () => {
    for (const country of ['DE', 'PL', 'SE', 'HR', 'CY', 'MT']) {
      expect(await routeRegion(country)).toBe('eu')
      expect(regionFromCountry(country, DEFAULT_REGION)).toBe('eu')
    }
  })

  it('AT-016-10: US→us, GB→uk, non-EU→other, empty→default — identically on route and function', async () => {
    const cases: Array<[string, string]> = [['US', 'us'], ['GB', 'uk'], ['CH', 'other'], ['', DEFAULT_REGION.toLowerCase()]]
    for (const [country, expected] of cases) {
      expect(await routeRegion(country)).toBe(expected)
      expect(regionFromCountry(country, DEFAULT_REGION)).toBe(expected)
    }
  })
})

describe('[INTEGRATION-FAKE] REQ-016 AT-016-5 — computeShippingCents: us/uk free; eu/other threshold (no literals)', () => {
  it('us/uk ship free regardless of subtotal; eu/other free ≥ FREE_SHIP_THRESHOLD else 490', () => {
    const thresholdCents = eurToCents(FREE_SHIP_THRESHOLD) // derived — never a literal
    // US/UK: free independent of subtotal (region rule, not threshold).
    expect(computeShippingCents('us', thresholdCents - 100)).toBe(0)
    expect(computeShippingCents('us', thresholdCents + 100)).toBe(0)
    expect(computeShippingCents('uk', thresholdCents - 100)).toBe(0)
    expect(computeShippingCents('uk', thresholdCents + 100)).toBe(0)
    // EU + "other": flat 4.90 € (placeholder) below the threshold, free at/over it.
    expect(computeShippingCents('eu', thresholdCents - 1)).toBe(490)
    expect(computeShippingCents('eu', thresholdCents)).toBe(0)
    expect(computeShippingCents('other', 100)).toBe(490)
    expect(computeShippingCents('other', thresholdCents)).toBe(0)
  })
})
