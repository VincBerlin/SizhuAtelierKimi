# IST-Zustand — SizhuAtelier Webshop

**Stand:** 2026-07-31 · **Branch:** `feat/fufire-personalization` (HEAD `ffda5c6`)
**Erhebung:** Repo-Scan (Git, Quellcode, Evidence-Ledger, Plan-Dokumente, Sitzungsgedächtnis).
Keine Live-Prüfung der Produktion in dieser Erhebung — Live-Aussagen unten stammen
ausschließlich aus dem Evidence-Ledger und sind als solche gekennzeichnet.

---

## 1. Kurzfassung

Der Shop ist **funktional fertig gebaut und test-abgesichert**, aber **nicht launch-fertig**.
Was fehlt, ist fast ausschließlich **Operator-Zuarbeit** (Stripe-Live-Aktivierung,
Druck-PDFs der Katalog-Poster, echte Produktfotos, Rechtsdaten) plus **zwei bewusst ans
Ende verschobene Bauteile** (Premium-PDF-Generator, kompletter Live-Durchtest).

| Dimension | Stand |
|---|---|
| Feature-Umfang | Batch #12 (Großüberarbeitung) auf Test-/Sweep-Ebene **abgeschlossen** (R7, 2026-07-19) |
| Alle 17 Akzeptanzkriterien | erfüllt — AK 11 (Bestellung→PDF→Gelato) allerdings nur `[INTEGRATION-FAKE]`, Live offen |
| Test-Suite | 749 Tests, zuletzt **749/749 sequenziell grün** (2026-07-19, CI + lokal) |
| Lint | 0 Fehler, CI-Lint-Step gatet seit R7-Nachfix |
| CI | `.github/workflows/ci.yml` vorhanden (Build + sequenzielle Tests + Lint) |
| Zahlungskette | live bewiesen — **aber im Stripe-TEST-Modus** (sk_test) |
| Produktions-Blocker | 5 offene RED-Carries (siehe §7) |
| Letzter Commit | 2026-07-19 — seither **12 Tage keine Code-Änderung** |

**Die drei harten Launch-Blocker:** kein Stripe-Live-Modus · keine Druck-PDFs für
Katalog-Poster (jede solche Bestellung schlägt bewusst LAUT fehl) · Premium-Analyse-PDF
(195 €) wird verkauft, aber der Generator existiert noch nicht.

---

## 2. Repository & Arbeitsstand

**Verzeichnis:** `Kimi_Agent_SizhuAtelier_Webdesign/Shop`

| Fakt | Wert |
|---|---|
| Aktiver Branch | `feat/fufire-personalization` |
| Commits gesamt | 131 |
| Commits vor `main` | **83** — `main` ist deutlich veraltet, der Arbeitsstand lebt im Feature-Branch |
| Weitere Branches | `feat/desenio-delta`, `feat/desenio-exact-architecture`, `feat/personalization-first-mvp` (alle mit Remote-Gegenstück) |
| Getrackte Dateien | 2.011 |
| Letzter Commit | `ffda5c6` — Lint-Bereinigung (2026-07-19) |

**Uncommittete Änderungen (nur Tooling, kein Produktcode):**

```
 M .gitignore
?? .claude-flow/          Agent-Tooling-Artefakte
?? .claude/.proven-config-version
?? .claude/proven-config.json
?? .gbrain-source
?? setup-gbrain-smoke-test-1783726500.md   ← liegt im Root, gehört dort nicht hin
```

> **Befund:** Der Arbeitsbaum ist bezüglich Produktcode sauber. Aufräum-Kandidat:
> `setup-gbrain-smoke-test-1783726500.md` im Root (Projektregel: keine Arbeitsdateien im Root).
> Ein Merge/PR `feat/fufire-personalization → main` steht seit 83 Commits aus.

---

## 3. Architektur (IST)

### 3.1 Ein Prozess, injizierbare Externals

`server/index.js` (1.228 Zeilen, 63 kB) ist **gleichzeitig** statischer SPA-Host und
JSON-API auf demselben Port. `createApp({ stripe, pool, fufire, gelato })` ist die
Test-Factory — Tests fahren die *echten* Routen mit gestubbten Externals, ohne Port und
ohne Live-Keys.

**Jede externe Integration ist env-gated:** Der Server bootet mit null Keys, der
betroffene Endpunkt liefert `503`. Es gibt keine harte Boot-Abhängigkeit.

### 3.2 Server-Module (`server/`, 14 JS-Dateien)

| Modul | Größe | Aufgabe |
|---|---|---|
| `index.js` | 63 kB | SPA-Host + 30 API-Routen + DB-Schema + Rate-Limit |
| `fulfillment.js` | 13,8 kB | Webhook → PDF → Gelato-Draft, Idempotenz, Fehler-Alarm-Mail |
| `pricing.js` | 10,1 kB | **server-autoritative** Preisberechnung (ADR-001) |
| `fufire.js` | 9,3 kB | FuFirE-Chart-Engine-Client, TLST/midnight gepinnt |
| `newsletter.js` | 5,3 kB | Double-Opt-in, Serien, Unsubscribe |
| `gelato.js` / `gelatoProducts.js` | 3,8 / 3,2 kB | Print-on-Demand-Anbindung + verifizierte Produkt-UIDs |
| `broadcast.js` | 2,8 kB | Newsletter-Versand (env-gated) |
| `printAssets.js` | 2,5 kB | Druck-PDF-Registry Katalog-Poster — **bewusst LEER** |
| `personalizationGate.js` | 2,3 kB | Order-Gate: keine Personalisierungs-Bestellung ohne Geburtsdaten |
| `pdf.js` / `printSpecs.js` | 1,9 / 1,6 kB | pdfkit + svg-to-pdfkit, Beschnitt-Maße |

> **Befund (Konvention):** Projektregel „Dateien unter 500 Zeilen" — `server/index.js`
> liegt bei 1.228 und ist damit weiterhin die größte Regelabweichung (CLAUDE.md nennt
> noch ~1.040, der Wert ist seither gewachsen). CLAUDE.md dokumentiert die Abweichung
> als bekannten Zustand: „neue Server-Logik in ein neues Modul, dort nur dünne Verdrahtung".

### 3.3 API-Oberfläche — 30 Routen

- **Commerce:** `POST /api/checkout` · `POST /api/webhook` · `GET /api/order/:id` ·
  `POST /api/fulfillment/retry/:sessionId` (env-gated)
- **Chart-Engine:** `POST /api/bazi` · `POST /api/western` · `POST /api/match`
- **Druck:** `GET /prints/:sessionId/:token.pdf` (token-geschützt)
- **Account:** Signup/Login/Logout/Me/Preferences/Password/Reset · Adressbuch-CRUD ·
  Billing-Portal · Bestellhistorie (11 Routen)
- **Newsletter:** Anmeldung · Confirm · Unsubscribe · Broadcast (env-gated)
- **Sonstiges:** `GET /api/health` · `GET /api/region` · `POST /api/geocode`

### 3.4 Zwei Chart-Engines — nicht austauschbar

1. `src/lib/bazi.ts` — `computeChart()` ist ein **deterministischer Platzhalter**
   (Modulo-Arithmetik). **Geschützte Fläche**: hier wird keine echte Astro-Engine gebaut.
   Trägt weiterhin den Legacy-Konfigurator, die `PosterData`-Typen und die kanonischen
   `sizes`/`frames`-Listen.
2. `src/lib/baziClient.ts` + `useBaziChart.ts` → `/api/bazi`, `/api/match` →
   `server/fufire.js` → **FuFirE-API** = die exakte, live-verifizierte Engine.
   Der Browser spricht nie direkt mit FuFirE (API-Key ist server-only).

**Konvention gepinnt:** `standard=TLST`, `boundary=midnight`.
**Kanonische Fixture:** 1990-06-15 12:30 Berlin → 庚午 / 壬午 / 辛亥 / 乙未, Pferd/Metall.
**Ehrlichkeitsregel:** Ist FuFirE nicht erreichbar → `status: 'error'`, `chart: null`,
Add-to-Cart blockiert. Kein stiller Fallback auf den Platzhalter.

### 3.5 Designs: eine SVG-Quelle, zwei Ausgaben

`src/designs/*.mjs` sind reine SVG-String-Funktionen, importierbar aus Vite (Browser-
Vorschau) **und** Node (Druck-PDF). Registrierte Designs: `klassik`, `inkMinimal`,
`paarHarmonie`, `westernZodiac` (+ `posterLocale`, `svgUtil` als Helfer).
`registry.mjs` ist die einzige Liste; Einträge werden nie gelöscht (`active: false`
retiriert, damit Altbestellungen reprintfähig bleiben).

**Design-TÜV** (`tests/unit/design-registry-tuev.test.ts`) läuft automatisch gegen
*jedes* registrierte Design und lässt es durchfallen bei: verlorenen
Personalisierungsfeldern, unescaptem Nutzertext (XML-Injection), invalidem XML.

### 3.6 Frontend

React 19 · Vite 7 · react-router 7 · shadcn/ui (new-york) auf Radix · Tailwind 3.4.
State ausschließlich React Context (`ShopStore`, `AuthProvider`, `I18nProvider`) —
kein Redux/Zustand.

| Bereich | Umfang |
|---|---|
| Seiten (`src/pages/`) | 19 |
| Routen in `App.tsx` | 30 (davon 6 `Navigate`-Redirects für Legacy-Slugs) |
| Shop-Komponenten | 27 |
| shadcn/ui-Primitive | 53 |
| Lib-Module | 17 |
| i18n | EN/DE/FR/ES in `translations.ts` (2.331 Zeilen) |

`src/lib/taxonomy.ts` ist die einzige Quelle für Nav-Matrix, Mega-Menü, Kollektions-
Filter und PDP-Größen. Three.js (`InkWave.tsx`) bleibt hinter dynamischem Import und
darf den Entry-Chunk nie betreten (**geschützte Fläche**).

---

## 4. Commerce-Zustand

### 4.1 Preise (server-autoritativ, ADR-001)

`/api/checkout` **ignoriert** client-gesendete `unitAmount`/`shippingCents` und
repricet aus `server/pricing.js` über `productId` + `variantId`. Unbekannte Produkt-ID
→ `400` **vor** dem Stripe-Aufruf. Prefixe: `poster:`, `ptype:`, `bundle:`, `addon:`,
`digital:`.

| Position | Preis |
|---|---|
| Poster-Basis (BaZi / Geburtschart) | 49 € |
| Paar-Poster | 69 € |
| Premium-Digital-Analyse | 195 € |
| PDF-Add-on (25 % Rabatt) | 146,25 € |
| Bundle „Poster + Analyse" | **195,25 €** (abgeleitet: 49 + 146,25) |
| Format-Deltas | 30×40 −10 € · 50×70 ±0 € · 70×100 +20 € (A-Serie analog) |
| Versand | 4,90 € flat, kostenlos ab 75 € |
| Regionen | EU/US/UK/other → EUR/USD/GBP |

Client (`src/lib/productTypes.ts`) und Server (`server/pricing.js`) sind per
Paritätstest gekoppelt. **Die Endkalkulation macht der Operator am Ende** — dann ändern
sich nur die Basiswerte an einer Stelle.

### 4.2 Katalog

35 Produkte definiert, davon **7 soft-retired** (IDs 1–6, 15 — Personalisierungs-
Duplikate aus Batch #12 R2). Retirierte SKUs erscheinen nicht mehr in Listen, Suche,
Empfehlungen oder Nav; ihre Preise bleiben aber server-seitig gültig (Alt-Warenkörbe),
ihre alten Links sind Redirects statt 404.
Featured: IDs 7, 8, 11, 12.

### 4.3 Fulfillment-Pipeline

```
Stripe-Webhook (checkout.session.completed)
  → server/fulfillment.js  fulfillOrder()
  → Druck-PDF via server/pdf.js (pdfkit + svg-to-pdfkit, CJK-Fonts eingebettet,
     Beschnitt aus server/printSpecs.js)
  → ausgeliefert unter /prints/:sessionId/:token.pdf
  → Gelato-Draft-Order (server/gelato.js)
  → Fehlschlag ⇒ fulfillment_status='failed' + Alarm-Mail an ORDER_NOTIFY_EMAIL
```

Idempotenz technisch erzwungen: `UNIQUE(stripe_session, line_key)` + `gelato_order_id`-
Check — auch der Retry-Endpunkt kann keine Doppelproduktion auslösen.

**Zwei bewusst leere Registries (Ehrlichkeitsprinzip „laut scheitern statt falsch drucken"):**

| Registry | Zustand | Konsequenz |
|---|---|---|
| `server/gelatoProducts.js` `PRODUCT_UIDS` | **BEFÜLLT** — 12 UIDs (A3/A2/A1 + 30×40/50×70/70×100, je × Eiche natur/Schwarz matt), alle live gegen den Gelato-Katalog verifiziert | funktionsfähig |
| `server/printAssets.js` `PRINT_ASSETS` | **LEER** (`{}`) | **jede Katalog-Poster-Bestellung schlägt LAUT fehl**, bis der Operator Druck-PDFs ablegt |

`print-assets/` enthält aktuell nur `README.md` — **null Druckdateien**.
Benötigt: `poster-<id>-<format>.pdf` mit 3 mm Beschnitt → 306×406 / 506×706 / 706×1006 mm.

---

## 5. Qualitätssicherung

### 5.1 Test-Suite

| Gruppe | Dateien | Runner |
|---|---|---|
| `tests/unit/` + co-lokalisiert in `src/**` | — | Vitest **jsdom** |
| `tests/integration/` + `tests/server/` | — | Vitest **node** (supertest gegen echte Express-Routen) |
| `tests/smoke/` | — | Vitest |
| `tests/e2e/` | — | Playwright (aus Vitest ausgeschlossen) |
| **Summe getrackt** | **85 Testdateien** | 3 Vitest-Projekte |

**Letzter belegter Lauf: 749/749 sequenziell grün (2026-07-19, Commit `ffda5c6`).**

> **Ehrlichkeits-Hinweis zu dieser Erhebung:** Ein erneuter lokaler Lauf
> (`npx vitest run --no-file-parallelism`) wurde am 2026-07-31 gestartet und nach
> **16:38 min mit null Ausgabe bei 0,01 s CPU-Zeit** abgebrochen — exakt die im Ledger
> als `RL-VITEST-ENV` dokumentierte Signatur (reines I/O-Warten; das Repo liegt unter
> `Documents/` im iCloud-Sync, FileProvider materialisiert kalte `node_modules`-Reads
> on-demand). Parallel dazu liefen selbst einfache `git`- und `wc`-Kommandos in
> Minuten-Timeouts. **Die 749 grünen Tests sind daher der belegte Stand vom 2026-07-19,
> heute nicht nachgeprüft.** Referenzlauf ist CI oder eine warme Shell außerhalb des
> iCloud-Sync.

### 5.2 Meta-Tests, die Ehrlichkeit erzwingen

| Test | Prüft |
|---|---|
| `truthful-claims.test.ts` | scannt *ausgelieferte* i18n- und Katalog-Strings in allen 4 Sprachen auf verbotene Behauptungen (kein „die Chart wird berechnet", solange der Platzhalter ausgeliefert wird; keine Gesundheits-/Heilversprechen) |
| `exact-reality-ledger.test.ts` | lässt das Gap-Closure-Dokument durchfallen bei jeder Fertigstellungs-/Launch-Behauptung, solange RED-Carries offen sind; ebenso bei Shop-Copy, die Funktionen oder Social-Accounts erfindet |
| `delta-cities-source.test.ts` | schlägt fehl, sobald irgendwo in `src/` ein öffentlicher Geocoder-Host auftaucht |
| `design-registry-tuev.test.ts` | jedes registrierte Design auf Personalisierungsfelder, XML-Escaping, XML-Validität |

### 5.3 CI

`.github/workflows/ci.yml` — Trigger: Push auf `main`/`feat/**` + jeder PR.
Node 22 · `npm ci` → `npm run build` (tsc + vite) → `npx vitest run --no-file-parallelism`
→ `npm run lint`.
**Alle vier Schritte gaten** (der Lint-Step seit dem R7-Nachfix vom 2026-07-19; 0 Fehler).

Bewusst als *Warnung* laufen die experimentellen react-hooks-Compiler-Lints
(dokumentiert in `eslint.config.js`) — sie markieren etablierte Provider-Muster und die
geschützte `InkWave.tsx`.

---

## 6. Evidence-Kultur (der Kern dieses Repos)

`docs/evidence/fufire-gelato/ledger.md` (429 Zeilen) ist die verbindliche Beweisakte.
**Regel: Eine Behauptung ohne Artefakt-Zeile gilt als NICHT bewiesen.**

Beweisklassen absteigend: `[REAL-BOUNDARY-LIVE]` → `[REAL-BROWSER]` →
`[REAL-ARTIFACT]` → `[HUMAN-VERIFIED]` … deutlich schwächer: `[INTEGRATION-FAKE]`,
`[SHIPPED-SCAN]`. **Ein grüner Test allein ist kein Beweis.**

**Bereits live bewiesen (Auswahl):**

- Kanonische BaZi-Fixture live durch `server/fufire.js`: exakt 庚午/壬午/辛亥/乙未,
  engine `1.0.0-rc1-20260220` — `[REAL-BOUNDARY-LIVE]`
- Druck-PDF maßgenau: A2 + 3 mm Beschnitt = MediaBox 1207,56 × 1700,79 pt, 59 kB,
  Fonts subset-eingebettet (Tofu-Box-Fund bei 年月日時 behoben) — `[REAL-ARTIFACT]`
- Paar-Analyse live über `matchHehun`, beide Säulensätze korrekt — `[REAL-ARTIFACT]` + `[REAL-BOUNDARY-LIVE]`
- **Volle Zahlungskette in PROD** (Test-Modus): Personalisierung → `/api/checkout`
  (server-repriced 53,90 €) → Stripe-Hosted-Checkout → Testkarte 4242 → signatur-
  verifizierter Webhook → `fulfillOrder` → Druck-PDF → Gelato-Draft
  `baf606f4-…` → PDF von Gelatos S3 zurückgeladen (HTTP 200, 61.282 B, `%PDF`)
- Alle 6 A-Serien-Gelato-UIDs über die gefilterte `products:search` verifiziert
  (Fund dabei behoben: die alte Substring-Suche traf den *falschen* Katalog und
  verwechselte Zoll mit Zentimetern)

**Artefakte:** 25 PNG-Screenshots + 2 PDFs + JSON-Responses unter `docs/evidence/`.

**Dokumentierte Vertrags-Änderungen** (Operator-superseded, nie still fallengelassen):
Mega-Menü-Kacheln mit echten Bildern statt asset-light · InkWave-Hero → Split-Hero ·
Hero-CTA-Ziel `/collections` + Terracotta `#A0522D` · Primärleiste reduziert ·
Poster-Background-Palette gelöscht · echte Paar-SKU (id 15) · Footer-Bereinigung.

---

## 7. Offene RED-Carries (launch-blockierend)

| ID | Zustand | Was fehlt |
|---|---|---|
| **RL-STRIPE-LIVE** | 🔴 offen | Account steht auf `charges_enabled=false`, `details_submitted=false`. **Nur der Operator** kann im Dashboard aktivieren und `STRIPE_SECRET_KEY` auf `sk_live` tauschen. Danach übernimmt der Agent: Live-Webhook-Endpoint anlegen + neues `whsec` setzen. |
| **RL-PRINT-ASSETS** | 🔴 offen | Null Druck-PDFs für Katalog-Poster. Bis dahin scheitert jede solche Bestellung laut. |
| **RL-PREMIUM-PDF** | 🔴 offen | Die 195-€-Premium-Analyse wird verkauft, der Generator existiert nicht. **Verbindlich (Operator-Entscheidung B, 2026-07-18): 10–15 Seiten** — der Shop-Text verspricht das an ~20 Stellen; Abnahme nur bei Einhaltung. |
| **RL-VITEST-ENV** | 🟡 teil-geschlossen | Ausführung geht (sequenziell/CI). Offen bleibt die *Umgebungs*-Empfehlung: Repo aus dem iCloud-Sync nehmen. Ursache hart gemessen: nackter `node -e "import('jsdom')"` brauchte **16:02 min bei 1,2 s CPU** — reines I/O-Warten durch FileProvider-Materialisierung. **Heute erneut reproduziert.** |
| **RL-GELATO** | 🟡 fast geschlossen | Nur noch `[HUMAN-VERIFIED]`: Operator sichtet den Test-Draft `544e1b36-…` im Gelato-Dashboard (löschen oder bewusst bestätigen). |
| **OQ-TLST** | 🟡 offen | Zi-Grenzfall-Konvention vom Operator gegen die FuFirE-Snapshot-Suite bestätigen. Bis dahin gepinnt `TLST`/`midnight`. |
| **HERO-ASSET** | 🟡 offen | Finales Hero-Foto ist Operator-Asset; bis dahin bestes vorhandenes Bild aus `public/images/`. |
| **RL-IMAGES** | 🟡 offen | Echte Produktfotos fehlen; Kacheln sind einheitlich und *als Platzhalter markiert*. |
| **RL-PAPER-CLAIM** | 🟡 offen | Das archival-Papier der A-Serie existiert für die cm-Formate nicht; gewählt `200-gsm-uncoated`. Papier-Claims im Shop-Text prüfen. |

---

## 8. Offene Punkte nach Kategorie (End-Abarbeitungsliste)

### A · Operator-Zuarbeit

| # | Punkt | Stand |
|---|---|---|
| 1 | Railway-Umgebungsvariablen | ✅ weitgehend erledigt (2026-07-19): Stripe (TEST), Gelato, FuFirE, Resend, `DATABASE_URL`, `SESSION_SECRET`, `FULFILLMENT_RETRY_SECRET`, `NEWSLETTER_BROADCAST_SECRET`, `ORDER_NOTIFY_EMAIL` gesetzt. **Bewusst NICHT gesetzt:** `TRUSTED_GEO_HEADER` (Railway ist kein vertrauenswürdiger Geo-Edge). |
| 2 | **Stripe Live-Modus** | 🔴 offen — nur Operator (Identitätsprüfung) |
| 3 | **Druck-PDFs Katalog-Poster** | 🔴 offen |
| 4 | Gelato-Produktionsmodus | offen — Standard `draft`; `GELATO_ORDER_TYPE=order` = Vollautomatik |
| 5 | Newsletter-Zeitplan | offen — Wochentag/Uhrzeit + Cron-Auslöser für `POST /api/newsletter/broadcast` |
| 6 | Eigenes Operator-Poster-Design | offen — Ablage `design-input/` |
| 7 | CI aktiv schalten | ✅ Datei im Repo, wirkt mit dem nächsten Push |

### B · Gemeinsame End-Phase (Reihenfolge vom Operator vorgegeben)

| # | Punkt | Stand |
|---|---|---|
| 8 | **Premium-PDF-Generator** (10–15 Seiten, Dayun + Wuxing) | 🔴 offen — ganz am Ende bauen |
| 9 | **Kompletter Live-Durchtest** (RL-STRIPE-CHAIN live) | 🔴 offen — Testkarte 4242, ganze Kette, `[HUMAN-VERIFIED]` Operator-Testbestellung. **Erst danach irgendeine Garantie-Aussage.** |
| 10 | RED-Carries prüfen/schließen | laufend |
| — | Preis-Endkalkulation | Operator macht sie am Ende „mit allen Testläufen" |

### C · Rest-Plan Batch #12

✅ **Abgeschlossen mit R7 (2026-07-19).** Alle 15 Bereiche erledigt, Pflicht-3-Breiten-
Test bestanden: Mess-Sweep über 13 Kernrouten × 375/768/1280 px → **0× horizontaler
Scroll, 0 Konsolen-Fehler, 0 Ressourcen ≥ 400**. Akzeptanz-Protokoll für alle 17
Kriterien im Plan-Dokument.

---

## 9. Bekannte Widersprüche & Aufräum-Kandidaten

1. **`docs/OPERATOR_HANDOFF.md` ist veraltet.** §2 „Code blocker before real money"
   behauptet, `/api/checkout` vertraue dem client-gesendeten `unitAmount` — das ist seit
   ADR-001 **falsch**: die Route repriced server-autoritativ und lehnt unbekannte
   Produkt-IDs mit `400` ab. Auch die Go-live-Checkliste dort spiegelt nicht mehr den
   Batch-#12-Stand. → **Dokument nachziehen, sonst leitet es den Operator in die Irre.**
2. **`docs/architecture/current-architecture.md`** ist vom 2026-06-26 (vor FuFirE/Gelato);
   seine Abschnitte „RED status" und „planned chart provider" sind durch den
   Evidence-Ledger überholt. In CLAUDE.md bereits als solches markiert.
3. **`main` liegt 83 Commits zurück** — der gesamte Produktivstand hängt an einem
   Feature-Branch.
4. **`setup-gbrain-smoke-test-1783726500.md` im Repo-Root** — verletzt die Projektregel
   „keine Arbeitsdateien im Root".
5. **`server/index.js` 1.228 Zeilen** vs. Regel „unter 500 Zeilen".
6. **Rate-Limiting ist in-memory / single-instance** — bei >1 Server-Instanz nach
   Redis/Upstash verlagern (im Code gestempelt).
7. **Rechtsdaten sind `[MISSING]`-markiert**, nicht erfunden (`src/lib/legal.ts`).
   Impressum/AGB/Widerruf brauchen echte Firmendaten; DE/FR-Rechtstexte teils noch englisch.

---

## 10. Feature-Flags & Sicherheitsleitplanken

| Flag / Guard | Default | Wirkung |
|---|---|---|
| `COMMERCE_ENABLED` | **on** | `VITE_COMMERCE_ENABLED=false` legt den Kauf-Funnel schlafen (Cart-Icon bleibt sichtbar) |
| `REVIEWS_ENABLED` | **off** | Kein PDP zeigt Sterne/Bewertungen. Die `rating`/`reviews`-Zahlen im Katalog sind Platzhalter und dürfen nie an die Oberfläche. Zusätzlich verlangt der Block eine echte Bewertungszahl > 0 — das Flag allein erfindet nie Social Proof. |
| `GelatoMappingUnverifiedError` | — | wirft bei ungemappter UID statt zu raten |
| `PrintAssetMissingError` | — | wirft bei fehlender Druck-PDF statt still nicht zu produzieren |
| Chart `status: 'error'` | — | kein stiller Platzhalter-Fallback |
| `[MISSING]`-Marker in `legal.ts` | — | statt erfundener Firmendaten |
| Geschützte Flächen | — | `src/components/InkWave.tsx`, `src/lib/bazi.ts` — Änderung nur nach ausdrücklicher Freigabe |

---

## 11. Betrieb

**Deployment:** Railway (NIXPACKS) · Build `npm run build` · Start `npm start` ·
Auto-Deploy vom Arbeits-Branch · Domain `sizhuatelier-shop-production.up.railway.app`.

**Persistenz:** Railway-Postgres. Tabellen legen sich beim Boot selbst an
(`users`, `addresses`, `orders`, `newsletter_signups`, `credits_ledger`).

**24 Umgebungsvariablen** werden vom Server gelesen; keine ist boot-kritisch.

**Lokale Fallstricke (unverändert gültig):**
- `npm run dev` hat **keine API** — kein Vite-Proxy, `/api/*` fällt auf die SPA durch.
  Jedes API-gestützte Feature braucht `npm run build && npm start`.
- **Kein dotenv** — `npm start` liest nur echte Umgebungsvariablen
  (`node --env-file=.env server/index.js`).
- Vitest hängt auf dieser Maschine (siehe RL-VITEST-ENV) — sequenziell oder CI laufen lassen.

---

## 12. Bewertung

**Was steht:** Die Anwendung ist inhaltlich und technisch komplett. Die kritischen Pfade
— Preisberechnung, Personalisierung, PDF-Erzeugung, Gelato-Anbindung, Idempotenz,
Fehler-Eskalation — sind gebaut, getestet und in den entscheidenden Punkten *live* an
den echten Systemen bewiesen, nicht nur gemockt. Die Evidence-Disziplin des Repos ist
ungewöhnlich streng und maschinell erzwungen; sie hat mehrfach echte Produktionsfehler
gefunden, bevor sie Geld gekostet haben (still übersprungene Katalog-Poster, Größen-
Label statt -ID im Druckpfad, falscher Gelato-Katalog, Tofu-Boxen in den CJK-Labels).

**Was fehlt:** Nichts davon ist Programmierarbeit im großen Stil. Es sind
(a) eine Operator-Entscheidung bei Stripe, (b) Dateien und Inhalte, die nur der Operator
liefern kann, und (c) genau ein noch zu bauendes Modul — der Premium-PDF-Generator, der
laut Vertrag 10–15 Seiten umfassen muss.

**Ehrliche Launch-Aussage:** Der Shop kann heute keine Katalog-Poster produzieren
(keine Druckdateien) und kein echtes Geld annehmen (Test-Modus). Für die
Personalisierungs-Poster ist die Kette live bewiesen — aber im Test-Modus. Eine
Garantie-Aussage zur Bestellabwicklung ist erst nach dem kompletten Live-Durchtest
(Punkt B-9) zulässig.

---

*Erhoben am 2026-07-31 gegen `ffda5c6`. Quellen: Git-Historie,
`docs/evidence/fufire-gelato/ledger.md`, `docs/plans/2026-07-18-shop-overhaul.md`,
Sitzungsgedächtnis „End-Abarbeitungsliste", Quellcode-Scan.*
