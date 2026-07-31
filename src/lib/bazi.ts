// BaZi chart computation + configurator option data — ported 1:1 from the
// dc-runtime prototype (Shop.dc.html component script). Placeholder logic for
// the prototype; real astrological computation is wired later.
//
// T-B02 CJK-Migration (docs/plans/2026-07-31-cjk-migration.md): Die neutralen
// Poster-Typen und Optionslisten leben jetzt in posterTypes.ts/posterOptions.ts;
// dieses Modul re-exportiert sie, damit ALLE bestehenden Import-Stellen
// unverändert gültig bleiben. Endgültige Löschung dieses Moduls ist ein
// separates Operator-Gate (T-B05 / GATE-BAZI-DELETE im CJK-Ledger).

export type { Pillar, PosterData, ChartResult } from './posterTypes'
export type { FrameOpt, BgOpt, SizeOpt } from './posterOptions'
export { frames, backgrounds, sizes, personalizedSizes } from './posterOptions'

// PLACEHOLDER engine (ADR-002 pt.4, BLK-RED-BAZI / OQ-004 — RED for ACCURACY).
// `place` and `birthTimeUnknown` are accepted as genuine inputs for the PLANNED
// background calculation API so the call sites can thread them through without a
// silent discard (REQ-004 AK-2). They are deliberately NOT used to vary the
// placeholder output: per ADR-002 pt.3 "place varies the placeholder image" is
// out of scope (gegenstandslos — the poster is a placeholder), so the chart stays
// a deterministic placeholder and we never claim it is computed from the location.
// Do NOT build a real astrological engine here.
export function computeChart(
  dateStr?: string,
  timeStr?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _place?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _birthTimeUnknown?: boolean,
): import('./posterTypes').ChartResult {
  const stems = '甲乙丙丁戊己庚辛壬癸'
  const branches = '子丑寅卯辰巳午未申酉戌亥'
  let y = 1990
  let m = 6
  let d = 15
  let h = 12
  if (dateStr) {
    const dt = new Date(dateStr)
    if (!isNaN(dt.getTime())) {
      y = dt.getFullYear()
      m = dt.getMonth() + 1
      d = dt.getDate()
    }
  }
  if (timeStr) {
    const hh = parseInt(timeStr.split(':')[0], 10)
    if (!isNaN(hh)) h = hh
  }
  const total = Math.floor(new Date(y, m - 1, d).getTime() / 86400000)
  const mod = (n: number, k: number) => ((n % k) + k) % k
  const ys = mod(y + 6, 10)
  const yb = mod(y + 8, 12)
  const ms = mod(y * 2 + m, 10)
  const mb = mod(m + 1, 12)
  const ds = mod(total + 4, 10)
  const db = mod(total + 2, 12)
  const hs = mod(ds * 2 + Math.floor(h / 2), 10)
  const hb = mod(Math.floor(((h + 1) % 24) / 2), 12)
  const animals = ['Ratte', 'Büffel', 'Tiger', 'Hase', 'Drache', 'Schlange', 'Pferd', 'Ziege', 'Affe', 'Hahn', 'Hund', 'Schwein']
  const elements = ['Holz', 'Holz', 'Feuer', 'Feuer', 'Erde', 'Erde', 'Metall', 'Metall', 'Wasser', 'Wasser']
  return {
    pillars: [
      { label: '年', stem: stems[ys], branch: branches[yb] },
      { label: '月', stem: stems[ms], branch: branches[mb] },
      { label: '日', stem: stems[ds], branch: branches[db] },
      { label: '時', stem: stems[hs], branch: branches[hb] },
    ],
    animal: animals[yb],
    element: elements[ys],
  }
}

export interface CfgState {
  frameHex: string
  frameName: string
  bgHex: string
  bgName: string
  size: string
  date: string
  time: string
  place: string
  name: string
}

export const defaultCfg: CfgState = {
  frameHex: '#B98A5E',
  frameName: 'Eiche natur',
  bgHex: '#E9DFCB',
  bgName: 'Sandstein',
  size: 'A2',
  date: '',
  time: '',
  place: '',
  name: '',
}
