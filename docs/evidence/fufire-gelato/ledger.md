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
| Operator-Batch #2 im echten Chromium bewiesen (6/6): Mobile-Personalize — Poster-Vorschau klebt beim Scrollen SICHTBAR unter der Kopfzeile (y≈112, ≤36vh; Fund „Poster beim Ausfüllen unsichtbar" geschlossen, neue Spec-Assertion als Regressions-Schutz), SVG-Vorschau jetzt vollständig erkennbar (mm-Maße-Fund per CSS gezähmt); Sale-Banner unter dem Menü; 75-€-Announcement regional; eckige Buttons + Auswahlringe; Live-Käufer-Flow weiterhin grün | [REAL-BROWSER] | `personalize-mobile-sticky.png` · `hero-desktop.png` (frisch) | `npm run build && node --env-file=.env server/index.js` + `PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test tests/e2e/hero-megamenu.spec.ts tests/e2e/personalize-exact.spec.ts --project=chromium-desktop` | 2026-07-13 |
| PDF-ANKUNFT bei Gelato HART BEWIESEN: Gelatos S3-Kopie (`file_original_default`) der Testbestellung heruntergeladen und mit unserer Druck-PDF verglichen — **BYTE-IDENTISCH** (61.728 B, SHA-256 `95a0c8cfc8073d02…d31dfd106` auf BEIDEN Seiten, %PDF-1.3-Header). Zusätzlich visueller Beweis: Gelatos Prepress hat aus GENAU dieser PDF das Druck-Preview gerendert (1084×1500 PNG, schwarzer Rahmen) — Säulen exakt 庚午/壬午/辛亥/乙未, METALL·PFERD, Name, CJK-Labels korrekt. [HUMAN-VERIFIED]: Operator hat die Draft-Order im Gelato-Dashboard GESEHEN und bestätigt (Chat 2026-07-13, „sehr gut ich sehe die bestellung") | [REAL-BOUNDARY-LIVE]+[HUMAN-VERIFIED] | `2026-07-13-gelato-pdf-sha256.txt` · `2026-07-13-gelato-preview-default.png` | Order per `GET /v4/orders/544e1b36-…` → `files[0].url` laden → `shasum -a 256` gegen die Prod-PDF-Route | 2026-07-13 |
| Personalisierte TESTBESTELLUNG ohne Kaufabschluss END-TO-END: Session-Fixture → FuFirE-Live-Neuberechnung (engine 1.0.0-rc1) → Druck-PDF 61.728 B in Produktions-DB → PDF von der Produktions-Domain byte-identisch abrufbar (HTTP 200, %PDF) → ECHTER Gelato-DRAFT `544e1b36-5ee1-43c9-a6f3-0fb64564900d` (orderType=draft, fulfillmentStatus=draft, KEINE Produktion) mit korrekt gemappter productUid (A2 × Schwarz matt) — Gegenprobe per GET: Gelato hat die Datei auf SEIN S3 kopiert und 3 Druck-Previews erzeugt; Versandadresse TEST-markiert. Verbleibt [HUMAN-VERIFIED]: Operator sichtet den Draft im Dashboard (löschen oder bewusst bestätigen) | [REAL-BOUNDARY-LIVE] | `2026-07-13-gelato-draft-order.json` | `DATABASE_URL=$(railway variables --service Postgres --kv \| grep DATABASE_PUBLIC_URL \| cut -d= -f2-) node --env-file=.env scripts/evidence/gelato-draft-smoke.mjs` | 2026-07-13 |
| Gelato-Produkt-Mapping vollständig LIVE-VERIFIZIERT (2. Operator-Key, beide APIs 200): alle 6 Kombinationen A3/A2/A1 × Eiche natur/Schwarz matt existieren als exakte productUids im Katalog `framed-posters` (gefilterte products:search, Papier 250 gsm uncoated offwhite archival, Holzrahmen 12×22 mm, Plexiglas, Hochformat) und sind in `server/gelatoProducts.js` hinterlegt; Fulfillment-Test beweist GENAU EINEN Draft mit gemappter UID, idempotent (node 72/72) | [REAL-BOUNDARY-LIVE] | `2026-07-13-gelato-uid-mapping.json` + `2026-07-13-gelato-catalog-fine-art-framed-poster.json` (Erst-Scan, Fehlkatalog-Fund) | `node --env-file=.env scripts/evidence/gelato-catalog-verify.mjs` (exit 0) | 2026-07-13 |

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
- **RL-GELATO** — WEITGEHEND GESCHLOSSEN 2026-07-13 (zweiter Operator-Key,
  beide APIs 200; alter Key war ungültig, 401 überall):
  1. Alle 6 productUids (A3/A2/A1 × Eiche natur/Schwarz matt) über die
     GEFILTERTE products:search des Katalogs `framed-posters` live verifiziert
     (attributeFilters FrameSize×FrameColor×Orientation=ver) und in
     `server/gelatoProducts.js` eingetragen. Artefakt:
     `2026-07-13-gelato-uid-mapping.json`. Fund dabei behoben: die alte
     Substring-Suche traf den FALSCHEN Katalog (fine-art) und verwechselte
     Zoll mit Zentimetern („30x40-inch" ≠ A3) — Script auf Attribut-Filter
     umgestellt, verifiziert jetzt die hinterlegte Tabelle gegen live.
  2. Gewählte Konstanten (Operator-review-bar): Papier
     `250-gsm-uncoated-offwhite-archival` (= Shop-Zusage „Naturpapier,
     säurefrei & lichtecht"), Holzrahmen 12×22 mm, Plexiglas, Hochformat.
     „Eiche natur"→natural-wood, „Schwarz matt"→black.
  3. Fulfillment-Test fortgeschrieben: GENAU EIN Draft mit der gemappten UID,
     idempotent bei Webhook-Replay (72/72 node grün).
  Der Test-Draft ist ANGELEGT (2026-07-13, `544e1b36-…`, s. Evidenz-Zeile:
  Datei von Gelato gezogen, 3 Previews erzeugt, orderType=draft). OFFEN
  bleibt nur noch die [HUMAN-VERIFIED]-Abzeichnung: Operator sichtet den
  Draft im Gelato-Dashboard (löschen oder bewusst bestätigen).
- **RL-STRIPE-CHAIN — GESCHLOSSEN 2026-07-14 `[REAL-BOUNDARY-LIVE]` +
  `[REAL-BROWSER]`:** Volle Zahlungskette end-to-end in PROD bewiesen
  (Test-Modus, sk_test): Live-Personalisierung (exakte Säulen 庚…) →
  `/api/checkout` (server-repriced €53.90) → Stripe-Hosted-Checkout
  (Session `cs_test_b1nAmHF8…`) → Testkarte 4242 bezahlt →
  `checkout.session.completed`-Webhook signaturverifiziert →
  `fulfillOrder` → Druck-PDF → Gelato-Draft `baf606f4-56aa-4539-8d7f-80e34ea394e7`
  (orderType=draft) → PDF von Gelatos S3 zurückgeladen: HTTP 200,
  61 282 Bytes, `%PDF`-Header. Artefakte: `stripe-chain-hosted-checkout.png`
  (zeigt aktive Zahlarten: Apple Pay/Klarna/Link/Amazon Pay-Express +
  Card/Klarna/MB WAY/Bancontact), `stripe-chain-card-filled.png`,
  `stripe-chain-success.png`. Stripe-Setup per API: Payment-Method-Config
  `pmc_1Tsu3g0y…` (card/apple_pay/google_pay/link on, sepa_debit
  bewusst OFF — verzögerte Zahlarten passen nicht zum completed-only-Webhook;
  klarna zunächst on, dann per OPERATOR-Entscheidung 2026-07-14 „klarna
  möchten wir nicht anbieten" auf off — Beweis:
  `stripe-checkout-no-klarna.png`, frische Hosted-Checkout-Session ohne
  Klarna-Treffer im Seitentext),
  Webhook-Endpoint `we_1Tt3BX0y…` auf `/api/webhook`. NEBENFUND aus dem
  Success-Screenshot: der Footer-Claim trug noch „climate-neutral shipping"
  (Operator-Anweisung Batch #2: raus) — in allen 4 Sprachen auf
  „Personalized from your birth data" gekürzt; gleichlautende Klima-Aussagen
  in FAQ/Quickstart-Texten bestehen weiter und liegen beim Operator zur
  Entscheidung. NEUER RED-CARRY
  **RL-STRIPE-LIVE**: Account ist Test-Modus (charges_enabled=false,
  details_submitted=false) — vor Launch: Stripe-Aktivierung abschließen,
  sk_live-Keys + Live-Webhook-Endpoint (neues whsec) setzen, eine echte
  Kleinbetrag-Bestellung verifizieren.
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
- **Operator-Batch 2026-07-13 (Direktanweisung im Chat, supersedet mehrere
  eingefrorene Verträge):**
  1. *Hero-Grenze = Menü-Grenze:* App-Padding jetzt auch auf Home; Hero =
     `calc(100dvh − 106px)`, beginnt an der Menü-Unterkante (supersedet die
     100dvh-hinter-transparenter-Leiste-Lösung vom 2026-07-12; SplitHero-
     pt-[130px]-Kopffreiheit damit obsolet und entfernt).
  2. *Primärleiste reduziert:* Poster/TCM/Wuxing/Offers/Poster-Sets raus (im
     Mega-Menü verankert), Inspiration → Mega-Menü-Quick-Access. Supersedet
     die 8-Item-Leiste (REQ-003/REQ-005). Tests nachgezogen:
     delta-primary-nav, exact-taxonomy, delta-offers-hub (AT-024-4 via
     QUICK_ACCESS).
  3. *Poster-Background-Palette (5 Swatches, REQ-018/T-404) GELÖSCHT* aus
     tokens/Store/Personalize/Configurator/PDP; Test-Datei
     delta-poster-bg-palette.test.tsx entfernt (Vertrag aufgehoben).
  4. *Footer:* Versand-Zeile (shipNote „Climate-neutral … US & UK always
     free") und Sprach-Umschalter entfernt (Sprache bleibt im Header).
  5. *Echte Paar-SKU (Katalog id 15, 69 €):* personalisiertes Kompatibilitäts-
     Poster — supersedet den „no invented couple SKU"-Vermerk; PDP leitet in
     den Paar-Flow (/personalize?type=couple, neuer Query-Param), Warenkorb
     über den live-bewiesenen 合婚-Pfad. Server-Preisspiegel 15:69
     (Paritätstest gekoppelt).
  6. *Shop-by-World + How-it-works* als vollbreite Bänder im Hero-Farbton
     (--ink-black), Texte hell.
- **Operator-Batch #2 2026-07-13 (Direktanweisung, UI/UX-Finale):**
  1. *Commerce LIVE:* Railway `VITE_COMMERCE_ENABLED=true` (war false →
     „Preview/launching soon" + „Coming soon" statt Preisen). Die regionale
     Versand-Announcement (us/uk free · eu Schwelle, nie vermischt) war
     bereits implementiert und wird durch das Flag sichtbar.
  2. *Versandschwelle 80 € → 75 €* (tokens + server-Spiegel + i18n-Texte;
     Paritätstest koppelt).
  3. *Poster-Vorschau-Fund:* geteilte SVG-Vorlage trägt absolute mm-Maße
     (420mm ≈ 1587px) → Browser-Vorschau überdimensional; CSS zähmt auf
     Containerbreite + Höhen-Deckel (Druckquelle unangetastet).
  4. *Mobile-Sticky-Fund:* im einspaltigen Grid war das Vorschau-Item seine
     EIGENE Row → sticky wirkungslos, Poster beim Ausfüllen unsichtbar.
     Layout <lg jetzt display:block + kompakte Sticky-Vorschau (36vh) unter
     der Kopfzeile — Poster bleibt bei Rahmen/Format/Farben IMMER sichtbar.
  5. *Karten:* Beschreibungszeile (card-claim) entfällt, Preis direkt unter
     dem Titel (Test-Nachzug delta-product-card-asset-light als
     Gegen-Assertion). Welt-Karten groß/eckig (min 240px, Titel 28).
  6. *Eckig:* global `button/[role=button]/a.cta-square { border-radius: 0
     !important }`.
  7. *Inspiration-Teaser:* zweispaltig, größer, mit EHRLICH markierter
     Platzhalter-Bildfläche (data-placeholder; finales Foto = Operator-Asset).
  8. *Newsletter minimalistisch:* copy-Absatz + Benefits raus (i18n-Daten
     bleiben; DSGVO-Consent unangetastet).
  9. *Sale-Banner „Now save 20%"* unter dem Menü auf jeder Seite → /offers;
     nur im Live-Commerce-Modus. Der 20%-Wert ist eine OPERATOR-VORGABE;
     Träger ist die bestehende Streichpreis-Mechanik (catalog anchor) —
     kein serverseitiger Rabatt-Code. Operator verantwortet die Preispflege
     passend zum Claim (UWG).
  10. *Sprach-Automatik:* Basis EN; gespeicherte Wahl gewinnt; sonst Land aus
     /api/region (DE/AT→DE, FR→FR, ES→ES — wirkt, sobald am Edge
     TRUSTED_GEO_HEADER konfiguriert ist), sonst Browser-Sprache. EHRLICH:
     ohne Edge-Geo-Header entscheidet die Browser-Sprache, nicht die IP.
  11. *personalize-entry-Sektion* direkt nach dem Hero (Einzel-BaZi +
     Paar-Kompatibilität als große Einstiegskarten); Home-Sequenz-Test
     fortgeschrieben (REQ-014-Reihenfolge + personalize-entry).
- **Operator-Batch #3 2026-07-13 (Personalisierungs-Review + Poster-Sprache):**
  1. *Poster-Sprache-Fund:* FuFirE liefert Element/Tier KANONISCH DEUTSCH —
     Vorschau UND Druck zeigten „METALL/PFERD" auch bei englischer
     Poster-Sprache; der Subtitle („BAZI · VIER SÄULEN") war hardcoded.
     NEU: geteiltes Modul `src/designs/posterLocale.mjs` (Elemente, 12 Tiere,
     Subtitles single/pair, Relations-Label — EINE Quelle für Browser + PDF;
     unbekannte Werte werden UNVERÄNDERT durchgereicht, nie geraten). Die
     doppelt gepflegte RELATION_TEXT-Tabelle in fulfillment.js ist dedupliziert.
     Designs nehmen `data.subtitle` (Fallback = bisheriger deutscher Text);
     Design-TÜV-Fixture um Subtitle-Injektion erweitert.
  2. *Tagesmeister + Säulen als Review:* neuer chart-review-Block in der
     Personalisierung (erst bei fertigem exakten Chart, nie Platzhalter):
     Tagesmeister (Tag-Stamm + lokalisiertes Element), Säulen-Zeile
     (年 庚午 · …), Tierzeichen.
  3. *Partner-Review (Paar):* beide Partner als Karten mit den KORREKTEN
     eingegebenen Daten (Name, Datum, Zeit inkl. Noon-Fallback-Anzeige,
     aufgelöster Ort) + je Tagesmeister (dayMasterA/B aus /api/match) +
     Relations-Label; Summary um Partner-Datenzeile ergänzt.
  4. Tests fortgeschrieben: personalize-exact-chart (EN→Horse/Metal, Review,
     DE-Umschaltung via poster-lang-picker), personalize-exact.spec (HORSE/
     METAL/FOUR PILLARS + Review-Assertions).
- **Operator-Batch #6 2026-07-14 (Inputs eckig · getrennte Geburtszeit-Toggles
  · Scrollbalken weg · Template-Beweis):**
  1. *Eingabefelder eckig:* globale CSS-Regel erweitert (input/select/textarea
     radius 0 !important — konsistent mit der Button-Regel).
  2. *„Geburtszeit unbekannt" JE PERSON:* der geteilte Toggle ist in
     unknownTimeA/B aufgetrennt (eigene Checkbox unter jedem Personen-Block,
     testids unknown-time-a/b; eigener Noon-Hint je Person). Gate, Validierung,
     Summary, Partner-Review und Metadaten (birthTimeUnknown/B) laufen je
     Person; Druckweg war bereits getrennt. Tests von Checkbox-Index auf
     testids gehärtet (passthrough, noon-fallback-render).
  3. *Scrollbalken der Poster-Vorschau entfernt:* .personalize-preview ohne
     max-height/overflow — das SVG selbst bleibt höhengedeckelt, der Container
     wächst mit (Platz unter dem Poster für spätere Operator-Mockups).
     Mobile-config-Test als Gegen-Assertion fortgeschrieben (kein
     overflow:auto mehr erlaubt).
  4. *Design-Template-Beweis:* zweites Einzel-Design `ink-minimal` (Datei +
     EINE Registry-Zeile) — erschien automatisch im Wähler, läuft durch den
     Design-TÜV, rendert Vorschau+Druck aus derselben Funktion. FUND dabei:
     die Swatch-Mini-Vorschauen trugen dieselbe testid wie die Hauptvorschau
     (mit nur einem Single-Design unsichtbar) — PosterSvg hat jetzt eine
     testId-Prop, Swatches nutzen design-swatch-preview-<id>.
  5. *Prod-Verifikation `[REAL-BROWSER]` + FOLGE-FUND:* personalize-exact
     (3 Tests, live FuFirE) gegen die Prod-URL grün; Screenshot-Skript belegt
     computed border-radius 0px auf Inputs, overflowY visible auf der
     Vorschau, beide Toggles + ink-minimal-Swatch sichtbar
     (docs/evidence/screenshots/prod-b6-*.png). Der Prod-Screenshot deckte
     eine Regression auf: durch die testid-Trennung (Fund 4) verloren die
     Swatch-SVGs die Zähm-Regel `[data-testid='poster-svg-preview'] svg` und
     renderten in Naturgröße über den 84px-Knopf hinaus — eigene Regel
     `[data-testid^='design-swatch-preview-'] svg { width:100%; height:auto }`
     + Regressionstest im Picker-Test nachgeschoben und erneut deployt.
- **Operator-Batch #5 2026-07-14 (Western Zodiac + Daymaster-Rahmen + Tier +
  ausführliche Erklärungen):**
  1. *API-Discovery:* FuFirE bietet `POST /v1/calculate/western` (OpenAPI-Spec
     live gelesen; Swiss Ephemeris swieph, Placidus) — 14 bodies, Häuser,
     Winkel, Aspekte. Live-Kanon: Sonne Zwillinge 24,1° · Mond Fische 14,5° ·
     ASC Jungfrau 19,1°.
  2. *Birth-Chart-Poster = Western:* neuer Client `calculateWestern`
     (normalisiert auf Big Three + Merkur–Saturn; EHRLICH: bei unbekannter
     Geburtszeit ist der Aszendent NULL und entfällt auf Poster+Druck — er
     wechselt ~alle 2 h das Zeichen), Route `/api/western` (env-gated,
     validiert), Hook `useWesternChart`, Design `western-zodiac`
     (kind 'western', rein typografisch = druckfest, SONNEN-Block umrandet
     als Kern), Registry+Picker automatisch, Druckzweig in fulfillment über
     den Design-kind — Vorschau = Druck aus einer Quelle; Tierkreis- und
     Planetennamen lokalisiert (posterLocale ZODIAC/PLANETS, 4 Sprachen).
  3. *Daymaster-Umrandung (BaZi):* Tag-Säule (Index 2) auf klassik UND
     paar-harmonie fein umrandet — „das Wichtigste"; TÜV asserted die Rahmen.
  4. *Tier-Bezeichnung:* Jahres-Tier kehrt als eigene dezente Zeile unter dem
     Tagesmeister-Kopf des Paar-Posters zurück + Tier-Zeile im Partner-Review
     (supersedet die Batch-#4-not-PFERD-Assertion — dokumentiert).
  5. *Ausführliche Erklärungen:* explain-Sektionen in den Reviews (Säulen,
     Tagesmeister, fünf Elemente, Tierzeichen; Western: Sonne/Mond/Aszendent
     inkl. ehrlicher ascUnknown-Hinweis) in EN/DE/FR/ES — reflektierend
     formuliert, keine Wahrsagerei-Claims.
  6. *Beweise:* fufire.test 14/14 (calculateWestern inkl. snake_case +
     ASC-null), bazi-routes /api/western 4 Fälle, fulfillment western-Zweig,
     Western-TÜV (Injektion, ASC-Entfall, Umrandung), jsdom-Flow-Test,
     Live-E2E 8/8 (`personalize-western-live.png`).
- **Operator-Batch #4 2026-07-14 (Paar-Visualisierung: Tagesmeister statt
  Jahressäule + Kompatibilitäts-Erklärung):**
  1. *EHRLICHKEITS-FUND (vom neuen Live-E2E aufgedeckt, vom Operator
     vorhergesagt):* FuFirEs `chart.element/animal` sind die **JAHRES**-
     Säulen-Werte, NICHT der Tagesmeister — Live-Diskrepanz 1988-03-02:
     `chart.element='Erde'` (Jahr 戊辰 Erd-Drache) vs. `relation.elementB=
     'Feuer'` (Tag 丙). Beim kanonischen Fall (Metall-Jahr UND Metall-Tag)
     war das unsichtbar. Zusätzlich liefert `relation.dayMasterA/B` PINYIN
     („Xin"/„Bing"), keine Glyphen.
  2. *Korrekturen:* `stemElement()` in posterLocale (klassische FIXE
     Stamm→Element-Zuordnung — reines Beschriftungs-Mapping, keine eigene
     Engine; Säulen bleiben FuFirE-Quelle). Paar-Poster-KOPF zeigt jetzt je
     Partner `Tag-Stamm-Glyphe · Tagesmeister-Element` (z. B. 辛 · METAL),
     nicht mehr Element·Jahres-Tier; Fallback ohne dayMaster-Feld = alter
     Kopf (Nachdrucke reproduzierbar). Review/Explainer nutzen überall die
     GLYPHE aus pillars[2].stem + stemElement (nie Pinyin, nie chart.element).
     Druck (fulfillment) identisch zur Vorschau. Einzel-Poster-Kopf bleibt
     bewusst Jahres-Branding (Element·Tier des Jahres) — nur die
     Tagesmeister-BESCHRIFTUNGEN sind korrigiert.
  3. *Kompatibilitäts-Erklärung:* strukturierter compat-explainer unter den
     eingetragenen Daten (Tagesmeister-Paarung, Fünf-Elemente-Beziehung in
     Worten je wuxingRelation, 4 Sprachen) mit EHRLICHEM Rahmen-Satz
     („symbolische Lesart … keine Bewertung eurer Beziehung").
  4. *Beweise:* Live-Paar-E2E (Berlin×Lissabon): Poster-Kopf 辛·METAL &
     丙·FIRE, Säulen A kanonisch + B live (Jahr 戊辰 bestätigt den Fund),
     Relation „Fire controls Metal"; Pair-TÜV um dayMaster-Kopf +
     Legacy-Fallback erweitert; Screenshot `personalize-couple-live.png`.
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
