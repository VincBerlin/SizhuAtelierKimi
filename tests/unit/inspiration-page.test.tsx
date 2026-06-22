/**
 * Inspiration / Gallery page — REQ-011 (AT-011-1..3). `[REAL-BOUNDARY]` (jsdom).
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-011): a gallery component can render
 * green in isolation yet never be wired as a <Route> in the production
 * composition root (built, not reachable); or placeholder tiles get passed off as
 * real "customer examples" (invented content). So these tests drive the REAL
 * `src/App.tsx` via MemoryRouter to `/inspiration` and assert:
 *   - the route is reachable and renders a curated gallery (AT-011-1),
 *   - every tile links to an existing collection/product route, and a click
 *     navigates to a non-empty template (AT-011-2),
 *   - placeholder tiles (real imagery missing, OQ-006) carry a VISIBLE placeholder
 *     marking; no tile is presented as a real "customer example" (AT-011-3).
 *
 * The Playwright spec (tests/e2e/inspiration.spec.ts) is the real-browser proof
 * and is authored but PLANNED (chromium missing here). This jsdom render through
 * the same real App.tsx is the runnable green evidence now.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { COLLECTION_SLUGS } from '../../src/lib/collections'
import { products } from '../../src/lib/catalog'

async function renderInspiration() {
  const utils = render(
    <MemoryRouter initialEntries={['/inspiration']}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByTestId('inspiration-page')
  return utils
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-011-1 — reachable through App.tsx, renders a curated gallery ──────────

describe('REQ-011 / AT-011-1 — /inspiration is reachable through the real App.tsx', () => {
  it('renders the inspiration page with an H1 and a tile gallery', async () => {
    await renderInspiration()
    const page = screen.getByTestId('inspiration-page')
    expect(page).toBeInTheDocument()

    // exactly one H1 within the page subtree (persistent chrome lives outside)
    const h1s = page.querySelectorAll('h1')
    expect(h1s.length).toBe(1)
    expect(h1s[0].textContent?.trim().length ?? 0).toBeGreaterThan(0)

    // the gallery wall with ≥1 tile
    const gallery = within(page).getByTestId('inspiration-gallery')
    const tiles = within(gallery).getAllByTestId('inspiration-tile')
    expect(tiles.length).toBeGreaterThanOrEqual(1)
    // not an overloaded wall — keep it curated (≤ a sane upper bound)
    expect(tiles.length).toBeLessThanOrEqual(24)
  })
})

// ── AT-011-2 — every tile links to an existing collection/product route ──────

describe('REQ-011 / AT-011-2 — tiles link to real collection/product routes', () => {
  it('every tile links to an existing /collections/<slug> or /product/<id> route', async () => {
    await renderInspiration()
    const page = screen.getByTestId('inspiration-page')

    const validCollections = new Set<string>([
      ...COLLECTION_SLUGS.map((s) => `/collections/${s}`),
      '/collections',
    ])
    const validProductIds = new Set<number>(products.map((p) => p.id))

    const tiles = within(page).getAllByTestId('inspiration-tile')
    expect(tiles.length).toBeGreaterThanOrEqual(1)

    for (const tile of tiles) {
      const link = within(tile).getByRole('link')
      const href = link.getAttribute('href') ?? ''
      const isCollection = validCollections.has(href)
      const productMatch = href.match(/^\/product\/(\d+)$/)
      const isProduct = productMatch != null && validProductIds.has(Number(productMatch[1]))
      expect(isCollection || isProduct).toBe(true)
    }
  })

  it('clicking a tile navigates to a non-empty destination template', async () => {
    await renderInspiration()
    const page = screen.getByTestId('inspiration-page')

    // find a tile that targets a collection route (deterministic destination)
    const collectionTile = within(page)
      .getAllByTestId('inspiration-tile')
      .map((t) => within(t).getByRole('link'))
      .find((a) => (a.getAttribute('href') ?? '').startsWith('/collections/'))
    expect(collectionTile).toBeTruthy()

    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(collectionTile!)
    await screen.findByTestId('collection-page')
    expect(screen.getByTestId('collection-page')).toBeInTheDocument()
  })
})

// ── AT-011-3 — placeholder tiles are visibly marked, no fake customer examples ─

describe('REQ-011 / AT-011-3 — placeholder tiles are marked, no invented examples', () => {
  it('placeholder tiles carry a visible placeholder marking', async () => {
    await renderInspiration()
    const page = screen.getByTestId('inspiration-page')

    const tiles = within(page).getAllByTestId('inspiration-tile')
    // every tile backed by placeholder imagery must expose a placeholder badge
    const placeholderTiles = tiles.filter(
      (t) => t.getAttribute('data-placeholder') === 'true',
    )
    // this MVP gallery uses placeholder imagery → there must be ≥1 marked tile
    expect(placeholderTiles.length).toBeGreaterThanOrEqual(1)
    for (const t of placeholderTiles) {
      const badge = within(t).getByTestId('inspiration-placeholder-badge')
      expect(badge).toBeInTheDocument()
      expect(badge.textContent?.trim().length ?? 0).toBeGreaterThan(0)
      // the word "placeholder" (any case) makes the marking unambiguous
      expect(badge.textContent?.toLowerCase()).toContain('placeholder')
    }
  })

  it('no tile claims to be a real "customer example" / testimonial', async () => {
    await renderInspiration()
    const page = screen.getByTestId('inspiration-page')
    const text = (page.textContent ?? '').toLowerCase()
    // honest-content guard: no invented social proof on placeholder imagery
    for (const banned of ['customer example', 'kundenbeispiel', 'real customer', 'verified buyer']) {
      expect(text).not.toContain(banned)
    }
  })
})
