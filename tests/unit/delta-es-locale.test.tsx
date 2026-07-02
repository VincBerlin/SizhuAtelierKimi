/**
 * DELTA T-501 — ES as the 4th locale (REQ-015). `[SHIPPED-SCAN]` + `[REAL-BOUNDARY-jsdom]`.
 *
 * Acceptance contracts (docs/tests/desenio-acceptance-design.md §REQ-015 + §REQ-003):
 *   AT-015-1  translations.ES exists; recursive key-set(ES) == key-set(EN) — no
 *             missing/extra keys, so there is NO silent EN fallback in the UI.
 *   AT-015-2  Sample of visible nav/announce/product keys: ES value !== EN value
 *             (real Spanish, not an EN copy — FM-08).
 *   AT-015-3  The header language picker lists EXACTLY EN/DE/FR/ES; the abbreviation
 *             is unchanged; each entry carries a flag element to the RIGHT of the
 *             abbreviation (DOM order: code BEFORE flag).
 *   AT-015-4  Switching to ES sets <html lang="es"> and a visible UI string flips
 *             to Spanish.
 *   AT-003-4  i18n keys for all 8 primary-nav labels exist in EN/DE/FR/ES.
 *
 * Beat-0 Gegenthese (acceptance-design §REQ-015): ES might be "added" but
 * incomplete (keys fall back to EN → mixed-language UI), or merely duplicate EN
 * (no real Spanish). So AT-015-1 scans the SHIPPED `translations` module (the same
 * instance the app renders) for full key parity, and AT-015-2 proves the values
 * actually differ from EN.
 *
 * RED-line discipline (Reality-Ledger VR-ES-MACHINE-TRANSLATED): the ES copy is
 * MACHINE-TRANSLATED and pending a native-speaker review. These tests certify
 * completeness (key parity) + difference-from-EN + the picker wiring ONLY. They do
 * NOT certify translation QUALITY — that stays an open value-risk the user reviews.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { translations, type Lang } from '../../src/i18n/translations'
import { LANGS } from '../../src/i18n/I18nProvider'
import { PRIMARY_NAV } from '../../src/components/Navbar'

// ── helpers ──────────────────────────────────────────────────────────────────

/** Recursively collect every leaf key-path, INCLUDING array indices, so two
 *  dictionaries are structurally identical iff their path sets are equal (this
 *  also catches array-length drift, not just object-key drift). */
function keyPaths(value: unknown, prefix = '', out: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((v, i) => keyPaths(v, `${prefix}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    for (const k of Object.keys(value as Record<string, unknown>)) {
      keyPaths((value as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k, out)
    }
  } else {
    out.push(prefix)
  }
  return out
}

function resolveKey(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj)
}

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

const ALL_LANGS: Lang[] = ['EN', 'DE', 'FR', 'ES']

beforeEach(() => {
  localStorage.clear()
  document.documentElement.lang = ''
})

// ── AT-015-1 — full key parity ES == EN (no silent EN fallback, FM-07) ─────────

describe('REQ-015 / AT-015-1 — translations.ES has full key parity with EN', () => {
  it('translations.ES exists and is a non-empty object', () => {
    expect(translations.ES, 'translations.ES must exist').toBeTruthy()
    expect(typeof translations.ES).toBe('object')
    expect(Object.keys(translations.ES).length).toBeGreaterThan(0)
  })

  it('key-set(ES) equals key-set(EN) — no missing and no extra keys', () => {
    const enPaths = keyPaths(translations.EN).sort()
    const esPaths = keyPaths(translations.ES).sort()
    const enSet = new Set(enPaths)
    const esSet = new Set(esPaths)

    const missingInEs = enPaths.filter((p) => !esSet.has(p))
    const extraInEs = esPaths.filter((p) => !enSet.has(p))

    expect(missingInEs, 'keys present in EN but MISSING in ES (would silently fall back to EN)').toEqual([])
    expect(extraInEs, 'keys present in ES but NOT in EN (structural drift)').toEqual([])
    expect(esPaths).toEqual(enPaths)
  })

  it('every ES leaf is a defined, typed value (no undefined holes)', () => {
    for (const path of keyPaths(translations.EN)) {
      // array-index paths use bracket syntax; resolve only the dotted scalar/object ones
      if (path.includes('[')) continue
      const enVal = resolveKey(translations.EN, path)
      const esVal = resolveKey(translations.ES, path)
      if (typeof enVal === 'string') {
        expect(typeof esVal, `ES ${path} should be a string`).toBe('string')
      }
    }
  })
})

// ── AT-015-2 — ES values differ from EN for visible keys (real Spanish, FM-08) ─

describe('REQ-015 / AT-015-2 — ES is real Spanish, not an EN copy', () => {
  // A sample of clearly-translatable, customer-visible nav/announce/product keys.
  // Each MUST differ from EN — a duplicated-EN ES would fail here (FM-08).
  const SAMPLE_KEYS = [
    'nav.home',
    'nav.cart',
    'nav.collections',
    'nav.gifts',
    'nav.menu',
    'nav.primary.bestseller',
    'nav.primary.new',
    'nav.primary.offers',
    'nav.primary.posterSets',
    'nav.primary.inspiration',
    'announce.shipping',
    'announce.personalized',
    'announce.fallback',
    'product.addToCart',
    'product.back',
    'product.related',
    'product.secure',
  ]

  it('ES value differs from EN value for each sampled visible key', () => {
    for (const key of SAMPLE_KEYS) {
      const en = resolveKey(translations.EN, key)
      const es = resolveKey(translations.ES, key)
      expect(typeof en, `EN ${key} is a string`).toBe('string')
      expect(typeof es, `ES ${key} is a string`).toBe('string')
      expect((es as string).trim().length, `ES ${key} non-empty`).toBeGreaterThan(0)
      expect(es, `ES ${key} must NOT equal EN (real Spanish, not a copy)`).not.toBe(en)
    }
  })
})

// ── AT-003-4 — nav i18n keys exist in EN/DE/FR/ES ─────────────────────────────

describe('REQ-003 / AT-015 / AT-003-4 — nav keys resolve in all 4 locales', () => {
  it('every primary-nav label key is a non-empty string in EN/DE/FR/ES', () => {
    for (const lang of ALL_LANGS) {
      for (const entry of PRIMARY_NAV) {
        const value = resolveKey(translations[lang], entry.i18nKey)
        expect(typeof value, `${lang} ${entry.i18nKey}`).toBe('string')
        expect((value as string).trim().length, `${lang} ${entry.i18nKey}`).toBeGreaterThan(0)
      }
    }
  })
})

// ── AT-015 — LANGS exposes exactly the 4 locales in order ─────────────────────

describe('REQ-015 — LANGS is exactly EN/DE/FR/ES', () => {
  it('I18nProvider LANGS lists the four locales in spec order', () => {
    expect(LANGS).toEqual(['EN', 'DE', 'FR', 'ES'])
  })
})

// ── AT-015-3 — header language picker: 4 codes, flag to the RIGHT of each code ─

describe('REQ-015 / AT-015-3 — language picker lists EN/DE/FR/ES with flags on the right', () => {
  it('the desktop picker lists exactly EN/DE/FR/ES with a flag after each code', async () => {
    renderApp()
    // Two language widgets ship (desktop header + mobile drawer); index 0 is the
    // desktop header surface (REQ-022).
    const widget = (await screen.findAllByTestId('header-lang'))[0]
    const options = within(widget).getAllByTestId('lang-option')

    const codes = options.map((o) => within(o).getByTestId('lang-code').textContent?.trim())
    expect(codes).toEqual(['EN', 'DE', 'FR', 'ES'])

    // Abbreviation unchanged: each code is its 2-letter uppercase locale tag.
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z]{2}$/)
    }

    // Each entry carries a flag element positioned AFTER the code in DOM order.
    for (const option of options) {
      const code = within(option).getByTestId('lang-code')
      const flag = within(option).getByTestId('lang-flag')
      expect(flag).toBeInTheDocument()
      const codeBeforeFlag = code.compareDocumentPosition(flag) & Node.DOCUMENT_POSITION_FOLLOWING
      expect(codeBeforeFlag, 'flag must come AFTER the code in DOM order').toBeTruthy()
    }
  })
})

// ── AT-015-4 — switching to ES sets <html lang="es"> + visible Spanish string ──

describe('REQ-015 / AT-015-4 — switching to ES flips document lang + UI copy', () => {
  it('clicking the ES entry sets html lang=es and shows Spanish copy', async () => {
    renderApp()
    const widget = (await screen.findAllByTestId('header-lang'))[0]
    const options = within(widget).getAllByTestId('lang-option')
    const esOption = options.find(
      (o) => within(o).getByTestId('lang-code').textContent?.trim() === 'ES',
    )
    expect(esOption, 'an ES option must exist').toBeTruthy()

    fireEvent.click(esOption!)

    await waitFor(() => expect(document.documentElement.lang).toBe('es'))

    // The "Start Personalizing" CTA flips to its Spanish value (the same key the
    // EN header renders as "Start Personalizing").
    const esCta = translations.ES.nav.startPersonalizing as string
    const enCta = translations.EN.nav.startPersonalizing as string
    expect(esCta).not.toBe(enCta)
    const matches = await screen.findAllByText(esCta)
    expect(matches.length).toBeGreaterThan(0)
  })
})
