// Legt einen ECHTEN, einlösbaren Rabattcode bei Stripe an (Coupon +
// Promotion-Code). EHRLICHKEIT: Ein Rabattcode-Newsletter darf nur Codes
// bewerben, die an der Kasse wirklich funktionieren — deshalb entsteht der
// Code HIER (Stripe-API) und /api/checkout hat allow_promotion_codes aktiv.
//
// Aufruf: node scripts/newsletter/create-promo.mjs CODE PROZENT [TAGE_GUELTIG] [MAX_EINLOESUNGEN]
// Beispiel: node scripts/newsletter/create-promo.mjs SOMMER15 15 14 100
import { readFileSync } from 'node:fs'

const [code, percentArg, daysArg, maxArg] = process.argv.slice(2)
const percent = Number(percentArg)
if (!code || !/^[A-Z0-9]{4,20}$/.test(code) || !Number.isFinite(percent) || percent < 1 || percent > 90) {
  console.error('Aufruf: create-promo.mjs CODE(4-20 A-Z0-9) PROZENT(1-90) [TAGE] [MAX]')
  process.exit(2)
}
const days = Number(daysArg) || 14
const max = Number(maxArg) || undefined

const envFile = readFileSync(new URL('../../.env', import.meta.url), 'utf8')
const KEY = process.env.STRIPE_SECRET_KEY || (envFile.match(/^STRIPE_SECRET_KEY=(.+)$/m) || [])[1]?.trim()
if (!KEY) { console.error('STRIPE_SECRET_KEY fehlt'); process.exit(2) }
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' }

const form = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== undefined)).toString()

// 1 — Coupon (einmalig pro Bestellung anwendbar)
const cRes = await fetch('https://api.stripe.com/v1/coupons', {
  method: 'POST', headers: H,
  body: form({ percent_off: percent, duration: 'once', name: `${code} (-${percent} %)` }),
})
const coupon = await cRes.json()
if (!cRes.ok) { console.error(`Coupon fehlgeschlagen: ${coupon.error?.message}`); process.exit(1) }

// 2 — Promotion-Code (der Text, den Kunden eingeben). Neuere Stripe-API-
// Versionen erwarten das verschachtelte `promotion`-Objekt statt `coupon`.
const expiresAt = Math.floor(Date.now() / 1000) + days * 86400
const pRes = await fetch('https://api.stripe.com/v1/promotion_codes', {
  method: 'POST', headers: H,
  body: form({ 'promotion[type]': 'coupon', 'promotion[coupon]': coupon.id, code, expires_at: expiresAt, max_redemptions: max }),
})
const promo = await pRes.json()
if (!pRes.ok) { console.error(`Promotion-Code fehlgeschlagen: ${promo.error?.message}`); process.exit(1) }

const until = new Date(expiresAt * 1000).toISOString().slice(0, 10)
console.log(JSON.stringify({ ok: true, code: promo.code, percent, gueltigBis: until, maxEinloesungen: max ?? 'unbegrenzt', couponId: coupon.id, promoId: promo.id, livemode: promo.livemode }, null, 1))
console.log(`\nNewsletter dazu: node scripts/newsletter/generate-promo.mjs ${promo.code} ${percent} ${until}`)
