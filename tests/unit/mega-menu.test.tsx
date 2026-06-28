/**
 * Real mega-menu (Shop / Collections) — REQ-009 (AT-009-1..4). `[REAL-BOUNDARY]` (jsdom).
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-009): a grouped menu can exist as an
 * isolated component yet never be wired into the real Navbar/App.tsx; or it lacks
 * keyboard/Escape/`aria-*`; or its items link to dead routes rather than the
 * REQ-010 /collections/* routes. So these tests drive the REAL `src/App.tsx`
 * composition root (the production Navbar mounted inside it) via MemoryRouter and
 * assert:
 *   - the desktop mega-menu opens from the real Navbar trigger,
 *   - it shows grouped columns (Personalized / TCM / Wuxing / Analysis-PDFs /
 *     Bundles / Featured) per PRD §6.1/§6.2 (AT-009-1),
 *   - `aria-haspopup` / `aria-expanded` reflect state, Escape closes (AT-009-3),
 *   - every mega-menu item links to an existing /collections/* route, and a click
 *     actually navigates to a non-empty collection template (AT-009-4),
 *   - the existing mobile drawer (accordion) still works and the ≤6 top-level nav
 *     entry budget is preserved (AT-009-2 / REQ-008 AK-3 coupling).
 *
 * The Playwright spec (tests/e2e/mega-menu.spec.ts) is the real-browser proof and
 * is authored but PLANNED (chromium missing in this sandbox). This jsdom render
 * through the same real App.tsx is the runnable green evidence now.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { COLLECTION_SLUGS } from '../../src/lib/collections'

// The grouped mega-menu columns required by PRD §6.1/§6.2 (AT-009-1). Each is a
// stable data-testid on the rendered column container.
const MEGA_COLUMN_TESTIDS = [
  'mega-col-personalized',
  'mega-col-tcm',
  'mega-col-wuxing',
  'mega-col-analysis-pdfs',
  'mega-col-bundles',
  'mega-col-featured',
] as const

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

/** Resolve the desktop mega-menu trigger button from the real Navbar. */
function getMegaTrigger(): HTMLElement {
  return screen.getByTestId('mega-menu-trigger')
}

/** Resolve the desktop mega-menu panel container. */
function getMegaPanel(): HTMLElement {
  return screen.getByTestId('mega-menu-panel')
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-009-1 — desktop mega-menu opens with grouped columns ──────────────────

describe('REQ-009 / AT-009-1 — desktop mega-menu opens with grouped columns', () => {
  it('exposes a mega-menu trigger in the real Navbar via App.tsx', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    expect(getMegaTrigger()).toBeInTheDocument()
  })

  it('opens the grouped mega-menu panel on trigger and shows all 6 buy-intent columns', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    const trigger = getMegaTrigger()
    fireEvent.click(trigger)

    const panel = await waitFor(() => getMegaPanel())
    expect(panel).toBeVisible()

    for (const id of MEGA_COLUMN_TESTIDS) {
      const col = within(panel).getByTestId(id)
      expect(col).toBeInTheDocument()
      // every column must carry a non-empty heading + ≥1 link (not a bare shell)
      expect(col.textContent?.trim().length ?? 0).toBeGreaterThan(0)
      expect(within(col).getAllByRole('link').length).toBeGreaterThanOrEqual(1)
    }
  })
})

// ── AT-009-3 — A11y: aria attrs reflect state, Escape closes ──────────────────

describe('REQ-009 / AT-009-3 — keyboard + ARIA state', () => {
  it('trigger carries aria-haspopup and toggles aria-expanded', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    const trigger = getMegaTrigger()
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
  })

  it('Escape closes the open mega-menu (aria-expanded back to false)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    const trigger = getMegaTrigger()
    fireEvent.click(trigger)
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
  })

  it('mega-menu items are focusable links (reachable via Tab order)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    fireEvent.click(getMegaTrigger())
    const panel = await waitFor(() => getMegaPanel())
    const links = within(panel).getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(MEGA_COLUMN_TESTIDS.length)
    // focusable: anchors with href are tabbable; assert each has an href target
    for (const link of links) {
      expect(link).toHaveAttribute('href')
    }
  })
})

// ── AT-009-4 — every item links to an existing /collections/* route ──────────

describe('REQ-009 / AT-009-4 — items link to real REQ-010 collection routes', () => {
  it('every collection-bound mega-menu link targets an existing /collections/<slug> route', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    fireEvent.click(getMegaTrigger())
    const panel = await waitFor(() => getMegaPanel())

    const valid = new Set<string>([
      ...COLLECTION_SLUGS.map((s) => `/collections/${s}`),
      '/collections', // hub link (Featured / "view all") is allowed
      '/personalize', // the personalization entry is an allowed live route
    ])

    const collectionLinks = within(panel)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('/collections') || href === '/personalize')

    // there must be collection links, and every one must be a real route
    expect(collectionLinks.length).toBeGreaterThanOrEqual(COLLECTION_SLUGS.length - 2)
    for (const href of collectionLinks) {
      expect(valid.has(href)).toBe(true)
    }
  })

  it('clicking a collection item navigates to a non-empty collection template', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    fireEvent.click(getMegaTrigger())
    const panel = await waitFor(() => getMegaPanel())

    // pick the BaZi / personalized posters link as the canonical click target
    const target = within(panel)
      .getAllByRole('link')
      .find((a) => a.getAttribute('href') === '/collections/bazi-posters')
    expect(target).toBeTruthy()

    fireEvent.click(target!)
    // the real Collection template renders for the navigated route. It is lazily
    // code-split behind Suspense, so under CPU contention the chunk can resolve
    // slower than testing-library's 1000ms default; the explicit 15000ms (matching
    // tests/setup.ts asyncUtilTimeout) keeps the combined run deterministic without
    // weakening the assertion — the testid still has to appear.
    await screen.findByTestId('collection-page', undefined, { timeout: 15000 })
    expect(screen.getByTestId('collection-page')).toBeInTheDocument()
  })
})

// ── AT-009-2 / REQ-008 AK-3 — mobile drawer preserved + ≤6 top-level entries ──

describe('REQ-009 / AT-009-2 — mobile drawer (accordion) preserved', () => {
  it('the mobile drawer opens and exposes the collections accordion toggle', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    // open the mobile drawer via the hamburger (aria-label from nav.open)
    const openBtn = screen.getByLabelText(/open menu/i)
    fireEvent.click(openBtn)

    // the drawer accordion toggle for collections is present and tappable
    const accordion = await screen.findByTestId('mobile-collections-toggle')
    expect(accordion).toBeInTheDocument()
    // ≥44px touch target budget (min-height enforced in style)
    fireEvent.click(accordion)
    // expanding reveals ≥1 collection link in the drawer
    const drawerLinks = await screen.findAllByTestId('mobile-collection-link')
    expect(drawerLinks.length).toBeGreaterThanOrEqual(1)
  })
})

describe('REQ-009 / REQ-008 AK-3 — ≤6 top-level desktop nav entries', () => {
  it('the desktop primary nav has at most 6 top-level entries', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const primary = screen.getByTestId('primary-nav')
    // top-level entries are tagged data-nav-top; the mega-menu trigger counts as
    // one entry (its columns are nested, not top-level).
    const topEntries = primary.querySelectorAll('[data-nav-top]')
    expect(topEntries.length).toBeGreaterThan(0)
    expect(topEntries.length).toBeLessThanOrEqual(6)
  })
})
