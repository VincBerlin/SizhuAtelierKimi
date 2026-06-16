import { Link } from 'react-router'
import { useState } from 'react'

const shopLinks = [
  { label: 'BaZi Poster', href: '/produkt/bazi-chart-poster' },
  { label: 'Saju Poster · Coming Soon', href: '/produkt/saju-poster' },
  { label: 'Junishi Poster · Coming Soon', href: '/produkt/junishi-poster' },
  { label: 'TCM Art', href: '/shop' },
  { label: 'Praxisposter', href: '/produkt/praxisposter-elementkreis' },
  { label: 'Poster für Yoga Studios', href: '/produkt/yoga-studio-poster' },
]

const occasionLinks = [
  { label: 'Hochzeit', href: '/shop' },
  { label: 'Jahrestag', href: '/shop' },
  { label: 'Babytaufe', href: '/shop' },
  { label: 'Geburtstag', href: '/shop' },
  { label: 'Wellness & TCM', href: '/shop' },
]

const atelierLinks = [
  { label: '\u00dcber uns', href: '/atelier' },
  { label: 'So funktioniert\'s', href: '/atelier' },
  { label: 'Papier & Materialien', href: '/atelier' },
  { label: 'Blog', href: '/blog' },
  { label: 'Versand & Retouren', href: '/faq' },
  { label: 'FAQ', href: '/faq' },
]

export default function Footer() {
  const [openColumn, setOpenColumn] = useState<number | null>(null)

  const toggleColumn = (index: number) => {
    setOpenColumn(openColumn === index ? null : index)
  }

  const columnClass = (index: number) =>
    `lg:block ${openColumn === index ? 'block' : 'hidden'}`

  return (
    <footer style={{ background: '#E8E1D6', borderTop: '1px solid #D5C9B7', padding: '80px 0 40px' }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Shop */}
          <div>
            <button
              onClick={() => toggleColumn(0)}
              className="lg:pointer-events-none flex items-center justify-between w-full lg:w-auto mb-4 lg:mb-4"
            >
              <h4 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', color: '#2C2420' }}>
                Shop
              </h4>
              <span className="lg:hidden text-stone">{openColumn === 0 ? '\u2212' : '+'}</span>
            </button>
            <ul className={columnClass(0)}>
              {shopLinks.map((link) => (
                <li key={link.label} className="mb-2">
                  <Link
                    to={link.href}
                    className="transition-colors duration-300 hover:text-terracotta"
                    style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 400, color: '#8A7E72', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Anlass */}
          <div>
            <button
              onClick={() => toggleColumn(1)}
              className="lg:pointer-events-none flex items-center justify-between w-full lg:w-auto mb-4 lg:mb-4"
            >
              <h4 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', color: '#2C2420' }}>
                Anlass
              </h4>
              <span className="lg:hidden text-stone">{openColumn === 1 ? '\u2212' : '+'}</span>
            </button>
            <ul className={columnClass(1)}>
              {occasionLinks.map((link) => (
                <li key={link.label} className="mb-2">
                  <Link
                    to={link.href}
                    className="transition-colors duration-300 hover:text-terracotta"
                    style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 400, color: '#8A7E72', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atelier */}
          <div>
            <button
              onClick={() => toggleColumn(2)}
              className="lg:pointer-events-none flex items-center justify-between w-full lg:w-auto mb-4 lg:mb-4"
            >
              <h4 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', color: '#2C2420' }}>
                Atelier
              </h4>
              <span className="lg:hidden text-stone">{openColumn === 2 ? '\u2212' : '+'}</span>
            </button>
            <ul className={columnClass(2)}>
              {atelierLinks.map((link) => (
                <li key={link.label} className="mb-2">
                  <Link
                    to={link.href}
                    className="transition-colors duration-300 hover:text-terracotta"
                    style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 400, color: '#8A7E72', textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <button
              onClick={() => toggleColumn(3)}
              className="lg:pointer-events-none flex items-center justify-between w-full lg:w-auto mb-4 lg:mb-4"
            >
              <h4 style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', color: '#2C2420' }}>
                Kontakt
              </h4>
              <span className="lg:hidden text-stone">{openColumn === 3 ? '\u2212' : '+'}</span>
            </button>
            <div className={columnClass(3)}>
              <ul>
                {['Kontaktieren Sie uns', 'Instagram', 'Pinterest', 'Newsletter'].map((link) => (
                  <li key={link} className="mb-2">
                    <a
                      href="#"
                      className="transition-colors duration-300 hover:text-terracotta"
                      style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 400, color: '#8A7E72', textDecoration: 'none' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4" style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 400, color: '#A0522D' }}>
                hello@sizhuatelier.shop
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ marginTop: 64, paddingTop: 24, borderTop: '1px solid #D5C9B7' }}
        >
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, color: '#8A7E72' }}>
            &copy; 2025 SizhuAtelier
          </span>
          <div className="flex items-center gap-4">
            {['Datenschutz', 'Impressum', 'AGB'].map((link) => (
              <a
                key={link}
                href="#"
                className="transition-colors duration-300 hover:text-ink-black"
                style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, color: '#8A7E72', textDecoration: 'none' }}
              >
                {link}
              </a>
            ))}
          </div>
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 400, color: '#8A7E72' }}>
            Schweiz &middot; Handgefertigt
          </span>
        </div>
      </div>
    </footer>
  )
}
