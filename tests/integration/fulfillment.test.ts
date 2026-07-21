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
import { fulfillOrder, posterLinesFrom, catalogPosterLinesFrom } from '../../server/fulfillment.js'
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

// Zeilen der fakePool-prints-Tabelle (R7-Lint-Nachfix: typisiert statt `any`).
interface PrintRow {
  stripe_session: unknown
  line_key: unknown
  token: unknown
  design_id: unknown
  size_id: unknown
  pdf: Buffer
  gelato_order_id: string | null
}

// Form der an den Gelato-Stub übergebenen Order (nur die geprüften Felder).
interface GelatoOrderStub {
  items: Array<{ itemReferenceId: string; productUid: string; quantity: number; fileUrl: string }>
}

function fakePool() {
  const prints: PrintRow[] = []
  const queries: string[] = []
  return {
    prints,
    queries,
    async query(sql: string, params: unknown[] = []) {
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
    const orders: GelatoOrderStub[] = []
    const gelato = { enabled: () => true, createOrder: async (o: GelatoOrderStub) => { orders.push(o); return { id: 'g-1', orderType: 'draft' } } }
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

  it('Batch#12 R4 (#10): akzeptiert das ANZEIGE-Label als Format („50 × 70") und speichert die kanonische size_id', async () => {
    // Der Live-Personalize-Flow schreibt personalization.size = size.LABEL
    // („50 × 70"), PRINT_SPECS ist aber über IDs („50x70") gekeyt — vor R4
    // wäre JEDE echte personalisierte Bestellung hier mit „Unknown print
    // size" gescheitert. resolvePrintSizeId (printSpecs.js) normalisiert;
    // unbekannte Formate bleiben ein LAUTER Fehler (nie stille Zuordnung).
    const pool = fakePool()
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato: null, publicUrl: 'https://shop.test' }
    const labelLine = { ...P_LINE, size: '50 × 70' }
    const r = await fulfillOrder({ session: { ...session, id: 'cs_label_1' }, personalization: { line1: labelLine }, deps })
    expect(r.failed).toHaveLength(0)
    expect(r.printed).toHaveLength(1)
    expect(pool.prints[0].size_id).toBe('50x70')
    expect(pool.prints[0].pdf.subarray(0, 5).toString()).toBe('%PDF-')

    // Unbekanntes Format → lauter Fehler, kein Druck (nie falsche Zuordnung).
    const badLine = { ...P_LINE, size: 'B1 Riesig' }
    const rBad = await fulfillOrder({ session: { ...session, id: 'cs_label_2' }, personalization: { line1: badLine }, deps })
    expect(rBad.failed).toHaveLength(1)
    expect(rBad.printed).toHaveLength(0)
  })

  it('marks failure loudly when fufire is down (no silent wrong print)', async () => {
    const pool = fakePool()
    const failing = { ...fufireStub, calculateBazi: async () => { throw new Error('down') } }
    const r = await fulfillOrder({ session, personalization: { line1: P_LINE }, deps: { pool, fufire: failing, renderPdf: renderPosterPdf, gelato: null, publicUrl: 'x' } })
    expect(r.failed).toHaveLength(1)
    expect(r.printed).toHaveLength(0)
  })
  it('western designId → calculateWestern feeds the print (localized, honest no-ASC on unknown time)', async () => {
    const pool = fakePool()
    const western = {
      sun: { signIndex: 2, deg: 24.1, retro: false },
      moon: { signIndex: 11, deg: 14.5, retro: false },
      ascendant: { signIndex: 5, deg: 19.1, retro: false },
      planets: [
        { key: 'Mercury', signIndex: 2, deg: 5.6, retro: false },
        { key: 'Saturn', signIndex: 9, deg: 24, retro: true },
      ],
      provenance: { engine_version: 'e', ruleset_id: 'r', tzdb_version_id: 'z' },
    }
    const calcWestern = vi.fn(async () => western)
    const deps = {
      pool,
      fufire: { ...fufireStub, calculateWestern: calcWestern },
      renderPdf: renderPosterPdf,
      gelato: null,
      publicUrl: 'https://shop.test',
    }
    const westernLine = { ...P_LINE, designId: 'western-zodiac', language: 'EN' }
    const r = await fulfillOrder({ session: { ...session, id: 'cs_western_1' }, personalization: { line1: westernLine }, deps })
    expect(r.failed).toHaveLength(0)
    expect(r.printed).toHaveLength(1)
    expect(calcWestern).toHaveBeenCalledTimes(1)
    expect(r.printed[0].bytes).toBeGreaterThan(10_000)

    // Unbekannte Geburtszeit → Druck ohne Aszendent (kein Fehler, ehrlicher Entfall).
    const unknownLine = { ...westernLine, birthTimeUnknown: 'true' }
    const r2 = await fulfillOrder({ session: { ...session, id: 'cs_western_2' }, personalization: { line1: unknownLine }, deps })
    expect(r2.failed).toHaveLength(0)
    expect(r2.printed).toHaveLength(1)
  })

})

describe('Batch#12 R5 (#9) — Gelato für ALLE Poster: Katalog-Lines werden produziert oder scheitern LAUT', () => {
  // Metadaten-Datensatz einer nicht-personalisierten Katalog-Poster-Line, wie
  // /api/checkout ihn seit R5 für JEDE Line schreibt.
  const CATALOG_LINE = { productId: 'poster:11', variantId: 'size=50x70;frame=#1B1B1B', qty: '1' }
  const FAKE_PDF = Buffer.from('%PDF-1.4 fake-print-asset')
  // GelatoOrderStub: geteilte Modul-Definition oben.

  it('catalogPosterLinesFrom wählt poster:-Lines ohne designId; posterLinesFrom ignoriert sie', () => {
    const meta = { line1: P_LINE, line2: CATALOG_LINE, line3: { productId: 'bundle:b1', variantId: '', qty: '1' } }
    const catalog = catalogPosterLinesFrom(meta)
    expect(catalog).toHaveLength(1)
    expect(catalog[0].lineKey).toBe('line2')
    expect(posterLinesFrom(meta).map((l) => l.lineKey)).toEqual(['line1'])
  })

  it('Katalog-Line mit registriertem Druck-Asset → Print gespeichert + Gelato-Draft mit korrekt gemappter UID', async () => {
    const pool = fakePool()
    const orders: GelatoOrderStub[] = []
    const gelato = { enabled: () => true, createOrder: async (o: GelatoOrderStub) => { orders.push(o); return { id: 'g-cat-1', orderType: 'draft' } } }
    // Injectable wie alle Externen (createApp-Muster): der Test stellt das
    // validierte Druck-Asset; die REALE leere Registry ist der Fail-Fall unten.
    // PRO FORMAT (Operator-Fund R5: die drei Formate haben unterschiedliche
    // Seitenverhältnisse — eine Datei kann nie alle bedienen): der Lookup
    // MUSS productId UND sizeId tragen.
    const printAsset = async (productId: string, sizeId: string) => {
      if (productId === 'poster:11' && sizeId === '50x70') return FAKE_PDF
      throw new Error(`print asset not registered for: ${productId}|${sizeId}`)
    }
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato, publicUrl: 'https://shop.test', printAsset }
    const r = await fulfillOrder({ session: { ...session, id: 'cs_cat_1' }, personalization: { line1: CATALOG_LINE }, deps })
    expect(r.failed).toHaveLength(0)
    expect(r.printed).toHaveLength(1)
    expect(pool.prints[0].size_id).toBe('50x70')
    expect(pool.prints[0].pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(orders).toHaveLength(1)
    // Rahmen-Hex #1B1B1B → „Schwarz matt" → verifizierte 50x70-UID.
    expect(orders[0].items[0].productUid).toBe(PRODUCT_UIDS['50x70|Schwarz matt'])
  })

  it('registriertes Asset im FALSCHEN Format → failed LAUT (nie die falsche Datei drucken)', async () => {
    const pool = fakePool()
    // Asset existiert nur für 30x40 — bestellt ist 50x70.
    const printAsset = async (productId: string, sizeId: string) => {
      if (productId === 'poster:11' && sizeId === '30x40') return FAKE_PDF
      throw new Error(`print asset not registered for: ${productId}|${sizeId}`)
    }
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato: null, publicUrl: 'https://shop.test', printAsset }
    const r = await fulfillOrder({ session: { ...session, id: 'cs_cat_wrongsize' }, personalization: { line1: CATALOG_LINE }, deps })
    expect(r.failed).toHaveLength(1)
    expect(r.printed).toHaveLength(0)
  })

  it('OHNE registriertes Druck-Asset → failed LAUT (nie stille Nicht-Produktion), kein Gelato-Draft', async () => {
    const pool = fakePool()
    const orders: GelatoOrderStub[] = []
    const gelato = { enabled: () => true, createOrder: async (o: GelatoOrderStub) => { orders.push(o); return { id: 'g-x', orderType: 'draft' } } }
    // KEIN printAsset-Stub → fulfillment nutzt die reale (leere) Registry.
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato, publicUrl: 'https://shop.test' }
    const r = await fulfillOrder({ session: { ...session, id: 'cs_cat_2' }, personalization: { line1: CATALOG_LINE }, deps })
    expect(r.failed).toHaveLength(1)
    expect(String(r.failed[0].reason)).toMatch(/print asset/i)
    expect(r.printed).toHaveLength(0)
    expect(orders).toHaveLength(0)
  })

  it('gemischte Bestellung (personalisiert + Katalog): EIN Draft mit BEIDEN Items, idempotent', async () => {
    const pool = fakePool()
    const orders: GelatoOrderStub[] = []
    const gelato = { enabled: () => true, createOrder: async (o: GelatoOrderStub) => { orders.push(o); return { id: 'g-mix-1', orderType: 'draft' } } }
    const printAsset = async () => FAKE_PDF
    const deps = { pool, fufire: fufireStub, renderPdf: renderPosterPdf, gelato, publicUrl: 'https://shop.test', printAsset }
    const meta = { line1: P_LINE, line2: CATALOG_LINE }
    const r = await fulfillOrder({ session: { ...session, id: 'cs_mix_1' }, personalization: meta, deps })
    expect(r.failed).toHaveLength(0)
    expect(r.printed).toHaveLength(2)
    expect(orders).toHaveLength(1)
    expect(orders[0].items).toHaveLength(2)
    // Webhook-Replay: nichts doppelt (weder Druck noch Draft).
    const r2 = await fulfillOrder({ session: { ...session, id: 'cs_mix_1' }, personalization: meta, deps })
    expect(orders).toHaveLength(1)
    expect(r2.failed).toHaveLength(0)
    expect(pool.prints).toHaveLength(2)
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
