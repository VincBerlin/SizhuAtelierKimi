// Newsletter-Editor (Operator 2026-07-17): lokale Oberfläche zum MANUELLEN
// Eingreifen — Betreff, Titel, Intro, Deutung und CTA je Sprache bearbeiten,
// live-Vorschau daneben, Speichern rendert die 4 HTMLs sofort neu.
// Läuft NUR lokal (localhost:3220), kein Deploy, kein Versand von hier.
//
// Aufruf: node scripts/newsletter/edit.mjs   →   http://localhost:3220
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { renderCosmicEdition } from './render-cosmic.mjs'
import { renderOfferEdition } from './render-offer.mjs'
import { renderPromoEdition } from './render-promo.mjs'

// Serien-Dispatch: jede Inhaltsdatei trägt ihr `kind` — der Editor bedient
// alle Serien (cosmic-fusion | offer | promo) mit derselben Oberfläche.
const RENDERERS = { 'cosmic-fusion': renderCosmicEdition, offer: renderOfferEdition, promo: renderPromoEdition }
const renderEdition = (path) => {
  const kind = JSON.parse(readFileSync(path, 'utf8')).kind
  const fn = RENDERERS[kind]
  if (!fn) throw new Error(`unbekannte Serie: ${kind}`)
  return fn(path)
}

const DIR = 'docs/newsletter-drafts'
const PORT = 3220
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const safe = (f) => /^[\w.-]+\.content\.json$/.test(f)

const SHELL = (title, body) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>
body{margin:0;font-family:Helvetica,Arial,sans-serif;background:#FAF6EE;color:#2A2620}
header{background:#2A2620;color:#EDE6D6;padding:16px 24px;font-family:Georgia,serif;font-size:18px}
main{padding:24px;max-width:1400px;margin:0 auto}
a{color:#C0492E}
.grid{display:grid;grid-template-columns:minmax(380px,1fr) minmax(400px,1.2fr);gap:24px;align-items:start}
label{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a8072;margin:14px 0 4px}
input,textarea,select{width:100%;box-sizing:border-box;border:1px solid #d8cfbc;background:#fff;padding:10px 12px;font-size:14px;font-family:inherit;color:#2A2620}
textarea{min-height:96px;line-height:1.55}
button{background:#C0492E;color:#fff;border:none;padding:12px 22px;font-size:14px;font-weight:600;cursor:pointer;margin-top:18px}
iframe{width:100%;height:82vh;border:1px solid #d8cfbc;background:#fff}
.tabs{display:flex;gap:6px;margin-bottom:14px}
.tabs a{padding:8px 14px;border:1px solid #d8cfbc;text-decoration:none;font-size:13px;background:#fff}
.tabs a.on{background:#2A2620;color:#EDE6D6;border-color:#2A2620}
.note{font-size:12px;color:#8a8072;line-height:1.5;margin-top:10px}
li{margin:6px 0}
</style></head><body><header>SizhuAtelier — Newsletter-Editor <span style="font-size:11px;opacity:.6">(lokal · kein Versand)</span></header><main>${body}</main></body></html>`

function listPage() {
  const files = readdirSync(DIR).filter((f) => f.endsWith('.content.json')).sort().reverse()
  const items = files.map((f) => `<li><a href="/edit?f=${encodeURIComponent(f)}&lang=de">${esc(f)}</a></li>`).join('')
  return SHELL('Ausgaben', `<h2>Ausgaben</h2><ul>${items || '<li>Keine — erst <code>node scripts/newsletter/generate-cosmic.mjs</code> laufen lassen.</li>'}</ul>
  <p class="note">Jede Ausgabe ist eine editierbare Inhaltsdatei; Speichern rendert die 4 Sprach-HTMLs sofort neu. Versand bleibt ein separater, manueller Schritt (send-test.mjs).</p>`)
}

function editPage(f, lang) {
  const c = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'))
  const e = c.editions[lang]
  const tabs = ['de', 'en', 'fr', 'es'].map((l) => `<a class="${l === lang ? 'on' : ''}" href="/edit?f=${encodeURIComponent(f)}&lang=${l}">${l.toUpperCase()}</a>`).join('')
  const field = (name, val, area = false) =>
    area ? `<label>${name}</label><textarea name="${name}">${esc(val)}</textarea>` : `<label>${name}</label><input name="${name}" value="${esc(val)}">`
  return SHELL(`Bearbeiten — ${f}`, `
  <p><a href="/">← Ausgaben</a></p><div class="tabs">${tabs}</div>
  <div class="grid">
    <form method="post" action="/save?f=${encodeURIComponent(f)}&lang=${lang}">
      ${field('subject', e.subject)}
      ${field('title', e.title)}
      ${field('eyebrow', e.eyebrow)}
      ${field('intro', e.intro, true)}
      ${field('interpretation', e.interpretation, true)}
      ${field('ctaText', e.ctaText)}
      <button type="submit">Speichern &amp; neu rendern</button>
      <p class="note">Die Fakten-Tabellen (BaZi-Säulen, Planetenstände) kommen aus der Engine und sind hier bewusst nicht editierbar — nur Text drumherum. Deutung ohne [ENTWURF]-Markierung = freigabefertig.</p>
    </form>
    <iframe src="/preview?f=${encodeURIComponent(f)}&lang=${lang}&t=${Date.now()}"></iframe>
  </div>`)
}

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const f = url.searchParams.get('f') || ''
    const lang = ['en', 'de', 'fr', 'es'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'de'
    if (url.pathname === '/') return res.end(listPage())
    if (!safe(f)) { res.statusCode = 400; return res.end('ungültiger Dateiname') }
    if (url.pathname === '/edit') return res.end(editPage(f, lang))
    if (url.pathname === '/preview') {
      const html = readFileSync(`${DIR}/${f.replace(/\.content\.json$/, `-${lang}.html`)}`, 'utf8')
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.end(html.replaceAll('{{{RESEND_UNSUBSCRIBE_URL}}}', '#'))
    }
    if (url.pathname === '/save' && req.method === 'POST') {
      let body = ''
      req.on('data', (d) => { body += d })
      req.on('end', () => {
        const form = new URLSearchParams(body)
        const path = `${DIR}/${f}`
        const c = JSON.parse(readFileSync(path, 'utf8'))
        for (const k of ['subject', 'title', 'eyebrow', 'intro', 'interpretation', 'ctaText']) {
          const v = form.get(k)
          if (v !== null) c.editions[lang][k] = v
        }
        writeFileSync(path, JSON.stringify(c, null, 2))
        renderEdition(path)
        res.statusCode = 303
        res.setHeader('Location', `/edit?f=${encodeURIComponent(f)}&lang=${lang}`)
        res.end()
      })
      return
    }
    res.statusCode = 404
    res.end('nicht gefunden')
  } catch (err) {
    res.statusCode = 500
    res.end(`Fehler: ${err.message}`)
  }
})
server.listen(PORT, '127.0.0.1', () => console.log(`Newsletter-Editor: http://localhost:${PORT}`))
