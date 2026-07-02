/**
 * AT-014-3 [REAL-BOUNDARY] — Composition-root boot smoke.
 *
 * Proves the Vitest runner + jsdom + Testing Library are wired up AND that the
 * real production composition root boots through its full provider chain
 * (BrowserRouter → I18nProvider → ShopStoreProvider → AuthProvider → AppShell)
 * without crashing. Per REQ-014 the smoke MUST mount the real `src/App.tsx`
 * (not an isolated component), otherwise later reachability evidence is worthless
 * (Reality-Ledger break, acceptance-design §REQ-014 Gegenthese).
 *
 * This is the ONE trivial real-boundary smoke for T-01. It does not assert on
 * page content beyond "the app mounted and at least one route rendered".
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

// DOM cleanup after each test is handled globally in tests/setup.ts.
// `findAllByRole` (async) lets React flush the AuthProvider's post-mount state
// update inside act(...), so the mount settles cleanly with no act warnings.

describe('[REAL-BOUNDARY] App composition root boots', () => {
  it('mounts the real provider chain without crashing', async () => {
    // MemoryRouter stands in for main.tsx's BrowserRouter so the test is
    // environment-independent; the App + every provider underneath is the real
    // production code path.
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    // Wait for the shell to paint real DOM (and for async provider state to
    // settle) before asserting the mount succeeded.
    await screen.findAllByRole('navigation')
    expect(container).toBeTruthy()
  })

  it('renders the persistent chrome (navigation landmark) on the home route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    // The Navbar is part of AppShell and is always present regardless of which
    // lazy route resolves — a stable, real-boundary anchor that proves the
    // composition root rendered actual DOM. The shell renders both a desktop
    // and a mobile <nav> (the latter hidden via CSS but present in the DOM), so
    // assert "at least one navigation landmark" rather than a unique one.
    const navs = await screen.findAllByRole('navigation')
    expect(navs.length).toBeGreaterThan(0)
  })
})
