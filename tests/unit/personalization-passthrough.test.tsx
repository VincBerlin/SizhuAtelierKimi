/**
 * Personalization input-passthrough + noon-fallback — REQ-004 / REQ-018
 * (acceptance-design AT-004-1/2/3/4, AT-018-1).
 *
 * Boundary note: per the REQ-004 Beat-0 Gegenthese (Vision §7.5 "Eingabe-Verwerfung
 * launderieren") the value lives on the *assembled* path — UI/config state →
 * `ShopStore` cart-line metadata → `startCheckout` payload — NOT on `computeChart`'s
 * signature alone. So the load-bearing assertions here run the REAL store
 * (`addCurrent`, the production assembly that today builds the personalization
 * object) and the REAL `startCheckout` payload builder, then inspect the body
 * actually transmitted to `/api/checkout` (fetch stubbed). This catches the
 * laundering failure where the store quietly omits `birthTimeUnknown` / the noon
 * fallback even though `computeChart` accepts the param.
 *
 * RED-line discipline (Reality-Ledger, BLK-RED-BAZI): nothing here asserts the
 * BaZi chart is computed/accurate. `src/lib/bazi.ts` `computeChart` stays a
 * deterministic PLACEHOLDER (RED for ACCURACY). AT-004-4 pins that RED line: the
 * test checks the signature *accepts and carries* the inputs, and that the chart
 * is INDEPENDENT of place (no "image varies with location" claim).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ShopStoreProvider, useShopStore, type CartLine } from '../../src/store/ShopStore'
import { I18nProvider } from '../../src/i18n/I18nProvider'
import { AuthProvider } from '../../src/store/AuthProvider'
import { translations } from '../../src/i18n/translations'
import Personalize from '../../src/pages/Personalize'
import { startCheckout } from '../../src/lib/checkout'
import { computeChart } from '../../src/lib/bazi'

// ── helpers ──────────────────────────────────────────────────────────────────

/** Capture the JSON body actually POSTed to /api/checkout by `startCheckout`. */
function stubCheckoutFetch() {
  const calls: Array<{ url: string; body: any }> = []
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, body: init?.body ? JSON.parse(init.body as string) : undefined })
    return { ok: true, json: async () => ({ url: 'https://stripe.test/session' }) } as unknown as Response
  })
  vi.stubGlobal('fetch', fetchMock)
  return { calls }
}

const ENTERED = { name: 'Mara', date: '1990-06-15', time: '08:30', place: 'München' }

function wrapper({ children }: { children: React.ReactNode }) {
  return <ShopStoreProvider>{children}</ShopStoreProvider>
}

/** Drive the REAL store assembly: write birth config via `setCfg`, add the
 *  current configuration as a cart line via `addCurrent` (productId 1 is a
 *  personalizable poster), then build + transmit the checkout payload and return
 *  the personalization object actually sent for that line. */
async function sentPersonalizationFor(cfgPatch: Record<string, string>) {
  // Start from an empty persisted cart so the freshly-mounted provider loads no
  // leftover line from a prior render in this worker.
  localStorage.clear()
  const { calls } = stubCheckoutFetch()
  const { result } = renderHook(() => useShopStore(), { wrapper })

  act(() => {
    result.current.setCfg(cfgPatch)
  })
  act(() => {
    result.current.addCurrent(1)
  })

  // Build + transmit the payload for the line we just added (the last line).
  const cart: CartLine[] = result.current.cart
  expect(cart.length).toBeGreaterThanOrEqual(1)

  await act(async () => {
    await startCheckout(cart, 4.9, 'en')
  })

  // The provider also fires fetch('/api/region') on mount; isolate the checkout POST.
  const checkoutCalls = calls.filter((c) => c.url === '/api/checkout')
  expect(checkoutCalls.length).toBe(1)
  const items = checkoutCalls[0].body.items as Array<{ personalization: Record<string, string> }>
  return items[items.length - 1].personalization
}

beforeEach(() => {
  // jsdom has no real navigation; stub the assignment startCheckout performs.
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  })
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ── AT-004-1 [REAL-BOUNDARY] — inputs survive into the transmitted payload ────

describe('REQ-004 / AT-004-1 — place/date/time/birthTimeUnknown reach the checkout payload', () => {
  it('carries all four birth inputs with the entered values (no silent discard)', async () => {
    const sent = await sentPersonalizationFor({
      name: ENTERED.name,
      date: ENTERED.date,
      time: ENTERED.time,
      place: ENTERED.place,
    })

    // Negative proof against discard: place/date/time are NOT dropped on the way
    // to the planned API.
    expect(sent.place).toBe(ENTERED.place)
    expect(sent.date).toBe(ENTERED.date)
    expect(sent.time).toBe(ENTERED.time)
    // The unknown-time flag is captured deterministically (false here) — the
    // store must not omit it (laundering guard).
    expect(sent.birthTimeUnknown).toBe('false')
  })
})

// ── AT-018-1 [UNIT] — noon fallback + flag in the produced payload ───────────

describe('REQ-018 / AT-018-1 — empty birth time → 12:00 noon fallback + flag in the payload', () => {
  it('sets processed time deterministically to 12:00 and carries the flag', async () => {
    // No time entered → the store applies the disclosed noon fallback.
    const sent = await sentPersonalizationFor({
      name: ENTERED.name,
      date: ENTERED.date,
      time: '',
      place: ENTERED.place,
    })

    expect(sent.birthTimeUnknown).toBe('true')
    expect(sent.timeFallbackUsed).toBe('true')
    expect(sent.time).toBe('12:00')
    // place is still carried even when the time is the fallback.
    expect(sent.place).toBe(ENTERED.place)
  })

  it('known birth time (flag false) is passed through unchanged', async () => {
    const sent = await sentPersonalizationFor({
      name: ENTERED.name,
      date: ENTERED.date,
      time: '08:30',
      place: ENTERED.place,
    })
    expect(sent.time).toBe('08:30')
    expect(sent.birthTimeUnknown).toBe('false')
  })
})

// ── AT-004-2 [UNIT] — computeChart signature accepts place + birthTimeUnknown ─

describe('REQ-004 / AT-004-2 — computeChart accepts (date, time, place, birthTimeUnknown)', () => {
  it('does not throw and stays deterministic when place + flag are passed', () => {
    const call = () => computeChart(ENTERED.date, ENTERED.time, ENTERED.place, false)
    expect(call).not.toThrow()
    const chart = call()
    expect(chart).toHaveProperty('pillars')
    expect(chart).toHaveProperty('animal')
    expect(chart).toHaveProperty('element')
  })
})

// ── AT-004-3 [UNIT] — determinism of the captured/passed structure ───────────

describe('REQ-004 / AT-004-3 — same inputs → same captured structure (determinism)', () => {
  it('computeChart is deterministic for the same (date,time,place,flag) tuple', () => {
    const a = computeChart(ENTERED.date, ENTERED.time, ENTERED.place, false)
    const b = computeChart(ENTERED.date, ENTERED.time, ENTERED.place, false)
    expect(a).toEqual(b)
  })

  it('the captured/passed payload structure is stable across identical runs', async () => {
    const first = await sentPersonalizationFor({
      name: ENTERED.name, date: ENTERED.date, time: ENTERED.time, place: ENTERED.place,
    })
    const second = await sentPersonalizationFor({
      name: ENTERED.name, date: ENTERED.date, time: ENTERED.time, place: ENTERED.place,
    })
    // The birth-input subset that the planned API depends on must be identical.
    const pick = (p: Record<string, string>) => ({
      date: p.date, time: p.time, place: p.place, birthTimeUnknown: p.birthTimeUnknown,
    })
    expect(pick(first)).toEqual(pick(second))
  })
})

// ── AT-004-4 [UNIT] RED — placeholder boundary: place does NOT vary the chart ─

describe('REQ-004 / AT-004-4 [RED] — bazi.ts stays a placeholder (ACCURACY RED)', () => {
  it('place is carried but does NOT alter the placeholder chart output', () => {
    // Per ADR-002 pt.3 + REQ-004 AK-4: "place varies the placeholder image" is
    // out of scope (gegenstandslos — the poster is a placeholder). The chart must
    // therefore be INDEPENDENT of place. This pins the RED line: we do NOT pretend
    // the engine computes anything from the location.
    const here = computeChart(ENTERED.date, ENTERED.time, 'München', false)
    const there = computeChart(ENTERED.date, ENTERED.time, 'Tokyo', false)
    expect(here).toEqual(there)
  })
})

// ── AT-004-1 (couple) [REAL-BOUNDARY] — person B's fallback provenance survives ─
//
// Beat-0 Gegenthese (Vision §7.5 "collect-display-discard"): the couple branch in
// Personalize.tsx computes `btB` for the 2nd chart but historically wrote only
// `timeB`/`timeDisplayB` to the cart line — silently dropping person B's fallback
// PROVENANCE (birthTimeUnknownB / timeFallbackUsedB / fallbackReasonB) while the
// A-side carried the full set. So this drives the REAL `Personalize` couple flow
// through the production provider chain, marks the (shared) birth-time-unknown
// toggle so both charts take the disclosed noon fallback, clicks the real
// "add to cart" CTA, then builds + transmits the REAL `startCheckout` payload and
// inspects what actually reaches /api/checkout. Person A's provenance is pinned
// elsewhere; here the load-bearing assertion is that B's provenance is mirrored
// rather than collected-then-discarded.

const EN = translations.EN.personalize

function CoupleProviders({ children }: { children: React.ReactNode }) {
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

/** Bridge the real store out of the provider tree so the test can transmit the
 *  line that `Personalize`'s addToCart actually pushed. */
let storeRef: ReturnType<typeof useShopStore> | null = null
function StoreProbe() {
  storeRef = useShopStore()
  return null
}

/** Type into a labelled text/date/time input within the rendered Personalize page.
 *  The same label text also appears in the read-only summary, so we keep only the
 *  occurrences that sit inside a <label> wrapping an <input> (the editable fields);
 *  `index` then selects person A (0) vs person B (1). */
function fillByLabel(label: string, value: string, index = 0) {
  const inputs = screen
    .getAllByText(label)
    .map((el) => el.closest('label'))
    .filter((l): l is HTMLLabelElement => !!l && !!l.querySelector('input'))
    .map((l) => l.querySelector('input') as HTMLInputElement)
  fireEvent.change(inputs[index], { target: { value } })
}

describe('REQ-004 / AT-004-1 (couple) — person B noon-fallback provenance reaches the payload', () => {
  it('mirrors the A-side fallback fields for person B when the birth time is unknown', async () => {
    localStorage.setItem('sizhu_lang', 'EN')
    storeRef = null

    render(
      <>
        <StoreProbe />
        <Personalize />
      </>,
      { wrapper: CoupleProviders },
    )

    // Select the couple product type (its button carries the couple type name).
    fireEvent.click(screen.getByText(EN.types.couple.name))

    // Person A — full birth data (index 0 of each label).
    fillByLabel(EN_LABELS.name, 'Mara', 0)
    fillByLabel(EN_LABELS.place, 'München', 0)
    fillByLabel(EN_LABELS.date, '1990-06-15', 0)

    // Person B — full birth data (index 1).
    fillByLabel(EN_LABELS.name, 'Tomas', 1)
    fillByLabel(EN_LABELS.place, 'Lissabon', 1)
    fillByLabel(EN_LABELS.date, '1988-03-02', 1)

    // Mark the (shared) birth-time-unknown toggle → both charts take the disclosed
    // noon fallback. The first checkbox is the unknown-time toggle.
    fireEvent.click(screen.getAllByRole('checkbox')[0])

    // Click the real add-to-cart CTA.
    fireEvent.click(screen.getByText(new RegExp(escapeRe(EN.addToCart))))

    expect(storeRef).not.toBeNull()
    const cart = storeRef!.cart
    expect(cart.length).toBe(1)

    // Build + transmit the real checkout payload for that line.
    const { calls } = stubCheckoutFetch()
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true, configurable: true })
    await act(async () => {
      await startCheckout(cart, 4.9, 'en')
    })
    const checkoutCalls = calls.filter((c) => c.url === '/api/checkout')
    expect(checkoutCalls.length).toBe(1)
    const items = checkoutCalls[0].body.items as Array<{ personalization: Record<string, string> }>
    const sent = items[items.length - 1].personalization

    // Person A's fallback provenance is carried (baseline the A-side already met).
    expect(sent.birthTimeUnknown).toBe('true')
    expect(sent.timeFallbackUsed).toBe('true')

    // Person B's processed time is the disclosed noon fallback…
    expect(sent.timeB).toBe('12:00')
    // …and — the regression this test pins — B's fallback PROVENANCE survives,
    // mirroring the A-side fields rather than being collected-then-discarded.
    expect(sent.birthTimeUnknownB).toBe('true')
    expect(sent.timeFallbackUsedB).toBe('true')
    expect(sent.fallbackReasonB).toBe('customer_unknown_birth_time')
  })
})

const EN_LABELS = {
  name: translations.EN.configurator.name,
  place: translations.EN.configurator.place,
  date: translations.EN.configurator.date,
  time: translations.EN.configurator.time,
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
