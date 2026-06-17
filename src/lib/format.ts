// Money / number formatting — ported 1:1 from the dc-runtime prototype.
export const euro = (n: number): string => n.toFixed(2).replace('.', ',') + ' €'
export const de = (n: number): string => n.toLocaleString('de-DE')
