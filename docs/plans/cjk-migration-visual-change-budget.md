# Visuelles Change Budget — CJK-Migration

**Stand:** 2026-07-31 · **Quelle:** Präzisionsplan V3 §15.1 (Operator-Vertrag) ·
**Baseline:** `docs/evidence/cjk-migration/ui-baseline/` + `design-token-baseline.json` (Commit `ffda5c6`)

Alles, was nicht in der Erlaubt-Liste steht, gilt als **`design-preservation`** und darf
nicht still verändert werden. Referenzwerte (Farben, Fonts, 1200-px-Container) sind in der
Token-Baseline maschinell festgeschrieben — Abweichung = Budget-Verletzung (REQ-AK17/AK18/AK25).

## Erlaubt ohne Einzelfreigabe

- neue Produktbilder;
- neue Texte;
- neue Formularfelder;
- neue Statusanzeigen (Laden / Fehler / Prüfung / Freigabe);
- angepasste Mega-Menü-Inhalte (Mechanik unverändert);
- neue Konfigurator-Anordnung innerhalb des bestehenden Layoutsystems;
- reduzierte oder entfernte Sektionen;
- bessere mobile Abstände;
- barrierefreie Kontraste und Fokuszustände;
- neue CJK-Posterfonts **ausschließlich innerhalb der Posterfläche**.

## Nur mit ausdrücklicher Einzelentscheidung des Betreibers

- neue Markenfarben;
- neue Shop-Schriftarten;
- neues Logo;
- neue globale Buttonform;
- neue globale Kartenform;
- andere Containerbreite (aktuell 1200 px);
- vollständiger Header- oder Footer-Neubau;
- generelles Dark Theme;
- neue Animationssprache;
- Wechsel von minimalistisch-editorial zu SaaS-/App-Optik.

## Abnahmeverfahren

Vor Merge: Vorher/Nachher-Vergleich (Startseite, Mega-Menü, Konfigurator mobil+Desktop,
Produktseite, Warenkorb, Checkout) gegen die Phase-0-Baseline + manuelle Freigabe durch den
Betreiber (T-Q05). Ohne Abnahme: `requires-human-acceptance`. Abweichungen außerhalb der
Erlaubt-Liste werden einzeln im Ledger (`docs/evidence/cjk-migration/ledger.md`) dokumentiert.
