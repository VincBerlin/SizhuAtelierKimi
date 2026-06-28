/**
 * DELTA — ProductCard social-proof gating (REQ-008 / REQ-010, OQ-004 RED-carry).
 *
 * `[REAL-BOUNDARY-jsdom]` — mounts the REAL src/App.tsx composition root via
 * MemoryRouter on the routes that render <ProductCard> (Collection grid, Home
 * carousel, TCM overview) and asserts the rendered cards, not a component in
 * isolation. The PDP is already gated via `REVIEWS_ENABLED && reviews > 0`
 * (ProductView.tsx); this certifies the CARDS share that single switch so the
 * two surfaces can never diverge again.
 *
 * The defect (Milestone-1 review, HIGH): ProductCard rendered <StarRating> +
 * `rating.toFixed(1)` + `sold× bought` UNCONDITIONALLY from placeholder catalog
 * numbers — invented social proof on every card across Collection / Home / TCM.
 *
 * Acceptance contract (docs/tests/desenio-acceptance-design.md):
 *   AT-008-4 — Collection/Home/TCM cards render NO ★ glyph, NO rating number and
 *              NO 'N× bought' string while no real reviews exist.
 *   AT-010-4 — the same gate (one source of truth) covers the collection grid so
 *              browse pages never surface fake social proof.
 *
 * Mutation guard (`describe('MUTATION GUARD …')`): renders a single card for a
 * high-placeholder-review BaZi SKU and asserts the social-proof block is absent.
 * If the gate is removed (fake stars reinstated), this case turns RED.
 *
 * RED-line discipline (Reality-Ledger): this certifies GATING only — it asserts
 * nothing about review authenticity; OQ-004 stays RED until real reviews land.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import ProductCard from '../../src/components/shop/ProductCard'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { products } from '../../src/lib/catalog'
import { REVIEWS_ENABLED } from '../../src/lib/config'

// A SKU carrying a non-zero PLACEHOLDER review/sold count — the exact data that
// the bug surfaced as fake stars. Resolved from the SHIPPED catalog so the test
// tracks real data, not a literal.
const highReviewProduct = products.find((p) => p.reviews > 0 && p.sold > 0)!

// The English social-proof string the buggy card rendered: `N× bought`.
const BOUGHT_RE = /\d[\d.,]*×\s*bought/i
// A bare one-decimal rating like `4.9` (the buggy `rating.toFixed(1)`).
const RATING_RE = /\b\d\.\d\b/

beforeEach(() => {
  localStorage.clear()
})

// ── precondition: reviews are OFF by default (single source of truth) ─────────

describe('precondition — REVIEWS_ENABLED is OFF until real reviews exist', () => {
  it('the global review switch defaults to false (OQ-004 RED-carry)', () => {
    expect(REVIEWS_ENABLED).toBe(false)
  })

  it('a non-zero placeholder-review SKU exists in the shipped catalog', () => {
    expect(highReviewProduct, 'a SKU with placeholder reviews>0').toBeTruthy()
    expect(highReviewProduct.reviews).toBeGreaterThan(0)
  })
})

// ── AT-008-4 / AT-010-4 — real-boundary: cards show NO fake social proof ──────

async function renderRoute(path: string, ready: () => Promise<unknown>) {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  await ready()
  return utils
}

/** Assert a card-bearing subtree carries no invented social proof. */
function expectNoSocialProof(scope: HTMLElement, label: string) {
  expect(scope.textContent ?? '', `${label}: no ★ glyph`).not.toContain('★')
  expect(scope.textContent ?? '', `${label}: no 'N× bought'`).not.toMatch(BOUGHT_RE)
  expect(
    scope.querySelector('[data-testid="card-social-proof"]'),
    `${label}: no social-proof block`,
  ).toBeNull()
}

describe('REQ-010 / AT-010-4 — Collection grid cards show no fake social proof', () => {
  it('the BaZi collection grid renders cards but NO stars / rating / bought', async () => {
    await renderRoute('/collections/bazi-posters', () =>
      screen.findByTestId('collection-grid', undefined, { timeout: 15000 }),
    )
    // The grid node can exist a commit before its product cards have finished
    // painting under CPU contention, so wait until ≥1 card is rendered (re-querying
    // grid + cards inside the retry) before asserting. The positive assertion
    // (grid is populated) is unchanged — it still has to find ≥1 real card.
    let cards: HTMLElement[] = []
    let grid!: HTMLElement
    await waitFor(() => {
      grid = screen.getByTestId('collection-grid')
      cards = within(grid).getAllByTestId('collection-product-card')
      expect(cards.length).toBeGreaterThan(0)
    })
    for (const card of cards) expectNoSocialProof(card, 'collection card')
    // No bare rating number leaked into the grid text either.
    expect(grid.textContent ?? '', 'collection grid: no bare rating').not.toMatch(RATING_RE)
  })
})

describe('REQ-008 / AT-008-4 — Home carousel cards show no fake social proof', () => {
  it('the homepage product carousel renders NO stars / rating / bought', async () => {
    // CatalogSection (module 04) feeds ProductCarousel from featuredIds, which
    // include non-zero-placeholder-review BaZi SKUs.
    await renderRoute('/', () =>
      screen.findByTestId('home-module-04', undefined, { timeout: 15000 }),
    )
    // The module-04 anchor can exist a commit before its carousel cards have
    // painted, so wait until ≥1 product link is rendered inside it (re-querying
    // the carousel on each retry). This guarantees the no-social-proof assertion
    // runs against a POPULATED carousel rather than vacuously passing on an empty
    // one — the gate assertion below is unchanged.
    let carousel!: HTMLElement
    await waitFor(() => {
      carousel = screen.getByTestId('home-module-04')
      expect(
        within(carousel).getAllByRole('link').length,
        'home carousel has rendered its cards',
      ).toBeGreaterThan(0)
    })
    expectNoSocialProof(carousel, 'home carousel')
  })
})

describe('REQ-008 / AT-008-4 — TCM overview cards show no fake social proof', () => {
  it('the /tcm overview renders product cards but NO stars / rating / bought', async () => {
    // Wait on the page H1 (unique heading) — the lazy route chunk is resolved
    // only once this is on screen.
    await renderRoute('/tcm', () =>
      screen.findByRole('heading', { level: 1 }, { timeout: 15000 }),
    )
    // The H1 can paint a commit before the product cards below it under load, so
    // wait until <main> has rendered ≥1 product link (re-querying inside the
    // retry). This keeps the no-social-proof check from passing vacuously on a
    // not-yet-populated overview; the gate assertion itself is unchanged.
    let main!: HTMLElement
    await waitFor(() => {
      main = document.querySelector('main') as HTMLElement
      expect(main, 'a <main> for the TCM overview').toBeTruthy()
      expect(
        within(main).getAllByRole('link').length,
        'tcm overview has rendered its cards',
      ).toBeGreaterThan(0)
    })
    expectNoSocialProof(main, 'tcm overview')
  })
})

// ── MUTATION GUARD — flips RED if the card gate is removed ────────────────────

describe('MUTATION GUARD — ProductCard suppresses placeholder social proof', () => {
  function renderCard(product: typeof products[number]) {
    return render(
      <MemoryRouter>
        <I18nProvider>
          <ProductCard product={product} />
        </I18nProvider>
      </MemoryRouter>,
    )
  }

  it('a high-placeholder-review BaZi card renders NO ★, NO rating, NO bought', () => {
    const { container } = renderCard(highReviewProduct)
    // The card itself rendered (title present), so this is a real positive card.
    expect(container.textContent ?? '', 'card title present').toContain(
      highReviewProduct.category,
    )
    // …yet none of its placeholder social proof is surfaced.
    expect(container.textContent ?? '').not.toContain('★')
    expect(container.textContent ?? '').not.toMatch(BOUGHT_RE)
    expect(
      container.querySelector('[data-testid="card-social-proof"]'),
      'social-proof block must be gated out',
    ).toBeNull()
    cleanup()
  })

  it('NO shipped product surfaces a card social-proof block while OQ-004 is open', () => {
    for (const p of products) {
      const { container } = renderCard(p)
      expect(
        container.querySelector('[data-testid="card-social-proof"]'),
        `product #${p.id} must not render a card social-proof block`,
      ).toBeNull()
      expect(container.textContent ?? '', `product #${p.id}: no ★`).not.toContain('★')
      cleanup()
    }
  })
})
