import { Link } from 'react-router'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'
import { track, EVENTS } from '../../lib/analytics'

/**
 * Personalisierungs-Schnellstart direkt nach dem Hero (Operator 2026-07-13:
 * „die BaZi-Personalisierung soll im Vordergrund stehen"). Zwei große,
 * ECKIGE Einstiegskarten — Einzel-BaZi und Paar-Kompatibilität — die direkt
 * in den jeweiligen Personalize-Flow springen (?type=couple nutzt den
 * Query-Param-Deep-Link). Bewusst schlank: keine Bilder, keine Preise,
 * nichts Überladenes; mobil gestapelt (Mobile-First).
 */
const ENTRIES = [
  { key: 'bazi', href: '/personalize' },
  { key: 'couple', href: '/personalize?type=couple' },
] as const

export default function PersonalizeEntrySection() {
  const { t } = useT()
  return (
    <section data-testid="personalize-entry" style={{ background: C.bg }}>
      <div style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>{t('homeQuickstart.eyebrow')}</div>
          <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,38px)', color: C.ink, margin: 0, lineHeight: 1.15 }}>{t('homeQuickstart.title')}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ENTRIES.map(({ key, href }) => (
            <Link
              key={key}
              to={href}
              data-testid={`quickstart-${key}`}
              onClick={() => track(EVENTS.heroCta, { cta: `quickstart-${key}` })}
              className="transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_16px_30px_-20px_rgba(42,38,32,0.5)]"
              style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200, justifyContent: 'flex-end', background: 'var(--ink-black, #2C2420)', padding: 32, textDecoration: 'none' }}
            >
              <h3 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 26, margin: 0, lineHeight: 1.15, color: '#FBF8F1' }}>{t(`homeQuickstart.${key}.title`)}</h3>
              <p style={{ fontFamily: FONT_SANS, fontSize: 14.5, lineHeight: 1.55, color: 'rgba(251,248,241,0.72)', margin: 0 }}>{t(`homeQuickstart.${key}.sub`)}</p>
              <span className="cta-square" style={{ alignSelf: 'flex-start', marginTop: 6, background: C.accent, color: '#fff', fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, padding: '12px 24px' }}>{t(`homeQuickstart.${key}.cta`)} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
