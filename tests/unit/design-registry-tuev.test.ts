/**
 * Design-TÜV — läuft automatisch für JEDES registrierte Design.
 * Ein Design, das Personalisierungs-Felder verschluckt, Nutzertext roh
 * einbettet (XML-Injection) oder invalides XML liefert, wird HIER rot —
 * nicht beim Kunden und nicht erst im Druck-PDF.
 */
import { describe, it, expect } from 'vitest'
import { DESIGNS, getDesign } from '@/designs/registry.mjs'

const DATA = {
  frame: '#B98A5E',
  bg: '#E9DFCB',
  name: 'Anna <Müller> & Söhne',
  element: 'Metall',
  animal: 'Pferd',
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
}

describe.each(DESIGNS.filter((d) => d.kind === 'single'))('design $id', (design) => {
  const svg = design.render(DATA, { widthMm: 420, heightMm: 594 })

  it('renders a complete svg with mm viewBox', () => {
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox="0 0 420 594"')
    expect(svg.trim().endsWith('</svg>')).toBe(true)
  })

  it('contains every personalization field', () => {
    for (const g of ['庚', '壬', '辛', '乙', '午', '亥', '未', '年', '月', '日', '時']) expect(svg).toContain(g)
    expect(svg).toContain('PFERD')
    expect(svg).toContain('METALL')
  })

  it('escapes user text — XML injection is structurally impossible', () => {
    expect(svg).toContain('Anna &lt;Müller&gt; &amp; Söhne')
    expect(svg).not.toContain('<Müller>')
  })

  it('parses as valid XML', () => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
  })

  it('scales to every print size without structural change (A3/A2/A1 + bleed)', () => {
    for (const [w, h] of [[303, 426], [426, 600], [600, 847]]) {
      const s = design.render(DATA, { widthMm: w, heightMm: h })
      expect(s).toContain(`viewBox="0 0 ${w} ${h}"`)
      expect(new DOMParser().parseFromString(s, 'image/svg+xml').querySelector('parsererror')).toBeNull()
    }
  })
})

describe('getDesign', () => {
  it('throws on unknown id (orders can never reference a ghost design)', () => {
    expect(() => getDesign('gibtsnicht')).toThrow()
  })
  it('resolves every registered id', () => {
    for (const d of DESIGNS) expect(getDesign(d.id).id).toBe(d.id)
  })
})
