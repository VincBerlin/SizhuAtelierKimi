/**
 * DELTA T-402 / T-403 — Mobile BaZi configurator: sticky preview + separate
 * DOB/TOB + place-of-birth autocomplete (REQ-012 / REQ-013).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md
 *   AT-012-1  /personalize renders a sticky-preview section AND the input fields
 *             at the same time in the DOM.
 *   AT-012-2  the preview container carries a sticky class + a max-height rule
 *             (source/style contains `sticky` + `max-h`/maxHeight).
 *   AT-013-1  /personalize renders SEPARATE date-of-birth and time-of-birth
 *             inputs (two distinct fields).
 *   AT-013-2  typing "Stuttgart" in the place field yields a "Stuttgart, Germany"
 *             suggestion from the bundled source.
 *   AT-013-3  (covered as SHIPPED-SCAN in delta-cities-source.test.ts).
 *
 * AT-012-3 / AT-013-4 are `[REAL-BROWSER-PLANNED]` (BLK-CHROMIUM): the real
 * clipping / overlap / tappable-suggestion proof at 360px needs a real browser.
 * Those Playwright specs are NOT YET written — they belong to T-801/Finalize and
 * the `tests/e2e/mobile-*.spec.ts` files do not exist yet; the status stays
 * `[REAL-BROWSER-PLANNED]` BLK-CHROMIUM and VR-MOBILE-UNVERIFIED stays RED. jsdom
 * has no layout engine, so this suite proves PRESENCE + STRUCTURE only — never
 * that nothing is clipped.
 *
 * `[REAL-BOUNDARY-jsdom]`: renders the REAL `Personalize` page through the
 * production provider chain (the same composition the `/personalize` route uses).
 *
 * RED-line discipline: nothing here certifies the BaZi chart (RL-BAZI RED) nor a
 * real geocoder (the bundled list is the policy-conformant source, OQ-003).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { ShopStoreProvider } from '../../src/store/ShopStore'
import { AuthProvider } from '../../src/store/AuthProvider'
import Personalize from '../../src/pages/Personalize'

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <I18nProvider>
        <AuthProvider>
          <ShopStoreProvider>{children}</ShopStoreProvider>
        </AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('sizhu_lang', 'EN')
})

// ── AT-012-1 — sticky preview AND input fields both present ───────────────────

describe('REQ-012 / AT-012-1 — sticky preview and inputs coexist in the DOM', () => {
  it('renders the sticky preview section and the birth-data inputs at once', () => {
    render(<Personalize />, { wrapper: Providers })

    // sticky preview section present
    const preview = screen.getByTestId('poster-preview-sticky')
    expect(preview).toBeInTheDocument()

    // input fields present at the same time (date + time + place)
    expect(document.querySelector('input[type="date"]')).toBeTruthy()
    expect(document.querySelector('input[type="time"]')).toBeTruthy()
    expect(screen.getByTestId('place-of-birth-input')).toBeInTheDocument()
  })
})

// ── AT-012-2 — sticky class + max-height rule on the preview container ────────

describe('REQ-012 / AT-012-2 — preview carries a sticky + max-height rule', () => {
  it('the rendered preview container declares position:sticky and a max-height', () => {
    render(<Personalize />, { wrapper: Providers })
    const preview = screen.getByTestId('poster-preview-sticky')

    // sticky positioning (inline style or className token)
    const styleAttr = preview.getAttribute('style') ?? ''
    const classAttr = preview.getAttribute('class') ?? ''
    const stickyInStyle = /position:\s*sticky/i.test(styleAttr)
    const stickyInClass = /sticky/.test(classAttr)
    expect(stickyInStyle || stickyInClass, 'preview is sticky').toBe(true)

    // a max-height rule (inline maxHeight or a max-h-* utility class)
    const maxHInStyle = /max-height:/i.test(styleAttr)
    const maxHInClass = /max-h/.test(classAttr)
    expect(maxHInStyle || maxHInClass, 'preview has a max-height rule').toBe(true)
  })

  it('AT-012-2 (source) — Personalize source declares the sticky + max-h contract', () => {
    const src = readFileSync(
      path.resolve(__dirname, '../../src/pages/Personalize.tsx'),
      'utf8',
    )
    expect(src).toMatch(/sticky/)
    expect(src).toMatch(/max-h|maxHeight/)
  })
})

// ── AT-013-1 — separate DOB and TOB inputs (two distinct fields) ──────────────

describe('REQ-013 / AT-013-1 — separate date-of-birth and time-of-birth inputs', () => {
  it('renders one date input and one time input as distinct fields', () => {
    render(<Personalize />, { wrapper: Providers })
    const dateInputs = document.querySelectorAll('input[type="date"]')
    const timeInputs = document.querySelectorAll('input[type="time"]')
    expect(dateInputs.length).toBeGreaterThanOrEqual(1)
    expect(timeInputs.length).toBeGreaterThanOrEqual(1)
    // they are different DOM nodes (not one field doing double duty)
    expect(dateInputs[0]).not.toBe(timeInputs[0])
  })
})

// ── AT-013-2 — place autocomplete surfaces "Stuttgart, Germany" ───────────────

describe('REQ-013 / AT-013-2 — place-of-birth autocomplete from the bundled source', () => {
  it('typing "Stuttgart" surfaces a "Stuttgart, Germany" suggestion', () => {
    render(<Personalize />, { wrapper: Providers })
    const place = screen.getByTestId('place-of-birth-input') as HTMLInputElement

    // no suggestion list before typing
    expect(screen.queryByTestId('place-suggestions')).toBeNull()

    fireEvent.change(place, { target: { value: 'Stuttgart' } })

    const list = screen.getByTestId('place-suggestions')
    expect(within(list).getByText('Stuttgart, Germany')).toBeInTheDocument()
  })

  it('selecting a suggestion fills the place input and closes the list', () => {
    render(<Personalize />, { wrapper: Providers })
    const place = screen.getByTestId('place-of-birth-input') as HTMLInputElement

    fireEvent.change(place, { target: { value: 'Stuttgart' } })
    const option = within(screen.getByTestId('place-suggestions')).getByText('Stuttgart, Germany')
    fireEvent.click(option)

    expect(place.value).toBe('Stuttgart, Germany')
    expect(screen.queryByTestId('place-suggestions')).toBeNull()
  })

  it('a non-matching place query renders no suggestion list (no dead dropdown)', () => {
    render(<Personalize />, { wrapper: Providers })
    const place = screen.getByTestId('place-of-birth-input') as HTMLInputElement
    fireEvent.change(place, { target: { value: 'zzzzzznowhere' } })
    expect(screen.queryByTestId('place-suggestions')).toBeNull()
  })
})
