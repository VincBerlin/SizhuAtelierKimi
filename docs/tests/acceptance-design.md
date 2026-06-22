# Acceptance-Test-Design (Contracts) — SizhuAtelier Webshop Architektur V2

- **Feature Slug:** `sizhuatelier-webshop-architecture-v2`
- **Rolle:** `tester` (QA-Design, Phase 1 von `/agileteam`) · **Erstellt:** 2026-06-22
- **Status:** Vertrags-Entwurf — **unabhängig aus der FROZEN Spec abgeleitet** (PRD + beobachtbares
  Verhalten), **vor** jeder Coder-Arbeit. Der Coder behandelt diese Verträge als bindend.
- **Test-Infra:** **NOCH NICHT installiert** (ist REQ-014/T-01, eine Phase-2-Aufgabe). Diese Verträge
  sind **runnable-shaped** entworfen, **aber nicht ausgeführt**. Tools: `vitest` (Unit/Integration),
  `playwright` (E2E/Route/i18n-DOM), `supertest` (HTTP gegen die echte Express-App).
- **Quellen:** PRD `docs/prd/…v2.prd.md`, Traceability `docs/traceability.md`, Vision `…vision.md`
  (§7 „falsche/schädliche Implementierung" = Failure-Mode-Liste), Canvas (Amendments A–E),
  ADR-001 (Re-Pricing), ADR-002 (Input-Passthrough + Noon-Fallback).

## Konventionen

- **Boundary-Klassifikation pro Testfall:** `[REAL-BOUNDARY]` = berührt echten Composition-Root
  (`src/App.tsx`/`src/main.tsx`) oder echte Express-App / echten Stripe-Line-Item-Bau-Pfad (Stripe-SDK
  gemockt, **Pfad echt**). `[UNIT]` = reine In-Process-Logik. `[INTEGRATION-FAKE]` = echter Server-Pfad,
  externe Grenze (Stripe) gestubbt — höchste im Run erreichbare Evidenz für den Money-Path (ADR-001 / Ledger §50).
- **Glättungs-Gate (Beat 0):** pro REQ wird zuerst entschieden `pure` vs. `boundary`. Bei `boundary`
  folgt eine Gegenthese (grün-aber-wertlos) + die EINE reality-touching Schärfung, die sie tötet.
- **RED-Status:** `bazi.ts` bleibt Platzhalter (RED für ACCURACY); `checkout-repricing` ist
  `integration-fake` (reale Stripe-Session = außerhalb Run). Diese RED-Etiketten dürfen **kein** Test
  durch Grün herabstufen.

## Repo-Reality-Anker (zitiert, file:line — Stand der Ableitung)

- `server/index.js:194,202,215-217` — Checkout vertraut Client-`unitAmount` + `shippingCents` (das Loch).
- `server/index.js:740-750` — `buildPersonalizationMetadata` (480-Zeichen-Chunking, REQ-003 AK-1).
- `src/lib/checkout.ts:33-39` — Client-Payload sendet **nur** `title/unitAmount/qty/meta/personalization`
  (KEINE `productId`/`variantId`). ADR-001 verlangt deren Ergänzung.
- `src/lib/bazi.ts:26` — `computeChart(dateStr?, timeStr?)` — **kein** `place`, **kein** `birthTimeUnknown`-Param.
- `src/store/ShopStore.tsx:104-106` — Versandregel (US/UK frei; EU `FREE_SHIP_THRESHOLD=80`; sonst `4.9`).
- `src/store/ShopStore.tsx:135-137` — `addCurrent` ruft `computeChart(cfg.date, cfg.time)`, `personalization` ohne `birthTimeUnknown`-Flag/Fallback.
- `src/pages/Personalize.tsx:89,106-118` — `unknownTime`-State, Noon-Fallback (`'12:00'`), Metadaten `place/unknownTime/timeFallbackUsed/fallbackReason` vorhanden; `computeChart` ohne `place`.
- `src/pages/ProductView.tsx:26,50` — `computeChart(cfg.date, cfg.time)` ohne `place`; Noon-Fallback inline.
- `src/components/shop/CartDrawer.tsx:162-175` — `PersonalizationSummary`, rendert `cart.unknownTimeNotice` bei `unknownTime`.
- `src/components/Navbar.tsx:13-22,157-167,195-224` — flache `shopLinks`-Dropdown (kein Mega-Menü); Mobile-Drawer-Basis.
- `src/pages/Home.tsx:133-140` — Modulfolge Hero→PathToPoster→Catalog→Wissen→Bundles→Faq→Newsletter (weicht von 1–13 ab).
- `src/App.tsx:55-84` — Routen; nur `/collections` + `/tcm`, **keine** per-Welt-Collections, **keine** `/inspiration`.
- `src/lib/legal.ts:17,131` — `LEGAL_DOCS` ist **eine** englische Fassung (kein i18n-Switch); `[MISSING — …]`-Marker vorhanden.
- `src/lib/catalog.ts:28` (`mk`→`computeChart(date)` ohne place), `:199` („nachweislich beruhigend"), `:226` (`shopFaqs[0]` „…-ort werden die vier Säulen berechnet"), `:242` (`faqDefs.bazi` „berechnen wir…").
- `src/i18n/translations.ts:248,275,285,355,363,401,466` (+ FR/EN-Pendants) — Präzisions-/API-/„100%"-Claims.
- Saju/Junishi: **nur** in Code-Kommentaren (`Kollektion.tsx:10`, `Personalize.tsx:11`) — keine Route/Daten/SEO.

---

# SECURITY

## REQ-001 — Server-autoritative Re-Preisung in `/api/checkout`

**Beat 0 — Boundary-Gate:** `boundary` (HTTP-Route, baut Stripe-Line-Items, externe Zahlungsgrenze).
**These:** „Der Server berechnet den Preis selbst" — gilt als gebaut, sobald eine Preis-Map existiert.
**Gegenthese (grün, aber wertlos):** Ein Test mockt den Re-Pricing-Helper oder prüft nur, dass die
Map existiert — der reale `/api/checkout`-Pfad spiegelt aber weiter `it.unitAmount` in den
Stripe-Line-Item (Vision §7.2: „eine Re-Preisung, die in Wahrheit nur den Clientwert spiegelt … zählt
als FALSCH"). Voll grün, 1-Cent-Loch offen.
**Schärfung (tötet die Gegenthese):** Request mit `unitAmount: 1` (Produkt/Variante gültig) gegen die
**echte Express-App** (supertest) schicken, Stripe-SDK gestubbt; assert auf den an
`stripe.checkout.sessions.create` übergebenen `line_items[].price_data.unit_amount` == Serverpreis aus
der server-eigenen Quelle, **nicht** `1`. `[INTEGRATION-FAKE]` — echter Pfad, Stripe gestubbt.

**Testfälle** (vitest + supertest, Stripe-SDK via `vi.mock`/Stub; **kein** echter Key):
- **AT-001-1** `[INTEGRATION-FAKE]` AK-2: `POST /api/checkout` mit `items:[{productId, variantId, unitAmount:1, qty:1}]` → der dem Stripe-Stub übergebene `unit_amount` == autoritativer Serverpreis (Cent), **≠ 1**. (Tampering-Kern, Vision VCHK-03.)
- **AT-001-2** `[INTEGRATION-FAKE]` AK-1: Variation `unitAmount` = `0`, negativ, `999999`, fehlend → `unit_amount` bleibt jedes Mal der Serverpreis; Clientwert hat **keinen** Einfluss (Property-artig über mehrere Tamper-Werte).
- **AT-001-3** `[INTEGRATION-FAKE]` AK-3: unbekannte `productId`/`variantId` → Response `4xx` mit Fehlercode; Stripe-Stub wurde **nie** aufgerufen (`expect(stub).not.toHaveBeenCalled()`); keine Session-URL.
- **AT-001-4** `[UNIT]` AK-4 (Konsistenz): Property-Test — für jede `productId`+`variantId` stimmt der Serverpreis mit dem Client-Anzeigepreis überein (`catalog.ts` Poster-`price` + `bazi.ts` `sizes[].delta`; `Personalize.tsx` `PRODUCT_TYPES[].basePrice` + `PDF_ADDON_PRICE`). Diskrepanz = Fehler. (Single-Source-of-Truth-Guard, ADR-001 Pkt. 4.)
- **AT-001-5** `[INTEGRATION-FAKE]` AK-2 (Determinismus): identischer gültiger Payload zweimal → identische `line_items`-Preise (kein nichtdeterministisches Routing).

**Boundary-Hinweis:** AT-001-1/2/3/5 berühren die **reale** Re-Pricing-Grenze (echter Routen-Code,
echter Line-Item-Bau). AT-001-4 ist Unit (Preis-Konsistenz-Invariante). **Reale Stripe-Session gegen
echte Keys = außerhalb Run** → `checkout-repricing` bleibt RED/`integration-fake` im Reality-Ledger.

## REQ-002 — Server-berechneter Versand in `/api/checkout`

**Beat 0:** `boundary` (HTTP-Route, beeinflusst Stripe-Line-Items).
**These:** „Versand kommt vom Server."
**Gegenthese:** Test setzt `shippingCents` und prüft, dass die Summe stimmt — aber der Server hat den
Clientwert nur durchgereicht; ein Angreifer mit `shippingCents:0` zahlt 0 Versand bei versandpflichtigem Cart.
**Schärfung:** Request mit `shippingCents:0` bei einem Cart **unter** der Free-Ship-Schwelle (EU) gegen
die echte App; assert, dass die Stripe-Line-Items **eine** Versand-Position mit dem
server-berechneten Betrag (`4.90` → `490` Cent) enthalten, **nicht** 0. `[INTEGRATION-FAKE]`.

**Testfälle** (vitest + supertest):
- **AT-002-1** `[INTEGRATION-FAKE]` AK-3: `shippingCents:0`, EU-Region (Header `cf-ipcountry: DE`), Subtotal `< 80` → Stripe-Line-Items enthalten Versand `490`; Clientwert ignoriert.
- **AT-002-2** `[INTEGRATION-FAKE]` AK-1: `shippingCents:9999` (überhöht) bei Subtotal `≥ 80` (EU) → Server setzt **0** Versand (Free-Ship erreicht), Clientwert ignoriert.
- **AT-002-3** `[INTEGRATION-FAKE]` AK-2 (Region-Regel): `cf-ipcountry: US` → Versand `0` (US frei); `cf-ipcountry: GB` → `0` (UK frei); EU unter Schwelle → `490`; „other" unter Schwelle → `490`. Tabelle deckt alle Zweige von `ShopStore.tsx:104-106` ab.
- **AT-002-4** `[UNIT]` AK-2 (Client↔Server-Parität): Property-Test — die extrahierte Server-Versandfunktion liefert für (region, subtotal) **dieselben** Beträge wie die Client-Ableitung in `ShopStore` (gleiche Konstante `FREE_SHIP_THRESHOLD=80`, gleiche `4.9`). Diskrepanz = Fehler.

**Boundary-Hinweis:** AT-002-1/2/3 = reale Grenze; AT-002-4 = Unit-Paritäts-Invariante.

## REQ-003 — Keine Regression bestehender Checkout-Invarianten

**Beat 0:** `boundary` (HTTP-Route — die Re-Preisung darf bestehende Garantien nicht brechen).
**These:** „Metadaten/Gast/Account/Clamping funktionieren noch."
**Gegenthese:** Re-Pricing wird eingebaut, aber das Metadaten-Chunking verliert bei einem Couple-Cart
> 500 Zeichen die Geburtsdaten (Vision §4: „eine erhobene Eingabe darf niemals heimlich verworfen werden")
— grün auf dem Money-Path, aber das Fulfillment bekommt unvollständige Daten.
**Schärfung:** Couple-Payload erzeugen, dessen `personalization`-JSON > 480 Zeichen ist, gegen die echte
App; den an Stripe übergebenen `metadata` durch `readPersonalizationMetadata` reassemblieren und
beweisen, dass **alle** Geburtsfelder (A + B, `place`/`date`/`time`/`birthTimeUnknown`) verlustfrei
zurückkommen. `[INTEGRATION-FAKE]`.

**Testfälle** (vitest + supertest):
- **AT-003-1** `[INTEGRATION-FAKE]` AK-1: Couple-Cart mit langem `personalization`-JSON (> 480 Z.) → `buildPersonalizationMetadata`-Chunks im Stripe-Call; Round-Trip via `readPersonalizationMetadata` == Eingabe (kein Drop). **Round-trip/Reversibilität:** zusätzlich adversarialer Inhalt (Felder mit `·`, `"`, `\n`, Mehrfach-Leerzeilen) → verlustfreie Reassemblierung (lossless lesson).
- **AT-003-2** `[INTEGRATION-FAKE]` AK-2: mit gültiger Session-Cookie (eingeloggter Uid, `ensureStripeCustomer` gestubbt) → Stripe-Call enthält `customer`, **kein** `customer_email`. Ohne Cookie, mit `email` → `customer_email`, **kein** `customer`. (Gegenseitiger Ausschluss, `server/index.js:236-240`.)
- **AT-003-3** `[INTEGRATION-FAKE]` AK-3: `qty:0`→geclampt auf `1`; `qty:1000`→`99`; leerer `items`-Array→`400`. (Clamping `1..99` + Leer-Cart, `:195,203`.)
- **AT-003-4** `[UNIT]`: `buildPersonalizationMetadata({})` → `{}` (Default-Zweig: leeres Personalization-Objekt erzeugt keine Metadaten — pinnt den explizit erreichbaren Leerfall, vgl. `server/index.js:742`).

---

# TRUTHFUL-CLAIMS

## REQ-004 — Personalisierungs-Eingaben vollständig erfassen + sauber durchreichen

**Beat 0:** `boundary` (Daten queren UI-State → Cart-Metadaten → Checkout-Payload → Server; Wert hängt am
*assemblierten* Pfad, nicht an `computeChart` allein).
**These:** „`computeChart` nimmt `place`/`birthTimeUnknown` an."
**Gegenthese (Vision §7.5 „Eingabe-Verwerfung launderieren"):** `computeChart` bekommt einen
`place`-Parameter, aber der reale Personalisierungs-Payload / die Cart-Metadaten verlieren ihn still
(z. B. weil `addCurrent`/`addItem` ihn nicht in `personalization` schreiben) — Signatur grün, der Wert
(saubere Erfassung für die geplante API) ist null.
**Schärfung:** Den **realen** Cart-Metadaten-Pfad fahren (Personalisierung erzeugen → `addItem` →
`startCheckout`-Payload bauen, `fetch` gestubbt) und auf der **übergebenen** Payload-Struktur
beweisen, dass `place`/`date`/`time`/`birthTimeUnknown` mit den eingegebenen Werten vorhanden sind —
nicht nur auf der `computeChart`-Signatur. `[REAL-BOUNDARY]` (Payload-Assembly über echten Store/lib).

**Testfälle** (vitest):
- **AT-004-1** `[REAL-BOUNDARY]` AK-1: Personalisierung (place=„München", date, time) → erzeugter `startCheckout`-Payload (`checkout.ts`-`items[].personalization`) enthält `place/date/time/birthTimeUnknown` mit exakt den Eingabewerten. Negativnachweis gegen Verwerfung (Vision-Gegenthese-Anker).
- **AT-004-2** `[UNIT]` AK-2: `computeChart`-Signatur akzeptiert `(date, time, place, birthTimeUnknown)` und verwirft `place`/`birthTimeUnknown` **nicht** (kein Throw, Param wird mitgeführt). Aufrufstellen `Personalize.tsx`, `ProductView.tsx`, `catalog.ts:mk` reichen `place` durch (statische/Verhaltens-Assertion).
- **AT-004-3** `[UNIT]` AK-3 (Determinismus): gleiche `(date,time,place,birthTimeUnknown)` → gleiche erfasste/durchgereichte Struktur (Snapshot- + Property-Test über zufällige gültige Tupel).
- **AT-004-4** `[UNIT]` AK-4 (Platzhalter-Grenze, RED): `computeChart` bleibt deterministische **Platzhalter**-Ausgabe; Test markiert/dokumentiert `*-fake`/RED — **kein** Test behauptet astronomische Korrektheit; **kein** „Bild variiert mit Ort"-Test (gegenstandslos, Poster = Platzhalter, ADR-002 Pkt. 3). Dieser Testfall hält die RED-Linie sichtbar.

**Reality-Ledger:** `bazi-chart` bleibt RED/`*-fake` (ACCURACY) auch bei grünem AT-004-* — nie als
„echte Engine fertig" berichten.

## REQ-018 — Geburtszeit-unbekannt: 12:00-Noon-Fallback + sichtbare Offenlegung

**Beat 0:** `boundary` (Fallback wird gesetzt + muss in **gerenderter** UI offengelegt sein — Eingabefeld + Zusammenfassung, EN/DE/FR).
**These:** „Bei unbekannter Zeit nehmen wir 12:00."
**Gegenthese (Vision §7.5 „12:00-Noon-Fallback still setzen"):** Der Fallback wird gesetzt, aber die
Offenlegung rendert nicht (fehlender Key in einer Sprache, oder Hinweis nur im Code, nicht im DOM) —
ein stiller Default, also genau die Verschweigungs-Täuschung, die REQ-018 schließen soll.
**Schärfung:** Bei gesetztem Flag (a) Unit-prüfen, dass die verarbeitete Zeit deterministisch `12:00`
ist **und im Payload** liegt; (b) **gerendert** prüfen (Playwright, echter `App.tsx`), dass der
Offenlegungs-Hinweis am Eingabefeld **und** in der Zusammenfassung/Cart in EN/DE/FR im DOM erscheint.
`[REAL-BOUNDARY]` für (b).

**Testfälle:**
- **AT-018-1** `[UNIT]` AK-1: `birthTimeUnknown=true` → verarbeitete Zeit == `'12:00'` und `birthTimeUnknown`/`timeFallbackUsed` im erzeugten `personalization`-Objekt (deterministisch). `false` mit Zeit „08:30" → Zeit unverändert, Flag `false`.
- **AT-018-2** `[REAL-BOUNDARY]` AK-2 (Offenlegung am Feld): Playwright auf `/personalize` über `App.tsx`; „Geburtszeit unbekannt" anklicken → der Noon-Hinweis (`personalize.unknownTimeHint`) ist sichtbar im DOM, je EN/DE/FR (Sprachumschaltung). Enthält sinngemäß „12:00".
- **AT-018-3** `[REAL-BOUNDARY]` AK-3 (Offenlegung in Zusammenfassung/Cart): Flag gesetzt, Item in den Cart → `CartDrawer` `PersonalizationSummary` rendert `cart.unknownTimeNotice` sichtbar, je EN/DE/FR.
- **AT-018-4** `[UNIT]` AK-4 (kein präziser Claim bei Fallback): bei gesetztem Flag enthält die ausgelieferte Copy **keinen** „exakt/präzise berechnet"-Claim (Kopplung an REQ-005-Verbotsliste über die fallback-nahen Keys).
- **AT-018-5** `[UNIT]` i18n-Vollständigkeit (NFR-6): die Offenlegungs-Keys (`personalize.unknownTimeHint`, `cart.unknownTimeNotice`, `cart.confirmLabel`, `personalize.timeUnknown`) existieren in **allen** drei Sprachen (kein fehlender Key zur Laufzeit).

**Reality-Ledger:** koppelt an `bazi-chart` RED (Chart bleibt Platzhalter); Offenlegung schließt die
collect-display-discard-Täuschung, launderiert sie nicht.

## REQ-005 — Copy-Reframe: keine exakte BaZi-Engine/-API-Behauptung

**Beat 0:** `boundary` (Prüfung muss gegen die **ausgelieferten** i18n-Keys laufen, nicht gegen Demo-Strings — Vision-Gegenthese §8 „Copy-Reframe").
**These:** „Die irreführenden Claims sind entfernt."
**Gegenthese:** Nur ein Beispielstring wird geändert; die Live-i18n-Keys (`translations.ts`) bleiben
irreführend, oder ein neuer String führt einen frischen Präzisions-Claim ein.
**Schärfung:** Ein i18n-Scan-Test iteriert über **alle** EN/DE/FR-Strings des realen
`translations`-Objekts gegen eine **Verbots-Phrasenliste** und schlägt fehl, wenn eine verbotene
Phrase verbleibt — inklusive der heute belegten Stellen. `[UNIT]` (reiner String-Scan über die ausgelieferte Datenstruktur — die „Auslieferung" ist hier das importierte `translations`-Objekt selbst).

**Verbots-Phrasenliste (Präzision/API), case-insensitiv, je Sprache:**
`100% exakte`, `exakte mathematische`, `präzisions-api`, `präzise api`, `exakt deine vier säulen`,
`präzise, konsistent`, `dedizierte api`, `precision api`, `exact mathematical`, `we calculate your four pillars`,
`api de précision`, `calcul mathématique exact`, `nous calculons vos quatre piliers`.

**Testfälle** (vitest):
- **AT-005-1** `[UNIT]` AK-1/AK-4: Scan über `translations[EN|DE|FR]` (rekursiv, inkl. Arrays wie `path.steps`, `apiTrust.badges`, `faqHome`) → **kein** Treffer der Verbotsliste. Schlägt heute an `:248,275,285,355,363,401` (+ FR/EN-Pendants) — soll nach Fix grün sein.
- **AT-005-2** `[UNIT]` AK-3 (FAQ-Kopplung): `shopFaqs[0].a` (`catalog.ts:226`) und `faqDefs.bazi.a` (`:242`) enthalten **kein** „berechnet/exakt/calculate"-Claim am Platzhalter; erlaubt ist „erfasst + für geplante Berechnung". Test koppelt FAQ-Wortlaut an die Verbotsliste.
- **AT-005-3** `[UNIT]` AK-2 (Ersatz-Framing vorhanden): mindestens ein Key trägt das ehrliche Framing („symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten" sinngemäß) — Positiv-Assertion, dass nicht nur gelöscht, sondern ersetzt wurde.
- **AT-005-4** `[UNIT]` AK-5 (Noon-Kopplung): die fallback-nahe Copy suggeriert kein präzises Chart bei aktivem Noon-Fallback (gemeinsamer Scan mit AT-018-4).

## REQ-006 — TCM/Wuxing Health-Claim-Sweep (keine Heilversprechen)

**Beat 0:** `boundary` (Scan gegen ausgelieferte TCM/Wuxing-Strings — HWG/UWG-Launch-Gate).
**These:** „TCM-Inhalte enthalten kein Heilversprechen."
**Gegenthese (Vision §7.3):** Der offensichtliche Treffer wird entschärft, aber ein grenzwertiger
(`catalog.ts:199` „nachweislich beruhigend") bleibt, oder ein neuer Artikel führt ein Wirkversprechen ein.
**Schärfung:** Content-Scan über **alle** TCM/Wuxing-Strings (`translations.ts` TCM/Wuxing-Keys,
`catalog.ts` `bullets`/`articles`/`shopFaqs`) gegen eine **Heilversprechen-Verbotsliste**, der bei jedem
Treffer fehlschlägt. `[UNIT]`.

**Heilversprechen-Verbotsliste (case-insensitiv, EN/DE/FR):**
`heilt`, `heilen`, `lindert`, `lindert krankheit`, `therapiert`, `nachweislich beruhigend`, `cures`,
`treats`, `heals`, `clinically proven`, `guérit`, `soigne`, `traite`, `cliniquement prouvé`.

**Testfälle** (vitest):
- **AT-006-1** `[UNIT]` AK-1: Scan über alle TCM/Wuxing-Strings → kein Treffer. Schlägt heute an `catalog.ts:199` („nachweislich beruhigend") — nach Entschärfung grün.
- **AT-006-2** `[UNIT]` AK-2: gezielter Test, dass `catalog.ts:199` zu einer atmosphärischen Formulierung („wirkt ruhig/atmosphärisch") umformuliert ist (kein Wirk-/Heilversprechen mehr).
- **AT-006-3** `[UNIT]` AK-3: TCM/Wuxing-Poster werden als „kuratierte Wissens-/Fachgrafiken" gerahmt (Positiv-Assertion auf das Framing in den Produkt-/Collection-Strings).

**Reality-Ledger:** REQ-006 ist `non-goal-violation` (aktiv abgesichert) — RED bis Sweep grün.

## REQ-007 — DE/FR-Lokalisierung der Rechtstexte (Struktur, ohne Operator-Daten)

**Beat 0:** `boundary` (lokalisierte Legal-Seite muss über `App.tsx` in der aktiven Sprache **rendern**;
heute ist `LEGAL_DOCS` **eine** englische Fassung ohne i18n-Switch — `legal.ts:131`).
**These:** „Rechtstexte erscheinen in DE/FR."
**Gegenthese (Vision §7.7):** DE/FR-Fassungen werden angelegt, aber (a) die Seite zeigt sie nie an
(kein i18n-Switch verdrahtet), oder (b) ein `[MISSING]`-Marker wurde mit erfundenen Operator-Daten
gefüllt, um „vollständig" zu wirken.
**Schärfung:** Playwright auf `/impressum`,`/terms`,`/returns`,`/privacy`,`/shipping` über `App.tsx`,
Sprache auf DE bzw. FR; assert, dass lokalisierter Text rendert **und** die `[MISSING — …]`-Marker
weiterhin sichtbar als Platzhalter im DOM stehen (kein erfundener Inhalt) **und** das Review-Banner
sichtbar ist. `[REAL-BOUNDARY]` für Rendering; `[UNIT]` für Marker-Erhalt.

**Testfälle:**
- **AT-007-1** `[REAL-BOUNDARY]` AK-1: je Doc-Key × {DE, FR} über `App.tsx` → Hauptüberschrift/Inhalt in der jeweiligen Sprache (nicht englisch). (Heute RED — kein i18n-Switch.)
- **AT-007-2** `[UNIT]` AK-2: in **jeder** Sprachfassung bleiben alle `[MISSING — …]`-Marker erhalten (Anzahl/Positionen == EN-Template); kein Marker durch erfundene Operator-Daten ersetzt.
- **AT-007-3** `[UNIT]` AK-3: Widerrufs-/Personalisierungs-Formulierung (`returns`-Doc + `cart.returnNotice`) ist über EN/DE/FR semantisch identisch und rechtlich-vorsichtig (kein abgeschwächter/abweichender Sinn).
- **AT-007-4** `[REAL-BOUNDARY]` AK-4: Review-Banner („professionelle Rechtsprüfung + Operator-Daten ausstehend") rendert auf jeder Legal-Seite, je Sprache.

---

# V2-CONFORMANCE

## REQ-008 — Homepage-Modulfolge 1–13 ohne Hero/LCP-Regression

**Beat 0:** `boundary` (gerenderte DOM-Reihenfolge über `App.tsx` + Performance-Nebenbedingung).
**These:** „Home rendert die V2-Module in Reihenfolge."
**Gegenthese (Vision §7.4 + §7.6):** Module werden hinzugefügt, aber (a) die Reihenfolge stimmt nicht /
ein Modul ist nicht in `App.tsx`-Render verdrahtet, oder (b) die Reihenfolge wird „exakt" erreicht, indem
der Hero/InkWave regrediert (Lazy-Three.js-Split / Reduced-Motion verloren) — Spec-Treue schlägt Performance.
**Schärfung:** (a) Playwright über `App.tsx` prüft DOM-Order der Module 1–13; (b) ein
LCP/Hero-Guard vergleicht gegen Baseline (Commits `0133437`/`0f8995c`/`d56de04`) bzw. setzt
`MEASURE_NEEDED`-Blocker, falls keine Schwelle existiert. `[REAL-BOUNDARY]`.

**Testfälle:**
- **AT-008-1** `[REAL-BOUNDARY]` AK-1: Home über `App.tsx` rendert Sektionen in V2-Order 02→13 (DOM-Order-Assertion über stabile `id`/`data-module`-Anker); fehlende Module (03/04/06/07/08/09/11/12) vorhanden.
- **AT-008-2** `[REAL-BOUNDARY]` AK-2 (NFR-1-Kopplung): Hero/InkWave ist Modul 02; Lazy-`InkWave`-Suspense-Boundary (`Home.tsx:6,19-21`) bleibt erhalten; Reduced-Motion-Pfad rendert statisches Fallback (Playwright mit `prefers-reduced-motion: reduce`). **Siehe Performance-Guard AT-021** für LCP.
- **AT-008-3** `[UNIT]` AK-3: ≤ 6 Hauptnav-Einträge (`mainLinks` + Collections + Start-Personalizing ≤ 6).
- **AT-008-4** `[REAL-BOUNDARY]` AK-4 (Negativ): kein Saju/Junishi in gerenderter Home/Sektionen (DOM-Scan). Siehe globaler Negativtest AT-NEG-SAJU.

## REQ-009 — Echtes Mega-Menü (Shop/Kollektionen) + Mobile-Drawer + A11y

**Beat 0:** `boundary` (Navigation über `App.tsx`, Keyboard/Touch/A11y am gerenderten DOM).
**These:** „Es gibt ein Mega-Menü."
**Gegenthese:** Ein gruppiertes Menü existiert als isolierte Komponente, ist aber nicht in der echten
Navbar/`App.tsx` verdrahtet, oder Keyboard/Escape/`aria-*` fehlen (A11y-Gate verletzt), oder Items
verlinken nicht auf die REQ-010-Routen (tote Links).
**Schärfung:** Playwright über `App.tsx`: Mega-Menü öffnen (Hover/Tab), Spalten-Gruppen sichtbar,
`aria-haspopup`/`aria-expanded` korrekt, Escape schließt, Items navigieren zu echten Collection-Routen.
`[REAL-BOUNDARY]`.

**Testfälle:**
- **AT-009-1** `[REAL-BOUNDARY]` AK-1: Desktop — Mega-Menü mit gruppierten Spalten (Personalisierte/TCM/Wuxing/Analyse-PDFs/Bundles/Featured) öffnet über die echte Navbar.
- **AT-009-2** `[REAL-BOUNDARY]` AK-2 (Mobile): Breakpoint 390 — Drawer/Accordion per Tap (kein Hover), Touch-Ziele ≥ 44px; bestehender Drawer (`Navbar.tsx:195-224`) als Basis.
- **AT-009-3** `[REAL-BOUNDARY]` AK-3 (A11y, NFR-3): Tab/Shift+Tab erreichen Menü-Items; `aria-haspopup`/`aria-expanded` reflektieren Zustand; Escape schließt (vorhandenes Handling `Navbar.tsx:113-115`).
- **AT-009-4** `[REAL-BOUNDARY]` AK-4: jeder Mega-Menü-Link zeigt auf eine existierende REQ-010-Route (Klick → Route rendert, kein 404/leere Seite).

> **Drag/Pointer-Hinweis (gelernt):** Falls das Mega-Menü Pointer-basierte Interaktion nutzt,
> echte `mouse.down→move→up`-Sequenzen statt HTML5-DnD verwenden; solche e2e markiert/skippable halten.

## REQ-010 — Per-Produktwelt-Collection-Routen (MVP-Set)

**Beat 0:** `boundary` (Routen müssen über den Produktions-Composition-Root `App.tsx` erreichbar sein — Vision §7.6 „Scheinbare Reachability").
**These:** „Die Collection-Routen existieren."
**Gegenthese (Vision §7.6):** Collection-Komponenten rendern isoliert grün, sind aber in `App.tsx` nicht
als `<Route>` verdrahtet — gebaut, nicht erreichbar; oder eine Collection ist leer/dünn (Non-Goal §7).
**Schärfung:** Playwright navigiert über `App.tsx` zu **jeder** MVP-Route und prüft, dass das
Collection-Template mit H1/Intro/Grid/SEO/FAQ/internen Links rendert (nicht leer). `[REAL-BOUNDARY]`.

**Testfälle:**
- **AT-010-1** `[REAL-BOUNDARY]` AK-1: jede Route `/collections/{bazi-posters,tcm-posters,wuxing-posters,personalized-posters,compatibility-posters,fire-horse-2026,analysis-pdfs,bundles}` über `App.tsx` erreichbar + rendert das Template (HTTP/Render OK).
- **AT-010-2** `[UNIT]` AK-2: Produktgrid jeder Collection ist aus `catalog.ts` über `product_world` gefiltert (kein erfundenes Sortiment); Filter liefert ≥ 1 Produkt je MVP-Welt.
- **AT-010-3** `[REAL-BOUNDARY]` AK-3 (Inhalt): jede Collection hat H1, Intro, Produktgrid (≥1), SEO-Textblock, FAQ, interne Links — keine dünne Seite (DOM-Assertions).
- **AT-010-4** `[REAL-BOUNDARY]` AK-4 (Negativ): keine `/collections/saju*`/`/collections/junishi*`-Route; keine Raum-Kategorie-Landingpage erreichbar (404/Redirect).

## REQ-011 — Inspiration/Gallery-Seite

**Beat 0:** `boundary` (Route über `App.tsx`).
**These:** „`/inspiration` existiert."
**Gegenthese (Vision §7.6/§7.7):** Galerie-Komponente existiert, aber `/inspiration` ist nicht in
`App.tsx` verdrahtet; oder Platzhalter-Kacheln werden als echte Kundenbeispiele ausgegeben (erfundener Inhalt).
**Schärfung:** Playwright über `App.tsx` lädt `/inspiration`; Kacheln verlinken auf echte
Collection/Produktseiten; Platzhalter-Kacheln sind **als Platzhalter markiert** (kein erfundenes
„Kundenbeispiel"). `[REAL-BOUNDARY]`.

**Testfälle:**
- **AT-011-1** `[REAL-BOUNDARY]` AK-1: `/inspiration` über `App.tsx` erreichbar, rendert kuratierte Galerie (Masonry ab Tablet, vertikal mobil).
- **AT-011-2** `[REAL-BOUNDARY]` AK-2: jede Kachel verlinkt auf eine existierende Collection/Produktseite (Klick → Route rendert).
- **AT-011-3** `[REAL-BOUNDARY]` AK-3 (OQ-006): Platzhalter-Kacheln tragen eine sichtbare Platzhalter-Markierung; keine als echt deklarierten Kundenbeispiele.
- **AT-011-4** `[REAL-BOUNDARY]` AK-4: Home-Modul 09 (Inspiration) verlinkt auf `/inspiration` (Kopplung REQ-008).

## REQ-012 — Homepage-SEO-Textblock (Modul 12)

**Beat 0:** `boundary` (gerenderter Block über `App.tsx` + Truthful-Coupling).
**These:** „Es gibt einen SEO-Textblock."
**Gegenthese:** Block existiert, aber er ist nicht in der gerenderten Home verdrahtet, oder er enthält
durch REQ-005/006 verbotene Claims (Keyword-Stuffing / Präzisions-Claim).
**Schärfung:** Playwright über `App.tsx` prüft Modul 12 mit H2-Struktur + internen Links; ein Scan
prüft, dass der SEO-Text **keine** verbotene Phrase (REQ-005/006-Listen) enthält. `[REAL-BOUNDARY]` + `[UNIT]`.

**Testfälle:**
- **AT-012-1** `[REAL-BOUNDARY]` AK-1/AK-2: Modul 12 rendert mit H2-Struktur + internen Links zu Collections (REQ-010) und Wissensartikeln.
- **AT-012-2** `[UNIT]` AK-3 (Truthful-Coupling): SEO-Text gegen Präzisions- + Heilversprechen-Verbotsliste → kein Treffer.
- **AT-012-3** `[UNIT]` AK-4: Keyword-TODO ist als Content-TODO markiert (`OQ-007`), Struktur korrekt — kein erfundenes finales Keyword-Set behauptet.

## REQ-013 — Datenmodell-Konformität: V2-Produktfelder additiv auf `catalog.ts`

**Beat 0:** `pure` (Typ-/Datenmodell-Logik, kein Boundary — KEIN Reality/Wiring-Flag, KEINE erfundenen Failure-Modes).
**These:** „`catalog.ts` trägt die V2-Dimensionen."
*(pure → keine Gegenthese/Schärfung; getestet wird die Logik: additive Erweiterung, Enum-Werte,
Abwärtskompatibilität, Filter-Determinismus.)*

**Testfälle** (vitest, `[UNIT]`):
- **AT-013-1** AK-1: jedes Produkt trägt `product_world ∈ {bazi,tcm,wuxing,mixed}`, `personalization_level ∈ {single,couple,yearly,none}`, `use_case`, `design_family ∈ {minimal,japandi,wabi_sabi,classic_ink}`; **bestehende** Felder (`category`, `personalizable`, `usage`, `image`, `poster`, `price`) unverändert (additiv, nicht destruktiv).
- **AT-013-2** AK-1 (Enum-Disziplin): kein Produkt trägt einen Enum-Wert außerhalb der erlaubten Mengen (Property-Test über alle Produkte).
- **AT-013-3** AK-3 (Filter-Determinismus): `filterByWorld(products, world)` ist deterministisch + total — für jede `product_world`-Welt mit Bestand ≥ 1 Treffer; filtert über `product_world`, **nicht** über das uneinheitliche `category`-Freitextfeld.
- **AT-013-4** AK-2: Annotation erfindet **keine** Preise/Reviews (Werte == Bestand; `OQ-002`).

---

# TESTS (Infra + Suiten)

## REQ-014 — Test-Infrastruktur (vitest + playwright) einrichten

**Beat 0:** `boundary` (CI-Lauffähigkeit + Real-Boundary-Smoke über `App.tsx`).
**These:** „Tests laufen."
**Gegenthese:** `test`-Script existiert, aber der Smoke rendert nur isolierte Komponenten, nie den echten
Composition-Root — die spätere Reachability-Evidenz wäre wertlos (Reality-Ledger-Bruch).
**Schärfung:** Ein Real-Boundary-Smoke mountet über `src/App.tsx`/`main.tsx` (echte Provider-Kette
`I18nProvider→ShopStoreProvider→AuthProvider`) und beweist, dass die App ohne Crash bootet. `[REAL-BOUNDARY]`.

**Testfälle (Infra-Verifikation):**
- **AT-014-1** `[UNIT]` AK-1: `vitest`+`playwright` als devDeps installiert; `package.json`-Scripts `test`/`test:unit`/`test:e2e` vorhanden und starten lokal.
- **AT-014-2** `[UNIT]` AK-2: `tests/**`-Struktur existiert; Exit-Code ≠ 0 bei Fehler (CI-fähig).
- **AT-014-3** `[REAL-BOUNDARY]` AK-3: Smoke rendert über `App.tsx` (echte Provider) → kein Crash; mind. eine Route rendert. **Deps pinnen + `npm audit`** (Security-Matrix §5 Supply-Chain).

## REQ-015 — Money-Path-Tests (Server-Re-Preisung + Versand)

**Beat 0:** `boundary` (deckt REQ-001/002/003 über echte Express-App ab — der GBrain-class-Kern).
**These:** „Der Money-Path ist getestet."
**Gegenthese (Vision §7.2):** Die Tests laufen gegen einen Stub, der den Clientwert zurückspiegelt →
grün, Loch offen. **Genau das ist verboten.**
**Schärfung:** REQ-015-Suite fährt den **realen** `/api/checkout`-Pfad (supertest gegen die echte App),
nur das Stripe-SDK ist gestubbt; Tampering-Tests sind **rot ohne Fix, grün mit Fix**. `[INTEGRATION-FAKE]`.

**Testfälle** (vitest + supertest; Stripe gestubbt; **kein** echter Key):
- **AT-015-1** = AT-001-1 (manipulierter `unitAmount` → Serverpreis im Stripe-Line-Item).
- **AT-015-2** = AT-001-3 (unbekannte Produkt-/Varianten-ID → `4xx`, keine Session).
- **AT-015-3** = AT-002-1 (`shippingCents:0` versandpflichtig → server-berechneter Versand in Session).
- **AT-015-4** AK-4: Stripe gemockt/gestubbt; Test importiert **keinen** echten Key; grep-Guard, dass kein Secret im Testcode steht.
- **AT-015-5** = AT-003-1/2/3 (Regression REQ-003-Invarianten: Chunking, Gast/Account, Clamping).
- **AT-015-6** (Failure-Mode-Guard): **rot-ohne-Fix** — gegen den heutigen `server/index.js:202`-Stand schlägt AT-015-1 fehl (Beweis, dass der Test das Loch wirklich fängt; als dokumentierter erwarteter RED-Lauf vor T-03).

**Reality-Ledger:** höchste Evidenz = `integration-fake`; reale Stripe-Session bleibt RED (außerhalb Run).

## REQ-016 — Truthful-Claims-Tests

**Beat 0:** `boundary` (deckt REQ-004/005/006/007/018 ab; teils gerenderte DOM-Offenlegung).
**These:** „Truthful-Claims sind dauerhaft gesichert."
**Gegenthese:** Scans laufen gegen Demo-Strings, nicht gegen die ausgelieferten Keys; oder der
Noon-Fallback-Test prüft nur das Flag, nicht die gerenderte Offenlegung in allen Sprachen.
**Schärfung:** Alle Scans laufen über das **reale** `translations`/`catalog`-Objekt; der
Noon-Fallback-Test prüft Flag (Unit) **und** gerenderte Offenlegung (Playwright, EN/DE/FR). `[UNIT]` + `[REAL-BOUNDARY]`.

**Testfälle:**
- **AT-016-1** `[REAL-BOUNDARY]` AK-1: = AT-004-1 (Input-Durchreichung im realen Payload, kein „Bild-mit-Ort"-Test).
- **AT-016-2** `[UNIT]` AK-2: = AT-005-1 (Präzisions-/API-Verbotsliste über EN/DE/FR).
- **AT-016-3** `[UNIT]` AK-3: = AT-006-1 (Heilversprechen-Verbotsliste über TCM/Wuxing-Strings).
- **AT-016-4** `[UNIT]`+`[REAL-BOUNDARY]` AK-4: = AT-007-1/2 (Legal DE/FR vorhanden + `[MISSING]` erhalten).
- **AT-016-5** `[UNIT]`+`[REAL-BOUNDARY]` AK-5: = AT-018-1/2/3/5 (Noon-Fallback `12:00` deterministisch + Flag im Payload + Offenlegung rendert EN/DE/FR an Feld + Zusammenfassung).

## REQ-017 — Conformance-Smoke-Tests

**Beat 0:** `boundary` (deckt REQ-008/009/010/011/013 über `App.tsx` ab; reale Breakpoints).
**These:** „Die V2-Konformität ist verifiziert."
**Gegenthese (Vision §7.6):** Smoke prüft isolierte Renders, nicht den Composition-Root → „grün, aber
nicht verdrahtet"; oder Mobile wird nie auf realen Breakpoints geprüft (Horizontal-Scroll unbemerkt).
**Schärfung:** Alle Conformance-Smokes laufen über `src/App.tsx` auf realen Breakpoints 360/390/430;
Negativnachweis Saju/Junishi. `[REAL-BOUNDARY]`.

**Testfälle** (playwright):
- **AT-017-1** `[REAL-BOUNDARY]` AK-1: = AT-010-1 + AT-011-1 (alle MVP-Collection-Routen + `/inspiration` über `App.tsx` reachable).
- **AT-017-2** `[REAL-BOUNDARY]` AK-2: = AT-008-1 (Home Module 1–13 DOM-Order über `App.tsx`).
- **AT-017-3** `[REAL-BOUNDARY]` AK-3 (NFR-3/4): Breakpoints 360/390/430 — kein Horizontal-Scroll (`document.scrollingElement.scrollWidth ≤ clientWidth`); Drawer/Mega-Menü bedienbar.
- **AT-017-4** `[REAL-BOUNDARY]` AK-4: = AT-NEG-SAJU (keine Saju/Junishi-Strings/Routen).

---

# Querschnitt: Failure-Modes als konkrete falsifizierende Tests / Blocker

Jede Form aus **Vision §7** + Canvas-Amendments wird ein konkreter Test (oben verlinkt) ODER ein
expliziter Blocker — keine bleibt Prosa:

| Vision §7 / Amendment Failure-Mode | Falsifizierender Test / Blocker |
|---|---|
| §7.1 Fake-Chart als akkurat ausliefern | **AT-004-4** (RED-Linie gepinnt) + Reality-Ledger-Pflicht: `bazi-chart` bleibt `*-fake`; **Blocker `BLK-RED-BAZI`**, falls ein Report `bazi.ts` als „fertige Engine" deklariert. |
| §7.2 Über 1-Cent-Loch verkaufen / Re-Pricing nur gespiegelt / nur gegen Mock | **AT-001-1/2/3**, **AT-015-1..3/6** (echter Pfad, Stripe gestubbt, rot-ohne-Fix). |
| §7.3 TCM-Heilversprechen / grenzwertig unentschärft | **AT-006-1/2** (inkl. „nachweislich beruhigend" `catalog.ts:199`). |
| §7.4 Hero für Spec-Treue regrediert | **AT-008-2** + **AT-021** (LCP-Guard) bzw. **Blocker `BLK-MEASURE-LCP`** (NFR-1, `MEASURE_NEEDED`). |
| §7.5 Eingabe-Verwerfung launderieren / FAQ „-ort berechnet" / stiller Noon-Default | **AT-004-1**, **AT-005-2**, **AT-018-1/2/3**. |
| §7.6 Scheinbare Reachability (nicht in `App.tsx` verdrahtet) | **AT-010-1**, **AT-011-1**, **AT-017-1/2** (alle über `App.tsx`). |
| §7.7 Erfundener Inhalt als echt (Preise/Bilder/Operator-Daten) | **AT-007-2** (`[MISSING]` erhalten), **AT-011-3** (Platzhalter markiert), **AT-013-4** (keine erfundenen Preise). |
| Amendment B `shippingCents` manipulierbar | **AT-002-1/2/3**. |
| Council/Negativ: kein Saju/Junishi | **AT-NEG-SAJU** (s. u.). |

## AT-NEG-SAJU — globaler Negativtest (REQ-008 AK-4 / REQ-010 AK-4 / REQ-017 AK-4 / VCHK-08)

- **AT-NEG-SAJU-1** `[UNIT]`: Daten-/i18n-Scan über `catalog.ts`, `translations.ts`, Routen-Tabelle in `App.tsx` → **kein** aktives `saju`/`junishi` in Route/Daten/SEO (Code-Kommentare ausgenommen).
- **AT-NEG-SAJU-2** `[REAL-BOUNDARY]`: Playwright crawlt erreichbare Routen über `App.tsx` → kein Saju/Junishi im gerenderten DOM/SEO-Block; `/collections/saju*` → 404.

## AT-021 — Performance-Guard Hero/InkWave-LCP (NFR-1/2 / VCHK-07)

**Beat 0:** `boundary` (gemessene Performance am gerenderten Hero).
**Schärfung:** LCP-Messung der Home über `App.tsx` (Playwright/Lighthouse) **vs. Baseline-Commits**
`0133437`/`0f8995c`/`d56de04`; Lazy-Three.js-Split + Reduced-Motion-Fallback erhalten.
- **AT-021-1** `[REAL-BOUNDARY]`: LCP nach Modulfolge-Umbau ≤ Baseline-LCP (kein Regress). **Blocker
  `BLK-MEASURE-LCP`:** konkrete Schwelle ist `MEASURE_NEEDED` (`OQ-008`) — bis eine Baseline-Messung
  vorliegt, gilt „keine Regression ggü. Baseline" als Guard; fehlt die Messung, ist dies ein
  **expliziter Blocker**, nicht stillschweigend grün.
- **AT-021-2** `[REAL-BOUNDARY]`: `prefers-reduced-motion: reduce` → InkWave rendert statisches Fallback (keine Loops); Lazy-`InkWave`-Chunk bleibt code-split (`Home.tsx:6`).

---

# Blocker-Register (offen, an `plumbline-watcher`/Lead zu routen)

- **BLK-MEASURE-LCP** (NFR-1, `OQ-008`/`MEASURE_NEEDED`): keine konkrete LCP-Schwelle definiert. AT-021
  läuft als Baseline-Vergleichs-Guard; absolute Schwelle = `value-risk`/`MEASURE_NEEDED`.
- **BLK-RED-BAZI** (Vision §7.1, ADR-002): `bazi-chart` bleibt `*-fake`/RED für ACCURACY; reale
  Berechnungs-API außerhalb Run. Escalation-Asymmetrie: **nur der Nutzer** darf dies herabstufen.
- **BLK-STRIPE-REAL** (ADR-001, Ledger §50): reale Stripe-Session-Verifikation gegen echte Keys ist im
  Run nicht erreichbar → Money-Path-Evidenz max. `integration-fake`. RED bleibt sichtbar.
- **BLK-INFRA** (REQ-014): Test-Infra ist noch nicht installiert (T-01, Phase 2) — diese Verträge sind
  entworfen, **nicht ausgeführt**; Coverage/Mutation-Baseline = 0.

# Abhängigkeits-/Ausführungs-Reihenfolge der Suiten

T-01 (Infra) → REQ-015 (Money-Path, rot-ohne-Fix vor T-02/03/04) → REQ-016 (Truthful) → REQ-017
(Conformance, nach SECURITY+TRUTHFUL grün). REQ-013 (`pure`) jederzeit. AT-021/AT-NEG-SAJU global.
