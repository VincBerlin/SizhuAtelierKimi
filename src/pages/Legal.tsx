import { useEffect } from 'react'
import { LEGAL_DOCS_BY_LANG, LEGAL_REVIEW_BANNER } from '../lib/legal'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS } from '../lib/tokens'

/** Renders a single legal document (REQ-039 + REQ-007). The document and the
 *  review banner are selected for the ACTIVE language (EN/DE/FR) — wiring the
 *  i18n switch into the composition root so a DE/FR visitor sees localized prose
 *  and a localized banner (AT-007-1 / AT-007-4), not the EN-only template.
 *  Entity-specific facts stay as visible [MISSING — …] placeholders (no operator
 *  data is invented); the banner states a professional review is still required
 *  before go-live. EN is the fallback if a doc/banner is missing for the lang. */
export default function Legal({ docKey }: { docKey: string }) {
  const { lang } = useT()
  const docsForLang = LEGAL_DOCS_BY_LANG[lang] ?? LEGAL_DOCS_BY_LANG.EN
  const doc = docsForLang[docKey] ?? LEGAL_DOCS_BY_LANG.EN[docKey]
  const banner = LEGAL_REVIEW_BANNER[lang] ?? LEGAL_REVIEW_BANNER.EN
  useEffect(() => { window.scrollTo(0, 0) }, [docKey, lang])
  if (!doc) return null
  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 80px' }}>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(28px,4vw,40px)', color: C.ink, margin: '0 0 18px', lineHeight: 1.1 }}>{doc.title}</h1>
        <div data-testid="legal-review-banner" style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: C.textMuted, lineHeight: 1.55, marginBottom: 30 }}>
          {banner}
        </div>
        {doc.sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 26 }}>
            {s.heading && <h2 style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 600, color: C.ink, margin: '0 0 8px' }}>{s.heading}</h2>}
            {s.body.map((p, j) => (
              <p key={j} style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, lineHeight: 1.65, margin: '0 0 10px', wordBreak: 'break-word' }}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}
