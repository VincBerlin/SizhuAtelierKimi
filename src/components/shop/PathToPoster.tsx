import { PenLine, Cpu, Eye, Truck, Sparkles, ShieldCheck, Palette } from 'lucide-react'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// §3.2 — "The Path To Your Poster": four explanatory steps that replace the bare
// trust bar, with the four trust signals (Precision API · 5–7 Day Delivery ·
// Stripe Secure · Premium Art) integrated as the dark strip below.
const stepIcons = [PenLine, Cpu, Eye, Truck]
const trustItems = [
  { icon: Sparkles, key: 'api' },
  { icon: Truck, key: 'delivery' },
  { icon: ShieldCheck, key: 'secure' },
  { icon: Palette, key: 'art' },
]

function PayChips() {
  const chip = (bg: string, color: string, label: string, border?: boolean) => (
    <span style={{ fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, lineHeight: 1, padding: '3px 5px', borderRadius: 3, background: bg, color, border: border ? '1px solid #dadce0' : 'none' }}>{label}</span>
  )
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {chip('#FFC439', '#0a0a0a', 'PayPal')}
      {chip('#000', '#fff', ' Pay')}
      {chip('#fff', '#3c4043', 'G Pay', true)}
    </span>
  )
}

export default function PathToPoster() {
  const { t } = useT()
  const steps = (t('path.steps') as { title: string; desc: string }[]) || []
  return (
    <section aria-label={t('path.title')} style={{ background: C.bg }}>
      {/* Striking-but-minimal dark trust banner — directly ABOVE the heading (§3.2),
          a slow continuous marquee. Two identical groups → translateX(-50%) loops
          seamlessly; pauses on hover and honours prefers-reduced-motion. */}
      <div style={{ background: C.ink, overflow: 'hidden' }} aria-label={t('trust.payTitle')}>
        <div className="trust-marquee" style={{ display: 'flex', width: 'max-content' }}>
          {[0, 1].map((g) => (
            <ul key={g} aria-hidden={g === 1} style={{ listStyle: 'none', margin: 0, padding: '11px 0', paddingRight: 48, display: 'flex', alignItems: 'center', gap: 48 }}>
              {trustItems.map((it) => (
                <li key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <it.icon size={16} strokeWidth={1.6} style={{ color: C.accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: 'rgba(243,238,227,0.66)', lineHeight: 1.3 }}>
                    <strong style={{ color: C.inkOnDark, fontWeight: 600 }}>{t('trust.' + it.key + 'Title')}</strong>
                    {it.key === 'secure' ? ' · ' : <> · {t('trust.' + it.key + 'Sub')}</>}
                    {it.key === 'secure' && <PayChips />}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 24px 8px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>{t('path.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.4vw,38px)', color: C.ink, margin: 0, lineHeight: 1.1 }}>{t('path.title')}</h2>
        </div>
        <ol className="grid grid-cols-2 lg:grid-cols-4" style={{ listStyle: 'none', margin: 0, padding: 0, gap: 24 }}>
          {steps.map((s, i) => {
            const Icon = stepIcons[i] || PenLine
            return (
              <li key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
                <div style={{ width: 52, height: 52, borderRadius: 999, border: `1px solid ${C.border}`, background: C.surfaceWarm, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                  <Icon size={22} strokeWidth={1.5} style={{ color: C.accent }} />
                  <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 999, background: C.ink, color: C.bg, fontSize: 11, fontWeight: 700, fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                </div>
                <div style={{ fontFamily: FONT_SERIF, fontSize: 18, color: C.ink, lineHeight: 1.2 }}>{s.title}</div>
                <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted, lineHeight: 1.55, margin: 0, maxWidth: 220 }}>{s.desc}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
