/**
 * Operator-Batch #8 — Kassen-UX: Bestätigung nur für personalisierte Artikel,
 * Review-Kasten mit den eingegebenen Daten, Express-Wallets mit Logos statt
 * Text-Attrappen, Warenkorb-Zahl ohne Kasten.
 *
 * `[REAL-BOUNDARY-jsdom]` — seeds den REALEN ShopStore (localStorage-Hydration)
 * und rendert die echte /checkout-Route durch die App-Root.
 *
 * Vertrag (Operator 2026-07-14):
 *  1. Personalisierter Warenkorb → Bestätigungs-Card MIT Review-Kasten der
 *     abgegebenen Daten; Bestell-Button erst nach Häkchen aktiv.
 *  2. Warenkorb OHNE Personalisierung → KEINE Checkbox, sofortiger Checkout.
 *  3. Kein "PayPal" (wird nicht angeboten); Express = Apple Pay / Google Pay /
 *     Amazon Pay mit echten Logo-Buttons.
 *  4. Header-Badge: nackte Zahl in Akzentfarbe — kein Pill/Kasten.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import type { CartLine } from '../../src/store/ShopStore'

const CART_KEY = 'sizhu_cart'

const baziLine: CartLine = {
  key: 'k-bazi',
  title: 'Personalized BaZi Poster',
  price: 49,
  qty: 1,
  poster: { frame: '#1B1B1B', bg: '#E9DFCB', name: 'Mara', element: 'Wood', animal: 'Horse', pillars: [] },
  meta: 'Natural oak · Sandstone · A2',
  personalization: {
    productType: 'single',
    productTypeLabel: 'Personalized BaZi Poster',
    language: 'EN',
    name: 'Mara Musterfrau',
    date: '1990-06-15',
    time: '12:30',
    timeDisplay: '12:30',
    unknownTime: 'false',
    place: 'Berlin',
    placeResolved: 'Berlin, Germany',
  },
  productId: 'ptype:single',
  variantId: 'size=A2;frame=#1B1B1B',
}

const tcmLine: CartLine = {
  key: 'k-tcm',
  title: 'TCM Educational Poster',
  price: 39,
  qty: 1,
  poster: null,
  meta: 'Educational',
  image: '/images/posters/tcm-elements.webp',
  productId: 'poster:11',
  variantId: '',
}

function renderCheckout(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <App />
    </MemoryRouter>,
  )
}

const placeOrderBtn = () => screen.getByRole('button', { name: /Place order now/i }) as HTMLButtonElement

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('sizhu_lang', 'EN')
})

describe('personalisierter Warenkorb — Bestätigung + Review-Kasten', () => {
  it('shows the confirm card WITH the submitted personalization data and gates the order button', async () => {
    renderCheckout([baziLine])
    await screen.findByTestId('personalization-confirm-card')

    // Review-Kasten zeigt exakt die abgegebenen Daten
    const box = screen.getByTestId('personalization-review-box')
    expect(box.textContent).toContain('Mara Musterfrau')
    expect(box.textContent).toContain('1990-06-15')
    expect(box.textContent).toContain('12:30')
    expect(box.textContent).toContain('Berlin, Germany')

    // Button gesperrt, bis das Häkchen gesetzt ist
    expect(placeOrderBtn().disabled).toBe(true)
    fireEvent.click(screen.getByTestId('personalization-confirm'))
    expect(placeOrderBtn().disabled).toBe(false)
  })
})

describe('nicht-personalisierter Warenkorb — sofortiger Checkout ohne Häkchen', () => {
  it('renders NO confirm checkbox and the order button is immediately enabled', async () => {
    renderCheckout([tcmLine])
    await screen.findByRole('button', { name: /Place order now/i })
    expect(screen.queryByTestId('personalization-confirm-card')).toBeNull()
    expect(screen.queryByTestId('personalization-confirm')).toBeNull()
    expect(placeOrderBtn().disabled).toBe(false)
  })
})

describe('Zahlarten — ehrliche Trust-Zeile statt Fake-Express-Buttons', () => {
  // Operator-Batch #10: die drei Wallet-BUTTONS führten alle zum selben
  // Stripe-Checkout (Fake-Differenzierung) — es gibt genau EINEN Order-CTA;
  // die Wallets erscheinen als Logos in einer Trust-Zeile.
  it('shows ONE order CTA plus a wallet trust row (no wallet buttons, no PayPal)', async () => {
    renderCheckout([tcmLine])
    await screen.findByRole('button', { name: /Place order now/i })
    expect(screen.getAllByRole('button', { name: /Place order now/i })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Apple Pay' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Google Pay' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Amazon Pay' })).toBeNull()
    const trust = screen.getByTestId('wallet-trust-row')
    expect(trust.querySelector('[aria-label="Apple Pay"]')).not.toBeNull()
    expect(trust.querySelector('[aria-label="Google Pay"]')).not.toBeNull()
    expect(trust.querySelector('[aria-label="Amazon Pay"]')).not.toBeNull()
    // PayPal wird bei Stripe NICHT angeboten — die Kasse darf es nicht bewerben.
    expect(document.body.textContent).not.toMatch(/PayPal/i)
  })
})

describe('Header-Badge — nackte Zahl statt Kasten', () => {
  it('cart-badge carries no pill styling: no background box, accent-colored number', async () => {
    localStorage.setItem(CART_KEY, JSON.stringify([tcmLine]))
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    const badge = await screen.findByTestId('cart-badge', undefined, { timeout: 15000 })
    expect(badge.textContent).toBe('1')
    expect(badge.className).not.toMatch(/rounded-full/)
    const bg = badge.style.background
    expect(bg === '' || bg === 'none').toBe(true)
    expect(badge.style.color).not.toBe('rgb(255, 255, 255)') // nicht mehr weiß-auf-Akzent
  })
})
