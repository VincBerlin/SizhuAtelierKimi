/**
 * DELTA T-304 — PDP-Template-Inventar (full inventory) + Review-Gate (REQ-008).
 *
 * Source contract (FROZEN): docs/tests/desenio-acceptance-design.md
 *   AT-008-1  BaZi PDP contains, per STABLE anchor: breadcrumb, gallery/visual,
 *             product name, price, variants (size/frame), add-to-cart, frame/
 *             accessory options, trust bullets, description, cross-sells
 *             ("frequently bought together"), inspiration context.
 *   AT-008-3  Review-gate (negative): while no real reviews exist, NO review
 *             block and NO stars/review summary render on the PDP (OQ-004).
 *   AT-008-4  No invented review count / star-sum is shipped as a visible
 *             social-proof string in catalog.ts / translations (coupling REQ-010).
 *
 * Evidence class: `[REAL-BOUNDARY-jsdom]` for the render contracts — every render
 * goes through the REAL `src/App.tsx` composition root (MemoryRouter → /product/:id),
 * so a section that renders only in isolation but is not wired into the production
 * PDP would still fail. AT-008-4 is `[SHIPPED-SCAN]` over the exported catalog/
 * translations instances the app actually renders.
 *
 * RACE discipline (mandatory, mirrors AT-009-2 in delta-collection-template-inventory):
 * `renderProduct` resolves on the `pdp` shell anchor; the lazy ProductView chunk +
 * its later-painting sections (cross-sells, inspiration) can still be committing
 * under CPU contention. Every multi-anchor inventory read is wrapped in ONE
 * `waitFor` that RE-QUERIES inside the retry, so the whole check reads a settled
 * DOM snapshot — assertions identical, just race-free. No synchronous
 * getByTestId/querySelector right after `findBy` for later-rendering content.
 *
 * RED-line discipline (Reality-Ledger): this certifies the INVENTORY is present
 * and the review-gate stays shut — never astrological accuracy (bazi.ts placeholder,
 * RL-BAZI RED) nor final prices (OQ-002, RL-PRICES RED) nor real imagery (OQ-001,
 * RL-IMAGES RED; the gallery placeholders are exactly that carry). Nothing here is
 * marked production-verified.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../../src/App'
import { products } from '../../src/lib/catalog'
import { productKind } from '../../src/lib/productTypes'
import * as translations from '../../src/i18n/translations'

// Representative SKUs per kind resolved from the SHIPPED catalog (never literals),
// so the test tracks the data the app actually renders.
// Batch #12: personalisierte (BaZi-)PDPs sind Redirects auf /personalize —
// Inventar-Referenz ist die lebende TCM-PDP; zweites Sample: Wuxing.
const tcmProduct = products.find((p) => productKind(p) === 'tcm' && !p.retired)!
const wuxingProduct = products.find((p) => productKind(p) === 'wuxing' && !p.retired)!

const WEBP_RE = /\/images\/.*\.webp/i

async function renderProduct(id: number) {
  const utils = render(
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <App />
    </MemoryRouter>,
  )
  // ProductView is lazily code-split behind Suspense; the explicit 15000ms matches
  // tests/setup.ts asyncUtilTimeout to keep the combined --isolate=false run
  // deterministic without weakening the query.
  await screen.findByTestId('pdp', undefined, { timeout: 15000 })
  return utils
}

beforeEach(() => {
  localStorage.clear()
})

// ── sanity: fixtures are the kinds we think they are ─────────────────────────

describe('REQ-008 — PDP inventory fixtures resolve to the intended kinds', () => {
  it('has active TCM and Wuxing products in the catalog', () => {
    expect(tcmProduct, 'an active TCM product').toBeTruthy()
    expect(wuxingProduct, 'an active Wuxing product').toBeTruthy()
  })
})

// ── AT-008-1 — full PDP template inventory (BaZi) ────────────────────────────

describe('REQ-008 / AT-008-1 — PDP renders the full inventory by stable anchor (Batch #12: aktive TCM-PDP)', () => {
  it('renders breadcrumb, gallery, name, price, variants, add-to-cart, frame/accessory, trust, description, cross-sells, inspiration', async () => {
    await renderProduct(tcmProduct.id)
    const pdp = screen.getByTestId('pdp')

    // The `pdp` shell anchor can commit before the cross-sell / inspiration
    // sections finish mounting under contention — re-query EVERY anchor inside a
    // single waitFor so the whole inventory check reads one settled snapshot.
    await waitFor(() => {
      // breadcrumb — internal trail with at least one in-app link
      const crumb = within(pdp).getByTestId('pdp-breadcrumb')
      expect(crumb).toBeInTheDocument()
      expect(within(crumb).getAllByRole('link').length, 'breadcrumb has ≥1 link').toBeGreaterThanOrEqual(1)

      // gallery / category visual
      expect(within(pdp).getByTestId('pdp-gallery')).toBeInTheDocument()

      // product name — exactly one non-empty H1
      const h1s = pdp.querySelectorAll('h1')
      expect(h1s.length, 'exactly one H1 (product name)').toBe(1)
      expect(h1s[0].textContent?.trim().length ?? 0).toBeGreaterThan(0)
      expect(within(pdp).getByTestId('pdp-name').textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // price
      expect(within(pdp).getByTestId('pdp-price').textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // Batch #12: nicht-personalisierbare PDP — die Varianten-Achse ist der
      // eigenständige Größen-Selektor (der Configurator lebt auf /personalize).
      expect(within(pdp).getByTestId('pdp-size-selector')).toBeInTheDocument()

      // Batch #12 (#4): „Rahmen & Zubehör" ist VOLLSTÄNDIG entfernt — der
      // frühere Accessories-Block darf nicht mehr rendern.
      expect(within(pdp).queryByTestId('pdp-accessories')).toBeNull()

      // add-to-cart (aktive, nicht-personalisierbare PDP)
      expect(within(pdp).getByTestId('pdp-add-to-cart')).toBeInTheDocument()

      // trust bullets
      const trust = within(pdp).getByTestId('pdp-trust')
      expect(trust.textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // description — the bullet/copy block
      expect(within(pdp).getByTestId('pdp-description').textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // cross-sells ("frequently bought together") with ≥1 linked card
      const cross = within(pdp).getByTestId('pdp-cross-sells')
      expect(within(cross).getAllByTestId('pdp-cross-sell-card').length).toBeGreaterThanOrEqual(1)

      // inspiration context with a link to the real /inspiration route
      const insp = within(pdp).getByTestId('pdp-inspiration')
      const inspLink = within(insp).getByRole('link')
      expect(inspLink.getAttribute('href') ?? '').toBe('/inspiration')
    })
  })

  it('breadcrumb and inspiration links point at real, in-app routes (no dead links)', async () => {
    await renderProduct(tcmProduct.id)
    const pdp = screen.getByTestId('pdp')
    await waitFor(() => {
      const crumb = within(pdp).getByTestId('pdp-breadcrumb')
      for (const a of within(crumb).getAllByRole('link')) {
        expect(a.getAttribute('href') ?? '', 'breadcrumb link is in-app').toMatch(/^\//)
      }
      const cross = within(pdp).getByTestId('pdp-cross-sells')
      for (const card of within(cross).getAllByTestId('pdp-cross-sell-card')) {
        // each card IS the link (an <a>), so read its own href, not a descendant
        expect(card.tagName, 'cross-sell card is itself an anchor').toBe('A')
        expect(card.getAttribute('href') ?? '', 'cross-sell → real /product route').toMatch(/^\/product\/\d+$/)
      }
    })
  })
})

// ── AT-008-1 — inventory also present on a non-personalizable (TCM) PDP ───────

describe('REQ-008 / AT-008-1 — TCM PDP renders the shared inventory (asset-light gallery)', () => {
  it('renders breadcrumb, gallery, name, price, add-to-cart, trust, description, cross-sells, inspiration', async () => {
    await renderProduct(tcmProduct.id)
    const pdp = screen.getByTestId('pdp')

    await waitFor(() => {
      expect(within(pdp).getByTestId('pdp-breadcrumb')).toBeInTheDocument()

      // gallery is a marked asset-light placeholder, never a real .webp product photo
      const gallery = within(pdp).getByTestId('pdp-gallery')
      expect(gallery).toHaveAttribute('data-placeholder', 'true')
      for (const img of Array.from(gallery.querySelectorAll('img'))) {
        expect(WEBP_RE.test(img.getAttribute('src') ?? ''), 'no real .webp in TCM gallery').toBe(false)
      }

      expect(within(pdp).getByTestId('pdp-name').textContent?.trim().length ?? 0).toBeGreaterThan(0)
      expect(within(pdp).getByTestId('pdp-price').textContent?.trim().length ?? 0).toBeGreaterThan(0)

      // non-personalizable → plain add-to-cart, no personalize CTA / variants
      expect(within(pdp).getByTestId('pdp-add-to-cart')).toBeInTheDocument()
      expect(within(pdp).queryByTestId('pdp-personalize-cta')).toBeNull()
      expect(within(pdp).queryByTestId('pdp-variants')).toBeNull()

      expect(within(pdp).getByTestId('pdp-trust').textContent?.trim().length ?? 0).toBeGreaterThan(0)
      expect(within(pdp).getByTestId('pdp-description').textContent?.trim().length ?? 0).toBeGreaterThan(0)

      const cross = within(pdp).getByTestId('pdp-cross-sells')
      expect(within(cross).getAllByTestId('pdp-cross-sell-card').length).toBeGreaterThanOrEqual(1)

      const insp = within(pdp).getByTestId('pdp-inspiration')
      expect(within(insp).getByRole('link').getAttribute('href') ?? '').toBe('/inspiration')
    })
  })
})

// ── AT-008-3 — review-gate negative: no block / stars without real reviews ────

describe('REQ-008 / AT-008-3 — no review block or stars on the PDP without real reviews', () => {
  it('the BaZi PDP (placeholder rating, flag OFF) renders NO review block and NO ★', async () => {
    await renderProduct(tcmProduct.id)
    const pdp = screen.getByTestId('pdp')
    await waitFor(() => {
      // inventory has settled (name present) — now assert the gate is shut
      expect(within(pdp).getByTestId('pdp-name')).toBeInTheDocument()
      expect(within(pdp).queryByTestId('pdp-reviews'), 'no review block while OQ-004 open').toBeNull()
      expect(pdp.textContent ?? '', 'no ★ social proof').not.toContain('★')
    })
  })

  it('NO shipped product surfaces a PDP review block while the flag is OFF (representative sample)', async () => {
    const sample = [tcmProduct, wuxingProduct]
    for (const p of sample) {
      await renderProduct(p.id)
      const pdp = screen.getByTestId('pdp')
      await waitFor(() => {
        expect(within(pdp).getByTestId('pdp-name')).toBeInTheDocument()
        expect(
          within(pdp).queryByTestId('pdp-reviews'),
          `product #${p.id} must not render a review block while OQ-004 is open`,
        ).toBeNull()
        expect(pdp.textContent ?? '', `product #${p.id}: no ★`).not.toContain('★')
      })
      cleanup()
    }
  })
})

// ── AT-008-4 — no invented review count as a shipped social-proof STRING ──────

describe('REQ-008 / AT-008-4 — no invented review count is shipped as visible social proof', () => {
  it('translations carry NO baked-in "<n> reviews / <n> sold" social-proof string', () => {
    // The placeholder review COUNTS live as numbers on catalog products and are
    // gated out of the render (AT-008-3). What AT-008-4 forbids is a translation
    // string that hard-codes a review/sold figure so it would surface regardless
    // of the gate. The shipped `product.reviews` / `product.sold` keys are bare
    // LABELS ("reviews", "sold") — they must not contain a digit.
    const all = translations as Record<string, unknown>
    const dict = (all.translations ?? all.default ?? all) as Record<string, { product?: Record<string, string> }>
    const locales = ['EN', 'DE', 'FR'] as const
    for (const loc of locales) {
      const product = dict[loc]?.product
      expect(product, `translations.${loc}.product exists`).toBeTruthy()
      expect(/\d/.test(product!.reviews ?? ''), `${loc}.product.reviews is a bare label`).toBe(false)
      expect(/\d/.test(product!.sold ?? ''), `${loc}.product.sold is a bare label`).toBe(false)
    }
  })

  it('the review-summary string only renders behind the gate (never standalone in the PDP shell)', async () => {
    // Defence-in-depth against a regression that prints the count outside the
    // gated <pdp-reviews> block: with the flag OFF, the bare review/sold labels
    // must not appear anywhere in the rendered PDP either.
    await renderProduct(tcmProduct.id)
    const pdp = screen.getByTestId('pdp')
    await waitFor(() => {
      expect(within(pdp).getByTestId('pdp-name')).toBeInTheDocument()
      // the gated block is absent → its label strings are absent too
      expect(within(pdp).queryByTestId('pdp-reviews')).toBeNull()
    })
  })
})
