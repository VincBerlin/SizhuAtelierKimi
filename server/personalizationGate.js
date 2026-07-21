// Server-seitiges Order-Gate für personalisierte Produkte (Batch #12 R3,
// Bereich 8): eine Bestellung ohne Pflicht-Geburtsdaten darf NICHT möglich
// sein — egal, aus welchem Client-Pfad die Line stammt. Spiegel des
// Client-Gates `cartHasIncompletePersonalization` (src/lib/checkout.ts); die
// Feld-Semantik (birthTimeUnknown/unknownTime als 'true'/'false'-Strings,
// Mittag-Fallback füllt `time`) kommt aus src/lib/personalization.ts.

import { PTYPE_PRODUCT_PREFIX, DIGITAL_PRODUCT_PREFIX } from './pricing.js'

// bundle:b1/b2 sind kuratierte, NICHT personalisierte Poster-Sets — nur die
// b-digital-Kombi („Poster + Analyse") trägt ein personalisiertes Versprechen.
const PERSONALIZED_BUNDLE_IDS = new Set(['bundle:b-digital'])

const filled = (v) => typeof v === 'string' && v.trim() !== ''

/** True, wenn diese Produkt-Identität vollständige Geburtsdaten erfordert. */
export function requiresPersonalization(productId) {
  const id = String(productId || '')
  return (
    id.startsWith(PTYPE_PRODUCT_PREFIX) ||
    id.startsWith(DIGITAL_PRODUCT_PREFIX) ||
    PERSONALIZED_BUNDLE_IDS.has(id)
  )
}

/**
 * Prüft eine Checkout-Line gegen das Order-Gate.
 * @returns {string|null} Fehlercode für die 400-Antwort, oder null (Line ok).
 */
export function personalizationGateError(productId, personalization) {
  if (!requiresPersonalization(productId)) return null
  const p = personalization
  if (!p || typeof p !== 'object') return 'personalization_required'
  const missing = []
  if (!filled(p.name)) missing.push('name')
  if (!filled(p.date)) missing.push('date')
  if (!filled(p.place)) missing.push('place')
  // Zeit ist Pflicht, außer sie ist ausdrücklich als unbekannt offengelegt
  // (dann trägt `time` ohnehin den dokumentierten 12:00-Fallback).
  if (!filled(p.time) && p.birthTimeUnknown !== 'true' && p.unknownTime !== 'true') missing.push('time')
  if (String(productId) === `${PTYPE_PRODUCT_PREFIX}couple`) {
    if (!filled(p.nameB)) missing.push('nameB')
    if (!filled(p.dateB)) missing.push('dateB')
    if (!filled(p.placeB)) missing.push('placeB')
    if (!filled(p.timeB) && p.birthTimeUnknownB !== 'true' && p.unknownTimeB !== 'true') missing.push('timeB')
  }
  return missing.length ? `personalization_incomplete: ${missing.join(', ')}` : null
}
