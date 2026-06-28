/**
 * DELTA T-404 — BaZi-Konfigurator Poster-Hintergrundpalette (REQ-018).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md
 *   AT-018-1  [SHIPPED-SCAN] the defined background palette contains EXACTLY the
 *             5 hex values (Ink #171C20, Graphite #2B3034, Soft Line #70716C,
 *             Soft White #F8F4EE, Parchment #EFE5D8) — no extra, none missing.
 *   AT-018-2  [REAL-BOUNDARY-jsdom] the configurator renders EXACTLY 5 background
 *             swatches carrying those hex values.
 *   AT-018-3  [REAL-BOUNDARY-jsdom] selecting a swatch changes the preview
 *             background traceably (state/style reflects the chosen hex).
 *
 * Anchor placement (FROZEN policy): the palette is defined in `src/lib/tokens.ts`,
 * NOT in `src/lib/bazi.ts` (bazi.ts stays a placeholder; even the palette must not
 * live there). The configurator reads the SHIPPED palette instance from tokens.ts,
 * so a swatch list that drifts from the token source would fail AT-018-2.
 *
 * RED-line discipline (Reality-Ledger): nothing here certifies BaZi chart math
 * (RL-BAZI stays RED). This pins only the palette definition + the live-preview
 * coupling of the background swatches.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { ShopStoreProvider, useShopStore } from '../../src/store/ShopStore'
import { AuthProvider } from '../../src/store/AuthProvider'
import { POSTER_BG_PALETTE } from '../../src/lib/tokens'
import Personalize from '../../src/pages/Personalize'
import Configurator from '../../src/components/shop/Configurator'
import ProductView from '../../src/pages/ProductView'

// The exact, FROZEN 5-hex contract (normalised upper-case for comparison).
const EXPECTED_HEX = ['#171C20', '#2B3034', '#70716C', '#F8F4EE', '#EFE5D8']

const norm = (h: string) => h.trim().toUpperCase()

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
})

// ── AT-018-1 — palette is EXACTLY the 5 hex, defined in tokens.ts ────────────

describe('REQ-018 / AT-018-1 — POSTER_BG_PALETTE is exactly the 5 frozen hex', () => {
  it('contains exactly the 5 prescribed hex values (no extra, none missing)', () => {
    const hexes = POSTER_BG_PALETTE.map((p) => norm(p.hex))
    // exactly 5 entries
    expect(hexes.length).toBe(5)
    // set equality with the frozen contract (order-independent)
    expect([...hexes].sort()).toEqual([...EXPECTED_HEX].sort())
    // no duplicates
    expect(new Set(hexes).size).toBe(5)
    // every entry carries a non-empty human label (named swatch, not a bare hex)
    for (const p of POSTER_BG_PALETTE) {
      expect(p.name.trim().length, `label for ${p.hex}`).toBeGreaterThan(0)
    }
  })

  it('FM-15 — no extra colour leaks in (e.g. a 6th palette entry)', () => {
    for (const hex of POSTER_BG_PALETTE.map((p) => norm(p.hex))) {
      expect(EXPECTED_HEX, `${hex} is part of the frozen palette`).toContain(hex)
    }
  })
})

// ── AT-018-2 — the Configurator renders exactly 5 swatches with those hex ─────

describe('REQ-018 / AT-018-2 — Configurator renders exactly 5 background swatches', () => {
  it('renders 5 poster-bg swatches whose hex are exactly the frozen palette', () => {
    render(<Configurator />, { wrapper: Providers })
    const swatches = screen.getAllByTestId('poster-bg-swatch')
    expect(swatches.length).toBe(5)
    const renderedHex = swatches.map((s) => norm(s.getAttribute('data-hex') ?? ''))
    expect([...renderedHex].sort()).toEqual([...EXPECTED_HEX].sort())
  })
})

// ── AT-018-2/3 — Personalize page renders the swatches + live-preview coupling ─

describe('REQ-018 / AT-018-2/3 — Personalize renders 5 swatches and selection drives the preview', () => {
  it('renders exactly 5 poster-bg swatches with the frozen hex on the BaZi flow', () => {
    render(<Personalize />, { wrapper: Providers })
    const swatches = screen.getAllByTestId('poster-bg-swatch')
    expect(swatches.length).toBe(5)
    const renderedHex = swatches.map((s) => norm(s.getAttribute('data-hex') ?? ''))
    expect([...renderedHex].sort()).toEqual([...EXPECTED_HEX].sort())
  })

  it('AT-018-3 — selecting a swatch updates the preview background hex traceably', () => {
    render(<Personalize />, { wrapper: Providers })

    const preview = screen.getByTestId('poster-preview-sticky')
    const swatches = screen.getAllByTestId('poster-bg-swatch')

    // Pick a target swatch that differs from the current preview hex, then assert
    // the preview's reflected background hex follows the selection.
    const before = norm(preview.getAttribute('data-bg-hex') ?? '')
    const target = swatches.find((s) => norm(s.getAttribute('data-hex') ?? '') !== before)
    expect(target, 'a swatch distinct from the current background exists').toBeTruthy()
    const targetHex = norm(target!.getAttribute('data-hex') ?? '')

    fireEvent.click(within(target!).getByRole('button'))

    const after = norm(screen.getByTestId('poster-preview-sticky').getAttribute('data-bg-hex') ?? '')
    expect(after).toBe(targetHex)
    expect(after).not.toBe(before)
  })

  it('AT-018-3 — the chosen poster background reaches the /personalize cart line', async () => {
    localStorage.setItem('sizhu_lang', 'EN')
    storeRef = null
    render(
      <>
        <StoreProbe />
        <Personalize />
      </>,
      { wrapper: Providers },
    )

    // Minimum valid birth data so the add-to-cart gate passes (name + place via
    // placeholder, date + time via input type — language-stable selectors).
    fireEvent.change(screen.getByPlaceholderText('e.g. Mara'), { target: { value: 'Mara' } })
    fireEvent.change(screen.getByTestId('place-of-birth-input'), { target: { value: 'München' } })
    fireEvent.change(document.querySelector('input[type="date"]')!, { target: { value: '1990-07-21' } })
    fireEvent.change(document.querySelector('input[type="time"]')!, { target: { value: '08:30' } })

    // Choose a poster background through the real swatch control.
    const swatches = screen.getAllByTestId('poster-bg-swatch')
    const chosen = swatches[2]
    const chosenName = nameForSwatch(chosen)
    fireEvent.click(within(chosen).getByRole('button'))

    fireEvent.click(screen.getByRole('button', { name: /add personalized poster to cart/i }))

    await waitFor(() => {
      expect(storeRef, 'store bridged').not.toBeNull()
      expect(storeRef!.cart.length).toBeGreaterThanOrEqual(1)
    })
    const line = storeRef!.cart[storeRef!.cart.length - 1]
    expect(line.personalization?.posterBg).toBe(chosenName)
  })
})

// ── AT-018-3 (PDP) — swatch coupling + no silent cart drop on the PDP surface ──
//
// FM-15: the PDP configurator (mounted via ProductView) renders the 5 poster-bg
// swatches, but pre-fix the selection was a DEAD local control — it changed
// neither the PDP live preview nor the cart line. These two tests pin the real
// coupling on the PDP: the chosen background reflects in the live preview AND it
// is written into the order (no silent drop).

let storeRef: ReturnType<typeof useShopStore> | null = null
function StoreProbe() {
  storeRef = useShopStore()
  return null
}

/** Resolve a swatch's human label from the frozen palette by its hex — the label
 *  is what the order line is expected to carry. */
function nameForSwatch(el: HTMLElement): string {
  const hex = norm(el.getAttribute('data-hex') ?? '')
  return POSTER_BG_PALETTE.find((p) => norm(p.hex) === hex)!.name
}

function PdpProviders({ children, id = 1 }: { children?: React.ReactNode; id?: number }) {
  return (
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <I18nProvider>
        <AuthProvider>
          <ShopStoreProvider>
            <StoreProbe />
            <Routes>
              <Route path="/product/:id" element={<ProductView />} />
            </Routes>
            {children}
          </ShopStoreProvider>
        </AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

describe('REQ-018 / AT-018-3 (PDP) — poster-bg swatch is coupled on the product page', () => {
  it('selecting a swatch updates the PDP live-preview background hex traceably', async () => {
    storeRef = null
    render(<PdpProviders />)

    const preview = await screen.findByTestId('pdp-chart-preview')
    const swatches = screen.getAllByTestId('poster-bg-swatch')
    expect(swatches.length).toBe(5)

    const before = norm(preview.getAttribute('data-bg-hex') ?? '')
    const target = swatches.find((s) => norm(s.getAttribute('data-hex') ?? '') !== before)
    expect(target, 'a swatch distinct from the current background exists').toBeTruthy()
    const targetHex = norm(target!.getAttribute('data-hex') ?? '')

    fireEvent.click(within(target!).getByRole('button'))

    await waitFor(() => {
      const after = norm(screen.getByTestId('pdp-chart-preview').getAttribute('data-bg-hex') ?? '')
      expect(after).toBe(targetHex)
      expect(after).not.toBe(before)
    })
  })

  it('FM-15 — the chosen poster background reaches the PDP cart line (no silent drop)', async () => {
    storeRef = null
    render(<PdpProviders />)

    await screen.findByTestId('pdp')

    // Required birth data via the real store so the personalization gate passes.
    act(() => {
      storeRef!.setCfg({ name: 'Mara', date: '1990-07-21', place: 'München' })
    })

    // Choose a poster background through the real swatch control (the unit under test).
    const swatches = screen.getAllByTestId('poster-bg-swatch')
    const chosen = swatches[3]
    const chosenName = nameForSwatch(chosen)
    fireEvent.click(within(chosen).getByRole('button'))

    fireEvent.click(screen.getByTestId('pdp-personalize-cta'))

    await waitFor(() => {
      expect(storeRef!.cart.length).toBeGreaterThanOrEqual(1)
    })
    const line = storeRef!.cart[storeRef!.cart.length - 1]
    expect(line.personalization?.posterBg).toBe(chosenName)
  })
})
