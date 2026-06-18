import { Link } from 'react-router'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

/** Celestial Vault teaser (§4.5): drives profile creation for Celestial Credits.
 *  Credits unlock the unbuyable (palettes, chronicles) — never a discount. */
export default function CelestialVault() {
  const { t } = useT()
  return (
    <section style={{ background: C.bundleCard }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '68px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A28E', marginBottom: 16 }}>✦ {t('vault.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(30px,4vw,46px)', color: C.inkOnDark, margin: '0 0 18px', lineHeight: 1.1 }}>{t('vault.title')}</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.75, color: '#B8B0A2', maxWidth: 600, margin: '0 auto 30px' }}>{t('vault.copy')}</p>
        <Link to="/account" className="transition-[filter] hover:brightness-110" style={{ display: 'inline-block', background: C.accent, color: '#fff', textDecoration: 'none', fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, letterSpacing: '0.02em', padding: '14px 30px', borderRadius: 4 }}>{t('vault.cta')}</Link>
      </div>
    </section>
  )
}
