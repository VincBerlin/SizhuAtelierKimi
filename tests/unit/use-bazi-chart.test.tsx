/**
 * useBaziChart — Debounce, Race-Guard, ehrlicher Fehlerzustand.
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
      vi.advanceTimersByTime(300)
    })
    vi.useRealTimers()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.chart!.pillars[3].branch).toBe('未')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('sets error status on failure (no silent placeholder)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 502 }))
    const { result } = renderHook(() => useBaziChart(input))
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    vi.useRealTimers()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.chart).toBeNull()
  })

  it('coalesces rapid input changes into one fetch (debounce)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(CHART), { status: 200 }))
    const { result, rerender } = renderHook(({ inp }) => useBaziChart(inp), { initialProps: { inp: input } })
    await act(async () => {
      vi.advanceTimersByTime(150)
    })
    rerender({ inp: { ...input, time: '13:30' } })
    await act(async () => {
      vi.advanceTimersByTime(150)
    })
    expect(spy).not.toHaveBeenCalled() // erster Timer wurde gecancelt
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    vi.useRealTimers()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string).time).toBe('13:30')
  })
})
