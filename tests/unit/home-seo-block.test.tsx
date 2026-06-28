/**
 * Homepage SEO text block (module 12) — REQ-012 (AT-012-1/2/3).
 * `[REAL-BOUNDARY]` (jsdom render through src/App.tsx) + `[UNIT]` (claim scan).
 *
 * Beat-0 Gegenthese: a SEO block exists but (a) it is not wired into the rendered
 * Home, or (b) it carries a REQ-005/006-forbidden claim (precision/API or
 * healing) — keyword-stuffed or over-claiming. These tests assert the block
 * RENDERS in module 12 with an H2 structure + internal links to real collection
 * routes and knowledge, AND that its shipped copy (DOM text + the i18n subtree)
 * trips no forbidden phrase.
 *
 * RED-line discipline: this polices structure + copy only. It does NOT certify
 * the artwork or claim a computed chart (bazi.ts stays a placeholder, RED).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { translations, type Lang } from '../../src/i18n/translations'

const LANGS: Lang[] = ['EN', 'DE', 'FR']

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

async function findSeoBlock() {
  // The SEO block lives in module 12; wait for the lazy Home chunk to resolve.
  await screen.findByTestId('home-module-12', undefined, { timeout: 15000 })
  return screen.getByTestId('home-module-12')
}

beforeEach(() => {
  localStorage.clear()
})

// ── helpers (mirrors truthful-claims.test.ts) ───────────────────────────────

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out)
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, out)
  }
  return out
}

function firstHit(haystack: string, phrases: string[]): string | null {
  const lower = haystack.toLowerCase()
  for (const p of phrases) if (lower.includes(p.toLowerCase())) return p
  return null
}

// The same precision/API + healing forbidden phrases that the global truthful
// scan polices — the SEO block must obey them too (REQ-012 AK-3).
const PRECISION_FORBIDDEN: string[] = [
  '100% exakte', '100 % exakte', 'exakte mathematische', 'präzisions-api', 'präzise api',
  'exakt deine vier säulen', 'präzise, konsistent', 'dedizierte api',
  'precision api', 'exact mathematical', 'we calculate your four pillars', 'your exact four pillars',
  'precise, consistent', 'api de précision', 'calcul mathématique exact',
  'nous calculons vos quatre piliers', 'mathématiquement exact',
  'we calculate your', 'berechnen wir deine', 'nous calculons vos',
  'calculated from your birth data', 'aus deinen geburtsdaten berechnet',
  'calculé à partir de vos données de naissance',
]
const HEALING_FORBIDDEN: string[] = [
  'heilt', 'heilen', 'lindert', 'therapiert', 'nachweislich beruhigend',
  'cures', 'treats', 'heals', 'clinically proven', 'demonstrably soothing',
  'guérit', 'guérir', 'soigne', 'traite', 'cliniquement prouvé',
]

// ── AT-012-1 — module 12 renders with H2 structure + internal links ─────────

describe('REQ-012 / AT-012-1 — SEO block renders with H2 structure + internal links', () => {
  it('module 12 renders an SEO text block with ≥2 H2 sub-headings', async () => {
    renderHome()
    const seo = await findSeoBlock()
    // The module-12 anchor can exist a commit before its inner H2 structure has
    // finished painting under load, so re-read the H2s inside `waitFor`. The
    // assertion is unchanged — ≥2 non-empty H2s still have to be present.
    await waitFor(() => {
      const h2s = seo.querySelectorAll('h2')
      // The SEO block is a multi-topic structure (BaZi / TCM / Wuxing …) — not a
      // single paragraph. Require at least two H2 sub-headings.
      expect(h2s.length).toBeGreaterThanOrEqual(2)
      for (const h of Array.from(h2s)) {
        expect((h.textContent ?? '').trim().length).toBeGreaterThan(0)
      }
    })
  })

  it('module 12 links to real collection routes (REQ-010)', async () => {
    renderHome()
    const seo = await findSeoBlock()
    // Re-read the links inside `waitFor`: the anchor can be present while its
    // child links are still painting a commit later under CPU contention.
    await waitFor(() => {
      const hrefs = within(seo)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      // links into the per-world collections the SEO copy describes
      expect(hrefs).toContain('/collections/bazi-posters')
      expect(hrefs).toContain('/collections/tcm-posters')
      expect(hrefs).toContain('/collections/wuxing-posters')
    })
  })

  it('module 12 links to knowledge/journal content too (internal linking)', async () => {
    renderHome()
    const seo = await findSeoBlock()
    await waitFor(() => {
      const hrefs = within(seo)
        .getAllByRole('link')
        .map((a) => a.getAttribute('href') ?? '')
      // at least one knowledge/journal internal link (the blog / knowledge hub)
      expect(hrefs.some((h) => h.startsWith('/blog'))).toBe(true)
    })
  })
})

// ── AT-012-2 — truthful-coupling: no forbidden claim in the SEO copy ────────

describe('REQ-012 / AT-012-2 — SEO copy carries no forbidden precision/healing claim', () => {
  it('the rendered SEO block text trips no precision/API or healing phrase', async () => {
    renderHome()
    const seo = await findSeoBlock()
    const text = seo.textContent ?? ''
    expect(firstHit(text, PRECISION_FORBIDDEN), `precision claim in SEO block: ${text.slice(0, 160)}`).toBeNull()
    expect(firstHit(text, HEALING_FORBIDDEN), `healing claim in SEO block: ${text.slice(0, 160)}`).toBeNull()
  })

  for (const lang of LANGS) {
    it(`translations[${lang}].home.seo copy trips no forbidden phrase`, () => {
      const seo = (translations[lang].home as Record<string, unknown> | undefined)?.seo
      const strings = collectStrings(seo)
      // the subtree must exist and carry copy in every language
      expect(strings.length, `home.seo missing in ${lang}`).toBeGreaterThan(0)
      const blob = strings.join(' ')
      expect(firstHit(blob, PRECISION_FORBIDDEN)).toBeNull()
      expect(firstHit(blob, HEALING_FORBIDDEN)).toBeNull()
    })
  }
})

// ── AT-012-3 — keyword work is a marked content TODO (OQ-007), not invented ──

describe('REQ-012 / AT-012-3 — final keywords flagged as a content TODO (OQ-007)', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}].home.seo marks the keyword TODO (OQ-007)`, () => {
      const seo = (translations[lang].home as Record<string, unknown> | undefined)?.seo as
        | Record<string, unknown>
        | undefined
      expect(seo, `home.seo missing in ${lang}`).toBeTruthy()
      // a dedicated, machine-checkable TODO marker — honest "structure correct,
      // final keyword set not yet locked" (no invented final keyword claim).
      const todo = seo?.keywordTodo
      expect(typeof todo, `home.seo.keywordTodo missing in ${lang}`).toBe('string')
      expect(String(todo)).toMatch(/OQ-007/)
    })
  }
})
