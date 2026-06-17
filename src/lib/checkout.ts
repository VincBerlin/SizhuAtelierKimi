import type { CartLine } from '../store/ShopStore'

export interface CheckoutResult {
  ok: boolean
  error?: string
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
