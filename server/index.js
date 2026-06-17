// SizhuAtelier — static SPA host + Stripe checkout + order webhook.
// Everything external is env-gated: the server boots and serves the shop even
// with no keys; payment/persistence/email light up as their env vars appear.
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'

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
      let personalization = {}
      try { personalization = session.metadata?.personalization ? JSON.parse(session.metadata.personalization) : {} } catch { /* ignore */ }
      await persistOrder(full, items, personalization)
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
    const metaPersonal = JSON.stringify(personalization).slice(0, 4900) // Stripe metadata value cap = 500 chars/key; keep compact

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      locale: ['en', 'de', 'fr'].includes((locale || '').toLowerCase()) ? locale.toLowerCase() : 'auto',
      ...(email ? { customer_email: String(email).slice(0, 200) } : {}),
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['DE', 'AT', 'CH', 'FR', 'NL', 'BE', 'LU', 'IT', 'ES'] },
      phone_number_collection: { enabled: false },
      metadata: metaPersonal.length <= 500 ? { personalization: metaPersonal } : {},
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    })
    res.json({ url: session.url, id: session.id })
  } catch (e) {
    console.error('[checkout] failed:', e.message)
    res.status(500).json({ error: 'Could not start checkout.' })
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
async function persistOrder(session, items, personalization) {
  if (!pool) { console.log('[order] (no DB) ', JSON.stringify({ id: session.id, items, personalization })); return }
  await pool.query(
    `INSERT INTO orders (stripe_session, email, amount_total, currency, status, items, personalization)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (stripe_session) DO NOTHING`,
    [session.id, session.customer_details?.email || null, session.amount_total, session.currency, session.payment_status, JSON.stringify(items), JSON.stringify(personalization)],
  )
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
