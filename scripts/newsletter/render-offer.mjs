// Rendert eine Angebots-Ausgabe (kind 'offer') aus ihrer editierbaren
// Inhaltsdatei in die 4 Sprach-HTMLs — gleiche editions-Feldnamen wie die
// Cosmic-Serie, damit der Editor (edit.mjs) beide Serien bedient.
import { readFileSync, writeFileSync } from 'node:fs'
import { renderNewsletterHtml } from './template.mjs'

const L = {
  weekNote: {
    en: (w) => `Offer of the week · calendar week ${w}. Prices verified against the shop's authoritative price table.`,
    de: (w) => `Angebot der Woche · Kalenderwoche ${w}. Preise gegen die verbindliche Preistabelle des Shops geprüft.`,
    fr: (w) => `Offre de la semaine · semaine ${w}. Prix vérifiés par rapport à la grille tarifaire officielle de la boutique.`,
    es: (w) => `Oferta de la semana · semana ${w}. Precios verificados contra la tabla de precios oficial de la tienda.`,
  },
}

export function renderOfferEdition(contentPath) {
  const c = JSON.parse(readFileSync(contentPath, 'utf8'))
  const out = []
  for (const lang of ['en', 'de', 'fr', 'es']) {
    const e = c.editions[lang]
    const o = c.offer
    const html = renderNewsletterHtml({
      lang,
      subject: e.subject,
      preheader: e.intro.slice(0, 90),
      eyebrow: e.eyebrow || 'Atelier Offer',
      title: e.title,
      blocks: [
        { type: 'text', text: e.intro },
        { type: 'poster', image: o.image || undefined, title: o.title[lang], subtitle: o.subtitle[lang], price: o.priceDisplay, href: o.href, cta: e.ctaText },
        { type: 'text', text: e.interpretation },
        { type: 'divider' },
        { type: 'text', text: L.weekNote[lang](c.week) },
      ],
    })
    const file = contentPath.replace(/\.content\.json$/, `-${lang}.html`)
    writeFileSync(file, html)
    out.push(file)
  }
  return out
}
