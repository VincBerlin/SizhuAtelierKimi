/**
 * /inspiration production-reachability — REQ-011 / AT-011-4. `[REAL-BOUNDARY]` (jsdom).
 *
 * Iteration-3 review (high): `/inspiration` was mounted as a <Route> in App.tsx
 * and rendered correctly, but NOTHING in the production navigation linked to it —
 * the mega-menu had no Inspiration item, the mobile drawer flattened only
 * MEGA_COLUMNS (no Inspiration), and the footer had no link. Net effect: the page
 * was reachable only by typing the URL. "Route-mounted" is not "user-reachable".
 *
 * These tests drive the REAL `src/App.tsx` composition root (the production Navbar
 * + SiteFooter mounted inside it) via MemoryRouter and assert that a real user can
 * actually get to /inspiration from the persistent chrome:
 *   - the desktop mega-menu (Featured column) exposes an /inspiration link,
 *   - the mobile drawer exposes an /inspiration link,
 *   - the site footer exposes an /inspiration link,
 *   - and globally at least one persistent-chrome anchor targets /inspiration.
 *
 * The Playwright spec (tests/e2e/inspiration.spec.ts, AT-011-4) is the real-browser
 * proof and is authored but PLANNED (chromium missing in this sandbox). This jsdom
 * render through the same real App.tsx is the runnable green evidence now.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
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

// ── AT-011-4 — /inspiration is reachable from the production navigation ───────

describe('REQ-011 / AT-011-4 — /inspiration is wired into production navigation', () => {
  it('the desktop mega-menu (Featured column) links to /inspiration', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    fireEvent.click(screen.getByTestId('mega-menu-trigger'))
    const panel = await waitFor(() => screen.getByTestId('mega-menu-panel'))

    const featured = within(panel).getByTestId('mega-col-featured')
    const links = within(featured)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href') ?? '')
    expect(links).toContain('/inspiration')
  })

  it('the mobile drawer exposes an /inspiration link', async () => {
    renderApp()
    await screen.findAllByRole('navigation')

    // open the mobile drawer via the hamburger (aria-label from nav.open)
    fireEvent.click(screen.getByLabelText(/open menu/i))
    // expand the collections accordion (the mega columns flow into it)
    fireEvent.click(await screen.findByTestId('mobile-collections-toggle'))

    const drawerLinks = await screen.findAllByTestId('mobile-collection-link')
    const hrefs = drawerLinks.map((a) => a.getAttribute('href') ?? '')
    expect(hrefs).toContain('/inspiration')
  })

  it('the site footer links to /inspiration', async () => {
    renderApp()
    const footer = await screen.findByRole('contentinfo')
    // The footer chrome can paint its link list a commit after the <footer>
    // element appears under load, so re-read the hrefs inside `waitFor`. The
    // membership assertion is unchanged.
    await waitFor(() => {
      const hrefs = within(footer)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      expect(hrefs).toContain('/inspiration')
    })
  })

  it('at least one persistent-chrome anchor targets /inspiration (globally reachable)', async () => {
    renderApp()
    await screen.findAllByRole('navigation')
    // The persistent-chrome anchors (nav + footer) can finish painting a commit
    // after the navigation landmark appears under load, so poll for the
    // /inspiration anchor inside `waitFor`. The ≥1 assertion is unchanged.
    await waitFor(() => {
      const anchors = Array.from(
        document.querySelectorAll('a[href="/inspiration"]'),
      )
      expect(anchors.length).toBeGreaterThanOrEqual(1)
    })
  })
})
