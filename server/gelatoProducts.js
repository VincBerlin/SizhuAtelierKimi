// Gelato-Produkt-Mapping — die 6 Kombinationen (3 Formate × 2 Rahmen).
//
// EHRLICHKEITS-REGEL (Evidence-Ledger RL-GELATO): Die productUids werden NIE
// geraten. Diese Tabelle startet LEER und wird ausschließlich mit UIDs
// befüllt, die scripts/evidence/gelato-catalog-verify.mjs mit echtem
// GELATO_API_KEY aus dem Katalog verifiziert hat ([REAL-BOUNDARY-LIVE]).
// Bis dahin wirft productUidFor — eine Bestellung mit unverifiziertem
// Mapping ist ein lauter Fehler, nie ein stiller Falschdruck.
//
// Rahmen-Namen = exakt src/lib/bazi.ts frames[].name.

export class GelatoMappingUnverifiedError extends Error {
  constructor(key) {
    super(`gelato productUid mapping not verified for: ${key} — run scripts/evidence/gelato-catalog-verify.mjs`)
    this.name = 'GelatoMappingUnverifiedError'
  }
}

// Nach Katalog-Verifikation befüllen (Task 13 / Phase F):
// 'A2|Schwarz matt': 'framed_poster_…', …
export const PRODUCT_UIDS = {}

export function productUidFor({ sizeId, frameName }) {
  const key = `${sizeId}|${frameName}`
  const uid = PRODUCT_UIDS[key]
  if (!uid) throw new GelatoMappingUnverifiedError(key)
  return uid
}
