# Evidence-Ledger — CJK-Migration

**Angelegt:** 2026-07-31 · **Basis-Commit:** `ffda5c6` · **Branch:** `feat/cjk-personalized-poster-shop`
**Plan:** `docs/plans/2026-07-31-cjk-migration.md` · **Normquelle:** `docs/plans/2026-07-31-cjk-praezisionsplan-v3-original.md`

Es gelten unverändert die Regeln des Haupt-Ledgers (`docs/evidence/fufire-gelato/ledger.md`):
**Eine Behauptung ohne Artefakt-Zeile gilt als NICHT bewiesen.** Beweisklassen absteigend:
`[REAL-BOUNDARY-LIVE]` → `[REAL-BROWSER]` → `[REAL-ARTIFACT]` → `[HUMAN-VERIFIED]` →
`[INTEGRATION-FAKE]` → `[SHIPPED-SCAN]`. Ein grüner Test allein ist kein Beweis.
Test-Referenz ist ausschließlich CI (`RL-VITEST-ENV`: lokale Vitest-Läufe auf dieser
Maschine sind wegen iCloud-I/O nicht beweisfähig).

---

## Migrationsentscheidung (2026-07-31)

Der Operator hat am 2026-07-31 den „Präzisionsplan V3 — Fachliche CJK-Shopmigration bei
erhaltener Marken- und Designidentität" übergeben (SHA-256
`310d75f93dc3fe351feeed2714dc71b8491cec9efe30ac1a0fddf8a696ffac84`, byte-identisch im Repo
als `2026-07-31-cjk-praezisionsplan-v3-original.md`) und die Ausführung angeordnet:

> „starte jetzt strukturiert. keine lügen, keine fake grünen haken, teste und beweise.
> führe nun den plan aus" — Operator, 2026-07-31

Inhalt: Astrologie/BaZi/TCM/FuFirE werden entfernt und durch personalisierte
CJK-Schriftposter ersetzt; Marke, Farben, Typografie, Shop-Hülle und
Commerce-Infrastruktur bleiben erhalten (kein Rebranding). Mobile First verbindlich.

---

## Vertrags-Änderungen (Operator-superseded — nie still fallengelassen)

Die folgenden früheren Verträge werden durch den V3-Plan ausdrücklich abgelöst.
Quelle je Zeile: V3 §1 („Nicht mehr Bestandteil") bzw. §3, plus Ausführungsbefehl vom
2026-07-31 (Zitat oben; der Ausführungsplan mit genau dieser Supersession-Liste in §3
wurde dem Operator vor dem Befehl vorgelegt).

| # | Alter Vertrag | Neuer Stand | Quelle |
|---|---|---|---|
| VÄ-1 | `RL-PREMIUM-PDF`: 195-€-Premium-Analyse, Generator VERBINDLICH 10–15 Seiten (Option B, 2026-07-18) | Produkt „digitale astrologische Analyse" entfällt ersatzlos → Carry **gegenstandslos** (nicht „erledigt") | V3 §1 „Premium-Analyse-PDF", §3 „Digitale Analyse: löschen" |
| VÄ-2 | `OQ-TLST`: Zi-Grenzfall-Konvention gegen FuFirE-Snapshot-Suite bestätigen | FuFirE wird decommissioned → Frage **gegenstandslos** | V3 §3 „FuFirE-Client: löschen" |
| VÄ-3 | Batch #12: „genau EINE Personalisierungsseite mit 5 Angeboten (BaZi/Geburtschart/Paar/Analyse/Bundle)" | ersetzt durch CJK-Poster-Konfigurator (Name/Satz/eigene CJK × zh-Hans/zh-Hant/ja/ko) | V3 §8 |
| VÄ-4 | FuFirE-Konventions-Pins (TLST/midnight, kanonische Fixture 1990-06-15) als lebende Verträge | nur noch historische Beweise; keine Weiterentwicklungspflicht | V3 §3 |
| VÄ-5 | `RL-PRINT-ASSETS`: Druck-PDFs für die BESTEHENDEN Katalog-Poster (Fire Horse/TCM/Wuxing) | Astro-Katalog wird retiriert; Pflicht wandert auf die NEUEN kuratierten CJK-Poster (T-E03) — Registry-Mechanik `server/printAssets.js` bleibt | V3 §3, §11 |
| VÄ-6 | Go-live-Plan `docs/plans/2026-07-20-go-live-plan.md` (nur auf `main`, beim Basis-Wechsel entdeckt) | Business-/Operator-Strecke BLEIBT GÜLTIG (Gewerbe, Stripe-Verifizierung, Rechtsdaten, LUCID/PPWR, Endpreise, Abbruchkriterien). Superseded sind nur: Premium-PDF-Punkt, OQ-TLST, astro-produktbezogene Druckdateien (→ VÄ-1/2/5) | V3 §1/§3 + Sichtung 2026-07-31 |

**Unverändert gültig bleiben:** `RL-STRIPE-LIVE` (Live-Modus nur Operator),
`RL-VITEST-ENV` (Umgebungs-Empfehlung offen), `RL-GELATO`-Rest (Draft-Sichtung),
`HERO-ASSET`, `RL-IMAGES` (echte Produktfotos), `RL-PAPER-CLAIM`, sowie sämtliche
Ehrlichkeits-Gates (Design-TÜV, truthful-claims, server-autoritatives Pricing/ADR-001,
Idempotenz der Fulfillment-Pipeline).

**Eigene Gates dieser Migration:**

| Gate | Inhalt | Status |
|---|---|---|
| GATE-BAZI-DELETE | `src/lib/bazi.ts` ist geschützte Fläche; endgültige Löschung (T-B05) erst nach explizitem Operator-OK | 🔴 offen |
| GATE-PROVIDER | Übersetzungsanbieter erst nach Benchmark mit sprachkundigen Reviews (T-C07); bis dahin `provider-unselected`, Preview-Route env-gated 503 | 🔴 offen |
| GATE-ACCEPT | visuelle Abnahme gegen Phase-0-Baseline durch Operator (T-Q05); bis dahin `requires-human-acceptance`, Railway bleibt am Alt-Branch | 🔴 offen |

---

## Beweisführung

### 2026-07-31 · T-001 UI-Baseline `[REAL-BROWSER]`

33/33 Screenshots gegen die LAUFENDE Produktion
`https://sizhuatelier-shop-production.up.railway.app` (Railway-Deployment
`f24ff865-dc38-4904-b7b6-2da636b3f48a`, HTTP/2 200): 9 Routen/Zustände × 375/768/1280 px
inkl. Mega-Menü offen (Desktop), Mobile-Drawer, Cart-Drawer (Leerzustand), echte
Kollektionsseite. Artefakte + `manifest.json` (Commit, Zeitstempel, Bytes je Aufnahme):
`docs/evidence/cjk-migration/ui-baseline/`. Script (reproduzierbar):
`scripts/evidence/ui-baseline-capture.mjs` — bricht bei jedem Fehlschlag mit Exit 1 ab.

*Fund dabei (ehrlich dokumentiert):* Der erste Lauf lieferte für „collection-first" die
Kollektion `/collections/bazi-posters` — deren Aufnahmen waren byte-identisch mit
`/personalize`, weil retirierte Kollektionen dorthin redirecten. Die Aufnahme wäre ein
**falsches Beweisstück** gewesen (angebliche Kollektionsseite, tatsächlich Personalize).
Script gehärtet: Redirect-Slugs werden erkannt und übersprungen; erfasst ist jetzt die
real erreichbare Kollektion `/collections/fire-horse-2026`. Sichtprüfung der Aufnahmen
`megamenu-open--w1280.png` (zeigt die komplette Astro-Taxonomie = „Vorher") und
`mobile-menu-open--w0375.png` bestanden.

### 2026-07-31 · T-002 Design-Token-Baseline `[REAL-ARTIFACT]`

`docs/evidence/cjk-migration/design-token-baseline.json` — 25 Farb-Tokens + Typografie
(Cormorant Garamond/Inter) + Container 1200 px, **maschinell** aus `src/lib/tokens.ts`
extrahiert (kein Abtippen), Commit-gestempelt. Deckungsgleich mit der V3-§0-Tabelle.

### 2026-07-31 · T-A04 V3-Normquelle `[REAL-ARTIFACT]`

Byte-identische Kopie nachgewiesen per SHA-256 (identischer Hash Quelle ↔ Repo, s. o.).

### 2026-07-31 · T-003 Change Budget

`docs/plans/cjk-migration-visual-change-budget.md` angelegt (V3 §15.1). Operator-
Kenntnisnahme: implizit durch Ausführungsbefehl zum Plan; Einzelfreigaben bleiben
je Verstoß-Fall erforderlich.

### 2026-07-31 · Repo-Wahrheit korrigiert: Basis ist `main@a32de0a` `[REAL-ARTIFACT]`

V3-Risiko 7 („Bericht und GitHub-Historie widersprechen sich") ist eingetreten und
aufgelöst. Messung statt Annahme:

- GitHub-API: `main` = `a32de0a` („Launch stabilization: Batch #12 R3–R7 (#14)",
  gemerged 2026-07-21 01:16 UTC); Remote-`feat/fufire-personalization` = `ffda5c6`
  (identisch mit lokal). Der lokale `main` war veraltet → daher die falsche
  „83 Commits zurück"-Aussage in CLAUDE.md/IST-Bericht.
- Harter Baum-Diff `git diff ffda5c6 a32de0a`: **nur 10 Dateien, +502/−49** — `main`
  ENTHÄLT den kompletten `ffda5c6`-Stand plus Go-live-Härtung (Webhook-Reliability-Test,
  Alarm-/Auto-Reply-Mail, `server/start.js`, Catalog-Anpassung, OPERATOR_HANDOFF-Update,
  Go-live-Plan, `RL-VITEST-ENV`-Schließung via jsdom-`scrollTo`-Stub; Suite dort 753 Tests).
- Railway-API (`railway status --json`): `latestDeployment.meta.branch = "main"`,
  Deployment `f24ff865-…`, HTTP/2 200 — die Produktion IST `main@a32de0a`. Damit sind die
  T-001-Baseline-Screenshots exakt deckungsgleich mit der Code-Basis des Migrationsbranchs.
- Konsequenz ausgeführt: Migrationsbranch auf `a32de0a` umgebaset (Cherry-Pick des
  Phase-0/A-Commits; Diff Branch↔`main` = ausschließlich die 43 neuen Doku-/Evidence-
  Dateien). Neue Schutzregel: **kein Merge nach `main` vor T-Q05** (Merge = Deploy).
- Beim Umbau ehrlich gefundene Eigenfehler, dokumentiert als Lernposten: (a) ein
  `| tail` verschluckte den Exit-Code eines fehlgeschlagenen `git checkout` — Folge-
  kommandos liefen scheinbar „grün" weiter; behoben durch exit-code-treue Wiederholung.
  (b) Zwei durch iCloud-I/O-Hänger abgebrochene Git-Operationen hinterließen
  `index.lock`/Rebase-Reste — vor jedem Eingriff Prozessliste geprüft, erst dann Locks
  entfernt.

### 2026-07-31 · CI-Referenzläufe

- Lauf 1 (Vor-Rebase-Stand `1465aab` = `ffda5c6`+Docs): **grün** — Build + sequenzielle
  Vitest-Suite + Lint (`gh run view 30654518213`: conclusion success).
- Lauf 2 (nach Basis-Wechsel, Head `2135ca5` auf Basis `a32de0a`): **grün** —
  `gh run view 30656158121`: status completed, conclusion success
  (https://github.com/VincBerlin/SizhuAtelierKimi/actions/runs/30656158121).
  **Das ist die gültige CI-Baseline der Migration (T-A01 erfüllt).** Railway-Quelle
  dokumentiert (main; Branch-Pushes deploy-neutral).

### 2026-07-31 · T-B02 Poster-Basistypen extrahiert — CI-bewiesen

`src/lib/posterTypes.ts` (Pillar/PosterData/ChartResult) + `src/lib/posterOptions.ts`
(frames/backgrounds/sizes/personalizedSizes inkl. Operator-Format-Direktive 2026-07-15)
aus `bazi.ts` extrahiert; `bazi.ts` ist Re-Export-Shim (alle Import-Stellen unverändert,
Löschung bleibt GATE-BAZI-DELETE), `taxonomy.ts` liest aus dem neutralen Modul.
Lokaler Build war heute NICHT beweisfähig (I/O-Stall, Prozess ohne Output abgebrochen —
ehrlich vermerkt); Beweis ist der CI-Lauf auf `df0593f`: **conclusion success**
(Build + sequenzielle Suite + Lint, `gh run view 30658262529`,
https://github.com/VincBerlin/SizhuAtelierKimi/actions/runs/30658262529).

<!-- Weitere Beweiszeilen werden hier chronologisch ergänzt. -->
