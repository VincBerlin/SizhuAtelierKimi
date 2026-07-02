/**
 * Noon-fallback disclosure — RENDERED (jsdom) — REQ-018 (AT-018-2/3).
 *
 * Beat-0 Gegenthese (Vision §7.5): the fallback is set but the disclosure never
 * renders (missing key in a language, or hint only in code). The Playwright spec
 * (tests/e2e/noon-fallback-disclosure.spec.ts) is the [REAL-BOUNDARY] proof over
 * App.tsx, but Playwright browsers are not installed in this iteration. This jsdom
 * render test renders the REAL `Personalize` page and the REAL `CartDrawer`
 * (PersonalizationSummary) through the production provider chain and asserts the
 * disclosure is actually in the DOM in EN/DE/FR — runnable green evidence now.
 *
 * RED-line discipline: nothing here certifies the chart. It only proves the noon
 * ASSUMPTION is disclosed at the field and in the cart summary.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { ShopStoreProvider, useShopStore } from '../../src/store/ShopStore'
import { AuthProvider } from '../../src/store/AuthProvider'
import { translations, type Lang } from '../../src/i18n/translations'
import Personalize from '../../src/pages/Personalize'
import CartDrawer from '../../src/components/shop/CartDrawer'

const LANGS: Lang[] = ['EN', 'DE', 'FR']
const NOON_RE = /12[:.]?0?0|midi|mittags|noon/i

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <I18nProvider>
        <AuthProvider>
          <ShopStoreProvider>{children}</ShopStoreProvider>
        </AuthProvider>
      </I18nProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

// ── AT-018-2 — disclosure renders at the birth-time field, EN/DE/FR ──────────

describe('REQ-018 / AT-018-2 — noon-fallback disclosure renders at the birth-time field', () => {
  for (const lang of LANGS) {
    it(`[${lang}] checking "birth time unknown" reveals the 12:00 field hint`, () => {
      localStorage.setItem('sizhu_lang', lang)
      render(<Personalize />, { wrapper: Providers })

      // Not disclosed until the buyer marks the time unknown (no premature noise).
      expect(screen.queryByTestId('noon-fallback-field-hint')).toBeNull()

      // First checkbox on the page is the "I don't know my birth time" toggle.
      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)

      const hint = screen.getByTestId('noon-fallback-field-hint')
      expect(hint).toBeInTheDocument()
      expect(hint).toHaveTextContent(NOON_RE)
      // The shipped copy for this language must back the rendered text.
      expect(hint).toHaveTextContent(translations[lang].noonFallback.fieldHint)
    })
  }
})

// ── AT-018-3 — disclosure renders in the personalization summary, EN/DE/FR ───

describe('REQ-018 / AT-018-3 — noon-fallback disclosure renders in the summary', () => {
  for (const lang of LANGS) {
    it(`[${lang}] the summary shows the noon notice when time is unknown`, () => {
      localStorage.setItem('sizhu_lang', lang)
      render(<Personalize />, { wrapper: Providers })

      fireEvent.click(screen.getAllByRole('checkbox')[0])

      const notice = screen.getByTestId('noon-fallback-summary-notice')
      expect(notice).toBeInTheDocument()
      expect(notice).toHaveTextContent(NOON_RE)
    })
  }
})

// ── AT-018-3 (cart) — disclosure renders in the cart line summary, EN/DE/FR ──

/** Seed a personalized cart line with the unknown-time flag, then render the cart
 *  drawer so PersonalizationSummary shows the notice. */
function Seed() {
  const store = useShopStore()
  // Add once on mount.
  if (store.cart.length === 0) {
    store.addItem({
      title: 'Personalized BaZi Poster',
      price: 79,
      qty: 1,
      poster: null,
      meta: 'EN',
      personalization: {
        name: 'Mara', date: '1990-06-15', time: '12:00', place: 'München',
        birthTimeUnknown: 'true', unknownTime: 'true', timeFallbackUsed: 'true',
      },
      productId: 'ptype:bazi',
      variantId: 'size=A2',
    })
  }
  return null
}

describe('REQ-018 / AT-018-3 — noon-fallback disclosure renders in the cart drawer', () => {
  for (const lang of LANGS) {
    it(`[${lang}] an unknown-time cart line shows the noon notice`, () => {
      localStorage.setItem('sizhu_lang', lang)
      render(
        <>
          <Seed />
          <CartDrawer />
        </>,
        { wrapper: Providers },
      )
      const notice = screen.getByTestId('cart-noon-fallback-notice')
      expect(notice).toBeInTheDocument()
      expect(notice).toHaveTextContent(NOON_RE)
      // backed by the shipped per-language cart copy.
      expect(within(notice).getByText(translations[lang].cart.unknownTimeNotice)).toBeTruthy()
    })
  }
})
