// Angebots-Newsletter mit WOCHENROTATION (Operator 2026-07-18: „jede Woche
// muss ein Angebot aus dem Shop als Newsletter versendet werden").
//
// Rotation: ISO-Kalenderwoche % Angebotsliste — deterministisch, jede Woche
// ein anderes Shop-Produkt. EHRLICHKEIT: die Preise kommen aus
// server/pricing.js (der verbindlichen Server-Preisquelle) — nie hier
// erfunden; die Texte sind editierbar (edit.mjs), der Versand bleibt manuell
// freigegeben.
//
// Aufruf: node scripts/newsletter/generate-offer.mjs  [ISO-Woche optional]
import { writeFileSync, mkdirSync } from 'node:fs'
import { priceLineItemCents } from '../../server/pricing.js'
import { renderOfferEdition } from './render-offer.mjs'

const SHOP = 'https://sizhuatelier-shop-production.up.railway.app'

// Kuratierte Rotationsliste — echte Shop-SKUs. priceRef = (productId, variantId)
// für die verbindliche Server-Bepreisung.
const OFFERS = [
  {
    key: 'bazi-poster', priceRef: ['ptype:bazi', 'size=50x70'], href: `${SHOP}/personalize`,
    title: { en: 'Personalized BaZi Poster', de: 'Personalisiertes BaZi-Poster', fr: 'Poster BaZi personnalisé', es: 'Póster BaZi personalizado' },
    subtitle: { en: 'Your Four Pillars, computed live · 50×70, wood framed', de: 'Deine Vier Säulen, live berechnet · 50×70, Holzrahmen', fr: 'Vos Quatre Piliers, calculés en direct · 50×70, cadre bois', es: 'Tus Cuatro Pilares, calculados en vivo · 50×70, marco de madera' },
  },
  {
    key: 'couple-poster', priceRef: ['ptype:couple', 'size=50x70'], href: `${SHOP}/personalize?type=couple`,
    title: { en: 'Couple Compatibility Poster', de: 'Paar-Kompatibilitäts-Poster', fr: 'Poster de compatibilité de couple', es: 'Póster de compatibilidad de pareja' },
    subtitle: { en: 'Two charts, one artwork (合婚) · 50×70, wood framed', de: 'Zwei Charts, ein Kunstwerk (合婚) · 50×70, Holzrahmen', fr: 'Deux thèmes, une œuvre (合婚) · 50×70, cadre bois', es: 'Dos cartas, una obra (合婚) · 50×70, marco de madera' },
  },
  {
    key: 'birthchart-poster', priceRef: ['ptype:birthchart', 'size=50x70'], href: `${SHOP}/personalize?type=birthchart`,
    title: { en: 'Western Birth Chart Poster', de: 'Westliches Geburtshoroskop-Poster', fr: 'Poster de thème astral occidental', es: 'Póster de carta natal occidental' },
    subtitle: { en: 'Sun, Moon & Ascendant, Swiss Ephemeris · 50×70', de: 'Sonne, Mond & Aszendent, Swiss Ephemeris · 50×70', fr: 'Soleil, Lune & Ascendant, Swiss Ephemeris · 50×70', es: 'Sol, Luna y Ascendente, Swiss Ephemeris · 50×70' },
  },
  {
    key: 'premium-analysis', priceRef: ['ptype:digital', ''], href: `${SHOP}/digital`,
    title: { en: 'Premium BaZi Deep-Dive Analysis', de: 'Premium-BaZi-Tiefenanalyse', fr: 'Analyse BaZi premium approfondie', es: 'Análisis BaZi premium en profundidad' },
    subtitle: { en: 'Dayun life phases & Five-Element balance, personal PDF', de: 'Dayun-Lebensphasen & Fünf-Elemente-Balance, persönliche PDF', fr: 'Phases Dayun & équilibre des Cinq Éléments, PDF personnel', es: 'Fases Dayun y equilibrio de los Cinco Elementos, PDF personal' },
  },
  {
    key: 'fire-horse', priceRef: ['poster:8', ''], href: `${SHOP}/product/8`, image: `${SHOP}/images/posters/fire-horse.webp`,
    title: { en: 'Fire Horse 2026 · Limited Edition', de: 'Feuerpferd 2026 · Limited Edition', fr: 'Cheval de Feu 2026 · Édition limitée', es: 'Caballo de Fuego 2026 · Edición limitada' },
    subtitle: { en: 'Numbered collector’s piece for the year 丙午', de: 'Nummeriertes Sammlerstück zum Jahr 丙午', fr: 'Pièce de collection numérotée pour l’année 丙午', es: 'Pieza de coleccionista numerada del año 丙午' },
  },
  {
    key: 'tcm-elements', priceRef: ['poster:11', ''], href: `${SHOP}/product/11`, image: `${SHOP}/images/posters/tcm-elements.webp`,
    title: { en: 'TCM Five Elements — Educational Poster', de: 'TCM Fünf Elemente — Lehrposter', fr: 'MTC Cinq Éléments — poster pédagogique', es: 'MTC Cinco Elementos — póster educativo' },
    subtitle: { en: 'For practices, studios & teaching', de: 'Für Praxen, Studios & Lehre', fr: 'Pour cabinets, studios & enseignement', es: 'Para consultas, estudios y enseñanza' },
  },
]

function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
}

const week = Number(process.argv[2]) || isoWeek()
const offer = OFFERS[week % OFFERS.length]
const cents = priceLineItemCents(...offer.priceRef)
if (!Number.isFinite(cents)) { console.error(`Preis nicht auflösbar für ${offer.key}`); process.exit(1) }
const priceDisplay = `${(cents / 100).toFixed(2).replace('.', ',')} €`
const stamp = new Date().toISOString().slice(0, 10)

const COPY = {
  en: { subject: `This week at the atelier: ${offer.title.en}`, title: 'The offer of the week', intro: 'Hand-picked from the atelier — one piece, one week.', interpretation: '[DRAFT: short editorial note on why this piece, to be added before approval]', ctaText: 'View in the shop' },
  de: { subject: `Diese Woche im Atelier: ${offer.title.de}`, title: 'Das Angebot der Woche', intro: 'Handverlesen aus dem Atelier — ein Stück, eine Woche.', interpretation: '[ENTWURF: kurze redaktionelle Notiz, warum dieses Stück — vor Freigabe ergänzen]', ctaText: 'Im Shop ansehen' },
  fr: { subject: `Cette semaine à l’atelier : ${offer.title.fr}`, title: 'L’offre de la semaine', intro: 'Sélectionné à l’atelier — une pièce, une semaine.', interpretation: '[BROUILLON : brève note éditoriale à ajouter avant validation]', ctaText: 'Voir dans la boutique' },
  es: { subject: `Esta semana en el atelier: ${offer.title.es}`, title: 'La oferta de la semana', intro: 'Seleccionado en el atelier — una pieza, una semana.', interpretation: '[BORRADOR: breve nota editorial pendiente de aprobación]', ctaText: 'Ver en la tienda' },
}

const content = {
  kind: 'offer',
  date: stamp,
  week,
  offer: { ...offer, priceDisplay },
  editions: Object.fromEntries(['en', 'de', 'fr', 'es'].map((l) => [l, { eyebrow: 'Atelier', ...COPY[l] }])),
}

mkdirSync('docs/newsletter-drafts', { recursive: true })
const contentPath = `docs/newsletter-drafts/${stamp}-offer.content.json`
writeFileSync(contentPath, JSON.stringify(content, null, 2))
console.log(`KW ${week} → Angebot: ${offer.key} (${priceDisplay})`)
console.log(`Inhaltsdatei: ${contentPath}`)
for (const f of renderOfferEdition(contentPath)) console.log(`Entwurf: ${f}`)
