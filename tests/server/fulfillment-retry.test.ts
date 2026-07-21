/**
 * Batch #12 R5 (Bereich 9) — Fulfillment-Retry: „Retry möglich".
 *
 * [INTEGRATION-FAKE] — reale Route (createApp), Stripe/Pool/Gelato gestubbt.
 *
 * POST /api/fulfillment/retry/:sessionId lässt den Operator eine gescheiterte
 * Fulfillment-Runde erneut anstoßen (z. B. nachdem ein fehlendes Druck-Asset
 * registriert oder FuFirE wieder erreichbar ist). Gleiche Gating-Disziplin wie
 * der Newsletter-Broadcast: ohne FULFILLMENT_RETRY_SECRET ist die Route 503;
 * falsches Secret → 403. fulfillOrder selbst ist idempotent (UNIQUE-Print +
 * gelato_order_id-Check), ein Retry kann also nie doppelt produzieren.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

const CHART = {
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
  animal: 'Pferd',
  element: 'Metall',
  provenance: { engine_version: 'test', ruleset_id: 'r', tzdb_version_id: 'z' },
}
const fufireStub = { enabled: () => true, calculateBazi: async () => CHART, calculateWestern: async () => ({}), matchHehun: async () => ({}), geocodePlace: async () => ({}) }

const P_LINE = {
  productType: 'bazi', name: 'Anna', date: '1990-06-15', time: '12:30',
  birthTimeUnknown: 'false', place: 'Berlin', placeResolved: 'Berlin',
  placeLat: '52.52', placeLon: '13.405', placeTz: 'Europe/Berlin',
  designId: 'klassik', size: '50 × 70', sizeId: '50x70', frame: 'Schwarz matt', frameHex: '#1B1B1B', bgHex: '#E9DFCB',
}

interface PrintRow {
  stripe_session: unknown
  line_key: unknown
  token: unknown
  design_id: unknown
  size_id: unknown
  pdf: Buffer
  gelato_order_id: string | null
}

function fakePool() {
  const prints: PrintRow[] = []
  return {
    prints,
    async query(sql: string, params: unknown[] = []) {
      if (sql.startsWith('SELECT id, gelato_order_id FROM prints')) {
        return { rows: prints.filter((p) => p.stripe_session === params[0] && p.line_key === params[1]) }
      }
      if (sql.startsWith('SELECT 1 FROM prints')) return { rows: [] }
      if (sql.startsWith('SELECT line_key, token, design_id, size_id FROM prints')) {
        return { rows: prints.filter((p) => p.stripe_session === params[0]) }
      }
      if (sql.startsWith('INSERT INTO prints')) {
        prints.push({ stripe_session: params[0], line_key: params[1], token: params[2], design_id: params[3], size_id: params[4], pdf: params[5] as Buffer, gelato_order_id: null })
        return { rows: [] }
      }
      return { rows: [] }
    },
  }
}

function makeStripeStub() {
  const retrieve = vi.fn(async (id: string) => ({
    id,
    currency: 'eur',
    customer_details: { email: 'k@example.com', name: 'Kim Kunde' },
    shipping_details: { name: 'Kim Kunde', address: { line1: 'Weg 1', city: 'Berlin', postal_code: '10115', country: 'DE' } },
    metadata: { personalization: JSON.stringify({ line1: P_LINE }) },
  }))
  return { retrieve, stripe: { checkout: { sessions: { retrieve, create: vi.fn() } } } }
}

let prevSecret: string | undefined

beforeEach(() => {
  prevSecret = process.env.FULFILLMENT_RETRY_SECRET
})

afterEach(() => {
  if (prevSecret === undefined) delete process.env.FULFILLMENT_RETRY_SECRET
  else process.env.FULFILLMENT_RETRY_SECRET = prevSecret
})

describe('[INTEGRATION-FAKE] Batch#12 R5 — POST /api/fulfillment/retry/:sessionId', () => {
  it('ohne FULFILLMENT_RETRY_SECRET → 503 (env-gated, wie Broadcast)', async () => {
    delete process.env.FULFILLMENT_RETRY_SECRET
    const app = createApp({ stripe: makeStripeStub().stripe, pool: fakePool(), fufire: fufireStub })
    const res = await request(app).post('/api/fulfillment/retry/cs_retry_1')
    expect(res.status).toBe(503)
  })

  it('falsches Secret → 403, Stripe wird nicht befragt', async () => {
    process.env.FULFILLMENT_RETRY_SECRET = 'sehr-geheim'
    const stub = makeStripeStub()
    const app = createApp({ stripe: stub.stripe, pool: fakePool(), fufire: fufireStub })
    const res = await request(app).post('/api/fulfillment/retry/cs_retry_1').set('x-retry-secret', 'falsch')
    expect(res.status).toBe(403)
    expect(stub.retrieve).not.toHaveBeenCalled()
  })

  it('R6: Fehlschlag → Alarm-Mail an ORDER_NOTIFY_EMAIL (env-gated); ohne Notify-Adresse keine Mail', async () => {
    process.env.FULFILLMENT_RETRY_SECRET = 'sehr-geheim'
    const prevNotify = process.env.ORDER_NOTIFY_EMAIL
    process.env.ORDER_NOTIFY_EMAIL = 'operator@sizhuatelier.shop'
    try {
      const send = vi.fn(async () => ({ id: 'mail-1' }))
      const failingFufire = { ...fufireStub, calculateBazi: async () => { throw new Error('down') } }
      const app = createApp({ stripe: makeStripeStub().stripe, pool: fakePool(), fufire: failingFufire, mailer: { emails: { send } } })
      const res = await request(app).post('/api/fulfillment/retry/cs_alert_1').set('x-retry-secret', 'sehr-geheim')
      expect(res.status).toBe(200)
      expect(res.body.failed).toHaveLength(1)
      // Alarm-Mail: an die Operator-Adresse, Betreff nennt die Session.
      expect(send).toHaveBeenCalledTimes(1)
      const mail = send.mock.calls[0][0] as { to: string; subject: string; text: string }
      expect(mail.to).toBe('operator@sizhuatelier.shop')
      expect(mail.subject).toContain('cs_alert_1')
      expect(mail.text).toMatch(/down/)

      // Ohne ORDER_NOTIFY_EMAIL → keine Mail (still, aber Status/Log bleiben).
      delete process.env.ORDER_NOTIFY_EMAIL
      const send2 = vi.fn(async () => ({ id: 'mail-2' }))
      const app2 = createApp({ stripe: makeStripeStub().stripe, pool: fakePool(), fufire: failingFufire, mailer: { emails: { send: send2 } } })
      await request(app2).post('/api/fulfillment/retry/cs_alert_2').set('x-retry-secret', 'sehr-geheim')
      expect(send2).not.toHaveBeenCalled()
    } finally {
      if (prevNotify === undefined) delete process.env.ORDER_NOTIFY_EMAIL
      else process.env.ORDER_NOTIFY_EMAIL = prevNotify
    }
  })

  it('korrektes Secret → Session aus Stripe geholt, fulfillOrder läuft (Print entsteht), Ergebnis zurück', async () => {
    process.env.FULFILLMENT_RETRY_SECRET = 'sehr-geheim'
    const stub = makeStripeStub()
    const pool = fakePool()
    const app = createApp({ stripe: stub.stripe, pool, fufire: fufireStub })
    const res = await request(app).post('/api/fulfillment/retry/cs_retry_2').set('x-retry-secret', 'sehr-geheim')
    expect(res.status).toBe(200)
    expect(stub.retrieve).toHaveBeenCalledWith('cs_retry_2', expect.anything())
    expect(res.body.printed).toHaveLength(1)
    expect(res.body.failed).toHaveLength(0)
    expect(pool.prints).toHaveLength(1)
  })
})
