// Commerce master switch.
//
// LIVE is the default: prices, discount badges, size deltas, bundle prices,
// "add to cart" / express-pay buttons and checkout are all shown. The cart
// icon itself is ALWAYS visible regardless of this flag (it is rendered
// unconditionally in Navbar) so the cart stays reachable on every page (REQ-004).
//
// To pause selling (hide prices + the purchase funnel) without removing code,
// set VITE_COMMERCE_ENABLED=false at build time and redeploy — the cart icon
// stays visible but the funnel goes dormant. Stripe + Postgres are unaffected.
export const COMMERCE_ENABLED = import.meta.env.VITE_COMMERCE_ENABLED !== 'false'
