// Batch #12 (Operator 2026-07-18): bazi-/bundles-Kollektionen sind Redirects — Template-Tests laufen auf der lebenden tcm-Kollektion.
/**
 * M12 — collection filter matrix. `[REAL-BOUNDARY]` (jsdom via real App.tsx).
 *
 * REQ-026: the collection template exposes a faceted filter matrix (style / room /
 * size / price) on top of the existing personalizable toggle + sort. Facets are
 * derived from the REAL products in the collection; a facet click narrows the
 * grid; the size axis is NON-FINAL (OQ-001) and narrows to personalizable posters.
 *
 * NOTE (sandbox): the jsdom worker pool hangs in the build sandbox, so this runs
 * on the dev machine. The filter matrix render is verified in-sandbox by a
 * renderToStaticMarkup collection smoke (19 assertions green).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

function renderCollection(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/collections/${slug}`]}>
      <App />
    </MemoryRouter>,
  )
}

async function page() {
  return screen.findByTestId('collection-page', undefined, { timeout: 15000 })
}
const cardCount = () => screen.getAllByTestId('collection-product-card').length

beforeEach(() => localStorage.clear())

describe('M12 / REQ-026 — collection filter matrix renders the facet rows', () => {
  it('shows style / room / size / price facet rows with chips', async () => {
    renderCollection('tcm-posters')
    await page()
    await waitFor(() => expect(screen.getByTestId('collection-filters')).toBeInTheDocument())
    for (const row of ['collection-filter-style', 'collection-filter-room', 'collection-filter-price'])
      expect(screen.getByTestId(row), row).toBeInTheDocument()
    expect(screen.getAllByTestId('collection-facet').length).toBeGreaterThanOrEqual(6)
  })

  it('sort control stays; the personalizable toggle is REMOVED (Batch #12 supersession)', async () => {
    renderCollection('tcm-posters')
    await page()
    // Batch #12: Toggle entfernt — keine personalisierbaren Katalog-Produkte mehr.
    expect(screen.queryByTestId('collection-filter')).toBeNull()
    expect(screen.getByTestId('collection-sort')).toBeInTheDocument()
  })

  it('does NOT expose a size facet — size is uniform across posters (M13 reconciliation; nav + PDP only)', async () => {
    renderCollection('tcm-posters') // all ready-to-ship — every one ships in every size
    await page()
    expect(screen.queryByTestId('collection-filter-size')).toBeNull()
  })
})

describe('M12 / REQ-026 — a facet click narrows the grid (real filtering)', () => {
  it('selecting the "Minimal Ink" style narrows the bundles grid to the matching poster(s)', async () => {
    renderCollection('tcm-posters')
    await page()
    await waitFor(() => expect(cardCount()).toBeGreaterThan(1))
    const before = cardCount()

    // click the style chip labelled "Minimal Ink" (tcm ids 11+12)
    const styleRow = screen.getByTestId('collection-filter-style')
    const minimalChip = within(styleRow).getByText(/minimal ink/i)
    fireEvent.click(minimalChip)

    await waitFor(() => expect(cardCount()).toBeLessThan(before))
    // count text stays consistent with the rendered cards
    const countText = screen.getByTestId('collection-count').textContent ?? ''
    expect(countText).toMatch(new RegExp(`^${cardCount()}\\b`))

    // reset restores the full set
    fireEvent.click(screen.getByTestId('collection-filter-reset'))
    await waitFor(() => expect(cardCount()).toBe(before))
  })

  it('a zero-match filter shows an honest empty state, not the full unfiltered set', async () => {
    renderCollection('tcm-posters') // Wabi-Sabi is only #14
    await page()
    await waitFor(() => expect(screen.getByTestId('collection-filter-style')).toBeInTheDocument())

    // Batch #12 (tcm): Wabi-Sabi ist nur #14 (45 €) + Preis „unter 45 €" → 0 echte Treffer
    fireEvent.click(within(screen.getByTestId('collection-filter-style')).getByText(/wabi-?sabi/i))
    fireEvent.click(within(screen.getByTestId('collection-filter-price')).getByText(/unter 45/i))

    await waitFor(() => {
      expect(screen.getByTestId('collection-empty')).toBeInTheDocument()
      // the full set is NOT silently shown behind the empty state
      expect(screen.queryByTestId('collection-product-card')).toBeNull()
    })

    // reset restores the products
    fireEvent.click(screen.getByTestId('collection-empty-reset'))
    await waitFor(() => expect(screen.getAllByTestId('collection-product-card').length).toBeGreaterThan(0))
  })
})
