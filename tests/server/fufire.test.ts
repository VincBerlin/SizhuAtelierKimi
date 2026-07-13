/**
 * server/fufire.js — FuFirE-Client-Unit-Tests (Vitest-Projekt `node`).
 *
 * LIVE_FIXTURE ist die am 2026-07-11 real von bafe-production erhaltene
 * Response des kanonischen Testfalls (1990-06-15 12:30 Berlin, TLST),
 * gekürzt auf die verwendeten Felder. [REAL-BOUNDARY-LIVE]-Gegenprobe:
 * scripts/evidence/fufire-smoke.mjs (Task 3).
 */
import { describe, it, expect } from 'vitest'
import { normalizeChart, calculateBazi, geocodePlace, FufireError } from '../../server/fufire.js'

const LIVE_FIXTURE = {
  pillars: {
    year: { stamm: 'Geng', zweig: 'Wu', tier: 'Pferd', element: 'Metall' },
    month: { stamm: 'Ren', zweig: 'Wu', tier: 'Pferd', element: 'Wasser' },
    day: { stamm: 'Xin', zweig: 'Hai', tier: 'Schwein', element: 'Metall' },
    hour: { stamm: 'Yi', zweig: 'Wei', tier: 'Ziege', element: 'Holz' },
  },
  provenance: {
    engine_version: '1.0.0-rc1-20260220',
    ruleset_id: 'traditional_bazi_2026',
    tzdb_version_id: '2026.2',
  },
}

describe('normalizeChart', () => {
  it('maps pinyin stems/branches to hanzi and keeps German animal/element', () => {
    const c = normalizeChart(LIVE_FIXTURE)
    expect(c.pillars).toEqual([
      { label: '年', stem: '庚', branch: '午' },
      { label: '月', stem: '壬', branch: '午' },
      { label: '日', stem: '辛', branch: '亥' },
      { label: '時', stem: '乙', branch: '未' },
    ])
    expect(c.animal).toBe('Pferd')
    expect(c.element).toBe('Metall')
    expect(c.provenance.engine_version).toBe('1.0.0-rc1-20260220')
  })

  it('distinguishes stem-Wu (戊) from branch-Wu (午) — the collision trap', () => {
    const c = normalizeChart({
      ...LIVE_FIXTURE,
      pillars: {
        ...LIVE_FIXTURE.pillars,
        year: { stamm: 'Wu', zweig: 'Wu', tier: 'Pferd', element: 'Erde' },
      },
    })
    expect(c.pillars[0]).toEqual({ label: '年', stem: '戊', branch: '午' })
  })

  it('throws FufireError on unknown pinyin (never silently prints wrong glyphs)', () => {
    const bad = {
      ...LIVE_FIXTURE,
      pillars: { ...LIVE_FIXTURE.pillars, year: { stamm: 'Nope', zweig: 'Wu', tier: 'x', element: 'x' } },
    }
    expect(() => normalizeChart(bad)).toThrow(FufireError)
  })

  it('throws FufireError on malformed response', () => {
    expect(() => normalizeChart({})).toThrow(FufireError)
    expect(() => normalizeChart({ pillars: { year: {} } })).toThrow(FufireError)
  })
})

describe('calculateBazi', () => {
  const env = { apiUrl: 'https://fufire.test', apiKey: 'ff_test_key' }

  it('POSTs to /v1/calculate/bazi with pinned standard and normalizes', async () => {
    let captured
    const fetchImpl = async (url, opts) => {
      captured = { url, body: JSON.parse(opts.body), headers: opts.headers }
      return { ok: true, status: 200, json: async () => LIVE_FIXTURE }
    }
    const c = await calculateBazi(
      { date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.405, lat: 52.52, birthTimeKnown: true },
      fetchImpl,
      env,
    )
    expect(captured.url).toBe('https://fufire.test/v1/calculate/bazi')
    expect(captured.body.standard).toBe('TLST')
    expect(captured.body.boundary).toBe('midnight')
    expect(captured.body.include_trace).toBe(false)
    expect(captured.body.birth_time_known).toBe(true)
    expect(captured.headers['X-API-Key']).toBe('ff_test_key')
    expect(c.pillars[2]).toEqual({ label: '日', stem: '辛', branch: '亥' })
  })

  it('maps upstream failure to FufireError with status', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503, json: async () => ({ error: 'down' }) })
    await expect(
      calculateBazi({ date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.4, lat: 52.5, birthTimeKnown: true }, fetchImpl, env),
    ).rejects.toMatchObject({ status: 503 })
  })

  it('throws 503 FufireError when not configured (env-gated, honest degradation)', async () => {
    await expect(
      calculateBazi({ date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.4, lat: 52.5, birthTimeKnown: true }, fetch, { apiUrl: '', apiKey: '' }),
    ).rejects.toMatchObject({ status: 503 })
  })
})

describe('geocodePlace', () => {
  const env = { apiUrl: 'https://fufire.test', apiKey: 'ff_test_key' }

  it('maps 200 to status ok', async () => {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ lat: 52.52, lon: 13.41, resolved_name: 'Berlin', timezone: 'Europe/Berlin', country_code: 'DE', confidence: 1 }),
    })
    expect(await geocodePlace('Berlin', 'de', fetchImpl, env)).toEqual({
      status: 'ok', lat: 52.52, lon: 13.41, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE',
    })
  })

  it('maps 422 ambiguous_place to candidates', async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 422,
      json: async () => ({ error: 'ambiguous_place', candidates: [{ name: 'Elend', lat: 51.7, lon: 10.7, country_code: 'DE' }] }),
    })
    const r = await geocodePlace('Elend', 'de', fetchImpl, env)
    expect(r.status).toBe('ambiguous')
    expect(r.candidates[0]).toEqual({ name: 'Elend', lat: 51.7, lon: 10.7, countryCode: 'DE' })
  })

  it('maps 404 place_not_found to not_found', async () => {
    const fetchImpl = async () => ({ ok: false, status: 404, json: async () => ({ error: 'place_not_found' }) })
    expect((await geocodePlace('Xyz', 'de', fetchImpl, env)).status).toBe('not_found')
  })
})
