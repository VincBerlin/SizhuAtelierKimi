import { type CSSProperties, type ReactNode } from 'react'
import { frames, backgrounds, sizes } from '../../lib/bazi'
import { useShopStore } from '../../store/ShopStore'
import { useT } from '../../i18n/I18nProvider'
import { COMMERCE_ENABLED } from '../../lib/config'
import { euro } from '../../lib/format'
import { C, FONT_SANS } from '../../lib/tokens'

const inputStyle: CSSProperties = {
  border: `1px solid ${C.borderInput}`,
  borderRadius: 9,
  padding: '11px 12px',
  fontSize: 14,
  fontFamily: FONT_SANS,
  color: C.ink,
  background: C.surfaceInput,
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: C.textMuted2, minWidth: 0 }}>
      {text}
      {children}
    </label>
  )
}

export default function Configurator() {
  const { cfg, setCfg } = useShopStore()
  const { t } = useT()

  return (
    <>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, background: '#fff', marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', marginBottom: 16, color: C.ink }}>{t('configurator.step1')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12, marginBottom: 12 }}>
          <Label text={t('configurator.date')}><input type="date" value={cfg.date} onChange={(e) => setCfg({ date: e.target.value })} style={inputStyle} /></Label>
          <Label text={t('configurator.time')}><input type="time" value={cfg.time} onChange={(e) => setCfg({ time: e.target.value })} style={inputStyle} /></Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
          <Label text={t('configurator.place')}><input type="text" value={cfg.place} onChange={(e) => setCfg({ place: e.target.value })} placeholder={t('configurator.placePh')} style={inputStyle} /></Label>
          <Label text={t('configurator.name')}><input type="text" value={cfg.name} onChange={(e) => setCfg({ name: e.target.value })} placeholder={t('configurator.namePh')} style={inputStyle} /></Label>
        </div>
      </div>

      <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, padding: 22, background: '#fff', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{t('configurator.step2')} <span style={{ fontWeight: 400, color: C.textMuted3 }}>— {t(`options.frames.${cfg.frameHex}`)}</span></div>
          <div style={{ display: 'flex', gap: 12 }}>
            {frames.map((f) => {
              const sel = f.hex === cfg.frameHex
              return (
                <button key={f.hex} onClick={() => setCfg({ frameHex: f.hex, frameName: f.name })} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, border: `1px solid ${C.borderInput}`, background: C.surfaceInput, borderRadius: 10, padding: '8px 14px 8px 8px', cursor: 'pointer', fontFamily: FONT_SANS, fontSize: 13, color: '#4A4438' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 6, background: f.hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }} />{t(`options.frames.${f.hex}`)}
                  {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, borderRadius: 12, pointerEvents: 'none' }} />}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{t('configurator.step3')} <span style={{ fontWeight: 400, color: C.textMuted3 }}>— {t(`options.backgrounds.${cfg.bgHex}`)}</span></div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {backgrounds.map((b) => {
              const sel = b.hex === cfg.bgHex
              return (
                <button key={b.hex} onClick={() => setCfg({ bgHex: b.hex, bgName: b.name })} title={t(`options.backgrounds.${b.hex}`)} style={{ position: 'relative', width: 44, height: 44, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: b.hex, cursor: 'pointer' }}>
                  {sel && <span style={{ position: 'absolute', inset: -3, border: `2px solid ${C.accent}`, borderRadius: 13, pointerEvents: 'none' }} />}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{t('configurator.step4')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {sizes.map((z) => {
              const sel = z.id === cfg.size
              const deltaText = z.delta > 0 ? '+ ' + euro(z.delta) : z.delta < 0 ? '− ' + euro(-z.delta) : t('configurator.inclusive')
              return (
                <button key={z.id} onClick={() => setCfg({ size: z.id })} style={{ position: 'relative', border: `1px solid ${C.borderInput}`, background: C.surfaceInput, borderRadius: 10, padding: '12px 8px', cursor: 'pointer', textAlign: 'center', fontFamily: FONT_SANS }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{z.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted3, margin: '3px 0 4px' }}>{z.sub}</div>
                  {COMMERCE_ENABLED && <div style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{deltaText}</div>}
                  {sel && <span style={{ position: 'absolute', inset: -2, border: `2px solid ${C.accent}`, borderRadius: 12, pointerEvents: 'none' }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
