/**
 * DELTA T-303 — Collection-Template-Inventar + TCM/Wuxing render (REQ-009 + REQ-006 render).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md
 *   AT-009-1  full inventory: breadcrumb, back-nav, H1, intro, visual, toolbar,
 *             filter, sort, grid, count, pagination/show-more, SEO, trust, footer.
 *   AT-009-2  displayed product count === number of RENDERED product cards (no dummy counter).
 *   AT-009-3  COLLECTION_SLUGS covers all 8 MVP slugs; each slug has a config.
 *   AT-009-4  filter / sort visibly change the rendered grid (a real refinement, not decoration).
 *   AT-006-1  /collections/tcm-posters renders ≥1 product card (title + price + CTA).
 *   AT-006-2  /collections/wuxing-posters renders ≥1 product card (title + price + CTA).
 *   AT-006-4  asset-light: card image field is a marked placeholder, no real .webp product photo.
 *   AT-005-3  rendered Collection <main> contains no saju/junishi (render-negative).
 *
 * Evidence class: `[REAL-BOUNDARY-jsdom]` — every render goes through the REAL
 * `src/App.tsx` composition root (MemoryRouter), so a Collection that renders in
 * isolation but is not wired as a production <Route> would still fail (Vision §7.6
 * "apparent reachability"). The `[SHIPPED-SCAN]` slug-coverage test runs over the
 * exported `COLLECTION_SLUGS` / `COLLECTION_CONFIGS` instances the app actually uses.
 *
 * RED-line discipline (Reality-Ledger): prices are placeholders (OQ-002, RL-PRICES
 * RED for FINAL numbers); these tests pin the purchasable MECHANISM (price>0 + CTA),
 * never a final figure. Real product imagery is launch-blocking (OQ-001, RL-IMAGES
 * RED) — the asset-light placeholder assertion encodes exactly that carry. The
 * BaZi chart math stays a placeholder (RL-BAZI RED); nothing here certifies it.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import {
  COLLECTION_SLUGS,
  COLLECTION_CONFIGS,
  getCollectionConfig,
} from '../../src/lib/collections'
import { products, filterByWorld } from '../../src/lib/catalog'

const MVP_SLUGS = [
  'bazi-posters',
  'tcm-posters',
  'wuxing-posters',
  'personalized-posters',
  'compatibility-posters',
  'fire-horse-2026',
  'analysis-pdfs',
  'bundles',
] as const

const WEBP_RE = /\/images\/.*\.webp/i
const SAJU_JUNISHI_RE = /saju|junishi/i

async function renderRoute(path: string) {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  // The Collection route is lazily code-split behind Suspense; the explicit 15000ms
  // (matching tests/setup.ts asyncUtilTimeout) keeps the combined run deterministic.
  await screen.findByTestId('collection-page', undefined, { timeout: 15000 })
  return utils
}

/** Parse the integer the count anchor reports (first digit run in its text). */
function reportedCount(el: HTMLElement): number {
  const m = (el.textContent ?? '').match(/\d+/)
  return m ? Number(m[0]) : NaN
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-009-3 — slug coverage (SHIPPED-SCAN over the exported set) ─────────────

describe('REQ-009 / AT-009-3 — COLLECTION_SLUGS covers all 8 MVP slugs', () => {
  it('COLLECTION_SLUGS is exactly the 8 MVP slugs (no missing, no extra)', () => {
    expect([...COLLECTION_SLUGS].sort()).toEqual([...MVP_SLUGS].sort())
  })

  it('every MVP slug has a config with eyebrow / title / intro / seo', () => {
    for (const slug of MVP_SLUGS) {
      const cfg = getCollectionConfig(slug)
      expect(cfg, `config for ${slug}`).toBeDefined()
      expect(cfg!.eyebrow.trim().length, `${slug} eyebrow`).toBeGreaterThan(0)
      expect(cfg!.title.trim().length, `${slug} title`).toBeGreaterThan(0)
      expect(cfg!.intro.trim().length, `${slug} intro`).toBeGreaterThan(0)
      expect(cfg!.seo.heading.trim().length, `${slug} seo heading`).toBeGreaterThan(0)
      expect(cfg!.seo.body.length, `${slug} seo body`).toBeGreaterThanOrEqual(1)
    }
  })
})

// ── AT-009-1 — full template inventory on /collections/bazi-posters ──────────

describe('REQ-009 / AT-009-1 — full collection-template inventory', () => {
  it('renders breadcrumb, back-nav, H1, intro, visual, toolbar, filter, sort, grid, count, pagination, SEO, trust, footer', async () => {
    await renderRoute('/collections/bazi-posters')

    // `renderRoute` resolves on the page shell; the lazy collection-template
    // sections (grid, SEO, trust, pagination, footer) can still be painting under
    // CPU contention. Re-query every anchor inside a single waitFor so the whole
    // inventory check reads a settled DOM snapshot — assertions are identical, just
    // race-free (mirrors AT-009-2 / collections-routes.test.tsx).
    await waitFor(() => {
      const page = screen.getByTestId('collection-page')

      // breadcrumb (internal links)
      expect(within(page).getByTestId('collection-breadcrumb')).toBeInTheDocument()

      // back-nav — a distinct "back to collections/hub" affordance (not the breadcrumb)
      const back = within(page).getByTestId('collection-back')
      expect(back).toBeInTheDocument()
      expect(back.getAttribute('href') ?? '', 'back-nav points at a real route').toMatch(/^\//)

      // exactly one non-empty H1 in the collection subtree
      const h1s = page.querySelectorAll('h1')
      expect(h1s.length).toBe(1)
      expect(h1s[0].textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // intro
      expect(within(page).getByTestId('collection-intro').textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // category visual slot
      expect(within(page).getByTestId('collection-hero')).toBeInTheDocument()

      // toolbar + filter control + sort control
      expect(within(page).getByTestId('collection-toolbar')).toBeInTheDocument()
      expect(within(page).getByTestId('collection-filter')).toBeInTheDocument()
      expect(within(page).getByTestId('collection-sort')).toBeInTheDocument()

      // grid with ≥1 card
      const grid = within(page).getByTestId('collection-grid')
      expect(within(grid).getAllByTestId('collection-product-card').length).toBeGreaterThanOrEqual(1)

      // product count anchor
      expect(within(page).getByTestId('collection-count')).toBeInTheDocument()

      // pagination / show-more anchor (present even when nothing more to load)
      expect(within(page).getByTestId('collection-pagination')).toBeInTheDocument()

      // SEO block with an H2
      const seo = within(page).getByTestId('collection-seo')
      expect(seo.querySelector('h2')).toBeTruthy()

      // trust block
      expect(within(page).getByTestId('collection-trust')).toBeInTheDocument()

      // footer — the persistent site footer chrome is reachable on the collection route
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })
})

// ── AT-009-2 — displayed count === rendered cards (no dummy counter) ──────────

describe('REQ-009 / AT-009-2 — displayed count equals rendered card count', () => {
  for (const slug of MVP_SLUGS) {
    it(`/collections/${slug}: count anchor matches rendered cards`, async () => {
      await renderRoute(`/collections/${slug}`)
      const page = screen.getByTestId('collection-page')
      // Read the grid and the count anchor TOGETHER inside waitFor, against a
      // single settled DOM snapshot. `renderRoute` resolves on the page shell;
      // the lazy grid chunk can still be painting under CPU contention, so a
      // synchronous read-after-find races a partially-rendered grid. Re-querying
      // both inside the retry makes the equality race-free without weakening it.
      await waitFor(() => {
        const grid = within(page).getByTestId('collection-grid')
        const rendered = within(grid).getAllByTestId('collection-product-card').length
        const reported = reportedCount(within(page).getByTestId('collection-count'))
        expect(rendered, `${slug} renders ≥1 card`).toBeGreaterThanOrEqual(1)
        expect(reported, `${slug} count anchor == rendered cards`).toBe(rendered)
      })
    })
  }
})

// ── AT-009-4 — filter and sort visibly change the grid ───────────────────────

describe('REQ-009 / AT-009-4 — filter and sort really change the grid', () => {
  it('the "personalizable only" filter reduces a mixed collection to fewer cards', async () => {
    // bundles spans personalizable BaZi + a non-personalizable knowledge poster
    // (#7 Wuxing) → a real reduction. Reveal the full set first so pagination
    // does not mask the difference (the filter resets to page 1 on toggle).
    await renderRoute('/collections/bundles')
    const page = screen.getByTestId('collection-page')
    // Re-query the grid on every read: a filter toggle re-renders the template,
    // which can remount the grid node — a captured reference would go stale.
    const cardCount = () =>
      within(within(page).getByTestId('collection-grid')).getAllByTestId('collection-product-card').length

    // Expand every page via the show-more control so we see the whole set.
    const pagination = within(page).getByTestId('collection-pagination')
    let guard = 0
    while (within(pagination).queryByRole('button') && guard++ < 10) {
      fireEvent.click(within(pagination).getByRole('button'))
    }
    const before = cardCount()
    expect(before, 'mixed bundles collection has >1 card when fully revealed').toBeGreaterThan(1)

    const filter = within(page).getByTestId('collection-filter') as HTMLInputElement
    fireEvent.click(filter)

    // After filtering, again reveal the full (smaller) filtered set.
    guard = 0
    while (within(pagination).queryByRole('button') && guard++ < 10) {
      fireEvent.click(within(pagination).getByRole('button'))
    }
    const after = cardCount()
    expect(after, 'filter strictly reduces a mixed collection').toBeLessThan(before)
    expect(after).toBeGreaterThanOrEqual(1)
    // count stays consistent with the now-filtered grid (no stale dummy). Read
    // the reported count and the grid TOGETHER inside waitFor so the consistency
    // check never races a re-render mid-update from the filter toggle.
    await waitFor(() => {
      const rendered = cardCount()
      const reported = reportedCount(within(page).getByTestId('collection-count'))
      expect(reported).toBe(rendered)
    })
  })

  it('sort by price reorders the rendered cards (ascending vs descending differ, each monotonic)', async () => {
    await renderRoute('/collections/bazi-posters')
    const page = screen.getByTestId('collection-page')
    const grid = within(page).getByTestId('collection-grid')

    // Map each rendered card id → its catalog price, so we assert the ACTUAL
    // rendered order against real prices (not an assumed set; pagination may show
    // a different top-N slice for asc vs desc, which is correct behaviour).
    const priceOf = new Map(products.map((p) => [String(p.id), p.price] as const))
    const renderedPrices = () =>
      within(grid)
        .getAllByTestId('collection-product-card')
        .map((c) => priceOf.get(c.getAttribute('data-product-id') ?? '') ?? NaN)
    const idSequence = () =>
      within(grid)
        .getAllByTestId('collection-product-card')
        .map((c) => c.getAttribute('data-product-id'))

    const sort = within(page).getByTestId('collection-sort') as HTMLSelectElement

    fireEvent.change(sort, { target: { value: 'price-asc' } })
    const ascPrices = renderedPrices()
    const ascIds = idSequence()
    // strictly non-decreasing
    for (let i = 1; i < ascPrices.length; i++) {
      expect(ascPrices[i]).toBeGreaterThanOrEqual(ascPrices[i - 1])
    }

    fireEvent.change(sort, { target: { value: 'price-desc' } })
    const descPrices = renderedPrices()
    const descIds = idSequence()
    // strictly non-increasing
    for (let i = 1; i < descPrices.length; i++) {
      expect(descPrices[i]).toBeLessThanOrEqual(descPrices[i - 1])
    }

    // a real re-order: ascending and descending render a different card sequence
    expect(ascIds).not.toEqual(descIds)
  })
})

// ── AT-006-1/2/4 — TCM & Wuxing collections render real, asset-light cards ────

describe('REQ-006 / AT-006-1/2/4 — TCM & Wuxing render purchasable, asset-light cards', () => {
  for (const slug of ['tcm-posters', 'wuxing-posters'] as const) {
    it(`/collections/${slug} renders ≥1 card with title + price + single PDP CTA, asset-light`, async () => {
      await renderRoute(`/collections/${slug}`)
      const page = screen.getByTestId('collection-page')
      const grid = within(page).getByTestId('collection-grid')
      const cards = within(grid).getAllByTestId('collection-product-card')
      expect(cards.length, `${slug} grid populated`).toBeGreaterThanOrEqual(1)

      for (const card of cards) {
        // title + price are real (non-empty)
        expect(within(card).getByTestId('card-title').textContent?.trim().length ?? 0).toBeGreaterThan(0)
        expect(within(card).getByTestId('card-price').textContent?.trim().length ?? 0).toBeGreaterThan(0)

        // exactly one CTA link, to a real /product/:id route
        const cta = within(card).getByTestId('card-cta')
        expect(cta.getAttribute('href') ?? '').toMatch(/^\/product\/\d+$/)
        expect(within(card).getAllByRole('link').length, 'one CTA per card').toBe(1)

        // AT-006-4 asset-light: marked placeholder image field, never a real .webp photo
        const imageField = within(card).getByTestId('card-image')
        expect(imageField).toHaveAttribute('data-placeholder', 'true')
        for (const img of Array.from(card.querySelectorAll('img'))) {
          expect(WEBP_RE.test(img.getAttribute('src') ?? '')).toBe(false)
        }
      }
    })
  }
})

// ── AT-005-3 — rendered Collection <main> has no saju/junishi (render-negative) ─

describe('REQ-005 / AT-005-3 — rendered collection templates contain no saju/junishi', () => {
  for (const slug of MVP_SLUGS) {
    it(`/collections/${slug} <main> text has no saju/junishi`, async () => {
      await renderRoute(`/collections/${slug}`)
      const page = screen.getByTestId('collection-page')
      expect(SAJU_JUNISHI_RE.test(page.textContent ?? '')).toBe(false)
      cleanup()
    })
  }
})
