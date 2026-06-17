import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { useShopStore } from '../store/ShopStore'
import { useT, LANGS } from '../i18n/I18nProvider'
import { COMMERCE_ENABLED } from '../lib/config'
import { C, FONT_SERIF, FONT_SANS } from '../lib/tokens'

const posterLinks = [
  { label: 'BaZi', href: '/produkt/1' },
  { label: 'Wuxing', href: '/produkt/7' },
  { label: 'Feuerpferd', href: '/produkt/8' },
]
const mainLinks = [
  { key: 'tcm', href: '/tcm' },
  { key: 'bundles', href: '/bundles' },
  { key: 'digital', href: '/digital' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/kontakt' },
]

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
        className="flex items-center transition-colors hover:text-[#C0492E]"
        style={{ gap: 5, background: 'none', border: `1px solid ${C.borderInput}`, borderRadius: 999, padding: '5px 11px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: size, fontWeight: 600, color: C.ink }}
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
            key={l} role="option" aria-selected={lang === l}
            onClick={() => { setLang(l); setOpen(false) }}
            className="block w-full text-left transition-colors hover:bg-[#F5F0E6]"
            style={{ background: lang === l ? '#F5F0E6' : 'none', border: 'none', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: size + 1, fontWeight: lang === l ? 600 : 400, color: C.ink, padding: '7px 12px', borderRadius: 7 }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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
  const posterActive = location.pathname.startsWith('/produkt')

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
          <button className="lg:hidden flex items-center justify-center" onClick={() => setMobileOpen(true)} aria-label={t('nav.open')} style={{ color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} strokeWidth={1.5} />
          </button>

          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <img src="/images/sizhu-chinese-mark.png" alt="" aria-hidden="true" style={{ width: 24, height: 30, objectFit: 'contain', display: 'block' }} />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 500, letterSpacing: '0.02em', color: C.ink }}>SizhuAtelier</span>
              <span className="hidden sm:block" style={{ fontFamily: FONT_SANS, fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: C.textMuted3, marginTop: 3 }}>{t('nav.tagline')}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center" style={{ gap: 28 }}>
            <div ref={posterRef} className="relative" onMouseEnter={() => setPosterOpen(true)} onMouseLeave={() => setPosterOpen(false)}>
              <button className="flex items-center gap-1 transition-colors hover:text-[#C0492E]" style={navLinkStyle(posterActive)} aria-haspopup="true" aria-expanded={posterOpen} onClick={() => setPosterOpen((o) => !o)}>
                {t('nav.poster')} <ChevronDown size={14} style={{ transition: 'transform .2s', transform: posterOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, minWidth: 180, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 16px 36px -18px rgba(28,24,18,0.4)', padding: 8, opacity: posterOpen ? 1 : 0, visibility: posterOpen ? 'visible' : 'hidden', transform: posterOpen ? 'translateY(0)' : 'translateY(-6px)', transition: 'opacity .2s, transform .2s, visibility .2s' }}>
                {posterLinks.map((l) => (
                  <Link key={l.href} to={l.href} role="menuitem" className="block transition-colors hover:bg-[#F5F0E6]" style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.ink, textDecoration: 'none', padding: '9px 12px', borderRadius: 8 }}>{l.label}</Link>
                ))}
              </div>
            </div>

            {mainLinks.map((l) => (
              <Link key={l.href} to={l.href} className="transition-colors hover:text-[#C0492E]" style={navLinkStyle(isActive(l.href))}>{t('nav.' + l.key)}</Link>
            ))}
          </nav>

          <div className="flex items-center" style={{ gap: 14, flexShrink: 0 }}>
            <div className="hidden sm:block"><LangDropdown /></div>
            {COMMERCE_ENABLED && (
              <button onClick={openCart} aria-label={t('nav.cart')} className="relative flex items-center justify-center transition-colors hover:text-[#C0492E]" style={{ color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full" style={{ minWidth: 16, height: 16, padding: '0 4px', fontSize: 10, fontWeight: 600, color: '#fff', background: C.accent }}>{cartCount}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="fixed inset-0 z-[100] transition-opacity duration-300" style={{ display: mobileOpen ? 'block' : 'none', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none', overflow: 'hidden' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(28,24,18,0.42)' }} onClick={() => setMobileOpen(false)} />
        <div className="absolute top-0 right-0 h-full w-full max-w-md" style={{ background: C.bg, transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .4s ease-out', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: FONT_SERIF, fontSize: 22, color: C.ink }}>{t('nav.menu')}</span>
            <button onClick={() => setMobileOpen(false)} aria-label={t('nav.close')} style={{ color: C.ink, background: 'none', border: 'none', cursor: 'pointer' }}><X size={26} strokeWidth={1.5} /></button>
          </div>
          <nav className="flex flex-col" style={{ padding: '14px 24px', gap: 2, overflowY: 'auto', flex: 1 }}>
            <button onClick={() => setMPosterOpen((o) => !o)} aria-expanded={mPosterOpen} className="flex items-center justify-between" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 0', fontFamily: FONT_SERIF, fontSize: 24, color: C.ink, textAlign: 'left' }}>
              {t('nav.poster')} <ChevronDown size={20} style={{ transition: 'transform .2s', transform: mPosterOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {mPosterOpen && (
              <div className="flex flex-col" style={{ paddingLeft: 12, gap: 2, marginBottom: 4 }}>
                {posterLinks.map((l) => (
                  <Link key={l.href} to={l.href} style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, textDecoration: 'none', padding: '8px 0' }}>{l.label}</Link>
                ))}
              </div>
            )}
            {mainLinks.map((l) => (
              <Link key={l.href} to={l.href} style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.ink, textDecoration: 'none', padding: '12px 0' }}>{t('nav.' + l.key)}</Link>
            ))}
          </nav>
          <div className="flex items-center" style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, gap: 10 }}>
            <LangDropdown size={14} up align="left" />
            <span style={{ marginLeft: 'auto', fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2 }}>hello@sizhuatelier.shop</span>
          </div>
        </div>
      </div>
    </>
  )
}
