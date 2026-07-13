import { Link } from 'react-router'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// V2 homepage module 09 — "Inspiration / Gallery teaser" (REQ-008 / REQ-011
// AT-011-4). Links to the real /inspiration route. The full gallery (with
// placeholder-marked tiles) lives on /inspiration; this is the homepage entry.
export default function InspirationTeaserSection() {
  const { t } = useT()
  return (
    // Operator 2026-07-13: Sektion größer, zweispaltig — Text links, rechts
    // eine EHRLICH markierte Platzhalter-Bildfläche (data-placeholder, kein
    // erfundenes Foto; finales Interieur-Bild ist Operator-Asset). Mobil
    // gestapelt: Platzhalter unter dem Text.
    <section style={{ background: C.surfaceWarm, borderTop: `1px solid ${C.border}` }}>
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2" style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '72px 32px' }}>
        <div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('home.inspiration.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(30px,3.6vw,44px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.12 }}>{t('home.inspiration.title')}</h2>
          <p style={{ fontFamily: FONT_SANS, fontSize: 15.5, lineHeight: 1.7, color: C.textMuted, margin: '0 0 26px', maxWidth: 520 }}>{t('home.inspiration.copy')}</p>
          <Link
            to="/inspiration"
            className="cta-square transition-[filter] hover:brightness-110"
            style={{ display: 'inline-block', background: C.accent, color: '#fff', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, padding: '14px 30px', textDecoration: 'none' }}
          >
            {t('home.inspiration.cta')} →
          </Link>
        </div>
        <div
          data-testid="inspiration-teaser-media"
          data-placeholder="true"
          aria-hidden="true"
          style={{ width: '100%', aspectRatio: '4 / 3', border: `1px solid ${C.border}`, background: `repeating-linear-gradient(135deg, ${C.surface}, ${C.surface} 16px, ${C.bg} 16px, ${C.bg} 32px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted4 }}>{t('home.inspiration.eyebrow')}</span>
        </div>
      </div>
    </section>
  )
}
