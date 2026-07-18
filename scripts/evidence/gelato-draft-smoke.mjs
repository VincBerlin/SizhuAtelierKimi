// [REAL-BOUNDARY-LIVE] + [HUMAN-VERIFIED]-Zubringer — personalisierte
// TESTBESTELLUNG ohne Kaufabschluss (Operator-Anweisung 2026-07-13):
// Session-Fixture → ECHTE Pipeline (FuFirE-Neuberechnung → Druck-PDF →
// Produktions-DB → öffentliche PDF-URL → ECHTER Gelato-DRAFT).
//
// SICHERUNG: bricht hart ab, wenn GELATO_ORDER_TYPE nicht 'draft' ist —
// dieses Script darf NIE eine produzierende Order auslösen. Der Draft
// erscheint im Gelato-Dashboard (Operator sichtet/löscht = HUMAN-VERIFIED).
//
// Zweiphasig über die eingebaute Idempotenz von fulfillOrder:
//   Phase 1 (gelato=null): drucken + in DB speichern → PDF-URL selbst per
//     HTTPS von der PRODUKTIONS-Domain abrufen (Gelato muss sie später genauso
//     ziehen können) — fail fast, bevor irgendetwas Gelato erreicht.
//   Phase 2 (gelato echt): Replay — Print wird wiederverwendet (kein
//     Doppeldruck), NUR der Draft wird submitted.
//
// Aufruf (DATABASE_URL = Railway DATABASE_PUBLIC_URL):
//   DATABASE_URL=… FUFIRE_API_URL=… FUFIRE_API_KEY=… GELATO_API_KEY=… \
//   GELATO_ORDER_TYPE=draft node scripts/evidence/gelato-draft-smoke.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import pg from 'pg'
import { fulfillOrder, ensurePrintTables } from '../../server/fulfillment.js'
import { renderPosterPdf } from '../../server/pdf.js'
import { calculateBazi, matchHehun, fufireEnabled } from '../../server/fufire.js'
import { gelatoEnabled, createOrder } from '../../server/gelato.js'

const PUBLIC_URL = 'https://sizhuatelier-shop-production.up.railway.app'

if (!fufireEnabled()) { console.error('FUFIRE_API_URL/KEY fehlen.'); process.exit(2) }
if (!gelatoEnabled()) { console.error('GELATO_API_KEY fehlt.'); process.exit(2) }
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL (Railway DATABASE_PUBLIC_URL) fehlt.'); process.exit(2) }
if ((process.env.GELATO_ORDER_TYPE || 'draft') !== 'draft') {
  console.error('ABBRUCH: GELATO_ORDER_TYPE muss draft sein — dieses Script löst NIE eine produzierende Order aus.')
  process.exit(3)
}

const stamp = new Date().toISOString().slice(0, 10)
const sessionId = `evidence_draft_${stamp}_${Math.random().toString(36).slice(2, 8)}`

// Fixture-Session (klar als TEST erkennbar; Draft wird nie produziert).
const session = {
  id: sessionId,
  currency: 'eur',
  customer_details: { email: 'hello@sizhuatelier.shop', name: 'SizhuAtelier Testbestellung' },
  shipping_details: {
    name: 'SizhuAtelier Testbestellung',
    address: { line1: 'Musterstrasse 1', line2: 'TEST-DRAFT — NICHT PRODUZIEREN', city: 'Berlin', postal_code: '10115', country: 'DE' },
  },
}

// Kanonischer personalisierter Fall (Ledger-Fixture 1990-06-15 12:30 Berlin).
const personalization = {
  line1: {
    productType: 'bazi', name: 'Anna Testbestellung', language: 'DE',
    date: '1990-06-15', time: '12:30', birthTimeUnknown: 'false',
    place: 'Berlin', placeResolved: 'Berlin', placeLat: '52.52', placeLon: '13.405', placeTz: 'Europe/Berlin',
    designId: 'klassik', size: 'A2', frame: 'Schwarz matt', frameHex: '#1B1B1B', bgHex: '#E9DFCB',
  },
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
await ensurePrintTables(pool)
const fufire = { calculateBazi, matchHehun }

// ── Phase 1: drucken + speichern, KEIN Gelato ────────────────────────────────
const r1 = await fulfillOrder({ session, personalization, deps: { pool, fufire, renderPdf: renderPosterPdf, gelato: null, publicUrl: PUBLIC_URL } })
if (r1.failed.length > 0) { console.error('Phase 1 FEHLGESCHLAGEN:', JSON.stringify(r1.failed)); await pool.end(); process.exit(1) }
const { token, bytes, provenance } = r1.printed[0]
console.log(`Phase 1 OK — PDF ${bytes} Bytes, engine ${provenance?.engine_version}`)

// PDF-URL von der PRODUKTIONS-Domain verifizieren (wie Gelato sie ziehen wird).
const pdfUrl = `${PUBLIC_URL}/prints/${encodeURIComponent(sessionId)}/${token}.pdf`
const head = await fetch(pdfUrl)
const pdfBuf = head.ok ? Buffer.from(await head.arrayBuffer()) : null
if (!head.ok || !pdfBuf || pdfBuf.length !== bytes || !pdfBuf.subarray(0, 5).toString().startsWith('%PDF-')) {
  console.error(`ABBRUCH: PDF-URL nicht sauber abrufbar (HTTP ${head.status}, ${pdfBuf?.length ?? 0}/${bytes} Bytes) — kein Gelato-Call.`)
  await pool.end(); process.exit(1)
}
console.log(`PDF öffentlich verifiziert: HTTP 200, ${pdfBuf.length} Bytes, %PDF-Header OK`)

// ── Phase 2: Replay MIT echtem Gelato → GENAU EIN Draft ─────────────────────
const gelato = { enabled: gelatoEnabled, createOrder }
const r2 = await fulfillOrder({ session, personalization, deps: { pool, fufire, renderPdf: renderPosterPdf, gelato, publicUrl: PUBLIC_URL } })
await pool.end()
if (r2.failed.length > 0) { console.error('Phase 2 FEHLGESCHLAGEN:', JSON.stringify(r2.failed)); process.exit(1) }
if (r2.submitted.length !== 1) { console.error('Kein Draft submitted:', JSON.stringify(r2)); process.exit(1) }
const { gelatoOrderId, orderType } = r2.submitted[0]
if (orderType !== 'draft') { console.error(`ALARM: orderType=${orderType} — erwartet draft!`); process.exit(1) }

mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
writeFileSync(`docs/evidence/fufire-gelato/${stamp}-gelato-draft-order.json`, JSON.stringify({
  verified_at: stamp, sessionId, gelatoOrderId, orderType, pdfUrl, pdfBytes: bytes,
  engine: provenance?.engine_version ?? null,
  note: 'TEST-Draft ohne Kaufabschluss — Operator sichtet im Gelato-Dashboard (HUMAN-VERIFIED) und löscht oder bestätigt bewusst.',
}, null, 2))

console.log('')
console.log(`DRAFT ANGELEGT — Gelato-Order-Id: ${gelatoOrderId} (orderType=${orderType})`)
console.log('→ Im Gelato-Dashboard sichten: Draft, wird NICHT automatisch produziert.')
process.exit(0)
