/**
 * Truthful-Claims content sweep — REQ-005 / REQ-006 / REQ-007 / REQ-018
 * (acceptance-design AT-005-*, AT-006-*, AT-007-2/3, AT-018-5).
 *
 * Boundary note: these are `[UNIT]` string scans, but per the REQ-005/006 Beat-0
 * Gegenthese they MUST run over the *shipped* data structures — the imported
 * `translations` object and the `catalog.ts` exports themselves — not over demo
 * strings. The "boundary" here is that the data the app renders is exactly the
 * data under test (same module instances).
 *
 * RED-line discipline (Reality-Ledger): nothing here asserts the BaZi chart is
 * computed/accurate. `src/lib/bazi.ts` stays a placeholder (RED for ACCURACY).
 * These tests only police the *copy* (honest framing + no health claims) and the
 * legal localization structure — they do NOT certify the artwork.
 */
import { describe, it, expect } from 'vitest'
import { translations, type Lang } from '../../src/i18n/translations'
import { shopFaqs, faqDefs, products, articles } from '../../src/lib/catalog'
import { LEGAL_DOCS, LEGAL_DOCS_BY_LANG, LEGAL_REVIEW_BANNER, type LegalDoc } from '../../src/lib/legal'

const LANGS: Lang[] = ['EN', 'DE', 'FR']

// ── helpers ────────────────────────────────────────────────────────────────

/** Recursively collect every string leaf under an arbitrary value (objects +
 *  arrays). This is how we guarantee the scan covers nested structures like
 *  `path.steps[].desc`, `apiTrust.badges[]`, `faqHome[].a`, etc. */
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

/** First forbidden phrase found in `haystack`, or null. Case-insensitive. */
function firstHit(haystack: string, phrases: string[]): string | null {
  const lower = haystack.toLowerCase()
  for (const p of phrases) {
    if (lower.includes(p.toLowerCase())) return p
  }
  return null
}

/** Scan a list of strings; return [{ phrase, sample }] for every hit. */
function scan(strings: string[], phrases: string[]): { phrase: string; sample: string }[] {
  const hits: { phrase: string; sample: string }[] = []
  for (const s of strings) {
    const hit = firstHit(s, phrases)
    if (hit) hits.push({ phrase: hit, sample: s.slice(0, 120) })
  }
  return hits
}

// ── REQ-005 — precision / API forbidden-phrase list (EN/DE/FR) ──────────────
// These are the exaggerated "exact engine / precision API / we calculate your
// four pillars" claims that the placeholder product cannot back up.
const PRECISION_FORBIDDEN: string[] = [
  // DE
  '100% exakte', '100 % exakte', 'exakte mathematische', 'präzisions-api', 'präzise api',
  'exakt deine vier säulen', 'präzise, konsistent', 'dedizierte api', 'präzisiert die stundensäule',
  // EN
  'precision api', 'exact mathematical', 'we calculate your four pillars', 'your exact four pillars',
  'precise, consistent',
  // FR
  'api de précision', 'calcul mathématique exact', 'nous calculons vos quatre piliers',
  'mathématiquement exact', 'précise, cohérente',

  // ── Iteration-2 Watcher value-risk: the chart is a placeholder (computeChart
  //    ignores its inputs), so copy may NOT claim it is computed/calculated. ──
  // "we calculate your … astrological pillars" (process FAQ, EN/DE/FR)
  'we calculate your', 'berechnen wir deine', 'nous calculons vos',
  'astrological pillars', 'astrologische säulen', 'astrologischen säulen', 'piliers astrologiques',
  // bare chart-claim "calculated/berechnet/calculé from your birth data" (product-1 bullet)
  'calculated from your birth data', 'aus deinen geburtsdaten berechnet',
  'calculé à partir de vos données de naissance',
  // "calculation logic / Berechnungslogik / logique de calcul" (trust badge)
  'calculation logic', 'berechnungslogik', 'logique de calcul', 'calcul dédié',
  // noon-fallback "default calculation time / Berechnungszeit / heure de calcul"
  'default calculation time', 'berechnungszeit', 'heure de calcul',
  // ── Newsletter "Cosmic Pulse" precision over-claim (UWG class) ──
  'celestial precision', 'kosmische präzision', 'précision céleste',
  'exact energetic roadmap', 'genaue energetische roadmap',
  'feuille de route énergétique précise',
]

// ── REQ-006 — health / healing forbidden-phrase list (EN/DE/FR) ─────────────
const HEALING_FORBIDDEN: string[] = [
  // DE
  'heilt', 'heilen', 'lindert', 'lindert krankheit', 'therapiert', 'nachweislich beruhigend',
  // EN
  'cures', 'treats', 'heals', 'clinically proven', 'demonstrably soothing', 'soothing effect',
  // FR
  'guérit', 'guérir', 'soigne', 'traite', 'cliniquement prouvé', 'effet apaisant démontré',
]

// ── REQ-010 / VIS-021 / CAN-014 / CAN-017 / CAN-018 — Celestial-Credits / Vault
//    brand phrases forbidden in EVERY language (EN/DE/FR). The credits/vault
//    affordance was removed from the visible shop; the brand phrases are the same
//    untranslated tokens in all three locales, so a re-introduction in ANY language
//    must turn this guard RED — closing the same language-axis hole as the earlier
//    header leak (which was only caught in EN render). ─────────────────────────
const CREDITS_VAULT_FORBIDDEN: string[] = [
  'celestial credit', // matches "Celestial Credit" and "Celestial Credits" (substring)
  'celestial credits',
  'celestial vault',
]

// ── REQ-005 AT-005-1 — precision/API scan over translations[EN|DE|FR] ───────

describe('REQ-005 / AT-005-1 — no precision/exact-engine/API claims in i18n', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}] contains no forbidden precision/API phrase`, () => {
      const strings = collectStrings(translations[lang])
      const hits = scan(strings, PRECISION_FORBIDDEN)
      expect(
        hits,
        `Forbidden precision/API phrases in translations[${lang}]:\n` +
          hits.map((h) => `  • "${h.phrase}" → ${h.sample}`).join('\n'),
      ).toEqual([])
    })
  }
})

// ── REQ-005 AT-005-1b — newsletter subtree carries no precision over-claim ──
// The recursive scan above (AT-005-1) walks the whole translations object, but
// the "Cosmic Pulse" newsletter copy is a known UWG-risk surface, so we pin it
// explicitly: scan translations[lang].newsletter on its own.

describe('REQ-005 / AT-005-1b — newsletter (Cosmic Pulse) makes no precision claim', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}].newsletter contains no forbidden precision/roadmap phrase`, () => {
      const newsletter = (translations[lang] as Record<string, unknown>).newsletter
      const strings = collectStrings(newsletter)
      const hits = scan(strings, PRECISION_FORBIDDEN)
      expect(
        hits,
        `Forbidden precision phrases in translations[${lang}].newsletter:\n` +
          hits.map((h) => `  • "${h.phrase}" → ${h.sample}`).join('\n'),
      ).toEqual([])
    })
  }
})

// ── REQ-005 — guard: the legal review banner's intentional "[MISSING — …]"
//    documentation text must NOT trip any forbidden-phrase rule. ──

describe('REQ-005 — LEGAL_REVIEW_BANNER documentation text is not a false-positive', () => {
  for (const lang of LANGS) {
    it(`LEGAL_REVIEW_BANNER[${lang}] trips no precision/healing rule`, () => {
      const banner = LEGAL_REVIEW_BANNER[lang]
      expect(firstHit(banner, PRECISION_FORBIDDEN)).toBeNull()
      expect(firstHit(banner, HEALING_FORBIDDEN)).toBeNull()
      // sanity: the intentional placeholder marker is still present
      expect(banner).toMatch(/\[MISSING\b/)
    })
  }
})

// ── REQ-005 AT-005-2 — FAQ coupling: no "calculate/exact" at the placeholder ─

describe('REQ-005 / AT-005-2 — placeholder FAQ copy makes no exact-calculation claim', () => {
  it('catalog shopFaqs[0].a does not claim the four pillars are exactly calculated', () => {
    const a = shopFaqs[0].a
    // The honest framing: inputs are *captured / flow into* the personalization,
    // not "exactly calculated" at the placeholder.
    expect(firstHit(a, PRECISION_FORBIDDEN)).toBeNull()
    expect(a.toLowerCase()).not.toContain('berechnet und gestalterisch')
  })

  it('catalog faqDefs.bazi.a does not over-claim a precise hour-pillar calculation', () => {
    const bazi = faqDefs.find((f) => f.id === 'bazi')
    expect(bazi).toBeTruthy()
    expect(firstHit(bazi!.a, PRECISION_FORBIDDEN)).toBeNull()
  })
})

// ── REQ-005 AT-005-3 — honest symbolic-artwork framing is present ───────────

describe('REQ-005 / AT-005-3 — honest symbolic framing replaces, not just deletes', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}] carries a "symbolic artwork inspired by birth data" framing`, () => {
      const blob = collectStrings(translations[lang]).join(' ').toLowerCase()
      const symbolicMarkers: Record<Lang, string[]> = {
        EN: ['symbolic artwork', 'symbolic'],
        DE: ['symbolisches kunstwerk', 'symbolisch'],
        FR: ['œuvre symbolique', 'symbolique'],
      }
      const found = symbolicMarkers[lang].some((m) => blob.includes(m))
      expect(found, `expected a symbolic-framing phrase in translations[${lang}]`).toBe(true)
    })
  }
})

// ── REQ-006 AT-006-1 — healing-claim scan over all TCM/Wuxing strings ───────
// Source set: translations TCM/Wuxing product strings + catalog product bullets,
// articles bodies, and shopFaqs (the full shipped TCM/Wuxing surface).

function tcmWuxingStrings(): string[] {
  const out: string[] = []
  // catalog: product bullets, article bodies/excerpts, shop FAQs
  for (const p of products) out.push(p.title, ...p.bullets)
  for (const a of articles) out.push(a.title, a.excerpt, ...a.body)
  for (const f of shopFaqs) out.push(f.q, f.a)
  for (const f of faqDefs) out.push(f.q, f.a)
  // translations: the content.products / content.articles / shopFaqs trees per lang
  for (const lang of LANGS) {
    const content = (translations[lang] as Record<string, unknown>).content
    out.push(...collectStrings(content))
    out.push(...collectStrings((translations[lang] as Record<string, unknown>).gifts))
    out.push(...collectStrings((translations[lang] as Record<string, unknown>).pages))
  }
  return out
}

describe('REQ-006 / AT-006-1 — no healing/health claims in TCM/Wuxing content', () => {
  it('all TCM/Wuxing strings are free of healing-verb claims', () => {
    const hits = scan(tcmWuxingStrings(), HEALING_FORBIDDEN)
    expect(
      hits,
      `Forbidden healing claims in TCM/Wuxing content:\n` +
        hits.map((h) => `  • "${h.phrase}" → ${h.sample}`).join('\n'),
    ).toEqual([])
  })
})

// ── REQ-006 AT-006-2 — the borderline "nachweislich beruhigend" is reframed ──

describe('REQ-006 / AT-006-2 — borderline "nachweislich beruhigend" reframed', () => {
  it('catalog article r3 no longer claims a demonstrable calming effect', () => {
    const r3 = articles.find((a) => a.id === 'r3')
    expect(r3).toBeTruthy()
    const blob = r3!.body.join(' ').toLowerCase()
    expect(blob).not.toContain('nachweislich beruhigend')
    // atmospheric framing is allowed (e.g. "wirken ruhig" / "atmosphärisch")
    expect(blob).toMatch(/ruhig|atmosphär/)
  })
})

// ── REQ-007 AT-007-2 — DE/FR legal localized + [MISSING] markers preserved ──

const MISSING_RE = /\[MISSING\b[^\]]*\]/g
function countMissing(doc: LegalDoc): number {
  let n = 0
  for (const s of doc.sections) for (const p of s.body) n += (p.match(MISSING_RE) || []).length
  return n
}
function bodyBlob(doc: LegalDoc): string {
  return doc.sections.flatMap((s) => [s.heading || '', ...s.body]).join('\n')
}

describe('REQ-007 / AT-007-1/2 — legal docs localized in DE/FR, markers preserved', () => {
  it('exposes a per-language legal document map', () => {
    expect(LEGAL_DOCS_BY_LANG).toBeTruthy()
    for (const lang of LANGS) expect(LEGAL_DOCS_BY_LANG[lang]).toBeTruthy()
    // Backward-compat: the flat export remains the EN default.
    expect(LEGAL_DOCS).toBe(LEGAL_DOCS_BY_LANG.EN)
  })

  const keys = ['impressum', 'privacy', 'terms', 'returns', 'shipping']

  it('the EN template as a whole still carries [MISSING] markers (none invented away)', () => {
    const total = keys.reduce((n, k) => n + countMissing(LEGAL_DOCS_BY_LANG.EN[k]), 0)
    expect(total, 'EN legal template must keep operator-data placeholders').toBeGreaterThan(0)
  })

  for (const key of keys) {
    it(`${key}: every language has the same number of [MISSING] markers as EN`, () => {
      // NB: a doc may legitimately have zero markers (e.g. `returns` is all
      // generic safe wording with no operator-specific facts). The contract is
      // that DE/FR preserve EXACTLY the EN marker count — never fewer (invented
      // operator data) and never extra — for each doc, whatever that count is.
      const enCount = countMissing(LEGAL_DOCS_BY_LANG.EN[key])
      for (const lang of LANGS) {
        expect(countMissing(LEGAL_DOCS_BY_LANG[lang][key]), `${lang} ${key} marker count`).toBe(enCount)
      }
    })

    it(`${key}: DE and FR bodies are actually localized (not the English template)`, () => {
      const en = bodyBlob(LEGAL_DOCS_BY_LANG.EN[key])
      const de = bodyBlob(LEGAL_DOCS_BY_LANG.DE[key])
      const fr = bodyBlob(LEGAL_DOCS_BY_LANG.FR[key])
      // Localized bodies must differ from the English template body...
      expect(de).not.toBe(en)
      expect(fr).not.toBe(en)
      // ...and carry language-specific function words so we know real text exists.
      expect(de.toLowerCase()).toMatch(/\b(und|der|die|das|wir|deine?|nicht)\b/)
      expect(fr.toLowerCase()).toMatch(/\b(et|le|la|les|vous|votre|nous|ne)\b/)
    })
  }
})

// ── REQ-007 AT-007-3 — return/withdrawal wording semantically identical ─────

describe('REQ-007 / AT-007-3 — return/withdrawal wording preserved across langs', () => {
  for (const lang of LANGS) {
    it(`${lang}: returns doc keeps the made-to-order / cannot-be-returned guarantee`, () => {
      const blob = bodyBlob(LEGAL_DOCS_BY_LANG[lang].returns).toLowerCase()
      const guarantee: Record<Lang, RegExp> = {
        EN: /made to order|cannot be returned|production has started/,
        DE: /auf bestellung|nicht zurückgegeben|produktionsbeginn/,
        FR: /sur commande|ne peuvent.*retourn|production.*lanc/,
      }
      expect(blob).toMatch(guarantee[lang])
      // statutory-rights carve-out must survive in every language
      const statutory: Record<Lang, RegExp> = {
        EN: /statutory rights/,
        DE: /gesetzlichen rechte/,
        FR: /droits légaux/,
      }
      expect(blob).toMatch(statutory[lang])
    })
  }
})

// ── REQ-007 AT-007-4 — review banner localized for every language ───────────

describe('REQ-007 / AT-007-4 — legal review banner available per language', () => {
  for (const lang of LANGS) {
    it(`${lang}: review banner mentions legal review + pending operator data`, () => {
      const banner = LEGAL_REVIEW_BANNER[lang]
      expect(typeof banner).toBe('string')
      expect(banner.length).toBeGreaterThan(0)
      const expected: Record<Lang, RegExp> = {
        EN: /legal review|MISSING/,
        DE: /rechtsprüfung|MISSING/i,
        FR: /révision juridique|MISSING/i,
      }
      expect(banner).toMatch(expected[lang])
    })
  }
})

// ── REQ-010 — source-level all-language Credits/Vault guard (EN/DE/FR) ───────
// The rendered guard (delta-celestial-credits-removed.test.tsx) proves ABSENCE on
// the shipped surfaces; this is the complementary SOURCE-LEVEL sweep that fails
// the moment a Credits/Vault brand phrase re-enters the data the app renders — in
// ANY language. It scans (a) the whole translations[lang] tree via collectStrings
// and (b) the legal-doc bodies per language (LEGAL_DOCS_BY_LANG[lang]), so a
// re-introduction in EN, DE OR FR is caught at the data boundary, not only in the
// EN render path that the original header leak slipped through.

describe('REQ-010 — no Celestial-Credits/Vault brand phrase in any language (source sweep)', () => {
  for (const lang of LANGS) {
    it(`translations[${lang}] contains no Credits/Vault brand phrase`, () => {
      const strings = collectStrings(translations[lang])
      const hits = scan(strings, CREDITS_VAULT_FORBIDDEN)
      expect(
        hits,
        `Forbidden Credits/Vault phrases in translations[${lang}]:\n` +
          hits.map((h) => `  • "${h.phrase}" → ${h.sample}`).join('\n'),
      ).toEqual([])
    })

    it(`LEGAL_DOCS_BY_LANG[${lang}] bodies contain no Credits/Vault brand phrase`, () => {
      const keys = ['impressum', 'privacy', 'terms', 'returns', 'shipping']
      const strings = keys.flatMap((k) => collectStrings(LEGAL_DOCS_BY_LANG[lang][k]))
      const hits = scan(strings, CREDITS_VAULT_FORBIDDEN)
      expect(
        hits,
        `Forbidden Credits/Vault phrases in LEGAL_DOCS_BY_LANG[${lang}]:\n` +
          hits.map((h) => `  • "${h.phrase}" → ${h.sample}`).join('\n'),
      ).toEqual([])
    })
  }
})

// ── REQ-018 AT-018-5 — noon-fallback disclosure keys exist in all 3 langs ───
// The next coder renders these; here we pin that the i18n keys exist + carry the
// 12:00 disclosure in every language (NFR-6 i18n completeness).

describe('REQ-018 / AT-018-5 — noon-fallback disclosure i18n keys present (EN/DE/FR)', () => {
  const get = (obj: unknown, dotted: string): unknown =>
    dotted.split('.').reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), obj)

  const disclosureKeys = [
    'personalize.unknownTimeHint',
    'personalize.timeUnknown',
    'cart.unknownTimeNotice',
    'cart.confirmLabel',
    'noonFallback.fieldHint',
    'noonFallback.summaryNotice',
  ]

  for (const lang of LANGS) {
    for (const key of disclosureKeys) {
      it(`translations[${lang}].${key} exists and is a non-empty string`, () => {
        const v = get(translations[lang], key)
        expect(typeof v, `${lang}.${key} missing`).toBe('string')
        expect((v as string).length).toBeGreaterThan(0)
      })
    }

    it(`translations[${lang}].noonFallback discloses the 12:00 noon assumption`, () => {
      const hint = get(translations[lang], 'noonFallback.fieldHint') as string
      const summary = get(translations[lang], 'noonFallback.summaryNotice') as string
      // Every language references the noon hour (12:00 / 12 h / midi-12).
      expect(`${hint} ${summary}`).toMatch(/12[:.]?0?0|noon|midi|mittags/i)
    })
  }

  // REQ-018 AK-4 / AT-018-4 — the fallback copy must NOT suggest a precise chart.
  for (const lang of LANGS) {
    it(`translations[${lang}].noonFallback copy makes no precise/exact claim`, () => {
      const blob = [
        get(translations[lang], 'noonFallback.fieldHint'),
        get(translations[lang], 'noonFallback.summaryNotice'),
        get(translations[lang], 'personalize.unknownTimeHint'),
      ]
        .filter((x): x is string => typeof x === 'string')
        .join(' ')
      expect(firstHit(blob, PRECISION_FORBIDDEN)).toBeNull()
    })
  }
})
