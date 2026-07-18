import { ShieldCheck, Truck, Award, PackageCheck } from 'lucide-react'
import { C, FONT_SERIF, FONT_SANS, CONTAINER, FREE_SHIP_THRESHOLD } from '../../lib/tokens'
import { euro } from '../../lib/format'
import { useT } from '../../i18n/I18nProvider'

// M11 / REQ-022 — standalone Trust / Service band. HONEST only: real service
// facts (secure checkout, climate-neutral shipping, made-to-order museum-quality
// print, free-shipping threshold) as service badges. NO fake reviews, NO fake
// stars, NO fake bought-counts, NO credits/patron/coming-soon surfaces
// (NG-004). Reviews stay OFF until a verified source exists (OQ-004, RL-REVIEWS).
const BADGES = [
  { key: 'secure', Icon: ShieldCheck },
  { key: 'shipping', Icon: Truck },
  { key: 'quality', Icon: Award },
  { key: 'madeToOrder', Icon: PackageCheck },
] as const

export default function TrustSection() {
  const { t } = useT()
  return (
    <section data-testid="home-trust" style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '44px 32px' }}>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(24px,3vw,32px)', color: C.ink, margin: '0 0 28px', textAlign: 'center' }}>{t('home.trust.title')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {BADGES.map(({ key, Icon }) => (
            <div key={key} data-testid="home-trust-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '18px 20px', background: C.bg, border: `1px solid ${C.border}` }}>
              <Icon size={26} strokeWidth={1.4} color={C.accent} aria-hidden="true" />
              <span style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, color: C.ink }}>{t(`home.trust.items.${key}.title`)}</span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: C.textMuted, lineHeight: 1.55 }}>
                {key === 'shipping' ? t('home.trust.items.shipping.sub', { amount: euro(FREE_SHIP_THRESHOLD) }) : t(`home.trust.items.${key}.sub`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
