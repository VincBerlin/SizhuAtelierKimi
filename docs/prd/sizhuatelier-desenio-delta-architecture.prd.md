# PRD: SizhuAtelier Desenio Delta Architecture

Status: user-confirmed  (by user, 2026-06-27 — exact phrase: "Ich bestätige die PRD (die 25 Anforderungen) als verbindliche Grundlage für die AgileTeam-Umsetzung")  
Feature Slug: `sizhuatelier-desenio-delta-architecture`  
Owner: SizhuAtelier / AgileTeam  
User Confirmation Required: yes (SATISFIED 2026-06-27)  
Mode: PLUMBLINE_READY_PACKAGE  
Readiness-Level: READY_FOR_AGILETEAM_PLANNING (Canvas + Vision + PRD all user-confirmed)

## Source Summary

| Source ID | Source Kind | Summary | Source Type |
|---|---|---|---|
| SRC-001 | Current Architecture Markdown | Ist-Architektur: Full-Stack React/Express-Shop, current Home-Modulfolge, Navbar/Mega-Menü/Drawer, Collections, PDP, Personalize, CartDrawer, i18n EN/DE/FR, Pricing, RED-Platzhalter. | EXPLICIT |
| SRC-002 | User Conversation Decisions | Delta-Ziel: Hero bleibt; shoporientierte Navigation; Mega-Menüs mit Posterbildern; neue Home-Struktur; nur BaZi personalisiert; TCM/Wuxing/Fire Horse nicht personalisiert; Mobile-First; Region/ES/Farben/Trust-Bereinigung. | EXPLICIT |
| SRC-003 | Reference Architecture Markdown | Strukturreferenz für Shop-Architektur: Utility, Header, Mega-Menü, Bestseller, Kategorie-Teaser, Collection/PDP, Trust, Newsletter/Footer. | EXPLICIT |

## Problem Statement

| Field | Value | Source Type | Source |
|---|---|---|---|
| Problem Statement | Der Ist-Shop besitzt eine tragfähige technische Grundlage, aber die sichtbare Architektur muss als Delta vom aktuellen Stand zu einer klaren shoporientierten Struktur überführt werden: Home-Sequenz, Navigation, Mobile UX, Produktlogik, Cart-Hinweise, Sprache/Region, Farben und Trust müssen konsistent werden. | EXPLICIT | SRC-001, SRC-002 |

## Target Users

| ID | User | Source Type | Source |
|---|---|---|---|
| USER-001 | Käufer von personalisierten BaZi-Postern und nicht personalisierten TCM-/Wuxing-/Fire-Horse-Postern. | EXPLICIT | SRC-002 |
| USER-002 | Mobile Käufer, die ohne UI-Friktion suchen, konfigurieren, vergleichen und kaufen wollen. | EXPLICIT | SRC-002 |
| USER-003 | Internationale Käufer in EN/DE/FR/ES-Kontexten mit regionaler Währung und Versandkommunikation. | EXPLICIT | SRC-002 |
| USER-004 | AgileTeam-Umsetzungsteam, das aus dem Ist-Stand ableiten muss, welche Delta-Änderungen gebaut werden. | EXPLICIT | SRC-001, SRC-002 |

## Goals

| ID | Goal | Source Type | Source |
|---|---|---|---|
| GOAL-001 | Current Architecture als Basis behalten und nur erforderliche Delta-Änderungen umsetzen. | EXPLICIT | SRC-001, SRC-002 |
| GOAL-002 | Hero unverändert halten und restliche Homepage in klare Shop-Modulfolge überführen. | EXPLICIT | SRC-002 |
| GOAL-003 | Produktlogik korrigieren: nur BaZi personalisiert, alle anderen Poster nicht personalisiert. | EXPLICIT | SRC-002 |
| GOAL-004 | Mobile UX abnahmefähig machen. | EXPLICIT | SRC-002 |
| GOAL-005 | Internationale Sprache, Währung und Versandkommunikation sauber abbilden. | EXPLICIT | SRC-002 |

## Non-Goals

| ID | Non-Goal | Source Type | Source |
|---|---|---|---|
| NG-001 | Kein Neubau des technischen Stacks. | EXPLICIT | SRC-001, SRC-002 |
| NG-002 | Keine Änderung des InkWave-Hero-Konzepts. | EXPLICIT | SRC-002 |
| NG-003 | Keine Einführung des Credit-Systems. | EXPLICIT | SRC-002 |
| NG-004 | Keine Fake Reviews oder erfundene Bewertungssummen. | EXPLICIT | SRC-002 |
| NG-005 | Keine Personalisierung von TCM/Wuxing/Fire Horse. | EXPLICIT | SRC-002 |

## Assumptions

| ID | Assumption | Source Type | Source |
|---|---|---|---|
| ASM-001 | Bestehende Komponenten können umgebaut statt ersetzt werden. | ASSUMPTION | SRC-001 |
| ASM-002 | Finales Asset-Material wird separat bereitgestellt. | ASSUMPTION | SRC-001, SRC-002 |
| ASM-003 | Geo-/Regionserkennung kann auf bestehendem `region.ts` und Backend-Pricing aufbauen. | ASSUMPTION | SRC-001 |

## Open Questions

| ID | Question | Source Type | Source |
|---|---|---|---|
| OQ-001 | Welche finalen Posterbilder werden für Mega-Menü-Kacheln und Campaign-Banner verwendet? | MISSING | SOURCE_NEEDED |
| OQ-002 | Welche finalen Preise gelten für US/UK/EU inklusive integriertem Versand? | MISSING | SOURCE_NEEDED |
| OQ-003 | Welche Place-of-Birth-Autocomplete-Quelle wird technisch genutzt? DEFAULT = lokale/gebündelte Cities-JSON ODER policy-konformer Places-Anbieter. NICHT DEFAULT = clientseitiges Public-OpenStreetMap-Nominatim per Keystroke (Policy-Verstoß). | MISSING | SOURCE_NEEDED |
| OQ-004 | Welche echten Review-Datenquelle wird später angebunden? | MISSING | SOURCE_NEEDED |

### OQ-Klassifikation (Code- / Operator- / Content- / Launch-Blocking-Ebene)

| OQ ID | Topic | Type | Code-Blocking | Launch-Blocking | Default / Handling |
|---|---|---|---|---|---|
| OQ-001 | Echte Produktbilder | Content/Operator Dependency | no | yes (finale visuelle Abnahme) | Struktur/Layout mit Platzhaltern erlaubt, aber Platzhalter dürfen vor Launch NICHT wie echte Produktbilder wirken. |
| OQ-002 | Finale Region-Preise | Operator/Pricing Dependency | no (wenn Mechanismus gebaut+getestet) | yes (echte Live-Preise) | Backend-Mechanismus für Region/Währung/Free-Shipping bauen+testen; finale Zahlen kommen vom Operator. |
| OQ-003 | Place-of-Birth-Autocomplete-Quelle | Technical Decision | yes (finale Autocomplete-Implementierung) | — | DEFAULT = lokale/gebündelte Cities-JSON ODER policy-konformer Places-Anbieter. NICHT DEFAULT = clientseitiges Public-OpenStreetMap-Nominatim per Keystroke (Policy-Verstoß). Falls Nominatim, dann nur policy-konform/sparsam/serverseitig/selbst-gehostet. |
| OQ-004 | Echte Review-Quelle | Content/Trust Dependency | no | no (solange Review-Modul deaktiviert bleibt) | Fake Reviews entfernen; Review-Modul erst mit echten verifizierten Bewertungen aktivieren. |

## Requirements

| Requirement ID | Requirement | Priority | Source Type | Source |
|---|---|---|---|---|
| REQ-001 | Der bestehende InkWave-Hero MUSS unverändert an Position 02 bleiben; nur technische Fixes gegen Mobile-Abschneiden sind erlaubt. | Must | EXPLICIT | SRC-002 |
| REQ-002 | (INCREMENTAL — Council 2026-06-27, above-fold split) Home MUSS in diesem Run NUR die ABOVE-FOLD-Band bewusst neu anordnen (Re-Ordering, kein Hero-Redesign): Hero (unverändert) → Bestseller Product Slider → Kategorie-Banner. Das untere Editorial-/SEO-/Newsletter-Band BLEIBT in diesem Run in der aktuellen (deployten V2) Reihenfolge. Die VOLLSTÄNDIGE 13-Modul-Resequenz ist auf einen späteren Run VERSCHOBEN (deferred), abhängig von einem Baseline-/Event-Readout, der zeigt, ob Modulreihenfolge Conversion bewegt. REQ-002 (incremental) bleibt `value-risk` und gate-`held` bis zum User-Gate und DARF erst mergen, wenn BEIDE Bedingungen erfüllt sind: (a) die bestehenden Playwright-Specs (home-module-order, mega-menu, mobile 360/390/430 + LCP) laufen GREEN auf einem echten Browser, UND (b) ein Basis-Event-Readout ist instrumentiert (Hero-CTA, Bestseller-Slider-Klicks, Kategorie-Banner-Klicks, PDP-Views, Add-to-Cart). | Must | EXPLICIT | SRC-002 |
| REQ-003 | Die Hauptnavigation MUSS shop-orientiert werden; die primären Einträge MÜSSEN exakt sein: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote, Poster Sets, Inspiration. FAQ, About, Contact und Blog DÜRFEN NICHT in der primären Navigation stehen. | Must | EXPLICIT | SRC-002 |
| REQ-004 | Jedes relevante Mega-Menü MUSS Textspalten plus mindestens 2–3 Poster-/Promo-Kacheln enthalten; jede Kachel MUSS Titel, CTA und Ziel-Link haben. ASSET-LIGHT (Council 2026-06-27): In diesem Run werden die Kacheln text-forward / asset-light gebaut; das Bildfeld bleibt ein generischer Platzhalter, der NICHT wie ein echtes Produktbild wirkt (konsistent mit CAN-014 / RISK-001). Echte Bilder werden erst eingesetzt, wenn OQ-001 aufgelöst ist. | Must | EXPLICIT | SRC-002 |
| REQ-005 | Saju- und Junishi-Reste MÜSSEN aus Navigation, Filter, Collections, SEO, PDPs, Personalisierung und Cross-Sells entfernt werden. | Must | EXPLICIT | SRC-002 |
| REQ-006 | TCM und Wuxing MÜSSEN als eigene Produktwelten mit ihren definierten Poster-/Chart-Produkten sichtbar bleiben und klar kategorisiert werden. ASSET-LIGHT (Council 2026-06-27): Die Produktsichtbarkeit wird in diesem Run text-forward / asset-light umgesetzt — jedes Produkt erscheint als echte Produkteinheit mit Titel, Preis und CTA (also nicht nur als reine Textliste), aber das Bildfeld bleibt ein generischer Platzhalter, der NICHT wie ein echtes Produktbild wirkt (konsistent mit CAN-014 / RISK-001). Echte Bilder folgen erst nach Auflösung von OQ-001. | Must | EXPLICIT | SRC-002 |
| REQ-007 | Personalisierung MUSS ausschließlich für BaZi-Produkte verfügbar sein; TCM, Wuxing und Fire Horse dürfen keine Personalisierung anzeigen. | Must | EXPLICIT | SRC-002 |
| REQ-008 | Das PDP-Template MUSS enthalten: Breadcrumb, Produktbilder/Galerie, Produktname, Preis, Varianten, Add-to-Cart, Rahmen-/Zubehör-Optionen, Trust-Bullets, Produktbeschreibung, Cross-Sells, Inspiration-Kontext und einen Review-Bereich nur bei echten Reviews. PDPs MÜSSEN zwischen personalisierten BaZi-PDPs und nicht personalisierten TCM/Wuxing/Fire-Horse-PDPs unterscheiden; für TCM/Wuxing/Fire Horse gilt: KEINE Geburtsdaten, KEINE Chart-Vorschau, KEINE Birth-Data-Hinweise, KEIN Personalisieren-CTA. | Must | EXPLICIT | SRC-002 |
| REQ-009 | Das Collection-Template MUSS enthalten: Breadcrumb, Zurück-Navigation, H1, Intro, Kategorievisual, Toolbar, Filter, Sortierung, Produktgrid, Produktanzahl, Pagination/Mehr-zeigen, SEO-Text, Trust-Bereich und Footer. | Must | EXPLICIT | SRC-002 |
| REQ-010 | Coming Soon, Patron Fold, Credit-System, Fake Reviews und produktiv sichtbare Platzhalter MÜSSEN aus der sichtbaren Shop-UI entfernt werden. | Must | EXPLICIT | SRC-002 |
| REQ-011 | Mobile Header, Hero-CTAs, Suche, Warenkorb-Icon und Cart-Badge MÜSSEN bei 360/390/430 px vollständig sichtbar und bedienbar sein. | Must | EXPLICIT | SRC-002 |
| REQ-012 | Der mobile BaZi-Konfigurator MUSS eine sichtbare Sticky Poster Preview bieten, ohne den Eingabeprozess zu blockieren. | Must | EXPLICIT | SRC-002 |
| REQ-013 | Date of Birth und Time of Birth MÜSSEN mobil getrennt angezeigt werden; Place of Birth MUSS Autocomplete-Vorschläge wie 'Stuttgart, Germany' liefern. | Must | EXPLICIT | SRC-002 |
| REQ-014 | CartDrawer MUSS Birth-Data-Review-Hinweise nur bei personalisierten BaZi-Produkten anzeigen. | Must | EXPLICIT | SRC-002 |
| REQ-015 | Sprachsystem MUSS von EN/DE/FR auf EN/DE/FR/ES erweitert werden; Kürzel bleiben unverändert und Flaggen stehen rechts daneben. | Must | EXPLICIT | SRC-002 |
| REQ-016 | Region/Pricing MUSS USA mit USD und Free Shipping, UK mit GBP und Free Shipping sowie EU mit EUR und lokaler Versandlogik darstellen; US/UK-Versandkosten müssen backendseitig in Preise eingerechnet werden. | Must | EXPLICIT | SRC-002 |
| REQ-017 | Farbregeln MÜSSEN korrigiert werden: Ink Black bleibt dominante UI-Farbe; Terracotta ersetzt ausschließlich orange/goldene UI-Elemente und wird nicht zum globalen Hauptakzent. | Must | EXPLICIT | SRC-002 |
| REQ-018 | BaZi-Konfigurator MUSS die definierten Poster-Hintergrundfarben anbieten: Ink #171C20, Graphite #2B3034, Soft Line #70716C, Soft White #F8F4EE, Parchment #EFE5D8. | Should | EXPLICIT | SRC-002 |
| REQ-019 | Newsletter und SEO-/Zusammenfassungssektion MÜSSEN gekürzt und kaufpfadfreundlich strukturiert werden; störende Bloglinks unmittelbar unter Angebotszusammenfassungen werden entfernt. | Should | EXPLICIT | SRC-002 |
| REQ-020 | Tests/QA MÜSSEN die Delta-Änderungen über Home-Reihenfolge, Mega-Menü, Mobile, PDP/Cart-Produktlogik, i18n und Region/Pricing nachweisen. | Must | EXPLICIT | SRC-002 |
| REQ-021 | Eine Utility-/Promo-Bar MUSS oberhalb des Headers sitzen und regionale Versand-/Service-Kommunikation zeigen: USA und UK zeigen Free Shipping direkt; EU zeigt lokale Versandlogik. | Must | EXPLICIT | SRC-002, SRC-003 |
| REQ-022 | Der Header MUSS enthalten: Logo, Hauptnavigation, Suche, Account (optional), Favoriten (optional), Warenkorb, Sprache/Land. Mobil MUSS der Header Hamburger, Logo, Suche, Warenkorb und Sprachzugang vollständig sichtbar zeigen (nichts abgeschnitten). | Must | EXPLICIT | SRC-002, SRC-003 |
| REQ-023 | Product Cards MÜSSEN enthalten: Bildfeld, optionales Badge, Titel, Kurzclaim, Preis und einen eindeutigen CTA. ASSET-LIGHT (Council 2026-06-27): In diesem Run wird die Card text-forward / asset-light gebaut; das Bildfeld bleibt ein generischer Platzhalter, der NICHT wie ein echtes Produktbild wirkt (konsistent mit CAN-014 / RISK-001). Echte Bilder werden erst eingesetzt, wenn OQ-001 aufgelöst ist. | Must | EXPLICIT | SRC-002, SRC-003 |
| REQ-024 | Der Shop MUSS einen Angebots-/Sale-/Campaign-Hub haben, der mehrere kuratierte Sektionen (Kurztext + Product Slider + CTA) aufnehmen kann, OHNE jede Promotion als eigene überladene Landingpage zu bauen. ASSET-LIGHT (Council 2026-06-27): In diesem Run wird der Hub text-forward / asset-light gebaut; Bildflächen bleiben generische Platzhalter, die NICHT wie echte Produktbilder oder echte Kampagnen-Visuals wirken (konsistent mit CAN-014 / RISK-001). Echte Bilder werden erst eingesetzt, wenn OQ-001 aufgelöst ist. | Must | EXPLICIT | SRC-002, SRC-003 |
| REQ-025 | Für TCM-, Wuxing- und Fire-Horse-PDPs MUSS gelten: KEINE Geburtsdaten, KEINE Chart-Vorschau, KEINE Birth-Data-Hinweise, KEIN Personalisieren-CTA. | Must | EXPLICIT | SRC-002 |

> **Council-Note (2026-06-27, REQ-002 split):** Dieser Run liefert die 24 signal-gestützten Deltas unter der AKTUELLEN (deployten V2) Home-Reihenfolge. REQ-002 ist auf das ABOVE-FOLD-Band re-skopiert (Hero → Bestseller-Slider → Kategorie-Banner); das untere Editorial-/SEO-/Newsletter-Band bleibt in diesem Run auf der aktuellen Reihenfolge. Die VOLLSTÄNDIGE 13-Modul-Resequenz ist auf einen späteren Run VERSCHOBEN (deferred), pending Baseline-/Event-Readout. REQ-002 wird NICHT gelöscht und NICHT umnummeriert.
>
> **Council-Note (2026-06-27, asset-light):** Die bildgeführten Oberflächen REQ-004 (Mega-Menü-Kacheln), REQ-006 (TCM/Wuxing-Produktsichtbarkeit), REQ-023 (Product Cards) und REQ-024 (Campaign-/Sale-Hub) MÜSSEN in diesem Run asset-light / text-forward gebaut werden und werden erst mit echten Bildern angereichert, wenn OQ-001 (echte Produktbilder) aufgelöst ist. Platzhalter DÜRFEN NICHT wie echte Produktbilder wirken (konsistent mit CAN-014 / RISK-001).

## Acceptance Criteria

| AC ID | Requirement ID | Given | When | Then | Source Type |
|---|---|---|---|---|---|
| AC-001 | REQ-001 | die Startseite geladen wird | der Hero angezeigt wird | InkWave-Hero bleibt als erstes großes Modul sichtbar und wurde nicht durch ein neues Hero-Konzept ersetzt. | EXPLICIT |
| AC-002 | REQ-002 | die deployte V2-Startseite geprüft wird | der Nutzer das Above-Fold-Band unterhalb des Hero scrollt | NUR das Above-Fold-Band ist bewusst neu angeordnet in exakt: Hero (unverändert) → Bestseller Product Slider → Kategorie-Banner; das untere Editorial-/SEO-/Newsletter-Band bleibt in der aktuellen (deployten V2) Reihenfolge unverändert; die volle 13-Modul-Resequenz wird in diesem Run NICHT umgesetzt (deferred). MERGE-GATE: dieser REQ darf erst mergen, wenn (a) die bestehenden Playwright-Specs (home-module-order, mega-menu, mobile 360/390/430 + LCP) GREEN auf einem echten Browser laufen UND (b) ein Basis-Event-Readout (Hero-CTA, Bestseller-Slider-Klicks, Kategorie-Banner-Klicks, PDP-Views, Add-to-Cart) instrumentiert ist; bis dahin bleibt REQ-002 value-risk und gate-held. | EXPLICIT |
| AC-003 | REQ-003 | der Header sichtbar ist | die Hauptnavigation gelesen wird | die primären Einträge sind exakt Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote, Poster Sets, Inspiration; FAQ/About/Contact/Blog erscheinen nicht in der primären Navigation. | EXPLICIT |
| AC-004 | REQ-004 | ein relevantes Mega-Menü geöffnet wird | Desktop-Nutzer Poster/TCM/Wuxing auswählt | Textspalten und mindestens 2–3 Poster-/Promo-Kacheln erscheinen, und jede Kachel hat Titel, CTA und Ziel-Link; in diesem Run ist das Bildfeld asset-light (generischer Platzhalter, der nicht wie ein echtes Produktbild wirkt), und echte Bilder folgen erst nach Auflösung von OQ-001. | EXPLICIT |
| AC-005 | REQ-005 | Shop-UI, Daten und Suchindex geprüft werden | nach Saju oder Junishi gesucht wird | keine sichtbaren Saju-/Junishi-Kaufpfade oder Personalisierungsoptionen erscheinen. | EXPLICIT |
| AC-006 | REQ-006 | Shop- und Collection-Bereiche sichtbar sind | TCM oder Wuxing geöffnet wird | definierte TCM-/Wuxing-Produkte erscheinen als echte Produkteinheiten mit Titel, Preis und CTA (nicht nur als reine Textliste); in diesem Run ist das Bildfeld asset-light (generischer Platzhalter, der nicht wie ein echtes Produktbild wirkt), und echte Bilder folgen erst nach Auflösung von OQ-001. | EXPLICIT |
| AC-007 | REQ-007 | ein nicht personalisiertes Produkt geöffnet wird | TCM, Wuxing oder Fire Horse angezeigt wird | keine Geburtsdatenfelder, kein Personalisieren-CTA und keine Chart-Vorschau erscheinen. | EXPLICIT |
| AC-008 | REQ-008 | eine PDP geöffnet wird | BaZi vs TCM/Wuxing/Fire Horse verglichen wird | das PDP zeigt Breadcrumb, Galerie, Name, Preis, Varianten, Add-to-Cart, Rahmen-/Zubehör-Optionen, Trust-Bullets, Beschreibung, Cross-Sells und Inspiration-Kontext; Review-Bereich nur bei echten Reviews; BaZi zeigt Personalisierung, während TCM/Wuxing/Fire Horse keine Geburtsdaten, keine Chart-Vorschau, keine Birth-Data-Hinweise und keinen Personalisieren-CTA zeigen. | EXPLICIT |
| AC-009 | REQ-009 | eine Collection-Seite geöffnet wird | der Nutzer navigiert | Breadcrumb, Zurück-Navigation, H1, Intro, Kategorievisual, Toolbar, Filter, Sortierung, Produktgrid, Produktanzahl, Pagination/Mehr-zeigen, SEO-Text, Trust-Bereich und Footer sind sichtbar. | EXPLICIT |
| AC-010 | REQ-010 | Shop-UI geprüft wird | nach Reviews/Credits/Coming Soon/Patron Fold gesucht wird | keine gefälschten Reviews, Credit-UI oder Platzhalterbereiche sind sichtbar. | EXPLICIT |
| AC-011 | REQ-011 | Mobile Viewport 360/390/430 px aktiv ist | Header, Hero, Suche und Cart geprüft werden | keine CTA, Suche, Cart-Icon oder Badge sind abgeschnitten. | EXPLICIT |
| AC-012 | REQ-012 | der mobile BaZi-Konfigurator geöffnet ist | der Nutzer Geburtsdaten, Rahmen oder Hintergrundfarbe ändert | die Poster-Vorschau bleibt sichtbar oder direkt erreichbar und aktualisiert sich nachvollziehbar. | EXPLICIT |
| AC-013 | REQ-013 | der mobile Personalisierungsflow geöffnet ist | der Nutzer Datum, Uhrzeit und Stuttgart im Ortfeld eingibt | Felder überlappen nicht und Stuttgart, Germany wird als Vorschlag angeboten; die Autocomplete-Quelle ist standardmäßig lokale/gebündelte Cities-JSON oder ein policy-konformer Places-Anbieter, NICHT clientseitiges Public-OpenStreetMap-Nominatim per Keystroke. | EXPLICIT |
| AC-014 | REQ-014 | ein Produkt im Warenkorb liegt | BaZi und TCM/Wuxing/Fire Horse verglichen werden | Birth-Data-Review erscheint nur bei personalisierten BaZi-Positionen. | EXPLICIT |
| AC-015 | REQ-015 | die Sprachwahl geöffnet ist | EN/DE/FR/ES angezeigt werden | Kürzel bleiben unverändert und rechts daneben stehen passende Flaggen. | EXPLICIT |
| AC-016 | REQ-016 | Region USA, UK oder EU simuliert wird | Produktpreise, Promo-Bar und Checkout geprüft werden | Währung und Versandkommunikation entsprechen Region; USA/UK zeigen Free Shipping ohne Euro-Schwelle. | EXPLICIT |
| AC-017 | REQ-017 | UI-Farben geprüft werden | orange/goldene Elemente vorhanden wären | diese Elemente sind Terracotta; Ink Black bleibt dominante UI-/CTA-Farbe. | EXPLICIT |
| AC-018 | REQ-018 | BaZi-Konfigurator geöffnet ist | Hintergrundfarben gewählt werden | nur die definierte Palette wird angeboten und ändert die Vorschau. | EXPLICIT |
| AC-019 | REQ-019 | SEO-/Newsletter-Bereich geprüft wird | der Nutzer bis unten scrollt | Text ist reduziert, shop-orientiert und störende Bloglinks wurden entfernt oder in Inspiration/Footer verschoben. | EXPLICIT |
| AC-020 | REQ-020 | CI/QA ausgeführt wird | Tests abgeschlossen sind | Delta-spezifische Testnachweise liegen vor und markieren keine unfertigen Claims als production-verified. | EXPLICIT |
| AC-021 | REQ-021 | die Seite in Region USA, UK oder EU geladen wird | die Utility-/Promo-Bar geprüft wird | die Bar sitzt oberhalb des Headers; USA und UK zeigen Free Shipping direkt, EU zeigt lokale Versandlogik. | EXPLICIT |
| AC-022 | REQ-022 | der Header auf Desktop und auf Mobile (360/390/430 px) geprüft wird | der Nutzer den Header betrachtet | Desktop zeigt Logo, Hauptnavigation, Suche, Account (optional), Favoriten (optional), Warenkorb, Sprache/Land; Mobile zeigt Hamburger, Logo, Suche, Warenkorb und Sprachzugang vollständig sichtbar ohne Abschneiden. | EXPLICIT |
| AC-023 | REQ-023 | ein Produktgrid oder Slider gerendert wird | eine Product Card geprüft wird | die Card enthält ein Bildfeld, optionales Badge, Titel, Kurzclaim, Preis und einen eindeutigen CTA; in diesem Run ist das Bildfeld asset-light (generischer Platzhalter, der nicht wie ein echtes Produktbild wirkt), und echte Bilder folgen erst nach Auflösung von OQ-001. | EXPLICIT |
| AC-024 | REQ-024 | der Angebots-/Sale-Hub geöffnet wird | mehrere Promotionen vorhanden sind | der Hub hält mehrere kuratierte Sektionen (Kurztext + Product Slider + CTA), ohne dass jede Promotion eine eigene überladene Landingpage ist; in diesem Run sind die Bildflächen asset-light (generische Platzhalter, die nicht wie echte Produktbilder oder Kampagnen-Visuals wirken), und echte Bilder folgen erst nach Auflösung von OQ-001. | EXPLICIT |
| AC-025 | REQ-025 | eine TCM-, Wuxing- oder Fire-Horse-PDP geöffnet wird | das PDP gerendert wird | keine Geburtsdaten, keine Chart-Vorschau, keine Birth-Data-Hinweise und kein Personalisieren-CTA erscheinen. | EXPLICIT |

## Non-Functional Requirements

| NFR ID | Requirement | Source Type | Source |
|---|---|---|---|
| NFR-001 | Mobile Layouts müssen auf 360, 390 und 430 px ohne horizontales Scrollen und ohne abgeschnittene UI geprüft werden. | EXPLICIT | SRC-002 |
| NFR-002 | InkWave bleibt lazy/performance-geschützt, wie im Ist-Stand beschrieben. | EXPLICIT | SRC-001 |
| NFR-003 | Reduced Motion und Touch-Bedienbarkeit müssen für Drawer, Mega-Menü, Personalisierung und Cart geprüft werden. | EXPLICIT | SRC-002, SRC-003 |
| NFR-004 | Server-autoritative Preislogik darf nicht durch rein clientseitige Region-/Shipping-Anzeige ersetzt werden. | EXPLICIT | SRC-001, SRC-002 |

## Risks

| Risk ID | Risk | Mitigation | Source Type | Source |
|---|---|---|---|---|
| RISK-001 | Visuelle Kacheln wirken unfertig, wenn Platzhalterbilder weiter genutzt werden. | Finales Asset-Set als Blocker für visuelle Endabnahme definieren. | ASSUMPTION | SRC-001, SRC-002 |
| RISK-002 | Mobile Sticky Preview kann Eingabefläche blockieren. | Viewport-Tests und Max-Höhen-Regeln definieren. | ASSUMPTION | SRC-002 |
| RISK-003 | Regionale Free-Shipping-Logik wird nur oberflächlich angezeigt. | Backend-Pricing-Tests verpflichtend. | EXPLICIT | SRC-001, SRC-002 |
| RISK-004 | BaZi-Placeholder könnte fälschlich als echte Berechnung wirken. | RED-Status sichtbar halten, keine production-verified Claims. | EXPLICIT | SRC-001 |

## Evidence Needed

| Evidence ID | Requirement ID | Evidence Needed | Source Type |
|---|---|---|---|
| EV-001 | REQ-001 / REQ-002 / REQ-003 / REQ-004 / REQ-005 / REQ-006 / REQ-009 / REQ-010 / REQ-017 / REQ-019 / REQ-020 | Evidence for associated requirement(s): screenshots, tests, snapshots or QA reports. | MISSING |
| EV-002 | REQ-011 / REQ-012 / REQ-013 / REQ-018 / REQ-020 | Evidence for associated requirement(s): screenshots, tests, snapshots or QA reports. | MISSING |
| EV-003 | REQ-007 / REQ-008 / REQ-014 / REQ-020 | Evidence for associated requirement(s): screenshots, tests, snapshots or QA reports. | MISSING |
| EV-004 | REQ-016 / REQ-020 | Evidence for associated requirement(s): screenshots, tests, snapshots or QA reports. | MISSING |
| EV-005 | REQ-015 / REQ-020 | Evidence for associated requirement(s): screenshots, tests, snapshots or QA reports. | MISSING |

## Implementation Areas

| Area | Files / Components | Source Type | Source |
|---|---|---|---|
| Navigation | `src/components/Navbar.tsx`, mobile Drawer, HeaderSearch | EXPLICIT | SRC-001, SRC-002 |
| Homepage | `src/pages/Home.tsx`, shop sections 03..13 | EXPLICIT | SRC-001, SRC-002 |
| Product Logic | `src/lib/catalog.ts`, `src/lib/collections.ts`, `src/pages/ProductView.tsx`, `src/pages/Personalize.tsx` | EXPLICIT | SRC-001, SRC-002 |
| Cart/Checkout | `src/components/shop/CartDrawer.tsx`, `server/pricing.js`, `src/lib/region.ts` | EXPLICIT | SRC-001, SRC-002 |
| i18n | `src/i18n/translations.ts`, I18nProvider | EXPLICIT | SRC-001, SRC-002 |
| Styling | `src/lib/tokens.ts`, Tailwind tokens, relevant components | EXPLICIT | SRC-001, SRC-002 |
| QA | Vitest, Playwright specs, smoke tests | EXPLICIT | SRC-001, SRC-002 |

## Links

- Vision: `docs/vision/sizhuatelier-desenio-delta-architecture.vision.md`
- Canvas: `docs/canvas/sizhuatelier-desenio-delta-architecture.canvas.md`
- Traceability: `docs/traceability.md`

## User Confirmation Required

The assistant must not confirm this PRD.

```text
Ich bestätige, dass Product Canvas und Product Vision meine Absicht korrekt wiedergeben und als Grundlage für AgileTeam Planning verwendet werden dürfen.
```
