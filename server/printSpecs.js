// Druckformate (Endformat) + Beschnitt. Die Shop-Größen (src/lib/bazi.ts
// sizes) mappen 1:1 hierher. BLEED wird in Task 13 gegen die Gelato-
// Dateianforderungen der konkreten productUids verifiziert (Evidence-Ledger)
// und ggf. angepasst — EINE Stelle, keine Streuung.

export const BLEED_MM = 3

export const PRINT_SPECS = {
  // A-Serie bleibt: alte Bestellungen müssen reprintfähig sein (nie löschen).
  A3: { widthMm: 297, heightMm: 420 },
  A2: { widthMm: 420, heightMm: 594 },
  A1: { widthMm: 594, heightMm: 841 },
  // Operator 2026-07-15: neue Formate der personalisierten Poster (vertikal),
  // live-verifiziert gegen den Gelato-Katalog (300x400/500x700/700x1000-mm).
  '30x40': { widthMm: 300, heightMm: 400 },
  '50x70': { widthMm: 500, heightMm: 700 },
  '70x100': { widthMm: 700, heightMm: 1000 },
}

export const MM_TO_PT = 72 / 25.4
