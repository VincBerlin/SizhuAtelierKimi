/**
 * DELTA T-105 — CartDrawer birth-data review notice gated to BaZi lines only
 * (REQ-014). `[REAL-BOUNDARY-jsdom]` — seeds the REAL ShopStore (via the cart's
 * own localStorage hydration) through the real App composition root, opens the
 * real CartDrawer from the real Navbar trigger, and asserts the notice is
 * line-precise, never global.
 *
 * Acceptance contract (docs/tests/desenio-acceptance-design.md):
 *   AT-014-1 — cart with one BaZi line (has `personalization`) → birth-data
 *              review notice visible AT that line.
 *   AT-014-2 — cart with one Fire-Horse/TCM line (no `personalization`) → NO
 *              birth-data review notice at that line.
 *   AT-014-3 — mixed cart (BaZi + TCM) → review notice ONLY at the BaZi line
 *              (line-precise gating, not global).
 *
 * Beat-0 Gegenthese / FM-05: a naive implementation hangs the notice on
 * `product_world` or the title, or renders it once globally in the cart footer.
 * The gate MUST be the per-line `personalization` field. These tests fail if the
 * notice is global or attached to a non-personalized line.
 *
 * RED-line discipline: gating only — certifies nothing about chart accuracy.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import type { CartLine } from '../../src/store/ShopStore'

const CART_KEY = 'sizhu_cart'

// A personalized BaZi line carries the `personalization` object (date/place/…).
const baziLine: CartLine = {
  key: 'k-bazi',
  title: 'BaZi Geburtschart — Vier Säulen',
  price: 49,
  qty: 1,
  poster: { frame: '#1B1B1B', bg: '#E9DFCB', name: 'Mara', element: 'Wood', animal: 'Horse', pillars: [] } as any,
  meta: 'Natural oak · Sandstone · A2',
  personalization: { date: '1990-07-21', time: '12:00', place: 'Munich', name: 'Mara' },
  productId: 'poster-1',
  variantId: 'A2|#1B1B1B',
}

// A non-personalized line (Fire Horse / TCM): no `personalization` field, a
// static image instead of a rendered poster.
const tcmLine: CartLine = {
  key: 'k-tcm',
  title: 'TCM Educational Poster',
  price: 39,
  qty: 1,
  poster: null,
  meta: 'Educational',
  image: '/images/posters/tcm-elements.webp',
  productId: 'poster-11',
  variantId: '',
}

/** Seed the cart via the store's own localStorage hydration, render the real
 *  App, then open the cart drawer from the real Navbar trigger. */
async function renderCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
  const utils = render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  // Open the cart from the real header trigger (there may be a desktop + mobile
  // button — click the first; both call openCart()).
  const triggers = await screen.findAllByLabelText(/cart|warenkorb|panier/i, undefined, { timeout: 15000 })
  fireEvent.click(triggers[0])
  await screen.findAllByTestId('cart-line', undefined, { timeout: 15000 })
  return utils
}

/** The cart line whose title matches — line subtree to scope per-line asserts. */
function lineByTitle(title: string): HTMLElement {
  const lines = screen.getAllByTestId('cart-line')
  const match = lines.find((el) => el.textContent?.includes(title))
  if (!match) throw new Error(`no cart-line for "${title}"`)
  return match
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-014-1 — BaZi line shows the birth-data review notice at the line ──────

describe('REQ-014 / AT-014-1 — BaZi line shows the birth-data review notice', () => {
  it('a personalized BaZi line renders a per-line birth-data review notice', async () => {
    await renderCart([baziLine])
    const line = lineByTitle(baziLine.title)
    expect(line).toHaveAttribute('data-personalized', 'true')
    expect(within(line).getByTestId('cart-line-birth-review')).toBeInTheDocument()
  })
})

// ── AT-014-2 — non-personalized line shows NO notice ─────────────────────────

describe('REQ-014 / AT-014-2 — non-personalized line shows NO birth-data notice', () => {
  it('a Fire-Horse/TCM line renders NO per-line birth-data review notice', async () => {
    await renderCart([tcmLine])
    const line = lineByTitle(tcmLine.title)
    expect(line).toHaveAttribute('data-personalized', 'false')
    expect(within(line).queryByTestId('cart-line-birth-review')).toBeNull()
  })

  it('FM-05 — the notice is NOT rendered globally in the cart (no footer notice)', async () => {
    await renderCart([tcmLine])
    // A cart with only a non-personalized line shows the notice NOWHERE.
    expect(screen.queryByTestId('cart-line-birth-review')).toBeNull()
  })
})

// ── AT-014-3 — mixed cart: notice ONLY at the BaZi line ──────────────────────

describe('REQ-014 / AT-014-3 — mixed cart gates the notice to the BaZi line only', () => {
  it('shows the notice at the BaZi line and NOT at the TCM line', async () => {
    await renderCart([baziLine, tcmLine])

    const bazi = lineByTitle(baziLine.title)
    const tcm = lineByTitle(tcmLine.title)

    expect(bazi).toHaveAttribute('data-personalized', 'true')
    expect(tcm).toHaveAttribute('data-personalized', 'false')

    expect(within(bazi).getByTestId('cart-line-birth-review')).toBeInTheDocument()
    expect(within(tcm).queryByTestId('cart-line-birth-review')).toBeNull()

    // exactly ONE notice in the whole drawer (line-precise, not global)
    expect(screen.getAllByTestId('cart-line-birth-review').length).toBe(1)
  })
})
