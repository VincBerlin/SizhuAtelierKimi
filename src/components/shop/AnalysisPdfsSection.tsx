import { Link } from 'react-router'
import { collectionPath } from '../../lib/collections'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// V2 homepage module 08 — "Analysis PDFs" (REQ-008). A light teaser linking to
// the real analysis-pdfs collection (REQ-010). Honest framing — a *captured*
// reading of your inputs, not a precise astronomical assessment.
export default function AnalysisPdfsSection() {
  const { t } = useT()
  return (
    <section style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
      <div style={{ maxWidth: 620 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('home.analysis.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: '0 0 12px', lineHeight: 1.15 }}>{t('home.analysis.title')}</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.7, color: C.textMuted, margin: '0 0 24px' }}>{t('home.analysis.copy')}</p>
        <Link
          to={collectionPath('analysis-pdfs')}
          className="transition-colors hover:text-[#A0341F]"
          style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none' }}
        >
          {t('home.analysis.cta')} →
        </Link>
      </div>
    </section>
  )
}
