import { FileText } from 'lucide-react'
import Poster from '../Poster'
import { bundles, digitalBundle } from '../../lib/catalog'
import { useShopStore } from '../../store/ShopStore'
import { useT } from '../../i18n/I18nProvider'
import { euro } from '../../lib/format'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

export default function BundlesSection() {
  const { addItem, showToast } = useShopStore()
  const { t } = useT()

  const addPosterBundle = (b: (typeof bundles)[number]) => {
    addItem({ title: t(`content.bundles.${b.id}.title`), price: b.price, qty: 1, poster: b.p1, meta: t('content.bundleMeta3') })
    showToast(t('cart.toastSet'))
  }
  const addDigital = () => {
    addItem({ title: t('content.digitalBundle.title'), price: digitalBundle.price, qty: 1, poster: digitalBundle.poster, meta: t('content.bundleMeta') })
    showToast(t('cart.toastSet'))
  }

  return (
    <section style={{ background: C.ink, color: C.inkOnDark }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A28E', marginBottom: 10 }}>{t('bundles.eyebrow')}</div>
            <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 32, margin: 0 }}>{t('bundles.title')}</h2>
          </div>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#A9A091', maxWidth: 300, margin: 0 }}>{t('bundles.sub')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {bundles.map((b) => (
            <div key={b.id} style={{ background: C.bundleCard, border: `1px solid ${C.bundleBorder}`, borderRadius: 12, padding: 22, display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 108, height: 140, flexShrink: 0 }}>
                <div style={{ position: 'absolute', left: 0, top: 8, width: 74, height: 98, transform: 'rotate(-7deg)' }}><Poster p={b.p1} scene="plain" /></div>
                <div style={{ position: 'absolute', right: 0, top: 8, width: 74, height: 98, transform: 'rotate(7deg)' }}><Poster p={b.p2} scene="plain" /></div>
                <div style={{ position: 'absolute', left: 17, top: 0, width: 74, height: 98 }}><Poster p={b.p3} scene="plain" /></div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, margin: '0 0 4px', color: C.inkOnDark }}>{t(`content.bundles.${b.id}.title`)}</h3>
                <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: '#A9A091', margin: '0 0 14px' }}>{t(`content.bundles.${b.id}.sub`)}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 14 }}>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 600, color: '#fff' }}>{euro(b.price)}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: '#8f8576', textDecoration: 'line-through' }}>{euro(b.anchor)}</span>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: '#E4B89F' }}>{t('bundles.save')} {euro(b.anchor - b.price)}</span>
                </div>
                <button onClick={() => addPosterBundle(b)} className="transition-[filter] hover:brightness-110" style={{ background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: FONT_SANS }}>{t('bundles.add')}</button>
              </div>
            </div>
          ))}

          <div style={{ background: C.bundleCard, border: `1px solid ${C.bundleBorder}`, borderRadius: 12, padding: 22, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 108, height: 140, flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: 2, top: 4, width: 82, height: 108 }}><Poster p={digitalBundle.poster} scene="plain" /></div>
              <div style={{ position: 'absolute', right: 0, bottom: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: '#1f1b16', border: `1px solid ${C.bundleBorder}`, borderRadius: 8, padding: '8px 10px' }}>
                <FileText size={20} strokeWidth={1.4} style={{ color: '#E4B89F' }} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: '#E4B89F' }}>PDF</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 22, margin: '0 0 4px', color: C.inkOnDark }}>{t('content.digitalBundle.title')}</h3>
              <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: '#A9A091', margin: '0 0 14px' }}>{t('content.digitalBundle.sub')}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 14 }}>
                <span style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 600, color: '#fff' }}>{euro(digitalBundle.price)}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 14, color: '#8f8576', textDecoration: 'line-through' }}>{euro(digitalBundle.anchor)}</span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: '#E4B89F' }}>{t('bundles.save')} {euro(digitalBundle.anchor - digitalBundle.price)}</span>
              </div>
              <button onClick={addDigital} className="transition-[filter] hover:brightness-110" style={{ background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500, fontFamily: FONT_SANS }}>{t('bundles.add')}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
