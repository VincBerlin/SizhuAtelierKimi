import { comingSoon } from '../../lib/catalog'
import { useShopStore } from '../../store/ShopStore'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

export default function ComingSoonSection() {
  const { newsletterDone, newsletterEmail, submitNewsletter, setNewsletterEmail } = useShopStore()

  return (
    <section id="comingsoon" style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 32px' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>Bald im Atelier</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 32, margin: '0 0 10px' }}>Drei Traditionen, eine Sprache</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: C.textMuted, margin: 0 }}>Nach BaZi folgen die koreanische und japanische Astrologie. Trag dich ein und sei zum Launch dabei.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {comingSoon.map((cs) => {
          const done = !!newsletterDone[cs.id]
          return (
            <div key={cs.id} style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 24, margin: 0 }}>{cs.title}</h3>
                <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.textMuted3, border: `1px solid ${C.borderInput}`, padding: '4px 10px', borderRadius: 999 }}>Coming Soon</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: C.textMuted, margin: '0 0 18px' }}>{cs.desc}</p>
              {done ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.success, background: C.successBg, borderRadius: 10, padding: '13px 16px' }}>✓ Eingetragen — wir melden uns zum Launch.</div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={newsletterEmail[cs.id] || ''}
                    onChange={(e) => setNewsletterEmail(cs.id, e.target.value)}
                    placeholder="Deine E-Mail-Adresse"
                    style={{ flex: 1, border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: FONT_SANS, background: C.surfaceInput, color: C.ink }}
                  />
                  <button onClick={() => submitNewsletter(cs.id)} className="transition-colors hover:bg-[#3a352c]" style={{ background: C.ink, color: C.bg, border: 'none', cursor: 'pointer', padding: '0 18px', borderRadius: 10, fontSize: 13, fontFamily: FONT_SANS }}>Vormerken</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
