// Design-Registry — die EINE Liste aller Poster-Designs.
// Neues Design = neue Datei in src/designs/ + EINE Zeile hier. Alles andere
// (Design-Wähler, Live-Vorschau, Bestell-Metadaten, Druck-PDF) hängt an dieser
// Liste und übernimmt neue Einträge automatisch. Der Design-TÜV
// (tests/unit/design-registry-tuev.test.ts) prüft JEDEN Eintrag automatisch:
// vollständige Personalisierung, escaped Nutzertext, valides XML.
//
// `active: false` nimmt ein Design aus dem Verkauf, hält es aber für alte
// Bestellungen (Nachdruck/Reklamation) auflösbar — Einträge NIE löschen.
import { render as klassik } from './klassik.mjs'
import { render as paarHarmonie } from './paarHarmonie.mjs'

export const DESIGNS = [
  { id: 'klassik', name: 'Klassik', active: true, kind: 'single', render: klassik },
  { id: 'paar-harmonie', name: 'Paar-Harmonie', active: true, kind: 'pair', render: paarHarmonie },
]

export function getDesign(id) {
  const d = DESIGNS.find((x) => x.id === id)
  if (!d) throw new Error(`unknown design: ${id}`)
  return d
}
