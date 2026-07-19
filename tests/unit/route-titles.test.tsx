/**
 * Batch #12 R7 (Bereich 15, Meta-Daten) — routen-spezifische Seitentitel.
 *
 * QA-Fund des Abschluss-Sweeps: document.title war auf JEDER Route der
 * statische index.html-Titel (nur /offers setzte ihn lokal). Jetzt setzt die
 * App-Shell den Titel ZENTRAL je Route (Muster „<Seite> · SizhuAtelier"),
 * PDPs tragen den Produktnamen; unbekannte Routen behalten den Basistitel.
 *
 * [REAL-BOUNDARY-jsdom] — reale App-Composition-Root; nur fetch ist gemockt.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

function mockApi() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{}', { status: 404 }))
}

const ui = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  document.title = 'SizhuAtelier — Base'
  mockApi()
})

describe('[REAL-BOUNDARY-jsdom] R7 #15 — jede Kern-Route hat einen eigenen Seitentitel', () => {
  it('/personalize → Personalisierungs-Titel · SizhuAtelier', async () => {
    ui('/personalize')
    await screen.findByTestId('poster-preview-sticky')
    expect(document.title).toContain('SizhuAtelier')
    expect(document.title).toMatch(/personalized poster/i)
  })

  it('/product/11 → Produktname im Titel', async () => {
    ui('/product/11')
    await screen.findByTestId('pdp', undefined, { timeout: 15000 })
    expect(document.title).toMatch(/TCM Five Elements/i)
    expect(document.title).toContain('SizhuAtelier')
  })

  it('/collections → Kollektions-Titel', async () => {
    ui('/collections')
    await screen.findByText(/The Collection/i, undefined, { timeout: 15000 })
    expect(document.title).toMatch(/Collection/i)
    expect(document.title).toContain('SizhuAtelier')
  })
})
