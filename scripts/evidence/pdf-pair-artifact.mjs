// [REAL-ARTIFACT] + [REAL-BOUNDARY-LIVE] — erzeugt das echte Partner-Poster-
// Druck-PDF: Charts beider Personen LIVE über FuFirE berechnet (matchHehun),
// dann durch die geteilte Paar-Design-Vorlage in ein maßgenaues A3-PDF
// gerendert (Eiche natur), plus PNG-Sichtprüfung.
//
// Aufruf: FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/pdf-pair-artifact.mjs
import { matchHehun, fufireEnabled } from '../../server/fufire.js'
import { renderPosterPdf } from '../../server/pdf.js'
import { PRINT_SPECS, BLEED_MM, MM_TO_PT } from '../../server/printSpecs.js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

if (!fufireEnabled()) {
  console.error('FUFIRE_API_URL / FUFIRE_API_KEY fehlen.')
  process.exit(2)
}

const pair = await matchHehun(
  { date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.405, lat: 52.52, gender: 'male' },
  { date: '1992-11-03T08:15:00', tz: 'Europe/Berlin', lon: 11.575, lat: 48.137, gender: 'female' },
)
const data = {
  frame: '#B98A5E', // Eiche natur
  bg: '#E9DFCB',
  nameA: 'Anna',
  nameB: 'Ben',
  chartA: pair.a,
  chartB: pair.b,
  relationLabel: `${pair.relation.elementA} nährt ${pair.relation.elementB}`,
}
const buf = await renderPosterPdf({ designId: 'paar-harmonie', data, sizeId: 'A3' })
const w = (PRINT_SPECS.A3.widthMm + 2 * BLEED_MM) * MM_TO_PT
const m = buf.toString('latin1').match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/)
if (buf.subarray(0, 5).toString() !== '%PDF-' || !m || Math.abs(Number(m[1]) - w) > 1) {
  console.error('FAIL: PDF-Header oder A3-Maße falsch')
  process.exit(1)
}
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
const pdfPath = `docs/evidence/fufire-gelato/${stamp}-paar-harmonie-A3.pdf`
writeFileSync(pdfPath, buf)
try {
  execFileSync('sips', ['-s', 'format', 'png', pdfPath, '--out', pdfPath.replace('.pdf', '.png')], { stdio: 'ignore' })
} catch { /* Sichtprüfung dann direkt am PDF */ }
console.log(`OK — ${pdfPath} (${(buf.length / 1024).toFixed(0)} kB, A3+Beschnitt, Relation: ${data.relationLabel})`)
