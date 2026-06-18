export type Region = 'us' | 'uk' | 'eu' | 'other'

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
