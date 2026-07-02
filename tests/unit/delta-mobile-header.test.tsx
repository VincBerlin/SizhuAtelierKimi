/**
 * DELTA T-401 — Mobile header presence & operability (REQ-011 / REQ-022 mobile
 * part). `[REAL-BOUNDARY-jsdom]` — drives the REAL src/App.tsx composition root
 * (MemoryRouter) and asserts the mobile-header surfaces are in the DOM and
 * operable, plus that the cart badge renders (not display:none) when an item is
 * in the cart.
 *
 * Acceptance contract (docs/tests/desenio-acceptance-design.md §REQ-011/REQ-022):
 *   AT-011-1 — the mobile header renders the hamburger / drawer trigger, the
 *              logo, a search access, a cart icon and a language access, all in
 *              the DOM and operable (the hamburger actually opens the drawer; the
 *              drawer exposes a reachable language access).
 *   AT-011-2 — with one item in the cart, the cart badge element renders and is
 *              NOT display:none (the count is visible, not hidden).
 *
 * Scope guard (do NOT regress M2):
 *   AT-011-4 — the existing desktop header surfaces (logo, primary-nav, search,
 *              cart, language) and the 8-entry primary nav are still present.
 *
 * Boundary honesty (acceptance-design §REQ-011 + Reality-Ledger VR-MOBILE-
 * UNVERIFIED): jsdom has NO layout engine, so these tests prove ONLY presence +
 * operability of the mobile-header elements. The real no-clip / no-horizontal-
 * scroll proof at 360/390/430 px is the desenio-delta AT-011-3 = Mobile-No-Clip
 * (docs/tests/desenio-acceptance-design.md) — a `[REAL-BROWSER-PLANNED]` Playwright
 * spec (BLK-CHROMIUM) that is NOT YET written: it belongs to T-801/Finalize and
 * `tests/e2e/mobile-*.spec.ts` does not exist yet. Nothing here may be read as
 * that proof; the mobile clipping line stays RED until that spec is authored and
 * Playwright runs in a real browser.
 *
 * ID disambiguation (label collision): this `AT-011-3` is the desenio-delta
 * Mobile-No-Clip acceptance — the M4 contract. It is DISTINCT from the legacy
 * `AT-011-3` in docs/tests/acceptance-design.md, which pins the /inspiration
 * placeholder-tile marking and is covered by tests/e2e/inspiration.spec.ts +
 * tests/unit/inspiration-page.test.tsx. Same numeric label, two different source
 * contracts — do not conflate them.
 *
 * Race-freedom: every read of a surface that paints behind the lazy
 * Suspense/Three.js hero is anchored to a single awaited `findBy*` (or a
 * `waitFor` with a re-query inside) — never split read-after-find — so a
 * slow-but-correct first paint cannot race a stale handle under CPU contention
 * (pattern: delta-collection-template-inventory AT-009-2).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import type { CartLine } from '../../src/store/ShopStore'

const CART_KEY = 'sizhu_cart'

/** Render the real App and wait for the header banner to paint (the navbar is
 *  in the static shell, so it is available as soon as the tree mounts). The
 *  awaited `findByRole('banner')` is the single race-safe anchor. */
async function renderApp(path = '/') {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByRole('banner', undefined, { timeout: 15000 })
  return utils
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-011-1 — mobile-header surfaces are in the DOM ─────────────────────────

describe('REQ-011 / AT-011-1 — mobile header renders all surfaces in the DOM', () => {
  it('renders the hamburger / mobile drawer trigger', async () => {
    await renderApp()
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('mobile-menu-trigger')).toBeInTheDocument()
  })

  it('renders the logo as a home link', async () => {
    await renderApp()
    const header = screen.getByRole('banner')
    const logo = within(header).getByTestId('header-logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('href', '/')
  })

  it('renders a search access control', async () => {
    await renderApp()
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('header-search')).toBeInTheDocument()
  })

  it('renders a cart icon control', async () => {
    await renderApp()
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('header-cart')).toBeInTheDocument()
  })

  it('exposes a language access reachable from the mobile UI', async () => {
    await renderApp()
    // At least one language access exists in the rendered tree (header surface
    // and/or the mobile drawer). Presence (not desktop-only) is what AT-011-1
    // requires for the mobile language access.
    expect(screen.getAllByTestId('header-lang').length).toBeGreaterThanOrEqual(1)
  })
})

// ── AT-011-1 — the hamburger is OPERABLE (opens the drawer) ───────────────────

describe('REQ-011 / AT-011-1 — the hamburger opens an operable mobile drawer', () => {
  it('clicking the hamburger opens the mobile drawer with a language access inside', async () => {
    await renderApp()
    const header = screen.getByRole('banner')
    const trigger = within(header).getByTestId('mobile-menu-trigger')

    fireEvent.click(trigger)

    // The drawer is the mobile menu container; it carries a stable testid and a
    // reachable language access. Re-query inside waitFor so a slow open animation
    // / state flush cannot race a stale handle.
    await waitFor(() => {
      const drawer = screen.getByTestId('mobile-menu')
      expect(drawer).toBeInTheDocument()
      expect(within(drawer).getByTestId('mobile-menu-lang')).toBeInTheDocument()
    })
  })
})

// ── AT-011-2 — cart badge renders (not display:none) with an item in the cart ─

const seededLine: CartLine = {
  key: 'k-seed',
  title: 'BaZi Geburtschart — Vier Säulen',
  price: 49,
  qty: 1,
  poster: null,
  meta: 'Natural oak · Sandstone · A2',
  productId: 'poster-1',
  variantId: 'A2|#1B1B1B',
}

describe('REQ-011 / AT-011-2 — cart badge is visible with an item in the cart', () => {
  it('renders the cart badge element and it is NOT display:none', async () => {
    localStorage.setItem(CART_KEY, JSON.stringify([seededLine]))
    await renderApp()

    // The badge is gated on cartCount > 0; with a seeded item it must render.
    // Anchor on findByTestId so a state-hydration flush cannot race the read.
    const badge = await screen.findByTestId('cart-badge', undefined, { timeout: 15000 })
    expect(badge).toBeInTheDocument()
    expect(badge).not.toHaveStyle({ display: 'none' })
    // the visible count reflects the seeded quantity
    expect(badge).toHaveTextContent('1')
  })

  it('does NOT render the cart badge when the cart is empty', async () => {
    await renderApp()
    expect(screen.queryByTestId('cart-badge')).toBeNull()
  })
})

// ── AT-011-4 (scope guard) — desktop surfaces + 8-entry nav still intact ──────

describe('REQ-022 / AT-011-4 — mobile work does not regress desktop header', () => {
  it('keeps the mandatory desktop header surfaces present', async () => {
    await renderApp()
    const header = screen.getByRole('banner')
    expect(within(header).getByTestId('header-logo')).toBeInTheDocument()
    expect(within(header).getByTestId('primary-nav')).toBeInTheDocument()
    expect(within(header).getByTestId('header-search')).toBeInTheDocument()
    expect(within(header).getByTestId('header-cart')).toBeInTheDocument()
    expect(within(header).getAllByTestId('header-lang').length).toBeGreaterThanOrEqual(1)
  })

  it('keeps exactly 8 primary-nav entries', async () => {
    await renderApp()
    const nav = within(screen.getByRole('banner')).getByTestId('primary-nav')
    const entries = nav.querySelectorAll('[data-nav-primary]')
    expect(entries.length).toBe(8)
  })
})
