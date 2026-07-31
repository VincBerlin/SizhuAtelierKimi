/**
 * T-B03 CJK-Migration (docs/plans/2026-07-31-cjk-migration.md, Phase B):
 * Die öffentlichen Astro-Routen sind ENTFERNT — nicht bloß env-gated.
 *
 * Deshalb wird hier ein voll AKTIVIERTER FuFirE-Stub injiziert: antwortete
 * irgendeine der Routen noch (200/503/502 statt 404), wäre die Oberfläche nur
 * abgeschaltet statt entfernt und dieser Test fiele. REQ: AK02 (Route-Hälfte;
 * Secrets/Modul folgen mit T-G01/T-I02 — fufire bleibt bis dahin bewusst
 * fulfillment-intern für bezahlte Alt-Bestellungen).
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

const enabledFufireStub = {
  enabled: () => true,
  calculateBazi: async () => {
    throw new Error('darf nie erreicht werden — Route existiert nicht mehr')
  },
  calculateWestern: async () => {
    throw new Error('darf nie erreicht werden')
  },
  matchHehun: async () => {
    throw new Error('darf nie erreicht werden')
  },
  geocodePlace: async () => {
    throw new Error('darf nie erreicht werden')
  },
}

describe('T-B03: Astro-API-Oberfläche entfernt', () => {
  const app = createApp({ fufire: enabledFufireStub })

  const gone = [
    ['/api/bazi', { date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.41, tz: 'Europe/Berlin' }],
    ['/api/western', { date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.41, tz: 'Europe/Berlin' }],
    ['/api/match', { a: {}, b: {} }],
    ['/api/geocode', { place: 'Berlin' }],
  ] as const

  for (const [path, body] of gone) {
    it(`POST ${path} → 404 (auch mit aktiviertem FuFirE-Stub)`, async () => {
      const res = await request(app).post(path).send(body)
      expect(res.status).toBe(404)
    })
  }

  it('Kontrollprobe: /api/health existiert weiterhin', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
  })
})
