import { Sparkles, Palette, Truck, ShieldCheck } from 'lucide-react'
import { C, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

const items = [
  { icon: Sparkles, key: 'api' },
  { icon: Truck, key: 'delivery' },
  { icon: ShieldCheck, key: 'secure' },
  { icon: Palette, key: 'art' },
]

function PayChips() {
  const chip = (bg: string, color: string, label: string, border?: boolean) => (
    <span style={{ fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, lineHeight: 1, padding: '3px 5px', borderRadius: 3, background: bg, color, border: border ? '1px solid #dadce0' : 'none' }}>{label}</span>
  )
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {chip('#FFC439', '#0a0a0a', 'PayPal')}
      {chip('#000', '#fff', ' Pay')}
      {chip('#fff', '#3c4043', 'G Pay', true)}
    </span>
  )
}

export default function TrustBar() {
  const { t } = useT()
  return (
    <section aria-label={t('trust.payTitle')} style={{ background: C.ink }}>
      <div className="max-w-[1200px] mx-auto" style={{ maxWidth: CONTAINER, padding: '0 24px' }}>
        <ul
          className="trustbar-row"
          style={{ listStyle: 'none', margin: 0, padding: '11px 0', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, overflowX: 'auto' }}
        >
          {items.map((it) => (
            <li key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <it.icon size={16} strokeWidth={1.6} style={{ color: C.accent, flexShrink: 0 }} />
              <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: 'rgba(243,238,227,0.66)', lineHeight: 1.3 }}>
                <strong style={{ color: C.inkOnDark, fontWeight: 600 }}>{t('trust.' + it.key + 'Title')}</strong>
                {it.key === 'secure' ? ' · ' : <> · {t('trust.' + it.key + 'Sub')}</>}
                {it.key === 'secure' && <PayChips />}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
