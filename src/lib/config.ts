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

// Reviews master switch (REQ-008 / REQ-010, OQ-004 — RED-carry).
//
// OFF by default: until REAL customer reviews exist, NO PDP may render a review
// block or star rating — invented stars/review counts are fake social proof
// (REQ-010 / NG-004). The catalog's `rating`/`reviews` numbers are placeholders
// and MUST NOT be surfaced. When real reviews land (OQ-004 resolved), set
// VITE_REVIEWS_ENABLED=true; the block additionally requires a non-zero real
// review count per product, so enabling the flag alone never invents proof.
export const REVIEWS_ENABLED = import.meta.env.VITE_REVIEWS_ENABLED === 'true'
