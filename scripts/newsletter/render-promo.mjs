// Rendert eine Rabattcode-Ausgabe (kind 'promo') — vom Generator und vom
// Editor (edit.mjs) gemeinsam genutzt.
import { readFileSync, writeFileSync } from 'node:fs'
import { renderNewsletterHtml } from './template.mjs'

export function renderPromoEdition(path) {
  const c = JSON.parse(readFileSync(path, 'utf8'))
  const out = []
  for (const lang of ['en', 'de', 'fr', 'es']) {
    const e = c.editions[lang]
    const html = renderNewsletterHtml({
      lang,
      subject: e.subject,
      preheader: e.intro.slice(0, 90),
      eyebrow: e.eyebrow,
      title: e.title,
      blocks: [
        { type: 'text', text: e.intro },
        { type: 'code', code: c.promo.code, note: e.note },
        { type: 'text', text: e.interpretation },
        { type: 'cta', text: e.ctaText, href: c.ctaHref },
      ],
    })
    const file = path.replace(/\.content\.json$/, `-${lang}.html`)
    writeFileSync(file, html)
    out.push(file)
  }
  return out
}
