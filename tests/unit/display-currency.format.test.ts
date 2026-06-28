/**
 * REQ-016 / VIS-016 — region-aware DISPLAY currency formatter (client).
 *
 * Pure-function proof that the client now formats prices in the region's
 * currency (us→$, uk→£, eu/other→€) while keeping the EUR rendering byte-identical
 * to the legacy `euro()` helper (no display regression for the primary market).
 *
 * Written to catch the pre-fix bug: a US/UK shopper saw € on every price while
 * the server charged $/£ (AT-016-7 / FM-06). The NUMBERS stay placeholder
 * prototype amounts (OQ-002) — only the symbol is asserted, no FX conversion.
 */
import { describe, it, expect } from 'vitest'
import {
  formatMoney,
  moneyForRegion,
  currencyCodeFromString,
  moneyInCurrency,
  euro,
} from '../../src/lib/format'
import { currencyForRegion } from '../../src/lib/region'

describe('formatMoney — symbol per ISO currency', () => {
  it('renders $ for USD, £ for GBP, German "x,xx €" for EUR', () => {
    expect(formatMoney(49, 'USD')).toBe('$49.00')
    expect(formatMoney(49, 'GBP')).toBe('£49.00')
    expect(formatMoney(49, 'EUR')).toBe('49,00 €')
  })

  it('keeps EUR byte-identical to the legacy euro() contract (no regression)', () => {
    for (const n of [0, 4.9, 39, 49.5, 1234.5]) {
      expect(formatMoney(n, 'EUR')).toBe(euro(n))
      // legacy contract: comma decimal, trailing " €", NO thousands separator.
      expect(euro(n)).toBe(n.toFixed(2).replace('.', ',') + ' €')
    }
  })
})

describe('moneyForRegion — reads the SAME region→currency map the promo bar uses', () => {
  it('maps us→$, uk→£, eu/other→€ via currencyForRegion (single source)', () => {
    expect(moneyForRegion(49, 'us')).toBe('$49.00')
    expect(moneyForRegion(49, 'uk')).toBe('£49.00')
    expect(moneyForRegion(49, 'eu')).toBe('49,00 €')
    expect(moneyForRegion(49, 'other')).toBe('49,00 €')
    for (const r of ['us', 'uk', 'eu', 'other'] as const) {
      expect(moneyForRegion(49, r)).toBe(formatMoney(49, currencyForRegion(r)))
    }
  })

  it('US/UK never render € — the exact pre-fix bug (FM-06)', () => {
    expect(moneyForRegion(49, 'us')).toContain('$')
    expect(moneyForRegion(49, 'us')).not.toContain('€')
    expect(moneyForRegion(49, 'uk')).toContain('£')
    expect(moneyForRegion(49, 'uk')).not.toContain('€')
  })
})

describe('currency from a free-form ISO string (receipts / order history)', () => {
  it('narrows known codes (any case) and falls back to EUR otherwise', () => {
    expect(currencyCodeFromString('usd')).toBe('USD')
    expect(currencyCodeFromString('GBP')).toBe('GBP')
    expect(currencyCodeFromString('eur')).toBe('EUR')
    expect(currencyCodeFromString('aud')).toBe('EUR')
    expect(currencyCodeFromString(null)).toBe('EUR')
    expect(currencyCodeFromString(undefined)).toBe('EUR')
  })

  it('moneyInCurrency formats an amount in its own settled currency', () => {
    expect(moneyInCurrency(39, 'usd')).toBe('$39.00')
    expect(moneyInCurrency(39, 'gbp')).toBe('£39.00')
    expect(moneyInCurrency(39, 'eur')).toBe('39,00 €')
  })
})
