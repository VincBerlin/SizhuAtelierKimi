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

## RED (offen, launch-relevant)

- **RL-VITEST-ENV** — Vitest sammelt auf dieser Maschine 0 Tests — AUCH für
  vorbestehende, im Repo grün geführte Testdateien (Baseline-Beweis:
  `delta-cities-source.test.ts` → 0/0, exit 1; direkter Binary-Aufruf ohne
  rtk/Sandbox identisch). Der Defekt ist umgebungsweit und VORBESTEHEND,
  nicht durch diesen Branch verursacht. Alle neuen Tests sind geschrieben
  und committed; ausgeführt werden muss die Suite auf einer Maschine mit
  funktionierendem Vitest (CI oder frisches Terminal: `npm test`).
  Zwischenzeitliche Verifikation lief über die STÄRKEREN Beweisklassen:
  Live-API-Smokes, echtes PDF-Artefakt, tsc-Build.

- **OQ-TLST** — Zi-Grenzfall-Konvention (TLST/boundary) vom Operator gegen die
  FuFirE-Snapshot-Suite (`tests/snapshots/moseph/zi_*.json` im FuFirE-Repo)
  zu bestätigen. Bis dahin gilt gepinnt: `standard=TLST`, `boundary=midnight`.
- **RL-GELATO** — Gelato-Fluss unbewiesen bis `GELATO_API_KEY` vorliegt (Phase F/H).
- **RL-STRIPE-CHAIN** — Volle Zahlungskette (Checkout→Webhook) unbewiesen bis
  Stripe-TEST-Keys lokal vorliegen; Fallback für H1/H2: Session-Fixture direkt
  gegen `fulfillOrder` (Stripe-Schritt dann `[INTEGRATION-FAKE]`, Rest real).
- **HERO-ASSET** — Finales Hero-Foto ist Operator-Asset (Phase 8 des
  Hero/Mega-Menü-Plans); bis dahin bestes vorhandenes Asset aus `public/images/`.
