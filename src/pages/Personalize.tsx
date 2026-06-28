import { useEffect, useMemo, useState, type ReactNode } from 'react'
import PosterScene from '../components/shop/PosterScene'
import { computeChart, frames, backgrounds, sizes, type PosterData } from '../lib/bazi'
import { birthTimeMeta } from '../lib/personalization'
import { useShopStore } from '../store/ShopStore'
import { useT, LANGS } from '../i18n/I18nProvider'
import { type Lang } from '../i18n/translations'
import { COMMERCE_ENABLED } from '../lib/config'
import { ptypeProductId, buildVariantId } from '../lib/checkout'
import { euro } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, CONTAINER, ACCENT_CTA_SHADOW } from '../lib/tokens'
// Single client source of truth for product-type base prices + PDF add-on price.
// server/pricing.js mirrors these 1:1; the parity test couples to this module.
import { PRODUCT_TYPES, PDF_ADDON_PRICE, type ProductTypeId } from '../lib/productTypes'

interface Person { name: string; date: string; time: string; place: string }
const emptyPerson: Person = { name: '', date: '', time: '', place: '' }

const inputStyle = {
  border: `1px solid ${C.borderInput}`, borderRadius: 9, padding: '11px 12px', fontSize: 14,
  fontFamily: FONT_SANS, color: C.ink, background: C.surfaceInput, width: '100%', minWidth: 0, boxSizing: 'border-box' as const,
}
const cardStyle = { border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, background: '#fff', marginBottom: 18 }
const headingStyle = { fontSize: 13, fontWeight: 600 as const, letterSpacing: '0.02em', marginBottom: 14, color: C.ink }

function Field({ label, error, children }: { label: string; error?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: error ? C.accent : C.textMuted2, minWidth: 0 }}>
      {label}{children}
    </label>
  )
}

export default function Personalize() {
  const { t, lang } = useT()
  const { addItem, showToast } = useShopStore()

  const [typeId, setTypeId] = useState<ProductTypeId>('bazi')
  const [a, setA] = useState<Person>(emptyPerson)
  const [b, setB] = useState<Person>(emptyPerson)
  const [unknownTime, setUnknownTime] = useState(false)
  const [posterLang, setPosterLang] = useState<Lang>(lang)
  const [frameHex, setFrameHex] = useState(frames[0].hex)
  const [bgHex, setBgHex] = useState(backgrounds[0].hex)
  const [sizeId, setSizeId] = useState('A2')
  const [pdfAddon, setPdfAddon] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const def = PRODUCT_TYPES.find((p) => p.id === typeId)!
  const frame = frames.find((f) => f.hex === frameHex) ?? frames[0]
  const bg = backgrounds.find((x) => x.hex === bgHex) ?? backgrounds[0]
  const size = sizes.find((z) => z.id === sizeId) ?? sizes[1]

  const price = useMemo(() => {
    let p = def.basePrice
    if (def.poster) p += size.delta
    if (def.poster && !def.pdfIncluded && pdfAddon) p += PDF_ADDON_PRICE
    return p
  }, [def, size, pdfAddon])

  // Thread place + the unknown-time flag into the placeholder chart (accepted,
  // not used to vary it — ADR-002 pt.3/4) and apply the disclosed noon fallback.
  const btA = birthTimeMeta(a.time, unknownTime)
  const chart = computeChart(a.date, btA.time, a.place, unknownTime)
  const livePoster: PosterData = {
    frame: frameHex, bg: bgHex, name: a.name || t('configurator.namePh'),
    element: chart.element, animal: chart.animal, pillars: chart.pillars,
  }

  /* ---- validation (REQ-009/010/016) ---- */
  const personValid = (p: Person) => p.name.trim() !== '' && p.date !== '' && p.place.trim() !== '' && (unknownTime || p.time !== '')
  const errA = { name: a.name.trim() === '', date: a.date === '', place: a.place.trim() === '', time: !unknownTime && a.time === '' }
  const errB = { name: b.name.trim() === '', date: b.date === '', place: b.place.trim() === '', time: !unknownTime && b.time === '' }
  const valid = personValid(a) && (!def.couple || personValid(b))

  const posterLangLabel = posterLang
  const designLabel = def.poster ? `${t(`options.backgrounds.${bgHex}`)} · ${t(`options.frames.${frameHex}`)}` : '—'

  const addToCart = () => {
    if (!valid) { setShowErrors(true); document.getElementById('personalize-birth')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    // place/date/time + the canonical birthTimeUnknown flag are captured and
    // threaded through so the planned calculation API can dock without loss
    // (REQ-004 AK-1); the disclosed noon fallback is applied when time is unknown.
    const personalization: Record<string, string> = {
      productType: typeId,
      productTypeLabel: t(`personalize.types.${typeId}.name`),
      language: posterLang,
      name: a.name.trim(),
      date: a.date,
      time: btA.time,
      timeDisplay: btA.timeDisplay,
      birthTimeUnknown: btA.birthTimeUnknown,
      unknownTime: btA.unknownTime,
      timeFallbackUsed: btA.timeFallbackUsed,
      fallbackReason: btA.fallbackReason,
      place: a.place.trim(),
    }
    if (def.couple) {
      // Mirror the A-side fallback provenance for person B (REQ-004 AK-1 / REQ-018):
      // the 2nd chart must carry the SAME canonical fields, derived from the SAME
      // birthTimeMeta helper — never collect btB then drop its disclosure flags.
      const btB = birthTimeMeta(b.time, unknownTime)
      personalization.nameB = b.name.trim()
      personalization.dateB = b.date
      personalization.timeB = btB.time
      personalization.timeDisplayB = btB.timeDisplay
      personalization.birthTimeUnknownB = btB.birthTimeUnknown
      personalization.unknownTimeB = btB.unknownTime
      personalization.timeFallbackUsedB = btB.timeFallbackUsed
      personalization.fallbackReasonB = btB.fallbackReason
      personalization.placeB = b.place.trim()
    }
    if (def.poster) {
      personalization.frame = frame.name
      personalization.palette = bg.name
      personalization.size = size.label
      personalization.pdfAddon = String(!def.pdfIncluded && pdfAddon)
    }
    const metaParts = [posterLang, def.poster ? t(`options.backgrounds.${bgHex}`) : t('personalize.pdfBadge'), def.poster ? t(`options.frames.${frameHex}`) : null, def.poster ? size.label : null]
    // Stable server-pricing identity (ADR-001): poster types carry size + frame +
    // pdf-addon axes; digital-only types carry none. The server re-prices from
    // these and ignores the client `price`.
    const variantId = def.poster
      ? buildVariantId({ size: size.id, frame: frameHex, pdf: !def.pdfIncluded && pdfAddon })
      : ''
    addItem({
      title: t(`personalize.types.${typeId}.name`),
      price, qty: 1,
      poster: def.poster ? livePoster : null,
      meta: metaParts.filter(Boolean).join(' · '),
      personalization,
      productId: ptypeProductId(typeId),
      variantId,
    })
    showToast(t('cart.toastAdded'))
  }

  return (
    <main style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '24px 32px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>{t('personalize.eyebrow')}</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.1, margin: '0 0 10px' }}>{t('personalize.title')}</h1>
        <p style={{ fontSize: 15, color: C.textMuted, maxWidth: 560, lineHeight: 1.6, margin: 0 }}>{t('personalize.intro')}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* ---- LEFT: live preview (sticky) ---- */}
        <div className="lg:sticky lg:top-24">
          {def.poster ? (
            <PosterScene poster={livePoster} scene="plain" aspect="4 / 5" />
          ) : (
            <div style={{ aspectRatio: '4 / 5', background: C.surfaceWarm, border: `1px solid ${C.border}`, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>◇</div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 22, color: C.ink }}>{t('personalize.pdfBadge')}</div>
              <div style={{ fontSize: 13, color: C.textMuted2 }}>{t('personalize.types.digital.sub')}</div>
            </div>
          )}
          <p style={{ fontSize: 12, color: C.textMuted5, margin: '12px 2px 0', lineHeight: 1.5 }}>{t('personalize.previewCertainty')}</p>
        </div>

        {/* ---- RIGHT: linear flow ---- */}
        <div>
          {/* Step 1 — product type */}
          <div style={cardStyle}>
            <div style={headingStyle}>{t('personalize.chooseType')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10 }}>
              {PRODUCT_TYPES.map((p) => {
                const sel = p.id === typeId
                return (
                  <button key={p.id} onClick={() => setTypeId(p.id)} style={{ position: 'relative', textAlign: 'left', border: `1px solid ${C.borderInput}`, background: sel ? C.accentSoftBg : C.surfaceInput, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontFamily: FONT_SANS }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.25 }}>{t(`personalize.types.${p.id}.name`)}</div>
                    <div style={{ fontSize: 11, color: C.textMuted2, marginTop: 4, lineHeight: 1.35 }}>{t(`personalize.types.${p.id}.sub`)}</div>
                    {COMMERCE_ENABLED && <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 6 }}>{t('personalize.from')} {euro(p.basePrice)}</div>}
                    {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, borderRadius: 12, pointerEvents: 'none' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2 — birth data */}
          <div id="personalize-birth" style={cardStyle}>
            <div style={headingStyle}>{def.couple ? t('personalize.birthHeadingA') : t('personalize.birthHeading')}</div>
            <PersonFields person={a} setPerson={setA} unknownTime={unknownTime} err={errA} showErrors={showErrors} t={t} />
            {def.couple && (
              <>
                <div style={{ ...headingStyle, marginTop: 22 }}>{t('personalize.birthHeadingB')}</div>
                <PersonFields person={b} setPerson={setB} unknownTime={unknownTime} err={errB} showErrors={showErrors} t={t} />
              </>
            )}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
              <input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.accent }} />
              <span>{t('personalize.unknownTime')}<br /><span style={{ fontSize: 12, color: C.textMuted3 }}>{t('personalize.unknownTimeHint')}</span></span>
            </label>
            {/* REQ-018 AK-2 — disclosed noon fallback at the birth-time field (no
                silent default). Shown only when the buyer marks the time unknown. */}
            {unknownTime && (
              <div data-testid="noon-fallback-field-hint" role="note" style={{ marginTop: 12, background: C.accentSoftBg, color: C.accent, borderRadius: 10, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5 }}>
                {t('noonFallback.fieldHint')}
              </div>
            )}
          </div>

          {/* Step 3 — poster language */}
          <div style={cardStyle}>
            <div style={headingStyle}>{t('personalize.langHeading')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {LANGS.map((l) => {
                const sel = l === posterLang
                return (
                  <button key={l} onClick={() => setPosterLang(l)} style={{ position: 'relative', border: `1px solid ${C.borderInput}`, background: sel ? C.accentSoftBg : C.surfaceInput, borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, fontWeight: sel ? 600 : 400, color: C.ink }}>
                    {l}
                    {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, borderRadius: 12, pointerEvents: 'none' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Steps 4-5 — design + size + PDF (poster types only) */}
          {def.poster && (
            <div style={cardStyle}>
              <div style={headingStyle}>{t('personalize.designHeading')}</div>
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{t('personalize.frameWord')} — {t(`options.frames.${frameHex}`)}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {frames.map((f) => {
                  const sel = f.hex === frameHex
                  return (
                    <button key={f.hex} onClick={() => setFrameHex(f.hex)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${C.borderInput}`, background: C.surfaceInput, borderRadius: 10, padding: '8px 14px 8px 8px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13, color: '#4A4438' }}>
                      <span style={{ width: 26, height: 26, borderRadius: 6, background: f.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />{t(`options.frames.${f.hex}`)}
                      {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, borderRadius: 12, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{t('personalize.paletteWord')} — {t(`options.backgrounds.${bgHex}`)}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                {backgrounds.map((x) => {
                  const sel = x.hex === bgHex
                  return (
                    <button key={x.hex} onClick={() => setBgHex(x.hex)} title={t(`options.backgrounds.${x.hex}`)} style={{ position: 'relative', width: 44, height: 44, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: x.hex, cursor: 'pointer' }}>
                      {sel && <span style={{ position: 'absolute', inset: -3, border: `2px solid ${C.accent}`, borderRadius: 13, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{t('personalize.sizeHeading')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {sizes.map((z) => {
                  const sel = z.id === sizeId
                  const deltaText = z.delta > 0 ? '+ ' + euro(z.delta) : z.delta < 0 ? '− ' + euro(-z.delta) : t('configurator.inclusive')
                  return (
                    <button key={z.id} onClick={() => setSizeId(z.id)} style={{ position: 'relative', border: `1px solid ${C.borderInput}`, background: C.surfaceInput, borderRadius: 10, padding: '12px 8px', cursor: 'pointer', textAlign: 'center', fontFamily: FONT_SANS }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{z.label}</div>
                      <div style={{ fontSize: 11, color: C.textMuted3, margin: '3px 0 4px' }}>{z.sub}</div>
                      {COMMERCE_ENABLED && <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{deltaText}</div>}
                      {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, borderRadius: 12, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
              {!def.pdfIncluded && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
                  <input type="checkbox" checked={pdfAddon} onChange={(e) => setPdfAddon(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.accent }} />
                  <span>{t('personalize.pdfAddon')}{COMMERCE_ENABLED && <> (+ {euro(PDF_ADDON_PRICE)})</>}<br /><span style={{ fontSize: 12, color: C.textMuted3 }}>{t('personalize.pdfNote')}</span></span>
                </label>
              )}
            </div>
          )}

          {/* Step 6 — summary (REQ-012) */}
          <div style={{ ...cardStyle, background: C.surfaceWarm }}>
            <div style={headingStyle}>{t('personalize.summaryHeading')}</div>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 7, columnGap: 16, fontSize: 13 }}>
              <SumRow label={t('personalize.sumType')} value={t(`personalize.types.${typeId}.name`)} />
              <SumRow label={t('configurator.name')} value={a.name || '—'} />
              {def.couple && <SumRow label={t('personalize.partnerName')} value={b.name || '—'} />}
              <SumRow label={t('configurator.date')} value={a.date || '—'} />
              <SumRow label={t('configurator.time')} value={unknownTime ? t('personalize.timeUnknown') : a.time || '—'} />
              <SumRow label={t('configurator.place')} value={a.place || '—'} />
              <SumRow label={t('personalize.sumLang')} value={posterLangLabel} />
              {def.poster && <SumRow label={t('personalize.sumDesign')} value={designLabel} />}
              {def.poster && <SumRow label={t('personalize.sumSize')} value={size.label} />}
              {COMMERCE_ENABLED && <SumRow label={t('personalize.sumPrice')} value={euro(price)} strong />}
            </dl>
            {/* REQ-018 AK-3 — disclosed noon fallback in the personalization summary. */}
            {unknownTime && (
              <div data-testid="noon-fallback-summary-notice" role="note" style={{ marginTop: 12, color: C.accent, fontSize: 12.5, lineHeight: 1.5 }}>
                {t('noonFallback.summaryNotice')}
              </div>
            )}
          </div>

          {/* trust signals (REQ-027) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', margin: '4px 2px 18px', fontSize: 12, color: C.textMuted2 }}>
            <span>✦ {t('personalize.trustData')}</span>
            <span>✦ {t('personalize.trustLogic')}</span>
            <span>✦ {t('personalize.trustPreview')}</span>
            <span>✦ {t('personalize.trustPremium')}</span>
          </div>

          {showErrors && !valid && (
            <div style={{ background: C.accentSoftBg, color: C.accent, borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 12 }}>{t('personalize.errFix')}</div>
          )}

          <button onClick={addToCart} className="transition-[filter,transform] hover:brightness-110 active:translate-y-[1px]" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 18, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, letterSpacing: '0.01em', boxShadow: ACCENT_CTA_SHADOW }}>
            {t('personalize.addToCart')}{COMMERCE_ENABLED && <> · {euro(price)}</>}
          </button>
        </div>
      </div>
    </main>
  )
}

function PersonFields({ person, setPerson, unknownTime, err, showErrors, t }: { person: Person; setPerson: (p: Person) => void; unknownTime: boolean; err: { name: boolean; date: boolean; place: boolean; time: boolean }; showErrors: boolean; t: (k: string, v?: Record<string, string | number>) => any }) {
  const e = (cond: boolean) => showErrors && cond
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }}>
      <Field label={t('configurator.name')} error={e(err.name)}><input type="text" value={person.name} onChange={(ev) => setPerson({ ...person, name: ev.target.value })} placeholder={t('configurator.namePh')} style={inputStyle} /></Field>
      <Field label={t('configurator.place')} error={e(err.place)}><input type="text" value={person.place} onChange={(ev) => setPerson({ ...person, place: ev.target.value })} placeholder={t('configurator.placePh')} style={inputStyle} /></Field>
      <Field label={t('configurator.date')} error={e(err.date)}><input type="date" value={person.date} onChange={(ev) => setPerson({ ...person, date: ev.target.value })} style={inputStyle} /></Field>
      <Field label={t('configurator.time')} error={e(err.time)}><input type="time" value={person.time} disabled={unknownTime} onChange={(ev) => setPerson({ ...person, time: ev.target.value })} style={{ ...inputStyle, opacity: unknownTime ? 0.5 : 1 }} /></Field>
    </div>
  )
}

function SumRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <>
      <dt style={{ color: C.textMuted2 }}>{label}</dt>
      <dd style={{ margin: 0, textAlign: 'right', color: C.ink, fontWeight: strong ? 700 : 500 }}>{value}</dd>
    </>
  )
}
