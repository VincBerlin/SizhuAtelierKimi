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
 */
export default function PosterSvg({ data, designId, testId = 'poster-svg-preview' }: { data: PosterData; designId: string; testId?: string }) {
  const svg = useMemo(() => getDesign(designId).render(data, { widthMm: 420, heightMm: 594 }), [data, designId])
  return (
    <div
      data-testid={testId}
      data-design-id={designId}
      style={{ width: '100%', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
