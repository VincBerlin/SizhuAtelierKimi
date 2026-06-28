export type Region = 'us' | 'uk' | 'eu' | 'other'

// REQ-021 / AT-016-6 — how the promo bar COMMUNICATES shipping per region. This is
// client-side display logic only: it picks which message to show, never a price.
// The SERVER-authoritative shipping calculation is Iteration 5 / T-502
// (server/pricing.js + /api/checkout) and is intentionally NOT modelled here — the
// bar must never become a second, divergent source of truth for what is charged.
export type RegionShippingMode = 'free' | 'threshold' | 'fallback'

export interface RegionAnnouncement {
  /** us/uk → free shipping directly; eu → local threshold logic; other → neutral. */
  mode: RegionShippingMode
  /** dotted i18n key resolved against `announce.*` in every shipped locale. */
  i18nKey: string
}

// Pure region → announcement descriptor. US/UK ship free, so they say so directly;
// the EU market communicates the local free-shipping THRESHOLD (a conditional, not
// a blanket promise); every other region gets a neutral fallback that promises no
// free shipping it cannot keep. Deterministic and side-effect-free so it is fully
// testable without a network round-trip.
export function regionAnnouncement(region: Region): RegionAnnouncement {
  if (region === 'us' || region === 'uk') {
    return { mode: 'free', i18nKey: 'announce.freeActivated' }
  }
  if (region === 'eu') {
    return { mode: 'threshold', i18nKey: 'announce.shipping' }
  }
  return { mode: 'fallback', i18nKey: 'announce.fallback' }
}

// Asks the backend for the shipping region (derived server-side from the request
// IP / CDN geo header). Falls back to EU — the primary market — on any failure.
export async function fetchRegion(): Promise<Region> {
  try {
    const res = await fetch('/api/region')
    const data = await res.json().catch(() => ({}))
    const r = data && data.region
    return r === 'us' || r === 'uk' || r === 'eu' || r === 'other' ? r : 'eu'
  } catch {
    return 'eu'
  }
}
