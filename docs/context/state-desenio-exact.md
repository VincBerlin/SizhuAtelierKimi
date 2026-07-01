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
| M9 | Supersession & Taxonomy | done | ✅ pass | ✅ 228/0 esbuild + tsc | ✅ scope 12 | ✅ committed 2f1acb8 | `src/lib/taxonomy.ts` + gate test + doc supersession + scope.json + gap-closure |
| M10 | Nav & Mega-Menu Matrix | done | ✅ pass | ✅ tsc 0 + smoke 38/0 | ✅ scope 10 | ✅ committed 28de8ac | Navbar taxonomy matrix desktop+mobile mirror; i18n×4; migrated nav tests |
| M11 | Homepage Full Sequence | done | ✅ pass | ✅ tsc 0 + home smoke 18/0 | ✅ scope 23 | ✅ committed 355ffc0 | Home target order; new CampaignBannerRow/NewArrivals/Trust; old V2 chain removed; deleted 5 orphaned sections + 2 superseded tests |
| M12 | Collection Template & Filters | done | ✅ pass | ✅ tsc 0 + coll smoke 19/0 | ✅ scope 4 | ✅ committed b7aad7d | Collection filter matrix style/room/price functional + size NON-FINAL; empty-state honesty; facet labels via M10 i18n |
| M13 | PDP Size/Commerce | done | pending | ✅ tsc 0 + pdp+money smoke 17/0 | pending | pending | Standalone size selector on non-personalizable PDPs (non-final OQ-001) → drives price via UNCHANGED server/pricing.js (already prices size for any poster id); BaZi gate preserved; new exact-pdp-size test. NO money-path edit |
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
