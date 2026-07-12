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

## RED (offen, launch-relevant)

- **OQ-TLST** — Zi-Grenzfall-Konvention (TLST/boundary) vom Operator gegen die
  FuFirE-Snapshot-Suite (`tests/snapshots/moseph/zi_*.json` im FuFirE-Repo)
  zu bestätigen. Bis dahin gilt gepinnt: `standard=TLST`, `boundary=midnight`.
- **RL-GELATO** — Gelato-Fluss unbewiesen bis `GELATO_API_KEY` vorliegt (Phase F/H).
- **RL-STRIPE-CHAIN** — Volle Zahlungskette (Checkout→Webhook) unbewiesen bis
  Stripe-TEST-Keys lokal vorliegen; Fallback für H1/H2: Session-Fixture direkt
  gegen `fulfillOrder` (Stripe-Schritt dann `[INTEGRATION-FAKE]`, Rest real).
- **HERO-ASSET** — Finales Hero-Foto ist Operator-Asset (Phase 8 des
  Hero/Mega-Menü-Plans); bis dahin bestes vorhandenes Asset aus `public/images/`.
