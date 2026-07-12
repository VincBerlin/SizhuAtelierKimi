import type { PosterData } from '../lib/bazi'

export interface DesignDef {
  id: string
  name: string
  active: boolean
  kind: 'single' | 'pair'
  render: (data: PosterData, opts: { widthMm: number; heightMm: number }) => string
}

export declare const DESIGNS: DesignDef[]
export declare function getDesign(id: string): DesignDef
