// SVG→PDF: dieselbe Design-Vorlage wie die Browser-Vorschau (src/designs/…),
// gerendert in Endformat + Beschnitt, vektorbasiert, Fonts eingebettet
// (pdfkit subsettet automatisch — das 24-MB-CJK-OTF bläht das PDF nicht auf).
// Vorschau = Druck ist damit konstruktionsbedingt, nicht hoffnungsbasiert.
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDesign } from '../src/designs/registry.mjs'
import { PRINT_SPECS, BLEED_MM, MM_TO_PT } from './printSpecs.js'

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets', 'fonts')
const FONTS = {
  'Noto Serif SC': path.join(FONT_DIR, 'NotoSerifCJKsc-Regular.otf'),
  'Noto Sans': path.join(FONT_DIR, 'NotoSans-Regular.ttf'),
}

export async function renderPosterPdf({ designId, data, sizeId }) {
  const spec = PRINT_SPECS[sizeId]
  if (!spec) throw new Error(`unknown sizeId: ${sizeId}`)
  const design = getDesign(designId) // wirft bei unbekannter id — nie stiller Fallback
  const widthMm = spec.widthMm + 2 * BLEED_MM
  const heightMm = spec.heightMm + 2 * BLEED_MM
  const svg = design.render(data, { widthMm, heightMm })
  const doc = new PDFDocument({ size: [widthMm * MM_TO_PT, heightMm * MM_TO_PT], margin: 0 })
  for (const [name, file] of Object.entries(FONTS)) doc.registerFont(name, file)
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise((resolve) => doc.on('end', resolve))
  SVGtoPDF(doc, svg, 0, 0, {
    width: widthMm * MM_TO_PT,
    height: heightMm * MM_TO_PT,
    // Design-Vorlagen nennen 'Noto Serif SC' (Hanzi/Name) und 'Noto Sans'
    // (Labels). Alles Serif-artige → CJK-Serif, Rest → Sans.
    fontCallback: (family) => (String(family).includes('Serif') ? 'Noto Serif SC' : 'Noto Sans'),
  })
  doc.end()
  await done
  return Buffer.concat(chunks)
}
