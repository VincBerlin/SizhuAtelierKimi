import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { Heart, Sliders, Truck } from 'lucide-react'
import InkWave from '../components/InkWave'
import DominoGallery from '../components/DominoGallery'
import ParallaxGallery from '../components/ParallaxGallery'
import ShimmerRibbon from '../components/ShimmerRibbon'
import { blogPosts, comingSoonProducts } from '../lib/shop'

/* ===== HERO SECTION ===== */
function HeroSection() {
  return (
    <section id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <InkWave />
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 0 80px 80px',
          maxWidth: 600,
        }}
        className="px-6 sm:px-10 lg:px-20 pb-16 sm:pb-20"
      >
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#A0522D',
            marginBottom: 16,
            textShadow: '0 0 40px rgba(232, 225, 214, 0.6)',
          }}
        >
          PERS&Ouml;NLICHE ASTROLOGIE KUNST
        </p>
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 'clamp(48px, 6vw, 84px)',
            lineHeight: 1.05,
            color: '#2C2420',
            textShadow: '0 0 40px rgba(232, 225, 214, 0.6)',
          }}
        >
          Dein<br />Sternenbild
        </h1>
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 17,
            fontWeight: 400,
            color: '#8A7E72',
            maxWidth: 440,
            marginTop: 20,
            lineHeight: 1.7,
            textShadow: '0 0 40px rgba(232, 225, 214, 0.6)',
          }}
        >
          BaZi im Fokus &mdash; Saju und Junishi als kommende Personalisierungen, handveredelt im Atelier.
        </p>
        <div className="flex flex-wrap gap-4" style={{ marginTop: 36 }}>
          <a
            href="#kollektionen"
            style={{
              background: '#A0522D',
              color: '#F5F2ED',
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '14px 32px',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#B5652B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#A0522D' }}
          >
            Poster entdecken
          </a>
          <Link
            to="/atelier"
            style={{
              background: 'transparent',
              color: '#2C2420',
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '14px 32px',
              border: '1px solid rgba(44, 36, 32, 0.15)',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A0522D'; e.currentTarget.style.color = '#A0522D' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(44, 36, 32, 0.15)'; e.currentTarget.style.color = '#2C2420' }}
          >
            So funktioniert&apos;s
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ===== CATEGORIES SECTION ===== */
const categories = [
  {
    image: '/images/categories/bazi.jpg',
    title: 'Chinesische Astrologie (BaZi)',
    description: 'BaZi steht im Fokus: personalisierte Vier-Säulen-Poster als kommende Kernlinie.',
    id: 'bazi',
    status: 'Coming Soon',
  },
  {
    image: '/images/categories/saju.jpg',
    title: 'Koreanische Astrologie (Saju)',
    description: 'Vier-Pfeiler-Charts im koreanischen Stil - als Personalisierung in Vorbereitung.',
    id: 'saju',
    status: 'Coming Soon',
  },
  {
    image: '/images/categories/junishi.jpg',
    title: 'Japanische Astrologie (Junishi)',
    description: 'Tierkreis-Kunst nach japanischer Tradition - bald als personalisierte Posterlinie.',
    id: 'junishi',
    status: 'Coming Soon',
  },
  {
    image: '/images/categories/tcm.jpg',
    title: 'TCM & Wu Xing Art',
    description: 'Holz, Feuer, Erde, Metall, Wasser - als Wandkunst für Praxis, Yoga & Studio.',
    id: 'tcm',
  },
]

function CategoriesSection() {
  return (
    <section id="kollektionen" style={{ padding: '80px 0', background: '#E8E1D6' }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 40, fontWeight: 400, color: '#2C2420' }}>
            Kollektionen
          </h2>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', marginTop: 8 }}>
            Astrologie-Kunst aus drei Traditionen
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} id={cat.id}>
              <div className="overflow-hidden rounded" style={{ aspectRatio: '4/5' }}>
                {cat.status && <span className="category-coming-soon">{cat.status}</span>}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-600 hover:scale-[1.04]"
                  loading="lazy"
                />
              </div>
              <h3
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 16,
                  fontWeight: 500,
                  color: '#2C2420',
                  marginTop: 16,
                }}
              >
                {cat.title}
              </h3>
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 14,
                  color: '#8A7E72',
                  marginTop: 6,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {cat.description}
              </p>
              <a
                href="#"
                className="inline-block mt-3 transition-all duration-300 hover:underline"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#A0522D',
                  textDecoration: 'none',
                  textUnderlineOffset: 4,
                }}
              >
                {cat.status ? 'Warteliste' : 'Entdecken'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComingSoonPersonalizationSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section id="coming-soon" className="coming-soon-section">
      <div className="coming-soon-inner">
        <div>
          <p className="section-eyebrow">PERSONALISIERTE POSTER · COMING SOON</p>
          <h2>BaZi, Saju & Junishi vormerken</h2>
        </div>
        <div className="coming-soon-panel">
          <div className="coming-soon-list">
            {comingSoonProducts.map((product) => (
              <article key={product.id}>
                <span>{product.label}</span>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
              </article>
            ))}
          </div>
          <form
            className="coming-soon-signup"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
            <label htmlFor="coming-soon-home-email">E-Mail eintragen und 25% sichern</label>
            <div>
              <input
                id="coming-soon-home-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="deine@email.de"
                required
              />
              <button type="submit">25% sichern</button>
            </div>
            {submitted && <p>Danke. Du bist für den Early Access vorgemerkt.</p>}
          </form>
        </div>
      </div>
    </section>
  )
}

function BlogPreviewSection() {
  return (
    <section id="blog" className="blog-preview-section">
      <div className="blog-preview-inner">
        <div className="blog-preview-head">
          <div>
            <p className="section-eyebrow">JOURNAL</p>
            <h2>Blog & Artikel</h2>
          </div>
          <Link to="/blog">Alle Artikel <span>→</span></Link>
        </div>
        <div className="blog-preview-grid">
          {blogPosts.map((post) => (
            <Link to={`/blog#${post.slug}`} key={post.slug}>
              <span>{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <small>{post.date}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== FIRE HORSE EDITORIAL ===== */
function FireHorseSection() {
  return (
    <section style={{ borderTop: '1px solid #D5C9B7' }}>
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-[600px]">
        <div className="h-[50vh] lg:h-auto">
          <img
            src="/images/atelier/fire-horse-editorial.jpg"
            alt="Feuer Pferd 2026 Limited Edition"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center" style={{ padding: 'clamp(48px, 6vw, 80px)' }}>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#A0522D',
              marginBottom: 16,
            }}
          >
            LIMITIERTE EDITION 2026
          </p>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 300,
              fontSize: 'clamp(40px, 4vw, 56px)',
              color: '#2C2420',
              lineHeight: 1.1,
            }}
          >
            Feuer Pferd
          </h2>
          <p
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 24,
              color: '#8A7E72',
              marginTop: 8,
            }}
          >
            Ein Jahr der Transformation
          </p>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 15,
              color: '#8A7E72',
              lineHeight: 1.75,
              maxWidth: 420,
              marginTop: 20,
            }}
          >
            2026 ist das Jahr des Feuer-Pferdes. Unser limitiertes Edition-Poster f\u00e4ngt die Energie dieses Jahres ein &mdash; kraftvoll, leidenschaftlich, unvergesslich. Jedes St\u00fcck wird im Atelier auf Hahnem\u00fchle-Papier gedruckt und von Hand nummeriert.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 mt-8 transition-colors duration-300 hover:underline"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              color: '#A0522D',
              textDecoration: 'none',
              textUnderlineOffset: 4,
            }}
          >
            Edition entdecken <span>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ===== STUDIO STORY SECTION ===== */
function StudioStorySection() {
  return (
    <section style={{ padding: 'clamp(80px, 10vw, 120px) 0', background: '#E8E1D6' }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#A0522D',
                marginBottom: 16,
              }}
            >
              HINTER DEN KULISSEN
            </p>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 400,
                fontSize: 'clamp(32px, 3.5vw, 40px)',
                color: '#2C2420',
                lineHeight: 1.15,
              }}
            >
              Vom Chart zum Kunstwerk
            </h2>
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 15,
                color: '#8A7E72',
                lineHeight: 1.75,
                marginTop: 20,
              }}
            >
              Jedes Poster beginnt mit einer Geburtsdatums-Analyse. Wir berechnen die astrologischen S\u00e4ulen, w\u00e4hlen Elemente und Farben mit Bedacht und setzen alles in einem einzigartigen Design zusammen. Das Ergebnis: ein Kunstwerk, das deine pers\u00f6nliche Kosmologie erz\u00e4hlt.
            </p>
            <Link
              to="/atelier"
              className="inline-flex items-center gap-2 mt-8 transition-colors duration-300 hover:underline"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 13,
                fontWeight: 500,
                textTransform: 'uppercase',
                color: '#A0522D',
                textDecoration: 'none',
                textUnderlineOffset: 4,
              }}
            >
              Das Atelier kennenlernen <span>&rarr;</span>
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded" style={{ aspectRatio: '3/2' }}>
              <img
                src="/images/atelier/studio-process.jpg"
                alt="Atelier Arbeitsprozess"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== NEWSLETTER SECTION ===== */
function NewsletterSection() {
  const [email, setEmail] = useState('')

  return (
    <section style={{ padding: 'clamp(80px, 10vw, 120px) 0', background: '#E8E1D6' }}>
      <div className="max-w-[1320px] mx-auto text-center" style={{ padding: '0 24px' }}>
        <h2
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 400,
            fontSize: 'clamp(32px, 3.5vw, 40px)',
            color: '#2C2420',
          }}
        >
          Im Atelier-Kreis
        </h2>

        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 15,
            color: '#8A7E72',
            maxWidth: 480,
            margin: '28px auto 0',
            lineHeight: 1.75,
          }}
        >
          Melde dich f&uuml;r unseren Newsletter an. Erhalte Einblicke in neue Kollektionen, astrologische Jahresimpulse und exklusive Editionen.
        </p>

        <form
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          style={{ marginTop: 32 }}
          onSubmit={(e) => { e.preventDefault() }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Deine E-Mail-Adresse"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 14,
              fontWeight: 400,
              padding: '14px 20px',
              border: '1px solid #D5C9B7',
              borderRadius: 4,
              width: '100%',
              maxWidth: 320,
              background: 'transparent',
              color: '#2C2420',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#A0522D' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#D5C9B7' }}
          />
          <button
            type="submit"
            style={{
              background: '#A0522D',
              color: '#F5F2ED',
              fontFamily: '"Inter", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              textTransform: 'uppercase',
              padding: '14px 28px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.3s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#B5652B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#A0522D' }}
          >
            Eintragen
          </button>
        </form>
      </div>
    </section>
  )
}

/* ===== GIFT FEATURES SECTION ===== */
function GiftFeaturesSection() {
  const features = [
    { icon: Heart, title: 'Pers\u00f6nlich', desc: 'Jedes Poster ist ein Unikat, berechnet aus deinen pers\u00f6nlichen Geburtsdaten.' },
    { icon: Sliders, title: 'Individuell gestaltet', desc: 'W\u00e4hle aus verschiedenen Design-Stilen, Farbpaletten und Rahmenoptionen.' },
    { icon: Truck, title: 'Schnelle Lieferung', desc: 'In 5&ndash;7 Werktagen bei dir zu Hause. Weltweiter Versand verf\u00fcgbar.' },
  ]

  return (
    <section id="geschenke" style={{ padding: '80px 0', background: '#E8E1D6' }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <div className="flex items-center justify-center mb-4" style={{ color: '#A0522D' }}>
                <f.icon size={32} strokeWidth={1.5} />
              </div>
              <h3
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#2C2420',
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 14,
                  color: '#8A7E72',
                  lineHeight: 1.6,
                  maxWidth: 280,
                  margin: '0 auto',
                }}
                dangerouslySetInnerHTML={{ __html: f.desc }}
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <a
            href="#"
            style={{
              display: 'inline-block',
              background: '#A0522D',
              color: '#F5F2ED',
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '12px 32px',
              borderRadius: 9999,
              textDecoration: 'none',
              transition: 'background 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#B5652B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#A0522D' }}
          >
            Geschenk finden
          </a>
        </div>
      </div>
    </section>
  )
}

/* ===== MAIN HOME PAGE ===== */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      <HeroSection />
      <div ref={heroRef} />
      <DominoGallery />
      <CategoriesSection />
      <ComingSoonPersonalizationSection />
      <ParallaxGallery />
      <GiftFeaturesSection />
      <FireHorseSection />
      <StudioStorySection />
      <BlogPreviewSection />
      <NewsletterSection />
      <ShimmerRibbon />
    </main>
  )
}
