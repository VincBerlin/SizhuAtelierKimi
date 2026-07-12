import { useEffect, useRef, useState } from 'react'
import { fetchChart, type BaziInput, type ExactChart } from '@/lib/baziClient'

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
