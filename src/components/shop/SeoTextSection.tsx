import { Link } from 'react-router'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

interface SeoSection {
  heading: string
  body: string
  linkLabel: string
  to: string
}

// V2 homepage module 12 — SEO text block (REQ-012). Machine-readable, H2-structured
// copy with internal links to the real collection routes (REQ-010). Per REQ-019
// (T-306) the buy-path band carries NO /blog link: the internal "knowledge" link
// now points at /inspiration (its own context). Blog stays reachable from the
// Inspiration/Footer chrome, not from under the offer summaries. Honest framing
// only — the truthful-claims scan (REQ-005/006) applies here too; the final
// keyword set is a marked content TODO (OQ-007).
export default function SeoTextSection() {
  const { t } = useT()
  const sections = (t('home.seo.sections') as SeoSection[]) || []

  return (
    <section style={{ background: C.bg, borderTop: `1px solid ${C.border}` }} aria-label={t('home.seo.title')}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3vw,36px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.2 }}>{t('home.seo.title')}</h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 15, lineHeight: 1.7, color: C.textMuted, margin: '0 0 36px' }}>{t('home.seo.intro')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sections.map((s) => (
            <div key={s.to}>
              <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, color: C.ink, margin: '0 0 8px', lineHeight: 1.25 }}>{s.heading}</h2>
              <p style={{ fontFamily: FONT_SANS, fontSize: 14.5, lineHeight: 1.65, color: C.textMuted, margin: '0 0 8px' }}>{s.body}</p>
              <Link
                to={s.to}
                className="transition-colors hover:text-[#A0341F]"
                style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none' }}
              >
                {s.linkLabel} →
              </Link>
            </div>
          ))}
        </div>

        <p style={{ margin: '32px 0 0' }}>
          <Link
            to={t('home.seo.knowledgeTo')}
            className="transition-colors hover:text-[#A0341F]"
            style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none' }}
          >
            {t('home.seo.knowledgeLabel')} →
          </Link>
        </p>

        {/* OQ-007: final keyword set is a content TODO — surfaced honestly as a
            non-indexed comment so the structure is shipped without claiming a
            finalized keyword set. */}
        {/* keyword-todo: {t('home.seo.keywordTodo')} */}
      </div>
    </section>
  )
}
