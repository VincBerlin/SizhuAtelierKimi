// Übersetzungs-Domänentypen — T-C01 der CJK-Migration
// (docs/plans/2026-07-31-cjk-migration.md; Statusmodell = V3 §5.2,
// Snapshot = V3 §6.3). Server-seitige JS-Spiegel: server/translationStore.js
// (Transitions) und server/translationValidation.js (Modi/Sprachen) —
// Paritätstest: tests/unit/translation-status-parity.test.ts.

export const TARGET_LANGUAGES = ['zh-Hans', 'zh-Hant', 'ja', 'ko'] as const
export type TargetLanguage = (typeof TARGET_LANGUAGES)[number]

export const TRANSLATION_MODES = ['name', 'phrase', 'customer-cjk'] as const
export type TranslationMode = (typeof TRANSLATION_MODES)[number]

// Qualitätsstufen (V3 §5.2). Druckbar ist AUSSCHLIESSLICH `approved`;
// `printed` ist der abgeschlossene Endzustand nach PDF+Gelato.
export const TRANSLATION_STATUSES = [
  'draft',
  'customer_selected',
  'review_required',
  'approved',
  'rejected',
  'printed',
] as const
export type TranslationStatus = (typeof TRANSLATION_STATUSES)[number]

export const PRINTABLE_STATUS: TranslationStatus = 'approved'

// Erlaubte Statusübergänge. `rejected → review_required` erlaubt eine
// korrigierte Neu-Prüfung; alles andere ist bewusst verboten (insbesondere
// JEDER Weg an `approved` vorbei in Richtung Druck).
export const ALLOWED_STATUS_TRANSITIONS: Readonly<
  Record<TranslationStatus, readonly TranslationStatus[]>
> = {
  draft: ['customer_selected'],
  customer_selected: ['review_required', 'approved'],
  review_required: ['approved', 'rejected'],
  approved: ['printed'],
  rejected: ['review_required'],
  printed: [],
}

export interface TranslationCandidate {
  id: string
  text: string
  romanization?: string
  backTranslation?: string
  note?: string
}

// Antwortform von POST /api/translation/preview (V3 §6.1).
export interface TranslationPreviewResponse {
  requestId: string
  status: 'draft'
  target: TargetLanguage
  mode: TranslationMode
  scriptVariant?: string
  candidates: TranslationCandidate[]
  /** null im Modus customer-cjk (kein Anbieter beteiligt). */
  provider: string | null
  providerVersion: string | null
  warnings: string[]
}

// Bestell-Snapshot (V3 §6.3) — wird beim Add-to-Cart vollständig gespeichert;
// Fulfillment verwendet NUR diesen Snapshot und rechnet nie still neu.
export interface TranslationSnapshot {
  sourceText: string
  sourceLanguage?: string
  targetLanguage: TargetLanguage
  scriptVariant?: string
  translationMode: TranslationMode
  selectedCandidateId: string
  finalText: string
  romanization?: string
  translationStatus: TranslationStatus
  translationProvider: string | null
  translationProviderVersion: string | null
  /** translation_jobs.id, sobald der Kunde bestätigt hat (T-C04). */
  jobId?: string
  designId?: string
  layoutId?: string
  sizeId?: string
  fontId?: string
}
