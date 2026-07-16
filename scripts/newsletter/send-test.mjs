// Testversand eines Newsletter-Entwurfs — NUR an eine einzelne, explizit
// angegebene Adresse (Operator-Freigabe-Schleife). Kein Broadcast.
//
// Aufruf: node scripts/newsletter/send-test.mjs docs/newsletter-drafts/<datei>.html <empfänger>
import { readFileSync } from 'node:fs'

const [file, to] = process.argv.slice(2)
if (!file || !to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
  console.error('Aufruf: node scripts/newsletter/send-test.mjs <draft.html> <empfänger@mail>')
  process.exit(2)
}
const envFile = readFileSync(new URL('../../.env', import.meta.url), 'utf8')
const KEY = process.env.RESEND_API_KEY || (envFile.match(/^RESEND_API_KEY=(.+)$/m) || [])[1]?.trim()
if (!KEY) { console.error('RESEND_API_KEY fehlt'); process.exit(2) }
const FROM = process.env.NEWSLETTER_FROM_EMAIL || 'SizhuAtelier <newsletter@sizhuatelier.shop>'

const html = readFileSync(file, 'utf8')
const subject = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || 'SizhuAtelier Newsletter — Test'
// Test-Versand: der Broadcast-Platzhalter wäre tot — auf die Startseite zeigen.
const body = html.replaceAll('{{{RESEND_UNSUBSCRIBE_URL}}}', 'https://sizhuatelier-shop-production.up.railway.app/')

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ from: FROM, to, subject: `[TEST] ${subject}`, html: body }),
})
const j = await res.json().catch(() => ({}))
if (!res.ok) { console.error(`Versand fehlgeschlagen (${res.status}): ${JSON.stringify(j)}`); process.exit(1) }
console.log(`Testmail versendet an ${to} — Resend-Id ${j.id}`)
