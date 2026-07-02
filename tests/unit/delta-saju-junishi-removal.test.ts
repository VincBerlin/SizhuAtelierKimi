/**
 * DELTA T-101 — Saju/Junishi removal (REQ-005). `[SHIPPED-SCAN]` / pure.
 *
 * Acceptance contracts: AT-005-1, AT-005-2, AT-005-4 from
 * docs/tests/desenio-acceptance-design.md.
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-005): a scan over demo strings could
 * pass while the SHIPPED data still ships Saju/Junishi. So the scan runs over the
 * exact imported module instances the app renders — `translations[*]`,
 * `catalog.ts` exports, `collections.ts` (COLLECTION_CONFIGS / COLLECTION_SLUGS)
 * and `legal.ts` (LEGAL_DOCS_BY_LANG) — and asserts:
 *   - AT-005-1: no /saju|junishi/i in translations[EN/DE/FR(/ES)].
 *   - AT-005-2: no /saju|junishi/i in catalog titles/bullets/articles/FAQs and
 *               collections configs.
 *   - AT-005-4: no route slug / product_world / personalization filter enum is
 *               named saju/junishi (no hidden purchase path).
 *
 * RED-line discipline: this is a content/data scan only — it certifies no
 * astrological accuracy (bazi.ts stays a placeholder, RED for ACCURACY).
 *
 * NOTE on locales: ES is a LATER delta task (T-501). This scan covers every
 * locale key that EXISTS in the shipped `translations` object today (EN/DE/FR,
 * and ES automatically once it is added) — it never hard-codes a locale that is
 * not yet shipped, so it stays honest as the locale set grows.
 */
import { describe, it, expect } from 'vitest'
import { translations } from '../../src/i18n/translations'
import {
  products,
  articles,
  shopFaqs,
  faqDefs,
  PRODUCT_WORLDS,
  PERSONALIZATION_LEVELS,
} from '../../src/lib/catalog'
import { COLLECTION_CONFIGS, COLLECTION_SLUGS } from '../../src/lib/collections'
import { LEGAL_DOCS_BY_LANG } from '../../src/lib/legal'

const SAJU_JUNISHI = /saju|junishi/i

/** Recursively collect every string leaf under an arbitrary value. */
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

/** Also collect every OBJECT KEY (so a saju/junishi *key* — a hidden enum or
 *  filter — is caught, not just string values). */
function collectKeys(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const v of value) collectKeys(v, out)
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out.push(k)
      collectKeys(v, out)
    }
  }
  return out
}

function firstSajuHit(strings: string[]): string | null {
  for (const s of strings) if (SAJU_JUNISHI.test(s)) return s
  return null
}

// ── AT-005-1 — no saju/junishi in the shipped i18n dictionaries ──────────────

describe('REQ-005 / AT-005-1 — shipped translations carry no saju/junishi', () => {
  for (const lang of Object.keys(translations)) {
    it(`translations[${lang}] (values + keys) contains no /saju|junishi/i`, () => {
      const values = collectStrings(translations[lang as keyof typeof translations])
      const keys = collectKeys(translations[lang as keyof typeof translations])
      const hitV = firstSajuHit(values)
      const hitK = firstSajuHit(keys)
      expect(hitV, `saju/junishi value in translations[${lang}]: ${hitV}`).toBeNull()
      expect(hitK, `saju/junishi KEY in translations[${lang}]: ${hitK}`).toBeNull()
    })
  }
})

// ── AT-005-2 — no saju/junishi in catalog + collections shipped content ──────

describe('REQ-005 / AT-005-2 — catalog + collections content carry no saju/junishi', () => {
  it('catalog product titles/bullets/articles/FAQs are free of saju/junishi', () => {
    const strings: string[] = []
    for (const p of products) strings.push(p.title, ...p.bullets)
    for (const a of articles) strings.push(a.tag, a.title, a.excerpt, ...a.body)
    for (const f of shopFaqs) strings.push(f.q, f.a)
    for (const f of faqDefs) strings.push(f.id, f.q, f.a)
    const hit = firstSajuHit(strings)
    expect(hit, `saju/junishi in catalog content: ${hit}`).toBeNull()
  })

  it('COLLECTION_CONFIGS (slugs, copy, SEO, FAQ) are free of saju/junishi', () => {
    const hit = firstSajuHit(collectStrings(COLLECTION_CONFIGS))
    expect(hit, `saju/junishi in collections config: ${hit}`).toBeNull()
  })

  it('legal docs (EN/DE/FR) are free of saju/junishi', () => {
    const hit = firstSajuHit(collectStrings(LEGAL_DOCS_BY_LANG))
    expect(hit, `saju/junishi in legal docs: ${hit}`).toBeNull()
  })
})

// ── AT-005-4 — no saju/junishi route slug / product_world / filter enum ──────

describe('REQ-005 / AT-005-4 — no saju/junishi slug, world or filter enum', () => {
  it('no COLLECTION_SLUG is named saju/junishi (no hidden collection route)', () => {
    for (const slug of COLLECTION_SLUGS) {
      expect(slug).not.toMatch(SAJU_JUNISHI)
    }
  })

  it('no product_world enum value is saju/junishi', () => {
    for (const w of PRODUCT_WORLDS) {
      expect(w).not.toMatch(SAJU_JUNISHI)
    }
  })

  it('no personalization-level filter enum value is saju/junishi', () => {
    for (const lvl of PERSONALIZATION_LEVELS) {
      expect(lvl).not.toMatch(SAJU_JUNISHI)
    }
  })

  it('no shipped product carries a saju/junishi product_world (live data axis)', () => {
    for (const p of products) {
      expect(p.product_world).not.toMatch(SAJU_JUNISHI)
    }
  })
})
