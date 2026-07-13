import { useEffect, useRef, useState } from 'react'
import { fetchChart, fetchPairChart, type BaziInput, type ExactChart, type PairChart } from '@/lib/baziClient'

export type BaziStatus = 'idle' | 'loading' | 'ready' | 'error'
const DEBOUNCE_MS = 300

/**
 * Debounced exakte Chart-Berechnung über /api/bazi (FuFirE-Proxy).
 * input=null → idle (kein Fetch). Race-sicher: nur die jeweils LETZTE Anfrage
 * darf den State setzen (requestId-Guard), damit eine langsame alte Antwort
 * nie ein neueres Chart überschreibt.
 * Ehrlichkeits-Regel (OQ-004): Fehler → status 'error' + chart null —
 * NIEMALS still ein Platzhalter-Chart.
 */
export function useBaziChart(input: BaziInput | null): { chart: ExactChart | null; status: BaziStatus } {
  const [chart, setChart] = useState<ExactChart | null>(null)
  const [status, setStatus] = useState<BaziStatus>('idle')
  const requestId = useRef(0)

  const key = input
    ? JSON.stringify([input.date, input.time, input.place.lat, input.place.lon, input.place.tz, input.birthTimeUnknown])
    : null

  useEffect(() => {
    if (!input || !key) {
      requestId.current += 1
      setChart(null)
      setStatus('idle')
      return
    }
    setStatus('loading')
    const id = ++requestId.current
    const timer = setTimeout(() => {
      fetchChart(input)
        .then((c) => {
          if (requestId.current === id) {
            setChart(c)
            setStatus('ready')
          }
        })
        .catch(() => {
          if (requestId.current === id) {
            setChart(null)
            setStatus('error')
          }
        })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { chart, status }
}

/** Schwester-Hook für das Partner-Poster: beide Inputs vollständig → eine
 *  debouncte /api/match-Anfrage. Gleiche Semantik (idle/loading/ready/error,
 *  Race-Guard, kein stiller Platzhalter). */
export function usePairChart(a: BaziInput | null, b: BaziInput | null): { pair: PairChart | null; status: BaziStatus } {
  const [pair, setPair] = useState<PairChart | null>(null)
  const [status, setStatus] = useState<BaziStatus>('idle')
  const requestId = useRef(0)

  const key = a && b
    ? JSON.stringify([
        a.date, a.time, a.place.lat, a.place.lon, a.place.tz, a.birthTimeUnknown,
        b.date, b.time, b.place.lat, b.place.lon, b.place.tz, b.birthTimeUnknown,
      ])
    : null

  useEffect(() => {
    if (!a || !b || !key) {
      requestId.current += 1
      setPair(null)
      setStatus('idle')
      return
    }
    setStatus('loading')
    const id = ++requestId.current
    const timer = setTimeout(() => {
      fetchPairChart(a, b)
        .then((p) => {
          if (requestId.current === id) {
            setPair(p)
            setStatus('ready')
          }
        })
        .catch(() => {
          if (requestId.current === id) {
            setPair(null)
            setStatus('error')
          }
        })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { pair, status }
}
