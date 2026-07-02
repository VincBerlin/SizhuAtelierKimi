/**
 * DELTA — Review-gate FLAG-ON certification (REQ-008 / REQ-010, OQ-004 RED-carry).
 *
 * The companion suites (`delta-card-review-gating`, `delta-pdp-personalization-gating`)
 * only ever exercise the gate with `REVIEWS_ENABLED === false`. Because the flag is
 * read once at module-eval (`config.ts`: `import.meta.env.VITE_REVIEWS_ENABLED === 'true'`),
 * the gate
 *
 *     showReviews = REVIEWS_ENABLED && product.reviews > 0
 *
 * short-circuits on the FIRST operand in every default run — so the SECOND half
 * (`reviews > 0`) is never observed. A refactor that dropped `&& reviews > 0` (or
 * replaced it with `&& true`) would stay GREEN across the whole default suite while
 * silently re-enabling fake social proof the moment the flag is flipped on in prod.
 *
 * This file closes that hole. It stubs `VITE_REVIEWS_ENABLED=true`, resets the module
 * registry and RE-IMPORTS the real composition root so `REVIEWS_ENABLED` re-evaluates
 * to `true`, then certifies BOTH halves of the gate under the flag:
 *
 *   - reviews > 0  (BaZi SKU, placeholder reviews: 318): the social-proof block
 *     renders on the ProductCard AND on the PDP — the gate's positive branch works.
 *   - reviews === 0 (TCM SKU 11–14, reviews: 0): NO social-proof block renders on
 *     either surface, EVEN WITH THE FLAG ON — "enabling the flag alone never invents
 *     proof" (config.ts contract). This is the `reviews > 0` half; removing it turns
 *     this case RED.
 *
 * Acceptance coupling (docs/tests/desenio-acceptance-design.md):
 *   AT-008-3 / AT-008-4 / AT-010-4 assert the NEGATIVE (flag off). This is their
 *   positive complement: it proves the single source of truth discriminates on the
 *   per-product real-review count, not on the global switch alone.
 *
 * RED-line discipline (Reality-Ledger): this certifies GATE MECHANICS only — it
 * asserts nothing about review authenticity. The catalog numbers are placeholders;
 * OQ-004 stays RED until real reviews land. Production ships with the flag OFF
 * (`config.ts` default), so this test does NOT make social proof live.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { products } from '../../src/lib/catalog'

// Fixtures resolved from the SHIPPED catalog (not literals) so the test tracks the
// data the app actually renders. A BaZi SKU with placeholder reviews>0 is the exact
// data the original bug surfaced as fake stars; a TCM SKU with reviews===0 is the
// load-bearing negative that the `reviews > 0` half must still suppress.
const reviewedProduct = products.find((p) => p.product_world === 'bazi' && p.reviews > 0)!
const zeroReviewProduct = products.find((p) => p.product_world === 'tcm' && p.reviews === 0)!

// StarRating always paints five glyphs; their presence marks a rendered social-proof
// block regardless of the (placeholder) rating value.
const STAR = '★'

/**
 * Enable the reviews flag at the ENV boundary and hand back freshly-evaluated
 * modules. `vi.stubEnv` must precede `vi.resetModules()` so the re-imported
 * `config.ts` (and everything that closes over `REVIEWS_ENABLED`) reads the new
 * value — a plain top-of-file import would already be bound to the default `false`.
 */
async function importWithReviewsOn() {
  vi.stubEnv('VITE_REVIEWS_ENABLED', 'true')
  vi.resetModules()
  const config = await import('../../src/lib/config')
  const App = (await import('../../src/App')).default
  const ProductCard = (await import('../../src/components/shop/ProductCard')).default
  const { I18nProvider } = await import('../../src/i18n/I18nProvider')
  return { config, App, ProductCard, I18nProvider }
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  // Restore the env + module registry so the shared (--isolate=false) worker hands
  // the default `REVIEWS_ENABLED === false` back to every other test file.
  cleanup()
  vi.unstubAllEnvs()
  vi.resetModules()
})

// ── precondition: the flip actually re-evaluates the switch ──────────────────

describe('precondition — re-import flips REVIEWS_ENABLED to true', () => {
  it('a re-imported config reads REVIEWS_ENABLED === true under the stubbed flag', async () => {
    const { config } = await importWithReviewsOn()
    expect(config.REVIEWS_ENABLED).toBe(true)
  })

  it('the fixtures are the intended SKUs (placeholder-reviewed BaZi + zero-review TCM)', () => {
    expect(reviewedProduct, 'a BaZi SKU with placeholder reviews>0').toBeTruthy()
    expect(reviewedProduct.reviews).toBeGreaterThan(0)
    expect(zeroReviewProduct, 'a TCM SKU with reviews===0').toBeTruthy()
    expect(zeroReviewProduct.reviews).toBe(0)
  })
})

// ── reviews > 0 half — the social-proof block RENDERS under the flag ─────────

describe('REQ-008 / REQ-010 — flag ON + reviews>0: social proof renders', () => {
  it('a placeholder-reviewed BaZi ProductCard renders the social-proof block (★)', async () => {
    const { ProductCard, I18nProvider } = await importWithReviewsOn()
    const { container } = render(
      <MemoryRouter>
        <I18nProvider>
          <ProductCard product={reviewedProduct} />
        </I18nProvider>
      </MemoryRouter>,
    )
    const block = container.querySelector('[data-testid="card-social-proof"]')
    expect(block, 'card social-proof block present when flag ON and reviews>0').not.toBeNull()
    expect(block?.textContent ?? '', 'card social proof shows ★ glyphs').toContain(STAR)
  })

  it('the BaZi PDP renders the review block (★) under the flag', async () => {
    const { App } = await importWithReviewsOn()
    render(
      <MemoryRouter initialEntries={[`/product/${reviewedProduct.id}`]}>
        <App />
      </MemoryRouter>,
    )
    await screen.findByTestId('pdp', undefined, { timeout: 15000 })
    const reviews = await screen.findByTestId('pdp-reviews', undefined, { timeout: 15000 })
    expect(reviews, 'PDP review block present when flag ON and reviews>0').toBeInTheDocument()
    expect(reviews.textContent ?? '', 'PDP review block shows ★ glyphs').toContain(STAR)
  })
})

// ── reviews === 0 half — MUTATION GUARD: flag alone never invents proof ──────

describe('REQ-008 / REQ-010 — flag ON + reviews===0: still NO social proof (gate half)', () => {
  it('a zero-review TCM ProductCard renders NO social-proof block even with the flag ON', async () => {
    const { ProductCard, I18nProvider } = await importWithReviewsOn()
    const { container } = render(
      <MemoryRouter>
        <I18nProvider>
          <ProductCard product={zeroReviewProduct} />
        </I18nProvider>
      </MemoryRouter>,
    )
    // The card itself rendered (category present) — a real negative, not vacuous.
    expect(container.textContent ?? '', 'card title present').toContain(zeroReviewProduct.category)
    expect(
      container.querySelector('[data-testid="card-social-proof"]'),
      'flag alone must NOT invent a card social-proof block for a reviews===0 SKU',
    ).toBeNull()
    expect(container.textContent ?? '', 'no ★ on a zero-review card').not.toContain(STAR)
  })

  it('the zero-review TCM PDP renders NO review block even with the flag ON', async () => {
    const { App } = await importWithReviewsOn()
    render(
      <MemoryRouter initialEntries={[`/product/${zeroReviewProduct.id}`]}>
        <App />
      </MemoryRouter>,
    )
    const pdp = await screen.findByTestId('pdp', undefined, { timeout: 15000 })
    // The PDP rendered; the review block specifically must stay absent.
    expect(
      within(pdp).queryByTestId('pdp-reviews'),
      'flag alone must NOT invent a PDP review block for a reviews===0 SKU',
    ).toBeNull()
    expect(pdp.textContent ?? '', 'no ★ on a zero-review PDP').not.toContain(STAR)
  })

  it('NO zero-review SKU surfaces a card social-proof block, even with the flag ON', async () => {
    const { ProductCard, I18nProvider } = await importWithReviewsOn()
    const zeroReviewSkus = products.filter((p) => p.reviews === 0)
    expect(zeroReviewSkus.length, 'placeholder zero-review SKUs exist').toBeGreaterThan(0)
    for (const p of zeroReviewSkus) {
      const { container } = render(
        <MemoryRouter>
          <I18nProvider>
            <ProductCard product={p} />
          </I18nProvider>
        </MemoryRouter>,
      )
      expect(
        container.querySelector('[data-testid="card-social-proof"]'),
        `SKU #${p.id} (reviews:0) must not surface social proof under the flag`,
      ).toBeNull()
      expect(container.textContent ?? '', `SKU #${p.id}: no ★`).not.toContain(STAR)
      cleanup()
    }
  })
})

// ── safety net: the stub does not leak the flag to default-config consumers ──

describe('isolation — the env stub is scoped to this file', () => {
  it('after restore, a fresh config re-import is back to REVIEWS_ENABLED === false', async () => {
    vi.unstubAllEnvs()
    vi.resetModules()
    const { REVIEWS_ENABLED } = await import('../../src/lib/config')
    expect(REVIEWS_ENABLED).toBe(false)
  })
})
