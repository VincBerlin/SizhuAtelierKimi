// Kosmischer Newsletter — Ausgaben-Generator (Operator-Batch #9).
//
// Zieht die ECHTEN Planetenstände aus der eigenen FuFirE-Engine
// (/v1/transit/now) und baut daraus eine Ausgabe in 4 Sprachen als
// HTML-Entwurf unter docs/newsletter-drafts/. EHRLICHKEIT: das Skript
// schreibt nur belegbare Fakten (Planet, Zeichen, rückläufig) plus neutralen
// Rahmentext — Deutungstiefe ergänzt der Operator/Claude-Lauf im Entwurf,
// und VERSENDET wird nur nach Operator-Freigabe (send-test.mjs → Broadcast).
//
// Aufruf:  FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/newsletter/generate-cosmic.mjs
// (oder ohne Env — dann werden die Werte aus Shop/.env gelesen)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { renderNewsletterHtml } from './template.mjs'

const envFile = (() => { try { return readFileSync(new URL('../../.env', import.meta.url), 'utf8') } catch { return '' } })()
const envOf = (k) => process.env[k] || (envFile.match(new RegExp(`^${k}=(.+)$`, 'm')) || [])[1]?.trim()
const API = envOf('FUFIRE_API_URL')
const KEY = envOf('FUFIRE_API_KEY')
if (!API || !KEY) { console.error('FUFIRE_API_URL/KEY fehlen'); process.exit(2) }

const res = await fetch(`${API}/v1/transit/now`, { headers: { 'X-API-Key': KEY } })
if (!res.ok) { console.error(`transit/now → ${res.status}`); process.exit(1) }
const transit = await res.json()
const stamp = transit.computed_at?.slice(0, 10)
if (!stamp) { console.error('transit/now ohne computed_at'); process.exit(1) }

const SIGNS = {
  aries: { en: 'Aries', de: 'Widder', fr: 'Bélier', es: 'Aries' },
  taurus: { en: 'Taurus', de: 'Stier', fr: 'Taureau', es: 'Tauro' },
  gemini: { en: 'Gemini', de: 'Zwillinge', fr: 'Gémeaux', es: 'Géminis' },
  cancer: { en: 'Cancer', de: 'Krebs', fr: 'Cancer', es: 'Cáncer' },
  leo: { en: 'Leo', de: 'Löwe', fr: 'Lion', es: 'Leo' },
  virgo: { en: 'Virgo', de: 'Jungfrau', fr: 'Vierge', es: 'Virgo' },
  libra: { en: 'Libra', de: 'Waage', fr: 'Balance', es: 'Libra' },
  scorpio: { en: 'Scorpio', de: 'Skorpion', fr: 'Scorpion', es: 'Escorpio' },
  sagittarius: { en: 'Sagittarius', de: 'Schütze', fr: 'Sagittaire', es: 'Sagitario' },
  capricorn: { en: 'Capricorn', de: 'Steinbock', fr: 'Capricorne', es: 'Capricornio' },
  aquarius: { en: 'Aquarius', de: 'Wassermann', fr: 'Verseau', es: 'Acuario' },
  pisces: { en: 'Pisces', de: 'Fische', fr: 'Poissons', es: 'Piscis' },
}
const PLANETS = {
  sun: { en: 'Sun', de: 'Sonne', fr: 'Soleil', es: 'Sol' },
  moon: { en: 'Moon', de: 'Mond', fr: 'Lune', es: 'Luna' },
  mercury: { en: 'Mercury', de: 'Merkur', fr: 'Mercure', es: 'Mercurio' },
  venus: { en: 'Venus', de: 'Venus', fr: 'Vénus', es: 'Venus' },
  mars: { en: 'Mars', de: 'Mars', fr: 'Mars', es: 'Marte' },
  jupiter: { en: 'Jupiter', de: 'Jupiter', fr: 'Jupiter', es: 'Júpiter' },
  saturn: { en: 'Saturn', de: 'Saturn', fr: 'Saturne', es: 'Saturno' },
}
const RETRO = { en: 'retrograde', de: 'rückläufig', fr: 'rétrograde', es: 'retrógrado' }
const COPY = {
  en: { eyebrow: 'Cosmic Pulse', title: `The sky this week — ${stamp}`, intro: 'Computed live by our own calculation engine — the same engine that renders every personalized poster. Here is where the planets actually stand right now:', factsNote: 'Positions computed for', cta: 'Your own chart, as art', outro: '[DRAFT: editorial interpretation to be added before approval]' },
  de: { eyebrow: 'Cosmic Pulse', title: `Der Himmel diese Woche — ${stamp}`, intro: 'Live berechnet von unserer eigenen Engine — derselben, die jedes personalisierte Poster erstellt. So stehen die Planeten jetzt wirklich:', factsNote: 'Stände berechnet für', cta: 'Dein eigenes Chart, als Kunstwerk', outro: '[ENTWURF: redaktionelle Deutung wird vor der Freigabe ergänzt]' },
  fr: { eyebrow: 'Cosmic Pulse', title: `Le ciel cette semaine — ${stamp}`, intro: 'Calculé en direct par notre propre moteur — celui qui compose chaque poster personnalisé. Voici la position réelle des planètes :', factsNote: 'Positions calculées pour', cta: 'Votre thème, en œuvre d’art', outro: '[BROUILLON : interprétation éditoriale à ajouter avant validation]' },
  es: { eyebrow: 'Cosmic Pulse', title: `El cielo esta semana — ${stamp}`, intro: 'Calculado en vivo por nuestro propio motor — el mismo que compone cada póster personalizado. Así están los planetas ahora mismo:', factsNote: 'Posiciones calculadas para', cta: 'Tu propia carta, como obra de arte', outro: '[BORRADOR: interpretación editorial pendiente de aprobación]' },
}

mkdirSync('docs/newsletter-drafts', { recursive: true })
for (const lang of ['en', 'de', 'fr', 'es']) {
  const c = COPY[lang]
  const rows = Object.entries(PLANETS).map(([key, names]) => {
    const p = transit.planets?.[key]
    if (!p) return null
    const deg = (p.longitude % 30).toFixed(1)
    const retro = p.speed < 0 ? ` · ${RETRO[lang]}` : ''
    return [names[lang], `${SIGNS[p.sign]?.[lang] ?? p.sign} ${deg}°${retro}`]
  }).filter(Boolean)

  const html = renderNewsletterHtml({
    lang,
    subject: c.title,
    preheader: c.intro.slice(0, 90),
    eyebrow: c.eyebrow,
    title: c.title,
    blocks: [
      { type: 'text', text: c.intro },
      { type: 'facts', rows },
      { type: 'text', text: `${c.factsNote} ${transit.computed_at} (UTC).` },
      { type: 'divider' },
      { type: 'text', text: c.outro },
      { type: 'cta', text: c.cta, href: 'https://sizhuatelier-shop-production.up.railway.app/personalize' },
    ],
  })
  const file = `docs/newsletter-drafts/${stamp}-cosmic-${lang}.html`
  writeFileSync(file, html)
  console.log(`Entwurf: ${file}`)
}
console.log('\nFertig — Entwürfe prüfen, dann: node scripts/newsletter/send-test.mjs <datei> <deine@mail>')
