/**
 * server/pdf.js — maßgenaue Druck-PDF-Erzeugung aus der geteilten SVG-Vorlage.
 * Prüft ECHTE Eigenschaften des Byte-Outputs (Magic Bytes, MediaBox-Maße in
 * pt, Font-Subset-Größe) — kein "hat nicht geworfen"-Scheintest. Die visuelle
 * Gegenprobe ist scripts/evidence/pdf-artifact.mjs ([REAL-ARTIFACT], Ledger).
 */
import { describe, it, expect } from 'vitest'
import { renderPosterPdf } from '../../server/pdf.js'
import { PRINT_SPECS, BLEED_MM, MM_TO_PT } from '../../server/printSpecs.js'

const DATA = {
  frame: '#B98A5E',
  bg: '#E9DFCB',
  name: 'Anna Müller',
  element: 'Metall',
  animal: 'Pferd',
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
}

describe('renderPosterPdf', () => {
  it('produces a real PDF with the exact A2+bleed page size', async () => {
    const buf = await renderPosterPdf({ designId: 'klassik', data: DATA, sizeId: 'A2' })
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
    const w = (PRINT_SPECS.A2.widthMm + 2 * BLEED_MM) * MM_TO_PT
    const h = (PRINT_SPECS.A2.heightMm + 2 * BLEED_MM) * MM_TO_PT
    const mediaBox = buf.toString('latin1').match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/)
    expect(mediaBox).not.toBeNull()
    expect(Number(mediaBox![1])).toBeCloseTo(w, 0) // 426mm → 1207.6pt
    expect(Number(mediaBox![2])).toBeCloseTo(h, 0) // 600mm → 1700.8pt
    // Fonts wirklich eingebettet (CJK-Subset + Sans) — ein leeres PDF wäre ~2kB
    expect(buf.length).toBeGreaterThan(50_000)
  })

  it('produces every shop size (A-Serie + Operator-cm-Formate) with matching dimensions', async () => {
    // Operator 2026-07-15: 30x40/50x70/70x100 sind die neuen Personalize-Formate;
    // die A-Serie bleibt reprintfähig für Alt-Bestellungen.
    for (const sizeId of ['A3', 'A2', 'A1', '30x40', '50x70', '70x100'] as const) {
      const buf = await renderPosterPdf({ designId: 'klassik', data: DATA, sizeId })
      const w = (PRINT_SPECS[sizeId].widthMm + 2 * BLEED_MM) * MM_TO_PT
      const mediaBox = buf.toString('latin1').match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/)
      expect(Number(mediaBox![1])).toBeCloseTo(w, 0)
    }
  })

  it('rejects unknown sizeId/designId loudly (never a silently wrong print)', async () => {
    await expect(renderPosterPdf({ designId: 'klassik', data: DATA, sizeId: 'A9' })).rejects.toThrow('unknown sizeId')
    await expect(renderPosterPdf({ designId: 'ghost', data: DATA, sizeId: 'A2' })).rejects.toThrow('unknown design')
  })
})
