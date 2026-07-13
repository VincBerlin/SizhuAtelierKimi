# Evidence-Ledger — FuFirE-Personalisierung + Design-Registry + Gelato + Hero/Mega-Menü

Regel: Eine Behauptung ohne Artefakt-Zeile hier gilt als NICHT bewiesen.
Offene RED-Posten stehen unten und blockieren den Launch, bis geschlossen.

Beweisklassen: `[REAL-BOUNDARY-LIVE]` (live API, gespeicherte Response) ·
`[REAL-BROWSER]` (Playwright gegen gebauten Server, Screenshot) ·
`[REAL-ARTIFACT]` (erzeugte Datei mit Maß-/Byte-Prüfung) ·
`[HUMAN-VERIFIED]` (Operator hat gesehen und abgezeichnet).

| Behauptung | Klasse | Artefakt | Reproduktion | Datum |
|---|---|---|---|---|
| Kanonischer Fall (1990-06-15 12:30 Berlin, TLST) liefert live durch `server/fufire.js` exakt 庚午/壬午/辛亥/乙未, Pferd/Metall, engine 1.0.0-rc1-20260220 | [REAL-BOUNDARY-LIVE] | `2026-07-12-bazi-live-response.json` | `FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-smoke.mjs` | 2026-07-12 |
| Druck-PDF maßgenau erzeugt: A2+3mm Beschnitt = MediaBox 1207.56×1700.79 pt, 59 kB (Fonts subset-eingebettet), Sichtprüfung: Säulen/Labels/Name korrekt (Tofu-Box-Fund bei 年月日時 behoben — Labels → CJK-Font) | [REAL-ARTIFACT] | `2026-07-12-klassik-A2.pdf` + `.png` | `node scripts/evidence/pdf-artifact.mjs` | 2026-07-12 |
| Paar-Analyse live: Person A konsistent 庚午/壬午/辛亥/乙未 (gepinnte TLST-Konvention wirkt auch im Match-Endpunkt — Abweichungs-Fund behoben durch explizite standard/boundary-Übergabe), Relation Metall→nährt→Wasser, nur CALCULATED-Fakten | [REAL-BOUNDARY-LIVE] | `2026-07-12-match-live-response.json` | `FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-match-smoke.mjs` | 2026-07-12 |
| Partner-Poster-Druck-PDF live erzeugt: Charts beider Personen via matchHehun (A=庚午/壬午/辛亥/乙未 konsistent, B=壬申/庚戌/癸未/丁巳), Paar-Design A3+Beschnitt 62 kB, Sichtprüfung: beide Säulensätze + Relations-Label korrekt | [REAL-ARTIFACT]+[REAL-BOUNDARY-LIVE] | `2026-07-12-paar-harmonie-A3.pdf` + `.png` | `FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/pdf-pair-artifact.mjs` | 2026-07-12 |
| Hero + Mega-Menü erfüllen die Operator-Abnahmekriterien (§11) im echten Chromium gegen den frisch gebauten Server: Hero füllt Viewport (kein Produkt im ersten Screen, Desktop 1440×900), mobil Brand-über-Foto ohne horizontales Scrollen (360×740), Menü full-width (x≤1, Breite ≥1438) ohne Layout-Shift, Escape schließt, Editorial-Spalte + genau 2 Bildkarten — 4/4 passed. Screenshot-Fund behoben: Ledger-Artefakt wurde mitten im 180ms-Fade geschossen (halbtransparentes Panel) → Spec wartet jetzt auf `opacity: 1` | [REAL-BROWSER] | `hero-desktop.png` · `hero-mobile.png` · `megamenu-open.png` | `npm run build && node server/index.js` + `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/hero-megamenu.spec.ts --project=chromium-desktop` | 2026-07-12 |
| Server-Testprojekt vollständig grün: 72/72 in 8 Dateien (FuFirE-Client-Normalisierung, /api/bazi + /api/match + /api/geocode-Routen, Druck-PDF, Fulfillment-Pipeline inkl. Idempotenz/Gelato-Draft/Token-404, Checkout-Re-Pricing, Region-Currency, Order-Currency, Credits-Decommission). Fund behoben: `checkout.repricing` AT-002-3 war seit RL-GEO (cad8794) stale — Test setzte kein `TRUSTED_GEO_HEADER`, Server verhielt sich KORREKT (sicherer Default); Test folgt jetzt dem region-currency-Muster | [INTEGRATION-FAKE] (Stripe/Gelato gestubbt, echte Routen) | Vitest-Ausgabe 2026-07-12 22:47: `Test Files 8 passed (8) · Tests 72 passed (72)` | `node ./node_modules/vitest/vitest.mjs run --project node --maxWorkers=1 --no-file-parallelism` | 2026-07-12 |
| GESAMTE Vitest-Suite grün — jsdom 611/611 (55 Dateien) + jsdom-isolated 8/8 (1 Datei) + node 72/72 (8 Dateien) = 691 Tests. Voraussetzungen auf dieser Maschine: warmer node_modules-Cache (iCloud) + sequenzieller Lauf. 9 vorgefundene jsdom-Rots geschlossen: 5 Operator-Supersession-Nachzüge (s. Vertrags-Änderungen), 2 FuFirE-Gate-Portierungen, 2 Umgebungs-Fixes (import.meta.url / Debounce-Datei-Isolation) — keine Assertion geschwächt | [INTEGRATION-FAKE]/[SHIPPED-SCAN] (echte Komponenten/Provider, nur externe APIs gemockt) | Vitest-Ausgabe 2026-07-13: `55 passed (55) · 611 passed (611)` + `1 passed (1) · 8 passed (8)` | `node ./node_modules/vitest/vitest.mjs run --project jsdom --isolate=false --maxWorkers=1 --no-file-parallelism` + `--project jsdom-isolated` + `--project node` | 2026-07-13 |
| Live-Smokes mit Operator-Keys REPRODUZIERT: kanonischer Fall exakt 庚午\|壬午\|辛亥\|乙未, Pferd/Metall, engine 1.0.0-rc1-20260220 (exit 0) UND Paar-Match A konsistent + Relation Metall→nährt→Wasser (exit 0). Keys hinterlegt in lokaler `.env` (gitignored) + Railway-Service `sizhuatelier-shop` (FUFIRE_API_URL/KEY, GELATO_API_KEY, GELATO_ORDER_TYPE=draft; per CLI, --skip-deploys) | [REAL-BOUNDARY-LIVE] | `2026-07-12-bazi-live-response.json` / `2026-07-12-match-live-response.json` (frisch überschrieben 2026-07-13 01:12 lokal; Dateiname = UTC-Datum des Laufs) | `node --env-file=.env scripts/evidence/fufire-smoke.mjs` bzw. `…fufire-match-smoke.mjs` | 2026-07-13 |
| Käufer-Flow LIVE im echten Browser: Geburtsdaten eingeben → Poster zeigt die exakt live-berechneten Säulen (庚壬辛乙亥未, PFERD, METALL) — personalize-exact.spec.ts gegen gebauten Server MIT echten FuFirE-Keys, 5/5 passed (inkl. Hero/Mega-Menü-Spec). Mobile-first-Fix bewiesen: H1 beginnt ≥106px (unter der fixierten Kopfzeile; Logo-Overlap-Fund behoben via pt-[130px], neue Assertion im Spec). Ink Black der Markenfläche jetzt aus kanonischer Quelle `--ink-black` (index.css) | [REAL-BROWSER]+[REAL-BOUNDARY-LIVE] | `personalize-exact-live.png` · `hero-mobile.png` (beide frisch) | `npm run build && node --env-file=.env server/index.js` + `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/hero-megamenu.spec.ts tests/e2e/personalize-exact.spec.ts --project=chromium-desktop` | 2026-07-13 |

## RED (offen, launch-relevant)

- **RL-VITEST-ENV** — DIAGNOSTIZIERT (2026-07-12, Session 3), Ursache dreischichtig,
  teilweise geschlossen:
  1. Die Claude-Code-Sandbox blockiert Vitest-Worker vollständig (Hänger ohne
     Output). Abhilfe: ohne Sandbox laufen lassen.
  2. Der parallele Fork-Sturm des Standard-Laufs (`npm test`) überfordert die
     Maschine: 55 „Failed to start forks worker"-Fehler, nur 8/~75 Dateien
     gesammelt. Abhilfe: `--maxWorkers=1 --no-file-parallelism`.
  3. Wurzelursache der langsamen Worker-Starts, HART GEMESSEN: ein nackter
     `node -e "import('jsdom')"` brauchte **16:02 min Wanduhrzeit bei 1,2 s
     CPU (0 %)** — reines I/O-Warten. Das Repo liegt in `Documents/`
     (iCloud-Drive-Sync); FileProvider materialisiert kalte node_modules-Reads
     on-demand, der jsdom-Umgebungs-Import sprengt so das 60s-Worker-Handshake-
     Limit („Timeout waiting for worker to respond", identisch mit forks UND
     threads Pool). Empfehlung: Repo aus dem iCloud-Sync nehmen (z. B. nach
     `~/dev/` verschieben oder Ordner „immer behalten"/nosync) oder Suite in CI.
  STAND 2026-07-13: GESCHLOSSEN für die Ausführung — nach Cache-Warm-up lief
  die GESAMTE Suite grün (691 Tests, s. Evidenz-Zeile oben). Rezept auf dieser
  Maschine: ohne Claude-Sandbox + `--maxWorkers=1 --no-file-parallelism`
  (jsdom zusätzlich `--isolate=false`), node_modules zuvor warm lesen.
  OFFEN bleibt die Umgebungs-EMPFEHLUNG: Repo aus dem iCloud-Sync nehmen
  (sonst kehrt der kalte 16-min-jsdom-Import nach Cache-Eviction zurück)
  und die Suite zusätzlich in CI verankern.

- **OQ-TLST** — Zi-Grenzfall-Konvention (TLST/boundary) vom Operator gegen die
  FuFirE-Snapshot-Suite (`tests/snapshots/moseph/zi_*.json` im FuFirE-Repo)
  zu bestätigen. Bis dahin gilt gepinnt: `standard=TLST`, `boundary=midnight`.
- **RL-GELATO** — Gelato-Fluss unbewiesen. STAND 2026-07-13: Operator-Key liegt
  vor (lokal `.env` + Railway hinterlegt), aber BEIDE Gelato-APIs lehnen ihn ab
  (Product-API v3 `GET /catalogs` → 401, Order-API v4 `GET /orders` → 401;
  Format sauber: 69 Zeichen, 4 Bindestriche, kein Whitespace/CR). Der Key ist
  damit ungültig/inaktiv — Operator: im Gelato-Dashboard unter API-Keys einen
  gültigen Key erzeugen/kopieren, `.env` UND Railway aktualisieren, dann
  `node --env-file=.env scripts/evidence/gelato-catalog-verify.mjs` (füllt die
  6 productUids). `PRODUCT_UIDS` bleibt bis dahin LEER — nichts wird geraten.
- **RL-STRIPE-CHAIN** — Volle Zahlungskette (Checkout→Webhook) unbewiesen bis
  Stripe-TEST-Keys lokal vorliegen; Fallback für H1/H2: Session-Fixture direkt
  gegen `fulfillOrder` (Stripe-Schritt dann `[INTEGRATION-FAKE]`, Rest real).
- **HERO-ASSET** — Finales Hero-Foto ist Operator-Asset (Phase 8 des
  Hero/Mega-Menü-Plans); bis dahin bestes vorhandenes Asset aus `public/images/`.

## Vertrags-Änderungen (Operator-superseded, dokumentiert statt still)

- **AT-004-3 (asset-light Mega-Menü-Kacheln) superseded 2026-07-12:** Der
  Operator-Plan Hero/Mega-Menü §5.3 verlangt GENAU ZWEI große Bildkarten MIT
  echten Bildern (Personalized BaZi + Fire Horse). Der alte
  `data-placeholder`-Vertrag (RL-IMAGES, DELTA T-203) ist damit für die
  Editorial-Karten aufgehoben; verwendet werden bereits vorhandene Assets
  (`bazi-personal.webp`, `fire-horse-editorial.webp`). Test aktualisiert:
  `tests/unit/delta-mega-menu-tiles.test.tsx`. Escalation-Regel gewahrt:
  Herabstufung kam vom Operator (Plan-Dokument), nicht vom Agenten.
  *Nachtrag 2026-07-13:* Der ältere Duplikat-Vertrag in
  `tests/unit/exact-nav-matrix.test.tsx` (≥4 asset-light Kacheln) hielt noch
  den superseded Stand und ist jetzt auf §5.3 nachgezogen (genau 2, echte
  Bilder).
- **VIS-032 (InkWave-Hero unangetastet) superseded 2026-07-12:** Operator-Plan
  §2/§4 ersetzt den Three.js-Hero durch den Split-Hero in der Viewport-Shell.
  *Nachtrag 2026-07-13:* Test-Nachzug — `tests/unit/exact-home-sequence.test.tsx`
  prüfte noch den lazy-InkWave-Split; neue Perf-Invariante: Home lädt KEIN
  InkWave/Three.js mehr, Hero bleibt erstes Modul.
- **Hero-CTA-Ziel + Terracotta (AT-002-5-Hero / AT-017-COLOR-2) superseded
  2026-07-13 per Operator-Plan §4:** Der Split-Hero trägt GENAU EINEN CTA →
  `/collections` (alt: `/personalize` im Hero) und definiert `BRAND_TERRACOTTA
  #A0522D` als CTA-Farbe. Tests nachgezogen: `analytics-events.test.tsx`
  (CTA-Ziel /collections, Funnel-Event unverändert gefordert) und
  `delta-color-tokens.test.ts` (Datei-gebundene Ausnahme #A0522D NUR in
  `SplitHero.tsx`; Hover #B5652B bleibt überall verboten). Quelle: Plan-§4
  (Commit 44ed13a-Implementierung); Escalation-Regel gewahrt.
- **FuFirE-Gate-Nachzug 2026-07-13 (kein Vertragswechsel, Testreparatur):**
  `delta-poster-bg-palette.test.tsx` (AT-018-3 Cart-Line) und
  `personalization-passthrough.test.tsx` (AT-004-1 Paar) stammten aus der
  Vor-FuFirE-Zeit und liefen ins (gewollte) Ehrlichkeits-Gate — jetzt mocken
  sie `/api/geocode`/`/api/bazi`/`/api/match` nach dem Muster von
  `personalize-exact-chart.test.tsx` und beweisen ihre Verträge DURCH das
  Gate hindurch. `use-bazi-chart`-Koaleszenz-Test in eigene Datei isoliert
  (`use-bazi-chart.debounce.test.tsx` — Sibling-Fake-Timer-Leckage, Hook
  selbst korrekt). `exact-taxonomy`/`exact-reality-ledger` lesen Dateien nun
  über `process.cwd()` (Vitest-4-jsdom: `import.meta.url` ist keine
  file://-URL mehr).
