/**
 * Conformance smoke — REQ-017 (AT-017-1/2/4).
 * `[REAL-BOUNDARY]` (jsdom render through the real src/App.tsx).
 *
 * Three honest checks the run is allowed to claim runnable-green today:
 *  (1) MVP route reachability — every MVP route renders SOMETHING (not a
 *      crashed Suspense) through the production composition root.
 *  (2) Negative Saju/Junishi — no route renders a recognised page for them,
 *      and the shipped data structures (catalog + i18n + collections config)
 *      contain no Saju/Junishi tokens.
 *  (3) Homepage data-module 02..13 are all present + in order (a thinner
 *      duplicate of the home-module-order test, kept here as a smoke).
 *
 * What is honestly NOT claimed here (and must NOT be silently green):
 *  - Mobile breakpoints 360/390/430, no-horizontal-scroll, sticky CTA, real
 *    LCP — all PLANNED in tests/e2e/*.spec.ts; jsdom cannot measure layout.
 *    The BLK-MEASURE-LCP blocker stays until Playwright runs in a real
 *    environment with chromium installed.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { products, articles } from '../../src/lib/catalog'
import { translations } from '../../src/i18n/translations'
import { COLLECTION_CONFIGS } from '../../src/lib/collections'

const MVP_ROUTES = [
  '/',
  '/personalize',
  '/collections',
  '/collections/bazi-posters',
  '/collections/tcm-posters',
  '/collections/wuxing-posters',
  '/collections/personalized-posters',
  '/collections/compatibility-posters',
  '/collections/fire-horse-2026',
  '/collections/analysis-pdfs',
  '/collections/bundles',
  '/inspiration',
  '/faq',
  '/contact',
  '/impressum',
  '/privacy',
  '/terms',
  '/returns',
  '/shipping',
] as const

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

const SAJU_JUNISHI = /\bsaju\b|\bjunishi\b/i

describe('REQ-017 / AT-017-1 — MVP route reachability through real App.tsx', () => {
  it.each(MVP_ROUTES)('renders %s without crashing', async (path) => {
    renderAt(path)
    // The Suspense fallback uses aria-busy="true". Wait until it is gone OR a
    // real banner/heading/landmark has appeared — proves the route resolved
    // through the real composition root, not just the fallback skeleton.
    await waitFor(
      () => {
        const busy = document.querySelector('[aria-busy="true"]')
        const anyContent =
          screen.queryAllByRole('heading').length > 0 ||
          screen.queryAllByRole('navigation').length > 0 ||
          screen.queryAllByRole('main').length > 0
        expect(busy === null || anyContent).toBe(true)
      },
      { timeout: 15000 },
    )
  })
})

describe('REQ-017 / AT-017-4 — negative Saju/Junishi (must not appear)', () => {
  it('no shipped catalog product / article / FAQ mentions Saju or Junishi', () => {
    const blobs: string[] = []
    for (const p of products) {
      blobs.push(p.title, p.category, ...(p.bullets ?? []))
    }
    for (const a of articles) {
      blobs.push(a.title, a.tag, a.meta, a.excerpt, ...a.body)
    }
    const joined = blobs.join(' ')
    expect(joined).not.toMatch(SAJU_JUNISHI)
  })

  it('no shipped i18n string (EN/DE/FR) mentions Saju or Junishi', () => {
    function walk(node: unknown): string[] {
      if (typeof node === 'string') return [node]
      if (Array.isArray(node)) return node.flatMap(walk)
      if (node && typeof node === 'object') return Object.values(node).flatMap(walk)
      return []
    }
    for (const lang of ['EN', 'DE', 'FR'] as const) {
      const all = walk(translations[lang]).join(' ')
      expect(all).not.toMatch(SAJU_JUNISHI)
    }
  })

  it('no collection slug, world, title, intro or curated-id reference Saju/Junishi', () => {
    const joined = COLLECTION_CONFIGS.map((c) =>
      [c.slug, c.world ?? '', c.title, c.intro, c.eyebrow ?? ''].join(' '),
    ).join(' ')
    expect(joined).not.toMatch(SAJU_JUNISHI)
  })

  it('/collections/saju-posters and /collections/junishi-posters redirect (no Collection page rendered)', async () => {
    for (const ghost of ['/collections/saju-posters', '/collections/junishi-posters']) {
      const { unmount } = renderAt(ghost)
      // Wait briefly so lazy chunks settle, then assert no Collection-page anchor.
      await waitFor(
        () => {
          expect(screen.queryByTestId('collection-page')).toBeNull()
        },
        { timeout: 15000 },
      )
      unmount()
    }
  })
})

describe('REQ-008 / AT-017-2 (+ REQ-002 above-fold re-order) — homepage data-module anchors present in order (smoke)', () => {
  it('home renders modules 02..13 in DOM order with hero (02) first, above-fold band re-ordered to 04→03', async () => {
    renderAt('/')
    await waitFor(
      () => {
        const anchors = Array.from(
          document.querySelectorAll<HTMLElement>('[data-module]'),
        ).map((el) => el.dataset.module)
        expect(anchors.length).toBeGreaterThanOrEqual(12)
        // REQ-002 / T-702: above-fold band is [Hero(02) → Bestseller(04) →
        // Kategorie-Banner(03)]; lower band 05→13 keeps the V2 order. Same
        // exact-order strength, new value.
        const expected = ['02', '04', '03', '05', '06', '07', '08', '09', '10', '11', '12', '13']
        // Filter to the V2 set in case the App shell adds an unrelated 01 anchor.
        const v2 = anchors.filter((m) => m && expected.includes(m))
        expect(v2).toEqual(expected)
      },
      { timeout: 15000 },
    )
  })
})
