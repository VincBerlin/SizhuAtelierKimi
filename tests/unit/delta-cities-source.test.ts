/**
 * DELTA T-403 — bundled Place-of-Birth source (REQ-013, OQ-003 policy).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md
 *   AT-013-2  typing "Stuttgart" yields the suggestion "Stuttgart, Germany"
 *             (or equiv. "City, Country") FROM the bundled source.
 *   AT-013-3  [SHIPPED-SCAN] Policy-Guard: client code (`src/`) contains NO
 *             per-keystroke fetch/XHR to nominatim.openstreetmap.org — the
 *             autocomplete reads ONLY the bundled cities list.
 *
 * Decision (BLK-OQ003-AUTOCOMPLETE-SOURCE, resolved per FROZEN default): the
 * source is a curated, bundled `src/lib/cities.ts` ("City, Country"). The user
 * has explicitly forbidden public-Nominatim-per-keystroke; this test is the
 * SHIPPED-SCAN that keeps that forbidden path out of `src/`.
 *
 * This is `[SHIPPED-SCAN]` + pure-logic: it runs over the exported bundled list
 * and the actual `src/` source text the app ships — no I/O, no network.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { CITIES, searchCities } from '../../src/lib/cities'

// ── AT-013-2 — bundled lookup: "Stuttgart" → "Stuttgart, Germany" ────────────

describe('REQ-013 / AT-013-2 — bundled cities lookup', () => {
  it('the curated list is non-trivial and uses "City, Country" form', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(20)
    for (const c of CITIES) {
      // every entry is a "City, Country" string with a real separator
      expect(c, `entry "${c}"`).toMatch(/^[^,]+,\s.+$/)
    }
    // no duplicate entries
    expect(new Set(CITIES).size).toBe(CITIES.length)
  })

  it('typing "Stuttgart" yields "Stuttgart, Germany" from the bundled source', () => {
    const hits = searchCities('Stuttgart')
    expect(hits).toContain('Stuttgart, Germany')
  })

  it('matching is case-insensitive and prefix-friendly ("stutt" still finds Stuttgart)', () => {
    expect(searchCities('stutt')).toContain('Stuttgart, Germany')
    expect(searchCities('STUTTGART')).toContain('Stuttgart, Germany')
  })

  it('includes further major cities beyond Stuttgart (curated breadth)', () => {
    // a few representative anchors so the list is genuinely curated, not a stub
    const all = CITIES.join('\n')
    expect(all).toMatch(/Berlin, Germany/)
    expect(all).toMatch(/London, United Kingdom/)
    expect(all).toMatch(/Paris, France/)
    expect(all).toMatch(/Madrid, Spain/)
  })

  it('a no-match query returns an empty list (never throws)', () => {
    expect(searchCities('zzzzzznowhere')).toEqual([])
    expect(searchCities('')).toEqual([])
    expect(searchCities('   ')).toEqual([])
  })

  it('caps the suggestion count so the dropdown stays bounded', () => {
    // a single broad letter must not dump the entire list into the UI
    expect(searchCities('a').length).toBeLessThanOrEqual(8)
  })
})

// ── AT-013-3 — Policy-Guard: NO per-keystroke Nominatim fetch/XHR in src/ ─────

describe('REQ-013 / AT-013-3 / FM-10 — no per-keystroke Nominatim in src/', () => {
  const SRC_DIR = path.resolve(__dirname, '../../src')
  const NOMINATIM_RE = /nominatim\.openstreetmap\.org/i

  function walk(dir: string): string[] {
    const out: string[] = []
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) out.push(...walk(full))
      else if (/\.(ts|tsx|js|jsx)$/.test(entry)) out.push(full)
    }
    return out
  }

  it('no src/ file references nominatim.openstreetmap.org', () => {
    const offenders: string[] = []
    for (const file of walk(SRC_DIR)) {
      if (NOMINATIM_RE.test(readFileSync(file, 'utf8'))) offenders.push(file)
    }
    expect(offenders, `Nominatim referenced in: ${offenders.join(', ')}`).toEqual([])
  })

  it('the bundled source module does not perform any network call', () => {
    const src = readFileSync(path.join(SRC_DIR, 'lib/cities.ts'), 'utf8')
    expect(src).not.toMatch(/\bfetch\s*\(/)
    expect(src).not.toMatch(/XMLHttpRequest/)
    expect(src).not.toMatch(/axios/)
  })
})
