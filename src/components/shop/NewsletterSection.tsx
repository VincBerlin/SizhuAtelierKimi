import { useState, type FormEvent } from 'react'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

/**
 * Newsletter sign-up (replaces the old "Bald im Atelier" section).
 * NOTE: backend is a STUB — no real submission. Wire up MailerLite double
 * opt-in here; do not fake success.
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [noted, setNoted] = useState(false)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO(newsletter): connect to MailerLite double-opt-in API.
    // eslint-disable-next-line no-console
    console.info('[newsletter] TODO — not yet connected. email:', email)
    setNoted(true)
  }

  return (
    <section style={{ background: C.ink, color: C.inkOnDark }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '72px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A28E', marginBottom: 14 }}>Atelier-Kreis</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(28px,3.5vw,40px)', color: C.inkOnDark, margin: '0 0 14px', lineHeight: 1.15 }}>
          Kosmische Einblicke ins Postfach
        </h2>
        <p style={{ fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.7, color: '#A9A091', maxWidth: 540, margin: '0 auto 28px' }}>
          Kosmische Einblicke, direkt in dein Postfach — neue Poster, saisonale Kollektionen und exklusives Wissen über die chinesische Astrologie.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row" style={{ gap: 10, maxWidth: 480, margin: '0 auto', alignItems: 'stretch' }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Deine E-Mail-Adresse"
            style={{ flex: 1, minWidth: 0, border: '1px solid #423c31', background: '#1f1b16', color: C.inkOnDark, borderRadius: 10, padding: '13px 14px', fontSize: 14, fontFamily: FONT_SANS, boxSizing: 'border-box' }}
          />
          <button type="submit" className="transition-[filter] hover:brightness-110" style={{ background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: FONT_SANS, whiteSpace: 'nowrap' }}>
            Eintragen
          </button>
        </form>

        {noted && (
          <p style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: '#C9A28E', marginTop: 16 }}>
            Danke für dein Interesse — die Anmeldung wird gerade angebunden (MailerLite / Double-Opt-in). Deine Eingabe ist noch nicht gespeichert.
          </p>
        )}
        <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: '#7d756a', marginTop: 14 }}>
          Double-Opt-in · Abmeldung jederzeit · <span style={{ color: '#9a7' }}>TODO: Backend-Anbindung</span>
        </p>
      </div>
    </section>
  )
}
