/**
 * DELTA T-202 — Desktop header composition (REQ-022). `[REAL-BOUNDARY-jsdom]`.
 *
 * Acceptance contract (docs/tests/desenio-acceptance-design.md §REQ-011/REQ-022):
 *   AT-011-4  the desktop header renders Logo, primary nav, Search, Cart and
 *             Language/Country as MANDATORY; Account and Favorites are OPTIONAL
 *             (they may be absent without failing).
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-022): the header could render a logo
 * and nav but drop a mandatory utility (search / cart / language), or it could
 * hard-require account/favorites that the spec marks optional. So this test
 * drives the REAL src/App.tsx composition root and asserts presence of the five
 * mandatory header surfaces by stable, accessible handles, and explicitly proves
 * the OPTIONAL surfaces are allowed to be absent.
 *
 * Scope note: mobile-header visibility (hamburger/cart-badge at 360/390/430) is
 * T-401 (REQ-011), and the real no-clip proof is Playwright (BLK-CHROMIUM). This
 * test is the desktop-presence boundary only.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-011-4 — mandatory desktop header surfaces ──────────────────────────────

describe('REQ-022 / AT-011-4 — desktop header has the mandatory surfaces', () => {
  it('renders a header banner element', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders the logo as a home link inside the header', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    const logo = within(header).getByTestId('header-logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('href', '/')
  })

  it('renders the primary navigation inside the header', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('primary-nav')).toBeInTheDocument()
  })

  it('renders a search control (mandatory)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('header-search')).toBeInTheDocument()
  })

  it('renders the cart control (mandatory)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('header-cart')).toBeInTheDocument()
  })

  it('renders the language / country selector (mandatory)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    expect(within(header).getAllByTestId('header-lang').length).toBeGreaterThanOrEqual(1)
  })
})

// ── AT-011-4 — Account / Favorites are OPTIONAL (absence is allowed) ───────────

describe('REQ-022 / AT-011-4 — Account & Favorites are optional', () => {
  it('does not fail whether or not Account is present (optional surface)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    // optional: 0 or 1 is acceptable. We only assert it is not a hard error and,
    // when present, it is a real account link.
    const account = within(header).queryByTestId('header-account')
    if (account) {
      expect(account).toHaveAttribute('href', '/account')
    } else {
      expect(account).toBeNull()
    }
  })

  it('does not require a Favorites surface (optional, may be absent)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    const header = screen.getByRole('banner')
    const favorites = within(header).queryByTestId('header-favorites')
    // absence is explicitly allowed by the spec — both branches pass.
    expect(favorites === null || favorites instanceof HTMLElement).toBe(true)
  })
})
