// Persistenz für Übersetzungs-Jobs — T-C04 der CJK-Migration (Tabelle V3 §7).
//
// Datenschutzregeln (V3 §7): Kundentexte werden NIE geloggt; persistiert wird
// erst ab Kundenbestätigung (`customer_selected`) — Draft-Previews bleiben
// flüchtig. Statusübergänge sind der JS-Spiegel von
// src/lib/translationTypes.ts (Paritätstest erzwungen).

import { randomUUID } from 'node:crypto'

export const ALLOWED_STATUS_TRANSITIONS = {
  draft: ['customer_selected'],
  customer_selected: ['review_required', 'approved'],
  review_required: ['approved', 'rejected'],
  approved: ['printed'],
  rejected: ['review_required'],
  printed: [],
}

export class TranslationTransitionError extends Error {
  constructor(from, to) {
    super(`translation status transition not allowed: ${from} -> ${to}`)
    this.name = 'TranslationTransitionError'
    this.from = from
    this.to = to
  }
}

export async function ensureTranslationSchema(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS translation_jobs (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id INTEGER NULL,
    order_id INTEGER NULL,
    source_text TEXT NOT NULL,
    source_language TEXT,
    target_language TEXT NOT NULL,
    script_variant TEXT,
    mode TEXT NOT NULL,
    candidates JSONB NOT NULL,
    selected_candidate JSONB,
    status TEXT NOT NULL,
    provider TEXT,
    provider_version TEXT,
    review_notes TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ
  )`)
}

// Legt einen Job mit Kunden-Auswahl an (Status `customer_selected`).
export async function createTranslationJob(pool, job) {
  const id = randomUUID()
  await pool.query(
    `INSERT INTO translation_jobs
       (id, user_id, source_text, source_language, target_language, script_variant,
        mode, candidates, selected_candidate, status, provider, provider_version)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      id,
      job.userId ?? null,
      job.sourceText,
      job.sourceLanguage ?? null,
      job.targetLanguage,
      job.scriptVariant ?? null,
      job.mode,
      JSON.stringify(job.candidates ?? []),
      JSON.stringify(job.selectedCandidate ?? null),
      'customer_selected',
      job.provider ?? null,
      job.providerVersion ?? null,
    ],
  )
  return { id, status: 'customer_selected' }
}

export async function getTranslationJob(pool, id) {
  const r = await pool.query('SELECT * FROM translation_jobs WHERE id=$1', [id])
  return r.rows[0] ?? null
}

// Race-sicherer Statusübergang: UPDATE greift nur, wenn der Ist-Status noch der
// erwartete ist (WHERE status=$3) — zwei konkurrierende Freigaben können nie
// beide „gewinnen". Verbotene Übergänge werfen TranslationTransitionError.
export async function transitionTranslationJob(pool, id, nextStatus, meta = {}) {
  const row = await getTranslationJob(pool, id)
  if (!row) return null
  const allowed = ALLOWED_STATUS_TRANSITIONS[row.status] ?? []
  if (!allowed.includes(nextStatus)) throw new TranslationTransitionError(row.status, nextStatus)
  const isReviewStep = nextStatus === 'approved' || nextStatus === 'rejected'
  const r = await pool.query(
    `UPDATE translation_jobs
        SET status=$2, updated_at=now(),
            review_notes = COALESCE($4, review_notes),
            reviewed_by  = CASE WHEN $5 THEN $6 ELSE reviewed_by END,
            reviewed_at  = CASE WHEN $5 THEN now() ELSE reviewed_at END
      WHERE id=$1 AND status=$3
      RETURNING *`,
    [id, nextStatus, row.status, meta.reviewNotes ?? null, isReviewStep, meta.reviewedBy ?? null],
  )
  if (!r.rows[0]) throw new TranslationTransitionError(`${row.status} (concurrently changed)`, nextStatus)
  return r.rows[0]
}
