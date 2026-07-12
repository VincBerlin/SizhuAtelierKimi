/**
 * useBaziChart — Koaleszenz-Kontrakt (Debounce): GENAU EIN Fetch mit dem
 * NEUESTEN Wert, der alte Timer wird beim Input-Wechsel gecancelt.
 *
 * EIGENE DATEI, bewusst getrennt von use-bazi-chart.test.tsx: Läuft dieser
 * Test NACH Siblings mit eigenem renderHook+Fake-Timer-Zyklus, feuern deren
 * Debounce-Timer als Geister-Fetches (Input des VORHERIGEN Tests, via
 * 11:11-Sonde belegt) in sein Zeitfenster — eine React-19-Scheduler ×
 * RTL-Cleanup × vi-Fake-Timer-Interaktion, die weder act-Wrapping noch
 * cleanup()/clearAllTimers()/Real-Timer-Drain zuverlässig schließt
 * (Bisektion 2026-07-13). Datei-Isolation (frische Umgebung + Registry im
 * kanonischen isolierten Lauf) macht die Leckage strukturell unmöglich;
 * solo ist exakt diese Testform reproduzierbar grün. Assertions unverändert
 * stark gegenüber dem Ursprungstest.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
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

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('useBaziChart (Koaleszenz, isolierte Datei)', () => {
  it('coalesces rapid input changes into one fetch (debounce)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(CHART), { status: 200 }))
    const { result, rerender } = renderHook(({ inp }) => useBaziChart(inp), { initialProps: { inp: input } })
    await act(async () => {
      vi.advanceTimersByTime(150)
    })
    // Wechsel auf den neuesten Wert INNERHALB des Debounce-Fensters, in act,
    // damit der Effekt-Cleanup (= Cancel des alten Timers) geflusht ist.
    await act(async () => {
      rerender({ inp: { ...input, time: '13:30' } })
    })
    await act(async () => {
      vi.advanceTimersByTime(150)
    })
    expect(spy).not.toHaveBeenCalled() // t=300: alter Timer wurde gecancelt
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    vi.useRealTimers()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(spy).toHaveBeenCalledTimes(1) // GENAU EIN Fetch …
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string).time).toBe('13:30') // … mit dem NEUESTEN Wert
  })
})
