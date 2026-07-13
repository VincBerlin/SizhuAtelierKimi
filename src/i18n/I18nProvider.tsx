import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

// REQ-015 / T-501 — ES is the 4th shipped locale. Order is the picker order.
export const LANGS: Lang[] = ['EN', 'DE', 'FR', 'ES']

type Vars = Record<string, string | number>

interface I18nValue {
  lang: Lang
  setLang: (l: Lang) => void
  /** Resolve a dotted key in the current language (falls back to EN). Returns
   *  string | string[] | object depending on the entry. {var} placeholders are
   *  replaced from `vars`. */
  t: (path: string, vars?: Vars) => any
}

const I18nContext = createContext<I18nValue | null>(null)
const STORE_KEY = 'sizhu_lang'

function resolve(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj)
}

function interpolate(v: unknown, vars?: Vars): unknown {
  if (typeof v === 'string' && vars) {
    let out = v
    for (const k of Object.keys(vars)) out = out.split(`{${k}}`).join(String(vars[k]))
    return out
  }
  return v
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('EN')

  useEffect(() => {
    // Sprach-Auflösung (Operator 2026-07-13): Basis ist ENGLISCH; eine
    // gespeicherte Nutzerwahl gewinnt IMMER. Ohne Wahl: (1) Herkunftsland aus
    // /api/region (liefert das Land nur, wenn am Edge ein vertrauenswürdiger
    // Geo-Header konfiguriert ist — TRUSTED_GEO_HEADER, RL-GEO; DE→Deutsch),
    // (2) sonst die Browser-Sprache (de/fr/es), (3) sonst EN. Ehrlich: ohne
    // Edge-Geo-Header ist (1) leer und (2) greift — dokumentiert im Ledger.
    try {
      const s = localStorage.getItem(STORE_KEY) as Lang | null
      if (s && LANGS.includes(s)) {
        setLangState(s)
        return
      }
    } catch { /* ignore */ }
    const COUNTRY_LANG: Record<string, Lang> = { DE: 'DE', AT: 'DE', FR: 'FR', ES: 'ES' }
    const BROWSER_LANG: Record<string, Lang> = { de: 'DE', fr: 'FR', es: 'ES' }
    let cancelled = false
    const applyBrowserLang = () => {
      const nav = (typeof navigator !== 'undefined' ? navigator.language : '') || ''
      const mapped = BROWSER_LANG[nav.slice(0, 2).toLowerCase()]
      if (mapped && !cancelled) setLangState(mapped)
    }
    fetch('/api/region')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const mapped = j?.country ? COUNTRY_LANG[String(j.country).toUpperCase()] : undefined
        if (cancelled) return
        if (mapped) setLangState(mapped)
        else applyBrowserLang()
      })
      .catch(() => { if (!cancelled) applyBrowserLang() })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang.toLowerCase()
    try { localStorage.setItem(STORE_KEY, lang) } catch { /* ignore */ }
  }, [lang])

  const t = (path: string, vars?: Vars) => {
    let v = resolve(translations[lang], path)
    if (v === undefined) v = resolve(translations.EN, path)
    return interpolate(v, vars)
  }

  return <I18nContext.Provider value={{ lang, setLang: setLangState, t }}>{children}</I18nContext.Provider>
}

export function useT(): I18nValue {
  const c = useContext(I18nContext)
  if (!c) throw new Error('useT must be used inside I18nProvider')
  return c
}
