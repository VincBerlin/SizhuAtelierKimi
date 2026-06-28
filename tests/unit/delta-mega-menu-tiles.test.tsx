/**
 * DELTA T-203 — Mega-menu asset-light tiles (REQ-004). `[REAL-BOUNDARY-jsdom]`.
 *
 * Acceptance contracts (docs/tests/desenio-acceptance-design.md §REQ-004):
 *   AT-004-1  the mega-menu opens from the REAL Navbar trigger; the relevant
 *             columns (Poster / TCM / Wuxing) each show ≥2 tiles.
 *   AT-004-2  each tile has a non-empty title, a CTA, and an href on a real
 *             /collections/* or product route.
 *   AT-004-3  ASSET-LIGHT proof — each tile image field is a generic placeholder
 *             marked data-placeholder and renders NO <img src=/images/*.webp>
 *             product image; the placeholder must not look like a real product
 *             photo (FM-11 / CAN-014 / RISK-001).
 *   AT-004-4  Playwright hover/tap navigation = PLANNED (BLK-CHROMIUM).
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-004): tiles may exist but show a
 * placeholder image that LOOKS like a real product photo (CAN-014 breach) — the
 * customer thinks it is the finished product; or a tile may have a dead CTA. So
 * this drives the REAL src/App.tsx, opens the mega-menu, and asserts every tile
 * is text-forward (title + CTA + live href) and image-light (data-placeholder,
 * no real .webp product image).
 *
 * RED-line discipline (RL-IMAGES / OQ-001): real product imagery is launch-
 * blocking and intentionally absent in this run. These tests pin the asset-light
 * contract, never a final visual.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { COLLECTION_SLUGS } from '../../src/lib/collections'

// The buy-intent columns that MUST carry ≥2 promo tiles (REQ-004 relevant
// columns: Poster / TCM / Wuxing).
const TILE_COLUMN_TESTIDS = ['mega-tiles-posters', 'mega-tiles-tcm', 'mega-tiles-wuxing'] as const

const VALID_TILE_HREFS = new Set<string>([
  ...COLLECTION_SLUGS.map((s) => `/collections/${s}`),
  '/collections',
  '/personalize',
  '/offers',
])

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

async function openMegaMenu() {
  renderApp()
  await screen.findAllByRole('navigation')
  fireEvent.click(screen.getByTestId('mega-menu-trigger'))
  return waitFor(() => screen.getByTestId('mega-menu-panel'))
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-004-1 — relevant columns each show ≥2 tiles ────────────────────────────

describe('REQ-004 / AT-004-1 — Poster/TCM/Wuxing columns each show ≥2 tiles', () => {
  it('opens the mega-menu and every relevant column has ≥2 promo tiles', async () => {
    const panel = await openMegaMenu()
    for (const colId of TILE_COLUMN_TESTIDS) {
      const col = within(panel).getByTestId(colId)
      const tiles = within(col).getAllByTestId('mega-tile')
      expect(tiles.length, `${colId} must have ≥2 tiles`).toBeGreaterThanOrEqual(2)
    }
  })
})

// ── AT-004-2 — each tile: non-empty title + CTA + real href ───────────────────

describe('REQ-004 / AT-004-2 — each tile has title + CTA + live target', () => {
  it('every tile has a non-empty title, a CTA, and an href on a real route', async () => {
    const panel = await openMegaMenu()
    const tiles = within(panel).getAllByTestId('mega-tile')
    expect(tiles.length).toBeGreaterThanOrEqual(TILE_COLUMN_TESTIDS.length * 2)

    for (const tile of tiles) {
      // title
      const title = within(tile).getByTestId('mega-tile-title')
      expect(title.textContent?.trim().length ?? 0).toBeGreaterThan(0)
      // CTA
      const cta = within(tile).getByTestId('mega-tile-cta')
      expect(cta.textContent?.trim().length ?? 0).toBeGreaterThan(0)
      // live href — the tile is (or contains) a real link to a real route
      const link = tile.matches('a[href]') ? (tile as HTMLAnchorElement) : within(tile).getByRole('link')
      const href = link.getAttribute('href') ?? ''
      expect(VALID_TILE_HREFS.has(href), `tile href ${href} must be a real route`).toBe(true)
    }
  })
})

// ── AT-004-3 — ASSET-LIGHT: data-placeholder, no real .webp product image ─────

describe('REQ-004 / AT-004-3 — tiles are asset-light, not fake product photos (FM-11)', () => {
  it('every tile image field is a marked placeholder, never a /images/*.webp product img', async () => {
    const panel = await openMegaMenu()
    const tiles = within(panel).getAllByTestId('mega-tile')

    for (const tile of tiles) {
      // an explicit generic placeholder field is present
      const placeholder = within(tile).getByTestId('mega-tile-image')
      expect(placeholder).toHaveAttribute('data-placeholder', 'true')

      // it does NOT render a real product image (no <img src=/images/...webp>)
      const imgs = tile.querySelectorAll('img')
      for (const img of Array.from(imgs)) {
        const src = img.getAttribute('src') ?? ''
        expect(/\/images\/.*\.webp/i.test(src), `tile must not use a real product image (${src})`).toBe(false)
      }
    }
  })

  it('the placeholder fields are generic (no inline background-image of a real .webp)', async () => {
    const panel = await openMegaMenu()
    const placeholders = within(panel).getAllByTestId('mega-tile-image')
    expect(placeholders.length).toBeGreaterThanOrEqual(TILE_COLUMN_TESTIDS.length * 2)
    for (const ph of placeholders) {
      const style = ph.getAttribute('style') ?? ''
      expect(/\/images\/.*\.webp/i.test(style)).toBe(false)
    }
  })
})
