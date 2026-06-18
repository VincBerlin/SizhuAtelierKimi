# SizhuAtelier — Operator Handoff (pre-launch)

What the operator must provide / decide before going live. The app **boots and runs without any of these** (every integration is env-gated) — but the features below stay inert until configured.

## 1. Environment variables

Set in Railway (prod) or `.env` (local). Reference: `.env.example`.

| Variable | Required for | If missing |
|---|---|---|
| `STRIPE_SECRET_KEY` | Checkout + Stripe customer + billing portal | `/api/checkout` → 503; no payments |
| `STRIPE_WEBHOOK_SECRET` | Order persistence on payment | Orders not recorded from webhook |
| `PUBLIC_URL` | Stripe success/cancel + reset-email + portal return URLs | Falls back to request origin (set explicitly) |
| `CURRENCY` | Stripe line currency (default `eur`) | Defaults to eur |
| `DATABASE_URL` | Orders, accounts, Celestial Credits, addresses, newsletter | All DB features off; auth → 503 |
| `SESSION_SECRET` | Auth (signed session cookies) | **Auth disabled** until set (login/signup → 503) |
| `RESEND_API_KEY` | Confirmation + password-reset emails | No emails sent (reset tokens still created) |
| `ORDER_FROM_EMAIL` / `ORDER_NOTIFY_EMAIL` | From / internal new-order notice | Defaults / no internal notice |

Generate a session secret: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## 2. Code blocker before real money

- **Server-side price validation.** `/api/checkout` currently trusts the client-sent `unitAmount` (positive-int sanity check only). A tampered request can lower line prices. Authoritative fix = have the cart lines carry product id + size and **re-price on the server** from a price table. Deferred deliberately while prices are placeholders — **do this before charging real cards.** (See the TODO comment in `server/index.js` checkout route.)

## 3. Content the operator owns (placeholders in the repo)

- **Product imagery / storytelling.** Replace any remaining atelier / brush / ink-jar / manufaktur photos with the intended visual language: mathematical geometry, fine vector element-lines (Wood/Fire/Earth/Metal/Water), dashboard/precision visuals, clean poster mockups, modern luxury interiors. (Framing copy is already cleaned; the **images** are the open item.)
- **TCM teaching posters (SKUs id 11–14)** in `src/lib/catalog.ts` are **placeholder** — real product images, prices and copy needed (TCM Educational / Practice / Wellness / Yoga). Fire Horse (id 8) image/price likewise placeholder.
- **All catalog prices are placeholder** — replace with real prices (and then wire §2).
- **Legal / company data — MISSING, never invented.** Impressum, AGB/Terms, contact entity details are PLACEHOLDER (e.g. the returns FAQ item is flagged `placeholder`). Provide real legal-entity data and the actual return/withdrawal policy. **DE/FR legal page bodies are still English** — translate.
- **OG / share image** uses a relative path — set an absolute URL on the prod domain.

## 4. Stripe setup

- Add a webhook endpoint → `POST {PUBLIC_URL}/api/webhook` for `checkout.session.completed`; put its signing secret in `STRIPE_WEBHOOK_SECRET`.
- Enable the **Customer Portal** (Billing → Customer portal) so "Manage payment methods" works.
- Start with `sk_test_…`, switch to live keys only after §2.

## 5. Infrastructure

- **Postgres**: Railway Postgres plugin sets `DATABASE_URL`. Tables auto-create on boot (`users`, `addresses`, `orders`, `newsletter_signups`, `credits_ledger`).
- **Rate limiting is in-memory / single-instance.** For more than one server instance, move it to Redis/Upstash (keys: `login`/`signup`/`password`/`reset_*`/`newsletter` per IP). Stamped in `server/index.js`.

## 6. Go-live checklist

- [ ] All required env vars set; `npm run build` green; `node --check server/index.js`.
- [ ] Real prices in `catalog.ts` **and** server-side re-pricing wired (§2).
- [ ] Real product/TCM/Fire-Horse images + the storytelling image swap (§3).
- [ ] Legal pages filled with real entity data; DE/FR translated; returns policy accurate.
- [ ] Stripe live keys + webhook + Customer Portal; one real test order end-to-end.
- [ ] Signup → dashboard → address CRUD → checkout autofill verified against the live DB.
- [ ] Redis-backed rate limit if running >1 instance.
- [ ] Mobile pass (360/390/430) on the deployed URL.
