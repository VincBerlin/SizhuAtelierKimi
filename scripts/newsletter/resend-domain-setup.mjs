// Resend-Domain-Verbindung (Operator 2026-07-17): legt sizhuatelier.shop bei
// Resend an, gibt die DNS-Einträge für Hostinger aus, stößt die Verifizierung
// an und pollt den Status. BENÖTIGT einen Full-Access-Key — der reine
// Sende-Key (rechteminimal, gut für den Server) darf das nicht (401).
//
// Aufruf: RESEND_ADMIN_KEY=re_… node scripts/newsletter/resend-domain-setup.mjs
// (fällt zurück auf RESEND_API_KEY aus .env, falls dieser Full-Access ist)
import { readFileSync } from 'node:fs'

const envFile = (() => { try { return readFileSync(new URL('../../.env', import.meta.url), 'utf8') } catch { return '' } })()
const envOf = (k) => process.env[k] || (envFile.match(new RegExp(`^${k}=(.+)$`, 'm')) || [])[1]?.trim()
const KEY = envOf('RESEND_ADMIN_KEY') || envOf('RESEND_API_KEY')
const DOMAIN = 'sizhuatelier.shop'
if (!KEY) { console.error('RESEND_ADMIN_KEY (Full access) fehlt'); process.exit(2) }
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

const api = async (path, opts = {}) => {
  const res = await fetch(`https://api.resend.com${path}`, { headers: H, ...opts })
  const j = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, j }
}

// 1 — existiert die Domain schon?
const list = await api('/domains')
if (!list.ok) { console.error(`Domains lesen fehlgeschlagen (${list.status}): ${JSON.stringify(list.j)} — Full-Access-Key nötig.`); process.exit(1) }
let dom = (list.j.data || []).find((d) => d.name === DOMAIN)

// 2 — anlegen, falls nicht vorhanden
if (!dom) {
  const created = await api('/domains', { method: 'POST', body: JSON.stringify({ name: DOMAIN }) })
  if (!created.ok) { console.error(`Anlegen fehlgeschlagen (${created.status}): ${JSON.stringify(created.j)}`); process.exit(1) }
  dom = created.j
  console.log(`Domain angelegt: ${DOMAIN} (id ${dom.id})`)
} else {
  console.log(`Domain existiert: ${DOMAIN} (id ${dom.id}, Status ${dom.status})`)
}

// 3 — DNS-Einträge ausgeben (für Hostinger)
const detail = await api(`/domains/${dom.id}`)
const records = detail.j.records || dom.records || []
console.log('\n== Diese DNS-Einträge bei Hostinger setzen ==')
for (const r of records) {
  console.log(`  ${r.record ?? r.type}  ${r.type}  Name: ${r.name}  Wert: ${r.value}  ${r.priority ? `Prio: ${r.priority}` : ''}  [${r.status}]`)
}

// 4 — Verifizierung anstoßen + kurz pollen (DNS-Propagation kann dauern)
await api(`/domains/${dom.id}/verify`, { method: 'POST' })
for (let i = 0; i < 12; i++) {
  const d = await api(`/domains/${dom.id}`)
  const status = d.j.status
  console.log(`Status: ${status}`)
  if (status === 'verified') { console.log('\nDOMAIN VERIFIZIERT — Versand von @sizhuatelier.shop ist frei.'); process.exit(0) }
  await new Promise((r) => setTimeout(r, 10000))
}
console.log('\nNoch nicht verifiziert — DNS-Einträge prüfen/propagieren lassen und Skript erneut ausführen.')
process.exit(3)
