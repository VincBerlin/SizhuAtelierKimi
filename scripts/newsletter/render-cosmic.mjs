// Rendert eine Cosmic-Fusion-Ausgabe aus ihrer editierbaren Inhaltsdatei
// (<datum>-cosmic.content.json) in die 4 Sprach-HTMLs. Wird vom Generator
// UND vom Editor (nach manuellem Eingriff) aufgerufen — EINE Renderquelle.
import { readFileSync, writeFileSync } from 'node:fs'
import { renderNewsletterHtml } from './template.mjs'

const L = {
  impulseHeading: { en: 'Today’s impulse', de: 'Der Impuls des Tages', fr: 'L’impulsion du jour', es: 'El impulso del día' },
  baziHeading: { en: 'The pillars of today (BaZi)', de: 'Die Säulen des heutigen Tages (BaZi)', fr: 'Les piliers du jour (BaZi)', es: 'Los pilares de hoy (BaZi)' },
  westernHeading: { en: 'The sky right now (Western)', de: 'Der Himmel jetzt (Westlich)', fr: 'Le ciel en ce moment (Occidental)', es: 'El cielo ahora (Occidental)' },
  yearRow: { en: 'Year', de: 'Jahr', fr: 'Année', es: 'Año' },
  monthRow: { en: 'Month', de: 'Monat', fr: 'Mois', es: 'Mes' },
  dayRow: { en: 'Day', de: 'Tag', fr: 'Jour', es: 'Día' },
  factsNote: {
    en: 'Computed live by our own calculation engine (BaZi: TLST, Berlin reference · Western: Swiss Ephemeris) at',
    de: 'Live berechnet von unserer eigenen Engine (BaZi: TLST, Referenz Berlin · Westlich: Swiss Ephemeris) am',
    fr: 'Calculé en direct par notre propre moteur (BaZi : TLST, référence Berlin · Occidental : Swiss Ephemeris) le',
    es: 'Calculado en vivo por nuestro propio motor (BaZi: TLST, referencia Berlín · Occidental: Swiss Ephemeris) el',
  },
}

/** @param {string} contentPath Pfad zur .content.json */
export function renderCosmicEdition(contentPath) {
  const c = JSON.parse(readFileSync(contentPath, 'utf8'))
  const out = []
  for (const lang of ['en', 'de', 'fr', 'es']) {
    const e = c.editions[lang]
    const html = renderNewsletterHtml({
      lang,
      subject: e.subject,
      preheader: e.intro.slice(0, 90),
      eyebrow: e.eyebrow || 'Cosmic Pulse',
      title: e.title,
      // Operator 2026-07-17: der TAGESIMPULS (Fusion-Deutung) fängt den Leser
      // GANZ OBEN ein — die Fakten-Tabellen belegen ihn danach.
      blocks: [
        { type: 'text', text: e.intro },
        { type: 'heading', text: L.impulseHeading[lang] },
        { type: 'text', text: e.interpretation },
        { type: 'divider' },
        { type: 'heading', text: L.baziHeading[lang] },
        { type: 'facts', rows: c.bazi.rows[lang] },
        { type: 'heading', text: L.westernHeading[lang] },
        { type: 'facts', rows: c.western.rows[lang] },
        { type: 'text', text: `${L.factsNote[lang]} ${c.computedAt} (UTC).` },
        { type: 'cta', text: e.ctaText, href: c.ctaHref },
      ],
    })
    const file = contentPath.replace(/\.content\.json$/, `-${lang}.html`)
    writeFileSync(file, html)
    out.push(file)
  }
  return out
}

// CLI: node render-cosmic.mjs <content.json>
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop() ?? '')) {
  const p = process.argv[2]
  if (!p) { console.error('Aufruf: node render-cosmic.mjs <content.json>'); process.exit(2) }
  for (const f of renderCosmicEdition(p)) console.log(`gerendert: ${f}`)
}
