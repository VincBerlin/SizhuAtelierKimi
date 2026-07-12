import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { ShoppingBag, Menu, X, ChevronDown, Search, User } from 'lucide-react'
import { useShopStore } from '../store/ShopStore'
import { useT, LANGS } from '../i18n/I18nProvider'
import { type Lang } from '../i18n/translations'
import HeaderSearch from './shop/HeaderSearch'
import { C, FONT_SERIF, FONT_SANS } from '../lib/tokens'
import {
  TAXONOMY, PRIMARY_NAV as TAX_PRIMARY_NAV, QUICK_ACCESS, MEGA_TILES,
  resolveTaxonomyHref, type TaxonomyAxis, type TaxonomyEntry,
} from '../lib/taxonomy'

// REQ-005 — shop-oriented PRIMARY navigation, sourced 1:1 from the canonical
// taxonomy (src/lib/taxonomy.ts, M9): exactly the 8 spec entries in order;
// FAQ/About/Contact/Blog are intentionally NOT here. Re-exported in the legacy
// {i18nKey, href} shape so the existing REQ-003 boundary tests keep passing.
export interface PrimaryNavEntry { i18nKey: string; href: string }
export const PRIMARY_NAV: PrimaryNavEntry[] = TAX_PRIMARY_NAV.map((n) => ({ i18nKey: n.labelKey, href: n.href }))

// REQ-006 / M10 — the six mandatory mega-menu + mobile-drawer axes, rendered as a
// MATRIX straight from the canonical taxonomy (no hand-rolled duplicate nav data).
// Each axis heading carries an i18n key + an English fallback so the panel renders
// even before a locale string ships. The order is the shopper's funnel: world →
// style → room → size → sets → campaigns.
const AXIS_META: { axis: TaxonomyAxis; headingKey: string; heading: string }[] = [
  { axis: 'world', headingKey: 'tax.world', heading: 'Shop by World' },
  { axis: 'style', headingKey: 'tax.style', heading: 'Theme & Style' },
  { axis: 'room', headingKey: 'tax.room', heading: 'Room & Use' },
  { axis: 'size', headingKey: 'tax.size', heading: 'Size / Format' },
  { axis: 'set', headingKey: 'tax.set', heading: 'Sets & Solutions' },
  { axis: 'campaign', headingKey: 'tax.campaign', heading: 'Trends & Campaigns' },
]

// ≥44px touch targets for header icon controls (§6.1 / §7.4).
const HIT = { minWidth: 44, minHeight: 44 } as const

// REQ-015 / AT-015-3 — flag emoji per locale (rendered to the RIGHT of the
// unchanged abbreviation). EN maps to the UK flag (en-GB spelling).
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
  const panelRef = useRef<HTMLDivElement>(null)

  // Operator-Plan Hero/Mega-Menü §6.3 — kontrolliertes Öffnen/Schließen ohne
  // Flackern: 80ms Öffnungs-, 180ms Schließ-Verzögerung; Eintritt ins Panel
  // bricht das Schließen ab (stabiler Cursorweg Titel → Panel).
  const OPEN_DELAY = 80
  const CLOSE_DELAY = 180
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const megaEnter = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null }
    openTimer.current = window.setTimeout(() => setPosterOpen(true), OPEN_DELAY)
  }
  const megaLeave = () => {
    if (openTimer.current) { window.clearTimeout(openTimer.current); openTimer.current = null }
    closeTimer.current = window.setTimeout(() => setPosterOpen(false), CLOSE_DELAY)
  }
  const megaKeep = () => {
    if (closeTimer.current) { window.clearTimeout(closeTimer.current); closeTimer.current = null }
  }

  // Resolve an i18n key with an explicit fallback — taxonomy entries carry an
  // English `label`/`heading` so the matrix renders even where a locale string
  // is not yet supplied (proper nouns like "BaZi"/"Wabi-Sabi" stay as the label).
  const tx = (key: string, fallback: string) => {
    const v = t(key)
    return v && v !== key ? v : fallback
  }

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
      const inTrigger = posterRef.current?.contains(e.target as Node)
      const inPanel = panelRef.current?.contains(e.target as Node)
      if (!inTrigger && !inPanel) setPosterOpen(false)
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

  // A single taxonomy entry as a real routed link (shared by desktop + mobile).
  const axisItemStyle = { fontFamily: FONT_SANS, fontSize: 13.5, color: C.ink, textDecoration: 'none', padding: '7px 8px', borderRadius: 2, display: 'block' } as const

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

            {/* REQ-006 + Operator-Plan §6.2 — Kategorie-Link und Menü-Trigger
                GETRENNT: der Link führt direkt zu /collections, der Chevron-
                Button öffnet das Full-Width-Panel (tastatur- und touchfähig).
                Hover mit 80/180ms-Delays (§6.3); das Panel selbst hängt als
                Full-Width-Layer direkt am <header> (§5.2), NICHT in diesem
                max-width-Container. */}
            <div
              data-nav-top
              ref={posterRef}
              className="relative flex items-center"
              style={{ gap: 2 }}
              onMouseEnter={megaEnter}
              onMouseLeave={megaLeave}
            >
              <Link
                data-testid="mega-menu-landing-link"
                to="/collections"
                className="transition-colors hover:text-[#C0492E]"
                style={{ ...navLinkStyle(posterActive || location.pathname.startsWith('/collections')) }}
              >
                {t('nav.collections')}
              </Link>
              <button
                type="button"
                data-testid="mega-menu-trigger"
                onClick={() => setPosterOpen((o) => !o)}
                onFocus={megaEnter}
                aria-haspopup="true"
                aria-expanded={posterOpen}
                aria-controls="mega-menu-panel"
                aria-label={t('nav.collections')}
                className="flex items-center transition-colors hover:text-[#C0492E]"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: C.ink, minHeight: 44 }}
              >
                <ChevronDown size={14} style={{ transition: 'transform .2s', transform: posterOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>

            {/* REQ-005 — the 8 shop-oriented primary entries. */}
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
            <div data-testid="header-lang" className="hidden sm:block"><LangDropdown /></div>
            <Link data-testid="header-account" to="/account" aria-label={t('auth.account')} className="flex items-center justify-center transition-colors hover:text-[#C0492E]" style={{ ...HIT, gap: 5, color: C.ink, textDecoration: 'none' }}>
              <User size={19} strokeWidth={1.5} />
            </Link>
            <button data-testid="header-cart" onClick={openCart} aria-label={t('nav.cart')} className="relative flex items-center justify-center transition-colors hover:text-[#C0492E]" style={{ ...HIT, color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span data-testid="cart-badge" className="absolute -top-1 -right-1 flex items-center justify-center rounded-full" style={{ minWidth: 16, height: 16, padding: '0 4px', fontSize: 10, fontWeight: 600, color: '#fff', background: C.accent }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Full-Width-Mega-Menü-Layer (Operator-Plan §5) ─────────────────
            Direktes Header-Kind mit inset-inline:0 → reicht von Browserkante
            zu Browserkante (KEIN max-width-Container darüber). Liegt über dem
            Hero (z-index 300), verschiebt die Seite nicht. Pills und die alte
            4er-Promo-Reihe sind entfernt; Schnelllinks als Textreihe, vier
            Linkspalten + Editorial-Spalte (Trendlinks + 2 Bildkarten). Die
            Inhalte kommen weiterhin 1:1 aus der kanonischen Taxonomie. */}
        <div
          ref={panelRef}
          data-testid="mega-menu-panel"
          id="mega-menu-panel"
          aria-label={t('nav.collections')}
          onMouseEnter={megaKeep}
          onMouseLeave={megaLeave}
          style={{
            position: 'absolute', top: '100%', insetInline: 0, zIndex: 300,
            background: '#FBF8F1', borderBottom: `1px solid ${C.border}`,
            boxShadow: '0 24px 48px -24px rgba(28,24,18,0.35)',
            opacity: posterOpen ? 1 : 0, visibility: posterOpen ? 'visible' : 'hidden',
            transform: posterOpen ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity .18s ease, transform .18s ease, visibility .18s',
          }}
        >
          <div className="mega-menu-layer__inner mx-auto" style={{ maxWidth: 1360, padding: 'clamp(18px, 2.2vw, 30px) clamp(20px, 3vw, 48px)' }}>
            {/* Schnelllinks — schlichte Textreihe (§5.3/§5.4: keine Pills). */}
            <div data-testid="mega-quick" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 22px', paddingBottom: 14, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
              {QUICK_ACCESS.map((q) => (
                <Link key={q.id} data-testid="mega-quick-item" to={q.href} tabIndex={posterOpen ? 0 : -1} onClick={() => setPosterOpen(false)}
                  className="transition-colors hover:text-[#C0492E]"
                  style={{ fontFamily: FONT_SANS, fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em', color: C.ink, textDecoration: 'none' }}>
                  {tx(q.labelKey, q.label)}
                </Link>
              ))}
            </div>

            {/* Zielraster §5.5: 4 Linkspalten + Editorial-Spalte. Spalte 4
                bündelt size+set („Size & Solutions"); campaign wird zur
                Trendlink-Liste der Editorial-Spalte. Alle sechs Taxonomie-
                Achsen bleiben mit ihren data-testid-Ankern erhalten. */}
            <div className="mega-menu__grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(145px,0.9fr) minmax(165px,1fr) minmax(175px,1fr) minmax(175px,1fr) minmax(340px,1.5fr)', gap: 'clamp(28px, 3vw, 52px)' }}>
              {AXIS_META.filter(({ axis }) => ['world', 'style', 'room'].includes(axis)).map(({ axis, headingKey, heading }) => (
                <div key={axis} data-testid={`mega-axis-${axis}`} data-axis={axis}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, margin: '0 0 10px' }}>
                    {tx(headingKey, heading)}
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {TAXONOMY[axis].map((e: TaxonomyEntry) => (
                      <li key={e.id}>
                        <Link data-testid="mega-axis-item" data-axis={axis} data-nonfinal={e.nonFinal ? 'true' : undefined}
                          to={resolveTaxonomyHref(e.link)} tabIndex={posterOpen ? 0 : -1} onClick={() => setPosterOpen(false)}
                          className="transition-colors hover:text-[#C0492E]" style={{ ...axisItemStyle, padding: '5px 0' }}>
                          {tx(e.labelKey, e.label)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Spalte 4 — Size & Solutions (size + set gestapelt). */}
              <div>
                {AXIS_META.filter(({ axis }) => ['size', 'set'].includes(axis)).map(({ axis, headingKey, heading }, idx) => (
                  <div key={axis} data-testid={`mega-axis-${axis}`} data-axis={axis} style={idx > 0 ? { marginTop: 16 } : undefined}>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, margin: '0 0 10px' }}>
                      {tx(headingKey, heading)}
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {TAXONOMY[axis].map((e: TaxonomyEntry) => (
                        <li key={e.id}>
                          <Link data-testid="mega-axis-item" data-axis={axis} data-nonfinal={e.nonFinal ? 'true' : undefined}
                            to={resolveTaxonomyHref(e.link)} tabIndex={posterOpen ? 0 : -1} onClick={() => setPosterOpen(false)}
                            className="transition-colors hover:text-[#C0492E]" style={{ ...axisItemStyle, padding: '5px 0' }}>
                            {tx(e.labelKey, e.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Editorial-Spalte — Trendlinks (campaign-Achse) + 2 Bildkarten. */}
              <div data-testid="mega-editorial">
                {AXIS_META.filter(({ axis }) => axis === 'campaign').map(({ axis, headingKey, heading }) => (
                  <div key={axis} data-testid={`mega-axis-${axis}`} data-axis={axis}>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accent, margin: '0 0 10px' }}>
                      {tx(headingKey, heading)}
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {TAXONOMY[axis].map((e: TaxonomyEntry) => (
                        <li key={e.id}>
                          <Link data-testid="mega-axis-item" data-axis={axis} data-nonfinal={e.nonFinal ? 'true' : undefined}
                            to={resolveTaxonomyHref(e.link)} tabIndex={posterOpen ? 0 : -1} onClick={() => setPosterOpen(false)}
                            className="transition-colors hover:text-[#C0492E]" style={{ ...axisItemStyle, padding: '5px 0' }}>
                            {tx(e.labelKey, e.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {/* Genau ZWEI große Bildkarten (§5.3): Personalized BaZi + Fire
                    Horse — echte Assets statt der alten Placeholder-Kacheln. */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  {MEGA_TILES.filter((tile) => ['bazi', 'fire-horse'].includes(tile.id)).map((tile) => (
                    <Link key={tile.id} data-testid="mega-tile" to={resolveTaxonomyHref(tile.link)} tabIndex={posterOpen ? 0 : -1} onClick={() => setPosterOpen(false)}
                      className="group" style={{ textDecoration: 'none', display: 'block' }}>
                      <span data-testid="mega-tile-image" aria-hidden="true" style={{ display: 'block', aspectRatio: '4 / 3', overflow: 'hidden' }}>
                        <img src={tile.id === 'fire-horse' ? '/images/atelier/fire-horse-editorial.webp' : '/images/posters/bazi-personal.webp'} alt="" loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </span>
                      <span data-testid="mega-tile-title" style={{ display: 'block', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.ink, marginTop: 8, lineHeight: 1.3 }}>{tx(tile.titleKey, tile.title)}</span>
                      <span data-testid="mega-tile-cta" style={{ display: 'block', fontFamily: FONT_SANS, fontSize: 12, color: C.accent, fontWeight: 600, marginTop: 2 }}>{tx(tile.ctaKey, tile.cta)} →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* REQ-007 / M10 — mobile drawer that MIRRORS the desktop taxonomy matrix
          (not a compressed desktop nav). The collections toggle expands the same
          six axes; the drawer content is always in the DOM (visibility toggled) so
          the mobile taxonomy is testable and the 360/390/430 no-clip proof stays
          Playwright-only (RL-CHROMIUM). */}
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
            {/* Mobile taxonomy — the SAME six axes as the desktop matrix, grouped
                (not a flat dump). Always in the DOM; the accordion toggles its
                visibility so the mirror is verifiable. */}
            <div id="mobile-collections-panel" className="flex flex-col" style={{ paddingLeft: 12, gap: 4, marginBottom: 4, overflow: 'hidden', maxHeight: mPosterOpen ? 4000 : 0, visibility: mPosterOpen ? 'visible' : 'hidden', transition: 'max-height .3s ease' }}>
              <Link data-testid="mobile-collection-link" to="/collections" style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 600, color: C.ink, textDecoration: 'none', padding: '8px 0', minHeight: 44, display: 'flex', alignItems: 'center' }}>{t('coll.allPosters')}</Link>
              {AXIS_META.map(({ axis, headingKey, heading }) => (
                <div key={axis} data-testid={`mobile-axis-${axis}`} data-axis={axis} style={{ marginTop: 6 }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, margin: '0 0 2px' }}>{tx(headingKey, heading)}</div>
                  {TAXONOMY[axis].map((e: TaxonomyEntry) => (
                    <Link
                      key={e.id}
                      data-testid="mobile-tax-item"
                      data-axis={axis}
                      data-nonfinal={e.nonFinal ? 'true' : undefined}
                      to={resolveTaxonomyHref(e.link)}
                      style={{ fontFamily: FONT_SANS, fontSize: 15, color: C.textMuted, textDecoration: 'none', padding: '7px 0', minHeight: 40, display: 'flex', alignItems: 'center' }}
                    >
                      {tx(e.labelKey, e.label)}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            {/* REQ-005 — shop-oriented primary entries in the drawer too. */}
            {PRIMARY_NAV.map((entry) => (
              <Link data-testid="mobile-primary-link" key={entry.href + entry.i18nKey} to={entry.href} style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.ink, textDecoration: 'none', padding: '12px 0' }}>{t(entry.i18nKey)}</Link>
            ))}
          </nav>
          <div className="flex items-center" style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, gap: 10 }}>
            <div data-testid="mobile-menu-lang"><span data-testid="header-lang"><LangDropdown size={14} up align="left" /></span></div>
            <span style={{ marginLeft: 'auto', fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2 }}>hello@sizhuatelier.shop</span>
          </div>
        </div>
      </div>

    </>
  )
}
