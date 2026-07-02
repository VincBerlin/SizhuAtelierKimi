# Implementierungsplan — SizhuAtelier Webshop Architektur V2

- **Feature Slug:** `sizhuatelier-webshop-architecture-v2`
- **Rolle:** `planner` (Phase 1 von `/agileteam`) · **Erstellt:** 2026-06-22
- **Branch:** `feat/personalization-first-mvp`
- **Quellen (FROZEN):**
  - PRD `docs/prd/sizhuatelier-webshop-architecture-v2.prd.md` (REQ-001..018, §7 23 atomare Tasks)
  - Traceability `docs/traceability.md` (REQ ↔ Test ↔ Task ↔ Evidence)
  - QA-Acceptance-Design `docs/tests/acceptance-design.md` (AT-001..AT-021, AT-NEG-SAJU)
  - ADR-001 (Server-Re-Pricing, `productId`+`variantId`), ADR-002 (Input-Passthrough + Noon-Fallback)
- **Iterationen (Milestones) M = 4** · **Task-Count = 23** (T-01..T-22 inkl. T-08b)

> **Council-Priorisierung (verbindlich):** SECURITY + TRUTHFUL-CLAIMS **vor** V2-Kosmetik.
> **T-01 ist Task 1** — ohne Test-Infra (`vitest`+`playwright`) ist kein TDD möglich. Money-Path-Tests
> (REQ-015) sind **rot-ohne-Fix** vor T-02/T-03/T-04 (AT-015-6).

---

## 1. Goal & Non-Goals

### Goal
Konformitäts-/Lückenschluss-Pass auf einem ~70 % gebauten Custom-Stack-Shop (React 19 + Vite +
react-router 7 + Express + Stripe). Drei Wertlücken + Test-Fundament schließen:
**(1) SECURITY** server-autoritative Re-Preisung + Versand; **(2) TRUTHFUL-CLAIMS** Input-Passthrough,
Noon-Fallback-Offenlegung, Copy-Reframe, Health-Claim-Sweep, DE/FR-Legal; **(3) V2-CONFORMANCE**
Modulfolge 1–13, Mega-Menü, per-Welt-Collections, Inspiration, SEO-Block, Datenmodell-Delta;
**(4) TESTS** Infra + Money-Path + Truthful + Conformance.

### Non-Goals (Scope-Guard, PRD §1.2 — ohne separate Freigabe nicht anfassen)
- **Keine echte BaZi-Engine** (`OQ-004`): `bazi.ts` bleibt Platzhalter, RED für ACCURACY.
- **`server/index.js` nur die Checkout-Route** (`L191-253`). Auth/Newsletter/Credits/Address-Logik **nicht**.
- **Keine DB-Schema-Änderungen.** Keine erfundenen Operator-Daten/Preise/Bilder/Reviews.
- **Kein variierendes Platzhalter-Bild** mit Ort (gegenstandslos — Poster = Platzhalter).
- **Kein Saju/Junishi** in Route/Daten/SEO (negativer Nachweis).
- **Kein Hero/LCP-Regress** (NFR-1, harte Nebenbedingung).

---

## 2. Preconditions & Known Gaps (Repo-Reality, file:line verifiziert 2026-06-22)

- `package.json` scripts = `dev/build/lint/preview/start` — **kein** `test`-Script; `vitest`/`playwright`/`supertest` **nicht** installiert. → T-01.
- `src/lib/checkout.ts:33-39` — Payload sendet **nur** `title/unitAmount/qty/meta/personalization` (KEIN `productId`/`variantId`). → T-02.
- `server/index.js:194,202,215-217` — Route vertraut Client-`unitAmount` + `shippingCents` (das 1-Cent-Loch). → T-03/T-04.
- `server/index.js:224,740-750` — `buildPersonalizationMetadata` (480-Z.-Chunking) — Invariante erhalten. → T-05.
- `src/lib/bazi.ts:26` — `computeChart(dateStr?, timeStr?)` — **kein** `place`, **kein** `birthTimeUnknown`-Param. → T-07.
- `src/store/ShopStore.tsx:104-106,135-137` — Versandregel (US/UK frei; EU `FREE_SHIP_THRESHOLD=80`; sonst `4.9`); `addCurrent` ruft `computeChart(cfg.date, cfg.time)`. → T-04/T-08.
- `src/pages/Personalize.tsx:89,106-118` — `unknownTime`-State + Noon-Fallback `'12:00'` vorhanden, aber `computeChart` ohne `place`. → T-08/T-08b.
- `src/pages/ProductView.tsx:26,50` — `computeChart(cfg.date, cfg.time)` ohne `place`. → T-08.
- `src/components/shop/CartDrawer.tsx:162-175` — `PersonalizationSummary`, rendert `unknownTimeNotice`. → T-08b.
- `src/i18n/translations.ts:248,275,285,355,363,401,466` (+EN/FR-Pendants) — Präzisions-/API-/„100%"-Claims. → T-09/T-10.
- `src/lib/catalog.ts:7-25,28,199,226,242` — kein V2-Schema; `:199` „nachweislich beruhigend"; `:226/:242` FAQ „-ort berechnet". → T-09/T-10/T-11/T-14.
- `src/lib/legal.ts:17,131` — `LEGAL_DOCS` ist **eine** englische Fassung (kein i18n-Switch); `[MISSING]`-Marker vorhanden. → T-12.
- `src/App.tsx:55-84` — nur `/collections` + `/tcm`; **keine** per-Welt-Collections, **keine** `/inspiration`. → T-15/T-17.
- `src/components/Navbar.tsx:13-22,157-167,195-224` — flaches `shopLinks`-Dropdown (kein Mega-Menü); Mobile-Drawer-Basis. → T-16.
- `src/pages/Home.tsx:131-141` — Modulfolge Hero→PathToPoster→Catalog→Wissen→Bundles→Faq→Newsletter (weicht von 1–13 ab). → T-18/T-19/T-20.
- Saju/Junishi: nur in Code-Kommentaren (`Kollektion.tsx:10`, `Personalize.tsx:11`) — keine Route/Daten. → AT-NEG-SAJU.

### Offene Blocker (aus QA-Design, an Lead/Watcher routen — nicht still grün)
- **BLK-INFRA** (REQ-014): Test-Infra noch nicht installiert → T-01 zuerst.
- **BLK-STRIPE-REAL** (ADR-001): reale Stripe-Session = außerhalb Run → Money-Path max. `integration-fake`.
- **BLK-RED-BAZI** (ADR-002): `bazi.ts` bleibt `*-fake`/RED — nur Nutzer darf herabstufen.
- **BLK-MEASURE-LCP** (NFR-1, `OQ-008`): keine absolute LCP-Schwelle → T-21 läuft als Baseline-Vergleich.

---

## 3. Milestones (Iterationen) — Übersicht

| M | Titel | Buckets | REQ | Tasks |
|---|---|---|---|---|
| **1** | Fundament & Geld | TESTS + SECURITY | REQ-014, REQ-001, REQ-002, REQ-003, REQ-015 | T-01, T-02, T-03, T-04, T-05, T-06 |
| **2** | Ehrlichkeit (Truthful-Claims) | TRUTHFUL-CLAIMS + TESTS | REQ-004, REQ-018, REQ-005, REQ-006, REQ-007, REQ-016 | T-07, T-08, T-08b, T-09, T-10, T-11, T-12, T-13 |
| **3** | Architektur / IA | V2-CONFORMANCE | REQ-013, REQ-010, REQ-009, REQ-011 | T-14, T-15, T-16, T-17 |
| **4** | Homepage & Abschluss | V2-CONFORMANCE + TESTS | REQ-008, REQ-012, REQ-017 (+NFR-1) | T-18, T-19, T-20, T-21, T-22 |

**M-Begründung (ehrlich aus dem Breakdown abgeleitet):** Die 23 Tasks zerfallen sauber in vier
abhängigkeits-gekoppelte Schichten. M1 muss zuerst, weil Infra + Money-Path die einzige Schicht mit
`integration-fake`-Sicherheitsnachweis ist (Council). M2 ist die zweite Council-Priorität
(Truthful-Claims) und hängt nur an T-01, nicht an M1-Code. M3 (IA-Gerüst) hängt am Datenmodell-Delta
(T-14) und muss vor M4 stehen, weil die Homepage-Module (M4) auf die Collection-Routen + Mega-Menü
verlinken. M4 schließt mit dem Conformance-Smoke (T-22) ab, der erst sinnvoll grün werden kann, wenn
Routen + Modulfolge existieren. Vier ist die kleinste Zahl, die diese Kopplungen nicht verletzt.

---

## 4. Task-Liste (atomar, abhängigkeits-geordnet)

> Jede Task ist klein genug für **einen frischen Coder + einen Test-First-Zyklus** (RED→GREEN→REFACTOR).
> `parallelizable: true` = unabhängige Dateien, in eigenem Worktree nebenläufig baubar. `false` = strikt
> sequentiell (geteilte Datei oder harte Daten-Abhängigkeit).

---

### Milestone 1 — Fundament & Geld

#### T-01 — Test-Infrastruktur (vitest + playwright + supertest)
- **REQ:** REQ-014
- **Dependencies:** — (Task 1, blockiert alle Tests)
- **Files:** `package.json` (scripts `test`/`test:unit`/`test:e2e` + devDeps), `vitest.config.ts` (neu), `playwright.config.ts` (neu), `tests/` (neu: `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/setup.ts`), `tests/e2e/smoke.spec.ts` (neu, Real-Boundary-Smoke über `src/App.tsx`).
- **Macht grün:** AT-014-1 (`vitest`+`playwright`+supertest installiert, Scripts laufen), AT-014-2 (`tests/**`-Struktur, Exit-Code≠0 bei Fehler), AT-014-3 (`[REAL-BOUNDARY]` Smoke mountet `App.tsx` mit echter Provider-Kette `I18nProvider→ShopStoreProvider→AuthProvider`, kein Crash; Deps gepinnt + `npm audit`).
- **Parallelizable:** `false` (Wurzel-Abhängigkeit; alles wartet darauf).
- **Notes:** Deps pinnen (Security-Matrix §5 Supply-Chain), `npm audit` muss sauber bleiben (Commit `d04c451` nicht regredieren). Kein echter Stripe-Key in Tests.

#### T-02 — Identitäts-Mapping `productId` + `variantId` in Checkout-Payload (ADR-001)
- **REQ:** REQ-001 (Vorbedingung für autoritative Re-Preisung)
- **Dependencies:** T-01
- **Files:** `src/lib/checkout.ts:33-39` (Payload erweitern), `src/store/ShopStore.tsx` (`CartLine` → `productId`/`variantId` führen), `src/lib/catalog.ts`/`src/lib/bazi.ts` (Varianten-Identität: Size/Format/Frame → stabile `variantId`).
- **Macht grün:** Vorbedingung für AT-001-1/2/3/5 (Server braucht `productId`+`variantId` zum Nachschlagen); AT-001-4 (`[UNIT]` Single-Source-of-Truth Preis-Konsistenz Client↔Server).
- **Parallelizable:** `false` (ändert geteiltes Checkout-Interface; T-03/T-04 bauen darauf).
- **Notes:** Ändert das Client-Checkout-Interface bewusst (ADR-001). `unitAmount` darf im Payload bleiben, wird aber serverseitig **ignoriert** (T-03).

#### T-03 — Server-autoritative Re-Preisung in `/api/checkout`
- **REQ:** REQ-001
- **Dependencies:** T-02, T-06 (Test rot-ohne-Fix existiert idealerweise zuerst — AT-015-6)
- **Files:** `server/index.js:197-214` (nur Checkout-Route; server-eigene Preisquelle Produkt/Variante→Cent; `it.unitAmount` ignorieren), neue server-seitige Preis-Map (z. B. in `server/index.js` lokal oder `server/pricing.js` neu).
- **Macht grün:** AT-001-1 (`unitAmount:1` → Stripe-`unit_amount` == Serverpreis ≠1), AT-001-2 (Property über `0`/negativ/`999999`/fehlend → immer Serverpreis), AT-001-3 (unbekannte ID → `4xx`, Stripe-Stub **nie** aufgerufen), AT-001-5 (Determinismus), AT-015-1/2/6.
- **Parallelizable:** `false` (geteilte Route `server/index.js`, sequentiell mit T-04/T-05).
- **Notes:** Preisquelle spiegelt vorerst Platzhalterpreise (`catalog.ts`/`bazi.ts` `sizes[].delta`/`Personalize` `basePrice`+`PDF_ADDON_PRICE`) bis Operator reale liefert (`OQ-002`). `checkout-repricing` bleibt RED/`integration-fake`.

#### T-04 — Server-berechneter Versand in `/api/checkout`
- **REQ:** REQ-002
- **Dependencies:** T-03 (gleiche Route)
- **Files:** `server/index.js:194,215-217` (Checkout-Route; Versand server-seitig aus Region+Subtotal; `shippingCents` ignorieren), `server/index.js:180-188` (`/api/region`-Logik wiederverwenden), ggf. `server/pricing.js`. Konstante `FREE_SHIP_THRESHOLD=80` + `4.9` spiegeln `ShopStore.tsx:104-106` / `tokens.ts:35`.
- **Macht grün:** AT-002-1 (`shippingCents:0`, EU<80 → `490`), AT-002-2 (überhöht bei ≥80 → `0`), AT-002-3 (Region-Tabelle US/GB frei, EU/other), AT-002-4 (`[UNIT]` Client↔Server-Versand-Parität), AT-015-3.
- **Parallelizable:** `false` (geteilte Route).
- **Notes:** Versandregel = exakt die dokumentierte `ShopStore`-Logik (Diskrepanz Client↔Server = Testfehler).

#### T-05 — Regression-Sicherung Checkout-Invarianten
- **REQ:** REQ-003
- **Dependencies:** T-03, T-04 (Invarianten der geänderten Route absichern)
- **Files:** `server/index.js:203,210,236-240,740-750` (nicht-destruktiv bestätigen: Metadaten-Chunking, Gast/Account-Ausschluss, Mengen-Clamping, Leer-Cart). Code-Änderung minimal — primär verifizieren, dass T-03/T-04 nichts brachen.
- **Macht grün:** AT-003-1 (Couple-Cart >480 Z. → verlustfreier Round-Trip via `readPersonalizationMetadata`, inkl. adversarialer Zeichen `·`/`"`/`\n`), AT-003-2 (Gast vs. Account gegenseitig ausschließend), AT-003-3 (Clamping `1..99`, Leer-Cart `400`), AT-003-4 (`buildPersonalizationMetadata({})` → `{}`), AT-015-5.
- **Parallelizable:** `false` (geteilte Route, nach T-03/T-04).

#### T-06 — Money-Path-Test-Suite (Tampering Preis/Versand, Stripe gemockt)
- **REQ:** REQ-015 (deckt REQ-001/002/003 ab)
- **Dependencies:** T-01 (Infra). **Ideal vor T-03/T-04 geschrieben (rot-ohne-Fix, AT-015-6).**
- **Files:** `tests/integration/checkout.repricing.test.ts` (neu, supertest gegen echte Express-App, Stripe-SDK via `vi.mock`/Stub).
- **Macht grün:** AT-015-1 (=AT-001-1), AT-015-2 (=AT-001-3), AT-015-3 (=AT-002-1), AT-015-4 (Stripe gemockt, **kein** Key im Test, grep-Guard), AT-015-5 (=AT-003-1/2/3), AT-015-6 (rot-ohne-Fix-Beweis gegen `server/index.js:202`-Altstand).
- **Parallelizable:** `false` (validiert T-02..T-05; eigene neue Datei, aber logisch an Money-Path gebunden — kann mit T-03/T-04 **im selben Worktree** TDD-gekoppelt laufen).
- **Notes:** Höchste erreichbare Evidenz = `integration-fake` (BLK-STRIPE-REAL). RED bleibt im Ledger sichtbar.

---

### Milestone 2 — Ehrlichkeit (Truthful-Claims)

#### T-07 — `computeChart(date,time,place,birthTimeUnknown)` — Inputs annehmen, nicht verwerfen (ADR-002)
- **REQ:** REQ-004
- **Dependencies:** T-01
- **Files:** `src/lib/bazi.ts:26` (Signatur erweitert um `place`, `birthTimeUnknown`; Params werden mitgeführt, **nicht** verworfen; Output bleibt deterministischer **Platzhalter**, RED; Noon-Fallback intern wenn `birthTimeUnknown`).
- **Macht grün:** AT-004-2 (`[UNIT]` Signatur akzeptiert `(date,time,place,birthTimeUnknown)`, kein Throw), AT-004-3 (`[UNIT]` Determinismus, Snapshot+Property), AT-004-4 (`[UNIT]` Platzhalter-Grenze/RED gepinnt — kein „korrekt/Bild-mit-Ort"-Test), AT-018-1 (`[UNIT]` `birthTimeUnknown=true` → verarbeitete Zeit `12:00`).
- **Parallelizable:** `true` (eigene Datei `bazi.ts`; unabhängig von M2-Copy/Legal/TCM-Tasks).
- **Notes:** `bazi-chart` bleibt RED/`*-fake` — nie als „echte Engine fertig" berichten (BLK-RED-BAZI).

#### T-08 — Aufrufstellen + Payload/Cart-Metadaten reichen `place`/`birthTimeUnknown` durch
- **REQ:** REQ-004
- **Dependencies:** T-07 (neue Signatur), T-02 (Payload-Struktur falls geteilt)
- **Files:** `src/pages/Personalize.tsx:89`, `src/pages/ProductView.tsx:26,50`, `src/lib/catalog.ts:28` (`mk`), `src/store/ShopStore.tsx:135-137` (`addCurrent`/`addItem` schreiben `place`/`birthTimeUnknown` in `personalization`), ggf. `src/lib/checkout.ts` (Payload-Personalization vollständig).
- **Macht grün:** AT-004-1 (`[REAL-BOUNDARY]` realer Cart-Metadaten-Pfad: `startCheckout`-Payload `items[].personalization` enthält `place/date/time/birthTimeUnknown` mit Eingabewerten — Negativnachweis gegen stille Verwerfung), AT-016-1.
- **Parallelizable:** `false` (hängt an T-07; berührt `ShopStore`/`checkout.ts`, die T-02 teilt).

#### T-08b — Noon-Fallback (12:00) + sichtbare Offenlegung (Feld + Zusammenfassung, EN/DE/FR)
- **REQ:** REQ-018
- **Dependencies:** T-07 (Fallback-Logik), T-08 (Flag im Payload)
- **Files:** `src/pages/Personalize.tsx:106-118` (Offenlegungs-Hinweis am Zeitfeld), `src/components/shop/CartDrawer.tsx:162-175` (`unknownTimeNotice` in Zusammenfassung), `src/i18n/translations.ts` (Keys `personalize.unknownTimeHint`, `cart.unknownTimeNotice`, `cart.confirmLabel`, `personalize.timeUnknown` in EN/DE/FR).
- **Macht grün:** AT-018-1 (`[UNIT]` `12:00` deterministisch + Flag im `personalization`), AT-018-2 (`[REAL-BOUNDARY]` Hinweis am Feld rendert EN/DE/FR), AT-018-3 (`[REAL-BOUNDARY]` Hinweis in Cart-Zusammenfassung EN/DE/FR), AT-018-4 (`[UNIT]` kein präziser Claim bei Fallback), AT-018-5 (`[UNIT]` i18n-Keys in allen 3 Sprachen), AT-016-5.
- **Parallelizable:** `false` (hängt an T-07/T-08; teilt `translations.ts` mit T-09/T-10/T-11/T-12).

#### T-09 — Copy-Reframe i18n EN/DE/FR (Präzisions-/API-/„100%"-Claims entschärfen)
- **REQ:** REQ-005 (inkl. AK-5 Noon-Hinweis)
- **Dependencies:** T-01. (Teilt `translations.ts` mit T-08b/T-10/T-11 → sequentiell oder sorgfältiges Merge.)
- **Files:** `src/i18n/translations.ts:248,275,285,355,363,364,370,401,466` (+EN/FR-Pendants) — Verbots-Phrasen ersetzen durch ehrliches Framing („symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten").
- **Macht grün:** AT-005-1 (`[UNIT]` Scan über `translations[EN|DE|FR]` → kein Verbots-Treffer), AT-005-3 (`[UNIT]` Ersatz-Framing positiv vorhanden), AT-005-4 (`[UNIT]` Noon-Kopplung), AT-016-2.
- **Parallelizable:** `false` (geteilte `translations.ts`).

#### T-10 — FAQ „-ort wird berechnet" reformulieren (Kopplung an REQ-004)
- **REQ:** REQ-005 AK-3
- **Dependencies:** T-09 (gleiche Verbotsliste/Framing)
- **Files:** `src/lib/catalog.ts:226` (`shopFaqs[0].a`), `src/lib/catalog.ts:242` (`faqDefs.bazi.a`), ggf. `src/i18n/translations.ts:466` FAQ-Pendant.
- **Macht grün:** AT-005-2 (`[UNIT]` FAQ enthält kein „berechnet/exakt/calculate"; erlaubt „erfasst + für geplante Berechnung").
- **Parallelizable:** `false` (teilt `catalog.ts` mit T-11/T-14; teilt Verbotsliste mit T-09).

#### T-11 — TCM/Wuxing Health-Claim-Sweep + Entschärfung
- **REQ:** REQ-006
- **Dependencies:** T-01
- **Files:** `src/lib/catalog.ts:199` („nachweislich beruhigend" → „wirkt ruhig/atmosphärisch"), TCM/Wuxing-`bullets`/`articles`/`shopFaqs` in `catalog.ts`, TCM/Wuxing-Keys in `src/i18n/translations.ts`.
- **Macht grün:** AT-006-1 (`[UNIT]` Heilversprechen-Verbotsliste → kein Treffer), AT-006-2 (`[UNIT]` `:199` umformuliert), AT-006-3 (`[UNIT]` „kuratierte Wissens-/Fachgrafiken"-Framing), AT-016-3.
- **Parallelizable:** `false` (teilt `catalog.ts`/`translations.ts` mit T-09/T-10).
- **Notes:** `non-goal-violation` aktiv abgesichert — RED bis Sweep grün.

#### T-12 — DE/FR-Lokalisierung der Legal-Templates (Struktur, `[MISSING]` erhalten)
- **REQ:** REQ-007
- **Dependencies:** T-01
- **Files:** `src/lib/legal.ts:17,100-104,120,131` (`LEGAL_DOCS` → i18n-fähig DE/FR; `[MISSING — …]`-Marker bleiben; Widerrufs-Formulierung semantisch identisch), `src/pages/Legal.tsx` (i18n-Switch nach aktiver Sprache), ggf. `src/i18n/translations.ts` (`returnNotice`, Review-Banner).
- **Macht grün:** AT-007-1 (`[REAL-BOUNDARY]` je Doc × {DE,FR} rendert lokalisiert über `App.tsx`), AT-007-2 (`[UNIT]` `[MISSING]`-Marker-Anzahl/Position == EN-Template), AT-007-3 (`[UNIT]` Widerruf semantisch identisch EN/DE/FR), AT-007-4 (`[REAL-BOUNDARY]` Review-Banner je Sprache), AT-016-4.
- **Parallelizable:** `true` (eigene Dateien `legal.ts`/`Legal.tsx`; unabhängig von Copy/TCM/bazi).
- **Notes:** **Keine** Operator-Daten erfinden (`OQ-005`); Banner „Rechtsprüfung + Operator-Daten ausstehend" sichtbar.

#### T-13 — Truthful-Claims-Test-Suite
- **REQ:** REQ-016 (deckt REQ-004/005/006/007/018 ab)
- **Dependencies:** T-01; validiert T-07/T-08/T-08b/T-09/T-10/T-11/T-12.
- **Files:** `tests/unit/truthful-claims.test.ts` (neu: i18n-Scan Verbotsliste, Heilversprechen-Scan, Input-Passthrough, Noon-Flag), `tests/e2e/truthful-claims.spec.ts` (neu: Noon-Offenlegung + Legal DE/FR gerendert).
- **Macht grün:** AT-016-1 (=AT-004-1), AT-016-2 (=AT-005-1), AT-016-3 (=AT-006-1), AT-016-4 (=AT-007-1/2), AT-016-5 (=AT-018-1/2/3/5).
- **Parallelizable:** `false` (validiert die ganze M2-Schicht; läuft nach Impl-Tasks).

---

### Milestone 3 — Architektur / IA

#### T-14 — Datenmodell-Delta additiv auf `catalog.ts` (V2-Produktfelder)
- **REQ:** REQ-013
- **Dependencies:** T-01. (Voraussetzung für T-15/T-16-Filterung.)
- **Files:** `src/lib/catalog.ts:7-25` (`Product` additiv um `product_world ∈ {bazi,tcm,wuxing,mixed}`, `personalization_level ∈ {single,couple,yearly,none}`, `use_case`, `design_family ∈ {minimal,japandi,wabi_sabi,classic_ink}`), Bestandsprodukte annotieren, `filterByWorld(products, world)`-Helper.
- **Macht grün:** AT-013-1 (`[UNIT]` additive Felder, Bestandsfelder unverändert), AT-013-2 (`[UNIT]` Enum-Disziplin), AT-013-3 (`[UNIT]` `filterByWorld` deterministisch+total, filtert über `product_world` statt `category`), AT-013-4 (`[UNIT]` keine erfundenen Preise/Reviews).
- **Parallelizable:** `true` (`pure`-Logik, eigene Datei; kann parallel zu M2-Resten starten — aber **vor** T-15/T-16).
- **Notes:** `category` bleibt (Bestandscode liest es); neue Filter nutzen `product_world`. `pure` Task — keine Reality-Flags.

#### T-15 — Per-Welt-Collection-Routen + Collection-Template
- **REQ:** REQ-010
- **Dependencies:** T-14 (Filterachse), T-01
- **Files:** `src/App.tsx:55-84` (8 MVP-Routen `/collections/{bazi-posters,tcm-posters,wuxing-posters,personalized-posters,compatibility-posters,fire-horse-2026,analysis-pdfs,bundles}`), neues `src/pages/Collection.tsx` (Template H1/Intro/Grid/SEO/FAQ/interne Links), ggf. `src/lib/catalog.ts` (Collection-Entity).
- **Macht grün:** AT-010-1 (`[REAL-BOUNDARY]` jede MVP-Route über `App.tsx` reachable + rendert Template), AT-010-2 (`[UNIT]` Grid aus `catalog.ts` über `product_world` gefiltert, ≥1 Produkt/Welt), AT-010-3 (`[REAL-BOUNDARY]` H1/Intro/Grid/SEO/FAQ/Links — keine dünne Seite), AT-010-4 (`[REAL-BOUNDARY]` Negativ: keine Saju/Junishi-/Raum-Routen), AT-017-1.
- **Parallelizable:** `false` (teilt `App.tsx`-Routentabelle mit T-17; hängt an T-14).

#### T-16 — Echtes Mega-Menü (Desktop) + Mobile-Drawer/Accordion + A11y
- **REQ:** REQ-009
- **Dependencies:** T-14 (Gruppen-Achsen), T-15 (Mega-Menü-Links zeigen auf reale Routen)
- **Files:** `src/components/Navbar.tsx:13-22,157-167,195-224` (gruppiertes Mega-Menü Spalten: Personalisierte/TCM/Wuxing/Analyse-PDFs/Bundles/Featured; Desktop Hover+Keyboard, Mobile Drawer/Accordion Tap, `aria-haspopup`/`aria-expanded`, Escape, Touch ≥44px).
- **Macht grün:** AT-009-1 (`[REAL-BOUNDARY]` gruppierte Spalten öffnen über echte Navbar), AT-009-2 (`[REAL-BOUNDARY]` Mobile Drawer/Accordion @390, ≥44px), AT-009-3 (`[REAL-BOUNDARY]` Tab/Shift+Tab/Escape + `aria-*`), AT-009-4 (`[REAL-BOUNDARY]` jeder Link → existierende REQ-010-Route, kein 404), AT-017-3 (Mobile).
- **Parallelizable:** `false` (hängt an T-15-Routen; eigene Datei `Navbar.tsx`).

#### T-17 — Inspiration/Gallery-Seite `/inspiration` + Platzhalter-Marker
- **REQ:** REQ-011
- **Dependencies:** T-15 (Kacheln verlinken auf Collection/Produktseiten), T-01
- **Files:** `src/App.tsx` (Route `/inspiration`), neues `src/pages/Inspiration.tsx` (Masonry ab Tablet, vertikal mobil; Kacheln verlinkt; Platzhalter-Kacheln markiert).
- **Macht grün:** AT-011-1 (`[REAL-BOUNDARY]` `/inspiration` reachable + Galerie), AT-011-2 (`[REAL-BOUNDARY]` Kacheln verlinken auf reale Routen), AT-011-3 (`[REAL-BOUNDARY]` Platzhalter-Markierung, `OQ-006`, keine erfundenen Kundenbeispiele), AT-011-4 (Home-Modul 09 → `/inspiration`, Kopplung T-18), AT-017-1.
- **Parallelizable:** `false` (teilt `App.tsx`-Routentabelle mit T-15).

---

### Milestone 4 — Homepage & Abschluss

#### T-18 — Homepage-Module 03/04/06/07/08/09 ergänzen
- **REQ:** REQ-008
- **Dependencies:** T-15 (Shop-nach-Welt verlinkt Collections), T-17 (Modul 09 → `/inspiration`)
- **Files:** `src/pages/Home.tsx:131-141` (Module: 03 Shop-nach-Welt, 04 Bestseller/Featured-Slider, 06 Fire Horse 2026, 07 Für Paare/Kompatibilität, 08 Analyse-PDFs, 09 Inspiration), ggf. neue Sektions-Komponenten in `src/components/shop/` (Wiederverwendung bestehender wo möglich), stabile `id`/`data-module`-Anker.
- **Macht grün:** Teil von AT-008-1 (`[REAL-BOUNDARY]` fehlende Module vorhanden), AT-008-4 (kein Saju/Junishi), AT-017-2.
- **Parallelizable:** `false` (geteilte `Home.tsx`, sequentiell mit T-19/T-20).

#### T-19 — Trust-Block (Modul 11) + Modulfolge 1–13 herstellen
- **REQ:** REQ-008
- **Dependencies:** T-18 (Module existieren, jetzt ordnen)
- **Files:** `src/pages/Home.tsx` (Trust-Block Modul 11; finale DOM-Order 01–13; Hero/InkWave bleibt Modul 02; Lazy-Three.js `Home.tsx:6` + Reduced-Motion-Fallback erhalten), ≤6 Hauptnav-Einträge bestätigen.
- **Macht grün:** AT-008-1 (`[REAL-BOUNDARY]` DOM-Order 02→13 über `App.tsx`), AT-008-2 (`[REAL-BOUNDARY]` Hero Modul 02, Lazy-Suspense + Reduced-Motion erhalten), AT-008-3 (`[UNIT]` ≤6 Hauptnav), AT-017-2.
- **Parallelizable:** `false` (geteilte `Home.tsx`).

#### T-20 — Home-SEO-Textblock (Modul 12), claim-konform
- **REQ:** REQ-012
- **Dependencies:** T-19 (Modul-12-Platz in der Folge), T-15 (interne Collection-Links), T-09/T-11 (Verbotslisten gelten)
- **Files:** `src/pages/Home.tsx` (Modul 12 SEO-Block, H2-Struktur, interne Links zu Collections + Wissensartikeln, Keyword-TODO `OQ-007` markiert), ggf. `src/i18n/translations.ts` (SEO-Strings EN/DE/FR).
- **Macht grün:** AT-012-1 (`[REAL-BOUNDARY]` Modul 12 H2 + interne Links), AT-012-2 (`[UNIT]` gegen Präzisions-+Heilversprechen-Verbotsliste → kein Treffer), AT-012-3 (`[UNIT]` Keyword-TODO markiert, kein erfundenes Keyword-Set).
- **Parallelizable:** `false` (geteilte `Home.tsx`).

#### T-21 — Hero/LCP-Regressions-Guard (NFR-1) + Reduced-Motion/Mobile-Budget
- **REQ:** REQ-008 (NFR-1/NFR-2/NFR-3-Kopplung)
- **Dependencies:** T-18, T-19 (Home umgebaut → jetzt messen)
- **Files:** `tests/e2e/performance.spec.ts` (neu: LCP-Messung Home über `App.tsx` vs. Baseline-Commits `0133437`/`0f8995c`/`d56de04`; `prefers-reduced-motion: reduce` → statisches Fallback; Lazy-`InkWave`-Chunk bleibt code-split).
- **Macht grün:** AT-021-1 (`[REAL-BOUNDARY]` LCP ≤ Baseline, sonst Blocker `BLK-MEASURE-LCP`), AT-021-2 (`[REAL-BOUNDARY]` Reduced-Motion statisches Fallback + Code-Split erhalten).
- **Parallelizable:** `true` (eigene neue Testdatei; läuft nach T-18/T-19, blockiert T-22 nicht).
- **Notes:** Absolute Schwelle = `MEASURE_NEEDED` (`OQ-008`) → Guard = „keine Regression ggü. Baseline"; fehlende Messung ist **expliziter** Blocker, nicht still grün.

#### T-22 — Conformance-Smoke-Test-Suite
- **REQ:** REQ-017 (deckt REQ-008/009/010/011/013 ab) + AT-NEG-SAJU
- **Dependencies:** T-14..T-20 (alle Conformance-Impl muss stehen)
- **Files:** `tests/e2e/conformance.spec.ts` (neu: alle MVP-Collection-Routen + `/inspiration` reachable; Home Module 1–13 DOM-Order; Mobile 360/390/430 kein Horizontal-Scroll; Drawer/Mega-Menü bedienbar; AT-NEG-SAJU), `tests/unit/neg-saju.test.ts` (neu: Daten-/i18n-/Routen-Scan).
- **Macht grün:** AT-017-1 (=AT-010-1+AT-011-1), AT-017-2 (=AT-008-1), AT-017-3 (`[REAL-BOUNDARY]` Breakpoints, kein Horizontal-Scroll), AT-017-4 (=AT-NEG-SAJU), AT-NEG-SAJU-1 (`[UNIT]`), AT-NEG-SAJU-2 (`[REAL-BOUNDARY]`).
- **Parallelizable:** `false` (Abschluss-Gate; validiert die ganze M3+M4-Schicht).

---

## 5. Abhängigkeits-Graph (Kurzform)

```
T-01 ──┬─► alle Tests + alle Impl-Tasks
       │
M1     ├─► T-02 ─► T-03 ─► T-04 ─► T-05 ─► (T-06 rot-ohne-Fix, gekoppelt an T-03/04/05)
       │
M2     ├─► T-07 ─► T-08 ─► T-08b ─┐
       │   T-09 ─► T-10           ├─► T-13 (validiert M2)
       │   T-11                   │
       │   T-12 (parallel) ───────┘
       │
M3     ├─► T-14 ─► T-15 ─► T-16
       │              └──► T-17
       │
M4     └─► T-18 ─► T-19 ─► T-20 ─► (T-21 parallel) ─► T-22 (Abschluss-Gate)
```

**Council-Reihenfolge:** M1 (SECURITY) + M2 (TRUTHFUL) **vor** M3/M4 (V2-Kosmetik). `pure` T-14 ist
früh startbar, muss aber vor T-15/T-16 stehen.

---

## 6. Risks & Rollback Notes

| Risiko | Mitigation | Rollback |
|---|---|---|
| T-02 ändert Checkout-Interface → bricht bestehenden Cart | T-06 rot-ohne-Fix zuerst; `unitAmount` im Payload belassen, nur serverseitig ignorieren | Re-Pricing per Feature-Flag auf Client-Wert zurücksetzbar (nur Server-Diff) |
| T-03/T-04 nur den Stub spiegeln (grün-aber-wertlos) | AT-001-1/2/3 + AT-015-6 gegen **echte** Express-App (supertest), Stripe gestubbt; Property über Tamper-Werte | Server-Route-Diff isoliert (`git revert` der Route) |
| T-08 verliert `place` still in `personalization` | AT-004-1 fährt **realen** Cart-Pfad (kein Signatur-Test allein) | `ShopStore`/`checkout.ts`-Diff revertierbar |
| T-08b setzt Noon still (keine Offenlegung) | AT-018-2/3 prüfen **gerendertes** DOM EN/DE/FR | i18n-Keys + UI-Diff revertierbar |
| T-09/T-10/T-11 in geteilter `translations.ts`/`catalog.ts` → Merge-Konflikte | sequentiell in **einem** Worktree; Verbotslisten-Tests fangen Rückfälle | String-Diffs revertierbar; Tests pinnen Zustand |
| T-15/T-17 teilen `App.tsx`-Routentabelle | sequentiell (T-15 → T-17); AT-010-1/AT-011-1 prüfen Reachability über `App.tsx` | Routen-Diff revertierbar |
| T-18/T-19 regredieren Hero/LCP (Spec-Treue schlägt Performance) | T-21 LCP-Guard vs. Baseline-Commits; Lazy-Three.js + Reduced-Motion erhalten | `Home.tsx`-Diff revertierbar; Baseline-Commits als Anker |
| `bazi.ts` wird als „fertige Engine" gemeldet | AT-004-4 pinnt RED-Linie; **BLK-RED-BAZI** (nur Nutzer darf herabstufen) | n/a — Reality-Ledger-Pflicht |
| Neue Test-Deps führen Vulnerabilities ein | T-01 pinnt Deps + `npm audit` in CI | Dep-Pin revertierbar |

### Dauerhaft RED-geführt (auch bei grünen Tests sichtbar halten)
- `bazi-chart` (REQ-004/018) — `*-fake`/RED für ACCURACY bis reale API verbunden.
- `checkout-repricing` (REQ-001/002) — max. `integration-fake` (reale Stripe-Session außerhalb Run).
- `tests` — Coverage/Mutation-Baseline = 0 bis T-01/T-06/T-13/T-22 grün.

---

## 7. Acceptance-Evidence-Mapping (Spine)

| Task | REQ | Acceptance-Tests (müssen grün werden) | Boundary |
|---|---|---|---|
| T-01 | REQ-014 | AT-014-1/2/3 | REAL-BOUNDARY-Smoke |
| T-02 | REQ-001 | AT-001-4 (+Vorbedingung AT-001-1/2/3/5) | UNIT + Setup |
| T-03 | REQ-001 | AT-001-1/2/3/5, AT-015-1/2/6 | INTEGRATION-FAKE |
| T-04 | REQ-002 | AT-002-1/2/3/4, AT-015-3 | INTEGRATION-FAKE + UNIT |
| T-05 | REQ-003 | AT-003-1/2/3/4, AT-015-5 | INTEGRATION-FAKE + UNIT |
| T-06 | REQ-015 | AT-015-1..6 | INTEGRATION-FAKE |
| T-07 | REQ-004 | AT-004-2/3/4, AT-018-1 | UNIT |
| T-08 | REQ-004 | AT-004-1, AT-016-1 | REAL-BOUNDARY |
| T-08b | REQ-018 | AT-018-1/2/3/4/5, AT-016-5 | UNIT + REAL-BOUNDARY |
| T-09 | REQ-005 | AT-005-1/3/4, AT-016-2 | UNIT |
| T-10 | REQ-005 AK-3 | AT-005-2 | UNIT |
| T-11 | REQ-006 | AT-006-1/2/3, AT-016-3 | UNIT |
| T-12 | REQ-007 | AT-007-1/2/3/4, AT-016-4 | REAL-BOUNDARY + UNIT |
| T-13 | REQ-016 | AT-016-1/2/3/4/5 | UNIT + REAL-BOUNDARY |
| T-14 | REQ-013 | AT-013-1/2/3/4 | UNIT (pure) |
| T-15 | REQ-010 | AT-010-1/2/3/4, AT-017-1 | REAL-BOUNDARY + UNIT |
| T-16 | REQ-009 | AT-009-1/2/3/4, AT-017-3 | REAL-BOUNDARY |
| T-17 | REQ-011 | AT-011-1/2/3/4, AT-017-1 | REAL-BOUNDARY |
| T-18 | REQ-008 | AT-008-1(Teil)/4, AT-017-2 | REAL-BOUNDARY |
| T-19 | REQ-008 | AT-008-1/2/3, AT-017-2 | REAL-BOUNDARY + UNIT |
| T-20 | REQ-012 | AT-012-1/2/3 | REAL-BOUNDARY + UNIT |
| T-21 | NFR-1/2/3 | AT-021-1/2 | REAL-BOUNDARY |
| T-22 | REQ-017 | AT-017-1/2/3/4, AT-NEG-SAJU-1/2 | REAL-BOUNDARY + UNIT |

---

## 8. Definition of Done (pro Task)
- [ ] Test(s) zuerst geschrieben (RED), dann Impl (GREEN), dann Refactor.
- [ ] Alle zugeordneten AT-IDs grün; keine zuvor grünen Tests regrediert.
- [ ] Scope-Guard eingehalten (PRD §1.2; `server/index.js` nur Checkout-Route; `bazi.ts` kein Engine-Ausbau).
- [ ] RED-Items im Reality-Ledger sichtbar (kein still aufgelöstes `*-fake`).
- [ ] `npm run build` + `npm test` grün; `npm audit` sauber.
- [ ] Geänderte/neue i18n-Strings in EN/DE/FR (NFR-6).
