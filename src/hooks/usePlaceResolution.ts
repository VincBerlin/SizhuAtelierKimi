import { useState } from 'react'
import { resolvePlace, type ResolvedPlace, type PlaceCandidate } from '@/lib/baziClient'

export type PlaceStatus = 'idle' | 'resolving' | 'ok' | 'ambiguous' | 'not_found' | 'error'

/**
 * Orts-Auflösung für ein Geburtsort-Feld (REQ-013 + Exaktheit).
 * Aufgerufen NUR bei Auswahl/Blur (Policy AT-013-3 — nie pro Tastendruck).
 * Mehrdeutig → Kandidatenliste; nicht gefunden → Nachbarort-Hinweis;
 * nie ein stiller Default.
 */
export function usePlaceResolution() {
  const [place, setPlace] = useState<ResolvedPlace | null>(null)
  const [candidates, setCandidates] = useState<PlaceCandidate[] | null>(null)
  const [status, setStatus] = useState<PlaceStatus>('idle')

  const resolve = async (value: string) => {
    const q = value.trim()
    if (!q) {
      setPlace(null)
      setCandidates(null)
      setStatus('idle')
      return
    }
    if (place && place.resolvedName === q) return // Blur direkt nach Pick
    setStatus('resolving')
    try {
      const r = await resolvePlace(q)
      if (r.status === 'ok') {
        setPlace({ lat: r.lat, lon: r.lon, tz: r.tz, resolvedName: r.resolvedName, countryCode: r.countryCode })
        setCandidates(null)
        setStatus('ok')
      } else if (r.status === 'ambiguous') {
        setPlace(null)
        setCandidates(r.candidates)
        setStatus('ambiguous')
      } else {
        setPlace(null)
        setCandidates(null)
        setStatus('not_found')
      }
    } catch {
      setPlace(null)
      setCandidates(null)
      setStatus('error')
    }
  }

  /** Kandidat gewählt → mit Landes-Suffix erneut auflösen (liefert Zeitzone). */
  const pickCandidate = (c: PlaceCandidate) => {
    setCandidates(null)
    void resolve(`${c.name}, ${c.countryCode}`)
  }

  return { place, candidates, status, resolve, pickCandidate }
}
