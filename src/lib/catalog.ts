// Catalog + content data — ported 1:1 from the dc-runtime prototype.
// PLACEHOLDER data; real product/price/review sources are wired later.
import { computeChart, type PosterData } from './bazi'
import { euro } from './format'
import { FREE_SHIP_THRESHOLD } from './tokens'

export interface Product {
  id: number
  category: string
  title: string
  price: number
  anchor?: number
  rating: number
  reviews: number
  sold: number
  bullets: string[]
  poster: PosterData
  /** false = NOT personalizable (Fire Horse, TCM educational posters): no birth
   *  data, plain Add to Cart. Default (undefined) = personalizable. */
  personalizable?: boolean
  /** Static product image, used instead of the rendered BaZi poster (TCM SKUs). */
  image?: string
  /** Use case for non-personalizable TCM posters: educational/practice/wellness/yoga. */
  usage?: string
}

const mk = (frame: string, bg: string, name: string, date: string): PosterData => {
  const c = computeChart(date)
  return { frame, bg, name, element: c.element, animal: c.animal, pillars: c.pillars }
}

export const products: Product[] = [
  {
    id: 1, category: 'TCM', title: 'BaZi Geburtschart — Vier Säulen', price: 49, anchor: 59, rating: 4.9, reviews: 318, sold: 2140,
    bullets: ['Aus deinen Geburtsdaten berechnet — kein Standardmotiv', 'Feinkörniger Naturpapier-Druck, säurefrei & lichtecht', 'Massivholzrahmen mit entspiegeltem Glas', 'Produktion in 3 Werktagen, nummeriert'],
    poster: mk('#B98A5E', '#E9DFCB', 'Mara Lindqvist', '1990-07-21'),
  },
  {
    id: 2, category: 'Praxen', title: 'BaZi Praxis-Edition', price: 69, anchor: 79, rating: 4.8, reviews: 196, sold: 870,
    bullets: ['Ruhiges Indigo für Behandlungs- & Wartebereiche', 'Großformat mit klarer Fernwirkung', 'Abwischbares Museumsglas, hygienefreundlich', 'Optional mit Praxisname statt Personenname'],
    poster: mk('#1B1B1B', '#2C3A57', 'Praxis Anand', '1985-03-09'),
  },
  {
    id: 3, category: 'Wellness', title: 'BaZi Elemente-Poster', price: 45, anchor: 55, rating: 4.9, reviews: 241, sold: 1320,
    bullets: ['Warmes Salbeigrün — beruhigend für Ruheräume', 'Betont die Fünf-Elemente-Balance', 'Nachhaltiges Recyclingpapier, FSC-zertifiziert', 'Auch als Gutschein-Geschenk beliebt'],
    poster: mk('#B98A5E', '#AFBCA6', 'Lina Sommer', '1992-11-02'),
  },
  {
    id: 4, category: 'Yoga', title: 'BaZi Yoga-Flow Chart', price: 39, anchor: 49, rating: 4.7, reviews: 158, sold: 990,
    bullets: ['Erdiges Terracotta — passt zu Holz & Pflanzen', 'Kompaktes Format für Studio-Wände', 'Leichter Rahmen, einfache Wandmontage', 'Set-Rabatt für mehrere Studio-Räume'],
    poster: mk('#B98A5E', '#BC7A5E', 'Yara Khan', '1994-05-18'),
  },
  {
    id: 5, category: 'Wellness', title: 'BaZi Mond & Sterne', price: 52, rating: 4.9, reviews: 134, sold: 640,
    bullets: ['Tiefes Anthrazit für eine elegante, ruhige Wirkung', 'Premium-Schwarzrahmen, matt', 'Goldfarbene Akzentschrift optional', 'Hochwertiges Geschenk zum Jahreswechsel'],
    poster: mk('#1B1B1B', '#2A2A2C', 'Noah Berger', '1988-12-30'),
  },
  {
    id: 6, category: 'TCM', title: 'BaZi Minimal', price: 42, anchor: 52, rating: 4.8, reviews: 205, sold: 1510,
    bullets: ['Reduziertes Sandstein — zurückhaltend & zeitlos', 'Schwarzer Rahmen, klare Linie', 'Passt in jede Praxis- und Wohnumgebung', 'Bestseller für Erstbesteller'],
    poster: mk('#1B1B1B', '#E9DFCB', 'Sofia Reuter', '1991-09-14'),
  },
  {
    id: 7, category: 'Wuxing', title: 'Wuxing Fünf-Elemente Poster', price: 49, anchor: 59, rating: 4.8, reviews: 142, sold: 760,
    bullets: ['Holz, Feuer, Erde, Metall, Wasser im Gleichgewicht', 'Ruhiges Salbeigrün, beruhigend für jeden Raum', 'Lehrreich für Praxis & Zuhause', 'Archiv-Pigmentdruck in Museumsqualität'],
    poster: mk('#B98A5E', '#AFBCA6', 'Fünf Elemente', '1990-03-21'),
  },
  {
    id: 8, category: 'Feuerpferd', title: 'Feuerpferd 2026 · Limited Edition', price: 65, anchor: 79, rating: 4.9, reviews: 88, sold: 210,
    bullets: ['Limitierte Edition zum Jahr des Feuer-Pferds 2026', 'Kraftvolles Terracotta, nummeriert & signiert', 'Sammlerstück mit Charakter', 'Solange der Vorrat reicht'],
    poster: mk('#1B1B1B', '#BC7A5E', 'Feuer-Pferd', '2026-02-17'),
    personalizable: false, image: '/images/posters/fire-horse.jpg',
  },
  // ── TCM educational lehrposter — non-personalizable, placeholder SKUs (replace
  //    images/prices/copy before launch). No birth data; plain Add to Cart. ──
  {
    id: 11, category: 'TCM', title: 'TCM Five Elements — Educational', price: 39, rating: 4.9, reviews: 0, sold: 0,
    bullets: [], personalizable: false, usage: 'educational', image: '/images/posters/tcm-elements.jpg',
    poster: mk('#1B1B1B', '#AFBCA6', 'TCM', '1990-01-01'),
  },
  {
    id: 12, category: 'Praxen', title: 'TCM Practice Poster', price: 49, rating: 4.9, reviews: 0, sold: 0,
    bullets: [], personalizable: false, usage: 'practice', image: '/images/categories/tcm.jpg',
    poster: mk('#1B1B1B', '#2C3A57', 'TCM', '1990-01-01'),
  },
  {
    id: 13, category: 'Wellness', title: 'TCM Wellness Poster', price: 45, rating: 4.9, reviews: 0, sold: 0,
    bullets: [], personalizable: false, usage: 'wellness', image: '/images/posters/tcm-elements.jpg',
    poster: mk('#1B1B1B', '#AFBCA6', 'TCM', '1990-01-01'),
  },
  {
    id: 14, category: 'Yoga', title: 'TCM Yoga Studio Poster', price: 45, rating: 4.9, reviews: 0, sold: 0,
    bullets: [], personalizable: false, usage: 'yoga', image: '/images/categories/tcm.jpg',
    poster: mk('#1B1B1B', '#BC7A5E', 'TCM', '1990-01-01'),
  },
]

// Featured lines shown in the slimmed "Die Kollektion" (Aufgabe 5).
export const featuredIds = [1, 7, 8]

export const categories = ['Alle', 'TCM', 'Praxen', 'Wellness', 'Yoga']

// Digital product (PDF) — standalone, not a poster; surfaced on /digital and
// as a bundle. Placeholder pricing/copy.
export const digitalProduct = {
  id: 'digital-bazi',
  title: 'Digitale BaZi-Chart-Analyse',
  subtitle: '10–15 Seiten PDF',
  price: 39,
  description: [
    'Eine persönliche, ausführliche PDF-Auswertung deines BaZi-Charts: die vier Säulen, dein Tagesmeister, die Balance der fünf Elemente und was sie für dich bedeuten.',
    'Sofort nach Fertigstellung als Download — einzeln oder vergünstigt im Bundle mit einem Poster.',
  ],
}

export function getProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}

export interface Bundle {
  id: string
  title: string
  sub: string
  price: number
  anchor: number
  p1: PosterData
  p2: PosterData
  p3: PosterData
}

export const bundles: Bundle[] = [
  { id: 'b1', title: 'Praxis Starter-Set', sub: '3 Poster für Behandlung, Empfang & Wartebereich', price: 129, anchor: 177, p1: products[1].poster, p2: products[0].poster, p3: products[5].poster },
  { id: 'b2', title: 'Wellness Trio', sub: 'Stimmige Ruhe für Studio, Flur & Ruheraum', price: 119, anchor: 147, p1: products[2].poster, p2: products[3].poster, p3: products[4].poster },
]

// Poster + digital PDF analysis combo (Aufgabe 6) — consistent with /digital.
export const digitalBundle = {
  id: 'b-digital',
  title: 'BaZi Poster + Digitalanalyse',
  sub: 'Dein personalisiertes Poster plus die 10–15-seitige PDF-Auswertung deines Charts.',
  price: 79,
  anchor: 88,
  poster: products[0].poster,
}

export interface Addon {
  id: string
  icon: string
  title: string
  note: string
  price: number
}

export const addons: Addon[] = [
  { id: 'a1', icon: '▢', title: 'Premium Passepartout', note: 'Säurefreier Museumskarton', price: 9 },
  { id: 'a2', icon: '✿', title: 'Geschenkverpackung', note: 'Recycelt, mit Banderole', price: 6 },
  { id: 'a3', icon: '⚒', title: 'Aufhänge-Set', note: 'Inkl. Nagel & Wasserwaage', price: 7 },
  { id: 'a4', icon: '◇', title: 'Glas-Pflegetuch', note: 'Mikrofaser, wiederverwendbar', price: 5 },
]

export interface Article {
  id: string
  tag: string
  title: string
  meta: string
  excerpt: string
  body: string[]
}

export const articles: Article[] = [
  {
    id: 'r1', tag: 'Grundlagen', title: 'Was ist BaZi? Die vier Säulen des Schicksals', meta: '6 Min. Lesezeit · Atelier-Journal',
    excerpt: 'Jahr, Monat, Tag und Stunde deiner Geburt ergeben vier „Säulen" — die Landkarte deiner Energie.',
    body: [
      'BaZi (chinesisch 八字, „acht Zeichen") liest deinen Geburtszeitpunkt als vier Säulen: Jahr, Monat, Tag und Stunde. Jede Säule trägt einen Himmelsstamm und einen Erdzweig — zusammen acht Zeichen, die deine Konstitution beschreiben.',
      'Die Tagessäule gilt als dein Kern, das „Tagesmeister"-Zeichen. Von ihm aus betrachtet man, wie die übrigen Säulen stützen oder fordern. So entsteht ein Bild von Stärken, Mustern und günstigen Zeitfenstern — keine Wahrsagerei, sondern ein Werkzeug zur Selbstreflexion.',
      'Auf deinem Poster halten wir genau diese acht Zeichen fest: ein ruhiges, persönliches Diagramm, das Gespräche in Praxis und Studio eröffnet und zuhause ein stiller Begleiter ist.',
    ],
  },
  {
    id: 'r2', tag: 'Theorie', title: 'Die fünf Elemente und ihre Balance', meta: '5 Min. Lesezeit · Atelier-Journal',
    excerpt: 'Holz, Feuer, Erde, Metall, Wasser — wie ihr Zusammenspiel deine Säulen färbt.',
    body: [
      'Jedes der acht Zeichen gehört zu einem der fünf Elemente. Sie nähren und kontrollieren einander in einem Kreislauf: Holz nährt Feuer, Feuer schafft Erde, Erde trägt Metall, Metall sammelt Wasser, Wasser nährt Holz.',
      'Ein BaZi-Chart zeigt, welche Elemente reichlich vorhanden sind und welche fehlen. Diese Balance ist der Kern vieler TCM- und Wellness-Beratungen — von Ernährung bis Raumgestaltung.',
      'Die fünf Hintergrundfarben unserer Poster greifen diese Sprache auf: Sandstein für Erde, Salbei für Holz, Terracotta für Feuer, Indigo für Wasser, Anthrazit für Metall.',
    ],
  },
  {
    id: 'r3', tag: 'Für die Praxis', title: 'BaZi in der TCM-Praxis: Raum & Wirkung', meta: '4 Min. Lesezeit · Atelier-Journal',
    excerpt: 'Wie ein persönliches Chart Vertrauen schafft und Behandlungsräume erdet.',
    body: [
      'Ein an der Wand sichtbares BaZi-Poster signalisiert Tiefe: Es zeigt Klient:innen, dass hier mit Tradition und Sorgfalt gearbeitet wird. Das senkt die Einstiegshürde für ein Gespräch.',
      'In Behandlungsräumen wirken ruhige Töne wie Indigo oder Salbei nachweislich beruhigend. Ein großes Format mit klarer Fernwirkung erdet den Raum, ohne ihn zu überladen.',
      'Viele Praxen bieten personalisierte Charts als Geschenk oder Zusatzleistung an — ein hochwertiges, sinnstiftendes Mitbringsel, das die Bindung zur Praxis stärkt.',
    ],
  },
]

export interface ComingSoonItem {
  id: string
  title: string
  desc: string
}

export const comingSoon: ComingSoonItem[] = []

export interface FaqDef {
  id: string
  q: string
  a: string
}

// Full shop FAQ (Aufgabe 8) — home FAQ section. Item 10 is a marked placeholder.
export interface ShopFaq {
  q: string
  a: string
  placeholder?: boolean
}
export const shopFaqs: ShopFaq[] = [
  { q: 'Wie wird mein BaZi-Poster berechnet?', a: 'Aus Geburtsdatum, -zeit und -ort werden die vier Säulen (Jahr, Monat, Tag, Stunde) berechnet und gestalterisch aufs Poster gebracht.' },
  { q: 'Welche Daten brauche ich für die Bestellung?', a: 'Geburtsdatum, möglichst genaue Geburtszeit und Geburtsort. Optional ein Name fürs Poster.' },
  { q: 'Ich kenne meine genaue Geburtszeit nicht — geht das trotzdem?', a: 'Ja. Ohne exakte Zeit kann die Stunden-Säule abweichen; gib an, was du weißt, wir wählen eine sinnvolle Annäherung.' },
  { q: 'Wie lange dauern Produktion und Versand?', a: 'Auftragsfertigung plus 5–7 Werktage Versand, weltweit. Kostenloser Versand ab 80 €.' },
  { q: 'Welche Formate, Rahmen und Farben gibt es?', a: 'Mehrere Formate, Rahmenfarben und Hintergrund-Paletten; alles im Konfigurator wählbar mit Live-Vorschau.' },
  { q: 'Auf welchem Papier wird gedruckt?', a: 'Archiv-Pigmentdruck in Museumsqualität, gefertigt in Deutschland.' },
  { q: 'Kann ich mein Poster vor dem Kauf sehen?', a: 'Ja, der Konfigurator zeigt eine Live-Vorschau mit deinen Daten, Rahmen und Hintergrund.' },
  { q: 'Was ist die digitale BaZi-Chart-Analyse?', a: 'Eine persönliche 10–15-seitige PDF-Auswertung deines Charts, einzeln oder als Bundle erhältlich.' },
  { q: 'Wie sicher ist die Zahlung?', a: 'Verschlüsselte Bezahlung über PayPal, Apple Pay und Google Pay.' },
  { q: 'Rückgabe & Umtausch?', a: 'PLATZHALTER — an eure tatsächliche Rückgabe-/Widerrufsrichtlinie anpassen; personalisierte Artikel sind ggf. vom Widerruf ausgenommen.', placeholder: true },
]

export const faqDefs: FaqDef[] = [
  { id: 'details', q: 'Details & Material', a: 'Feinkörniger Fine-Art-Druck auf 250 g/m² säurefreiem Naturpapier, lichtecht über Jahrzehnte. Massivholzrahmen mit entspiegeltem Echtglas. Jedes Poster wird im Atelier nummeriert.' },
  { id: 'size', q: 'Größenberater', a: 'A3 (30×42 cm) für Nischen & Regale, A2 (42×59 cm) als vielseitiger Standard für Praxiswände, A1 (59×84 cm) für große Fernwirkung im Empfangs- oder Wartebereich.' },
  { id: 'ship', q: 'Versand & Produktion', a: 'Produktion in 3 Werktagen, anschließend klimaneutraler Versand (DE 1–2 Tage). Kostenloser Versand ab ' + euro(FREE_SHIP_THRESHOLD) + '. Personalisierte Artikel werden auf Bestellung gefertigt — siehe Rückgaberichtlinie.' },
  { id: 'bazi', q: 'Über deine Berechnung', a: 'Aus Datum, Uhrzeit und Ort berechnen wir deine vier Säulen mit Himmelsstämmen und Erdzweigen. Ohne Geburtszeit erstellen wir eine Tages-Näherung — die Uhrzeit präzisiert die Stundensäule.' },
]
