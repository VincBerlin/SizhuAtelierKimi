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
| 1 | Mobile-First-Sweep (Nav, Hero, Karten, PDP, Formulare, Cart, Checkout, Touch, kein H-Scroll) | ☐ |
| 2 | Einheitliches Designsystem (eckig überall, auch Editions/Aktionen; einheitliche Abstände/Schatten; konsistente Poster-Proportionen) | ◐ R1 (71 Rundungen → eckig, nur 2–5px-Minimalradien übrig; Proportionen/Abstände folgen) · R3: Bundle-Karten-Pill-Buttons (radius 999) eckig |
| 3 | Mega-Menü komplett WEISS (auch Hover/Container); mobil klare Hierarchie; keine Doppel-Links | ✅ R1 (weiß; Mobil-Hierarchie in R2 geprüft) |
| 4 | Navigation/Kollektionen bereinigen … | ✅ R2 (Soft-Retire 1–6+15; Gifts/Zubehör raus aus UI+Suche+Nav; Legacy-Slugs & /product-Links = Redirects, keine 404; Preise für Alt-Warenkörbe erhalten) |
| 5 | EINE zentrale Personalisierungsseite mit 5 Angeboten (BaZi, Geburtschart, Paar, Premium-Analyse, Poster+Analyse) | ✅ R3 (alle 5 Typen auf /personalize mit Preisen; /digital-Seite ENTFERNT → Redirect /personalize?type=digital — sie verkaufte die 195-€-Analyse OHNE Geburtsdaten; b-digital-Bundle-Karte kauft nicht mehr direkt, sondern verlinkt in den Flow; Taxonomie/Suche/Kollektions-Karten deep-linken auf die Typen; Browser-verifiziert 375/768/1280) |
| 6 | Geburtschart-Präsentation (Poster+Rahmen+Hintergrund als EIN Modul) in Personalisierungsseite; Sticky bezieht sich auf den ganzen Produktcontainer, hängt nicht am Hero | ✅ R3 (.personalize-scene: Poster+Realrahmen auf Wandfläche als EIN Modul; Sticky-Offset 96→106px — stand 10px UNTER der fixen 106px-Kopfleiste; Sticky-Container opak (maskiert durchscrollende Karten), klebt als Grid-Kind über die volle Produktcontainer-Höhe; Screenshots sticky-desktop/mobile) |
| 7 | Einheitliche PDP-Struktur AUCH für personalisierte Produkte (Mockups, Details, Material, Rahmenansichten, Formate, Beschreibung, Liefer-/Produktions-/Personalisierungs-Infos, Empfehlungen) | ☐ |
| 8 | Premium-Analyse-Formular reparieren: Felder dynamisch je Option, Pflichtfelder markiert, kein Datenverlust bei Optionswechsel, Daten in Cart+Order, Order-Gate ohne Pflichtdaten | ✅ R3 (Pflichtfeld-Sternchen + Legende + aria-required; Datenerhalt beim Typwechsel test-bewiesen; SERVER-Order-Gate neu: /api/checkout → 400 für ptype:*/digital:*/bundle:b-digital ohne vollständige Geburtsdaten, VOR Stripe — server/personalizationGate.js, 9 Tests; Client-Gate cartHasIncompletePersonalization gleichgezogen: Line ganz ohne personalization gilt als unvollständig) |
| 9 | Gelato-Automatisierung für ALLE Poster (auch nicht-personalisierte): PDF je Produkt/Variante bestimmen+validieren, übertragen, Status speichern, Retry, Doppel-Produktion verhindert, nie falsche Zuordnung | ☐ |
| 10 | Posterformate überall vereinheitlichen (Namen, Maße, Ausrichtung, Auswahl, Varianten, Vorschau, Cart, Gelato-/PDF-Zuordnung) | ☐ |
| 11 | „Wird oft zusammen gekauft" auf JEDER Produktseite (passend, existent, mobil bedienbar) | ☐ |
| 12 | Neuheiten/Alle ansehen/Editions/Aktionen: Karten, Links, Bilder, Buttons, Hover vereinheitlichen; keine leeren/doppelten/toten Inhalte | ☐ |
| 13 | Warenkorb-Badge direkt am Icon (gemeinsame Komponente, positionsstabil, korrekt bei 0 und hohen Zahlen) | ✅ R1 (Icon-Block, 99+-Kappung, kein Badge bei 0) |
| 14 | Doppelte Inhalte vollständig entfernen … | ◐ R2 (Kategorien/Produkte/Links/Karten/Suche ✓; API-/Gelato-Dubletten in R-Gelato) · R3: /digital- und b-digital-Kaufpfad-Dubletten entfernt; Geschenk-Sucheinträge (zeigten auf entfernte Kollektion) bereinigt |
| 15 | Technik-QS: Konsole/Netzwerk sauber, keine 404, Lade-/Fehlerzustände, Validierung, Preis-/Variantenlogik, responsive Bilder, Performance, A11y (Tastatur, Fokus, Semantik), Meta-Daten, kein CLS | ☐ |

## Offene Operator-Fragen (aus R3 — Preise/Claims sind Operator-Sache, nicht eigenmächtig geändert)

1. **Preis-Widerspruch Poster+Analyse:** Der Personalize-Typ `bundle`
   („Poster + Analyse", PDF inklusive) kostet **79 €** — derselbe Inhalt als
   Poster (49 €) + PDF-Add-on (146,25 €) kostet **195,25 €**. Beide Pfade sind
   live und server-bepreist (server/pricing.js spiegelt productTypes.ts).
   Operator-Entscheid nötig: Bundle-Preis anheben, Add-on-Preis senken, oder
   Bundle als bewusstes Einstiegsangebot dokumentieren.
2. **„10–15 Seiten"-Behauptung:** Die Seitenzahl-Angabe zur Analyse-PDF steht
   noch in ~20 i18n-Strings (Kollektionskarten, FAQ, Bundle-Karte), während
   RL-PREMIUM-PDF offen ist (PDF wird erst am Ende gebaut). R2 hat den Claim
   auf der Inspiration-Kachel bereits gestrichen. Operator-Entscheid: überall
   streichen/weichzeichnen oder Seitenumfang verbindlich bestätigen.

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
