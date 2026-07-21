// SizhuAtelier — static SPA host + Stripe checkout + order webhook.
// Everything external is env-gated: the server boots and serves the shop even
// with no keys; payment/persistence/email light up as their env vars appear.
import express from 'express'
import compression from 'compression'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'
import { randomUUID, scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto'
import { priceLineItemCents, computeShippingCents, regionFromCountry, currencyForRegion } from './pricing.js'
import { personalizationGateError } from './personalizationGate.js'
import { fufireEnabled, calculateBazi, calculateWestern, geocodePlace, matchHehun } from './fufire.js'
import { gelatoEnabled, createOrder as gelatoCreateOrder } from './gelato.js'
import { fulfillOrder, ensurePrintTables, buildFulfillmentAlertMail } from './fulfillment.js'
import { renderPosterPdf } from './pdf.js'
import { buildConfirmEmail, confirmResultHtml, unsubscribeResultHtml } from './newsletter.js'
import { runBroadcast, BROADCAST_SERIES } from './broadcast.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.resolve(__dirname, '..', 'dist')

const PORT = process.env.PORT || 3000
const CURRENCY = (process.env.CURRENCY || 'eur').toLowerCase()
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
// Public origin used for Stripe success/cancel redirects. Falls back to the
// Railway-provided domain, then to the request origin at call time.
const PUBLIC_URL = (process.env.PUBLIC_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '')).replace(/\/$/, '')

// `let` (not `const`) so the `createApp({ stripe })` test factory can inject a
// stubbed Stripe SDK and drive the REAL /api/checkout route without a live key
// (REQ-015 AK-4). Production still derives it from STRIPE_SECRET_KEY below.
let stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null
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
    -- DORMANT (REQ-010): credits_reserved is a Celestial-Credits carry-over with
    -- no readers/writers; left in place (DEFAULT 20) so the production column is
    -- not dropped. Scheduled for the separate credits DROP migration.
    credits_reserved INTEGER NOT NULL DEFAULT 20,
    marketing_consent_at TIMESTAMPTZ,
    source TEXT
  )`).catch((e) => console.error('[db] newsletter init failed:', e.message))
  // Add the marketing-consent timestamp + source columns to pre-existing tables.
  await pool.query('ALTER TABLE newsletter_signups ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ').catch(() => {})
  await pool.query('ALTER TABLE newsletter_signups ADD COLUMN IF NOT EXISTS source TEXT').catch(() => {})
  // DORMANT / DECOMMISSIONED (REQ-010): the Celestial-Credits machinery was
  // retired. No code reads or writes credits_ledger anymore (the sole writer,
  // recordCreditsEarned, was removed). This CREATE IF NOT EXISTS is kept ONLY so
  // a pre-existing production table is not implicitly dropped; it is scheduled
  // for removal via a separate, explicit DROP migration (FOLLOW-UP: db-drop
  // credits decommission). Do NOT add new readers/writers.
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
    -- DORMANT (REQ-010): Celestial-Credits columns. No code reads or writes
    -- them anymore; kept here only so a pre-existing production table is not
    -- dropped. Scheduled for removal via the separate credits DROP migration.
    points_balance INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    marketing_consent BOOLEAN NOT NULL DEFAULT false,
    marketing_consent_at TIMESTAMPTZ,
    newsletter_status TEXT NOT NULL DEFAULT 'none',
    -- DORMANT (REQ-010): gamification carry-overs, no readers/writers remain.
    unlocked_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
    reset_token TEXT,
    reset_expires TIMESTAMPTZ,
    name TEXT,
    preferred_language TEXT,
    default_shipping_address_id INTEGER,
    default_billing_address_id INTEGER,
    stripe_customer_id TEXT
  )`).catch((e) => console.error('[db] users init failed:', e.message))
  // Idempotent migrations: add the full-account columns to pre-existing tables.
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT').catch(() => {})
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT').catch(() => {})
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS default_shipping_address_id INTEGER').catch(() => {})
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS default_billing_address_id INTEGER').catch(() => {})
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT').catch(() => {})
  await pool.query(`CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'shipping',
    full_name TEXT,
    line1 TEXT,
    line2 TEXT,
    postal_code TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    phone TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`).catch((e) => console.error('[db] addresses init failed:', e.message))
  console.log('[db] Postgres connected')
  // Print-Fulfillment-Tabellen (prints + orders.fulfillment_status), idempotent.
  await ensurePrintTables(pool).catch((e) => console.error('[db] prints init failed:', e.message))
}

// ---- optional email (Resend) ----------------------------------------------
let resend = null
if (process.env.RESEND_API_KEY) {
  const { Resend } = await import('resend')
  resend = new Resend(process.env.RESEND_API_KEY)
  console.log('[mail] Resend ready')
}
const FROM_EMAIL = process.env.ORDER_FROM_EMAIL || 'SizhuAtelier <orders@sizhuatelier.shop>'
// Operator 2026-07-15: Newsletter-Mails kommen von einer EIGENEN Absenderadresse
// (newsletter@…), Bestell-/Konto-Mails von orders@… — beide env-überschreibbar.
const NEWSLETTER_FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || 'SizhuAtelier <newsletter@sizhuatelier.shop>'
const NOTIFY_EMAIL = process.env.ORDER_NOTIFY_EMAIL || ''

const app = express()
app.disable('x-powered-by')
// gzip/deflate every text response (HTML, JS, CSS, JSON). Without this the
// content-hashed bundles ship raw — ~3x larger over the wire on every visit.
app.use(compression())

// Human-readable money for order mail + logs. DISPLAY ONLY — the AUTHORITATIVE
// charge currency is whatever Stripe settled (`session.currency`), which we mirror
// here so a US order reads in $, a UK order in £, never a hardcoded €. Falls back
// to the CURRENCY env only when no per-order currency is supplied; an unrecognised
// code also falls back so `toLocaleString` can never throw on bad external data.
export function money(cents, currency) {
  const raw = String(currency || CURRENCY).toUpperCase()
  const code = /^[A-Z]{3}$/.test(raw) ? raw : CURRENCY.toUpperCase()
  const value = Number.isFinite(Number(cents)) ? Number(cents) / 100 : 0
  return value.toLocaleString('de-DE', { style: 'currency', currency: code })
}

// ---- in-memory per-IP rate limiter (single instance; use Redis for a cluster) ---
const rlBuckets = new Map()
function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
}
function rateLimited(req, name, max, windowMs) {
  const key = `${name}:${clientIp(req)}`
  const now = Date.now()
  const b = rlBuckets.get(key)
  if (!b || now > b.resetAt) { rlBuckets.set(key, { count: 1, resetAt: now + windowMs }); return false }
  b.count += 1
  return b.count > max
}
setInterval(() => { const now = Date.now(); for (const [k, b] of rlBuckets) if (now > b.resetAt) rlBuckets.delete(k) }, 600000).unref?.()

// ---- Stripe webhook (must read the RAW body — mount before express.json) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // Read the signing secret per request: Railway can rotate it without this
  // module retaining the value captured at import time, and the real route
  // remains testable without ever putting a secret in source control.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!stripe || !webhookSecret) return res.status(503).send('webhook not configured')
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret)
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
      await sendEmails(full, items, personalization)
      console.log(`[order] ${full.id} · ${money(full.amount_total, full.currency)} · ${full.customer_details?.email}`)
      // Print-Fulfillment: exakte Neu-Berechnung → Druck-PDF → Gelato-Draft.
      // Fehler eskalieren als 'failed'-Status + Log, NIE als Webhook-4xx/5xx —
      // Stripe darf nicht endlos retryen, der Operator wird benachrichtigt.
      try {
        const fr = await fulfillOrder({
          session: full,
          personalization,
          deps: { pool, fufire, renderPdf: renderPosterPdf, gelato, publicUrl: PUBLIC_URL },
        })
        if (fr.failed.length > 0) {
          console.error('[fulfillment] failed parts:', JSON.stringify(fr.failed))
          await notifyFulfillmentFailure(full.id, fr.failed)
        } else if (fr.printed.length > 0) console.log(`[fulfillment] ${full.id} printed=${fr.printed.length} submitted=${fr.submitted.length}`)
      } catch (e) {
        console.error('[fulfillment] fatal:', e.message)
        await pool?.query('UPDATE orders SET fulfillment_status=$1 WHERE stripe_session=$2', ['failed', full.id]).catch(() => {})
        await notifyFulfillmentFailure(full.id, [{ lineKey: '*', reason: `fatal: ${e.message}` }])
      }
    } catch (e) {
      console.error('[webhook] handling failed:', e.message)
      // Never acknowledge an order we could not persist. A non-2xx response
      // makes Stripe retry the event instead of silently losing a paid order.
      return res.status(500).json({ error: 'webhook handling failed' })
    }
  }
  res.json({ received: true })
})

app.use(express.json())

// ---- health ----------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, stripe: !!stripe, db: !!pool, email: !!resend, publicUrl: PUBLIC_URL || null })
})

// ---- shipping region (trusted-edge country header ONLY) ---------------------
// Country→region classification lives in ONE place — `regionFromCountry` in
// pricing.js. This DISPLAY route and the CHARGE route (/api/checkout) both derive
// the region from that single function, so the currency a shopper SEES and the
// currency they are CHARGED can never silently diverge (FM-06). region-currency
// tests pin the region to `regionFromCountry` across a representative sample.
//
// RL-GEO (Gate B, 2026-07-03): geo headers (cf-ipcountry / x-vercel-ip-country /
// x-geo-country / x-country) are CLIENT-SPOOFABLE unless a trusted edge
// (Cloudflare/Vercel) sets them AND strips inbound copies. Railway does neither, so
// blindly trusting them let a shopper send `x-country: US` for FREE shipping +
// USD/GBP FX settlement of EUR amounts. We now read a geo header ONLY when
// `TRUSTED_GEO_HEADER` names the header a trusted edge sets; otherwise the country is
// UNKNOWN and the region falls back to `DEFAULT_REGION` (base 'eu' → EUR + standard
// shipping). Read at request time so it stays test-injectable. Set
// `TRUSTED_GEO_HEADER=cf-ipcountry` ONLY once the app actually sits behind an edge
// that sets+strips that header — never before.
function countryFromRequest(req) {
  const trusted = String(process.env.TRUSTED_GEO_HEADER || '').toLowerCase()
  if (!trusted) return '' // no trusted edge → never trust a client-sent geo header
  return String(req.headers[trusted] || '').toUpperCase()
}

app.get('/api/region', (req, res) => {
  const country = countryFromRequest(req)
  const region = regionFromCountry(country, process.env.DEFAULT_REGION || 'eu')
  res.json({ region, country: country || null })
})

// ---- BaZi-Berechnung + Geocoding (FuFirE-Proxy) ------------------------------
// Der Browser spricht NIE direkt mit FuFirE — der API-Key lebt nur hier
// (Muster: STRIPE_SECRET_KEY). `let` + createApp-Override wie bei `stripe`,
// damit die REALEN Routen mit gestubbtem Client testbar sind.
// Ehrlichkeits-Regel (OQ-004): nicht konfiguriert/Upstream-Fehler → 503/502,
// NIEMALS ein Platzhalter-Chart als echt ausliefern.
let fufire = { enabled: fufireEnabled, calculateBazi, calculateWestern, geocodePlace, matchHehun }
// Gelato-Client — gleiches Override-Muster (createApp({ gelato })) für Tests.
let gelato = { enabled: gelatoEnabled, createOrder: gelatoCreateOrder }

// ---- geschützte Druck-PDF-Auslieferung (Gelato holt die Datei hier ab) ------
// Token = randomUUID pro Print (server/fulfillment.js); Vergleich timing-safe.
// Auf dem PDF stehen Geburtsdaten — ohne gültigen Token immer 404, nie ein
// Hinweis, ob die Session existiert (Datenschutz).
app.get('/prints/:sessionId/:token.pdf', async (req, res) => {
  if (!pool) return res.status(404).end()
  try {
    const r = await pool.query('SELECT token, pdf FROM prints WHERE stripe_session=$1', [req.params.sessionId])
    const given = Buffer.from(String(req.params.token))
    for (const row of r.rows) {
      const actual = Buffer.from(String(row.token))
      if (given.length === actual.length && timingSafeEqual(given, actual)) {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Cache-Control', 'private, no-store')
        return res.send(row.pdf)
      }
    }
    return res.status(404).end()
  } catch (e) {
    console.error('[prints] lookup failed:', e.message)
    return res.status(404).end()
  }
})

app.post('/api/bazi', async (req, res) => {
  if (!fufire.enabled()) return res.status(503).json({ error: 'bazi_unavailable' })
  if (rateLimited(req, 'bazi', 60, 60000)) return res.status(429).json({ error: 'rate_limited' })
  const { date, time, lat, lon, tz, birthTimeUnknown } = req.body || {}
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return res.status(400).json({ error: 'invalid_date' })
  if (!/^\d{2}:\d{2}$/.test(String(time || ''))) return res.status(400).json({ error: 'invalid_time' })
  if (typeof lat !== 'number' || typeof lon !== 'number' || typeof tz !== 'string' || !tz) {
    return res.status(400).json({ error: 'invalid_place' })
  }
  try {
    const chart = await fufire.calculateBazi({
      date: `${date}T${time}:00`,
      tz,
      lon,
      lat,
      birthTimeKnown: birthTimeUnknown !== true,
    })
    return res.json(chart)
  } catch (e) {
    console.error('[fufire] bazi failed:', e.message)
    return res.status(502).json({ error: 'bazi_failed' })
  }
})

// Westliches Geburtshoroskop (Birth-Chart-Poster, Operator 2026-07-14):
// gleiche Validierung/Env-Gates wie /api/bazi; Proxy auf /v1/calculate/western.
app.post('/api/western', async (req, res) => {
  if (!fufire.enabled()) return res.status(503).json({ error: 'western_unavailable' })
  if (rateLimited(req, 'western', 60, 60000)) return res.status(429).json({ error: 'rate_limited' })
  const { date, time, lat, lon, tz, birthTimeUnknown } = req.body || {}
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return res.status(400).json({ error: 'invalid_date' })
  if (!/^\d{2}:\d{2}$/.test(String(time || ''))) return res.status(400).json({ error: 'invalid_time' })
  if (typeof lat !== 'number' || typeof lon !== 'number' || typeof tz !== 'string' || !tz) {
    return res.status(400).json({ error: 'invalid_place' })
  }
  try {
    const chart = await fufire.calculateWestern({
      date: `${date}T${time}:00`,
      tz,
      lon,
      lat,
      birthTimeKnown: birthTimeUnknown !== true,
    })
    return res.json(chart)
  } catch (e) {
    console.error('[fufire] western failed:', e.message)
    return res.status(502).json({ error: 'western_failed' })
  }
})

// Paar-Analyse (合婚) für das Partner-Poster. Validierung je Person wie
// /api/bazi; consent setzt der Server (Operator-Entscheidung), keine UI-Box.
app.post('/api/match', async (req, res) => {
  if (!fufire.enabled()) return res.status(503).json({ error: 'match_unavailable' })
  if (rateLimited(req, 'match', 30, 60000)) return res.status(429).json({ error: 'rate_limited' })
  const { a, b } = req.body || {}
  for (const [label, p] of [['a', a], ['b', b]]) {
    if (!p || typeof p !== 'object') return res.status(400).json({ error: `invalid_person_${label}` })
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(p.date || ''))) return res.status(400).json({ error: `invalid_date_${label}` })
    if (!/^\d{2}:\d{2}$/.test(String(p.time || ''))) return res.status(400).json({ error: `invalid_time_${label}` })
    if (typeof p.lat !== 'number' || typeof p.lon !== 'number' || typeof p.tz !== 'string' || !p.tz) {
      return res.status(400).json({ error: `invalid_place_${label}` })
    }
  }
  const toInput = (p) => ({
    date: `${p.date}T${p.time}:00`,
    tz: p.tz,
    lon: p.lon,
    lat: p.lat,
    birthTimeKnown: p.birthTimeUnknown !== true,
  })
  try {
    return res.json(await fufire.matchHehun(toInput(a), toInput(b)))
  } catch (e) {
    console.error('[fufire] match failed:', e.message)
    return res.status(502).json({ error: 'match_failed' })
  }
})

app.post('/api/geocode', async (req, res) => {
  if (!fufire.enabled()) return res.status(503).json({ error: 'geocode_unavailable' })
  if (rateLimited(req, 'geocode', 30, 60000)) return res.status(429).json({ error: 'rate_limited' })
  const place = String((req.body || {}).place || '').trim()
  if (!place || place.length > 200) return res.status(400).json({ error: 'invalid_place' })
  try {
    return res.json(await fufire.geocodePlace(place))
  } catch (e) {
    console.error('[fufire] geocode failed:', e.message)
    return res.status(502).json({ error: 'geocode_failed' })
  }
})

// ---- create checkout session ------------------------------------------------
app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payment is not configured yet (missing STRIPE_SECRET_KEY).' })
  try {
    const { items, locale, email } = req.body || {}
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart is empty.' })

    // ── Server-authoritative region + currency (REQ-016 / AT-016-7) ──────────
    // Region comes from countryFromRequest (RL-GEO: a TRUSTED-EDGE geo header only,
    // never a spoofable client header — no free-shipping/FX bypass); the line-item
    // currency FOLLOWS the region via the declarative server map (us→USD, uk→GBP,
    // eu→EUR). Any client-supplied currency is IGNORED, exactly like client
    // `unitAmount` / `shippingCents` (FM-06). Stripe wants the ISO code lowercased.
    const country = countryFromRequest(req)
    const region = regionFromCountry(country, process.env.DEFAULT_REGION || 'eu')
    const currency = currencyForRegion(region).toLowerCase()

    // ── Server-authoritative re-pricing (ADR-001 / REQ-001) ──────────────────
    // The client-supplied `it.unitAmount` and `shippingCents` are IGNORED. Each
    // line's price is resolved from the server-owned price table by its stable
    // (productId + variantId) identity. An unknown id → 4xx and Stripe is never
    // called (no 1-cent checkout, no free-shipping tampering).
    const line_items = []
    const personalization = {}
    let subtotalCents = 0
    for (const [i, it] of items.entries()) {
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1))
      const cents = priceLineItemCents(it.productId, it.variantId)
      if (cents === null || !Number.isInteger(cents) || cents <= 0) {
        return res.status(400).json({ error: 'Unknown product or variant.' })
      }
      // Order-Gate (Batch #12 R3, Bereich 8): personalisierte Produkte ohne
      // Pflicht-Geburtsdaten werden VOR Stripe abgelehnt — eine bezahlte, aber
      // unerfüllbare Bestellung darf es nie geben (server/personalizationGate.js).
      const gateError = personalizationGateError(it.productId, it.personalization)
      if (gateError) {
        return res.status(400).json({ error: `Missing required personalization data (${gateError}).` })
      }
      subtotalCents += cents * qty
      line_items.push({
        quantity: qty,
        price_data: {
          currency,
          unit_amount: cents,
          product_data: { name: String(it.title || 'Poster').slice(0, 120), ...(it.meta ? { description: String(it.meta).slice(0, 200) } : {}) },
        },
      })
      // R5 (#9): JEDE Line bekommt einen Metadaten-Datensatz (productId,
      // variantId, qty) — vorher trugen die Metadaten NUR personalisierte
      // Lines, und bezahlte Katalog-Poster wurden vom Fulfillment still
      // übersprungen. Die Identitätsfelder stehen NACH dem Spread, damit
      // Client-personalization sie nie überschreiben kann (server-authoritativ).
      personalization[`line${i + 1}`] = {
        ...(it.personalization && typeof it.personalization === 'object' ? it.personalization : {}),
        productId: String(it.productId),
        variantId: String(it.variantId || ''),
        qty: String(qty),
      }
    }

    // Shipping is computed server-side from region (CDN header) + subtotal,
    // replicating the documented ShopStore rule (REQ-002). Client `shippingCents`
    // is never trusted.
    const shipCents = computeShippingCents(region, subtotalCents)
    if (shipCents > 0) {
      line_items.push({ quantity: 1, price_data: { currency, unit_amount: shipCents, product_data: { name: 'Shipping' } } })
    }

    const origin = PUBLIC_URL || (req.headers.origin || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')
    // Stripe caps each metadata VALUE at 500 chars (and ~50 keys per object). A
    // couple or multi-line cart easily exceeds 500 chars, so chunk the
    // personalization JSON across numbered keys instead of silently dropping it —
    // the customer's birth data is the whole product and must reach fulfilment.
    const metadata = buildPersonalizationMetadata(personalization)

    // Attach a logged-in buyer to their Stripe customer so saved cards appear and
    // future purchases reuse the same profile. Stripe rejects `customer` together
    // with `customer_email`, so pass exactly one. A Stripe failure here must never
    // block guest checkout — fall back to the email path on any error.
    let customerId = null
    const uid = verifySession(readCookie(req, SESSION_COOKIE))
    if (uid && stripe) {
      try { customerId = await ensureStripeCustomer(uid) } catch (err) { console.error('[checkout] ensure customer failed:', err.message) }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      // Operator 2026-07-18 (Rabattcode-Newsletter): Promo-Codes sind an der
      // Stripe-Kasse einlösbar — Codes selbst entstehen NUR über
      // scripts/newsletter/create-promo.mjs (nie im Client erfunden).
      allow_promotion_codes: true,
      locale: ['en', 'de', 'fr'].includes((locale || '').toLowerCase()) ? locale.toLowerCase() : 'auto',
      ...(customerId ? { customer: customerId } : (email ? { customer_email: String(email).slice(0, 200) } : {})),
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

// ---- fulfillment retry (Batch #12 R5, #9 — „Retry möglich") ----------------
// Der Operator stößt eine gescheiterte Fulfillment-Runde erneut an (z. B.
// nachdem ein fehlendes Druck-Asset registriert oder FuFirE wieder erreichbar
// ist). Gleiche Gating-Disziplin wie der Newsletter-Broadcast: ohne
// FULFILLMENT_RETRY_SECRET ist die Route 503, falsches Secret → 403.
// Doppel-Produktion ist technisch ausgeschlossen — fulfillOrder ist idempotent
// (UNIQUE(stripe_session,line_key) + gelato_order_id-Check).
app.post('/api/fulfillment/retry/:sessionId', async (req, res) => {
  const secret = process.env.FULFILLMENT_RETRY_SECRET || ''
  if (!secret || !stripe || !pool) return res.status(503).json({ error: 'fulfillment retry not configured' })
  const given = String(req.headers['x-retry-secret'] || '')
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(403).json({ error: 'forbidden' })
  try {
    const full = await stripe.checkout.sessions.retrieve(String(req.params.sessionId), { expand: ['line_items'] })
    const personalization = readPersonalizationMetadata(full.metadata)
    const fr = await fulfillOrder({
      session: full,
      personalization,
      deps: { pool, fufire, renderPdf: renderPosterPdf, gelato, publicUrl: PUBLIC_URL },
    })
    if (fr.failed.length > 0) {
      console.error('[fulfillment-retry] failed parts:', JSON.stringify(fr.failed))
      await notifyFulfillmentFailure(full.id, fr.failed)
    }
    return res.json(fr)
  } catch (e) {
    console.error('[fulfillment-retry] failed:', e.message)
    return res.status(500).json({ error: 'retry failed' })
  }
})

// ---- newsletter signup (lead capture, double-opt-in ready) -----------------
app.post('/api/newsletter', async (req, res) => {
  if (rateLimited(req, 'newsletter', 6, 600000)) return res.status(429).json({ error: 'rate_limited' })
  const { email, consent, language, source } = req.body || {}
  const e = String(email || '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) || e.length > 200) return res.status(400).json({ error: 'invalid_email' })
  if (consent !== true) return res.status(400).json({ error: 'consent_required' })
  const lang = ['en', 'de', 'fr'].includes(String(language || '').toLowerCase()) ? String(language).toLowerCase() : 'en'
  const src = typeof source === 'string' ? source.slice(0, 80) : 'newsletter'
  if (!pool) { console.log('[newsletter] (no DB) signup:', e, lang, src); return res.json({ ok: true, persisted: false }) }
  try {
    // Double-opt-in (Operator-Batch #8): store pending + confirm token, then send
    // the confirmation email via Resend. RETURNING yields the ROW token (an
    // existing signup keeps its token) and the status, so a re-signup of an
    // already-confirmed address is never downgraded and never re-mailed.
    const token = randomUUID()
    const r = await pool.query(
      `INSERT INTO newsletter_signups (email, language, consent, marketing_consent_at, source, status, confirm_token)
       VALUES ($1,$2,$3,$4,$5,'pending',$6)
       ON CONFLICT (email) DO UPDATE SET language = EXCLUDED.language, consent = EXCLUDED.consent, marketing_consent_at = EXCLUDED.marketing_consent_at, source = EXCLUDED.source
       RETURNING confirm_token, status`,
      [e, lang, true, new Date(), src, token],
    )
    const row = r.rows?.[0] || { confirm_token: token, status: 'pending' }
    let confirmSent = false
    if (resend && row.status === 'pending' && row.confirm_token) {
      try {
        const mail = buildConfirmEmail({ language: lang, token: row.confirm_token, publicUrl: PUBLIC_URL || `${req.protocol}://${req.get('host')}` })
        await resend.emails.send({ from: NEWSLETTER_FROM_EMAIL, to: e, subject: mail.subject, text: mail.text })
        confirmSent = true
      } catch (err) {
        console.error('[newsletter] confirm mail failed:', err.message)
      }
    }
    return res.json({ ok: true, persisted: true, confirmSent })
  } catch (err) {
    console.error('[newsletter] persist failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

// ---- newsletter double-opt-in confirm (link from the email) -----------------
app.get('/api/newsletter/confirm', async (req, res) => {
  const token = String(req.query.token || '')
  if (!pool || !token || token.length > 100) {
    return res.status(400).type('html').send(confirmResultHtml({ language: 'en', ok: false }))
  }
  try {
    const r = await pool.query(
      `UPDATE newsletter_signups SET status = 'confirmed' WHERE confirm_token = $1 AND status = 'pending' RETURNING email, language`,
      [token],
    )
    const row = r.rows?.[0]
    if (!row) return res.status(400).type('html').send(confirmResultHtml({ language: 'en', ok: false }))
    console.log('[newsletter] confirmed:', row.email)
    return res.type('html').send(confirmResultHtml({ language: row.language, ok: true }))
  } catch (err) {
    console.error('[newsletter] confirm failed:', err.message)
    return res.status(500).type('html').send(confirmResultHtml({ language: 'en', ok: false }))
  }
})

// ---- newsletter unsubscribe (Operator 2026-07-18: eigener Abmelde-Link) -----
app.get('/api/newsletter/unsubscribe', async (req, res) => {
  const token = String(req.query.token || '')
  if (!pool || !token || token.length > 100) {
    return res.status(400).type('html').send(unsubscribeResultHtml({ language: 'en', ok: false }))
  }
  try {
    const r = await pool.query(
      `UPDATE newsletter_signups SET status = 'unsubscribed' WHERE confirm_token = $1 AND status <> 'unsubscribed' RETURNING email, language`,
      [token],
    )
    const row = r.rows?.[0]
    if (!row) return res.status(400).type('html').send(unsubscribeResultHtml({ language: 'en', ok: false }))
    console.log('[newsletter] unsubscribed:', row.email)
    return res.type('html').send(unsubscribeResultHtml({ language: row.language, ok: true }))
  } catch (err) {
    console.error('[newsletter] unsubscribe failed:', err.message)
    return res.status(500).type('html').send(unsubscribeResultHtml({ language: 'en', ok: false }))
  }
})

// ---- newsletter broadcast (Operator 2026-07-18: VORBEREITET, nicht aktiv) ---
// Aktivierung ausschließlich durch Setzen von NEWSLETTER_BROADCAST_SECRET —
// ohne Secret 503. dryRun ist der Standard; echter Versand nur mit
// {"dryRun":false} UND korrektem X-Broadcast-Secret-Header.
app.post('/api/newsletter/broadcast', async (req, res) => {
  const secret = process.env.NEWSLETTER_BROADCAST_SECRET || ''
  if (!secret || !resend || !pool) return res.status(503).json({ error: 'broadcast not configured' })
  const given = String(req.headers['x-broadcast-secret'] || '')
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(403).json({ error: 'forbidden' })
  const { series, date, dryRun } = req.body || {}
  if (!BROADCAST_SERIES.includes(series) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    return res.status(400).json({ error: 'series (cosmic|offer|promo) und date (YYYY-MM-DD) erforderlich' })
  }
  try {
    const result = await runBroadcast({
      pool, resend, publicUrl: PUBLIC_URL || `${req.protocol}://${req.get('host')}`,
      from: NEWSLETTER_FROM_EMAIL, series, date, dryRun: dryRun !== false,
    })
    console.log(`[broadcast] ${series} ${date} dryRun=${result.dryRun} total=${result.total} sent=${result.sent} failures=${result.failures.length}`)
    return res.json(result)
  } catch (err) {
    console.error('[broadcast] failed:', err.message)
    return res.status(400).json({ error: err.message })
  }
})

// ---- auth (profile accounts) -----------------------------------------------
// Stateless sessions: an HMAC-signed cookie carrying the user id + expiry (no
// session table; tampering fails the HMAC check). Passwords are scrypt-hashed.
// NOTE: the Celestial-Credits machinery was decommissioned (REQ-010). No
// welcome credits are granted and no credits are read/written anywhere below;
// the underlying DB columns/table are left DORMANT (see schema notes above).
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
// Resolves the session user for auth-gated routes. Responds 401 and returns null
// when there is no valid session, so callers can `if (!uid) return`.
function requireUser(req, res) {
  const uid = verifySession(readCookie(req, SESSION_COOKIE))
  if (!uid) { res.status(401).json({ error: 'unauthorized' }); return null }
  return uid
}

app.post('/api/auth/signup', async (req, res) => {
  if (rateLimited(req, 'signup', 8, 600000)) return res.status(429).json({ error: 'rate_limited' })
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const { email, password, marketingConsent, name } = req.body || {}
  const e = String(email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(e) || e.length > 200) return res.status(400).json({ error: 'invalid_email' })
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) return res.status(400).json({ error: 'weak_password' })
  const nm = typeof name === 'string' ? name.trim().slice(0, 120) : null
  try {
    const consent = marketingConsent === true
    // Celestial Credits decommissioned (REQ-010): no welcome credits are granted.
    // points_balance / lifetime_points are left out of the INSERT — their column
    // DEFAULT (0/0) applies — and no credits_ledger welcome row is written.
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, marketing_consent, marketing_consent_at, newsletter_status, name)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING RETURNING id`,
      [e, hashPassword(password), consent, consent ? new Date() : null, consent ? 'subscribed' : 'none', nm || null],
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
  if (rateLimited(req, 'login', 10, 300000)) return res.status(429).json({ error: 'rate_limited' })
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
    // Celestial Credits decommissioned (REQ-010): the dormant points_balance /
    // lifetime_points / unlocked_features / achievements columns are no longer
    // selected or returned. The user response carries only the live profile.
    const r = await pool.query(
      `SELECT email, marketing_consent, newsletter_status, created_at,
              name, preferred_language, stripe_customer_id, default_shipping_address_id, default_billing_address_id
       FROM users WHERE id = $1`, [uid])
    if (!r.rows.length) return res.json({ user: null })
    const u = r.rows[0]
    return res.json({ user: {
      email: u.email,
      marketingConsent: u.marketing_consent, newsletterStatus: u.newsletter_status, createdAt: u.created_at,
      name: u.name || '', preferredLanguage: u.preferred_language || '', hasPayment: !!u.stripe_customer_id,
      defaultShippingAddressId: u.default_shipping_address_id || null, defaultBillingAddressId: u.default_billing_address_id || null,
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

// Update profile fields (name + preferred language). Only provided fields change.
app.patch('/api/auth/profile', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  const { name, preferredLanguage } = req.body || {}
  const sets = []
  const params = []
  if (typeof name === 'string') { params.push(name.trim().slice(0, 120)); sets.push(`name = $${params.length}`) }
  if (typeof preferredLanguage === 'string' && ['en', 'de', 'fr'].includes(preferredLanguage.toLowerCase())) {
    params.push(preferredLanguage.toLowerCase()); sets.push(`preferred_language = $${params.length}`)
  }
  if (!sets.length) return res.json({ ok: true })
  try {
    params.push(uid)
    await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length}`, params)
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] profile failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

// Change password for a logged-in user (verifies the current password first).
app.post('/api/auth/password', async (req, res) => {
  if (rateLimited(req, 'password', 10, 300000)) return res.status(429).json({ error: 'rate_limited' })
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  const { currentPassword, newPassword } = req.body || {}
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) return res.status(400).json({ error: 'weak_password' })
  try {
    const r = await pool.query('SELECT password_hash FROM users WHERE id = $1', [uid])
    if (!r.rows.length) return res.status(401).json({ error: 'unauthorized' })
    if (!verifyPassword(String(currentPassword || ''), r.rows[0].password_hash)) return res.status(400).json({ error: 'wrong_password' })
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashPassword(newPassword), uid])
    return res.json({ ok: true })
  } catch (err) {
    console.error('[auth] password change failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/auth/reset/request', async (req, res) => {
  if (rateLimited(req, 'reset_req', 5, 900000)) return res.status(429).json({ error: 'rate_limited' })
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
  if (rateLimited(req, 'reset_confirm', 12, 900000)) return res.status(429).json({ error: 'rate_limited' })
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

// ---- account: saved addresses (all scoped to the session user) -------------
const ADDRESS_TYPES = new Set(['shipping', 'billing'])
// Trim + cap a free-text field to keep stored rows small and predictable.
function capField(v, max) {
  return typeof v === 'string' && v.length ? v.trim().slice(0, max) : null
}
// Promote one address to default for its type: clear the rest of that type for
// the user, mark this one, and point the matching users.default_*_address_id at
// it. Caller MUST have verified the address belongs to uid.
async function setDefaultAddress(uid, addrId, type) {
  await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1 AND type = $2', [uid, type])
  await pool.query('UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2', [addrId, uid])
  const col = type === 'billing' ? 'default_billing_address_id' : 'default_shipping_address_id'
  await pool.query(`UPDATE users SET ${col} = $1 WHERE id = $2`, [addrId, uid])
}

// GET mirrors /api/auth/orders: never 401 — return [] when unconfigured / no session.
app.get('/api/account/addresses', async (req, res) => {
  if (!authReady()) return res.json({ addresses: [] })
  const uid = verifySession(readCookie(req, SESSION_COOKIE))
  if (!uid) return res.json({ addresses: [] })
  try {
    const r = await pool.query(
      `SELECT id, type, full_name, line1, line2, postal_code, city, region, country, phone, is_default, created_at
       FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at`, [uid])
    return res.json({ addresses: r.rows })
  } catch (err) {
    console.error('[account] addresses list failed:', err.message)
    return res.json({ addresses: [] })
  }
})

app.post('/api/account/addresses', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  const b = req.body || {}
  const type = ADDRESS_TYPES.has(String(b.type || '').toLowerCase()) ? String(b.type).toLowerCase() : 'shipping'
  const country = typeof b.country === 'string' && b.country.length ? b.country.trim().slice(0, 2).toUpperCase() : null
  try {
    const r = await pool.query(
      `INSERT INTO addresses (user_id, type, full_name, line1, line2, postal_code, city, region, country, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [uid, type, capField(b.full_name, 120), capField(b.line1, 120), capField(b.line2, 120), capField(b.postal_code, 120),
        capField(b.city, 120), capField(b.region, 120), country, capField(b.phone, 40)],
    )
    const id = r.rows[0].id
    // Become the default when explicitly asked, or when it is the first of its type.
    let makeDefault = b.makeDefault === true
    if (!makeDefault) {
      const c = await pool.query('SELECT COUNT(*)::int AS n FROM addresses WHERE user_id = $1 AND type = $2', [uid, type])
      if (c.rows[0].n === 1) makeDefault = true
    }
    if (makeDefault) await setDefaultAddress(uid, id, type)
    return res.json({ ok: true, id })
  } catch (err) {
    console.error('[account] address create failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.patch('/api/account/addresses/:id', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  const id = parseInt(req.params.id, 10)
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'not_found' })
  const b = req.body || {}
  const sets = []
  const params = []
  const add = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`) }
  // type is immutable after creation — changing it would leave a stale
  // users.default_*_address_id pointer (and is_default) on the wrong type.
  if (typeof b.full_name === 'string') add('full_name', capField(b.full_name, 120))
  if (typeof b.line1 === 'string') add('line1', capField(b.line1, 120))
  if (typeof b.line2 === 'string') add('line2', capField(b.line2, 120))
  if (typeof b.postal_code === 'string') add('postal_code', capField(b.postal_code, 120))
  if (typeof b.city === 'string') add('city', capField(b.city, 120))
  if (typeof b.region === 'string') add('region', capField(b.region, 120))
  if (typeof b.country === 'string') add('country', b.country.length ? b.country.trim().slice(0, 2).toUpperCase() : null)
  if (typeof b.phone === 'string') add('phone', capField(b.phone, 40))
  if (!sets.length) return res.json({ ok: true })
  try {
    params.push(id, uid)
    const r = await pool.query(
      `UPDATE addresses SET ${sets.join(', ')} WHERE id = $${params.length - 1} AND user_id = $${params.length}`, params)
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' })
    return res.json({ ok: true })
  } catch (err) {
    console.error('[account] address update failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.delete('/api/account/addresses/:id', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  const id = parseInt(req.params.id, 10)
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'not_found' })
  try {
    const r = await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, uid])
    if (!r.rowCount) return res.status(404).json({ error: 'not_found' })
    // If it was a stored default, clear the matching pointer on the user row.
    await pool.query(
      `UPDATE users SET default_shipping_address_id = CASE WHEN default_shipping_address_id = $1 THEN NULL ELSE default_shipping_address_id END,
                        default_billing_address_id  = CASE WHEN default_billing_address_id  = $1 THEN NULL ELSE default_billing_address_id  END
       WHERE id = $2`, [id, uid])
    return res.json({ ok: true })
  } catch (err) {
    console.error('[account] address delete failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/account/addresses/:id/default', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  const id = parseInt(req.params.id, 10)
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'not_found' })
  try {
    const r = await pool.query('SELECT type FROM addresses WHERE id = $1 AND user_id = $2', [id, uid])
    if (!r.rows.length) return res.status(404).json({ error: 'not_found' })
    await setDefaultAddress(uid, id, r.rows[0].type)
    return res.json({ ok: true })
  } catch (err) {
    console.error('[account] address default failed:', err.message)
    return res.status(500).json({ error: 'server_error' })
  }
})

// ---- account: Stripe billing portal (manage saved cards) -------------------
app.post('/api/account/billing-portal', async (req, res) => {
  if (!authReady()) return res.status(503).json({ error: 'auth_unconfigured' })
  const uid = requireUser(req, res)
  if (!uid) return
  if (!stripe) return res.status(503).json({ error: 'payment_unconfigured' })
  try {
    const customer = await ensureStripeCustomer(uid)
    if (!customer) return res.status(503).json({ error: 'payment_unconfigured' })
    const origin = PUBLIC_URL || (req.headers.origin || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')
    const session = await stripe.billingPortal.sessions.create({ customer, return_url: `${origin}/account` })
    return res.json({ url: session.url })
  } catch (err) {
    console.error('[account] billing portal failed:', err.message)
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
const ASSET_DIR = `${path.sep}assets${path.sep}`
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, {
    index: false,
    setHeaders: (res, filePath) => {
      // Files in /assets are content-hashed by Vite → safe to cache forever.
      // Everything else (images, favicon, manifest) keeps a short TTL since
      // their filenames are stable and may change in place.
      if (filePath.includes(ASSET_DIR)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600')
      }
    },
  }))
  // index.html must never be cached, so a new deploy is picked up immediately.
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(DIST, 'index.html'))
  })
} else {
  app.get('*', (_req, res) => res.status(503).send('Build missing — run `npm run build`.'))
}

// ── App factory + entrypoint guard ──────────────────────────────────────────
// Tests import `createApp({ stripe })` to drive the REAL routes (incl. the
// money-path /api/checkout) with a stubbed Stripe SDK and no live key — without
// binding a port (REQ-015 / ADR-001). The route reads the module `stripe`/`pool`
// bindings at request time, so injecting them here makes the real path testable
// while production behaviour is unchanged.
export function createApp(overrides = {}) {
  if ('stripe' in overrides) stripe = overrides.stripe
  if ('pool' in overrides) pool = overrides.pool
  if ('fufire' in overrides) fufire = overrides.fufire
  if ('gelato' in overrides) gelato = overrides.gelato
  if ('mailer' in overrides) resend = overrides.mailer
  return app
}

// Only bind a port when this file is the process entrypoint (`npm start`/Railway).
// Importing it from a test (supertest) must NOT start a listener.
const isEntrypoint = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (isEntrypoint) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SizhuAtelier server on :${PORT} — stripe=${!!stripe} db=${!!pool} email=${!!resend}`)
  })
}

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
  if (!pool) throw new Error('database not configured — paid order cannot be persisted')
  await pool.query(
    `INSERT INTO orders (stripe_session, email, amount_total, currency, status, items, personalization)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (stripe_session) DO NOTHING`,
    [session.id, session.customer_details?.email || null, session.amount_total, session.currency, session.payment_status, JSON.stringify(items), JSON.stringify(personalization)],
  )
}

// Celestial Credits earning (REQ-045) was DECOMMISSIONED (REQ-010): the
// `recordCreditsEarned` writer — the only code that wrote to credits_ledger and
// the users points columns — has been removed. The order-completion path no
// longer calls it; order persistence, emails and the price/shipping/VAT
// computation are untouched. The credits_ledger table and the points columns are
// left DORMANT (no reader/writer remains) pending a separate DROP migration.

// Resolve (and lazily create) the Stripe customer for a logged-in user, caching
// the id on the user row. Returns null when Stripe/DB are unconfigured so callers
// can fall back to guest behavior. We store ONLY the Stripe customer id — saved
// cards live in Stripe and are managed via the billing portal (no raw PAN/CVC).
async function ensureStripeCustomer(uid) {
  if (!stripe || !pool) return null
  const r = await pool.query('SELECT email, stripe_customer_id FROM users WHERE id = $1', [uid])
  if (!r.rows.length) return null
  if (r.rows[0].stripe_customer_id) return r.rows[0].stripe_customer_id
  const customer = await stripe.customers.create({ email: r.rows[0].email || undefined, metadata: { uid: String(uid) } })
  await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customer.id, uid])
  return customer.id
}

// Pure builder for the customer-facing order strings (line items, total, the
// personalization block). Every amount is formatted in `session.currency` — the
// currency Stripe actually settled — so the confirmation a US/UK buyer receives
// reads in $/£, not a hardcoded €. Display-only: it never touches what is charged.
export function buildOrderSummary(session, items, personalization = {}) {
  const currency = session?.currency
  const lines = (items || [])
    .map((i) => `• ${i.qty}× ${i.description || 'Poster'} — ${money(i.amount, currency)}`)
    .join('\n')
  const total = money(session?.amount_total, currency)
  const personalText = Object.keys(personalization).length
    ? '\n\nPersonalisierung:\n' + Object.entries(personalization).map(([k, v]) => `${k}: ${typeof v === 'object' ? Object.entries(v).map(([a, b]) => `${a}=${b}`).join(', ') : v}`).join('\n')
    : ''
  return { lines, total, personalText }
}

async function sendEmails(session, items, personalization) {
  const email = session.customer_details?.email
  const { lines, total, personalText } = buildOrderSummary(session, items, personalization)
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

// Batch #12 R6: Alarm-Mail bei Fulfillment-Fehlschlag — eine bezahlte, aber
// nicht produzierte Bestellung erreicht den Operator SOFORT (vorher nur
// DB-Status + Log). ORDER_NOTIFY_EMAIL wird zur LAUFZEIT gelesen (testbar);
// ein Mail-Fehler bricht nie den Webhook/Retry (nur Log).
async function notifyFulfillmentFailure(sessionId, failed) {
  const notify = process.env.ORDER_NOTIFY_EMAIL || ''
  if (!resend || !notify) return
  try {
    const mail = buildFulfillmentAlertMail({ sessionId, failed, publicUrl: PUBLIC_URL })
    await resend.emails.send({ from: FROM_EMAIL, to: notify, subject: mail.subject, text: mail.text })
  } catch (e) {
    console.error('[fulfillment-alert] mail failed:', e.message)
  }
}
