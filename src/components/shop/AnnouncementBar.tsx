import { C, FONT_SANS, FREE_SHIP_THRESHOLD } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'
import { useShopStore } from '../../store/ShopStore'
import { COMMERCE_ENABLED } from '../../lib/config'
import { euro } from '../../lib/format'
import { regionAnnouncement } from '../../lib/region'

export const ANNOUNCEMENT_HEIGHT = 34

/**
 * Slim black utility / promo bar fixed at the very top, ABOVE the header
 * (REQ-021 / AT-016-6). It COMMUNICATES the shipping situation per region —
 * us/uk free shipping directly, eu the local threshold logic, other a neutral
 * fallback — and never reprices: the server-authoritative shipping calculation
 * is T-502 (server/pricing.js), which this bar must not duplicate or diverge
 * from. The `data-region` mode is derived from the pure `regionAnnouncement`
 * mapping so the message and the region tag can never drift apart.
 */
export default function AnnouncementBar() {
  const { t } = useT()
  const { region } = useShopStore()
  const { mode } = regionAnnouncement(region)
  return (
    <div
      data-testid="announcement-bar"
      data-region={region}
      data-shipping-mode={mode}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: ANNOUNCEMENT_HEIGHT,
        background: C.ink,
        color: C.inkOnDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ margin: 0, fontFamily: FONT_SANS, fontSize: 11.5, letterSpacing: '0.06em', textAlign: 'center', padding: '0 16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {COMMERCE_ENABLED ? (
          mode === 'free' ? (
            t('announce.freeActivated')
          ) : mode === 'fallback' ? (
            t('announce.fallback')
          ) : (
            <>
              {t('announce.shipping', { amount: euro(FREE_SHIP_THRESHOLD) })}
              <span className="hidden sm:inline"> · {t('announce.personalized')}</span>
            </>
          )
        ) : (
          t('preview.announce')
        )}
      </p>
    </div>
  )
}
