/**
 * POST /api/bazi + /api/geocode — [INTEGRATION-FAKE] (höchste in diesem Lauf
 * erreichbare Klasse für die Route selbst): die REALE Express-Route läuft via
 * `createApp` (Muster: tests/integration/checkout.repricing.test.ts), NUR der
 * externe FuFirE-Client ist gestubbt. Die [REAL-BOUNDARY-LIVE]-Gegenprobe der
 * echten API ist scripts/evidence/fufire-smoke.mjs (Evidence-Ledger).
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

const CHART = {
  pillars: [
    { label: '年', stem: '庚', branch: '午' },
    { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' },
    { label: '時', stem: '乙', branch: '未' },
  ],
  animal: 'Pferd',
  element: 'Metall',
  provenance: { engine_version: '1.0.0-rc1-20260220', ruleset_id: 'traditional_bazi_2026', tzdb_version_id: '2026.2' },
}

function makeFufireStub() {
  const stub = {
    enabled: () => true,
    calculateBazi: async (input) => {
      stub.lastInput = input
      return CHART
    },
    geocodePlace: async (place) => {
      stub.lastPlace = place
      return { status: 'ok', lat: 52.52, lon: 13.41, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }
    },
  }
  return stub
}

describe('POST /api/bazi', () => {
  it('combines date+time into local ISO and returns the normalized chart', async () => {
    const fufire = makeFufireStub()
    const app = createApp({ fufire })
    const r = await request(app)
      .post('/api/bazi')
      .send({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin' })
    expect(r.status).toBe(200)
    expect(r.body.pillars[3]).toEqual({ label: '時', stem: '乙', branch: '未' })
    expect(fufire.lastInput.date).toBe('1990-06-15T12:30:00')
    expect(fufire.lastInput.birthTimeKnown).toBe(true)
  })

  it('passes birthTimeUnknown through as birthTimeKnown=false', async () => {
    const fufire = makeFufireStub()
    const app = createApp({ fufire })
    const r = await request(app)
      .post('/api/bazi')
      .send({ date: '1990-06-15', time: '12:00', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', birthTimeUnknown: true })
    expect(r.status).toBe(200)
    expect(fufire.lastInput.birthTimeKnown).toBe(false)
  })

  it('rejects malformed date/time/place with 400 (validation at the boundary)', async () => {
    const app = createApp({ fufire: makeFufireStub() })
    expect((await request(app).post('/api/bazi').send({ date: 'nope', time: '12:30', lat: 52.52, lon: 13.4, tz: 'Europe/Berlin' })).status).toBe(400)
    expect((await request(app).post('/api/bazi').send({ date: '1990-06-15', time: 'x', lat: 52.52, lon: 13.4, tz: 'Europe/Berlin' })).status).toBe(400)
    expect((await request(app).post('/api/bazi').send({ date: '1990-06-15', time: '12:30', lat: 'x', lon: 13.4, tz: 'Europe/Berlin' })).status).toBe(400)
    expect((await request(app).post('/api/bazi').send({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.4 })).status).toBe(400)
  })

  it('returns 503 when fufire is not configured (honest degradation, no fake chart)', async () => {
    const app = createApp({ fufire: { ...makeFufireStub(), enabled: () => false } })
    const r = await request(app)
      .post('/api/bazi')
      .send({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.4, tz: 'Europe/Berlin' })
    expect(r.status).toBe(503)
  })

  it('maps upstream failure to 502 without leaking details', async () => {
    const failing = {
      ...makeFufireStub(),
      calculateBazi: async () => {
        const e = new Error('secret internal detail')
        e.status = 503
        throw e
      },
    }
    const app = createApp({ fufire: failing })
    const r = await request(app)
      .post('/api/bazi')
      .send({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.4, tz: 'Europe/Berlin' })
    expect(r.status).toBe(502)
    expect(JSON.stringify(r.body)).not.toContain('secret internal detail')
  })
})

describe('POST /api/geocode', () => {
  it('returns the resolved place', async () => {
    const app = createApp({ fufire: makeFufireStub() })
    const r = await request(app).post('/api/geocode').send({ place: 'Berlin' })
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({ status: 'ok', tz: 'Europe/Berlin', resolvedName: 'Berlin' })
  })

  it('rejects empty/overlong place with 400', async () => {
    const app = createApp({ fufire: makeFufireStub() })
    expect((await request(app).post('/api/geocode').send({ place: '' })).status).toBe(400)
    expect((await request(app).post('/api/geocode').send({ place: 'x'.repeat(201) })).status).toBe(400)
  })

  it('returns 503 when fufire is not configured', async () => {
    const app = createApp({ fufire: { ...makeFufireStub(), enabled: () => false } })
    expect((await request(app).post('/api/geocode').send({ place: 'Berlin' })).status).toBe(503)
  })
})
