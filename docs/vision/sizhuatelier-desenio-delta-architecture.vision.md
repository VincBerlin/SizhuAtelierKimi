# Product Vision: SizhuAtelier Desenio Delta Architecture

Status: user-confirmed  (by user, 2026-06-27, exact phrase)  
Feature Slug: `sizhuatelier-desenio-delta-architecture`  
Confirmation Status: confirmed by user 2026-06-27  
Mode: PLUMBLINE_READY_PACKAGE  
Readiness-Level: READY_FOR_AGILETEAM_PLANNING (Canvas/Vision confirmed; Council + Spec-Sanity + REQ-002-acceptance + USER-GATE still pending before development)

## Source Map

| Source ID | Source Kind | Summary | Source Type |
|---|---|---|---|
| SRC-001 | Current Architecture Markdown | Ist-Stand: React/Express Full-Stack-Shop mit Navbar/Mega-Menü, Mobile Drawer, InkWave-Hero, Home-Modulfolge 02..13, Collections, PDP, Personalisierung, CartDrawer, i18n EN/DE/FR, serverseitiger Preislogik und bekannten RED-Platzhaltern. | EXPLICIT |
| SRC-002 | User Conversation Decisions | Zielentscheidungen: Desenio-strukturelle Shop-Architektur, Hero unverändert, Mega-Menüs mit Posterbildern, Mobile-First, nur BaZi personalisiert, Saju/Junishi entfernt, TCM/Wuxing integriert, Fake Reviews/Credits/Platzhalter entfernen, ES/Flaggen, US/UK Free Shipping, Farbkorrektur. | EXPLICIT |
| SRC-003 | Reference Architecture Markdown | Strukturprinzip: Utility-Bar, Header, kaufintentionsbasiertes Mega-Menü, Bestseller-Slider, Kategorie-Teaser, Collection-Templates, PDP-Logik, Trust, Newsletter/Footer. | EXPLICIT |

## Product Vision Statement

| Area | ID | Value | Source Type | Source | User Decision Needed |
|---|---|---|---|---|---|
| Product Vision Statement | VIS-001 | SizhuAtelier soll vom funktionalen MVP zu einem ruhigen, premium, shop-orientierten Poster-Webshop überführt werden, dessen Architektur Käufer schnell zu Produkten führt, statt sie mit ungleich großen Content-Sektionen zu überladen. Der bestehende InkWave-Hero bleibt unverändert; die Architektur danach — Navigation, Homepage-Modulfolge, Mega-Menüs, Collections, PDPs, Mobile UX, Warenkorb-/Checkout-Logik, Lokalisierung und Farbführung — wird konsequent bereinigt. | EXPLICIT | SRC-001, SRC-002, SRC-003 | no |

## Target Group

| Area | ID | Value | Source Type | Source | User Decision Needed |
|---|---|---|---|---|---|
| Target Group | VIS-002 | Käuferinnen und Käufer von hochwertigen Postern, personalisierten BaZi-Postern und kuratierten TCM-/Wuxing-Fachpostern, die eine klare Produktnavigation, mobile Bedienbarkeit, visuelle Orientierung und vertrauenswürdige Shop-Kommunikation erwarten. | EXPLICIT | SRC-002 | no |
| Target Group | VIS-003 | Mobile Käufer, die Produkte ansehen, personalisieren und in den Warenkorb legen wollen, ohne abgeschnittene UI, unklare Navigation oder ständiges Hoch-/Runterscrollen zwischen Eingabe und Poster-Vorschau. | EXPLICIT | SRC-002 | no |
| Target Group | VIS-004 | Internationale Käufer in EU, USA und UK, die lokale Sprache, Währung und Versandkommunikation erwarten. | EXPLICIT | SRC-002 | no |

## User Needs

| ID | Need | Source Type | Source |
|---|---|---|---|
| VIS-005 | Der Nutzer muss sofort verstehen, welche Produktwelten existieren: BaZi, TCM und Wuxing. | EXPLICIT | SRC-002 |
| VIS-006 | Der Nutzer muss klar erkennen, welche Produkte personalisierbar sind und welche nicht. | EXPLICIT | SRC-002 |
| VIS-007 | Der mobile Nutzer muss Navigation, Suche, Warenkorb, Hero-CTAs und Personalisierung ohne abgeschnittene Elemente bedienen können. | EXPLICIT | SRC-002 |
| VIS-008 | Der Nutzer braucht eine shopartige, nicht überladene Homepage mit klarer visueller Hierarchie statt vieler ungleich großer Erklärblöcke. | EXPLICIT | SRC-002, SRC-003 |
| VIS-009 | Internationale Nutzer brauchen Sprache, Flaggen, Währung und Versandkommunikation passend zu ihrer Region. | EXPLICIT | SRC-002 |

## Product Value

| Area | ID | Value | Source Type | Source | User Decision Needed |
|---|---|---|---|---|---|
| Product Value | VIS-010 | Die Delta-Umstellung reduziert kognitive Last, entfernt irreführende oder unfertige Elemente und richtet den bestehenden Shop auf eine klare Kaufarchitektur aus: entdecken, vergleichen, konfigurieren, kaufen. | EXPLICIT | SRC-002 | no |
| Product Value | VIS-011 | Die bestehende technische Grundlage bleibt nutzbar; die Änderung fokussiert Architektur, UI-Logik, Inhalte, Mobile UX und Produktregeln statt einen technischen Neubau. | EXPLICIT | SRC-001, SRC-002 | no |

## Business or Project Goals

| ID | Goal | Source Type | Source |
|---|---|---|---|
| VIS-012 | Aktuelle Home-Modulfolge in eine klare Zielsequenz überführen: Hero bleibt, danach Bestseller, Kategorie-Banner, Editorial/Atelier, Neuheiten, Campaign-Banner, SEO/Trust, Newsletter/Footer. | EXPLICIT | SRC-002, SRC-003 |
| VIS-013 | Navigation und Mega-Menüs kaufintentionsbasiert umbauen und visuelle Poster-Kacheln integrieren. | EXPLICIT | SRC-002 |
| VIS-014 | Falsche Personalisierung bei TCM, Wuxing und Fire Horse entfernen. | EXPLICIT | SRC-002 |
| VIS-015 | Mobile Bedienung auf 360/390/430 px stabilisieren, inklusive Sticky Poster Preview im BaZi-Konfigurator. | EXPLICIT | SRC-002 |
| VIS-016 | Regionale Preis-/Versandlogik für USA, UK und EU konsistent darstellen und backendseitig absichern. | EXPLICIT | SRC-001, SRC-002 |

## Success Signals

| ID | Success Signal | Source Type | Source |
|---|---|---|---|
| VIS-017 | Auf Mobile sind Hero-CTAs, Warenkorb-Icon, Badge, Suche und Drawer vollständig sichtbar und bedienbar. | EXPLICIT | SRC-002 |
| VIS-018 | Im Warenkorb erscheinen Birth-Data-Hinweise nur bei personalisierten BaZi-Produkten. | EXPLICIT | SRC-002 |
| VIS-019 | Mega-Menüs zeigen Textspalten plus Poster-/Promo-Kacheln. | EXPLICIT | SRC-002 |
| VIS-020 | TCM/Wuxing/Fire Horse zeigen keine Personalisierungsoptionen. | EXPLICIT | SRC-002 |
| VIS-021 | Fake Reviews, Credits, Coming Soon und Patron Fold sind aus der sichtbaren Shop-UI entfernt. | EXPLICIT | SRC-002 |
| VIS-022 | EN/DE/FR/ES sind verfügbar; Kürzel bleiben erhalten und Flaggen stehen rechts daneben. | EXPLICIT | SRC-002 |

## Boundaries

| ID | Boundary | Source Type | Source |
|---|---|---|---|
| VIS-023 | Der InkWave-Hero bleibt unverändert; die Änderung betrifft die Architektur DANACH: Header, Mega-Menüs, Homepage-Sequenz, Collections, PDPs, Mobile UX, Cart-Logik, Region/Preis, Sprache und visuelle Konsistenz. Änderungen am Hero dürfen nur technische Mobile-Abschneidefehler beheben, ohne Hero-Konzept oder Position zu ändern. | EXPLICIT | SRC-002 |
| VIS-024 | Keine Übernahme geschützter Texte, Bilder, Logos oder Markenbestandteile des Referenzshops; nur Strukturprinzipien werden genutzt. | EXPLICIT | SRC-003 |
| VIS-025 | BaZi-Berechnung bleibt als technischer RED-Status außerhalb dieser Architektur-Delta-Definition sichtbar, bis der echte Provider angebunden ist. | EXPLICIT | SRC-001 |
| VIS-026 | Echte Reviews dürfen erst angezeigt werden, wenn verifizierte Bewertungen vorliegen. | EXPLICIT | SRC-002 |
| VIS-027 | Die Place-of-Birth-Autocomplete-Quelle ist standardmäßig eine lokale/gebündelte Cities-JSON oder ein policy-konformer Places-Anbieter und ausdrücklich NICHT clientseitiges Public-OpenStreetMap-Nominatim per Keystroke. | EXPLICIT | SRC-002 |

## Assumptions

| ID | Assumption | Source Type | Source |
|---|---|---|---|
| ASM-001 | Die bestehenden Komponenten `Navbar`, `Home`, `Collection`, `ProductView`, `Personalize`, `CartDrawer`, `Configurator`, `tokens.ts`, `region.ts`, `translations.ts` und `server/pricing.js` sind die primären Änderungsflächen. | ASSUMPTION | SRC-001, SRC-002 |
| ASM-002 | Die aktuell vorhandenen TCM-/Wuxing-Produktwelten bleiben im Katalog erhalten und müssen primär visuell, semantisch und routingseitig sauberer dargestellt werden. | ASSUMPTION | SRC-001, SRC-002 |

## Missing Items

| ID | Missing Item | Source Type | Source | Impact |
|---|---|---|---|---|
| OQ-001 | Finale echte Produktbilder und Poster-Mockups für Mega-Menü-Kacheln, Fire Horse, TCM und Wuxing. | MISSING | SRC-001, SRC-002 | Umsetzung kann mit Platzhalter-Layout vorbereitet werden, aber produktive Abnahme benötigt echte Assets. |
| OQ-002 | Exakte finale Preise pro Region inklusive integriertem US/UK-Versand. | MISSING | SRC-001, SRC-002 | Checkout-/Pricing-Abnahme benötigt finale Business-Preise. |
| OQ-003 | Rechtliche Prüfung für regionale Versand-, Retouren- und personalisierte Produkttexte. | MISSING | SRC-001 | Muss vor Go-Live geprüft werden. |
| OQ-004 | Echte Review-Datenquelle. | MISSING | SRC-002 | Review-Modul bleibt deaktiviert. |

## Confirmation Status

user-confirmed 2026-06-27 (exact phrase by user)

## User Confirmation Block

Für `READY_FOR_AGILETEAM_PLANNING` muss der Nutzer bestätigen:

```text
Ich bestätige, dass Product Canvas und Product Vision meine Absicht korrekt wiedergeben und als Grundlage für AgileTeam Planning verwendet werden dürfen.
```
