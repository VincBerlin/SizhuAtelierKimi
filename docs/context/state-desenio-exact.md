# State Ledger — SizhuAtelier Desenio Exact Architecture

Feature: `sizhuatelier-desenio-exact-architecture` · Branch: `feat/desenio-exact-architecture` (off `2943fb8`)
Mode: `/agileteam` Plumbline, ultracode. Per-milestone: build → independent review → QA → Watcher scope-check → **user reviews before commit**.

## Confirmation gate (Development entry condition)
- Canvas: **user-confirmed** 2026-07-01 · PRD: **user-confirmed** 2026-07-01 · Vision: **user-confirmed** 2026-07-01
  (user chose "Bestätigen & M9 starten" in the AgileTeam confirmation gate, which the prompt defined as the confirmation).
- STOP-001 (poster sizes): resolved to **A3/A2/A1 as non-final** (OQ-001 stays RED); no invented formats.
- Standing directive: **no push/deploy/PR/merge/production-claim** without a fresh explicit user word. (The prior `feat/desenio-delta` was pushed 2026-07-01 on explicit request; this new branch is local-only until the user says otherwise.)

## Milestone ledger
| M | Name | Build | Review | QA | Watcher | User commit | Notes |
|---|---|---|---|---|---|---|---|
| M9 | Supersession & Taxonomy | done | pending | pending | pending | pending | `src/lib/taxonomy.ts` + `tests/unit/exact-taxonomy.test.ts` + doc supersession + scope.json + gap-closure report |
| M10 | Nav & Mega-Menu Matrix | — | — | — | — | — | reads taxonomy.ts |
| M11 | Homepage Full Sequence | — | — | — | — | — | replaces below-fold V2 chain |
| M12 | Collection Template & Filters | — | — | — | — | — | filter matrix incl. size |
| M13 | PDP Size/Commerce | — | — | — | — | — | size selector on all PDPs |
| M14 | Mobile Commerce Repair | — | — | — | — | — | 360/390/430 evidence (RL-CHROMIUM) |
| M15 | Trust/Newsletter/Footer/Evidence | — | — | — | — | — | gap-closure report closed |

## Sandbox note
vite dev + chromium do NOT boot here; jsdom vitest workers hang under load. Run the authoritative
suite + real-browser evidence on the user's machine. Node-env unit tests (taxonomy) run via
`node ./node_modules/vitest/vitest.mjs run <file> --environment=node --pool=forks --isolate=false`.

## Reality Ledger
0 production-verified. RED carries: OQ-001 sizes, OQ-002 assets, OQ-003 prices/shipping, OQ-004 reviews,
OQ-005/RL-CHROMIUM real-browser+mobile evidence, RL-STRIPE, RL-BAZI. See
`docs/reality/sizhuatelier-desenio-exact-architecture.gap-closure.md`.
