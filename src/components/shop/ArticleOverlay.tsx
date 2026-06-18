import { useNavigate } from 'react-router'
import { useShopStore } from '../../store/ShopStore'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'

export default function ArticleOverlay() {
  const { articleId, closeArticle } = useShopStore()
  const { t } = useT()
  const navigate = useNavigate()
  const open = !!articleId
  const base = articleId ? `content.articles.${articleId}` : null
  const body = (base ? (t(`${base}.body`) as string[]) : []) || []

  return (
    <>
      <div onClick={closeArticle} style={{ position: 'fixed', inset: 0, background: 'rgba(28,24,18,0.42)', zIndex: 60, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .35s ease' }} />
      <aside style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: 'min(620px, 100vw)', background: C.bg, zIndex: 61, boxShadow: '-20px 0 50px -20px rgba(28,24,18,0.4)', transform: `translateX(${open ? '0' : '100%'})`, transition: 'transform .4s cubic-bezier(0.4,0,0.2,1)', display: open ? 'flex' : 'none', flexDirection: 'column' }}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent }}>{base ? t(`${base}.tag`) : ''}</span>
          <button onClick={closeArticle} className="transition-colors hover:text-[#2A2620]" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.textMuted2, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '32px 40px 60px' }}>
          <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 34, lineHeight: 1.12, margin: '0 0 8px' }}>{base ? t(`${base}.title`) : ''}</h1>
          <div style={{ fontSize: 13, color: C.textMuted3, marginBottom: 24 }}>{base ? t(`${base}.meta`) : ''}</div>
          {body.map((para, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: '#4A4438', margin: '0 0 18px' }}>{para}</p>
          ))}
          <div style={{ marginTop: 24, padding: 22, background: C.surfaceWarm, borderRadius: 12 }}>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 20, marginBottom: 8 }}>{t('pages.articleCta')}</div>
            <button onClick={() => { closeArticle(); navigate('/product/1'); window.scrollTo(0, 0) }} className="transition-[filter] hover:brightness-110" style={{ background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '12px 22px', borderRadius: 999, fontSize: 14, fontFamily: FONT_SANS }}>{t('pages.articleCtaBtn')}</button>
          </div>
        </div>
      </aside>
    </>
  )
}
