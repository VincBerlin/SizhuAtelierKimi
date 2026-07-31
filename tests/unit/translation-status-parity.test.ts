/**
 * Paritätstest TS-Domäne ↔ Server-JS-Spiegel — T-C01/T-C02/T-C04 der
 * CJK-Migration (Muster: Preis-Paritätstest productTypes ↔ pricing.js).
 * Driftet eine Seite (Statusmodell, Zielsprachen, Modi), wird es hier rot.
 */
import { describe, it, expect } from 'vitest'
import {
  ALLOWED_STATUS_TRANSITIONS as TS_TRANSITIONS,
  TARGET_LANGUAGES as TS_TARGETS,
  TRANSLATION_MODES as TS_MODES,
  TRANSLATION_STATUSES,
  PRINTABLE_STATUS,
} from '@/lib/translationTypes'
import { ALLOWED_STATUS_TRANSITIONS as JS_TRANSITIONS } from '../../server/translationStore.js'
import {
  TARGET_LANGUAGES as JS_TARGETS,
  TRANSLATION_MODES as JS_MODES,
  TEXT_LIMITS,
} from '../../server/translationValidation.js'

describe('Übersetzungs-Domäne: TS ↔ Server-JS Parität', () => {
  it('Statusübergänge identisch', () => {
    expect(JS_TRANSITIONS).toEqual(TS_TRANSITIONS)
  })

  it('Zielsprachen identisch', () => {
    expect([...JS_TARGETS]).toEqual([...TS_TARGETS])
  })

  it('Modi identisch, und jeder Modus hat eine Textgrenze', () => {
    expect([...JS_MODES]).toEqual([...TS_MODES])
    for (const mode of TS_MODES) {
      expect(TEXT_LIMITS[mode]).toBeGreaterThan(0)
    }
  })

  it('jeder Status hat definierte (ggf. leere) Übergänge; printed ist terminal', () => {
    expect(Object.keys(TS_TRANSITIONS).sort()).toEqual([...TRANSLATION_STATUSES].sort())
    expect(TS_TRANSITIONS.printed).toEqual([])
    expect(PRINTABLE_STATUS).toBe('approved')
  })
})
