/**
 * M13 — PDP size/commerce. `[REAL-BOUNDARY]` (jsdom via real App.tsx).
 *
 * REQ-008/028: size/format is a first-class axis on EVERY PDP. REQ-029: the size
 * selection drives the price display. REQ-030 (preserved): personalization
 * (birth data + chart preview) appears ONLY for BaZi products; TCM/Wuxing/Fire
 * Horse show a standard purchase path with a size selector but no birth prompt.
 * The size axis is NON-FINAL (OQ-001). The money path (server/pricing.js) is
 * UNCHANGED and already prices size deltas for any poster id.
 *
 * NOTE (sandbox): jsdom workers hang in-sandbox, so this runs on the dev machine.
 * The render was checked in-sandbox via an (ephemeral) renderToStaticMarkup PDP
 * smoke; the non-personalizable-poster × size MONEY-PATH pricing is guarded by the
 * checked-in parity test (tests/integration/checkout.repricing.test.ts, AT-001-4,
 * which now loops every poster × every size, not just personalizable ones).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

function renderPdp(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <App />
    </MemoryRouter>,
  )
}
const findPdp = () => screen.findByTestId('pdp', undefined, { timeout: 15000 })

beforeEach(() => localStorage.clear())

describe('M13 / REQ-028 — every PDP exposes a size selector', () => {
  it('a non-personalizable (TCM) PDP shows a NON-FINAL size selector with the cm formats', async () => {
    // Supersession (Batch #12 R4, #10): A3/A2/A1 → 30x40/50x70/70x100 — EIN
    // Format-System (Personalisierung/Gelato) auch auf den Katalog-PDPs.
    renderPdp('11') // TCM educational, personalizable:false
    const pdp = await findPdp()
    const sizeSel = within(pdp).getByTestId('pdp-size-selector')
    expect(sizeSel).toHaveAttribute('data-nonfinal', 'true')
    const opts = within(sizeSel).getAllByTestId('pdp-size-option')
    expect(opts.map((o) => o.getAttribute('data-size'))).toEqual(['30x40', '50x70', '70x100'])
  })

  // SUPERSEDED (Operator-Batch #12): personalisierbare PDPs sind Redirects —
  // die Größenachse der personalisierten Poster lebt im /personalize-Wähler
  // (30×40/50×70/70×100, delta-personalize-Tests). Hier bleibt der Vertrag der
  // AKTIVEN, nicht-personalisierbaren PDPs (standalone Selektor, Tests unten).
})

describe('M13 / REQ-030 — BaZi-only personalization gate preserved', () => {
  it('the non-personalizable PDP shows NO birth data / chart preview / configurator', async () => {
    renderPdp('11')
    const pdp = await findPdp()
    expect(within(pdp).queryByTestId('pdp-configurator')).toBeNull()
    expect(within(pdp).queryByTestId('pdp-chart-preview')).toBeNull()
    expect(within(pdp).queryByTestId('pdp-personalize-cta')).toBeNull()
    expect(pdp.querySelector('input[type="date"]')).toBeNull()
    expect(pdp.querySelector('input[type="time"]')).toBeNull()
    // but it IS purchasable via a standard add-to-cart
    expect(within(pdp).getByTestId('pdp-add-to-cart')).toBeInTheDocument()
  })
})

describe('M13 / REQ-029 — size selection drives the price display', () => {
  it('selecting the three cm formats on a ready-to-ship PDP yields three distinct prices', async () => {
    // Supersession (Batch #12 R4, #10): A-Serie → cm-Formate; die Preis-Deltas
    // (−10 / 0 / +20) und der Vertrag (3 Formate = 3 Preise) sind unverändert.
    renderPdp('11') // base 39 €
    const pdp = await findPdp()
    const sizeSel = within(pdp).getByTestId('pdp-size-selector')
    const priceOf = () => within(pdp).getByTestId('pdp-price').textContent ?? ''
    const pick = (id: string) => fireEvent.click(within(sizeSel).getAllByTestId('pdp-size-option').find((o) => o.getAttribute('data-size') === id)!)

    pick('50x70')
    await waitFor(() => expect(priceOf().length).toBeGreaterThan(0))
    const mid = priceOf()
    pick('70x100')
    await waitFor(() => expect(priceOf()).not.toBe(mid))
    const large = priceOf()
    pick('30x40')
    await waitFor(() => expect(priceOf()).not.toBe(large))
    const small = priceOf()
    // three sizes → three distinct prices (base, +20, −10)
    expect(new Set([mid, large, small]).size).toBe(3)
  })
})
