# AgileTeam Delta Package — SizhuAtelier Desenio Delta Architecture

Readiness-Level: READY_FOR_USER_CONFIRMATION  
Mode: PLUMBLINE_READY_PACKAGE  
Feature Slug: `sizhuatelier-desenio-delta-architecture`

Dieses Paket beschreibt ausschließlich die Delta-Version vom aktuellen Ist-Stand zur Zielarchitektur.

## Enthalten

- `docs/vision/sizhuatelier-desenio-delta-architecture.vision.md`
- `docs/canvas/sizhuatelier-desenio-delta-architecture.canvas.md`
- `docs/prd/sizhuatelier-desenio-delta-architecture.prd.md`
- `docs/traceability.md`
- `intake-package.json`
- `validation-report.json`
- `validation-report.txt`

## Grundsatz

Der aktuelle Shop bleibt technische Basis. Der InkWave-Hero bleibt unverändert. Umgebaut werden Navigation, Home-Modulfolge, Mega-Menüs, Mobile UX, Produktlogik, Collections, PDPs, Cart-Hinweise, i18n/Region, Farbregeln sowie sichtbare Trust-/Placeholder-Elemente.

## User Confirmation

```text
Ich bestätige, dass Product Canvas und Product Vision meine Absicht korrekt wiedergeben und als Grundlage für AgileTeam Planning verwendet werden dürfen.
```


## Präzisionsnachtrag aus letzter Nutzerfreigabe

Die Delta-Artefakte wurden ergänzt: Filter/Sortierung, Produktgrid, Pagination/Mehr zeigen, SEO, Trust/Footer, Featured/Campaign Collection, Breadcrumb, Suche, Account, Favoriten, Warenkorb, Sprache/Land, Utility-/Promo-Bar und Angebots-/Sale-Hub sind verbindliche Architekturpunkte. Alles andere bleibt gemäß vorherigem Delta-Paket bestehen.

## Was AgileTeam SOFORT erkennen muss

1. **DELTA, kein Neubau.** Dieses Paket ist ein DELTA vom aktuellen (deployten V2-) Zustand zur Zielarchitektur, KEIN Rebuild. Die bestehende technische Basis bleibt erhalten.
2. **Hero unverändert.** Der InkWave-Hero bleibt unverändert (Konzept und Position). Erlaubt sind nur technische Fixes gegen Mobile-Abschneiden.
3. **REQ-002 ordnet bewusst neu.** REQ-002 ordnet die deployte V2-Homepage absichtlich um in die exakte Zielsequenz: Hero (unverändert) → Bestseller Product Slider → Kategorie-Banner → Editorial/Atelier Block → Neuheiten Product Slider → Campaign-/Featured-Collection-Banner → SEO/Trust → Newsletter → Footer. Das ist ein gewolltes Re-Ordering, kein Bug.
4. **Erweitertes Traceability-Format.** Die Traceability muss im erweiterten AgileTeam-/Reality-Format gelesen werden (REQ-ID ↔ AC ↔ Task ↔ Evidence + sechs Canvas-Felder + vision-link + true-line-status + evidence-class + wired-in-prod?). Die Matrix wird vom `context-keeper` aus den Requirements-Analyst-Mappings gebaut.
5. **OQ-001..004 sind nach Blocking-Ebene getrennt.** Jede Open Question trägt eine Klassifikation nach Code- / Operator- / Content- / Launch-Blocking-Ebene (siehe OQ-Klassifikationstabelle in PRD und Canvas). OQ-003 (Place-of-Birth-Autocomplete) ist code-blocking; DEFAULT = lokale/gebündelte Cities-JSON ODER policy-konformer Places-Anbieter, ausdrücklich NICHT clientseitiges Public-OpenStreetMap-Nominatim per Keystroke.
6. **Nutzerbestätigung darf nicht simuliert werden.** Kein Artefakt-Status darf vom Agenten auf user-confirmed gesetzt werden; nichts wird als production-verified markiert. Status bleibt `ready-for-user-confirmation` / `pending-user-confirmation`.
7. **READY_FOR_AGILETEAM_PLANNING erst nach exakter Nutzerbestätigung.** Erst wenn der Nutzer den exakten Bestätigungssatz gibt, wechselt der Readiness-Level auf `READY_FOR_AGILETEAM_PLANNING`. Vorher bleibt er `READY_FOR_USER_CONFIRMATION`.
