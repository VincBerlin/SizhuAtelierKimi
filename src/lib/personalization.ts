// Personalization birth-input passthrough + disclosed noon fallback.
//
// Single source of truth for turning the raw birth inputs (place / date / time +
// a "birth time unknown" flag) into the personalization metadata that travels
// UI state → cart line → checkout payload → planned calculation API (REQ-004 /
// ADR-002). Centralising this here means every call site (the /personalize flow,
// the product configurator, the store's addCurrent) emits the SAME canonical
// fields and can never silently drop one (Vision §7.5 "collect-display-discard").
//
// Honesty boundary (REQ-018 / ADR-002 pt.5): when the birth time is unknown the
// PROCESSED time is set deterministically to 12:00 (noon) and the assumption is
// flagged so the UI can disclose it — never a silent default. The chart itself
// stays a placeholder (BLK-RED-BAZI); this module only captures + threads inputs.

export const NOON_FALLBACK = '12:00'
export const NOON_FALLBACK_DISPLAY = '12:00 PM'
export const FALLBACK_REASON = 'customer_unknown_birth_time'

export interface BirthInput {
  date: string
  /** Raw entered time. Ignored when `birthTimeUnknown` is true. */
  time: string
  place: string
  /** True when the buyer marked their birth time unknown (or left it blank). */
  birthTimeUnknown: boolean
}

/** Canonical birth-time fields for the personalization metadata. Strings only,
 *  because the metadata object is a `Record<string, string>` that round-trips
 *  through Stripe metadata + the cart persistence layer. */
export interface BirthTimeMeta {
  /** Processed time actually used downstream: the entered time, or 12:00 when
   *  unknown. Deterministic. */
  time: string
  /** Human-readable processed time (12-hour). */
  timeDisplay: string
  /** Canonical disclosure flag (REQ-004 AK-1 / REQ-018 AK-1). */
  birthTimeUnknown: string
  /** Legacy alias kept in lock-step so the cart drawer + completeness gate, which
   *  read `unknownTime`, stay correct without a second source of truth. */
  unknownTime: string
  timeFallbackUsed: string
  fallbackReason: string
}

/** "14:30" -> "2:30 PM" for human-readable storage/display. */
export function to12h(t: string): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  if (isNaN(h)) return t
  const ampm = h < 12 ? 'AM' : 'PM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${hh}:${String(m || 0).padStart(2, '0')} ${ampm}`
}

/**
 * Build the canonical birth-time metadata for one person, applying the disclosed
 * noon fallback when the time is unknown. Pure + deterministic.
 *
 * @param time  the entered birth time (may be empty)
 * @param birthTimeUnknown  whether the buyer marked the time as unknown
 */
export function birthTimeMeta(time: string, birthTimeUnknown: boolean): BirthTimeMeta {
  const unknown = birthTimeUnknown || !time
  const processed = unknown ? NOON_FALLBACK : time
  return {
    time: processed,
    timeDisplay: unknown ? NOON_FALLBACK_DISPLAY : to12h(time),
    birthTimeUnknown: String(unknown),
    unknownTime: String(unknown),
    timeFallbackUsed: String(unknown),
    fallbackReason: unknown ? FALLBACK_REASON : '',
  }
}
