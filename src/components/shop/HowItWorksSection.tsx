import { Link } from 'react-router'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

interface Step { title: string; desc: string }

/** "How It Works" (REQ-037): explains the data-based personalization path from
 *  birth data to premium wall art. Anchored at #how-it-works. */
export default function HowItWorksSection() {
  const { t } = useT()
  const steps = (t('howItWorks.steps') as Step[]) || []
  return (
    <section id="how-it-works" style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('howItWorks.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: 0, lineHeight: 1.15 }}>{t('howItWorks.title')}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
        {steps.map((s, idx) => (
          <div key={s.title} style={{ borderTop: `2px solid ${C.accent}`, paddingTop: 14 }}>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 28, color: C.accent, marginBottom: 6 }}>{String(idx + 1).padStart(2, '0')}</div>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, color: C.ink, margin: '0 0 6px' }}>{s.title}</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: C.textMuted, lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link to="/personalize" className="transition-[filter] hover:brightness-110" style={{ display: 'inline-block', background: C.accent, color: '#fff', textDecoration: 'none', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, padding: '13px 28px', borderRadius: 4 }}>{t('howItWorks.cta')}</Link>
      </div>
    </section>
  )
}
