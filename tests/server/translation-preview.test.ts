/**
 * POST /api/translation/preview — [INTEGRATION-FAKE]: reale Express-Route via
 * createApp, nur der Übersetzungs-Provider ist gestubbt (Muster:
 * bazi-routes → astro-routes-removed). T-C03 der CJK-Migration.
 *
 * Ehrlichkeits-Verträge, die hier festgenagelt werden:
 *  1. Ohne Provider-Entscheid (GATE-PROVIDER) → 503, NIE erfundene Kandidaten.
 *  2. Provider-Fehler → 502, kein Fallback.
 *  3. Modus customer-cjk läuft OHNE Provider (nur Validierung).
 *  4. Cache: identische normalisierte Eingabe ruft den Provider genau einmal.
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'
import { clearTranslationCache } from '../../server/translation.js'

function makeProviderStub() {
  const stub = {
    calls: [] as unknown[],
    enabled: () => true,
    name: 'stub-provider',
    version: 'v-test-1',
    async translatePreview(input: unknown) {
      stub.calls.push(input)
      return {
        candidates: [
          { id: 'c1', text: 'ヴィンセント', romanization: 'Vinsento', backTranslation: 'Vincent' },
          { id: 'c2', text: 'ビンセント', romanization: 'Binsento', backTranslation: 'Vincent' },
        ],
        warnings: [],
      }
    },
  }
  return stub
}

describe('T-C03: /api/translation/preview', () => {
  it('503 provider-unselected im Auslieferungszustand (GATE-PROVIDER)', async () => {
    const app = createApp({})
    const res = await request(app)
      .post('/api/translation/preview')
      .send({ sourceText: 'Vincent', target: 'ja', mode: 'name' })
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ error: 'translation_unavailable', status: 'provider-unselected' })
  })

  it('liefert Draft-Kandidaten des Providers mit requestId/provider/version (V3 §6.1)', async () => {
    clearTranslationCache()
    const provider = makeProviderStub()
    const app = createApp({ translationProvider: provider })
    const res = await request(app)
      .post('/api/translation/preview')
      .send({ sourceText: '  Vincent  ', sourceLanguage: 'de', target: 'ja', mode: 'name', scriptVariant: 'katakana' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('draft')
    expect(res.body.requestId).toMatch(/^tr_/)
    expect(res.body.candidates).toHaveLength(2)
    expect(res.body.candidates[0]).toMatchObject({ id: 'c1', text: 'ヴィンセント', romanization: 'Vinsento' })
    expect(res.body.provider).toBe('stub-provider')
    expect(res.body.providerVersion).toBe('v-test-1')
    // Provider bekommt den NORMALISIERTEN Text (Trim), nie die Roheingabe.
    expect((provider.calls[0] as { sourceText: string }).sourceText).toBe('Vincent')
  })

  it('Cache: identische normalisierte Eingabe → Provider genau 1×', async () => {
    clearTranslationCache()
    const provider = makeProviderStub()
    const app = createApp({ translationProvider: provider })
    const body = { sourceText: 'CacheProbe', target: 'ja', mode: 'name' }
    const r1 = await request(app).post('/api/translation/preview').send(body)
    const r2 = await request(app).post('/api/translation/preview').send({ ...body, sourceText: '  CacheProbe ' })
    expect(r1.status).toBe(200)
    expect(r2.status).toBe(200)
    expect(provider.calls).toHaveLength(1)
    expect(r2.body.candidates).toEqual(r1.body.candidates)
    // requestId bleibt pro Antwort einzigartig (Cache betrifft Kandidaten, nicht Identität)
    expect(r2.body.requestId).not.toBe(r1.body.requestId)
  })

  it('Provider-Fehler → 502 ohne Fallback-Kandidaten', async () => {
    clearTranslationCache()
    const app = createApp({
      translationProvider: {
        enabled: () => true,
        name: 'broken',
        version: null,
        translatePreview: async () => {
          throw new Error('upstream down')
        },
      },
    })
    const res = await request(app)
      .post('/api/translation/preview')
      .send({ sourceText: 'FehlerProbe', target: 'ko', mode: 'name' })
    expect(res.status).toBe(502)
    expect(res.body).toEqual({ error: 'translation_failed' })
  })

  it('customer-cjk: gültiger Han-Text → self-Kandidat OHNE Provider', async () => {
    const app = createApp({ translationProvider: providerNeverCalled() })
    const res = await request(app)
      .post('/api/translation/preview')
      .send({ sourceText: '龍馬', target: 'zh-Hans', mode: 'customer-cjk' })
    expect(res.status).toBe(200)
    expect(res.body.candidates).toEqual([{ id: 'self', text: '龍馬' }])
    expect(res.body.provider).toBeNull()
  })

  it('customer-cjk: Latein für ko → 400 unsupported_script', async () => {
    const app = createApp({ translationProvider: providerNeverCalled() })
    const res = await request(app)
      .post('/api/translation/preview')
      .send({ sourceText: 'Vincent', target: 'ko', mode: 'customer-cjk' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('unsupported_script')
  })

  it.each([
    ['leer', { sourceText: '   ', target: 'ja', mode: 'name' }, 'empty_text'],
    ['zu lang', { sourceText: 'x'.repeat(41), target: 'ja', mode: 'name' }, 'too_long'],
    ['Steuerzeichen', { sourceText: 'Vin\tcent', target: 'ja', mode: 'name' }, 'forbidden_characters'],
    ['Zero-Width', { sourceText: 'Vin\u200Bcent', target: 'ja', mode: 'name' }, 'forbidden_characters'],
    ['Ziel ungültig', { sourceText: 'Vincent', target: 'en', mode: 'name' }, 'invalid_target'],
    ['Modus ungültig', { sourceText: 'Vincent', target: 'ja', mode: 'poem' }, 'invalid_mode'],
  ])('400 bei %s', async (_label, body, code) => {
    const app = createApp({ translationProvider: makeProviderStub() })
    const res = await request(app).post('/api/translation/preview').send(body)
    expect(res.status).toBe(400)
    expect(res.body.errors).toContain(code)
  })

  // BEWUSST LETZTER Test der Datei: verbraucht das Rate-Limit-Fenster.
  it('Rate-Limit greift (429 innerhalb von 40 Versuchen)', async () => {
    const app = createApp({ translationProvider: makeProviderStub() })
    let got429 = false
    for (let i = 0; i < 40; i++) {
      const res = await request(app)
        .post('/api/translation/preview')
        .send({ sourceText: `Probe${i}`, target: 'ja', mode: 'name' })
      if (res.status === 429) {
        got429 = true
        break
      }
    }
    expect(got429).toBe(true)
  })
})

function providerNeverCalled() {
  return {
    enabled: () => true,
    name: 'never',
    version: null,
    translatePreview: async () => {
      throw new Error('Provider darf im Modus customer-cjk nie aufgerufen werden')
    },
  }
}
