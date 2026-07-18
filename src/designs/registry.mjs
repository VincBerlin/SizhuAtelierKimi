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
import { render as westernZodiac } from './westernZodiac.mjs'
import { render as inkMinimal } from './inkMinimal.mjs'

export const DESIGNS = [
  { id: 'klassik', name: 'Klassik', active: true, kind: 'single', render: klassik },
  // Operator 2026-07-14: zweites Einzel-Design — beweist die Template-
  // Hinterlegung (Datei + eine Zeile → Picker/Vorschau/Druck/TÜV automatisch).
  { id: 'ink-minimal', name: 'Ink Minimal', active: true, kind: 'single', render: inkMinimal },
  { id: 'paar-harmonie', name: 'Paar-Harmonie', active: true, kind: 'pair', render: paarHarmonie },
  // Operator 2026-07-14: Birth-Chart-Poster = westliches Geburtshoroskop
  // (FuFirE /v1/calculate/western, Swiss Ephemeris) mit eigenem Design.
  { id: 'western-zodiac', name: 'Western', active: true, kind: 'western', render: westernZodiac },
]

export function getDesign(id) {
  const d = DESIGNS.find((x) => x.id === id)
  if (!d) throw new Error(`unknown design: ${id}`)
  return d
}
