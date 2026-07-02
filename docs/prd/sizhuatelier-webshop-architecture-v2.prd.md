# PRD — SizhuAtelier Webshop Architektur V2 (Konformitäts-/Lückenschluss-Pass)

- **Feature Slug:** `sizhuatelier-webshop-architecture-v2`
- **Status:** `user-confirmed`
- **confirmed-by-user:** `yes — 2026-06-22`
- **Erstellt:** 2026-06-22 · Rolle `requirements-analyst` · Methodik `ai-native-prd-architect` · Modus CORE
- **Canvas (verbindlich, user-confirmed):** [`docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md`](../canvas/sizhuatelier-webshop-architecture-v2.canvas.md)
- **Raw-Brief (SRC-001..005):** `~/Downloads/sizhuatelier_webshop_architektur_exact_v2.md`
- **Run-State:** [`docs/context/state.md`](../context/state.md)
- **Branch:** `feat/personalization-first-mvp`

> Diese PRD wurde am **2026-06-22 vom Nutzer bestätigt** („ja passt") nach Auflösung von ASM-001
> und ASM-002 (siehe Ledger §8 / ADR-001 / ADR-002). Kein Agent hat sie selbst bestätigt. Phase 0
> ist abgeschlossen, sobald **PRD UND Product Vision** user-confirmed sind — beide sind es nun
> (2026-06-22). Entwicklung folgt der Council-Priorisierung (SECURITY + TRUTHFUL-CLAIMS vor
> V2-CONFORMANCE).

---

## 0. Ziel & Repository (Restatement)

**Ziel:** Konformitäts-/Lückenschluss-Pass auf einem **bestehenden, ~70 % gebauten** Custom-Stack-Shop
(React 19 + Vite + react-router 7 + Express + Stripe, optional Postgres, i18n EN/DE/FR). **Kein
Rebuild.** Performance-getunter Bestandscode (Hero/InkWave, Code-Splitting, Compression,
Asset-Caching — Commits `0133437`, `0f8995c`, `c6905bb`, `d04c451`, `d56de04`) bleibt erhalten und
darf nicht regredieren.

**Drei wertstiftende Lücken + Test-Fundament — „Alles zusammen" (Council-Amendments A–E):**
1. **SECURITY** — `/api/checkout` vertraut Client-Preis (`server/index.js:197-204`) und
   Client-Versand (`server/index.js:194,215-217`) → 1-Cent-Checkout möglich.
2. **TRUTHFUL-CLAIMS** — Geburtsort wird erhoben/angezeigt/gespeichert, aber von `computeChart()`
   (`bazi.ts:26`) verworfen → aktive Falschdarstellung; plus Copy, die eine „100 % exakte
   mathematische BaZi-Berechnung" / „Präzisions-API" behauptet, die nicht existiert; plus
   TCM/Wuxing-Heilversprechen-Risiko; plus DE/FR-Lokalisierung vorhandener Rechtstexte.
3. **V2-CONFORMANCE** — Homepage-Modulfolge weicht von 1–13 ab; kein echtes Mega-Menü; keine
   per-Welt-Collection-Routen; keine Inspiration/Gallery-Seite; kein Home-SEO-Textblock.
4. **TESTS** — Es existiert **keine** Test-Infrastruktur (kein `vitest`/`playwright`, kein
   `test`-Script in `package.json`). Money-Path & Truthful-Claims zuerst, dann Konformität.

**Council-Priorisierung (verbindlich):** SECURITY + TRUTHFUL-CLAIMS **vor** kosmetischer
V2-CONFORMANCE bauen, obwohl alles im Scope ist.

---

## 1. Scope / Non-Goals / Allowed-Change-Scope (PRIL Scope Guard)

### 1.1 Im Scope (Dateien)
- `src/pages/**`, `src/components/**`, `src/sections/**` — UI/Seiten/Module (Modulfolge, Mega-Menü, Collections, Inspiration, SEO-Block).
- `src/lib/catalog.ts`, `src/lib/tokens.ts`, `src/i18n/translations.ts` — Content/Tokens/i18n inkl. Copy-Reframe + DE/FR-Lokalisierung vorhandener Rechtstexte.
- `src/lib/bazi.ts` — **eng begrenzt:** `computeChart`-Signatur nimmt `place`/`date`/`time`/`birthTimeUnknown` an und reicht sie sauber durch (verwirft sie nicht); Noon-Fallback (12:00) bei unbekannter Zeit. Output bleibt **Platzhalter** (RED für ACCURACY). **Kein** echter Engine-Ausbau (`OQ-004`).
- `src/lib/legal.ts` — DE/FR-Lokalisierung der vorhandenen Templates (Operator-Daten bleiben `[MISSING]`).
- `server/index.js` — **nur** Route `app.post('/api/checkout', …)` (`L191-253`): server-autoritative Re-Preisung + Versand. Auth/Newsletter/Credits/Address-Logik **nicht** anfassen.
- **Test-Infrastruktur neu** (`tests/**`, `vitest`- + `playwright`-Config, `package.json`-Scripts).

### 1.2 Außerhalb des Scopes (ohne separate Freigabe nicht anfassen)
- **Echte BaZi-Engine** (korrekte Vier-Säulen-/Solar-Term-Berechnung) — `OQ-004`, Platzhalter bleibt RED-geführt.
- `server/index.js` jenseits der Checkout-Route; **DB-Schema-Änderungen**.
- **Rechtstext-Inhalte / Operator-Daten** (Firmenname, USt-ID, Gerichtsstand, reale Preise, Fulfillment, Carrier) — Operator liefert separat (`OQ-002/003/005`).
- Echte Produktbilder/Mockups (`OQ-006`), finale SEO-Keyword-Recherche (`OQ-007`), Saju/Junishi (bleiben entfernt).
- Analytics mit Fake-Daten.

### 1.3 Reality-Ledger (RED-Items in jedem Report sichtbar halten)
- `bazi-chart`: Platzhalter-Mathematik bleibt — **RED für ACCURACY** bis die reale Berechnungs-API verbunden ist. Die Eingaben (Ort/Datum/Zeit + Zeit-unbekannt-Flag) sind **genuin** und werden sauber für die geplante API erfasst/durchgereicht (REQ-004) + Copy reframed + Noon-Fallback offengelegt (REQ-005/REQ-018) → die *Verwerfungs-Täuschung* wird **geschlossen, nicht launderiert**. Kein variierendes Platzhalter-Bild (Poster = Platzhalter, gegenstandslos). Nie als „echte Engine fertig" berichten.
- `checkout-repricing`: Client-vertrauter Preis — **RED bis fixiert + getestet**.
- `tests`: keine — Coverage/Mutation-Baseline = 0.

---

## 2. Actors
- **A1 Käufer:in B2C** — personalisierte Wandkunst (Geschenk, Paare, Selbstreflexion).
- **A2 TCM-Praktiker:in / Lernende** — TCM/Wuxing-Fachposter, Direktkauf, nicht personalisiert.
- **A3 Operator** — liefert reale Rechtsdaten/Preise/Bilder/Fulfillment separat (außerhalb Run).
- **A4 Angreifer:in** — manipuliert Cart-Payload (Preis/Versand) gegen `/api/checkout`.
- **A5 Autonomes Agenten-Team** — baut gegen diese PRD + Traceability-Matrix.

---

## 3. Anforderungen (REQ-001..REQ-018)

Buckets: **SECURITY · TRUTHFUL-CLAIMS · V2-CONFORMANCE · TESTS**.
Jeder REQ trägt alle **sechs** Canvas-Traceability-Pflichtfelder. `canvas-link` ist für alle:
`docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md`.
`canvas-risk-status ∈ {aligned | value-risk | non-goal-violation | risk-introduced | blocked}`.

---

### Bucket: SECURITY

#### REQ-001 — Server-autoritative Re-Preisung in `/api/checkout`
- **User Story:** Als Operator (A3) will ich, dass der Serverpreis aus einer autoritativen Preisquelle stammt, damit eine manipulierte Cart-Payload (A4) keinen unterpreisigen Kauf erlaubt.
- **Priorität:** MVP
- **Akzeptanzkriterien (Given/When/Then):**
  - **AK-1:** *Given* ein Cart-Item mit gültiger Produkt-/Varianten-Identität, *when* `POST /api/checkout`, *then* berechnet der Server den `unit_amount` **ausschließlich** aus einer server-seitigen Preisquelle (Produkt-/Varianten-ID → Cent), **nicht** aus `it.unitAmount` (`server/index.js:202`).
  - **AK-2:** *Given* eine Payload mit manipuliertem `unitAmount` (z. B. `1`), *when* Checkout, *then* ist der an Stripe übergebene `unit_amount` der autoritative Serverpreis, **unbeeinflusst** vom Clientwert (maschinen-prüfbar: Stripe-`line_items[].price_data.unit_amount` == Serverpreis).
  - **AK-3:** *Given* eine Payload mit unbekannter Produkt-/Varianten-Identität, *when* Checkout, *then* antwortet der Server `4xx` mit Fehlercode und erstellt **keine** Stripe-Session.
  - **AK-4 (Konsistenz):** Die server-seitige Preisquelle stimmt mit den im Client angezeigten Platzhalterpreisen überein (`catalog.ts` Poster-`price` + `bazi.ts` `sizes[].delta`; `Personalize.tsx` `PRODUCT_TYPES[].basePrice` + `PDF_ADDON_PRICE`), bis der Operator reale Preise liefert (`OQ-002`). Diskrepanz = Testfehler.
- **canvas-problem:** Preis-Manipulation: `/api/checkout` vertraut Client-`unitAmount` → 1-Cent-Checkout möglich (Risk §8 / Amendment B).
- **canvas-target-user:** Operator (A3) / alle Käufer:innen (Vertrauensschutz des Kaufpfads).
- **canvas-value-claim:** „Sicherer Checkout" (Trust-Bullet, Raw §11 / §14 Gate „Checkout").
- **canvas-success-signal:** Kein Checkout zu einem vom Client diktierten Preis möglich (negativer Nachweis).
- **canvas-risk-status:** `risk-introduced` (bestehendes Sicherheitsrisiko, das geschlossen wird).

> **Identitäts-Mapping — RESOLVED (ASM-001, user-confirmed 2026-06-22; ADR-001):** Der
> Client-Payload sendet künftig **`productId` + `variantId` (Size/Format/Frame)** zusätzlich
> (`checkout.ts:33-39` wird erweitert; aktuell keyt es Lines nur per Title). Der Server schlägt
> damit den autoritativen Unit-Preis + Versand in einer **server-eigenen Preisquelle** nach
> (vorerst die bestehenden Platzhalterpreise, bis der Operator reale liefert, `OQ-002`).
> Entscheidung dokumentiert in [`docs/architecture/adr-001-server-repricing.md`](../architecture/adr-001-server-repricing.md). Ändert das Client-Checkout-Interface bewusst und **entblockt** T-02/T-03.

#### REQ-002 — Server-berechneter Versand in `/api/checkout`
- **User Story:** Als Operator will ich den Versand server-seitig bestimmen, damit der Client den Versandbetrag (`shippingCents`, `server/index.js:194,215-217`) nicht fälschen kann.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** *Given* einen Checkout-Request, *when* `POST /api/checkout`, *then* ermittelt der Server die Versandkosten autoritativ und **ignoriert** das Client-Feld `shippingCents`.
  - **AK-2:** Die Server-Versandlogik repliziert die bestehende, dokumentierte Regel: Region via CDN-Header (`/api/region`, `server/index.js:180-188`); EU-Schwelle `FREE_SHIP_THRESHOLD = 80` (`tokens.ts:35`); US/UK frei; sonst `4.90` über Schwelle frei (`ShopStore.tsx:104-106`). Diskrepanz Client↔Server = Testfehler.
  - **AK-3:** *Given* `shippingCents: 0` bei einem versandpflichtigen Warenkorb, *when* Checkout, *then* enthält die Stripe-Session den server-berechneten Versand (nicht 0).
- **canvas-problem:** `shippingCents` ist client-seitig und manipulierbar (Risk §8 / Amendment B).
- **canvas-target-user:** Operator (A3) / Käufer:innen.
- **canvas-value-claim:** „Keine versteckten Kosten vor Warenkorb" / „Sicherer Checkout" (§14 Gate „Checkout").
- **canvas-success-signal:** Versandbetrag in der Stripe-Session ist server-bestimmt, client-unabhängig.
- **canvas-risk-status:** `risk-introduced`.

#### REQ-003 — Keine Regression bestehender Checkout-Sicherheits-/Funktions-Invarianten
- **User Story:** Als Operator will ich, dass die Re-Preisung die bestehenden Checkout-Garantien nicht bricht (Personalisierungs-Metadaten, Gast/Account-Pfad, Locale).
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Personalisierungs-Metadaten-Chunking (`buildPersonalizationMetadata`, `server/index.js:740-750`) bleibt funktional (Couple-Cart > 500 Zeichen verliert keine Geburtsdaten).
  - **AK-2:** Gast-Pfad (`customer_email`) und Account-Pfad (`customer`) bleiben sich gegenseitig ausschließend wie bisher (`server/index.js:236-240`).
  - **AK-3:** Mengen-Clamping `1..99` (`server/index.js:203`) und Leer-Cart-`400` (`L195`) bleiben erhalten.
- **canvas-problem:** Änderung der Checkout-Route darf bestehende, getestete Garantien nicht verlieren (Scope-Disziplin §10).
- **canvas-target-user:** Operator (A3) / Käufer:innen.
- **canvas-value-claim:** Personalisierungsdaten erreichen das Fulfillment vollständig (Kernwert §4).
- **canvas-success-signal:** Bestehende Checkout-Invarianten bleiben grün nach Re-Preisung.
- **canvas-risk-status:** `aligned`.

---

### Bucket: TRUTHFUL-CLAIMS

#### REQ-004 — Personalisierungs-Eingaben vollständig erfassen + sauber für die geplante Berechnungs-API durchreichen
- **User Story:** Als Käufer:in (A1) will ich, dass die von mir verlangten Eingaben (Geburts-**Ort**, **Datum**, **Zeit** + ein „Geburtszeit-unbekannt"-Flag) vollständig erfasst und im Personalisierungs-Payload / in den Cart-Metadaten **sauber mitgeführt** werden, damit die geplante Chart-Berechnungs-API (Ort+Datum+Zeit → persönliches Geburtsbild) später ohne Datenverlust andocken kann — und damit der Shop nichts erhebt, anzeigt und speichert, das es heimlich verwirft.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1 (Erfassung + Durchreichung):** *Given* eine Personalisierung mit Ort/Datum/Zeit (+ optionalem „Zeit-unbekannt"-Flag), *when* der Personalisierungs-Payload erzeugt und in den Cart/Checkout übergeben wird, *then* enthält der Payload / die Cart-Metadaten **alle** Felder (`place`, `date`, `time`, `birthTimeUnknown`) deterministisch und **ohne stillen Verlust**. Maschinen-prüfbar: die übergebene Metadaten-Struktur enthält die vier Felder mit den eingegebenen Werten.
  - **AK-2 (Aufrufstellen reichen `place` durch):** Die Eingabe-`place` wird an allen Stellen mitgeführt statt verworfen: `Personalize.tsx:89`, `ProductView.tsx:26`, `catalog.ts:29` (`mk`). `computeChart` (`bazi.ts:26`) erhält `place`/`birthTimeUnknown` als Parameter und **verwirft sie nicht** (Signatur nimmt die Inputs an; die Chart-Ausgabe bleibt Platzhalter, siehe AK-4).
  - **AK-3 (Determinismus):** Gleiche (date, time, place, birthTimeUnknown) → gleiche erfasste/durchgereichte Struktur (Snapshot-/Property-Test).
  - **AK-4 (Platzhalter-Grenze, RED):** `computeChart` bleibt eine **Platzhalter-Berechnung** — RED für ACCURACY (`OQ-004`). Es wird **kein** echter Engine-Ausbau vorgenommen und **nicht** behauptet, der Ort liefere astronomisch korrekte Astrologie (siehe REQ-005). Die Poster sind Platzhalter; ein „Ort variiert das Platzhalter-Bild sichtbar" ist **nicht** Teil dieser REQ (gegenstandslos, da Poster = Platzhalter). Der Wert liegt in der **sauberen Erfassung/Durchreichung** für die geplante API, nicht in einem variierenden Vorschaubild. `bazi.ts` bleibt RED-geführt, bis die reale API verbunden ist (nie als „fertig" berichten).
- **canvas-problem:** Geburtsort (+ Datum/Zeit) verlangt+angezeigt+gespeichert, aber von `computeChart()` verworfen → aktive Falschdarstellung (Amendment A). Auflösung: Inputs sind **echte** Eingaben für eine geplante Berechnungs-API und werden sauber durchgereicht (nicht still verworfen).
- **canvas-target-user:** Käufer:in personalisierter Produkte (A1).
- **canvas-value-claim:** „Dein Geburtsmoment … als Kunstwerk" (Kernwert §4) darf nicht hohl sein — die Eingaben sind genuin und werden für die geplante API getragen.
- **canvas-success-signal:** Ort/Datum/Zeit + Zeit-unbekannt-Flag sind im Personalisierungs-Payload / in den Cart-Metadaten nachweisbar vorhanden und werden nicht still verworfen (negativer Nachweis gegen die Verwerfung).
- **canvas-risk-status:** `value-risk` (Kernwert vs. Fake-Boundary wird geschlossen; Chart bleibt RED bis API verbunden).

> **ASM-002 — RESOLVED (user-confirmed 2026-06-22, „ja passt"; ADR-002):** Die Geburts-Eingabefelder
> (Ort/Datum/Zeit) **bleiben** — sie sind die **genuinen** Inputs für eine **geplante**
> Hintergrund-Berechnungs-API (Ort+Datum+Zeit → persönliches Geburtsbild). **Kein** Entfernen des
> Ortsfelds. **Kein** „Ort variiert das Platzhalter-Bild sichtbar" (gegenstandslos, da Poster =
> Platzhalter). Stattdessen: Payload muss `place`/`date`/`time` + `birthTimeUnknown`-Flag sauber
> erfassen und durchreichen, damit die künftige API andocken kann. `bazi.ts` bleibt Platzhalter,
> RED für ACCURACY, bis die reale API verdrahtet ist. (Siehe auch REQ-018: Noon-Fallback-Offenlegung.)

#### REQ-005 — Copy-Reframe: keine Behauptung einer exakten BaZi-Berechnungs-Engine/-API
- **User Story:** Als Käufer:in will ich keine Werbung, die eine „100 % exakte mathematische BaZi-Berechnung" / „Präzisions-API" verspricht, die das Produkt nicht hat.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Folgende belegten Falsch-/Übertreibungs-Claims in `src/i18n/translations.ts` werden entschärft (alle drei Sprachen EN/DE/FR): `announce.freeActivated` „…100 % exakte mathematische BaZi-Berechnung" (`:248`); „Präzisions-API / Exakte mathematische Berechnung" (`:275`, `:285`); „Präzise API-Berechnung … exakt deine Vier Säulen" (`:285`); „eigene Berechnungs-API … präzise, konsistent" (`:355`, `:363`, `:364`, `:370`); „dedizierte API … Chart-Logik" (`:401`).
  - **AK-2:** Ersatz-Framing entlang Canvas-Vorgabe: „personalisiertes symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten" (sinngemäß, kein wörtlicher Zwang). Maschinen-prüfbar: ein Truthful-Claims-Test scannt die i18n-Strings gegen eine **Verbots-Phrasenliste** und schlägt fehl, wenn eine verbleibt.
  - **AK-3:** Die FAQ-Behauptung „Aus Geburtsdatum, -zeit und **-ort** werden die vier Säulen **berechnet**" (`:466`, `shopFaqs` in `catalog.ts:226`) wird **reformuliert**, da der Chart Platzhalter bleibt (keine echte Berechnung im Run, REQ-004 AK-4). Erlaubtes Framing: die Eingaben (Ort/Datum/Zeit) werden **erfasst und fließen in die Personalisierung / die geplante Berechnung ein** — ohne „exakt berechnet" zu behaupten. Test koppelt FAQ-Wortlaut an die Verbots-Phrasenliste (kein „berechnet/exakt"-Claim am Platzhalter).
  - **AK-4:** Keine neuen unbelegten Präzisions-Claims werden eingeführt (Verbotsliste gilt auch für neue Strings).
  - **AK-5 (Noon-Fallback-Offenlegung in der Copy):** Die EN/DE/FR-Copy macht die 12:00-Uhr-Annahme bei unbekannter Geburtszeit transparent (Kopplung an REQ-018). Es darf **keine** Copy ausgeliefert werden, die ein präzises/exaktes berechnetes BaZi-Chart suggeriert, während die Geburtszeit auf den Noon-Fallback gesetzt wurde. Der Hinweis (sinngemäß „Wenn die Geburtszeit unbekannt ist, verwenden wir 12:00 Uhr — das kann das Ergebnis beeinflussen.") ist Teil des ehrlichen Framings.
- **canvas-problem:** Copy behauptet exakte Engine/API, die nicht existiert (Amendment A, Kontradiktion §8 CONTRA-CANDIDATE-2); zusätzlich muss der Noon-Fallback (REQ-018) ehrlich kommuniziert werden.
- **canvas-target-user:** Käufer:in (A1).
- **canvas-value-claim:** Premium/ehrlich statt irreführend (§4 „ruhig, kuratiert").
- **canvas-success-signal:** Verbots-Phrasenliste findet keine exakte-Berechnung-/API-Claims mehr; Noon-Fallback-Hinweis ist in EN/DE/FR vorhanden.
- **canvas-risk-status:** `value-risk`.

> **UWG-Rationale (RESOLVED, user-confirmed 2026-06-22, „ja passt"):** Die ursprüngliche
> „collect-display-discard"-Sorge (UWG §5 / aktive Falschdarstellung) wird **nicht** durch ein
> variierendes Platzhalter-Bild gelöst (Poster sind Platzhalter → gegenstandslos), sondern durch drei
> Mechanismen: **(a)** die Eingaben sind **genuin** für die geplante Berechnungs-API und werden sauber
> erfasst/durchgereicht (REQ-004); **(b)** ehrliches Framing — keine Behauptung einer exakten
> Engine/API (REQ-005 AK-1..4); **(c)** Offenlegung des Noon-Fallbacks bei unbekannter Geburtszeit
> (REQ-005 AK-5 + REQ-018). Damit wird die Täuschung **geschlossen, nicht launderiert** — der
> Platzhalter-Status von `bazi.ts` bleibt RED-geführt.

#### REQ-006 — TCM/Wuxing Health-Claim-Sweep (keine Heilversprechen)
- **User Story:** Als Operator will ich, dass TCM/Wuxing-Inhalte kein Heilversprechen enthalten (HWG/UWG/EU-Risiko), damit der Launch nicht rechtlich gefährdet ist.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Ein Content-Sweep prüft alle TCM/Wuxing-Strings in `translations.ts`, `catalog.ts` (Produkt-`bullets`, `articles`, `shopFaqs`) gegen eine **Heilversprechen-Verbotsliste** (z. B. „heilt", „heilen", „lindert Krankheit", „therapiert", „cures", „treats", „guérit") und schlägt bei Treffern fehl.
  - **AK-2:** Bestehende grenzwertige Formulierungen (z. B. „nachweislich beruhigend", `catalog.ts:199`) werden geprüft und, falls als Heil-/Wirkungsversprechen einzuordnen, entschärft (z. B. „wirkt ruhig/atmosphärisch").
  - **AK-3:** TCM/Wuxing-Poster werden konsistent als „kuratierte Wissens-/Fachgrafiken" gerahmt (Canvas §2.2, Raw §3.3/§12.2).
- **canvas-problem:** TCM/Wuxing-Health-Claims = HWG/EU-Risiko (Amendment C, §14 Gate „TCM Claims").
- **canvas-target-user:** Operator (A3) / TCM-Zielgruppe (A2).
- **canvas-value-claim:** Seriöse, regelkonforme Wissensposter (Non-Goal §7 „keine Heilversprechen").
- **canvas-success-signal:** Heilversprechen-Verbotsliste findet keine Treffer (Acceptance-Gate).
- **canvas-risk-status:** `non-goal-violation` (Non-Goal „Heilversprechen" wird aktiv abgesichert).

#### REQ-007 — DE/FR-Lokalisierung vorhandener Rechtstexte (Struktur, ohne Operator-Daten)
- **User Story:** Als DE/FR-Käufer:in will ich die Rechtstexte in meiner Sprache lesen, statt auf englischen Templates zu landen.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Die vorhandenen Legal-Templates (`src/lib/legal.ts`: `impressum`, `privacy`, `terms`, `returns`, `shipping`) erhalten DE- und FR-Fassungen; die Auswahl folgt der aktiven Sprache (i18n).
  - **AK-2:** **Keine** Operator-Daten werden erfunden: alle `[MISSING — …]`-Platzhalter (`legal.ts:17`) bleiben in allen Sprachen als markierte Platzhalter erhalten (`OQ-005`).
  - **AK-3:** Die exakte Widerrufs-/Personalisierungs-Formulierung (`legal.ts:100-104`, `returnNotice` `translations.ts`) bleibt rechtlich-vorsichtig und semantisch identisch über die Sprachen.
  - **AK-4:** Ein Banner „professionelle Rechtsprüfung + Operator-Daten ausstehend" bleibt sichtbar (nicht launch-fertig, Canvas `OQ-005`).
- **canvas-problem:** DE/FR-Rechtstexte teils noch Englisch; reine Lokalisierung im Run (Amendment E).
- **canvas-target-user:** DE/FR-Käufer:innen (A1/A2).
- **canvas-value-claim:** Vertrauen/Transparenz im DACH/FR-Markt.
- **canvas-success-signal:** Legal-Seiten erscheinen lokalisiert; `[MISSING]`-Marker bleiben.
- **canvas-risk-status:** `aligned`.

#### REQ-018 — Geburtszeit-unbekannt-Handling: 12:00-Noon-Fallback + sichtbare Offenlegung
- **User Story:** Als Käufer:in (A1), die die eigene Geburtszeit nicht kennt, will ich, dass das System einen klaren, offengelegten Fallback verwendet — damit ich verstehe, dass eine Annahme getroffen wurde und das Ergebnis beeinflussen kann, statt heimlich eine Zeit zu unterstellen.
- **Priorität:** MVP
- **Akzeptanzkriterien (Given/When/Then):**
  - **AK-1 (Fallback gesetzt):** *Given* eine Personalisierung mit gesetztem „Geburtszeit-unbekannt"-Flag (`birthTimeUnknown = true`), *when* der Personalisierungs-Payload erzeugt wird, *then* setzt das System die verarbeitete Geburtszeit deterministisch auf **12:00 (Noon)** und führt das `birthTimeUnknown`-Flag im Payload / in den Cart-Metadaten mit (Kopplung an REQ-004 AK-1).
  - **AK-2 (Offenlegung am Eingabefeld):** *Given* der Käufer wählt „Geburtszeit unbekannt" (oder lässt das Zeitfeld leer mit aktiviertem Flag), *when* das Personalisierungs-Formular gerendert wird, *then* erscheint **sichtbar** ein Hinweis nahe der Geburtszeit-Eingabe, sinngemäß: „Wenn die Geburtszeit unbekannt ist, verwenden wir 12:00 Uhr — das kann das Ergebnis beeinflussen." (EN/DE/FR, REQ-005 AK-5 / NFR-6).
  - **AK-3 (Offenlegung in der Zusammenfassung):** *Given* `birthTimeUnknown = true`, *when* die Personalisierungs-/Cart-Zusammenfassung angezeigt wird, *then* ist die Noon-Annahme dort ebenfalls sichtbar offengelegt (kein stiller Default).
  - **AK-4 (kein präziser Claim bei Fallback):** *Given* der Noon-Fallback ist aktiv, *when* Copy ausgeliefert wird, *then* wird **nicht** ein präzises/exaktes berechnetes Chart suggeriert (Kopplung REQ-005 AK-5). Maschinen-prüfbar: ein Test prüft, dass bei gesetztem Flag (a) die verarbeitete Zeit `12:00` ist, (b) der Offenlegungs-Hinweis-Key in EN/DE/FR existiert und gerendert wird.
- **canvas-problem:** Unbekannte Geburtszeit erfordert eine Annahme; ein **stiller** Default wäre eine weitere „collect-display-discard"-/Verschweigungs-Täuschung (Amendment A, Truthful-Claims). Auflösung: offengelegter 12:00-Fallback.
- **canvas-target-user:** Käufer:in personalisierter Produkte ohne bekannte Geburtszeit (A1).
- **canvas-value-claim:** Ehrliche Personalisierung — der Shop legt Annahmen offen statt sie zu verbergen (§4 Ehrlichkeitsgrenze).
- **canvas-success-signal:** Bei gesetztem Flag ist die verarbeitete Zeit 12:00 **und** der Fallback ist am Eingabefeld + in der Zusammenfassung sichtbar offengelegt (EN/DE/FR).
- **canvas-risk-status:** `value-risk` (Ehrlichkeitsgrenze wird abgesichert; gegen stillen Default).
- **canvas-link:** `docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md`.

---

### Bucket: V2-CONFORMANCE

#### REQ-008 — Homepage-Modulfolge 1–13 ohne Hero/LCP-Regression
- **User Story:** Als Besucher:in (A1/A2) will ich die kuratierte Einstiegssequenz wie in der V2-Architektur, damit ich Angebot und Kaufpfad sofort verstehe.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** `Home.tsx` rendert die Sektionen in V2-Reihenfolge: 01 Utility-Bar (bereits global via `AnnouncementBar`), 02 Hero/InkWave, 03 Shop nach Produktwelt, 04 Bestseller/Featured-Slider, 05 So funktioniert es, 06 Featured Collection Fire Horse 2026, 07 Für Paare/Kompatibilität, 08 Analyse-PDFs, 09 Inspiration/Gallery, 10 Wissen-Teaser, 11 Trust-Block, 12 SEO-Textblock, 13 Newsletter/Footer. Aktueller Stand (`Home.tsx:131-141`): Hero → PathToPoster → CatalogSection → WissenSection → BundlesSection → FaqSection → NewsletterSection → weicht ab; fehlende Module ergänzen, Reihenfolge herstellen.
  - **AK-2 (NFR-gekoppelt, harte Nebenbedingung):** Hero/InkWave bleibt Modul 02; **keine LCP-Regression** (siehe NFR-1). Reduced-Motion-Fallback und das Lazy-Three.js-Splitting (`Home.tsx:6`, Commit `d56de04`) bleiben erhalten.
  - **AK-3:** ≤ 6 Hauptnav-Einträge bleiben gewahrt (Raw §5.2 / §16.1).
  - **AK-4:** Saju/Junishi erscheinen in keiner Sektion/Route/Daten (negativer Nachweis, Raw §3.1).
- **canvas-problem:** Homepage-Modulfolge weicht von V2 ab; Module fehlen (§1 reale Lücke).
- **canvas-target-user:** Besucher:in (A1/A2).
- **canvas-success-signal:** Homepage folgt Modulfolge 1–13; Hero/LCP nicht regrediert (Success §5).
- **canvas-value-claim:** Kuratierter, klarer Einstieg „premium, ruhig" (§4).
- **canvas-risk-status:** `aligned`.

#### REQ-009 — Echtes Mega-Menü (Shop / Kollektionen) statt einfachem Dropdown
- **User Story:** Als Besucher:in will ich ein nach Kaufintention strukturiertes Mega-Menü, damit ich schnell in die richtige Produktwelt finde.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Das aktuelle einfache „Collections"-Dropdown (`Navbar.tsx:157-167`, flache `shopLinks`-Liste `:13-22`) wird zu einem gruppierten Mega-Menü (Spalten: Personalisierte Poster, TCM Poster, Wuxing Poster, Analyse-PDFs, Bundles, Featured) gemäß Raw §6.1/§6.2.
  - **AK-2 (Mobile):** Auf Mobile als Drawer/Accordion (Tap, kein Hover), Touch-Ziele ≥ 44px (`Navbar.tsx:31` `HIT`), bestehender Drawer (`:195-224`) bleibt Grundlage.
  - **AK-3 (A11y, §14 Gate „Navigation"):** Tastatur bedienbar (Tab/Shift+Tab/Escape), `aria-haspopup`/`aria-expanded` korrekt; bestehendes Escape-Handling (`:113-115`) bleibt.
  - **AK-4:** Mega-Menü-Items verlinken auf die per-Welt-Collection-Routen aus REQ-010.
- **canvas-problem:** Kein echtes Mega-Menü, nur einfaches Dropdown (§1 reale Lücke).
- **canvas-target-user:** Besucher:in (A1/A2).
- **canvas-value-claim:** „Klare Architektur einer großen Posterplattform, aber ruhiger" (§4).
- **canvas-success-signal:** Mega-Menü strukturiert nach Kaufintention, Mobile-Drawer + Keyboard bedienbar.
- **canvas-risk-status:** `aligned`.

#### REQ-010 — Per-Produktwelt-Collection-Routen (MVP-Set)
- **User Story:** Als Besucher:in will ich pro Produktwelt eine eigene Collection-Seite (BaZi/TCM/Wuxing …), damit ich kuratiert browsen und SEO-Seiten existieren.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Folgende MVP-Routen sind über den Produktions-Composition-Root (`App.tsx`) erreichbar und rendern das Collection-Template: `/collections/bazi-posters`, `/collections/tcm-posters`, `/collections/wuxing-posters`, `/collections/personalized-posters`, `/collections/compatibility-posters`, `/collections/fire-horse-2026`, `/collections/analysis-pdfs`, `/collections/bundles` (Raw §8.5 P1 / §18).
  - **AK-2:** Aktuell existiert nur `/collections` (Hub, `App.tsx:64`) und `/tcm` (`:67`); die per-Welt-Routen werden ergänzt, gefiltert aus dem bestehenden `catalog.ts`-Bestand (kein erfundenes Sortiment).
  - **AK-3 (Inhalt, §16.4):** Jede MVP-Collection hat H1, Intro, Produktgrid, SEO-Textblock, FAQ, interne Links; keine leere/dünne Collection (Non-Goal §7).
  - **AK-4 (negativ):** Keine Saju/Junishi-Collection-Routen; keine Raum-Kategorie-Landingpages (Non-Goal §7 / Raw §8.5 „Nicht starten mit").
- **canvas-problem:** Keine per-Welt-Collection-Routen (nur `/tcm`) (§1 reale Lücke).
- **canvas-target-user:** Besucher:in (A1/A2).
- **canvas-value-claim:** Kuratierte Kaufpfade je Produktwelt (§4 / §6).
- **canvas-success-signal:** Jede MVP-Collection mit H1/Intro/Grid/SEO/FAQ/Links erreichbar; keine dünne Seite.
- **canvas-risk-status:** `aligned`.

#### REQ-011 — Inspiration/Gallery-Seite
- **User Story:** Als Besucher:in will ich eine Inspiration/Gallery-Wand (Mockups/Interior/Geschenkideen), damit ich Produkte im Kontext sehe.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Route `/inspiration` ist über `App.tsx` erreichbar und rendert eine kuratierte Galerie (vertikal mobil, 2-Spalten-Masonry ab Tablet) gemäß Raw §9 (Homepage-Modul) / Raw §18 (`/inspiration`).
  - **AK-2:** Jede Galerie-Kachel verlinkt auf eine passende Collection/Produktseite; keine überladene Wand.
  - **AK-3:** Echte Produktbilder fehlen (`OQ-006`) → Platzhalter-Kacheln sind als solche markiert; keine erfundenen „Kundenbeispiele" ohne Zustimmung (Raw §4 „nur mit Zustimmung").
  - **AK-4:** Das Homepage-Inspiration-Modul (REQ-008 Modul 09) verweist auf `/inspiration`.
- **canvas-problem:** Fehlendes Inspiration/Gallery-Modul (§1 reale Lücke).
- **canvas-target-user:** Besucher:in (A1/A2).
- **canvas-value-claim:** Produktkontext/Interior-Inspiration (§4).
- **canvas-success-signal:** `/inspiration` erreichbar, Kacheln verlinkt, Platzhalter markiert.
- **canvas-risk-status:** `aligned`.

#### REQ-012 — Homepage-SEO-Textblock (Modul 12)
- **User Story:** Als Besucher:in/Suchmaschine will ich einen maschinenlesbaren Erklärtext, der das Angebot klar definiert.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Homepage erhält Modul 12 (SEO-Textblock) mit H2-Struktur gemäß Raw §12 (z. B. „Personalisierte BaZi Poster online kaufen", „TCM Poster für Praxis, Wissen…", „Wuxing und die Fünf Elemente…").
  - **AK-2:** Interne Links zu Collections (REQ-010) und Wissensartikeln; kein Keyword-Stuffing.
  - **AK-3 (Truthful-Coupling):** Der SEO-Text enthält keine durch REQ-005/REQ-006 verbotenen Claims (Verbotslisten gelten auch hier).
  - **AK-4:** Finale Keywords fehlen (`OQ-007`) → Struktur korrekt, Keyword-Optimierung als Content-TODO markiert.
- **canvas-problem:** Fehlender Home-SEO-Textblock (§1 reale Lücke).
- **canvas-target-user:** Besucher:in / organische Auffindbarkeit.
- **canvas-value-claim:** Klare, maschinenlesbare Angebotsdefinition (§5 Success).
- **canvas-success-signal:** Modul 12 vorhanden mit H2-Struktur + internen Links, claim-konform.
- **canvas-risk-status:** `aligned`.

#### REQ-013 — Datenmodell-Konformität: V2-Produktfelder additiv auf `catalog.ts`
- **User Story:** Als Entwickler:in/Agent will ich die V2-Produktdimensionen (`product_world`, `personalization_level`, `use_case`, `design_family`) am Bestandskatalog, damit Collections/Filter konsistent darauf aufbauen.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** `Product` (`catalog.ts:7-25`) wird **additiv** um `product_world ∈ {bazi,tcm,wuxing,mixed}`, `personalization_level ∈ {single,couple,yearly,none}`, `use_case`, `design_family ∈ {minimal,japandi,wabi_sabi,classic_ink}` erweitert (Raw §11.1). Bestehende Felder (`category`, `personalizable`, `usage`, `image`, `poster`) bleiben unverändert.
  - **AK-2:** Bestehende Produkte werden mit den neuen Feldern annotiert, ohne Preise/Reviews zu erfinden (`OQ-002`).
  - **AK-3:** Per-Welt-Collections (REQ-010) filtern über `product_world` statt über das alte `category`-Freitextfeld (das uneinheitlich ist: `'TCM'`, `'Praxen'`, `'Wuxing'`, `'Feuerpferd'`).
  - **AK-4 (Delta dokumentiert):** Abschnitt 6 dieser PRD listet die Mapping-Deltas; Abweichungen vom Raw-Schema (Enum-Werte, additiv statt destruktiv) sind als ADR/Hinweis vermerkt.
- **canvas-problem:** Hartkodierter Katalog ohne V2-Dimensionen; Collections brauchen konsistente Achsen.
- **canvas-target-user:** Entwickler:in/Agent (A5) / mittelbar Käufer:innen.
- **canvas-value-claim:** Konsistente, kuratierte Sortimentslogik (§4).
- **canvas-success-signal:** Collections filtern deterministisch über `product_world`; Datenmodell-Delta dokumentiert.
- **canvas-risk-status:** `aligned`.

---

### Bucket: TESTS

#### REQ-014 — Test-Infrastruktur (vitest + playwright) einrichten
- **User Story:** Als Team will ich eine lauffähige Test-Infrastruktur, damit Money-Path & Truthful-Claims maschinell gesichert werden.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** `vitest` (Unit/Integration) + `playwright` (E2E) sind als devDependencies installiert; `package.json`-Scripts `test`, `test:unit`, `test:e2e` existieren und laufen lokal (`scripts` aktuell ohne Test, belegt).
  - **AK-2:** `tests/**`-Verzeichnisstruktur existiert; CI-fähig (Exit-Code != 0 bei Fehlern).
  - **AK-3:** Real-Boundary-Smoke: ein Test rendert über den Produktions-Composition-Root (`App.tsx`/`main.tsx`), nicht nur isolierte Komponenten (Evidence §9 Canvas).
- **canvas-problem:** Keine Tests vorhanden (Coverage/Mutation-Baseline = 0).
- **canvas-target-user:** Team/Operator (Qualitätssicherung).
- **canvas-value-claim:** Verifizierbare, nicht nur „grüne" Erfüllung (§9 Reality-Ledger).
- **canvas-success-signal:** `npm test` läuft, Real-Boundary-Smoke grün.
- **canvas-risk-status:** `aligned`.

#### REQ-015 — Money-Path-Tests (Server-Re-Preisung + Versand)
- **User Story:** Als Operator will ich automatisierte Tests, die beweisen, dass manipulierte Preise/Versand abgewiesen werden.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Test: manipulierter `unitAmount` (z. B. `1`) → Stripe-`unit_amount` == Serverpreis (REQ-001 AK-2).
  - **AK-2:** Test: unbekannte Produkt-/Varianten-ID → `4xx`, keine Session (REQ-001 AK-3).
  - **AK-3:** Test: `shippingCents: 0` bei versandpflichtigem Cart → server-berechneter Versand in Session (REQ-002 AK-3).
  - **AK-4:** Stripe wird im Test gemockt/gestubbt (keine echten API-Calls; kein Secret im Test).
  - **AK-5:** Regressionstests für REQ-003-Invarianten (Metadaten-Chunking, Gast/Account, Clamping).
- **canvas-problem:** Money-Path ungetestet, Re-Preisung muss bewiesen werden.
- **canvas-target-user:** Operator (A3).
- **canvas-value-claim:** „Sicherer Checkout" maschinell belegt.
- **canvas-success-signal:** Tampering-Tests rot ohne Fix, grün mit Fix.
- **canvas-risk-status:** `risk-introduced`.

#### REQ-016 — Truthful-Claims-Tests (Ort-Einfluss, Copy-Verbotslisten, Health-Claims)
- **User Story:** Als Operator will ich Tests, die irreführende Claims und die Ort-Verwerfung dauerhaft verhindern.
- **Priorität:** MVP
- **Akzeptanzkriterien:**
  - **AK-1:** Property/Snapshot-Test: `computeChart` reicht `place`/`date`/`time`/`birthTimeUnknown` deterministisch durch und verwirft sie nicht; der Personalisierungs-Payload / die Cart-Metadaten enthalten alle vier Felder (REQ-004). (Kein „Bild variiert mit Ort"-Test — Poster sind Platzhalter.)
  - **AK-2:** i18n-Scan-Test gegen die **Präzisions-/API-Verbotsliste** über EN/DE/FR (REQ-005) — schlägt fehl bei verbleibendem Claim.
  - **AK-3:** Content-Scan-Test gegen die **Heilversprechen-Verbotsliste** über TCM/Wuxing-Strings (REQ-006).
  - **AK-4:** Test: Legal-Docs in DE/FR vorhanden und `[MISSING]`-Marker erhalten (REQ-007).
  - **AK-5:** Noon-Fallback-Test (REQ-018): bei `birthTimeUnknown = true` ist die verarbeitete Zeit deterministisch `12:00`, das Flag wird im Payload mitgeführt, und der Offenlegungs-Hinweis existiert + rendert in EN/DE/FR (Eingabefeld + Zusammenfassung).
- **canvas-problem:** Truthful-Claims-Lücken (Amendments A/C) brauchen dauerhafte Sicherung.
- **canvas-target-user:** Operator (A3) / Käufer:innen.
- **canvas-value-claim:** Ehrliche, regelkonforme Kommunikation (§4 / Non-Goal §7).
- **canvas-success-signal:** Verbotslisten-Tests + Ort-Einfluss-Test grün; rot bei Rückfall.
- **canvas-risk-status:** `value-risk`.

#### REQ-017 — Conformance-Smoke-Tests (Routen, Modulfolge, Mobile, kein Saju/Junishi)
- **User Story:** Als Team will ich Smoke-Tests für die V2-Konformität, nachdem SECURITY + TRUTHFUL-CLAIMS grün sind.
- **Priorität:** P2
- **Akzeptanzkriterien:**
  - **AK-1:** E2E: MVP-Collection-Routen (REQ-010), `/inspiration` (REQ-011) sind über `App.tsx` reachable (HTTP/Render OK).
  - **AK-2:** Test: Homepage rendert Module 1–13 in Reihenfolge (DOM-Order-Assertion) (REQ-008).
  - **AK-3:** Mobile-Smoke auf Breakpoints 360/390/430 (kein Horizontal-Scroll; Drawer/Mega-Menü bedienbar) (REQ-009, NFR-3).
  - **AK-4:** Negativer Nachweis: keine Saju/Junishi-Strings/Routen (REQ-008 AK-4).
- **canvas-problem:** Konformität muss real-boundary verifiziert werden (Evidence §9).
- **canvas-target-user:** Team / Besucher:innen.
- **canvas-value-claim:** Echte Reachability statt isolierter Renders (§9).
- **canvas-success-signal:** Conformance-Smoke grün auf realen Breakpoints/Composition-Root.
- **canvas-risk-status:** `aligned`.

---

## 4. NFRs

- **NFR-1 Performance / Hero-LCP (harte Nebenbedingung):** Modulfolge-Umbau (REQ-008) darf den Hero/InkWave-LCP **nicht** regredieren. Baseline = Stand nach Commits `0133437`/`0f8995c`/`d56de04`. Lazy-Three.js-Splitting (`Home.tsx:6`), Reduced-Motion-Fallback und „never freeze canvas while visible" (`0133437`) bleiben. Mess-Guard: Lighthouse/LCP-Vergleich vor/nach (konkrete Schwelle = `MEASURE_NEEDED`, `OQ-008`).
- **NFR-2 Ink-Wave-Mobile-Budget:** Reduzierte Partikeldichte/Bewegung + statisches Fallback auf Mobile bleiben (Raw §13.2); Mobile-GPU-Budget gemessen (`OQ-008`, derzeit ungemessen → `MEASURE_NEEDED`).
- **NFR-3 Accessibility & Reduced-Motion (§14 Gate-Tabelle):** Navigation per Keyboard (Tab/Shift+Tab/Escape/Touch); Filter mit Screenreader-Label + Reset; Reduced-Motion respektiert (`prefers-reduced-motion: reduce` → keine Loops/Parallax); primärer CTA pro View eindeutig.
- **NFR-4 Mobile-Breakpoints:** 360 / 390 / 430 px ohne Horizontal-Scroll; Touch-Ziele ≥ 44px (`Navbar.tsx:31`); Sticky-CTA auf PDP (Raw §9.4).
- **NFR-5 Observability:** Keine Analytics mit Fake-Daten (Non-Goal §7). Server-Fehlerpfade loggen serverseitig (`console.error` Bestandsmuster); keine sensiblen Daten im Client-Log. Echtes Event-Konzept = außerhalb Run.
- **NFR-6 i18n-Vollständigkeit:** Neue/geänderte Strings (REQ-005/006/007/012) existieren in EN/DE/FR; kein fehlender Key zur Laufzeit (Test-prüfbar).

---

## 5. Security-Matrix

| Surface | Bedrohung | Bestand (Beleg) | Maßnahme (REQ) | Verifikation |
|---|---|---|---|---|
| Re-Preisung | Client diktiert Preis (1-Cent-Checkout) | `server/index.js:197-204` vertraut `it.unitAmount`; `checkout.ts:35` sendet `unitAmount` | REQ-001 server-autoritative Preisquelle | REQ-015 AK-1/AK-2 (Tampering-Test) |
| Versand | Client fälscht `shippingCents` | `server/index.js:194,215-217`; `ShopStore.tsx:104-106` client-derived | REQ-002 server-berechneter Versand | REQ-015 AK-3 |
| Kein client-vertrauter Preis | Negativnachweis | — | REQ-001/002 | REQ-015 (rot ohne Fix) |
| Secrets | Leak in Code/Logs | `STRIPE_SECRET_KEY`/`SESSION_SECRET` env-gated (`server/index.js:17,25`); kein Hardcode | Beibehalten; Tests ohne echte Keys (REQ-015 AK-4) | grep-Scan / Test-Mock |
| Injection (Metadaten/Eingaben) | Overflow/Drop | Caps & Chunking (`server/index.js:737-750`, `203`, `210`) | REQ-003 nicht regredieren | REQ-015 AK-5 |
| Supply-Chain | Verwundbare Deps | `npm audit` resolved (Commit `d04c451`) | Neue Test-Deps (`vitest`/`playwright`) pinnen + auditieren | `npm audit` in CI |
| Auth-Scope | versehentliche Änderung | Session/HMAC/scrypt-Logik (`server/index.js:283-350`) | Out-of-scope: NICHT anfassen (§1.2) | Diff-Review (nur Checkout-Route geändert) |

---

## 6. Datenmodell-Deltas vs. `src/lib/catalog.ts`

**Bestand (`catalog.ts:7-25`):** `Product { id, category(string), title, price, anchor?, rating, reviews, sold, bullets[], poster, personalizable?, image?, usage? }`. `category` ist uneinheitlicher Freitext (`'TCM'|'Praxen'|'Wellness'|'Yoga'|'Wuxing'|'Feuerpferd'`).

**Delta (additiv, konform zu Raw §11.1, keine destruktive Änderung):**

| Feld | Raw §11.1 Enum | Delta-Entscheidung | Begründung |
|---|---|---|---|
| `product_world` | `bazi｜tcm｜wuxing｜mixed` | **NEU**, additiv | Achse für per-Welt-Collections (REQ-010); ersetzt fachlich das uneinheitliche `category` als Filterquelle (REQ-013 AK-3). |
| `personalization_level` | `single｜couple｜yearly｜none` | **NEU**, additiv | Bildet bestehendes `personalizable?` feiner ab (couple/yearly). `personalizable` bleibt für Abwärtskompat. |
| `use_case` | `self｜relationship｜gift｜yearly_energy｜practice_room｜learning｜nutrition｜interior` | **NEU**, additiv | Anlass-Collections (P2). Mapping aus bestehendem `usage` (`educational｜practice｜wellness｜yoga`) → dokumentierter Mapping-Hinweis. |
| `design_family` | `minimal｜japandi｜wabi_sabi｜classic_ink` | **NEU**, additiv | Stil-Collections (P2). |
| `category` | — | **BLEIBT** (deprecated-für-Filter) | Nicht entfernen (Bestandscode liest es); neue Filter nutzen `product_world`. |
| `price`/`anchor`/`reviews`/`sold` | — | **UNVERÄNDERT** (Platzhalter) | Reale Werte = Operator (`OQ-002`); nicht erfinden. |

**Collection-Entity (Raw §11.2) & Knowledge-Article (Raw §11.3):** als Typen einführbar, soweit für REQ-010/REQ-012 nötig; ohne CMS (hartkodiert wie Bestand). **DB-Schema bleibt unangetastet** (§1.2).

---

## 7. Atomare, abhängigkeits-geordnete Task-Liste (Milestones)

Reihenfolge folgt der Council-Priorisierung: **SECURITY + TRUTHFUL-CLAIMS vor V2-CONFORMANCE.**
`atomicTaskCount = 23` (inkl. T-08b für REQ-018).

**Phase A — Fundament**
1. **T-01** Test-Infra: `vitest` + `playwright` + `package.json`-Scripts + `tests/**` + Real-Boundary-Smoke (REQ-014).

**Phase B — SECURITY (Money-Path)**
2. **T-02** Identitäts-Mapping umsetzen (`ASM-001 RESOLVED`, ADR-001): `productId` + `variantId` (Size/Format/Frame) in den `/api/checkout`-Payload aufnehmen; Server liest autoritativen Preis/Versand aus server-eigener Preisquelle (REQ-001). Ändert das Client-Checkout-Interface (`checkout.ts` keyt Lines aktuell nur per Title).
3. **T-03** Server-autoritative Preisquelle (Produkt/Variante→Cent) in `/api/checkout`, `it.unitAmount` ignorieren (REQ-001).
4. **T-04** Server-berechneter Versand in `/api/checkout`, `shippingCents` ignorieren, Regel = `ShopStore`-Logik (REQ-002).
5. **T-05** Regression-Sicherung Checkout-Invarianten (Metadaten-Chunking/Gast/Account/Clamping) (REQ-003).
6. **T-06** Money-Path-Tests (Tampering Preis/Versand, Stripe gemockt) (REQ-015).

**Phase C — TRUTHFUL-CLAIMS**
7. **T-07** `computeChart(date,time,place,birthTimeUnknown)` — Inputs annehmen + sauber durchreichen statt verwerfen; Platzhalter-Output bleibt RED (REQ-004) [ASM-002 RESOLVED, ADR-002].
8. **T-08** Aufrufstellen + Payload/Cart-Metadaten durchreichen: `Personalize.tsx:89`, `ProductView.tsx:26`, `catalog.ts:29` — `place`/`date`/`time`/`birthTimeUnknown` ohne stillen Verlust (REQ-004).
8b. **T-08b** Noon-Fallback (`birthTimeUnknown → 12:00`) + sichtbare Offenlegung am Eingabefeld + in der Zusammenfassung, EN/DE/FR (REQ-018).
9. **T-09** Copy-Reframe i18n EN/DE/FR: Präzisions-/API-/„100 %"-Claims entschärfen + Noon-Fallback-Hinweis (REQ-005 inkl. AK-5).
10. **T-10** FAQ „-ort wird berechnet" mit REQ-004 koppeln/reformulieren auf „erfasst + für geplante API durchgereicht" (REQ-005 AK-3).
11. **T-11** TCM/Wuxing-Health-Claim-Sweep + Verbotsliste (REQ-006).
12. **T-12** DE/FR-Lokalisierung der Legal-Templates, `[MISSING]`-Marker + Review-Banner erhalten (REQ-007).
13. **T-13** Truthful-Claims-Tests (Input-Durchreichung, Präzisions-Verbotsliste, Heilversprechen-Verbotsliste, Legal DE/FR, Noon-Fallback) (REQ-016).

**Phase D — V2-CONFORMANCE**
14. **T-14** Datenmodell-Delta additiv auf `catalog.ts` + Annotation Bestand (REQ-013).
15. **T-15** Per-Welt-Collection-Routen + Template (H1/Intro/Grid/SEO/FAQ/Links) (REQ-010).
16. **T-16** Echtes Mega-Menü (Desktop) + Mobile-Drawer/Accordion + A11y (REQ-009).
17. **T-17** Inspiration/Gallery-Seite `/inspiration` + Platzhalter-Marker (REQ-011).
18. **T-18** Homepage Module 03/04/06/07/08/09 ergänzen (Shop-nach-Welt, Featured-Slider, Fire Horse, Paare, Analyse-PDF, Inspiration) (REQ-008).
19. **T-19** Trust-Block (Modul 11) + Reihenfolge 1–13 herstellen (REQ-008).
20. **T-20** Home-SEO-Textblock (Modul 12), claim-konform, interne Links (REQ-012).
21. **T-21** Hero/LCP-Regressions-Guard (NFR-1) + Reduced-Motion/Mobile-Budget-Check (NFR-2/3).
22. **T-22** Conformance-Smoke-Tests (Routen, Modulfolge, Mobile 360/390/430, kein Saju/Junishi) (REQ-017).

**Abhängigkeiten:** T-01 → alle Tests. T-02 → T-03/T-04 (ASM-001 RESOLVED, ADR-001 → entblockt). T-07 → T-08 → T-08b (ASM-002 RESOLVED, ADR-002 → entblockt). T-14 → T-15/T-16. T-18/T-19 → T-21. SECURITY/TRUTHFUL (B/C) vor D.

---

## 8. Ledger — MISSING / ASSUMPTION / OPEN QUESTION / BLOCKER

> Keine Annahme wird ohne explizite User-Bestätigung adoptiert. Ein BLOCKER hält den Fluss an.

| ID | Klasse | Thema | Beleg / Status |
|---|---|---|---|
| **ASM-001** | ✅ RESOLVED (user-confirmed 2026-06-22 „ja passt"; ADR-001) | Re-Preis-Identitäts-Mapping: **`productId` + `variantId` (Size/Format/Frame)** werden im `/api/checkout`-Payload gesendet; Server liest autoritativen Unit-Preis + Versand aus einer **server-eigenen Preisquelle** (vorerst bestehende Platzhalterpreise bis Operator reale Preise liefert, `OQ-002`). Ändert das Client-Checkout-Interface (`checkout.ts` keyt Lines bislang nur per Title). | Entscheidung dokumentiert in [`docs/architecture/adr-001-server-repricing.md`](../architecture/adr-001-server-repricing.md). **Entblockt T-02/T-03**; REQ-001/002/015-abhängige Tasks unblocked. |
| **ASM-002** | ✅ RESOLVED (user-confirmed 2026-06-22 „ja passt"; ADR-002) | Geburts-Eingabefelder (Ort/Datum/Zeit) **bleiben** — genuine Inputs für eine **geplante** Berechnungs-API; **kein** Entfernen des Ortsfelds, **kein** „Ort variiert Platzhalter-Bild" (gegenstandslos, Poster = Platzhalter). Payload reicht `place`/`date`/`time` + `birthTimeUnknown`-Flag sauber durch (REQ-004); `bazi.ts` bleibt Platzhalter (RED) bis API verbunden. | Entscheidung dokumentiert in [`docs/architecture/adr-002-personalization-input-passthrough.md`](../architecture/adr-002-personalization-input-passthrough.md). **Entblockt T-07/T-08/T-08b**. |
| **OQ-002** | MISSING (Content-TODO) | Reale Produktpreise. Re-Preisung nutzt vorerst Platzhalter (`catalog.ts`). | Operator liefert separat; im Reality-Ledger sichtbar. |
| **OQ-003** | MISSING (Content-TODO) | Fulfillment/Carrier/Lieferzeiten. | Operator; `legal.ts:120` `[MISSING]`. |
| **OQ-005** | MISSING/Review (entblockt für Code) | Operator-Rechtsdaten (Firmenname, USt, Gerichtsstand) + professionelle Rechtsprüfung. Nur **Lokalisierung** im Run (REQ-007). | `[MISSING]`-Marker bleiben; Banner sichtbar. Kein Code-Blocker für Phase 1. |
| **OQ-006** | MISSING (Content-TODO) | Echte Produktbilder/Mockups. Inspiration/Collections nutzen markierte Platzhalter. | Operator. |
| **OQ-007** | MISSING (Content-TODO) | Finale SEO-Keywords. SEO-Block/Collections strukturell korrekt, Keyword-Tuning offen. | Operator/Recherche. |
| **OQ-008 / MEASURE_NEEDED** | MISSING (Messung) | Ink-Wave-Mobile-Performance + konkrete LCP-Schwelle für NFR-1. | Auf Mobile messen; bis dahin Guard = „keine Regression ggü. Baseline". |
| **OQ-004** | RESOLVED (RED-geführt) | Echte BaZi-Engine bleibt außerhalb Scope; Platzhalter, nie als „fertig" berichten. | Canvas-Entscheid; `bazi.ts` `*-fake`/RED. |
| **KPI-MISSING** | MISSING | Mess­bare Conversion-/Performance-KPIs (CR, Lighthouse-Schwelle) fehlen (Canvas §5). | `MEASURE_NEEDED`; Vision-Thema. |

**Aktuell offene BLOCKER:** keine. **ASM-001 und ASM-002 sind beide am 2026-06-22 vom Nutzer
bestätigt (ADR-001 / ADR-002) und damit als Premissen adoptiert** — ihre abhängigen Tasks
(T-02/T-03 bzw. T-07/T-08/T-08b) sind entblockt. Verbleibende Einträge (OQ-002/003/005/006/007/008,
KPI-MISSING) sind nicht-code-blockierende Content-/Mess-TODOs und bleiben im Reality-Ledger sichtbar.

---

## 9. Traceability-Matrix (Spine)

`canvas-link` = `docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md` (für alle REQ).
Spalten: REQ ↔ Test ↔ Impl-Task ↔ Evidence ↔ wired-in-prod? ↔ evidence-class.

| REQ | Bucket | Test | Task | Evidence (Code-Beleg) | wired-in-prod? | evidence-class |
|---|---|---|---|---|---|---|
| REQ-001 | SECURITY | REQ-015 AK-1/2/3 | T-02,T-03 | `server/index.js:197-204` | PENDING | belegt |
| REQ-002 | SECURITY | REQ-015 AK-3 | T-04 | `server/index.js:194,215-217`; `ShopStore.tsx:104-106` | PENDING | belegt |
| REQ-003 | SECURITY | REQ-015 AK-5 | T-05 | `server/index.js:203,210,236-240,737-750` | PENDING | belegt |
| REQ-004 | TRUTHFUL | REQ-016 AK-1 | T-07,T-08 | `bazi.ts:26` (Platzhalter, RED); `Personalize.tsx:89`; `ProductView.tsx:26`; `catalog.ts:29`; Payload/Cart-Metadaten `CartDrawer.tsx:166` | PENDING | belegt |
| REQ-005 | TRUTHFUL | REQ-016 AK-2 | T-09,T-10 | `translations.ts:248,275,285,355,363,364,370,401,466` | PENDING | belegt |
| REQ-006 | TRUTHFUL | REQ-016 AK-3 | T-11 | `catalog.ts:199` u. TCM-Strings; `translations.ts` | PENDING | belegt |
| REQ-007 | TRUTHFUL | REQ-016 AK-4 | T-12 | `legal.ts:17,100-104,120`; `App.tsx:75-79` | PENDING | belegt |
| REQ-008 | V2-CONF | REQ-017 AK-2/4 | T-18,T-19 | `Home.tsx:131-141` | PENDING | belegt |
| REQ-009 | V2-CONF | REQ-017 AK-3 | T-16 | `Navbar.tsx:13-22,157-167,195-224` | PENDING | belegt |
| REQ-010 | V2-CONF | REQ-017 AK-1 | T-15 | `App.tsx:64,67`; `catalog.ts` | PENDING | belegt |
| REQ-011 | V2-CONF | REQ-017 AK-1 | T-17 | `App.tsx` (keine `/inspiration`-Route) | PENDING | belegt |
| REQ-012 | V2-CONF | REQ-017 (Render) | T-20 | `Home.tsx` (kein SEO-Block) | PENDING | belegt |
| REQ-013 | V2-CONF | REQ-017 AK-1 | T-14 | `catalog.ts:7-25` | PENDING | belegt |
| REQ-014 | TESTS | — (Infra) | T-01 | `package.json` scripts (kein test) | PENDING | belegt |
| REQ-015 | TESTS | self | T-06 | money-path | PENDING | ableitbar |
| REQ-016 | TESTS | self | T-13 | truthful-claims | PENDING | ableitbar |
| REQ-017 | TESTS | self | T-22 | conformance-smoke | PENDING | ableitbar |
| REQ-018 | TRUTHFUL | REQ-016 AK-5 | T-08b | `Personalize.tsx` (Zeit-Eingabe + Flag); `bazi.ts:26` (Noon-Fallback); `translations.ts` (Offenlegungs-Hinweis EN/DE/FR) | PENDING | ableitbar |

---

## 10. Definition of Ready (Phase-0-Gate)
- [ ] Alle REQ atomar, testbar, mit ≥1 maschinen-prüfbarem Signal — **erfüllt**.
- [ ] Jede REQ mit allen 6 Canvas-Traceability-Feldern — **erfüllt**.
- [ ] Buckets eindeutig (SECURITY/TRUTHFUL-CLAIMS/V2-CONFORMANCE/TESTS) — **erfüllt**.
- [ ] Keine externen Claims als unbelegte Premissen (Code-Belege zitiert) — **erfüllt**.
- [x] Offene Lücken markiert; ASM-001/002 RESOLVED (ADR-001/002, user-confirmed 2026-06-22); OQ-002/003/005/006/007/008 + KPI als nicht-blockierende TODOs — **erfüllt**.
- [x] **PRD vom Nutzer bestätigt** — **erfüllt (2026-06-22, „ja passt")**.
- [x] **Product Vision (`product-owner`) erstellt + vom Nutzer bestätigt** — **erfüllt (2026-06-22)**.

## 11. Handoff
- An **`product-owner`** (Vision-Gate): PRD-Pfad, REQ-001..018, Akzeptanzkriterien, Non-Goals,
  offene OQ/KPI, Customer/User-Statements (A1/A2), Value-Claims (§4) + Success-Signale (§5).
- An **`spec-auditor`** (Phase 0.5) + **`planner`/`tester`**: eingefrorene PRD + Matrix (Abschnitt 9).
- An **`context-keeper`**: `state.md` / `decision-log.md` / ADRs konsistent zur Matrix halten
  (ASM-001 → ADR-001, ASM-002 → ADR-002, beide accepted 2026-06-22).
