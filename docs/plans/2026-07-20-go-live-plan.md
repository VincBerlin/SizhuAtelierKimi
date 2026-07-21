# SizhuAtelier — präziser Go-live-Plan

Stand: 20.07.2026. Ziel ist ein nachweisbarer Ablauf von Zahlung bis
Produktion, ohne offene Platzhalter oder still verlorene Bestellungen.

## Statusübersicht

| Bereich | Status | Nächster Eigentümer |
|---|---|---|
| Checkout, serverseitige Preise, Personalisierungs-Gates | erledigt | Technik |
| Stripe-Testintegration und Webhook | technisch vorhanden; erneute Abnahme nach Merge | Technik |
| Stripe-Live | blockiert durch Gewerbe/Steuerdaten/Stripe-Verifizierung | Betreiber |
| Gelato-Integration | vorhanden; Startmodus bleibt `draft` | Technik/Betreiber |
| Katalog-Druckdateien | blockiert; Registry leer | Betreiber liefert, Technik registriert |
| Rechtstexte | Struktur vorhanden, echte Daten fehlen | Betreiber liefert, Technik pflegt ein |
| Verpackung/LUCID/PPWR | schriftliche Klärung mit Gelato offen | Betreiber |
| Premium-PDF 10–15 Seiten | offen | Technik nach Freigabe der Inhalte |
| Endpreise/Gratisversand | bewusst am Ende | Betreiber + Technik |

## Phase 1 — jetzt, ohne Stripe Live

- [x] R3–R7 auf einen sauberen Launch-Branch übernehmen.
- [x] Webhook so härten, dass fehlgeschlagene Order-Persistenz HTTP 500 auslöst.
- [x] Fatalen Fulfillment-Fehler an `ORDER_NOTIFY_EMAIL` melden.
- [x] Webhook-Reliability mit Integrationstests abdecken.
- [x] Produktions-Build, vollständige sequenzielle Testsuite und Lint ausführen
  (753/753 Tests, 0 Lint-Fehler).
- [x] `RL-VITEST-ENV` schließen: `window.scrollTo` im jsdom-Harness
  deterministisch stubben; exakter CI-Testbefehl läuft ohne Meldungsflut durch.
- [ ] Branch veröffentlichen, CI prüfen und kontrolliert nach `main` mergen.
- [ ] Railway-Quellbranch und deployten Commit gegen `main` prüfen.

## Phase 2 — parallele Betreiberlieferungen

- [ ] Einzelgewerbe anmelden und steuerliche Erfassung durchführen;
  Kleinunternehmerregelung im steuerlichen Fragebogen passend wählen.
- [ ] Stripe-Verifizierung mit den echten Angaben abschließen.
- [ ] Je Katalog-Poster und Format PDF nach `print-assets/README.md` liefern.
- [ ] Firmenname, Inhaber, ladungsfähige Anschrift, Kontakt, gegebenenfalls
  USt-ID/Registerangaben sowie Versand- und Widerrufsdaten liefern.
- [ ] Gelato-Antwort zur Verpackungsverantwortung sichern; LUCID und duales
  System vor physischen Verkäufen verbindlich klären.
- [ ] Newsletter-Termin festlegen.

## Phase 3 — Integrationen komplettieren

- [ ] Druckdateien in `PRINT_ASSETS` registrieren und jede Formatkombination testen.
- [ ] Echte Rechtsdaten in allen Sprachen einpflegen; `[MISSING]`-Scan muss leer sein.
- [ ] Premium-PDF-Generator mit verbindlich 10–15 Seiten implementieren und abnehmen.
- [ ] Stripe-Testmodus-End-to-End: Zahlung → Webhook → DB → PDF → Gelato-Draft.
- [x] `RL-VITEST-ENV` geschlossen.
- [ ] Verbleibende RED-Carries schließen: `OQ-TLST`, `HERO-ASSET`,
  `RL-PREMIUM-PDF`, `RL-PRINT-ASSETS`.

## Phase 4 — Live-Freigabe

- [ ] Separaten Stripe-Live-Webhook anlegen.
- [ ] Live-Key und zugehörigen Live-Webhook-Secret gemeinsam in Railway setzen.
- [ ] Customer Portal im Stripe-Live-Modus aktivieren.
- [ ] Kontrollierte echte Eigenbestellung durchführen; keine Testkarte im Live-Modus.
- [ ] Stripe-Ereignis, DB-Eintrag, Mails, PDF und Gelato-Draft als Beleg sichern.
- [ ] Endpreise, Versand und Gratisversand-Schwelle final kalkulieren und abgleichen.
- [ ] Erst nach vollständiger Abnahme öffentliche Garantie-/Automatik-Aussagen aktivieren.

## Abbruchkriterien

Kein Live-Verkauf, wenn mindestens eines davon zutrifft: Rechtsdaten enthalten
Platzhalter, ein physisches Produkt hat kein registriertes Druck-Asset,
Verpackungsverantwortung ist ungeklärt, Railway deployt nicht den freigegebenen
Commit, Stripe-Live-Secret und Webhook-Secret stammen aus verschiedenen Modi,
oder die kontrollierte End-to-End-Bestellung ist nicht vollständig belegt.
