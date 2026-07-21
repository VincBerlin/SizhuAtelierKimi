// Order-Fulfillment: Stripe-Webhook → exakte Neu-Berechnung (FuFirE) →
// Druck-PDF (geteilte Design-Vorlage) → Prints-Tabelle → Gelato-Draft.
//
// Determinismus-Garantie: der Server berechnet die Säulen zum Druckzeitpunkt
// NEU aus den gespeicherten Geburtsdaten (placeLat/Lon/Tz) — FuFirE ist
// deterministisch (gleicher Input = gleicher Output), also identisch zur
// Vorschau, und die Provenance wird mitgespeichert.
//
// Idempotenz: UNIQUE(stripe_session, line_key) + gelato_order_id-Check —
// ein doppelt zugestellter Webhook druckt und bestellt NIE doppelt.
//
// Fehler eskalieren als Rückgabe {failed: [...]}: der Webhook antwortet
// Stripe trotzdem 200 (kein Endlos-Retry) und markiert die Order zur
// Operator-Eskalation (fulfillment_status='failed' + Notify-Mail).
import { randomUUID } from 'node:crypto'
import { productUidFor } from './gelatoProducts.js'
import { shippingAddressFromSession } from './gelato.js'
import { resolvePrintSizeId } from './printSpecs.js'
import { printAssetPdf, FRAME_NAME_BY_HEX } from './printAssets.js'
import { parseVariant } from './pricing.js'
// Geteilte Poster-Lokalisierung (EINE Quelle mit der Browser-Vorschau —
// Operator-Fund 2026-07-13: Druck/Vorschau zeigten Element/Tier immer deutsch,
// unabhängig von der gewählten Poster-Sprache).
import { localizeElement, localizeAnimal, posterSubtitle, localizeRelation, stemElement, zodiacName, planetName } from '../src/designs/posterLocale.mjs'
import { getDesign } from '../src/designs/registry.mjs'

export async function ensurePrintTables(pool) {
  if (!pool) return
  await pool.query(`CREATE TABLE IF NOT EXISTS prints (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    stripe_session TEXT NOT NULL,
    line_key TEXT NOT NULL,
    token TEXT NOT NULL,
    design_id TEXT,
    size_id TEXT,
    pdf BYTEA NOT NULL,
    gelato_order_id TEXT,
    UNIQUE (stripe_session, line_key)
  )`)
  await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT").catch(() => {})
}

/** Poster-Lines aus den chunked personalization-Metadaten ziehen (line1, line2, …). */
export function posterLinesFrom(personalization) {
  const lines = []
  for (const [key, p] of Object.entries(personalization || {})) {
    if (!/^line\d+$/.test(key) || !p || typeof p !== 'object') continue
    if (!p.designId || !p.size) continue // nur Poster-Typen tragen Design+Format
    lines.push({ lineKey: key, p })
  }
  return lines
}

/** Batch #12 R5 (#9): NICHT-personalisierte Katalog-Poster-Lines (poster:*,
 *  ohne designId) — seit R5 schreibt /api/checkout für JEDE Line einen
 *  Metadaten-Datensatz, damit auch diese Bestellungen produziert werden
 *  (oder LAUT scheitern) statt still übersprungen zu werden. */
export function catalogPosterLinesFrom(personalization) {
  const lines = []
  for (const [key, p] of Object.entries(personalization || {})) {
    if (!/^line\d+$/.test(key) || !p || typeof p !== 'object') continue
    if (p.designId) continue // personalisierte Poster → posterLinesFrom
    if (!String(p.productId || '').startsWith('poster:')) continue
    lines.push({ lineKey: key, p })
  }
  return lines
}

function birthInput(p, suffix = '') {
  return {
    date: `${p['date' + suffix]}T${p['time' + suffix]}:00`,
    tz: p['placeTz' + suffix],
    lon: Number(p['placeLon' + suffix]),
    lat: Number(p['placeLat' + suffix]),
    birthTimeKnown: p['birthTimeUnknown' + suffix] !== 'true',
  }
}

/** Poster-Daten für die Design-Vorlage — Einzel ODER Paar, exakt neu
 *  berechnet über FuFirE (deterministisch = identisch zur Vorschau). */
async function posterDataFrom(p, fufire) {
  // Western-Designs (Birth-Chart-Poster, Operator 2026-07-14): der Design-kind
  // aus der Registry entscheidet den Berechnungspfad — identische Quelle wie
  // die Browser-Vorschau (/api/western), lokalisiert über posterLocale.
  if (getDesign(p.designId).kind === 'western') {
    const w = await fufire.calculateWestern(birthInput(p))
    const timeKnown = p.birthTimeUnknown !== 'true'
    return {
      data: {
        // Operator 2026-07-16: der Rahmen kommt PHYSISCH von Gelato — die
        // Druckdatei malt KEINEN Rahmenrand mehr auf (frame = bg-Fläche).
        frame: p.bgHex || '#E9DFCB',
        bg: p.bgHex || '#E9DFCB',
        name: p.name || '',
        subtitle: posterSubtitle('western', p.language),
        sunLabel: planetName('Sun', p.language),
        moonLabel: planetName('Moon', p.language),
        ascLabel: planetName('Ascendant', p.language),
        sun: { sign: zodiacName(w.sun.signIndex, p.language), deg: w.sun.deg },
        moon: { sign: zodiacName(w.moon.signIndex, p.language), deg: w.moon.deg },
        // Ehrlichkeit: ohne bekannte Geburtszeit KEIN Aszendent auf dem Druck.
        ascendant: timeKnown && w.ascendant ? { sign: zodiacName(w.ascendant.signIndex, p.language), deg: w.ascendant.deg } : null,
        planets: w.planets.map((pl) => ({ label: planetName(pl.key, p.language), sign: zodiacName(pl.signIndex, p.language), deg: pl.deg, retro: pl.retro })),
      },
      provenance: w.provenance,
    }
  }
  if (p.dateB) {
    const pair = await fufire.matchHehun(birthInput(p), birthInput(p, 'B'))
    return {
      data: {
        // Operator 2026-07-16: der Rahmen kommt PHYSISCH von Gelato — die
        // Druckdatei malt KEINEN Rahmenrand mehr auf (frame = bg-Fläche).
        frame: p.bgHex || '#E9DFCB',
        bg: p.bgHex || '#E9DFCB',
        nameA: p.name || '',
        nameB: p.nameB || '',
        // dayMaster (Tag-Stamm, Säule 日) trägt den Poster-Kopf je Partner —
        // identische Quelle wie die Vorschau (Operator 2026-07-14).
        // Kopf-Element = TAGESMEISTER-Element aus dem Tag-Stamm (Fund 2026-07-14:
        // chart.element ist das JAHRES-Element) — identisch zur Vorschau.
        chartA: { ...pair.a, element: localizeElement(stemElement(pair.a.pillars?.[2]?.stem ?? ''), p.language), animal: localizeAnimal(pair.a.animal, p.language), dayMaster: pair.a.pillars?.[2]?.stem ?? '' },
        chartB: { ...pair.b, element: localizeElement(stemElement(pair.b.pillars?.[2]?.stem ?? ''), p.language), animal: localizeAnimal(pair.b.animal, p.language), dayMaster: pair.b.pillars?.[2]?.stem ?? '' },
        relationLabel: localizeRelation(pair.relation, p.language),
        subtitle: posterSubtitle('pair', p.language),
      },
      provenance: pair.a.provenance,
    }
  }
  const chart = await fufire.calculateBazi(birthInput(p))
  return {
    data: {
      // Operator 2026-07-16: kein aufgemalter Rahmen im Druck (s. oben).
      frame: p.bgHex || '#E9DFCB',
      bg: p.bgHex || '#E9DFCB',
      name: p.name || '',
      element: localizeElement(chart.element, p.language),
      animal: localizeAnimal(chart.animal, p.language),
      pillars: chart.pillars,
      subtitle: posterSubtitle('single', p.language),
    },
    provenance: chart.provenance,
  }
}

/** Batch #12 R6: Alarm-Mail-Inhalt bei Fulfillment-Fehlschlag — der Operator
 *  erfährt SOFORT von einer bezahlten, aber nicht produzierten Bestellung
 *  (vorher nur DB-Status + Server-Log). Reiner Text-Builder (testbar);
 *  Versand-Wiring liegt beim Aufrufer (Webhook + Retry-Route). */
export function buildFulfillmentAlertMail({ sessionId, failed, publicUrl }) {
  const lines = (failed || []).map((f) => `- ${f.lineKey}: ${f.reason}`).join('\n')
  return {
    subject: `⚠ Fulfillment FAILED — ${sessionId}`,
    text:
      `Eine bezahlte Bestellung konnte NICHT (vollständig) produziert werden.\n\n` +
      `Session: ${sessionId}\n\nFehlgeschlagene Teile:\n${lines}\n\n` +
      `Nächste Schritte: Ursache beheben (z. B. Druck-Asset registrieren, ` +
      `print-assets/README.md) und den Retry anstoßen:\n` +
      `POST ${publicUrl || ''}/api/fulfillment/retry/${sessionId} ` +
      `(Header x-retry-secret). Idempotent — nie Doppel-Produktion.`,
  }
}

export async function fulfillOrder({ session, personalization, deps }) {
  const { pool, fufire, renderPdf, gelato, publicUrl } = deps
  const result = { printed: [], submitted: [], failed: [] }
  const lines = posterLinesFrom(personalization)
  // R5 (#9): auch NICHT-personalisierte Katalog-Poster werden produziert —
  // ihre Druckdatei kommt aus der Operator-Registry (server/printAssets.js).
  const catalogLines = catalogPosterLinesFrom(personalization)
  if (lines.length === 0 && catalogLines.length === 0) return result
  if (!pool) {
    result.failed.push({ lineKey: '*', reason: 'no database — pdf storage unavailable' })
    return result
  }
  await ensurePrintTables(pool)

  for (const { lineKey, p } of lines) {
    try {
      // Idempotenz: existiert der Print schon, nichts erneut rendern.
      const existing = await pool.query('SELECT id, gelato_order_id FROM prints WHERE stripe_session=$1 AND line_key=$2', [session.id, lineKey])
      if (existing.rows.length > 0) {
        result.printed.push({ lineKey, reused: true })
        continue
      }
      // Batch #12 R4 (#10): neue Lines tragen die kanonische ID in p.sizeId;
      // p.size ist das ANZEIGE-Label („50 × 70") — ältere Lines nur das Label.
      // resolvePrintSizeId normalisiert beides auf die PRINT_SPECS-/Gelato-ID.
      // Unbekannte Formate scheitern HIER laut — nie eine stille Zuordnung.
      const sizeId = resolvePrintSizeId(p.sizeId || p.size)
      if (!sizeId) throw new Error(`Unknown print size: ${p.size}`)
      const { data, provenance } = await posterDataFrom(p, fufire)
      const pdf = await renderPdf({ designId: p.designId, data, sizeId })
      const token = randomUUID()
      await pool.query(
        'INSERT INTO prints (stripe_session, line_key, token, design_id, size_id, pdf) VALUES ($1,$2,$3,$4,$5,$6)',
        [session.id, lineKey, token, p.designId, sizeId, pdf],
      )
      result.printed.push({ lineKey, token, bytes: pdf.length, provenance })
    } catch (e) {
      result.failed.push({ lineKey, reason: e.message })
    }
  }

  // ── R5 (#9): Katalog-Poster-Lines — Druck-Asset aus der Registry ─────────
  // Kein Asset registriert → LAUTER Fehler (failed + Status 'failed'), nie
  // eine stille Nicht-Produktion und nie eine falsche Datei. `deps.printAsset`
  // ist test-injizierbar (createApp-Muster); Produktion nutzt printAssetPdf.
  const loadPrintAsset = deps.printAsset || printAssetPdf
  for (const { lineKey, p } of catalogLines) {
    try {
      const existing = await pool.query('SELECT id, gelato_order_id FROM prints WHERE stripe_session=$1 AND line_key=$2', [session.id, lineKey])
      if (existing.rows.length > 0) {
        result.printed.push({ lineKey, reused: true })
        continue
      }
      const v = parseVariant(p.variantId)
      const sizeId = resolvePrintSizeId(v.size)
      if (!sizeId) throw new Error(`Unknown print size: ${v.size}`)
      // PRO FORMAT laden (Operator-Fund R5): die Formate haben verschiedene
      // Seitenverhältnisse — nie eine Datei für ein anderes Format verwenden.
      const pdf = await loadPrintAsset(p.productId, sizeId)
      const token = randomUUID()
      await pool.query(
        'INSERT INTO prints (stripe_session, line_key, token, design_id, size_id, pdf) VALUES ($1,$2,$3,$4,$5,$6)',
        [session.id, lineKey, token, `asset:${p.productId}`, sizeId, pdf],
      )
      result.printed.push({ lineKey, token, bytes: pdf.length })
    } catch (e) {
      result.failed.push({ lineKey, reason: e.message })
    }
  }

  // Gelato-Draft — nur wenn konfiguriert, alle Prints da sind und noch keine
  // Gelato-Order existiert (Idempotenz über orders.fulfillment_status/prints).
  if (gelato && gelato.enabled() && result.failed.length === 0 && result.printed.length > 0) {
    try {
      const already = await pool.query(
        "SELECT 1 FROM prints WHERE stripe_session=$1 AND gelato_order_id IS NOT NULL LIMIT 1",
        [session.id],
      )
      if (already.rows.length === 0) {
        const rows = await pool.query('SELECT line_key, token, design_id, size_id FROM prints WHERE stripe_session=$1', [session.id])
        const items = []
        for (const r of rows.rows) {
          const p = personalization[r.line_key] || {}
          // Rahmenname: personalisierte Lines tragen ihn direkt (p.frame);
          // Katalog-Lines tragen den Rahmen-HEX in der Variante — aufgelöst
          // über die EINE Server-Tabelle (printAssets.FRAME_NAME_BY_HEX).
          // Unbekannt → productUidFor wirft (nie eine geratene Zuordnung).
          const frameName = p.frame || FRAME_NAME_BY_HEX[parseVariant(p.variantId).frame]
          items.push({
            itemReferenceId: r.line_key,
            productUid: productUidFor({ sizeId: r.size_id, frameName }),
            quantity: 1,
            fileUrl: `${publicUrl}/prints/${encodeURIComponent(session.id)}/${r.token}.pdf`,
          })
        }
        const order = await gelato.createOrder({
          orderReferenceId: session.id,
          customerReferenceId: session.customer_details?.email || session.id,
          currency: session.currency,
          items,
          shippingAddress: shippingAddressFromSession(session),
        })
        await pool.query('UPDATE prints SET gelato_order_id=$1 WHERE stripe_session=$2', [order.id, session.id])
        result.submitted.push({ gelatoOrderId: order.id, orderType: order.orderType })
      }
    } catch (e) {
      result.failed.push({ lineKey: 'gelato', reason: e.message })
    }
  }

  const status = result.failed.length > 0 ? 'failed' : result.submitted.length > 0 ? 'submitted' : 'printed'
  await pool.query('UPDATE orders SET fulfillment_status=$1 WHERE stripe_session=$2', [status, session.id]).catch(() => {})
  return result
}
