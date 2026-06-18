import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

export const LANGS: Lang[] = ['EN', 'DE', 'FR']

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
    try {
      const s = localStorage.getItem(STORE_KEY) as Lang | null
      if (s && LANGS.includes(s)) setLangState(s)
    } catch { /* ignore */ }
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
