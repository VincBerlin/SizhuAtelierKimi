// Gelato-Produkt-Mapping — die 6 Kombinationen (3 Formate × 2 Rahmen).
//
// EHRLICHKEITS-REGEL (Evidence-Ledger RL-GELATO): Die productUids werden NIE
// geraten. Diese Tabelle startet LEER und wird ausschließlich mit UIDs
// befüllt, die scripts/evidence/gelato-catalog-verify.mjs mit echtem
// GELATO_API_KEY aus dem Katalog verifiziert hat ([REAL-BOUNDARY-LIVE]).
// Bis dahin wirft productUidFor — eine Bestellung mit unverifiziertem
// Mapping ist ein lauter Fehler, nie ein stiller Falschdruck.
//
// Rahmen-Namen = exakt src/lib/bazi.ts frames[].name.

export class GelatoMappingUnverifiedError extends Error {
  constructor(key) {
    super(`gelato productUid mapping not verified for: ${key} — run scripts/evidence/gelato-catalog-verify.mjs`)
    this.name = 'GelatoMappingUnverifiedError'
  }
}

// [REAL-BOUNDARY-LIVE] 2026-07-13: alle 6 UIDs stammen aus der gefilterten
// Katalog-Suche gegen den LIVE-Gelato-Katalog `framed-posters`
// (products:search mit attributeFilters FrameSize a3|a2|a1 × FrameColor
// black|natural-wood × Orientation ver) — nichts geraten. Artefakt:
// docs/evidence/fufire-gelato/2026-07-13-gelato-uid-mapping.json; Repro:
// GELATO_API_KEY=… node scripts/evidence/gelato-catalog-verify.mjs
//
// Gewählte Konstanten (Operator-review-bar, im Ledger dokumentiert):
//   Papier `250-gsm-uncoated-offwhite-archival` — entspricht wörtlich der
//   Shop-Zusage „Feinkörniger Naturpapier-Druck, säurefrei & lichtecht";
//   Rahmen Holz 12×22 mm, Plexiglas, Hochformat (ver).
//   „Eiche natur" → frc_natural-wood · „Schwarz matt" → frc_black.
const PAPER = '250-gsm-uncoated-offwhite-archival'
const uid = (size, color, paper = PAPER) =>
  `frame_and_poster_product_frs_${size}_frc_${color}_frm_wood_frp_w12xt22-mm_gt_plexiglass__pf_${size}_pt_${paper}_cl_4-0_ct_none_prt_none_ver`

// Operator 2026-07-15: personalisierte Poster wechseln auf 30x40 / 50x70 /
// 70x100 cm (vertikal). LIVE-FUND der Katalog-Discovery: das archival-Papier
// der A-Serie EXISTIERT für die cm-Formate nicht — verfügbar sind 170/200-gsm
// (un)coated. Gewählt: `200-gsm-uncoated` (schwerstes Naturpapier, ungestrichen
// — nächstes Äquivalent zur Shop-Zusage). Papier-Claims siehe RL-PAPER-CLAIM.
// Die A-Serie-Keys BLEIBEN (alte Bestellungen reprintfähig).
const PAPER_CM = '200-gsm-uncoated'

export const PRODUCT_UIDS = {
  'A3|Schwarz matt': uid('a3', 'black'),
  'A3|Eiche natur': uid('a3', 'natural-wood'),
  'A2|Schwarz matt': uid('a2', 'black'),
  'A2|Eiche natur': uid('a2', 'natural-wood'),
  'A1|Schwarz matt': uid('a1', 'black'),
  'A1|Eiche natur': uid('a1', 'natural-wood'),
  '30x40|Schwarz matt': uid('300x400-mm', 'black', PAPER_CM),
  '30x40|Eiche natur': uid('300x400-mm', 'natural-wood', PAPER_CM),
  '50x70|Schwarz matt': uid('500x700-mm', 'black', PAPER_CM),
  '50x70|Eiche natur': uid('500x700-mm', 'natural-wood', PAPER_CM),
  '70x100|Schwarz matt': uid('700x1000-mm', 'black', PAPER_CM),
  '70x100|Eiche natur': uid('700x1000-mm', 'natural-wood', PAPER_CM),
}

export function productUidFor({ sizeId, frameName }) {
  const key = `${sizeId}|${frameName}`
  const uid = PRODUCT_UIDS[key]
  if (!uid) throw new GelatoMappingUnverifiedError(key)
  return uid
}
