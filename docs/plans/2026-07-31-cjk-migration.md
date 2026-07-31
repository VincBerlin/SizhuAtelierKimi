# Umsetzungsplan: CJK-Shopmigration (aus Präzisionsplan V3, Mobile First)

**Stand:** 2026-07-31 · **Basis-Commit:** `ffda5c6` auf `feat/fufire-personalization` (verifiziert 2026-07-31)
**Normative Quelle:** Operator-Dokument „SizhuAtelier — Präzisionsplan V3" (2026-07-31); wird in T-A04 als
`docs/plans/2026-07-31-cjk-praezisionsplan-v3-original.md` ins Repo übernommen.
**Status:** `plan-complete / implementation-unverified` — noch keine Codeänderung.
**IST-Referenz:** `docs/ist-zustand-2026-07-31.md`.

---

## 1. Ziel

Fachlicher Wechsel des Shops von Astrologie/BaZi/TCM zu **personalisierten CJK-Schriftpostern**
(Name / Wort-Satz / eigene CJK-Schrift; Zielsprachen `zh-Hans`, `zh-Hant`, `ja`, `ko`) plus kuratierte
Art-Prints — bei **vollständig erhaltener Marken-, Farb- und Shop-Hülle** und **Mobile First** als
verbindlicher Entwicklungs- und Abnahmereihenfolge (320→375→390→430→768→1024→1280 px).

Die bestehende Commerce-Infrastruktur bleibt: server-autoritatives Pricing (ADR-001), Stripe,
Gelato (12 verifizierte UIDs), SVG-Registry mit identischer Vorschau-/Druckquelle, PDF-Pipeline,
Accounts/Postgres, i18n EN/DE/FR/ES, CI, Evidence-Ledger.

## 2. Nicht-Ziele

- **Kein Rebranding, kein Greenfield.** Keine neue Farbpalette, kein neues Logo, keine neuen
  Shop-Schriftarten, keine andere Containerbreite (1200 px bleibt), kein Header-/Footer-Neubau,
  kein Dark Theme, keine SaaS-/Glassmorphism-Optik. CJK-Fonts nur in der Posterfläche.
- **Keine automatische Produktion ohne Freigabe.** Nie „garantiert korrekt übersetzt" behaupten.
- **Keine Provider-Festlegung vor Benchmark** (`provider-unselected` bis T-C07 abgeschlossen).
- **Kein Neubau funktionierender Komponenten** ohne dokumentierte technische Blockade.
- **Keine stille Schließung** offener Vertrags-/Ledger-Punkte (nur via T-A03 mit Operator-Signal).

## 3. Voraussetzungen und bekannte Lücken

**Voraussetzungen (vor T-B01 erfüllt):**

1. Basis-Commit fixiert: `ffda5c6`; Migrationsbranch zweigt von `feat/fufire-personalization` ab
   (`main` liegt 83 Commits zurück und ist NICHT die Basis).
2. Railway deployt weiterhin vom bisherigen Arbeits-Branch — der Migrationsbranch wird **nicht**
   mit Railway verbunden, bis Phase Q abgenommen ist (Rollback-Garantie).
3. CI-Baseline grün auf dem neuen Branch (Build + sequenzielle Tests + Lint), da lokal
   `RL-VITEST-ENV` (iCloud-I/O) gilt: Tests nur in CI oder warmer Shell außerhalb des Syncs bewerten.
4. T-A03 (Vertrags-Änderungen + Operator-Sign-off) MUSS vor jedem Löschen abgeschlossen sein.

**Bekannte Lücken (blockieren einzelne Tasks, nicht den Start):**

| Lücke | Blockiert | Auflösung |
|---|---|---|
| Übersetzungsanbieter nicht gewählt (`provider-unselected`) | T-C07, T-Q04 | Benchmark-Testset + sprachkundige Reviews (Operator organisiert Reviewer) |
| Keine realen CJK-Designs vom Betreiber | T-E03, Teile T-Q03 | Design-Import-Prozess (V3 §9); bis dahin 3 technische Basisdesigns |
| Schriftlizenzen für Kalligrafie-Fonts ungeklärt | kalligrafische Stile | Nur Noto Serif CJK (OFL) im Basisbetrieb; Kalligrafie erst nach Lizenznachweis |
| Sprachliche Reviewer für Freigabe-Workflow fehlen | T-G01-Live, T-Q04 | Operator benennt Reviewer je Zielschrift |
| Kuratierte Poster: Druck-PDFs fehlen weiterhin (`RL-PRINT-ASSETS`) | curated-Bestellungen | unverändert: lauter Fehlschlag bis Operator PDFs liefert |
| Rechtsdaten `[MISSING]` in `src/lib/legal.ts` | T-H03 vollständig | Operator liefert Firmendaten |

**Vertragskonflikte, die T-A03 explizit auflösen muss** (V3 ersetzt Teile älterer Verträge —
Dokumentation im Ledger unter „Vertrags-Änderungen", nie stilles Fallenlassen):

- `RL-PREMIUM-PDF` (195-€-Analyse, 10–15 Seiten): Produkt entfällt laut V3 §1 → Carry wird
  gegenstandslos, nicht „erledigt".
- `OQ-TLST`, FuFirE-bezogene Fixture-/Konventions-Pins: entfallen mit FuFirE-Decommission.
- Batch-#12-Regel „EINE Personalisierungsseite mit 5 Angeboten (BaZi/Geburtschart/Paar/Analyse/Bundle)":
  superseded durch neuen CJK-Konfigurator.
- End-Abarbeitungsliste (Memory `open-launch-items`): Punkte B-8 (Premium-PDF) und die
  FuFirE-Anteile von B-9/B-10 werden umgewidmet; Punkte A-2 (Stripe Live), A-3 (Druck-PDFs),
  RL-GELATO-Rest, HERO-ASSET, RL-IMAGES, RL-PAPER-CLAIM **bleiben gültig**.
- Geschützte Flächen: `src/lib/bazi.ts` darf erst nach explizitem Operator-OK gelöscht werden
  (T-B05); `src/components/InkWave.tsx` wird nicht angefasst.

## 4. REQ-Register

`REQ-AK01…38` = Akzeptanzkriterien V3 §15 (Kurzform; Volltext im Original-Dokument, T-A04):

- **AK01** kein TCM/BaZi/Astro/Feuerpferd/Analyse im sichtbaren Shop · **AK02** keine FuFirE-Route/-Secret aktiv
- **AK03** Eingabe Name/Satz/eigene CJK · **AK04** Zielsprachen zh-Hans/zh-Hant/ja/ko wählbar
- **AK05** Vorschau ohne Reload · **AK06** Vorschau & Druck = dieselbe Designfunktion
- **AK07** sprachpassende CJK-Fonts in Browser UND PDF · **AK08** aktive Variantenwahl durch Kunde
- **AK09** Bestellung speichert vollständigen Übersetzungs-Snapshot · **AK10** unfreigegebene Übersetzung nicht produzierbar
- **AK11** Gelato erhält PDF erst nach Freigabe · **AK12** kuratierte Poster unabhängig vom Übersetzungsservice
- **AK13** alte Astro-URLs ohne 404 (Redirects) · **AK14** Build/Lint/Tests grün
- **AK15** Testbestellung real belegt (Stripe-Test + Gelato-Draft) · **AK16** keine unbelegten Genauigkeitsgarantien
- **AK17** Hauptfarben/Typografie unverändert · **AK18** `tokens.ts` ohne neue Konkurrenz-Palette
- **AK19** Logo/Header/Footer erkennbar erhalten · **AK20** Inhaltsbreite 1200 px bleibt
- **AK21** Navbar/Mega-Menü inhaltlich migriert, nicht neu erfunden · **AK22** Vorher/Nachher zeigt Markenkontinuität
- **AK23** kein H-Scroll auf 375/768/1280 · **AK24** Konfigurator wirkt integriert, nicht wie Fremdtool
- **AK25** visuelle Änderungen außerhalb Change Budget dokumentiert + freigegeben
- **AK26** voll bedienbar bei 320/375/390/430 · **AK27** keine Kernfunktion hover-abhängig
- **AK28** Touchziele ≥ 44×44 px · **AK29** Formularschrift mobil ≥ 16 px
- **AK30** Tastatur verdeckt keine kritischen Eingaben/CTAs · **AK31** Zustand bei jedem Schrittwechsel gespeichert
- **AK32** mobile Vorschau erreichbar ohne Flussblockade · **AK33** lange CJK-Texte ohne H-Scroll
- **AK34** mobile Nav/Warenkorb/Freigabe/Checkout voll funktionsfähig · **AK35** Fonts/Thumbnails bedarfsgerecht geladen
- **AK36** Desktop erweitert mobile Kernlogik (kein getrennter Pfad) · **AK37** Screenshots 375/768/1280 vorher/nachher
- **AK38** mobile Real-Browser-Evidence für Konfigurator/Warenkorb/Checkout

Weitere REQ-Quellen: **REQ-STATUS** = Statusmodell V3 §5.2 (`draft → customer_selected →
review_required → approved → rejected → printed`; drucken NUR bei `approved`) ·
**REQ-SNAP** = Bestell-Snapshot V3 §6.3 (Quelltext, Sprachen, Variante, finalText, Romanisierung,
Status, Provider+Version, designId/layoutId/sizeId/fontId; Fulfillment rechnet NIE neu) ·
**REQ-PROV** = Provider-Gate V3 §6.4 · **REQ-VCB** = visuelles Change Budget V3 §15.1 ·
**REQ-MOB** = Mobile-Regeln V3 §0 (Touchziele, 16-px-Inputs, Sticky-CTA-Regeln, Performance).

---

## 5. Aufgabenliste

Legende je Task: **REQ** · **Dateien** · **Tests** · **Evidence** (Beweisklasse gemäß Ledger).
Reihenfolge = Abhängigkeitsordnung; Tasks ohne gegenseitige Abhängigkeit sind parallelisierbar.

### Phase 0 — Marken- und UI-Baseline (vor jeder fachlichen Änderung)

**T-001 · UI-Baseline sichern**
Screenshots der Kernrouten (Home, Collections, PDP, Personalize, Cart, Checkout, Mega-Menü offen)
bei 375/768/1280 px gegen den laufenden Stand `ffda5c6`.
REQ: AK17, AK19, AK20, AK22, AK37 · Dateien: nur `docs/evidence/cjk-migration/ui-baseline/` (neu) ·
Tests: keine · Evidence: `[REAL-BROWSER]` Screenshot-Satz mit Datums-/Commit-Stempel.

**T-002 · Design-Token-Baseline**
Tokens aus `src/lib/tokens.ts` + Tailwind-Config maschinenlesbar exportieren.
REQ: AK17, AK18 · Dateien: `docs/evidence/cjk-migration/design-token-baseline.json` (neu) ·
Tests: keine · Evidence: `[REAL-ARTIFACT]` JSON, referenziert in T-Q05.

**T-003 · Visuelles Change Budget festschreiben**
Erlaubte vs. genehmigungspflichtige Änderungen gemäß REQ-VCB als eigenes Dokument; alles außerhalb
gilt als `design-preservation`.
REQ: AK25, REQ-VCB · Dateien: `docs/plans/cjk-migration-visual-change-budget.md` (neu) ·
Tests: keine · Evidence: Dokument + Operator-Kenntnisnahme (Ledger-Zeile).

### Phase A — Branch, Inventur, Vertragsbasis

**T-A01 · Branch anlegen & CI-Baseline**
`feat/cjk-personalized-poster-shop` von `feat/fufire-personalization@ffda5c6`; erster Push löst CI
aus; Railway-Verdrahtung prüfen und dokumentieren, dass der neue Branch NICHT deployt.
REQ: — (Voraussetzung 1–3) · Dateien: keine Code-Änderung ·
Tests: kompletter CI-Lauf (Build + `vitest --no-file-parallelism` + Lint) ·
Evidence: CI-Run-URL grün = Baseline; Railway-Quelle als Screenshot/CLI-Output.

**T-A02 · Ledger: Migrationsentscheidung eintragen**
Neue Ledger-Sektion „CJK-Migration" (im bestehenden `docs/evidence/fufire-gelato/ledger.md` mit
Verweis oder neues `docs/evidence/cjk-migration/ledger.md`): V3 als Operator-Vertrag, Basis-Commit,
Zielstatus, Beweisklassen-Regeln gelten weiter.
REQ: Ehrlichkeitsdisziplin · Dateien: Ledger · Tests: `exact-reality-ledger.test.ts` bleibt grün ·
Evidence: Ledger-Zeile mit Datum + Quelle.

**T-A03 · Vertrags-Änderungen dokumentieren + Operator-Sign-off (GATE)**
Die unter §3 gelisteten Supersessions einzeln als Ledger-„Vertrags-Änderung" mit Zitat des V3-Plans;
Memory `open-launch-items` erst NACH bestätigtem Sign-off anpassen. Ohne dieses Gate keine Löschung.
REQ: AK01 (Vorstufe), Nicht-Ziel 5 · Dateien: Ledger; Memory ·
Tests: keine · Evidence: `[HUMAN-VERIFIED]` Operator-Bestätigung (Chat-Zitat im Ledger).

**T-A04 · V3-Original ins Repo**
Quelldokument unverändert nach `docs/plans/2026-07-31-cjk-praezisionsplan-v3-original.md`.
REQ: alle (Normquelle) · Dateien: neue Datei · Tests: keine · Evidence: Datei im Commit.

### Phase B — FuFirE/Astrologie decommissionen (Flag zuerst, löschen zuletzt)

**T-B01 · Feature-Flag `ASTRO_ENABLED` (Abschalten ohne Löschen)**
Flag in `src/lib/config.ts` (Default off auf dem Migrationsbranch): blendet astrologische Produkte,
Nav-Ziele und den Alt-Konfigurator aus; Legacy-Routen antworten mit Redirect (siehe T-E02).
Shop-Hülle unverändert.
REQ: AK01, AK17–21 · Dateien: `src/lib/config.ts`, `src/App.tsx`, `src/lib/taxonomy.ts` (nur Filter) ·
Tests: neuer Unit-Test „kein Astro-Angebot im gerenderten Nav/Home bei Flag off"; bestehende Suite grün ·
Evidence: `[REAL-BROWSER]` Screenshot Nav/Home ohne Astro-Einträge.

**T-B02 · Poster-Basistypen aus `bazi.ts` extrahieren**
`sizes`, `frames` und gemeinsam genutzte Poster-Typen nach `src/lib/posterOptions.ts` +
`src/lib/posterTypes.ts` verschieben; alle Importe umstellen; `bazi.ts` bleibt vorerst (geschützt).
REQ: AK14 · Dateien: `src/lib/posterOptions.ts` (neu), `src/lib/posterTypes.ts` (neu),
`src/lib/bazi.ts` (nur Re-Export), Importstellen (`productTypes.ts`, `Personalize.tsx`, Designs) ·
Tests: Build + bestehende Größen-/Preisparitätstests unverändert grün ·
Evidence: CI grün; keine Verhaltensänderung.

**T-B03 · Server: Astro-Routen und FuFirE entfernen**
`/api/bazi`, `/api/western`, `/api/match`, `/api/geocode` aus `server/index.js`; `server/fufire.js`
löschen; `server/personalizationGate.js` außer Dienst (Ersatz kommt in T-F02); `.env.example` und
Doku bereinigen.
REQ: AK02 · Dateien: `server/index.js`, `server/fufire.js` (löschen),
`server/personalizationGate.js`, `.env.example`, `CLAUDE.md`-Abschnitte ·
Tests: `tests/server/**`-Astro-Tests entfernen; neuer Test: Alt-Routen → 404/410 ·
Evidence: CI grün; `grep`-Beleg „fufire" nur noch in Ledger/Archiv-Doku.

**T-B04 · Client: Astro-Code stilllegen**
Löschen: `src/lib/baziClient.ts`, `src/hooks/useBaziChart.ts`, `src/hooks/usePlaceResolution.ts`,
`src/lib/cities.ts`, `src/lib/personalization.ts`, `src/pages/TcmOverview.tsx`;
`src/components/shop/PersonalizeInfoSections.tsx` nach Nutzungsprüfung. Designs `westernZodiac.mjs`
und `paarHarmonie.mjs` auf `active: false` (Registry-Regel: NIE löschen — Altbestellungen).
REQ: AK01, AK12 · Dateien: s. o. + `src/designs/registry.mjs` ·
Tests: Design-TÜV läuft weiter über inaktive Designs; tote Tests entfernen; Suite grün ·
Evidence: CI grün; Registry-Diff im Commit.

**T-B05 · `bazi.ts` endgültig löschen (GATE: Operator-OK)**
Nur nach explizitem Operator-Signal (geschützte Fläche) und wenn T-B02 alle Verbraucher umgestellt hat.
REQ: AK01 · Dateien: `src/lib/bazi.ts` · Tests: Build + Suite grün ·
Evidence: Operator-OK als Ledger-Zeile; CI grün.

**T-B06 · FuFirE-Secrets aus Railway entfernen**
`FUFIRE_API_URL`/`FUFIRE_API_KEY` löschen (per Railway-CLI, nach T-B03 deployt der Alt-Branch noch —
Secrets erst entfernen, wenn der Alt-Branch nicht mehr produktiv ist ODER Werte dort ungenutzt sind).
REQ: AK02 · Dateien: keine · Tests: `/api/health` weiter 200 ·
Evidence: Railway-CLI-Output im Ledger; Vertragskündigung FuFirE = Operator-Task.

### Phase C — Translation-Domain aufbauen

**T-C01 · Domain-Typen**
`TargetLanguage`, `PersonalizationType`, `ProductWorld`, `TranslationStatus`, Kandidaten- und
Snapshot-Typen gemäß REQ-STATUS/REQ-SNAP/V3 §11.
REQ: AK03, AK04, REQ-STATUS, REQ-SNAP · Dateien: `src/lib/translationTypes.ts` (neu) ·
Tests: Typ-Ebene via Nutzung; Unit-Test Status-Übergangsmatrix (erlaubte Transitionen) ·
Evidence: CI grün.

**T-C02 · Validierung serverseitig**
NFC-Normalisierung, Längengrenzen je Design/Layout, CJK-Skripterkennung (Unicode-Ranges),
nicht druckbare Zeichen, XML-Escaping (Wiederverwendung `src/designs/svgUtil.mjs`), Glyphen-Check.
REQ: AK33, V3 §5.1C/§6.2 · Dateien: `server/translationValidation.js` (neu) ·
Tests: Unit (node-Projekt): Normalisierung, Grenzen, Injection-Versuche, Han/Kana/Hangul-Erkennung ·
Evidence: CI grün.

**T-C03 · Preview-/Confirm-Endpunkte + Provider-Adapter**
`POST /api/translation/preview` und `POST /api/translation/confirm` in neuem Modul (dünne Verdrahtung
in `index.js` — 500-Zeilen-Regel!). Austauschbarer Adapter `translatePreview(input, provider)`;
ohne konfigurierten Provider → `503` (Env-Gate-Konvention). Cache über normalisierten Input-Hash,
Rate-Limit, strukturierte JSON-Antwort (V3 §6.1), Providerfehler = ehrlicher Fehlerstatus, NIE
erfundener Fallback (Analogie zur FuFirE-Ehrlichkeitsregel).
REQ: AK05, AK16, REQ-PROV · Dateien: `server/translation.js` (neu), `server/index.js` (Verdrahtung) ·
Tests: Integration (supertest): 503 ohne Provider, Stub-Provider-Antwort, Cache-Hit, Rate-Limit,
Fehlerpfad ohne Fallback · Evidence: CI grün; `[INTEGRATION-FAKE]` bis T-Q04.

**T-C04 · Persistenz `translation_jobs`**
Tabelle gemäß V3 §7 (Boot-Schema wie bestehende Tabellen); Store-Modul mit Statusübergängen;
keine Namens-/Übersetzungsdaten in Logs; Löschfrist-Policy dokumentiert.
REQ: AK09, AK10, REQ-STATUS · Dateien: `server/translationStore.js` (neu), `server/index.js` (Schema) ·
Tests: Integration mit pg-Stub/Test-Pool: Anlage, Statuswechsel, verbotene Übergänge abgelehnt ·
Evidence: CI grün.

**T-C05 · Client-Hook**
`useTranslationPreview`: 400–600 ms Debounce, AbortController bei Weitertippen, Status
`idle/loading/success/error`; bei `error` kein Add-to-Cart.
REQ: AK05, REQ-MOB (abbrechbare Requests) · Dateien: `src/hooks/useTranslationPreview.ts` (neu) ·
Tests: jsdom: Debounce, Abbruch, Fehlerpfad blockiert CTA ·
Evidence: CI grün.

**T-C06 · Warenkorb-Snapshot**
Cart-Line trägt den vollständigen Snapshot (REQ-SNAP); Persistenz über Reload (bestehende
ShopStore-Persistenz nutzen).
REQ: AK09, AK31 · Dateien: `src/store/ShopStore.tsx`, `src/lib/checkout.ts`, `translationTypes.ts` ·
Tests: jsdom: Snapshot vollständig im Cart-State; Reload-Persistenz ·
Evidence: CI grün.

**T-C07 · Provider-Benchmark (BLOCKED: Reviewer/Operator)**
Testset 15 Namen + 15 Wörter/Sätze je Zielschrift × 4 Schriften; ≥ 1 sprachkundiger Review je
Zielschrift; Bewertung Natürlichkeit/Aussprache/Bedeutung/Rückübersetzung/kulturelle Eignung;
Datenschutz/AV, Kosten, Fehler-/Rate-Limit-Verhalten. Erst danach Provider produktiv setzen.
REQ: REQ-PROV, AK16 · Dateien: `docs/evidence/cjk-migration/provider-benchmark/` (neu) ·
Tests: keine (Bewertungsartefakt) · Evidence: `[HUMAN-VERIFIED]` Bewertungsbögen + Entscheidung im Ledger.

### Phase D — Konfigurator (Mobile zuerst)

**T-D01 · Mobiler Schritt-Flow bei 375 px**
`src/pages/Personalize.tsx` → `PosterConfigurator.tsx` (Route `/personalize` bleibt kanonisch).
Schritte: Textart → Zielsprache → Variante → Design/Gestaltung → Format/Rahmen → Prüfung/Freigabe.
Ein Schritt pro Screen, Fortschrittsanzeige, Eingabepersistenz bei jedem Wechsel, Sticky-CTA nach
REQ-MOB (Safe-Area, Tastaturverhalten), keine festen Höhen, Labels sichtbar, Inputs ≥ 16 px.
REQ: AK03, AK04, AK08, AK26–AK32, AK36 · Dateien: `src/pages/PosterConfigurator.tsx` (neu, ersetzt
`Personalize.tsx`), `src/App.tsx`, ggf. neue Komponenten unter `src/components/shop/` ·
Tests: jsdom: Schrittwechsel ohne Datenverlust, Variantenpflicht vor Weiter, CTA-Blockade bei Fehler ·
Evidence: `[REAL-BROWSER]` mobile Flows (375 px) als Screenshots/GIF.

**T-D02 · Live-SVG-Vorschau**
Echte Registry-Renderfunktion (dieselbe wie Druck), sichtbare Safe Area, Warnung bei Textgrenze,
kompakte/aufklappbare mobile Vorschau; Designwechsel ohne Datenverlust.
REQ: AK05, AK06, AK32, AK33 · Dateien: Konfigurator-Komponenten, `src/designs/registry.mjs` ·
Tests: jsdom: Vorschau nutzt Registry-`render`; Grenzwert-Warnung erscheint ·
Evidence: `[REAL-BROWSER]` Vorschau mit langem/kurzem Text.

**T-D03 · Freigabe-Schritt + Add-to-Cart**
Prüf-Checkbox (Wortlaut V3 §8 Schritt 6), erst dann Add-to-Cart; Snapshot-Status
`customer_selected`.
REQ: AK08, AK09, REQ-STATUS · Dateien: Konfigurator, `ShopStore.tsx` ·
Tests: jsdom: ohne Checkbox kein Add-to-Cart; Snapshot-Status korrekt ·
Evidence: CI grün + T-D01-Browserlauf.

**T-D04 · Desktop-Erweiterung**
Zweispaltenlayout ≥ 1024 px mit identischer Zustands-/Validierungslogik (kein getrennter Pfad).
REQ: AK36, AK20, AK24 · Dateien: Konfigurator (nur Layout-Ebene) ·
Tests: bestehende Logik-Tests decken beide Layouts (gleiche Hooks) ·
Evidence: `[REAL-BROWSER]` 1280-px-Screenshot.

### Phase E — Taxonomie, Katalog, Navigation

**T-E01 · Taxonomie & Katalog neu**
`taxonomy.ts` als einzige Quelle neu: Primärnav „Personalisieren · Kollektionen · Bestseller ·
Neuheiten"; Mega-Menü nach Textart/Sprache/Stil/Shop (V3 §12) — Mechanik unverändert.
`catalog.ts`/`collections.ts`/`productTypes.ts`: neue Produktwelten
(`personalized-name`, `personalized-phrase`, `curated-art-print`); alle Astro-/TCM-IDs soft-retired
(Preise bleiben serverseitig gültig für Alt-Warenkörbe; keine Listen/Suche/Nav-Ausspielung).
REQ: AK01, AK04, AK12, AK21 · Dateien: `src/lib/taxonomy.ts`, `catalog.ts`, `collections.ts`,
`productTypes.ts` · Tests: Mega-Menü-Tests anpassen; Retired-Filter-Test; Paritätstest Preise ·
Evidence: CI grün; `[REAL-BROWSER]` Mega-Menü vorher/nachher (T-Q05-Input).

**T-E02 · Redirects für Alt-URLs**
Alle astrologischen Routen (`/tcm`, BaZi-/Match-/Analyse-Slugs, retirierte Kollektionen) →
dauerhafte Redirects auf die sachlich nächste neue Seite; bestehende 6 Legacy-Redirects erweitern.
REQ: AK13 · Dateien: `src/App.tsx` (Navigate-Redirects), ggf. `server/index.js` für Nicht-SPA-Pfade ·
Tests: Unit: Redirect-Tabelle vollständig (jede alte Route hat Ziel); Integration: kein 404 ·
Evidence: CI grün; Crawl-Protokoll der Alt-URLs (Statuscodes) als Artefakt.

**T-E03 · Kuratierte Poster übernehmen (BLOCKED: Operator-Assets)**
Nur Poster ohne TCM/Astro-Bezug, mit Bild + Druckdatei, neuem Text/SEO, belegtem Gelato-Mapping,
geklärten Rechten (Kriterien V3 §11).
REQ: AK12 · Dateien: `catalog.ts`, `server/printAssets.js` (Operator-PDFs), `public/images/` ·
Tests: Katalog-Konsistenztest (jedes curated-Produkt hat Asset-Registrierung oder ist inaktiv) ·
Evidence: `[REAL-ARTIFACT]` je Poster: Druck-PDF-Maßprüfung wie bisher.

### Phase F — Pricing & Checkout

**T-F01 · Pricing-Modell neu**
Neue SKU-Prefixe/Preise für personalized/curated in `server/pricing.js` + Spiegel
`src/lib/productTypes.ts` (Paritätstest bleibt Pflicht); `digital:`/`bundle:`-Neuverkauf beenden,
Alt-Preise serverseitig gültig lassen. Endkalkulation bleibt Operator-Task am Ende.
REQ: AK14, ADR-001 · Dateien: `server/pricing.js`, `src/lib/productTypes.ts` ·
Tests: Paritätstest erweitert; unbekannte ID → 400 vor Stripe (bestehendes Muster) ·
Evidence: CI grün.

**T-F02 · Checkout-Gate: Übersetzungs-Snapshot serverseitig prüfen**
Ersatz für `personalizationGate.js`: `/api/checkout` validiert Produkt-ID, Design-ID, Sprache,
`translationStatus` (mind. `customer_selected`), Textgrenze, Größe, Rahmen; Verstoß → 400 vor Stripe.
Snapshot wird server-autoritativ in die Order-Metadata geschrieben.
REQ: AK09, AK10, REQ-SNAP · Dateien: `server/translationGate.js` (neu), `server/index.js`,
`src/lib/checkout.ts`, `src/pages/Checkout.tsx` ·
Tests: Integration: gültige/ungültige Snapshots, Status-Verletzung, Textgrenzen-Verletzung ·
Evidence: CI grün; `[INTEGRATION-FAKE]` bis T-Q04.

### Phase G — Fulfillment mit Review-Gate

**T-G01 · Freigabe-State-Machine**
Neue Reihenfolge: Webhook → Order gespeichert → `translation_status` prüfen → bei nicht-`approved`
Produktion PAUSIEREN (Status `awaiting_review`, Alarm-/Info-Mail an `ORDER_NOTIFY_EMAIL`) →
Freigabe-Route (env-gated Secret, analog Retry-Route) setzt `approved` → finale SVG → PDF → Gelato.
Idempotenz (`UNIQUE(stripe_session, line_key)`, `gelato_order_id`-Check) bleibt erhalten.
Eigene CJK-Eingabe (Modus C) und curated-Poster ohne Übersetzung: definierter Schnellpfad
(validiert, aber ohne Sprachreview) — explizit im Ledger dokumentieren.
REQ: AK10, AK11, AK12, REQ-STATUS · Dateien: `server/fulfillment.js`, `server/translationStore.js`,
`server/index.js` (Freigabe-Route) ·
Tests: Integration: unfreigegeben ⇒ kein `server/gelato.js`-Aufruf; Freigabe ⇒ genau eine Produktion;
Doppel-Freigabe idempotent; PDF enthält exakt `finalText` ·
Evidence: CI grün; `[INTEGRATION-FAKE]` bis T-Q04.

**T-G02 · Sprachabhängige Font-Map (Browser = PDF)**
Noto Serif CJK SC/TC/JP/KR (+ Sans-Nebenschnitte) als EINE Quelle für Vorschau und
`server/pdf.js`-Einbettung; Font-Map `targetLanguage → fontId → Dateien`; Browser lädt nur die
Fonts der gewählten Sprache (Subset/`font-display`), PDF bettet subset ein.
Lizenzstatus (OFL) im Ledger belegen.
REQ: AK07, AK35, REQ-MOB (Performance) · Dateien: `server/assets/` (Fontdateien),
`server/pdf.js`, `src/designs/` Font-Referenzen, neue `src/lib/fontMap.ts` oder Registry-Feld ·
Tests: Unit: Map vollständig für 4 Sprachen; PDF-Test: Glyphen der kanonischen Testtexte vorhanden
(kein Tofu — Muster aus bestehendem CJK-Fund wiederverwenden) ·
Evidence: `[REAL-ARTIFACT]` PDF je Sprache mit Maß- und Glyphenprüfung.

**T-G03 · Registry-Erweiterung + 3 Basisdesigns**
Registry-Metadaten erweitern: `kind`, `supportedLanguages`, `supportedScripts`, `layouts`,
`maxGlyphs` je Layout, `fontId`, `thumbnail` (V3 §9). Drei technische Basisdesigns
(zh/ja/ko minimal, horizontal + vertikal wo sinnvoll) als reine Renderfunktionen; Design-TÜV
erweitert um: Glyphen-Limit eingehalten, Safe-Area-Felder vorhanden, Sprach-Deklaration konsistent.
REQ: AK06, AK33 · Dateien: `src/designs/registry.mjs`, `src/designs/{chinese,japanese,korean}/…`
(neu), `tests/unit/design-registry-tuev.test.ts` ·
Tests: erweiterter Design-TÜV über alle aktiven Designs ·
Evidence: CI grün; Visual-Matrix folgt in T-Q03.

### Phase H — Inhalte, SEO, Legal

**T-H01 · Shop-Texte neu (4 Sprachen)**
Home, About, FAQ, How-It-Works, Collections, PDP-Texte, Meta-Titles, structured data,
Newsletter-Copy: CJK-Poster-Welt; Produktzusage exakt nach V3 §5.3 („Sofortige personalisierte
Vorschau. Der finale Text wird vor der Produktion geprüft und erst nach Freigabe gedruckt.").
Home-Struktur: bestehende Komponenten neu befüllen (V3 §12), keine Layout-Neubauten.
REQ: AK01, AK16, AK17–22, AK24 · Dateien: `src/lib/translations.ts`, `src/pages/…`, `index.html` ·
Tests: T-H02-Meta-Tests; Suite grün · Evidence: `[SHIPPED-SCAN]` + T-Q05-Abnahme.

**T-H02 · Meta-Tests auf neue Wahrheit umstellen**
`truthful-claims.test.ts`: Verbotsliste neu — keine astrologischen Angebots-Claims im Shipped-Text,
keine „garantiert korrekte Übersetzung", weiterhin keine Heilversprechen; `exact-reality-ledger`-
Prüfung auf das neue Plan-/Ledger-Paar zeigen; `delta-cities-source.test.ts` entfernen oder auf
„kein Geocoder-Host" verallgemeinern (Geocoding entfällt).
REQ: AK16, AK01 · Dateien: `tests/unit/truthful-claims.test.ts`,
`tests/unit/exact-reality-ledger.test.ts`, `tests/unit/delta-cities-source.test.ts` ·
Tests: die Meta-Tests selbst · Evidence: CI grün.

**T-H03 · Datenschutz & Provider-Disclosure**
Übersetzungsanbieter-Verarbeitung, Speicherdauer/Löschfristen für `translation_jobs`,
Log-Verbot personenbezogener Texte; `[MISSING]`-Marker bleiben, bis Operator Firmendaten liefert.
REQ: V3 §7-Regeln · Dateien: `src/lib/legal.ts`, `translations.ts` ·
Tests: Suite grün · Evidence: Ledger-Zeile; Operator-Review der Rechtstexte.

### Phase I — Aufräumen

**T-I01 · Alt-Inhalte und tote Artefakte**
Astrologische Blog-Artikel entfernen/archivieren; ungenutzte Bilder löschen; astrologische
i18n-Schlüssel entfernen; veraltete Dokumente markieren (`docs/OPERATOR_HANDOFF.md` — enthält
zusätzlich die schon im IST-Bericht notierte falsche Repricing-Aussage — und
`docs/architecture/current-architecture.md` mit Superseded-Hinweis versehen).
REQ: AK01, AK14 · Dateien: `src/pages/Blog.tsx`/`Article.tsx`-Inhalte, `public/images/`,
`translations.ts`, Doku · Tests: Suite grün, kein toter Import ·
Evidence: CI grün.

**T-I02 · Secrets & Verträge**
Nach Produktivwechsel: FuFirE-Vertrag kündigen (Operator), Railway final bereinigen (T-B06-Rest).
REQ: AK02 · Dateien: keine · Tests: — · Evidence: Ledger-Zeile mit Operator-Bestätigung.

### Phase Q — QA, Evidence, Abnahme

**T-Q01 · Mobile-Pflicht-Sweep**
Alle Kernrouten × 320/375/390/430/768/1024/1280 px: kein H-Scroll, keine verdeckten Felder,
Drawer/Dialoge vollständig, Tastatur- und Touch-Bedienung, Fokusführung, Sticky-CTA/Safe-Area,
Sprache/Design-Wechsel ohne Datenverlust, Cart+Checkout bei 320–375 px voll nutzbar.
REQ: AK23, AK26–AK34 · Dateien: keine (Messung); Sweep-Skript analog Batch-#12-R7 wiederverwenden ·
Tests: automatisierter Sweep (Konsole/Netzwerk/H-Scroll) + manuelle Touch-Punkte ·
Evidence: `[REAL-BROWSER]` Mess-Protokoll als Artefakt.

**T-Q02 · Performance-Evidence**
Initial-Bundle-Größe, mobile Bildgrößen, geladene CJK-Fonts pro Sprache, Requests pro Eingabefluss,
Slow-Network-Verhalten, Abbruchverhalten, Konfigurator-Wiederaufruf.
REQ: AK35, REQ-MOB · Dateien: `docs/evidence/cjk-migration/performance/` ·
Tests: Build-Size-Assertion (Three.js weiterhin nicht im Entry-Chunk) ·
Evidence: `[REAL-ARTIFACT]` Messwerte-Dokument.

**T-Q03 · Visual-Matrix je aktivem Design**
zh-Hans/zh-Hant/ja/ko × kurzer Name/langer Name/kurzer Satz/Grenzfall, mobile Vorschau,
PDF mit Beschnitt.
REQ: AK06, AK07, AK33 · Dateien: `docs/evidence/cjk-migration/visual-matrix/` ·
Tests: Rendertests (SVG valide, Grenzen) laufen in CI; Sichtprüfung manuell ·
Evidence: `[REAL-ARTIFACT]` PDF/PNG-Satz + Sichtprüfungs-Protokoll.

**T-Q04 · Real-Boundary-Smoke (BLOCKED bis T-C07)**
Echte Kette: realer Provider-Request → Vorschau → Stripe-Testcheckout → Snapshot in Order →
Freigabe → Druck-PDF → Gelato-Draft → visueller Operator-Check.
REQ: AK15, AK09–AK11 · Dateien: `scripts/evidence/`-Smoke-Skript neu (Muster: bestehende Skripte) ·
Tests: Skriptlauf gegen Prod-Testmodus · Evidence: `real-boundary-smoke` = `[REAL-BOUNDARY-LIVE]`
Artefakt-Kette im Ledger (Mindestevidenz laut V3 §14).

**T-Q05 · Visuelle Abnahme (GATE: Operator)**
Vorher/Nachher: Startseite, Mega-Menü, Konfigurator (mobil+Desktop), PDP, Warenkorb, Checkout —
gegen T-001/T-002-Baseline; manuelle Betreiber-Freigabe. Ohne Abnahme: `requires-human-acceptance`.
REQ: AK17–AK25, AK37, AK38 · Dateien: `docs/evidence/cjk-migration/acceptance/` ·
Tests: — · Evidence: `[HUMAN-VERIFIED]` Freigabe-Protokoll im Ledger.

---

## 6. Risiken und Rollback

| # | Risiko | Gegenmaßnahme im Plan |
|---|---|---|
| 1 | Übersetzungsqualität: Namen haben keine einzige „richtige" Entsprechung | Variantenmodell + aktive Kundenwahl (T-D03), Review-Gate (T-G01), Produktzusage ohne Garantie (T-H01), Provider-Benchmark (T-C07) |
| 2 | Schriftlizenzen | Basisbetrieb nur Noto CJK/OFL (T-G02); Kalligrafie erst nach Lizenznachweis |
| 3 | Vorschau ≠ Druck | identische Renderfunktion + identische Fontdateien (AK06/AK07, T-G02, T-Q03) |
| 4 | Zu lange Texte zerstören Design | `maxGlyphs` je Layout in Registry + Server-Validierung (T-C02, T-G03) |
| 5 | Automatische Produktion falscher Texte | State-Machine: Gelato nur nach `approved` (T-G01); Test „unfreigegeben ⇒ kein Gelato-Aufruf" |
| 6 | Astro-Altbestand bleibt auffindbar | Redirect-Vollständigkeitstest (T-E02), Shipped-Scan (T-H02), Crawl-Protokoll |
| 7 | Produktions-Deploy bricht während Migration | Railway bleibt am Alt-Branch bis T-Q05-Abnahme; Umschaltung ist ein bewusster, dokumentierter Schritt |
| 8 | Stille Vertragsverletzung (Batch #12 / RED-Carries / Memory) | T-A03-Gate mit Operator-Sign-off VOR jeder Löschung |
| 9 | `RL-VITEST-ENV` täuscht lokale Grün-/Rot-Aussagen vor | Referenz ist ausschließlich CI (T-A01-Baseline); keine „Tests grün"-Behauptung ohne CI-Lauf |
| 10 | Alt-Warenkörbe/Alt-Bestellungen brechen | Retired-Preise bleiben serverseitig gültig (T-E01/T-F01); Registry-Einträge nie gelöscht (T-B04) |

**Rollback-Strategie:**

- Gesamte Migration lebt auf `feat/cjk-personalized-poster-shop`; Produktion (Railway) deployt bis
  zur Abnahme unverändert `feat/fufire-personalization@ffda5c6` → Rollback = nichts tun bzw.
  Redeploy des Alt-Branches.
- DB-Änderungen sind rein additiv (`translation_jobs`, neue Statusspalten) — Alt-Branch läuft
  gegen dieselbe DB weiter; keine destruktiven Migrationen auf bestehenden Tabellen.
- Secrets (T-B06/T-I02) erst entfernen, wenn der Alt-Branch nachweislich nicht mehr deployt ist.
- Jede Phase endet mit grünem CI-Lauf; ein fehlgeschlagenes Gate (T-A03, T-B05, T-Q05) stoppt
  die Folgephasen, ohne bereits Erreichtes zu invalidieren.
