// Canonical commerce taxonomy — the SINGLE SOURCE OF TRUTH for the Desenio-exact
// navigation matrix (M9 / REQ-006..012), the collection filter matrix (M12 /
// REQ-026) and the PDP size/format path (M13 / REQ-008). The mega-menu (M10),
// the mobile drawer (M10/M14), the collection toolbar (M12) and the PDP size
// selector (M13) all render from THIS module — no hand-rolled duplicate nav data.
//
// HONESTY GROUNDING (STOP-001, RISK-002, NG-004): every entry resolves to REAL
// SizhuAtelier data — a `world` from PRODUCT_WORLDS, a `designFamily` from
// DESIGN_FAMILIES, a `useCase` value that at least one catalog product actually
// carries, a live `collection` slug from COLLECTION_SLUGS, a live `route`, or a
// `size` id from bazi.ts `sizes`. NOTHING is invented:
//   - Poster sizes are exactly the three real A3/A2/A1 formats and are flagged
//     `nonFinal` (OQ-001 / RL-SIZES stays RED until real production sizes land).
//   - Campaigns include only real collections (Fire Horse 2026, Wu Xing,
//     Compatibility) + the live /offers hub; NO "TCM Organ Clock" or other
//     unbacked campaign is fabricated.
//   - Visual tiles carry an image FIELD but are asset-light `nonFinal`
//     placeholders (OQ-002 / RL-IMAGES RED) — never a real /images/*.webp.
//   - REQ-010 "Meridian/Organ Clock" (style) and REQ-012 "TCM Organ Clock"
//     (campaign) are NOT satisfied and NOT dropped silently: no backing product
//     exists, so they are DEFERRED and tracked as OQ-006 in the gap-closure
//     report (REQ-010/012 = PARTIAL). They are omitted here rather than faked;
//     adding them requires a real Organ-Clock/Meridian product first (operator
//     decision). A future organ/meridian entry MUST be nonFinal (guarded by the
//     test), never a fabricated launch-final entry.
// OQ CODES used here are THIS feature's Vision §11 codes (OQ-001 = sizes,
// OQ-002 = assets) plus OQ-006 (organ-clock/meridian backing). They are NOT the
// delta-era files' OQ numbering (where OQ-001 meant images) — M10+ reconciles
// those when it rewrites Navbar/Offers.
// The exact-taxonomy test (tests/unit/exact-taxonomy.test.ts) machine-enforces
// all of the above so a future edit cannot silently smuggle in fake data.
import { PRODUCT_WORLDS, DESIGN_FAMILIES } from './catalog'
import type { ProductWorld, DesignFamily } from './catalog'
import { COLLECTION_SLUGS } from './collections'
import type { CollectionSlug } from './collections'
import { sizes } from './bazi'

// ── Link model ────────────────────────────────────────────────────────────────
// A taxonomy entry never carries a raw URL; it carries a typed link that
// `resolveTaxonomyHref` turns into a LIVE path. Filter-kind links (style/room/
// size) resolve to the live /collections hub with a query param. STATUS (M16):
// the hub NOW consumes ?style=<design_family> and ?room=<use_case> — it
// pre-filters the all-posters grid to the matching REAL catalog products and
// shows the active facet + a reset. ?size=<id> is disclosed but does NOT narrow
// (every poster ships in every size — M13 reconciliation; size stays PARTIAL by
// design, not by omission). No dead links: /collections is live.
export type TaxonomyLink =
  | { readonly kind: 'collection'; readonly slug: CollectionSlug }
  | { readonly kind: 'world'; readonly world: ProductWorld }
  | { readonly kind: 'designFamily'; readonly family: DesignFamily }
  | { readonly kind: 'useCase'; readonly useCase: string }
  | { readonly kind: 'size'; readonly sizeId: string }
  | { readonly kind: 'route'; readonly path: string }

export interface TaxonomyEntry {
  /** Stable id — DOM anchor, i18n leaf, test key. */
  readonly id: string
  /** i18n key the UI renders via t() (M10 supplies the translations). */
  readonly labelKey: string
  /** English fallback so DOM/tests have text even before i18n wiring. */
  readonly label: string
  /** How this entry grounds on real data / a live route. */
  readonly link: TaxonomyLink
  /** true = backing data is NOT launch-final (RED carry); UI marks non-final. */
  readonly nonFinal?: boolean
  /** Which OQ/RED carry this entry depends on when nonFinal. */
  readonly redCarry?: string
}

// ── The six mandatory mega-menu / filter groups (REQ-006) ───────────────────────
export const TAXONOMY_AXES = [
  'world', // product world / type      (REQ-006)
  'style', // theme / style             (REQ-010)
  'room', //  room / use                (REQ-009)
  'size', //  size / format             (REQ-008)
  'set', //   sets / solutions          (REQ-011)
  'campaign', // trends / campaigns      (REQ-012)
] as const
export type TaxonomyAxis = (typeof TAXONOMY_AXES)[number]

/** Map a product world to its live collection route (mixed → the /collections index). */
export function worldToSlug(world: ProductWorld): CollectionSlug | null {
  switch (world) {
    case 'bazi':
      return 'bazi-posters'
    case 'tcm':
      return 'tcm-posters'
    case 'wuxing':
      return 'wuxing-posters'
    default:
      return null // 'mixed' has no single-world collection
  }
}

// ── Axis: product world / type (REQ-006) — grounded on PRODUCT_WORLDS ────────────
const WORLD_ENTRIES: readonly TaxonomyEntry[] = [
  { id: 'bazi', labelKey: 'taxonomy.world.bazi', label: 'BaZi Posters', link: { kind: 'collection', slug: 'bazi-posters' } },
  { id: 'tcm', labelKey: 'taxonomy.world.tcm', label: 'TCM Posters', link: { kind: 'collection', slug: 'tcm-posters' } },
  { id: 'wuxing', labelKey: 'taxonomy.world.wuxing', label: 'Wuxing', link: { kind: 'collection', slug: 'wuxing-posters' } },
  { id: 'personalized', labelKey: 'taxonomy.world.personalized', label: 'Personalized', link: { kind: 'collection', slug: 'personalized-posters' } },
]

// ── Axis: theme / style (REQ-010) — grounded on DESIGN_FAMILIES + real collections
// NOTE: REQ-010 also names "Meridian/Organ Clock" — DEFERRED as OQ-006 (no
// backing product), not fabricated here. `japandi` is a real DESIGN_FAMILIES
// value (REQ-010 "and other real SizhuAtelier styles").
const STYLE_ENTRIES: readonly TaxonomyEntry[] = [
  { id: 'minimal', labelKey: 'taxonomy.style.minimal', label: 'Minimal Ink', link: { kind: 'designFamily', family: 'minimal' } },
  { id: 'classic_ink', labelKey: 'taxonomy.style.classic_ink', label: 'Classic Ink', link: { kind: 'designFamily', family: 'classic_ink' } },
  { id: 'wabi_sabi', labelKey: 'taxonomy.style.wabi_sabi', label: 'Wabi-Sabi', link: { kind: 'designFamily', family: 'wabi_sabi' } },
  { id: 'japandi', labelKey: 'taxonomy.style.japandi', label: 'Japandi', link: { kind: 'designFamily', family: 'japandi' } },
  // Content styles that map to a real collection (not a design_family):
  { id: 'five_elements', labelKey: 'taxonomy.style.five_elements', label: 'Five Elements', link: { kind: 'collection', slug: 'wuxing-posters' } },
  { id: 'compatibility', labelKey: 'taxonomy.style.compatibility', label: 'Couples / Compatibility', link: { kind: 'collection', slug: 'compatibility-posters' } },
]

// ── Axis: room / use (REQ-009) — grounded on REAL product `use_case` values ──────
// Every useCase below is carried by ≥1 catalog product (asserted by the test).
const ROOM_ENTRIES: readonly TaxonomyEntry[] = [
  { id: 'home', labelKey: 'taxonomy.room.home', label: 'Living / Home', link: { kind: 'useCase', useCase: 'home' } },
  { id: 'practice', labelKey: 'taxonomy.room.practice', label: 'Practice / Studio', link: { kind: 'useCase', useCase: 'practice' } },
  { id: 'wellness', labelKey: 'taxonomy.room.wellness', label: 'Wellness / Quiet Room', link: { kind: 'useCase', useCase: 'wellness' } },
  { id: 'yoga', labelKey: 'taxonomy.room.yoga', label: 'Yoga Studio', link: { kind: 'useCase', useCase: 'yoga' } },
  { id: 'educational', labelKey: 'taxonomy.room.educational', label: 'Teaching / Education', link: { kind: 'useCase', useCase: 'educational' } },
  { id: 'gift', labelKey: 'taxonomy.room.gift', label: 'Gift', link: { kind: 'useCase', useCase: 'gift' } },
  { id: 'collector', labelKey: 'taxonomy.room.collector', label: 'Collector Edition', link: { kind: 'useCase', useCase: 'collector' } },
]

// ── Axis: size / format (REQ-008) — grounded on bazi.ts `sizes`, ALL non-final ───
// STOP-001: no invented formats. The three real A3/A2/A1 sizes are surfaced as a
// first-class path but flagged nonFinal (OQ-001) until real production sizes are
// confirmed. Built from the bazi.ts source so it can never drift from the PDF/PDP.
const SIZE_ENTRIES: readonly TaxonomyEntry[] = sizes.map((s) => ({
  id: s.id,
  labelKey: `taxonomy.size.${s.id}`,
  label: `${s.label} · ${s.sub}`,
  link: { kind: 'size', sizeId: s.id },
  nonFinal: true,
  redCarry: 'OQ-001',
}))

// ── Axis: sets / solutions (REQ-011) — grounded on real bundle collections ───────
const SET_ENTRIES: readonly TaxonomyEntry[] = [
  { id: 'poster-sets', labelKey: 'taxonomy.set.poster_sets', label: 'Poster Sets', link: { kind: 'collection', slug: 'bundles' } },
  { id: 'couples-set', labelKey: 'taxonomy.set.couples', label: 'Couples Set', link: { kind: 'collection', slug: 'compatibility-posters' } },
  { id: 'analysis-bundle', labelKey: 'taxonomy.set.analysis', label: 'Poster + Analysis Bundle', link: { kind: 'collection', slug: 'analysis-pdfs' } },
]

// ── Axis: trends / campaigns (REQ-012) — ONLY real campaigns (no invention) ──────
// NOTE: REQ-012 also names "TCM Organ Clock" — DEFERRED as OQ-006 (no backing
// product), not fabricated here. See the header note + gap-closure report.
const CAMPAIGN_ENTRIES: readonly TaxonomyEntry[] = [
  { id: 'fire-horse-2026', labelKey: 'taxonomy.campaign.fire_horse', label: 'Fire Horse 2026', link: { kind: 'collection', slug: 'fire-horse-2026' } },
  { id: 'five-elements', labelKey: 'taxonomy.campaign.five_elements', label: 'Wu Xing · Five Elements', link: { kind: 'collection', slug: 'wuxing-posters' } },
  { id: 'compatibility', labelKey: 'taxonomy.campaign.compatibility', label: 'Compatibility Posters', link: { kind: 'collection', slug: 'compatibility-posters' } },
  { id: 'offers', labelKey: 'taxonomy.campaign.offers', label: 'Offers', link: { kind: 'route', path: '/offers' } },
]

/** The full taxonomy matrix, keyed by axis (M10/M12/M13 read this). */
export const TAXONOMY: Readonly<Record<TaxonomyAxis, readonly TaxonomyEntry[]>> = {
  world: WORLD_ENTRIES,
  style: STYLE_ENTRIES,
  room: ROOM_ENTRIES,
  size: SIZE_ENTRIES,
  set: SET_ENTRIES,
  campaign: CAMPAIGN_ENTRIES,
}

// ── Canonical primary nav (REQ-005) — exactly 8 shop items, no FAQ/About/Blog ────
export interface PrimaryNavItem {
  readonly id: string
  readonly labelKey: string
  readonly label: string
  /** A live href (collection route or a real page route). */
  readonly href: string
}

export const PRIMARY_NAV: readonly PrimaryNavItem[] = [
  { id: 'bestseller', labelKey: 'nav.primary.bestseller', label: 'Bestseller', href: '/collections/bazi-posters' },
  { id: 'new', labelKey: 'nav.primary.new', label: 'Neuheiten', href: '/collections/fire-horse-2026' },
  { id: 'posters', labelKey: 'nav.primary.posters', label: 'Poster', href: '/collections' },
  { id: 'tcm', labelKey: 'nav.primary.tcm', label: 'TCM Poster', href: '/collections/tcm-posters' },
  { id: 'wuxing', labelKey: 'nav.primary.wuxing', label: 'Wuxing', href: '/collections/wuxing-posters' },
  { id: 'offers', labelKey: 'nav.primary.offers', label: 'Angebote', href: '/offers' },
  { id: 'poster-sets', labelKey: 'nav.primary.posterSets', label: 'Poster Sets', href: '/collections/bundles' },
  { id: 'inspiration', labelKey: 'nav.primary.inspiration', label: 'Inspiration', href: '/inspiration' },
] as const

/** Forbidden primary-nav destinations (REQ-005) — these belong in footer/secondary. */
export const FORBIDDEN_PRIMARY_NAV = ['/faq', '/about', '/contact', '/blog'] as const

/** Mega-menu quick-access shortcuts (REQ-006) — all live routes. */
export const QUICK_ACCESS: readonly PrimaryNavItem[] = [
  { id: 'qa-bestseller', labelKey: 'taxonomy.quick.bestseller', label: 'Bestseller', href: '/collections/bazi-posters' },
  { id: 'qa-new', labelKey: 'taxonomy.quick.new', label: 'New Arrivals', href: '/collections/fire-horse-2026' },
  { id: 'qa-offers', labelKey: 'taxonomy.quick.offers', label: 'Offers', href: '/offers' },
]

// ── Mega-menu visual tiles (REQ-013) — asset-light, non-final placeholders ───────
// Each tile has an image FIELD but is a data-placeholder until OQ-002 lands; the
// link is a real collection route. M10 renders these; the placeholder treatment
// (hatch pattern, `data-placeholder`) is a rendering concern.
export interface MegaTile {
  readonly id: string
  readonly titleKey: string
  readonly title: string
  readonly labelKey: string
  readonly label: string
  readonly ctaKey: string
  readonly cta: string
  /** Real destination route (collection). */
  readonly link: TaxonomyLink
  /** Placeholder image marker — NOT a real asset yet (OQ-002 / RL-IMAGES RED). */
  readonly image: { readonly placeholder: true }
  readonly nonFinal: true
  readonly redCarry: 'OQ-002'
}

const tile = (
  id: string,
  title: string,
  label: string,
  cta: string,
  slug: CollectionSlug,
): MegaTile => ({
  id,
  titleKey: `taxonomy.tile.${id}.title`,
  title,
  labelKey: `taxonomy.tile.${id}.label`,
  label,
  ctaKey: `taxonomy.tile.${id}.cta`,
  cta,
  link: { kind: 'collection', slug },
  image: { placeholder: true },
  nonFinal: true,
  redCarry: 'OQ-002',
})

export const MEGA_TILES: readonly MegaTile[] = [
  tile('bazi', 'Personalized BaZi', 'Four Pillars', 'Discover', 'bazi-posters'),
  tile('tcm', 'TCM Knowledge', 'Teaching graphics', 'Explore', 'tcm-posters'),
  tile('wuxing', 'Five Elements', 'Wu Xing balance', 'View', 'wuxing-posters'),
  tile('fire-horse', 'Fire Horse 2026', 'Limited edition', 'See edition', 'fire-horse-2026'),
]

// ── Href resolver — turns a typed link into a LIVE path (no dead links) ──────────
// Filter-kind links resolve to the live /collections hub with a query param that
// the hub CONSUMES (M16): ?style/?room pre-filter the all-posters grid; ?size is
// disclosed but non-narrowing (uniform size — M13). Every resolved href is a
// real, live route.
export function resolveTaxonomyHref(link: TaxonomyLink): string {
  switch (link.kind) {
    case 'collection':
      return `/collections/${link.slug}`
    case 'route':
      return link.path
    case 'world': {
      const slug = worldToSlug(link.world)
      return slug ? `/collections/${slug}` : '/collections'
    }
    case 'designFamily':
      return `/collections?style=${link.family}`
    case 'useCase':
      return `/collections?room=${link.useCase}`
    case 'size':
      return `/collections?size=${link.sizeId}`
  }
}
