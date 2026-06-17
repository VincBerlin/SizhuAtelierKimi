import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useShopStore } from '../store/ShopStore'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { cartCount, openCart } = useShopStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { label: 'Poster', href: '/' },
    { label: 'BaZi', href: '/produkt/1' },
    { label: 'Praxis-Edition', href: '/produkt/2' },
    { label: 'Yoga', href: '/produkt/4' },
  ]

  const secondaryLinks = [
    { label: 'Atelier', href: '/atelier' },
    { label: 'Kontakt', href: '/kontakt' },
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          height: 72,
          background: scrolled ? 'rgba(232, 225, 214, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(44, 36, 32, 0.06)' : '1px solid transparent',
        }}
      >
        <div className="max-w-[1320px] mx-auto h-full flex items-center justify-between" style={{ padding: '0 24px' }}>
          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Menü öffnen"
            style={{ color: '#2C2420' }}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <img
              src="/images/sizhu-chinese-mark.png"
              alt=""
              aria-hidden="true"
              style={{ width: 24, height: 30, objectFit: 'contain', display: 'block' }}
            />
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 400, letterSpacing: '0.06em', color: '#2C2420' }}>
              SizhuAtelier
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="transition-colors duration-300 hover:text-terracotta"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#2C2420',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <span style={{ width: 1, height: 16, background: 'rgba(44, 36, 32, 0.15)' }} />
            {secondaryLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="transition-colors duration-300 hover:text-terracotta"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#8A7E72',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <button aria-label="Suchen" className="hidden sm:flex items-center justify-center transition-colors duration-300 hover:text-terracotta" style={{ color: '#2C2420' }}>
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button aria-label="Konto" className="hidden sm:flex items-center justify-center transition-colors duration-300 hover:text-terracotta" style={{ color: '#2C2420' }}>
              <User size={20} strokeWidth={1.5} />
            </button>
            <button onClick={openCart} aria-label="Warenkorb" className="flex items-center justify-center transition-colors duration-300 hover:text-terracotta relative" style={{ color: '#2C2420' }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white" style={{ width: 16, height: 16, fontSize: 10, background: '#A0522D' }}>
                {cartCount}
              </span>
            </button>
            <Link
              to="/produkt/1"
              className="hidden lg:inline-flex items-center transition-colors duration-300"
              style={{
                background: '#A0522D',
                color: '#F5F2ED',
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '10px 24px',
                borderRadius: 9999,
                textDecoration: 'none',
              }}
            >
              Personalisiere
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className="fixed inset-0 z-[100] transition-opacity duration-300"
        style={{
          display: mobileOpen ? 'block' : 'none',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          overflow: 'hidden',
        }}
      >
        <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
        <div
          className="absolute top-0 right-0 h-full w-full max-w-md transition-transform duration-400 ease-out"
          style={{
            background: '#F5F2ED',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          <div className="flex items-center justify-end p-6">
            <button onClick={() => setMobileOpen(false)} aria-label="Schliessen" style={{ color: '#2C2420' }}>
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col px-10 gap-5">
            {[...navLinks, ...secondaryLinks].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center justify-between group"
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 32,
                  fontWeight: 400,
                  color: '#2C2420',
                  textDecoration: 'none',
                }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="transition-colors duration-300 group-hover:text-terracotta">{link.label}</span>
                <span className="text-stone transition-colors duration-300 group-hover:text-terracotta" style={{ fontSize: 20 }}>&rarr;</span>
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-10 left-10 right-10">
            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72' }}>
              hello@sizhuatelier.shop
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
