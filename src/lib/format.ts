// Money / number formatting — region-aware DISPLAY layer (REQ-016 / VIS-016).
import { currencyForRegion, type CurrencyCode, type Region } from './region'

/**
 * Format an amount (major units) in the given ISO-4217 currency for DISPLAY.
 *
 * EUR keeps the German "1234,56 €" style 1:1 with the historical `euro()` helper
 * so the EUR rendering is byte-identical to before; USD/GBP use the conventional
 * symbol-prefix "$1234.56" / "£1234.56".
 *
 * DISPLAY ONLY: this never converts FX. The amount stays the placeholder
 * prototype number (OQ-002); only the currency SYMBOL is made region-correct so
 * a US/UK shopper no longer sees € while the server charges $/£ (FM-06). The
 * authoritative charge currency is the server's (server/pricing.js, ADR-001).
 */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (currency === 'USD') return '$' + amount.toFixed(2)
  if (currency === 'GBP') return '£' + amount.toFixed(2)
  return amount.toFixed(2).replace('.', ',') + ' €'
}

/**
 * Region → display string: us→$, uk→£, eu/other→€ via `currencyForRegion`.
 * The single client-side mapping (region.ts) is the one source the symbol is
 * read from — there is no second hardcoded "€" anywhere downstream.
 */
export function moneyForRegion(amount: number, region: Region): string {
  return formatMoney(amount, currencyForRegion(region))
}

/**
 * Narrow a free-form ISO string (e.g. Stripe's lowercase `'usd'`) to the closed
 * `CurrencyCode` union. Anything unrecognised settles to EUR (primary market) so
 * a receipt never renders an `undefined` symbol.
 */
export function currencyCodeFromString(code: string | null | undefined): CurrencyCode {
  const up = String(code || '').toUpperCase()
  return up === 'USD' || up === 'GBP' || up === 'EUR' ? up : 'EUR'
}

/**
 * Format an amount already tied to a KNOWN ISO currency (order history /
 * receipts), where the charged currency travels with the record itself rather
 * than the viewer's current region.
 */
export function moneyInCurrency(amount: number, code: string | null | undefined): string {
  return formatMoney(amount, currencyCodeFromString(code))
}

// Legacy EUR-only formatter, retained for static EUR copy (e.g. the catalog FAQ
// free-shipping threshold). Region-aware surfaces use `useMoney()` instead.
export const euro = (n: number): string => formatMoney(n, 'EUR')

export const de = (n: number): string => n.toLocaleString('de-DE')
