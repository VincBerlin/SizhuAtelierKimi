import { articles } from '../../lib/catalog'
import { useShopStore } from '../../store/ShopStore'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

export default function WissenSection() {
  const { openArticle } = useShopStore()
  const { t } = useT()

  return (
    <section id="wissen" style={{ background: C.surfaceWarm, borderTop: `1px solid ${C.border}`, marginTop: 24 }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>{t('wissen.eyebrow')}</div>
            <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 32, margin: 0 }}>{t('wissen.title')}</h2>
          </div>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2, maxWidth: 320, margin: 0 }}>{t('wissen.sub')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => openArticle(a.id)}
              className="transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_30px_-20px_rgba(42,38,32,0.4)]"
              style={{ textAlign: 'left', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 26, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: FONT_SANS }}
            >
              <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent }}>{t(`content.articles.${a.id}.tag`)}</span>
              <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, margin: 0, lineHeight: 1.2, color: C.ink }}>{t(`content.articles.${a.id}.title`)}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>{t(`content.articles.${a.id}.excerpt`)}</p>
              <span style={{ fontSize: 13, color: C.ink, fontWeight: 500, marginTop: 4 }}>{t('wissen.read')}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
