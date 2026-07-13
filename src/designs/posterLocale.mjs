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
  return (kind === 'pair' ? SUBTITLE_PAIR : SUBTITLE_SINGLE)[l]
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
