/**
 * DELTA T-302 — Product Card anatomy, ASSET-LIGHT (REQ-023). `[REAL-BOUNDARY-jsdom]`.
 *
 * Acceptance contracts (docs/tests/desenio-acceptance-design.md §REQ-023):
 *   AT-023-1  a rendered Product Card carries an image field, a title, a short
 *             claim, a price and EXACTLY ONE unambiguous CTA link (to the PDP /
 *             product route).
 *   AT-023-2  ASSET-LIGHT proof — the image field is a marked placeholder
 *             (data-placeholder) and renders NO real product photo
 *             (no <img src=/images/*.webp>, no .webp background). FM-11 /
 *             CAN-014 / RISK-001: the placeholder must not look like a real
 *             product photo.
 *   AT-023-3  optional badge — if present it is a distinct element
 *             (data-testid="card-badge"); its absence is allowed.
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-023): the card may look "complete"
 * yet (a) show a placeholder image that LOOKS like a real product photo
 * (CAN-014 breach) — the TCM/Wuxing branch shipped a real /images/*.webp — or
 * (b) the CTA is ambiguous/dead (the V2 card navigated via a div onClick with
 * NO real link element, so there was no addressable CTA link at all). This test
 * drives the REAL src/App.tsx collection grid + isolated cards and pins every
 * mandatory anatomy part, the single live CTA href, and the asset-light field.
 *
 * M2 INVARIANT (must stay intact): the social-proof gate is the SAME switch as
 * the PDP — `REVIEWS_ENABLED && product.reviews > 0`. This file re-asserts that
 * the asset-light refactor never reinstated fake stars (`card-social-proof`
 * stays absent while OQ-004 is open). It does NOT soften the gate.
 *
 * RED-line discipline (RL-IMAGES / OQ-001): real product imagery is launch-
 * blocking and intentionally absent in this run. These tests pin the asset-light
 * contract, never a final visual.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import ProductCard from '../../src/components/shop/ProductCard'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { products } from '../../src/lib/catalog'

// Resolved from the SHIPPED catalog so the fixtures track real data, not literals.
// A personalizable BaZi SKU that carries an anchor (→ optional badge present) and
// a non-zero placeholder review count (→ exercises the M2 review-gate guard).
const baziProduct = products.find(
  (p) => p.product_world === 'bazi' && p.personalizable !== false && p.anchor != null && p.reviews > 0,
)!
// A NON-personalizable SKU that ships a real /images/*.webp — the exact data
// that AT-023-2 forbids leaking into the asset-light card image field.
const tcmProduct = products.find(
  (p) => p.personalizable === false && typeof p.image === 'string' && /\/images\/.*\.webp/i.test(p.image),
)!

// A real product photo path the asset-light field must never surface.
const WEBP_RE = /\/images\/.*\.webp/i

beforeEach(() => {
  localStorage.clear()
})

// ── precondition — fixtures resolved from the shipped catalog ─────────────────

describe('precondition — fixtures exist in the shipped catalog', () => {
  it('a personalizable BaZi SKU with an anchor and placeholder reviews exists', () => {
    expect(baziProduct, 'a personalizable BaZi SKU with anchor + reviews').toBeTruthy()
  })
  it('a non-personalizable SKU carrying a real /images/*.webp exists', () => {
    expect(tcmProduct, 'a non-personalizable SKU with a real .webp image').toBeTruthy()
    expect(tcmProduct.image).toMatch(WEBP_RE)
  })
})

// ── isolated card render helper ───────────────────────────────────────────────

function renderCard(product: typeof products[number]) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <ProductCard product={product} />
      </I18nProvider>
    </MemoryRouter>,
  )
}

/** Assert the full AT-023 anatomy on one rendered card root. */
function expectCardAnatomy(root: HTMLElement, product: typeof products[number], label: string) {
  // (1) image field — present and marked as an asset-light placeholder (AT-023-2)
  const imageField = within(root).getByTestId('card-image')
  expect(imageField, `${label}: image field`).toBeTruthy()
  expect(imageField).toHaveAttribute('data-placeholder', 'true')

  // (2) title — non-empty
  const title = within(root).getByTestId('card-title')
  expect(title.textContent?.trim().length ?? 0, `${label}: non-empty title`).toBeGreaterThan(0)

  // (3) short claim — non-empty, present on EVERY card (incl. non-personalizable)
  const claim = within(root).getByTestId('card-claim')
  expect(claim.textContent?.trim().length ?? 0, `${label}: non-empty claim`).toBeGreaterThan(0)

  // (4) price — the formatted price string is rendered
  const price = within(root).getByTestId('card-price')
  expect(price.textContent ?? '', `${label}: price shown`).toContain(
    product.price.toFixed(2).replace('.', ','),
  )

  // (5) EXACTLY ONE unambiguous CTA link → the PDP product route
  const cta = within(root).getByTestId('card-cta')
  expect(cta.tagName, `${label}: CTA is an anchor`).toBe('A')
  expect(cta.getAttribute('href'), `${label}: CTA targets the PDP`).toBe(`/product/${product.id}`)
  const links = within(root).getAllByRole('link')
  expect(links.length, `${label}: exactly one CTA link`).toBe(1)
}

/** Assert the image field is asset-light: no real .webp product photo (AT-023-2 / FM-11). */
function expectAssetLight(root: HTMLElement, label: string) {
  const imageField = within(root).getByTestId('card-image')
  expect(imageField).toHaveAttribute('data-placeholder', 'true')
  // no inline background-image of a real .webp
  expect(WEBP_RE.test(imageField.getAttribute('style') ?? ''), `${label}: no .webp bg`).toBe(false)
  // no <img> pointing at a real product photo anywhere in the card
  for (const img of Array.from(root.querySelectorAll('img'))) {
    expect(WEBP_RE.test(img.getAttribute('src') ?? ''), `${label}: no real product <img>`).toBe(false)
  }
}

// ── AT-023-1 — full anatomy on both card branches ─────────────────────────────

describe('REQ-023 / AT-023-1 — card anatomy (image, title, claim, price, one CTA link)', () => {
  it('a personalizable BaZi card has the full anatomy + a single PDP CTA link', () => {
    const { container } = renderCard(baziProduct)
    expectCardAnatomy(container as HTMLElement, baziProduct, 'bazi card')
    cleanup()
  })

  it('a non-personalizable TCM card has the full anatomy + a single PDP CTA link', () => {
    const { container } = renderCard(tcmProduct)
    expectCardAnatomy(container as HTMLElement, tcmProduct, 'tcm card')
    cleanup()
  })
})

// ── AT-023-2 — ASSET-LIGHT: data-placeholder, never a real product photo ──────

describe('REQ-023 / AT-023-2 — image field is an asset-light placeholder (FM-11)', () => {
  it('the non-personalizable card never surfaces its real /images/*.webp', () => {
    const { container } = renderCard(tcmProduct)
    expectAssetLight(container as HTMLElement, 'tcm card')
    cleanup()
  })

  it('the personalizable card image field is an asset-light placeholder too', () => {
    const { container } = renderCard(baziProduct)
    expectAssetLight(container as HTMLElement, 'bazi card')
    cleanup()
  })

  it('NO shipped product surfaces a real .webp photo in the card image field', () => {
    for (const p of products) {
      const { container } = renderCard(p)
      const imageField = within(container as HTMLElement).getByTestId('card-image')
      expect(imageField, `product #${p.id}: image field`).toHaveAttribute('data-placeholder', 'true')
      for (const img of Array.from((container as HTMLElement).querySelectorAll('img'))) {
        expect(
          WEBP_RE.test(img.getAttribute('src') ?? ''),
          `product #${p.id}: no real product <img>`,
        ).toBe(false)
      }
      cleanup()
    }
  })
})

// ── AT-023-3 — optional badge: distinct element when present, absence allowed ──

describe('REQ-023 / AT-023-3 — optional badge is a distinct element (absence allowed)', () => {
  it('a card with a discount anchor renders a distinct badge element', () => {
    const { container } = renderCard(baziProduct)
    const badge = within(container as HTMLElement).getByTestId('card-badge')
    expect(badge.textContent?.trim().length ?? 0, 'badge has content').toBeGreaterThan(0)
    cleanup()
  })

  it('a card WITHOUT an anchor renders no badge (absence is allowed, not an error)', () => {
    const noAnchor = products.find((p) => p.anchor == null)!
    expect(noAnchor, 'a SKU without an anchor exists').toBeTruthy()
    const { container } = renderCard(noAnchor)
    // the card still renders its mandatory anatomy …
    expect(within(container as HTMLElement).getByTestId('card-title')).toBeTruthy()
    // … but the optional badge is simply absent (not a broken stub)
    expect(within(container as HTMLElement).queryByTestId('card-badge')).toBeNull()
    cleanup()
  })
})

// ── M2 INVARIANT GUARD — asset-light refactor must NOT reinstate fake stars ───

describe('M2 INVARIANT — review gate stays intact (no fake social proof)', () => {
  it('NO shipped product surfaces a card social-proof block while OQ-004 is open', () => {
    for (const p of products) {
      const { container } = renderCard(p)
      expect(
        (container as HTMLElement).querySelector('[data-testid="card-social-proof"]'),
        `product #${p.id} must not render a card social-proof block`,
      ).toBeNull()
      expect((container as HTMLElement).textContent ?? '', `product #${p.id}: no ★`).not.toContain('★')
      cleanup()
    }
  })
})

// ── AT-023-1/2/3 — real-boundary: the actual collection grid cards ────────────

async function renderRoute(path: string, ready: () => Promise<unknown>) {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  await ready()
  return utils
}

describe('REQ-023 — real-boundary: rendered TCM collection grid cards', () => {
  it('every grid card has the asset-light anatomy + a single live PDP CTA', async () => {
    await renderRoute('/collections/tcm-posters', () =>
      screen.findByTestId('collection-grid', undefined, { timeout: 15000 }),
    )
    // The grid node can exist a commit before its product cards have painted
    // under load, so wait until ≥1 card is rendered (re-querying grid + cards
    // inside the retry) before iterating. The "grid is populated" assertion is
    // unchanged — ≥1 real card still has to appear.
    let cards: HTMLElement[] = []
    await waitFor(() => {
      const grid = screen.getByTestId('collection-grid')
      cards = within(grid).getAllByTestId('collection-product-card')
      expect(cards.length, 'grid is populated').toBeGreaterThan(0)
    })
    for (const card of cards) {
      // asset-light image field, never a real .webp photo
      const imageField = within(card).getByTestId('card-image')
      expect(imageField).toHaveAttribute('data-placeholder', 'true')
      for (const img of Array.from(card.querySelectorAll('img'))) {
        expect(WEBP_RE.test(img.getAttribute('src') ?? '')).toBe(false)
      }
      // exactly one CTA link to a /product/* route
      const cta = within(card).getByTestId('card-cta')
      expect(cta.getAttribute('href') ?? '').toMatch(/^\/product\/\d+$/)
      expect(within(card).getAllByRole('link').length, 'one CTA link per card').toBe(1)
      // title + claim + price present
      expect(within(card).getByTestId('card-title').textContent?.trim().length ?? 0).toBeGreaterThan(0)
      expect(within(card).getByTestId('card-claim').textContent?.trim().length ?? 0).toBeGreaterThan(0)
      expect(within(card).getByTestId('card-price').textContent?.trim().length ?? 0).toBeGreaterThan(0)
    }
  })
})
