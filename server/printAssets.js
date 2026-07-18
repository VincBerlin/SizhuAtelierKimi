// Druck-Assets für NICHT-personalisierte Katalog-Poster (Batch #12 R5, #9).
//
// EHRLICHKEITS-REGEL (identisch zu gelatoProducts.PRODUCT_UIDS): diese
// Registry startet LEER und wird NIE geraten. Für die Katalog-Poster existiert
// im Repo keine druck-exakte Vorlage (die Shop-Kacheln sind Platzhalter,
// RL-IMAGES) — produzierbar wird ein Katalog-Poster erst, wenn der Operator
// eine druckfertige PDF (Endformat + Beschnitt gemäß server/printSpecs.js)
// unter Shop/print-assets/ ablegt und hier registriert. Bis dahin scheitert
// die Bestell-Line LAUT (fulfillment_status='failed' + Operator-Eskalation)
// — nie eine stille Nicht-Produktion und nie ein falscher Druck.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class PrintAssetMissingError extends Error {
  constructor(productId) {
    super(
      `print asset not registered for: ${productId} — druckfertige PDF unter print-assets/ ablegen und in server/printAssets.js PRINT_ASSETS registrieren`,
    )
    this.name = 'PrintAssetMissingError'
  }
}

// productId ('poster:11') → Dateiname unter Shop/print-assets/.
// BEWUSST LEER — Befüllung nur durch den Operator mit validierten Dateien.
export const PRINT_ASSETS = {}

/** Lädt die registrierte Druck-PDF einer Katalog-Poster-Line — oder wirft
 *  LAUT (PrintAssetMissingError / kein-PDF-Fehler). */
export async function printAssetPdf(productId) {
  const file = PRINT_ASSETS[String(productId || '')]
  if (!file) throw new PrintAssetMissingError(productId)
  const buf = await fs.readFile(path.resolve(__dirname, '..', 'print-assets', file))
  if (buf.subarray(0, 5).toString() !== '%PDF-') {
    throw new Error(`print asset for ${productId} is not a PDF: ${file}`)
  }
  return buf
}

// Rahmen-Hex → Rahmenname (Spiegel von src/lib/bazi.ts frames[] — dieselben
// Namen, über die gelatoProducts.productUidFor die verifizierten UIDs mappt).
export const FRAME_NAME_BY_HEX = {
  '#B98A5E': 'Eiche natur',
  '#1B1B1B': 'Schwarz matt',
}
