// [REAL-BOUNDARY-LIVE] — Gelato-Produktkatalog-Verifikation (Task 13 / RL-GELATO).
//
// Verifiziert mit echtem GELATO_API_KEY die 6 Shop-Kombinationen (A3/A2/A1 ×
// Eiche natur/Schwarz matt) über die GEFILTERTE products:search des Katalogs
// `framed-posters` (attributeFilters, KEIN Substring-Raten) und prüft, dass
// die in server/gelatoProducts.js hinterlegte Tabelle exakt diesen Live-
// Ergebnissen entspricht. Antworten werden als Artefakt gespeichert.
//
// Fund 2026-07-13 (behoben): die frühere Substring-Suche traf den falschen
// Katalog (fine-art-framed-poster) und verwechselte Zoll mit Zentimetern
// („30x40-inch" ≠ A3) — deshalb jetzt ausschließlich Attribut-Filter.
//
// EHRLICHKEITS-REGEL: Weicht eine Kombination ab oder fehlt, ist das ein
// LAUTER Launch-Blocker-Befund (Exit 1 + Ledger-RED) — niemals raten.
//
// Aufruf: GELATO_API_KEY=… node scripts/evidence/gelato-catalog-verify.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { PRODUCT_UIDS } from '../../server/gelatoProducts.js'

const KEY = process.env.GELATO_API_KEY
if (!KEY) {
  console.error('GELATO_API_KEY fehlt — Katalog-Verifikation braucht den echten Key (Operator).')
  process.exit(2)
}

const CATALOG = 'framed-posters'
const SEARCH_URL = `https://product.gelatoapis.com/v3/catalogs/${CATALOG}/products:search`
const headers = { 'X-API-KEY': KEY, 'Content-Type': 'application/json' }

// Shop-Achsen → Gelato-Attributwerte (bazi.ts frames[].name / sizes[].id).
// Operator 2026-07-15: + cm-Formate der personalisierten Poster (12 Kombis).
const SIZE_ATTR = { A3: 'a3', A2: 'a2', A1: 'a1', '30x40': '300x400-mm', '50x70': '500x700-mm', '70x100': '700x1000-mm' }
const FRAME_ATTR = { 'Eiche natur': 'natural-wood', 'Schwarz matt': 'black' }

async function search(size, color) {
  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ attributeFilters: { FrameSize: [size], FrameColor: [color], Orientation: ['ver'] }, limit: 50 }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${SEARCH_URL} → ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
  return (json.products || []).map((p) => p.productUid)
}

const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })

const evidence = {}
let failures = 0
for (const [sizeId, sizeAttr] of Object.entries(SIZE_ATTR)) {
  for (const [frameName, colorAttr] of Object.entries(FRAME_ATTR)) {
    const key = `${sizeId}|${frameName}`
    const expected = PRODUCT_UIDS[key]
    const live = await search(sizeAttr, colorAttr)
    const verified = Boolean(expected) && live.includes(expected)
    evidence[key] = { expected: expected || null, live_verified: verified, live_candidates: live.length }
    if (verified) {
      console.log(`OK    ${key}`)
    } else {
      failures += 1
      console.error(`BEFUND ${key}: hinterlegte UID ${expected ? 'NICHT im Live-Katalog' : 'FEHLT in PRODUCT_UIDS'} (${live.length} Live-Kandidaten) — Operator entscheidet.`)
    }
  }
}

writeFileSync(
  `docs/evidence/fufire-gelato/${stamp}-gelato-uid-mapping.json`,
  JSON.stringify({ catalog: CATALOG, verified_at: stamp, mapping: evidence }, null, 2),
)
const total = Object.keys(SIZE_ATTR).length * Object.keys(FRAME_ATTR).length
console.log(failures === 0 ? `\nAlle ${total} Kombinationen LIVE-VERIFIZIERT — Artefakt gespeichert.` : `\n${failures} Kombination(en) NICHT verifiziert — Ledger-RED.`)
process.exit(failures === 0 ? 0 : 1)
