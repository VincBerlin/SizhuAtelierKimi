/**
 * useBaziChart — Debounce, Race-Guard, ehrlicher Fehlerzustand.
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useBaziChart } from '@/hooks/useBaziChart'
import type { BaziInput } from '@/lib/baziClient'

const CHART = {
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
  animal: 'Pferd',
  element: 'Metall',
  provenance: { engine_version: 'x', ruleset_id: 'y', tzdb_version_id: 'z' },
}
const input: BaziInput = {
  date: '1990-06-15',
  time: '12:30',
  place: { lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' },
  birthTimeUnknown: false,
}

// EINE Fake-Uhr für die GANZE Datei — nie mid-test auf useRealTimers wechseln:
// Reacts Scheduler cached seine Timer-Referenz beim ersten Laden; nach einem
// Uhrwechsel hängen Passive-Effect-Flushes (inkl. Debounce-Timer-CANCEL im
// Effekt-Cleanup) an einer toten Uhr, und Folgetests sehen Geister-Fetches
// (Fund 2026-07-13 via Bisektion: jeder Sibling mit mid-test useRealTimers
// vergiftete den Coalesce-Test; der Hook selbst war korrekt).
// Statt useRealTimers+waitFor: advanceTimersByTimeAsync — treibt Fake-Timer
// UND Microtasks (Fetch-Promise-Ketten) deterministisch bis zum Settled-State.
beforeAll(() => {
  vi.useFakeTimers()
})
afterAll(() => {
  vi.useRealTimers()
})
afterEach(() => {
  // Explizit: Hook-Instanz unmounten UND übrige Fake-Timer wegräumen, damit
  // kein Sibling-Debounce-Timer ins Zeitfenster des nächsten Tests leakt
  // (Bisektions-Fund 2026-07-13: Geister-Fetches mit dem Input des VORHERIGEN
  // Tests — der Auto-Cleanup allein räumte die geteilte Fake-Uhr nicht).
  cleanup()
  vi.clearAllTimers()
  vi.restoreAllMocks()
})

describe('useBaziChart', () => {
  it('is idle with null input and never fetches', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useBaziChart(null))
    expect(result.current.status).toBe('idle')
    expect(result.current.chart).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })

  it('debounces 300ms, then resolves to ready with the exact chart', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(CHART), { status: 200 }))
    const { result } = renderHook(() => useBaziChart(input))
    expect(result.current.status).toBe('loading')
    expect(spy).not.toHaveBeenCalled() // noch im Debounce-Fenster
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(result.current.status).toBe('ready')
    expect(result.current.chart!.pillars[3].branch).toBe('未')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('sets error status on failure (no silent placeholder)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 502 }))
    const { result } = renderHook(() => useBaziChart(input))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(result.current.status).toBe('error')
    expect(result.current.chart).toBeNull()
  })

  // Der Koaleszenz-Test (genau EIN Fetch mit dem neuesten Wert) lebt in der
  // EIGENEN Datei use-bazi-chart.debounce.test.tsx: nach Siblings mit eigenem
  // renderHook+Fake-Timer-Zyklus feuerten deren Debounce-Timer als Geister-
  // Fetches in sein Zeitfenster (Bisektion + 11:11-Sonde, 2026-07-13).
  // Datei-Isolation macht die Leckage strukturell unmöglich.
})
