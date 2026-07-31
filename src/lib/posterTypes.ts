// Neutrale Poster-Datentypen — T-B02 der CJK-Migration
// (docs/plans/2026-07-31-cjk-migration.md).
//
// Extrahiert aus src/lib/bazi.ts, damit Poster-Rendering, PDF-Pfad und der
// kommende CJK-Konfigurator NICHT von der Astrologie-Engine abhängen.
// bazi.ts re-exportiert diese Typen, alle bestehenden Import-Stellen bleiben
// unverändert gültig (Verhaltens-Nullschritt; Löschung von bazi.ts ist ein
// separates Gate T-B05 / GATE-BAZI-DELETE).

export interface Pillar {
  label: string
  stem: string
  branch: string
}

export interface PosterData {
  frame: string
  bg: string
  name: string
  element: string
  animal: string
  pillars: Pillar[]
}

export interface ChartResult {
  pillars: Pillar[]
  animal: string
  element: string
}
