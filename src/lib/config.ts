// Commerce master switch.
//
// TEST / PREVIEW mode (false, the default) hides every price and the whole
// purchase funnel — product prices, discount badges, size price deltas,
// bundle prices, "add to cart" / express-pay buttons, the cart icon and
// checkout. Browsing, the live poster personalization preview, blog, FAQ and
// all content stay fully usable. The Stripe + Postgres backend stays in place,
// dormant, ready to switch on.
//
// To GO LIVE (show prices + enable buying): set VITE_COMMERCE_ENABLED=true at
// build time (e.g. a Railway variable) and redeploy — no code change needed.
export const COMMERCE_ENABLED = import.meta.env.VITE_COMMERCE_ENABLED === 'true'
