/**
 * Legal DE/FR localization — RENDERED (jsdom) — REQ-007 (AT-007-1 / AT-007-4).
 *
 * Beat-0 Gegenthese (Vision §7.7(a) "created but never displayed"): the localized
 * legal docs + per-language review banner exist in src/lib/legal.ts, but Legal.tsx
 * could keep consuming the flat EN-only export and hard-coding the English banner —
 * so a DE/FR visitor still sees English prose. That is exactly the concealment
 * REQ-007 must close. These tests render the REAL `Legal` page through the
 * production I18nProvider in EN/DE/FR and assert, per doc-key:
 *   - AT-007-1: the localized heading/content renders in the active language,
 *   - AT-007-2: EVERY [MISSING — …] marker is still present (no invented operator
 *               data, identical marker count across languages),
 *   - AT-007-4: the review banner renders in the active language.
 *
 * The Playwright spec (tests/e2e/legal-localization.spec.ts) is the [REAL-BOUNDARY]
 * proof over App.tsx; Playwright browsers are not installed in this iteration, so
 * this jsdom render test is the runnable green evidence now.
 *
 * RED-line discipline: nothing here certifies any legal fact. The [MISSING — …]
 * markers stay verbatim and the banner keeps stating a professional review is
 * required before go-live.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { LEGAL_DOCS_BY_LANG, LEGAL_REVIEW_BANNER } from '../../src/lib/legal'
import type { Lang } from '../../src/i18n/translations'
import Legal from '../../src/pages/Legal'

const LANGS: Lang[] = ['EN', 'DE', 'FR']
const DOC_KEYS = ['impressum', 'privacy', 'terms', 'returns', 'shipping']
const MISSING_RE = /\[MISSING — [^\]]*\]/g

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <I18nProvider>{children}</I18nProvider>
    </MemoryRouter>
  )
}

/** Count [MISSING — …] markers in the EN source for a doc-key — the canonical
 *  marker count that every language must match (AT-007-2). */
function expectedMarkerCount(docKey: string): number {
  const doc = LEGAL_DOCS_BY_LANG.EN[docKey]
  const all = doc.sections.flatMap((s) => s.body).join('\n')
  return (all.match(MISSING_RE) ?? []).length
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-007-1 — localized heading renders in the active language ──────────────

describe('REQ-007 / AT-007-1 — localized legal heading renders in the active language', () => {
  for (const lang of LANGS) {
    for (const docKey of DOC_KEYS) {
      it(`[${lang}] /${docKey} renders the ${lang} title`, () => {
        localStorage.setItem('sizhu_lang', lang)
        render(<Legal docKey={docKey} />, { wrapper: Providers })

        const expectedTitle = LEGAL_DOCS_BY_LANG[lang][docKey].title
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toHaveTextContent(expectedTitle)
      })
    }
  }
})

// A DE/FR visitor must NOT be served the EN title when EN/DE/FR titles differ.
describe('REQ-007 / AT-007-1 — DE/FR do not fall through to the EN title', () => {
  for (const lang of ['DE', 'FR'] as Lang[]) {
    for (const docKey of DOC_KEYS) {
      const enTitle = LEGAL_DOCS_BY_LANG.EN[docKey].title
      const langTitle = LEGAL_DOCS_BY_LANG[lang][docKey].title
      if (enTitle === langTitle) continue // nothing to prove if titles coincide
      it(`[${lang}] /${docKey} does not show the EN-only title`, () => {
        localStorage.setItem('sizhu_lang', lang)
        render(<Legal docKey={docKey} />, { wrapper: Providers })
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading.textContent).toBe(langTitle)
        expect(heading.textContent).not.toBe(enTitle)
      })
    }
  }
})

// ── AT-007-2 — every [MISSING — …] marker is still present, per language ─────

describe('REQ-007 / AT-007-2 — [MISSING — …] markers stay verbatim in every language', () => {
  for (const lang of LANGS) {
    for (const docKey of DOC_KEYS) {
      it(`[${lang}] /${docKey} keeps all ${expectedMarkerCount(docKey)} markers`, () => {
        localStorage.setItem('sizhu_lang', lang)
        const { container } = render(<Legal docKey={docKey} />, { wrapper: Providers })

        // Count markers in the document BODY only — the review banner intentionally
        // contains the literal phrase "[MISSING — …]" as documentation, so counting
        // the whole container would double-count it. The <section> elements hold the
        // actual document prose where operator data must stay redacted.
        const bodyText = Array.from(container.querySelectorAll('section'))
          .map((s) => s.textContent ?? '')
          .join('\n')
        const found = (bodyText.match(MISSING_RE) ?? []).length
        // Identical marker count across languages == no invented operator data.
        expect(found).toBe(expectedMarkerCount(docKey))
      })
    }
  }
})

// ── AT-007-4 — review banner renders in the active language ──────────────────

describe('REQ-007 / AT-007-4 — per-language review banner renders', () => {
  for (const lang of LANGS) {
    it(`[${lang}] the legal review banner is shown in ${lang}`, () => {
      localStorage.setItem('sizhu_lang', lang)
      render(<Legal docKey="impressum" />, { wrapper: Providers })

      const banner = screen.getByTestId('legal-review-banner')
      expect(banner).toBeInTheDocument()
      // The shipped per-language banner copy must back the rendered text.
      expect(banner).toHaveTextContent(LEGAL_REVIEW_BANNER[lang])
    })
  }

  // DE/FR must not be served the English banner when it differs.
  for (const lang of ['DE', 'FR'] as Lang[]) {
    it(`[${lang}] the banner is not the English banner`, () => {
      localStorage.setItem('sizhu_lang', lang)
      render(<Legal docKey="impressum" />, { wrapper: Providers })
      const banner = screen.getByTestId('legal-review-banner')
      expect(banner.textContent?.trim()).toBe(LEGAL_REVIEW_BANNER[lang])
      expect(banner.textContent?.trim()).not.toBe(LEGAL_REVIEW_BANNER.EN)
    })
  }
})
