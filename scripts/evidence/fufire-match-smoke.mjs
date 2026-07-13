// [REAL-BOUNDARY-LIVE] — Paar-Analyse gegen die LIVE FuFirE-API.
// Beweist zusätzlich die KONSISTENZ-Garantie: Person A (kanonischer Fall)
// muss im Match-Endpunkt EXAKT dieselben Säulen erhalten wie im Einzel-
// Endpunkt (庚午|壬午|辛亥|乙未) — d. h. die gepinnte TLST/midnight-Konvention
// wird auch beim Paar-Poster angewendet (Fund vom 2026-07-12: ohne explizite
// Standard-Übergabe wich die Stundensäule ab).
//
// Aufruf: FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-match-smoke.mjs
import { matchHehun, fufireEnabled } from '../../server/fufire.js'
import { writeFileSync, mkdirSync } from 'node:fs'

if (!fufireEnabled()) {
  console.error('FUFIRE_API_URL / FUFIRE_API_KEY fehlen — kein Live-Beweis möglich.')
  process.exit(2)
}

const EXPECTED_A = '庚午|壬午|辛亥|乙未'
const pair = await matchHehun(
  { date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.405, lat: 52.52, gender: 'male' },
  { date: '1992-11-03T08:15:00', tz: 'Europe/Berlin', lon: 11.575, lat: 48.137, gender: 'female' },
)
const gotA = pair.a.pillars.map((p) => p.stem + p.branch).join('|')
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
writeFileSync(`docs/evidence/fufire-gelato/${stamp}-match-live-response.json`, JSON.stringify(pair, null, 2))
let fail = false
if (gotA !== EXPECTED_A) {
  console.error(`KONSISTENZ-MISMATCH Person A: erwartet ${EXPECTED_A}, bekommen ${gotA}`)
  fail = true
}
if (pair.relation.wuxingRelation !== 'a_generates_b') {
  console.error(`RELATION-MISMATCH: erwartet a_generates_b, bekommen ${pair.relation.wuxingRelation}`)
  fail = true
}
if (!Array.isArray(pair.vectors.a) || pair.vectors.a.length !== 5) {
  console.error('VEKTOR-FEHLER: person_a wuxing_vector fehlt/ungültig')
  fail = true
}
if (fail) process.exit(1)
console.log(`OK — Paar live: A=${gotA} (konsistent mit Einzel-Endpunkt), Relation=${pair.relation.elementA}→nährt→${pair.relation.elementB}`)
