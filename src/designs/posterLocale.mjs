// Poster-Lokalisierung — geteiltes ESM (Browser-Vorschau via Vite UND
// Node-Druck-PDF via server/fulfillment.js): EINE Quelle, damit Vorschau und
// Druck nie driften (Operator-Fund 2026-07-13: Poster zeigte METALL/PFERD
// auch bei englischer Poster-Sprache).
//
// FuFirE liefert Element/Tier KANONISCH DEUTSCH (server/fufire.js
// normalizeChart). Diese Tabellen übersetzen in die gewählte POSTER-Sprache.
// EHRLICHKEITS-REGEL: ein unbekannter Wert wird UNVERÄNDERT durchgereicht —
// nie geraten, nie geleert (lieber ein deutsches Wort auf einem englischen
// Poster als ein falsches oder fehlendes).

const ELEMENTS = {
  Holz: { EN: 'Wood', FR: 'Bois', ES: 'Madera' },
  Feuer: { EN: 'Fire', FR: 'Feu', ES: 'Fuego' },
  Erde: { EN: 'Earth', FR: 'Terre', ES: 'Tierra' },
  Metall: { EN: 'Metal', FR: 'Métal', ES: 'Metal' },
  Wasser: { EN: 'Water', FR: 'Eau', ES: 'Agua' },
}

const ANIMALS = {
  Ratte: { EN: 'Rat', FR: 'Rat', ES: 'Rata' },
  Büffel: { EN: 'Ox', FR: 'Buffle', ES: 'Búfalo' },
  Tiger: { EN: 'Tiger', FR: 'Tigre', ES: 'Tigre' },
  Hase: { EN: 'Rabbit', FR: 'Lapin', ES: 'Conejo' },
  Drache: { EN: 'Dragon', FR: 'Dragon', ES: 'Dragón' },
  Schlange: { EN: 'Snake', FR: 'Serpent', ES: 'Serpiente' },
  Pferd: { EN: 'Horse', FR: 'Cheval', ES: 'Caballo' },
  Ziege: { EN: 'Goat', FR: 'Chèvre', ES: 'Cabra' },
  Affe: { EN: 'Monkey', FR: 'Singe', ES: 'Mono' },
  Hahn: { EN: 'Rooster', FR: 'Coq', ES: 'Gallo' },
  Hund: { EN: 'Dog', FR: 'Chien', ES: 'Perro' },
  Schwein: { EN: 'Pig', FR: 'Cochon', ES: 'Cerdo' },
}

const SUBTITLE_SINGLE = {
  DE: 'BAZI · VIER SÄULEN',
  EN: 'BAZI · FOUR PILLARS',
  FR: 'BAZI · QUATRE PILIERS',
  ES: 'BAZI · CUATRO PILARES',
}

// Westlicher Tierkreis (Index 0=Widder … 11=Fische — FuFirE zodiac_sign).
const ZODIAC = [
  { DE: 'Widder', EN: 'Aries', FR: 'Bélier', ES: 'Aries' },
  { DE: 'Stier', EN: 'Taurus', FR: 'Taureau', ES: 'Tauro' },
  { DE: 'Zwillinge', EN: 'Gemini', FR: 'Gémeaux', ES: 'Géminis' },
  { DE: 'Krebs', EN: 'Cancer', FR: 'Cancer', ES: 'Cáncer' },
  { DE: 'Löwe', EN: 'Leo', FR: 'Lion', ES: 'Leo' },
  { DE: 'Jungfrau', EN: 'Virgo', FR: 'Vierge', ES: 'Virgo' },
  { DE: 'Waage', EN: 'Libra', FR: 'Balance', ES: 'Libra' },
  { DE: 'Skorpion', EN: 'Scorpio', FR: 'Scorpion', ES: 'Escorpio' },
  { DE: 'Schütze', EN: 'Sagittarius', FR: 'Sagittaire', ES: 'Sagitario' },
  { DE: 'Steinbock', EN: 'Capricorn', FR: 'Capricorne', ES: 'Capricornio' },
  { DE: 'Wassermann', EN: 'Aquarius', FR: 'Verseau', ES: 'Acuario' },
  { DE: 'Fische', EN: 'Pisces', FR: 'Poissons', ES: 'Piscis' },
]

// Poster-Beschriftungen der westlichen Big Three + klassischen Planeten.
const PLANETS = {
  Sun: { DE: 'Sonne', EN: 'Sun', FR: 'Soleil', ES: 'Sol' },
  Moon: { DE: 'Mond', EN: 'Moon', FR: 'Lune', ES: 'Luna' },
  Ascendant: { DE: 'Aszendent', EN: 'Ascendant', FR: 'Ascendant', ES: 'Ascendente' },
  Mercury: { DE: 'Merkur', EN: 'Mercury', FR: 'Mercure', ES: 'Mercurio' },
  Venus: { DE: 'Venus', EN: 'Venus', FR: 'Vénus', ES: 'Venus' },
  Mars: { DE: 'Mars', EN: 'Mars', FR: 'Mars', ES: 'Marte' },
  Jupiter: { DE: 'Jupiter', EN: 'Jupiter', FR: 'Jupiter', ES: 'Júpiter' },
  Saturn: { DE: 'Saturn', EN: 'Saturn', FR: 'Saturne', ES: 'Saturno' },
}

const SUBTITLE_WESTERN = {
  DE: 'WESTERN · GEBURTSHOROSKOP',
  EN: 'WESTERN · BIRTH CHART',
  FR: 'WESTERN · THÈME NATAL',
  ES: 'WESTERN · CARTA NATAL',
}

const SUBTITLE_PAIR = {
  DE: 'BAZI · PARTNERSCHAFT',
  EN: 'BAZI · PARTNERSHIP',
  FR: 'BAZI · PARTENARIAT',
  ES: 'BAZI · PAREJA',
}

// Relations-Label (合婚) in der POSTER-Sprache — vorher doppelt gepflegt
// (server/fulfillment.js RELATION_TEXT + Client-i18n); jetzt EINE Quelle.
const RELATIONS = {
  DE: { a_generates_b: '{a} nährt {b}', b_generates_a: '{b} nährt {a}', a_controls_b: '{a} kontrolliert {b}', b_controls_a: '{b} kontrolliert {a}', same_element: 'Gemeinsames Element', same: 'Gemeinsames Element' },
  EN: { a_generates_b: '{a} nourishes {b}', b_generates_a: '{b} nourishes {a}', a_controls_b: '{a} controls {b}', b_controls_a: '{b} controls {a}', same_element: 'Shared element', same: 'Shared element' },
  FR: { a_generates_b: '{a} nourrit {b}', b_generates_a: '{b} nourrit {a}', a_controls_b: '{a} contrôle {b}', b_controls_a: '{b} contrôle {a}', same_element: 'Élément commun', same: 'Élément commun' },
  ES: { a_generates_b: '{a} nutre {b}', b_generates_a: '{b} nutre {a}', a_controls_b: '{a} controla {b}', b_controls_a: '{b} controla {a}', same_element: 'Elemento común', same: 'Elemento común' },
}

// Tag-Stamm → Element (klassische FIXE Zuordnung, kein Rechnen): die Säulen
// kommen von FuFirE; dieses Mapping beschriftet nur den Tagesmeister.
// EHRLICHKEITS-FUND 2026-07-14 (Live-Diskrepanz 1988-03-02: chart.element
// 'Erde' = JAHR 戊辰, relation.elementB 'Feuer' = TAG 丙): FuFirEs
// chart.element/animal sind JAHRES-Säulen-Werte — fürs Tagesmeister-Label
// MUSS das Element aus dem Tag-Stamm kommen, nie aus chart.element.
const STEM_ELEMENT = {
  '甲': 'Holz', '乙': 'Holz',
  '丙': 'Feuer', '丁': 'Feuer',
  '戊': 'Erde', '己': 'Erde',
  '庚': 'Metall', '辛': 'Metall',
  '壬': 'Wasser', '癸': 'Wasser',
}

export function stemElement(stem) {
  return STEM_ELEMENT[stem] ?? ''
}

function norm(lang) {
  const l = String(lang || 'DE').toUpperCase()
  return ['DE', 'EN', 'FR', 'ES'].includes(l) ? l : 'DE'
}

export function localizeElement(element, lang) {
  const l = norm(lang)
  if (l === 'DE' || !element) return element
  return ELEMENTS[element]?.[l] ?? element
}

export function localizeAnimal(animal, lang) {
  const l = norm(lang)
  if (l === 'DE' || !animal) return animal
  return ANIMALS[animal]?.[l] ?? animal
}

export function posterSubtitle(kind, lang) {
  const l = norm(lang)
  const table = kind === 'pair' ? SUBTITLE_PAIR : kind === 'western' ? SUBTITLE_WESTERN : SUBTITLE_SINGLE
  return table[l]
}

/** Tierkreiszeichen-Name (Index 0=Widder … 11=Fische) in der Poster-Sprache.
 *  Unbekannter Index → '' (nie geraten). */
export function zodiacName(index, lang) {
  const z = ZODIAC[index]
  return z ? z[norm(lang)] : ''
}

/** Planeten-/Achsen-Beschriftung (Sun/Moon/Ascendant/Mercury…) lokalisiert. */
export function planetName(key, lang) {
  const p = PLANETS[key]
  return p ? p[norm(lang)] : String(key || '')
}

/** Relations-Label aus FuFirE-Relation (wuxingRelation + elementA/B, deutsch)
 *  in der Poster-Sprache — Elemente werden mitübersetzt. */
export function localizeRelation(relation, lang) {
  const l = norm(lang)
  const tpl = RELATIONS[l][relation?.wuxingRelation]
  if (!tpl) return ''
  return tpl
    .split('{a}').join(localizeElement(relation.elementA || '', l))
    .split('{b}').join(localizeElement(relation.elementB || '', l))
}
