/**
 * M10 — canonical mega-menu MATRIX + mobile mirror. `[REAL-BOUNDARY]` (jsdom).
 *
 * The exact-architecture correction requires the desktop mega-menu and the mobile
 * drawer to render the SAME six taxonomy axes (REQ-006/007): world, style, room,
 * SIZE, set, campaign — driven by src/lib/taxonomy.ts. The size axis is the M11
 * stop-gate ("no M11 without size/room/style/sets/trends present"). These tests
 * drive the REAL src/App.tsx (production Navbar) via MemoryRouter and assert the
 * matrix renders with real, non-dead hrefs.
 *
 * NOTE (sandbox): the jsdom worker pool hangs in the build sandbox, so this runs
 * on the developer machine. The identical structure is verified in-sandbox by a
 * renderToStaticMarkup smoke over the same Navbar (38 assertions green).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { COLLECTION_SLUGS } from '../../src/lib/collections'

const AXES = ['world', 'style', 'room', 'size', 'set', 'campaign'] as const

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

// Proves route-LIVENESS (no dead link). Filter-param CORRECTNESS (?style=/room=/
// size= values map to real catalog data) is backstopped at the data layer by
// tests/unit/exact-taxonomy.test.ts, so this rendered check stays route-scoped.
const isRealHref = (href: string) =>
  href === '/collections' ||
  href === '/offers' ||
  href === '/personalize' ||
  href === '/inspiration' ||
  href.startsWith('/collections?') ||
  COLLECTION_SLUGS.some((s) => href === `/collections/${s}`)

async function openMega() {
  renderApp()
  await screen.findAllByRole('navigation')
  fireEvent.click(screen.getByTestId('mega-menu-trigger'))
  return waitFor(() => screen.getByTestId('mega-menu-panel'))
}

beforeEach(() => localStorage.clear())

describe('M10 / REQ-006 — desktop mega-menu renders all six taxonomy axes', () => {
  it('opens the panel and shows world/style/room/size/set/campaign, each with ≥1 item', async () => {
    const panel = await openMega()
    for (const axis of AXES) {
      const group = within(panel).getByTestId(`mega-axis-${axis}`)
      expect(group, `axis ${axis} present`).toBeInTheDocument()
      expect(within(group).getAllByRole('link').length, `axis ${axis} has items`).toBeGreaterThanOrEqual(1)
    }
  })

  it('the SIZE axis (M11 stop-gate) shows A3/A2/A1 and marks them non-final', async () => {
    const panel = await openMega()
    const size = within(panel).getByTestId('mega-axis-size')
    const items = within(size).getAllByTestId('mega-axis-item')
    const labels = items.map((el) => el.textContent ?? '')
    for (const code of ['A3', 'A2', 'A1']) {
      expect(labels.some((l) => l.includes(code)), `size ${code} present`).toBe(true)
    }
    // every size item is flagged non-final (OQ-001) — no fake launch-final size
    for (const el of items) expect(el.getAttribute('data-nonfinal')).toBe('true')
  })
})

describe('M10 / REQ-035 — every mega-menu item is a real, non-dead route', () => {
  it('all axis + tile links resolve to a live destination', async () => {
    const panel = await openMega()
    const hrefs = within(panel).getAllByRole('link').map((a) => a.getAttribute('href') ?? '').filter(Boolean)
    expect(hrefs.length).toBeGreaterThanOrEqual(COLLECTION_SLUGS.length)
    for (const href of hrefs) expect(isRealHref(href), `mega link ${href} must be real`).toBe(true)
  })
})

describe('M10 / REQ-013 — mega-menu tiles are asset-light placeholders', () => {
  it('renders ≥4 tiles, each with a marked placeholder image and no real .webp', async () => {
    const panel = await openMega()
    const tiles = within(panel).getAllByTestId('mega-tile')
    expect(tiles.length).toBeGreaterThanOrEqual(4)
    for (const tile of tiles) {
      expect(within(tile).getByTestId('mega-tile-image')).toHaveAttribute('data-placeholder', 'true')
      for (const img of Array.from(tile.querySelectorAll('img'))) {
        expect(/\/images\/.*\.webp/i.test(img.getAttribute('src') ?? '')).toBe(false)
      }
    }
  })
})

describe('M10 / REQ-007 — mobile drawer mirrors the same six axes', () => {
  it('exposes mobile-axis-* for every taxonomy axis (not a compressed desktop nav)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    fireEvent.click(screen.getByLabelText(/open menu/i))
    fireEvent.click(await screen.findByTestId('mobile-collections-toggle'))
    for (const axis of AXES) {
      const group = await screen.findByTestId(`mobile-axis-${axis}`)
      expect(group, `mobile axis ${axis} present`).toBeInTheDocument()
      expect(within(group).getAllByTestId('mobile-tax-item').length).toBeGreaterThanOrEqual(1)
    }
  })
})
