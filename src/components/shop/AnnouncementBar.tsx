import { C, FONT_SANS } from '../../lib/tokens'

export const ANNOUNCEMENT_HEIGHT = 34

/**
 * Slim black announcement bar fixed at the very top, above the header.
 * Free-shipping hook + "Saju coming soon". Shorter on mobile.
 */
export default function AnnouncementBar() {
  return (
    <div
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
        Kostenloser Versand ab 80 €
        <span className="hidden sm:inline"> · Handgefertigt in Deutschland</span>
        {' · '}Saju coming soon
      </p>
    </div>
  )
}
