import { useEffect } from 'react'
import { Link } from 'react-router'
import { articles } from '../lib/catalog'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../lib/tokens'

export default function Blog() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px 64px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>Journal</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(34px,5vw,52px)', color: C.ink, margin: '0 0 14px', lineHeight: 1.08 }}>Blog &amp; Wissen</h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, maxWidth: 560, margin: '0 0 40px', lineHeight: 1.65 }}>
          Hintergründe zu BaZi, chinesischer Astrologie und TCM — für deine Beratung und für alle, die ihr Poster verstehen möchten.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 24 }}>
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/blog/${a.id}`}
              className="transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_30px_-20px_rgba(42,38,32,0.4)]"
              style={{ textDecoration: 'none', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 26, display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <span style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent }}>{a.tag}</span>
              <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, margin: 0, lineHeight: 1.2, color: C.ink }}>{a.title}</h2>
              <p style={{ fontFamily: FONT_SANS, fontSize: 14, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>{a.excerpt}</p>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.ink, fontWeight: 500, marginTop: 4 }}>Weiterlesen →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
