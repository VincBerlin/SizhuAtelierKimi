import { Link } from 'react-router'
import { C, FONT_SANS } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'
import { COMMERCE_ENABLED } from '../../lib/config'

/**
 * Rabatt-Banner direkt UNTER dem Mega-Menü/Header (Operator 2026-07-13:
 * „Now save 20%"). Scrollt mit (nicht fixed), damit die 106px-Kopfzeilen-
 * Geometrie (App-Padding, Hero-calc) unangetastet bleibt. Verlinkt auf den
 * kuratierten /offers-Hub. Nur im Live-Commerce-Modus sichtbar — im
 * Preview-Modus wäre ein Rabatt-Claim ohne Kaufmöglichkeit unehrlich.
 * Der 20%-Wert ist eine Operator-Vorgabe (Ledger „Vertrags-Änderungen");
 * die Streichpreis-Mechanik (catalog anchor) trägt die Ersparnis.
 */
export default function SaleBanner() {
  const { t } = useT()
  if (!COMMERCE_ENABLED) return null
  return (
    <Link
      to="/offers"
      data-testid="sale-banner"
      className="cta-square transition-[filter] hover:brightness-110"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: 40,
        background: C.accent,
        color: '#fff',
        textDecoration: 'none',
        fontFamily: FONT_SANS,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '0 16px',
        textAlign: 'center',
      }}
    >
      {t('sale.banner')}
    </Link>
  )
}
