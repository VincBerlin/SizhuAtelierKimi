/**
 * Personalize — EXAKTES Chart über /api/bazi (FuFirE-Proxy) statt Placeholder.
 * `[REAL-BOUNDARY-jsdom]` — rendert die REALE Personalize-Seite über die App-
 * Composition-Root; NUR fetch (/api/bazi, /api/geocode) ist gemockt. Die reale
 * Route ist in tests/integration/bazi-routes.test.ts bewiesen, die reale API
 * in scripts/evidence/fufire-smoke.mjs ([REAL-BOUNDARY-LIVE], Ledger).
 *
 * Ehrlichkeits-Vertrag (OQ-004-Schließung):
 *   1. Vor vollständigen Eingaben: KEINE Säulen-Zeichen — ehrliche Striche.
 *   2. Nach Eingaben: EXAKT die API-Säulen (庚午/壬午/辛亥/乙未), erkennbar
 *      NICHT der alte Modulo-Placeholder.
 *   3. „Berechnet für: …"-Transparenzzeile zeigt den AUFGELÖSTEN Ort.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

const CHART = {
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
  animal: 'Pferd',
  element: 'Metall',
  provenance: { engine_version: '1.0.0-rc1-20260220', ruleset_id: 'traditional_bazi_2026', tzdb_version_id: '2026.2' },
}

function mockApi() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url)
    if (u === '/api/bazi') return new Response(JSON.stringify(CHART), { status: 200 })
    if (u === '/api/geocode') {
      return new Response(
        JSON.stringify({ status: 'ok', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }),
        { status: 200 },
      )
    }
    return new Response('{}', { status: 404 })
  })
}

const ui = () =>
  render(
    <MemoryRouter initialEntries={['/personalize']}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  mockApi()
})

describe('Personalize exact chart', () => {
  it('shows honest em-dash pillars (no glyphs) before birth data is complete', async () => {
    ui()
    await screen.findByTestId('poster-preview-sticky')
    expect(screen.queryByText('庚')).toBeNull()
    expect(screen.queryByText('辛')).toBeNull()
  })

  it('renders the EXACT pillars from the API once birth data + resolved place are set', async () => {
    ui()
    const placeInput = await screen.findByTestId('place-of-birth-input')
    fireEvent.change(placeInput, { target: { value: 'Berlin' } })
    fireEvent.blur(placeInput)
    await screen.findByTestId('place-resolved-note')

    const date = document.querySelector('input[type="date"]') as HTMLInputElement
    const time = document.querySelector('input[type="time"]') as HTMLInputElement
    fireEvent.change(date, { target: { value: '1990-06-15' } })
    fireEvent.change(time, { target: { value: '12:30' } })

    await waitFor(() => expect(screen.getAllByText('庚').length).toBeGreaterThan(0), { timeout: 5000 })
    for (const glyph of ['壬', '辛', '乙', '亥', '未']) {
      expect(screen.getAllByText(glyph).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByText(/Pferd/i).length).toBeGreaterThan(0)
    expect(screen.getByTestId('place-resolved-note').textContent).toContain('Berlin, DE')
  })
})
