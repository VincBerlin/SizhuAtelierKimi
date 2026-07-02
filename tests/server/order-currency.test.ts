/**
 * REQ-016 (review-MEDIUM) — order confirmation MAIL + order LOG format money in
 * the currency Stripe actually settled (`session.currency`), not a fixed CURRENCY
 * env. A US order must read in $, a UK order in £ — never a hardcoded €.
 *
 * [UNIT] against the REAL server helpers (`money`, `buildOrderSummary` from
 * server/index.js). DISPLAY-ONLY: this proves the formatting, never the charge —
 * the authoritative amounts are owned by /api/checkout + server/pricing.js, which
 * the 18 checkout.repricing tests pin and this suite leaves untouched.
 */
import { describe, it, expect } from 'vitest'
import { money, buildOrderSummary } from '../../server/index.js'

describe('money() — currency-correct, display-only', () => {
  it('formats by the supplied ISO currency, not a fixed €', () => {
    expect(money(1999, 'usd')).toContain('$')
    expect(money(1999, 'usd')).not.toContain('€')
    expect(money(1999, 'gbp')).toContain('£')
    expect(money(1999, 'gbp')).not.toContain('€')
    expect(money(1999, 'eur')).toContain('€')
    // amount preserved (no FX): 19,99 in de-DE grouping.
    expect(money(1999, 'usd')).toContain('19,99')
  })

  it('falls back safely on missing / malformed currency (never throws)', () => {
    expect(() => money(1999, undefined)).not.toThrow()
    expect(() => money(1999, 'xx')).not.toThrow()
    // No per-order currency → CURRENCY env default (eur).
    expect(money(1999, undefined)).toContain('€')
  })
})

describe('buildOrderSummary() — mail/log strings in session.currency', () => {
  it('US order → line items + total in $ (not €)', () => {
    const session = { currency: 'usd', amount_total: 6500 }
    const items = [{ qty: 1, description: 'Feuerpferd 2026', amount: 6500 }]
    const { lines, total } = buildOrderSummary(session, items, {})
    expect(total).toContain('$')
    expect(total).not.toContain('€')
    expect(lines).toContain('$')
    expect(lines).not.toContain('€')
    expect(lines).toContain('Feuerpferd 2026')
  })

  it('UK order → £; EU order → €', () => {
    const item = [{ qty: 1, description: 'X', amount: 4900 }]
    expect(buildOrderSummary({ currency: 'gbp', amount_total: 4900 }, item, {}).total).toContain('£')
    const eu = buildOrderSummary({ currency: 'eur', amount_total: 4900 }, item, {})
    expect(eu.total).toContain('€')
    expect(eu.total).not.toContain('$')
  })

  it('appends a personalization block when present', () => {
    const out = buildOrderSummary(
      { currency: 'eur', amount_total: 4900 },
      [{ qty: 1, description: 'X', amount: 4900 }],
      { name: 'Mira' },
    )
    expect(out.personalText).toContain('Personalisierung')
    expect(out.personalText).toContain('name: Mira')
  })
})
