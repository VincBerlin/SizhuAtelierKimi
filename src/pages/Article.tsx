import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { getBlogPost } from '../lib/shop'

export default function Article() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!post) {
    return (
      <main style={{ background: '#E8E1D6', paddingTop: 140, minHeight: '70vh', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 30, color: '#2C2420' }}>Artikel nicht gefunden</p>
        <Link to="/blog" style={{ display: 'inline-block', marginTop: 16, color: '#A0522D', fontFamily: '"Inter", sans-serif' }}>Zum Journal →</Link>
      </main>
    )
  }

  return (
    <main style={{ background: '#E8E1D6', paddingTop: 96 }}>
      <article className="max-w-[720px] mx-auto" style={{ padding: '32px 24px 72px' }}>
        <Link to="/blog" className="inline-flex items-center gap-2" style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#8A7E72', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={15} /> Journal
        </Link>

        <p className="section-eyebrow" style={{ color: '#A0522D' }}>{post.category}</p>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(32px, 5vw, 52px)', color: '#2C2420', lineHeight: 1.1, marginTop: 10 }}>
          {post.title}
        </h1>
        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13, color: '#8A7E72', marginTop: 14 }}>
          {post.date} · {post.readTime} Lesezeit
        </p>

        <div className="overflow-hidden rounded" style={{ aspectRatio: '16/9', marginTop: 28 }}>
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div style={{ marginTop: 36 }}>
          {post.body.map((section, i) => (
            <section key={i} style={{ marginBottom: 28 }}>
              {section.heading && (
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(22px, 3vw, 28px)', color: '#2C2420', marginBottom: 12 }}>
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} style={{ fontFamily: '"Inter", sans-serif', fontSize: 16, color: '#4A423C', lineHeight: 1.8, marginBottom: 14 }}>
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 16, padding: 28, background: '#F5F2ED', borderRadius: 8, textAlign: 'center' }}>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 24, color: '#2C2420' }}>
            Dein eigenes Chart als Poster
          </h3>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 14, color: '#8A7E72', marginTop: 8, lineHeight: 1.6 }}>
            Personalisiert aus deinen Geburtsdaten, handveredelt im Atelier.
          </p>
          <Link to="/produkt/bazi-chart-poster" className="cta-button" style={{ marginTop: 18, textDecoration: 'none' }}>
            BaZi-Poster gestalten
          </Link>
        </div>
      </article>
    </main>
  )
}
