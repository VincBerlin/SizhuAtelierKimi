/**
 * Pair-Design-TÜV — läuft automatisch für JEDES registrierte pair-Design:
 * beide Säulensätze vollständig, beide Namen (escaped), Relations-Label,
 * valides XML, alle Druckformate.
 */
import { describe, it, expect } from 'vitest'
import { DESIGNS } from '@/designs/registry.mjs'

const CHART_A = {
  element: 'Metall',
  animal: 'Pferd',
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
}
const CHART_B = {
  element: 'Wasser',
  animal: 'Affe',
  pillars: [
    { label: '年', stem: '壬', branch: '申' },
    { label: '月', stem: '庚', branch: '戌' },
    { label: '日', stem: '癸', branch: '酉' },
    { label: '時', stem: '丙', branch: '辰' },
  ],
}
const DATA = {
  frame: '#B98A5E',
  bg: '#E9DFCB',
  nameA: 'Anna <X>',
  nameB: 'Ben & Co',
  chartA: CHART_A,
  chartB: CHART_B,
  relationLabel: 'Metall nährt Wasser',
}

describe.each(DESIGNS.filter((d) => d.kind === 'pair'))('pair design $id', (design) => {
  const svg = design.render(DATA as never, { widthMm: 303, heightMm: 426 })

  it('renders both complete pillar sets', () => {
    for (const g of ['庚', '壬', '辛', '乙', '午', '亥', '未', '申', '戌', '癸', '酉', '丙', '辰']) expect(svg).toContain(g)
  })

  it('renders both names escaped + the relation label', () => {
    expect(svg).toContain('Anna &lt;X&gt;')
    expect(svg).toContain('Ben &amp; Co')
    expect(svg).toContain('Metall nährt Wasser')
    expect(svg).not.toContain('<X>')
  })

  it('parses as valid XML at every print size', () => {
    for (const [w, h] of [[303, 426], [426, 600], [600, 847]]) {
      const s = design.render(DATA as never, { widthMm: w, heightMm: h })
      expect(new DOMParser().parseFromString(s, 'image/svg+xml').querySelector('parsererror')).toBeNull()
    }
  })
})
