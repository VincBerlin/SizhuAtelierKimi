import { useEffect } from 'react'
import { Link } from 'react-router'
import { faqs, faqCategories } from '../lib/content'
import FaqAccordion from '../components/FaqAccordion'

export default function Faq() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main style={{ background: '#E8E1D6', paddingTop: 96 }}>
      <div className="max-w-[800px] mx-auto" style={{ padding: '40px 24px 72px' }}>
        <div className="text-center">
          <p className="section-eyebrow" style={{ color: '#A0522D' }}>HILFE & FAQ</p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(32px, 5vw, 52px)', color: '#2C2420', lineHeight: 1.1, marginTop: 8 }}>
            Häufige Fragen
          </h1>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, color: '#8A7E72', marginTop: 14, lineHeight: 1.7 }}>
            Alles zu Personalisierung, Material, Versand und Bestellung.
          </p>
        </div>

        <div style={{ marginTop: 40 }}>
          {faqCategories.map((category) => (
            <section key={category} style={{ marginBottom: 36 }}>
              <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0522D', marginBottom: 8 }}>
                {category}
              </h2>
              <FaqAccordion items={faqs.filter((f) => f.category === category)} />
            </section>
          ))}
        </div>

        <div style={{ marginTop: 8, padding: 28, background: '#F5F2ED', borderRadius: 8, textAlign: 'center' }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 24, color: '#2C2420' }}>
            Frage nicht dabei?
          </h3>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72', marginTop: 8 }}>
            Schreib uns — wir helfen gern weiter.
          </p>
          <Link to="/kontakt" className="cta-button" style={{ marginTop: 18, textDecoration: 'none' }}>
            Kontakt aufnehmen
          </Link>
        </div>
      </div>
    </main>
  )
}
