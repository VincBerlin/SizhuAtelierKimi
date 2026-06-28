import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { ShoppingBag, Menu, X, ChevronDown, Search, User } from 'lucide-react'
import { useShopStore } from '../store/ShopStore'
import { useT, LANGS } from '../i18n/I18nProvider'
import { type Lang } from '../i18n/translations'
import HeaderSearch from './shop/HeaderSearch'
import { C, FONT_SERIF, FONT_SANS } from '../lib/tokens'

// REQ-003 / T-201 — shop-oriented PRIMARY navigation. Exactly these 8 entries in
// spec order: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote,
// Poster Sets, Inspiration. FAQ/About/Contact/Blog are intentionally NOT here
// (FM-03: the V2 `mainLinks` shipped blog/faq/about/contact — removed). Every
// `href` targets an existing route (no dead link, AT-003-3): collection slugs,
// /inspiration, and the full curated /offers hub (REQ-024 / T-305 — ≥2 curated
// sections live, AT-024-4). The `data-nav-primary` anchor backs the
// real-boundary REQ-003 tests; it is distinct from `data-nav-top` (the utility/
// mega-trigger budget the REQ-009 menu test counts).
export interface PrimaryNavEntry { i18nKey: string; href: string }

export const PRIMARY_NAV: PrimaryNavEntry[] = [
  { i18nKey: 'nav.primary.bestseller', href: '/collections/bazi-posters' },
  { i18nKey: 'nav.primary.new', href: '/collections/fire-horse-2026' },
  { i18nKey: 'nav.primary.posters', href: '/collections' },
  { i18nKey: 'nav.primary.tcm', href: '/collections/tcm-posters' },
  { i18nKey: 'nav.primary.wuxing', href: '/collections/wuxing-posters' },
  { i18nKey: 'nav.primary.offers', href: '/offers' },
  { i18nKey: 'nav.primary.posterSets', href: '/collections/bundles' },
  { i18nKey: 'nav.primary.inspiration', href: '/inspiration' },
]

// REQ-004 / T-203 — asset-light MEGA-MENU promo tiles. The relevant buy-intent
// columns (Poster / TCM / Wuxing) each carry ≥2 text-forward tiles. Each tile is
// a real link (title + CTA + live /collections|/personalize|/offers href) whose
// image field is a GENERIC placeholder (`data-placeholder`) — never a real
// /images/*.webp product photo (FM-11 / CAN-014 / RISK-001). Real imagery lands
// only after OQ-001 (RL-IMAGES stays RED until then).
interface MegaTile { titleKey: string; ctaKey: string; href: string; tint: string }
interface MegaTileColumn { testid: string; titleKey: string; tiles: MegaTile[] }

const MEGA_TILE_COLUMNS: MegaTileColumn[] = [
  {
    testid: 'mega-tiles-posters',
    titleKey: 'nav.mega.personalized.title',
    tiles: [
      { titleKey: 'nav.mega.tiles.posters.baziTitle', ctaKey: 'nav.mega.tiles.posters.baziCta', href: '/collections/bazi-posters', tint: '#E2DACB' },
      { titleKey: 'nav.mega.tiles.posters.personalizedTitle', ctaKey: 'nav.mega.tiles.posters.personalizedCta', href: '/collections/personalized-posters', tint: '#D8C3B4' },
    ],
  },
  {
    testid: 'mega-tiles-tcm',
    titleKey: 'nav.mega.tcm.title',
    tiles: [
      { titleKey: 'nav.mega.tiles.tcm.eduTitle', ctaKey: 'nav.mega.tiles.tcm.eduCta', href: '/collections/tcm-posters', tint: '#AFBCA6' },
      { titleKey: 'nav.mega.tiles.tcm.practiceTitle', ctaKey: 'nav.mega.tiles.tcm.practiceCta', href: '/collections/tcm-posters', tint: '#C8B89A' },
    ],
  },
  {
    testid: 'mega-tiles-wuxing',
    titleKey: 'nav.mega.wuxing.title',
    tiles: [
      { titleKey: 'nav.mega.tiles.wuxing.fiveTitle', ctaKey: 'nav.mega.tiles.wuxing.fiveCta', href: '/collections/wuxing-posters', tint: '#CFC4B2' },
      { titleKey: 'nav.mega.tiles.wuxing.balanceTitle', ctaKey: 'nav.mega.tiles.wuxing.balanceCta', href: '/collections/wuxing-posters', tint: '#D9D0C1' },
    ],
  },
]

// REQ-009 — real grouped MEGA-MENU. Columns are organised by buy-intent
// (product world / use-case / format) per PRD §6.1/§6.2; every item targets a
// real REQ-010 /collections/* route (or a live entry route like /personalize),
// never a dead link. The `testid` anchors back the real-boundary tests.
interface MegaItem { i18nKey: string; href: string }
interface MegaColumn { testid: string; titleKey: string; items: MegaItem[] }

const MEGA_COLUMNS: MegaColumn[] = [
  {
    testid: 'mega-col-personalized',
    titleKey: 'nav.mega.personalized.title',
    items: [
      { i18nKey: 'nav.mega.personalized.baziPosters', href: '/collections/bazi-posters' },
      { i18nKey: 'nav.mega.personalized.personalizedPosters', href: '/collections/personalized-posters' },
      { i18nKey: 'nav.mega.personalized.compatibility', href: '/collections/compatibility-posters' },
      { i18nKey: 'nav.mega.personalized.startPersonalizing', href: '/personalize' },
    ],
  },
  {
    testid: 'mega-col-tcm',
    titleKey: 'nav.mega.tcm.title',
    items: [{ i18nKey: 'nav.mega.tcm.tcmPosters', href: '/collections/tcm-posters' }],
  },
  {
    testid: 'mega-col-wuxing',
    titleKey: 'nav.mega.wuxing.title',
    items: [{ i18nKey: 'nav.mega.wuxing.wuxingPosters', href: '/collections/wuxing-posters' }],
  },
  {
    testid: 'mega-col-analysis-pdfs',
    titleKey: 'nav.mega.analysis.title',
    items: [{ i18nKey: 'nav.mega.analysis.analysisPdfs', href: '/collections/analysis-pdfs' }],
  },
  {
    testid: 'mega-col-bundles',
    titleKey: 'nav.mega.bundles.title',
    items: [{ i18nKey: 'nav.mega.bundles.bundles', href: '/collections/bundles' }],
  },
  {
    testid: 'mega-col-featured',
    titleKey: 'nav.mega.featured.title',
    items: [
      { i18nKey: 'nav.mega.featured.fireHorse', href: '/collections/fire-horse-2026' },
      // REQ-011 / AT-011-4 — the curated /inspiration gallery wall is wired into
      // production navigation here (Featured column). This entry also flows into
      // the mobile drawer flat list (MEGA_COLUMNS.flatMap below), so the page is
      // user-reachable on desktop AND mobile, not just by typing the URL.
      { i18nKey: 'nav.mega.featured.inspiration', href: '/inspiration' },
      { i18nKey: 'nav.mega.featured.allCollections', href: '/collections' },
    ],
  },
]
// REQ-003 / FM-03 — the V2 `mainLinks` (blog/faq/about/contact) are REMOVED from
// the primary nav. Those destinations remain reachable from the footer/secondary
// nav; they MUST NOT appear in the shop-oriented primary bar.

// ≥44px touch targets for header icon controls (§6.1 / §7.4).
const HIT = { minWidth: 44, minHeight: 44 } as const

// REQ-015 / AT-015-3 — flag emoji per locale. The flag is rendered to the RIGHT
// of the (unchanged) abbreviation in every picker entry. EN maps to the UK flag
// (the EN copy is en-GB spelling: colour/personalised). The abbreviation text is
// never altered — only a trailing flag glyph is added.
const LANG_FLAG: Record<Lang, string> = { EN: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸' }

function LangDropdown({ size = 12, up = false, align = 'right' }: { size?: number; up?: boolean; align?: 'left' | 'right' }) {
  const { lang, setLang } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className="flex items-center justify-center transition-colors hover:text-[#C0492E]"
        style={{ gap: 5, minHeight: 44, minWidth: 44, background: 'none', border: `1px solid ${C.borderInput}`, borderRadius: 999, padding: '5px 11px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: size, fontWeight: 600, color: C.ink }}
      >
        {lang} <ChevronDown size={size + 2} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <div
        role="listbox"
        style={{
          position: 'absolute', minWidth: 86, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10,
          boxShadow: '0 16px 36px -18px rgba(28,24,18,0.4)', padding: 6, zIndex: 60,
          ...(up ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
          ...(align === 'right' ? { right: 0 } : { left: 0 }),
          opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateY(0)' : `translateY(${up ? '6px' : '-6px'})`,
          transition: 'opacity .2s, transform .2s, visibility .2s',
        }}
      >
        {LANGS.map((l) => (
          <button
            key={l} role="option" data-testid="lang-option" aria-selected={lang === l}
            onClick={() => { setLang(l); setOpen(false) }}
            className="flex w-full items-center transition-colors hover:bg-[#F5F0E6]"
            style={{ justifyContent: 'space-between', gap: 8, background: lang === l ? '#F5F0E6' : 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: size + 1, fontWeight: lang === l ? 600 : 400, color: C.ink, padding: '7px 12px', borderRadius: 7, textAlign: 'left' }}
          >
            {/* AT-015-3 — abbreviation unchanged (Kürzel), flag to its RIGHT
                (DOM order: code BEFORE flag). */}
            <span data-testid="lang-code">{l}</span>
            <span data-testid="lang-flag" aria-hidden="true" style={{ fontSize: size + 3, lineHeight: 1 }}>{LANG_FLAG[l]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [posterOpen, setPosterOpen] = useState(false)
  const [mPosterOpen, setMPosterOpen] = useState(false)
  const location = useLocation()
  const { cartCount, openCart } = useShopStore()
  const { t } = useT()
  const posterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setPosterOpen(false)
    setMPosterOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (posterRef.current && !posterRef.current.contains(e.target as Node)) setPosterOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setPosterOpen(false); setMobileOpen(false) }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [])

  const isActive = (href: string) => location.pathname === href
  const posterActive = location.pathname.startsWith('/product')

  const navLinkStyle = (active: boolean) => ({
    fontFamily: FONT_SANS, fontSize: 13, letterSpacing: '0.02em',
    color: active ? C.ink : '#5A5346', fontWeight: active ? 600 : 400,
    textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  } as const)

  return (
    <>
      <header
        className="fixed top-[34px] left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 72,
          background: scrolled ? 'rgba(251,248,241,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
        }}
      >
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between" style={{ padding: '0 24px', gap: 16 }}>
          {/* REQ-011 / T-401 — mobile hamburger / drawer trigger. Stable
              `data-testid` anchors the mobile-header presence + operability test
              (AT-011-1); `lg:hidden` keeps it mobile-only on the real viewport
              (the no-clip proof at 360/390/430 is Playwright, BLK-CHROMIUM). */}
          <button data-testid="mobile-menu-trigger" className="lg:hidden flex items-center justify-center" onClick={() => setMobileOpen(true)} aria-label={t('nav.open')} aria-haspopup="dialog" aria-expanded={mobileOpen} aria-controls="mobile-menu" style={{ ...HIT, color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} strokeWidth={1.5} />
          </button>

          <Link data-testid="header-logo" to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="/images/sizhu-chinese-mark.webp" alt="" aria-hidden="true" style={{ width: 24, height: 30, objectFit: 'contain', display: 'block' }} />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 500, letterSpacing: '0.02em', color: C.ink }}>SizhuAtelier</span>
              <span className="hidden sm:block" style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.textMuted3, marginTop: 3 }}>{t('nav.tagline')}</span>
            </span>
          </Link>

          {searchOpen && <HeaderSearch onClose={() => setSearchOpen(false)} />}
          <nav data-testid="primary-nav" className="hidden lg:flex items-center" style={{ gap: 28, ...(searchOpen ? { display: 'none' } : {}) }}>
            <Link data-nav-top to="/personalize" className="transition-opacity hover:opacity-80" style={{ ...navLinkStyle(isActive('/personalize')), color: C.accent, fontWeight: 600 }}>{t('nav.startPersonalizing')}</Link>

            {/* REQ-009 — real grouped mega-menu. Hover opens (desktop), the
                trigger is a real button with aria-haspopup/aria-expanded, and
                Escape/click-away close it. The panel groups buy-intent columns,
                each linking to a real /collections/* route. */}
            <div
              data-nav-top
              ref={posterRef}
              className="relative"
              onMouseEnter={() => setPosterOpen(true)}
              onMouseLeave={() => setPosterOpen(false)}
            >
              <button
                type="button"
                data-testid="mega-menu-trigger"
                onClick={() => setPosterOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={posterOpen}
                className="flex items-center gap-1 transition-colors hover:text-[#C0492E]"
                style={{ ...navLinkStyle(posterActive || isActive('/collections') || location.pathname.startsWith('/collections')) }}
              >
                {t('nav.collections')} <ChevronDown size={14} style={{ transition: 'transform .2s', transform: posterOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Mega-menu panel — rectangular premium surface (radius 2px). A
                  navigation grouping of real links (not a menu widget), so items
                  keep their native `link` role for assistive tech and routing. */}
              <div
                data-testid="mega-menu-panel"
                aria-label={t('nav.collections')}
                style={{
                  position: 'absolute', top: 'calc(100% + 12px)', left: 0,
                  width: 'min(760px, 88vw)',
                  display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4,
                  background: '#FBF8F1', border: `1px solid ${C.border}`, borderRadius: 2,
                  boxShadow: '0 18px 44px -20px rgba(28,24,18,0.45)', padding: 18,
                  opacity: posterOpen ? 1 : 0, visibility: posterOpen ? 'visible' : 'hidden',
                  transform: posterOpen ? 'translateY(0)' : 'translateY(-6px)',
                  transition: 'opacity .2s, transform .2s, visibility .2s', zIndex: 70,
                }}
              >
                {MEGA_COLUMNS.map((col) => (
                  <div key={col.testid} data-testid={col.testid} style={{ padding: '4px 10px' }}>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, margin: '0 0 10px' }}>
                      {t(col.titleKey)}
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {col.items.map((it) => (
                        <li key={it.href + it.i18nKey}>
                          <Link
                            to={it.href}
                            tabIndex={posterOpen ? 0 : -1}
                            onClick={() => setPosterOpen(false)}
                            className="block transition-colors hover:bg-[#F0E9DA]"
                            style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: C.ink, textDecoration: 'none', padding: '8px 8px', borderRadius: 2 }}
                          >
                            {t(it.i18nKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* REQ-004 / T-203 — asset-light promo tiles. Spans all 3 columns
                    under the text links. Each relevant column (Poster/TCM/Wuxing)
                    carries ≥2 text-forward tiles; the image field is a generic
                    placeholder (data-placeholder), never a real product photo. */}
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, marginTop: 6, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  {MEGA_TILE_COLUMNS.map((col) => (
                    <div key={col.testid} data-testid={col.testid} style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {col.tiles.map((tile, i) => (
                        <Link
                          key={col.testid + i}
                          data-testid="mega-tile"
                          to={tile.href}
                          tabIndex={posterOpen ? 0 : -1}
                          onClick={() => setPosterOpen(false)}
                          className="block transition-colors hover:bg-[#F0E9DA]"
                          style={{ display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none', padding: 6, borderRadius: 2 }}
                        >
                          {/* generic asset-light placeholder — no <img>, no real
                              /images/*.webp; a tinted swatch with a hatch pattern
                              that reads as a placeholder, not a product photo. */}
                          <span
                            data-testid="mega-tile-image"
                            data-placeholder="true"
                            aria-hidden="true"
                            style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 2, border: `1px dashed ${C.borderInput}`, background: `repeating-linear-gradient(45deg, ${tile.tint} 0 6px, transparent 6px 12px)` }}
                          />
                          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                            <span data-testid="mega-tile-title" style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.25 }}>{t(tile.titleKey)}</span>
                            <span data-testid="mega-tile-cta" style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.accent, fontWeight: 600 }}>{t(tile.ctaKey)} →</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* REQ-003 / T-201 — the 8 shop-oriented primary entries (data-nav-primary,
                distinct from the data-nav-top utility/mega budget). */}
            {PRIMARY_NAV.map((entry) => (
              <Link
                data-nav-primary
                key={entry.href + entry.i18nKey}
                to={entry.href}
                className="transition-colors hover:text-[#C0492E]"
                style={navLinkStyle(isActive(entry.href))}
              >
                {t(entry.i18nKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center" style={{ gap: 4, flexShrink: 0 }}>
            {!searchOpen && (
              <button data-testid="header-search" onClick={() => setSearchOpen(true)} aria-label={t('search.placeholder')} className="flex items-center justify-center transition-colors hover:text-[#C0492E]" style={{ ...HIT, color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Search size={19} strokeWidth={1.5} />
              </button>
            )}
            {/* Language / country selector — mandatory header surface (REQ-022). */}
            <div data-testid="header-lang" className="hidden sm:block"><LangDropdown /></div>
            {/* Account is an OPTIONAL surface (REQ-022 / AT-011-4). */}
            <Link data-testid="header-account" to="/account" aria-label={t('auth.account')} className="flex items-center justify-center transition-colors hover:text-[#C0492E]" style={{ ...HIT, gap: 5, color: C.ink, textDecoration: 'none' }}>
              <User size={19} strokeWidth={1.5} />
            </Link>
            <button data-testid="header-cart" onClick={openCart} aria-label={t('nav.cart')} className="relative flex items-center justify-center transition-colors hover:text-[#C0492E]" style={{ ...HIT, color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {/* REQ-011 / T-401 — cart badge. Gated on cartCount > 0 so it only
                  renders with an item present (AT-011-2). It is a flex element
                  (never display:none while shown); the stable `data-testid`
                  anchors the visibility assertion. */}
              {cartCount > 0 && (
                <span data-testid="cart-badge" className="absolute -top-1 -right-1 flex items-center justify-center rounded-full" style={{ minWidth: 16, height: 16, padding: '0 4px', fontSize: 10, fontWeight: 600, color: '#fff', background: C.accent }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* REQ-011 / T-401 — mobile drawer. `data-testid="mobile-menu"` + matching
          `id` (the hamburger's aria-controls) anchor the operability test: the
          hamburger opens this panel, which carries a reachable language access
          (mobile Sprachzugang, AT-011-1). The real no-clip proof at 360/390/430
          stays Playwright-only (BLK-CHROMIUM / VR-MOBILE-UNVERIFIED). */}
      <div data-testid="mobile-menu" id="mobile-menu" role="dialog" aria-modal={mobileOpen} aria-label={t('nav.menu')} className="fixed inset-0 z-[100] transition-opacity duration-300" style={{ display: mobileOpen ? 'block' : 'none', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none', overflow: 'hidden' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(28,24,18,0.42)' }} onClick={() => setMobileOpen(false)} />
        <div className="absolute top-0 right-0 h-full w-full max-w-md" style={{ background: C.bg, transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .4s ease-out', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: FONT_SERIF, fontSize: 22, color: C.ink }}>{t('nav.menu')}</span>
            <button onClick={() => setMobileOpen(false)} aria-label={t('nav.close')} style={{ color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}><X size={26} strokeWidth={1.5} /></button>
          </div>
          <nav className="flex flex-col" style={{ padding: '14px 24px', gap: 2, overflowY: 'auto', flex: 1 }}>
            <Link to="/personalize" style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.accent, fontWeight: 600, textDecoration: 'none', padding: '12px 0' }}>{t('nav.startPersonalizing')}</Link>
            <button data-testid="mobile-collections-toggle" onClick={() => setMPosterOpen((o) => !o)} aria-expanded={mPosterOpen} aria-controls="mobile-collections-panel" className="flex items-center justify-between" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', minHeight: 44, fontFamily: FONT_SERIF, fontSize: 24, color: C.ink, textAlign: 'left' }}>
              {t('nav.collections')} <ChevronDown size={20} style={{ transition: 'transform .2s', transform: mPosterOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {mPosterOpen && (
              <div id="mobile-collections-panel" className="flex flex-col" style={{ paddingLeft: 12, gap: 2, marginBottom: 4 }}>
                <Link data-testid="mobile-collection-link" to="/collections" style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 600, color: C.ink, textDecoration: 'none', padding: '8px 0', minHeight: 44, display: 'flex', alignItems: 'center' }}>{t('coll.allPosters')}</Link>
                {MEGA_COLUMNS.flatMap((col) => col.items).map((it) => (
                  <Link data-testid="mobile-collection-link" key={it.href + it.i18nKey} to={it.href} style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, textDecoration: 'none', padding: '8px 0', minHeight: 44, display: 'flex', alignItems: 'center' }}>{t(it.i18nKey)}</Link>
                ))}
              </div>
            )}
            {/* REQ-003 / T-201 — the shop-oriented primary entries in the mobile
                drawer too (FAQ/About/Contact/Blog removed from the primary nav). */}
            {PRIMARY_NAV.map((entry) => (
              <Link data-testid="mobile-primary-link" key={entry.href + entry.i18nKey} to={entry.href} style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.ink, textDecoration: 'none', padding: '12px 0' }}>{t(entry.i18nKey)}</Link>
            ))}
          </nav>
          <div className="flex items-center" style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, gap: 10 }}>
            {/* REQ-011 / REQ-022 — mobile language / country access. The desktop
                `header-lang` surface is hidden at xs (`hidden sm:block`), so the
                mobile Sprachzugang lives here in the drawer. It shares the
                `header-lang` test handle (so the language access is counted on
                mobile, AT-011-1) and adds a drawer-scoped `mobile-menu-lang`
                anchor for the operability assertion. */}
            <div data-testid="mobile-menu-lang"><span data-testid="header-lang"><LangDropdown size={14} up align="left" /></span></div>
            <span style={{ marginLeft: 'auto', fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2 }}>hello@sizhuatelier.shop</span>
          </div>
        </div>
      </div>

    </>
  )
}
