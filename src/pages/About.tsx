import { useEffect } from 'react'
import { Link } from 'react-router'

const steps = [
  { num: '01', title: 'Geburtsdaten eingeben', desc: 'Teile uns Datum, Uhrzeit und Ort deiner Geburt mit. F\u00fcr Paar-Charts auch die Daten deines Partners.' },
  { num: '02', title: 'Chart berechnen', desc: 'Wir berechnen deine astrologischen S\u00e4ulen nach traditionellen Methoden und analysieren die Elemente.' },
  { num: '03', title: 'Design w\u00e4hlen', desc: 'W\u00e4hle aus verschiedenen Design-Stilen, Farbpaletten und Layouts, die zu deiner pers\u00f6nlichen Chart-Energie passen.' },
  { num: '04', title: 'Im Atelier drucken', desc: 'Dein Poster wird auf hochwertigem Hahnem\u00fchle-Papier mit archivalischen Tinten gedruckt und sorgf\u00e4ltig verpackt.' },
]

const materials = [
  { title: 'Hahnem\u00fchle Papier', desc: '100% Baumwolle, 308gsm, museum grade. Acid-free f\u00fcr eine Lebensdauer von \u00fcber 100 Jahren.' },
  { title: 'Archivale Tinten', desc: 'Pigmentbasierte Tinten mit UV-Best\u00e4ndigkeit. Farben, die nicht verblassen.' },
  { title: 'Handgefertigte Rahmen', desc: 'Massivholzrahmen aus nachhaltiger Forstwirtschaft. Erh\u00e4ltlich in Eiche, Nuss und Schwarz.' },
]

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      {/* Hero */}
      <section style={{ minHeight: '60vh', background: '#E8E1D6' }}>
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-center" style={{ padding: '120px 24px 0', minHeight: '60vh' }}>
          <div style={{ paddingBottom: 60 }}>
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
              DAS ATELIER
            </p>
            <h1
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 300,
                fontSize: 'clamp(40px, 4.5vw, 56px)',
                color: '#2C2420',
                lineHeight: 1.1,
              }}
            >
              Wo Astrologie<br />Begegnung Kunst wird
            </h1>
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 15,
                color: '#8A7E72',
                lineHeight: 1.75,
                marginTop: 20,
                maxWidth: 440,
              }}
            >
              SizhuAtelier ist ein Schweizer Kunststudio, das die Weisheit der ostasiatischen Astrologie in zeitlose, personalisierte Wandkunst &uuml;bersetzt.
            </p>
          </div>
          <div className="h-[40vh] lg:h-[60vh]">
            <img
              src="/images/atelier/workspace.jpg"
              alt="SizhuAtelier Workshop"
              className="w-full h-full object-cover"
              style={{ borderRadius: '4px 4px 0 0' }}
            />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section style={{ padding: 'clamp(80px, 10vw, 100px) 0', background: '#E8E1D6' }}>
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" style={{ padding: '0 24px' }}>
          <div className="overflow-hidden rounded" style={{ aspectRatio: '3/2' }}>
            <img
              src="/images/atelier/studio-process.jpg"
              alt="H\u00e4nde bei der Arbeit"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontWeight: 400,
                fontSize: 'clamp(30px, 3vw, 36px)',
                color: '#2C2420',
                lineHeight: 1.2,
              }}
            >
              Unsere Philosophie
            </h2>
            <div className="mt-8 space-y-6">
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', lineHeight: 1.75 }}>
                Wir glauben, dass Astrologie mehr ist als Vorhersage &mdash; sie ist eine Sprache der Selbsterkenntnis. Die traditionellen Systeme des Ostens, ob Chinesische Vier-S\u00e4ulen-Lehre, Koreanisches Saju oder Japanisches Junishi, bieten eine tiefgr\u00fcndige Kartografie der menschlichen Pers\u00f6nlichkeit.
              </p>
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', lineHeight: 1.75 }}>
                Jedes Poster, das unser Atelier verl\u00e4sst, ist ein Unikat. Wir verbinden computergest\u00fctzte Chart-Berechnung mit handwerklicher Druckkunst, um Werke zu schaffen, die sowohl wissenschaftlich fundiert als auch \u00e4sthetisch \u00fcberzeugend sind.
              </p>
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', lineHeight: 1.75 }}>
                Unser Atelier in der Schweiz steht f\u00fcr Pr\u00e4zision, Qualit\u00e4t und Respekt vor der Tradition. Wir arbeiten ausschliesslich mit archivalischen Materialien, damit dein pers\u00f6nliches Kunstwerk Generationen \u00fcberdauert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section style={{ padding: '80px 0', background: '#F5F2ED' }}>
        <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
          <h2
            className="text-center mb-12"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(30px, 3vw, 36px)',
              color: '#2C2420',
            }}
          >
            Der Weg zu deinem Poster
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num}>
                <span
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 300,
                    fontSize: 48,
                    color: '#D5C9B7',
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </span>
                <h3
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#2C2420',
                    marginTop: 12,
                    marginBottom: 8,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 14,
                    color: '#8A7E72',
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials */}
      <section style={{ padding: 'clamp(80px, 10vw, 100px) 0', background: '#E8E1D6' }}>
        <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12">
            <div>
              <h2
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontWeight: 400,
                  fontSize: 'clamp(30px, 3vw, 36px)',
                  color: '#2C2420',
                  lineHeight: 1.2,
                }}
              >
                Materialien mit Bedeutung
              </h2>
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 15,
                  color: '#8A7E72',
                  lineHeight: 1.75,
                  marginTop: 16,
                }}
              >
                Wir verwenden ausschliesslich Materialien von h\u00f6chster Qualit\u00e4t. Jedes Detail wird sorgf\u00e4ltig ausgew\u00e4hlt, um sowohl die \u00e4sthetische als auch die energetische Qualit\u00e4t deines Posters zu gew\u00e4hrleisten.
              </p>
            </div>
            <div className="overflow-hidden rounded" style={{ aspectRatio: '3/2' }}>
              <img
                src="/images/atelier/materials.jpg"
                alt="Materialien im Atelier"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {materials.map((m) => (
              <div
                key={m.title}
                className="rounded"
                style={{
                  padding: 28,
                  background: '#F5F2ED',
                  border: '1px solid rgba(44, 36, 32, 0.06)',
                }}
              >
                <h3
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#2C2420',
                    marginBottom: 8,
                  }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 14,
                    color: '#8A7E72',
                    lineHeight: 1.6,
                  }}
                >
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(80px, 10vw, 100px) 0', background: '#E8E1D6', textAlign: 'center' }}>
        <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
          <h2
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 400,
              fontSize: 'clamp(32px, 3.5vw, 40px)',
              color: '#2C2420',
              marginBottom: 36,
            }}
          >
            Bereit f&uuml;r dein pers&ouml;nliches Kunstwerk?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/"
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
              Poster gestalten
            </Link>
            <Link
              to="/kontakt"
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
              Kontakt
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
