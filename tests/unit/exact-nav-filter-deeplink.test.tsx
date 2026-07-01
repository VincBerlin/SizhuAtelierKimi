/**
 * M16 — nav→filter deep-link handoff. `[REAL-BOUNDARY]` (jsdom via real App.tsx).
 *
 * Closes the disclosed PARTIAL from the whole-build re-gate: the mega-menu
 * style/room facets resolve to `/collections?style=<design_family>` /
 * `?room=<use_case>` (resolveTaxonomyHref), and the /collections hub now CONSUMES
 * that query — it pre-filters the all-posters grid to the matching REAL catalog
 * products, shows the active facet + a reset, and hides the generic collection
 * cards so the deep-link lands ON the filtered listing.
 *
 * The M13-reconciliation invariant is preserved: `?size=<id>` is DISCLOSED but
 * does NOT narrow the grid (every poster ships in every size), so it stays an
 * honest PARTIAL by design — never a fabricated size filter.
 *
 * End-to-end contract: the resolver emits the query (node-safe unit assertions)
 * AND the hub consumes it (jsdom render). NOTE (sandbox): the jsdom worker pool
 * hangs in the build sandbox, so the render half runs on the dev machine; it was
 * verified in-sandbox by a renderToStaticMarkup hub smoke.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { resolveTaxonomyHref } from '../../src/lib/taxonomy'

function renderHub(query: string) {
  return render(
    <MemoryRouter initialEntries={[`/collections${query}`]}>
      <App />
    </MemoryRouter>,
  )
}
const ids = (nodes: HTMLElement[]) => nodes.map((n) => Number(n.getAttribute('data-product-id'))).sort((a, b) => a - b)
const cards = () => screen.queryAllByTestId('hub-poster-card')

beforeEach(() => localStorage.clear())

describe('M16 — the resolver emits the facet query (deep-link contract)', () => {
  it('style/room links carry a query the hub can consume; size too (disclosed)', () => {
    expect(resolveTaxonomyHref({ kind: 'designFamily', family: 'minimal' })).toBe('/collections?style=minimal')
    expect(resolveTaxonomyHref({ kind: 'useCase', useCase: 'wellness' })).toBe('/collections?room=wellness')
    expect(resolveTaxonomyHref({ kind: 'size', sizeId: 'A2' })).toBe('/collections?size=A2')
  })
})

describe('M16 — the hub pre-filters the grid from ?style / ?room', () => {
  it('?style=minimal shows ONLY the minimal-family posters (2,6,11,12), not japandi', async () => {
    renderHub('?style=minimal')
    await waitFor(() => expect(screen.getByTestId('hub-active-filter')).toBeInTheDocument())
    expect(ids(cards())).toEqual([2, 6, 11, 12])
    // reset returns to the unfiltered hub
    expect(within(screen.getByTestId('hub-active-filter')).getByTestId('hub-filter-reset')).toHaveAttribute('href', '/collections')
    // the generic collection cards are out of the way while a facet is active
    expect(screen.queryByTestId('hub-collection-cards')).toBeNull()
  })

  it('?room=wellness shows ONLY the wellness posters (3,13)', async () => {
    renderHub('?room=wellness')
    await waitFor(() => expect(screen.getByTestId('hub-active-filter')).toBeInTheDocument())
    expect(ids(cards())).toEqual([3, 13])
  })

  it('an impossible facet combination shows an honest empty state, not the full set', async () => {
    // wabi_sabi (#4,#14) never carries use_case "practice" → zero overlap
    renderHub('?style=wabi_sabi&room=practice')
    await waitFor(() => expect(screen.getByTestId('hub-filter-empty')).toBeInTheDocument())
    expect(cards()).toHaveLength(0)
    expect(screen.getByTestId('hub-empty-reset')).toHaveAttribute('href', '/collections')
  })
})

describe('M16 — ?size is disclosed but non-narrowing (M13 reconciliation preserved)', () => {
  it('?size=A2 lands on the NORMAL hub + a disclosure note — never a filtered view', async () => {
    renderHub('?size=A2')
    await waitFor(() => expect(screen.getByTestId('hub-size-note')).toBeInTheDocument())
    // size is NOT treated as an active filter: no "Filtered by" banner, the
    // collection cards stay, and the full catalog is shown (no narrowing).
    expect(screen.queryByTestId('hub-active-filter')).toBeNull()
    expect(screen.getByTestId('hub-collection-cards')).toBeInTheDocument()
    expect(cards().length).toBeGreaterThanOrEqual(12)
  })
})

describe('M16 — no query = unchanged hub (no regression)', () => {
  it('the plain /collections hub shows the collection cards and no active-filter banner', async () => {
    renderHub('')
    await waitFor(() => expect(screen.getAllByTestId('hub-poster-card').length).toBeGreaterThan(0))
    expect(screen.queryByTestId('hub-active-filter')).toBeNull()
    expect(screen.getByTestId('hub-collection-cards')).toBeInTheDocument()
  })
})
