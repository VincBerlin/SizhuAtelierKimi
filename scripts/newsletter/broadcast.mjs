// Broadcast-CLI (Operator-Werkzeug). SICHERHEITS-STANDARD: ohne --send ist
// jeder Lauf ein dryRun (zählt Empfänger, sendet NICHTS). Echter Versand
// verlangt --send UND das gesetzte NEWSLETTER_BROADCAST_SECRET (lokal in
// .env UND als Railway-Variable — beides setzt der Operator bewusst bei der
// Aktivierung; bis dahin antwortet die Route 503).
//
// Aufruf: node scripts/newsletter/broadcast.mjs <cosmic|offer|promo> <YYYY-MM-DD> [--send]
import { readFileSync } from 'node:fs'

const [series, date, flag] = process.argv.slice(2)
if (!series || !date) {
  console.error('Aufruf: broadcast.mjs <cosmic|offer|promo> <YYYY-MM-DD> [--send]')
  process.exit(2)
}
const envFile = readFileSync(new URL('../../.env', import.meta.url), 'utf8')
const envOf = (k) => process.env[k] || (envFile.match(new RegExp(`^${k}=(.+)$`, 'm')) || [])[1]?.trim()
const SECRET = envOf('NEWSLETTER_BROADCAST_SECRET')
if (!SECRET) {
  console.error('NEWSLETTER_BROADCAST_SECRET fehlt — der Broadcast ist noch nicht aktiviert (gewollt).')
  process.exit(3)
}
const BASE = envOf('BROADCAST_BASE_URL') || 'https://sizhuatelier-shop-production.up.railway.app'
const dryRun = flag !== '--send'

const res = await fetch(`${BASE}/api/newsletter/broadcast`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Broadcast-Secret': SECRET },
  body: JSON.stringify({ series, date, dryRun }),
})
const j = await res.json().catch(() => ({}))
if (!res.ok) { console.error(`Fehler (${res.status}): ${JSON.stringify(j)}`); process.exit(1) }
console.log(JSON.stringify(j, null, 1))
if (j.dryRun) console.log('\nDRY-RUN — nichts versendet. Echter Versand: gleicher Aufruf mit --send')
