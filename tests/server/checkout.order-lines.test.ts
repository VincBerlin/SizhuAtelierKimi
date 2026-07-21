/**
 * Batch #12 R5 (Bereich 9) — JEDE Bestell-Line erreicht das Fulfillment.
 *
 * [INTEGRATION-FAKE] — reale /api/checkout-Route (createApp), Stripe gestubbt.
 *
 * Anlass (R5-Fund): die Session-Metadaten trugen NUR Lines mit
 * personalization — nicht-personalisierte Katalog-Poster (Feuerpferd, TCM,
 * Wuxing) wurden bezahlt und vom Fulfillment STILL übersprungen (keine
 * Produktion, kein failed-Status, keine Eskalation).
 *
 * Vertrag: der Server schreibt für ALLE Lines einen Metadaten-Datensatz
 * (productId, variantId, qty); personalisierte Lines behalten zusätzlich ihre
 * personalization-Felder. Damit kann server/fulfillment.js Katalog-Poster
 * produzieren (oder LAUT scheitern) statt sie zu ignorieren.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

function makeStripeStub() {
  const create = vi.fn(async (params: unknown) => ({ id: 'cs_lines_1', url: 'https://stripe.test/cs_lines_1', _params: params }))
  return { create, stripe: { checkout: { sessions: { create } } } }
}

const FULL_PERSON = {
  productType: 'bazi', name: 'Mei Chen', date: '1990-06-15', time: '12:30',
  birthTimeUnknown: 'false', unknownTime: 'false', place: 'Berlin',
  designId: 'klassik', size: '50 × 70', sizeId: '50x70',
}

let stub: ReturnType<typeof makeStripeStub>
let app: ReturnType<typeof createApp>

beforeEach(() => {
  stub = makeStripeStub()
  app = createApp({ stripe: stub.stripe })
})

function metadataLines() {
  const md = stub.create.mock.calls.at(-1)?.[0]?.metadata ?? {}
  if (md.personalization) return JSON.parse(md.personalization)
  if (md.personalization_chunks) {
    let json = ''
    for (let i = 0; i < parseInt(md.personalization_chunks, 10); i++) json += md[`personalization_${i}`] || ''
    return JSON.parse(json)
  }
  return {}
}

describe('[INTEGRATION-FAKE] Batch#12 R5 — Order-Lines-Metadaten für ALLE Lines', () => {
  it('nicht-personalisierte Katalog-Poster-Line → Metadaten-Datensatz mit productId/variantId/qty', async () => {
    const res = await request(app).post('/api/checkout').send({
      items: [{ productId: 'poster:11', variantId: 'size=50x70;frame=#1B1B1B', qty: 2 }],
    })
    expect(res.status).toBe(200)
    const lines = metadataLines()
    expect(lines.line1).toMatchObject({ productId: 'poster:11', variantId: 'size=50x70;frame=#1B1B1B', qty: '2' })
  })

  it('gemischte Bestellung: personalisierte Line behält ihre Felder, Katalog-Line bekommt ihren Datensatz', async () => {
    const res = await request(app).post('/api/checkout').send({
      items: [
        { productId: 'ptype:bazi', variantId: 'size=50x70;frame=#B98A5E', qty: 1, personalization: FULL_PERSON },
        { productId: 'poster:7', variantId: 'size=30x40;frame=#B98A5E', qty: 1 },
      ],
    })
    expect(res.status).toBe(200)
    const lines = metadataLines()
    expect(lines.line1).toMatchObject({ productId: 'ptype:bazi', name: 'Mei Chen', designId: 'klassik', sizeId: '50x70' })
    expect(lines.line2).toMatchObject({ productId: 'poster:7', variantId: 'size=30x40;frame=#B98A5E', qty: '1' })
    // Katalog-Line trägt KEIN designId — das personalisierte Druck-Rendering
    // (posterLinesFrom) darf sie nie als Design-Line missverstehen.
    expect(lines.line2.designId).toBeUndefined()
  })

  it('nicht-Poster-Lines (bundle:b1) bekommen ebenfalls einen Datensatz (Status-Vollständigkeit)', async () => {
    const res = await request(app).post('/api/checkout').send({
      items: [{ productId: 'bundle:b1', variantId: '', qty: 1 }],
    })
    expect(res.status).toBe(200)
    expect(metadataLines().line1).toMatchObject({ productId: 'bundle:b1' })
  })
})
