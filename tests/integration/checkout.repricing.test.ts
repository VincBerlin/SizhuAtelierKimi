/**
 * REQ-001 / REQ-002 / REQ-003 / REQ-015 — Money-path integration tests.
 *
 * [INTEGRATION-FAKE] — the highest evidence class reachable in this run:
 *   - The REAL Express `/api/checkout` route runs (real route code, real
 *     Stripe-line-item build via `server/index.js` `createApp`).
 *   - ONLY the external Stripe SDK is stubbed (no real key, no real session).
 *   - A real Stripe session against live keys (BLK-STRIPE-REAL) stays out of run.
 *
 * These tests are written BEFORE the server fix and MUST be RED against the
 * current client-trusting route (server/index.js:202,215) — proving they
 * actually catch the 1-cent / free-shipping tampering hole (Vision §7.2,
 * acceptance-design AT-001/002/003/015, AT-015-6 "rot-ohne-Fix").
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
// The server must expose a `createApp({ stripe })` factory so the route can be
// driven with a stubbed Stripe (ADR-001 / REQ-015 AK-4: no real key in tests).
import { createApp } from '../../server/index.js'
// Server-owned authoritative price source (ADR-001 pt.2-4) + shipping rule.
import {
  priceLineItemCents,
  computeShippingCents,
  POSTER_PRODUCT_PREFIX,
  PTYPE_PRODUCT_PREFIX,
} from '../../server/pricing.js'
// ── REAL client price sources (ADR-001 pt.4 single-source-of-truth) ──────────
// The parity block below couples the server price table to the SAME data the
// client renders, so a price change in any of these that is NOT mirrored into
// server/pricing.js turns the parity test RED (no silent mischarge). NEVER
// hardcode the expected cents here — derive them from these imports.
import { products, bundles, digitalBundle, addons, digitalProduct } from '../../src/lib/catalog'
import { sizes } from '../../src/lib/bazi'
import { PRODUCT_TYPES, PDF_ADDON_PRICE } from '../../src/lib/productTypes'
import { FREE_SHIP_THRESHOLD } from '../../src/lib/tokens'
import {
  posterProductId,
  ptypeProductId,
  bundleProductId,
  addonProductId,
  digitalProductId,
  buildVariantId,
} from '../../src/lib/checkout'

// Client-side cents helper: the client displays whole-EUR prices, the server
// stores integer cents. Round the same way the server does (Math.round(eur*100)).
const eurToCents = (eur: number) => Math.round(eur * 100)

// ── Stripe stub ─────────────────────────────────────────────────────────────
// Captures exactly what the real route passes to `checkout.sessions.create`,
// so we can assert on the line items the route actually built. It NEVER mirrors
// the client value back — that would be the forbidden green-but-worthless test
// (acceptance-design REQ-001 Gegenthese).
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

// A valid poster line: catalog product #1 (price 49 €), size A2 (delta 0) →
// authoritative server price = 4900 cents. variantId carries the priced axes.
const VALID_POSTER = {
  productId: `${POSTER_PRODUCT_PREFIX}1`,
  variantId: 'size=A2;frame=#B98A5E',
  qty: 1,
}
const VALID_POSTER_PRICE = 4900

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
function nonShippingUnitAmounts() {
  return lineItemsFromLastCall()
    .filter((li: any) => li.price_data?.product_data?.name !== 'Shipping')
    .map((li: any) => li.price_data?.unit_amount)
}
function shippingLine() {
  return lineItemsFromLastCall().find(
    (li: any) => li.price_data?.product_data?.name === 'Shipping',
  )
}

describe('[INTEGRATION-FAKE] REQ-001 — server re-prices, client unitAmount ignored', () => {
  it('AT-001-1: unitAmount:1 (valid product/variant) → server price in Stripe line item, NOT 1', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }] })

    expect(res.status).toBe(200)
    expect(stub.create).toHaveBeenCalledTimes(1)
    const amounts = nonShippingUnitAmounts()
    expect(amounts).toContain(VALID_POSTER_PRICE)
    expect(amounts).not.toContain(1)
  })

  it('AT-001-2: tampered unitAmount {0, -5, 999999, missing} all re-priced to server price', async () => {
    for (const tampered of [0, -5, 999999, undefined]) {
      stub = makeStripeStub()
      app = createApp({ stripe: stub.stripe })
      const item: any = { ...VALID_POSTER }
      if (tampered !== undefined) item.unitAmount = tampered
      const res = await request(app)
        .post('/api/checkout')
        .send({ items: [item] })

      expect(res.status).toBe(200)
      expect(nonShippingUnitAmounts()).toEqual([VALID_POSTER_PRICE])
    }
  })

  it('AT-001-3: unknown productId/variantId → 4xx, Stripe NEVER called, no session url', async () => {
    const unknowns = [
      { productId: `${POSTER_PRODUCT_PREFIX}99999`, variantId: 'size=A2', qty: 1, unitAmount: 4900 },
      { productId: `${POSTER_PRODUCT_PREFIX}1`, variantId: 'size=ZZ', qty: 1, unitAmount: 4900 },
      { productId: 'totally-bogus', variantId: 'size=A2', qty: 1, unitAmount: 4900 },
    ]
    for (const bad of unknowns) {
      stub = makeStripeStub()
      app = createApp({ stripe: stub.stripe })
      const res = await request(app).post('/api/checkout').send({ items: [bad] })
      expect(res.status).toBeGreaterThanOrEqual(400)
      expect(res.status).toBeLessThan(500)
      expect(stub.create).not.toHaveBeenCalled()
      expect(res.body.url).toBeUndefined()
    }
  })

  it('AT-001-5: identical valid payload twice → identical line-item prices (deterministic)', async () => {
    const payload = { items: [{ ...VALID_POSTER, unitAmount: 1 }] }
    await request(app).post('/api/checkout').send(payload)
    const first = nonShippingUnitAmounts()
    stub = makeStripeStub()
    app = createApp({ stripe: stub.stripe })
    await request(app).post('/api/checkout').send(payload)
    const second = nonShippingUnitAmounts()
    expect(second).toEqual(first)
  })
})

describe('[INTEGRATION-FAKE] REQ-002 — server computes shipping, client shippingCents ignored', () => {
  it('AT-002-1: shippingCents:0, EU (DE), subtotal < 80 → server shipping 490 present', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .set('cf-ipcountry', 'DE')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }], shippingCents: 0 })

    expect(res.status).toBe(200)
    const ship = shippingLine()
    expect(ship).toBeTruthy()
    expect(ship.price_data.unit_amount).toBe(490)
  })

  it('AT-002-2: shippingCents:9999 (inflated) at subtotal ≥ 80 (EU) → free shipping, client ignored', async () => {
    // size A1 (+20) on product #1 (49) = 69 € → need ≥ 80, so qty 2 → subtotal 138 €.
    const res = await request(app)
      .post('/api/checkout')
      .set('cf-ipcountry', 'DE')
      .send({
        items: [{ productId: `${POSTER_PRODUCT_PREFIX}1`, variantId: 'size=A1', qty: 2, unitAmount: 9999 }],
        shippingCents: 9999,
      })

    expect(res.status).toBe(200)
    // No shipping line at all when free shipping is reached.
    expect(shippingLine()).toBeUndefined()
  })

  it('AT-002-3: region table — US free, GB free, EU<thr 490, other<thr 490', async () => {
    const cases: Array<[string, number | undefined]> = [
      ['US', undefined],
      ['GB', undefined],
      ['DE', 490],
      ['BR', 490], // "other"
    ]
    for (const [country, expected] of cases) {
      stub = makeStripeStub()
      app = createApp({ stripe: stub.stripe })
      await request(app)
        .post('/api/checkout')
        .set('cf-ipcountry', country)
        .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }], shippingCents: 0 })
      const ship = shippingLine()
      if (expected === undefined) expect(ship).toBeUndefined()
      else expect(ship.price_data.unit_amount).toBe(expected)
    }
  })
})

describe('[INTEGRATION-FAKE] REQ-003 — existing checkout invariants do not regress', () => {
  it('AT-003-1: couple cart > 480-char personalization round-trips losslessly (incl. adversarial chars)', async () => {
    // Build a couple personalization whose JSON exceeds the 480-char chunk size,
    // and which contains delimiter-colliding chars (·, ", \n, blank lines).
    const personalization: Record<string, string> = {
      productType: 'couple',
      name: 'A·"name"\n\nwith blank lines ' + 'x'.repeat(120),
      date: '1990-07-21',
      time: '12:00',
      place: 'München · "Quote" \n line',
      birthTimeUnknown: 'true',
      nameB: 'B partner ' + 'y'.repeat(120),
      dateB: '1988-03-09',
      timeB: '08:30',
      placeB: 'Paris\n· "Z" \n\n end',
      extra: 'z'.repeat(200),
    }
    const json = JSON.stringify(personalization)
    expect(json.length).toBeGreaterThan(480) // sanity: forces chunking

    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1, personalization }] })

    expect(res.status).toBe(200)
    const params = stub.create.mock.calls.at(-1)?.[0]
    const md = params.metadata
    // Reassemble exactly the way the webhook does (chunked numbered keys).
    const reassembled = readPersonalizationMetadata(md)
    expect(reassembled.line1).toEqual(personalization)
  })

  it('AT-003-3: qty clamping (0→1, 1000→99) and empty cart → 400', async () => {
    // qty 0 → clamped to 1
    await request(app)
      .post('/api/checkout')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1, qty: 0 }] })
    expect(lineItemsFromLastCall().find((li: any) => li.price_data?.product_data?.name !== 'Shipping').quantity).toBe(1)

    // qty 1000 → clamped to 99
    stub = makeStripeStub()
    app = createApp({ stripe: stub.stripe })
    await request(app)
      .post('/api/checkout')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1, qty: 1000 }] })
    expect(lineItemsFromLastCall().find((li: any) => li.price_data?.product_data?.name !== 'Shipping').quantity).toBe(99)

    // empty cart → 400
    stub = makeStripeStub()
    app = createApp({ stripe: stub.stripe })
    const empty = await request(app).post('/api/checkout').send({ items: [] })
    expect(empty.status).toBe(400)
  })

  it('AT-003-2: guest with email → customer_email and no customer', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ ...VALID_POSTER, unitAmount: 1 }], email: 'guest@example.com' })
    expect(res.status).toBe(200)
    const params = stub.create.mock.calls.at(-1)?.[0]
    expect(params.customer_email).toBe('guest@example.com')
    expect(params.customer).toBeUndefined()
  })
})

describe('[INTEGRATION-FAKE] REQ-015 — money-path safety guards', () => {
  it('AT-015-4: no real Stripe secret present in this test module', () => {
    // grep-guard: the test must not embed a real-looking live/test secret key.
    const src = require('node:fs').readFileSync(__filename, 'utf8') as string
    expect(/sk_live_[A-Za-z0-9]/.test(src)).toBe(false)
    expect(/sk_test_[A-Za-z0-9]{10}/.test(src)).toBe(false)
  })
})

describe('[UNIT] price/shipping source-of-truth PARITY (server == client, drift is RED)', () => {
  // ADR-001 pt.4: the server price MUST equal the client-displayed price for
  // EVERY product on EVERY priced axis. These assertions derive the expected
  // cents from the REAL client sources (catalog.ts / bazi.ts / productTypes.ts /
  // tokens.ts) via loops — no literals — so a client price change that is not
  // mirrored into server/pricing.js fails here instead of silently mischarging.

  it('AT-001-4: poster parity — every catalog product × size == catalog price + bazi size delta', () => {
    expect(products.length).toBeGreaterThan(0) // sanity: the loop actually runs
    for (const p of products) {
      const productId = posterProductId(p.id)

      // Base price (no size axis) always equals the catalog display price.
      expect(priceLineItemCents(productId, '')).toBe(eurToCents(p.price))

      // Personalizable posters carry a size axis → price = base + size delta for
      // every configurable size. Non-personalizable posters carry no size axis.
      if (p.personalizable !== false) {
        for (const s of sizes) {
          const variantId = buildVariantId({ size: s.id, frame: '#B98A5E' })
          expect(priceLineItemCents(productId, variantId)).toBe(
            eurToCents(p.price + s.delta),
          )
        }
      }
    }
  })

  it('AT-001-4: ptype parity — every product type × size (× pdf add-on) == client price formula', () => {
    expect(PRODUCT_TYPES.length).toBeGreaterThan(0)
    for (const def of PRODUCT_TYPES) {
      const productId = ptypeProductId(def.id)

      if (!def.poster) {
        // Digital-only type: no poster axes, price == basePrice exactly.
        expect(priceLineItemCents(productId, '')).toBe(eurToCents(def.basePrice))
        continue
      }

      for (const s of sizes) {
        // Poster type, no PDF add-on selected → base + size delta.
        const base = buildVariantId({ size: s.id })
        expect(priceLineItemCents(productId, base)).toBe(
          eurToCents(def.basePrice + s.delta),
        )

        // PDF add-on toggled. Only types where the PDF is NOT already included
        // get the surcharge; bundle/digital include it, so price is unchanged.
        const withPdf = buildVariantId({ size: s.id, pdf: true })
        const expectedPdf =
          def.basePrice + s.delta + (def.pdfIncluded ? 0 : PDF_ADDON_PRICE)
        expect(priceLineItemCents(productId, withPdf)).toBe(eurToCents(expectedPdf))
      }
    }
  })

  it('AT-001-4: bundle parity — every catalog bundle (incl. digital combo) == catalog price', () => {
    const allBundles = [...bundles, digitalBundle]
    expect(allBundles.length).toBeGreaterThan(0)
    for (const b of allBundles) {
      expect(priceLineItemCents(bundleProductId(b.id), '')).toBe(eurToCents(b.price))
    }
  })

  it('AT-001-4: add-on parity — every catalog add-on == catalog price', () => {
    expect(addons.length).toBeGreaterThan(0)
    for (const a of addons) {
      expect(priceLineItemCents(addonProductId(a.id), '')).toBe(eurToCents(a.price))
    }
  })

  it('AT-001-4: digital-product parity — standalone PDF == catalog price', () => {
    expect(priceLineItemCents(digitalProductId(digitalProduct.id), '')).toBe(
      eurToCents(digitalProduct.price),
    )
  })

  it('AT-001-3 (unit): unknown product/variant → null (route maps this to 4xx)', () => {
    expect(priceLineItemCents(`${POSTER_PRODUCT_PREFIX}99999`, 'size=A2')).toBeNull()
    expect(priceLineItemCents(`${POSTER_PRODUCT_PREFIX}1`, 'size=ZZ')).toBeNull()
    expect(priceLineItemCents('bogus', 'size=A2')).toBeNull()
  })

  it('AT-002-4: shipping parity — threshold derived from tokens FREE_SHIP_THRESHOLD', () => {
    const thresholdCents = eurToCents(FREE_SHIP_THRESHOLD)
    // US/UK ship free regardless of subtotal (region rule, not threshold).
    expect(computeShippingCents('us', thresholdCents - 100)).toBe(0)
    expect(computeShippingCents('uk', thresholdCents - 100)).toBe(0)
    // EU + "other": free at/over the client threshold, flat 4.90 € below it.
    expect(computeShippingCents('eu', thresholdCents - 1)).toBe(490)
    expect(computeShippingCents('eu', thresholdCents)).toBe(0)
    expect(computeShippingCents('other', 100)).toBe(490)
    expect(computeShippingCents('other', thresholdCents + 1000)).toBe(0)
  })
})

// Local mirror of the server's chunked-metadata reader (server/index.js
// `readPersonalizationMetadata`) so the round-trip test asserts against the SAME
// reassembly the webhook uses. The route stores each cart line under `lineN`, so
// the reassembled object is `{ line1: {...}, ... }`.
function readPersonalizationMetadata(metadata: Record<string, string>): any {
  const md = metadata || {}
  if (md.personalization) return JSON.parse(md.personalization)
  if (md.personalization_chunks) {
    const n = parseInt(md.personalization_chunks, 10) || 0
    let json = ''
    for (let i = 0; i < n; i++) json += md[`personalization_${i}`] || ''
    return json ? JSON.parse(json) : {}
  }
  return {}
}
