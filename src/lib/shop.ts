export type PosterVariant = 'bazi' | 'saju' | 'compatibility' | 'wuxing'

export interface ShopProduct {
  id: string
  title: string
  label: string
  description: string
  longDescription: string[]
  priceFrom: number
  priceLabel: string
  currency: string
  symbol: string
  badge?: string
  badgeTone?: 'red' | 'green' | 'gold'
  background: string
  posterVariant: PosterVariant
  status?: 'available' | 'coming-soon'
  featured?: boolean
  personalize?: boolean
  /* ── storefront / conversion fields ───────────────────────────── */
  category: string
  image: string
  /** Second image shown on hover in the category grid (lifestyle/detail shot). */
  hoverImage?: string
  /** Product-page gallery (first image is the hero). Falls back to [image]. */
  gallery?: string[]
  /** Short, scannable key benefits shown high on the product page. */
  bullets?: string[]
  /**
   * Social proof. PLACEHOLDER values — replace with real review data before
   * launch. Do not display invented ratings in production.
   */
  rating?: number
  reviewCount?: number
  /**
   * Strike-through reference price. PLACEHOLDER — under German PAngV a struck
   * price must reference a genuine prior price. Replace or remove before launch.
   */
  compareAtPrice?: number
  /** Longer "Details" accordion copy; falls back to longDescription. */
  details?: string[]
  /** Related product ids surfaced as cross-sell ("oft zusammen gekauft"). */
  crossSell?: string[]
}

export interface ProductOption {
  id: string
  label: string
  price?: number
  swatch?: string
}

/* ── commerce constants ───────────────────────────────────────────── */
/** Free shipping at/above this cart subtotal (€). */
export const FREE_SHIPPING_THRESHOLD = 50
/** Flat shipping cost below the free-shipping threshold (€). */
export const SHIPPING_COST = 4.9

export const posterSizes: ProductOption[] = [
  { id: 'a4', label: 'A4 · € 49', price: 49 },
  { id: 'a3', label: 'A3 · € 69', price: 69 },
  { id: '50x70', label: '50×70 · € 99', price: 99 },
]

// 2 frame colours + "no frame" (per brief: "2 Rahmenfarben").
export const frameOptions: ProductOption[] = [
  { id: 'none', label: 'Ohne Rahmen', price: 0, swatch: 'transparent' },
  { id: 'oak', label: 'Eiche Natur', price: 29, swatch: '#C9A875' },
  { id: 'black', label: 'Schwarz', price: 29, swatch: '#2C2420' },
]

// 5 background colours (per brief: "5 Hintergrundfarben"). Placeholder palette
// in the brand range — rename / recolour as needed.
export const backgroundOptions: ProductOption[] = [
  { id: 'warm-ivory', label: 'Warm Ivory', swatch: '#F8F4EB' },
  { id: 'sage', label: 'Sage Green', swatch: '#E4E8E0' },
  { id: 'soft-rose', label: 'Soft Rose', swatch: '#EDE6E4' },
  { id: 'mist-blue', label: 'Mist Blue', swatch: '#E3E7F0' },
  { id: 'warm-sand', label: 'Warm Sand', swatch: '#E8E1D6' },
]

/** Shared accordion copy — same for every poster unless overridden. */
export const productMaterial =
  'Premium-Naturpapier, 200 g/m², matt. Archival-Pigmentdruck — UV-beständig und alterungsresistent. Handveredelt und kontrolliert im Atelier.'

export const productSizeGuide = [
  'A4 — 21 × 29,7 cm: ideal für Galeriewände, Regale und kleine Nischen.',
  'A3 — 29,7 × 42 cm: die beliebteste Größe, wirkt über Sideboards und Schreibtischen.',
  '50 × 70 cm — Statement-Format über Sofa, Bett oder im Praxis-Wartebereich.',
]

export const productShipping = [
  `Kostenloser Versand ab € ${FREE_SHIPPING_THRESHOLD},00 — darunter € ${SHIPPING_COST.toFixed(2).replace('.', ',')}.`,
  'Lieferzeit: 3–5 Werktage nach Freigabe deines Designs (personalisierte Poster nach Berechnung).',
  'Klimaneutraler Versand, plastikfreie Verpackung. Weltweiter Versand verfügbar.',
]

export const shopProducts: ShopProduct[] = [
  {
    id: 'bazi-chart-poster',
    title: 'Personalisiertes BaZi Chart Poster',
    label: 'GEBURT & SELBSTBILD · BAZI · 四柱命理',
    description: 'Vier-Säulen-Chart mit Wuxing Balance, Tagesmeister und ruhiger botanischer Gestaltung.',
    longDescription: [
      'Dein persönlicher Bazi Chart - die vier Säulen deiner Geburt - als hochwertiges Kunstposter im Japandi-Stil. Jedes Poster wird individuell auf Basis deines exakten Geburtsdatums, der Geburtszeit und des Geburtsorts berechnet und handgefertigt gestaltet.',
      'Die vier Säulen zeigen deine Himmelsstämme (天干) und Erdzweige (地支), eingebettet in das System der fünf Elemente Holz, Feuer, Erde, Metall und Wasser.',
    ],
    priceFrom: 49,
    priceLabel: 'ab € 49,00',
    currency: 'EUR',
    symbol: '命',
    badge: 'BESTSELLER',
    badgeTone: 'gold',
    background: '#e7e3d8',
    posterVariant: 'bazi',
    status: 'available',
    featured: true,
    personalize: true,
    category: 'BaZi',
    image: '/images/posters/bazi-personal.jpg',
    hoverImage: '/images/categories/bazi.jpg',
    gallery: ['/images/posters/bazi-personal.jpg', '/images/categories/bazi.jpg', '/images/posters/bazi-child.jpg', '/images/atelier/materials.jpg'],
    bullets: [
      'Individuell aus deinem exakten Geburtsdatum, -zeit & -ort berechnet',
      'Vier Säulen mit Himmelsstämmen, Erdzweigen & Wuxing-Balance',
      'Handveredelt im Atelier · Archival-Pigmentdruck auf Naturpapier',
      'Wähle Größe, Rahmen & Hintergrundfarbe',
    ],
    rating: 4.9,
    reviewCount: 127,
    crossSell: ['tcm-wuxing-praxisposter', 'praxisposter-elementkreis'],
  },
  {
    id: 'tcm-wuxing-praxisposter',
    title: 'TCM & Wuxing Praxisposter',
    label: 'PRAXIS · UNTERRICHT · WUXING',
    description: 'Lehrposter für Praxis, Wellness und Studio: Elemente, Jahreszeiten, Organe und Zyklen.',
    longDescription: [
      'Ein ruhiges Praxisposter für TCM, Akupunktur, Wellnessräume und Behandlungszimmer. Die fünf Elemente werden klar, dekorativ und edukativ aufbereitet.',
      'Gedruckt auf mattem Premium-Naturpapier mit ruhiger Farbführung für professionelle Räume.',
    ],
    priceFrom: 59,
    priceLabel: 'ab € 59,00',
    currency: 'EUR',
    symbol: '氣',
    badge: 'PRAXIS',
    badgeTone: 'green',
    background: '#dfe7dd',
    posterVariant: 'wuxing',
    status: 'available',
    featured: true,
    category: 'TCM & Praxis',
    image: '/images/posters/tcm-elements.jpg',
    hoverImage: '/images/categories/tcm.jpg',
    gallery: ['/images/posters/tcm-elements.jpg', '/images/categories/tcm.jpg', '/images/posters/wuxing-wall.jpg'],
    bullets: [
      'Lehrposter für Praxis, Akupunktur & Wellnessräume',
      'Fünf Elemente, Jahreszeiten, Organe & Zyklen klar dargestellt',
      'Ruhige Farbführung für professionelle Räume',
      'Optional gerahmt · 3 Größen',
    ],
    rating: 4.8,
    reviewCount: 86,
    compareAtPrice: 79,
    crossSell: ['praxisposter-elementkreis', 'yoga-studio-poster'],
  },
  {
    id: 'praxisposter-elementkreis',
    title: 'Praxisposter Elementkreis',
    label: 'TCM · WUXING · BEHANDLUNGSRAUM',
    description: 'Elementkreis, Wandlungsphasen und Zuordnungen als klares Poster für Praxis und Unterricht.',
    longDescription: [
      'Für Therapeut:innen, Coaches und Dozent:innen: ein reduziertes Wuxing Poster mit Elementkreis, Zuordnungen und ruhiger visueller Ordnung.',
      'Ideal für Behandlungszimmer, Seminarräume und Wartebereiche.',
    ],
    priceFrom: 69,
    priceLabel: 'ab € 69,00',
    currency: 'EUR',
    symbol: '五',
    background: '#e3e7f0',
    posterVariant: 'wuxing',
    status: 'available',
    featured: true,
    category: 'TCM & Praxis',
    image: '/images/posters/wuxing-wall.jpg',
    hoverImage: '/images/categories/tcm.jpg',
    gallery: ['/images/posters/wuxing-wall.jpg', '/images/categories/tcm.jpg', '/images/posters/tcm-elements.jpg'],
    bullets: [
      'Elementkreis & Wandlungsphasen klar strukturiert',
      'Reduziert und edukativ — ideal für Unterricht',
      'Für Behandlungszimmer, Seminarräume & Wartebereiche',
      'Optional gerahmt · 3 Größen',
    ],
    rating: 4.8,
    reviewCount: 54,
    crossSell: ['tcm-wuxing-praxisposter', 'yoga-studio-poster'],
  },
  {
    id: 'yoga-studio-poster',
    title: 'Poster für Yoga Studios',
    label: 'YOGA · WELLNESS · STUDIO',
    description: 'Sanfte Elementposter für Yoga-, Breathwork- und Wellness-Studios mit ruhiger Studio-Ästhetik.',
    longDescription: [
      'Ein Studio-Poster für Räume, in denen Ruhe, Balance und Orientierung wichtig sind. Wuxing-Symbolik trifft auf reduzierte Yoga-Studio-Ästhetik.',
      'Wählbar mit Rahmen und Hintergrundfarbe, passend zu hellen, natürlichen Interior-Konzepten.',
    ],
    priceFrom: 59,
    priceLabel: 'ab € 59,00',
    currency: 'EUR',
    symbol: '和',
    badge: 'NEU',
    badgeTone: 'green',
    background: '#e9e1df',
    posterVariant: 'wuxing',
    status: 'available',
    featured: true,
    category: 'Yoga & Studio',
    image: '/images/posters/wuxing-wall.jpg',
    hoverImage: '/images/atelier/workspace.jpg',
    gallery: ['/images/posters/wuxing-wall.jpg', '/images/atelier/workspace.jpg', '/images/categories/tcm.jpg'],
    bullets: [
      'Sanfte Element-Symbolik für Yoga-, Breathwork- & Wellness-Studios',
      'Ruhige Studio-Ästhetik, passt zu hellen Interior-Konzepten',
      'Wählbar mit Rahmen & Hintergrundfarbe',
      'Premium-Naturpapier · 3 Größen',
    ],
    rating: 4.9,
    reviewCount: 41,
    crossSell: ['tcm-wuxing-praxisposter', 'praxisposter-elementkreis'],
  },
  {
    id: 'saju-poster',
    title: 'Personalisiertes Saju Poster',
    label: 'PERSONALISIERT · SAJU',
    description: 'Koreanische Saju Deutung als minimalistisches Fine-Art Poster mit Name und Geburtsdaten.',
    longDescription: [
      'Koreanische Saju-Arbeit als ruhiges Fine-Art Poster für Geburtstag, Meilensteine und Selbstbild.',
      'Diese Personalisierung ist in Vorbereitung. Sichere dir vorab den 25% Early-Access-Vorteil.',
    ],
    priceFrom: 49,
    priceLabel: 'coming soon',
    currency: 'EUR',
    symbol: '柱',
    badge: 'COMING SOON',
    badgeTone: 'gold',
    background: '#e3e7f0',
    posterVariant: 'saju',
    status: 'coming-soon',
    personalize: true,
    category: 'Saju',
    image: '/images/posters/saju-year.jpg',
    hoverImage: '/images/categories/saju.jpg',
    gallery: ['/images/posters/saju-year.jpg', '/images/posters/saju-partner.jpg', '/images/categories/saju.jpg'],
    bullets: [
      'Koreanische Vier-Pfeiler-Deutung als Fine-Art Poster',
      'Personalisiert mit Name & Geburtsdaten',
      'In Vorbereitung — 25% Early-Access sichern',
    ],
    crossSell: ['bazi-chart-poster'],
  },
  {
    id: 'junishi-poster',
    title: 'Personalisiertes Junishi Poster',
    label: 'PERSONALISIERT · JUNISHI',
    description: 'Japanische Tierkreis-Kunst nach zwölf Zeichen, als personalisierte Posterlinie in Vorbereitung.',
    longDescription: [
      'Junishi verbindet die japanische Tierkreis-Tradition mit ruhiger Wandkunst und persönlicher Symbolik.',
      'Diese Personalisierung ist in Vorbereitung. Trage dich ein und sichere dir 25% auf den Start.',
    ],
    priceFrom: 49,
    priceLabel: 'coming soon',
    currency: 'EUR',
    symbol: '卯',
    badge: 'COMING SOON',
    badgeTone: 'gold',
    background: '#e7e3d8',
    posterVariant: 'bazi',
    status: 'coming-soon',
    personalize: true,
    category: 'Junishi',
    image: '/images/posters/junishi-zodiac.jpg',
    hoverImage: '/images/categories/junishi.jpg',
    gallery: ['/images/posters/junishi-zodiac.jpg', '/images/categories/junishi.jpg'],
    bullets: [
      'Japanische Tierkreis-Kunst nach zwölf Zeichen',
      'Personalisiert mit persönlicher Symbolik',
      'In Vorbereitung — 25% Early-Access sichern',
    ],
    crossSell: ['bazi-chart-poster'],
  },
]

export const featuredProducts = shopProducts.filter((product) => product.featured)
export const comingSoonProducts = shopProducts.filter((product) => product.status === 'coming-soon')
export const availableProducts = shopProducts.filter((product) => product.status !== 'coming-soon')

export function getProduct(id: string): ShopProduct | undefined {
  return shopProducts.find((product) => product.id === id)
}

/* ── bundles (AOV) ────────────────────────────────────────────────── */
export interface Bundle {
  id: string
  title: string
  label: string
  description: string
  productIds: string[]
  bundlePrice: number
  image: string
}

export const bundles: Bundle[] = [
  {
    id: 'praxis-set',
    title: 'Praxis-Set: Elemente & Elementkreis',
    label: 'SET · SPARE € 18',
    description: 'Das TCM & Wuxing Praxisposter und der Elementkreis als abgestimmtes Paar für Behandlungsraum und Wartebereich.',
    productIds: ['tcm-wuxing-praxisposter', 'praxisposter-elementkreis'],
    bundlePrice: 110,
    image: '/images/posters/tcm-elements.jpg',
  },
  {
    id: 'studio-set',
    title: 'Studio-Set: Yoga & Elemente',
    label: 'SET · SPARE € 20',
    description: 'Zwei ruhige Elementposter für Studios mit mehreren Räumen — als stimmiges Set zum Vorteilspreis.',
    productIds: ['yoga-studio-poster', 'tcm-wuxing-praxisposter'],
    bundlePrice: 98,
    image: '/images/posters/wuxing-wall.jpg',
  },
]

export interface BlogSection {
  heading?: string
  paragraphs: string[]
}

export interface BlogPost {
  slug: string
  title: string
  category: string
  excerpt: string
  date: string
  readTime: string
  image: string
  body: BlogSection[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'bazi-poster-geburtsdaten',
    title: 'Welche Daten braucht ein BaZi Poster?',
    category: 'BaZi',
    excerpt: 'Geburtsdatum, Uhrzeit und Ort bilden die Grundlage für die vier Säulen und die visuelle Wuxing-Balance.',
    date: '16. Juni 2026',
    readTime: '4 Min.',
    image: '/images/categories/bazi.jpg',
    body: [
      {
        paragraphs: [
          'Ein BaZi Chart („Acht Zeichen") wird aus deinem Geburtsmoment berechnet. Damit die vier Säulen stimmen, brauchen wir drei Angaben: das exakte Geburtsdatum, die Geburtszeit und den Geburtsort.',
        ],
      },
      {
        heading: 'Warum die Uhrzeit so wichtig ist',
        paragraphs: [
          'Die Stunden-Säule wird direkt aus der Geburtszeit abgeleitet. Schon eine Verschiebung von zwei Stunden kann den Stunden-Stamm und damit einen Teil der Deutung verändern.',
          'Steht auf deiner Geburtsurkunde keine genaue Zeit, gestalten wir das Poster auf Wunsch ohne Stunden-Säule oder mit einer von dir angegebenen Schätzung — sag uns einfach im Notizfeld Bescheid.',
        ],
      },
      {
        heading: 'Warum der Geburtsort zählt',
        paragraphs: [
          'Der Ort bestimmt die Zeitzone und die Korrektur zur wahren Ortszeit. Beides fließt in die Berechnung der Säulen ein, damit dein Chart astronomisch korrekt ist.',
        ],
      },
      {
        heading: 'Vom Datum zur Wandkunst',
        paragraphs: [
          'Aus deinen Daten berechnen wir die Himmelsstämme (天干) und Erdzweige (地支) der vier Säulen sowie die Balance der fünf Elemente. Daraus entsteht ein ruhiges, individuelles Poster im Japandi-Stil — handveredelt im Atelier.',
        ],
      },
    ],
  },
  {
    slug: 'bazi-vier-saeulen-erklaert',
    title: 'Die vier Säulen erklärt: Jahr, Monat, Tag und Stunde',
    category: 'BaZi',
    excerpt: 'Was die vier Säulen bedeuten, was der Tagesmeister ist und wie du dein eigenes Chart liest.',
    date: '15. Juni 2026',
    readTime: '6 Min.',
    image: '/images/posters/bazi-personal.jpg',
    body: [
      {
        paragraphs: [
          'BaZi (四柱命理, „Vier Säulen des Schicksals") beschreibt deinen Geburtsmoment in vier Säulen — Jahr, Monat, Tag und Stunde. Jede Säule besteht aus einem Himmelsstamm und einem Erdzweig.',
        ],
      },
      {
        heading: 'Die vier Säulen',
        paragraphs: [
          'Jahr — die äußere Prägung, Herkunft und das große Umfeld.',
          'Monat — Antrieb, Anlagen und die Bühne, auf der sich vieles abspielt.',
          'Tag — der Kern deiner Persönlichkeit. Der obere Teil ist dein Tagesmeister.',
          'Stunde — innere Ausrichtung, Privates und der Blick nach vorn.',
        ],
      },
      {
        heading: 'Der Tagesmeister',
        paragraphs: [
          'Der Tages-Himmelsstamm ist dein Tagesmeister (日主) — der Bezugspunkt der gesamten Deutung. Er ist einem der fünf Elemente zugeordnet: Holz, Feuer, Erde, Metall oder Wasser.',
        ],
      },
      {
        heading: 'Die fünf Elemente in Balance',
        paragraphs: [
          'Über alle Säulen hinweg ergibt sich ein Verhältnis der fünf Elemente. Diese Wuxing-Balance machen wir auf dem Poster sichtbar — als ruhige, dekorative Komposition, die deinen Chart auch ohne Vorwissen lesbar macht.',
        ],
      },
    ],
  },
  {
    slug: 'wuxing-fuer-praxisraeume',
    title: 'Wuxing Poster für Praxisräume',
    category: 'TCM & Praxis',
    excerpt: 'Wie Elementposter Orientierung, Ruhe und ein professionelles Raumgefühl in Behandlungszimmer bringen.',
    date: '14. Juni 2026',
    readTime: '5 Min.',
    image: '/images/posters/tcm-elements.jpg',
    body: [
      {
        paragraphs: [
          'Die fünf Elemente (Wuxing) sind das Ordnungssystem hinter der Traditionellen Chinesischen Medizin. Als ruhiges Wandposter werden sie zum edukativen und beruhigenden Element im Behandlungsraum.',
        ],
      },
      {
        heading: 'Orientierung für Patient:innen',
        paragraphs: [
          'Ein klar gestaltetes Elementposter gibt Patient:innen im Wartebereich etwas zum Betrachten und vermittelt nebenbei, in welchem System du arbeitest — das schafft Vertrauen.',
        ],
      },
      {
        heading: 'Ruhe und Professionalität',
        paragraphs: [
          'Gedämpfte Farben und reduzierte Typografie wirken professionell statt esoterisch. Unsere Praxisposter sind bewusst zurückhaltend gestaltet, damit sie zu hellen, natürlichen Raumkonzepten passen.',
        ],
      },
      {
        heading: 'Für Praxis, Studio und Unterricht',
        paragraphs: [
          'Ob Akupunktur-Praxis, Yoga-Studio oder Seminarraum: die Poster gibt es in drei Größen und optional gerahmt. So findest du das passende Format für jede Wand.',
        ],
      },
    ],
  },
  {
    slug: 'bazi-als-geschenk',
    title: 'BaZi-Poster verschenken: der persönlichste Wandschmuck',
    category: 'Geschenke',
    excerpt: 'Warum ein personalisiertes Chart zu Geburt, Hochzeit oder Jahrestag ein Geschenk mit Bedeutung ist.',
    date: '12. Juni 2026',
    readTime: '3 Min.',
    image: '/images/gifts/birthday.jpg',
    body: [
      {
        paragraphs: [
          'Ein personalisiertes BaZi-Poster ist kein Massenartikel — es entsteht aus dem Geburtsmoment eines bestimmten Menschen. Genau das macht es zu einem Geschenk, das in Erinnerung bleibt.',
        ],
      },
      {
        heading: 'Passende Anlässe',
        paragraphs: [
          'Zur Geburt: der Start ins Leben als Kunstwerk fürs Kinderzimmer.',
          'Zur Hochzeit oder zum Jahrestag: zwei Charts als Paar nebeneinander.',
          'Zum runden Geburtstag: ein Rückblick auf die eigene Kosmologie.',
        ],
      },
      {
        heading: 'Was du zum Verschenken brauchst',
        paragraphs: [
          'Du brauchst Geburtsdatum, -zeit und -ort der beschenkten Person. Hast du die Daten nicht parat, eignet sich unser Gutschein — die Personalisierung übernimmt dann die beschenkte Person selbst.',
        ],
      },
    ],
  },
  {
    slug: 'coming-soon-personalisierungen',
    title: 'Saju und Junishi: was als Nächstes kommt',
    category: 'Studio Notes',
    excerpt: 'Ein Blick auf die kommenden personalisierten Posterlinien und den Early-Access-Vorteil.',
    date: '10. Juni 2026',
    readTime: '3 Min.',
    image: '/images/categories/saju.jpg',
    body: [
      {
        paragraphs: [
          'BaZi ist erst der Anfang. Mit Saju (koreanische Astrologie) und Junishi (japanische Tierkreis-Tradition) erweitern wir die personalisierte Posterlinie um zwei verwandte ostasiatische Systeme.',
        ],
      },
      {
        heading: 'Saju — die koreanischen vier Pfeiler',
        paragraphs: [
          'Saju (사주) arbeitet wie BaZi mit vier Pfeilern aus dem Geburtsmoment, hat aber eine eigene grafische und sprachliche Tradition. Wir setzen sie als minimalistisches Fine-Art-Poster um.',
        ],
      },
      {
        heading: 'Junishi — der japanische Tierkreis',
        paragraphs: [
          'Junishi (十二支) bringt die zwölf Tierzeichen der japanischen Tradition als ruhige, symbolstarke Wandkunst.',
        ],
      },
      {
        heading: 'Early Access sichern',
        paragraphs: [
          'Beide Linien sind in Vorbereitung. Trag dich auf der jeweiligen Produktseite mit deiner E-Mail ein und sichere dir 25 % auf den Start.',
        ],
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
