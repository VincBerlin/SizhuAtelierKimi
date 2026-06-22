// Personalize product-type catalogue (current MVP only — no Saju/Junishi).
//
// This is the SINGLE CLIENT SOURCE for product-type base prices and the PDF
// add-on price. It is a pure data module (no React) so it can be consumed by
// both the Personalize page (display) and the server-parity tests, which assert
// that `server/pricing.js` mirrors these values 1:1 (ADR-001 pt.4). Any drift
// here that is not mirrored into the server table must turn the parity test RED.

export type ProductTypeId = 'bazi' | 'birthchart' | 'couple' | 'digital' | 'bundle'

export interface PTDef {
  id: ProductTypeId
  basePrice: number
  couple: boolean
  /** physical poster → has frame/palette/size; false = digital-only */
  poster: boolean
  /** PDF is already included (bundle) → no separate add-on */
  pdfIncluded: boolean
}

export const PRODUCT_TYPES: PTDef[] = [
  { id: 'bazi', basePrice: 49, couple: false, poster: true, pdfIncluded: false },
  { id: 'birthchart', basePrice: 49, couple: false, poster: true, pdfIncluded: false },
  { id: 'couple', basePrice: 69, couple: true, poster: true, pdfIncluded: false },
  { id: 'digital', basePrice: 39, couple: false, poster: false, pdfIncluded: true },
  { id: 'bundle', basePrice: 79, couple: false, poster: true, pdfIncluded: true },
]

export const PDF_ADDON_PRICE = 30
