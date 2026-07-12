// FuFirE (Fusion Firmament Engine) client — die EINZIGE Stelle, die mit der
// BaZi-Berechnungs-API spricht. Env-gated wie Stripe (siehe Kopf von
// server/index.js): ohne FUFIRE_API_URL/KEY bleibt die Berechnung deaktiviert
// und Routen antworten 503 statt zu raten.
//
// Berechnungs-Konvention gepinnt (OQ-TLST im Evidence-Ledger,
// docs/evidence/fufire-gelato/ledger.md): TLST + midnight — Änderung nur per
// Env durch den Operator, nie still im Code.
//
// Testbarkeit: alle Aufrufe akzeptieren (…, fetchImpl, env) — Tests injizieren
// beides, Produktion nutzt die Defaults aus process.env.

export const BAZI_STANDARD = process.env.FUFIRE_BAZI_STANDARD || 'TLST'
export const BAZI_BOUNDARY = process.env.FUFIRE_BAZI_BOUNDARY || 'midnight'
const TIMEOUT_MS = 10_000

function defaultEnv() {
  return {
    apiUrl: (process.env.FUFIRE_API_URL || '').replace(/\/$/, ''),
    apiKey: process.env.FUFIRE_API_KEY || '',
  }
}

export function fufireEnabled(env = defaultEnv()) {
  return Boolean(env.apiUrl && env.apiKey)
}

export class FufireError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.name = 'FufireError'
    this.status = status
  }
}

// Pinyin → Hanzi. Achtung Kollision: Stamm "Wu"=戊 vs. Zweig "Wu"=午 —
// deshalb ZWEI getrennte Maps, niemals zusammenlegen.
const STEM_HANZI = { Jia: '甲', Yi: '乙', Bing: '丙', Ding: '丁', Wu: '戊', Ji: '己', Geng: '庚', Xin: '辛', Ren: '壬', Gui: '癸' }
const BRANCH_HANZI = { Zi: '子', Chou: '丑', Yin: '寅', Mao: '卯', Chen: '辰', Si: '巳', Wu: '午', Wei: '未', Shen: '申', You: '酉', Xu: '戌', Hai: '亥' }
const PILLAR_LABELS = { year: '年', month: '月', day: '日', hour: '時' }

function hanzi(map, pinyin, kind) {
  const glyph = map[pinyin]
  if (!glyph) throw new FufireError(`unknown ${kind} pinyin: ${pinyin}`)
  return glyph
}

/** FuFirE-Rohantwort → PosterData-kompatibles Chart (src/lib/bazi.ts Pillar-Form). */
export function normalizeChart(raw) {
  const p = raw && raw.pillars
  if (!p || !p.year || !p.month || !p.day || !p.hour) throw new FufireError('malformed fufire response')
  const pillars = ['year', 'month', 'day', 'hour'].map((k) => ({
    label: PILLAR_LABELS[k],
    stem: hanzi(STEM_HANZI, p[k].stamm, 'stem'),
    branch: hanzi(BRANCH_HANZI, p[k].zweig, 'branch'),
  }))
  const prov = raw.provenance || {}
  return {
    pillars,
    animal: p.year.tier,
    element: p.year.element,
    provenance: {
      engine_version: prov.engine_version || null,
      ruleset_id: prov.ruleset_id || null,
      tzdb_version_id: prov.tzdb_version_id || null,
    },
  }
}

async function callFufire(path, body, fetchImpl = fetch, env = defaultEnv()) {
  if (!fufireEnabled(env)) throw new FufireError('fufire not configured', 503)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetchImpl(env.apiUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': env.apiKey },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } catch (e) {
    throw new FufireError(`fufire unreachable: ${e.message}`)
  } finally {
    clearTimeout(timer)
  }
  let json
  try {
    json = await res.json()
  } catch {
    throw new FufireError('fufire returned non-json')
  }
  return { res, json }
}

export async function calculateBazi({ date, tz, lon, lat, birthTimeKnown }, fetchImpl = fetch, env = defaultEnv()) {
  const { res, json } = await callFufire('/v1/calculate/bazi', {
    date,
    tz,
    lon,
    lat,
    standard: BAZI_STANDARD,
    boundary: BAZI_BOUNDARY,
    birth_time_known: birthTimeKnown !== false,
    include_trace: false,
  }, fetchImpl, env)
  if (!res.ok) throw new FufireError(`fufire bazi failed (${res.status})`, res.status)
  return normalizeChart(json)
}

export async function geocodePlace(place, language = 'de', fetchImpl = fetch, env = defaultEnv()) {
  const { res, json } = await callFufire('/v1/geocode', { place, language }, fetchImpl, env)
  if (res.ok) {
    return {
      status: 'ok',
      lat: json.lat,
      lon: json.lon,
      tz: json.timezone,
      resolvedName: json.resolved_name,
      countryCode: json.country_code,
    }
  }
  if (res.status === 422 && json.error === 'ambiguous_place') {
    return {
      status: 'ambiguous',
      candidates: (json.candidates || []).slice(0, 6).map((c) => ({
        name: c.name,
        lat: c.lat,
        lon: c.lon,
        countryCode: c.country_code,
      })),
    }
  }
  if (res.status === 404) return { status: 'not_found' }
  throw new FufireError(`fufire geocode failed (${res.status})`, res.status)
}
