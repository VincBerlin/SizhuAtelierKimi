/**
 * [REAL-BOUNDARY] REQ-016 / VIS-016 — a customer-facing price page renders in the
 * REGION currency, driven by the SAME wiring the app uses in production.
 *
 * Supersession (Batch #12 R3, Bereich 5): dieses Fixture mountete früher die
 * DigitalPage — die ist entfernt, weil sie die Premium-Analyse OHNE
 * Geburtsdaten verkaufte (/digital ist jetzt ein Redirect auf
 * /personalize?type=digital). Der geprüfte Vertrag ist UNVERÄNDERT: Region →
 * useMoney() → formatMoney → gerendertes Währungssymbol; Träger ist jetzt die
 * BundlesPage (reale Shop-Seite mit echten Katalogpreisen).
 *
 * ShopStoreProvider derives the region from GET /api/region on mount — exactly
 * as the promo / announcement bar does — so stubbing that one boundary lets us
 * prove the end-to-end display path. The pre-fix bug (US/UK seeing € while the
 * server charges $/£) would fail the us/uk cases here.
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { ShopStoreProvider } from '../../src/store/ShopStore'
import BundlesPage from '../../src/pages/BundlesPage'
import { bundles } from '../../src/lib/catalog'

// jsdom has no real scroll; BundlesPage scrolls to top on mount.
window.scrollTo = () => {}

const price = bundles[0].price
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

function renderBundles() {
  return render(
    <I18nProvider>
      <ShopStoreProvider>
        <MemoryRouter initialEntries={['/bundles']}>
          <BundlesPage />
        </MemoryRouter>
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
    renderBundles()
    // findByText polls until the async region update repaints the price in $.
    expect(await screen.findByText(USD)).toBeInTheDocument()
    expect(screen.queryByText(EUR)).toBeNull()
  })

  it('UK region → price in £ (GBP), never €', async () => {
    stubRegion('uk')
    renderBundles()
    expect(await screen.findByText(GBP)).toBeInTheDocument()
    expect(screen.queryByText(EUR)).toBeNull()
  })

  it('EU region → price in € (EUR)', async () => {
    stubRegion('eu')
    renderBundles()
    expect(await screen.findByText(EUR)).toBeInTheDocument()
    expect(screen.queryByText(USD)).toBeNull()
  })
})
