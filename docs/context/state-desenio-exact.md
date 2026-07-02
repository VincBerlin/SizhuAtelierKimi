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
| M13 | PDP Size/Commerce | done | ✅ APPROVE | ✅ tsc 0 + pdp smoke 17/0 + parity 48/0 | ✅ scope 6 | ✅ committed 89fcbc0 | Size selector on all PDPs → price via UNCHANGED server (comment-only fix); BaZi gate; parity loops all posters×size |
| M14 | Mobile Commerce Repair | spec authored | — | ⚠️ evidence RL-CHROMIUM (dev machine) — tsc 0 + playwright --list 40 tests valid | ✅ scope 3 | ✅ committed ad97b57 | `mobile-commerce.spec.ts` 40 tests × 360/390/430. Stop-gate = real-browser → user's machine only |
| M15 | Trust/Newsletter/Footer/Evidence | done | ✅ pass | ✅ tsc 0 + M15 smoke 42/0 | ✅ scope | ✅ committed 3087843 | Footer regrouped (service/discover/legal + locale/payment/shipping, no fake social); newsletter shop-first ×4 (Cosmic secondary); capstone `exact-reality-ledger.test.ts` (RED-carries + no-completion-claim + no-fake + sizes-non-final). Built on user "mach weiter" DESPITE M14 evidence still RED (no completion claim set) |
| RG | Whole-build re-gate | done | ✅ cross-milestone | ✅ tsc 0 + wholebuild smoke 51/0 | ✅ scope 7 | ✅ committed d4cbfcd | C1 delta-reality-ledger token coverage, I1 collection size filter removed (M13 consistency), I2 nav→filter docstring honesty, RL-SOCIAL tracked, stale comment fixed |
| M16 | nav→filter deep-link | done | pending | ✅ tsc 0 + hub smoke 13/0 (+ wholebuild 51/0) | pending | pending | `Kollektion.tsx` consumes ?style/?room → pre-filters all-posters grid + active-facet banner + reset; collection cards hidden while faceted; ?size disclosed non-narrowing (M13); new `exact-nav-filter-deeplink.test.tsx`; taxonomy docstrings flipped PARTIAL→wired; i18n×4 `coll.filter` |

## Sandbox note
vite dev + chromium do NOT boot here; jsdom vitest workers hang under load. Run the authoritative
suite + real-browser evidence on the user's machine. Node-env unit tests (taxonomy) run via
`node ./node_modules/vitest/vitest.mjs run <file> --environment=node --pool=forks --isolate=false`.

## Build-typecheck gate (corrected 2026-07-02)
`tsc --noEmit -p tsconfig.json` typechecks ~nothing (tsconfig.json is a references-only solution file).
The REAL gate is **`tsc -b`** (builds tsconfig.app.json, `noUnusedLocals`). A latent breakage — unused
value imports in `src/lib/taxonomy.ts` (TS6192/TS6133, comment-only references) — was RED under `tsc -b`
since ~M9 but missed by the weaker per-milestone check. Fixed 2026-07-02; `tsc -b` now 0 across M9–M16.
Also: `vite dev`, `vite build` AND the Tailwind CLI all HANG here (esbuild service/worker model); a
from-source browser preview was produced via single-process esbuild (the mode that works) + reused
Tailwind CSS, served on :5173 — headless-Chrome DOM confirmed the full app renders.

## Reality Ledger
0 production-verified. RED carries: OQ-001 sizes, OQ-002 assets, OQ-003 prices/shipping, OQ-004 reviews,
OQ-005/RL-CHROMIUM real-browser+mobile evidence, OQ-006 organ-clock/meridian, RL-STRIPE, RL-BAZI, RL-SOCIAL. See
`docs/reality/sizhuatelier-desenio-exact-architecture.gap-closure.md`.
