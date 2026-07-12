// Client für die Server-Proxy-Routen (/api/bazi, /api/geocode). Der Browser
// spricht NIE direkt mit FuFirE — der API-Key lebt ausschließlich auf dem
// Server (server/fufire.js). Policy AT-013-3 bleibt gewahrt: kein öffentlicher
// Geocoder-Host in src/, nur die eigene Route, aufgerufen bei ORTS-AUSWAHL
// (nie pro Tastendruck — die Tipp-Vorschläge kommen weiter aus cities.ts).
import type { ChartResult } from './bazi'

export interface Provenance {
  engine_version: string | null
  ruleset_id: string | null
  tzdb_version_id: string | null
}

export type ExactChart = ChartResult & { provenance: Provenance }

export interface ResolvedPlace {
  lat: number
  lon: number
  tz: string
  resolvedName: string
  countryCode: string
}

export interface BaziInput {
  date: string
  time: string
  place: ResolvedPlace
  birthTimeUnknown: boolean
}

export interface PlaceCandidate {
  name: string
  lat: number
  lon: number
  countryCode: string
}

export type GeocodeResult =
  | ({ status: 'ok' } & ResolvedPlace)
  | { status: 'ambiguous'; candidates: PlaceCandidate[] }
  | { status: 'not_found' }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${url} failed (${res.status})`)
  return (await res.json()) as T
}

export function fetchChart(input: BaziInput): Promise<ExactChart> {
  return postJson<ExactChart>('/api/bazi', {
    date: input.date,
    time: input.time,
    lat: input.place.lat,
    lon: input.place.lon,
    tz: input.place.tz,
    birthTimeUnknown: input.birthTimeUnknown,
  })
}

export function resolvePlace(place: string): Promise<GeocodeResult> {
  return postJson<GeocodeResult>('/api/geocode', { place })
}
