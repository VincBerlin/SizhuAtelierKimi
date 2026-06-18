import { useEffect } from 'react'
import { Link } from 'react-router'
import { useT } from '../i18n/I18nProvider'

type Step = { num: string; title: string; desc: string }
type Material = { title: string; desc: string }

export default function About() {
  const { t } = useT()
  const steps = (t('pages.about.steps') as unknown as Step[]) || []
  const materials = (t('pages.about.materials') as unknown as Material[]) || []

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main>
      {/* Hero */}
      <section style={{ minHeight: '60vh', background: '#E8E1D6' }}>
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[45fr_55fr] gap-8 items-center" style={{ padding: '120px 24px 0', minHeight: '60vh' }}>
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
              {t('pages.about.eyebrow')}
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
              {t('pages.about.title1')}<br />{t('pages.about.title2')}
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
              {t('pages.about.heroIntro')}
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
              alt="Studio process"
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
              {t('pages.about.philTitle')}
            </h2>
            <div className="mt-8 space-y-6">
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', lineHeight: 1.75 }}>
                {t('pages.about.philP1')}
              </p>
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', lineHeight: 1.75 }}>
                {t('pages.about.philP2')}
              </p>
              <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 15, color: '#8A7E72', lineHeight: 1.75 }}>
                {t('pages.about.philP3')}
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
            {t('pages.about.processTitle')}
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
                {t('pages.about.materialsTitle')}
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
                {t('pages.about.materialsIntro')}
              </p>
            </div>
            <div className="overflow-hidden rounded" style={{ aspectRatio: '3/2' }}>
              <img
                src="/images/atelier/materials.jpg"
                alt="Materials"
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
            {t('pages.about.ctaTitle')}
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
              {t('pages.about.ctaBtn1')}
            </Link>
            <Link
              to="/contact"
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
              {t('pages.about.ctaBtn2')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
