import type { PosterData, ChartResult } from '../lib/bazi'

export interface PairPosterData {
  frame: string
  bg: string
  nameA: string
  nameB: string
  chartA: ChartResult
  chartB: ChartResult
  relationLabel: string
}

export interface DesignDef {
  id: string
  name: string
  active: boolean
  kind: 'single' | 'pair'
  render: (data: PosterData | PairPosterData, opts: { widthMm: number; heightMm: number }) => string
}

export declare const DESIGNS: DesignDef[]
export declare function getDesign(id: string): DesignDef
