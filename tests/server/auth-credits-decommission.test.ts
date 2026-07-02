/**
 * REQ-010 (completion) — Celestial-Credits backend decommission.
 *
 * [INTEGRATION-FAKE] — drives the REAL Express auth routes via supertest against
 * `createApp({ stripe, pool })`. Only the external boundaries (Stripe SDK, the
 * Postgres pool) are stubbed; the route code itself runs unchanged.
 *
 * These tests are written BEFORE the server change and MUST be RED against the
 * current credits-granting code:
 *   - signup currently writes a `credits_ledger` welcome row + WELCOME_CREDITS,
 *   - /api/auth/me currently returns `points` / `lifetime` /
 *     `unlockedFeatures` / `achievements`.
 *
 * After the decommission they go GREEN: signup still creates a user (no crash,
 * no credits field in the response, NO credits_ledger write), and /api/auth/me
 * returns a valid user WITHOUT any credits surface. The money-path repricing
 * suite (tests/integration/checkout.repricing.test.ts) is unaffected and stays
 * green — proven here too by a smoke assertion that /api/checkout still prices
 * server-authoritatively (ADR-001).
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import request from 'supertest'

// Auth is env-gated: `authReady()` needs SESSION_SECRET at module-load time.
// Set it BEFORE importing the server so the real auth routes are live.
process.env.SESSION_SECRET = 'test-session-secret-decommission'

// Imported lazily after the env is set so the module reads SESSION_SECRET.
let createApp: (overrides?: Record<string, unknown>) => unknown

beforeAll(async () => {
  ;({ createApp } = await import('../../server/index.js'))
})

// ── Stripe stub (checkout smoke only) ────────────────────────────────────────
function makeStripeStub() {
  const create = vi.fn(async (params: unknown) => ({
    id: 'cs_test_stub_dc',
    url: 'https://stripe.test/checkout/cs_test_stub_dc',
    _params: params,
  }))
  return { create, stripe: { checkout: { sessions: { create } }, customers: { create: vi.fn(async () => ({ id: 'cus_x' })) } } }
}

// ── Postgres pool stub ───────────────────────────────────────────────────────
// Records every SQL string so we can assert what the route DID and DID NOT
// write. Returns faithful row shapes for the two queries the auth routes run.
function makePoolStub() {
  const queries: string[] = []
  const query = vi.fn(async (sql: string) => {
    queries.push(sql)
    const s = String(sql)
    if (/INSERT INTO users/i.test(s)) return { rows: [{ id: 1 }] }
    if (/SELECT[\s\S]*FROM users WHERE id/i.test(s)) {
      // A representative persisted user row. The dormant credits columns may or
      // may not be selected by the route after the change — the assertions below
      // care about the RESPONSE shape, not the column list.
      return {
        rows: [{
          email: 'buyer@example.com',
          marketing_consent: false,
          newsletter_status: 'none',
          created_at: '2025-01-01T00:00:00.000Z',
          name: 'Buyer',
          preferred_language: 'en',
          stripe_customer_id: null,
          default_shipping_address_id: null,
          default_billing_address_id: null,
          // Present in the DB (dormant columns) but must NOT surface in response.
          points_balance: 999,
          lifetime_points: 999,
          unlocked_features: ['legacy'],
          achievements: ['legacy'],
        }],
      }
    }
    return { rows: [] }
  })
  return { pool: { query }, queries }
}

let stripeStub: ReturnType<typeof makeStripeStub>
let poolStub: ReturnType<typeof makePoolStub>
let app: unknown

beforeEach(() => {
  stripeStub = makeStripeStub()
  poolStub = makePoolStub()
  app = createApp({ stripe: stripeStub.stripe, pool: poolStub.pool })
})

const CREDITS_KEYS = ['points', 'lifetime', 'unlockedFeatures', 'achievements']

describe('REQ-010 — signup no longer grants Celestial Credits', () => {
  it('creates a user (200 ok) without crashing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'buyer@example.com', password: 'a-strong-password', marketingConsent: true, name: 'Buyer' })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    // The users INSERT must still run — signup must keep creating the account.
    expect(poolStub.queries.some((q) => /INSERT INTO users/i.test(q))).toBe(true)
  })

  it('writes NO credits_ledger welcome row', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'buyer@example.com', password: 'a-strong-password', marketingConsent: true })

    expect(poolStub.queries.some((q) => /credits_ledger/i.test(q))).toBe(false)
  })

  it('returns no credits field in the signup response', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'buyer@example.com', password: 'a-strong-password', marketingConsent: false })

    for (const k of CREDITS_KEYS) expect(res.body).not.toHaveProperty(k)
  })
})

describe('REQ-010 — /api/auth/me returns a valid user WITHOUT a credits surface', () => {
  async function meResponse() {
    const agent = request.agent(app as never)
    const signup = await agent
      .post('/api/auth/signup')
      .send({ email: 'buyer@example.com', password: 'a-strong-password', marketingConsent: false, name: 'Buyer' })
    expect(signup.status).toBe(200)
    return agent.get('/api/auth/me')
  }

  it('returns the core profile fields', async () => {
    const res = await meResponse()
    expect(res.status).toBe(200)
    expect(res.body.user).toBeTruthy()
    const u = res.body.user
    expect(u.email).toBe('buyer@example.com')
    expect(u).toHaveProperty('marketingConsent')
    expect(u).toHaveProperty('newsletterStatus')
    expect(u).toHaveProperty('name')
    expect(u).toHaveProperty('createdAt')
  })

  it('omits every credits field even though the DB row still carries them', async () => {
    const res = await meResponse()
    const u = res.body.user || {}
    for (const k of CREDITS_KEYS) expect(u).not.toHaveProperty(k)
  })
})

describe('REQ-010 — no credits/points token leaks in any auth response body', () => {
  it('signup + me bodies contain no "points"/"credits" key path', async () => {
    const agent = request.agent(app as never)
    const signup = await agent
      .post('/api/auth/signup')
      .send({ email: 'buyer@example.com', password: 'a-strong-password', marketingConsent: false })
    const me = await agent.get('/api/auth/me')

    const blob = JSON.stringify(signup.body) + JSON.stringify(me.body)
    // Guard against a leaked key path (not prose). The response is pure JSON, so
    // any occurrence here is a real field name.
    expect(blob).not.toMatch(/"points"|"lifetime"|"unlockedFeatures"|"achievements"/)
    expect(blob.toLowerCase()).not.toContain('credits_ledger')
  })
})

describe('money-path smoke — /api/checkout stays server-authoritative (ADR-001)', () => {
  it('re-prices a tampered poster line to the server price, ignoring client unitAmount', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({ items: [{ productId: 'poster:1', variantId: 'size=A2;frame=#B98A5E', qty: 1, unitAmount: 1 }] })

    expect(res.status).toBe(200)
    expect(stripeStub.create).toHaveBeenCalledTimes(1)
    const params = stripeStub.create.mock.calls.at(-1)?.[0] as { line_items?: Array<{ price_data?: { unit_amount?: number; product_data?: { name?: string } } }> }
    const nonShip = (params.line_items || [])
      .filter((li) => li.price_data?.product_data?.name !== 'Shipping')
      .map((li) => li.price_data?.unit_amount)
    expect(nonShip).toContain(4900)
    expect(nonShip).not.toContain(1)
  })
})
