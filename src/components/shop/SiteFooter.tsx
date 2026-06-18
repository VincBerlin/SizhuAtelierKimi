import { Link } from 'react-router'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, CONTAINER, BRAND_NAME } from '../../lib/tokens'

// Footer links — all required legal + info pages (REQ-039).
const footerLinks = [
  { key: 'howItWorks', to: '/how-it-works' },
  { key: 'about', to: '/about' },
  { key: 'contact', to: '/contact' },
  { key: 'faq', to: '/faq' },
  { key: 'shipping', to: '/shipping' },
  { key: 'returns', to: '/returns' },
  { key: 'terms', to: '/terms' },
  { key: 'privacy', to: '/privacy' },
  { key: 'impressum', to: '/impressum' },
]

export default function SiteFooter() {
  const { t } = useT()
  return (
    <footer style={{ background: C.ink, color: '#A9A091' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '44px 32px 36px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <Link to="/" style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.inkOnDark, textDecoration: 'none' }}>{BRAND_NAME}</Link>
          <div style={{ fontSize: 12, color: '#7d756a' }}>{t('footer.claim')}</div>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 22px', fontSize: 13, borderTop: '1px solid #2f2a22', paddingTop: 22 }}>
          {footerLinks.map((l) => (
            <Link key={l.key} to={l.to} className="transition-colors hover:text-[#F3EEE3]" style={{ color: 'inherit', textDecoration: 'none' }}>{t('footer.' + l.key)}</Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
