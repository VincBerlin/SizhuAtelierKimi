// Gelato Order API v4 Client — env-gated wie Stripe/FuFirE: ohne
// GELATO_API_KEY bleibt das Print-Fulfillment deaktiviert (Bestellungen
// werden trotzdem persistiert + PDF erzeugt; nur der Druckauftrag entfällt).
//
// Default orderType 'draft' (Sicherheitsnetz): Bestellungen landen als
// Entwurf im Gelato-Dashboard, der Operator bestätigt per Klick. Umschalten
// auf Vollautomatik = GELATO_ORDER_TYPE=order (bewusste Operator-Entscheidung,
// Empfehlung: nach ≥20 fehlerfreien Drafts — siehe Evidence-Ledger).

const GELATO_ORDER_URL = 'https://order.gelatoapis.com/v4/orders'
const TIMEOUT_MS = 20_000

function defaultEnv() {
  return {
    apiKey: process.env.GELATO_API_KEY || '',
    orderType: process.env.GELATO_ORDER_TYPE === 'order' ? 'order' : 'draft',
  }
}

export function gelatoEnabled(env = defaultEnv()) {
  return Boolean(env.apiKey)
}

export class GelatoError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.name = 'GelatoError'
    this.status = status
  }
}

/**
 * Erzeugt eine Gelato-Bestellung (Default: Draft).
 * @param {{orderReferenceId: string, customerReferenceId?: string, currency: string,
 *          items: Array<{itemReferenceId: string, productUid: string, quantity: number, fileUrl: string}>,
 *          shippingAddress: object}} order
 */
export async function createOrder(order, fetchImpl = fetch, env = defaultEnv()) {
  if (!gelatoEnabled(env)) throw new GelatoError('gelato not configured', 503)
  const body = {
    orderType: env.orderType,
    orderReferenceId: order.orderReferenceId,
    customerReferenceId: order.customerReferenceId || order.orderReferenceId,
    currency: String(order.currency || 'EUR').toUpperCase(),
    items: order.items.map((it) => ({
      itemReferenceId: it.itemReferenceId,
      productUid: it.productUid,
      quantity: it.quantity || 1,
      files: [{ type: 'default', url: it.fileUrl }],
    })),
    shippingAddress: order.shippingAddress,
  }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetchImpl(GELATO_ORDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': env.apiKey },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } catch (e) {
    throw new GelatoError(`gelato unreachable: ${e.message}`)
  } finally {
    clearTimeout(timer)
  }
  let json
  try {
    json = await res.json()
  } catch {
    throw new GelatoError('gelato returned non-json')
  }
  if (!res.ok) throw new GelatoError(`gelato order failed (${res.status}): ${JSON.stringify(json).slice(0, 300)}`, res.status)
  return json // enthält id, orderType, …
}

/** Stripe-Session → Gelato-Versandadresse. Wirft, wenn Pflichtfelder fehlen —
 *  lieber lauter Fulfillment-Fehler (Operator-Mail) als Paket ins Nirgendwo. */
export function shippingAddressFromSession(session) {
  const ship = session.shipping_details || session.customer_details || {}
  const addr = ship.address || {}
  const name = ship.name || session.customer_details?.name || ''
  const [firstName, ...rest] = String(name).trim().split(/\s+/)
  const required = { addressLine1: addr.line1, city: addr.city, postCode: addr.postal_code, country: addr.country }
  for (const [k, v] of Object.entries(required)) {
    if (!v) throw new GelatoError(`missing shipping field: ${k}`, 400)
  }
  return {
    firstName: firstName || 'Kunde',
    lastName: rest.join(' ') || firstName || '—',
    addressLine1: addr.line1,
    addressLine2: addr.line2 || '',
    city: addr.city,
    postCode: addr.postal_code,
    state: addr.state || '',
    country: addr.country,
    email: session.customer_details?.email || '',
  }
}
