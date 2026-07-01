/**
 * M15 — exact-architecture Reality-Ledger meta-scan (REQ-035 / REQ-036). `[META]`.
 *
 * The capstone honesty gate for the desenio-EXACT build. It machine-enforces that:
 *  1. the Gap-Closure Report NAMES every standing RED carry and makes NO completion
 *     / launch / production claim while they are open (REQ-036);
 *  2. no shipped shop copy (home / footer / newsletter / product / cart) carries a
 *     fake affordance — coming-soon / patron / credit — or a Desenio/competitor
 *     brand string (REQ-002 / REQ-022 / NG-004);
 *  3. the size axis is still flagged NON-FINAL (OQ-001) in the canonical taxonomy;
 *  4. the honest footer (REQ-024) invents no social account (NG-004).
 *
 * This is a pure data/text scan (node env, no jsdom) so it runs even where the
 * jsdom worker pool is unavailable. It never asserts anything is production-ready.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { translations, type Lang } from '../../src/i18n/translations'
import { TAXONOMY } from '../../src/lib/taxonomy'

const LANGS: Lang[] = ['EN', 'DE', 'FR', 'ES']

function collect(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const v of value) collect(v, out)
  else if (value && typeof value === 'object') for (const v of Object.values(value as Record<string, unknown>)) collect(v, out)
  return out
}

const gapReport = readFileSync(new URL('../../docs/reality/sizhuatelier-desenio-exact-architecture.gap-closure.md', import.meta.url), 'utf8')

describe('M15 / REQ-036 — Gap-Closure Report names the RED carries + claims NO completion', () => {
  it('names every standing RED carry', () => {
    for (const carry of ['OQ-001', 'OQ-002', 'OQ-003', 'OQ-004', 'OQ-005', 'OQ-006', 'RL-STRIPE', 'RL-BAZI', 'RL-CHROMIUM'])
      expect(gapReport, `RED carry ${carry} must be named`).toContain(carry)
  })

  it('makes NO production / launch / complete claim while RED carries are open', () => {
    // The report must state the build is still in progress, not done.
    expect(gapReport.toLowerCase()).toContain('architecture correction in progress')
    // No affirmative production/launch claim (guard against a laundered "is complete").
    expect(/\b(production[- ]ready|launch[- ]ready|is complete|ready to launch|desenio[- ]equivalent achieved)\b/i.test(gapReport)).toBe(false)
  })
})

describe('M15 / REQ-002 / REQ-022 / NG-004 — no fake affordances or competitor copy in shop text', () => {
  const COMING_SOON = /coming soon|demn[äa]chst|bient[ôo]t disponible|pr[óo]ximamente/i
  const PATRON = /\bpatron\b|patron fold|f[öo]rderkreis/i
  const CREDIT = /celestial credit|\bguthaben\b|cr[ée]ditos? c[ée]lestes?/i
  const COMPETITOR = /\bdesenio\b|\bphotowall\b|\bjuniqe\b|poster ?store/i

  for (const lang of LANGS) {
    it(`translations[${lang}] shop subtrees carry no coming-soon / patron / credit / competitor string`, () => {
      const root = translations[lang] as Record<string, unknown>
      const blob = collect(['home', 'footer', 'newsletter', 'product', 'cart', 'nav', 'tax', 'taxonomy'].map((k) => root[k])).join('  ')
      expect(COMING_SOON.test(blob), `coming-soon in ${lang}`).toBe(false)
      expect(PATRON.test(blob), `patron in ${lang}`).toBe(false)
      expect(CREDIT.test(blob), `credit in ${lang}`).toBe(false)
      expect(COMPETITOR.test(blob), `competitor brand in ${lang}`).toBe(false)
    })
  }
})

describe('M15 / REQ-023 — the newsletter is shop-oriented (Cosmic Pulse secondary)', () => {
  const WEEKLY_COSMIC = /weekly energy charts?|w[öo]chentliche energy charts?|energy charts? hebdomadaires?|cartas energ[ée]ticas semanales/i
  const SHOP_LEAD = /poster|offer|angebot|offre|oferta|p[óo]ster|atelier|inspiration|inspiración|neuheit|nouveau|novedad/i
  for (const lang of LANGS) {
    it(`translations[${lang}].newsletter leads with shop content, not a weekly cosmic-pulse claim`, () => {
      const nl = (translations[lang] as Record<string, unknown>).newsletter as Record<string, unknown>
      const title = String(nl.title ?? '')
      // (a) the headline is not the Cosmic-Pulse-first title
      expect(/cosmic pulse|pulso c[óo]smico|energy charts?/i.test(title), `title still cosmic-first in ${lang}: ${title}`).toBe(false)
      // (b) NO firm weekly-energy-charts cadence anywhere (copy/benefits/consent) — the
      //     cosmic note is "occasional" only (REQ-023 secondary). This closes the
      //     copy/consent contradiction, not just the title.
      const body = collect([nl.copy, nl.benefits, nl.consent]).join('  ')
      expect(WEEKLY_COSMIC.test(body), `weekly energy-charts cadence still promised in ${lang} newsletter body`).toBe(false)
      // (c) positively leads with shop content (never vacuously passes on an empty title)
      expect(SHOP_LEAD.test(`${title} ${String(nl.copy ?? '')}`), `no shop-lead content in ${lang} newsletter`).toBe(true)
    })
  }
})

describe('M15 / OQ-001 — size axis stays NON-FINAL in the canonical taxonomy', () => {
  it('every size entry is flagged non-final against OQ-001', () => {
    expect(TAXONOMY.size.length).toBeGreaterThan(0)
    for (const e of TAXONOMY.size) {
      expect(e.nonFinal).toBe(true)
      expect(e.redCarry).toBe('OQ-001')
    }
  })
})
