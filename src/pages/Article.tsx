import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { articles } from '../lib/catalog'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, ACCENT_CTA_SHADOW } from '../lib/tokens'

export default function Article() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useT()
  const a = articles.find((x) => x.id === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!a) {
    return (
      <main style={{ background: C.bg, padding: '80px 32px', textAlign: 'center', minHeight: '50vh' }}>
        <p style={{ fontFamily: FONT_SERIF, fontSize: 28, color: C.ink }}>{t('pages.notFound')}</p>
        <Link to="/blog" style={{ display: 'inline-block', marginTop: 14, color: C.accent, fontFamily: FONT_SANS }}>{t('pages.toJournal')}</Link>
      </main>
    )
  }

  const base = `content.articles.${a.id}`
  const body = (t(`${base}.body`) as unknown as string[]) || []

  return (
    <main style={{ background: C.bg }}>
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '40px 32px 72px' }}>
        <Link to="/blog" className="transition-colors hover:text-[#2A2620]" style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2, textDecoration: 'none' }}>{t('pages.articleBack')}</Link>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent, margin: '24px 0 10px' }}>{t(`${base}.tag`)}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(30px,4.5vw,46px)', color: C.ink, lineHeight: 1.12, margin: 0 }}>{t(`${base}.title`)}</h1>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted3, margin: '12px 0 28px' }}>{t(`${base}.meta`)}</div>
        {body.map((p, i) => (
          <p key={i} style={{ fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.75, color: '#4A4438', margin: '0 0 18px' }}>{p}</p>
        ))}
        <div style={{ marginTop: 24, padding: 24, background: C.surfaceWarm, borderRadius: 12 }}>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 22, color: C.ink, marginBottom: 8 }}>{t('pages.articleCta')}</div>
          <Link to="/product/1" className="transition-[filter] hover:brightness-110" style={{ display: 'inline-block', background: C.accent, color: '#fff', padding: '12px 22px', borderRadius: 999, fontSize: 14, fontFamily: FONT_SANS, textDecoration: 'none', boxShadow: ACCENT_CTA_SHADOW }}>{t('pages.articleCtaBtn')}</Link>
        </div>
      </article>
    </main>
  )
}
