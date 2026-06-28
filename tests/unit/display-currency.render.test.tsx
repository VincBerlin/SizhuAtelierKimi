/**
 * [REAL-BOUNDARY] REQ-016 / VIS-016 — a customer-facing price page renders in the
 * REGION currency, driven by the SAME wiring the app uses in production.
 *
 * We mount a real shop page (DigitalPage) inside the real provider tree
 * (I18nProvider → ShopStoreProvider). ShopStoreProvider derives the region from
 * GET /api/region on mount — exactly as the promo / announcement bar does — so
 * stubbing that one boundary lets us prove the end-to-end display path: region →
 * useMoney() → formatMoney → the rendered price symbol.
 *
 * The amount is the placeholder prototype price (OQ-002); only the SYMBOL is
 * asserted. The pre-fix bug (US/UK seeing € while the server charges $/£) would
 * fail the us/uk cases here.
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { ShopStoreProvider } from '../../src/store/ShopStore'
import DigitalPage from '../../src/pages/DigitalPage'
import { digitalProduct } from '../../src/lib/catalog'

// jsdom has no real scroll; DigitalPage scrolls to top on mount.
window.scrollTo = () => {}

const price = digitalProduct.price
const USD = '$' + price.toFixed(2)
const GBP = '£' + price.toFixed(2)
const EUR = price.toFixed(2).replace('.', ',') + ' €'

// Drive ONLY the region boundary; everything else stays offline. ShopStoreProvider
// calls fetchRegion() → fetch('/api/region') once on mount.
function stubRegion(region: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      const url = String(input)
      if (url.includes('/api/region')) return { json: async () => ({ region }) }
      return { json: async () => ({}) }
    }),
  )
}

function renderDigital() {
  return render(
    <I18nProvider>
      <ShopStoreProvider>
        <DigitalPage />
      </ShopStoreProvider>
    </I18nProvider>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('[REAL-BOUNDARY] price display follows the shipping region', () => {
  it('US region → price in $ (USD), never €', async () => {
    stubRegion('us')
    renderDigital()
    // findByText polls until the async region update repaints the price in $.
    expect(await screen.findByText(USD)).toBeInTheDocument()
    expect(screen.queryByText(EUR)).toBeNull()
  })

  it('UK region → price in £ (GBP), never €', async () => {
    stubRegion('uk')
    renderDigital()
    expect(await screen.findByText(GBP)).toBeInTheDocument()
    expect(screen.queryByText(EUR)).toBeNull()
  })

  it('EU region → price in € (EUR)', async () => {
    stubRegion('eu')
    renderDigital()
    expect(await screen.findByText(EUR)).toBeInTheDocument()
    expect(screen.queryByText(USD)).toBeNull()
  })
})
