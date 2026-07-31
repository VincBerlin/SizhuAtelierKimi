# SizhuAtelier — Präzisionsplan V3
## Fachliche CJK-Shopmigration bei erhaltener Marken- und Designidentität

**Stand:** 2026-07-31  
**Repository:** `VincBerlin/SizhuAtelierKimi`  
**Ausgangsbasis:** aktueller Code auf `main` bzw. `feat/fufire-personalization` vor Beginn nochmals commitgenau feststellen  
**Zielstatus:** fachlicher Wechsel von Astrologie/TCM zu personalisierten CJK-Schriftpostern, ohne unnötigen visuellen Neustart des Shops  
**Migrationsprinzip:** Domain und Inhalte ändern; Marke, Farbwelt, Shop-Hülle und bewährte Commerce-Komponenten bleiben erhalten  
**Frontend-Prinzip:** Mobile First ist verbindlich; Desktop ist die Erweiterung der mobilen Kernoberfläche, nicht umgekehrt  
**Evidence-Status dieses Plans:** `unverified-runtime` — Architektur- und Migrationsplan; noch keine Codeänderung oder Produktionsprüfung

---

## 0. Verbindliche Leitentscheidung

Dieses Vorhaben ist **kein vollständiges Rebranding und kein Greenfield-Neubau**.

Es ist eine kontrollierte Migration in zwei getrennten Ebenen:

1. **Fachliche Ebene wird ersetzt:** Astrologie, BaZi, TCM, FuFirE, Geburtsdaten und digitale Analysen werden entfernt und durch personalisierte CJK-Schriftposter ersetzt.
2. **Visuelle und technische Shop-Hülle bleibt bestehen:** Marke, Logo, Farben, Typografie, Header-/Footer-Grundstruktur, Containerbreite, Warenkorb, Checkout und zentrale UI-Muster werden weiterverwendet.

### Nicht verhandelbare Abgrenzung

- Keine neue Farbpalette.
- Kein generisches SaaS-Redesign.
- Keine vollständige Neuerfindung von Navigation, Karten, Buttons oder Seitenraster.
- Keine Änderung des Logos oder Markennamens.
- Keine großflächigen Verläufe, Neonfarben, Glassmorphism-Optik oder überladene Animationen.
- Bestehende Komponenten werden zuerst angepasst; sie werden nur ersetzt, wenn eine dokumentierte technische Blockade besteht.
- Jede visuelle Änderung muss entweder dem neuen Produktfluss dienen oder nachweislich Lesbarkeit, Barrierefreiheit oder Conversion verbessern.

### Bestehende Designquelle bleibt verbindlich

Die aktuell im Repository definierten Design-Tokens bleiben die Ausgangs- und Zielpalette:

| Rolle | Bestehender Wert | Regel |
|---|---:|---|
| Hauptfläche | `#FFFFFF` | bleibt |
| Haupttext / Ink | `#2A2620` | bleibt |
| Terracotta-Akzent | `#C0492E` | bleibt |
| Akzent Hover | `#A0341F` | bleibt |
| warme Sekundärfläche | `#F6F6F6` | bleibt |
| Hauptborder | `#ECE5D8` | bleibt |
| Input-Border | `#E2DACB` | bleibt |
| Serifenschrift | `Cormorant Garamond` | bleibt |
| Sans-Serif | `Inter` | bleibt |
| Inhaltsbreite | `1200px` | bleibt |

Neue CJK-Fonts gelten ausschließlich für die Poster-Schrift und gegebenenfalls kleine sprachspezifische Beispiele. Sie ersetzen nicht die Marken-Typografie der Shopoberfläche.

### Zielwirkung

Der fertige Shop soll weiterhin eindeutig als SizhuAtelier erkennbar sein, jedoch:

- inhaltlich fokussierter;
- ruhiger und klarer;
- produktzentrierter;
- moderner in der Bedienung;
- stärker auf den Live-Konfigurator ausgerichtet;
- frei von astrologischer und medizinisch wirkender Kommunikation.

### Mobile-First-Grundsatz

Der Shop wird zuerst für kleine Touch-Displays entworfen, implementiert und geprüft.

Die verbindliche Entwicklungsreihenfolge lautet:

1. 320–375 px;
2. 390–430 px;
3. 768 px;
4. 1024 px;
5. 1280 px und größer.

Desktop darf zusätzliche Fläche und parallele Darstellung nutzen. Keine zentrale Funktion darf jedoch erst auf Desktop verständlich oder vollständig bedienbar werden.

#### Mobile-First bedeutet ausdrücklich

- Navigation funktioniert vollständig ohne Hover.
- Alle interaktiven Elemente sind per Touch erreichbar.
- Der Konfigurator ist mit einer Hand bedienbar.
- Die Vorschau bleibt sichtbar, ohne das Formular unbenutzbar zu machen.
- Der Kunde verliert beim Wechsel zwischen Schritten keine Eingaben.
- Lange CJK-Zeichenfolgen erzeugen keinen horizontalen Scroll.
- Modale Fenster und Drawer passen vollständig in die mobile Viewport-Höhe.
- Checkout, Warenkorb und Freigabe funktionieren ohne Desktop-Layout.
- Bilder und Fonts werden mobil priorisiert und größenabhängig geladen.
- Es gibt keine mobile Sekundärversion mit reduziertem Funktionsumfang.

#### Mindest-Touchziele

- primäre Buttons: mindestens 44 × 44 CSS-Pixel;
- Icon-Buttons: mindestens 44 × 44 CSS-Pixel;
- Abstand zwischen kritischen Aktionen: mindestens 8 CSS-Pixel;
- Formularfelder: ausreichend hoch für mobile Eingabe;
- keine ausschließlich farbliche Statuskommunikation.

#### Mobile Text- und Eingaberegeln

- Formularschrift mindestens 16 px, damit mobile Browser nicht ungefragt zoomen;
- Labels bleiben sichtbar und werden nicht nur als Placeholder dargestellt;
- Fehlermeldungen stehen direkt am betroffenen Feld;
- Texteingabe, Sprachwahl und Variantenwahl werden nicht in zu engen Mehrspaltenrastern dargestellt;
- Tastaturtypen werden passend gesetzt, sofern technisch sinnvoll;
- Autocomplete und Autofill werden kontrolliert eingesetzt;
- der Kunde kann die Vorschau jederzeit wieder aufrufen, ohne Eingaben zu verlieren.

#### Mobile Performance

Für den mobilen Erstaufruf gelten folgende Ziele:

- keine blockierende 3D- oder Videoanimation;
- Hero-Bild responsiv und komprimiert;
- Design-Thumbnails lazy-loaded;
- CJK-Fonts nur für tatsächlich gewählte Sprache oder sichtbare Vorschau laden;
- Translation Requests debounced und abbrechbar;
- keine vollständige Katalog- oder Fontbibliothek im Initial Bundle;
- Route-Level Code Splitting bleibt erhalten;
- keine unnötige Bibliothek nur für einen kleinen UI-Effekt.


---

## 1. Zielbild

SizhuAtelier wird zu einem spezialisierten Poster-Shop für:

1. personalisierte Namen in chinesischer, japanischer oder koreanischer Schrift;
2. personalisierte kurze Sätze, Widmungen oder Begriffe;
3. kuratierte, bereits fertig gestaltete Poster des Betreibers;
4. physische Print-on-Demand-Produkte und optional digitale Druckdateien, sofern diese bewusst angeboten werden.

Nicht mehr Bestandteil:

- BaZi;
- westliche Geburtshoroskope;
- Paar-/Kompatibilitätsanalysen;
- FuFirE;
- Geburtsdaten und Ortsauflösung;
- TCM;
- Wu Xing als fachliche Shopwelt;
- Feuerpferd 2026;
- digitale astrologische Analysen;
- Premium-Analyse-PDF;
- astrologische Bundles;
- astrologische Blog-, Menü-, SEO- und Marketingtexte.

---

## 2. Kernentscheidung

Der bestehende Shop wird **nicht neu von null gebaut und nicht visuell ersetzt**. Folgende Infrastruktur und UI-Hülle werden weiterverwendet:

- React/Vite-Frontend;
- bestehendes Seitenraster und Container-System;
- Navbar-/Mega-Menü-Mechanik mit neuer Taxonomie;
- Announcement Bar und Footer-Grundstruktur;
- bestehende Button-, Karten-, Formular- und Drawer-Muster;
- Routing-Grundgerüst;
- Warenkorb und Checkout;
- serverautoritatives Pricing;
- Stripe;
- Gelato;
- Accounts und Bestellhistorie;
- Postgres;
- i18n DE/EN/FR/ES;
- SVG-Design-Registry;
- identische Vorschau-/Druckquelle;
- PDF-Erzeugung;
- CI und Teststruktur;
- Evidence-Ledger und Ehrlichkeits-Gates.

Ersetzt wird das fachliche Domain-Modell.

---

## 3. Entfernen, behalten, neu bauen

| Bereich | Entscheidung | Umsetzung |
|---|---|---|
| FuFirE-Client | löschen | `server/fufire.js`, Imports, Routen, Tests, Env-Variablen und Dokumentation entfernen |
| BaZi/Western/Match | löschen | `/api/bazi`, `/api/western`, `/api/match` entfernen |
| Geocoding für Geburtsorte | löschen | `/api/geocode`, Orts-Hooks und City-Suche entfernen, sofern nicht anderweitig benötigt |
| Geburtsdaten-Konfigurator | ersetzen | `Personalize.tsx` durch CJK-Poster-Konfigurator ersetzen |
| TCM-Seite | löschen/redirecten | `/tcm` dauerhaft auf passende neue Kollektion umleiten |
| TCM-/Wuxing-Produkte | retirieren | nicht mehr in Shop, Suche, Empfehlungen oder Navigation ausspielen |
| Feuerpferd | retirieren | Produkt, Kampagne, Navigation, Assets und Texte entfernen |
| Digitale Analyse | löschen | `digital`, `bundle`, PDF-Analysepreise und Copy entfernen |
| Checkout | behalten/anpassen | neue Produkt- und Personalisierungsdaten serverseitig prüfen |
| Stripe | behalten | Produkt-/Preislogik neu abbilden |
| Gelato | behalten | Mapping und Druckfluss an neue Poster-SKUs koppeln |
| Design-Registry | behalten/erweitern | Metadaten für Sprache, Schrift, Layout und Textgrenzen ergänzen |
| PDF-Pipeline | behalten/erweitern | CJK-Fonts und finale Übersetzungs-Snapshots verwenden |
| Katalog-Poster | behalten | nur vom Betreiber freigegebene, nicht astrologische Designs |
| Accounts/Postgres | behalten | Übersetzungs- und Freigabestatus ergänzen |
| Newsletter | optional behalten | nur vollständig von FuFirE/Astrologie entkoppelte Inhalte |
| Blog | optional behalten | alte astrologische Inhalte entfernen oder archivieren |

---

## 4. Zielarchitektur

```text
Browser
├── Shop / Collections
├── CJK Poster Configurator
│   ├── Eingabetext
│   ├── Typ: Name / Satz / eigenes CJK
│   ├── Ziel: Chinesisch vereinfacht / traditionell / Japanisch / Koreanisch
│   ├── Übersetzungsvarianten
│   ├── Design, Ausrichtung, Format, Rahmen
│   └── Live-SVG-Vorschau
└── Checkout

Server
├── POST /api/translation/preview
├── POST /api/translation/confirm
├── POST /api/checkout
├── POST /api/webhook
├── Fulfillment State Machine
├── SVG/PDF Renderer
└── Gelato

External
├── Übersetzungsanbieter
├── optionales LLM für Varianten und Erklärungen
├── Stripe
├── Gelato
├── Postgres
└── Resend
```

Wichtig: API-Schlüssel bleiben ausschließlich serverseitig.

---

## 5. Übersetzungsmodell

### 5.1 Drei getrennte Eingabemodi

#### A. Personenname

Der Kunde gibt einen Namen ein.

Ausgabe:

- Zielsprache;
- vorgeschlagene Schreibweise;
- Aussprache/Romanisierung;
- kurze Erklärung;
- gegebenenfalls zwei bis drei Varianten.

Produktregeln:

- Chinesisch: phonetisch und gegebenenfalls semantisch abgestimmte Zeichenwahl; vereinfachte und traditionelle Schrift getrennt behandeln.
- Japanisch: für ausländische Namen standardmäßig Katakana; eine Kanji-Kunstadaption nur als gesonderte, geprüfte Option.
- Koreanisch: phonetische Hangul-Schreibweise.
- Keine Behauptung, dass ein westlicher Name eine einzige objektiv richtige CJK-Entsprechung besitzt.

#### B. Wort oder kurzer Satz

Ausgabe:

- natürliche Übersetzung;
- wörtlichere Alternative;
- Rückübersetzung;
- Aussprache;
- Warnhinweis bei Mehrdeutigkeit.

#### C. Kunde liefert bereits CJK-Schrift

Keine Neuübersetzung. Der Shop prüft:

- Unicode;
- unterstütztes Schriftsystem;
- Textlänge;
- nicht druckbare Zeichen;
- Glyphenabdeckung;
- Zeilenumbrüche;
- Design-Fit.

### 5.2 Qualitätsstufen

| Status | Bedeutung | Darf gedruckt werden? |
|---|---|---|
| `draft` | automatische Vorschau | nein |
| `customer_selected` | Kunde hat eine Variante gewählt | noch nicht |
| `review_required` | sprachliche Prüfung offen | nein |
| `approved` | freigegebener finaler Text | ja |
| `rejected` | problematisch oder unklar | nein |
| `printed` | PDF und Gelato-Auftrag erzeugt | abgeschlossen |

### 5.3 Empfohlene Produktzusage

Nicht: „Garantiert automatisch korrekt übersetzt.“

Sondern:

> Sofortige personalisierte Vorschau. Der finale Text wird vor der Produktion geprüft und erst nach Freigabe gedruckt.

Ohne menschliche oder anderweitig belastbare Freigabe darf die Gelato-Produktion nicht automatisch starten.

---

## 6. Technische Übersetzungspipeline

### 6.1 Preview-Endpunkt

`POST /api/translation/preview`

Beispielrequest:

```json
{
  "sourceText": "Vincent",
  "sourceLanguage": "de",
  "target": "ja",
  "mode": "name",
  "scriptVariant": "katakana"
}
```

Beispielresponse:

```json
{
  "requestId": "tr_...",
  "status": "draft",
  "target": "ja",
  "mode": "name",
  "candidates": [
    {
      "id": "c1",
      "text": "ヴィンセント",
      "romanization": "Vinsento",
      "backTranslation": "Vincent",
      "note": "Phonetische japanische Schreibweise"
    }
  ],
  "provider": "configured-provider",
  "providerVersion": "stored",
  "warnings": []
}
```

### 6.2 Regeln

- 400–600 ms Debounce im Browser;
- Requests abbrechen, wenn der Kunde weiter tippt;
- serverseitiger Cache über normalisierten Input-Hash;
- Rate-Limit;
- maximal definierte Zeichenlänge;
- Unicode-Normalisierung NFC;
- HTML/XML-Escaping;
- keine ungeprüfte HTML-Ausgabe;
- strukturierte JSON-Antwort;
- Providerfehler erzeugen keinen erfundenen Fallback;
- Vorschau zeigt bei Fehler einen klaren Status.

### 6.3 Bestell-Snapshot

Beim Hinzufügen zum Warenkorb wird nicht nur der Eingabetext gespeichert, sondern:

```json
{
  "sourceText": "Vincent",
  "sourceLanguage": "de",
  "targetLanguage": "ja",
  "scriptVariant": "katakana",
  "translationMode": "name",
  "selectedCandidateId": "c1",
  "finalText": "ヴィンセント",
  "romanization": "Vinsento",
  "translationStatus": "customer_selected",
  "translationProvider": "configured-provider",
  "translationProviderVersion": "stored",
  "designId": "jp-minimal-01",
  "layoutId": "vertical-center",
  "sizeId": "50x70",
  "fontId": "noto-serif-jp"
}
```

Der Fulfillment-Prozess darf die Übersetzung nicht später still neu berechnen. Er verwendet den freigegebenen Snapshot.

---

## 6.4 Übersetzungsanbieter: Entscheidung erst nach Benchmark

Der Plan legt bewusst noch keinen einzelnen Anbieter als endgültige Wahrheit fest. Das wäre ohne Vergleich zu früh.

Vor der produktiven Auswahl wird ein standardisiertes Testset verwendet:

- 15 westliche Namen je Zielschrift;
- 15 kurze Wörter oder Sätze je Zielschrift;
- vereinfachtes Chinesisch;
- traditionelles Chinesisch;
- Japanisch;
- Koreanisch;
- mindestens ein sprachkundiger Review pro Zielschrift;
- Bewertung von Natürlichkeit, Aussprache, Bedeutung, Rückübersetzung und kultureller Eignung.

Der Server erhält deshalb einen austauschbaren Adapter:

```js
translatePreview(input, provider)
```

Der produktive Anbieter wird erst festgelegt, wenn:

1. das Testset bewertet wurde;
2. strukturierte Antwortdaten zuverlässig sind;
3. Datenschutz und Auftragsverarbeitung geklärt sind;
4. Kosten pro Vorschau bekannt sind;
5. Fehler- und Rate-Limit-Verhalten geprüft wurde.

Bis dahin lautet der Status: `provider-unselected`.

---

## 7. Datenmodell

Neue Tabelle empfohlen:

```sql
CREATE TABLE translation_jobs (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id INTEGER NULL,
  order_id INTEGER NULL,
  source_text TEXT NOT NULL,
  source_language TEXT,
  target_language TEXT NOT NULL,
  script_variant TEXT,
  mode TEXT NOT NULL,
  candidates JSONB NOT NULL,
  selected_candidate JSONB,
  status TEXT NOT NULL,
  provider TEXT,
  provider_version TEXT,
  review_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);
```

Zusätzliche Regeln:

- personenbezogene Inhalte minimieren;
- Löschfristen definieren;
- keine Übersetzungs- oder Namensdaten in Logs schreiben;
- Adminzugriff protokollieren;
- Providerverarbeitung in Datenschutzerklärung aufnehmen.

---

## 8. Neuer Konfigurator

### Schritt 1 — Textart

- Name
- Wort oder kurzer Satz
- Eigene CJK-Schrift

### Schritt 2 — Zielsprache

- Chinesisch vereinfacht
- Chinesisch traditionell
- Japanisch
- Koreanisch

### Schritt 3 — Varianten

- zwei bis drei Varianten;
- Aussprache;
- Rückübersetzung;
- Hinweis zur Bedeutung;
- Kunde wählt aktiv eine Variante.

### Schritt 4 — Gestaltung

- Design;
- vertikal/horizontal, sofern das Design dies unterstützt;
- Schriftstil;
- Hintergrund;
- Format;
- Rahmen;
- optional Unterzeile/Romanisierung.

### Schritt 5 — Live-Vorschau

- echte SVG-Ausgabe;
- Desktop und Mobil;
- sichtbare Safe Area;
- Warnung bei zu langem Text;
- kein Designwechsel mit Datenverlust.

### Schritt 6 — Freigabe

Checkbox:

> Ich habe Schreibweise, Sprache und Vorschau geprüft. Die finale Produktion erfolgt nach sprachlicher Freigabe.

### Schritt 7 — Warenkorb

Speichert den vollständigen Übersetzungs- und Design-Snapshot.

### Mobile Konfigurator-Layout

#### Mobile Standardansicht

Auf kleinen Displays arbeitet der Konfigurator als schrittweiser Flow:

```text
1. Text
2. Sprache
3. Variante
4. Design
5. Format
6. Prüfung
```

Pro Schritt wird nur die jeweils notwendige Entscheidung gezeigt. Die Poster-Vorschau bleibt über einen kompakten Vorschau-Header, eine einklappbare Preview oder einen eigenen Vorschauschritt erreichbar.

#### Empfohlene mobile Struktur

```text
Header
Fortschrittsanzeige
Schritttitel
aktive Eingabefläche
kompakte Vorschau
Zurück / Weiter
persistente Preis- und Statuszeile
```

#### Nicht erlaubt

- dauerhaftes Desktop-Zweispaltenlayout auf 375 px;
- winzige Vorschau neben einem schmalen Formular;
- horizontale Stepper;
- Hover-Hinweise ohne Touch-Alternative;
- feste Höhen, durch die Inhalte hinter der Bildschirmtastatur verschwinden;
- klebende Elemente, die mehr als einen sinnvollen Teil des Viewports verdecken.

#### Sticky Mobile CTA

Ein mobiler Sticky-CTA ist zulässig, wenn:

- Preis und Hauptaktion sichtbar bleiben;
- er keine Formfelder verdeckt;
- Safe-Area-Inset auf iOS berücksichtigt wird;
- Fehlermeldungen weiterhin sichtbar bleiben;
- der CTA bei geöffneter Tastatur angepasst oder ausgeblendet wird.


---

## 9. Designs hinterlegen

Die bestehende Design-Registry ist die richtige Grundlage und soll erweitert, nicht ersetzt werden.

### Vorgeschlagene Struktur

```text
src/designs/
├── registry.mjs
├── shared/
│   ├── escape.mjs
│   ├── layout.mjs
│   └── text-fit.mjs
├── chinese/
│   ├── zh-minimal-01.mjs
│   └── zh-seal-01.mjs
├── japanese/
│   ├── jp-minimal-01.mjs
│   └── jp-vertical-01.mjs
└── korean/
    ├── ko-minimal-01.mjs
    └── ko-vertical-01.mjs
```

### Registry-Metadaten

```js
{
  id: "jp-minimal-01",
  name: "Japanese Minimal",
  active: true,
  kind: "personalized-cjk",
  supportedLanguages: ["ja"],
  supportedScripts: ["Jpan", "Kana"],
  layouts: ["horizontal-center", "vertical-center"],
  maxGlyphs: {
    "horizontal-center": 24,
    "vertical-center": 12
  },
  fontId: "noto-serif-jp",
  thumbnail: "/images/designs/jp-minimal-01.webp",
  render
}
```

### Design-Import-Prozess

1. Originaldesign als SVG-/Layoutvorgabe liefern.
2. Schriftlizenz prüfen.
3. Textflächen und Safe Areas definieren.
4. Vorlage als reine Renderfunktion implementieren.
5. Registry-Eintrag ergänzen.
6. Vorschaubild erzeugen.
7. Testtexte für Chinesisch, Japanisch und Koreanisch rendern.
8. PDF in allen Produktgrößen erzeugen.
9. Glyphen, Beschnitt und Zeilenumbrüche visuell prüfen.
10. Design aktivieren.

Ein Design wird bei Einstellung auf `active: false` gesetzt und nicht gelöscht, damit alte Bestellungen reproduzierbar bleiben.

---

## 10. Fonts

Die Browser-Vorschau und der Server-PDF-Renderer müssen exakt dieselben Fontdateien verwenden.

Empfehlung für den technischen Basisbetrieb:

- Noto Serif CJK SC für vereinfachtes Chinesisch;
- Noto Serif CJK TC für traditionelles Chinesisch;
- Noto Serif CJK JP für Japanisch;
- Noto Serif CJK KR für Koreanisch;
- passende Sans-Varianten für Nebeninformationen.

Kalligrafische Fonts dürfen nur eingesetzt werden, wenn die kommerzielle Nutzung und Einbettung in PDF/Print ausdrücklich zulässig sind.

Die bisherige einzelne Zuordnung `Noto Serif SC` für alle CJK-Inhalte reicht für den neuen mehrsprachigen Shop nicht aus. Es braucht eine sprachabhängige Font-Map.

---

## 11. Katalogmodell

Neue Produktwelten:

```ts
type ProductWorld =
  | "personalized-name"
  | "personalized-phrase"
  | "curated-art-print";
```

Neue Personalisierungsarten:

```ts
type PersonalizationType =
  | "name"
  | "phrase"
  | "customer-cjk"
  | "none";
```

Neue Sprachachse:

```ts
type TargetLanguage =
  | "zh-Hans"
  | "zh-Hant"
  | "ja"
  | "ko";
```

Kuratierte vorhandene Poster dürfen nur übernommen werden, wenn:

- kein TCM-/Astrologie-/BaZi-Bezug mehr enthalten ist;
- Bild- und Druckdatei vorhanden sind;
- Produktbeschreibung und SEO neu geschrieben wurden;
- Printformat und Gelato-Mapping belegt sind;
- Rechte und Schriftlizenzen geklärt sind.

---

## 12. Navigation und Seitenstruktur

Die bestehende Navbar- und Mega-Menü-Mechanik bleibt erhalten. Geändert werden Inhalte und Zielrouten, nicht das gesamte Navigationsdesign.

### Primärnavigation — bewusst reduziert

- Personalisieren
- Kollektionen
- Bestseller
- Neuheiten

Die Zahl und visuelle Gewichtung der Hauptnavigation soll ungefähr dem heutigen reduzierten Modell entsprechen. Sprach- und Produkttypen gehören in das Mega-Menü, nicht als acht gleichgewichtete Hauptpunkte in die Kopfzeile.

### Mega-Menü

#### Nach Textart

- Name als Poster
- Wort oder Satz
- Eigene CJK-Schrift
- Geschenkposter

#### Nach Sprache

- Chinesisch vereinfacht
- Chinesisch traditionell
- Japanisch
- Koreanisch

#### Nach Stil

- Minimal
- Vertikal
- Modern
- Traditionell
- Kalligrafisch, nur bei lizenzierter und geprüfter Schrift

#### Shop

- Fertige Poster
- Bestseller
- Neuheiten
- Poster-Sets, nur wenn reale Sets existieren

### Sekundärnavigation / Footer

- So funktioniert es
- Über SizhuAtelier
- FAQ
- Kontakt
- Versand und Rückgabe
- Datenschutz
- Impressum

### Entfernte Ziele

- TCM
- Wu Xing als Fachwelt
- Feuerpferd
- BaZi
- Birth Chart
- Compatibility
- Astrology Analysis
- Digital Analysis
- astrologische Bundles

Alte URLs erhalten dauerhafte Redirects auf die sachlich nächstpassende neue Seite, damit keine 404-Kette entsteht.

### Seitenstruktur der Startseite

Die bestehende Seitensprache bleibt erhalten, der Inhalt wird jedoch neu priorisiert:

1. bestehender Header;
2. ruhiger Hero mit einem klaren Personalisierungsversprechen;
3. direkter Einstieg in den Konfigurator;
4. drei Sprachwelten plus chinesische Schriftvarianten;
5. ausgewählte Designvorlagen;
6. „So funktioniert es“ in drei Schritten;
7. Qualitäts- und Freigabehinweis;
8. fertige Poster;
9. FAQ;
10. bestehender Footer.

Nicht jede Sektion muss neu entwickelt werden. Vorhandene Home-Komponenten werden bevorzugt mit neuen Inhalten und Bildern befüllt.

### Modern-minimalistische Gestaltungsregeln

- große Posterbilder statt vieler kleiner Dekoelemente;
- klare Weißräume;
- kurze Überschriften und reduzierte Texte;
- maximal ein primärer CTA pro sichtbarem Abschnitt;
- Terracotta nur für primäre Aktionen, aktive Zustände und gezielte Hervorhebungen;
- keine konkurrierenden Akzentfarben;
- dezente Übergänge von etwa 150–300 ms;
- keine Animation darf Eingabe, Vorschau oder Checkout verzögern;
- mobile Bedienung zuerst;
- sichtbare Zustände für Laden, Fehler, Prüfung und Freigabe;
- Produktvorschau bleibt visuell dominanter als Formular-Chrome.
---

## 13. Dateibasierter Umbauplan

### Phase 0 — Marken- und UI-Baseline sichern

Vor jeder fachlichen Änderung:

1. Screenshots der zentralen Routen in 375, 768 und 1280 px sichern.
2. Design-Tokens automatisiert oder manuell dokumentieren.
3. Logo, Header, Footer, Buttonvarianten, Karten, Formfelder und Abstände als visuelle Referenz festhalten.
4. Prüfen, welche vorhandenen Home- und Collection-Komponenten ohne strukturellen Umbau wiederverwendet werden.
5. Eine kurze Liste erlaubter visueller Änderungen anlegen.
6. Alles andere gilt als `design-preservation` und darf nicht still verändert werden.

Pflichtartefakte:

```text
docs/evidence/cjk-migration/ui-baseline/
docs/evidence/cjk-migration/design-token-baseline.json
docs/plans/cjk-migration-visual-change-budget.md
```

### Phase A — Branch und Inventur

Neuer Branch:

```text
feat/cjk-personalized-poster-shop
```

Vor Änderungen:

- aktuellen Commit von `main` und Feature-Branch feststellen;
- offene Änderungen sichern;
- CI-Baseline ausführen;
- aktuelle Railway-Quelle prüfen;
- Evidence-Ledger um Migrationsentscheidung ergänzen.

### Phase B — FuFirE und Astrologie decommissionen

Löschen oder ersetzen:

```text
server/fufire.js
src/lib/baziClient.ts
src/hooks/useBaziChart.ts
src/hooks/usePlaceResolution.ts
src/lib/personalization.ts
src/pages/TcmOverview.tsx
```

Nach Nutzung prüfen:

```text
src/lib/bazi.ts
src/lib/cities.ts
src/components/shop/PersonalizeInfoSections.tsx
src/designs/westernZodiac.mjs
src/designs/paarHarmonie.mjs
```

Vor `bazi.ts`-Löschung:

- Größen;
- Rahmen;
- gemeinsam genutzte Poster-Typen

in neutrale Dateien verschieben:

```text
src/lib/posterOptions.ts
src/lib/posterTypes.ts
```

Server:

- FuFirE-Imports entfernen;
- `/api/bazi`, `/api/western`, `/api/match`, `/api/geocode` entfernen;
- FuFirE-Env-Variablen aus Railway und Dokumentation entfernen.

### Phase C — Domain-Modell neu aufbauen

Neu:

```text
src/lib/translationTypes.ts
src/lib/posterCatalog.ts
src/lib/posterOptions.ts
src/lib/cjkValidation.ts
src/hooks/useTranslationPreview.ts
server/translation.js
server/translationValidation.js
server/translationStore.js
```

### Phase D — Konfigurator ersetzen

Mobile Umsetzung zuerst:

1. Flow bei 375 px implementieren;
2. Touch- und Tastaturverhalten prüfen;
3. Eingabepersistenz zwischen Schritten sichern;
4. mobile Vorschau und Sticky CTA validieren;
5. erst danach Tablet- und Desktop-Erweiterung bauen;
6. Desktop darf ein Zwei-Spaltenlayout erhalten, verwendet aber dieselbe Zustands- und Validierungslogik.



Umbenennen oder neu erstellen:

```text
src/pages/Personalize.tsx
→ src/pages/PosterConfigurator.tsx
```

Route:

```text
/personalize
```

kann als kanonische URL erhalten bleiben.

### Phase E — Taxonomie, Katalog, Collections

Komplett neu schreiben:

```text
src/lib/taxonomy.ts
src/lib/catalog.ts
src/lib/collections.ts
src/lib/productTypes.ts
```

Alle astrologischen und TCM-bezogenen IDs soft-retiren.

### Phase F — Pricing und Checkout

Anpassen:

```text
server/pricing.js
server/personalizationGate.js
src/lib/checkout.ts
src/store/ShopStore.tsx
src/pages/Checkout.tsx
```

Server prüft:

- gültige Produkt-ID;
- Design-ID;
- Sprache;
- Übersetzungsstatus;
- Textgrenze;
- Größe;
- Rahmen;
- Preis.

### Phase G — Fulfillment

Anpassen:

```text
server/fulfillment.js
server/pdf.js
server/printSpecs.js
server/gelatoProducts.js
```

Neue Reihenfolge:

```text
Stripe bezahlt
→ Order gespeichert
→ translation_status prüfen
→ bei review_required Produktion pausieren
→ Freigabe
→ finale SVG
→ PDF
→ Gelato
```

### Phase H — Inhalte und SEO

Neu schreiben:

- Home;
- About;
- FAQ;
- How It Works;
- Collections;
- Product pages;
- Meta titles;
- structured data;
- newsletter copy;
- legal/privacy provider disclosures.

### Phase I — Aufräumen

- veraltete Dokumente markieren;
- alte Blogartikel entfernen oder archivieren;
- ungenutzte Bilder löschen;
- astrologische Übersetzungsschlüssel entfernen;
- tote Tests löschen;
- neue Tests ergänzen;
- FuFirE-Secrets aus Railway löschen;
- FuFirE-Vertrag kündigen, falls nicht mehr benötigt.

---

## 14. Tests und Evidence-Gates

### Unit

- Unicode-Normalisierung;
- XML-Escaping;
- CJK-Zeichenerkennung;
- Textgrenzen;
- Registry-Metadaten;
- Preisparität;
- Checkout-Gate;
- keine astrologischen Texte im ausgelieferten Frontend.

### Integration

- Translation Preview Route;
- Providerfehler;
- Cache;
- Rate-Limit;
- Warenkorb-Snapshot;
- Bestellung pausiert ohne Freigabe;
- PDF nutzt exakt freigegebenen Text;
- Gelato wird vor Freigabe nicht aufgerufen.

### Mobile-First-Tests

Pflichtbreiten:

- 320 px;
- 375 px;
- 390 px;
- 430 px;
- 768 px;
- 1024 px;
- 1280 px.

Pflichtprüfungen:

- kein horizontaler Scroll;
- keine überdeckten Formfelder;
- keine abgeschnittenen Drawer oder Dialoge;
- vollständige Tastaturbedienung;
- vollständige Touch-Bedienung;
- Fokus folgt dem aktiven Schritt;
- Scrollposition ist nach Schrittwechsel nachvollziehbar;
- mobile Tastatur verdeckt keine kritischen Aktionen;
- Sticky CTA respektiert Safe Areas;
- Live-Vorschau bleibt lesbar;
- lange Namen und Sätze brechen kontrolliert um;
- Sprache und Design lassen sich ohne Datenverlust wechseln;
- Warenkorb und Checkout sind bei 320–375 px vollständig nutzbar.

### Performance-Evidence

Vor Freigabe werden mindestens dokumentiert:

- Initial Bundle-Größe;
- mobile Bildgrößen;
- geladene CJK-Fonts pro Sprache;
- Anzahl der Translation Requests pro Eingabefluss;
- Lade- und Fehlerzustand bei langsamer Verbindung;
- Verhalten bei abgebrochenem Request;
- Verhalten bei erneutem Aufruf des Konfigurators.

### Visual

Für jedes aktive Design:

- vereinfachtes Chinesisch;
- traditionelles Chinesisch;
- Japanisch;
- Koreanisch;
- kurzer Name;
- langer Name;
- kurzer Satz;
- Grenzfall;
- mobile Vorschau;
- PDF mit Beschnitt.

### Real Boundary

Vor Done:

1. echter Übersetzungsanbieter;
2. echter serverseitiger Request;
3. echte Vorschau;
4. echter Stripe-Testcheckout;
5. gespeicherter Übersetzungs-Snapshot;
6. Freigabe;
7. echtes Druck-PDF;
8. Gelato-Draft;
9. visueller Operator-Check.

Mindestevidenz: `real-boundary-smoke`.

---

## 15. Akzeptanzkriterien

1. Im sichtbaren Shop gibt es keine TCM-, BaZi-, Astrologie-, Feuerpferd- oder Analyseangebote.
2. Keine FuFirE-Route und kein FuFirE-Secret ist mehr aktiv.
3. Kunde kann Name, Satz oder eigene CJK-Schrift eingeben.
4. Kunde kann `zh-Hans`, `zh-Hant`, `ja` oder `ko` wählen.
5. Vorschau aktualisiert sich ohne Neuladen.
6. Vorschau und Druck verwenden dieselbe Designfunktion.
7. Browser und PDF verwenden sprachlich passende CJK-Fonts.
8. Kunde kann eine Übersetzungsvariante aktiv auswählen.
9. Bestellung speichert den vollständigen Übersetzungs-Snapshot.
10. Unfreigegebene Übersetzung kann nicht produziert werden.
11. Gelato erhält erst nach Freigabe ein PDF.
12. Kuratierte Poster funktionieren unabhängig vom Übersetzungsservice.
13. Alte astrologische URLs erzeugen keine 404.
14. Build, Lint und Tests sind grün.
15. Testbestellung ist real an Stripe-Testmodus und Gelato-Draft belegt.
16. Produkttexte enthalten keine unbelegten Genauigkeitsgarantien.
17. Die bestehenden Hauptfarben und Typografien sind unverändert.
18. `src/lib/tokens.ts` enthält keine neue konkurrierende Primär- oder Akzentpalette.
19. Logo, Header- und Footer-Grundstruktur bleiben erkennbar erhalten.
20. Die bestehende Inhaltsbreite von 1200 px bleibt bestehen.
21. Navbar und Mega-Menü werden inhaltlich migriert, nicht komplett neu erfunden.
22. Vorher-/Nachher-Screenshots zeigen Marken- und Farbkontinuität.
23. Auf 375, 768 und 1280 px gibt es keinen horizontalen Scroll.
24. Der Konfigurator ist optisch in die bestehende Shop-Sprache integriert und wirkt nicht wie ein eingebettetes Fremdtool.
25. Visuelle Änderungen außerhalb des genehmigten Change Budgets sind dokumentiert und vom Betreiber freigegeben.
26. Der Shop ist bei 320, 375, 390 und 430 px vollständig bedienbar.
27. Keine Kernfunktion hängt von Hover ab.
28. Alle primären Touchziele sind mindestens 44 × 44 CSS-Pixel groß.
29. Formularfelder verwenden mobil mindestens 16 px Schriftgröße.
30. Die Bildschirmtastatur verdeckt keine kritischen Eingaben oder CTAs.
31. Der Konfigurator speichert den Zustand bei jedem Schrittwechsel.
32. Die mobile Vorschau ist erreichbar, ohne den Eingabefluss zu blockieren.
33. Lange CJK-Texte erzeugen keinen horizontalen Scroll.
34. Mobile Navigation, Warenkorb, Freigabe und Checkout sind vollständig funktionsfähig.
35. CJK-Fonts und Design-Thumbnails werden bedarfsgerecht geladen.
36. Desktop erweitert die mobile Kernlogik, verwendet aber keinen getrennten Funktionspfad.
37. Vorher-/Nachher-Screenshots liegen mindestens für 375, 768 und 1280 px vor.
38. Mobile Real-Browser-Evidence liegt für Konfigurator, Warenkorb und Checkout vor.

---

## 15.1 Visuelles Change Budget

Folgende Änderungen sind ohne separates Rebranding erlaubt:

- neue Produktbilder;
- neue Texte;
- neue Formularfelder;
- neue Statusanzeigen;
- angepasste Mega-Menü-Inhalte;
- neue Konfigurator-Anordnung innerhalb des bestehenden Layoutsystems;
- reduzierte oder entfernte Sektionen;
- bessere mobile Abstände;
- barrierefreie Kontraste und Fokuszustände;
- neue CJK-Posterfonts innerhalb der Posterfläche.

Folgende Änderungen benötigen eine ausdrückliche Einzelentscheidung:

- neue Markenfarben;
- neue Shop-Schriftarten;
- neues Logo;
- neue globale Buttonform;
- neue globale Kartenform;
- andere Containerbreite;
- vollständiger Header- oder Footer-Neubau;
- generelles Dark Theme;
- neue Animationssprache;
- grundlegender Wechsel von minimalistisch-editorial zu SaaS-/App-Optik.

### Visuelle Abnahme

Vor Merge:

1. Vorher-/Nachher-Vergleich der Startseite;
2. Vorher-/Nachher-Vergleich des Mega-Menüs;
3. Konfigurator Desktop und Mobil;
4. Produktseite;
5. Warenkorb;
6. Checkout;
7. manuelle Freigabe durch den Betreiber.

Ohne diese Abnahme bleibt der Status `requires-human-acceptance`.

---

## 16. Höchste Risiken

1. **Übersetzungsqualität:** Namen haben häufig keine einzige objektiv richtige Übersetzung.
2. **Schriftlizenz:** schöne Kalligrafie-Fonts sind nicht automatisch kommerziell oder PDF-einbettbar.
3. **Vorschau-/Druckabweichung:** unterschiedliche Fonts oder Layoutengines erzeugen Reklamationen.
4. **Zu lange Texte:** freie Sätze können das Design zerstören; harte Textgrenzen sind nötig.
5. **Automatische Produktion:** ohne Freigabe kann ein falscher Text direkt gedruckt werden.
6. **Altbestand:** astrologische Produkte und SEO-Seiten können trotz Navigation weiter auffindbar bleiben.
7. **Repo-Wahrheit:** Bericht und GitHub-Historie widersprechen sich beim letzten Commit; Ausgangscommit muss vor Mutation fixiert werden.

---

## 17. Empfohlene Reihenfolge

1. Ausgangscommit und Deployment-Branch verifizieren.
2. neuen Migrationsbranch erstellen.
3. Produkt- und Navigationsmodell festschreiben.
4. FuFirE/Astrologie zuerst hinter Feature-Flag abschalten, ohne die bestehende Shop-Hülle zu verändern.
5. CJK-Domain-Typen und Translation-Provider-Adapter bauen.
6. neuen Konfigurator implementieren.
7. erste drei reale Designs integrieren.
8. Checkout und Fulfillment mit Review-Gate umbauen.
9. Shop-Inhalte und Navigation ersetzen.
10. alte Systeme endgültig löschen.
11. End-to-End-Test.
12. Produktionsfreigabe.

---

## 18. Ehrlicher Status

**Erledigt:**

- IST-Bericht analysiert;
- verbundenes GitHub-Repository identifiziert;
- reale Architekturpfade geprüft;
- Zielarchitektur und Migrationsreihenfolge festgelegt;
- Risiken und Evidence-Gates definiert;
- Marken- und Farbkontinuität als harte Migrationsbedingung festgeschrieben;
- visuelles Change Budget und visuelle Akzeptanzkriterien ergänzt;
- Mobile First als verbindliche Entwicklungs-, Performance- und Abnahmebedingung ergänzt.

**Nicht erledigt:**

- keine Repository-Datei verändert;
- kein neuer Branch erstellt;
- keine FuFirE-Verbindung gelöscht;
- kein Übersetzungsanbieter konfiguriert;
- kein Design importiert;
- kein Test ausgeführt;
- keine Railway-Variable geändert;
- keine Produktion geprüft.

**Status:** `plan-complete / implementation-unverified`


---

## 19. Planbewertung V2

| Dimension | Bewertung | Begründung |
|---|---:|---|
| Geschäftsmodell | stark | klare Entfernung des alten Angebots und eindeutiges neues Kernprodukt |
| Architektur | stark | vorhandene Commerce- und Render-Infrastruktur wird weiterverwendet |
| Übersetzungsqualität | stark mit Gate | keine automatische Genauigkeitsgarantie; Freigabe- und Provider-Benchmark vorgesehen |
| Fulfillment | stark | Übersetzungsfreigabe blockiert Produktion |
| Designkontinuität | stark | Farben, Typografie, Shop-Hülle und Change Budget sind explizit geschützt |
| Mobile First | stark | feste mobile Entwicklungsreihenfolge, Touch-, Performance- und Abnahmekriterien definiert |
| Dateipräzision | gut | zentrale Dateien und neue Module sind benannt; endgültige Abhängigkeitsliste entsteht beim Repo-Scan |
| Laufzeitbeweis | offen | noch keine Implementierung, Tests oder Produktionsprüfung |
| Betreiberabhängigkeiten | offen | reale Designs, Schriftlizenzen und sprachliche Reviewer fehlen noch |

**Gesamturteil:** Der Plan ist als Umsetzungsgrundlage stark und gegenüber den vorherigen Versionen deutlich präziser. Er schützt nun ausdrücklich den bestehenden Charakter des Shops. Er ist trotzdem noch kein Ausführungsbeweis; Implementierung, visuelle Abnahme und Real-Boundary-Tests bleiben offen.
