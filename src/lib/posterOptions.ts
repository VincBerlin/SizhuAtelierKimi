// Kanonische Poster-Optionslisten (Rahmen / Hintergründe / Formate) —
// T-B02 der CJK-Migration (docs/plans/2026-07-31-cjk-migration.md).
//
// Extrahiert aus src/lib/bazi.ts (Re-Export dort bleibt bestehen), damit die
// Formate-/Rahmen-Wahrheit unabhängig von der Astrologie-Engine lebt. Die
// Deltas spiegeln server/pricing.js SIZE_DELTA_EUR (Paritätstest-gekoppelt);
// Druckmaße + live-verifizierte Gelato-UIDs: server/printSpecs.js und
// server/gelatoProducts.js.

export interface FrameOpt {
  name: string
  hex: string
}
export const frames: FrameOpt[] = [
  { name: 'Eiche natur', hex: '#B98A5E' },
  { name: 'Schwarz matt', hex: '#1B1B1B' },
]

export interface BgOpt {
  name: string
  hex: string
}
// Nur noch Katalog-Fixture-Daten (Poster-Background-Palette wurde per
// Operator-Vorgabe 2026-07-13 aus Konfigurator + /personalize entfernt;
// bestehende `posterBg`-Metadaten älterer Carts bleiben serverseitig toleriert).
export const backgrounds: BgOpt[] = [
  { name: 'Sandstein', hex: '#E9DFCB' },
  { name: 'Salbei', hex: '#AFBCA6' },
  { name: 'Terracotta', hex: '#BC7A5E' },
  { name: 'Indigo', hex: '#2C3A57' },
  { name: 'Anthrazit', hex: '#2A2A2C' },
]

export interface SizeOpt {
  id: string
  label: string
  sub: string
  delta: number
}
// A-Serie: Katalog-Poster + Legacy-Configurator.
export const sizes: SizeOpt[] = [
  { id: 'A3', label: 'A3', sub: '30 × 42 cm', delta: -10 },
  { id: 'A2', label: 'A2', sub: '42 × 59 cm', delta: 0 },
  { id: 'A1', label: 'A1', sub: '59 × 84 cm', delta: 20 },
]

// Operator-Anweisung 2026-07-15 (explizit, protected-surface-Review erteilt):
// „die Formate der Poster müssen umgeändert werden … in Vertical bei diesem
// personalisierten Poster auf 30×40, 50×70 und 70×100". Gilt NUR für den
// Personalisierungs-Flow — Katalog-Poster behalten die A-Serie (`sizes` oben).
export const personalizedSizes: SizeOpt[] = [
  { id: '30x40', label: '30 × 40', sub: '30 × 40 cm', delta: -10 },
  { id: '50x70', label: '50 × 70', sub: '50 × 70 cm', delta: 0 },
  { id: '70x100', label: '70 × 100', sub: '70 × 100 cm', delta: 20 },
]
