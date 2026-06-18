import type { CartLine } from '../store/ShopStore'

export interface CheckoutResult {
  ok: boolean
  error?: string
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
export async function startCheckout(cart: CartLine[], shipCost: number, locale: string): Promise<CheckoutResult> {
  if (!cart.length) return { ok: false, error: 'empty' }
  const items = cart.map((l) => ({
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
      body: JSON.stringify({ items, shippingCents: Math.round(shipCost * 100), locale }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.url) return { ok: false, error: data.error || 'Checkout failed' }
    window.location.href = data.url
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error' }
  }
}
