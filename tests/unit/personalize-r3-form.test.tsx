/**
 * Batch #12 R3 (Bereiche 5 + 8) — die EINE Personalisierungsseite:
 *
 *   1. Alle FÜNF Angebote (BaZi, Geburtschart, Paar, Premium-Analyse,
 *      Poster+Analyse) sind auf /personalize wählbar.
 *   2. Pflichtfelder sind ALS Pflichtfelder markiert (Sternchen + Legende),
 *      nicht erst nach einem gescheiterten Kaufversuch erkennbar.
 *   3. KEIN Datenverlust beim Optionswechsel: eingegebene Geburtsdaten
 *      überleben den Wechsel des Produkttyps (bazi → digital → couple → bazi).
 *   4. Felder dynamisch je Option: der Digital-Typ zeigt KEINE Poster-Achsen
 *      (Design/Format), der Paar-Typ zeigt Person B.
 *   5. Client-Order-Gate: eine Cart-Line eines personalisierten Produkts OHNE
 *      personalization-Daten gilt als unvollständig (Spiegel des Server-Gates
 *      in server/personalizationGate.js).
 *
 * [REAL-BOUNDARY-jsdom] — reale App-Composition-Root; nur fetch ist gemockt.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { cartHasIncompletePersonalization } from '../../src/lib/checkout'
import type { CartLine } from '../../src/store/ShopStore'

function mockApi() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{}', { status: 404 }))
}

// Personalize ist lazy-geladen (Suspense) — nach dem Mount auf die Seite warten.
const ui = async (entry = '/personalize') => {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  )
  await screen.findByTestId('poster-preview-sticky')
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  mockApi()
})

describe('[REAL-BOUNDARY-jsdom] R3 #5 — alle fünf Angebote auf der einen Personalisierungsseite', () => {
  it('zeigt die fünf Produkttyp-Kacheln (EN-Default-Locale)', async () => {
    await ui()
    for (const name of [
      /Personalized BaZi Poster/,
      /Personalized Birth Chart Poster/,
      /Couple Compatibility Poster/,
      /Premium Analysis PDF/,
      /Poster \+ Digital Analysis/,
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('Digital-Typ: keine Poster-Achsen (Design/Format), Paar-Typ: Person B sichtbar', async () => {
    await ui()
    fireEvent.click(screen.getByRole('button', { name: /Premium Analysis PDF/ }))
    // Poster-only-Achsen: Design-Block + Format-Auswahl dürfen nicht erscheinen.
    expect(screen.queryByText('4 · Design')).toBeNull()
    expect(screen.queryByText(/50 × 70/)).toBeNull()
    expect(screen.queryByTestId('design-swatch')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Couple Compatibility Poster/ }))
    expect(screen.getByTestId('place-of-birth-input-b')).toBeInTheDocument()
  })
})

describe('R3 #8 — Pflichtfelder sichtbar markiert', () => {
  it('markiert Name/Datum/Zeit/Ort mit * und zeigt die Pflichtfeld-Legende', async () => {
    await ui()
    expect(screen.getByLabelText(/Name on the poster \*/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date of birth \*/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Time of birth \*/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Place of birth \*/)).toBeInTheDocument()
    expect(screen.getByText(/\* Required field/)).toBeInTheDocument()
  })

  it('Pflicht-Inputs tragen aria-required', async () => {
    await ui()
    expect(screen.getByLabelText(/Name on the poster \*/)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText(/Date of birth \*/)).toHaveAttribute('aria-required', 'true')
  })
})

describe('R3 #8 — kein Datenverlust beim Optionswechsel', () => {
  it('Geburtsdaten überleben bazi → digital → couple → bazi', async () => {
    await ui()
    const name = screen.getByLabelText(/Name on the poster/) as HTMLInputElement
    const date = screen.getByLabelText(/Date of birth/) as HTMLInputElement
    fireEvent.change(name, { target: { value: 'Mei Chen' } })
    fireEvent.change(date, { target: { value: '1990-06-15' } })

    fireEvent.click(screen.getByRole('button', { name: /Premium Analysis PDF/ }))
    fireEvent.click(screen.getByRole('button', { name: /Couple Compatibility Poster/ }))
    fireEvent.click(screen.getByRole('button', { name: /Personalized BaZi Poster/ }))

    expect((screen.getByLabelText(/Name on the poster/) as HTMLInputElement).value).toBe('Mei Chen')
    expect((screen.getByLabelText(/Date of birth/) as HTMLInputElement).value).toBe('1990-06-15')
  })
})

describe('R3 #5 — /digital ist nur noch ein Redirect auf die eine Personalisierungsseite', () => {
  it('leitet /digital auf /personalize?type=digital um (Digital-Typ vorausgewählt, kein 404)', async () => {
    await ui('/digital')
    // Digital vorausgewählt: PDF-Vorschau statt Poster-Achsen.
    expect(screen.getAllByText('Digital PDF').length).toBeGreaterThan(0)
    expect(screen.queryByText('4 · Design')).toBeNull()
  })
})

describe('R3 #8 — Client-Order-Gate spiegelt das Server-Gate', () => {
  const line = (productId: string, personalization?: Record<string, string>): CartLine =>
    ({ productId, variantId: '', title: 'x', price: 1, qty: 1, poster: null, meta: '', personalization }) as CartLine

  it('personalisierte productIds OHNE personalization → unvollständig', async () => {
    expect(cartHasIncompletePersonalization([line('ptype:bazi')])).toBe(true)
    expect(cartHasIncompletePersonalization([line('digital:digital-bazi')])).toBe(true)
    expect(cartHasIncompletePersonalization([line('bundle:b-digital')])).toBe(true)
  })

  it('nicht-personalisierte productIds ohne personalization → vollständig', async () => {
    expect(cartHasIncompletePersonalization([line('poster:7')])).toBe(false)
    expect(cartHasIncompletePersonalization([line('bundle:b1')])).toBe(false)
  })

  it('vollständige personalization → vollständig', async () => {
    expect(
      cartHasIncompletePersonalization([
        line('ptype:bazi', { name: 'Mei', date: '1990-06-15', time: '12:30', place: 'Berlin', unknownTime: 'false' }),
      ]),
    ).toBe(false)
  })
})
