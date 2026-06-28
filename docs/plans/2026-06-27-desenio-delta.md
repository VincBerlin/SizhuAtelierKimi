# Umsetzungsplan — SizhuAtelier Desenio Delta

Status: Phase-1 PLAN (atomar, abhängigkeits-geordnet) · CORE-manual · nichts production-verified
Branch: `feat/desenio-delta` · Delta auf deployter V2 (`6b0882e`)
Feature-Slug: `sizhuatelier-desenio-delta-architecture`
Quelle (FROZEN, alle gelesen): PRD `docs/prd/sizhuatelier-desenio-delta-architecture.prd.md`,
Canvas `docs/canvas/…`, Vision `docs/vision/…`, Traceability `docs/traceability.md`,
Test-Design `docs/tests/desenio-acceptance-design.md`, Ist-Architektur `docs/architecture/current-architecture.md`.

> **Geltungsregeln (eingefroren, nicht verhandelbar im Build):**
> - **Hero unangetastet (REQ-001):** kein Re-Design, kein Auflösen des Three.js-`lazy`/`Suspense`-Splits.
>   Nur Mobile-Abschneide-Fix erlaubt. Tests AT-001-1..3 schützen das.
> - **`server/index.js` nur Checkout-/Pricing-Pfad** anfassen (`/api/checkout` + `server/pricing.js`).
>   Keine anderen Routen/Auth/DB-Änderungen.
> - **`bazi.ts` bleibt Platzhalter** — keine echte Chart-Engine. RED-Carry `RL-BAZI` bleibt sichtbar.
> - **Test-Infra existiert aus V2** (Vitest jsdom+node, supertest, `playwright.config.ts`, `tests/`).
>   Sie wird WIEDERVERWENDET (Helper aus `truthful-claims.test.ts`, `createApp({stripe})`,
>   `render(<MemoryRouter><App/></MemoryRouter>)`), NICHT neu gebaut.
> - **Bildflächen ASSET-LIGHT** (REQ-004/006/023/024): generische Platzhalter mit `data-placeholder`,
>   die NICHT wie echte Produktbilder wirken (CAN-014 / RISK-001). Echte Bilder erst nach OQ-001.
> - **RED-Carry bleibt RED:** BaZi-Platzhalter, Bilder (OQ-001), Preise (OQ-002), Stripe integration-fake,
>   Mobile/LCP echter-Browser ungelaufen (`[REAL-BROWSER-PLANNED]` / BLK-CHROMIUM).

---

## 0. Sequenz-Logik & Iterationsableitung (ehrlich, keine runde Zahl)

Die 24 signal-gestützten Deltas laufen ZUERST, gruppiert nach Datenfluss-Abhängigkeit
(Daten/Logik → Navigation → Trust/Templates → Mobile → International/Pricing → Farb-Tokens).
**REQ-002 (inkrementelle Above-Fold-Re-Ordnung) ist die VORLETZTE Iteration und merge-gated**
(echter-Browser-Playwright grün + Event-Readout instrumentiert); das Event-Readout ist eine
EIGENE Aufgabe VOR dem Re-Order-Merge. Eine abschließende **FINALIZE**-Iteration sammelt das
QA-/Reality-Ledger-Meta (REQ-020) und die Evidenz-Konsolidierung.

**Abgeleitete Iterationszahl M = 8** (6 Daten-/UI-Delta-Iterationen + 1 REQ-002-Gate-Iteration + 1 FINALIZE).
Die Zahl folgt aus dem Abhängigkeitsgraph, nicht aus einer Zielvorgabe: Iteration 1 (Produktlogik/Daten)
ist Fundament für fast alle übrigen (Nav-Slugs, PDP-Gating, Cart-Gating, Collections hängen am Katalog);
Pricing/i18n sind unabhängig genug für eigene Iterationen; Farb-Tokens sind ein isolierter Scan-Pass;
REQ-002 MUSS allein und zuletzt (vor FINALIZE) stehen, weil es value-risk + doppelt merge-gated ist.

**Parallelisierbarkeit:** Aufgaben mit disjunkten Dateimengen sind als `parallelizable: true` markiert
(worktree-fähig). Aufgaben, die `src/lib/catalog.ts`, `src/components/Navbar.tsx`, `src/pages/Home.tsx`,
`src/i18n/translations.ts` oder `src/lib/tokens.ts` teilen, serialisieren auf diese Datei.

**Konvention:** Jede Aufgabe ist TDD — der zugehörige Akzeptanztest (aus `desenio-acceptance-design.md`)
ist absichtlich vorab RED (BLK-DELTA-DATA) und wird durch die Aufgabe grün. `data-*`-Anker, die die
Tests erwarten, sind im Vertrag der Aufgabe genannt.

---

## Iteration 1 — Produktlogik & Daten (Fundament)

Begründung: Katalog-Enums, BaZi-only-Personalisierung und Saju/Junishi-Entfernung sind die
Datenwahrheit, auf der Nav-Slugs, PDP-/Cart-Gating und Collections aufsetzen. Muss zuerst stehen.

### T-101 — Saju/Junishi-Reste aus Daten & Suchindex entfernen
- **REQ:** REQ-005
- **Abhängigkeiten:** —
- **Dateien:** `src/lib/catalog.ts`, `src/lib/collections.ts`, `src/i18n/translations.ts`, `src/lib/legal.ts`
- **Akzeptanz (grün):** AT-005-1, AT-005-2, AT-005-4 (`[SHIPPED-SCAN]`: kein `/saju|junishi/i` in
  translations[EN/DE/FR/ES], catalog, collections; kein saju/junishi Slug/`product_world`/Filter-Enum).
- **Parallelisierbar:** nein (teilt `catalog.ts`/`translations.ts` mit T-102/T-103/T-104).

### T-102 — Katalog-Personalisierungsflags: nur BaZi personalisierbar (Fire Horse/TCM/Wuxing `personalizable:false`)
- **REQ:** REQ-007, REQ-025
- **Abhängigkeiten:** T-101
- **Dateien:** `src/lib/catalog.ts`, `src/lib/productTypes.ts`
- **Akzeptanz (grün):** AT-007-5 (`[SHIPPED-SCAN]`: jedes `product_world ∈ {tcm,wuxing}` ODER Fire Horse
  hat `personalizable===false`; jedes BaZi-Produkt personalisierbar). FM-04-Falle: `personalization_level:'yearly'`
  am Fire Horse darf NICHT als personalisierbar gelesen werden.
- **Parallelisierbar:** nein (teilt `catalog.ts`).

### T-103 — TCM/Wuxing als echte Produktwelten im Katalog (Titel + `price>0` + CTA-fähig)
- **REQ:** REQ-006
- **Abhängigkeiten:** T-101
- **Dateien:** `src/lib/catalog.ts`, `src/lib/collections.ts`
- **Akzeptanz (grün):** AT-006-3 (`[SHIPPED-SCAN]`: ≥1 Produkt `product_world==='tcm'` UND ≥1 `'wuxing'`,
  jeweils `price>0`). Render-Teile AT-006-1/2/4 folgen in T-303 (Collection-Template).
- **Parallelisierbar:** nein (teilt `catalog.ts`/`collections.ts`).

### T-104 — PDP-Personalisierungs-Gating: BaZi zeigt Konfigurator, TCM/Wuxing/Fire Horse zeigen KEINE
- **REQ:** REQ-007, REQ-008 (Personalisierungs-Unterscheidung), REQ-025
- **Abhängigkeiten:** T-102
- **Dateien:** `src/pages/ProductView.tsx`
- **Akzeptanz (grün):** AT-007-1 (BaZi-PDP: Konfigurator/Personalisieren-CTA + Birth-Felder),
  AT-007-2 (TCM-PDP: keine Birth-Felder/CTA/Chart-Vorschau), AT-007-3 (Wuxing negativ),
  AT-007-4 (Fire-Horse negativ — yearly ⇏ Birth-Data), AT-008-2 (Unterscheidung). FM-04.
- **Parallelisierbar:** ja (eigene Datei `ProductView.tsx`, sobald T-102 steht).

### T-105 — CartDrawer Birth-Data-Review nur bei BaZi-Zeilen (zeilengenaues Gating)
- **REQ:** REQ-014
- **Abhängigkeiten:** T-102
- **Dateien:** `src/components/shop/CartDrawer.tsx`
- **Akzeptanz (grün):** AT-014-1 (BaZi-Zeile → Hinweis sichtbar), AT-014-2 (Fire-Horse/TCM-Zeile → kein Hinweis),
  AT-014-3 (gemischter Cart → Review nur an BaZi-Zeile). FM-05 (Gating am `personalization`-Feld, nicht an
  `product_world`/Titel).
- **Parallelisierbar:** ja (eigene Datei `CartDrawer.tsx`, sobald T-102 steht).

---

## Iteration 2 — Navigation & Header

Begründung: Sobald die Produktwelten/Slugs stehen (Iter 1), kann die shop-orientierte Nav exakt
auf existierende Routen zeigen. Header/Utility-Bar/Mega-Menü hängen an diesen Slugs.

### T-201 — Shop-orientierte Primär-Nav: exakte 8er-Liste; FAQ/About/Contact/Blog raus
- **REQ:** REQ-003
- **Abhängigkeiten:** T-103 (Slugs existieren)
- **Dateien:** `src/components/Navbar.tsx`, `src/i18n/translations.ts`
- **Akzeptanz (grün):** AT-003-1 (exakt 8 Soll-Labels i18n-Key-basiert, Spec-Reihenfolge),
  AT-003-2 (negativ: kein /faq,/about,/contact,/blog in Primär-Nav), AT-003-3 (jeder Eintrag href auf
  existierende Route, kein dead link). FM-03 (V2-`NAV_LINKS` enthält blog/faq/about/contact!).
- **Parallelisierbar:** nein (teilt `Navbar.tsx`/`translations.ts` mit T-202/T-203).

### T-202 — Header-Komposition: Logo, Nav, Suche, Warenkorb, Sprache/Land (Account/Favoriten optional)
- **REQ:** REQ-022
- **Abhängigkeiten:** T-201
- **Dateien:** `src/components/Navbar.tsx`, `src/components/shop/HeaderSearch.tsx`
- **Akzeptanz (grün):** AT-011-4 (`[REAL-BOUNDARY-jsdom]`: Desktop-Header rendert Logo, Primär-Nav, Suche,
  Warenkorb, Sprache/Land; Account/Favoriten optional/dürfen fehlen). Mobile-Sichtbarkeit in T-401.
- **Parallelisierbar:** nein (teilt `Navbar.tsx`).

### T-203 — Mega-Menü asset-light: Textspalten + ≥2 Kacheln je relevanter Spalte (Titel/CTA/Link)
- **REQ:** REQ-004
- **Abhängigkeiten:** T-201, T-103
- **Dateien:** `src/components/Navbar.tsx`, `src/i18n/translations.ts`
- **Akzeptanz (grün):** AT-004-1 (Mega-Menü öffnet, ≥2 Kacheln je Poster/TCM/Wuxing-Spalte),
  AT-004-2 (jede Kachel: Titel + CTA + href auf echte Route), AT-004-3 (Asset-light: Bildfeld `data-placeholder`,
  KEIN `<img src=/images/…webp>`-Produktbild). AT-004-4 PLANNED (BLK-CHROMIUM). FM-11.
- **Parallelisierbar:** nein (teilt `Navbar.tsx`/`translations.ts`).

### T-204 — Utility-/Promo-Bar oberhalb des Headers (regionale Versandkommunikation)
- **REQ:** REQ-021
- **Abhängigkeiten:** T-202
- **Dateien:** `src/components/shop/AnnouncementBar.tsx`, `src/App.tsx`, `src/i18n/translations.ts`, `src/lib/region.ts`
- **Akzeptanz (grün):** AT-016-6 (`[REAL-BOUNDARY-jsdom]`: AnnouncementBar rendert oberhalb der Navbar im DOM,
  Index vor `primary-nav`; us/uk Free-Shipping direkt, eu lokale Versandlogik, regionabhängiger i18n-Text).
  Server-Seite gekoppelt an Iteration 5 (T-502).
- **Parallelisierbar:** nein (teilt `translations.ts`/`App.tsx` mit T-201..T-203; `region.ts` mit T-502).

---

## Iteration 3 — Trust-Bereinigung & Templates

Begründung: Mit korrekter Produktlogik und Nav werden Fake-Trust-Reste entfernt und die
Collection-/PDP-/Card-/Sale-Hub-Templates auf das volle Inventar gebracht.

### T-301 — Coming Soon / Patron Fold / Credit-System / Fake Reviews entfernen
- **REQ:** REQ-010
- **Abhängigkeiten:** T-101
- **Dateien:** `src/i18n/translations.ts`, `src/components/shop/CartDrawer.tsx`, `src/pages/ProductView.tsx`, `src/pages/Home.tsx`, `src/components/shop/StarRating.tsx`
- **Akzeptanz (grün):** AT-010-1 (translations ohne coming-soon/patron/credit-Kaufpfad-Strings),
  AT-010-2 (Home-`<main>` ohne Coming-Soon/Patron/Credit/erfundene Sterne), AT-010-3 (CartDrawer ohne
  Credits-earned-Zeile — `ProductView` setzt aktuell `creditsEarned`!), AT-010-4 (keine Fake-Review-Summe).
  FM-12, FM-13.
- **Parallelisierbar:** nein (teilt `translations.ts`/`Home.tsx`/`CartDrawer.tsx`/`ProductView.tsx`).

### T-302 — Product Cards asset-light: Bildfeld(Platzhalter)/Badge?/Titel/Kurzclaim/Preis/eindeutiger CTA
- **REQ:** REQ-023
- **Abhängigkeiten:** T-103
- **Dateien:** `src/components/shop/ProductCard.tsx`
- **Akzeptanz (grün):** AT-023-1 (Card: Bildfeld, Titel, Kurzclaim, Preis, genau ein eindeutiger CTA-Link),
  AT-023-2 (Asset-light: Bildfeld `data-placeholder`, wirkt nicht wie Produktfoto), AT-023-3 (optionales Badge
  als distinktes Element, Abwesenheit erlaubt). FM-11.
- **Parallelisierbar:** ja (eigene Datei `ProductCard.tsx`, sobald T-103 steht).

### T-303 — Collection-Template-Inventar (Breadcrumb..Footer) + TCM/Wuxing-Render
- **REQ:** REQ-009, REQ-006 (Render-Teil)
- **Abhängigkeiten:** T-103, T-302
- **Dateien:** `src/pages/Collection.tsx`, `src/lib/collections.ts`
- **Akzeptanz (grün):** AT-009-1 (alle Inventar-Bausteine: Breadcrumb, Zurück, H1, Intro, Visual, Toolbar,
  Filter, Sort, Grid, Anzahl, Pagination/Mehr, SEO, Trust, Footer), AT-009-2 (Anzahl == gerenderte Karten),
  AT-009-3 (8 Slugs abgedeckt), AT-009-4 (Filter/Sort verändern Grid), AT-006-1/2/4 (tcm/wuxing-Collections
  rendern Produktkarten mit Titel+Preis+CTA, asset-light). AT-005-3 (Render-Negativ saju/junishi).
- **Parallelisierbar:** ja (eigene Datei `Collection.tsx`, sobald T-302/T-103 stehen).

### T-304 — PDP-Template-Inventar (volles Inventar) + Review-Gate (kein Block ohne echte Reviews)
- **REQ:** REQ-008
- **Abhängigkeiten:** T-104, T-301
- **Dateien:** `src/pages/ProductView.tsx`
- **Akzeptanz (grün):** AT-008-1 (Breadcrumb, Galerie, Name, Preis, Varianten, Add-to-Cart, Rahmen/Zubehör,
  Trust-Bullets, Beschreibung, Cross-Sells, Inspiration-Kontext je stabiler Anker), AT-008-3 (negativ
  Review-Gate: kein Review-Block/Sterne solange keine echten Reviews), AT-008-4 (keine erfundene Review-Zahl).
  Review-Reaktivierung gated OQ-004. FM-13.
- **Parallelisierbar:** nein (teilt `ProductView.tsx` mit T-104/T-301 — serialisiert nach beiden).

### T-305 — Angebots-/Sale-/Campaign-Hub asset-light (≥2 kuratierte Sektionen: Kurztext+Slider+CTA) + Route
- **REQ:** REQ-024
- **Abhängigkeiten:** T-302, T-201 („Angebote"-Nav-Eintrag)
- **Dateien:** neue Hub-Seite (z.B. `src/pages/Offers.tsx`), `src/App.tsx`, `src/lib/collections.ts`, `src/components/shop/ProductCarousel.tsx`
- **Akzeptanz (grün):** AT-024-1 (≥2 kuratierte Sektionen), AT-024-2 (je Sektion Kurztext+Slider(≥1 Karte)+CTA),
  AT-024-3 (Asset-light Bildflächen), AT-024-4 („Angebote"-Nav verlinkt auf Hub-Route, kein dead link). FM-11.
- **Parallelisierbar:** nein (teilt `App.tsx`/`collections.ts` mit T-204/T-303).

### T-306 — Newsletter/SEO gekürzt + kaufpfadfreundlich; störende Bloglinks raus
- **REQ:** REQ-019
- **Abhängigkeiten:** T-301
- **Dateien:** `src/components/shop/SeoTextSection.tsx`, `src/components/shop/NewsletterSection.tsx`, `src/pages/Home.tsx`, `src/i18n/translations.ts`
- **Akzeptanz (grün):** AT-019-1 (SEO-Block ohne /blog-Links direkt unter Angebotszusammenfassungen),
  AT-019-2 (Blog-Links nur im Inspiration-/Footer-Kontext), AT-019-3 (Newsletter-Copy ohne Präzisions-Overclaim).
  FM-16.
- **Parallelisierbar:** nein (teilt `Home.tsx`/`translations.ts`).

---

## Iteration 4 — Mobile UX

Begründung: Header/Nav/PDP/Collection stehen; jetzt mobile Sichtbarkeit, Sticky-Preview,
getrennte DOB/TOB und policy-konformes Place-of-Birth-Autocomplete.

### T-401 — Mobile Header: Hamburger/Logo/Suche/Cart-Icon/Cart-Badge vollständig sichtbar (jsdom-Präsenz)
- **REQ:** REQ-011, REQ-022 (Mobile-Teil)
- **Abhängigkeiten:** T-202
- **Dateien:** `src/components/Navbar.tsx`
- **Akzeptanz (grün):** AT-011-1 (Mobile-Header rendert Hamburger, Logo, Suche, Cart-Icon, Sprachzugang im DOM,
  bedienbar), AT-011-2 (Cart-Badge mit Item sichtbar, nicht display:none). AT-011-3 PLANNED (BLK-CHROMIUM:
  echter Clipping-/No-Scroll-Beweis = Merge-Gate REQ-002 (a)). VR-MOBILE-UNVERIFIED bleibt RED bis Playwright.
- **Parallelisierbar:** nein (teilt `Navbar.tsx`).

### T-402 — Mobile BaZi-Konfigurator: Sticky Poster Preview + Eingabefelder gleichzeitig, Max-Höhen-Regel
- **REQ:** REQ-012
- **Abhängigkeiten:** T-104
- **Dateien:** `src/pages/Personalize.tsx`, `src/components/shop/PosterScene.tsx`, `src/index.css`
- **Akzeptanz (grün):** AT-012-1 (Sticky-Preview + Eingabefelder beide im DOM), AT-012-2 (Preview-Container
  trägt `sticky` + `max-h`/maxHeight). AT-012-3 PLANNED (BLK-CHROMIUM: Preview verdeckt kein Feld @360px). RISK-002.
- **Parallelisierbar:** ja (eigene Dateien, sobald T-104 steht; teilt nichts mit T-401/T-403).

### T-403 — Getrennte DOB/TOB-Felder + Place-of-Birth Autocomplete (gebündelte Cities-JSON, policy-konform)
- **REQ:** REQ-013
- **Abhängigkeiten:** T-402
- **Dateien:** `src/pages/Personalize.tsx`, neue gebündelte Cities-Datenquelle (z.B. `src/lib/cities.ts` / `src/data/cities.json`), `src/components/shop/Configurator.tsx`
- **Akzeptanz (grün):** AT-013-1 (getrennte DOB- und TOB-Felder), AT-013-2 („Stuttgart" → „Stuttgart, Germany"
  aus gebündelter Quelle), AT-013-3 (`[SHIPPED-SCAN]` Policy-Guard: KEIN per-Keystroke `fetch`/`XHR` auf
  `nominatim.openstreetmap.org` in `src/`). AT-013-4 PLANNED (BLK-CHROMIUM). FM-10.
  **BLK-OQ003-AUTOCOMPLETE-SOURCE:** Quelle DEFAULT = gebündelte Cities-JSON / policy-konformer Provider;
  Nominatim-per-Keystroke verboten. AT-013-2/3 final grün erst, wenn OQ-003 als gebündelte JSON entschieden ist.
- **Parallelisierbar:** nein (teilt `Personalize.tsx` mit T-402).

### T-404 — BaZi-Konfigurator Poster-Hintergrundpalette (exakt 5 Hex) + Live-Vorschau-Kopplung
- **REQ:** REQ-018
- **Abhängigkeiten:** T-402
- **Dateien:** `src/components/shop/Configurator.tsx`, `src/lib/bazi.ts` (nur Paletten-Konstante, KEINE Chart-Mathe), `src/pages/Personalize.tsx`
- **Akzeptanz (grün):** AT-018-1 (Palette exakt 5 Hex: Ink #171C20, Graphite #2B3034, Soft Line #70716C,
  Soft White #F8F4EE, Parchment #EFE5D8 — keine zusätzlichen/fehlenden), AT-018-2 (5 Swatches rendern),
  AT-018-3 (Auswahl ändert Vorschau-Hintergrund nachvollziehbar). FM-15.
- **Parallelisierbar:** nein (teilt `Personalize.tsx`/`Configurator.tsx` mit T-402/T-403).

---

## Iteration 5 — International & Pricing

Begründung: ES-Locale und server-autoritative Region/Pricing sind unabhängig von der UI-Struktur,
aber die Promo-Bar (T-204) und Nav-i18n-Keys (T-201) koppeln an sie.

### T-501 — ES als 4. Locale (volle UI, maschinell, Key-Parität zu EN); Sprachwähler EN/DE/FR/ES + Flaggen rechts
- **REQ:** REQ-015
- **Abhängigkeiten:** T-101, T-201 (Nav-Keys existieren)
- **Dateien:** `src/i18n/translations.ts`, `src/i18n/` (I18nProvider), `src/components/Navbar.tsx`
- **Akzeptanz (grün):** AT-015-1 (`translations.ES` existiert, Key-Menge(ES)==Key-Menge(EN), kein stiller
  EN-Fallback), AT-015-2 (ES-Wert ≠ EN-Wert für nav/announce/product-Keys — echtes Spanisch), AT-015-3
  (Sprachwähler EN/DE/FR/ES; Kürzel unverändert; Flagge rechts neben Kürzel, DOM-Ordnung Kürzel→Flagge),
  AT-015-4 (Umschalten auf ES → `<html lang="es">` + sichtbarer String wechselt). AT-003-4 (Nav-Keys in ES).
  FM-07, FM-08. **BLK-ES-CONTENT:** vollständige ES-Übersetzung muss existieren; User reviewt Qualität
  (VR-ES-MACHINE-TRANSLATED bleibt offener value-risk).
- **Parallelisierbar:** nein (teilt `translations.ts`/`Navbar.tsx`).

### T-502 — Server-autoritative Region/Pricing: USD/GBP/EUR, US/UK Free Shipping, EU lokale Versandlogik
- **REQ:** REQ-016
- **Abhängigkeiten:** —
- **Dateien:** `server/pricing.js`, `server/index.js` (NUR `/api/checkout`-Pfad), `src/lib/region.ts`, `src/lib/catalog.ts` (Währungsabbildung deklarativ)
- **Akzeptanz (grün):** AT-016-1 (`cf-ipcountry:US` + Client-`shippingCents:9999` → keine Shipping-Zeile, Client
  ignoriert), AT-016-2 (GB → free), AT-016-3 (DE < Schwelle, Client-0 → Server-490), AT-016-4 (DE ≥ `FREE_SHIP_THRESHOLD`
  → free, 9999 ignoriert), AT-016-5 (`computeShippingCents`: us/uk→0; eu/other free ≥ Schwelle sonst 490, Parität
  gegen `FREE_SHIP_THRESHOLD`, keine Literale), AT-016-7 (Währung us→USD/uk→GBP/eu→EUR deklarativ). FM-06.
  **VR-OQ002-PRICES:** finale Zahlen operator-owned (OQ-002, launch-blocking); Mechanismus mit Platzhalter-Zahlen
  getestet (code-not-blocking). RL-STRIPE bleibt RED (nur gestubbtes Stripe).
- **Parallelisierbar:** ja (server-Dateien + `region.ts`; disjunkt zu T-501, sofern `catalog.ts`-Währungsabbildung
  nach T-101/T-103 serialisiert — daher: parallel zu T-501, aber nach Iteration 1 auf `catalog.ts`).

---

## Iteration 6 — Farb-Tokens

Begründung: Isolierter Token-/Quell-Scan-Pass, unabhängig von Struktur. Bewusst spät, damit alle
neuen UI-Flächen (Mega-Menü, Cards, Hub, Promo-Bar) bereits existieren und mit-erfasst werden.

### T-601 — Ink Black dominant; Terracotta ersetzt NUR orange/gold; kein globaler Hauptakzent
- **REQ:** REQ-017
- **Abhängigkeiten:** T-203, T-302, T-305, T-204 (alle neuen UI-Flächen existieren)
- **Dateien:** `src/lib/tokens.ts`, plus Token-Referenzen in betroffenen Komponenten (`src/components/**`, `src/index.css`)
- **Akzeptanz (grün):** AT-017-1 (`tokens.ts`: kein UI-Token mit orange/gold-Hex; `accent` = Terracotta-Ton
  z.B. `#C0492E`), AT-017-2 (`src/`-Scan: keine hartkodierten orange/gold-Hex in UI-Inline-Styles/Tailwind;
  AUSNAHME Frame-Holz-`#B98A5E` in `bazi.ts` = physische Rahmenfarbe, kein UI-Akzent), AT-017-3 (Ink dominant,
  Terracotta nur begrenzt als Akzent). FM-09.
- **Parallelisierbar:** nein (Querschnitts-Scan über viele Dateien; muss nach allen UI-Iterationen laufen).

---

## Iteration 7 — REQ-002 INKREMENTELL (Above-Fold-Re-Ordnung) · value-risk · MERGE-GATED

Begründung: ALLEIN und VORLETZT, weil value-risk + doppelt merge-gated. Das Event-Readout (Merge-Gate b)
ist eine EIGENE Aufgabe VOR dem Re-Order-Merge. Der Re-Order selbst darf den Hero (DOM-Index-0) nicht
verschieben und das untere Band nicht mit-resequenzieren.

### T-701 — Event-Readout instrumentieren (Merge-Gate b) — VOR dem Re-Order-Merge
- **REQ:** REQ-002 (Merge-Gate b)
- **Abhängigkeiten:** T-201 (Nav/CTAs existieren), T-302 (Slider/Cards), T-104 (PDP-Views), T-105 (Add-to-Cart)
- **Dateien:** neues leichtes Event-Modul (z.B. `src/lib/analytics.ts`), `src/pages/Home.tsx`, `src/components/shop/ProductCard.tsx`, `src/components/shop/ShopByWorldSection.tsx`, `src/pages/ProductView.tsx`, `src/store/ShopStore.tsx`
- **Akzeptanz (grün):** AT-002-5 (`[fake-only/RED]`: messbare Events Hero-CTA-Klick, Bestseller-Slider-Klick,
  Kategorie-Banner-Klick, PDP-View, Add-to-Cart instrumentiert). **BLK-EVENT-READOUT** wird hierdurch aufgelöst.
  Bleibt RL-EVENT RED, bis es in echter Umgebung Daten liest — markiert REQ-002 weiter value-risk.
- **Parallelisierbar:** nein (Querschnitt; muss vor T-702 stehen).

### T-702 — Above-Fold-Re-Ordnung: Hero → Bestseller-Slider → Kategorie-Banner (unteres Band unverändert)
- **REQ:** REQ-002 (inkrementell)
- **Abhängigkeiten:** T-701, T-302, T-303 (Slider/Cards stehen), T-204 (Promo-Bar stört Hero-Index-0 nicht)
- **Dateien:** `src/pages/Home.tsx` (nur Above-Fold-Band Modul 03/04 umordnen + `data-band="above-fold"`-Anker)
- **Akzeptanz (grün):** AT-002-1 (Above-Fold-DOM-Reihenfolge exakt `[Hero, Bestseller-Slider, Kategorie-Banner]`;
  Bestseller VOR Kategorie-Banner — Ist V2: `03 ShopByWorld → 04 Catalog`, also Reihenfolge-Tausch),
  AT-002-2 (unteres Band behält V2-Reihenfolge — KEINE 13-Modul-Resequenz, negativer Beweis), AT-002-3 (Hero bleibt
  DOM-Index-0). AT-002-4 PLANNED (**BLK-CHROMIUM** = Merge-Gate a: Playwright home-module-order+mega-menu+mobile+LCP
  GRÜN im echten Browser). FM-02, FM-17. AT-001-1/2/3 (Hero unverändert, `lazy`+`Suspense` erhalten) — FM-01.
- **Merge-Gate (eingefroren):** Merge NUR nach (a) BLK-CHROMIUM aufgelöst (Playwright real-browser grün) UND
  (b) BLK-EVENT-READOUT aufgelöst (T-701). Bis dahin `value-risk` + gate-held. VCHK: grüner DOM-Order-Test
  beweist NICHT den Kundenwert — kein Test markiert REQ-002 als aligned/erledigt.
- **Parallelisierbar:** nein (teilt `Home.tsx`; ist letzter Build-Schritt vor FINALIZE).

---

## Iteration 8 — FINALIZE (QA-/Reality-Ledger-Meta + Evidenz)

Begründung: Abschluss-Pass, der die Delta-Evidenz konsolidiert und sicherstellt, dass nichts
fälschlich als production-verified markiert ist (CAN-032). Hängt an allen vorherigen Iterationen.

### T-801 — Mobile-Real-Browser-Playwright-Specs erweitern/markieren (authored, PLANNED bis Chromium)
- **REQ:** REQ-001 (Mobile), REQ-011, REQ-012, REQ-013, REQ-002 (Merge-Gate a)
- **Abhängigkeiten:** T-401, T-402, T-403, T-702
- **Dateien:** `tests/e2e/home-module-order.spec.ts`, `tests/e2e/mega-menu.spec.ts`, neue `tests/e2e/mobile-*.spec.ts`, `playwright.config.ts`
- **Akzeptanz (grün/PLANNED):** AT-001-4, AT-002-4, AT-004-4, AT-011-3, AT-012-3, AT-013-4 als
  `[REAL-BROWSER-PLANNED]` authored + skippable, damit Kern-Suite hermetisch grün bleibt. **BLK-CHROMIUM**
  bleibt PLANNED — diese Specs erfüllen REQ-002-Merge-Gate (a) erst in echter Umgebung.
- **Parallelisierbar:** ja (eigene E2E-Dateien, sobald die zugehörigen UI-Aufgaben stehen).

### T-802 — QA-Meta-Scan: kein REQ production-verified ohne Boundary-Beweis; jeder RED/PLANNED benannt
- **REQ:** REQ-020
- **Abhängigkeiten:** alle vorherigen (T-101..T-801)
- **Dateien:** `tests/` (neuer Meta-Scan-Test, z.B. `tests/unit/delta-reality-ledger.test.ts`), `docs/reality/…`
- **Akzeptanz (grün):** AT-020-1 (kein Delta-Test/-Doc markiert REQ als production-verified ohne realen Beweis —
  jedes Vorkommen Negation/Disclaimer), AT-020-2 (jeder fake-only/PLANNED-Pfad — Stripe, Playwright,
  Autocomplete-Quelle, BaZi-Mathe — als RED/PLANNED im Test-Header markiert), AT-020-3 (pro Delta-REQ ≥1
  lauffähiger jsdom/integration/scan-Test ODER explizit benannter Blocker). FM-18.
- **Parallelisierbar:** nein (Abschluss-Gate über die gesamte Suite).

---

## Abhängigkeits-Übersicht (kritischer Pfad)

```
T-101 (Daten-Cleanup)
  ├─ T-102 (Personalisierungsflags) ─ T-104 (PDP-Gating) ─ T-304 (PDP-Inventar)
  │                                  └ T-105 (Cart-Gating)
  ├─ T-103 (TCM/Wuxing-Welten) ── T-201 (Nav) ── T-202 (Header) ── T-203 (Mega-Menü)
  │                                            └ T-204 (Promo-Bar) ── T-502 (Pricing)
  │                                            └ T-501 (ES-Locale)
  │                              └ T-302 (Cards) ── T-303 (Collection) ── T-702 (Re-Order)
  │                              └ T-305 (Sale-Hub)
  └─ T-301 (Trust-Cleanup) ── T-306 (Newsletter/SEO)
T-402 (Sticky-Preview) ── T-403 (DOB/TOB+Autocomplete) · T-404 (Palette)
T-401 (Mobile-Header)
T-601 (Farb-Tokens — nach allen UI-Flächen)
T-701 (Event-Readout) ── T-702 (Above-Fold-Re-Order, MERGE-GATED)
T-801 (Playwright PLANNED) · T-802 (QA-Meta-Gate)
```

**Kritischer Pfad:** T-101 → T-103 → T-201 → T-302 → T-303 → T-701 → T-702 → T-801 → T-802.

## Offene Blocker (sichtbar getragen, nicht still aufgelöst)

- **BLK-CHROMIUM** (RL-CHROMIUM): Playwright real-browser PLANNED — REQ-002-Merge-Gate (a). T-801/T-702.
- **BLK-EVENT-READOUT** (RL-EVENT): Event-Instrumentierung — REQ-002-Merge-Gate (b). T-701.
- **BLK-OQ003-AUTOCOMPLETE-SOURCE** (RL-OQ003): gebündelte Cities-JSON entscheiden (code-blocking). T-403.
- **BLK-ES-CONTENT:** vollständige ES-Übersetzung (Key-Parität). T-501.
- **BLK-DELTA-DATA:** `data-band="above-fold"`, Hub-Route, 8er-Nav, Terracotta-Token, 5er-Palette,
  asset-light-`data-placeholder` — vom Coder zu wiren (Tests vorab RED). Über Iterationen 1–7 verteilt.
- **RED-Carry (bleibt RED):** RL-BAZI, RL-STRIPE, RL-IMAGES (OQ-001), RL-PRICES (OQ-002).
