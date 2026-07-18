// Typdeklarationen für posterLocale.mjs (geteiltes ESM — Browser + Node).
export function localizeElement(element: string, lang: string | undefined): string
export function localizeAnimal(animal: string, lang: string | undefined): string
export function posterSubtitle(kind: 'single' | 'pair' | 'western', lang: string | undefined): string
export function localizeRelation(
  relation: { wuxingRelation: string | null; elementA: string | null; elementB: string | null } | null | undefined,
  lang: string | undefined,
): string
export function stemElement(stem: string): string
export function zodiacName(index: number, lang: string | undefined): string
export function planetName(key: string, lang: string | undefined): string
