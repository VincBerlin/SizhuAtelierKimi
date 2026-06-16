import { useState, useEffect } from 'react'
import { ChevronDown, Mail, Instagram, MapPin, Clock } from 'lucide-react'

const faqItems = [
  {
    q: 'Wie kann ich ein Werk anfragen?',
    a: 'W\u00e4hle einfach dein gew\u00fcnschtes Poster-Format aus unserer Kollektion aus, gib deine Geburtsdaten ein und wir erstellen dein personalisiertes Chart-Poster. F\u00fcr Sonderanfertigungen kannst du uns \u00fcber das Kontaktformular erreichen.',
  },
  {
    q: 'Bietet das Atelier Auftragsarbeiten an?',
    a: 'Ja, wir erstellen gerne individuelle Auftragsarbeiten. Ob f\u00fcr Hochzeiten, Firmenevents, Wellness-Studios oder als besonderes Geschenk &mdash; sprich uns an und wir finden gemeinsam die perfekte L\u00f6sung.',
  },
  {
    q: 'Welche Formate sind verf\u00fcgbar?',
    a: 'Unsere Standard-Poster sind in den Formaten A4, A3, A2 und 50&times;70 cm erh\u00e4ltlich. Rahmen k\u00f6nnen in Eiche, Nussbaum oder Schwarz dazubestellt werden. Sonderformate auf Anfrage.',
  },
  {
    q: 'Wie l\u00e4uft der Prozess ab?',
    a: 'Nach deiner Bestellung berechnen wir deine astrologischen S\u00e4ulen und erstellen ein Design-Vorschlag. Nach deiner Freigabe drucken wir dein Poster im Atelier und versenden es innerhalb von 5&ndash;7 Werktagen.',
  },
  {
    q: 'Wie kann ich Kontakt aufnehmen?',
    a: 'Du erreichst uns per E-Mail an hello@sizhuatelier.shop, \u00fcber das Kontaktformular auf dieser Seite oder direkt \u00fcber Instagram @sizhuatelier. Wir antworten innerhalb von 24 Stunden.',
  },
  {
    q: 'Kann ich mein Poster zur\u00fcckgeben?',
    a: 'Da jedes Poster personalisiert ist, k\ouml;nnen wir grunds\u00e4tzlich keine Retouren annehmen. Bei besch\u00e4digter Lieferung oder Druckfehlern tauschen wir selbstverst\u00e4ndlich kostenlos aus.',
  },
]

function FAQItem({ item, isOpen, onToggle }: { item: typeof faqItems[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: '1px solid #D5C9B7' }}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
        style={{ padding: '20px 0' }}
      >
        <span
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 15,
            fontWeight: 600,
            color: '#2C2420',
            paddingRight: 16,
          }}
        >
          {item.q}
        </span>
        <ChevronDown
          size={20}
          strokeWidth={1.5}
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            color: '#8A7E72',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? 300 : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 14,
            color: '#8A7E72',
            lineHeight: 1.75,
            paddingBottom: 20,
            maxWidth: 640,
          }}
          dangerouslySetInnerHTML={{ __html: item.a }}
        />
      </div>
    </div>
  )
}

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'allgemein', message: '' })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      {/* Hero */}
      <section style={{ minHeight: '50vh', background: '#E8E1D6', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ padding: '120px 24px 60px' }}>
          <h1
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 'clamp(44px, 5vw, 64px)',
              color: '#2C2420',
              lineHeight: 1.1,
            }}
          >
            Sag Hallo
          </h1>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 16,
              color: '#8A7E72',
              lineHeight: 1.75,
              marginTop: 16,
              maxWidth: 480,
              margin: '16px auto 0',
            }}
          >
            Wir freuen uns auf deine Nachricht &mdash; ob Frage, Sonderwunsch oder Atelierbesuch.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section style={{ padding: '80px 0', background: '#E8E1D6' }}>
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[60%_40%] gap-12 lg:gap-16" style={{ padding: '0 24px' }}>
          {/* Form */}
          <div>
            <form
              onSubmit={(e) => { e.preventDefault() }}
              className="space-y-6"
            >
              <div>
                <label
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8A7E72',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #D5C9B7',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 15,
                    color: '#2C2420',
                    padding: '14px 0',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8A7E72',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #D5C9B7',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 15,
                    color: '#2C2420',
                    padding: '14px 0',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8A7E72',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Betreff
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #D5C9B7',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 15,
                    color: '#2C2420',
                    padding: '14px 0',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                >
                  <option value="allgemein">Allgemeine Anfrage</option>
                  <option value="bestellung">Bestellung</option>
                  <option value="sonderanfertigung">Sonderanfertigung</option>
                  <option value="atelierbesuch">Atelierbesuch</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#8A7E72',
                    display: 'block',
                    marginBottom: 8,
                  }}
                >
                  Nachricht
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #D5C9B7',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 15,
                    color: '#2C2420',
                    padding: '14px 0',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.3s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#A0522D',
                  color: '#F5F2ED',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '14px 32px',
                  borderRadius: 4,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  marginTop: 12,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#B5652B' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#A0522D' }}
              >
                Senden
              </button>
            </form>
          </div>

          {/* Info */}
          <div style={{ paddingTop: 8 }}>
            <h3
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#2C2420',
                marginBottom: 24,
                letterSpacing: '0.04em',
              }}
            >
              Direkter Kontakt
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail size={18} strokeWidth={1.5} style={{ color: '#A0522D', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>E-Mail</p>
                  <a
                    href="mailto:hello@sizhuatelier.shop"
                    className="transition-colors duration-300 hover:text-terracotta"
                    style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72', textDecoration: 'none' }}
                  >
                    hello@sizhuatelier.shop
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Instagram size={18} strokeWidth={1.5} style={{ color: '#A0522D', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>Instagram</p>
                  <a
                    href="#"
                    className="transition-colors duration-300 hover:text-terracotta"
                    style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72', textDecoration: 'none' }}
                  >
                    @sizhuatelier
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} strokeWidth={1.5} style={{ color: '#A0522D', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>Atelier</p>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72' }}>
                    SizhuAtelier<br />
                    Schweiz
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} strokeWidth={1.5} style={{ color: '#A0522D', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>Antwortzeit</p>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72' }}>
                    Wir antworten innerhalb von 24 Stunden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 0', background: '#F5F2ED' }}>
        <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(30px, 3vw, 36px)',
              color: '#2C2420',
              marginBottom: 8,
            }}
          >
            H&auml;ufige Fragen
          </h2>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 15,
              color: '#8A7E72',
              marginBottom: 40,
            }}
          >
            Antworten auf die wichtigsten Fragen rund um unsere Poster und den Bestellprozess.
          </p>
          <div>
            {faqItems.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
