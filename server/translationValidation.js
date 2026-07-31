// Serverseitige Eingabe-Validierung für die Übersetzungspipeline — T-C02 der
// CJK-Migration (V3 §5.1C + §6.2). Reine Funktionen, keine Abhängigkeiten.
//
// Spiegel der TS-Domäne (src/lib/translationTypes.ts) — Paritätstest:
// tests/unit/translation-status-parity.test.ts. XML-Escaping passiert bewusst
// NICHT hier, sondern in der Design-Render-Schicht (src/designs/svgUtil.mjs,
// vom Design-TÜV erzwungen); hier wird nur entschieden, ob ein Text überhaupt
// in die Pipeline darf.

export const TARGET_LANGUAGES = ['zh-Hans', 'zh-Hant', 'ja', 'ko']
export const TRANSLATION_MODES = ['name', 'phrase', 'customer-cjk']

// Zeichen-Obergrenzen je Modus, gezählt in GLYPHEN (Array.from — astral-sicher),
// nicht in UTF-16-Einheiten. Feinere Grenzen je Design/Layout (maxGlyphs) kommen
// mit der Registry-Erweiterung T-G03 obendrauf.
export const TEXT_LIMITS = { name: 40, phrase: 120, 'customer-cjk': 40 }

// Steuer-/Format-Zeichen, die nie in Drucktext gehören: C0/C1, Zero-Width-*,
// Bidi-Marken, Zeilen-/Absatztrenner, BOM. (\n fällt unter C0 → abgelehnt;
// Poster-Zeilenumbrüche entstehen im Layout, nicht in der Roheingabe.)
const FORBIDDEN_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\uFEFF]/u

export function glyphLength(text) {
  return Array.from(String(text)).length
}

// NFC-Normalisierung + Trim + Whitespace-Läufe (inkl. Ideographic Space) auf
// EIN Leerzeichen verdichten. Gibt den kanonischen Text zurück, über den auch
// der Server-Cache (T-C03) gehasht wird.
export function normalizeSourceText(raw) {
  return String(raw ?? '')
    .normalize('NFC')
    .replace(/[\s　]+/gu, ' ')
    .trim()
}

const SCRIPT_PATTERNS = {
  han: /\p{Script=Han}/u,
  hiragana: /\p{Script=Hiragana}/u,
  katakana: /\p{Script=Katakana}/u,
  hangul: /\p{Script=Hangul}/u,
  latin: /\p{Script=Latin}/u,
}

export function detectScripts(text) {
  const s = String(text ?? '')
  return Object.keys(SCRIPT_PATTERNS).filter((k) => SCRIPT_PATTERNS[k].test(s))
}

// Modus C („Kunde liefert bereits CJK-Schrift"): erlaubt sind ausschließlich
// die Schriftsysteme der Zielsprache plus CJK-Interpunktion/Breitformen,
// Iterationszeichen (々), Längungsstrich (ー, Script=Common) und Leerzeichen.
const CJK_PUNCT = '\\u3001-\\u303F\\uFF01-\\uFF65'
const CUSTOMER_CJK_ALLOWED = {
  'zh-Hans': new RegExp(`^[\\p{Script=Han}\\u3005${CJK_PUNCT} ]+$`, 'u'),
  'zh-Hant': new RegExp(`^[\\p{Script=Han}\\u3005${CJK_PUNCT} ]+$`, 'u'),
  ja: new RegExp(`^[\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\u30FC\\u3005${CJK_PUNCT} ]+$`, 'u'),
  ko: new RegExp(`^[\\p{Script=Hangul}${CJK_PUNCT} ]+$`, 'u'),
}

export function validateCustomerCjk(normalizedText, target) {
  const re = CUSTOMER_CJK_ALLOWED[target]
  if (!re) return { ok: false, error: 'invalid_target' }
  if (!re.test(normalizedText)) return { ok: false, error: 'unsupported_script', scripts: detectScripts(normalizedText) }
  return { ok: true, scripts: detectScripts(normalizedText) }
}

// Zentrale Eingangsprüfung für Preview UND Confirm. Liefert IMMER die volle
// Fehlerliste (Fehlercodes, nie Klartext-Echos des Kundentexts — Datenschutz:
// Kundentext gehört nicht in Logs oder Fehlermeldungen).
export function validateSourceInput({ sourceText, mode, target }) {
  const errors = []
  if (!TRANSLATION_MODES.includes(mode)) errors.push('invalid_mode')
  if (!TARGET_LANGUAGES.includes(target)) errors.push('invalid_target')
  const rawStr = String(sourceText ?? '')
  if (FORBIDDEN_CHARS.test(rawStr)) errors.push('forbidden_characters')
  const normalized = normalizeSourceText(rawStr)
  if (!normalized) errors.push('empty_text')
  const limit = TEXT_LIMITS[mode]
  if (limit && glyphLength(normalized) > limit) errors.push('too_long')
  if (errors.length) return { ok: false, errors }
  return { ok: true, normalized, errors: [] }
}
