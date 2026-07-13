/**
 * Western-Design-TÜV — läuft automatisch für JEDES registrierte western-Design
 * (Birth-Chart-Poster, Operator 2026-07-14): Big Three vollständig, Planeten-
 * Tabelle, Name/Subtitle escaped (Injektions-Fixture), valides XML, ehrlicher
 * Aszendent-Entfall (ascendant: null → keine ASC-Zeile, nie geraten).
 */
import { describe, it, expect } from 'vitest'
import { DESIGNS } from '@/designs/registry.mjs'

const DATA = {
  frame: '#B98A5E',
  bg: '#E9DFCB',
  name: 'Anna <Müller> & Söhne',
  subtitle: 'WESTERN · <BIRTH> & "CHART"',
  sunLabel: 'Sun',
  moonLabel: 'Moon',
  ascLabel: 'Ascendant',
  sun: { sign: 'Gemini', deg: 24.1 },
  moon: { sign: 'Pisces', deg: 14.5 },
  ascendant: { sign: 'Virgo', deg: 19.1 },
  planets: [
    { label: 'Mercury', sign: 'Gemini', deg: 5.6, retro: false },
    { label: 'Venus', sign: 'Taurus', deg: 18.7, retro: false },
    { label: 'Mars', sign: 'Aries', deg: 11, retro: false },
    { label: 'Jupiter', sign: 'Cancer', deg: 15.9, retro: false },
    { label: 'Saturn', sign: 'Capricorn', deg: 24, retro: true },
  ],
}

describe.each(DESIGNS.filter((d) => d.kind === 'western'))('western design $id', (design) => {
  const svg = design.render(DATA as never, { widthMm: 420, heightMm: 594 })

  it('renders a complete svg with mm viewBox', () => {
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox="0 0 420 594"')
    expect(svg.trim().endsWith('</svg>')).toBe(true)
  })

  it('renders the Big Three and every planet row (retrograde marked)', () => {
    for (const sign of ['Gemini', 'Pisces', 'Virgo', 'Taurus', 'Aries', 'Cancer', 'Capricorn']) expect(svg).toContain(sign)
    for (const label of ['MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN']) expect(svg).toContain(label)
    expect(svg).toContain(' R')
  })

  it('escapes user text + subtitle (XML injection cannot break the print SVG)', () => {
    expect(svg).toContain('Anna &lt;Müller&gt; &amp; Söhne')
    expect(svg).not.toContain('<Müller>')
    expect(svg).toContain('&lt;BIRTH&gt;')
  })

  it('outlines the sun block (the chart core) with a stroked frame', () => {
    expect(svg).toMatch(/<rect[^>]*fill="none"[^>]*stroke=/)
  })

  it('honestly omits the ascendant when the birth time is unknown (null)', () => {
    const svgNoAsc = design.render({ ...DATA, ascendant: null } as never, { widthMm: 420, heightMm: 594 })
    expect(svgNoAsc).not.toContain('Virgo')
    expect(svgNoAsc).toContain('Pisces') // Mond bleibt
  })

  it('is valid XML', () => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
  })
})
