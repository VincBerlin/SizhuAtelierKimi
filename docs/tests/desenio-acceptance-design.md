# Akzeptanz- & E2E-Testdesign — SizhuAtelier Desenio Delta

Status: Phase-1 TEST-DESIGN (vor jedem Coder, unabhängig & black-box)
Branch: `feat/desenio-delta` · Delta auf deployter V2 (`6b0882e`)
Feature-Slug: `sizhuatelier-desenio-delta-architecture`
Quelle (FROZEN): PRD / Canvas / Vision / Traceability (alle vier gelesen) + `docs/architecture/current-architecture.md`
Mode: CORE-manual · nichts production-verified · alle Reality-Ledger-Zeilen RED bis realer Boundary-Beweis

> Dies ist ein **Vertrag**, kein Code. Jeder Test ist aus dem eingefrorenen Delta-Spec abgeleitet,
> NICHT aus einer Implementierung. Die Test-Infra (Vitest jsdom+node, supertest, Playwright-Config,
> `tests/`) existiert aus V2 — sie wird WIEDERVERWENDET, nicht neu gebaut. Der InkWave-Hero ist
> UNVERÄNDERT (REQ-001). Die V2-Tests verwenden teils ALTE REQ-Nummern (REQ-008 = Home-Order,
> REQ-009 = Mega-Menü, REQ-001/002 = Money-Path); dieses Dokument adressiert ausschließlich die
> **Delta-REQ-IDs REQ-001..REQ-025** der eingefrorenen PRD/Traceability.

---

## 0. Evidenz-Klassen & Reality-Ledger (gilt für jeden Test unten)

| Klasse | Bedeutung | Im Run grün möglich? |
|---|---|---|
| `[REAL-BOUNDARY-jsdom]` | Render durch den **echten** `src/App.tsx` Composition-Root (MemoryRouter), DOM-Assertion | ja |
| `[INTEGRATION]` | supertest gegen die **echte** `/api/checkout`-Route (`createApp`), Stripe gestubt | ja |
| `[SHIPPED-SCAN]` | Scan über die **ausgelieferten** Module (`translations`, `catalog.ts`, `tokens.ts`) — gleiche Modul-Instanz, die die App rendert | ja |
| `[REAL-BROWSER-PLANNED]` | Playwright-Spec, echter Browser — **authored, im Sandbox PLANNED** (kein Chromium). Das ist exakt das REQ-002-Merge-Gate. | NEIN (PLANNED) — siehe Blocker |
| `[fake-only / RED]` | Berührt I/O/Remote/UI, bleibt nur gegen Fake bewiesen → RED trotz grün | nein → bleibt RED |

**RED-Carry (eingefroren, nicht still auflösbar):** BaZi-Platzhalter (`bazi.ts`, `computeChart` ignoriert
Ort/Zeit für die Mathematik), Bilder-Platzhalter (OQ-001), Preise-Platzhalter (OQ-002), Stripe nur
integration-fake (`BLK-STRIPE-REAL`), Mobile/LCP echter-Browser ungelaufen (`[REAL-BROWSER-PLANNED]`).

**Boundary-Gate-Klassifikation pro REQ** (entscheidet, ob eine Gegenthese geschuldet ist):
`pure` = reine In-Process-Logik (Scan/Datenmodell) → KEINE Wiring-/Reality-Flagge erfinden.
`boundary` = Routing/Nav/Render-Komposition, Server-I/O, UI-im-Browser → Gegenthese + killender Reality-Test.

---

## 1. REQ-Matrix mit Kritischer Semantischer Glättung (THESE → GEGENTHESE → SCHÄRFUNG)

Pro REQ: einmal je Top-Level-Feature, ≤1 Zeile je Beat, dann die konkreten Test-Verträge (Black-Box).

---

### REQ-001 — InkWave-Hero unverändert an Position 02 (nur Mobile-Abschneide-Fix)
- **Boundary-Gate:** boundary (Render-Komposition + UI).
- **THESE:** Der Hero rendert als erstes Home-Modul (02).
- **GEGENTHESE:** Hero ist „da", aber das Re-Ordering/Perf-Refactor hat den Lazy-/Suspense-Split der
  Three.js-InkWave aufgelöst oder das Hero-Konzept ersetzt → REQ-001/NFR-002 verraten, obwohl Position stimmt.
- **SCHÄRFUNG:** Render durch echtes `App.tsx`; Hero ist DOM-Index-0 unter `<main>` UND `Home.tsx`-Quelle
  behält `lazy(() => import('…InkWave'))` + `<Suspense>` + KEIN top-level `import InkWave from`.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-001-1 | `[REAL-BOUNDARY-jsdom]` | `home-module-02` ist das erste `[data-module]` unter `<main>` (DOM-Index 0). |
| AT-001-2 | `[REAL-BOUNDARY-jsdom]` | Hero-Sektion enthält genau eine nicht-leere `<h1>` (echter Hero, kein Stub). |
| AT-001-3 | `[SHIPPED-SCAN]` | `Home.tsx`-Quelle matcht `lazy(()=>import(/InkWave/))`, enthält `<Suspense`, enthält `<InkWave`, NICHT `^import InkWave from`. |
| AT-001-4 | `[REAL-BROWSER-PLANNED]` | Playwright: Hero auf 360/390/430 px nicht abgeschnitten; reduced-motion-Lauf rendert; LCP-Baseline-Guard. → **PLANNED-Blocker BLK-CHROMIUM**. |

---

### REQ-002 — INKREMENTELLE Above-Fold-Re-Ordnung (value-risk + merge-gated)
- **Boundary-Gate:** boundary (Home-Render-Reihenfolge im echten App.tsx) **+ explizite Merge-Gate-Blocker**.
- **THESE:** Das Above-Fold-Band ist neu angeordnet: Hero → Bestseller-Slider → Kategorie-Banner.
- **GEGENTHESE:** Die Reihenfolge ist grün im jsdom, aber (a) im echten Browser nie verifiziert (LCP/Mobile),
  und (b) die Prämisse „Reihenfolge hebt Conversion" bleibt unbewiesen, weil KEIN Event-Readout existiert →
  rein kosmetische Umordnung ohne nachweisbaren Kundenwert. Außerdem Risiko: das **untere Band** wird
  versehentlich mit-umsortiert (Scope-Verstoß: nur Above-Fold erlaubt).
- **SCHÄRFUNG:** (1) jsdom-DOM-Order-Test des Above-Fold-Bands gegen die exakte Zielsequenz; (2) jsdom-Test,
  dass das **untere Band auf der aktuellen V2-Reihenfolge bleibt** (kein voller 13-Modul-Resequenz);
  (3) zwei benannte MERGE-GATE-Blocker, die ohne echten Browser + Event-Readout NICHT grün werden.

> **Ist-Befund (Realität, gegen die getestet wird):** Aktuelle V2-Home-Order ist
> `02 Hero → 03 ShopByWorld(Kategorie-Banner) → 04 Catalog(Bestseller/Featured) → …`.
> Die Above-Fold-Zielsequenz verlangt **Hero → Bestseller-Slider → Kategorie-Banner**, d.h. Bestseller
> MUSS VOR die Kategorie-Banner. Das ist eine echte, falsifizierbare Reihenfolge-Änderung an Modul 03/04.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-002-1 | `[REAL-BOUNDARY-jsdom]` | Above-Fold-Band in DOM-Reihenfolge ist exakt `[Hero, Bestseller-Slider, Kategorie-Banner]` (über stabile `data-module`/`data-band="above-fold"`-Anker); Bestseller-Slider steht VOR den Kategorie-Bannern. |
| AT-002-2 | `[REAL-BOUNDARY-jsdom]` | Das **untere Band** (Editorial/SEO/Newsletter) behält die aktuelle V2-Reihenfolge — die volle 13-Modul-Resequenz ist NICHT umgesetzt (negativer Beweis: untere Modul-IDs in unveränderter relativer Folge). |
| AT-002-3 | `[REAL-BOUNDARY-jsdom]` | Der Hero bleibt trotz Re-Order DOM-Index-0 (Kopplung an AT-001-1; Re-Order darf Hero nicht verschieben). |
| AT-002-4 | `[REAL-BROWSER-PLANNED]` | **MERGE-GATE (a):** Playwright home-module-order + mega-menu + mobile 360/390/430 + LCP GRÜN im echten Browser. → **PLANNED-Blocker BLK-CHROMIUM = REQ-002-Merge-Gate (a)**. |
| AT-002-5 | `[fake-only / RED]` | **MERGE-GATE (b):** Basis-Event-Readout instrumentiert — messbare Events Hero-CTA-Klick, Bestseller-Slider-Klick, Kategorie-Banner-Klick, PDP-View, Add-to-Cart. → **Blocker BLK-EVENT-READOUT**; bis dahin bleibt REQ-002 `value-risk` + gate-held. |

> **VCHK-Kundenwert:** Ein grüner DOM-Order-Test allein beweist NICHT, dass die Umordnung Kunden besser
> führt (das ist die unbewiesene Prämisse). Wert wird erst durch das Event-Readout (AT-002-5) messbar.
> Daher bleibt REQ-002 explizit `value-risk` — kein Test darf ihn als „aligned/erledigt" markieren.

---

### REQ-003 — Shop-orientierte Hauptnavigation, exakte Primärliste; FAQ/About/Contact/Blog raus
- **Boundary-Gate:** boundary (echte Navbar im App.tsx-Render).
- **THESE:** Die primäre Nav enthält genau: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote, Poster Sets, Inspiration.
- **GEGENTHESE:** Die Einträge existieren als Komponenten-Config, sind aber nicht in die echte Navbar gerendert;
  oder FAQ/About/Contact/Blog stehen weiter sichtbar in der Primär-Nav (V2 hat `NAV_LINKS` mit blog/faq/about/contact!).
- **SCHÄRFUNG:** Render echtes `App.tsx`; lese `[data-nav-top]`-Texte/Hrefs aus der echten `primary-nav`;
  assert exakte Soll-Liste UND negative Abwesenheit von FAQ/About/Contact/Blog in der Primär-Nav.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-003-1 | `[REAL-BOUNDARY-jsdom]` | Aus `primary-nav` gelesene Top-Level-Einträge enthalten exakt die 8 Soll-Labels (i18n-Key-basiert, nicht hartkodierter Text), in der Spec-Reihenfolge. |
| AT-003-2 | `[REAL-BOUNDARY-jsdom]` | **Negativ:** Kein Primär-Nav-Eintrag verlinkt auf `/faq`, `/about`, `/contact`, `/blog` (FAQ/About/Contact/Blog NICHT in Primär-Nav). |
| AT-003-3 | `[REAL-BOUNDARY-jsdom]` | Jeder der 8 Einträge hat einen `href` auf eine existierende Route (`/collections/<slug>` bzw. `/inspiration`/`/personalize`/Angebots-Hub) — kein dead link. |
| AT-003-4 | `[SHIPPED-SCAN]` | i18n-Keys für alle 8 Nav-Labels existieren in EN/DE/FR/ES (Kopplung REQ-015). |

---

### REQ-004 — Mega-Menü: Textspalten + ≥2–3 Poster-/Promo-Kacheln (Titel/CTA/Link je Kachel), ASSET-LIGHT
- **Boundary-Gate:** boundary (echtes Mega-Menü im App.tsx) + Content-Dependency OQ-001.
- **THESE:** Jedes relevante Mega-Menü zeigt Textspalten plus ≥2–3 Kacheln, jede mit Titel + CTA + Ziel-Link.
- **GEGENTHESE:** Kacheln existieren, aber das Bildfeld zeigt ein **Platzhalterbild, das wie ein echtes
  Produktbild wirkt** (verstößt gegen CAN-014/RISK-001) — Kunde glaubt, das sei das fertige Produkt; oder
  eine Kachel hat keinen Ziel-Link/CTA (toter Klick).
- **SCHÄRFUNG:** Render echtes App.tsx, öffne Mega-Menü; assert ≥2 Kacheln je relevanter Spalte mit
  nicht-leerem Titel + CTA-Text + gültigem `href`; UND Platzhalter ist als asset-light markiert
  (`data-placeholder="true"` o.ä.) und trägt KEIN `<img src>` auf ein „echtes Produktbild".

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-004-1 | `[REAL-BOUNDARY-jsdom]` | Mega-Menü öffnet aus echtem Navbar-Trigger; relevante Spalten (Poster/TCM/Wuxing) zeigen je ≥2 Kacheln. |
| AT-004-2 | `[REAL-BOUNDARY-jsdom]` | Jede Kachel hat nicht-leeren Titel, einen CTA und ein `href` auf eine echte `/collections/*`- oder Produkt-Route. |
| AT-004-3 | `[REAL-BOUNDARY-jsdom]` | **Asset-light-Beweis:** Kachel-Bildfeld ist als generischer Platzhalter markiert (`data-placeholder`) und rendert KEIN `<img>` mit `/images/…webp`-Produktbild; Platzhalter wirkt nicht wie echtes Produktbild. |
| AT-004-4 | `[REAL-BROWSER-PLANNED]` | Playwright: Mega-Menü Hover/Tap, Kacheln klickbar → navigiert. → **PLANNED BLK-CHROMIUM**. |

> **VCHK:** Kundenwert „visuell geführt" ist im Run bewusst asset-light; echte Bilder erst nach OQ-001.
> `value-risk` Eintrag: **VR-OQ001-IMAGES** (Bild-Endabnahme launch-blocking, nicht in diesem Run).

---

### REQ-005 — Saju-/Junishi-Reste vollständig entfernt
- **Boundary-Gate:** `pure` (Scan über ausgelieferte Daten) + ein Render-Negativtest (boundary).
- **THESE:** Keine Saju/Junishi in Nav, Filter, Collections, SEO, PDPs, Personalisierung, Cross-Sells.
- **GEGENTHESE:** Scan über Demo-Strings statt über die **ausgelieferten** Module → grün, obwohl die
  gerenderte UI weiter Saju/Junishi zeigt.
- **SCHÄRFUNG:** Scan läuft über die importierten `translations`/`catalog.ts`/`collections.ts`-Instanzen
  (gleiche Daten, die die App rendert) UND ein Render-Negativtest über `<main>` der echten Home.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-005-1 | `[SHIPPED-SCAN]` | Rekursiver String-Scan über `translations[EN/DE/FR/ES]` enthält kein `/saju|junishi/i`. |
| AT-005-2 | `[SHIPPED-SCAN]` | Scan über `catalog.ts` (Titel, Bullets, Artikel, FAQs) + `collections.ts` (`COLLECTION_CONFIGS`) enthält kein `/saju|junishi/i`. |
| AT-005-3 | `[REAL-BOUNDARY-jsdom]` | Gerenderte Home-`<main>` (echtes App.tsx) und gerenderte Collection-Templates enthalten kein `/saju|junishi/i`. |
| AT-005-4 | `[SHIPPED-SCAN]` | Keine Route/Slug/`product_world`/Filter-Enum heißt saju/junishi (kein versteckter Kaufpfad). |

---

### REQ-006 — TCM & Wuxing als eigene sichtbare Produktwelten (echte Produkteinheiten), ASSET-LIGHT
- **Boundary-Gate:** boundary (Render der Collections) + Content-Dependency OQ-001.
- **THESE:** TCM/Wuxing erscheinen als echte Produkteinheiten mit Titel + Preis + CTA (nicht nur Textliste).
- **GEGENTHESE:** Sie erscheinen als reine Textliste (kein Preis/CTA) ODER ihr Platzhalterbild wirkt wie ein
  echtes Produktbild (CAN-014-Verstoß); Kunde kann nicht in den Kaufpfad eintreten.
- **SCHÄRFUNG:** Render echte `/collections/tcm-posters` + `/collections/wuxing-posters`; assert je Produktkarte
  Titel + Preis + CTA; Platzhalter-Bildfeld asset-light markiert (kein „echtes Produktbild").

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-006-1 | `[REAL-BOUNDARY-jsdom]` | `/collections/tcm-posters` rendert ≥1 Produktkarte mit nicht-leerem Titel, sichtbarem Preis und CTA-Link. |
| AT-006-2 | `[REAL-BOUNDARY-jsdom]` | `/collections/wuxing-posters` ebenso (Titel + Preis + CTA). |
| AT-006-3 | `[SHIPPED-SCAN]` | `catalog.ts`: ≥1 Produkt mit `product_world==='tcm'` UND ≥1 mit `'wuxing'`, jeweils mit `price` > 0. |
| AT-006-4 | `[REAL-BOUNDARY-jsdom]` | **Asset-light:** Produktkarten-Bildfeld als Platzhalter markiert; kein Render, das wie ein echtes Produktfoto wirkt. |

---

### REQ-007 / REQ-025 — Personalisierung NUR für BaZi; TCM/Wuxing/Fire Horse zeigen KEINE
- **Boundary-Gate:** boundary (PDP-Render via App.tsx).
- **THESE:** Nur BaZi-PDPs zeigen Personalisierung; TCM/Wuxing/Fire Horse zeigen keine Geburtsdatenfelder,
  keine Chart-Vorschau, keinen Personalisieren-CTA, keine Birth-Data-Hinweise.
- **GEGENTHESE:** Fire Horse hat `personalization_level: 'yearly'` im Katalog — eine Implementierung könnte
  „yearly" fälschlich als „personalisierbar" lesen und Geburtsdatenfelder/Personalisieren-CTA zeigen (REQ-007-Verstoß),
  obwohl `personalizable: false` gilt. Das ist die load-bearing Falle.
- **SCHÄRFUNG:** Render die echte PDP je Produkttyp; assert für BaZi: Personalisierung sichtbar; für
  TCM/Wuxing/Fire-Horse: KEIN Geburtsdatenfeld, KEINE Chart-Vorschau, KEIN Personalisieren-CTA.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-007-1 | `[REAL-BOUNDARY-jsdom]` | BaZi-PDP (`personalizable !== false`) rendert Konfigurator/Personalisieren-CTA + Birth-Felder. |
| AT-007-2 | `[REAL-BOUNDARY-jsdom]` | TCM-PDP rendert KEINE Birth-Date/Time/Place-Felder, KEINEN Personalisieren-CTA, KEINE Chart-Vorschau. |
| AT-007-3 | `[REAL-BOUNDARY-jsdom]` | Wuxing-PDP ebenso negativ. |
| AT-007-4 | `[REAL-BOUNDARY-jsdom]` | **Fire-Horse-PDP** (yearly!) rendert KEINE Personalisierung — `personalization_level:'yearly'` ⇏ Birth-Data; nur plain Add-to-Cart. |
| AT-007-5 | `[SHIPPED-SCAN]` | `catalog.ts`: jedes Produkt mit `product_world ∈ {tcm,wuxing}` ODER Fire Horse hat `personalizable === false`; jedes BaZi-Produkt ist personalisierbar. |

---

### REQ-008 — PDP-Template-Inventar + Personalisierungs-Unterscheidung
- **Boundary-Gate:** boundary (PDP-Render) + Review-Block gated OQ-004.
- **THESE:** PDP zeigt Breadcrumb, Galerie, Name, Preis, Varianten, Add-to-Cart, Rahmen-/Zubehör-Optionen,
  Trust-Bullets, Beschreibung, Cross-Sells, Inspiration-Kontext; Review-Bereich NUR bei echten Reviews.
- **GEGENTHESE:** Das Inventar ist „vorhanden", aber der Review-Bereich zeigt erfundene Sterne/Reviews
  (Fake-Social-Proof, REQ-010/NG-004-Verstoß), oder ein Inventarteil fehlt im echten Render.
- **SCHÄRFUNG:** Render echte BaZi- + TCM-PDP; assert jeden Inventar-Baustein per stabilem Testid;
  assert: KEIN Review-Block sichtbar, solange `reviewsEnabled`-Flag/echte-Reviews fehlen.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-008-1 | `[REAL-BOUNDARY-jsdom]` | BaZi-PDP enthält: Breadcrumb, Galerie, Name, Preis, Varianten, Add-to-Cart, Rahmen/Zubehör, Trust-Bullets, Beschreibung, Cross-Sells, Inspiration-Kontext (je stabiler Anker). |
| AT-008-2 | `[REAL-BOUNDARY-jsdom]` | Personalisierungs-Unterscheidung: BaZi zeigt Personalisierung, TCM/Wuxing/Fire-Horse nicht (Kopplung REQ-007). |
| AT-008-3 | `[REAL-BOUNDARY-jsdom]` | **Negativ Review-Gate:** Solange keine echten Reviews vorliegen, rendert KEIN Review-Bereich und KEINE Sterne/Review-Summen auf der PDP. |
| AT-008-4 | `[SHIPPED-SCAN]` | Keine erfundene Review-Zahl/Sternsumme in `catalog.ts`/`translations` als sichtbarer Social-Proof-String (Kopplung REQ-010). |

---

### REQ-009 — Collection-Template-Inventar (Breadcrumb..Footer)
- **Boundary-Gate:** boundary (Collection-Render via App.tsx).
- **THESE:** Collection zeigt Breadcrumb, Zurück-Nav, H1, Intro, Kategorievisual, Toolbar, Filter, Sortierung,
  Produktgrid, Produktanzahl, Pagination/Mehr-zeigen, SEO-Text, Trust, Footer.
- **GEGENTHESE:** Das Template existiert als Komponente, ist aber nicht für jeden der 8 Slugs gewired, oder die
  Produktanzahl/Filter sind statische Attrappen ohne Bezug zum gerenderten Grid.
- **SCHÄRFUNG:** Render echte `/collections/<slug>`; assert jeden Inventar-Baustein; Produktanzahl == Zahl der
  tatsächlich gerenderten Karten (kein Attrappen-Zähler).

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-009-1 | `[REAL-BOUNDARY-jsdom]` | `/collections/bazi-posters` rendert alle Inventar-Bausteine (Breadcrumb, Zurück, H1, Intro, Visual, Toolbar, Filter, Sort, Grid, Anzahl, Pagination/Mehr, SEO, Trust, Footer). |
| AT-009-2 | `[REAL-BOUNDARY-jsdom]` | Angezeigte Produktanzahl == Anzahl gerenderter Produktkarten (konsistent, keine Attrappe). |
| AT-009-3 | `[SHIPPED-SCAN]` | `COLLECTION_SLUGS` deckt alle 8 MVP-Slugs ab; jeder Slug hat eine Config (Eyebrow/Title/Intro/SEO). |
| AT-009-4 | `[REAL-BOUNDARY-jsdom]` | Filter/Sort verändern das gerenderte Grid nachvollziehbar (mind. ein Filter reduziert/ordnet die Karten). |

---

### REQ-010 — Coming Soon / Patron Fold / Credit-System / Fake Reviews / sichtbare Platzhalter entfernt
- **Boundary-Gate:** `pure` (Scan über ausgelieferte Daten) + Render-Negativtest (boundary).
- **THESE:** Keine Fake-Reviews, keine Credit-UI, kein „Coming Soon", kein „Patron Fold", keine produktiv
  sichtbaren Platzhalter in der Shop-UI.
- **GEGENTHESE:** Strings sind aus `translations` entfernt, aber eine Komponente rendert sie noch hartkodiert;
  oder „Credits earned" lebt weiter im Cart-Code (Ist: `ProductView` setzt `creditsEarned`!).
- **SCHÄRFUNG:** Scan über ausgelieferte `translations`/`catalog.ts` auf verbotene Strings; UND Render-Scan
  über echte Home-`<main>` + CartDrawer auf „Coming Soon/Patron/Credit/★ Fake-Review-Summen".

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-010-1 | `[SHIPPED-SCAN]` | `translations[EN/DE/FR/ES]` enthält keine `/coming soon|patron|credits?|guthaben/i`-Kaufpfad-Strings (außer dokumentierten Negationen/Disclaimern). |
| AT-010-2 | `[REAL-BOUNDARY-jsdom]` | Gerenderte Home-`<main>` zeigt keinen „Coming Soon"-/„Patron Fold"-/Credit-Block und keine erfundenen Sternbewertungen. |
| AT-010-3 | `[REAL-BOUNDARY-jsdom]` | CartDrawer zeigt keine „Credits earned/Guthaben"-Zeile als sichtbare UI (Credit-System nicht eingeführt, NG-003). |
| AT-010-4 | `[SHIPPED-SCAN]` | Keine numerische Fake-Review-Summe (`reviews`/`rating`) wird als sichtbarer Social-Proof gerendert, solange OQ-004 offen ist. |

---

### REQ-011 / REQ-022 — Mobile Header/Hero-CTA/Suche/Cart-Icon/Badge vollständig sichtbar (360/390/430)
- **Boundary-Gate:** boundary (UI-Geometrie — nur im echten Browser final beweisbar).
- **THESE:** Bei 360/390/430 px sind Header (Hamburger, Logo, Suche, Cart, Sprachzugang), Hero-CTAs und
  Cart-Badge vollständig sichtbar und bedienbar; nichts abgeschnitten; kein horizontales Scrollen.
- **GEGENTHESE:** jsdom hat kein Layout-Engine → ein jsdom-„grün" beweist NICHT, dass nichts abgeschnitten ist;
  die echte Abschneide-Prüfung braucht einen echten Browser (genau der RED-Carry mobile/LCP).
- **SCHÄRFUNG:** jsdom prüft nur **Präsenz + Bedienbarkeit** der Elemente (kein Clipping-Beweis);
  der echte Clipping-/No-Scroll-Beweis ist Playwright `[REAL-BROWSER-PLANNED]` (Merge-Gate).

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-011-1 | `[REAL-BOUNDARY-jsdom]` | Mobile-Header rendert Hamburger, Logo, Suche-Zugang, Cart-Icon, Sprachzugang (alle im DOM, bedienbar). |
| AT-011-2 | `[REAL-BOUNDARY-jsdom]` | Cart-Badge ist mit Item im Cart sichtbar (Badge-Element rendert, nicht display:none). |
| AT-011-3 | `[REAL-BROWSER-PLANNED]` | Playwright 360/390/430: KEIN Element abgeschnitten, `document.scrollingElement.scrollWidth <= clientWidth` (kein H-Scroll), Hero-CTA klickbar. → **PLANNED BLK-CHROMIUM (Merge-Gate REQ-002 (a))**. |
| AT-011-4 | `[REAL-BOUNDARY-jsdom]` | Desktop-Header rendert Logo, Primär-Nav, Suche, Warenkorb, Sprache/Land (Account/Favoriten optional, dürfen fehlen). |

> **VCHK / value-risk VR-MOBILE-UNVERIFIED:** „Mobile abnahmefähig" (GOAL-004) ist NICHT durch jsdom
> beweisbar — bleibt RED bis Playwright im echten Browser läuft. jsdom-Tests dürfen das NICHT als erledigt markieren.

---

### REQ-012 — Mobile BaZi-Konfigurator: sichtbare Sticky Poster Preview ohne Eingabeblockade
- **Boundary-Gate:** boundary (Layout/Sticky — final nur im Browser; jsdom prüft Struktur).
- **THESE:** Die Sticky Poster Preview ist sichtbar/erreichbar und blockiert die Eingabe nicht.
- **GEGENTHESE:** Sticky-Container existiert, ist aber so hoch, dass er auf Mobile die Eingabefelder überdeckt
  (RISK-002) — jsdom sieht das nicht; nur ein echter Viewport-Test zeigt die Blockade.
- **SCHÄRFUNG:** jsdom prüft, dass Preview + Eingabefelder beide im DOM/erreichbar sind und die Preview eine
  Max-Höhen-/Sticky-Regel trägt; echter Blockade-Beweis ist Playwright `[REAL-BROWSER-PLANNED]`.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-012-1 | `[REAL-BOUNDARY-jsdom]` | `/personalize` rendert eine Sticky-Preview-Sektion UND die Eingabefelder gleichzeitig im DOM. |
| AT-012-2 | `[REAL-BOUNDARY-jsdom]` | Preview-Container trägt eine Sticky-Klasse + Max-Höhen-Regel (Quelle/Style enthält `sticky` + `max-h`/maxHeight). |
| AT-012-3 | `[REAL-BROWSER-PLANNED]` | Playwright 360 px: Preview verdeckt kein Eingabefeld (Bounding-Boxes überlappen Felder nicht), Felder bleiben tippbar. → **PLANNED BLK-CHROMIUM**. |

---

### REQ-013 — Mobile getrennte DOB/TOB + Place-of-Birth Autocomplete (DEFAULT: gebündelte Cities-JSON / policy-konform)
- **Boundary-Gate:** boundary (Eingabe-UI) + **OQ-003 code-blocking** (Quelle der Autocomplete).
- **THESE:** DOB und TOB sind getrennte Felder; Place-of-Birth liefert Vorschläge wie „Stuttgart, Germany".
- **GEGENTHESE:** Autocomplete „funktioniert", aber feuert **clientseitig Public-OpenStreetMap-Nominatim per
  Keystroke** (Policy-Verstoß, OQ-003 NICHT-DEFAULT) — grünes UI, aber Compliance-Bruch; ODER DOB/TOB überlappen
  auf Mobile.
- **SCHÄRFUNG:** Quelle/Netz-Scan: KEIN `nominatim.openstreetmap.org`-Fetch im Client-Code pro Keystroke;
  Autocomplete-Quelle ist gebündelte Cities-JSON / policy-konformer Provider; Render: DOB/TOB getrennte Felder,
  „Stuttgart"-Eingabe liefert „Stuttgart, Germany"-Vorschlag aus der gebündelten Quelle.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-013-1 | `[REAL-BOUNDARY-jsdom]` | `/personalize` rendert getrennte Date-of-Birth- und Time-of-Birth-Eingaben (zwei distinkte Felder). |
| AT-013-2 | `[REAL-BOUNDARY-jsdom]` | Eingabe „Stuttgart" im Place-Feld liefert Vorschlag „Stuttgart, Germany" (oder äquiv. „Stadt, Land") aus der gebündelten Quelle. |
| AT-013-3 | `[SHIPPED-SCAN]` | **Policy-Guard:** Client-Quellcode (`src/`) enthält KEIN per-Keystroke `fetch`/`XHR` auf `nominatim.openstreetmap.org`; Autocomplete liest gebündelte Cities-JSON / policy-konformen Provider. → koppelt **BLK-OQ003-AUTOCOMPLETE-SOURCE** (code-blocking offen). |
| AT-013-4 | `[REAL-BROWSER-PLANNED]` | Playwright 360 px: DOB/TOB überlappen nicht; Vorschlagsliste tippbar. → **PLANNED BLK-CHROMIUM**. |

---

### REQ-014 — CartDrawer zeigt Birth-Data-Review NUR bei personalisierten BaZi-Positionen
- **Boundary-Gate:** boundary (Cart-Render via App.tsx + ShopStore).
- **THESE:** Birth-Data-Review erscheint nur bei BaZi-Cart-Zeilen.
- **GEGENTHESE:** Der Review-Hinweis erscheint auch bei einer TCM/Wuxing/Fire-Horse-Zeile (weil die Logik nicht
  am `personalization`-Feld, sondern z.B. an `product_world` oder am Titel hängt) → REQ-014-Verstoß.
- **SCHÄRFUNG:** Lege je eine BaZi- und eine nicht-personalisierte Zeile in den echten ShopStore; öffne
  CartDrawer im echten App.tsx; assert Birth-Review nur an der BaZi-Zeile, nicht an der anderen.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-014-1 | `[REAL-BOUNDARY-jsdom]` | Cart mit einer BaZi-Zeile (mit `personalization`) → Birth-Data-Review-Hinweis sichtbar an dieser Zeile. |
| AT-014-2 | `[REAL-BOUNDARY-jsdom]` | Cart mit einer Fire-Horse/TCM-Zeile (ohne `personalization`) → KEIN Birth-Data-Review-Hinweis an dieser Zeile. |
| AT-014-3 | `[REAL-BOUNDARY-jsdom]` | Gemischter Cart (BaZi + TCM) → Review nur an der BaZi-Zeile (zeilengenaue Gating, nicht global). |

---

### REQ-015 — i18n EN/DE/FR → EN/DE/FR/ES, Kürzel unverändert, Flaggen rechts daneben
- **Boundary-Gate:** boundary (Sprachwahl-UI) + `pure` (Vollständigkeits-Scan über ausgelieferte translations).
- **THESE:** ES ist die 4. Locale, volle UI, Kürzel unverändert, Flagge rechts neben dem Kürzel.
- **GEGENTHESE:** ES ist „hinzugefügt", aber unvollständig — viele Keys fehlen und fallen still auf EN/DE
  zurück (Kunde sieht gemischte Sprache); ODER die ES-Übersetzung dupliziert nur EN (kein echtes Spanisch).
- **SCHÄRFUNG:** Key-Parität: jeder Key, der in EN existiert, existiert auch in ES (gleiche Key-Menge, kein
  Loch); ES-Werte sind nicht identisch mit EN (echte Übersetzung); Render: Sprachwähler zeigt 4 Kürzel + Flagge rechts.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-015-1 | `[SHIPPED-SCAN]` | `translations.ES` existiert; rekursive Key-Menge(ES) == Key-Menge(EN) (keine fehlenden/zusätzlichen Keys → kein stiller EN-Fallback). |
| AT-015-2 | `[SHIPPED-SCAN]` | Stichprobe sichtbarer Keys: ES-Wert ≠ EN-Wert (echtes Spanisch, keine Kopie) für eine Menge nav/announce/product-Keys. |
| AT-015-3 | `[REAL-BOUNDARY-jsdom]` | Sprachwähler im echten Header listet exakt EN/DE/FR/ES; Kürzel unverändert; je Eintrag ein Flaggen-Element rechts neben dem Kürzel (DOM-Ordnung: Kürzel vor Flagge). |
| AT-015-4 | `[REAL-BOUNDARY-jsdom]` | Sprache auf ES schalten → `<html lang="es">` (oder Provider-State `ES`) und sichtbarer UI-String wechselt auf Spanisch. |

> **VCHK / value-risk VR-ES-MACHINE-TRANSLATED:** ES ist maschinell übersetzt (User reviewt). Tests prüfen
> Vollständigkeit/Verschiedenheit, NICHT Übersetzungsqualität → Qualität bleibt offener `value-risk`-Eintrag.

---

### REQ-016 / REQ-021 — Region/Pricing server-autoritativ (USD/GBP/EUR, US/UK Free Shipping) + Utility-/Promo-Bar
- **Boundary-Gate:** boundary (echte `/api/checkout` + Region-Logik) — **server-autoritativ ist die Kernfalle**.
- **THESE:** USA=USD+FreeShip, UK=GBP+FreeShip, EU=EUR+lokale Versandlogik; US/UK-Versand backendseitig
  eingerechnet; Promo-Bar oberhalb des Headers kommuniziert die Region.
- **GEGENTHESE:** Die Region/Free-Shipping wird nur **clientseitig** angezeigt (Promo-Bar-Text), aber der Server
  rechnet anders / lässt sich vom Client-`shippingCents` überstimmen → Preisinkonsistenz/Manipulation (RISK-002/003,
  NFR-004-Verstoß), obwohl die Bar „Free Shipping" sagt.
- **SCHÄRFUNG:** supertest gegen die **echte** `/api/checkout`: Client-`shippingCents`/`unitAmount` werden
  ignoriert; US/UK → keine Shipping-Zeile (free), EU < Schwelle → 490 Versandzeile, EU ≥ Schwelle → free;
  Promo-Bar-Render zeigt regionkonsistente Kommunikation (oberhalb des Headers).

| Test-ID | Klasse | Boundary | Vertrag (Assertion) |
|---|---|---|---|
| AT-016-1 | `[INTEGRATION]` | `/api/checkout` | `cf-ipcountry: US`, `shippingCents: 9999` → keine Shipping-Zeile (free); Client-Wert ignoriert. |
| AT-016-2 | `[INTEGRATION]` | `/api/checkout` | `cf-ipcountry: GB` → keine Shipping-Zeile (free). |
| AT-016-3 | `[INTEGRATION]` | `/api/checkout` | `cf-ipcountry: DE`, Subtotal < Schwelle, `shippingCents: 0` → Server-Shipping 490 vorhanden (Client-0 ignoriert). |
| AT-016-4 | `[INTEGRATION]` | `/api/checkout` | `cf-ipcountry: DE`, Subtotal ≥ `FREE_SHIP_THRESHOLD` → keine Shipping-Zeile (free); `shippingCents:9999` ignoriert. |
| AT-016-5 | `[INTEGRATION]` | `pricing.js` | `computeShippingCents`: us/uk→0 unabhängig vom Subtotal; eu/other free ≥ Schwelle, sonst 490 (Parität gegen `FREE_SHIP_THRESHOLD`, keine Literale). |
| AT-016-6 | `[REAL-BOUNDARY-jsdom]` | App-Shell | Utility-/Promo-Bar (`AnnouncementBar`) rendert **oberhalb** der Navbar im DOM (Index vor `primary-nav`); zeigt für us/uk Free-Shipping direkt, für eu lokale Versandlogik (regionabhängiger i18n-Text). |
| AT-016-7 | `[SHIPPED-SCAN]` | catalog/region | Währungsabbildung us→USD, uk→GBP, eu→EUR ist deklarativ vorhanden (kein hartkodiertes „€" über alle Regionen). |

> **value-risk VR-OQ002-PRICES:** Finale Live-Zahlen sind operator-owned (OQ-002, launch-blocking). Mechanismus
> wird mit Platzhalter-Zahlen gebaut+getestet (code-not-blocking). Tests beweisen den **Mechanismus**, nicht die finalen Preise.

---

### REQ-017 — Farbregeln: Ink Black dominant; Terracotta ersetzt NUR orange/gold; kein globaler Hauptakzent
- **Boundary-Gate:** `pure` (Token-/Quell-Scan).
- **THESE:** Ink Black bleibt dominante UI-/CTA-Farbe; orange/goldene Elemente sind durch Terracotta ersetzt.
- **GEGENTHESE:** Terracotta wird zum globalen Hauptakzent hochgezogen (statt nur orange/gold zu ersetzen) —
  überall Terracotta-Flächen → verstößt gegen „nicht globaler Hauptakzent"; ODER orange/gold-Hex bleibt irgendwo stehen.
- **SCHÄRFUNG:** Token-Scan: kein orange/gold-Hex (`#FFA…`, gold-Töne, V2-`#B98A5E`-Gold) als UI-Token;
  Terracotta-Token vorhanden; Ink/dunkle Farbe bleibt die dominante Text-/CTA-Farbe (Verteilung prüfen).

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-017-1 | `[SHIPPED-SCAN]` | `tokens.ts` (`C`): kein **UI-Token** mit orange/gold-Hex (z.B. `#D4AF37`/`#FFA500`/`#E0A458`-Klasse); `accent` ist ein Terracotta-Ton (Ist: `#C0492E`). |
| AT-017-2 | `[SHIPPED-SCAN]` | Quell-Scan `src/` auf hartkodierte orange/gold-Hex in **UI-Inline-Styles/Tailwind-Klassen** → keine Treffer. **Reachability-Hinweis:** Das Frame-Holz-Hex `#B98A5E` ("Eiche natur") in `bazi.ts` ist eine echte physische Rahmenfarbe (Produktoption), KEIN UI-Akzent — es ist explizit aus diesem Scan auszunehmen, sonst falsch-positiv. |
| AT-017-3 | `[SHIPPED-SCAN]` | Ink/dunkler Ton (`ink`, Ist: `#2A2620`) ist die dominante Text-/CTA-Farbe; Terracotta erscheint nur als Akzent (begrenzte Anzahl Token-Referenzen, nicht global). |

---

### REQ-018 — BaZi-Konfigurator Poster-Hintergrundpalette (5 exakte Hex)
- **Boundary-Gate:** boundary (Konfigurator-UI) + `pure` (Paletten-Definition).
- **THESE:** Exakt diese Palette: Ink #171C20, Graphite #2B3034, Soft Line #70716C, Soft White #F8F4EE, Parchment #EFE5D8.
- **GEGENTHESE:** Die Palette ist definiert, aber der Konfigurator bietet andere/mehr Farben an, oder die Auswahl
  ändert die Poster-Vorschau nicht (toter Swatch).
- **SCHÄRFUNG:** Render echten Konfigurator; assert genau diese 5 Hex als Hintergrund-Swatches; Auswahl ändert
  die Live-Vorschau nachvollziehbar.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-018-1 | `[SHIPPED-SCAN]` | Die definierte Hintergrund-Palette enthält exakt die 5 Hex-Werte (keine zusätzlichen, keine fehlenden). |
| AT-018-2 | `[REAL-BOUNDARY-jsdom]` | Konfigurator rendert genau 5 Hintergrund-Swatches mit diesen Hex. |
| AT-018-3 | `[REAL-BOUNDARY-jsdom]` | Auswahl eines Swatches ändert den Vorschau-Hintergrund nachvollziehbar (State/Style spiegelt den gewählten Hex). |

---

### REQ-019 — Newsletter/SEO gekürzt + kaufpfadfreundlich; störende Bloglinks entfernt/verschoben
- **Boundary-Gate:** boundary (Home-Footer-Render).
- **THESE:** SEO/Newsletter-Bereich ist reduziert; störende Bloglinks unmittelbar unter Angebotszusammenfassungen sind weg.
- **GEGENTHESE:** Der SEO-Text ist nur optisch verkürzt, aber die störenden Bloglinks stehen weiter direkt unter
  den Angebotszusammenfassungen (REQ-019-Verstoß), oder Newsletter macht weiter Präzisions-Overclaim (Kopplung REQ-005-V2).
- **SCHÄRFUNG:** Render echte Home; assert: im SEO/Newsletter-Band keine Blog-Links direkt unter
  Angebotszusammenfassungen (Blog nur in Inspiration/Footer); SEO-Textlänge unter einer Obergrenze.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-019-1 | `[REAL-BOUNDARY-jsdom]` | SEO-Block (`home-module-12`/SeoTextSection) enthält keine `/blog`-Links direkt unter Angebotszusammenfassungen. |
| AT-019-2 | `[REAL-BOUNDARY-jsdom]` | Blog-Links erscheinen nur im Inspiration-/Footer-Kontext, nicht im Kaufpfad-Band. |
| AT-019-3 | `[SHIPPED-SCAN]` | Newsletter-Copy (EN/DE/FR/ES) macht keinen Präzisions-Overclaim (Kopplung an die bestehende Truthful-Claims-Liste). |

---

### REQ-020 — Tests/QA weisen Delta-Änderungen nach; nichts als production-verified markiert
- **Boundary-Gate:** `pure` (Prozess-/Meta-Beweis über die Evidenz-Artefakte).
- **THESE:** Delta-spezifische Testnachweise liegen vor; kein unfertiger Claim ist production-verified.
- **GEGENTHESE:** Ein Test/Doc markiert eine fake-only/PLANNED-Sache fälschlich als „production-verified" oder
  „erledigt" → Reality-Ledger verfälscht (CAN-032-Verstoß).
- **SCHÄRFUNG:** Meta-Scan über die Test-/Evidenz-Artefakte: jedes `production-verified`-Token ist eine Negation;
  jeder RED/PLANNED-Blocker ist als solcher benannt (siehe §3).

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-020-1 | `[SHIPPED-SCAN]` | Kein Delta-Test/-Doc markiert einen REQ als `production-verified` ohne realen Boundary-Beweis (jedes Vorkommen ist Negation/Disclaimer). |
| AT-020-2 | `[SHIPPED-SCAN]` | Jeder fake-only/PLANNED-Pfad (Stripe, Playwright, Autocomplete-Quelle, BaZi-Mathematik) ist im Test-Header als RED/PLANNED markiert. |
| AT-020-3 | `[SHIPPED-SCAN]` | Pro Delta-REQ existiert mindestens ein lauffähiger `[REAL-BOUNDARY-jsdom]`/`[INTEGRATION]`/`[SHIPPED-SCAN]`-Test ODER ein explizit benannter Blocker (kein REQ ohne Evidenz oder Blocker). |

---

### REQ-023 — Product Cards (Bildfeld, optionales Badge, Titel, Kurzclaim, Preis, eindeutiger CTA), ASSET-LIGHT
- **Boundary-Gate:** boundary (Card-Render) + Content-Dependency OQ-001.
- **THESE:** Jede Product Card hat Bildfeld, optionales Badge, Titel, Kurzclaim, Preis, eindeutigen CTA.
- **GEGENTHESE:** Card ist „vollständig", aber das Bildfeld zeigt ein Platzhalterbild, das wie ein echtes
  Produktbild wirkt (CAN-014/RISK-001), oder der CTA ist mehrdeutig/tot.
- **SCHÄRFUNG:** Render eine echte Product Card (im Grid/Slider via App.tsx); assert alle Pflicht-Anatomieteile;
  Bildfeld asset-light markiert; CTA hat eindeutigen `href`.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-023-1 | `[REAL-BOUNDARY-jsdom]` | Gerenderte Product Card enthält Bildfeld, Titel, Kurzclaim, Preis, genau einen eindeutigen CTA-Link. |
| AT-023-2 | `[REAL-BOUNDARY-jsdom]` | **Asset-light:** Bildfeld als Platzhalter markiert (`data-placeholder`), kein Render, das wie ein echtes Produktfoto wirkt. |
| AT-023-3 | `[REAL-BOUNDARY-jsdom]` | Optionales Badge: falls vorhanden, ist es ein distinktes Element (z.B. „Bestseller"/„Sale"); Abwesenheit ist erlaubt. |

---

### REQ-024 — Angebots-/Sale-/Campaign-Hub mit mehreren kuratierten Sektionen (Kurztext + Slider + CTA), ASSET-LIGHT
- **Boundary-Gate:** boundary (Hub-Render via Route) + Content-Dependency OQ-001.
- **THESE:** Ein Hub hält mehrere kuratierte Sektionen (Kurztext + Product Slider + CTA), ohne dass jede Promo
  eine eigene überladene Landingpage ist.
- **GEGENTHESE:** Der Hub existiert als Route, hält aber nur EINE Sektion (kein Multi-Section-Beweis), oder seine
  Bildflächen wirken wie echte Kampagnen-Visuals (CAN-014-Verstoß).
- **SCHÄRFUNG:** Render echte Angebots-Hub-Route; assert ≥2 kuratierte Sektionen, jede mit Kurztext + Slider + CTA;
  Bildflächen asset-light markiert.

| Test-ID | Klasse | Vertrag (Assertion) |
|---|---|---|
| AT-024-1 | `[REAL-BOUNDARY-jsdom]` | Angebots-Hub-Route rendert ≥2 kuratierte Sektionen (distinkte Section-Anker). |
| AT-024-2 | `[REAL-BOUNDARY-jsdom]` | Jede Sektion hat Kurztext + einen Product-Slider (≥1 Karte) + einen CTA-Link. |
| AT-024-3 | `[REAL-BOUNDARY-jsdom]` | **Asset-light:** Hub-Bildflächen als generische Platzhalter markiert; wirken nicht wie echte Produkt-/Kampagnen-Visuals. |
| AT-024-4 | `[REAL-BOUNDARY-jsdom]` | „Angebote"-Nav-Eintrag (REQ-003) verlinkt auf diese Hub-Route (kein dead link). |

---

## 2. Failure-Mode-Tests (jeder benannte Failure-Mode → falsifizierender Test, nie Prosa)

| FM-ID | Quelle | Failure-Mode (wenn wahr ⇒ Test MUSS rot) | Killender Test |
|---|---|---|---|
| FM-01 | NFR-002/RISK (Perf) | Re-Order/Refactor löst den InkWave-Lazy/Suspense-Split auf | AT-001-3 (Quelle behält `lazy`+`Suspense`, kein top-level import) |
| FM-02 | REQ-002-Scope | Unteres Band wird mit-resequenziert (verbotene volle 13-Modul-Umordnung) | AT-002-2 (untere Modul-Folge unverändert) |
| FM-03 | REQ-003/V2-NAV_LINKS | FAQ/About/Contact/Blog bleiben in Primär-Nav | AT-003-2 (negativ: keine /faq,/about,/contact,/blog) |
| FM-04 | REQ-007 / Fire-Horse `yearly` | „yearly" wird als personalisierbar gelesen → Birth-Data am Fire-Horse-PDP | AT-007-4 (Fire-Horse zeigt KEINE Personalisierung) |
| FM-05 | REQ-014 | Birth-Review-Hinweis auch an nicht-personalisierter Cart-Zeile | AT-014-2 / AT-014-3 (zeilengenaues Gating) |
| FM-06 | NFR-004/RISK-002 | Server lässt sich von Client-`shippingCents` überstimmen (nur Frontend-„Free Shipping") | AT-016-1..4 (Client ignoriert, Server autoritativ) |
| FM-07 | REQ-015 | ES unvollständig → stiller EN-Fallback in der UI | AT-015-1 (Key-Parität EN==ES) |
| FM-08 | REQ-015 | ES dupliziert nur EN (kein echtes Spanisch) | AT-015-2 (ES-Wert ≠ EN-Wert) |
| FM-09 | REQ-017 | orange/gold-Hex bleibt stehen / Terracotta wird globaler Hauptakzent | AT-017-1/2/3 |
| FM-10 | OQ-003 (Policy) | Client feuert Nominatim per Keystroke (Policy-Verstoß) | AT-013-3 (kein per-Keystroke nominatim-fetch im Client) |
| FM-11 | OQ-001 / CAN-014 / RISK-001 | Platzhalterbild wirkt wie echtes Produktbild | AT-004-3 / AT-006-4 / AT-023-2 / AT-024-3 |
| FM-12 | REQ-010 / NG-003 | „Credits earned/Guthaben" lebt sichtbar in Cart/Home weiter | AT-010-3 (keine Credit-UI) |
| FM-13 | REQ-008 / NG-004 / OQ-004 | Erfundene Reviews/Sterne sichtbar trotz fehlender echter Reviews | AT-008-3 / AT-010-4 |
| FM-14 | REQ-005 / CAN-031 | Saju/Junishi-Reste in Daten/Render/Route | AT-005-1..4 |
| FM-15 | REQ-018 | Falsche/zusätzliche Hintergrundfarbe oder toter Swatch | AT-018-1/2/3 |
| FM-16 | REQ-019 | Störende Bloglinks unter Angebotszusammenfassungen bleiben | AT-019-1/2 |
| FM-17 | REQ-001 | Hero verschoben (nicht mehr DOM-Index-0) durch Re-Order | AT-002-3 / AT-001-1 |
| FM-18 | CAN-032 | Ein REQ wird als production-verified markiert ohne realen Boundary-Beweis | AT-020-1 |

---

## 3. Reality-Ledger der Test-Suite (was bleibt RED / PLANNED — nie still herabgestuft)

| Ledger-ID | Bereich | Evidenz-Klasse | Status | Begründung |
|---|---|---|---|---|
| RL-CHROMIUM | Mobile/LCP/Drag — alle Playwright-Specs | `[REAL-BROWSER-PLANNED]` | **RED/PLANNED** | Kein Chromium im Sandbox; genau das REQ-002-Merge-Gate (a). |
| RL-EVENT | Event-Readout (Hero-CTA/Slider/Banner/PDP/Add-to-Cart) | `[fake-only]` | **RED** | Instrumentierung = REQ-002-Merge-Gate (b); bis dahin REQ-002 value-risk. |
| RL-OQ003 | Place-of-Birth-Autocomplete-Quelle | Decision offen | **RED (code-blocking)** | OQ-003 ungelöst; Default gebündelte Cities-JSON, Nominatim-per-Keystroke verboten. |
| RL-STRIPE | Money-Path | `[INTEGRATION]` (fake) | **RED** | Nur gestubtes Stripe (`BLK-STRIPE-REAL`); keine Live-Key-Verifikation. |
| RL-BAZI | BaZi-Chart-Mathematik | placeholder | **RED** | `computeChart` ignoriert Ort/Zeit; kein Test behauptet Korrektheit. |
| RL-IMAGES | Bild-Endabnahme | content-required | **RED (launch-blocking)** | OQ-001; asset-light bis echte Bilder. |
| RL-PRICES | Finale Region-Preise | operator-input | **RED (launch-blocking)** | OQ-002; Mechanismus getestet, Zahlen operator-owned. |

---

## 4. Blocker (benannt — Coder/Orchestrator müssen sie auflösen oder sichtbar tragen)

- **BLK-CHROMIUM** — Playwright-Real-Browser-Specs (AT-001-4, AT-002-4, AT-004-4, AT-011-3, AT-012-3, AT-013-4)
  laufen PLANNED. Erfüllt REQ-002-Merge-Gate (a) erst in echter Umgebung.
- **BLK-EVENT-READOUT** — Event-Instrumentierung (AT-002-5) fehlt. Erfüllt REQ-002-Merge-Gate (b). REQ-002
  bleibt value-risk + gate-held bis beide Gates grün.
- **BLK-OQ003-AUTOCOMPLETE-SOURCE** — Autocomplete-Quelle (OQ-003, code-blocking) muss als gebündelte
  Cities-JSON / policy-konformer Provider entschieden sein, bevor AT-013-2/3 final grün sind.
- **BLK-ES-CONTENT** — Vollständige ES-Übersetzung muss existieren, bevor AT-015-1/2 grün sind (Key-Parität).
- **BLK-DELTA-DATA** — Above-Fold-Re-Order-Anker (`data-band="above-fold"`), Angebots-Hub-Route, exakte 8er-Nav,
  Terracotta-Token, 5er-Hintergrundpalette, asset-light-`data-placeholder` müssen vom Coder gewired werden,
  bevor die zugehörigen `[REAL-BOUNDARY-jsdom]`-Tests grün werden (Tests sind absichtlich vorab RED).

---

## 5. Wiederverwendung der V2-Infra (nicht neu bauen)

- Render-Boundary: `render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>)` (echter `src/App.tsx`).
- Lazy-Chunks: `findByTestId(..., { timeout: 5000 })` (wie `tests/setup.ts` asyncUtilTimeout).
- Scan-Helfer: `collectStrings()` / `firstHit()` / `scan()` aus `truthful-claims.test.ts` wiederverwenden,
  aber Locale-Array auf `['EN','DE','FR','ES']` erweitern.
- Money-Path: `createApp({ stripe })` + supertest + Parität gegen `FREE_SHIP_THRESHOLD`/`catalog.ts` (keine Literale).
- Playwright: bestehende `tests/e2e/*.spec.ts` erweitern (home-module-order, mega-menu, mobile 360/390/430, LCP),
  als markiert + skippable, damit die Kern-Suite hermetisch grün bleibt.

> Dieses Design ist FROZEN-spec-treu und implementierungsfrei. Kein Test bestätigt etwas als production-verified.
