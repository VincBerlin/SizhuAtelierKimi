// [REAL-BOUNDARY-LIVE] — Beweist gegen die LIVE FuFirE-API, dass der
// kanonische Testfall (1990-06-15 12:30 Berlin, TLST) exakt die eingefrorenen
// Säulen liefert. Exit 1 bei Abweichung. Artefakt → docs/evidence/fufire-gelato/.
//
// Aufruf: FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-smoke.mjs
import { calculateBazi, fufireEnabled } from '../../server/fufire.js'
import { writeFileSync, mkdirSync } from 'node:fs'

if (!fufireEnabled()) {
  console.error('FUFIRE_API_URL / FUFIRE_API_KEY fehlen — kein Live-Beweis möglich.')
  process.exit(2)
}

const EXPECTED = '庚午|壬午|辛亥|乙未'
const chart = await calculateBazi({
  date: '1990-06-15T12:30:00',
  tz: 'Europe/Berlin',
  lon: 13.405,
  lat: 52.52,
  birthTimeKnown: true,
})
const got = chart.pillars.map((p) => p.stem + p.branch).join('|')
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
writeFileSync(
  `docs/evidence/fufire-gelato/${stamp}-bazi-live-response.json`,
  JSON.stringify({ request: { date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.405, lat: 52.52, standard: 'TLST' }, normalized: chart }, null, 2),
)
if (got !== EXPECTED) {
  console.error(`MISMATCH: expected ${EXPECTED}, got ${got}`)
  process.exit(1)
}
console.log(`OK — live pillars ${got} | animal=${chart.animal} element=${chart.element} | engine ${chart.provenance.engine_version}`)
