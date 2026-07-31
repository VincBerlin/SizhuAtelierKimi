// Übersetzungs-Preview + -Confirm — T-C03 der CJK-Migration (V3 §6.1/§6.2).
//
// Ehrlichkeitsregeln:
//  - KEIN Provider konfiguriert (GATE-PROVIDER, `provider-unselected`) → 503.
//    Es gibt keinen stillen Fallback und keine erfundenen Übersetzungen.
//  - Provider-Fehler → 502 mit Fehlercode; niemals Ersatz-Kandidaten.
//  - Modus `customer-cjk` braucht keinen Provider: der Kunde liefert den Text,
//    der Server validiert nur (Skript/Länge) — der einzige „Kandidat" ist der
//    eigene Text.
//  - Kundentexte erscheinen nie in Logs (Datenschutz, V3 §7).
//
// Verdrahtung: server/index.js ruft mountTranslationRoutes(app, getDeps) mit
// einem Getter, der pool/provider/rateLimited zur REQUEST-Zeit liest — gleiches
// Muster wie die übrigen injizierbaren Externals (createApp-Override).

import { randomUUID, createHash } from 'node:crypto'
import { validateSourceInput, validateCustomerCjk } from './translationValidation.js'
import { createTranslationJob } from './translationStore.js'

// Default bis zum Benchmark-Entscheid (T-C07): bewusst NICHT konfiguriert.
export const providerUnselected = {
  enabled: () => false,
  name: 'provider-unselected',
  version: null,
  async translatePreview() {
    throw new Error('translation provider not configured (GATE-PROVIDER)')
  },
}

// Serverseitiger Preview-Cache über den normalisierten Input-Hash (V3 §6.2).
const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_MAX = 500
const cache = new Map()

function cacheKey(mode, target, scriptVariant, normalized) {
  return createHash('sha256').update(`${mode}|${target}|${scriptVariant || ''}|${normalized}`).digest('hex')
}

function cacheGet(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.value
}

function cacheSet(key, value) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value)
  cache.set(key, { at: Date.now(), value })
}

export function clearTranslationCache() {
  cache.clear()
}

export function mountTranslationRoutes(app, getDeps) {
  app.post('/api/translation/preview', async (req, res) => {
    const { provider, rateLimited } = getDeps()
    if (rateLimited(req, 'translation-preview', 30, 60000)) return res.status(429).json({ error: 'rate_limited' })

    const { sourceText, sourceLanguage, target, mode, scriptVariant } = req.body || {}
    const v = validateSourceInput({ sourceText, mode, target })
    if (!v.ok) return res.status(400).json({ error: v.errors[0], errors: v.errors })

    // Modus C: eigener CJK-Text des Kunden — Validierung statt Übersetzung.
    if (mode === 'customer-cjk') {
      const c = validateCustomerCjk(v.normalized, target)
      if (!c.ok) return res.status(400).json({ error: c.error, errors: [c.error] })
      return res.json({
        requestId: `tr_${randomUUID()}`,
        status: 'draft',
        target,
        mode,
        scriptVariant: scriptVariant || undefined,
        candidates: [{ id: 'self', text: v.normalized }],
        provider: null,
        providerVersion: null,
        warnings: [],
      })
    }

    if (!provider || !provider.enabled()) {
      return res.status(503).json({ error: 'translation_unavailable', status: 'provider-unselected' })
    }

    const key = cacheKey(mode, target, scriptVariant, v.normalized)
    let result = cacheGet(key)
    if (!result) {
      try {
        const r = await provider.translatePreview({
          sourceText: v.normalized,
          sourceLanguage: sourceLanguage || null,
          target,
          mode,
          scriptVariant: scriptVariant || null,
        })
        result = {
          candidates: Array.isArray(r?.candidates) ? r.candidates : [],
          warnings: Array.isArray(r?.warnings) ? r.warnings : [],
          provider: provider.name,
          providerVersion: provider.version ?? null,
        }
        if (!result.candidates.length) throw new Error('provider returned no candidates')
        cacheSet(key, result)
      } catch {
        // Kein Kundentext im Log — nur die Tatsache des Fehlers.
        console.error('[translation] preview failed (provider error)')
        return res.status(502).json({ error: 'translation_failed' })
      }
    }

    return res.json({
      requestId: `tr_${randomUUID()}`,
      status: 'draft',
      target,
      mode,
      scriptVariant: scriptVariant || undefined,
      candidates: result.candidates,
      provider: result.provider,
      providerVersion: result.providerVersion,
      warnings: result.warnings,
    })
  })

  // Kunde bestätigt eine Variante → Job wird mit `customer_selected` persistiert.
  // Erst DIESER Schritt schreibt Kundentext in die Datenbank (Datenminimierung).
  app.post('/api/translation/confirm', async (req, res) => {
    const { pool, rateLimited } = getDeps()
    if (rateLimited(req, 'translation-confirm', 30, 60000)) return res.status(429).json({ error: 'rate_limited' })
    if (!pool) return res.status(503).json({ error: 'store_unavailable' })

    const b = req.body || {}
    const v = validateSourceInput({ sourceText: b.sourceText, mode: b.mode, target: b.target })
    if (!v.ok) return res.status(400).json({ error: v.errors[0], errors: v.errors })

    const finalCheck = validateSourceInput({ sourceText: b.finalText, mode: b.mode, target: b.target })
    if (!finalCheck.ok) return res.status(400).json({ error: 'invalid_final_text', errors: finalCheck.errors })
    if (b.mode === 'customer-cjk') {
      const c = validateCustomerCjk(finalCheck.normalized, b.target)
      if (!c.ok) return res.status(400).json({ error: c.error, errors: [c.error] })
    }
    if (typeof b.selectedCandidateId !== 'string' || !b.selectedCandidateId) {
      return res.status(400).json({ error: 'missing_candidate_id' })
    }

    try {
      const job = await createTranslationJob(pool, {
        sourceText: v.normalized,
        sourceLanguage: b.sourceLanguage ?? null,
        targetLanguage: b.target,
        scriptVariant: b.scriptVariant ?? null,
        mode: b.mode,
        candidates: Array.isArray(b.candidates) ? b.candidates : [],
        selectedCandidate: {
          id: b.selectedCandidateId,
          text: finalCheck.normalized,
          romanization: b.romanization ?? null,
        },
        provider: b.mode === 'customer-cjk' ? null : (b.provider ?? null),
        providerVersion: b.mode === 'customer-cjk' ? null : (b.providerVersion ?? null),
      })
      return res.status(201).json({ jobId: job.id, translationStatus: job.status })
    } catch {
      console.error('[translation] confirm failed (store error)')
      return res.status(500).json({ error: 'store_failed' })
    }
  })
}
