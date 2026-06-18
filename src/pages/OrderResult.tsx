import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useShopStore } from '../store/ShopStore'
import { useT } from '../i18n/I18nProvider'
import { C, FONT_SERIF, FONT_SANS, ACCENT_CTA_SHADOW } from '../lib/tokens'

export default function OrderResult({ success }: { success: boolean }) {
  const { t } = useT()
  const { clearCart, openCart } = useShopStore()
  const [params] = useSearchParams()
  const sessionId = params.get('session_id') || ''

  useEffect(() => {
    window.scrollTo(0, 0)
    if (success) clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success])

  return (
    <main style={{ background: C.bg, minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ maxWidth: 540, textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>{success ? '✦' : '↺'}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(30px,4vw,42px)', color: C.ink, lineHeight: 1.12, margin: '0 0 14px' }}>
          {success ? t('checkout.successTitle') : t('checkout.cancelTitle')}
        </h1>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, color: C.textMuted, lineHeight: 1.7, margin: '0 0 28px' }}>
          {success ? t('checkout.successBody') : t('checkout.cancelBody')}
        </p>
        {success && sessionId && (
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.textMuted3, marginBottom: 28 }}>
            {t('checkout.successOrder')}: <span style={{ color: C.textMuted2 }}>{sessionId.slice(0, 24)}…</span>
          </div>
        )}
        {success ? (
          <Link to="/" className="transition-[filter] hover:brightness-110" style={{ display: 'inline-block', background: C.accent, color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: 999, fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600, boxShadow: ACCENT_CTA_SHADOW }}>
            {t('checkout.successHome')}
          </Link>
        ) : (
          <button onClick={openCart} className="transition-[filter] hover:brightness-110" style={{ background: C.ink, color: C.bg, border: 'none', cursor: 'pointer', padding: '14px 28px', borderRadius: 999, fontFamily: FONT_SANS, fontSize: 15, fontWeight: 600 }}>
            {t('checkout.cancelRetry')}
          </button>
        )}
      </div>
    </main>
  )
}
