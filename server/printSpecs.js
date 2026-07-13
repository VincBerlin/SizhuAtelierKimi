// Druckformate (Endformat) + Beschnitt. Die Shop-Größen (src/lib/bazi.ts
// sizes) mappen 1:1 hierher. BLEED wird in Task 13 gegen die Gelato-
// Dateianforderungen der konkreten productUids verifiziert (Evidence-Ledger)
// und ggf. angepasst — EINE Stelle, keine Streuung.

export const BLEED_MM = 3

export const PRINT_SPECS = {
  A3: { widthMm: 297, heightMm: 420 },
  A2: { widthMm: 420, heightMm: 594 },
  A1: { widthMm: 594, heightMm: 841 },
}

export const MM_TO_PT = 72 / 25.4
