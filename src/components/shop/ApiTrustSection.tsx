import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

/**
 * API trust section (REQ-038): "Why Your Poster Is Truly Personalized" + the
 * dedicated-calculation-API story + trust badges. Claims are precision-focused,
 * NOT overpromising (no "100% accurate" / "scientifically proven destiny").
 */
export default function ApiTrustSection() {
  const { t } = useT()
  const badges = (t('apiTrust.badges') as string[]) || []
  return (
    <section style={{ background: C.surfaceWarm }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '64px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('apiTrust.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: '0 0 16px', lineHeight: 1.15 }}>{t('apiTrust.title')}</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.7 }}>{t('apiTrust.copy')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {badges.map((b) => (
            <span key={b} style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.ink, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 2, padding: '8px 14px' }}>✦ {b}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
