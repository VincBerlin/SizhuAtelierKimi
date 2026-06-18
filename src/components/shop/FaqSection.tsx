import { useState } from 'react'
import { Link } from 'react-router'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'

interface Faq { q: string; a: string; placeholder?: boolean }

/** FAQ. On the home page (home=true) it shows the 5 conversion questions (§4.7)
 *  plus a "View full FAQ" link; elsewhere it renders the full shop FAQ. */
export default function FaqSection({ home = false }: { home?: boolean }) {
  const { t } = useT()
  const [open, setOpen] = useState<number | null>(0)
  const faqs = ((home ? t('faqHome') : t('content.shopFaqs')) as Faq[]) || []

  return (
    <section style={{ background: C.bg }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>{t('faq.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(28px,3.5vw,38px)', color: C.ink, margin: '0 0 24px' }}>{t('faq.title')}</h2>

        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, color: C.ink, textAlign: 'left' }}
                >
                  {f.q}
                  <span style={{ fontSize: 20, color: C.textMuted3, fontWeight: 300, lineHeight: 1, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.65, color: f.placeholder ? C.accent : C.textMuted, fontStyle: f.placeholder ? 'italic' : 'normal', margin: 0, padding: '0 2px 20px' }}>
                    {f.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {home && (
          <div style={{ marginTop: 20 }}>
            <Link to="/faq" className="transition-colors hover:text-[#A0341F]" style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none' }}>{t('faq.viewFull')} →</Link>
          </div>
        )}
      </div>
    </section>
  )
}
