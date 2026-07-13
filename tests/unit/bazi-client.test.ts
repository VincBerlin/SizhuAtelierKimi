/**
 * src/lib/baziClient.ts — Frontend-Client für die Server-Proxy-Routen.
 * fetch gemockt; die reale Route ist in tests/integration/bazi-routes.test.js
 * abgedeckt, die reale API in scripts/evidence/fufire-smoke.mjs (Ledger).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchChart, resolvePlace } from '@/lib/baziClient'

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
const place = { lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchChart', () => {
  it('POSTs /api/bazi with flattened place and returns the exact chart', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(CHART), { status: 200 }))
    const c = await fetchChart({ date: '1990-06-15', time: '12:30', place, birthTimeUnknown: false })
    expect(spy.mock.calls[0][0]).toBe('/api/bazi')
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string)).toEqual({
      date: '1990-06-15',
      time: '12:30',
      lat: 52.52,
      lon: 13.405,
      tz: 'Europe/Berlin',
      birthTimeUnknown: false,
    })
    expect(c.pillars[0].stem).toBe('庚')
    expect(c.provenance.engine_version).toBe('x')
  })

  it('throws on non-200 (caller shows honest error state, never a fake chart)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"error":"x"}', { status: 502 }))
    await expect(fetchChart({ date: '1990-06-15', time: '12:30', place, birthTimeUnknown: false })).rejects.toThrow('502')
  })
})

describe('resolvePlace', () => {
  it('passes through ok / ambiguous / not_found statuses', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    spy.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'ok', ...place }), { status: 200 }))
    expect((await resolvePlace('Berlin')).status).toBe('ok')
    spy.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'ambiguous', candidates: [{ name: 'Elend', lat: 1, lon: 2, countryCode: 'DE' }] }), { status: 200 }),
    )
    const amb = await resolvePlace('Elend')
    expect(amb.status).toBe('ambiguous')
    spy.mockResolvedValueOnce(new Response(JSON.stringify({ status: 'not_found' }), { status: 200 }))
    expect((await resolvePlace('Xyz')).status).toBe('not_found')
  })
})
