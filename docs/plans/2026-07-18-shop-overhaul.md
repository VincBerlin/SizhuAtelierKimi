# Webshop-Überarbeitung — Operator-Batch #12 (verbindlich, 2026-07-18)

Verbindlicher Implementierungsauftrag des Operators (Volltext sinngemäß;
Reihenfolge der Umsetzung nach Abhängigkeit). Abschluss ERST, wenn alle 17
Akzeptanzkriterien erfüllt sind und der Pflicht-Test auf Smartphone-, Tablet-
und Desktop-Breite bestanden ist. Danach (separat, Operator-Ansage):
kompletter Live-Durchtest + Premium-PDF-Generator.

Leitplanken: Mobile First · EINE Formensprache (eckig/minimal gerundet) ·
keine Duplikate · bestehende funktionierende Features dürfen nicht brechen.

## Bereiche und Status

| # | Bereich | Status |
|---|---------|--------|
| 1 | Mobile-First-Sweep (Nav, Hero, Karten, PDP, Formulare, Cart, Checkout, Touch, kein H-Scroll) | ✅ R7 (MESS-Sweep: 13 Kernrouten × 3 Breiten [375/768/1280] — 0× horizontaler Scroll, 0 Konsolen-Fehler, 0 fehlgeschlagene Ressourcen; Touch-Audit: keine zu kleinen sichtbaren Tap-Ziele [frühe 19px-Treffer waren das NUR bei geöffnetem Menü gemountete Mega-Panel — Messartefakt]; Screenshots final-home-/final-personalize-{mobile,tablet,desktop}) |
| 2 | Einheitliches Designsystem (eckig überall, auch Editions/Aktionen; einheitliche Abstände/Schatten; konsistente Poster-Proportionen) | ◐ R1 (71 Rundungen eckig) · R3 (Bundle-Pills) · R6: LETZTE 999er-Pills eckig (Sprachwähler, Carousel-Pfeile, „Alle ansehen", Cart-Leer-CTA + Versandbalken, Artikel-CTA; Carousel-Punkte + Farb-Swatches bleiben bewusst Kreise); Poster-PROPORTIONEN konsistent: Vorschau-SVG jetzt 5:7 (= Verkaufsformat 50×70, vorher A-Serien-√2), alle Poster-Kästen einheitlich 3:4 (PDP-Galerie/Thumbs/Digital-Karte waren 4:5). R7: visueller 3-Breiten-Abschluss-Sweep ohne Abstands-/Schatten-Befund — Bereich abgeschlossen |
| 3 | Mega-Menü komplett WEISS (auch Hover/Container); mobil klare Hierarchie; keine Doppel-Links | ✅ R1 (weiß; Mobil-Hierarchie in R2 geprüft) |
| 4 | Navigation/Kollektionen bereinigen … | ✅ R2 (Soft-Retire 1–6+15; Gifts/Zubehör raus aus UI+Suche+Nav; Legacy-Slugs & /product-Links = Redirects, keine 404; Preise für Alt-Warenkörbe erhalten) |
| 5 | EINE zentrale Personalisierungsseite mit 5 Angeboten (BaZi, Geburtschart, Paar, Premium-Analyse, Poster+Analyse) | ✅ R3 (alle 5 Typen auf /personalize mit Preisen; /digital-Seite ENTFERNT → Redirect /personalize?type=digital — sie verkaufte die 195-€-Analyse OHNE Geburtsdaten; b-digital-Bundle-Karte kauft nicht mehr direkt, sondern verlinkt in den Flow; Taxonomie/Suche/Kollektions-Karten deep-linken auf die Typen; Browser-verifiziert 375/768/1280) |
| 6 | Geburtschart-Präsentation (Poster+Rahmen+Hintergrund als EIN Modul) in Personalisierungsseite; Sticky bezieht sich auf den ganzen Produktcontainer, hängt nicht am Hero | ✅ R3 (.personalize-scene: Poster+Realrahmen auf Wandfläche als EIN Modul; Sticky-Offset 96→106px — stand 10px UNTER der fixen 106px-Kopfleiste; Sticky-Container opak (maskiert durchscrollende Karten), klebt als Grid-Kind über die volle Produktcontainer-Höhe; Screenshots sticky-desktop/mobile) |
| 7 | Einheitliche PDP-Struktur AUCH für personalisierte Produkte (Mockups, Details, Material, Rahmenansichten, Formate, Beschreibung, Liefer-/Produktions-/Personalisierungs-Infos, Empfehlungen) | ✅ R4 (/personalize trägt die PDP-Bausteine aus DENSELBEN Quellen wie die Katalog-PDP: faqDefs-Accordion Details/Material·Größen·Versand/Produktion·Personalisierung, klickbare Rahmen-ANSICHTEN beider Rahmen im Präsentationsmodul, Trust-Zeile, Empfehlungen mit aktiven Produkten — PersonalizeInfoSections.tsx; Browser-verifiziert 375/768/1280) |
| 8 | Premium-Analyse-Formular reparieren: Felder dynamisch je Option, Pflichtfelder markiert, kein Datenverlust bei Optionswechsel, Daten in Cart+Order, Order-Gate ohne Pflichtdaten | ✅ R3 (Pflichtfeld-Sternchen + Legende + aria-required; Datenerhalt beim Typwechsel test-bewiesen; SERVER-Order-Gate neu: /api/checkout → 400 für ptype:*/digital:*/bundle:b-digital ohne vollständige Geburtsdaten, VOR Stripe — server/personalizationGate.js, 9 Tests; Client-Gate cartHasIncompletePersonalization gleichgezogen: Line ganz ohne personalization gilt als unvollständig) |
| 9 | Gelato-Automatisierung für ALLE Poster (auch nicht-personalisierte): PDF je Produkt/Variante bestimmen+validieren, übertragen, Status speichern, Retry, Doppel-Produktion verhindert, nie falsche Zuordnung | ✅ R5 (KRITISCHER FUND: Katalog-Poster [Feuerpferd/TCM/Wuxing] wurden bezahlt und vom Fulfillment STILL übersprungen — Metadaten trugen nur personalisierte Lines. Jetzt: /api/checkout schreibt JEDE Line server-authoritativ [productId/variantId/qty] in die Metadaten; fulfillment produziert Katalog-Lines über die Druck-Asset-Registry server/printAssets.js [startet LEER wie PRODUCT_UIDS — Operator legt validierte Druck-PDFs unter print-assets/ ab, bis dahin failed LAUT, nie stille Nicht-Produktion/falsche Datei]; Rahmen-Achse auf Ready-to-ship-PDPs [preisneutral, für die Format×Rahmen-UID-Zuordnung]; Retry-Route POST /api/fulfillment/retry/:sessionId env-gated [FULFILLMENT_RETRY_SECRET, 503/403-Muster wie Broadcast], idempotent [UNIQUE-Print + gelato_order_id — nie Doppel-Produktion]; Status weiter in orders.fulfillment_status. OFFEN dafür: Operator-Druckdateien je Katalog-Poster [RL-PRINT-ASSETS]) |
| 10 | Posterformate überall vereinheitlichen (Namen, Maße, Ausrichtung, Auswahl, Varianten, Vorschau, Cart, Gelato-/PDF-Zuordnung) | ✅ R4 (EIN Format-System 30×40/50×70/70×100 in Konfigurator, PDP-Selektor, Taxonomie/Mega-Menü, Größenberater-Texte in 4 Sprachen; A-Serie bleibt NUR server-seitig für Alt-Warenkörbe/Reprints gültig. KRITISCHER FUND: fulfillment übergab das size-LABEL („50 × 70") an PRINT_SPECS/Gelato (IDs) — jede echte personalisierte Bestellung wäre am PDF-Schritt gescheitert; Fix: resolvePrintSizeId (printSpecs.js, laut bei Unbekanntem) + kanonische sizeId in jeder personalization, test-bewiesen) |
| 11 | „Wird oft zusammen gekauft" auf JEDER Produktseite (passend, existent, mobil bedienbar) | ✅ R4+R7 (R4: nur aktive Produkte; R7: PASSEND kuratiert — relatedProductsFor [catalog.ts]: gleiche product_world zuerst, deterministisch aus echten Daten, test-gepinnt [TCM-PDP → 12/13/14]; /personalize empfiehlt Wuxing/Feuerpferd/TCM; mobil einspaltig verifiziert) |
| 12 | Neuheiten/Alle ansehen/Editions/Aktionen: Karten, Links, Bilder, Buttons, Hover vereinheitlichen; keine leeren/doppelten/toten Inhalte | ◐ R6 (Buttons/Hover vereinheitlicht [eckig, eine Hover-Sprache], „Alle ansehen"-Pill eckig, toter Artikel-CTA auf soft-retirtes Produkt 1 → /personalize, Neuheiten-Liste = nur aktive Produkte [seit R2/R4 geprüft]; R7: Abschluss-Sweep ohne Karten-Befund; die vorhandenen Platzhalter-Kacheln sind einheitlich und ALS Platzhalter markiert — echte Produkt-FOTOS bleiben Operator-Zuarbeit [RL-IMAGES, End-Liste A]) |
| 13 | Warenkorb-Badge direkt am Icon (gemeinsame Komponente, positionsstabil, korrekt bei 0 und hohen Zahlen) | ✅ R1 (Icon-Block, 99+-Kappung, kein Badge bei 0) |
| 14 | Doppelte Inhalte vollständig entfernen … | ✅ R2–R5 (Kategorien/Produkte/Links/Karten/Suche R2 ✓; /digital- und b-digital-Kaufpfad-Dubletten + Geschenk-Sucheinträge R3 ✓; die „API-/Gelato-Dubletten" sind mit R5 abgedeckt: Doppel-Produktion technisch verhindert [UNIQUE(stripe_session,line_key) + gelato_order_id-Check, auch für Katalog-Lines], eine Preis-/Variant-Grammatik [parseVariant exportiert, eine Quelle]) |
| 15 | Technik-QS: Konsole/Netzwerk sauber, keine 404, Lade-/Fehlerzustände, Validierung, Preis-/Variantenlogik, responsive Bilder, Performance, A11y (Tastatur, Fokus, Semantik), Meta-Daten, kein CLS | ✅ R7 (Konsole/Netzwerk: 13 Routen × 3 Breiten gemessen sauber, 0× ≥400-Ressourcen; META-DATEN-FUND behoben: jede Route trug den statischen index.html-Titel → zentrale Routen-Titel in der App-Shell [PDP = Produktname, live verifiziert, 3 Tests]; A11y: Skip-Link + Fokus-Verlagerung je Route + aria-required/rollen vorhanden, 0 img ohne alt; kein CLS-Risiko: alle Medienflächen in festen aspect-ratio-Containern; Lade-/Fehlerzustände: Suspense-Fallback + chart-error/503-Pfade test-gedeckt; Preis-/Variantenlogik: 18 Repricing- + Parity-Tests; Performance: Route-Splitting, Three.js aus Entry-Chunk gepinnt) |

## Offene Operator-Fragen (aus R3 — Preise/Claims sind Operator-Sache, nicht eigenmächtig geändert)

1. ~~**Preis-Widerspruch Poster+Analyse**~~ — **ERLEDIGT (Operator 2026-07-18,
   R4):** „Preis korrekt darstellen; finale Preise werden am Ende mit allen
   Testläufen kalkuliert." Umsetzung: Bundle-Preis wird jetzt aus denselben
   Quellen ABGELEITET (Poster-Basis 49 + rabattiertes PDF-Add-on 146,25 =
   195,25 €) statt des 79-€-Relikts — beide Kaufwege identisch bepreist,
   Client (productTypes.ts) + Server (pricing.js) im Parity-Test gekoppelt.
   Die END-Kalkulation ändert nur noch die Basiswerte an einer Stelle.
2. ~~**„10–15 Seiten"-Behauptung**~~ — **ENTSCHIEDEN (Operator 2026-07-18,
   Option B):** Die Seitenzahl-Angabe BLEIBT im Shop-Text stehen; im Gegenzug
   ist **10–15 Seiten ab sofort verbindliche Bau-Vorgabe für den
   Premium-PDF-Generator** (RL-PREMIUM-PDF): die fertige Analyse-PDF MUSS
   10–15 Seiten umfassen, sonst gilt der Generator als nicht abgenommen.
   Festgehalten auch im Sitzungsgedächtnis (open-launch-items Punkt 3).

## Akzeptanzkriterien (17)

1 Mobile First komplett · 2 Mega-Menü weiß · 3 keine Doppel-Kollektionen ·
4 genau eine Personalisierungsseite · 5 alle fünf Angebote dort korrekt ·
6 Geburtschart-Präsentation übernommen · 7 personalisierte PDPs vollständig
(Mockups/Details/Material) · 8 Premium-Analyse-Felder funktionieren ·
9 alle PDPs einheitlich · 10 Formate konsistent · 11 jede Posterbestellung
automatisch mit korrektem PDF an Gelato · 12 „Oft zusammen gekauft" überall ·
13 eckige Formensprache überall · 14 Badge korrekt am Icon · 15 keine
doppelten/leeren/nicht existierenden Produkte · 16 Nav/Cart/Checkout mobil+
Desktop fehlerfrei · 17 Konsole/Netzwerk ohne relevante Fehler.

Pflicht vor Abschluss: vollständiger Test auf Smartphone-, Tablet- und
Desktop-Breite.

## Akzeptanz-Protokoll (R7, 2026-07-19 — Pflicht-Test bestanden)

Mess-Sweep: 13 Kernrouten (/​, /personalize, /collections, /collections/tcm-
posters, /product/11, /product/8, /bundles, /offers, /inspiration, /faq,
/about, /blog, /checkout) × 3 Breiten (375/768/1280) — 0× H-Scroll, 0
Konsolen-Fehler, 0 Ressourcen ≥400. Test-Suite: 749/749 sequenziell grün.

| AK | Beleg |
|----|-------|
| 1 Mobile First | Mess-Sweep + Screenshots (Bereich 1, R7) |
| 2 Mega-Menü weiß | R1; Sweep ohne Befund |
| 3 keine Doppel-Kollektionen | R2 Soft-Retire + Redirects; Suche nur aktive |
| 4 EINE Personalisierungsseite | R3: /digital entfernt, alle Pfade → /personalize |
| 5 fünf Angebote korrekt | R3/R4: 5 Typen, Preise aus EINER Quelle (Bundle abgeleitet) |
| 6 Geburtschart-Präsentation | R3: Szene-Modul + Sticky-Fix |
| 7 personalisierte PDPs vollständig | R4: faqDefs/Rahmenansichten/Trust/Empfehlungen |
| 8 Premium-Analyse-Felder | R3: Pflichtfelder + Datenerhalt + Doppel-Gate (Client+Server) |
| 9 PDPs einheitlich | R4/R7: gleiche Bausteine, Formate, Rahmen-Achse, 3:4-Kästen |
| 10 Formate konsistent | R4: EIN cm-System überall; Label→ID-Resolver im Druckpfad |
| 11 Bestellung→PDF→Gelato | **[INTEGRATION-FAKE] bewiesen** (alle Line-Typen, Idempotenz, Retry, laute Fehler + Alarm-Mail). **LIVE offen**: RL-STRIPE-CHAIN (End-Durchtest, Phase B) + RL-PRINT-ASSETS (Operator-Druckdateien) — KEINE Live-Garantie-Aussage vor Phase B |
| 12 „Oft zusammen gekauft" überall | R7: kuratiert (gleiche Welt zuerst), test-gepinnt |
| 13 eckig überall | R1/R3/R6: alle 999er-Pills entfernt (Swatches/Dots bewusste Kreise) |
| 14 Badge am Icon | R1 |
| 15 keine toten/leeren Produkte | R2–R7: nur aktive SKUs in Listen/Suche/Empfehlungen; Redirects statt 404 |
| 16 Nav/Cart/Checkout fehlerfrei | Sweep 3 Breiten + 749 Tests (Checkout-Gates, Repricing) |
| 17 Konsole/Netzwerk sauber | Mess-Sweep: 0 Fehler, 0 ≥400 |

**Batch #12 ist damit auf Test-/Sweep-Ebene abgeschlossen.** Verbleibend vor
Launch: End-Liste A (Operator-Zuarbeit) + Phase B (Premium-PDF 10–15 Seiten,
kompletter Live-Durchtest) — siehe Sitzungsgedächtnis „End-Abarbeitungsliste".
