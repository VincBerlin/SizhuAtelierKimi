/**
 * DELTA T-104 — PDP personalization gating (REQ-007 / REQ-008 / REQ-025).
 * `[REAL-BOUNDARY-jsdom]` — renders the REAL src/App.tsx composition root via
 * MemoryRouter to /product/:id and asserts the rendered PDP, not a component in
 * isolation.
 *
 * Acceptance contract (docs/tests/desenio-acceptance-design.md):
 *   AT-007-1 — BaZi PDP renders configurator / personalize-CTA + birth fields.
 *   AT-007-2 — TCM PDP renders NO birth date/time/place fields, NO personalize
 *              CTA, NO chart preview.
 *   AT-007-3 — Wuxing PDP same negative.
 *   AT-007-4 — Fire Horse PDP (personalization_level:'yearly') renders NO
 *              personalization — the FM-04 trap: 'yearly' ⇏ birth data.
 *   AT-008-2 — personalization distinction: BaZi shows it, tcm/wuxing/fire-horse
 *              do not (coupling REQ-007).
 *   AT-008-3 — Review-gate (negative): while no real reviews exist, the PDP
 *              renders NO review block and NO stars/review summary (OQ-004).
 *
 * Beat-0 Gegenthese / FM-04: Fire Horse carries `personalization_level:'yearly'`.
 * A naive reader could treat a non-'none' level as "personalizable" and show
 * birth-data UI. The gate is the shared `isPersonalizable` predicate
 * (productTypes.ts), which reads ONLY the explicit `personalizable` flag.
 *
 * RED-line discipline (Reality-Ledger): this certifies GATING + render presence,
 * never astrological accuracy — bazi.ts stays a placeholder (RED for ACCURACY).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { products } from '../../src/lib/catalog'
import { productKind, isFireHorse } from '../../src/lib/productTypes'

// Representative ids per kind, resolved from the SHIPPED catalog (not literals)
// so the test tracks the data the app actually renders.
const baziProduct = products.find((p) => productKind(p) === 'bazi')!
const tcmProduct = products.find((p) => productKind(p) === 'tcm')!
const wuxingProduct = products.find((p) => productKind(p) === 'wuxing')!
const fireHorseProduct = products.find((p) => isFireHorse(p))!

async function renderProduct(id: number) {
  const utils = render(
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <App />
    </MemoryRouter>,
  )
  // ProductView is lazily code-split behind Suspense; wait for its stable anchor.
  await screen.findByTestId('pdp', undefined, { timeout: 15000 })
  return utils
}

beforeEach(() => {
  localStorage.clear()
})

// ── sanity: the fixtures are the kinds we think they are ─────────────────────

describe('REQ-007 — PDP gating fixtures resolve to the intended kinds', () => {
  it('has a BaZi, TCM, Wuxing and Fire Horse product in the catalog', () => {
    expect(baziProduct, 'a BaZi product').toBeTruthy()
    expect(tcmProduct, 'a TCM product').toBeTruthy()
    expect(wuxingProduct, 'a Wuxing product').toBeTruthy()
    expect(fireHorseProduct, 'a Fire Horse product').toBeTruthy()
    // FM-04 trap input present on the fixture itself.
    expect(fireHorseProduct.personalization_level).toBe('yearly')
  })
})

// ── AT-007-1 — BaZi PDP SHOWS personalization ────────────────────────────────

describe('REQ-007 / AT-007-1 — BaZi PDP renders the configurator + birth fields', () => {
  it('marks the page personalizable and renders configurator, CTA, chart preview', async () => {
    await renderProduct(baziProduct.id)
    const pdp = screen.getByTestId('pdp')
    expect(pdp).toHaveAttribute('data-personalizable', 'true')
    expect(pdp).toHaveAttribute('data-product-kind', 'bazi')

    // The `pdp` shell anchor can paint a commit before the configurator subtree
    // finishes mounting under CPU contention, so re-read the configurator parts
    // inside `waitFor`. The presence assertions are unchanged.
    await waitFor(() => {
      // configurator block + the live chart/poster preview
      expect(within(pdp).getByTestId('pdp-configurator')).toBeInTheDocument()
      expect(within(pdp).getByTestId('pdp-chart-preview')).toBeInTheDocument()
      expect(within(pdp).getByTestId('pdp-personalize-cta')).toBeInTheDocument()
    })
  })

  it('renders distinct date, time and place birth-input fields', async () => {
    await renderProduct(baziProduct.id)
    const pdp = screen.getByTestId('pdp')
    // The birth inputs live inside the configurator subtree, which can mount a
    // commit after the `pdp` anchor under load — re-read them inside `waitFor`.
    await waitFor(() => {
      expect(pdp.querySelector('input[type="date"]')).toBeTruthy()
      expect(pdp.querySelector('input[type="time"]')).toBeTruthy()
      // place is a free-text field inside the configurator step 1
      const conf = within(pdp).getByTestId('pdp-configurator')
      expect(conf.querySelectorAll('input[type="text"]').length).toBeGreaterThanOrEqual(1)
    })
  })
})

// ── AT-007-2/3/4 + AT-008-2 — TCM/Wuxing/Fire-Horse PDPs show NO personalization

const NEGATIVE_CASES: { name: string; get: () => typeof products[number]; kind: string }[] = [
  { name: 'TCM', get: () => tcmProduct, kind: 'tcm' },
  { name: 'Wuxing', get: () => wuxingProduct, kind: 'wuxing' },
  { name: 'Fire Horse (yearly)', get: () => fireHorseProduct, kind: 'fire-horse' },
]

describe('REQ-007 / AT-007-2/3/4 — non-BaZi PDPs render NO personalization', () => {
  for (const c of NEGATIVE_CASES) {
    it(`${c.name} PDP: no configurator, no CTA, no chart preview, no birth fields`, async () => {
      await renderProduct(c.get().id)
      const pdp = screen.getByTestId('pdp')

      expect(pdp).toHaveAttribute('data-personalizable', 'false')
      expect(pdp).toHaveAttribute('data-product-kind', c.kind)

      // No personalization surfaces at all.
      expect(within(pdp).queryByTestId('pdp-configurator')).toBeNull()
      expect(within(pdp).queryByTestId('pdp-chart-preview')).toBeNull()
      expect(within(pdp).queryByTestId('pdp-personalize-cta')).toBeNull()

      // No birth date/time fields anywhere in the PDP.
      expect(pdp.querySelector('input[type="date"]')).toBeNull()
      expect(pdp.querySelector('input[type="time"]')).toBeNull()
    })
  }

  // FM-04 — the load-bearing trap: 'yearly' must NOT be read as personalizable.
  it('AT-007-4 / FM-04 — Fire Horse yearly level does NOT enable birth data', async () => {
    await renderProduct(fireHorseProduct.id)
    const pdp = screen.getByTestId('pdp')
    // trap input present in data, gate still closed in the render
    expect(fireHorseProduct.personalization_level).toBe('yearly')
    expect(pdp).toHaveAttribute('data-personalizable', 'false')
    expect(within(pdp).queryByTestId('pdp-configurator')).toBeNull()
  })
})

// ── AT-008-3 — review-gate: NO review block / stars while no real reviews ─────

describe('REQ-008 / AT-008-3 — no review block or stars without real reviews', () => {
  it('a product with reviews === 0 renders NO review block and NO star rating', async () => {
    // The shipped TCM/Fire-Horse SKUs are placeholders with reviews: 0.
    const zeroReview = products.find((p) => p.reviews === 0)
    expect(zeroReview, 'a product with 0 reviews must exist (placeholder SKUs)').toBeTruthy()
    await renderProduct(zeroReview!.id)
    const pdp = screen.getByTestId('pdp')
    // No review block.
    expect(within(pdp).queryByTestId('pdp-reviews')).toBeNull()
    // No star glyphs rendered as social proof.
    expect(pdp.textContent ?? '').not.toContain('★')
  })

  it('OQ-004 stays RED: NO shipped product surfaces an invented review block', async () => {
    // Until real reviews exist, NO PDP may render the review block. Assert the
    // anchor is absent across a representative product per kind (BaZi with a
    // non-zero placeholder rating, plus the zero-review TCM/Fire-Horse SKUs),
    // unmounting between renders so the App tree does not accumulate.
    const sample = [baziProduct, tcmProduct, wuxingProduct, fireHorseProduct]
    for (const p of sample) {
      await renderProduct(p.id)
      const pdp = screen.getByTestId('pdp')
      expect(
        within(pdp).queryByTestId('pdp-reviews'),
        `product #${p.id} must not render a review block while OQ-004 is open`,
      ).toBeNull()
      // and never raw star glyphs as fake social proof
      expect(pdp.textContent ?? '', `product #${p.id} must not render ★ social proof`).not.toContain('★')
      cleanup()
    }
  })
})
