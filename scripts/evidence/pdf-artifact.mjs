// [REAL-ARTIFACT] — erzeugt das echte Druck-PDF des kanonischen Falls
// (Design Klassik, A2, Schwarz matt) und legt PDF + PNG-Sichtprüfung ins
// Evidence-Verzeichnis. Bricht hart ab, wenn Maße/Magic-Bytes nicht stimmen.
//
// Aufruf: node scripts/evidence/pdf-artifact.mjs
import { renderPosterPdf } from '../../server/pdf.js'
import { PRINT_SPECS, BLEED_MM, MM_TO_PT } from '../../server/printSpecs.js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const DATA = {
  frame: '#1B1B1B', // Schwarz matt
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

const buf = await renderPosterPdf({ designId: 'klassik', data: DATA, sizeId: 'A2' })
if (buf.subarray(0, 5).toString() !== '%PDF-') {
  console.error('FAIL: kein PDF-Header')
  process.exit(1)
}
const w = (PRINT_SPECS.A2.widthMm + 2 * BLEED_MM) * MM_TO_PT
const m = buf.toString('latin1').match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/)
if (!m || Math.abs(Number(m[1]) - w) > 1) {
  console.error(`FAIL: MediaBox-Breite ${m && m[1]} ≠ erwartet ${w.toFixed(1)}pt`)
  process.exit(1)
}
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
const pdfPath = `docs/evidence/fufire-gelato/${stamp}-klassik-A2.pdf`
writeFileSync(pdfPath, buf)
try {
  execFileSync('sips', ['-s', 'format', 'png', pdfPath, '--out', pdfPath.replace('.pdf', '.png')], { stdio: 'ignore' })
} catch {
  console.warn('sips-PNG-Konvertierung übersprungen (Sichtprüfung direkt am PDF)')
}
console.log(`OK — ${pdfPath} (${(buf.length / 1024).toFixed(0)} kB, MediaBox ${m[1]}×${m[2]}pt = A2+${BLEED_MM}mm Beschnitt)`)
