/**
 * analytics.ts — FAKE-ONLY event readout (T-701 / REQ-002, Merge-Gate b).
 *
 * RL-EVENT STAYS RED. This is an INSTRUMENTATION-ONLY sink: `track()` records an
 * event into an in-memory array (plus a dev `console.debug` breadcrumb and a
 * `window.__sizhuEvents` mirror for manual inspection in a real browser). There
 * is DELIBERATELY NO real analytics backend and NO network call here — nothing
 * in this file proves analytics works in production.
 *
 * What this module honestly supports:
 *   - AT-002-5 asserts the 5 funnel events FIRE through `getEvents()`
 *     (instrumentation present at the right call sites). That is the ONLY claim.
 *
 * What it does NOT support (and must not be marked done):
 *   - It reads NO real event data. Until a real sink is wired in a real
 *     environment, the event-readout requirement (RL-EVENT) is RED. REQ-002
 *     therefore stays value-risk / merge-gate-held.
 *
 * When a real backend lands, replace ONLY the body of `emit()` with the real
 * dispatch; the exported event names (`EVENTS`) and the call sites are the
 * stable contract and do not change.
 */

/** Stable funnel-event names — the contract shared by every call site + the
 *  AT-002-5 instrumentation test. Do not rename without updating both. */
export const EVENTS = {
  heroCta: 'hero_cta_click',
  bestsellerClick: 'bestseller_product_click',
  categoryClick: 'category_banner_click',
  pdpView: 'pdp_view',
  addToCart: 'add_to_cart',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

export interface AnalyticsEvent {
  readonly event: string
  readonly props: Readonly<Record<string, unknown>>
  readonly ts: number
}

/** Key under which the sink is mirrored on `window` (dev inspection only). */
const WINDOW_SINK_KEY = '__sizhuEvents'

// Immutable append style (coding-style: never mutate, replace): each `track`
// swaps `sink` for a NEW array rather than pushing into the existing one.
let sink: readonly AnalyticsEvent[] = []

function mirrorToWindow(): void {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, unknown>)[WINDOW_SINK_KEY] = sink
}

/** The fake dispatch. Real analytics would POST here — today it is a no-op
 *  beyond the in-memory sink + a dev console breadcrumb. NO network. */
function emit(entry: AnalyticsEvent): void {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev breadcrumb only, not prod logging
    console.debug('[analytics:fake]', entry.event, entry.props)
  }
}

/**
 * Record a funnel event. FAKE-ONLY — appends to the in-memory sink, mirrors it
 * onto `window` for inspection and emits a dev console breadcrumb. Never throws
 * and never makes a network request, so it is always safe to call from a UI
 * event handler.
 */
export function track(event: string, props: Record<string, unknown> = {}): void {
  const entry: AnalyticsEvent = { event, props: { ...props }, ts: Date.now() }
  sink = [...sink, entry]
  mirrorToWindow()
  emit(entry)
}

/** Read the recorded events (immutable snapshot) — used by AT-002-5. */
export function getEvents(): readonly AnalyticsEvent[] {
  return sink
}

/** Reset the sink (test isolation). */
export function clearEvents(): void {
  sink = []
  mirrorToWindow()
}
