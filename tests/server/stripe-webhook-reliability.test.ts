/**
 * Stripe money-path reliability. These tests drive the real Express webhook;
 * only Stripe, Postgres and Resend are boundary fakes.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const originalNotifyEmail = process.env.ORDER_NOTIFY_EMAIL

function session(metadata: Record<string, string> = {}) {
  return {
    id: 'cs_test_webhook_reliability',
    amount_total: 4900,
    currency: 'eur',
    payment_status: 'paid',
    customer_details: { email: 'buyer@example.test' },
    line_items: { data: [] },
    metadata,
  }
}

function stripeStub(full = session()) {
  const constructEvent = vi.fn(() => ({
    type: 'checkout.session.completed',
    data: { object: { id: full.id, metadata: full.metadata } },
  }))
  const retrieve = vi.fn(async () => full)
  return {
    constructEvent,
    stripe: { webhooks: { constructEvent }, checkout: { sessions: { retrieve } } },
  }
}

function postWebhook(app: ReturnType<typeof createApp>) {
  return request(app)
    .post('/api/webhook')
    .set('stripe-signature', 'test-signature')
    .set('content-type', 'application/json')
    .send('{}')
}

afterEach(() => {
  if (originalWebhookSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET
  else process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret
  if (originalNotifyEmail === undefined) delete process.env.ORDER_NOTIFY_EMAIL
  else process.env.ORDER_NOTIFY_EMAIL = originalNotifyEmail
  createApp({ stripe: null, pool: null, mailer: null })
  vi.restoreAllMocks()
})

describe('[INTEGRATION-FAKE] Stripe webhook reliability', () => {
  it('reads STRIPE_WEBHOOK_SECRET at request time', async () => {
    const stub = stripeStub()
    const query = vi.fn(async () => ({ rows: [] }))
    const app = createApp({ stripe: stub.stripe, pool: { query } })
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_rotated_at_runtime'

    const response = await postWebhook(app)

    expect(response.status).toBe(200)
    expect(stub.constructEvent).toHaveBeenCalledWith(
      expect.any(Buffer),
      'test-signature',
      'whsec_rotated_at_runtime',
    )
  })

  it('returns 500 when Postgres rejects order persistence so Stripe retries', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const stub = stripeStub()
    const query = vi.fn(async () => { throw new Error('database unavailable') })
    const app = createApp({ stripe: stub.stripe, pool: { query } })

    const response = await postWebhook(app)

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'webhook handling failed' })
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('returns 500 when no database is configured instead of losing a paid order', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const app = createApp({ stripe: stripeStub().stripe, pool: null })

    const response = await postWebhook(app)

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'webhook handling failed' })
  })

  it('alerts the operator when fulfillment throws after the order was persisted', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    process.env.ORDER_NOTIFY_EMAIL = 'operator@example.test'
    const personalization = JSON.stringify({
      line1: { designId: 'classic', size: '30x40', productId: 'ptype:bazi' },
    })
    const stub = stripeStub(session({ personalization }))
    let queryCount = 0
    const query = vi.fn(async () => {
      queryCount += 1
      if (queryCount === 1) return { rows: [] } // persistOrder
      throw new Error('print table unavailable') // ensurePrintTables
    })
    const send = vi.fn(async () => ({ id: 'email_alert' }))
    const app = createApp({
      stripe: stub.stripe,
      pool: { query },
      mailer: { emails: { send } },
    })

    const response = await postWebhook(app)

    expect(response.status).toBe(200)
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'operator@example.test',
      subject: expect.stringContaining('Fulfillment FAILED'),
      text: expect.stringContaining('print table unavailable'),
    }))
  })
})
