// Batch #12 (Operator 2026-07-18): bazi-/bundles-Kollektionen sind Redirects — Template-Tests laufen auf der lebenden tcm-Kollektion.
/**
 * M17 — collection filter matrix is URL-driven. `[REAL-BOUNDARY]` (jsdom via real App.tsx).
 *
 * Extends the M16 nav→filter deep-link into the Collection TEMPLATE: the in-page
 * facet matrix (style/room/price) reads AND writes `?style`/`?room`/`?price` via
 * useSearchParams, so a filtered view is shareable + back/forward-navigable and
 * consistent with the M16 hub contract. A deep-link like
 * /collections/tcm-posters?style=minimal must pre-apply the filter on load; a chip
 * click must update the URL; reset must clear it.
 *
 * NOTE (sandbox): the jsdom worker pool hangs in the build sandbox, so this runs on
 * the dev machine. The URL-driven initial render was verified in-sandbox by a
 * renderToStaticMarkup smoke (9/0).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import App from '../../src/App'

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="loc-search">{loc.search}</div>
}
function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
}
const page = () => screen.findByTestId('collection-page', undefined, { timeout: 15000 })
const cardIds = () =>
  screen.queryAllByTestId('collection-product-card').map((n) => Number(n.getAttribute('data-product-id'))).sort((a, b) => a - b)
const search = () => screen.getByTestId('loc-search').textContent ?? ''

beforeEach(() => localStorage.clear())

describe('M17 — a deep-linked filter is honored on load', () => {
  it('/collections/tcm-posters?style=minimal pre-applies the style filter (grid + active chip)', async () => {
    renderAt('/collections/tcm-posters?style=minimal')
    await page()
    await waitFor(() => expect(cardIds()).toEqual([11, 12])) // only minimal-family tcm posters (Batch #12)
    const styleRow = screen.getByTestId('collection-filter-style')
    const minimalChip = within(styleRow).getByText(/minimal ink/i)
    expect(minimalChip).toHaveAttribute('data-active', 'true')
    expect(search()).toContain('style=minimal')
  })
})

describe('M17 — a chip click writes the URL (shareable / back-navigable)', () => {
  it('selecting a style chip adds ?style=… to the URL and narrows the grid', async () => {
    renderAt('/collections/tcm-posters')
    await page()
    await waitFor(() => expect(cardIds().length).toBeGreaterThan(1))
    expect(search()).not.toContain('style=')

    fireEvent.click(within(screen.getByTestId('collection-filter-style')).getByText(/minimal ink/i))

    await waitFor(() => expect(search()).toContain('style=minimal'))
    await waitFor(() => expect(cardIds()).toEqual([11, 12]))
  })
})

describe('M17 — reset clears the URL facets', () => {
  it('reset removes the style param and restores the grid', async () => {
    renderAt('/collections/tcm-posters?style=minimal')
    await page()
    await waitFor(() => expect(cardIds()).toEqual([11, 12]))

    fireEvent.click(screen.getByTestId('collection-filter-reset'))

    await waitFor(() => expect(search()).not.toContain('style='))
    await waitFor(() => expect(cardIds().length).toBeGreaterThan(2))
  })
})

describe('M17 — an impossible deep-link yields an honest empty state, not the full set', () => {
  it('?style=nonexistent shows the empty state and no cards', async () => {
    renderAt('/collections/tcm-posters?style=nonexistent')
    await page()
    await waitFor(() => expect(screen.getByTestId('collection-empty')).toBeInTheDocument())
    expect(screen.queryByTestId('collection-product-card')).toBeNull()
  })
})
