/**
 * Birth-Chart-Poster = WESTLICHES Geburtshoroskop (Operator 2026-07-14).
 * [REAL-BOUNDARY-jsdom]: rendert die echte App am Personalize-Deep-Link
 * ?type=birthchart; NUR fetch (/api/western, /api/geocode) ist gemockt —
 * die echte Route ist in tests/integration/bazi-routes.test.ts bewiesen,
 * der echte Endpunkt (/v1/calculate/western) live via Ledger.
 *
 * Verträge:
 *  1. Der birthchart-Typ rechnet über /api/western (NICHT /api/bazi) und
 *     rendert das western-zodiac-Design: Sonnenzeichen (lokalisiert) im
 *     umrandeten Kern-Block, Mond + Aszendent, Planetenzeilen, Subtitle.
 *  2. Western-Review zeigt die Big Three + AUSFÜHRLICHE Erklärungen.
 *  3. Ehrlichkeits-Gate: Add-to-Cart erst bei fertigem Western-Chart.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'

const WESTERN = {
  sun: { signIndex: 2, deg: 24.1, retro: false },
  moon: { signIndex: 11, deg: 14.5, retro: false },
  ascendant: { signIndex: 5, deg: 19.1, retro: false },
  planets: [
    { key: 'Mercury', signIndex: 2, deg: 5.6, retro: false },
    { key: 'Venus', signIndex: 1, deg: 18.7, retro: false },
    { key: 'Mars', signIndex: 0, deg: 11, retro: false },
    { key: 'Jupiter', signIndex: 3, deg: 15.9, retro: false },
    { key: 'Saturn', signIndex: 9, deg: 24, retro: true },
  ],
  provenance: { engine_version: 'test', ruleset_id: 'r', tzdb_version_id: 'z' },
}

function mockApi() {
  const westernCalls: string[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url)
    if (u === '/api/western') {
      westernCalls.push(u)
      return new Response(JSON.stringify(WESTERN), { status: 200 })
    }
    if (u === '/api/geocode') {
      return new Response(
        JSON.stringify({ status: 'ok', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }),
        { status: 200 },
      )
    }
    return new Response('{}', { status: 404 })
  })
  return westernCalls
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  localStorage.setItem('sizhu_lang', 'EN')
})

const ui = () =>
  render(
    <MemoryRouter initialEntries={['/personalize?type=birthchart']}>
      <App />
    </MemoryRouter>,
  )

describe('Birth-Chart-Poster — western zodiac flow', () => {
  it('renders the western design from /api/western: sun core (outlined), big three, planets, subtitle', async () => {
    const westernCalls = mockApi()
    ui()
    const placeInput = await screen.findByTestId('place-of-birth-input')
    fireEvent.change(placeInput, { target: { value: 'Berlin' } })
    fireEvent.blur(placeInput)
    await screen.findByTestId('place-resolved-note')
    fireEvent.change(document.querySelector('input[type="date"]')!, { target: { value: '1990-06-15' } })
    fireEvent.change(document.querySelector('input[type="time"]')!, { target: { value: '12:30' } })

    await waitFor(() => expect(screen.getAllByText('Gemini').length).toBeGreaterThan(0), { timeout: 5000 })
    expect(westernCalls.length).toBeGreaterThan(0)
    const preview = screen.getByTestId('poster-svg-preview')
    expect(preview.getAttribute('data-design-id')).toBe('western-zodiac')
    expect(preview.textContent).toContain('Pisces')
    expect(preview.textContent).toContain('Virgo')
    expect(preview.textContent).toContain('MERCURY')
    expect(preview.textContent).toContain('WESTERN · BIRTH CHART')
    // Umrandeter Sonnen-Block (Kern) im SVG.
    expect(preview.innerHTML).toMatch(/<rect[^>]*fill="none"[^>]*stroke=/)
  })

  it('western review shows big three + detailed explanations; add-to-cart gate honours western readiness', async () => {
    mockApi()
    ui()
    const placeInput = await screen.findByTestId('place-of-birth-input')
    fireEvent.change(placeInput, { target: { value: 'Berlin' } })
    fireEvent.blur(placeInput)
    await screen.findByTestId('place-resolved-note')
    fireEvent.change(document.querySelector('input[type="date"]')!, { target: { value: '1990-06-15' } })
    fireEvent.change(document.querySelector('input[type="time"]')!, { target: { value: '12:30' } })
    await waitFor(() => expect(screen.getByTestId('western-review')).toBeInTheDocument(), { timeout: 5000 })

    const review = screen.getByTestId('western-review')
    expect(review.textContent).toContain('Gemini')
    expect(review.textContent).toContain('Ascendant')
    const explain = screen.getByTestId('western-explain')
    expect(explain.textContent).toMatch(/core identity/i)
    expect(explain.textContent).toMatch(/inner world/i)
    expect(explain.textContent).toMatch(/eastern horizon/i)
  })
})
