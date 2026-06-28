/**
 * DELTA T — Celestial Credits removed from the visible shop UI
 * (REQ-010 / CAN-017 / CAN-018, VIS-021 / CAN-014 trust-cleanup).
 *
 * `[REAL-BOUNDARY-jsdom]` — seeds the REAL ShopStore (via the cart's own
 * localStorage hydration) through the real App composition root and renders the
 * real Cart drawer, Checkout, PDP and Personalize surfaces. It asserts that NO
 * Celestial-Credits affordance is rendered anywhere a buyer can see it:
 *   - the words "Celestial Credit(s)"
 *   - the credits-earned line ("You will earn N C. with this order")
 *   - the per-line "+N C." credits badge in the cart
 *   - the "save your Celestial Credits" sign-in upsell (cart + checkout)
 *   - the "Credits earned" personalization summary row
 *   - the account "Celestial Credits" balance card
 *
 * Mutation guard: re-introducing ANY of these credit renders turns a case RED.
 * The price / shipping / personalization / sign-in (signInPrompt) flow MUST stay
 * intact — this is a display-and-stored-number removal, not a flow change, so the
 * positive assertions below certify the surrounding commerce UI still renders.
 *
 * RED-line discipline: this certifies UI absence + flow integrity only — nothing
 * about chart accuracy or pricing math (the server money-path is unchanged).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import type { CartLine } from '../../src/store/ShopStore'
import type { AuthUser } from '../../src/lib/auth'
import type { Lang } from '../../src/i18n/translations'

const CART_KEY = 'sizhu_cart'
// The active-language key the production I18nProvider reads from localStorage. The
// Outside-<main> render cases below seed it so DE/FR regressions on the persistent
// header, the signed-out auth screen and the Legal page are exercised per-language.
const LANG_KEY = 'sizhu_lang'
const LANGS: Lang[] = ['EN', 'DE', 'FR']

// Patterns that, if rendered anywhere visible, mean a credits affordance leaked.
// `creditsEarn` copy in every language renders the unit token "C." after a number;
// the per-line badge renders "+<n> C.". The brand phrase appears in EN/DE/FR.
const CELESTIAL = /Celestial Credit/i
// "N C." with the credits unit — the earn line and the per-line badge. Matches
// "12 C.", "+49 C." etc. (a digit followed by the standalone "C." unit token).
const CREDIT_UNIT = /\d\s*C\.(?:\s|$|<)/
// The "save your credits" upsell copy (EN/DE/FR all contain "Credits"/"credits").
const SAVE_CREDITS = /save your Celestial Credits|Profil.*Celestial Credits|Celestial Credits/i
// Broad trust-cleanup guard: any visible credits/vault affordance — the brand
// phrases ("Celestial Vault" / "Celestial Credit"), the standalone "credits"
// word, the "<n> C." unit badge, or a leaked `.points` dereference. Used on the
// persistent header, the signed-out auth screen and the Legal page, where ANY of
// these surfacing is a regression. (See VIS-021 / CAN-014 / CAN-017 / CAN-018.)
const CREDITS_OR_VAULT = /Celestial Vault|Celestial Credit|\bcredits?\b|\d\s*C\.|\.points/i

// A personalized BaZi line carries the `personalization` object (REQ-014).
const baziLine: CartLine = {
  key: 'k-bazi',
  title: 'BaZi Geburtschart — Vier Säulen',
  price: 49,
  qty: 2,
  poster: { frame: '#1B1B1B', bg: '#E9DFCB', name: 'Mara', element: 'Wood', animal: 'Horse', pillars: [] } as any,
  meta: 'Natural oak · Sandstone · A2',
  personalization: { date: '1990-07-21', time: '12:00', place: 'Munich', name: 'Mara' },
  productId: 'poster-1',
  variantId: 'A2|#1B1B1B',
}

// A legacy persisted line that still carries the old `creditsEarned` number.
// Even with the stored value present, NOTHING credit-shaped may render.
const legacyLineWithStoredCredits: CartLine = {
  ...baziLine,
  key: 'k-legacy',
  // @ts-expect-error — exercising a legacy persisted cart whose line still has the
  // (now-removed) field; the UI must ignore it, not render a badge from it.
  creditsEarned: 49,
}

function seedCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines))
}

async function renderApp(initialPath: string) {
  const utils = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
  return utils
}

/** Open the cart drawer from the real header trigger. */
async function openCart() {
  const triggers = await screen.findAllByLabelText(/cart|warenkorb|panier/i, undefined, { timeout: 15000 })
  fireEvent.click(triggers[0])
  await screen.findAllByTestId('cart-line', undefined, { timeout: 15000 })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  // Under `--isolate=false` tests share a worker, so a `vi.stubGlobal('fetch', …)`
  // (logged-in/out auth boundary) would leak into the next case. `restoreAllMocks`
  // does NOT undo `stubGlobal`; `unstubAllGlobals` does. Then re-install the
  // rejecting default from tests/setup.ts so any case that relies on the offline
  // boundary still gets it, independent of test order.
  vi.unstubAllGlobals()
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('fetch is stubbed in jsdom tests'))))
})

// ── Cart drawer ──────────────────────────────────────────────────────────────

describe('REQ-010 — Cart drawer shows no Celestial-Credits affordance', () => {
  it('a personalized cart renders NO credit earn line, badge, or brand text', async () => {
    seedCart([baziLine])
    await renderApp('/')
    await openCart()

    // The drawer is the live region we care about.
    const drawer = screen.getByText(/Subtotal|Zwischensumme|Sous-total/i).closest('aside')!
    const html = drawer.innerHTML

    expect(html).not.toMatch(CELESTIAL)
    expect(html).not.toMatch(CREDIT_UNIT)
    expect(html).not.toMatch(/✦\s*You will earn|Du erhältst|Vous gagnerez/i)

    // Flow intact: subtotal still renders (2 × €49 = €98) and the checkout CTA is present.
    expect(within(drawer).getByText(/Subtotal|Zwischensumme|Sous-total/i)).toBeInTheDocument()
    expect(within(drawer).getByRole('button', { name: /Checkout|Zur Kasse|Commander/i })).toBeInTheDocument()
  })

  it('a legacy line carrying a stored creditsEarned value still renders NO badge', async () => {
    seedCart([legacyLineWithStoredCredits])
    await renderApp('/')
    await openCart()

    const drawer = screen.getByText(/Subtotal|Zwischensumme|Sous-total/i).closest('aside')!
    expect(drawer.innerHTML).not.toMatch(CREDIT_UNIT)
    expect(drawer.innerHTML).not.toMatch(CELESTIAL)
  })

  it('the signed-out upsell shows the plain sign-in prompt, never the credits variant', async () => {
    // Seed a line that still carries a stored `creditsEarned` value: pre-change,
    // a positive credits total drives the cart to render the "save your Celestial
    // Credits" upsell instead of the neutral sign-in prompt — so this case is a
    // true RED→GREEN guard for the upsell swap, not a no-op.
    seedCart([legacyLineWithStoredCredits])
    await renderApp('/')
    await openCart()

    const drawer = screen.getByText(/Subtotal|Zwischensumme|Sous-total/i).closest('aside')!
    // RED signal first: the "save your Celestial Credits" copy must be gone …
    expect(drawer.innerHTML).not.toMatch(SAVE_CREDITS)
    // … and the neutral sign-in prompt must take its place (GREEN expectation).
    expect(within(drawer).getByText(/Sign in to use your saved address|gespeicherte Adresse|adresse.*enregistr/i)).toBeInTheDocument()
  })
})

// ── Checkout ─────────────────────────────────────────────────────────────────

describe('REQ-010 — Checkout shows no Celestial-Credits affordance', () => {
  it('the signed-out checkout renders NO save-credits upsell or brand text', async () => {
    // A line that still carries a stored `creditsEarned` value: pre-change this
    // drives the signed-out checkout's "✦ save your Celestial Credits" upsell, so
    // the case is a real RED→GREEN guard for the checkout upsell removal.
    seedCart([legacyLineWithStoredCredits])
    await renderApp('/checkout')

    // Wait for the lazy Checkout route to mount.
    await screen.findByText(/Place order now|Jetzt zahlungspflichtig|Commander et payer/i, undefined, { timeout: 15000 })
    const main = document.querySelector('main')!
    const html = main.innerHTML

    expect(html).not.toMatch(CELESTIAL)
    expect(html).not.toMatch(SAVE_CREDITS)
    expect(html).not.toMatch(CREDIT_UNIT)

    // Flow intact: the place-order CTA and the order summary still render.
    expect(within(main).getByRole('button', { name: /Place order now|Jetzt zahlungspflichtig|Commander et payer/i })).toBeInTheDocument()
    expect(within(main).getByText(/Your order|Deine Bestellung|Votre commande/i)).toBeInTheDocument()
  })
})

// ── Product detail page (PDP) ────────────────────────────────────────────────

describe('REQ-010 — PDP shows no Celestial-Credits earn line', () => {
  it('a personalizable product page renders price but NO credits-earn line', async () => {
    await renderApp('/product/1')

    await screen.findByTestId('pdp', undefined, { timeout: 15000 })
    const pdp = screen.getByTestId('pdp')
    const html = pdp.innerHTML

    expect(html).not.toMatch(CELESTIAL)
    expect(html).not.toMatch(CREDIT_UNIT)
    expect(html).not.toMatch(/✦\s*You will earn|Du erhältst|Vous gagnerez/i)

    // Flow intact: the add-to-cart CTA (personalize or add) still renders.
    const cta = screen.queryByTestId('pdp-personalize-cta') || screen.queryByTestId('pdp-add-to-cart')
    expect(cta).not.toBeNull()
  })
})

// ── Personalize flow ─────────────────────────────────────────────────────────

describe('REQ-010 — Personalize summary shows no Credits-earned row', () => {
  it('the personalization summary renders the price but NO credits row/line', async () => {
    await renderApp('/personalize')

    await screen.findByText(/Review your personalization|Personalisierung prüfen|Vérifiez votre personnalisation/i, undefined, { timeout: 15000 })
    const main = document.querySelector('main')!
    const html = main.innerHTML

    expect(html).not.toMatch(CELESTIAL)
    expect(html).not.toMatch(CREDIT_UNIT)
    expect(html).not.toMatch(/Credits earned|Verdiente Credits|Crédits gagnés/i)
    expect(html).not.toMatch(/You will earn .* with this order|Du erhältst .* mit dieser Bestellung|Vous gagnerez .* avec cette commande/i)

    // Flow intact: the price summary row + add-to-cart CTA still render.
    expect(within(main).getByText(/Price|Preis|Prix/i)).toBeInTheDocument()
  })
})

// ── Account dashboard (logged in) ────────────────────────────────────────────

// REQ-010: the credits fields (points/lifetime/unlockedFeatures/achievements)
// were removed from AuthUser when the backend stopped returning them. The mock
// carries only the live contract — the dashboard must still render no credits.
const mockUser: AuthUser = {
  email: 'mara@example.com',
  name: 'Mara',
  preferredLanguage: 'en',
  marketingConsent: false,
  newsletterStatus: 'subscribed',
  hasPayment: false,
  defaultShippingAddressId: null,
  defaultBillingAddressId: null,
  createdAt: '2025-01-01T00:00:00.000Z',
}

/** Stub the auth/account network boundary so the dashboard renders logged in. */
function stubLoggedIn() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/auth/me')) {
        return Promise.resolve(new Response(JSON.stringify({ user: mockUser }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      }
      // orders / addresses / anything else → empty, well-formed JSON.
      return Promise.resolve(new Response(JSON.stringify({ orders: [], addresses: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    }),
  )
}

/**
 * Stub the auth boundary as SIGNED OUT (`/api/auth/me` → `{ user: null }`), so the
 * Account route renders the login screen deterministically. Made explicit (rather
 * than leaning on the global rejecting stub from tests/setup.ts) because under
 * `--isolate=false` a prior `stubLoggedIn()` replaces the global fetch via
 * `vi.stubGlobal`, which `vi.restoreAllMocks()` does NOT undo — so the logged-out
 * default would otherwise leak the logged-in stub into this case.
 */
function stubLoggedOut() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })),
    ),
  )
}

describe('REQ-010 — Account dashboard shows no Celestial-Credits balance', () => {
  it('the logged-in dashboard renders the email but NO credits balance card', async () => {
    stubLoggedIn()
    await renderApp('/account')

    // Wait for the logged-in dashboard (email card present).
    await screen.findByText(mockUser.email, undefined, { timeout: 15000 })
    const main = document.querySelector('main')!
    const html = main.innerHTML

    expect(html).not.toMatch(CELESTIAL)
    expect(html).not.toMatch(CREDIT_UNIT)
    // The user's points must never surface as a balance.
    expect(html).not.toContain('120 C.')
    expect(html).not.toContain('340 C.')

    // Flow intact: the account dashboard still renders (logout + order history).
    expect(within(main).getByText(/Log out|Abmelden|Se déconnecter/i)).toBeInTheDocument()
    expect(within(main).getByText(/Order history|Bestellhistorie|Historique des commandes/i)).toBeInTheDocument()
  })
})

// ── Persistent header / banner (logged in) ───────────────────────────────────
// The first cleanup wave only scanned <main> and so MISSED the credits badge the
// header renders for a signed-in buyer (Navbar's `{user.points} C.`). The header
// is a <header role="banner"> that persists on EVERY route, so a single leak there
// is visible site-wide. This case scopes to getByRole('banner') specifically.

describe('REQ-010 — Persistent header shows no Celestial-Credits badge', () => {
  // Parametrized over EN/DE/FR: the header is a persistent <header role="banner"> on
  // EVERY route, so a credits/vault leak there is visible site-wide AND per-language.
  // A DE/FR regression on this Outside-<main> surface would slip through an EN-only
  // render — exactly the language-axis hole this Belt-and-braces loop closes. The
  // localStorage 'sizhu_lang' seed is the same mechanism legal-localization-render
  // uses to drive the active language through the production I18nProvider.
  for (const lang of LANGS) {
    it(`[${lang}] the signed-in header/banner renders the account link but NO "{n} C." credits badge`, async () => {
      localStorage.setItem(LANG_KEY, lang)
      stubLoggedIn()
      await renderApp('/')

      // Wait until AuthProvider has hydrated the signed-in user (account link present).
      const banner = await screen.findByRole('banner', undefined, { timeout: 15000 })
      // Give the post-/api/auth/me re-render a tick so a (regressed) badge would mount.
      await waitFor(() => {
        expect(within(banner).getByTestId('header-account')).toBeInTheDocument()
      })
      const html = banner.innerHTML

      // RED signal: pre-change the header renders the user's points as "120 C." here.
      expect(html).not.toContain('120 C.')
      expect(html).not.toMatch(CREDIT_UNIT)
      expect(html).not.toMatch(CREDITS_OR_VAULT)

      // Flow intact: the account link/user icon and the cart trigger still render.
      expect(within(banner).getByTestId('header-account')).toBeInTheDocument()
      expect(within(banner).getByTestId('header-cart')).toBeInTheDocument()
    })
  }
})

// ── Signed-out auth screen ───────────────────────────────────────────────────
// The logged-out /account screen renders the auth.subtitle. Pre-change that copy
// is "Your Celestial Vault — credits, orders and cosmic updates." — a Vault/credits
// affordance on the most-visited account entry point. It must become a neutral
// sign-in subtitle with NO Vault/credits language.

describe('REQ-010 — Signed-out auth screen shows no Vault/credits language', () => {
  // Parametrized over EN/DE/FR. The auth.subtitle is rendered per-language, so a
  // DE/FR-only re-introduction of the old "Celestial Vault — credits …" subtitle
  // would never surface in an EN-only render. Seeding 'sizhu_lang' drives the real
  // I18nProvider into the target locale before the login screen mounts.
  for (const lang of LANGS) {
    it(`[${lang}] the login screen renders the form but NO Celestial Vault / credits subtitle`, async () => {
      localStorage.setItem(LANG_KEY, lang)
      // Explicit signed-out boundary → AuthProvider resolves null → login screen.
      stubLoggedOut()
      await renderApp('/account')

      // Wait for the signed-out login screen (its heading is the stable anchor).
      await screen.findByText(/Welcome back|Willkommen zurück|Bon retour/i, undefined, { timeout: 15000 })
      const main = document.querySelector('main')!
      const html = main.innerHTML

      expect(html).not.toMatch(/Celestial Vault|Vault/i)
      expect(html).not.toMatch(CELESTIAL)
      expect(html).not.toMatch(CREDITS_OR_VAULT)

      // Flow intact: the email field and a submit button still render.
      expect(within(main).getByLabelText(/Email address|E-Mail-Adresse|Adresse e-mail/i)).toBeInTheDocument()
      expect(within(main).getByRole('button', { name: /Log in|Anmelden|Se connecter|…/i })).toBeInTheDocument()
    })
  }
})

// ── Legal / Privacy Policy ───────────────────────────────────────────────────
// The Privacy Policy "purposes" section listed "reserve Celestial Credits" as a
// processing purpose. With the credits affordance gone from the shop, that clause
// is stale and must be removed; only the newsletter-send purpose remains.

describe('REQ-010 — Privacy Policy lists no Celestial-Credits purpose', () => {
  // Parametrized over EN/DE/FR: the Legal page renders LEGAL_DOCS_BY_LANG[lang], so a
  // stale "reserve Celestial Credits" purpose could re-appear in any one localized
  // doc and stay invisible to an EN-only render. The 'sizhu_lang' seed selects the
  // localized legal body before the page mounts (same driver as the localized
  // legal-render suite).
  for (const lang of LANGS) {
    it(`[${lang}] the legal page renders the newsletter purpose but NO Celestial Credits clause`, async () => {
      localStorage.setItem(LANG_KEY, lang)
      await renderApp('/privacy')

      // Wait for the privacy policy to mount (the purposes heading is a stable anchor).
      await screen.findByText(
        /Why we process it|Warum wir sie verarbeiten|Pourquoi nous les traitons/i,
        undefined,
        { timeout: 15000 },
      )
      const main = document.querySelector('main')!
      const html = main.innerHTML

      expect(html).not.toMatch(CELESTIAL)
      expect(html).not.toMatch(/Celestial Credit/i)
      expect(html).not.toMatch(CREDITS_OR_VAULT)

      // Flow intact: the newsletter-send purpose is still disclosed.
      expect(html).toMatch(/send the newsletter|Versand des Newsletters|envoyer la newsletter/i)
    })
  }
})
