import { Link } from 'react-router'
import { BRAND_NAME, C, FONT_SERIF, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

export default function SiteFooter() {
  const { t } = useT()
  return (
    <footer style={{ background: C.ink, color: '#A9A091' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '44px 32px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.inkOnDark }}>{BRAND_NAME}</div>
        <div style={{ fontSize: 13, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/about" className="transition-colors hover:text-[#F3EEE3]" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.atelier')}</Link>
          <Link to="/contact" className="transition-colors hover:text-[#F3EEE3]" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.contact')}</Link>
          <span>{t('footer.shipping')}</span><span>{t('footer.sustain')}</span><span>{t('footer.terms')}</span>
        </div>
        <div style={{ fontSize: 12, color: '#7d756a' }}>{t('footer.claim')}</div>
      </div>
    </footer>
  )
}
