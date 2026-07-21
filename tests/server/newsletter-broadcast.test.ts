/**
 * Operator 2026-07-18 — Broadcast VORBEREITET, nicht aktiviert.
 *
 * [INTEGRATION-FAKE] — echte Route via supertest gegen createApp; Pool +
 * Mailer gestubbt. Die Ausgabedateien sind die ECHTEN Repo-Drafts
 * (docs/newsletter-drafts/2026-07-17-cosmic-*.html).
 *
 * Vertrag:
 *  - OHNE NEWSLETTER_BROADCAST_SECRET → 503 (Aktivierungs-Gate, "nicht aktiv")
 *  - falsches Secret → 403, kein Versand
 *  - dryRun (Standard) → zählt Empfänger, mailer wird NIE aufgerufen
 *  - echter Lauf → je bestätigtem Abonnenten EINE Mail in SEINER Sprache mit
 *    PERSONALISIERTEM Abmeldelink (eigenes Token)
 */
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'

let createApp: (overrides?: Record<string, unknown>) => import('express').Express

beforeAll(async () => {
  ;({ createApp } = await import('../../server/index.js'))
})

const SUBS = [
  { email: 'a@example.com', language: 'de', confirm_token: 'tok-a' },
  { email: 'b@example.com', language: 'fr', confirm_token: 'tok-b' },
]

function makePool() {
  return {
    query: vi.fn(async (sql: string) => {
      if (/FROM newsletter_signups WHERE status = 'confirmed'/.test(sql)) return { rows: SUBS }
      return { rows: [] }
    }),
  }
}
function makeMailer() {
  const sent: Array<Record<string, unknown>> = []
  return { sent, emails: { send: vi.fn(async (m: Record<string, unknown>) => { sent.push(m); return { id: 'em' } }) } }
}

const BODY = { series: 'cosmic', date: '2026-07-17' }

beforeEach(() => { vi.restoreAllMocks() })
afterEach(() => { delete process.env.NEWSLETTER_BROADCAST_SECRET })

describe('POST /api/newsletter/broadcast — Aktivierungs-Gate', () => {
  it('answers 503 while NEWSLETTER_BROADCAST_SECRET is unset (prepared, NOT active)', async () => {
    const app = createApp({ pool: makePool(), mailer: makeMailer() })
    const res = await request(app).post('/api/newsletter/broadcast').send(BODY)
    expect(res.status).toBe(503)
  })

  it('rejects a wrong secret with 403 and sends nothing', async () => {
    process.env.NEWSLETTER_BROADCAST_SECRET = 'right-secret'
    const mailer = makeMailer()
    const app = createApp({ pool: makePool(), mailer })
    const res = await request(app)
      .post('/api/newsletter/broadcast')
      .set('X-Broadcast-Secret', 'wrong')
      .send({ ...BODY, dryRun: false })
    expect(res.status).toBe(403)
    expect(mailer.emails.send).not.toHaveBeenCalled()
  })
})

describe('POST /api/newsletter/broadcast — Versand-Semantik', () => {
  it('dryRun is the default: counts subscribers, mailer never called', async () => {
    process.env.NEWSLETTER_BROADCAST_SECRET = 's3cret'
    const mailer = makeMailer()
    const app = createApp({ pool: makePool(), mailer })
    const res = await request(app)
      .post('/api/newsletter/broadcast')
      .set('X-Broadcast-Secret', 's3cret')
      .send(BODY)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ dryRun: true, total: 2, sent: 0 })
    expect(res.body.byLang).toEqual({ de: 1, fr: 1 })
    expect(mailer.emails.send).not.toHaveBeenCalled()
  })

  it('real run: one mail per confirmed subscriber, own language, personalized unsubscribe token', async () => {
    process.env.NEWSLETTER_BROADCAST_SECRET = 's3cret'
    const mailer = makeMailer()
    const app = createApp({ pool: makePool(), mailer })
    const res = await request(app)
      .post('/api/newsletter/broadcast')
      .set('X-Broadcast-Secret', 's3cret')
      .send({ ...BODY, dryRun: false })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ dryRun: false, total: 2, sent: 2, failures: [] })
    expect(mailer.emails.send).toHaveBeenCalledTimes(2)
    const [a, b] = mailer.sent as Array<{ to: string; html: string; subject: string }>
    expect(a.to).toBe('a@example.com')
    expect(a.html).toContain('/api/newsletter/unsubscribe?token=tok-a')
    expect(a.html).toContain('Tagesimpuls') // deutsche Fassung
    expect(b.to).toBe('b@example.com')
    expect(b.html).toContain('/api/newsletter/unsubscribe?token=tok-b')
    expect(b.html).toContain('impulsion') // französische Fassung
    expect(a.html).not.toContain('{{{RESEND_UNSUBSCRIBE_URL}}}')
  })
})
