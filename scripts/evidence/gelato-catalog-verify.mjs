// [REAL-BOUNDARY-LIVE] — Gelato-Produktkatalog-Verifikation (Task 13 / RL-GELATO).
//
// Fragt mit echtem GELATO_API_KEY den Katalog nach gerahmten Postern in den
// Shop-Größen (A3/A2/A1) und Rahmenfarben (Eiche natur / Schwarz matt) ab,
// druckt die 6 verifizierten productUid-Zeilen zum Einfügen in
// server/gelatoProducts.js und speichert die Katalog-Antwort als Artefakt.
//
// EHRLICHKEITS-REGEL: Findet der Katalog eine Kombination NICHT, ist das ein
// LAUTER Launch-Blocker-Befund (Exit 1 + Ledger-RED) — niemals raten.
//
// Aufruf: GELATO_API_KEY=… node scripts/evidence/gelato-catalog-verify.mjs
import { writeFileSync, mkdirSync } from 'node:fs'

const KEY = process.env.GELATO_API_KEY
if (!KEY) {
  console.error('GELATO_API_KEY fehlt — Katalog-Verifikation braucht den echten Key (Operator).')
  process.exit(2)
}

const BASE = 'https://product.gelatoapis.com/v3'
const headers = { 'X-API-KEY': KEY, 'Content-Type': 'application/json' }

async function getJson(url, opts = {}) {
  const res = await fetch(url, { headers, ...opts })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${url} → ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
  return json
}

// 1. Kataloge listen, Framed-Poster-Katalog finden
const catalogs = await getJson(`${BASE}/catalogs`)
const list = Array.isArray(catalogs) ? catalogs : catalogs.data || []
console.log('Kataloge:', list.map((c) => c.catalogUid || c.uid).join(', '))
const framed = list.find((c) => /framed/i.test(c.catalogUid || c.uid || ''))
if (!framed) {
  console.error('BEFUND: kein framed-poster-Katalog gefunden — Operator-Entscheidung nötig (Ledger-RED).')
  process.exit(1)
}
const catalogUid = framed.catalogUid || framed.uid

// 2. Produkte im Katalog nach Größe/Rahmen filtern (Attribut-Namen variieren —
//    deshalb speichern wir die ROHE Attributliste als Artefakt und suchen tolerant).
const detail = await getJson(`${BASE}/catalogs/${catalogUid}`)
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
writeFileSync(`docs/evidence/fufire-gelato/${stamp}-gelato-catalog-${catalogUid}.json`, JSON.stringify(detail, null, 2))
console.log(`Katalog-Detail gespeichert. Attribute:`, (detail.productAttributes || []).map((a) => a.productAttributeUid).join(', '))

// 3. Kandidaten-Suche pro Kombination über die products/search-API
const SIZES = { A3: ['297x420', 'a3', '30x40'], A2: ['420x594', 'a2', '40x60'], A1: ['594x841', 'a1', '60x90'] }
const FRAMES = { 'Eiche natur': ['oak', 'natural-wood', 'wood'], 'Schwarz matt': ['black'] }
const found = {}
for (const [sizeId, sizeHints] of Object.entries(SIZES)) {
  for (const [frameName, frameHints] of Object.entries(FRAMES)) {
    const search = await getJson(`${BASE}/catalogs/${catalogUid}/products:search`, {
      method: 'POST',
      body: JSON.stringify({ limit: 50 }),
    }).catch((e) => ({ error: e.message }))
    const products = search.products || []
    const hit = products.find((p) => {
      const uid = String(p.productUid || '')
      return sizeHints.some((h) => uid.includes(h)) && frameHints.some((h) => uid.includes(h))
    })
    if (hit) {
      found[`${sizeId}|${frameName}`] = hit.productUid
    } else {
      console.error(`BEFUND: keine productUid für ${sizeId} + ${frameName} in den ersten 50 — Suche im Artefakt-JSON verfeinern oder Operator entscheidet.`)
    }
  }
}

console.log('\n── In server/gelatoProducts.js PRODUCT_UIDS einfügen: ──')
for (const [k, v] of Object.entries(found)) console.log(`  '${k}': '${v}',`)
writeFileSync(`docs/evidence/fufire-gelato/${stamp}-gelato-uid-mapping.json`, JSON.stringify(found, null, 2))
process.exit(Object.keys(found).length === 6 ? 0 : 1)
