/**
 * Design-Registry im Personalize-Flow: Vorschau rendert die geteilte
 * SVG-Vorlage (PosterSvg) mit der gewählten designId; bei >1 aktivem Design
 * erscheint je ein Swatch. `[REAL-BOUNDARY-jsdom]` über die App-Root.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { DESIGNS } from '@/designs/registry.mjs'

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 404 }))
})

const ui = () =>
  render(
    <MemoryRouter initialEntries={['/personalize']}>
      <App />
    </MemoryRouter>,
  )

describe('Personalize design picker', () => {
  it('renders the svg preview with the default registry design', async () => {
    ui()
    const preview = await screen.findByTestId('poster-svg-preview')
    const activeSingles = DESIGNS.filter((d) => d.active && d.kind === 'single')
    expect(activeSingles.length).toBeGreaterThan(0)
    expect(preview.getAttribute('data-design-id')).toBe(activeSingles[0].id)
    // Die Vorlage rendert echtes SVG (kein leerer Wrapper)
    expect(preview.querySelector('svg')).not.toBeNull()
  })

  it('shows one swatch per active single design when more than one exists', async () => {
    ui()
    await screen.findByTestId('poster-svg-preview')
    const activeSingles = DESIGNS.filter((d) => d.active && d.kind === 'single')
    const swatches = screen.queryAllByTestId('design-swatch')
    if (activeSingles.length > 1) {
      expect(swatches).toHaveLength(activeSingles.length)
    } else {
      expect(swatches).toHaveLength(0) // ein Design → kein Wähler nötig
    }
  })
})
