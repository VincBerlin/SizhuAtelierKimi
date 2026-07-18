import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { frames, backgrounds, personalizedSizes as sizes, type PosterData, type Pillar } from '../lib/bazi'
import { birthTimeMeta } from '../lib/personalization'
import { type PlaceCandidate } from '../lib/baziClient'
import { useBaziChart, usePairChart, useWesternChart } from '../hooks/useBaziChart'
import { usePlaceResolution, type PlaceStatus } from '../hooks/usePlaceResolution'
import PosterSvg from '../components/shop/PosterSvg'
import { PersonalizeTrustRow, PersonalizeFaq, PersonalizeCrossSells } from '../components/shop/PersonalizeInfoSections'
import { DESIGNS } from '../designs/registry.mjs'
import { localizeElement, localizeAnimal, posterSubtitle, localizeRelation, stemElement, zodiacName, planetName } from '../designs/posterLocale.mjs'
import { useShopStore, useMoney } from '../store/ShopStore'
import { useT, LANGS } from '../i18n/I18nProvider'
import { type Lang } from '../i18n/translations'
import { COMMERCE_ENABLED } from '../lib/config'
import { ptypeProductId, buildVariantId } from '../lib/checkout'
import { C, FONT_SERIF, FONT_SANS, CONTAINER, ACCENT_CTA_SHADOW } from '../lib/tokens'
import { searchCities } from '../lib/cities'
// Single client source of truth for product-type base prices + PDF add-on price.
// server/pricing.js mirrors these 1:1; the parity test couples to this module.
import { PRODUCT_TYPES, PDF_ADDON_PRICE, DIGITAL_ANALYSIS_PRICE, type ProductTypeId } from '../lib/productTypes'

interface Person { name: string; date: string; time: string; place: string }
const emptyPerson: Person = { name: '', date: '', time: '', place: '' }

const inputStyle = {
  border: `1px solid ${C.borderInput}`, padding: '11px 12px', fontSize: 14,
  fontFamily: FONT_SANS, color: C.ink, background: C.surfaceInput, width: '100%', minWidth: 0, boxSizing: 'border-box' as const,
}
const cardStyle = { border: `1px solid ${C.border}`, padding: 22, background: '#fff', marginBottom: 18 }
const headingStyle = { fontSize: 13, fontWeight: 600 as const, letterSpacing: '0.02em', marginBottom: 14, color: C.ink }

function Field({ label, error, required, children }: { label: string; error?: boolean; required?: boolean; children: ReactNode }) {
  // Batch #12 R3 (#8): Pflichtfelder sind ALS Pflichtfelder markiert (Sternchen
  // im Label + Legende darunter) — nicht erst nach einem gescheiterten
  // Kaufversuch über die Fehlerfarbe erkennbar.
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: error ? C.accent : C.textMuted2, minWidth: 0 }}>
      <span>{label}{required && <span aria-hidden="true"> *</span>}</span>{children}
    </label>
  )
}

export default function Personalize() {
  const { t, lang } = useT()
  const { addItem, showToast } = useShopStore()
  const money = useMoney()

  // Deep-Link ?type=couple|bazi|… (Operator 2026-07-13): die Paar-SKU-PDP und
  // Mega-Menü-Einträge springen direkt in den passenden Produkttyp. Nur gegen
  // die realen PRODUCT_TYPES-Ids validiert — unbekannte Werte fallen auf 'bazi'.
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type')
  const initialType: ProductTypeId = PRODUCT_TYPES.some((p) => p.id === requestedType)
    ? (requestedType as ProductTypeId)
    : 'bazi'
  const [typeId, setTypeId] = useState<ProductTypeId>(initialType)
  const [a, setA] = useState<Person>(emptyPerson)
  const [b, setB] = useState<Person>(emptyPerson)
  // Operator 2026-07-14: „Geburtszeit unbekannt" ist JE PERSON einstellbar —
  // beim Paar-Poster kennt vielleicht nur einer seine Zeit nicht.
  const [unknownTimeA, setUnknownTimeA] = useState(false)
  const [unknownTimeB, setUnknownTimeB] = useState(false)
  const [posterLang, setPosterLang] = useState<Lang>(lang)
  const [frameHex, setFrameHex] = useState(frames[0].hex)
  const [bgHex, setBgHex] = useState(backgrounds[0].hex)
  // Poster-Background-Palette (REQ-018/T-404) entfernt — Operator-Vorgabe
  // 2026-07-13; die Vorschau-Umgebung ist eine feste neutrale Fläche.
  // Design-Registry (src/designs/registry.mjs): der Käufer wählt das Design;
  // dieselbe Vorlage rendert Vorschau UND Druck-PDF. Paar-Produkte nutzen
  // pair-Designs, Einzel-Produkte single-Designs — Wechsel des Produkttyps
  // setzt das Design auf den ersten aktiven Eintrag der passenden Art.
  const [designId, setDesignId] = useState(DESIGNS.find((d) => d.active && d.kind === 'single')?.id ?? 'klassik')
  const [sizeId, setSizeId] = useState('50x70')
  const [pdfAddon, setPdfAddon] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  // Orts-Auflösung (REQ-013 + Exaktheit): der getippte Ort wird bei AUSWAHL/BLUR
  // (nie pro Tastendruck — Policy AT-013-3) über /api/geocode in lat/lon/tz
  // aufgelöst. Ohne aufgelösten Ort gibt es KEIN Chart (Ehrlichkeits-Gate).
  const placeA = usePlaceResolution()
  const placeB = usePlaceResolution()
  const resolvedPlace = placeA.place

  const pickCandidateA = (c: PlaceCandidate) => {
    setA({ ...a, place: c.name })
    placeA.pickCandidate(c)
  }
  const pickCandidateB = (c: PlaceCandidate) => {
    setB({ ...b, place: c.name })
    placeB.pickCandidate(c)
  }

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

  // EXAKTES Chart über die FuFirE-Engine (OQ-004 geschlossen): berechnet wird
  // erst, wenn Datum + Zeit (oder Zeit-unbekannt-Fallback) + AUFGELÖSTER Ort
  // vorliegen. Bis dahin zeigt das Poster ehrliche Striche — nie einen
  // Platzhalter, der wie eine echte Berechnung aussieht.
  const btA = birthTimeMeta(a.time, unknownTimeA)
  const baziInput = a.date && (unknownTimeA || a.time) && resolvedPlace
    ? { date: a.date, time: btA.time, place: resolvedPlace, birthTimeUnknown: unknownTimeA }
    : null
  // Birth-Chart-Poster (Operator 2026-07-14) = WESTLICHES Geburtshoroskop
  // über /api/western (FuFirE Swiss Ephemeris) — eigener Datenpfad + Design.
  const isWestern = typeId === 'birthchart'
  const { chart, status: chartStatus } = useBaziChart(def.couple || isWestern ? null : baziInput)
  const { western, status: westernStatus } = useWesternChart(isWestern ? baziInput : null)
  // Paar-Poster: beide Personen vollständig → EINE /api/match-Berechnung.
  const btB = birthTimeMeta(b.time, unknownTimeB)
  const baziInputB = def.couple && b.date && (unknownTimeB || b.time) && placeB.place
    ? { date: b.date, time: btB.time, place: placeB.place, birthTimeUnknown: unknownTimeB }
    : null
  const { pair, status: pairStatus } = usePairChart(def.couple ? baziInput : null, baziInputB)
  const activeStatus = def.couple ? pairStatus : isWestern ? westernStatus : chartStatus
  const EMPTY_PILLARS: Pillar[] = [
    { label: '年', stem: '—', branch: '—' },
    { label: '月', stem: '—', branch: '—' },
    { label: '日', stem: '—', branch: '—' },
    { label: '時', stem: '—', branch: '—' },
  ]
  // Poster-Texte in der GEWÄHLTEN POSTER-SPRACHE (Operator 2026-07-13):
  // FuFirE liefert Element/Tier kanonisch deutsch — die geteilte
  // posterLocale-Tabelle übersetzt für Vorschau UND Druck identisch.
  const livePoster: PosterData & { subtitle: string } = {
    frame: bgHex, bg: bgHex, name: a.name || t('configurator.namePh'),
    element: localizeElement(chart?.element ?? '', posterLang),
    animal: localizeAnimal(chart?.animal ?? '', posterLang),
    pillars: chart?.pillars ?? EMPTY_PILLARS,
    subtitle: posterSubtitle('single', posterLang),
  }
  const liveWesternPoster = {
    frame: bgHex, bg: bgHex, name: a.name || t('configurator.namePh'),
    subtitle: posterSubtitle('western', posterLang),
    sunLabel: planetName('Sun', posterLang),
    moonLabel: planetName('Moon', posterLang),
    ascLabel: planetName('Ascendant', posterLang),
    sun: western ? { sign: zodiacName(western.sun.signIndex, posterLang), deg: western.sun.deg } : { sign: '—', deg: '' },
    moon: western ? { sign: zodiacName(western.moon.signIndex, posterLang), deg: western.moon.deg } : { sign: '—', deg: '' },
    ascendant: western?.ascendant ? { sign: zodiacName(western.ascendant.signIndex, posterLang), deg: western.ascendant.deg } : null,
    planets: (western?.planets ?? []).map((pl) => ({ label: planetName(pl.key, posterLang), sign: zodiacName(pl.signIndex, posterLang), deg: pl.deg, retro: pl.retro })),
  }
  const designKind = def.couple ? 'pair' : isWestern ? 'western' : 'single'
  const activeDesigns = DESIGNS.filter((d) => d.active && d.kind === designKind)
  useEffect(() => {
    if (!activeDesigns.some((d) => d.id === designId) && activeDesigns[0]) setDesignId(activeDesigns[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designKind])
  // Relations-Label in der POSTER-Sprache (nicht UI-Sprache) — geteilte
  // Quelle mit dem Druck-PDF (posterLocale.localizeRelation).
  const relationLabel = pair?.relation ? localizeRelation(pair.relation, posterLang) : ''
  // dayMaster = Tag-Stamm (Säule 日, pillars[2]) — trägt den Poster-Kopf je
  // Partner (Operator 2026-07-14: Tagesmeister statt Jahres-Tier).
  const locChart = (c: { pillars: Pillar[]; animal: string; element: string } | undefined) =>
    c
      ? {
          ...c,
          // Kopf-Element = TAGESMEISTER-Element aus dem Tag-Stamm (Fund
          // 2026-07-14: chart.element ist das JAHRES-Element) — Glyphe + Element
          // gehören zusammen auf den Paar-Poster-Kopf.
          element: localizeElement(stemElement(c.pillars[2]?.stem ?? ''), posterLang),
          animal: localizeAnimal(c.animal, posterLang),
          dayMaster: c.pillars[2]?.stem ?? '',
        }
      : { pillars: EMPTY_PILLARS, animal: '', element: '', dayMaster: '' }
  const livePairPoster = {
    frame: bgHex, bg: bgHex,
    nameA: a.name || t('configurator.namePh'), nameB: b.name || t('configurator.namePh'),
    chartA: locChart(pair?.a),
    chartB: locChart(pair?.b),
    relationLabel,
    subtitle: posterSubtitle('pair', posterLang),
  }
  const previewData = (def.couple ? livePairPoster : isWestern ? liveWesternPoster : livePoster) as PosterData

  /* ---- validation (REQ-009/010/016) ---- */
  const personValid = (p: Person, unknown: boolean) => p.name.trim() !== '' && p.date !== '' && p.place.trim() !== '' && (unknown || p.time !== '')
  const errA = { name: a.name.trim() === '', date: a.date === '', place: a.place.trim() === '', time: !unknownTimeA && a.time === '' }
  const errB = { name: b.name.trim() === '', date: b.date === '', place: b.place.trim() === '', time: !unknownTimeB && b.time === '' }
  const valid = personValid(a, unknownTimeA) && (!def.couple || personValid(b, unknownTimeB))

  const posterLangLabel = posterLang
  const designLabel = def.poster ? `${t(`options.backgrounds.${bgHex}`)} · ${t(`options.frames.${frameHex}`)}` : '—'

  const addToCart = () => {
    if (!valid) { setShowErrors(true); document.getElementById('personalize-birth')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    // Ehrlichkeits-Gate (OQ-004): kein Kauf ohne fertig berechnetes exaktes
    // Chart. Ein Poster mit Strichen oder einem veralteten Chart darf nie in
    // den Warenkorb — der Käufer bezahlt für die EXAKTE Berechnung.
    const exactReady = def.couple
      ? pairStatus === 'ready' && !!pair && !!resolvedPlace && !!placeB.place
      : isWestern
        ? westernStatus === 'ready' && !!western && !!resolvedPlace
        : chartStatus === 'ready' && !!chart && !!resolvedPlace
    if (!exactReady) {
      setShowErrors(true)
      showToast(t('personalize.chartNotReady'))
      document.getElementById('personalize-birth')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const provenance = def.couple ? pair!.a.provenance : isWestern ? western!.provenance : chart!.provenance
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
      // Aufgelöster Ort + Provenance (VCHK-01 erweitert): damit rechnet der
      // Server beim Druck (fulfillOrder) mit EXAKT denselben Koordinaten und
      // ist die Berechnung für immer der Engine-Version zuordenbar.
      placeResolved: resolvedPlace!.resolvedName,
      placeLat: String(resolvedPlace!.lat),
      placeLon: String(resolvedPlace!.lon),
      placeTz: resolvedPlace!.tz,
      placeCountry: resolvedPlace!.countryCode,
      engineVersion: provenance.engine_version ?? '',
      rulesetId: provenance.ruleset_id ?? '',
    }
    if (def.couple) {
      // Mirror the A-side fallback provenance for person B (REQ-004 AK-1 / REQ-018):
      // the 2nd chart must carry the SAME canonical fields, derived from the SAME
      // birthTimeMeta helper — never collect btB then drop its disclosure flags.
      personalization.nameB = b.name.trim()
      personalization.dateB = b.date
      personalization.timeB = btB.time
      personalization.timeDisplayB = btB.timeDisplay
      personalization.birthTimeUnknownB = btB.birthTimeUnknown
      personalization.unknownTimeB = btB.unknownTime
      personalization.timeFallbackUsedB = btB.timeFallbackUsed
      personalization.fallbackReasonB = btB.fallbackReason
      personalization.placeB = b.place.trim()
      // Aufgelöster Ort B — Spiegel der A-Felder (kein stiller Drop).
      personalization.placeResolvedB = placeB.place!.resolvedName
      personalization.placeLatB = String(placeB.place!.lat)
      personalization.placeLonB = String(placeB.place!.lon)
      personalization.placeTzB = placeB.place!.tz
      personalization.placeCountryB = placeB.place!.countryCode
    }
    if (def.poster) {
      personalization.designId = designId
      personalization.frame = frame.name
      // Hex-Werte zusätzlich zu den Namen: der Server rendert das Druck-PDF
      // aus GENAU diesen Werten — kein Namens-Mapping, das driften könnte.
      personalization.frameHex = frameHex
      personalization.bgHex = bgHex
      personalization.palette = bg.name
      // posterBg (REQ-018 5-Hex-Palette) entfernt — Operator-Vorgabe 2026-07-13.
      personalization.size = size.label
      // Kanonische Format-ID zusätzlich zum Label (R4 #10): der Druckpfad
      // (fulfillment → PRINT_SPECS/Gelato) mappt über die ID, nie übers Label.
      personalization.sizeId = size.id
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

      {/* ---- Layout + sticky preview (Operator-Fund 2026-07-13, Mobile-First):
          im einspaltigen Grid war das Preview-Item seine EIGENE Row → sticky
          wirkungslos, der Käufer sah beim Ausfüllen sein Poster nicht. Das
          Layout ist unterhalb lg jetzt display:block (.personalize-layout,
          index.css) und die Vorschau klebt kompakt unter der Kopfzeile
          (.personalize-preview) — das Poster bleibt bei Rahmen-/Format-/
          Farbwahl IMMER sichtbar. Desktop unverändert 2-spaltig. */}
      <div className="personalize-layout">
        <div
          data-testid="poster-preview-sticky"
          className="personalize-preview"
          // Opaker Grund (Seitenweiß): das Sticky-Modul MUSS den darunter
          // durchscrollenden Inhalt maskieren — auch unter dem Szene-Kasten
          // (Hinweis-/Statuszeilen), sonst scheinen Formular-Karten durch.
          style={{ background: C.bg }}
        >
          {/* Batch #12 R3 (#6): EIN Präsentations-Modul — das Poster (mit
              gewähltem Hintergrund) sitzt im realistischen Rahmen auf einer
              Wandfläche, wie in der PDP-Galerie; auch die Digital-Kachel lebt
              im selben Modul, damit der Wechsel der Typen ruhig bleibt. */}
          <div data-testid="personalize-scene" className="personalize-scene">
            {def.poster ? (
              <PosterSvg data={previewData} designId={designId} frameName={frame.name} />
            ) : (
              <div style={{ aspectRatio: '3 / 4', background: '#fff', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 40 }}>◇</div>
                <div style={{ fontFamily: FONT_SERIF, fontSize: 22, color: C.ink }}>{t('personalize.pdfBadge')}</div>
                <div style={{ fontSize: 13, color: C.textMuted2 }}>{t('personalize.types.digital.sub')}</div>
              </div>
            )}
          </div>
          {/* R4 (#7): Rahmen-ANSICHTEN — beide Rahmen als klickbare Kacheln aus
              derselben Design-Quelle (kein Fake-Mockup); Klick wechselt den
              Rahmen der Hauptvorschau. */}
          {def.poster && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              {frames.map((f) => {
                const sel = f.hex === frameHex
                return (
                  <button
                    key={f.hex}
                    type="button"
                    data-testid="frame-view"
                    aria-pressed={sel}
                    onClick={() => setFrameHex(f.hex)}
                    style={{ position: 'relative', border: `1px solid ${C.borderInput}`, background: '#fff', padding: 8, cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 11, color: C.ink }}
                  >
                    <PosterSvg data={previewData} designId={designId} frameName={f.name} testId={`frame-view-preview-${f.name}`} />
                    <div style={{ marginTop: 6 }}>{t(`options.frames.${f.hex}`)}</div>
                    {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                  </button>
                )
              })}
            </div>
          )}
          <p style={{ fontSize: 12, color: C.textMuted5, margin: '12px 2px 0', lineHeight: 1.5 }}>{t('personalize.previewCertainty')}</p>
          {activeStatus === 'loading' && (
            <p data-testid="chart-status-loading" style={{ fontSize: 12, color: C.textMuted3, margin: '6px 2px 0' }}>{t('personalize.chartLoading')}</p>
          )}
          {activeStatus === 'error' && (
            <p data-testid="chart-status-error" role="alert" style={{ fontSize: 12, color: C.accent, margin: '6px 2px 0' }}>{t('personalize.chartError')}</p>
          )}
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
                  <button key={p.id} onClick={() => setTypeId(p.id)} style={{ position: 'relative', textAlign: 'left', border: `1px solid ${C.borderInput}`, background: sel ? C.accentSoftBg : C.surfaceInput, padding: '12px 14px', cursor: 'pointer', fontFamily: FONT_SANS }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.25 }}>{t(`personalize.types.${p.id}.name`)}</div>
                    <div style={{ fontSize: 11, color: C.textMuted2, marginTop: 4, lineHeight: 1.35 }}>{t(`personalize.types.${p.id}.sub`)}</div>
                    {COMMERCE_ENABLED && <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginTop: 6 }}>{t('personalize.from')} {money(p.basePrice)}</div>}
                    {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2 — birth data */}
          <div id="personalize-birth" style={cardStyle}>
            <div style={headingStyle}>{def.couple ? t('personalize.birthHeadingA') : t('personalize.birthHeading')}</div>
            {/* Batch #12 R3 (#8): Pflichtfeld-Legende — die Sternchen in den
                Labels sind VOR dem ersten Kaufversuch erklärt. */}
            <p data-testid="required-fields-hint" style={{ fontSize: 12, color: C.textMuted3, margin: '0 0 12px' }}>{t('personalize.requiredHint')}</p>
            <PersonFields person={a} setPerson={setA} unknownTime={unknownTimeA} err={errA} showErrors={showErrors} t={t} primary onCommitPlace={placeA.resolve} />
            {/* Orts-Auflösungs-Status (Exaktheits-Transparenz): der Käufer sieht
                IMMER, für welchen aufgelösten Ort gerechnet wird — nichts wird
                still angenommen. Mehrdeutig → Kandidaten; nicht gefunden →
                Nachbarort-Hinweis (astronomisch identisch). */}
            <PlaceResolutionStatus status={placeA.status} place={placeA.place} candidates={placeA.candidates} onPick={pickCandidateA} t={t} testPrefix="place" />
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
              <input data-testid="unknown-time-a" type="checkbox" checked={unknownTimeA} onChange={(e) => setUnknownTimeA(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.accent }} />
              <span>{t('personalize.unknownTime')}<br /><span style={{ fontSize: 12, color: C.textMuted3 }}>{t('personalize.unknownTimeHint')}</span></span>
            </label>
            {unknownTimeA && (
              <div data-testid="noon-fallback-field-hint" role="note" style={{ marginTop: 12, background: C.accentSoftBg, color: C.accent, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5 }}>
                {t('noonFallback.fieldHint')}
              </div>
            )}
            {def.couple && (
              <>
                <div style={{ ...headingStyle, marginTop: 22 }}>{t('personalize.birthHeadingB')}</div>
                <PersonFields person={b} setPerson={setB} unknownTime={unknownTimeB} err={errB} showErrors={showErrors} t={t} onCommitPlace={placeB.resolve} />
                <PlaceResolutionStatus status={placeB.status} place={placeB.place} candidates={placeB.candidates} onPick={pickCandidateB} t={t} testPrefix="place-b" />
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
              <input data-testid="unknown-time-b" type="checkbox" checked={unknownTimeB} onChange={(e) => setUnknownTimeB(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.accent }} />
              <span>{t('personalize.unknownTime')}<br /><span style={{ fontSize: 12, color: C.textMuted3 }}>{t('personalize.unknownTimeHint')}</span></span>
            </label>
            {unknownTimeB && (
              <div data-testid="noon-fallback-field-hint-b" role="note" style={{ marginTop: 12, background: C.accentSoftBg, color: C.accent, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5 }}>
                {t('noonFallback.fieldHint')}
              </div>
            )}
              </>
            )}
          </div>

          {/* Chart-Review (Operator 2026-07-13): Tagesmeister + Säulen als
              lesbare Zusammenfassung; beim Paar-Poster BEIDE Partner mit den
              korrekten eingegebenen Daten. Erscheint erst, wenn das exakte
              Chart fertig berechnet ist — nie Platzhalterwerte. */}
          {def.poster && !def.couple && !isWestern && chartStatus === 'ready' && chart && (
            <div data-testid="chart-review" style={cardStyle}>
              <div style={headingStyle}>{t('personalize.review.heading')}</div>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 7, columnGap: 16, fontSize: 13 }}>
                <SumRow label={t('personalize.review.dayMaster')} value={`${chart.pillars[2]?.stem ?? '—'} · ${localizeElement(stemElement(chart.pillars[2]?.stem ?? ''), lang)}`} strong />
                <SumRow label={t('personalize.review.pillars')} value={chart.pillars.map((pl) => `${pl.label} ${pl.stem}${pl.branch}`).join(' · ')} />
                <SumRow label={t('personalize.review.animal')} value={localizeAnimal(chart.animal, lang)} />
              </dl>
              {/* Ausführliche Erklärungen (Operator 2026-07-14): Säulen,
                  Tagesmeister, Elemente, Tierzeichen — niemand soll raten
                  müssen, was die Zeichen bedeuten. */}
              <div data-testid="chart-explain" style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <div style={{ ...headingStyle, marginBottom: 10 }}>{t('personalize.review.explainHeading')}</div>
                {(['pillars', 'dayMaster', 'element', 'animal'] as const).map((k) => (
                  <p key={k} style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.65, color: C.textMuted }}>
                    <strong style={{ color: C.ink, fontWeight: 600 }}>{t(k === 'element' ? 'personalize.review.elementsLabel' : `personalize.review.${k}`)}: </strong>
                    {t(`personalize.review.explain.${k}`)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Western-Review (Birth-Chart-Poster): Big Three + Erklärungen. */}
          {isWestern && westernStatus === 'ready' && western && (
            <div data-testid="western-review" style={cardStyle}>
              <div style={headingStyle}>{t('personalize.review.heading')}</div>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 7, columnGap: 16, fontSize: 13 }}>
                <SumRow label={planetName('Sun', lang)} value={`${zodiacName(western.sun.signIndex, lang)} · ${String(western.sun.deg).replace('.', ',')}°`} strong />
                <SumRow label={planetName('Moon', lang)} value={`${zodiacName(western.moon.signIndex, lang)} · ${String(western.moon.deg).replace('.', ',')}°`} />
                {western.ascendant && (
                  <SumRow label={planetName('Ascendant', lang)} value={`${zodiacName(western.ascendant.signIndex, lang)} · ${String(western.ascendant.deg).replace('.', ',')}°`} />
                )}
              </dl>
              <div data-testid="western-explain" style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <div style={{ ...headingStyle, marginBottom: 10 }}>{t('personalize.review.explainHeading')}</div>
                <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.65, color: C.textMuted }}>
                  <strong style={{ color: C.ink, fontWeight: 600 }}>{planetName('Sun', lang)}: </strong>{t('personalize.review.western.sun')}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.65, color: C.textMuted }}>
                  <strong style={{ color: C.ink, fontWeight: 600 }}>{planetName('Moon', lang)}: </strong>{t('personalize.review.western.moon')}
                </p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: C.textMuted }}>
                  <strong style={{ color: C.ink, fontWeight: 600 }}>{planetName('Ascendant', lang)}: </strong>
                  {western.ascendant ? t('personalize.review.western.asc') : t('personalize.review.western.ascUnknown')}
                </p>
              </div>
            </div>
          )}
          {def.couple && pairStatus === 'ready' && pair && (
            <div data-testid="chart-review" style={cardStyle}>
              <div style={headingStyle}>{t('personalize.review.heading')}</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  // dayMaster-Anzeige nutzt die GLYPHE aus pillars[2].stem —
                  // die API liefert relation.dayMasterA/B als Pinyin (Fund
                  // 2026-07-14: „Xin"/„Bing"), Poster + Review zeigen Glyphen.
                  { key: 'a', person: a, bt: btA, unknown: unknownTimeA, place: resolvedPlace, chart: pair.a },
                  { key: 'b', person: b, bt: btB, unknown: unknownTimeB, place: placeB.place, chart: pair.b },
                ].map(({ key, person, bt, unknown, place, chart: pc }) => (
                  <div key={key} data-testid={`partner-review-${key}`} style={{ border: `1px solid ${C.border}`, background: C.surfaceWarm, padding: 14 }}>
                    <div style={{ fontFamily: FONT_SERIF, fontSize: 17, color: C.ink, marginBottom: 8 }}>{person.name || '—'}</div>
                    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 5, columnGap: 12, fontSize: 12.5 }}>
                      <SumRow label={t('configurator.date')} value={person.date || '—'} />
                      <SumRow label={t('configurator.time')} value={unknown ? t('personalize.timeUnknown') : bt.timeDisplay || '—'} />
                      <SumRow label={t('configurator.place')} value={place ? `${place.resolvedName}, ${place.countryCode}` : person.place || '—'} />
                      <SumRow label={t('personalize.review.dayMaster')} value={`${pc.pillars[2]?.stem ?? '—'} · ${localizeElement(stemElement(pc.pillars[2]?.stem ?? ''), lang)}`} strong />
                      <SumRow label={t('personalize.review.animal')} value={localizeAnimal(pc.animal, lang)} />
                      <SumRow label={t('personalize.review.pillars')} value={pc.pillars.map((pl) => `${pl.label} ${pl.stem}${pl.branch}`).join(' · ')} />
                    </dl>
                  </div>
                ))}
              </div>
              {relationLabel && (
                <div data-testid="pair-relation-review" style={{ marginTop: 12, fontSize: 13, color: C.accent, fontWeight: 600 }}>
                  {localizeRelation(pair.relation, lang)}
                </div>
              )}
              {/* Kompatibilitäts-Erklärung (Operator 2026-07-14): strukturiert
                  unter den eingetragenen Daten — Tagesmeister-Paarung, die
                  Fünf-Elemente-Beziehung in Worten, und der EHRLICHE Rahmen
                  (symbolische Lesart, keine Beziehungsbewertung). */}
              {pair.relation.wuxingRelation && (
                <div data-testid="compat-explainer" style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <div style={{ ...headingStyle, marginBottom: 10 }}>{t('personalize.review.compat.heading')}</div>
                  <dl style={{ margin: '0 0 10px', display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 5, columnGap: 12, fontSize: 12.5 }}>
                    <SumRow
                      label={t('personalize.review.compat.dayMasters')}
                      value={`${pair.a.pillars[2]?.stem ?? '—'} · ${localizeElement(stemElement(pair.a.pillars[2]?.stem ?? ''), lang)}  &  ${pair.b.pillars[2]?.stem ?? '—'} · ${localizeElement(stemElement(pair.b.pillars[2]?.stem ?? ''), lang)}`}
                      strong
                    />
                  </dl>
                  <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.6, color: C.textMuted }}>
                    {t(`personalize.review.compat.rel.${pair.relation.wuxingRelation}`, {
                      a: localizeElement(stemElement(pair.a.pillars[2]?.stem ?? ''), lang),
                      b: localizeElement(stemElement(pair.b.pillars[2]?.stem ?? ''), lang),
                    })}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: C.textMuted3 }}>
                    {t('personalize.review.compat.note')}
                  </p>
                  <div data-testid="chart-explain" style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                    <div style={{ ...headingStyle, marginBottom: 10 }}>{t('personalize.review.explainHeading')}</div>
                    {(['pillars', 'dayMaster', 'element', 'animal'] as const).map((k) => (
                      <p key={k} style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.65, color: C.textMuted }}>
                        <strong style={{ color: C.ink, fontWeight: 600 }}>{t(k === 'element' ? 'personalize.review.elementsLabel' : `personalize.review.${k}`)}: </strong>
                        {t(`personalize.review.explain.${k}`)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — poster language */}
          <div style={cardStyle}>
            <div style={headingStyle}>{t('personalize.langHeading')}</div>
            <div data-testid="poster-lang-picker" style={{ display: 'flex', gap: 10 }}>
              {LANGS.map((l) => {
                const sel = l === posterLang
                return (
                  <button key={l} onClick={() => setPosterLang(l)} style={{ position: 'relative', border: `1px solid ${C.borderInput}`, background: sel ? C.accentSoftBg : C.surfaceInput, padding: '10px 20px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 14, fontWeight: sel ? 600 : 400, color: C.ink }}>
                    {l}
                    {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Steps 4-5 — design + size + PDF (poster types only) */}
          {def.poster && (
            <div style={cardStyle}>
              <div style={headingStyle}>{t('personalize.designHeading')}</div>
              {/* Design-Wähler: rendert automatisch einen Swatch je AKTIVEM
                  Registry-Design — neues Design = neue Registry-Zeile, keine
                  UI-Änderung nötig. */}
              {activeDesigns.length > 1 && (
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  {activeDesigns.map((d) => {
                    const sel = d.id === designId
                    return (
                      <button key={d.id} data-testid="design-swatch" data-design={d.id} onClick={() => setDesignId(d.id)} style={{ position: 'relative', width: 84, border: `1px solid ${C.borderInput}`, background: C.surfaceInput, padding: 6, cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 11, color: C.ink }}>
                        {/* Swatch-Mini-Vorschau mit EIGENER testid — die Hauptvorschau (poster-svg-preview) bleibt eindeutig. */}
                        <PosterSvg data={previewData} designId={d.id} testId={`design-swatch-preview-${d.id}`} />
                        <div style={{ marginTop: 4 }}>{d.name}</div>
                        {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                      </button>
                    )
                  })}
                </div>
              )}
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{t('personalize.frameWord')} — {t(`options.frames.${frameHex}`)}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {frames.map((f) => {
                  const sel = f.hex === frameHex
                  return (
                    <button key={f.hex} onClick={() => setFrameHex(f.hex)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${C.borderInput}`, background: C.surfaceInput, padding: '8px 14px 8px 8px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13, color: '#4A4438' }}>
                      <span className="color-swatch-circle" style={{ width: 26, height: 26, background: f.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />{t(`options.frames.${f.hex}`)}
                      {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{t('personalize.paletteWord')} — {t(`options.backgrounds.${bgHex}`)}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                {backgrounds.map((x) => {
                  const sel = x.hex === bgHex
                  return (
                    <button key={x.hex} onClick={() => setBgHex(x.hex)} title={t(`options.backgrounds.${x.hex}`)} className="color-swatch-circle" style={{ position: 'relative', width: 44, height: 44, border: '1px solid rgba(0,0,0,0.08)', background: x.hex, cursor: 'pointer' }}>
                      {sel && <span className="color-swatch-circle" style={{ position: 'absolute', inset: -4, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
              {/* Poster-Background-Palette (REQ-018/T-404) entfernt —
                  Operator-Vorgabe 2026-07-13: keine 5-Swatch-Auswahl mehr. */}
              <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 10 }}>{t('personalize.sizeHeading')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {sizes.map((z) => {
                  const sel = z.id === sizeId
                  const deltaText = z.delta > 0 ? '+ ' + money(z.delta) : z.delta < 0 ? '− ' + money(-z.delta) : t('configurator.inclusive')
                  return (
                    <button key={z.id} onClick={() => setSizeId(z.id)} style={{ position: 'relative', border: `1px solid ${C.borderInput}`, background: C.surfaceInput, padding: '12px 8px', cursor: 'pointer', textAlign: 'center', fontFamily: FONT_SANS }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{z.label}</div>
                      <div style={{ fontSize: 11, color: C.textMuted3, margin: '3px 0 4px' }}>{z.sub}</div>
                      {COMMERCE_ENABLED && <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{deltaText}</div>}
                      {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, pointerEvents: 'none' }} />}
                    </button>
                  )
                })}
              </div>
              {!def.pdfIncluded && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 18, cursor: 'pointer', fontSize: 13, color: C.textMuted }}>
                  <input type="checkbox" checked={pdfAddon} onChange={(e) => setPdfAddon(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: C.accent }} />
                  <span>
                    {t('personalize.pdfAddon')}
                    {COMMERCE_ENABLED && (
                      <>
                        {' '}(+ {money(PDF_ADDON_PRICE)} <s style={{ color: C.textMuted3 }}>{money(DIGITAL_ANALYSIS_PRICE)}</s>
                        {' '}<span style={{ color: C.accent, fontWeight: 600 }}>{t('personalize.pdfAddonSave')}</span>)
                      </>
                    )}
                    <br /><span style={{ fontSize: 12, color: C.textMuted3 }}>{t('personalize.pdfNote')}</span>
                  </span>
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
              {def.couple && <SumRow label={t('personalize.partnerData')} value={`${b.date || '—'} · ${unknownTimeB ? t('personalize.timeUnknown') : b.time || '—'} · ${b.place || '—'}`} />}
              <SumRow label={t('configurator.date')} value={a.date || '—'} />
              <SumRow label={t('configurator.time')} value={unknownTimeA ? t('personalize.timeUnknown') : a.time || '—'} />
              <SumRow label={t('configurator.place')} value={a.place || '—'} />
              <SumRow label={t('personalize.sumLang')} value={posterLangLabel} />
              {def.poster && <SumRow label={t('personalize.sumDesign')} value={designLabel} />}
              {def.poster && <SumRow label={t('personalize.sumSize')} value={size.label} />}
              {COMMERCE_ENABLED && <SumRow label={t('personalize.sumPrice')} value={money(price)} strong />}
            </dl>
            {/* REQ-018 AK-3 — disclosed noon fallback in the personalization summary. */}
            {(unknownTimeA || (def.couple && unknownTimeB)) && (
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
            <div style={{ background: C.accentSoftBg, color: C.accent, padding: '12px 14px', fontSize: 13, marginBottom: 12 }}>{t('personalize.errFix')}</div>
          )}

          <button onClick={addToCart} className="transition-[filter,transform] hover:brightness-110 active:translate-y-[1px]" style={{ width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 18, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, letterSpacing: '0.01em', boxShadow: ACCENT_CTA_SHADOW }}>
            {t('personalize.addToCart')}{COMMERCE_ENABLED && <> · {money(price)}</>}
          </button>

          {/* R4 (#7): einheitliche PDP-Struktur — Trust-Zeile + Details/
              Material/Formate/Versand/Personalisierung (gleiche faqDefs wie
              die Katalog-PDP, EINE Quelle). */}
          <PersonalizeTrustRow />
          <PersonalizeFaq />
        </div>
      </div>

      {/* R4 (#7/#11): Empfehlungen — echte Links auf aktive Katalogprodukte. */}
      <PersonalizeCrossSells />
    </main>
  )
}

function PersonFields({ person, setPerson, unknownTime, err, showErrors, t, primary, onCommitPlace }: { person: Person; setPerson: (p: Person) => void; unknownTime: boolean; err: { name: boolean; date: boolean; place: boolean; time: boolean }; showErrors: boolean; t: (k: string, v?: Record<string, string | number>) => any; primary?: boolean; onCommitPlace?: (v: string) => void }) {
  const e = (cond: boolean) => showErrors && cond
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12 }}>
      <Field label={t('configurator.name')} error={e(err.name)} required><input type="text" aria-required="true" value={person.name} onChange={(ev) => setPerson({ ...person, name: ev.target.value })} placeholder={t('configurator.namePh')} style={inputStyle} /></Field>
      {/* REQ-013 / T-403 — Place-of-Birth autocomplete from the bundled cities
          list (src/lib/cities.ts). NEVER calls a public geocoder per keystroke.
          Die EXAKTE Auflösung (lat/lon/tz) passiert erst bei Auswahl/Blur über
          die EIGENE Route /api/geocode (onCommitPlace) — Policy AT-013-3 bleibt. */}
      <Field label={t('configurator.place')} error={e(err.place)} required>
        <PlaceAutocomplete value={person.place} onChange={(v) => setPerson({ ...person, place: v })} placeholder={t('configurator.placePh')} primary={primary} onCommit={onCommitPlace} />
      </Field>
      <Field label={t('configurator.date')} error={e(err.date)} required><input type="date" aria-required="true" value={person.date} onChange={(ev) => setPerson({ ...person, date: ev.target.value })} style={inputStyle} /></Field>
      {/* Zeit ist Pflicht, solange sie nicht ausdrücklich als unbekannt markiert
          ist (dann greift der offengelegte 12:00-Fallback). */}
      <Field label={t('configurator.time')} error={e(err.time)} required={!unknownTime}><input type="time" aria-required={!unknownTime} value={person.time} disabled={unknownTime} onChange={(ev) => setPerson({ ...person, time: ev.target.value })} style={{ ...inputStyle, opacity: unknownTime ? 0.5 : 1 }} /></Field>
    </div>
  )
}

/** Place-of-Birth combobox backed ONLY by the bundled cities list (REQ-013 /
 *  T-403). Suggestions are pure string matches over src/lib/cities.ts — no fetch,
 *  no XHR, no public geocoder (policy-guard AT-013-3). `primary` tags the first
 *  person's field with stable test anchors. */
function PlaceAutocomplete({ value, onChange, placeholder, primary, onCommit }: { value: string; onChange: (v: string) => void; placeholder: string; primary?: boolean; onCommit?: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const suggestions = useMemo(() => searchCities(value), [value])
  const show = open && suggestions.length > 0

  const pick = (city: string) => { onChange(city); setOpen(false); onCommit?.(city) }

  return (
    <div style={{ position: 'relative', minWidth: 0 }}>
      <input
        type="text"
        role="combobox"
        aria-required="true"
        aria-expanded={show}
        aria-autocomplete="list"
        data-testid={primary ? 'place-of-birth-input' : 'place-of-birth-input-b'}
        value={value}
        onChange={(ev) => { onChange(ev.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { window.setTimeout(() => setOpen(false), 120); if (value.trim()) onCommit?.(value) }}
        placeholder={placeholder}
        style={inputStyle}
      />
      {show && (
        <ul data-testid={primary ? 'place-suggestions' : undefined} role="listbox" style={{ position: 'absolute', zIndex: 5, top: 'calc(100% + 4px)', left: 0, right: 0, listStyle: 'none', margin: 0, padding: 4, maxHeight: 220, overflowY: 'auto', background: '#fff', border: `1px solid ${C.borderInput}`, boxShadow: '0 12px 24px -14px rgba(0,0,0,0.3)' }}>
          {suggestions.map((city) => (
            <li key={city} role="option" aria-selected={city === value}>
              <button type="button" onMouseDown={(ev) => ev.preventDefault()} onClick={() => pick(city)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px 10px', fontFamily: FONT_SANS, fontSize: 13, color: C.ink }}>
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Auflösungs-Status unter einem Geburtsort-Feld: bestätigter Ort, Kandidaten-
 *  Auswahl (mehrdeutig), Nachbarort-Hinweis (nicht gefunden), Fehler. */
function PlaceResolutionStatus({ status, place, candidates, onPick, t, testPrefix }: { status: PlaceStatus; place: { resolvedName: string; countryCode: string } | null; candidates: PlaceCandidate[] | null; onPick: (c: PlaceCandidate) => void; t: (k: string, v?: Record<string, string | number>) => any; testPrefix: string }) {
  if (status === 'ok' && place) {
    return (
      <div data-testid={`${testPrefix}-resolved-note`} role="note" style={{ marginTop: 10, fontSize: 12.5, color: C.textMuted2 }}>
        {t('personalize.placeResolvedAs', { name: `${place.resolvedName}, ${place.countryCode}` })}
      </div>
    )
  }
  if (status === 'ambiguous' && candidates) {
    return (
      <div data-testid={`${testPrefix}-candidates`} role="group" style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12.5, color: C.textMuted2, marginBottom: 6 }}>{t('personalize.placeAmbiguous')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {candidates.map((c, i) => (
            <button key={`${c.name}-${i}`} type="button" onClick={() => onPick(c)} style={{ border: `1px solid ${C.borderInput}`, background: C.surfaceInput, padding: '7px 12px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 12.5, color: C.ink }}>
              {c.name}, {c.countryCode}
            </button>
          ))}
        </div>
      </div>
    )
  }
  if (status === 'not_found') {
    return (
      <div data-testid={`${testPrefix}-not-found-note`} role="note" style={{ marginTop: 10, background: C.accentSoftBg, color: C.accent, padding: '9px 12px', fontSize: 12.5, lineHeight: 1.5 }}>
        {t('personalize.placeNotFound')}
      </div>
    )
  }
  if (status === 'error') {
    return <div role="note" style={{ marginTop: 10, color: C.accent, fontSize: 12.5 }}>{t('personalize.chartError')}</div>
  }
  return null
}

function SumRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <>
      <dt style={{ color: C.textMuted2 }}>{label}</dt>
      <dd style={{ margin: 0, textAlign: 'right', color: C.ink, fontWeight: strong ? 700 : 500 }}>{value}</dd>
    </>
  )
}
