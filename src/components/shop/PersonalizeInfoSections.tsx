// Batch #12 R4 (Bereich 7) — PDP-Bausteine der zentralen Personalisierungsseite.
// Dieselben Quellen wie die Katalog-PDP (faqDefs, activeProducts, product.*-
// i18n), damit personalisierte Produkte die EINHEITLICHE Produktseiten-Struktur
// tragen: Details/Material, Formate, Versand/Produktion, Personalisierungs-Info,
// Trust-Zeile und Empfehlungen — nichts davon ist hier neu erfunden.
import { Link } from 'react-router'
import Poster from '../Poster'
import { activeProducts, faqDefs } from '../../lib/catalog'
import { useShopStore, useMoney } from '../../store/ShopStore'
import { useT } from '../../i18n/I18nProvider'
import { COMMERCE_ENABLED } from '../../lib/config'
import { C, FONT_SERIF, FONT_SANS } from '../../lib/tokens'

/** Trust-Zeile unter dem CTA — identische Aussagen wie auf der PDP. */
export function PersonalizeTrustRow() {
  const { t } = useT()
  return (
    <div data-testid="personalize-trust" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 16, fontSize: 12, color: C.textMuted2, flexWrap: 'wrap' }}>
      <span>{t('product.secure')}</span>
      <span>{t('product.returns')}</span>
    </div>
  )
}

/** FAQ-Accordion (Details & Material · Größenberater · Versand & Produktion ·
 *  Personalisierung) — gleiche faqDefs + gleicher offener-Eintrag-Store wie
 *  die PDP, damit beide Flächen nie inhaltlich auseinanderlaufen. */
export function PersonalizeFaq() {
  const { t } = useT()
  const { openFaqId, setOpenFaqId } = useShopStore()
  return (
    <div data-testid="personalize-faq" style={{ marginTop: 24, borderTop: `1px solid ${C.border}` }}>
      {faqDefs.map((q) => {
        const open = openFaqId === q.id
        return (
          <div key={q.id} style={{ borderBottom: `1px solid ${C.border}` }}>
            <button onClick={() => setOpenFaqId(open ? '' : q.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '18px 2px', fontFamily: FONT_SANS, fontSize: 15, fontWeight: 500, color: C.ink, textAlign: 'left' }}>
              {t(`content.faqDefs.${q.id}.q`)}<span style={{ fontSize: 20, color: C.textMuted3, fontWeight: 300 }}>{open ? '−' : '+'}</span>
            </button>
            {open && <p style={{ fontSize: 14, lineHeight: 1.65, color: C.textMuted, margin: 0, padding: '0 2px 20px' }}>{t(`content.faqDefs.${q.id}.a`)}</p>}
          </div>
        )
      })}
    </div>
  )
}

/** Empfehlungen („Wird oft zusammen gekauft") — echte Links auf AKTIVE
 *  Katalogprodukte, gleiche Kartenstruktur wie die PDP-Cross-Sells. */
export function PersonalizeCrossSells() {
  const { t } = useT()
  const money = useMoney()
  const related = activeProducts.slice(0, 3)
  return (
    <section data-testid="personalize-cross-sells" style={{ marginTop: 64, borderTop: `1px solid ${C.border}`, paddingTop: 40 }}>
      <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 28, margin: '0 0 24px' }}>{t('product.related')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 24 }}>
        {related.map((r) => (
          <Link key={r.id} data-testid="pdp-cross-sell-card" to={`/product/${r.id}`} onClick={() => window.scrollTo(0, 0)} style={{ display: 'block', cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ aspectRatio: '3/4', background: '#fff', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}><Poster p={r.poster} scene="plain" /></div>
            <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 18, margin: '12px 0 4px' }}>{t(`content.products.${r.id}.title`)}</h3>
            {COMMERCE_ENABLED ? <span style={{ fontSize: 14, fontWeight: 600 }}>{money(r.price)}</span> : <span style={{ fontSize: 12, color: C.textMuted3 }}>{t('preview.soon')}</span>}
          </Link>
        ))}
      </div>
    </section>
  )
}
