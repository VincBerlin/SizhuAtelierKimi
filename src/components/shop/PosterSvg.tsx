import { useMemo } from 'react'
import type { PosterData } from '@/lib/bazi'
import { getDesign } from '@/designs/registry.mjs'

/**
 * Rendert die geteilte SVG-Design-Vorlage (src/designs/) — dieselbe Vorlage,
 * aus der der Server das Druck-PDF erzeugt (server/pdf.js). Was der Käufer
 * hier sieht, ist konstruktionsbedingt identisch mit dem Druck.
 *
 * innerHTML ist hier sicher: Der SVG-String ist ausschließlich unsere eigene
 * Vorlage; ALLER Nutzertext ist darin escaped — der Design-TÜV
 * (tests/unit/design-registry-tuev.test.ts) erzwingt das mit einem
 * Injektions-Fixture für jedes registrierte Design.
 *
 * Operator 2026-07-16: Der Rahmen wird NICHT mehr aufs Poster gemalt (er kommt
 * physisch von Gelato). `frameName` rendert stattdessen einen realistischen
 * Rahmen-Look UM die Vorschau (Holz-/Mattschwarz-Gradient + Falz + Schatten,
 * CSS-Klassen in index.css) — die Druckdatei bleibt rahmenfrei.
 */
const FRAME_CLASS: Record<string, string> = {
  'Eiche natur': 'real-frame real-frame--oak',
  'Schwarz matt': 'real-frame real-frame--black',
}

export default function PosterSvg({
  data,
  designId,
  testId = 'poster-svg-preview',
  frameName,
}: {
  data: PosterData
  designId: string
  testId?: string
  frameName?: string
}) {
  // Batch #12 R6 (#2): Vorschau-Proportion = Standard-VERKAUFSFORMAT 50 × 70
  // (5:7) statt des alten A-Serien-√2-Verhältnisses — der Käufer sieht die
  // Proportion, die er kauft. Der DRUCK rendert weiterhin exakt je bestelltem
  // Format über PRINT_SPECS (server/pdf.js); die Designs sind mm-parametrisch.
  const svg = useMemo(() => getDesign(designId).render(data, { widthMm: 500, heightMm: 700 }), [data, designId])
  const inner = (
    <div
      data-testid={testId}
      data-design-id={designId}
      style={{ width: '100%', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
  const frameClass = frameName ? FRAME_CLASS[frameName] : undefined
  if (!frameClass) return inner
  return (
    <div data-testid={`${testId}-frame`} className={frameClass}>
      {inner}
    </div>
  )
}
