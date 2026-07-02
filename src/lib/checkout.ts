import type { CartLine } from '../store/ShopStore'

export interface CheckoutResult {
  ok: boolean
  error?: string
}

// ── Stable line identity (ADR-001) ──────────────────────────────────────────
// The server re-prices each cart line from (productId, variantId). These MUST
// stay in lock-step with server/pricing.js (POSTER_PRODUCT_PREFIX /
// PTYPE_PRODUCT_PREFIX and the variant key names) — the parity unit tests
// (AT-001-4) fail on any drift.
export const POSTER_PRODUCT_PREFIX = 'poster:'
export const PTYPE_PRODUCT_PREFIX = 'ptype:'
export const BUNDLE_PRODUCT_PREFIX = 'bundle:'
export const ADDON_PRODUCT_PREFIX = 'addon:'
export const DIGITAL_PRODUCT_PREFIX = 'digital:'

export const posterProductId = (id: number): string => `${POSTER_PRODUCT_PREFIX}${id}`
export const ptypeProductId = (typeId: string): string => `${PTYPE_PRODUCT_PREFIX}${typeId}`
export const bundleProductId = (id: string): string => `${BUNDLE_PRODUCT_PREFIX}${id}`
export const addonProductId = (id: string): string => `${ADDON_PRODUCT_PREFIX}${id}`
export const digitalProductId = (id: string): string => `${DIGITAL_PRODUCT_PREFIX}${id}`

// Build the variantId string the server parses: priced axes are `size` and
// `pdf`; `frame` is carried for identity/fulfilment only (no price effect).
export function buildVariantId(opts: { size?: string; frame?: string; pdf?: boolean }): string {
  const parts: string[] = []
  if (opts.size) parts.push(`size=${opts.size}`)
  if (opts.frame) parts.push(`frame=${opts.frame}`)
  if (opts.pdf) parts.push('pdf=1')
  return parts.join(';')
}

// Single source of truth for the checkout completeness gate (REQ-016): true when
// any personalized line is missing required birth data. Used by both the cart
// drawer and the Checkout page so the two gates can never silently desync.
export function cartHasIncompletePersonalization(cart: CartLine[]): boolean {
  return cart.some((l) => {
    const p = l.personalization
    if (!p) return false
    // Person A — always required.
    if (!p.name || !p.date || !p.place) return true
    // Birth time — required unless explicitly marked unknown. Only enforced when
    // the line carries the unknownTime flag, so a line without it is not wrongly blocked.
    if (p.unknownTime !== undefined && p.unknownTime !== 'true' && !p.time) return true
    // Couple — Person B required, with the same time rule.
    if (p.productType === 'couple') {
      if (!p.nameB || !p.dateB || !p.placeB) return true
      if (p.unknownTime !== undefined && p.unknownTime !== 'true' && !p.timeB) return true
    }
    return false
  })
}

// POSTs the cart to the backend, which creates a Stripe Checkout Session and
// returns its hosted URL. On success the browser is redirected to Stripe.
export async function startCheckout(cart: CartLine[], shipCost: number, locale: string, email?: string): Promise<CheckoutResult> {
  if (!cart.length) return { ok: false, error: 'empty' }
  // ADR-001: send a stable (productId, variantId) per line so the server can
  // re-price authoritatively. `unitAmount` is sent only as a legacy/UI hint —
  // the server IGNORES it and prices from productId+variantId.
  const items = cart.map((l) => ({
    productId: l.productId,
    variantId: l.variantId,
    title: l.title,
    unitAmount: Math.round(l.price * 100),
    qty: l.qty,
    meta: l.meta,
    personalization: l.personalization,
  }))
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // same-origin sends the session cookie so a logged-in buyer is matched to
      // their Stripe customer (saved cards); email is the guest fallback.
      credentials: 'same-origin',
      body: JSON.stringify({ items, shippingCents: Math.round(shipCost * 100), locale, ...(email ? { email } : {}) }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.url) return { ok: false, error: data.error || 'Checkout failed' }
    window.location.href = data.url
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error' }
  }
}
