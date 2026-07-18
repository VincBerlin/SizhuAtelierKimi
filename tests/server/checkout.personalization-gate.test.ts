/**
 * Batch #12 R3 (Bereich 8) — Server-seitiges Order-Gate für personalisierte
 * Produkte: eine Bestellung OHNE Pflicht-Geburtsdaten darf nicht möglich sein.
 *
 * [INTEGRATION-FAKE] — die reale Express-Route `/api/checkout` läuft
 * (createApp aus server/index.js), nur das Stripe-SDK ist gestubbt.
 *
 * Anlass (R3-Fund): /digital (DigitalPage) und die b-digital-Bundle-Karte
 * legten die 195-€-Premium-Analyse bzw. „Poster + Analyse" OHNE jegliche
 * Geburtsdaten in den Warenkorb — der Checkout akzeptierte das und hätte eine
 * unerfüllbare bezahlte Bestellung erzeugt. Das Gate blockiert solche Lines
 * mit 400, BEVOR Stripe aufgerufen wird.
 *
 * Gate-Regeln (server/personalizationGate.js — Spiegel des Client-Gates
 * cartHasIncompletePersonalization in src/lib/checkout.ts):
 *   - ptype:* , digital:* und bundle:b-digital ERFORDERN personalization mit
 *     name, date, place und (time ODER birthTimeUnknown === 'true').
 *   - ptype:couple erfordert zusätzlich die B-Felder.
 *   - poster:*, bundle:b1/b2, addon:* bleiben ungegated (nicht personalisiert).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

function makeStripeStub() {
  const create = vi.fn(async (params: unknown) => ({
    id: 'cs_test_stub_gate',
    url: 'https://stripe.test/checkout/cs_test_stub_gate',
    _params: params,
  }))
  return { create, stripe: { checkout: { sessions: { create } }, customers: { create: vi.fn(async () => ({ id: 'cus_stub' })) } } }
}

// Vollständige Personalisierung, wie die Personalize-Seite sie IMMER anhängt
// (birthTimeMeta füllt time auch bei unbekannter Zeit mit 12:00).
const FULL_PERSON = {
  productType: 'bazi',
  name: 'Mei Chen',
  date: '1990-06-15',
  time: '12:30',
  birthTimeUnknown: 'false',
  unknownTime: 'false',
  place: 'Berlin',
}

const FULL_COUPLE = {
  ...FULL_PERSON,
  productType: 'couple',
  nameB: 'Jonas Weber',
  dateB: '1988-02-02',
  timeB: '08:15',
  birthTimeUnknownB: 'false',
  placeB: 'Hamburg',
}

interface CheckoutItem {
  productId: string
  variantId: string
  qty: number
  personalization?: Record<string, string>
}

let stub: ReturnType<typeof makeStripeStub>
let app: ReturnType<typeof createApp>

beforeEach(() => {
  stub = makeStripeStub()
  app = createApp({ stripe: stub.stripe })
})

const post = (items: CheckoutItem[]) => request(app).post('/api/checkout').send({ items })

describe('[INTEGRATION-FAKE] Batch#12 R3 — Order-Gate: personalisierte Lines ohne Pflichtdaten → 400, Stripe wird nie aufgerufen', () => {
  it('digital:digital-bazi OHNE personalization → 400 (der alte /digital-Kaufpfad)', async () => {
    const res = await post([{ productId: 'digital:digital-bazi', variantId: '', qty: 1 }])
    expect(res.status).toBe(400)
    expect(String(res.body.error)).toMatch(/personali/i)
    expect(stub.create).not.toHaveBeenCalled()
  })

  it('bundle:b-digital OHNE personalization → 400 (die alte Bundle-Karte)', async () => {
    const res = await post([{ productId: 'bundle:b-digital', variantId: '', qty: 1 }])
    expect(res.status).toBe(400)
    expect(stub.create).not.toHaveBeenCalled()
  })

  it('ptype:bazi OHNE personalization → 400', async () => {
    const res = await post([{ productId: 'ptype:bazi', variantId: 'size=50x70', qty: 1 }])
    expect(res.status).toBe(400)
    expect(stub.create).not.toHaveBeenCalled()
  })

  it('ptype:bazi mit UNVOLLSTÄNDIGER personalization (ohne date/place) → 400', async () => {
    const res = await post([
      { productId: 'ptype:bazi', variantId: 'size=50x70', qty: 1, personalization: { name: 'Mei', time: '12:30' } },
    ])
    expect(res.status).toBe(400)
    expect(stub.create).not.toHaveBeenCalled()
  })

  it('ptype:bazi ohne time, aber birthTimeUnknown="true" → Session wird erstellt (offengelegter Mittag-Fallback)', async () => {
    const res = await post([
      {
        productId: 'ptype:bazi',
        variantId: 'size=50x70',
        qty: 1,
        personalization: { ...FULL_PERSON, time: '', birthTimeUnknown: 'true', unknownTime: 'true' },
      },
    ])
    expect(res.status).toBe(200)
    expect(stub.create).toHaveBeenCalledTimes(1)
  })

  it('ptype:couple mit vollständiger Person A, aber OHNE B-Felder → 400', async () => {
    const res = await post([
      { productId: 'ptype:couple', variantId: 'size=50x70', qty: 1, personalization: { ...FULL_PERSON, productType: 'couple' } },
    ])
    expect(res.status).toBe(400)
    expect(stub.create).not.toHaveBeenCalled()
  })

  it('ptype:couple mit beiden vollständigen Personen → Session wird erstellt', async () => {
    const res = await post([{ productId: 'ptype:couple', variantId: 'size=50x70', qty: 1, personalization: FULL_COUPLE }])
    expect(res.status).toBe(200)
    expect(stub.create).toHaveBeenCalledTimes(1)
  })

  it('digital:digital-bazi MIT vollständiger personalization → Session wird erstellt', async () => {
    const res = await post([{ productId: 'digital:digital-bazi', variantId: '', qty: 1, personalization: { ...FULL_PERSON, productType: 'digital' } }])
    expect(res.status).toBe(200)
    expect(stub.create).toHaveBeenCalledTimes(1)
  })

  it('NICHT-personalisierte Lines bleiben ungegated: poster:7 und bundle:b1 ohne personalization → Session wird erstellt', async () => {
    const res = await post([
      { productId: 'poster:7', variantId: 'size=A2', qty: 1 },
      { productId: 'bundle:b1', variantId: '', qty: 1 },
    ])
    expect(res.status).toBe(200)
    expect(stub.create).toHaveBeenCalledTimes(1)
  })
})
