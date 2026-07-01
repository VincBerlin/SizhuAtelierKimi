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
    renderCollection('bundles')
    await page()
    await waitFor(() => expect(screen.getByTestId('collection-filters')).toBeInTheDocument())
    for (const row of ['collection-filter-style', 'collection-filter-room', 'collection-filter-size', 'collection-filter-price'])
      expect(screen.getByTestId(row), row).toBeInTheDocument()
    expect(screen.getAllByTestId('collection-facet').length).toBeGreaterThanOrEqual(6)
  })

  it('keeps the existing personalizable toggle + sort control', async () => {
    renderCollection('bundles')
    await page()
    expect(screen.getByTestId('collection-filter')).toBeInTheDocument()
    expect(screen.getByTestId('collection-sort')).toBeInTheDocument()
  })

  it('flags the size axis as NON-FINAL (OQ-001)', async () => {
    renderCollection('bundles')
    await page()
    expect(screen.getByTestId('collection-filter-size')).toHaveAttribute('data-nonfinal', 'true')
    // every size chip carries the non-final marker
    const sizeRow = screen.getByTestId('collection-filter-size')
    for (const chip of within(sizeRow).getAllByTestId('collection-facet'))
      expect(chip).toHaveAttribute('data-nonfinal', 'true')
  })
})

describe('M12 / REQ-026 — a facet click narrows the grid (real filtering)', () => {
  it('selecting the "Minimal Ink" style narrows the bundles grid to the matching poster(s)', async () => {
    renderCollection('bundles')
    await page()
    await waitFor(() => expect(cardCount()).toBeGreaterThan(1))
    const before = cardCount()

    // click the style chip labelled "Minimal Ink" (only catalog id 2 in bundles)
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

  it('the non-final size filter narrows to personalizable posters (drops the ready-to-ship Wuxing)', async () => {
    renderCollection('bundles') // productIds [1,2,5,3,4,7] — #7 Wuxing is non-personalizable
    await page()
    const ids = () => screen.getAllByTestId('collection-product-card').map((c) => c.getAttribute('data-product-id'))
    const revealAll = async () => {
      const btn = within(screen.getByTestId('collection-pagination')).queryByRole('button')
      if (btn) fireEvent.click(btn)
    }
    // reveal the full set first and confirm the ready-to-ship Wuxing (#7) is shown
    await waitFor(() => expect(screen.getByTestId('collection-pagination')).toBeInTheDocument())
    await revealAll()
    await waitFor(() => expect(ids(), 'the ready-to-ship Wuxing is visible before filtering').toContain('7'))

    // apply the non-final size filter, then reveal the FULL filtered set so the
    // assertion proves the FILTER (not pagination) dropped #7
    fireEvent.click(within(screen.getByTestId('collection-filter-size')).getAllByTestId('collection-facet')[0]) // A3
    await waitFor(() => expect(screen.getByTestId('collection-pagination')).toBeInTheDocument())
    await revealAll()
    await waitFor(() => {
      expect(ids(), 'the ready-to-ship Wuxing (#7) is dropped by the size filter').not.toContain('7')
      expect(ids(), 'the 5 personalizable posters remain').toEqual(expect.arrayContaining(['1', '2', '5', '3', '4']))
    })
  })

  it('a zero-match filter shows an honest empty state, not the full unfiltered set', async () => {
    renderCollection('bazi-posters') // 6 BaZi posters — Wabi-Sabi is only #4 (39€)
    await page()
    await waitFor(() => expect(screen.getByTestId('collection-filter-style')).toBeInTheDocument())

    // Wabi-Sabi (#4, 39€) + price "ab 60 €" → zero real matches
    fireEvent.click(within(screen.getByTestId('collection-filter-style')).getByText(/wabi-?sabi/i))
    fireEvent.click(within(screen.getByTestId('collection-filter-price')).getByText(/ab 60/i))

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
