import { useState, useEffect } from 'react'
import { ChevronDown, Mail, Instagram, MapPin, Clock } from 'lucide-react'
import { useT } from '../i18n/I18nProvider'

type Faq = { q: string; a: string }

function FAQItem({ item, isOpen, onToggle }: { item: Faq; isOpen: boolean; onToggle: () => void }) {
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
        >
          {item.a}
        </p>
      </div>
    </div>
  )
}

export default function Contact() {
  const { t } = useT()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const faqItems = (t('pages.contact.faqs') as unknown as Faq[]) || []
  const atelierLines: string[] = String(t('pages.contact.atelierValue')).split('|')

  const labelStyle = {
    fontFamily: '"Inter", sans-serif',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#8A7E72',
    display: 'block',
    marginBottom: 8,
  }
  const fieldStyle = {
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
  }

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
            {t('pages.contact.heroTitle')}
          </h1>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 16,
              color: '#8A7E72',
              lineHeight: 1.75,
              maxWidth: 480,
              margin: '16px auto 0',
            }}
          >
            {t('pages.contact.heroIntro')}
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section style={{ padding: '80px 0', background: '#E8E1D6' }}>
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16" style={{ padding: '0 24px' }}>
          {/* Form */}
          <div>
            <form onSubmit={(e) => { e.preventDefault() }} className="space-y-6">
              <div>
                <label style={labelStyle}>{t('pages.contact.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={fieldStyle}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('pages.contact.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={fieldStyle}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                />
              </div>
              <div>
                <label style={labelStyle}>{t('pages.contact.subject')}</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                  onFocus={(e) => { e.currentTarget.style.borderBottomColor = '#A0522D' }}
                  onBlur={(e) => { e.currentTarget.style.borderBottomColor = '#D5C9B7' }}
                >
                  <option value="general">{t('pages.contact.subjectGeneral')}</option>
                  <option value="order">{t('pages.contact.subjectOrder')}</option>
                  <option value="custom">{t('pages.contact.subjectCustom')}</option>
                  <option value="visit">{t('pages.contact.subjectVisit')}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('pages.contact.message')}</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  style={{ ...fieldStyle, resize: 'vertical' }}
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
                {t('pages.contact.send')}
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
              {t('pages.contact.directTitle')}
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail size={18} strokeWidth={1.5} style={{ color: '#A0522D', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{t('pages.contact.emailLabel')}</p>
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
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{t('pages.contact.instagramLabel')}</p>
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
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{t('pages.contact.atelierLabel')}</p>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72' }}>
                    {atelierLines.map((line, i) => (
                      <span key={i}>{line}{i < atelierLines.length - 1 ? <br /> : null}</span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} strokeWidth={1.5} style={{ color: '#A0522D', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{t('pages.contact.responseLabel')}</p>
                  <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72' }}>
                    {t('pages.contact.responseValue')}
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
            {t('pages.contact.faqTitle')}
          </h2>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 15,
              color: '#8A7E72',
              marginBottom: 40,
            }}
          >
            {t('pages.contact.faqIntro')}
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
