/**
 * M18 — accessibility / keyboard pass on the new M9–M17 surfaces. `[REAL-BOUNDARY]`
 * (jsdom via real App.tsx).
 *
 * Covers the a11y glue that was missing after the nav/filter rework:
 *  1. a skip link that targets a focusable #main-content region (keyboard users
 *     can bypass the header);
 *  2. focus moves to #main-content on route change (SR/keyboard users land on the
 *     new page instead of being stranded in the chrome);
 *  3. the mega-menu disclosure is ARIA-wired (trigger aria-controls → panel id,
 *     aria-haspopup/expanded already present);
 *  4. the collection filter rows are labelled groups (role=group + aria-label),
 *     with the facet chips exposing aria-pressed.
 *
 * NOTE (sandbox): jsdom workers hang in the build sandbox, so this runs on the dev
 * machine; the markup half was verified in-sandbox by a renderToStaticMarkup smoke
 * (12/0).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router'
import App from '../../src/App'

function Nav({ to }: { to: string }) {
  const n = useNavigate()
  return <button data-testid="nav-to" onClick={() => n(to)}>go</button>
}
function renderApp(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <App />
      <Nav to="/faq" />
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())

describe('M18 — skip link + focusable main-content landmark', () => {
  it('renders a localized skip link that targets the focusable #main-content region', () => {
    renderApp()
    const skip = screen.getByTestId('skip-link')
    expect(skip).toHaveAttribute('href', '#main-content')
    expect(skip.textContent?.trim().length ?? 0).toBeGreaterThan(0)
    expect(skip.textContent).not.toContain('a11y.') // localized, not a raw i18n key
    const main = document.getElementById('main-content')
    expect(main).not.toBeNull()
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('activating the skip link moves keyboard focus into #main-content (not just scroll)', () => {
    renderApp()
    const main = document.getElementById('main-content')!
    expect(document.activeElement).not.toBe(main)
    fireEvent.click(screen.getByTestId('skip-link'))
    expect(document.activeElement).toBe(main)
  })
})

describe('M18 — mega-menu ARIA disclosure wiring', () => {
  it('the trigger aria-controls points to the panel id', () => {
    renderApp()
    const trigger = screen.getByTestId('mega-menu-trigger')
    expect(trigger).toHaveAttribute('aria-controls', 'mega-menu-panel')
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(screen.getByTestId('mega-menu-panel')).toHaveAttribute('id', 'mega-menu-panel')
  })
})

describe('M18 — collection filter facets are labelled groups', () => {
  it('each filter row is role=group with an accessible label; chips expose aria-pressed', async () => {
    renderApp('/collections/tcm-posters') // Batch #12: bazi-Kollektion ist Redirect
    await screen.findByTestId('collection-page', undefined, { timeout: 15000 })
    const styleGroup = screen.getByTestId('collection-filter-style')
    expect(styleGroup).toHaveAttribute('role', 'group')
    expect((styleGroup.getAttribute('aria-label') ?? '').length).toBeGreaterThan(0)
    expect(styleGroup.querySelector('[aria-pressed]')).not.toBeNull()
  })
})

describe('M18 — focus moves to main content on route change', () => {
  it('navigating focuses #main-content (not focused on initial mount)', async () => {
    renderApp('/')
    const main = document.getElementById('main-content')!
    expect(document.activeElement).not.toBe(main) // initial mount does not steal focus
    fireEvent.click(screen.getByTestId('nav-to'))
    await waitFor(() => expect(document.activeElement).toBe(main))
  })
})
