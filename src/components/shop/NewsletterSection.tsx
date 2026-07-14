import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useT, LANGS } from '../../i18n/I18nProvider'
import { subscribeNewsletter } from '../../lib/newsletter'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'

// 'success-confirm' = Double-Opt-In-Mail wurde WIRKLICH versendet (Server
// meldet confirmSent) — nur dann zeigt die UI „prüfe dein Postfach".
type Status = 'idle' | 'submitting' | 'success' | 'success-confirm' | 'error'

/**
 * Shop newsletter (M15 / REQ-023): a shop-oriented opt-in — new poster releases,
 * seasonal offers, atelier stories and inspiration; the Cosmic Pulse energy note
 * is a SECONDARY, occasional extra (title/copy/benefits/consent all lead with
 * shop content). Benefits + consent + privacy link, language preference,
 * success/error states. Persists to Postgres via /api/newsletter (double-opt-in
 * ready) — no faked success. No credits/welcome-bonus affordance (REQ-010 / NG-004).
 */
export default function NewsletterSection() {
  const { t, lang } = useT()
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [prefLang, setPrefLang] = useState(lang)
  const [status, setStatus] = useState<Status>('idle')
  const [errKey, setErrKey] = useState<'newsletter.error' | 'newsletter.consentErr'>('newsletter.error')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!consent) { setErrKey('newsletter.consentErr'); setStatus('error'); return }
    setStatus('submitting')
    const r = await subscribeNewsletter(email.trim(), consent, prefLang.toLowerCase(), 'newsletter_home_cosmic_pulse')
    if (r.ok) { setStatus(r.confirmSent ? 'success-confirm' : 'success'); return }
    setErrKey(r.error === 'consent_required' ? 'newsletter.consentErr' : 'newsletter.error')
    setStatus('error')
  }

  return (
    <section style={{ background: C.ink, color: C.inkOnDark }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center" style={{ gap: 48 }}>
          {/* left — text. Operator 2026-07-13: copy-Absatz + Benefits-Liste
              entfernt (minimalistisch) — nur Eyebrow + Headline. Der
              DSGVO-Consent am Formular bleibt unangetastet. */}
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A28E', marginBottom: 14 }}>{t('newsletter.eyebrow')}</div>
            <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3vw,38px)', color: C.inkOnDark, margin: 0, lineHeight: 1.15 }}>{t('newsletter.title')}</h2>
          </div>

          {/* right — subscribe form (vertically centred to the text via lg:items-center,
              left-aligned and width-constrained so it stays on the left of its column) */}
          <div style={{ maxWidth: 420, width: '100%' }}>
            {status === 'success' || status === 'success-confirm' ? (
              <p style={{ fontFamily: FONT_SANS, fontSize: 15, color: '#C9A28E', margin: 0, lineHeight: 1.6 }}>✦ {t(status === 'success-confirm' ? 'newsletter.successConfirm' : 'newsletter.success')}</p>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="flex flex-col sm:flex-row" style={{ gap: 10, alignItems: 'stretch' }}>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('newsletter.placeholder')}
                    style={{ flex: 1, minWidth: 0, border: '1px solid #423c31', background: '#1f1b16', color: C.inkOnDark, borderRadius: 10, padding: '13px 14px', fontSize: 14, fontFamily: FONT_SANS, boxSizing: 'border-box' }}
                  />
                  <button type="submit" disabled={status === 'submitting'} className="transition-[filter] hover:brightness-110 disabled:opacity-60" style={{ background: C.accent, color: '#fff', border: 'none', cursor: status === 'submitting' ? 'wait' : 'pointer', padding: '13px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: FONT_SANS, whiteSpace: 'nowrap' }}>
                    {t('newsletter.button')}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#8f877b', flexWrap: 'wrap' }}>
                  <span>{t('newsletter.langPref')}:</span>
                  {LANGS.map((l) => (
                    <button key={l} type="button" onClick={() => setPrefLang(l)} style={{ background: l === prefLang ? '#423c31' : 'transparent', color: l === prefLang ? C.inkOnDark : '#8f877b', border: '1px solid #423c31', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontFamily: FONT_SANS, cursor: 'pointer' }}>{l}</button>
                  ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12.5, color: '#A9A091', lineHeight: 1.5 }}>
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.accent, flexShrink: 0 }} />
                  <span>{t('newsletter.consent')} <Link to="/privacy" className="underline transition-colors hover:text-[#C9A28E]" style={{ color: C.inkOnDark }}>{t('newsletter.privacy')}</Link>.</span>
                </label>

                {status === 'error' && <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#E0A08C', margin: 0 }}>{t(errKey)}</p>}
              </form>
            )}
            <p style={{ fontFamily: FONT_SANS, fontSize: 11.5, color: '#7d756a', marginTop: 14 }}>{t('newsletter.fine')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
