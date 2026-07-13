/**
 * server/fulfillment.js — Webhook→PDF→Gelato-Pipeline. [INTEGRATION-FAKE]:
 * reale fulfillOrder/ensurePrintTables/Route-Pfade, gestubbt sind NUR die
 * Externen (fufire, gelato, pg-Pool). Die [REAL-ARTIFACT]/[REAL-BOUNDARY-LIVE]
 * Gegenproben sind scripts/evidence/pdf-artifact.mjs + fufire-smoke.mjs.
 *
 * HINWEIS RL-VITEST-ENV (Evidence-Ledger): auf der Autor-Maschine sammelt
 * Vitest derzeit 0 Tests (vorbestehender Umgebungsdefekt). Diese Suite ist
 * für CI / reparierte Umgebung geschrieben.
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { fulfillOrder, posterLinesFrom } from '../../server/fulfillment.js'
import { renderPosterPdf } from '../../server/pdf.js'
import { PRODUCT_UIDS } from '../../server/gelatoProducts.js'
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
  provenance: { engine_version: 'test', ruleset_id: 'r', tzdb_version_id: 'z' },
}

const P_LINE = {
  productType: 'bazi', name: 'Anna', date: '1990-06-15', time: '12:30',
  birthTimeUnknown: 'false', place: 'Berlin', placeResolved: 'Berlin',
  placeLat: '52.52', placeLon: '13.405', placeTz: 'Europe/Berlin',
  designId: 'klassik', size: 'A2', frame: 'Schwarz matt', frameHex: '#1B1B1B', bgHex: '#E9DFCB',
}

function fakePool() {
  const prints: any[] = []
  const queries: string[] = []
  return {
    prints,
    queries,
    async query(sql: string, params: any[] = []) {
      queries.push(sql)
      if (sql.startsWith('SELECT id, gelato_order_id FROM prints')) {
        return { rows: prints.filter((p) => p.stripe_session === params[0] && p.line_key === params[1]) }
      }
      if (sql.startsWith('SELECT 1 FROM prints')) {
        return { rows: prints.filter((p) => p.stripe_session === params[0] && p.gelato_order_id) }
      }
      if (sql.startsWith('SELECT line_key, token, design_id, size_id FROM prints')) {
        return { rows: prints.filter((p) => p.stripe_session === params[0]) }
      }
      if (sql.startsWith('SELECT token, pdf FROM prints')) {
        return { rows: prints.filter((p) => p.stripe_session === params[0]) }
      }
      if (sql.startsWith('INSERT INTO prints')) {
        prints.push({ stripe_session: params[0], line_key: params[1], token: params[2], design_id: params[3], size_id: params[4], pdf: params[5], gelato_order_id: null })
        return { rows: [] }
      }
      if (sql.startsWith('UPDATE prints SET gelato_order_id')) {
        for (const p of prints) if (p.stripe_session === params[1]) p.gelato_order_id = params[0]
        return { rows: [] }
      }
      return { rows: [] }
    },
  }
}

const fufireStub = { enabled: () => true, calculateBazi: async () => CHART, matchHehun: async () => ({ a: CHART, b: CHART, relation: { elementA: 'Metall', elementB: 'Wasser', wuxingRelation: 'a_generates_b', dayMasterA: 'Xin', dayMasterB: 'Gui' }, vectors: { order: null, a: null, b: null } }), geocodePlace: async () => ({}) }
const session = {
  id: 'cs_test_123', currency: 'eur',
  customer_details: { email: 'k@example.com', name: 'Kim Kunde' },
  shipping_details: { name: 'Kim Kunde', address: { line1: 'Weg 1', city: 'Berlin', postal_code: '10115', country: 'DE' } },
}

describe('posterLinesFrom', () => {
  it('selects only poster lines (designId+size present)', () => {
    const lines = posterLinesFrom({ line1: P_LINE, line2: { productType: 'digital', name: 'X' } })
    expect(lines).toHaveLength(1)
    expect(lines[0].lineKey).toBe('line1')
  })
})

describe('fulfillOrder', () => {
  it('renders a real pdf, stores it with a token, is idempotent on rerun', async () => {
    const pool = fakePool()
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato: null, publicUrl: 'https://shop.test' }
    const r1 = await fulfillOrder({ session, personalization: { line1: P_LINE }, deps })
    expect(r1.failed).toHaveLength(0)
    expect(r1.printed).toHaveLength(1)
    expect(pool.prints[0].pdf.subarray(0, 5).toString()).toBe('%PDF-')
    const r2 = await fulfillOrder({ session, personalization: { line1: P_LINE }, deps })
    expect(r2.printed[0]).toMatchObject({ reused: true })
    expect(pool.prints).toHaveLength(1) // NIE doppelt gedruckt
  })

  it('submits ONE gelato draft with the mapped productUid and never a second one', async () => {
    const pool = fakePool()
    const orders: any[] = []
    const gelato = { enabled: () => true, createOrder: async (o: any) => { orders.push(o); return { id: 'g-1', orderType: 'draft' } } }
    // Seit 2026-07-13 ist PRODUCT_UIDS live-verifiziert befüllt (RL-GELATO,
    // Artefakt 2026-07-13-gelato-uid-mapping.json) — der Test beweist jetzt den
    // Ziel-Vertrag: GENAU EIN Draft, mit der korrekt GEMAPPTEN productUid
    // (A2 + Schwarz matt → frs_a2 × frc_black), idempotent bei Webhook-Replay.
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato, publicUrl: 'https://shop.test' }
    const r = await fulfillOrder({ session, personalization: { line1: P_LINE }, deps })
    expect(r.failed).toHaveLength(0)
    expect(orders).toHaveLength(1)
    const item = orders[0].items[0]
    expect(item.productUid).toBe(PRODUCT_UIDS['A2|Schwarz matt'])
    expect(item.productUid).toContain('frs_a2')
    expect(item.productUid).toContain('frc_black')
    // fulfillOrder übergibt fileUrl; das files[]-Mapping macht erst der echte
    // Gelato-Client (server/gelato.js createOrder) — hier ist er gestubbt.
    expect(item.fileUrl).toMatch(/^https:\/\/shop\.test\/prints\//)
    expect(r.submitted).toHaveLength(1)
    // Webhook-Replay: kein zweiter Druck, kein zweiter Draft (Idempotenz).
    const r2 = await fulfillOrder({ session, personalization: { line1: P_LINE }, deps })
    expect(orders).toHaveLength(1)
    expect(r2.failed).toHaveLength(0)
  })

  it('marks failure loudly when fufire is down (no silent wrong print)', async () => {
    const pool = fakePool()
    const failing = { ...fufireStub, calculateBazi: async () => { throw new Error('down') } }
    const r = await fulfillOrder({ session, personalization: { line1: P_LINE }, deps: { pool, fufire: failing, renderPdf: renderPosterPdf, gelato: null, publicUrl: 'x' } })
    expect(r.failed).toHaveLength(1)
    expect(r.printed).toHaveLength(0)
  })
})

describe('GET /prints/:sessionId/:token.pdf', () => {
  it('serves the pdf for the right token and 404s a wrong one', async () => {
    const pool = fakePool()
    await fulfillOrder({ session, personalization: { line1: P_LINE }, deps: { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato: null, publicUrl: 'x' } })
    const token = pool.prints[0].token
    const app = createApp({ pool })
    const ok = await request(app).get(`/prints/${session.id}/${token}.pdf`)
    expect(ok.status).toBe(200)
    expect(ok.headers['content-type']).toContain('application/pdf')
    const bad = await request(app).get(`/prints/${session.id}/00000000-0000-0000-0000-000000000000.pdf`)
    expect(bad.status).toBe(404)
  })
})
