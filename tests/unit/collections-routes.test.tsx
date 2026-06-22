/**
 * Per-world collection routes — REQ-010 (AT-010-1..4). `[REAL-BOUNDARY]` (jsdom).
 *
 * Beat-0 Gegenthese (Vision §7.6 "apparent reachability"): a Collection component
 * can render green in isolation yet never be wired as a <Route> in the production
 * composition root — built, not reachable; or a collection is empty/thin. These
 * tests navigate the REAL `src/App.tsx` (the production composition root) via
 * MemoryRouter to each MVP route and assert the template renders NON-EMPTY:
 * breadcrumb, H1, intro, ≥1 product card, SEO text block, FAQ, trust.
 *
 * The Playwright spec (tests/e2e/collections.spec.ts) is the real-browser
 * proof; Playwright's chromium is not installed in this sandbox, so this jsdom
 * render through the real App is the runnable green evidence now.
 *
 * AT-010-2 (grid filtered from catalog over product_world, ≥1) lives in the
 * pure data-model test (catalog-data-model.test.ts) + is re-asserted here at the
 * rendered boundary (≥1 product card per route).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import {
  COLLECTION_CONFIGS,
  collectionPath,
  type CollectionConfig,
} from '../../src/lib/collections'
import { filterByWorld, products } from '../../src/lib/catalog'

// The 8 MVP routes from REQ-010 AK-1 — the contract is exactly this set.
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

async function renderRoute(path: string) {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
  // Let the lazy route chunk + AuthProvider post-mount state settle. The Collection
  // route is lazily code-split behind Suspense, so under CPU contention the chunk
  // can resolve slower than testing-library's 1000ms default; the explicit 5000ms
  // (matching tests/setup.ts asyncUtilTimeout) keeps the combined run deterministic
  // without weakening the assertion — the testid still has to appear.
  await screen.findByTestId('collection-page', undefined, { timeout: 5000 })
  return utils
}

beforeEach(() => {
  localStorage.clear()
})

// ── config contract — every MVP slug has a config; no extras, no Saju/Junishi ─

describe('REQ-010 — collection-config drives exactly the MVP slug set', () => {
  it('exposes a config for every MVP slug', () => {
    const configured = new Set(COLLECTION_CONFIGS.map((c) => c.slug))
    for (const slug of MVP_SLUGS) {
      expect(configured.has(slug)).toBe(true)
    }
  })

  it('exposes no extra collection slugs beyond the MVP set', () => {
    const expected = new Set<string>(MVP_SLUGS)
    for (const c of COLLECTION_CONFIGS) {
      expect(expected.has(c.slug)).toBe(true)
    }
  })

  // AT-010-4 (negative): no Saju/Junishi collection slug.
  it('has no saju/junishi collection slug', () => {
    for (const c of COLLECTION_CONFIGS) {
      expect(c.slug).not.toMatch(/saju|junishi/i)
    }
  })

  // Each config must resolve to ≥1 product so the grid is never empty.
  for (const c of COLLECTION_CONFIGS) {
    it(`config "${c.slug}" resolves to ≥1 product`, () => {
      const list = resolveProducts(c)
      expect(list.length).toBeGreaterThanOrEqual(1)
    })
  }
})

// Mirror of the template's product resolution so the test can assert ≥1 without
// reaching into the component. Worlds filter over product_world; the explicit
// `productIds` escape hatch covers curated collections (fire horse / bundles /
// analysis PDFs) that are not a single product_world.
function resolveProducts(c: CollectionConfig) {
  if (c.productIds && c.productIds.length > 0) {
    return c.productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p != null)
  }
  if (c.world) return filterByWorld(products, c.world)
  return []
}

// ── AT-010-1 / AT-010-3 — each route reachable through App.tsx, non-empty ─────

describe('REQ-010 / AT-010-1 — every MVP route is reachable through the real App.tsx', () => {
  for (const slug of MVP_SLUGS) {
    it(`/collections/${slug} renders the collection template`, async () => {
      await renderRoute(`/collections/${slug}`)
      expect(screen.getByTestId('collection-page')).toBeInTheDocument()
    })
  }
})

describe('REQ-010 / AT-010-3 — each collection is a full page, not thin', () => {
  for (const slug of MVP_SLUGS) {
    it(`/collections/${slug} has breadcrumb + H1 + intro + grid(≥1) + SEO + FAQ + trust`, async () => {
      await renderRoute(`/collections/${slug}`)
      const page = screen.getByTestId('collection-page')

      // breadcrumb (internal links — Home / Collections)
      expect(within(page).getByTestId('collection-breadcrumb')).toBeInTheDocument()

      // exactly one H1 within the collection page subtree (the persistent
      // chrome — e.g. the cart drawer <aside> — lives outside `page` and is
      // not part of the collection template's heading contract).
      const h1s = page.querySelectorAll('h1')
      expect(h1s.length).toBe(1)
      expect(h1s[0].textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // intro paragraph (non-empty)
      const intro = within(page).getByTestId('collection-intro')
      expect(intro.textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // product grid with ≥1 card
      const grid = within(page).getByTestId('collection-grid')
      const cards = within(grid).getAllByTestId('collection-product-card')
      expect(cards.length).toBeGreaterThanOrEqual(1)

      // SEO text block
      const seo = within(page).getByTestId('collection-seo')
      expect(seo.textContent?.trim().length ?? 0).toBeGreaterThan(0)
      // …with an H2 sub-structure (SEO block, not just a paragraph)
      expect(seo.querySelector('h2')).toBeTruthy()

      // FAQ block with ≥1 question
      const faq = within(page).getByTestId('collection-faq')
      expect(within(faq).getAllByTestId('collection-faq-item').length).toBeGreaterThanOrEqual(1)

      // trust block
      expect(within(page).getByTestId('collection-trust')).toBeInTheDocument()
    })
  }
})

// ── AT-010-4 (negative) — Saju/Junishi route is not reachable ─────────────────

describe('REQ-010 / AT-010-4 — no Saju/Junishi collection route is reachable', () => {
  for (const path of ['/collections/saju-posters', '/collections/junishi-posters']) {
    it(`${path} does not render a collection template`, async () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      )
      // Let any lazy chunk settle; the navbar is the stable anchor that proves
      // the app mounted, then assert NO collection page rendered for this path.
      await screen.findAllByRole('navigation')
      expect(screen.queryByTestId('collection-page')).toBeNull()
    })
  }
})

// ── /tcm still works (or redirects to /collections/tcm-posters) ───────────────

describe('REQ-010 — legacy /tcm keeps working', () => {
  it('/tcm renders a product overview (kept or redirected to the tcm collection)', async () => {
    render(
      <MemoryRouter initialEntries={['/tcm']}>
        <App />
      </MemoryRouter>,
    )
    await screen.findAllByRole('navigation')
    // Either the kept TcmOverview page or the redirected collection page must
    // render at least one product heading — never a blank/404.
    const headings = await screen.findAllByRole('heading', { level: 1 })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})

// ── collectionPath helper builds the production /collections/<slug> path ──────

describe('REQ-010 — collectionPath helper', () => {
  it('builds /collections/<slug>', () => {
    expect(collectionPath('bazi-posters')).toBe('/collections/bazi-posters')
  })
})
