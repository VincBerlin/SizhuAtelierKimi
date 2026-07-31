/**
 * POST /api/translation/confirm + translationStore-Statusmaschine —
 * [INTEGRATION-FAKE] (reale Route via createApp, Postgres durch Fake-Pool
 * ersetzt). T-C03/T-C04 der CJK-Migration.
 *
 * Verträge: Persistiert wird ERST die Kundenbestätigung (customer_selected);
 * ohne DB → 503; verbotene Statusübergänge werfen; Freigabe-Rennen können
 * nicht doppelt gewinnen (UPDATE mit Ist-Status-Guard).
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'
import {
  ALLOWED_STATUS_TRANSITIONS,
  TranslationTransitionError,
  createTranslationJob,
  transitionTranslationJob,
} from '../../server/translationStore.js'

interface CapturedQuery {
  sql: string
  params: unknown[]
}

function makeFakePool(rowsByMatch: Array<{ match: RegExp; rows: unknown[] }> = []) {
  const captured: CapturedQuery[] = []
  return {
    captured,
    async query(sql: string, params: unknown[] = []) {
      captured.push({ sql, params })
      for (const { match, rows } of rowsByMatch) {
        if (match.test(sql)) return { rows }
      }
      return { rows: [] }
    },
  }
}

describe('T-C03: /api/translation/confirm', () => {
  const validBody = {
    sourceText: 'Vincent',
    sourceLanguage: 'de',
    target: 'ja',
    mode: 'name',
    scriptVariant: 'katakana',
    selectedCandidateId: 'c1',
    finalText: 'ヴィンセント',
    romanization: 'Vinsento',
    provider: 'stub-provider',
    providerVersion: 'v-test-1',
    candidates: [{ id: 'c1', text: 'ヴィンセント' }],
  }

  it('503 ohne Datenbank (kein stilles Vergessen der Bestätigung)', async () => {
    const app = createApp({ pool: null })
    const res = await request(app).post('/api/translation/confirm').send(validBody)
    expect(res.status).toBe(503)
    expect(res.body).toEqual({ error: 'store_unavailable' })
  })

  it('201: legt Job mit Status customer_selected und vollem Snapshot an', async () => {
    const pool = makeFakePool()
    const app = createApp({ pool })
    const res = await request(app).post('/api/translation/confirm').send(validBody)
    expect(res.status).toBe(201)
    expect(res.body.translationStatus).toBe('customer_selected')
    expect(res.body.jobId).toMatch(/^[0-9a-f-]{36}$/)
    const insert = pool.captured.find((q) => q.sql.includes('INSERT INTO translation_jobs'))
    expect(insert).toBeTruthy()
    const p = insert!.params
    // (id, user_id, source_text, source_language, target, script_variant, mode,
    //  candidates, selected_candidate, status, provider, provider_version)
    expect(p[2]).toBe('Vincent')
    expect(p[4]).toBe('ja')
    expect(p[6]).toBe('name')
    expect(JSON.parse(p[8] as string)).toMatchObject({ id: 'c1', text: 'ヴィンセント', romanization: 'Vinsento' })
    expect(p[9]).toBe('customer_selected')
    expect(p[10]).toBe('stub-provider')
  })

  it('400 ohne selectedCandidateId', async () => {
    const app = createApp({ pool: makeFakePool() })
    const res = await request(app)
      .post('/api/translation/confirm')
      .send({ ...validBody, selectedCandidateId: '' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('missing_candidate_id')
  })

  it('400 bei ungültigem finalText (Steuerzeichen)', async () => {
    const app = createApp({ pool: makeFakePool() })
    const res = await request(app)
      .post('/api/translation/confirm')
      .send({ ...validBody, finalText: 'ヴィンセ\u0007ント' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('invalid_final_text')
  })

  it('customer-cjk: finalText im falschen Schriftsystem → 400', async () => {
    const app = createApp({ pool: makeFakePool() })
    const res = await request(app)
      .post('/api/translation/confirm')
      .send({ ...validBody, mode: 'customer-cjk', target: 'ko', sourceText: '한글', finalText: '漢字' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('unsupported_script')
  })
})

describe('T-C04: Statusmaschine (translationStore)', () => {
  it('createTranslationJob schreibt customer_selected', async () => {
    const pool = makeFakePool()
    const job = await createTranslationJob(pool as never, {
      sourceText: 'Vincent',
      targetLanguage: 'ja',
      mode: 'name',
      candidates: [],
      selectedCandidate: { id: 'c1', text: 'ヴィンセント' },
    })
    expect(job.status).toBe('customer_selected')
  })

  it('erlaubter Übergang customer_selected → review_required', async () => {
    const row = { id: 'j1', status: 'customer_selected' }
    const pool = makeFakePool([
      { match: /^SELECT \* FROM translation_jobs/, rows: [row] },
      { match: /^UPDATE translation_jobs/, rows: [{ ...row, status: 'review_required' }] },
    ])
    const updated = await transitionTranslationJob(pool as never, 'j1', 'review_required')
    expect(updated.status).toBe('review_required')
  })

  it('verbotener Übergang draft → printed wirft TranslationTransitionError', async () => {
    const pool = makeFakePool([{ match: /^SELECT \* FROM translation_jobs/, rows: [{ id: 'j1', status: 'draft' }] }])
    await expect(transitionTranslationJob(pool as never, 'j1', 'printed')).rejects.toBeInstanceOf(
      TranslationTransitionError,
    )
  })

  it('Rennen: UPDATE greift nicht mehr (Status parallel geändert) → wirft', async () => {
    const pool = makeFakePool([
      { match: /^SELECT \* FROM translation_jobs/, rows: [{ id: 'j1', status: 'review_required' }] },
      { match: /^UPDATE translation_jobs/, rows: [] },
    ])
    await expect(transitionTranslationJob(pool as never, 'j1', 'approved')).rejects.toBeInstanceOf(
      TranslationTransitionError,
    )
  })

  it('druckbar ist AUSSCHLIESSLICH approved → printed', () => {
    for (const [from, tos] of Object.entries(ALLOWED_STATUS_TRANSITIONS)) {
      if (from === 'approved') expect(tos).toContain('printed')
      else expect(tos).not.toContain('printed')
    }
  })
})
