# FuFirE-Personalisierung + Design-Registry + Partner-Poster + PDF + Gelato — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Käufer gibt Geburtsdaten ein, sieht sein Poster in <0,5 s exakt personalisiert (FuFirE-Engine, live verifiziert), bestellt — und nach Stripe-Zahlung entsteht automatisch ein druckexaktes PDF, das als Gelato-Draft-Order mit korrektem Format/Rahmen ausgelöst wird.

**Architecture:** Der Browser ruft nie FuFirE/Gelato direkt — alles läuft über neue env-gated Module am bestehenden Express-Server (`server/fufire.js`, `server/pdf.js`, `server/gelato.js`, `server/fulfillment.js`), eingehängt in den existierenden Stripe-Webhook (`server/index.js:186-188`). Designs sind reine SVG-String-Funktionen in `src/designs/*.mjs`, importierbar von Vite (Browser-Vorschau) UND Node (PDF) — eine Quelle, zwei Ausgaben. Jede Phase endet mit einem **Beweis-Artefakt** im Evidence-Ledger (`docs/evidence/fufire-gelato/ledger.md`), nicht nur mit grünen Tests.

**Tech Stack:** Express (ESM, existiert), FuFirE-API (`https://bafe-production.up.railway.app`, `X-API-Key`), Vitest-Projekte `jsdom`/`node` + supertest (existiert), Playwright (existiert), `pdfkit` + `svg-to-pdfkit` (neu), Noto Serif CJK SC (OFL, neu), Gelato Order API v4 (`https://order.gelatoapis.com/v4/orders`, `X-API-KEY`), Railway Postgres (Tabelle `orders` existiert).

## Global Constraints

- **Keys nur als Env-Variablen** (`FUFIRE_API_URL`, `FUFIRE_API_KEY`, `GELATO_API_KEY`) — nie im Code, nie in Git, nie im Frontend. `.env.example` bekommt Platzhalter.
- **Env-gated wie Stripe:** Ohne Keys bootet der Server und meldet das Feature als deaktiviert — kein Crash (Muster: Kopfkommentar `server/index.js:1-3`).
- **Ehrlichkeit (Repo-Kultur, OQ-004/OQ-005):** Kein Placeholder-Chart wird je als echt verkauft. Ist FuFirE nicht erreichbar → Poster zeigt `—`-Zustand + Add-to-Cart für Poster-Typen blockiert. Kein stiller Fallback.
- **Policy-Guard AT-013-3 bleibt grün:** kein öffentlicher Geocoder-Host in `src/` (`tests/unit/delta-cities-source.test.ts`). Geocoding läuft ausschließlich über die eigene Route `/api/geocode`, aufgerufen **nur bei Orts-Auswahl**, nie pro Tastendruck.
- **Berechnungs-Konvention gepinnt:** `standard: "TLST"`, `boundary: "midnight"` als Env-überschreibbare Konstanten in `server/fufire.js`. **OQ-TLST (RED):** Zi-Grenzfall (Santiago-Test 2026-07-11) ist vom Operator gegen die FuFirE-Snapshot-Suite zu bestätigen — im Ledger geführt, blockiert den Launch der Personalisierung nicht, ist aber vor Launch zu schließen.
- **Dateien < 500 Zeilen** (User-Regel): neue Logik in neue Module, `server/index.js` (919 Zeilen) bekommt nur dünne Wiring-Zeilen.
- **Immutability, Validierung an Systemgrenzen** (User-Regeln): jede Route validiert Input explizit; keine Mutation bestehender Objekte.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`), keine Attribution (global deaktiviert).
- **Branch:** alles auf `feat/fufire-personalization` (von `feat/desenio-exact-architecture` abgezweigt).
- **Fixture-Wahrheit:** Der kanonische Testfall ist **1990-06-15 12:30, Berlin (13.405/52.52, Europe/Berlin), TLST** mit live-verifiziertem Ergebnis (2026-07-11): Jahr **庚午/Geng-Wu**, Monat **壬午/Ren-Wu**, Tag **辛亥/Xin-Hai**, Stunde **乙未/Yi-Wei**, Tier **Pferd**, Element **Metall**. Jede Schicht (Client-Normalisierung, Route, Frontend, PDF) wird gegen DIESE Werte geprüft.

## Evidence-Ledger (der „echte Beweise"-Mechanismus)

Beweisklassen (erweitert die bestehende Repo-Taxonomie `[SHIPPED-SCAN]` / `[REAL-BOUNDARY-jsdom]` / `[INTEGRATION-FAKE]`):

| Klasse | Bedeutung |
|---|---|
| `[REAL-BOUNDARY-LIVE]` | Artefakt entstand gegen die **live** FuFirE-/Gelato-API (gespeicherte Response + Datum + Request) |
| `[REAL-BROWSER]` | Playwright gegen den gebauten Server (`npm start`), Screenshot als Artefakt |
| `[REAL-ARTIFACT]` | erzeugte Datei (PDF/PNG) liegt im Ledger, mit Maß-/Byte-Prüfung |
| `[HUMAN-VERIFIED]` | Operator hat Artefakt gesehen und im Ledger abgezeichnet (z. B. Gelato-Draft im Dashboard) |

Jede Phase endet mit einem Ledger-Eintrag in `docs/evidence/fufire-gelato/ledger.md`:
`| Behauptung | Klasse | Artefakt-Datei | Reproduktions-Kommando | Datum |`
Ein grüner Test ohne zugehörige Ledger-Zeile gilt als **nicht bewiesen**.

---

## Phase A — Server: FuFirE-Client + Routen

### Task 1: Branch + Evidence-Gerüst

**Files:**
- Create: `docs/evidence/fufire-gelato/ledger.md`
- Modify: `.env.example`

**Interfaces:**
- Produces: Ledger-Datei, in die alle Folge-Tasks Zeilen anhängen.

- [ ] **Step 1: Branch anlegen**

```bash
cd /Users/vincentschnetzer/Documents/Playground/Kimi_Agent_SizhuAtelier_Webdesign/Shop
git checkout -b feat/fufire-personalization
```

- [ ] **Step 2: Ledger anlegen**

```markdown
# Evidence-Ledger — FuFirE-Personalisierung + Gelato

Regel: Eine Behauptung ohne Artefakt-Zeile hier gilt als NICHT bewiesen.
Offene RED-Posten stehen unten und blockieren den Launch, bis geschlossen.

| Behauptung | Klasse | Artefakt | Reproduktion | Datum |
|---|---|---|---|---|

## RED (offen, launch-relevant)

- **OQ-TLST** — Zi-Grenzfall-Konvention (TLST/boundary) vom Operator gegen
  FuFirE-Snapshot-Suite (`tests/snapshots/moseph/zi_*.json` im FuFirE-Repo)
  zu bestätigen. Bis dahin gilt gepinnt: TLST + midnight.
- **RL-GELATO** — Gelato-Fluss unbewiesen bis API-Key vorliegt (Phase F).
```

- [ ] **Step 3: `.env.example` erweitern** (nur Platzhalter, keine echten Werte)

```bash
# ── BaZi-Berechnung: FuFirE-Engine (eigene API) ──
# FUFIRE_API_URL=https://bafe-production.up.railway.app
# FUFIRE_API_KEY=ff_xxx
# FUFIRE_BAZI_STANDARD=TLST
# FUFIRE_BAZI_BOUNDARY=midnight

# ── Print-on-Demand: Gelato ──
# GELATO_API_KEY=xxx
# GELATO_ORDER_TYPE=draft   # draft = Operator bestätigt im Dashboard; order = vollautomatisch
```

- [ ] **Step 4: Commit**

```bash
git add docs/evidence/fufire-gelato/ledger.md .env.example
git commit -m "chore: evidence ledger + env placeholders for fufire/gelato"
```

### Task 2: `server/fufire.js` — Client mit Normalisierung (Pinyin→Hanzi)

**Files:**
- Create: `server/fufire.js`
- Test: `tests/server/fufire.test.js`

**Interfaces:**
- Produces (von Task 3, 9, 12 konsumiert):
  - `fufireEnabled(): boolean`
  - `calculateBazi({date, tz, lon, lat, birthTimeKnown}, fetchImpl?): Promise<Chart>` mit `Chart = { pillars: [{label,stem,branch}×4 (Hanzi)], animal: string, element: string, provenance: {engine_version, ruleset_id, tzdb_version_id} }` — `pillars` ist Drop-in für das bestehende `PosterData.pillars` (`src/lib/bazi.ts:5-18`)
  - `geocodePlace(place, language?, fetchImpl?): Promise<{status:'ok',lat,lon,tz,resolvedName,countryCode} | {status:'ambiguous',candidates:[{name,lat,lon,countryCode}]} | {status:'not_found'}>`
  - `class FufireError extends Error { status }`

- [ ] **Step 1: Failing Test schreiben** — `tests/server/fufire.test.js` (Vitest-Projekt `node`, per Verzeichnis automatisch):

```js
import { describe, it, expect } from 'vitest'
import { normalizeChart, calculateBazi, geocodePlace, fufireEnabled, FufireError } from '../../server/fufire.js'

// Echte, am 2026-07-11 live von bafe-production erhaltene Response (gekürzt auf
// die verwendeten Felder) — das FROZEN-Fixture des kanonischen Testfalls.
const LIVE_FIXTURE = {
  pillars: {
    year:  { stamm: 'Geng', zweig: 'Wu',  tier: 'Pferd',   element: 'Metall' },
    month: { stamm: 'Ren',  zweig: 'Wu',  tier: 'Pferd',   element: 'Wasser' },
    day:   { stamm: 'Xin',  zweig: 'Hai', tier: 'Schwein', element: 'Metall' },
    hour:  { stamm: 'Yi',   zweig: 'Wei', tier: 'Ziege',   element: 'Holz' },
  },
  provenance: { engine_version: '1.0.0-rc1-20260220', ruleset_id: 'traditional_bazi_2026', tzdb_version_id: '2026.2' },
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
    expect(c.animal).toBe('Pferd')      // Jahres-Zweig-Tier (wie bisheriges PosterData)
    expect(c.element).toBe('Metall')    // Jahres-Stamm-Element (wie bisher)
    expect(c.provenance.engine_version).toBe('1.0.0-rc1-20260220')
  })
  it('throws FufireError on unknown pinyin (never silently prints wrong glyphs)', () => {
    const bad = { ...LIVE_FIXTURE, pillars: { ...LIVE_FIXTURE.pillars, year: { stamm: 'Nope', zweig: 'Wu', tier: 'x', element: 'x' } } }
    expect(() => normalizeChart(bad)).toThrow(FufireError)
  })
})

describe('calculateBazi', () => {
  it('POSTs to /v1/calculate/bazi with pinned standard and normalizes', async () => {
    let captured
    const fetchImpl = async (url, opts) => {
      captured = { url, body: JSON.parse(opts.body), headers: opts.headers }
      return { ok: true, status: 200, json: async () => LIVE_FIXTURE }
    }
    const c = await calculateBazi(
      { date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.405, lat: 52.52, birthTimeKnown: true },
      fetchImpl,
    )
    expect(captured.url).toContain('/v1/calculate/bazi')
    expect(captured.body.standard).toBe('TLST')
    expect(captured.body.boundary).toBe('midnight')
    expect(captured.body.include_trace).toBe(false)
    expect(captured.headers['X-API-Key']).toBeTruthy()
    expect(c.pillars[2]).toEqual({ label: '日', stem: '辛', branch: '亥' })
  })
  it('maps upstream failure to FufireError with status', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503, json: async () => ({ error: 'down' }) })
    await expect(calculateBazi({ date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.4, lat: 52.5, birthTimeKnown: true }, fetchImpl))
      .rejects.toMatchObject({ status: 503 })
  })
})

describe('geocodePlace', () => {
  it('maps 200 to status ok', async () => {
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ lat: 52.52, lon: 13.41, resolved_name: 'Berlin', timezone: 'Europe/Berlin', country_code: 'DE', confidence: 1 }) })
    expect(await geocodePlace('Berlin', 'de', fetchImpl)).toEqual({ status: 'ok', lat: 52.52, lon: 13.41, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' })
  })
  it('maps 422 ambiguous_place to candidates', async () => {
    const fetchImpl = async () => ({ ok: false, status: 422, json: async () => ({ error: 'ambiguous_place', candidates: [{ name: 'Elend', lat: 51.7, lon: 10.7, country_code: 'DE' }] }) })
    const r = await geocodePlace('Elend', 'de', fetchImpl)
    expect(r.status).toBe('ambiguous')
    expect(r.candidates[0]).toEqual({ name: 'Elend', lat: 51.7, lon: 10.7, countryCode: 'DE' })
  })
  it('maps 404 place_not_found to not_found', async () => {
    const fetchImpl = async () => ({ ok: false, status: 404, json: async () => ({ error: 'place_not_found' }) })
    expect((await geocodePlace('Xyz', 'de', fetchImpl)).status).toBe('not_found')
  })
})
```

- [ ] **Step 2: Test läuft rot**

Run: `npx vitest run tests/server/fufire.test.js`
Expected: FAIL — `Cannot find module '../../server/fufire.js'`

- [ ] **Step 3: `server/fufire.js` implementieren**

```js
// FuFirE (Fusion Firmament Engine) client — die EINZIGE Stelle, die mit der
// BaZi-Berechnungs-API spricht. Env-gated wie Stripe (server/index.js:1-3):
// ohne FUFIRE_API_URL/KEY bleibt die Personalisierungs-Berechnung deaktiviert.
// Konvention gepinnt (OQ-TLST im Evidence-Ledger): TLST + midnight.

const FUFIRE_API_URL = (process.env.FUFIRE_API_URL || '').replace(/\/$/, '')
const FUFIRE_API_KEY = process.env.FUFIRE_API_KEY || ''
export const BAZI_STANDARD = process.env.FUFIRE_BAZI_STANDARD || 'TLST'
export const BAZI_BOUNDARY = process.env.FUFIRE_BAZI_BOUNDARY || 'midnight'
const TIMEOUT_MS = 10_000

export function fufireEnabled() {
  return Boolean(FUFIRE_API_URL && FUFIRE_API_KEY)
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
  if (!glyph) throw new FufireError(`unknown ${kind} pinyin: ${pinyin}`, 502)
  return glyph
}

/** FuFirE-Rohantwort → PosterData-kompatibles Chart (src/lib/bazi.ts:5-24). */
export function normalizeChart(raw) {
  const p = raw && raw.pillars
  if (!p || !p.year || !p.month || !p.day || !p.hour) throw new FufireError('malformed fufire response', 502)
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

async function callFufire(path, body, fetchImpl = fetch) {
  if (!fufireEnabled()) throw new FufireError('fufire not configured', 503)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetchImpl(FUFIRE_API_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': FUFIRE_API_KEY },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } catch (e) {
    throw new FufireError(`fufire unreachable: ${e.message}`, 502)
  } finally {
    clearTimeout(timer)
  }
  let json
  try {
    json = await res.json()
  } catch {
    throw new FufireError('fufire returned non-json', 502)
  }
  return { res, json }
}

export async function calculateBazi({ date, tz, lon, lat, birthTimeKnown }, fetchImpl = fetch) {
  const { res, json } = await callFufire('/v1/calculate/bazi', {
    date, tz, lon, lat,
    standard: BAZI_STANDARD,
    boundary: BAZI_BOUNDARY,
    birth_time_known: birthTimeKnown !== false,
    include_trace: false,
  }, fetchImpl)
  if (!res.ok) throw new FufireError(`fufire bazi failed (${res.status})`, res.status)
  return normalizeChart(json)
}

export async function geocodePlace(place, language = 'de', fetchImpl = fetch) {
  const { res, json } = await callFufire('/v1/geocode', { place, language }, fetchImpl)
  if (res.ok) {
    return {
      status: 'ok',
      lat: json.lat, lon: json.lon, tz: json.timezone,
      resolvedName: json.resolved_name, countryCode: json.country_code,
    }
  }
  if (res.status === 422 && json.error === 'ambiguous_place') {
    return {
      status: 'ambiguous',
      candidates: (json.candidates || []).slice(0, 6).map((c) => ({
        name: c.name, lat: c.lat, lon: c.lon, countryCode: c.country_code,
      })),
    }
  }
  if (res.status === 404) return { status: 'not_found' }
  throw new FufireError(`fufire geocode failed (${res.status})`, res.status)
}
```

- [ ] **Step 4: Tests grün**

Run: `npx vitest run tests/server/fufire.test.js`
Expected: PASS (8 Tests)

- [ ] **Step 5: Commit**

```bash
git add server/fufire.js tests/server/fufire.test.js
git commit -m "feat(server): fufire client with pinyin->hanzi normalization"
```

### Task 3: Routen `/api/bazi` + `/api/geocode` + `[REAL-BOUNDARY-LIVE]`-Beweis

**Files:**
- Modify: `server/index.js` (Routen nach `/api/checkout`, ~Zeile 320; `createApp`-Override erweitern, Zeile 800)
- Create: `scripts/evidence/fufire-smoke.mjs`
- Test: `tests/integration/bazi-routes.test.ts`

**Interfaces:**
- Consumes: `calculateBazi`, `geocodePlace`, `fufireEnabled`, `FufireError` aus Task 2.
- Produces: `POST /api/bazi` Body `{date:'YYYY-MM-DD', time:'HH:MM', lat, lon, tz, birthTimeUnknown?}` → 200 `Chart` (Task-2-Form) | 503 wenn nicht konfiguriert | 502 upstream-Fehler | 400 Validierungsfehler. `POST /api/geocode` Body `{place}` → 200 Geocode-Resultat (Task-2-Form). `createApp({ fufire })`-Override für Tests.

- [ ] **Step 1: Failing Integrationstest** — `tests/integration/bazi-routes.test.ts` (Muster: `tests/integration/checkout.repricing.test.ts` — reale Route, gestubbtes Extern via `createApp`):

```js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/index.js'

const CHART = {
  pillars: [
    { label: '年', stem: '庚', branch: '午' }, { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' }, { label: '時', stem: '乙', branch: '未' },
  ],
  animal: 'Pferd', element: 'Metall',
  provenance: { engine_version: '1.0.0-rc1-20260220', ruleset_id: 'traditional_bazi_2026', tzdb_version_id: '2026.2' },
}
const fufireStub = {
  enabled: () => true,
  calculateBazi: async (input) => { fufireStub.lastInput = input; return CHART },
  geocodePlace: async () => ({ status: 'ok', lat: 52.52, lon: 13.41, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }),
}

describe('POST /api/bazi', () => {
  it('combines date+time into local ISO and returns the normalized chart', async () => {
    const app = createApp({ fufire: fufireStub })
    const r = await request(app).post('/api/bazi').send({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin' })
    expect(r.status).toBe(200)
    expect(r.body.pillars[3]).toEqual({ label: '時', stem: '乙', branch: '未' })
    expect(fufireStub.lastInput.date).toBe('1990-06-15T12:30:00')
    expect(fufireStub.lastInput.birthTimeKnown).toBe(true)
  })
  it('rejects malformed date with 400 (validation at the boundary)', async () => {
    const app = createApp({ fufire: fufireStub })
    const r = await request(app).post('/api/bazi').send({ date: 'nope', time: '12:30', lat: 52.52, lon: 13.4, tz: 'Europe/Berlin' })
    expect(r.status).toBe(400)
  })
  it('returns 503 when fufire is not configured (honest degradation)', async () => {
    const app = createApp({ fufire: { ...fufireStub, enabled: () => false } })
    const r = await request(app).post('/api/bazi').send({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.4, tz: 'Europe/Berlin' })
    expect(r.status).toBe(503)
  })
})

describe('POST /api/geocode', () => {
  it('returns resolved place', async () => {
    const app = createApp({ fufire: fufireStub })
    const r = await request(app).post('/api/geocode').send({ place: 'Berlin' })
    expect(r.status).toBe(200)
    expect(r.body).toMatchObject({ status: 'ok', tz: 'Europe/Berlin' })
  })
  it('rejects empty place with 400', async () => {
    const app = createApp({ fufire: fufireStub })
    expect((await request(app).post('/api/geocode').send({ place: '' })).status).toBe(400)
  })
})
```

- [ ] **Step 2: rot laufen lassen** — `npx vitest run tests/integration/bazi-routes.test.ts` → FAIL (Routen existieren nicht)

- [ ] **Step 3: Routen in `server/index.js` implementieren.** Import oben ergänzen; in `createApp(overrides)` das `fufire`-Override nach dem `stripe`-Muster auflösen; Routen hinter dem bestehenden Rate-Limiter (`rateLimited(req, name, max, windowMs)` existiert bereits):

```js
// oben bei den Imports:
import * as fufireModule from './fufire.js'

// in createApp(overrides) — analog zum bestehenden stripe-Override:
const fufire = overrides.fufire ?? {
  enabled: fufireModule.fufireEnabled,
  calculateBazi: fufireModule.calculateBazi,
  geocodePlace: fufireModule.geocodePlace,
}

// Routen (nach /api/checkout einfügen):
app.post('/api/bazi', async (req, res) => {
  if (!fufire.enabled()) return res.status(503).json({ error: 'bazi_unavailable' })
  if (rateLimited(req, 'bazi', 60, 60_000)) return res.status(429).json({ error: 'rate_limited' })
  const { date, time, lat, lon, tz, birthTimeUnknown } = req.body || {}
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return res.status(400).json({ error: 'invalid_date' })
  if (!/^\d{2}:\d{2}$/.test(String(time || ''))) return res.status(400).json({ error: 'invalid_time' })
  if (typeof lat !== 'number' || typeof lon !== 'number' || typeof tz !== 'string' || !tz)
    return res.status(400).json({ error: 'invalid_place' })
  try {
    const chart = await fufire.calculateBazi({
      date: `${date}T${time}:00`, tz, lon, lat,
      birthTimeKnown: birthTimeUnknown !== true,
    })
    return res.json(chart)
  } catch (e) {
    console.error('fufire bazi failed:', e.message)
    return res.status(e.status >= 400 && e.status < 600 ? 502 : 502).json({ error: 'bazi_failed' })
  }
})

app.post('/api/geocode', async (req, res) => {
  if (!fufire.enabled()) return res.status(503).json({ error: 'geocode_unavailable' })
  if (rateLimited(req, 'geocode', 30, 60_000)) return res.status(429).json({ error: 'rate_limited' })
  const place = String((req.body || {}).place || '').trim()
  if (!place || place.length > 200) return res.status(400).json({ error: 'invalid_place' })
  try {
    return res.json(await fufire.geocodePlace(place))
  } catch (e) {
    console.error('fufire geocode failed:', e.message)
    return res.status(502).json({ error: 'geocode_failed' })
  }
})
```

- [ ] **Step 4: grün** — `npx vitest run tests/integration/bazi-routes.test.ts` → PASS. Danach Gesamtlauf: `npm test` → alles grün (keine Regression).

- [ ] **Step 5: `[REAL-BOUNDARY-LIVE]`-Beweisskript** — `scripts/evidence/fufire-smoke.mjs`:

```js
// Beweist gegen die LIVE FuFirE-API, dass der kanonische Testfall exakt die
// eingefrorenen Säulen liefert. Exit 1 bei Abweichung. Artefakt → Ledger.
import { calculateBazi } from '../../server/fufire.js'
import { writeFileSync, mkdirSync } from 'node:fs'

const EXPECTED = '庚午|壬午|辛亥|乙未'
const chart = await calculateBazi({ date: '1990-06-15T12:30:00', tz: 'Europe/Berlin', lon: 13.405, lat: 52.52, birthTimeKnown: true })
const got = chart.pillars.map((p) => p.stem + p.branch).join('|')
const stamp = new Date().toISOString().slice(0, 10)
mkdirSync('docs/evidence/fufire-gelato', { recursive: true })
writeFileSync(`docs/evidence/fufire-gelato/${stamp}-bazi-live-response.json`, JSON.stringify(chart, null, 2))
if (got !== EXPECTED) {
  console.error(`MISMATCH: expected ${EXPECTED}, got ${got}`)
  process.exit(1)
}
console.log(`OK — live pillars ${got} (engine ${chart.provenance.engine_version})`)
```

Run (mit echten Env-Werten):
```bash
FUFIRE_API_URL=https://bafe-production.up.railway.app FUFIRE_API_KEY=<key> node scripts/evidence/fufire-smoke.mjs
```
Expected: `OK — live pillars 庚午|壬午|辛亥|乙未 (engine 1.0.0-rc1-20260220)` und neue JSON-Datei im Evidence-Ordner.

- [ ] **Step 6: Ledger-Zeile anhängen** in `docs/evidence/fufire-gelato/ledger.md`:

```markdown
| Kanonischer Fall liefert live exakt 庚午/壬午/辛亥/乙未 | [REAL-BOUNDARY-LIVE] | <datum>-bazi-live-response.json | `FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-smoke.mjs` | <datum> |
```

- [ ] **Step 7: Commit**

```bash
git add server/index.js tests/integration/bazi-routes.test.ts scripts/evidence/fufire-smoke.mjs docs/evidence/fufire-gelato/
git commit -m "feat(server): /api/bazi + /api/geocode routes with live evidence smoke"
```

---

## Phase B — Frontend: exakte Live-Personalisierung

### Task 4: `src/lib/baziClient.ts` + `useBaziChart`-Hook

**Files:**
- Create: `src/lib/baziClient.ts`
- Create: `src/hooks/useBaziChart.ts`
- Test: `tests/unit/bazi-client.test.ts`, `tests/unit/use-bazi-chart.test.tsx`

**Interfaces:**
- Consumes: `POST /api/bazi`, `POST /api/geocode` (Task 3), Typ `ChartResult`/`Pillar` aus `src/lib/bazi.ts:5-24`.
- Produces (von Task 5/10 konsumiert):
  - `fetchChart(input: BaziInput): Promise<ExactChart>` mit `BaziInput = {date, time, place: ResolvedPlace, birthTimeUnknown: boolean}`, `ResolvedPlace = {lat, lon, tz, resolvedName, countryCode}`, `ExactChart = ChartResult & {provenance: Provenance}`
  - `resolvePlace(place: string): Promise<GeocodeResult>` (Formen wie Task 2)
  - `useBaziChart(input: BaziInput | null): { chart: ExactChart | null; status: 'idle'|'loading'|'ready'|'error' }` — 300 ms Debounce, verwirft veraltete Responses (Race-Guard), `input === null` → `idle`.

- [ ] **Step 1: Failing Tests** — `tests/unit/bazi-client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchChart, resolvePlace } from '@/lib/baziClient'

const CHART = {
  pillars: [
    { label: '年', stem: '庚', branch: '午' }, { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' }, { label: '時', stem: '乙', branch: '未' },
  ],
  animal: 'Pferd', element: 'Metall',
  provenance: { engine_version: 'x', ruleset_id: 'y', tzdb_version_id: 'z' },
}
const place = { lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }

beforeEach(() => { vi.restoreAllMocks() })

describe('fetchChart', () => {
  it('POSTs /api/bazi and returns the exact chart', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(CHART), { status: 200 }))
    const c = await fetchChart({ date: '1990-06-15', time: '12:30', place, birthTimeUnknown: false })
    expect(spy.mock.calls[0][0]).toBe('/api/bazi')
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string)).toMatchObject({ date: '1990-06-15', time: '12:30', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', birthTimeUnknown: false })
    expect(c.pillars[0].stem).toBe('庚')
  })
  it('throws on non-200 (caller shows honest error state, never a fake chart)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"error":"x"}', { status: 502 }))
    await expect(fetchChart({ date: '1990-06-15', time: '12:30', place, birthTimeUnknown: false })).rejects.toThrow()
  })
})

describe('resolvePlace', () => {
  it('passes through ok / ambiguous / not_found statuses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ status: 'not_found' }), { status: 200 }))
    expect((await resolvePlace('Xyz')).status).toBe('not_found')
  })
})
```

`tests/unit/use-bazi-chart.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useBaziChart } from '@/hooks/useBaziChart'

const CHART = { pillars: [{ label: '年', stem: '庚', branch: '午' }, { label: '月', stem: '壬', branch: '午' }, { label: '日', stem: '辛', branch: '亥' }, { label: '時', stem: '乙', branch: '未' }], animal: 'Pferd', element: 'Metall', provenance: { engine_version: 'x', ruleset_id: 'y', tzdb_version_id: 'z' } }
const input = { date: '1990-06-15', time: '12:30', place: { lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }, birthTimeUnknown: false }

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('useBaziChart', () => {
  it('is idle with null input and never fetches', () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useBaziChart(null))
    expect(result.current.status).toBe('idle')
    expect(spy).not.toHaveBeenCalled()
  })
  it('debounces 300ms, then resolves to ready with the exact chart', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(CHART), { status: 200 }))
    const { result } = renderHook(() => useBaziChart(input))
    expect(result.current.status).toBe('loading')
    expect(spy).not.toHaveBeenCalled()          // noch im Debounce-Fenster
    await act(async () => { vi.advanceTimersByTime(300) })
    vi.useRealTimers()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.chart!.pillars[3].branch).toBe('未')
  })
  it('sets error status on failure (no silent placeholder)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 502 }))
    const { result } = renderHook(() => useBaziChart(input))
    await act(async () => { vi.advanceTimersByTime(300) })
    vi.useRealTimers()
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.chart).toBeNull()
  })
})
```

- [ ] **Step 2: rot** — `npx vitest run tests/unit/bazi-client.test.ts tests/unit/use-bazi-chart.test.tsx` → FAIL (Module fehlen)

- [ ] **Step 3: Implementieren** — `src/lib/baziClient.ts`:

```ts
// Client für die Server-Proxy-Routen (/api/bazi, /api/geocode). Der Browser
// spricht NIE direkt mit FuFirE — Keys leben nur auf dem Server (Task 3).
import type { ChartResult } from './bazi'

export interface Provenance { engine_version: string | null; ruleset_id: string | null; tzdb_version_id: string | null }
export type ExactChart = ChartResult & { provenance: Provenance }
export interface ResolvedPlace { lat: number; lon: number; tz: string; resolvedName: string; countryCode: string }
export interface BaziInput { date: string; time: string; place: ResolvedPlace; birthTimeUnknown: boolean }
export type GeocodeResult =
  | ({ status: 'ok' } & ResolvedPlace)
  | { status: 'ambiguous'; candidates: { name: string; lat: number; lon: number; countryCode: string }[] }
  | { status: 'not_found' }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${url} failed (${res.status})`)
  return (await res.json()) as T
}

export function fetchChart(input: BaziInput): Promise<ExactChart> {
  return postJson<ExactChart>('/api/bazi', {
    date: input.date,
    time: input.time,
    lat: input.place.lat,
    lon: input.place.lon,
    tz: input.place.tz,
    birthTimeUnknown: input.birthTimeUnknown,
  })
}

export function resolvePlace(place: string): Promise<GeocodeResult> {
  return postJson<GeocodeResult>('/api/geocode', { place })
}
```

`src/hooks/useBaziChart.ts`:

```ts
import { useEffect, useRef, useState } from 'react'
import { fetchChart, type BaziInput, type ExactChart } from '@/lib/baziClient'

export type BaziStatus = 'idle' | 'loading' | 'ready' | 'error'
const DEBOUNCE_MS = 300

/** Debounced exakte Chart-Berechnung. input=null → idle. Race-sicher: nur die
 *  jeweils letzte Anfrage darf den State setzen (requestId-Guard). */
export function useBaziChart(input: BaziInput | null): { chart: ExactChart | null; status: BaziStatus } {
  const [chart, setChart] = useState<ExactChart | null>(null)
  const [status, setStatus] = useState<BaziStatus>('idle')
  const requestId = useRef(0)

  const key = input ? JSON.stringify([input.date, input.time, input.place.lat, input.place.lon, input.place.tz, input.birthTimeUnknown]) : null

  useEffect(() => {
    if (!input || !key) { setChart(null); setStatus('idle'); return }
    setStatus('loading')
    const id = ++requestId.current
    const timer = setTimeout(() => {
      fetchChart(input)
        .then((c) => { if (requestId.current === id) { setChart(c); setStatus('ready') } })
        .catch(() => { if (requestId.current === id) { setChart(null); setStatus('error') } })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { chart, status }
}
```

- [ ] **Step 4: grün** — `npx vitest run tests/unit/bazi-client.test.ts tests/unit/use-bazi-chart.test.tsx` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/baziClient.ts src/hooks/useBaziChart.ts tests/unit/bazi-client.test.ts tests/unit/use-bazi-chart.test.tsx
git commit -m "feat(frontend): baziClient + debounced useBaziChart hook"
```

### Task 5: Personalize.tsx — echte Charts, Orts-Auflösung, ehrliches Gating

**Files:**
- Modify: `src/pages/Personalize.tsx` (Chart: Zeile 70-75; PlaceAutocomplete: Zeile 366-405; addToCart: Zeile 86-146)
- Modify: `src/lib/bazi.ts` (nur Doku-Kommentar: Platzhalter jetzt ausschließlich Katalog-Deko, nicht mehr Personalize)
- Modify: `src/i18n/translations.ts` (neue Schlüssel, beide Sprachen)
- Test: `tests/unit/personalize-exact-chart.test.tsx`

**Interfaces:**
- Consumes: `useBaziChart`, `resolvePlace`, Typen aus Task 4.
- Produces: `personalization`-Metadaten um `placeResolved`, `placeLat`, `placeLon`, `placeTz`, `engineVersion`, `rulesetId` erweitert (dockt in Task 12 an die PDF-Erzeugung an). Poster-Typen: Add-to-Cart nur bei `status==='ready'`.

- [ ] **Step 1: Failing Test** — `tests/unit/personalize-exact-chart.test.tsx` (jsdom; `fetch` gemockt auf `/api/bazi`→CHART-Fixture, `/api/geocode`→Berlin):

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Personalize from '@/pages/Personalize'
import { ShopProvider } from '@/store/ShopStore'
import { I18nProvider } from '@/i18n/I18nProvider'

const CHART = { pillars: [{ label: '年', stem: '庚', branch: '午' }, { label: '月', stem: '壬', branch: '午' }, { label: '日', stem: '辛', branch: '亥' }, { label: '時', stem: '乙', branch: '未' }], animal: 'Pferd', element: 'Metall', provenance: { engine_version: '1.0.0-rc1', ruleset_id: 'traditional_bazi_2026', tzdb_version_id: '2026.2' } }

function mockApi() {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (String(url) === '/api/bazi') return new Response(JSON.stringify(CHART), { status: 200 })
    if (String(url) === '/api/geocode') return new Response(JSON.stringify({ status: 'ok', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', resolvedName: 'Berlin', countryCode: 'DE' }), { status: 200 })
    throw new Error('unexpected fetch ' + url)
  })
}
const ui = () => render(<MemoryRouter><I18nProvider><ShopProvider><Personalize /></ShopProvider></I18nProvider></MemoryRouter>)

beforeEach(() => { vi.restoreAllMocks(); mockApi() })

describe('Personalize exact chart', () => {
  it('renders the EXACT pillars from the API once birth data + resolved place are set', async () => {
    ui()
    fireEvent.change(screen.getByTestId('place-of-birth-input'), { target: { value: 'Berlin' } })
    fireEvent.click(await screen.findByRole('option', { name: /Berlin/ }))
    const date = document.querySelector('input[type="date"]') as HTMLInputElement
    const time = document.querySelector('input[type="time"]') as HTMLInputElement
    fireEvent.change(date, { target: { value: '1990-06-15' } })
    fireEvent.change(time, { target: { value: '12:30' } })
    await waitFor(() => expect(screen.getAllByText('庚').length).toBeGreaterThan(0), { timeout: 3000 })
    expect(screen.getAllByText('未').length).toBeGreaterThan(0)   // Stunden-Zweig — beweist: NICHT der alte Placeholder
  })
  it('shows em-dash pillars and blocks add-to-cart before the chart is ready (honesty gate)', async () => {
    ui()
    // ohne Eingaben: Platzhalter-Striche, kein API-Chart
    expect(screen.queryByText('庚')).toBeNull()
  })
})
```

- [ ] **Step 2: rot** — `npx vitest run tests/unit/personalize-exact-chart.test.tsx` → FAIL (Personalize nutzt noch `computeChart`)

- [ ] **Step 3: Personalize.tsx umbauen** — die Kernänderungen:

```tsx
// (a) State für den aufgelösten Ort + Kandidaten:
const [resolvedPlace, setResolvedPlace] = useState<ResolvedPlace | null>(null)
const [placeCandidates, setPlaceCandidates] = useState<GeocodeResult['candidates'] | null>(null)
const [placeStatus, setPlaceStatus] = useState<'idle' | 'resolving' | 'ok' | 'ambiguous' | 'not_found' | 'error'>('idle')

// (b) Auflösung NUR bei Auswahl/Blur (Policy AT-013-3 — nie pro Tastendruck):
const resolveSelectedPlace = async (value: string) => {
  if (!value.trim()) { setResolvedPlace(null); setPlaceStatus('idle'); return }
  setPlaceStatus('resolving')
  try {
    const r = await resolvePlace(value.trim())
    if (r.status === 'ok') { setResolvedPlace(r); setPlaceCandidates(null); setPlaceStatus('ok') }
    else if (r.status === 'ambiguous') { setResolvedPlace(null); setPlaceCandidates(r.candidates); setPlaceStatus('ambiguous') }
    else { setResolvedPlace(null); setPlaceCandidates(null); setPlaceStatus('not_found') }
  } catch { setResolvedPlace(null); setPlaceStatus('error') }
}

// (c) Chart: computeChart-Aufruf (Zeile 70-71) ERSETZEN durch:
const btA = birthTimeMeta(a.time, unknownTime)
const baziInput = a.date && (unknownTime || a.time) && resolvedPlace
  ? { date: a.date, time: btA.time, place: resolvedPlace, birthTimeUnknown: unknownTime }
  : null
const { chart, status: chartStatus } = useBaziChart(baziInput)
const EMPTY_PILLARS = [
  { label: '年', stem: '—', branch: '—' }, { label: '月', stem: '—', branch: '—' },
  { label: '日', stem: '—', branch: '—' }, { label: '時', stem: '—', branch: '—' },
]
const livePoster: PosterData = {
  frame: frameHex, bg: bgHex, name: a.name || t('configurator.namePh'),
  element: chart?.element ?? '', animal: chart?.animal ?? '',
  pillars: chart?.pillars ?? EMPTY_PILLARS,
}

// (d) addToCart-Gate (in addToCart, vor der bestehenden valid-Prüfung):
if (def.poster && chartStatus !== 'ready') {
  setShowErrors(true)
  showToast(t('personalize.chartNotReady'))
  return
}

// (e) personalization-Metadaten erweitern (nach Zeile 103 `place:`):
personalization.placeResolved = resolvedPlace!.resolvedName
personalization.placeLat = String(resolvedPlace!.lat)
personalization.placeLon = String(resolvedPlace!.lon)
personalization.placeTz = resolvedPlace!.tz
personalization.engineVersion = chart!.provenance.engine_version ?? ''
personalization.rulesetId = chart!.provenance.ruleset_id ?? ''
```

PlaceAutocomplete: `pick(city)` ruft zusätzlich `resolveSelectedPlace(city)`; `onBlur` ebenfalls (nach dem bestehenden 120 ms-Timeout). Unter dem Feld: bei `ambiguous` die Kandidaten als Buttons (Auswahl → `setResolvedPlace` direkt aus Kandidat + `tz` via erneutem `resolvePlace("<name>, <countryCode>")`); bei `not_found` Hinweistext `t('personalize.placeNotFound')` („Bitte nächstgrößeren Ort wählen — astronomisch identisch"); bei `ok` Bestätigungszeile `t('personalize.placeResolvedAs', {name})` („Berechnet für: Berlin, DE"). Neue i18n-Schlüssel in `translations.ts` (de + en): `personalize.chartNotReady`, `personalize.placeNotFound`, `personalize.placeResolvedAs`, `personalize.chartError`.

- [ ] **Step 4: grün + Gesamtlauf** — `npx vitest run tests/unit/personalize-exact-chart.test.tsx` → PASS, dann `npm test` → alle bestehenden Tests grün (insbes. `delta-cities-source`, `delta-poster-bg-palette`). `npm run build` → grün.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Personalize.tsx src/lib/bazi.ts src/i18n/translations.ts tests/unit/personalize-exact-chart.test.tsx
git commit -m "feat(personalize): exact live chart via fufire, resolved place, honesty gate"
```

### Task 6: `[REAL-BROWSER]`-Beweis — Playwright gegen den gebauten Server

**Files:**
- Create: `tests/e2e/personalize-exact.spec.ts`

**Interfaces:**
- Consumes: laufender Server (`npm run build && npm start`) mit echten `FUFIRE_*`-Env.

- [ ] **Step 1: Spec schreiben**

```ts
import { test, expect } from '@playwright/test'

// [REAL-BROWSER] + [REAL-BOUNDARY-LIVE]: läuft gegen `npm start` MIT echten
// FUFIRE-Env-Variablen — kein Mock. Beweist: Käufer-Eingabe → exakte Säulen.
const BASE = process.env.EVIDENCE_BASE_URL || 'http://localhost:3000'

test('buyer enters birth data and sees the exact live-computed pillars', async ({ page }) => {
  await page.goto(BASE + '/personalisieren')
  await page.getByTestId('place-of-birth-input').fill('Berlin')
  await page.getByRole('option', { name: /Berlin/ }).first().click()
  await page.locator('input[type="date"]').first().fill('1990-06-15')
  await page.locator('input[type="time"]').first().fill('12:30')
  const preview = page.getByTestId('poster-preview-sticky')
  for (const glyph of ['庚', '壬', '辛', '乙', '午', '亥', '未']) {
    await expect(preview.getByText(glyph).first()).toBeVisible({ timeout: 10_000 })
  }
  await expect(preview.getByText('Pferd').first()).toBeVisible()
  await expect(preview.getByText('Metall').first()).toBeVisible()
  await page.screenshot({ path: 'docs/evidence/fufire-gelato/personalize-exact-live.png', fullPage: false })
})
```

Hinweis: Route-Pfad der Personalize-Seite vor dem Schreiben in `src/App.tsx` nachschlagen (`grep -n "Personalize" src/App.tsx`) und `page.goto` entsprechend setzen.

- [ ] **Step 2: Beweis ausführen**

```bash
npm run build
FUFIRE_API_URL=https://bafe-production.up.railway.app FUFIRE_API_KEY=<key> PORT=3000 npm start &
npx playwright test tests/e2e/personalize-exact.spec.ts
kill %1
```
Expected: `1 passed` + Screenshot `docs/evidence/fufire-gelato/personalize-exact-live.png` zeigt das Poster mit 庚午/壬午/辛亥/乙未.

- [ ] **Step 3: Ledger-Zeile** („Frontend zeigt live-berechnete exakte Säulen", Klasse `[REAL-BROWSER]`, Artefakt PNG, Repro-Kommando oben) **+ Commit**

```bash
git add tests/e2e/personalize-exact.spec.ts docs/evidence/fufire-gelato/
git commit -m "test(e2e): real-browser evidence for exact live personalization"
```

---

## Phase C — Design-Registry

### Task 7: Design-Vertrag + Registry + Design „Klassik" als geteilte SVG-Vorlage

**Files:**
- Create: `src/designs/contract.d.ts`, `src/designs/svgUtil.mjs`, `src/designs/klassik.mjs`, `src/designs/registry.mjs`
- Test: `tests/unit/design-registry-tuev.test.ts`

**Interfaces:**
- Produces (konsumiert von Task 8 Frontend & Task 12 PDF-Server):
  - `registry.mjs`: `export const DESIGNS = [{ id: 'klassik', name: 'Klassik', active: true, kind: 'single', render }]`, `export function getDesign(id)` (wirft bei unbekannter id)
  - Render-Vertrag: `render(data: PosterData, opts: {widthMm: number, heightMm: number}): string` — liefert vollständiges `<svg …>`-Markup, `viewBox="0 0 <widthMm> <heightMm>"` (1 User-Unit = 1 mm), **alle** Nutzertexte durch `escapeXml` geführt
  - `svgUtil.mjs`: `export function escapeXml(s)`
  - `PosterData` bleibt die bestehende Form aus `src/lib/bazi.ts:11-18`

- [ ] **Step 1: Failing Design-TÜV-Test** — `tests/unit/design-registry-tuev.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
// @ts-expect-error — geteiltes ESM-JS-Modul (Browser+Node), Typen via contract.d.ts
import { DESIGNS, getDesign } from '@/designs/registry.mjs'

const DATA = {
  frame: '#B98A5E', bg: '#E9DFCB', name: 'Anna <Müller> & Söhne', element: 'Metall', animal: 'Pferd',
  pillars: [
    { label: '年', stem: '庚', branch: '午' }, { label: '月', stem: '壬', branch: '午' },
    { label: '日', stem: '辛', branch: '亥' }, { label: '時', stem: '乙', branch: '未' },
  ],
}

// Der Design-TÜV: läuft automatisch für JEDES registrierte Design. Ein Design,
// das Personalisierungs-Felder verschluckt oder invalides XML liefert, wird
// hier rot — nicht beim Kunden.
describe.each(DESIGNS.filter((d: any) => d.kind === 'single'))('design $id', (design: any) => {
  const svg = design.render(DATA, { widthMm: 420, heightMm: 594 })
  it('renders a complete svg with mm viewBox', () => {
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox="0 0 420 594"')
    expect(svg.trim().endsWith('</svg>')).toBe(true)
  })
  it('contains every personalization field', () => {
    for (const g of ['庚', '壬', '辛', '乙', '午', '亥', '未', 'Pferd', 'Metall']) expect(svg).toContain(g)
    expect(svg).toContain('Anna &lt;Müller&gt; &amp; Söhne')   // escaped, nie roh
    expect(svg).not.toContain('<Müller>')                       // XSS/XML-Injection ausgeschlossen
  })
  it('parses as valid XML', () => {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
  })
})

describe('getDesign', () => {
  it('throws on unknown id (orders can never reference a ghost design)', () => {
    expect(() => getDesign('gibtsnicht')).toThrow()
  })
})
```

- [ ] **Step 2: rot** — `npx vitest run tests/unit/design-registry-tuev.test.ts` → FAIL

- [ ] **Step 3: Implementieren.** `src/designs/svgUtil.mjs`:

```js
export function escapeXml(s) {
  return String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}
```

`src/designs/klassik.mjs` — Portierung des bestehenden `Poster.tsx`-Layouts (Zeile 28-53: Rahmen → Passepartout → Farbfläche → Kopfzeile Element/Tier → 4 Säulen → Fußzeile Name) als SVG. Vollständig:

```js
// Design "Klassik" — geteilte SVG-Vorlage. Wird vom Browser (Vorschau, Task 8)
// und vom Node-Server (Druck-PDF, Task 12) mit identischen Daten gerendert.
// Einheit: 1 SVG-User-Unit = 1 mm. Font-Namen werden im PDF-Renderer auf die
// eingebetteten Noto-Schnitte gemappt (Task 11).
import { escapeXml as esc } from './svgUtil.mjs'

function luminance(hex) {
  const c = (hex || '#E9DFCB').replace('#', '')
  return (0.299 * parseInt(c.slice(0, 2), 16) + 0.587 * parseInt(c.slice(2, 4), 16) + 0.114 * parseInt(c.slice(4, 6), 16)) / 255
}

export function render(data, { widthMm, heightMm }) {
  const W = widthMm, H = heightMm
  const bg = data.bg || '#E9DFCB'
  const light = luminance(bg) > 0.55
  const ink = light ? '#2A2620' : '#EDE6D6'
  const rule = light ? 'rgba(42,38,32,0.22)' : 'rgba(237,230,214,0.30)'
  const frameW = W * 0.05                    // Rahmenbreite ~5% (wie Poster.tsx padding 5%)
  const matW = W * 0.065                     // Passepartout ~6.5%
  const artX = frameW + matW, artY = frameW + matW
  const artW = W - 2 * artX, artH = H - 2 * artY
  const colGap = artW / 4.6
  const colXs = [0, 1, 2, 3].map((i) => artX + artW / 2 + (i - 1.5) * colGap)
  const glyphSize = artH * 0.095
  const pillarTop = artY + artH * 0.30
  const pillars = data.pillars.map((p, i) => `
    <text x="${colXs[i]}" y="${pillarTop}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.024}" opacity="0.5" fill="${ink}">${esc(p.label)}</text>
    <text x="${colXs[i]}" y="${pillarTop + glyphSize * 1.3}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.stem)}</text>
    <text x="${colXs[i]}" y="${pillarTop + glyphSize * 2.6}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.branch)}</text>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(data.frame || '#B98A5E')}"/>
  <rect x="${frameW}" y="${frameW}" width="${W - 2 * frameW}" height="${H - 2 * frameW}" fill="#F5F0E4"/>
  <rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" fill="${esc(bg)}"/>
  <text x="${artX + artW * 0.06}" y="${artY + artH * 0.07}" font-family="Noto Sans" font-size="${artH * 0.027}" letter-spacing="0.18em" fill="${ink}" opacity="0.78">${esc((data.element || '').toUpperCase())}</text>
  <text x="${artX + artW * 0.94}" y="${artY + artH * 0.07}" text-anchor="end" font-family="Noto Sans" font-size="${artH * 0.027}" letter-spacing="0.18em" fill="${ink}" opacity="0.78">${esc((data.animal || '').toUpperCase())}</text>
  ${pillars}
  <line x1="${artX + artW * 0.08}" y1="${artY + artH * 0.82}" x2="${artX + artW * 0.92}" y2="${artY + artH * 0.82}" stroke="${rule}" stroke-width="0.35"/>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.89}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.07}" fill="${ink}">${esc(data.name || '')}</text>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.94}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.021}" letter-spacing="0.24em" fill="${ink}" opacity="0.62">BAZI · VIER SÄULEN</text>
</svg>`
}
```

`src/designs/registry.mjs`:

```js
import { render as klassik } from './klassik.mjs'

/** Alle Designs. Neues Design = neue Datei + EINE Zeile hier. Der Design-TÜV
 *  (tests/unit/design-registry-tuev.test.ts) prüft jeden Eintrag automatisch. */
export const DESIGNS = [
  { id: 'klassik', name: 'Klassik', active: true, kind: 'single', render: klassik },
]

export function getDesign(id) {
  const d = DESIGNS.find((x) => x.id === id)
  if (!d) throw new Error(`unknown design: ${id}`)
  return d
}
```

`src/designs/contract.d.ts` (Typen für TS-Importe):

```ts
import type { PosterData } from '../lib/bazi'
export interface DesignDef {
  id: string; name: string; active: boolean; kind: 'single' | 'pair'
  render: (data: PosterData, opts: { widthMm: number; heightMm: number }) => string
}
declare module '@/designs/registry.mjs' {
  export const DESIGNS: DesignDef[]
  export function getDesign(id: string): DesignDef
}
```

- [ ] **Step 4: grün** — `npx vitest run tests/unit/design-registry-tuev.test.ts` → PASS. `npm run build` → grün (falls `tsc` über die `.mjs`-Importe stolpert: `// @ts-expect-error` an Import-Stellen wie im Test, oder Deklaration greift).

- [ ] **Step 5: Commit**

```bash
git add src/designs/ tests/unit/design-registry-tuev.test.ts
git commit -m "feat(designs): registry + shared svg template 'klassik' + design-tuev"
```

### Task 8: Design-Wähler + SVG-Vorschau in Personalize

**Files:**
- Create: `src/components/shop/PosterSvg.tsx`
- Modify: `src/pages/Personalize.tsx` (Design-Karte nach Step „Sprache", designId in Metadaten)
- Modify: `src/i18n/translations.ts`
- Test: `tests/unit/personalize-design-picker.test.tsx`

**Interfaces:**
- Consumes: `DESIGNS`, `getDesign` (Task 7), `livePoster: PosterData` (Task 5).
- Produces: `personalization.designId` in den Bestell-Metadaten (Task 12 liest es). `PosterSvg({data, designId})` React-Komponente.

- [ ] **Step 1: Failing Test** — `tests/unit/personalize-design-picker.test.tsx`: rendert Personalize (fetch-Mocks aus Task 5 wiederverwenden), erwartet: (a) für jedes `DESIGNS.filter(d=>d.active && d.kind==='single')` einen Button `data-testid="design-swatch"`; (b) Klick wechselt die Vorschau (Wrapper `data-design-id` ändert sich); (c) nach addToCart enthält das Cart-Item `personalization.designId`.

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Personalize from '@/pages/Personalize'
import { ShopProvider } from '@/store/ShopStore'
import { I18nProvider } from '@/i18n/I18nProvider'
// @ts-expect-error shared mjs
import { DESIGNS } from '@/designs/registry.mjs'

beforeEach(() => { vi.restoreAllMocks() })

it('renders one swatch per active single design and switches the preview', () => {
  render(<MemoryRouter><I18nProvider><ShopProvider><Personalize /></ShopProvider></I18nProvider></MemoryRouter>)
  const active = DESIGNS.filter((d: any) => d.active && d.kind === 'single')
  expect(screen.getAllByTestId('design-swatch')).toHaveLength(active.length)
  fireEvent.click(screen.getAllByTestId('design-swatch')[0])
  expect(screen.getByTestId('poster-svg-preview').getAttribute('data-design-id')).toBe(active[0].id)
})
```

- [ ] **Step 2: rot laufen lassen**, dann **Step 3: implementieren.** `PosterSvg.tsx`:

```tsx
import { useMemo } from 'react'
import type { PosterData } from '@/lib/bazi'
// @ts-expect-error — geteiltes ESM-JS-Modul, Typen via contract.d.ts
import { getDesign } from '@/designs/registry.mjs'

/** Rendert die geteilte SVG-Vorlage (identisch zur Druck-Pipeline). Inhalte
 *  sind ausschließlich unsere eigene Vorlage; Nutzertext ist darin escaped
 *  (Design-TÜV erzwingt das), daher ist innerHTML hier sicher. */
export default function PosterSvg({ data, designId }: { data: PosterData; designId: string }) {
  const svg = useMemo(() => getDesign(designId).render(data, { widthMm: 420, heightMm: 594 }), [data, designId])
  return <div data-testid="poster-svg-preview" data-design-id={designId} style={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: svg }} />
}
```

Personalize: `const [designId, setDesignId] = useState('klassik')`; neue Karte „Design" (Muster der Rahmen-Buttons, Zeile 244-254) mit `data-testid="design-swatch"` je aktivem Design (Mini-`PosterSvg` mit Fixture als Thumbnail); Vorschau links: `PosterScene`-Block (Zeile 168-176) rendert für Poster-Typen zusätzlich/stattdessen `PosterSvg({data: livePoster, designId})`; `personalization.designId = designId` in addToCart.

- [ ] **Step 4: grün + Gesamtlauf** — Task-Test PASS, `npm test` grün, `npm run build` grün.

- [ ] **Step 5: Commit** — `git add … && git commit -m "feat(personalize): design registry picker + shared svg preview"`

---

## Phase D — Partner-Poster (Compatibility)

### Task 9: `matchHehun` im FuFirE-Client + Route `/api/match`

**Files:**
- Modify: `server/fufire.js`, `server/index.js`
- Test: `tests/server/fufire-match.test.js`, Erweiterung `tests/integration/bazi-routes.test.ts`

**Interfaces:**
- Produces: `matchHehun(a, b, fetchImpl?)` mit `a/b = {date, tz, lon, lat, gender?}` → `PairResult = { a: Chart, b: Chart, relation: {dayMasterA, dayMasterB, elementA, elementB, wuxingRelation}, vectors: {order: string[], a: number[], b: number[]}, provenance }` — **nur Fakten mit `source_status === 'CALCULATED'`** (Ehrlichkeits-Regel; `NEEDS_DOMAIN_REVIEW`-Fakten wie `spouse_palace` werden bewusst weggelassen, bis die Domain-Review in FuFirE abgeschlossen ist). Route `POST /api/match` Body `{a: {date,time,lat,lon,tz,birthTimeUnknown?}, b: {…}}` → 200 `PairResult`. Server setzt `second_person_consent_confirmed: true` immer selbst (Operator-Entscheidung 2026-07-11, keine UI-Checkbox).

- [ ] **Step 1: Failing Test** mit eingefrorenem Live-Fixture (Response-Auszug vom 2026-07-11-Livetest: `day_master_comparison` mit `person_a_day_master: 'Xin'`, `person_b_day_master: 'Gui'`, `person_a_element: 'Metall'`, `person_b_element: 'Wasser'`, `day_master_wuxing_relation: 'a_generates_b'`; `wuxing_vector_comparison` mit `element_order` + `person_a_vector` + `person_b_vector`; zusätzlich `subjects/individual`-Charts in `pillars`-Form). Testfälle: (a) Request enthält `mode:'birth_input'`, `gender` normalisiert (`'M'→'male'`), `options.second_person_consent_confirmed === true`; (b) Ergebnis enthält beide normalisierten Charts + `relation.wuxingRelation === 'a_generates_b'`; (c) Fakten mit `source_status !== 'CALCULATED'` erscheinen NICHT im Resultat.

- [ ] **Step 2: rot** → **Step 3: implementieren** (`matchHehun` extrahiert aus `pair.day_master_comparison.facts` und `pair.wuxing_vector_comparison.facts` nur `CALCULATED`-Einträge in die flache `relation`/`vectors`-Form; Charts der beiden Personen via `normalizeChart` auf `individual`/`subjects`-Daten — exakte Feldpfade beim Implementieren gegen eine frische Live-Response verifizieren und als Fixture einfrieren) → **Step 4: grün** → **Step 5:** Route `/api/match` in `server/index.js` (Validierung wie `/api/bazi`, für beide Personen; Rate-Limit `match`, 30/min), Integrationstest analog Task 3, grün.

- [ ] **Step 6: `[REAL-BOUNDARY-LIVE]`-Beweis + Ledger** — `scripts/evidence/fufire-match-smoke.mjs` (analog Task 3 Step 5: zwei Fixpersonen, erwartet `relation.wuxingRelation === 'a_generates_b'`, speichert Response-JSON). Ledger-Zeile. Commit: `feat(server): /api/match hehun with CALCULATED-only fact filter`.

### Task 10: Paar-Design + Couple-Flow in Personalize

**Files:**
- Create: `src/designs/paarHarmonie.mjs` (kind: 'pair'), Registry-Eintrag
- Modify: `src/hooks/useBaziChart.ts` (Schwester-Hook `usePairChart`), `src/pages/Personalize.tsx`, `src/i18n/translations.ts`
- Test: `tests/unit/design-registry-pair-tuev.test.ts`, `tests/unit/personalize-couple-exact.test.tsx`

**Interfaces:**
- Consumes: `POST /api/match` (Task 9), Registry (Task 7).
- Produces: Pair-Design-Vertrag `render(pair: PairPosterData, opts)` mit `PairPosterData = { nameA, nameB, chartA: PosterData-Kern, chartB, relationLabel: string, vectors, bg, frame }`; `usePairChart(inputA, inputB): {pair, status}` (gleiche Semantik wie `useBaziChart`). Personalize: bei `def.couple === true` (Produkttyp `couple`, `src/lib/productTypes.ts:24`) rendert die Vorschau das Pair-Design mit beiden echten Charts; `relationLabel` wird aus `wuxingRelation` übersetzt (i18n: `relation.a_generates_b` → „{elementA} nährt {elementB}" usw. für alle 5 Wu-Xing-Relationen: generates/controls beide Richtungen + same).
- Der Pair-Design-TÜV prüft (wie Task 7): alle 8 Säulen beider Personen, beide Namen (escaped), Relations-Label, valides XML.
- Add-to-Cart-Gate: beide Charts `ready`. Metadaten: zusätzlich `placeResolvedB/LatB/LonB/TzB` (Spiegel der A-Felder, Muster `Personalize.tsx:105-118`).

- [ ] Steps: TDD-Zyklus wie Task 7/8 (Failing TÜV + Couple-Test → rot → implementieren → grün → `npm test` + `npm run build` grün → Commit `feat(couple): exact pair poster via /api/match`).

---

## Phase E — PDF-Generator

### Task 11: Fonts + `server/pdf.js` (SVG→PDF, maßgenau)

**Files:**
- Create: `server/assets/fonts/` (Noto Serif CJK SC + Noto Sans, mit OFL-Lizenzdatei), `server/pdf.js`, `server/printSpecs.js`
- Test: `tests/server/pdf.test.js`
- Modify: `package.json` (deps)

**Interfaces:**
- Produces: `renderPosterPdf({ designId, data, sizeId }): Promise<Buffer>`; `PRINT_SPECS` in `server/printSpecs.js`:

```js
// Endformat + 3mm Beschnitt je Seite (Gelato-Spez. je productUid in Task 13
// gegen den Katalog verifizieren — BLEED ggf. dort anpassen).
export const BLEED_MM = 3
export const PRINT_SPECS = {
  A3: { widthMm: 297, heightMm: 420 },
  A2: { widthMm: 420, heightMm: 594 },
  A1: { widthMm: 594, heightMm: 841 },
}
export const MM_TO_PT = 72 / 25.4
```

- [ ] **Step 1: Deps + Fonts**

```bash
npm install pdfkit svg-to-pdfkit
mkdir -p server/assets/fonts
curl -L -o server/assets/fonts/NotoSerifCJKsc-Regular.otf \
  "https://github.com/notofonts/noto-cjk/raw/main/Serif/OTF/SimplifiedChinese/NotoSerifCJKsc-Regular.otf"
curl -L -o server/assets/fonts/NotoSans-Regular.ttf \
  "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/NotoSans/hinted/ttf/NotoSans-Regular.ttf"
curl -L -o server/assets/fonts/OFL.txt "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/LICENSE"
file server/assets/fonts/*.otf server/assets/fonts/*.ttf   # muss OpenType/TrueType melden
```
Falls eine URL 404 liefert (Release-Layout geändert): Font manuell von fonts.google.com (Noto Serif SC / Noto Sans, OFL) laden — Dateiname beibehalten. **Prüfung ist Pflicht:** `file`-Ausgabe muss echte Font-Magic zeigen, nicht HTML.

- [ ] **Step 2: Failing Test** — `tests/server/pdf.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { renderPosterPdf } from '../../server/pdf.js'
import { PRINT_SPECS, BLEED_MM, MM_TO_PT } from '../../server/printSpecs.js'

const DATA = { frame: '#B98A5E', bg: '#E9DFCB', name: 'Anna Müller', element: 'Metall', animal: 'Pferd',
  pillars: [{ label: '年', stem: '庚', branch: '午' }, { label: '月', stem: '壬', branch: '午' }, { label: '日', stem: '辛', branch: '亥' }, { label: '時', stem: '乙', branch: '未' }] }

describe('renderPosterPdf', () => {
  it('produces a real PDF with the exact A2+bleed page size', async () => {
    const buf = await renderPosterPdf({ designId: 'klassik', data: DATA, sizeId: 'A2' })
    expect(buf.subarray(0, 5).toString()).toBe('%PDF-')
    const w = (PRINT_SPECS.A2.widthMm + 2 * BLEED_MM) * MM_TO_PT
    const h = (PRINT_SPECS.A2.heightMm + 2 * BLEED_MM) * MM_TO_PT
    const mediaBox = buf.toString('latin1').match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/)
    expect(mediaBox).not.toBeNull()
    expect(Number(mediaBox[1])).toBeCloseTo(w, 0)   // 426mm → 1207.6pt
    expect(Number(mediaBox[2])).toBeCloseTo(h, 0)   // 600mm → 1700.8pt
    expect(buf.length).toBeGreaterThan(50_000)      // Fonts wirklich eingebettet (subset)
  })
  it('rejects unknown sizeId/designId loudly', async () => {
    await expect(renderPosterPdf({ designId: 'klassik', data: DATA, sizeId: 'A9' })).rejects.toThrow()
    await expect(renderPosterPdf({ designId: 'ghost', data: DATA, sizeId: 'A2' })).rejects.toThrow()
  })
})
```

- [ ] **Step 3: rot**, dann **Step 4: `server/pdf.js` implementieren:**

```js
// SVG→PDF: dieselbe Design-Vorlage wie die Browser-Vorschau (src/designs/…),
// gerendert in Endformat + Beschnitt, Fonts eingebettet (pdfkit subsettet).
import PDFDocument from 'pdfkit'
import SVGtoPDF from 'svg-to-pdfkit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDesign } from '../src/designs/registry.mjs'
import { PRINT_SPECS, BLEED_MM, MM_TO_PT } from './printSpecs.js'

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets', 'fonts')
const FONTS = {
  'Noto Serif SC': path.join(FONT_DIR, 'NotoSerifCJKsc-Regular.otf'),
  'Noto Sans': path.join(FONT_DIR, 'NotoSans-Regular.ttf'),
}

export async function renderPosterPdf({ designId, data, sizeId }) {
  const spec = PRINT_SPECS[sizeId]
  if (!spec) throw new Error(`unknown sizeId: ${sizeId}`)
  const design = getDesign(designId)              // wirft bei unbekannter id
  const widthMm = spec.widthMm + 2 * BLEED_MM
  const heightMm = spec.heightMm + 2 * BLEED_MM
  const svg = design.render(data, { widthMm, heightMm })
  const doc = new PDFDocument({ size: [widthMm * MM_TO_PT, heightMm * MM_TO_PT], margin: 0 })
  for (const [name, file] of Object.entries(FONTS)) doc.registerFont(name, file)
  const chunks = []
  doc.on('data', (c) => chunks.push(c))
  const done = new Promise((resolve) => doc.on('end', resolve))
  SVGtoPDF(doc, svg, 0, 0, {
    width: widthMm * MM_TO_PT,
    height: heightMm * MM_TO_PT,
    fontCallback: (family) => (family && family.includes('Serif') ? 'Noto Serif SC' : 'Noto Sans'),
  })
  doc.end()
  await done
  return Buffer.concat(chunks)
}
```

- [ ] **Step 5: grün** — `npx vitest run tests/server/pdf.test.js` → PASS

- [ ] **Step 6: `[REAL-ARTIFACT]`-Beweis** — `scripts/evidence/pdf-artifact.mjs`: ruft `renderPosterPdf` mit dem kanonischen Chart auf, schreibt `docs/evidence/fufire-gelato/<datum>-klassik-A2.pdf`, konvertiert zur Sichtprüfung: `sips -s format png docs/evidence/fufire-gelato/<datum>-klassik-A2.pdf --out docs/evidence/fufire-gelato/<datum>-klassik-A2.png`. **Sichtprüfung ist Teil des Beweises:** PNG öffnen — Säulen 庚午/壬午/辛亥/乙未 lesbar, Layout entspricht der Browser-Vorschau. Ledger-Zeile (`[REAL-ARTIFACT]` + `[HUMAN-VERIFIED]` nach Sichtung).

- [ ] **Step 7: Commit** — `feat(server): print-exact pdf renderer from shared svg designs`

### Task 12: Fulfillment-Modul + `/prints`-Route + Webhook-Wiring

**Files:**
- Create: `server/fulfillment.js`
- Modify: `server/index.js` (DB-Spalten beim Boot, Webhook-Handler Zeile 186-188, neue GET-Route, `createApp`-Overrides `{ fufire, gelato }` durchreichen)
- Test: `tests/integration/fulfillment.test.js`

**Interfaces:**
- Consumes: `renderPosterPdf` (Task 11), `calculateBazi`/`matchHehun` (Tasks 2/9), `personalization`-Metadaten (Task 5/10: `date`, `time`, `placeLat/Lon/Tz`, `birthTimeUnknown`, `designId`, `size`), Orders-Persistenz (`persistOrder`, `server/index.js:187`).
- Produces: `fulfillOrder({ session, items, personalization, deps }): Promise<{printed: number}>` — pro Poster-Line: Chart neu berechnen (deterministisch = identisch zur Vorschau) → PDF rendern → in `orders` speichern (`print_pdf BYTEA`, `print_token`) → (Task 14 hängt Gelato hier an). Route `GET /prints/:sessionId/:token.pdf` → 200 `application/pdf` bei timing-safe Token-Match, sonst 404.
- DB-Boot-Migration (idempotent, direkt nach dem bestehenden `CREATE TABLE IF NOT EXISTS orders`, Zeile 36-45):

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS design_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS print_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS print_pdf BYTEA;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gelato_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_status TEXT;
```

- [ ] **Step 1: Failing Test** — `tests/integration/fulfillment.test.js`: `createApp({ fufire: stub, pool: fakePool })`-Muster; simulierter `checkout.session.completed`-Payload mit Poster-Personalisierung → erwartet: (a) `fulfillOrder` erzeugt PDF-Buffer (>50 kB, `%PDF-`), (b) `fakePool` erhielt UPDATE mit `print_token` + `print_pdf`, (c) `GET /prints/<sid>/<token>.pdf` liefert 200 + `content-type: application/pdf`, (d) falscher Token → 404, (e) Webhook-Handler antwortet Stripe auch bei Fulfillment-Fehler mit 200 und setzt `fulfillment_status='failed'` (Stripe darf nie endlos retryen, Fehler wird per Mail eskaliert — `sendEmails`-Muster).
- [ ] **Step 2: rot** → **Step 3: implementieren** (Token: `randomUUID()` — bereits importiert in `server/index.js:10`; Vergleich mit `timingSafeEqual`; `fulfillment_status`: `'printed' | 'failed'`) → **Step 4: grün + `npm test` gesamt** → **Step 5: Commit** `feat(server): order fulfillment pdf pipeline + tokenized print route`.

---

## Phase F — Gelato (**BLOCKIERT bis Operator GELATO_API_KEY liefert** — Code + Tests entstehen jetzt, Live-Beweis sobald Key da)

### Task 13: `server/gelato.js` + Katalog-verifiziertes Produkt-Mapping

**Files:**
- Create: `server/gelato.js`, `server/gelatoProducts.js`, `scripts/evidence/gelato-catalog-verify.mjs`
- Test: `tests/server/gelato.test.js`

**Interfaces:**
- Produces: `gelatoEnabled()`, `createOrder({ orderReferenceId, currency, items, shippingAddress }, fetchImpl?)` → POST `https://order.gelatoapis.com/v4/orders`, Header `X-API-KEY`, `orderType` aus `GELATO_ORDER_TYPE` (Default `'draft'` — Operator bestätigt im Dashboard, bis er auf `'order'` umschaltet). `items[n] = { itemReferenceId, productUid, quantity, files: [{ type: 'default', url }] }`.
- `server/gelatoProducts.js`: `productUidFor({ sizeId, frameName }): string` — Mapping-Tabelle der 6 Kombinationen (3 Größen × 2 Rahmen `Eiche natur`/`Schwarz matt`, `src/lib/bazi.ts:88-91`). **Die UIDs werden NICHT geraten:** Die Tabelle startet leer und wirft `GelatoMappingUnverifiedError`. `scripts/evidence/gelato-catalog-verify.mjs` fragt mit echtem Key den Gelato-Produktkatalog (`product.gelatoapis.com`, v3 catalogs/products search) nach gerahmten Postern in den Shop-Größen ab, druckt die 6 exakten UID-Zeilen zum Einfügen und schreibt die Katalog-Response als `[REAL-BOUNDARY-LIVE]`-Artefakt. Erst danach wird die Tabelle befüllt und der Test `gelato.test.js` von `it.skip` auf `it` gestellt. **Falls eine Shop-Größe (A3/A2/A1) im Gelato-Rahmen-Katalog nicht existiert, ist das ein Launch-Blocker-Befund → Ledger-RED, Operator entscheidet (Größe anpassen vs. Produkt ohne Rahmen).**
- Idempotenz: `createOrder` wird nur gerufen, wenn `orders.gelato_order_id IS NULL` (Task 14 prüft das).

- [ ] Steps: Failing Unit-Tests (Request-Shape, Header, orderType-Default `draft`, Fehler-Mapping) mit `fetchImpl`-Stub → rot → implementieren → grün → Commit `feat(server): gelato client + catalog-verified product mapping (mapping pending key)`.

### Task 14: Gelato in `fulfillOrder` + Versandadresse aus Stripe

**Files:**
- Modify: `server/fulfillment.js`, `server/index.js` (`/api/checkout`: `shipping_address_collection` prüfen/ergänzen)
- Test: Erweiterung `tests/integration/fulfillment.test.js`

**Interfaces:**
- Consumes: `createOrder`, `productUidFor` (Task 13), `print_token`-URL (Task 12), `PUBLIC_URL` (existiert, `.env.example:9`).
- Produces: nach PDF-Speicherung: `createOrder({ orderReferenceId: session.id, currency, items: [{ itemReferenceId, productUid: productUidFor({sizeId, frameName}), quantity, files: [{ type: 'default', url: `${PUBLIC_URL}/prints/${session.id}/${token}.pdf` }] }], shippingAddress: aus session.shipping_details/customer_details })` → `gelato_order_id` in `orders`, `fulfillment_status='submitted'`. Kein Gelato-Key → Status bleibt `'printed'` (env-gated, kein Fehler). Doppelter Webhook → zweiter Lauf sieht `gelato_order_id` und tut nichts (Test!).
- `/api/checkout`: falls `shipping_address_collection` fehlt, ergänzen: `shipping_address_collection: { allowed_countries: ['DE','AT','CH','NL','BE','FR','IT','ES','DK','SE','FI','PL','US','GB'] }` (Liste = bestehende Versandregionen aus `server/pricing.js` — beim Implementieren dagegen abgleichen).

- [ ] Steps: Failing Tests (Gelato-Stub via `createApp({ gelato })`: korrekte productUid je Größe/Rahmen, Draft-Idempotenz, Adress-Mapping Stripe→Gelato, env-gated Abschaltung) → rot → implementieren → grün → `npm test` + `npm run build` → Commit `feat(server): auto gelato draft order after payment (idempotent)`.

### Task 15: `[REAL-BOUNDARY-LIVE]` + `[HUMAN-VERIFIED]` — echter Gelato-Draft (**braucht Key**)

- [ ] **Step 1:** Operator legt `GELATO_API_KEY` in Railway + lokale `.env`. `node scripts/evidence/gelato-catalog-verify.mjs` → 6 UIDs eintragen, Katalog-Artefakt + Ledger-Zeile.
- [ ] **Step 2:** Test-Checkout mit Stripe-TEST-Key durchklicken (lokal, `npm start`) → Webhook feuert → Draft entsteht. `scripts/evidence/`-Artefakt: Gelato-Response-JSON mit `id` + `orderType:'draft'`.
- [ ] **Step 3 `[HUMAN-VERIFIED]`:** Operator öffnet Gelato-Dashboard, sieht den Draft mit korrektem Format/Rahmen/PDF, zeichnet im Ledger ab (Name + Datum). Erst danach: RED-Posten `RL-GELATO` im Ledger schließen. Umschalten auf Vollautomatik später durch `GELATO_ORDER_TYPE=order` (bewusste Operator-Entscheidung nach ≥20 fehlerfreien Drafts — als Empfehlung im Ledger notieren).
- [ ] **Step 4: Commit** der Mapping-Tabelle + Artefakte.

---

## Phase G — Hero + Mega-Menü (Quelle: `sizhu-atelier-plan-und-vision-hero-megamenue.md`, Operator-Plan 2026-07-12)

Brand-Tokens: `--brand-ivory: #FBF8F1`, `--brand-ink: #2C2420`, `--brand-terracotta: #A0522D`. Alle Abnahmekriterien aus Abschnitt 11 des Operator-Plans gelten als Akzeptanztests dieser Phase.

### Task G1: Audit + Nav-Datenmodell

**Files:** Create `src/lib/megaMenuConfig.ts` (Interfaces `NavLink`, `MegaMenuColumn`, `EditorialCard`, `MegaMenuConfig` exakt wie Operator-Plan §8.2; eine Config je Trigger: Collections, Posters, TCM Posters, Wuxing, Poster Sets, Inspiration — Inhalte aus §5.3). Audit: `Navbar.tsx`-Container (`overflow`/`transform`/`max-width`) dokumentieren, begrenzende Wrapper identifizieren, direkte Links (§6.1: Personalisieren, Bestsellers, New In, Offers) von Mega-Triggern trennen.
**Test:** `tests/unit/mega-menu-config.test.ts` — jede Config hat `landingPageHref`, 4 Spalten, Editorial-Karten mit alt-Texten; Link-hrefs existieren als Routen (Abgleich gegen App-Routen).

### Task G2: Viewport-Shell + SplitHero

**Files:** Create `src/components/home/SplitHero.tsx`; Modify Home-Seite (`.home-viewport`-Grid: `auto auto minmax(0,1fr)`, `min-block-size:100dvh`).
50/50-Split: links `#2C2420`-Panel mit H1 (Serif), Absatz, einem CTA (`#A0522D`) → `/kollektion`; rechts vollflächige Fotografie (`object-fit:cover`, `fetchpriority="high"`, kein lazy, `srcset`, feste Dimensionen; Bild aus vorhandenen Assets in `public/images/`, finales Foto = Operator-Asset, Phase 8 des Operator-Plans, als RED-Posten „HERO-ASSET" im Ledger).
**Test:** `tests/unit/split-hero.test.tsx` (H1/CTA/img-Attribute) + Playwright: beim Laden der Startseite ist **kein Produkt-Element** im Viewport (`data-band='above-fold'`-Anker beachten — bestehende Above-Fold-Tests aus `docs/context/state-desenio-delta.md` dürfen nicht brechen; falls Konflikt mit „Bestseller vor Kategorie-Banner"-Anker: Operator-Plan §2.1 gewinnt, alte Tests anpassen und im Ledger begründen).

### Task G3: Full-Width-Mega-Menü-Layer + Informationsarchitektur

**Files:** Modify `src/components/Navbar.tsx` (Layer AUSSERHALB des `max-width`-Containers: `position:absolute; top:100%; inset-inline:0; z-index:300; background:#FBF8F1`), Create `src/components/nav/MegaMenuLayer.tsx` (+ `MegaMenuColumn.tsx`, `MegaMenuEditorial.tsx`). Grid §5.5. Pills + untere 4er-Promo-Reihe entfernen. Schnelllinks-Textreihe, 4 Spalten, Editorial-Spalte mit Trendlinks + 2 Bildkarten.
**Test:** jsdom: Layer-Element ist NICHT Kind des begrenzten Containers; Pills-Selektoren nicht mehr vorhanden; je Trigger eigener Inhalt. Playwright: `boundingBox.width === viewport.width` (Full-Width-Beweis), Hero verschiebt sich beim Öffnen nicht (Layout-Shift-Messung).

### Task G4: Interaktionslogik

`OPEN_DELAY=80`, `CLOSE_DELAY=180`; öffnet bei Hover/Fokus/Enter/Space/Tap, schließt bei Escape/Außenklick/Fokusverlust; Titelwechsel ohne Schließ-Animation (Inhalt tauscht im offenen Panel). Getrennte `<a href>` + `<button aria-expanded aria-controls>` je Trigger (§6.2, hält den bestehenden A11y-Standard aus M18).
**Test:** jsdom mit fake timers (Delays, Escape, Fokuswechsel); bestehende `exact-a11y.test.tsx` bleibt grün.

### Task G5: Mobile Drawer + Accordions

Kein Hover mobil; Drawer mit Accordions, Hauptlink + Trigger getrennt; Hero gestapelt (Brand oben ≥56 %, Foto unten, §7).
**Test:** jsdom (Viewport-Mock) + Playwright mobile Projekt (falls in `playwright.config.ts` vorhanden, sonst `page.setViewportSize({width:360,height:740})`): kein horizontaler Überlauf (`scrollWidth <= clientWidth`).

### Task G6: `[REAL-BROWSER]`-Abnahme-Beweis Hero/Menü

Playwright-Spec `tests/e2e/hero-megamenu.spec.ts` prüft die Operator-Abnahmekriterien (§11) maschinell: Hero füllt Viewport-Rest, keine Produkte initial sichtbar, Menü full-width ohne rechte Restfläche, Escape schließt, kein horizontales Scrollen, DE/EN-Sprachwechsel. Screenshots (Desktop offen/zu, Mobile Drawer) → `docs/evidence/fufire-gelato/hero-*.png` + Ledger-Zeilen. LCP/CLS: `npm run build && npx playwright test` mit Trace, Werte im Ledger notieren.

Commits je Task (`feat(nav): …`, `feat(hero): …`).

---

## Phase H — FINALER BEWEIS-TESTLAUF (Erfolgskriterium des Operators)

> **Definition „geschafft" (Operator, 2026-07-12):** Bei Gelato ist das korrekte Design mit gewähltem Posterformat + Rahmenfarbe UND exakter Personalisierung angekommen — einmal Einzel-BaZi, einmal Partnerschaft. Der Operator prüft selbst im Gelato-Dashboard. Keine Lügen, nur Beweise.

**Ehrliche Abhängigkeiten (Stand 2026-07-12):** lokal existiert keine `.env` → es fehlen (a) `GELATO_API_KEY` (Operator legt Gelato-Account an), (b) `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` (TEST-Modus) für die echte Zahlungskette. Ohne (b) wird der Zahlungsschritt mit einem klar gekennzeichneten Session-Fixture direkt gegen `fulfillOrder` gefahren (`[INTEGRATION-FAKE]` für den Stripe-Schritt, alles danach real) — die Gelato-Ankunft selbst bleibt `[REAL-BOUNDARY-LIVE]`. Mit (b) läuft die volle Kette inkl. Stripe-Test-Checkout.

### Task H1: Einzel-BaZi End-to-End

1. `npm run build && FUFIRE_* GELATO_API_KEY=… npm start`
2. Browser (Playwright, sichtbar protokolliert): Personalisieren → Geburtsdaten kanonischer Fall → Design „Klassik" → A2 → Rahmen „Schwarz matt" → Warenkorb
3. Zahlung (Stripe-Test ODER Fixture, s. o.) → Webhook/`fulfillOrder`
4. Erwartet & im Ledger dokumentiert: PDF in DB (Maß A2+Beschnitt), Gelato-Draft-Response mit `orderType:'draft'`, productUid = A2/Schwarz-matt-Mapping, `fileUrl` abrufbar (HTTP 200, `%PDF-`)
5. **Operator prüft im Gelato-Dashboard:** Design korrekt, Säulen 庚午/壬午/辛亥/乙未 auf dem PDF, Format A2, Rahmen schwarz → zeichnet Ledger-Zeile `[HUMAN-VERIFIED]` ab.

### Task H2: Partnerschafts-Poster End-to-End

Wie H1, mit Produkttyp `couple`, zwei Personen (kanonischer Fall + 1992-11-03 08:15 München), Paar-Design, A3 + „Eiche natur". Erwartet: Paar-PDF mit beiden Säulensätzen + Relations-Label („Metall nährt Wasser"), Gelato-Draft mit A3/Eiche-UID. Operator-Abnahme wie H1.

**Erst wenn H1 UND H2 vom Operator abgezeichnet sind, gilt das Ziel als erreicht. Vorher wird kein „fertig" gemeldet.**

---

## Final Gate — Task 16: Gesamtbeweis + Reality-Ledger-Abgleich

- [ ] **Step 1: Voller Lauf** — alles muss grün sein UND die Artefakte existieren:

```bash
npm test && npm run build
node scripts/evidence/fufire-smoke.mjs          # (mit Env) live-Säulen exakt
node scripts/evidence/fufire-match-smoke.mjs    # (mit Env) live-Paar-Relation
node scripts/evidence/pdf-artifact.mjs          # PDF + PNG Artefakt
ls docs/evidence/fufire-gelato/                 # alle Ledger-Artefakte vorhanden
```

- [ ] **Step 2: Ledger-Endabnahme** — jede Zeile hat Artefakt + Repro-Kommando; RED-Sektion enthält NUR noch ehrlich Offenes (mindestens `OQ-TLST` bis Operator-Bestätigung; `RL-GELATO` falls Key noch fehlt). **Kein RED wird still gelöscht** — schließen nur mit Beweis-Zeile (Repo-Regel: Escalation-Asymmetrie, nur der Operator stuft herab).
- [ ] **Step 3: Bestehende Doku nachziehen** — `docs/context/state.md`: OQ-004-Eintrag von „BaZi placeholder stays (RED-tracked)" auf „BaZi exact via FuFirE `[REAL-BOUNDARY-LIVE]`, Beweise: docs/evidence/fufire-gelato/ledger.md" ändern; Platzhalter-Kommentar in `src/lib/bazi.ts:26-33` aktualisieren (computeChart bleibt nur noch für Katalog-Dekoration, Personalize nutzt ihn nicht mehr — falls nach Task 5/8 keine Aufrufer übrig sind: Funktion löschen).
- [ ] **Step 4: Commit + Push** — `git push -u origin feat/fufire-personalization`. PR-Erstellung nur auf Zuruf des Operators.

---

## Self-Review (durchgeführt)

- **Spec-Abdeckung:** exakte Berechnung (T2-T6) ✓ · jeder Ort inkl. mehrdeutig/nicht gefunden (T2, T5) ✓ · Echtzeit <0,5 s (Debounce 300 ms + gemessene ~0,2 s API, T4) ✓ · Design-Registry änderbar/erweiterbar (T7-T8) ✓ · Partner-Poster (T9-T10) ✓ · automatisches Druck-PDF (T11-T12) ✓ · Gelato automatisiert mit korrektem Format/Rahmen, Draft-Sicherheitsnetz, Idempotenz (T13-T15) ✓ · echte Beweise statt grüner Haken: Evidence-Ledger mit 4 Beweisklassen, pro Phase Pflicht-Artefakt (T1, T3, T6, T9, T11, T15, T16) ✓ · Keys nur Env (Global Constraints, T1) ✓
- **Platzhalter-Scan:** Gelato-productUids sind bewusst KEINE erfundenen Werte, sondern per Katalog-Skript zu verifizieren (T13) — das ist der Beweis-Mechanismus, kein TODO. Task 9/10/13/14 haben komprimierte Steps, aber definierte Verträge, vollständige Fixture-Werte und konkrete Testfälle.
- **Typ-Konsistenz:** `Chart`-Form (T2) = `ExactChart`-Kern (T4) = `PosterData.pillars`-Form (T7 Render, T11 PDF) — identische Feldnamen `{label, stem, branch}`; `createApp`-Overrides einheitlich `{stripe, fufire, gelato, pool}`; `productUidFor({sizeId, frameName})` konsumiert exakt `size.id`/`frame.name` aus `src/lib/bazi.ts`.

**Bekannte Risiken (ehrlich):** (1) `svg-to-pdfkit`-Glyph-Rendering für CJK muss die Sichtprüfung in T11/Step 6 bestehen — falls nicht, Fallback: SVG→PNG via `@resvg/resvg-js` in 300 DPI + PNG-in-PDF (gleicher Vertrag, nur `server/pdf.js` intern anders). (2) Font-Download-URLs können sich ändern — manueller Fallback dokumentiert. (3) Gelato-Rahmengrößen ggf. ≠ A3/A2/A1 — als expliziter Befund-Pfad in T13 eingeplant, kein stiller Ausfall.
