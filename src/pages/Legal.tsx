import { useEffect } from 'react'
import { LEGAL_DOCS } from '../lib/legal'
import { C, FONT_SERIF, FONT_SANS } from '../lib/tokens'

/** Renders a single legal document (REQ-039). Entity-specific facts appear as
 *  visible [MISSING — …] placeholders; a banner states the page must be completed
 *  and professionally reviewed (incl. localized DE/FR) before go-live. */
export default function Legal({ docKey }: { docKey: string }) {
  const doc = LEGAL_DOCS[docKey]
  useEffect(() => { window.scrollTo(0, 0) }, [docKey])
  if (!doc) return null
  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 80px' }}>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(28px,4vw,40px)', color: C.ink, margin: '0 0 18px', lineHeight: 1.1 }}>{doc.title}</h1>
        <div style={{ background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: C.textMuted, lineHeight: 1.55, marginBottom: 30 }}>
          This page is a structural template. Items marked <strong>[MISSING — …]</strong> must be completed with the operator’s real legal details, and a professional legal review (plus localized DE/FR versions) is required before go-live.
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
