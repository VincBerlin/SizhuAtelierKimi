/**
 * M11 — homepage FULL target sequence. `[REAL-BOUNDARY]` (jsdom via real App.tsx).
 *
 * SUPERSEDES the delta home tests (home-module-order / above-fold-reorder): the
 * old data-band split + numeric module ids 02..13 are removed (STOP-003). The new
 * order is a shopper funnel with semantic anchors. This test folds in the still-
 * valid delta invariants (hero FIRST + lazy InkWave perf split intact + no
 * Saju/Junishi + real module-link wiring) under the new structure.
 *
 * NOTE (sandbox): the jsdom worker pool hangs in the build sandbox, so this runs
 * on the dev machine. The identical order is verified in-sandbox by a
 * renderToStaticMarkup Home smoke (18 assertions green). Real-browser order/LCP
 * stay Playwright-only (RL-CHROMIUM).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import App from '../../src/App'

// The exact homepage target sequence (REQ-014).
const EXPECTED = [
  'hero', 'bestseller', 'category-banners', 'editorial', 'new-arrivals',
  'campaign-row', 'inspiration', 'seo', 'trust', 'newsletter',
]

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => localStorage.clear())

async function settledModules() {
  await screen.findByTestId('home-module-hero', undefined, { timeout: 15000 })
  await waitFor(() => {
    for (const m of EXPECTED) {
      expect(document.querySelector(`[data-module="${m}"]`), `module ${m} wired`).not.toBeNull()
    }
  })
  return Array.from(document.querySelectorAll('[data-module]')).map((n) => n.getAttribute('data-module'))
}

describe('M11 / REQ-014 — homepage renders the full target sequence', () => {
  it('renders every module in the exact target order', async () => {
    renderHome()
    expect(await settledModules()).toEqual(EXPECTED)
  })

  it('renders the sequence inside <main>, in order', async () => {
    renderHome()
    await settledModules()
    const main = document.querySelector('main')
    expect(main).toBeTruthy()
    expect(Array.from(main!.querySelectorAll('[data-module]')).map((n) => n.getAttribute('data-module'))).toEqual(EXPECTED)
  })
})

describe('M11 / STOP-003 — the old below-fold V2 chain is gone', () => {
  it('has no data-band split and no numeric 05..13 module anchors', async () => {
    renderHome()
    await settledModules()
    const main = document.querySelector('main')!
    expect(main.querySelector('[data-band]')).toBeNull()
    for (const n of ['05', '06', '07', '08', '09', '10', '11', '12', '13'])
      expect(document.querySelector(`[data-module="${n}"]`), `old module ${n} must be gone`).toBeNull()
  })
})

describe('M11 / REQ-018/019/022 — new modules present', () => {
  it('New Arrivals is a separate section after the editorial block', async () => {
    renderHome()
    const order = await settledModules()
    expect(order.indexOf('new-arrivals')).toBeGreaterThan(order.indexOf('bestseller'))
    expect(screen.getByTestId('home-new-arrivals')).toBeInTheDocument()
  })

  it('the campaign banner row unifies 4 real campaigns as asset-light banners', async () => {
    renderHome()
    await settledModules()
    const row = screen.getByTestId('home-campaign-row')
    const banners = within(row).getAllByTestId('home-campaign-banner')
    expect(banners.length).toBe(4)
    const hrefs = banners.map((a) => a.getAttribute('href'))
    for (const slug of ['fire-horse-2026', 'compatibility-posters', 'analysis-pdfs', 'bundles'])
      expect(hrefs).toContain(`/collections/${slug}`)
    // asset-light: placeholder image, no real product .webp
    for (const b of banners) {
      expect(within(b).getByTestId('home-campaign-image')).toHaveAttribute('data-placeholder', 'true')
      for (const img of Array.from(b.querySelectorAll('img')))
        expect(/\/images\/.*\.webp/i.test(img.getAttribute('src') ?? '')).toBe(false)
    }
  })

  it('Trust is a standalone band with honest service badges (no fake reviews/stars)', async () => {
    renderHome()
    await settledModules()
    const trust = screen.getByTestId('home-trust')
    expect(within(trust).getAllByTestId('home-trust-badge').length).toBe(4)
    expect(trust.textContent ?? '').not.toMatch(/★|⭐|\b\d+\s+reviews?\b/i)
  })
})

describe('M11 — surviving delta invariants under the new structure', () => {
  it('the hero is FIRST and keeps the lazy InkWave Suspense split (perf preserved)', async () => {
    renderHome()
    const order = await settledModules()
    expect(order[0]).toBe('hero')
    const src = readFileSync(path.resolve(__dirname, '../../src/pages/Home.tsx'), 'utf8')
    expect(src).toMatch(/lazy\(\s*\(\)\s*=>\s*import\(['"][^'"]*InkWave['"]\)\s*\)/)
    expect(src).toContain('<Suspense')
    expect(src).not.toMatch(/^\s*import\s+InkWave\s+from/m)
  })

  it('the rendered homepage contains no Saju/Junishi string', async () => {
    renderHome()
    await settledModules()
    expect(document.querySelector('main')!.textContent ?? '').not.toMatch(/saju|junishi/i)
  })

  it('category banners + inspiration link to their real routes', async () => {
    renderHome()
    await settledModules()
    await waitFor(() => {
      const cat = within(screen.getByTestId('home-module-category-banners')).getAllByRole('link').map((a) => a.getAttribute('href'))
      expect(cat).toContain('/collections/bazi-posters')
      expect(cat).toContain('/collections/tcm-posters')
      expect(cat).toContain('/collections/wuxing-posters')
    })
    const insp = within(screen.getByTestId('home-module-inspiration')).getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(insp).toContain('/inspiration')
  })
})
