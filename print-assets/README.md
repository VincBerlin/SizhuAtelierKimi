# print-assets/ — Druckdateien der Katalog-Poster (Operator-Ablage)

Hier liegen die druckfertigen PDFs der **nicht-personalisierten** Katalog-Poster
(Feuerpferd, TCM, Wuxing). Ohne registrierte Datei scheitert eine Bestellung
dieses Posters **laut** (`fulfillment_status='failed'`) — es wird nie eine
falsche oder skalierte Datei gedruckt.

## Namenskonvention

```
poster-<katalog-id>-<format>.pdf
```

Beispiele: `poster-7-50x70.pdf`, `poster-11-30x40.pdf`, `poster-8-70x100.pdf`

**Pro Format eine eigene Datei** — die drei Formate haben unterschiedliche
Seitenverhältnisse (3:4 / 5:7 / 7:10); eine Datei kann nie alle bedienen.
Der Dateiname selbst erreicht Gelato nicht (Gelato lädt die Datei über eine
URL unseres Servers) — entscheidend für die Übernahme sind die **Maße**.

## Pflicht-Maße (Endformat + 3 mm Beschnitt umlaufend, Hochformat)

| Format  | Endformat (mm) | PDF-Seitengröße inkl. Beschnitt (mm) |
|---------|----------------|--------------------------------------|
| 30x40   | 300 × 400      | **306 × 406**                        |
| 50x70   | 500 × 700      | **506 × 706**                        |
| 70x100  | 700 × 1000     | **706 × 1006**                       |

Quelle: `server/printSpecs.js` (`PRINT_SPECS` + `BLEED_MM = 3`) — bei
Abweichungen gilt die Code-Tabelle. Farben CMYK-tauglich, Schriften eingebettet.

## Registrierung (zwei Schritte)

1. Datei in diesen Ordner legen.
2. In `server/printAssets.js` unter `PRINT_ASSETS` eintragen, z. B.:

```js
export const PRINT_ASSETS = {
  'poster:11|30x40': 'poster-11-30x40.pdf',
  'poster:11|50x70': 'poster-11-50x70.pdf',
  'poster:11|70x100': 'poster-11-70x100.pdf',
}
```

Erst mit dem Eintrag ist das Poster in dem Format produzierbar — die Registry
startet bewusst leer (gleiche Ehrlichkeits-Regel wie die Gelato-UIDs in
`server/gelatoProducts.js`: nie raten).

## Bereits bestellte, gescheiterte Bestellungen nachholen

Nach dem Registrieren + Deploy:

```
POST /api/fulfillment/retry/<stripe-session-id>
Header: x-retry-secret: <FULFILLMENT_RETRY_SECRET>
```

Idempotent — bereits gedruckte/übertragene Teile werden nie doppelt produziert.
