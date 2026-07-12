# Evidence-Ledger — FuFirE-Personalisierung + Design-Registry + Gelato + Hero/Mega-Menü

Regel: Eine Behauptung ohne Artefakt-Zeile hier gilt als NICHT bewiesen.
Offene RED-Posten stehen unten und blockieren den Launch, bis geschlossen.

Beweisklassen: `[REAL-BOUNDARY-LIVE]` (live API, gespeicherte Response) ·
`[REAL-BROWSER]` (Playwright gegen gebauten Server, Screenshot) ·
`[REAL-ARTIFACT]` (erzeugte Datei mit Maß-/Byte-Prüfung) ·
`[HUMAN-VERIFIED]` (Operator hat gesehen und abgezeichnet).

| Behauptung | Klasse | Artefakt | Reproduktion | Datum |
|---|---|---|---|---|

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
