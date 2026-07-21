/**
 * Batch #12 R4 (Bereich 7) — einheitliche PDP-Struktur AUCH für personalisierte
 * Produkte: die zentrale Personalisierungsseite trägt dieselben
 * Produktseiten-Bausteine wie eine Katalog-PDP:
 *
 *   1. Details/Material/Formate/Versand/Personalisierung als FAQ-Accordion
 *      (dieselben faqDefs wie auf der PDP — EINE Quelle).
 *   2. Rahmen-ANSICHTEN: beide Rahmen (Eiche/Schwarz) als klickbare
 *      Vorschau-Kacheln im Präsentationsmodul — Klick wechselt den Rahmen der
 *      Hauptvorschau (dieselbe Design-Quelle, kein Fake-Mockup).
 *   3. Empfehlungen („Wird oft zusammen gekauft"): echte Links auf AKTIVE
 *      Katalogprodukte.
 *   4. Trust-Zeile (sichere Zahlung / Rückgabe) wie auf der PDP.
 *
 * Plus Bereich 10 (Formate): der Größenberater-Text nennt die cm-Formate,
 * nicht mehr die A-Serie — keine falschen Maßangaben nach der Vereinheitlichung.
 *
 * [REAL-BOUNDARY-jsdom] — reale App-Composition-Root; nur fetch ist gemockt.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { activeProducts } from '../../src/lib/catalog'

function mockApi() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{}', { status: 404 }))
}

const ui = async () => {
  render(
    <MemoryRouter initialEntries={['/personalize']}>
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

describe('[REAL-BOUNDARY-jsdom] R4 #7 — PDP-Bausteine auf der Personalisierungsseite', () => {
  it('zeigt das PDP-FAQ-Accordion (Details/Material, Größen, Versand, Personalisierung)', async () => {
    await ui()
    const faq = screen.getByTestId('personalize-faq')
    for (const q of ['Details & material', 'Size guide', 'Shipping & production', 'About your personalization']) {
      expect(within(faq).getByRole('button', { name: new RegExp(q, 'i') })).toBeInTheDocument()
    }
    // 'details' ist per Store-Default geöffnet (wie auf der PDP) — die
    // Material-Antwort ist ohne Klick sichtbar; Klick schließt sie (Toggle).
    expect(within(faq).getByText(/Museum-quality matte paper/)).toBeInTheDocument()
    fireEvent.click(within(faq).getByRole('button', { name: /Details & material/i }))
    expect(within(faq).queryByText(/Museum-quality matte paper/)).toBeNull()
  })

  it('Größenberater nennt die cm-Formate, nicht mehr die A-Serie (#10)', async () => {
    await ui()
    const faq = screen.getByTestId('personalize-faq')
    fireEvent.click(within(faq).getByRole('button', { name: /Size guide/i }))
    const answer = within(faq).getByText(/50 × 70/)
    expect(answer.textContent).toContain('30 × 40')
    expect(answer.textContent).toContain('70 × 100')
    expect(answer.textContent).not.toMatch(/A[123] \(/)
  })

  it('Rahmen-Ansichten: beide Rahmen als Kacheln, Klick wechselt den Rahmen der Hauptvorschau', async () => {
    await ui()
    const views = screen.getAllByTestId('frame-view')
    expect(views).toHaveLength(2)
    // Default: Eiche — Hauptvorschau trägt den Oak-Rahmen.
    expect(document.querySelector('[data-testid="poster-svg-preview-frame"].real-frame--oak')).not.toBeNull()
    // Klick auf die Schwarz-Kachel → Hauptvorschau wechselt auf Mattschwarz.
    fireEvent.click(views[1])
    expect(document.querySelector('[data-testid="poster-svg-preview-frame"].real-frame--black')).not.toBeNull()
  })

  it('Empfehlungen: „Wird oft zusammen gekauft" mit echten Links auf AKTIVE Produkte', async () => {
    await ui()
    const section = screen.getByTestId('personalize-cross-sells')
    const links = within(section).getAllByTestId('pdp-cross-sell-card')
    expect(links.length).toBeGreaterThanOrEqual(3)
    const activeIds = new Set(activeProducts.map((p) => `/product/${p.id}`))
    for (const l of links) {
      expect(activeIds.has(l.getAttribute('href') || '')).toBe(true)
    }
  })

  it('Trust-Zeile (sichere Zahlung / Rückgabe) unter dem CTA', async () => {
    await ui()
    expect(screen.getByTestId('personalize-trust')).toBeInTheDocument()
  })
})

describe('R4 #11/#15 — PDP-Empfehlungen enthalten NUR aktive Produkte', () => {
  it('„Frequently bought together" auf der Katalog-PDP zeigt keine soft-retirten SKUs', async () => {
    // R2-Lücke (im R4-Browser-Test gefunden): related filterte über ALLE
    // products — die stillgelegten BaZi-Duplikate (1/2/3) erschienen als
    // Empfehlungs-Karten auf jeder PDP.
    render(
      <MemoryRouter initialEntries={['/product/11']}>
        <App />
      </MemoryRouter>,
    )
    const section = await screen.findByTestId('pdp-cross-sells', undefined, { timeout: 15000 })
    const links = within(section).getAllByTestId('pdp-cross-sell-card')
    expect(links.length).toBeGreaterThanOrEqual(3)
    const activeIds = new Set(activeProducts.map((p) => `/product/${p.id}`))
    for (const l of links) {
      expect(activeIds.has(l.getAttribute('href') || ''), `${l.getAttribute('href')} must be active`).toBe(true)
    }
    // R7 (#11): PASSEND kuratiert — auf einer TCM-PDP (Produkt 11) führen die
    // Empfehlungen mit Produkten DERSELBEN Welt (12/13/14), nicht beliebig.
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toEqual(['/product/12', '/product/13', '/product/14'])
  })
})
