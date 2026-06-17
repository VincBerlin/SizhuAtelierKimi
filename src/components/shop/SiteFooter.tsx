import { BRAND_NAME, C, FONT_SERIF, CONTAINER } from '../../lib/tokens'

export default function SiteFooter() {
  return (
    <footer style={{ background: C.ink, color: '#A9A091' }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '44px 32px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 24, color: C.inkOnDark }}>{BRAND_NAME}</div>
        <div style={{ fontSize: 13, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <span>Versand &amp; Rückgabe</span><span>Nachhaltigkeit</span><span>Kontakt</span><span>AGB</span>
        </div>
        <div style={{ fontSize: 12, color: '#7d756a' }}>Handveredelt in Europa · klimaneutraler Versand</div>
      </div>
    </footer>
  )
}
