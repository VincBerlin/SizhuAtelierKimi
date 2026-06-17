import { useState } from 'react'
import { shopFaqs } from '../../lib/catalog'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section style={{ background: C.bg }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 32px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>FAQ</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(28px,3.5vw,38px)', color: C.ink, margin: '0 0 24px' }}>Häufige Fragen</h2>

        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {shopFaqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, color: C.ink, textAlign: 'left' }}
                >
                  {f.q}
                  <span style={{ fontSize: 20, color: C.textMuted3, fontWeight: 300, lineHeight: 1, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.65, color: f.placeholder ? C.accent : C.textMuted, fontStyle: f.placeholder ? 'italic' : 'normal', margin: 0, padding: '0 2px 20px' }}>
                    {f.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
