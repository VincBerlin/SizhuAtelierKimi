// SizhuAtelier — static SPA host + Stripe checkout + order webhook.
// Everything external is env-gated: the server boots and serves the shop even
// with no keys; payment/persistence/email light up as their env vars appear.
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'
import { randomUUID, scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')

const PORT = process.env.PORT || 3000
const CURRENCY = (process.env.CURRENCY || 'eur').toLowerCase()
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
// Public origin used for Stripe success/cancel redirects. Falls back to the
// Railway-provided domain, then to the request origin at call time.
const PUBLIC_URL = (process.env.PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '')).replace(/\/$/, '')

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null
// Secret for signing session cookies. Auth is disabled unless this is set.
const SESSION_SECRET = process.env.SESSION_SECRET || ''

// ---- optional persistence (Postgres) -------------------------------------
let pool = null
if (process.env.DATABASE_URL) {
  const pg = (await import('pg')).default
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false } })
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    stripe_session TEXT UNIQUE,
    email TEXT,
    amount_total INTEGER,
    currency TEXT,
    status TEXT,
    items JSONB,
    personalization JSONB
  )`).catch((e) => console.error('[db] init failed:', e.message))
  await pool.query(`CREATE TABLE IF NOT EXISTS newsletter_signups (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    email TEXT UNIQUE NOT NULL,
    language TEXT,
    consent BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending',
    confirm_token TEXT,
    credits_reserved INTEGER NOT NULL DEFAULT 20
  )`).catch((e) => console.error('[db] newsletter init failed:', e.message))
  await pool.query(`CREATE TABLE IF NOT EXISTS credits_ledger (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    email TEXT,
    event_type TEXT NOT NULL,
    points_delta INTEGER NOT NULL,
    balance_after INTEGER,
    order_id TEXT UNIQUE
  )`).catch((e) => console.error('[db] credits init failed:', e.message))
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    points_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    marketing_consent BOOLEAN NOT NULL DEFAULT false,
    marketing_consent_at TIMESTAMPTZ,
    newsletter_status TEXT NOT NULL DEFAULT 'none',
    unlocked_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
    reset_token TEXT,
    reset_expires TIMESTAMPTZ
  )`).catch((e) => console.error('[db] users init failed:', e.message))
  console.log('[db] Postgres connected')
}

// ---- optional email (Resend) ----------------------------------------------
let resend = null
if (process.env.RESEND_API_KEY) {
  const { Resend } = await import('resend')
  resend = new Resend(process.env.RESEND_API_KEY)
  console.log('[mail] Resend ready')
}
const FROM_EMAIL = process.env.ORDER_FROM_EMAIL || 'SizhuAtelier <orders@sizhuatelier.shop>'
const NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || ''

const app = express()
app.disable('x-powered-by')

const eur = (cents) => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: CURRENCY.toUpperCase() })

// ---- Stripe webhook (must read the RAW body — mount before express.json) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(503).send('webhook not configured')
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] signature verify failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object
      const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] })
      const items = (full.line_items?.data || []).map((li) => ({ description: li.description, qty: li.quantity, amount: li.amount_total }))
      const personalization = readPersonalizationMetadata(session.metadata)
      await persistOrder(full, items, personalization)
      await recordCreditsEarned(full, items)
      await sendEmails(full, items, personalization)
      console.log(`[order] ${full.id} · ${eur(full.amount_total)} · ${full.customer_details?.email}`)
    } catch (e) {
      console.error('[webhook] handling failed:', e.message)
    }
  }
  res.json({ received: true })
})

app.use(express.json())

// ---- health ----------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, stripe: !!stripe, db: !!pool, email: !!resend, publicUrl: PUBLIC_URL || null })
})

// ---- create checkout session ------------------------------------------------
app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payment is not configured yet (missing STRIPE_SECRET_KEY).' })
  try {
    const { items, shippingCents = 0, locale, email } = req.body || {}
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' })

    // NOTE: amounts come from the client here. Before going live, validate each
    // line against an authoritative server-side price list to prevent tampering.
    const line_items = []
    const personalization = {}
    for (const [i, it] of items.entries()) {
      const cents = Math.round(Number(it.unitAmount))
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1))
      if (!Number.isInteger(cents) || cents <= 0) return res.status(400).json({ error: 'Invalid item amount.' })
      line_items.push({
        quantity: qty,
        price_data: {
          currency: CURRENCY,
          unit_amount: cents,
          product_data: { name: String(it.title || 'Poster').slice(0, 120), ...(it.meta ? { description: String(it.meta).slice(0, 200) } : {}) },
        },
      })
      if (it.personalization) personalization[`line${i + 1}`] = it.personalization
    }
    if (shippingCents > 0) {
      line_items.push({ quantity: 1, price_data: { currency: CURRENCY, unit_amount: Math.round(shippingCents), product_data: { name: 'Shipping' } } })
    }

    const origin = PUBLIC_URL || (req.headers.origin || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')
    // Stripe caps each metadata VALUE at 500 chars (and ~50 keys per object). A
    // couple or multi-line cart easily exceeds 500 chars, so chunk the
    // personalization JSON across numbered keys instead of silently dropping it —
    // the customer's birth data is the whole product and must reach fulfilment.
    const metadata = buildPersonalizationMetadata(personalization)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      locale: ['en', 'de', 'fr'].includes((locale || '').toLowerCase()) ? locale.toLowerCase() : 'auto',
      ...(email ? { customer_email: String(email).slice(0, 200) } : {}),
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'LU', 'IT', 'ES'] },
      phone_number_collection: { enabled: false },
      metadata,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    })
    res.json({ url: session.url, id: session.id })
  } catch (e) {
    console.error('[checkout] failed:', e.message)
    res.status(500).json({ error: 'Could not start checkout.' })
  }
})

// ---- newsletter signup (lead capture, double-opt-in ready) -----------------
app.post('/api/newsletter', async (req, res) => {
  const { email, consent, language } = req.body || {}
  const e = String(email || '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) || e.length > 200) return res.status(400).json({ error: 'invalid_email' })
  if (consent !== true) return res.status(400).json({ error: 'consent_required' })
  const lang = ['en', 'de', 'fr'].includes(String(language || '').toLowerCase()) ? String(language).toLowerCase() : 'en'
  if (!pool) { console.log('[newsletter] (no DB) signup:', e, lang); return res.json({ ok: true, persisted: false }) }
  try {
    // Double-opt-in ready: store pending + a confirm token. A confirmation email
    // would be sent here once an ESP is wired (no real send in this MVP).
    const token = randomUUID()
    await pool.query(
      `INSERT INTO newsletter_signups (email, language, consent, status, confirm_token)
       VALUES ($1,$2,$3,'pending',$4)
       ON CONFLICT (email) DO UPDATE SET language = EXCLUDED.language, consent = EXCLUDED.consent`,
      [e, lang, true, token],
    )
    return res.json({ ok: true, persisted: true })
  } catch (err) {
    console.error('[newsletter] persist failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

// ---- auth (profile + Celestial Credits accounts) ---------------------------
// Stateless sessions: an HMAC-signed cookie carrying the user id + expiry (no
// session table; tampering fails the HMAC check). Passwords are scrypt-hashed.
const SESSION_COOKIE = 'sizhu_session'
const SESSION_DAYS = 30
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex')
  const dk = scryptSync(pw, salt, 64).toString('hex')
  return `scrypt$${salt}$${dk}`
}
function verifyPassword(pw, stored) {
  try {
    const [scheme, salt, dk] = String(stored).split('$')
    if (scheme !== 'scrypt' || !salt || !dk) return false
    const dkBuf = Buffer.from(dk, 'hex')
    const test = scryptSync(pw, salt, dkBuf.length)
    return dkBuf.length === test.length && timingSafeEqual(dkBuf, test)
  } catch { return false }
}
// Compared against for unknown-email logins so scrypt always runs — equalizes
// response time and removes the email-enumeration timing oracle.
const DUMMY_PASSWORD_HASH = hashPassword(randomUUID())
function signSession(uid) {
  const payload = Buffer.from(JSON.stringify({ uid, exp: Date.now() + SESSION_DAYS * 86400000 })).toString('base64url')
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}
function verifySession(token) {
  if (!token || !SESSION_SECRET) return null
  const [payload, sig] = String(token).split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (!uid || !exp || Date.now() > exp) return null
    return uid
  } catch { return null }
}
function readCookie(req, name) {
  const raw = req.headers.cookie || ''
  for (const part of raw.split(';')) {
    const i = part.indexOf('=')
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim())
  }
  return null
}
function setSessionCookie(res, token) {
  const secure = !!PUBLIC_URL || process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_DAYS * 86400}; SameSite=Lax${secure ? '; Secure' : ''}`)
}
function clearSessionCookie(res) {
  const secure = !!PUBLIC_URL || process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`)
}
const authReady = () => !!(pool && SESSION_SECRET)

app.post('/api/auth/signup', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const { email, password, marketingConsent } = req.body || {}
  const e = String(email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(e) || e.length > 200) return res.status(400).json({ error: 'invalid_email' })
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) return res.status(400).json({ error: 'weak_password' })
  try {
    const consent = marketingConsent === true
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, marketing_consent, marketing_consent_at, newsletter_status)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING RETURNING id`,
      [e, hashPassword(password), consent, consent ? new Date() : null, consent ? 'subscribed' : 'none'],
    )
    if (!r.rows.length) return res.status(409).json({ error: 'email_taken' })
    setSessionCookie(res, signSession(r.rows[0].id))
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] signup failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const { email, password } = req.body || {}
  const e = String(email || '').trim().toLowerCase()
  try {
    const r = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [e])
    const row = r.rows[0]
    // Always run scrypt (against a dummy hash when the email is unknown) so the
    // response time does not reveal whether the account exists. Same generic error.
    const ok = verifyPassword(String(password || ''), row ? row.password_hash : DUMMY_PASSWORD_HASH)
    if (!row || !ok) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }
    setSessionCookie(res, signSession(row.id))
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] login failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/logout', (_req, res) => { clearSessionCookie(res); res.json({ ok: true }) })

app.get('/api/auth/orders', async (req, res) => {
  if (!authReady()) return res.json({ orders: [] })
  const uid = verifySession(readCookie(req, SESSION_COOKIE))
  if (!uid) return res.json({ orders: [] })
  try {
    const u = await pool.query('SELECT email FROM users WHERE id = $1', [uid])
    if (!u.rows.length || !u.rows[0].email) return res.json({ orders: [] })
    const r = await pool.query('SELECT created_at, amount_total, currency, status, items FROM orders WHERE email = $1 ORDER BY created_at DESC LIMIT 20', [u.rows[0].email])
    return res.json({ orders: r.rows })
  } catch (err) {
    console.error('[auth] orders failed:', err.message)
    return res.json({ orders: [] })
  }
})

app.get('/api/auth/me', async (req, res) => {
  if (!authReady()) return res.json({ user: null })
  const uid = verifySession(readCookie(req, SESSION_COOKIE))
  if (!uid) return res.json({ user: null })
  try {
    const r = await pool.query(
      `SELECT email, points_balance, lifetime_points, marketing_consent, newsletter_status, unlocked_features, achievements, created_at
       FROM users WHERE id = $1`, [uid])
    if (!r.rows.length) return res.json({ user: null })
    const u = r.rows[0]
    return res.json({ user: {
      email: u.email, points: u.points_balance, lifetime: u.lifetime_points,
      marketingConsent: u.marketing_consent, newsletterStatus: u.newsletter_status,
      unlockedFeatures: u.unlocked_features, achievements: u.achievements, createdAt: u.created_at,
    } })
  } catch (err) {
    console.error('[auth] me failed:', err.message)
    return res.json({ user: null })
  }
})

app.post('/api/auth/preferences', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = verifySession(readCookie(req, SESSION_COOKIE))
  if (!uid) return res.status(401).json({ error: 'unauthorized' })
  const consent = req.body?.marketingConsent === true
  try {
    await pool.query('UPDATE users SET marketing_consent = $1, marketing_consent_at = $2, newsletter_status = $3 WHERE id = $4',
      [consent, consent ? new Date() : null, consent ? 'subscribed' : 'unsubscribed', uid])
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] preferences failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/reset/request', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const e = String(req.body?.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(e)) return res.json({ ok: true }) // never reveal whether an email exists
  try {
    const token = randomUUID()
    const r = await pool.query('UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3 RETURNING id',
      [token, new Date(Date.now() + 3600000), e])
    if (r.rows.length && resend) {
      const origin = PUBLIC_URL || ''
      await resend.emails.send({
        from: FROM_EMAIL, to: e, subject: 'Reset your SizhuAtelier password',
        text: `Reset your password (valid 1 hour): ${origin}/account?reset=${token}\n\nIf you did not request this, ignore this email.`,
      }).catch((err) => console.error('[auth] reset email failed:', err.message))
    }
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] reset request failed:', err.message)
    return res.json({ ok: true })
  }
})

app.post('/api/auth/reset/confirm', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const { token, password } = req.body || {}
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) return res.status(400).json({ error: 'weak_password' })
  try {
    const r = await pool.query('SELECT id FROM users WHERE reset_token = $1 AND reset_expires > now()', [String(token || '')])
    if (!r.rows.length) return res.status(400).json({ error: 'invalid_token' })
    await pool.query('UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2', [hashPassword(password), r.rows[0].id])
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] reset confirm failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

// ---- read back a session for the success page ------------------------------
app.get('/api/order/:id', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'not configured' })
  try {
    const s = await stripe.checkout.sessions.retrieve(req.params.id)
    res.json({ status: s.status, paymentStatus: s.payment_status, email: s.customer_details?.email || null, amountTotal: s.amount_total, currency: s.currency })
  } catch {
    res.status(404).json({ error: 'not found' })
  }
})

// ---- static SPA ------------------------------------------------------------
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }))
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')))
} else {
  app.get('*', (_req, res) => res.status(503).send('Build missing — run `npm run build`.'))
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SizhuAtelier server on :${PORT} — stripe=${!!stripe} db=${!!pool} email=${!!resend}`)
})

// ---- helpers ---------------------------------------------------------------

// Stripe metadata limits: <=500 chars/value, ~50 keys/object. Chunk the
// personalization JSON so a couple / multi-line cart never silently loses the
// customer's birth data; reassemble in the webhook via readPersonalizationMetadata.
const META_CHUNK = 480
const META_MAX_CHUNKS = 45 // 45 x 480 ≈ 21.6k chars — far beyond any realistic cart

function buildPersonalizationMetadata(personalization) {
  const json = JSON.stringify(personalization || {})
  if (json === '{}') return {}
  if (json.length <= META_CHUNK) return { personalization: json }
  const needed = Math.ceil(json.length / META_CHUNK)
  const n = Math.min(META_MAX_CHUNKS, needed)
  const meta = { personalization_chunks: String(n) }
  for (let i = 0; i < n; i++) meta[`personalization_${i}`] = json.slice(i * META_CHUNK, (i + 1) * META_CHUNK)
  if (needed > META_MAX_CHUNKS) meta.personalization_truncated = '1'
  return meta
}

function readPersonalizationMetadata(metadata) {
  const md = metadata || {}
  try {
    if (md.personalization) return JSON.parse(md.personalization)
    if (md.personalization_chunks) {
      const n = parseInt(md.personalization_chunks, 10) || 0
      let json = ''
      for (let i = 0; i < n; i++) json += md[`personalization_${i}`] || ''
      return json ? JSON.parse(json) : {}
    }
  } catch (e) {
    console.error('[webhook] personalization parse failed:', e.message)
  }
  return {}
}

async function persistOrder(session, items, personalization) {
  if (!pool) { console.log('[order] (no DB) ', JSON.stringify({ id: session.id, items, personalization })); return }
  await pool.query(
    `INSERT INTO orders (stripe_session, email, amount_total, currency, status, items, personalization)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (stripe_session) DO NOTHING`,
    [session.id, session.customer_details?.email || null, session.amount_total, session.currency, session.payment_status, JSON.stringify(items), JSON.stringify(personalization)],
  )
}

// Celestial Credits (REQ-045): earn 1 credit per net €/$ spent, excluding
// shipping. Recorded to credits_ledger; order_id UNIQUE makes it idempotent so a
// webhook retry never double-credits. Credits are loyalty-only and NEVER reduce
// the checkout price (REQ-044) — this only ADDS an earned-credits ledger entry.
async function recordCreditsEarned(session, items) {
  if (!pool) return
  const email = session.customer_details?.email || null
  const netCents = (items || []).reduce((s, it) => s + (String(it.description) === 'Shipping' ? 0 : (it.amount || 0)), 0)
  const credits = Math.floor(netCents / 100)
  if (credits <= 0) return
  try {
    const prior = email
      ? await pool.query('SELECT COALESCE(SUM(points_delta),0) AS bal FROM credits_ledger WHERE email = $1', [email])
      : { rows: [{ bal: 0 }] }
    const balanceAfter = Number(prior.rows[0].bal) + credits
    await pool.query(
      `INSERT INTO credits_ledger (email, event_type, points_delta, balance_after, order_id)
       VALUES ($1,'purchase_earned',$2,$3,$4) ON CONFLICT (order_id) DO NOTHING`,
      [email, credits, balanceAfter, session.id],
    )
    // If the buyer has an account, reflect the earned credits on their profile.
    if (email) await pool.query('UPDATE users SET points_balance = points_balance + $1, lifetime_points = lifetime_points + $1 WHERE email = $2', [credits, email])
  } catch (e) {
    console.error('[credits] record failed:', e.message)
  }
}

async function sendEmails(session, items, personalization) {
  const email = session.customer_details?.email
  const lines = items.map((i) => `• ${i.qty}× ${i.description || 'Poster'} — ${eur(i.amount)}`).join('\n')
  const personalText = Object.keys(personalization).length
    ? '\n\nPersonalisierung:\n' + Object.entries(personalization).map(([k, v]) => `${k}: ${typeof v === 'object' ? Object.entries(v).map(([a, b]) => `${a}=${b}`).join(', ') : v}`).join('\n')
    : ''
  const total = eur(session.amount_total)
  if (!resend) { console.log('[mail] (no Resend) confirmation skipped for', email); return }
  try {
    if (email) {
      await resend.emails.send({
        from: FROM_EMAIL, to: email,
        subject: 'Your SizhuAtelier order is confirmed ✦',
        text: `Thank you for your order!\n\n${lines}\n\nTotal: ${total}\n\nWe hand-finish your poster and ship within 5–7 business days.${personalText}`,
      })
    }
    if (NOTIFY_EMAIL) {
      await resend.emails.send({
        from: FROM_EMAIL, to: NOTIFY_EMAIL,
        subject: `New order ${session.id} — ${total}`,
        text: `New paid order.\n\nCustomer: ${email}\n${lines}\n\nTotal: ${total}${personalText}`,
      })
    }
  } catch (e) {
    console.error('[mail] send failed:', e.message)
  }
}
