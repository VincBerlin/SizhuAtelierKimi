import { useShopStore } from '../../store/ShopStore'
import { C, FONT_SANS } from '../../lib/tokens'

export default function Toast() {
  const { toast } = useShopStore()
  if (!toast) return null
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 70, background: C.ink, color: C.inkOnDark, padding: '14px 24px', borderRadius: 999, fontSize: 14, fontFamily: FONT_SANS, boxShadow: '0 16px 40px -12px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#9FCE9F' }}>✓</span>{toast}
    </div>
  )
}
