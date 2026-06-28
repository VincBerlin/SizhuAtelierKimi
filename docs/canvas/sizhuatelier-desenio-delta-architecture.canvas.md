# Product Canvas: SizhuAtelier Desenio Delta Architecture

Status: user-confirmed  (RE-CONFIRMED by user 2026-06-27 after council amendments; final — see "Council-adopted amendments (Phase 0.16, 2026-06-27)")  
Feature Slug: `sizhuatelier-desenio-delta-architecture`  
Mode: PLUMBLINE_READY_PACKAGE  
Readiness-Level: READY_FOR_AGILETEAM_PLANNING (Canvas RE-CONFIRMED 2026-06-27 after council amendments; Vision user-confirmed; Spec-Sanity + REQ-002-incremental-acceptance + USER-GATE still pending before development)

## Source Map

| Source ID | Source Kind | Summary | Source Type |
|---|---|---|---|
| SRC-001 | Current Architecture Markdown | Aktueller Shop: React/Express, Home-Modulfolge 02..13, Navbar/Mega-Menü/Drawer, Collections, PDP, Personalisierung, CartDrawer, i18n EN/DE/FR, serverseitige Preislogik, RED-Platzhalter. | EXPLICIT |
| SRC-002 | User Conversation Decisions | Delta-Ziel aus Gespräch: shop-orientierte Struktur, Hero bleibt, Mobile First, Navigation/Mega-Menü mit Bildern, BaZi-only-Personalisierung, Region/Farben/Review/Credit/Placeholder-Regeln. | EXPLICIT |
| SRC-003 | Reference Architecture Markdown | Strukturreferenz: Utility-Bar, Header, Mega-Menü, Bestseller, Kategorie-Teaser, Collection/PDP, Trust, Newsletter/Footer. | EXPLICIT |

## Problem

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Problem | CAN-001 | Die aktuelle V2-Homepage ist technisch vorhanden, aber nicht exakt nach der adoptierten Shop-Architektur strukturiert: sie ist linear, hat ungleich große Sektionen, störende Blog-/SEO-Positionen und eine unvollständige Shop-Navigation. Die sichtbare Shop-Architektur muss als Delta vom aktuellen Stand zur Zielstruktur überführt werden: mobile UI schneidet Elemente ab, Personalisierung erscheint bei nicht personalisierten Produktwelten, und Fake-/Platzhalterelemente gefährden Vertrauen. | EXPLICIT | SRC-001, SRC-002 |

## Users / Customers

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Users / Customers | CAN-002 | Käufer von personalisierten BaZi-Postern und kuratierten TCM-/Wuxing-Fachpostern. | EXPLICIT | SRC-001, SRC-002 |
| Users / Customers | CAN-003 | Mobile Nutzer, die Poster personalisieren oder kaufen wollen, ohne UI-Friktion. | EXPLICIT | SRC-002 |
| Users / Customers | CAN-004 | Internationale Käufer in EU, USA, UK und spanischsprachigen Kontexten. | EXPLICIT | SRC-002 |

## Value Promise

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Value Promise | CAN-005 | Die Delta-Umstellung führt den bestehenden MVP-Shop zu einer klaren, visuellen, shop-orientierten Architektur (Bestseller, Kategorien, Campaigns, Collections, PDPs, Trust, mobile-first), die zu weniger Überladung und klarerer Auffindbarkeit führt: visuell geführt, mobil nutzbar, produktlogisch korrekt, ohne irreführende Personalisierung oder unfertige Trust-Elemente. | EXPLICIT | SRC-002 |

## Current Alternatives

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Current Alternatives | CAN-006 | Ist-Stand beibehalten: technisch funktionsfähig, aber mit unstrukturierter Home-Gewichtung, Mobile-Friktionen und inkonsistenter Produktlogik. | EXPLICIT | SRC-001, SRC-002 |
| Current Alternatives | CAN-007 | Vollständiger Neubau: nicht erforderlich, weil aktuelle technische Basis bereits Routing, Store, Cart, Collections und Pricing enthält. | ASSUMPTION | SRC-001 |

## Key Capabilities

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Key Capability | CAN-008 | Shop-orientierte Hauptnavigation mit Mega-Menüs aus Textspalten und Poster-/Promo-Kacheln. | EXPLICIT | SRC-002 |
| Key Capability | CAN-009 | Neue Home-Zielsequenz (Fernziel): unveränderter Hero, Bestseller-Slider, Kategorie-Banner, Editorial/Atelier, Neuheiten-Slider, zweite Bannerreihe, reduzierter SEO/Trust, Newsletter/Footer. PHASING (Council 2026-06-27, REQ-002-Split): Dieser Run setzt davon NUR das ABOVE-FOLD-Band um (Hero → Bestseller-Slider → Kategorie-Banner); das untere Band bleibt vorerst auf der aktuellen V2-Reihenfolge. Die vollständige Zielsequenz ist auf einen späteren Run VERSCHOBEN, abhängig von einem Baseline-/Event-Readout, der zeigt, ob Modulreihenfolge Conversion bewegt. | EXPLICIT | SRC-002, SRC-003 |
| Key Capability | CAN-010 | Strikte Produktlogik: BaZi personalisiert; TCM, Wuxing und Fire Horse nicht personalisiert. | EXPLICIT | SRC-002 |
| Key Capability | CAN-011 | Mobile-First UX inklusive Sticky Poster Preview, sauber getrennten Geburtsfeldern, Place-of-Birth Autocomplete, reparierter Suche und nicht abgeschnittenem Cart-Badge. | EXPLICIT | SRC-002 |
| Key Capability | CAN-012 | Regionale Preis-/Versandkommunikation: USD/GBP/EUR, US/UK Free Shipping direkt, Versandkosten backendseitig in Preislogik integrieren. | EXPLICIT | SRC-001, SRC-002 |
| Key Capability | CAN-013 | Farbkorrektur: Ink Black bleibt dominante UI-Farbe; Terracotta ersetzt nur orange/goldene Elemente. | EXPLICIT | SRC-002 |
| Key Capability | CAN-014 | Entfernung von Fake Reviews, Credit-System, Coming Soon, Patron Fold und produktiven Platzhaltern. | EXPLICIT | SRC-002 |

## Non-Goals

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Non-Goal | CAN-015 | Kein technischer Komplettneubau des Shops. | EXPLICIT | SRC-001, SRC-002 |
| Non-Goal | CAN-016 | Keine Änderung am InkWave-Hero-Konzept. | EXPLICIT | SRC-002 |
| Non-Goal | CAN-017 | Keine Einführung von Credits im aktuellen MVP. | EXPLICIT | SRC-002 |
| Non-Goal | CAN-018 | Keine Fake Reviews oder erfundenen Social-Proof-Daten. | EXPLICIT | SRC-002 |
| Non-Goal | CAN-019 | Keine Personalisierung für TCM, Wuxing oder Fire Horse. | EXPLICIT | SRC-002 |
| Non-Goal | CAN-020 | Keine Copy-/Asset-Übernahme geschützter Referenzshop-Inhalte. | EXPLICIT | SRC-003 |
| Non-Goal | CAN-030 | Kein Redesign des InkWave-Hero (Bestätigung von CAN-016 auf Architektur-Ebene). | EXPLICIT | SRC-002 |
| Non-Goal | CAN-031 | Keine Rückkehr von Saju oder Junishi in Navigation, Filter, Collections, SEO, PDPs oder Cross-Sells. | EXPLICIT | SRC-002 |
| Non-Goal | CAN-032 | Keine unverifizierten Produktionsbehauptungen; nichts wird als production-verified markiert, solange der reale Boundary-Beweis fehlt. | EXPLICIT | SRC-001, SRC-002 |

## Constraints

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Constraint | CAN-021 | Bestehender Stack: React 19, Vite, React Router, Tailwind, shadcn/Radix, Context Store, Express, Stripe, Postgres optional. | EXPLICIT | SRC-001 |
| Constraint | CAN-022 | Aktuelle i18n-Basis ist EN/DE/FR; ES muss ergänzt werden. | EXPLICIT | SRC-001, SRC-002 |
| Constraint | CAN-023 | BaZi-Berechnung ist laut Ist-Stand Platzhalter; Architektur-Delta darf keine Produktionswahrheit über echte Berechnung behaupten. | EXPLICIT | SRC-001 |
| Constraint | CAN-024 | Produktbilder sind laut Ist-Stand teilweise Platzhalter; produktive visuelle Kacheln benötigen echte Assets. | EXPLICIT | SRC-001 |

## Risks

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Risk | RISK-001 | Wenn bildgeführte Oberflächen (Mega-Menü-Kacheln, TCM/Wuxing-Produktsichtbarkeit, Product Cards, Campaign-/Sale-Hub) ohne echte Produktbilder gebaut werden, wirkt die UI weiterhin unfertig. MITIGATION/COUNCIL 2026-06-27: Diese Oberflächen werden bewusst ASSET-LIGHT / text-forward gebaut (REQ-004, REQ-006, REQ-023, REQ-024) und erst mit echten Bildern angereichert, wenn OQ-001 aufgelöst ist; Platzhalter DÜRFEN NICHT wie echte Produktbilder wirken (konsistent mit CAN-014). Damit ist „unfertig wirkende Navigation“ ein bewusst eingegangenes, eingegrenztes Übergangsrisiko statt eines unkontrollierten Mangels. | ASSUMPTION | SRC-001, SRC-002 |
| Risk | RISK-002 | Wenn regionale Versandkosten nur im Frontend kaschiert werden, entsteht Preisinkonsistenz; Backend-Pricing muss autoritativ bleiben. | EXPLICIT | SRC-001, SRC-002 |
| Risk | RISK-003 | Wenn Mobile Sticky Preview zu groß umgesetzt wird, blockiert sie den Konfigurator. | ASSUMPTION | SRC-002 |
| Risk | RISK-004 | Wenn Fake Reviews nicht vollständig entfernt werden, entsteht Vertrauens- und Compliance-Risiko. | EXPLICIT | SRC-002 |

## Success Signal

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Success Signal | CAN-025 | AgileTeam kann anhand dieser Delta-Artefakte exakt erkennen, welche Ist-Komponenten bestehen bleiben, welche UI-/Architekturänderungen erforderlich sind und welche produktlogischen Regeln für BaZi, TCM, Wuxing und Fire Horse gelten. Außerdem ist erkennbar (Council 2026-06-27), dass dieser Run die 24 signal-gestützten Deltas unter der aktuellen V2-Home-Reihenfolge liefert und die Home-Re-Ordnung auf das Above-Fold-Band begrenzt ist (volle Resequenz deferred). | EXPLICIT | SRC-002 |
| Success Signal | CAN-026 | QA bestätigt auf Mobile 360/390/430 px: keine abgeschnittenen Header-/Hero-/Cart-/Search-Elemente und nutzbare Sticky Poster Preview. | EXPLICIT | SRC-002 |
| Success Signal | CAN-027 | Cart/PDP zeigen keine Birth-Data-Hinweise bei TCM/Wuxing/Fire Horse. | EXPLICIT | SRC-002 |
| Success Signal | CAN-028 | EN/DE/FR/ES mit Flaggen und regionale Währungen/Versandtexte sind korrekt sichtbar. | EXPLICIT | SRC-002 |

## Evidence

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Evidence | EV-001 | Screenshot-/E2E-Beweis für neue Home-Modulfolge und Mega-Menü-Kacheln. | MISSING | SOURCE_NEEDED |
| Evidence | EV-002 | Mobile Testnachweis für 360/390/430 px. | MISSING | SOURCE_NEEDED |
| Evidence | EV-003 | Cart/PDP-Testnachweis personalisiert vs nicht personalisiert. | MISSING | SOURCE_NEEDED |
| Evidence | EV-004 | Server-Pricing-Testnachweis für US/UK Free Shipping und Währung. | MISSING | SOURCE_NEEDED |
| Evidence | EV-005 | i18n-Snapshot EN/DE/FR/ES mit Flaggen. | MISSING | SOURCE_NEEDED |

## Allowed change scope

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Allowed change scope | CAN-029 | Architektur-/UI-/Navigations-/Collection-/PDP-/Cart-/i18n-/Region-/Mobile-Delta vom aktuellen zum Ziel-Zustand: Änderung von Utility-/Promo-Bar, Header, Navigation, Mega-Menüs, Home-Sektionen, Collection UX, Product Cards, PDP-Template und PDP-Produktlogik, Personalize-Mobile-UX, CartDrawer-Hinweisen, Angebots-/Sale-Hub, Region/Pricing-Kommunikation, i18n, Farb-Tokens und sichtbaren Trust-/Placeholder-Elementen. SCOPE-PRÄZISIERUNG (Council 2026-06-27, REQ-002-Split): Die bewusste Re-Ordnung der Home betrifft in diesem Run NUR das ABOVE-FOLD-Band (Hero → Bestseller-Slider → Kategorie-Banner). Das untere Editorial-/SEO-/Newsletter-Band bleibt in diesem Run auf der aktuellen (deployten V2) Reihenfolge; die VOLLSTÄNDIGE 13-Modul-Resequenz ist auf einen späteren Run VERSCHOBEN (pending Baseline-/Event-Readout). | EXPLICIT | SRC-001, SRC-002 |

## Unresolved Questions

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| OQ-001 | Welche finalen Produktbilder werden für Mega-Menü-Kacheln, Fire Horse und TCM/Wuxing genutzt? | MISSING | SOURCE_NEEDED |
| OQ-002 | Welche finalen US/UK/EU-Preise inklusive Versandkalkulation gelten? | MISSING | SOURCE_NEEDED |
| OQ-003 | Welche Autocomplete-Quelle wird für Place-of-Birth verwendet? DEFAULT = lokale/gebündelte Cities-JSON ODER policy-konformer Places-Anbieter. NICHT DEFAULT = clientseitiges Public-OpenStreetMap-Nominatim per Keystroke (Policy-Verstoß). | MISSING | SOURCE_NEEDED |
| OQ-004 | Wann liegen echte Reviews vor, um das Review-Modul wieder zu aktivieren? | MISSING | SOURCE_NEEDED |

### OQ-Klassifikation (Code- / Operator- / Content- / Launch-Blocking)

| OQ ID | Topic | Type | Code-Blocking | Launch-Blocking | Default / Handling |
|---|---|---|---|---|---|
| OQ-001 | Echte Produktbilder | Content/Operator Dependency | no | yes (finale visuelle Abnahme) | Struktur/Layout mit Platzhaltern erlaubt, aber Platzhalter dürfen vor Launch NICHT wie echte Produktbilder wirken. |
| OQ-002 | Finale Region-Preise | Operator/Pricing Dependency | no (wenn Mechanismus gebaut+getestet) | yes (echte Live-Preise) | Backend-Mechanismus für Region/Währung/Free-Shipping bauen+testen; finale Zahlen kommen vom Operator. |
| OQ-003 | Place-of-Birth-Autocomplete-Quelle | Technical Decision | yes (finale Autocomplete-Implementierung) | — | DEFAULT = lokale/gebündelte Cities-JSON ODER policy-konformer Places-Anbieter. NICHT DEFAULT = clientseitiges Public-OpenStreetMap-Nominatim per Keystroke (Policy-Verstoß). Falls Nominatim, dann nur policy-konform/sparsam/serverseitig/selbst-gehostet. |
| OQ-004 | Echte Review-Quelle | Content/Trust Dependency | no | no (solange Review-Modul deaktiviert bleibt) | Fake Reviews entfernen; Review-Modul erst mit echten verifizierten Bewertungen aktivieren. |

## Council-adopted amendments (Phase 0.16, 2026-06-27)

Beide Punkte wurden am 2026-06-27 vom Nutzer per Council-Adoption übernommen. Folge der Council-Regel: ein amendierter Canvas kehrt nach `draft` zurück und darf nur durch den Nutzer neu bestätigt werden — diese Re-Bestätigung ist am 2026-06-27 NACH Anwendung der Council-Amendments erfolgt (der Nutzer hat die exakte Bestätigungsphrase ein zweites Mal eingegeben; siehe Abschnitt "User Confirmation"). Der Canvas steht damit konsistent auf `user-confirmed` (amendierte Fassung, RE-CONFIRMED 2026-06-27). Die Vision bleibt `user-confirmed` (High-Level-Vision unverändert); die PRD bleibt `ready-for-user-confirmation` (vom Nutzer ausdrücklich NICHT bestätigt).

### Amendment 1 — REQ-002 auf INKREMENTELL re-skopiert (der „Split“)

- Dieser Run liefert die 24 signal-gestützten Deltas unter der AKTUELLEN (deployten V2) Home-Reihenfolge.
- REQ-002 ist re-skopiert: Re-Ordnung NUR des ABOVE-FOLD-Bands — Hero (unverändert) → Bestseller-Slider → Kategorie-Banner. Das untere Editorial-/SEO-/Newsletter-Band bleibt in diesem Run auf der aktuellen Reihenfolge.
- Die VOLLSTÄNDIGE 13-Modul-Resequenz ist auf einen späteren Run VERSCHOBEN (deferred), pending Baseline-/Event-Readout, der zeigt, ob Modulreihenfolge tatsächlich Conversion bewegt.
- REQ-002 (inkrementell) bleibt `value-risk` und gate-`held` bis zum User-Gate und darf erst mergen, wenn BEIDE Bedingungen erfüllt sind:
  - (a) die bestehenden Playwright-Specs (home-module-order, mega-menu, mobile 360/390/430 + LCP) laufen GREEN auf einem echten Browser, UND
  - (b) ein Basis-Event-Readout ist instrumentiert (Hero-CTA, Bestseller-Slider-Klicks, Kategorie-Banner-Klicks, PDP-Views, Add-to-Cart).
- REQ-002 wird NICHT gelöscht und NICHT umnummeriert. Reflektiert in CAN-009 (Phasing), CAN-025 (Success Signal) und CAN-029 (Allowed change scope).

### Amendment 2 — bildgeführte Oberflächen ASSET-LIGHT

- REQ-004 (Mega-Menü-Kacheln), REQ-006 (TCM/Wuxing-Produktsichtbarkeit), REQ-023 (Product Cards) und REQ-024 (Campaign-/Sale-Hub) MÜSSEN JETZT asset-light / text-forward gebaut werden und werden erst mit echten Bildern angereichert, wenn OQ-001 (echte Produktbilder) aufgelöst ist.
- Platzhalter DÜRFEN NICHT wie echte Produktbilder wirken (Konsistenz mit CAN-014 / RISK-001). RISK-001 wurde entsprechend verschärft.

### Status-Folge dieser Amendments

- Council-Adoption am 2026-06-27 setzte den amendierten Canvas zunächst zurück auf `draft` (Re-Bestätigung ausstehend). Diese Re-Bestätigung ist am 2026-06-27 durch den Nutzer erfolgt (zweite Eingabe der exakten Bestätigungsphrase, NACH den Amendments — Transkript-belegt); der Canvas steht damit auf `user-confirmed` (amendierte Fassung).
- Die Bestätigung stammt ausschließlich vom Nutzer, nicht vom Assistenten. Spec-Sanity + REQ-002-incremental-acceptance + USER-GATE bleiben separat ausstehend, bevor Entwicklung startet.

## User Confirmation

> RE-CONFIRMED 2026-06-27 (amendierte Fassung): Der Canvas wurde durch die Council-Amendments (Phase 0.16, 2026-06-27) amendiert und kehrte dadurch zunächst auf `draft` zurück. Der Nutzer hat die amendierte Fassung anschließend RE-bestätigt — er tippte die exakte Bestätigungsphrase ein ZWEITES Mal NACH Anwendung der Amendments (Amendments angewandt und als „nothing confirmed" gemeldet; danach folgte diese erneute Nutzer-Bestätigung; danach „REQ-002 inkrementell akzeptiert, GO, phase 1 go"). Diese zweite Bestätigung ist die maßgebliche Re-Bestätigung des amendierten Canvas; der frühere „reicht NICHT / steht aus"-Vermerk war VOR dieser zweiten Bestätigung geschrieben und ist veraltet. Status konsistent: `user-confirmed`.

RE-CONFIRMED (amendierte Fassung) 2026-06-27 — zweite Eingabe der exakten Phrase durch den Nutzer NACH den Council-Amendments (Transkript-belegt):

```text
Ich bestätige, dass Product Canvas und Product Vision meine Absicht korrekt wiedergeben und als Grundlage für AgileTeam Planning verwendet werden dürfen.
```

Erste Bestätigung derselben Phrase: 2026-06-27 vor den Council-Amendments. Die hier maßgebliche Re-Bestätigung ist die zweite Eingabe nach den Amendments.
