// Cosmic-Pulse-FUSION-Generator (Operator 2026-07-17: BaZi + Western, weil
// der Shop beide Chart-Welten anbietet).
//
// Zieht ECHTE Daten aus der eigenen FuFirE-Engine:
//   - BaZi:    POST /v1/calculate/bazi mit dem HEUTIGEN Tag (12:00, Referenz
//              Berlin, TLST/midnight — dieselbe pinned Konvention wie der Shop)
//   - Western: GET  /v1/transit/now (Swiss Ephemeris Planetenstände)
//
// Ausgabe: <datum>-cosmic.content.json (EDITIERBARE Inhaltsdatei — Oberfläche:
// scripts/newsletter/edit.mjs) + 4 gerenderte Sprach-HTMLs via render-cosmic.
// EHRLICHKEIT: nur belegbare Fakten + neutraler Rahmentext; Deutung trägt
// [ENTWURF]-Markierung, bis sie redaktionell ersetzt ist (Freigabe-Schleife).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { renderCosmicEdition } from './render-cosmic.mjs'
import { localizeElement, localizeAnimal } from '../../src/designs/posterLocale.mjs'

const envFile = (() => { try { return readFileSync(new URL('../../.env', import.meta.url), 'utf8') } catch { return '' } })()
const envOf = (k) => process.env[k] || (envFile.match(new RegExp(`^${k}=(.+)$`, 'm')) || [])[1]?.trim()
const API = envOf('FUFIRE_API_URL')
const KEY = envOf('FUFIRE_API_KEY')
if (!API || !KEY) { console.error('FUFIRE_API_URL/KEY fehlen'); process.exit(2) }
const HEADERS = { 'X-API-Key': KEY, 'Content-Type': 'application/json' }

// ── Western: Planetenstände jetzt ────────────────────────────────────────────
const tRes = await fetch(`${API}/v1/transit/now`, { headers: HEADERS })
if (!tRes.ok) { console.error(`transit/now → ${tRes.status}`); process.exit(1) }
const transit = await tRes.json()
const stamp = transit.computed_at?.slice(0, 10)
if (!stamp) { console.error('transit/now ohne computed_at'); process.exit(1) }

// ── BaZi: die Säulen des heutigen Tages (Referenz Berlin 12:00) ──────────────
const bRes = await fetch(`${API}/v1/calculate/bazi`, {
  method: 'POST',
  headers: HEADERS,
  body: JSON.stringify({
    date: `${stamp}T12:00`, tz: 'Europe/Berlin', lon: 13.405, lat: 52.52,
    standard: 'TLST', boundary: 'midnight', birth_time_known: true, include_trace: false,
  }),
})
if (!bRes.ok) { console.error(`calculate/bazi → ${bRes.status}`); process.exit(1) }
const bazi = await bRes.json()

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
const PILLAR_LABEL = {
  year: { en: 'Year pillar', de: 'Jahressäule', fr: 'Pilier de l’année', es: 'Pilar del año' },
  month: { en: 'Month pillar', de: 'Monatssäule', fr: 'Pilier du mois', es: 'Pilar del mes' },
  day: { en: 'Day pillar', de: 'Tagessäule', fr: 'Pilier du jour', es: 'Pilar del día' },
}

// BaZi-Zeilen je Sprache: „Jahressäule → Feuer · Pferd" (lokalisiert über die
// geteilten posterLocale-Tabellen — dieselbe Quelle wie Poster & Druck).
const baziRows = {}
const westernRows = {}
for (const lang of ['en', 'de', 'fr', 'es']) {
  const LC = lang.toUpperCase()
  baziRows[lang] = ['year', 'month', 'day'].map((k) => {
    const p = bazi.pillars?.[k]
    return [PILLAR_LABEL[k][lang], `${localizeElement(p?.element ?? '', LC)} · ${localizeAnimal(p?.tier ?? '', LC)}`]
  })
  westernRows[lang] = Object.entries(PLANETS).map(([key, names]) => {
    const p = transit.planets?.[key]
    if (!p) return null
    const deg = (p.longitude % 30).toFixed(1)
    const retro = p.speed < 0 ? ` · ${RETRO[lang]}` : ''
    return [names[lang], `${SIGNS[p.sign]?.[lang] ?? p.sign} ${deg}°${retro}`]
  }).filter(Boolean)
}

// Operator 2026-07-17: die Serie heißt TAGESIMPULS — die Fusion-Deutung
// (interpretation) IST der Impuls und steht im Layout ganz oben. Der
// Platzhalter wird je Ausgabe durch den redaktionellen Impuls ersetzt
// (Claude-Lauf /newsletter-cosmic oder Editor) — kurz, einfangend, nur aus
// den berechneten Fakten abgeleitet.
const COPY = {
  en: { subject: `Cosmic Pulse — your impulse for today, ${stamp}`, title: `Your impulse for today — ${stamp}`, intro: 'BaZi and the Western sky, fused into one daily reading — computed live by the same engine that composes your poster.', interpretation: '[DRAFT: today’s fusion impulse to be added before approval]', ctaText: 'Your own chart, as art' },
  de: { subject: `Cosmic Pulse — dein Tagesimpuls, ${stamp}`, title: `Dein Tagesimpuls — ${stamp}`, intro: 'BaZi und der westliche Himmel, fusioniert zu einer täglichen Lesung — live berechnet von derselben Engine, die auch dein Poster komponiert.', interpretation: '[ENTWURF: der heutige Fusions-Impuls wird vor der Freigabe ergänzt]', ctaText: 'Dein eigenes Chart, als Kunstwerk' },
  fr: { subject: `Cosmic Pulse — votre impulsion du jour, ${stamp}`, title: `Votre impulsion du jour — ${stamp}`, intro: 'Le BaZi et le ciel occidental, fusionnés en une lecture quotidienne — calculée en direct par le moteur qui compose votre poster.', interpretation: '[BROUILLON : l’impulsion fusion du jour sera ajoutée avant validation]', ctaText: 'Votre thème, en œuvre d’art' },
  es: { subject: `Cosmic Pulse — tu impulso de hoy, ${stamp}`, title: `Tu impulso de hoy — ${stamp}`, intro: 'El BaZi y el cielo occidental, fusionados en una lectura diaria — calculada en vivo por el mismo motor que compone tu póster.', interpretation: '[BORRADOR: el impulso de fusión de hoy se añadirá antes de la aprobación]', ctaText: 'Tu propia carta, como obra de arte' },
}

const content = {
  kind: 'cosmic-fusion',
  date: stamp,
  computedAt: transit.computed_at,
  ctaHref: 'https://sizhuatelier-shop-production.up.railway.app/personalize',
  bazi: { raw: bazi.pillars, rows: baziRows },
  western: { rows: westernRows },
  editions: Object.fromEntries(['en', 'de', 'fr', 'es'].map((l) => [l, { eyebrow: 'Cosmic Pulse', ...COPY[l] }])),
}

mkdirSync('docs/newsletter-drafts', { recursive: true })
const contentPath = `docs/newsletter-drafts/${stamp}-cosmic.content.json`
writeFileSync(contentPath, JSON.stringify(content, null, 2))
console.log(`Inhaltsdatei: ${contentPath}`)
for (const f of renderCosmicEdition(contentPath)) console.log(`Entwurf: ${f}`)
console.log('\nManuell eingreifen: node scripts/newsletter/edit.mjs  →  http://localhost:3220')
console.log(`Testmail: node scripts/newsletter/send-test.mjs docs/newsletter-drafts/${stamp}-cosmic-de.html <deine@mail>`)
