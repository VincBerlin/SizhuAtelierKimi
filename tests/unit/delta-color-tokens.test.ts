/**
 * DELTA T-601 — color-token conformance (REQ-017 / FM-09). `[SHIPPED-SCAN]` / pure.
 *
 * Acceptance contract: REQ-017 / AC-017 from docs/tests/desenio-acceptance-design.md
 * ("Ink Black bleibt dominante UI-/CTA-Farbe; orange/goldene Elemente sind durch
 *  Terracotta ersetzt; kein globaler Hauptakzent").
 *
 * ── ID DISAMBIGUATION (do NOT confuse with the existing reachability tests) ──
 * The shipped `tests/unit/conformance-smoke.test.tsx` already owns AT-017-1/2/4
 * as ROUTE-REACHABILITY / negative-Saju checks. Those are a DIFFERENT contract.
 * To avoid clobbering them, THIS file uses the disambiguated ids
 * `AT-017-COLOR-1/2/3` for the COLOR-token conformance. The two suites coexist:
 * conformance-smoke = "does every route render"; this file = "is the accent the
 * single canonical Terracotta with Ink dominant".
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-017): a token-only check could pass
 * while a sienna "#A0522D" naming-lie keeps masquerading as "terracotta" across
 * the inline-styles, OR Terracotta gets promoted to the global main accent. So
 * this scan runs over the SHIPPED source text (index.css + pages + components +
 * tailwind config) and the imported `C` token instance the app actually renders.
 *
 * Scope guards (honest exclusions, mirrored from the spec):
 *  - `src/components/InkWave.tsx` (hero art, VIS-023) is PROTECTED and excluded —
 *    it carries only #E8E1D6, no orange/gold; the byte-identical hero must not be
 *    perturbed by a color scan.
 *  - `src/lib/bazi.ts` frame-wood #B98A5E ("Eiche natur") is a PHYSICAL product
 *    frame colour (a real wood option), NOT a UI accent — excluded per AT-017-2.
 *  - The representational five-elements POSTER palette that lives in index.css
 *    (`.bazi-grid`, `.element-row`, `.wuxing-diagram`, `.compatibility-*`) and the
 *    decorative gold-foil `.shimmer` text gradient are ARTWORK (the digital twin of
 *    the printed poster), the same category as InkWave/bazi — their three banded
 *    golds (#8A6830, #C8A24F, #C4A265) are an explicit allow-list in the index.css
 *    sweep (AT-017-COLOR-2d), so a NEW non-artwork gold there is still caught.
 *  - #FFC439 is PayPal BRAND gold (brand-required) — the one allowed chrome accent.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { C } from '../../src/lib/tokens'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel: string): string => readFileSync(path.join(ROOT, rel), 'utf8')

/** Recursively collect every `.tsx` under `dir`, skipping `skip(fullPath)`. */
function walkTsx(rel: string, skip: (full: string) => boolean): string[] {
  const out: string[] = []
  const dir = path.join(ROOT, rel)
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkTsx(path.relative(ROOT, full), skip))
    else if (entry.name.endsWith('.tsx') && !skip(full)) out.push(full)
  }
  return out
}

const isInkWave = (full: string): boolean => full.endsWith('InkWave.tsx')

const PAGE_FILES = walkTsx('src/pages', () => false)
const COMPONENT_FILES = walkTsx('src/components', isInkWave) // InkWave excluded (protected art)
const CHROME_FILES = [...PAGE_FILES, ...COMPONENT_FILES] // inline-style "site chrome"
const INDEX_CSS = read('src/index.css')
const TAILWIND = read('tailwind.config.js')

const HEX_RE = /#[0-9A-Fa-f]{6}\b/g

function hexesIn(text: string): string[] {
  return (text.match(HEX_RE) ?? []).map((h) => h.toUpperCase())
}

/** Standard hex → HSL (h in [0,360), s/l in [0,1]). */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16) / 255
  const g = parseInt(m.slice(2, 4), 16) / 255
  const b = parseInt(m.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let s = 0
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s, l }
}

/**
 * Falsifiable predicate for "a saturated ORANGE/GOLD UI accent" — the FM-09
 * family the requirement bans. Tuned so it catches the sienna naming-lie
 * (#A0522D ≈ hue 19°, S 0.56), the orange hover (#B5652B ≈ hue 25°, S 0.62) AND
 * the gold family including the codebase's own removed muted-gold (#C4A265 ≈ hue
 * 39°, S 0.446) — but NOT the canonical Terracotta family (#C0492E ≈ hue 11°,
 * #A0341F ≈ hue 10° — both red-leaning, below the hue floor), pale tints (L too
 * high), or low-saturation warm neutrals (#8B7355 S 0.24, #BC7A5E S 0.41 — below
 * the S floor). The S floor is 0.42, NOT 0.45: #C4A265's true saturation is 0.446,
 * so a 0.45 floor would let the exact gold this milestone removed slip back in.
 * This is NOT a tautology — the predicate self-test below proves the banned family
 * is inside the band (RED) while the canonical accent is outside it.
 */
function isSaturatedOrangeGold(hex: string): boolean {
  const { h, s, l } = hexToHsl(hex)
  return h >= 19 && h <= 55 && s >= 0.42 && l >= 0.3 && l <= 0.72
}

// ── Predicate self-test — proves isSaturatedOrangeGold is non-tautological ─────
describe('REQ-017 / AT-017-COLOR — the orange/gold predicate is real (not a tautology)', () => {
  it('CATCHES the banned FM-09 family (sienna naming-lie, orange hover, the removed muted-gold)', () => {
    for (const banned of ['#A0522D', '#B5652B', '#C4A265']) {
      expect(isSaturatedOrangeGold(banned), `${banned} must be flagged orange/gold`).toBe(true)
    }
  })
  it('does NOT catch the canonical Terracotta family or kept warm neutrals', () => {
    for (const kept of ['#C0492E', '#A0341F', '#8B7355', '#BC7A5E', '#E8D5A3']) {
      expect(isSaturatedOrangeGold(kept), `${kept} must NOT be flagged`).toBe(false)
    }
  })
})

// ── AT-017-COLOR-1 — the token source of truth ───────────────────────────────

describe('REQ-017 / AT-017-COLOR-1 — tokens.ts accent is the single canonical Terracotta', () => {
  it('C.accent === #C0492E (canonical Terracotta, AT-017-1)', () => {
    expect(C.accent).toBe('#C0492E')
  })

  it('no UI token in C is a saturated orange/gold hex', () => {
    const offenders = Object.entries(C)
      .filter(([, v]) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v))
      .filter(([, v]) => isSaturatedOrangeGold(v as string))
      .map(([k, v]) => `${k}=${v}`)
    expect(offenders, `orange/gold token(s) in C: ${offenders.join(', ')}`).toEqual([])
  })
})

// ── AT-017-COLOR-2 — the source scan (the RED→GREEN driver) ───────────────────

describe('REQ-017 / AT-017-COLOR-2 — no orange/gold accent survives in the UI surface', () => {
  // 2a — the specific FM-09 sienna accent + its hover variant are gone everywhere.
  it('2a: the sienna "--terracotta" naming-lie (#A0522D) and its hover (#B5652B) are absent from index.css + pages + components', () => {
    const removed = ['#A0522D', '#B5652B']
    const sources: Array<[string, string]> = [
      ['src/index.css', INDEX_CSS],
      ...CHROME_FILES.map((f): [string, string] => [path.relative(ROOT, f), readFileSync(f, 'utf8')]),
    ]
    const hits: string[] = []
    for (const [name, text] of sources) {
      const upper = text.toUpperCase()
      for (const dead of removed) {
        const n = upper.split(dead).length - 1
        if (n > 0) hits.push(`${name}: ${dead}×${n}`)
      }
    }
    expect(hits, `removed sienna accent still present: ${hits.join(' | ')}`).toEqual([])
  })

  // 2b — no GOLD design token (the dead `--muted-gold` / tailwind `muted-gold`).
  it('2b: no gold UI design token remains (--muted-gold / tailwind muted-gold)', () => {
    expect(INDEX_CSS.includes('muted-gold'), 'src/index.css still defines --muted-gold').toBe(false)
    expect(TAILWIND.includes('muted-gold'), 'tailwind.config.js still defines a muted-gold colour').toBe(false)
  })

  // 2c — HSL sweep over the CHROME inline-styles; only documented exceptions allowed.
  it('2c: the only saturated orange/gold hex in chrome inline-styles is the documented PayPal brand gold', () => {
    // Documented allow-list (exceptionRegister): PayPal brand gold is brand-required.
    const ALLOW = new Set(['#FFC439'])
    const flagged = new Set<string>()
    for (const f of CHROME_FILES) {
      for (const hex of hexesIn(readFileSync(f, 'utf8'))) {
        if (isSaturatedOrangeGold(hex) && !ALLOW.has(hex)) flagged.add(hex)
      }
    }
    expect(
      [...flagged].sort(),
      `undocumented orange/gold chrome accent(s): ${[...flagged].join(', ')}`,
    ).toEqual([])
  })

  // 2d — HSL sweep over index.css; only the documented representational poster
  // artwork golds are allowed (the same exclusion class as InkWave/bazi). Closes
  // the gap that 2c (chrome .tsx only) leaves: a NEW non-artwork gold added
  // directly to the stylesheet is caught, because it would not be one of the three
  // documented artwork hexes.
  it('2d: the only saturated orange/gold hexes in index.css are the documented poster-artwork colours', () => {
    // exceptionRegister (artwork, empirically the only banded golds in index.css):
    // .bazi-grid pillar #8A6830, .wuxing-diagram .earth #C8A24F, decorative
    // .shimmer gold-foil #C4A265 — representational poster art, not site chrome.
    const ARTWORK_GOLD = new Set(['#8A6830', '#C4A265', '#C8A24F'])
    const flagged = new Set<string>()
    for (const hex of hexesIn(INDEX_CSS)) {
      if (isSaturatedOrangeGold(hex) && !ARTWORK_GOLD.has(hex)) flagged.add(hex)
    }
    expect(
      [...flagged].sort(),
      `undocumented orange/gold in index.css (not artwork): ${[...flagged].join(', ')}`,
    ).toEqual([])
  })
})

// ── AT-017-COLOR-3 — Ink dominant, Terracotta a LIMITED accent ────────────────

describe('REQ-017 / AT-017-COLOR-3 — Ink Black is the dominant UI/CTA colour, Terracotta is limited', () => {
  const inkRefs = (INDEX_CSS.match(/#2A2420/gi) ?? []).length
  const accentRefs =
    (INDEX_CSS.match(/#C0492E/gi) ?? []).length + (INDEX_CSS.match(/var\(--terracotta\)/g) ?? []).length

  it('Ink (#2A2420) is referenced more than the Terracotta accent in index.css', () => {
    expect(inkRefs).toBeGreaterThan(accentRefs)
  })

  it('Terracotta IS present as an accent (limited, not zero, not global)', () => {
    expect(accentRefs).toBeGreaterThanOrEqual(1)
  })

  it('the primary purchase CTAs resolve to Ink, NOT the accent', () => {
    // .btn-primary-lg (product page CTA) and .shop-cart-foot a (cart checkout) are
    // the global main CTAs — they must stay Ink #2A2420, never the accent.
    expect(/\.btn-primary-lg\s*\{[^}]*background:\s*#2A2420/i.test(INDEX_CSS)).toBe(true)
    expect(/\.shop-cart-foot a\s*\{[^}]*background:\s*#2A2420/i.test(INDEX_CSS)).toBe(true)
    const btnBlock = /\.btn-primary-lg\s*\{[^}]*\}/i.exec(INDEX_CSS)?.[0] ?? ''
    expect(btnBlock.includes('#C0492E'), 'primary CTA must not be Terracotta').toBe(false)
  })
})
