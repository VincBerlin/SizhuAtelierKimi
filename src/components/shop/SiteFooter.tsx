import { Link } from 'react-router'
import { useT, LANGS } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER, BRAND_NAME, FREE_SHIP_THRESHOLD } from '../../lib/tokens'
import { euro } from '../../lib/format'

// M15 / REQ-024 — the footer is grouped into the required areas: service/help,
// discover, legal, plus a bottom bar with a locale/country selector, payment
// methods and a shipping note. FAQ/About/Contact/Blog live HERE (moved out of the
// shop-oriented primary nav, REQ-005). Every link targets an existing route.
//
// HONESTY (NG-004): NO fake social accounts are invented — the real contact email
// is the get-in-touch surface; a social-handles area lands only once real accounts
// exist (RL-SOCIAL / OQ, non-final). Payment methods listed are the ones the
// checkout actually offers; the shipping note mirrors the real free-ship rule.
const GROUPS = [
  { key: 'service', links: [{ key: 'howItWorks', to: '/how-it-works' }, { key: 'faq', to: '/faq' }, { key: 'contact', to: '/contact' }, { key: 'shipping', to: '/shipping' }, { key: 'returns', to: '/returns' }] },
  { key: 'discover', links: [{ key: 'inspiration', to: '/inspiration' }, { key: 'about', to: '/about' }, { key: 'blog', to: '/blog' }] },
  { key: 'legal', links: [{ key: 'terms', to: '/terms' }, { key: 'privacy', to: '/privacy' }, { key: 'impressum', to: '/impressum' }] },
] as const

const CONTACT_EMAIL = 'hello@sizhuatelier.shop'
const PAYMENTS = ['PayPal', 'Apple Pay', 'Google Pay'] as const

const headingStyle = { fontFamily: FONT_SANS, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8072', margin: '0 0 12px' } as const

export default function SiteFooter() {
  const { t, lang, setLang } = useT()
  return (
    <footer data-testid="site-footer" style={{ background: C.ink, color: '#A9A091' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <Link to="/" style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.inkOnDark, textDecoration: 'none' }}>{BRAND_NAME}</Link>
          <div style={{ fontSize: 12, color: '#7d756a', maxWidth: 360 }}>{t('footer.claim')}</div>
        </div>

        {/* Grouped link columns — the REQ-024 service / discover / legal areas. */}
        <div data-testid="footer-groups" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '28px 24px', borderTop: '1px solid #2f2a22', paddingTop: 28 }}>
          {GROUPS.map((g) => (
            <nav key={g.key} data-testid={`footer-group-${g.key}`} aria-label={t(`footer.groups.${g.key}`)}>
              <div style={headingStyle}>{t(`footer.groups.${g.key}`)}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {g.links.map((l) => (
                  <li key={l.key}><Link to={l.to} className="transition-colors hover:text-[#F3EEE3]" style={{ color: 'inherit', textDecoration: 'none', fontSize: 13.5 }}>{t('footer.' + l.key)}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
          <div data-testid="footer-group-contact">
            <div style={headingStyle}>{t('footer.groups.contact')}</div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-[#F3EEE3]" style={{ color: 'inherit', textDecoration: 'none', fontSize: 13.5 }}>{CONTACT_EMAIL}</a>
          </div>
        </div>

        {/* Bottom bar — locale/country + payment methods + shipping note (REQ-024). */}
        <div data-testid="footer-bottom" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #2f2a22', marginTop: 28, paddingTop: 22 }}>
          <div data-testid="footer-locale" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#7d756a' }}>{t('footer.locale')}</span>
            {LANGS.map((l) => (
              <button key={l} type="button" data-testid="footer-lang" aria-pressed={lang === l} onClick={() => setLang(l)} style={{ background: 'none', border: `1px solid ${lang === l ? '#A9A091' : '#3a342b'}`, color: lang === l ? '#F3EEE3' : '#A9A091', borderRadius: 6, padding: '4px 9px', fontSize: 12, cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <div data-testid="footer-payments" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#7d756a' }}>{t('footer.payment')}</span>
            {PAYMENTS.map((p) => (<span key={p} style={{ fontSize: 12, color: '#A9A091', border: '1px solid #3a342b', borderRadius: 6, padding: '4px 9px' }}>{p}</span>))}
          </div>
          <div data-testid="footer-shipping-note" style={{ fontSize: 12, color: '#7d756a', flexBasis: '100%' }}>{t('footer.shipNote', { amount: euro(FREE_SHIP_THRESHOLD) })}</div>
        </div>
      </div>
    </footer>
  )
}
