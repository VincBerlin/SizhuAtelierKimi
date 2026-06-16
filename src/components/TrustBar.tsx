import { Truck, ShieldCheck, Leaf, PenTool } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD } from '../lib/shop'

const items = [
  { icon: Truck, title: `Kostenloser Versand ab € ${FREE_SHIPPING_THRESHOLD}`, sub: 'Klimaneutral & plastikfrei' },
  { icon: ShieldCheck, title: 'Sichere Zahlung', sub: 'PayPal, Apple Pay & Google Pay' },
  { icon: PenTool, title: 'Handveredelt im Atelier', sub: 'Archival-Pigmentdruck' },
  { icon: Leaf, title: 'Nachhaltige Produktion', sub: 'Premium-Naturpapier' },
]

/**
 * Trust strip with the brand's reassurance points. Place directly under the
 * hero and reuse on shop/product pages. `variant="compact"` is the slim inline
 * row used inside the product buy-box.
 */
export default function TrustBar({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <ul className="flex flex-wrap gap-x-5 gap-y-2" style={{ fontFamily: '"Inter", sans-serif' }}>
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-2" style={{ fontSize: 12.5, color: '#8A7E72' }}>
            <item.icon size={15} strokeWidth={1.6} style={{ color: '#A0522D' }} />
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-label="Vorteile" style={{ background: '#F5F2ED', borderBottom: '1px solid #E0D7C8' }}>
      <div className="max-w-[1320px] mx-auto" style={{ padding: '0 24px' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5" style={{ padding: '22px 0' }}>
          {items.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <item.icon size={24} strokeWidth={1.4} style={{ color: '#A0522D', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 13.5, fontWeight: 600, color: '#2C2420', lineHeight: 1.3 }}>
                  {item.title}
                </p>
                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: 12, color: '#8A7E72', lineHeight: 1.3, marginTop: 2 }}>
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
