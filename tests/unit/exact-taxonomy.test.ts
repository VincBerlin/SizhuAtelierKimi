// M9 gate test — machine-enforces the canonical taxonomy (src/lib/taxonomy.ts)
// against the honesty rules of the Desenio-exact package:
//   - completeness: all six mandatory axes present (REQ-006);
//   - STOP-001: size axis is EXACTLY the real bazi.ts sizes and all non-final —
//     no invented formats can be smuggled in;
//   - no dead links: every collection/world/designFamily/useCase/route/size link
//     grounds on real catalog/collection data (REQ-035 no-dead-link intent);
//   - no invented campaigns (guards the specific "TCM Organ Clock" fabrication);
//   - primary nav is exactly the 8 shop items with no FAQ/About/Contact/Blog
//     (REQ-005);
//   - visual tiles are asset-light non-final placeholders (REQ-013 / OQ-002).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  TAXONOMY,
  TAXONOMY_AXES,
  PRIMARY_NAV,
  FORBIDDEN_PRIMARY_NAV,
  QUICK_ACCESS,
  MEGA_TILES,
  resolveTaxonomyHref,
  worldToSlug,
  type TaxonomyEntry,
} from '../../src/lib/taxonomy'
import { PRODUCT_WORLDS, DESIGN_FAMILIES, products } from '../../src/lib/catalog'
import { COLLECTION_SLUGS } from '../../src/lib/collections'
import { sizes } from '../../src/lib/bazi'

const allEntries: TaxonomyEntry[] = TAXONOMY_AXES.flatMap((a) => [...TAXONOMY[a]])
const realUseCases = new Set(products.map((p) => p.use_case))
const KNOWN_ROUTES = new Set(['/collections', '/offers', '/inspiration', '/personalize'])

describe('M9 · canonical taxonomy completeness (REQ-006)', () => {
  it('defines all six mandatory axes, each with at least one entry', () => {
    expect(TAXONOMY_AXES).toEqual(['world', 'style', 'room', 'size', 'set', 'campaign'])
    for (const axis of TAXONOMY_AXES) {
      expect(TAXONOMY[axis].length, `axis ${axis} must be non-empty`).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty id, labelKey and label', () => {
    for (const e of allEntries) {
      expect(e.id.length, `id for ${JSON.stringify(e)}`).toBeGreaterThan(0)
      expect(e.labelKey.length, `labelKey for ${e.id}`).toBeGreaterThan(0)
      expect(e.label.trim().length, `label for ${e.id}`).toBeGreaterThan(0)
    }
  })

  it('every nonFinal entry names a RED-carry (OQ-*)', () => {
    for (const e of allEntries) {
      if (e.nonFinal) expect(e.redCarry, `redCarry for ${e.id}`).toMatch(/^OQ-\d+/)
    }
  })
})

describe('M9 · STOP-001 no fake sizes', () => {
  it('the size axis is EXACTLY the real bazi.ts sizes, in order', () => {
    expect(TAXONOMY.size.map((e) => e.id)).toEqual(sizes.map((s) => s.id))
  })

  it('is exactly the three real A3/A2/A1 formats (literal pin — catches a fake size added upstream)', () => {
    expect(TAXONOMY.size.map((e) => e.id)).toEqual(['A3', 'A2', 'A1'])
    expect(sizes.map((s) => s.id)).toEqual(['A3', 'A2', 'A1'])
  })

  it('every size entry is flagged non-final against OQ-001', () => {
    for (const e of TAXONOMY.size) {
      expect(e.nonFinal, `size ${e.id} must be non-final`).toBe(true)
      expect(e.redCarry).toBe('OQ-001')
      expect(e.link.kind).toBe('size')
    }
  })
})

describe('M9 · no dead links (every entry grounds on real data)', () => {
  it('collection links resolve to a real COLLECTION_SLUG', () => {
    for (const e of allEntries) {
      if (e.link.kind === 'collection') {
        expect(COLLECTION_SLUGS as readonly string[], `entry ${e.id}`).toContain(e.link.slug)
      }
    }
  })

  it('world links are real PRODUCT_WORLDS', () => {
    for (const e of allEntries) {
      if (e.link.kind === 'world') {
        expect(PRODUCT_WORLDS as readonly string[]).toContain(e.link.world)
      }
    }
  })

  it('designFamily links are real DESIGN_FAMILIES', () => {
    for (const e of allEntries) {
      if (e.link.kind === 'designFamily') {
        expect(DESIGN_FAMILIES as readonly string[]).toContain(e.link.family)
      }
    }
  })

  it('useCase links are carried by at least one real product', () => {
    for (const e of allEntries) {
      if (e.link.kind === 'useCase') {
        expect(realUseCases, `useCase ${e.link.useCase} (entry ${e.id})`).toContain(e.link.useCase)
      }
    }
  })

  it('route links point at a live, known route', () => {
    for (const e of allEntries) {
      if (e.link.kind === 'route') {
        expect(e.link.path.startsWith('/')).toBe(true)
        expect(KNOWN_ROUTES, `route ${e.link.path} (entry ${e.id})`).toContain(e.link.path)
      }
    }
  })

  it('resolveTaxonomyHref always yields a non-empty path starting with "/"', () => {
    for (const e of allEntries) {
      const href = resolveTaxonomyHref(e.link)
      expect(href.length, `href for ${e.id}`).toBeGreaterThan(0)
      expect(href.startsWith('/'), `href for ${e.id} = ${href}`).toBe(true)
    }
  })

  it('KNOWN_ROUTES are really declared in App.tsx (not a self-referential allowlist)', () => {
    // process.cwd() statt import.meta.url: im jsdom-Environment von Vitest 4 ist
    // import.meta.url keine file://-URL mehr (readFileSync verweigert http-Schema).
    const app = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8')
    for (const r of KNOWN_ROUTES) {
      expect(app, `route ${r} must be a real <Route path> in App.tsx`).toContain(`path="${r}"`)
    }
  })

  it('worldToSlug maps single-world values to real slugs and mixed to null', () => {
    expect(worldToSlug('bazi')).toBe('bazi-posters')
    expect(worldToSlug('tcm')).toBe('tcm-posters')
    expect(worldToSlug('wuxing')).toBe('wuxing-posters')
    expect(worldToSlug('mixed')).toBeNull()
  })
})

describe('M9 · no invented campaigns (REQ-012 / no-fabrication)', () => {
  it('every campaign resolves to a real collection or a known route', () => {
    for (const e of TAXONOMY.campaign) {
      if (e.link.kind === 'collection') {
        expect(COLLECTION_SLUGS as readonly string[]).toContain(e.link.slug)
      } else if (e.link.kind === 'route') {
        expect(KNOWN_ROUTES).toContain(e.link.path)
      } else {
        throw new Error(`campaign ${e.id} must link to a collection or route, got ${e.link.kind}`)
      }
    }
  })

  it('organ-clock/meridian guard: any such entry MUST be non-final (OQ-006) and really linked — never faked launch-final (REQ-010/012 deferred, not claimed satisfied)', () => {
    for (const e of allEntries) {
      if (/organ|meridian/i.test(`${e.id} ${e.label}`)) {
        expect(e.nonFinal, `${e.id} must be non-final`).toBe(true)
        expect(e.redCarry).toBe('OQ-006')
        expect(['collection', 'route']).toContain(e.link.kind)
      }
    }
  })
})

describe('M9 · primary nav (REQ-005)', () => {
  it('is exactly the eight canonical shop items in order', () => {
    expect(PRIMARY_NAV.map((n) => n.id)).toEqual([
      'bestseller', 'new', 'posters', 'tcm', 'wuxing', 'offers', 'poster-sets', 'inspiration',
    ])
  })

  it('every primary-nav href is a live route', () => {
    for (const n of PRIMARY_NAV) {
      expect(n.href.startsWith('/')).toBe(true)
      if (n.href.startsWith('/collections/')) {
        expect(COLLECTION_SLUGS as readonly string[], `href ${n.href}`).toContain(n.href.replace('/collections/', ''))
      } else {
        expect(KNOWN_ROUTES, `href ${n.href}`).toContain(n.href)
      }
    }
  })

  it('contains no forbidden FAQ/About/Contact/Blog destination', () => {
    const hrefs = PRIMARY_NAV.map((n) => n.href)
    for (const bad of FORBIDDEN_PRIMARY_NAV) {
      expect(hrefs).not.toContain(bad)
    }
  })

  it('quick-access shortcuts are all live routes', () => {
    for (const q of QUICK_ACCESS) {
      expect(q.href.startsWith('/')).toBe(true)
      if (q.href.startsWith('/collections/')) {
        expect(COLLECTION_SLUGS as readonly string[]).toContain(q.href.replace('/collections/', ''))
      } else {
        expect(KNOWN_ROUTES).toContain(q.href)
      }
    }
  })
})

describe('M9 · mega tiles are asset-light non-final placeholders (REQ-013)', () => {
  it('each tile has title/label/cta text and a real collection link', () => {
    expect(MEGA_TILES.length).toBeGreaterThan(0)
    for (const t of MEGA_TILES) {
      expect(t.title.trim().length).toBeGreaterThan(0)
      expect(t.label.trim().length).toBeGreaterThan(0)
      expect(t.cta.trim().length).toBeGreaterThan(0)
      expect(t.link.kind).toBe('collection')
      if (t.link.kind === 'collection') {
        expect(COLLECTION_SLUGS as readonly string[]).toContain(t.link.slug)
      }
    }
  })

  it('carries only a placeholder image and stays non-final (no real webp asset)', () => {
    for (const t of MEGA_TILES) {
      expect(t.image).toEqual({ placeholder: true })
      expect(t.nonFinal).toBe(true)
      expect(t.redCarry).toBe('OQ-002')
      // guard: no real image path leaked into the tile
      expect(JSON.stringify(t)).not.toMatch(/\.webp|\.png|\.jpg/i)
    }
  })
})

describe('M9 · no Desenio / competitor brand content (NG-001)', () => {
  const DENYLIST = ['desenio', 'photowall', 'juniqe', 'poster store', 'posterstore']
  it('no taxonomy label, mega tile or nav item contains a competitor brand string', () => {
    const blobs = [
      ...allEntries.map((e) => e.label),
      ...MEGA_TILES.flatMap((t) => [t.title, t.label, t.cta]),
      ...PRIMARY_NAV.map((n) => n.label),
    ].map((s) => s.toLowerCase())
    for (const blob of blobs) {
      for (const bad of DENYLIST) {
        expect(blob, `"${blob}" must not contain "${bad}"`).not.toContain(bad)
      }
    }
  })
})
