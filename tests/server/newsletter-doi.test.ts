/**
 * Operator-Batch #8 — Newsletter-Double-Opt-In-Anbindung.
 *
 * [INTEGRATION-FAKE] — treibt die ECHTEN Express-Routen via supertest gegen
 * `createApp({ pool, mailer })`; nur Postgres-Pool und Resend-Mailer sind
 * gestubbt, der Routen-Code läuft unverändert.
 *
 * Vertrag:
 *  - POST /api/newsletter (pending) → Bestätigungs-Mail mit Confirm-Link raus
 *  - POST /api/newsletter (bereits confirmed) → KEINE erneute Mail, kein Downgrade
 *  - GET  /api/newsletter/confirm?token=… → Status-Update + HTML-Bestätigung
 *  - GET  mit unbekanntem Token → 400, keine Erfolgsbehauptung
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import request from 'supertest'

let createApp: (overrides?: Record<string, unknown>) => any

beforeAll(async () => {
  ;({ createApp } = await import('../../server/index.js'))
})

type Row = Record<string, unknown>
function makePool(rowsByMatch: Array<{ match: RegExp; rows: Row[] }>) {
  const calls: Array<{ sql: string; params: unknown[] }> = []
  return {
    calls,
    query: vi.fn(async (sql: string, params: unknown[] = []) => {
      calls.push({ sql, params })
      const hit = rowsByMatch.find((r) => r.match.test(sql))
      return { rows: hit ? hit.rows : [] }
    }),
  }
}

function makeMailer() {
  const sent: Array<Record<string, unknown>> = []
  return { sent, emails: { send: vi.fn(async (m: Record<string, unknown>) => { sent.push(m); return { id: 'em_test' } }) } }
}

beforeEach(() => { vi.restoreAllMocks() })

describe('POST /api/newsletter — double-opt-in send', () => {
  it('sends the confirmation email with the row token for a pending signup', async () => {
    const pool = makePool([
      { match: /INSERT INTO newsletter_signups/i, rows: [{ confirm_token: 'tok-row-123', status: 'pending' }] },
    ])
    const mailer = makeMailer()
    const app = createApp({ pool, mailer })
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'doi-test@example.com', consent: true, language: 'de' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true, persisted: true, confirmSent: true })
    expect(mailer.emails.send).toHaveBeenCalledTimes(1)
    const mail = mailer.sent[0] as { to: string; text: string; subject: string }
    expect(mail.to).toBe('doi-test@example.com')
    expect(mail.text).toContain('/api/newsletter/confirm?token=tok-row-123')
    expect(mail.subject).toContain('bestätige') // deutsche Sprachvariante
  })

  it('does NOT re-mail an already confirmed address (no downgrade)', async () => {
    const pool = makePool([
      { match: /INSERT INTO newsletter_signups/i, rows: [{ confirm_token: 'tok-old', status: 'confirmed' }] },
    ])
    const mailer = makeMailer()
    const app = createApp({ pool, mailer })
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'already@example.com', consent: true, language: 'en' })
    expect(res.status).toBe(200)
    expect(res.body.confirmSent).toBe(false)
    expect(mailer.emails.send).not.toHaveBeenCalled()
  })

  it('without a mailer the signup still persists (env-gated, honest confirmSent:false)', async () => {
    const pool = makePool([
      { match: /INSERT INTO newsletter_signups/i, rows: [{ confirm_token: 'tok-x', status: 'pending' }] },
    ])
    const app = createApp({ pool, mailer: null })
    const res = await request(app)
      .post('/api/newsletter')
      .send({ email: 'nomailer@example.com', consent: true, language: 'en' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ ok: true, persisted: true, confirmSent: false })
  })
})

describe('GET /api/newsletter/confirm — the link from the email', () => {
  it('confirms a pending token and answers with the localized HTML page', async () => {
    const pool = makePool([
      { match: /UPDATE newsletter_signups SET status = 'confirmed'/i, rows: [{ email: 'doi-test@example.com', language: 'de' }] },
    ])
    const app = createApp({ pool, mailer: makeMailer() })
    const res = await request(app).get('/api/newsletter/confirm?token=tok-row-123')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.text).toContain('Anmeldung bestätigt')
    const upd = pool.calls.find((c) => /UPDATE newsletter_signups/.test(c.sql))
    expect(upd?.params).toEqual(['tok-row-123'])
  })

  it('rejects an unknown or reused token with 400 and no success claim', async () => {
    const pool = makePool([
      { match: /UPDATE newsletter_signups SET status = 'confirmed'/i, rows: [] },
    ])
    const app = createApp({ pool, mailer: makeMailer() })
    const res = await request(app).get('/api/newsletter/confirm?token=unknown-tok')
    expect(res.status).toBe(400)
    expect(res.text).not.toContain('bestätigt ✦')
  })
})
