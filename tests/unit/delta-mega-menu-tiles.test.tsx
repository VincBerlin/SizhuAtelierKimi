/**
 * Mega-Menü Editorial-Bildkarten — VERTRAG AKTUALISIERT durch den
 * Operator-Plan Hero/Mega-Menü (2026-07-12, §5.3): die Editorial-Spalte zeigt
 * GENAU ZWEI große Bildkarten (Personalized BaZi + Fire Horse) MIT echten
 * Bildern aus /images/ — der alte asset-light/data-placeholder-Vertrag
 * (DELTA T-203 / AT-004-3, RL-IMAGES) ist damit vom Operator superseded
 * (Begründung im Evidence-Ledger docs/evidence/fufire-gelato/ledger.md).
 * Erhalten bleibt der Kern von AT-004-2: jede Karte hat Titel + CTA + echte
 * Route — keine toten Links, keine leeren Karten.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { COLLECTION_SLUGS } from '../../src/lib/collections'

// M10 (supersedes the delta per-column tiles): the mega-menu now renders a flat
// asset-light promo tile strip (MEGA_TILES from src/lib/taxonomy.ts). We assert
// ≥MIN_TILES tiles, each text-forward + placeholder-imaged (REQ-013).
const EXACT_TILES = 2

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

describe('Operator-Plan §5.3 — editorial column renders EXACTLY two image cards', () => {
  it('opens the mega-menu and renders exactly 2 editorial cards', async () => {
    const panel = await openMegaMenu()
    const tiles = within(panel).getAllByTestId('mega-tile')
    expect(tiles).toHaveLength(EXACT_TILES)
  })
})

// ── AT-004-2 — each tile: non-empty title + CTA + real href ───────────────────

describe('REQ-004 / AT-004-2 — each tile has title + CTA + live target', () => {
  it('every tile has a non-empty title, a CTA, and an href on a real route', async () => {
    const panel = await openMegaMenu()
    const tiles = within(panel).getAllByTestId('mega-tile')
    expect(tiles).toHaveLength(EXACT_TILES)

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

// ── Operator-Plan §5.3 — Bildkarten tragen ECHTE Bilder ─────────────────────

describe('Operator-Plan §5.3 — editorial cards carry real images', () => {
  it('every card renders an <img> from /images/ with cover styling', async () => {
    const panel = await openMegaMenu()
    const tiles = within(panel).getAllByTestId('mega-tile')
    expect(tiles).toHaveLength(EXACT_TILES)
    for (const tile of tiles) {
      const img = tile.querySelector('img')
      expect(img, 'editorial card must render a real image').not.toBeNull()
      expect(img!.getAttribute('src') ?? '').toMatch(/^\/images\//)
    }
  })
})
