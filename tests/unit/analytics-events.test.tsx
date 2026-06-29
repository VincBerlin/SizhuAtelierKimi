/**
 * Funnel-event instrumentation — REQ-002 (AT-002-5), T-701.
 * `[REAL-BOUNDARY]` (jsdom render through the real src/App.tsx) — INSTRUMENTATION
 * PROOF ONLY.
 *
 * RL-EVENT STAYS RED. src/lib/analytics.ts is a FAKE-ONLY sink (in-memory array +
 * dev console + a window mirror) with NO real backend and NO network. This suite
 * certifies the 5 funnel events are WIRED AT THE RIGHT CALL SITES and FIRE through
 * `getEvents()` — that is the ONLY claim. It proves nothing about a real
 * analytics pipeline, real data, or production delivery.
 *
 * The 5 instrumented events (T-701):
 *   1. hero_cta_click          — Home hero primary CTA (Home.tsx)
 *   2. bestseller_product_click — bestseller slider card (CatalogSection → carousel)
 *   3. category_banner_click   — shop-by-world card (ShopByWorldSection)
 *   4. pdp_view                — ProductView mount effect
 *   5. add_to_cart             — ShopStore add path (single funnel point)
 *
 * MERGE-GATE DISCIPLINE: AT-002-5 is deliberately the INSTRUMENTATION-green /
 * RL-EVENT-RED split. REQ-002 stays value-risk / merge-gate-held — no real event
 * data is read here. NOTHING in this file marks REQ-002 aligned / done.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { getEvents, clearEvents, EVENTS } from '../../src/lib/analytics'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

/** Did a named event land in the fake sink? */
function fired(name: string): boolean {
  return getEvents().some((e) => e.event === name)
}

beforeEach(() => {
  localStorage.clear()
  clearEvents()
})

describe('precondition — the fake sink starts empty + is fake-only (RL-EVENT RED)', () => {
  it('getEvents() is empty after clearEvents() (in-memory sink, no real backend)', () => {
    expect(getEvents()).toEqual([])
  })
})

describe('REQ-002 / AT-002-5 — the 5 funnel events fire through the fake sink (instrumentation only)', () => {
  it('1. hero CTA click emits hero_cta_click', async () => {
    renderAt('/')
    const hero = await screen.findByTestId('home-module-02', undefined, { timeout: 15000 })
    let cta!: HTMLElement
    await waitFor(() => {
      cta = within(hero)
        .getAllByRole('link')
        .find((a) => a.getAttribute('href') === '/personalize') as HTMLElement
      expect(cta, 'hero primary CTA to /personalize').toBeTruthy()
    })
    expect(fired(EVENTS.heroCta)).toBe(false)
    fireEvent.click(cta)
    expect(fired(EVENTS.heroCta)).toBe(true)
  })

  it('2. bestseller-slider card click emits bestseller_product_click', async () => {
    renderAt('/')
    const slider = await screen.findByTestId('home-module-04', undefined, { timeout: 15000 })
    let card!: HTMLElement
    await waitFor(() => {
      // The bestseller cards expose the CTA link via data-testid="card-cta"; the
      // section header's "more" link is excluded so we click a real product card.
      card = within(slider).getAllByTestId('card-cta')[0]
      expect(card, 'a bestseller product card').toBeTruthy()
    })
    expect(fired(EVENTS.bestsellerClick)).toBe(false)
    fireEvent.click(card)
    expect(fired(EVENTS.bestsellerClick)).toBe(true)
  })

  it('3. category-banner card click emits category_banner_click', async () => {
    renderAt('/')
    const banner = await screen.findByTestId('home-module-03', undefined, { timeout: 15000 })
    let card!: HTMLElement
    await waitFor(() => {
      card = within(banner)
        .getAllByRole('link')
        .find((a) => (a.getAttribute('href') ?? '').startsWith('/collections/')) as HTMLElement
      expect(card, 'a shop-by-world collection card').toBeTruthy()
    })
    expect(fired(EVENTS.categoryClick)).toBe(false)
    fireEvent.click(card)
    expect(fired(EVENTS.categoryClick)).toBe(true)
  })

  it('4. PDP mount emits pdp_view', async () => {
    // /product/11 is a non-personalizable ready-to-ship SKU.
    renderAt('/product/11')
    await screen.findByTestId('pdp', undefined, { timeout: 15000 })
    await waitFor(() => {
      expect(fired(EVENTS.pdpView)).toBe(true)
    })
  })

  it('5. add-to-cart emits add_to_cart (single ShopStore funnel point)', async () => {
    renderAt('/product/11')
    const addBtn = await screen.findByTestId('pdp-add-to-cart', undefined, { timeout: 15000 })
    // Drop the pdp_view fired on mount so this asserts the add path specifically.
    clearEvents()
    expect(fired(EVENTS.addToCart)).toBe(false)
    fireEvent.click(addBtn)
    await waitFor(() => {
      expect(fired(EVENTS.addToCart)).toBe(true)
    })
  })
})
