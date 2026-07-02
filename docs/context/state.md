# AgileTeam Run State — `sizhuatelier-webshop-architecture-v2`

- **Mode:** CORE (Plumbline executable gates/hooks/templates absent in repo → gates run as disciplined manual process; reported honestly)
- **Model:** Opus 4.8 (1M) — GBrain-class real-boundary safety net covered.
- **Branch:** `feat/personalization-first-mvp`
- **Scope decision:** Conformance/gap-closing pass on existing custom-stack shop (NOT a rebuild).
- **Start-state:** was `VISION_MISSING` → Canvas now confirmed.
- **Enforcement:** PRIL Stop-hook marker stood down by user choice 2026-06-22 (repo not provisioned for PRIL; the whole-branch scope gate can't separate this run's changes from prior committed work). Gates run CORE-manual + reported honestly.
- **Plan:** M=4 iterations, 23 tasks. acceptance: `docs/tests/acceptance-design.md`; plan: `docs/plans/2026-06-22-sizhuatelier-webshop-architecture-v2.md`.

## Gate ledger
| Gate / Phase | Status | Note |
|---|---|---|
| 0.0 Orientation | CLEARED | Plumbline explained (DE) |
| 0.15 Product Canvas | **CLEARED** | re-confirmed 2026-06-22 after council amendments A–E |
| 0.16 Council challenge | **CLEARED** | ran (8 agents, R2); user steered: Geburtsort→honest, Priorität→"Alles zusammen". Amendments A–E folded into Canvas. |
| 0.2 PRD | **CLEARED** | 18 REQ / 23 atomic tasks; Status user-confirmed 2026-06-22 |
| 0.3 Bounded brainstorm gaps | **CLEARED** | product-critical gaps closed; rest = non-code-blocking content TODOs |
| 0.4 Product Vision | **CLEARED** | Status user-confirmed 2026-06-22 |
| 0.5 PRD+Vision confirm | **CLEARED** | both user-confirmed; ADR-001/002 recorded |
| 0.7 Spec-sanity | **CLEARED** | spec-auditor ultrathink (once); 0 unverified claims; 1 remediation pass; spec FROZEN |
| Vision GO gate | **CLEARED** | explicit "GO" given 2026-06-22; .active-feature armed |
| 1 TDD & QA setup | **CLEARED** | M=4 iterations, 23 tasks; acceptance-design.md + plan written |
| 2 Dev/review loop | **IN PROGRESS** | Iter 1/4 ✅ · Iter 2/4 ✅ · Iter 3/4 ✅ DONE (data model additive + 8 collection routes + mega-menu + inspiration, all reachable via App.tsx; Watcher pass; 236/236 deterministic, build green). **Iter 4/4 (Homepage & Abschluss) IN PROGRESS** (T-18..T-22). NO commits until end. |
| 3 Verify/security/validation/judgment | BLOCKED until GO | — |
| 4 QA / customer-value | BLOCKED until GO | — |
| 5 Production validation | BLOCKED until GO | — |
| 6 Product Owner value gate | BLOCKED until GO | — |
| 7 User acceptance | BLOCKED until GO | — |

## Resolved decisions (user, 2026-06-22)
- OQ-SCOPE: conformance pass · OQ-001: custom stack · OQ-004: BaZi placeholder stays (RED-tracked) · OQ-005: legal out-of-run, TCM claim-review in-run.

## Scope after council (union — "Alles zusammen")
SECURITY: server-side re-pricing (productId+variant, ADR-001) + shipping. HONESTY: keep place/date/time
as genuine inputs passed through for the PLANNED chart API (ADR-002), NOT placeholder-varies; 12:00 noon
fallback disclosed (REQ-018); copy reframe + TCM claim sweep + DE/FR legal localization. V2 CONFORMANCE
(full): module order 1–13 (no hero/LCP regression), real mega-menu, per-world collection routes,
Inspiration page, home SEO block. TESTS: money-path & truthful-claims first, then conformance.

## Reality Ledger seed (RED items to keep in every report)
- `bazi-chart`: placeholder math stays — RED for ACCURACY until the planned API is wired. Inputs
  (place/date/time + birthTimeUnknown) are passed through for that API; honest copy + noon-fallback
  disclosure close the UWG discard-deception (NOT by varying the placeholder image).
- `checkout-repricing`: ✅ FIXED + tested (server-authoritative; client `unitAmount`/`shippingCents` ignored; unknown product→400; price parity coupled to client sources, drift→red proven). Evidence `integration-fake` (Stripe SDK stubbed) → RED-for-confidence until production-verified vs live Stripe (`BLK-STRIPE-REAL`, out-of-run).
- `tests`: ✅ 139 passing, runner exit 0 (money-path + parity + truthful-claims EN/DE/FR scans + passthrough + noon/legal render). Mutation testing not yet run. Real-browser Playwright E2E authored but NOT executed in sandbox (chromium build missing) → REQ-007/018 real-boundary = PLANNED; jsdom real-component render is the runnable evidence.
- `truthful-claims` (Iter 2): ✅ honest copy EN/DE/FR (no "chart is calculated" claim; forbidden-list fails-closed in all 3 locales); inputs place/date/time/birthTimeUnknown reach the checkout payload; 12:00 noon disclosed; no healing claims; DE/FR legal wired+localized ([MISSING] operator markers kept).
- Iteration-1 reality ledger: `docs/reality/sizhuatelier-webshop-architecture-v2.evidence.jsonl`. NOTE: Iter-2/3/4 evidence + traceability rows to be consolidated by context-keeper before the Phase-3/acceptance gate (all production_verified must stay false).

## Commit checklist (for the END only — user commits)
- ⚠️ `tests/` is UNTRACKED in git (never committed, not gitignored) → MUST `git add tests/` at the final commit or the whole suite is lost.
- New untracked source: `src/lib/personalization.ts`, `src/lib/productTypes.ts`, `src/lib/collections.ts`, `src/pages/Collection.tsx`, `src/pages/Inspiration.tsx`, `server/pricing.js`, configs (`vitest.config.ts`, `playwright.config.ts`), `docs/**`.
- Real-browser Playwright specs exist but were never executed (chromium absent) — run `npx playwright install && npx playwright test` in a real env before launch to lift REQ-007/008/009/010/011/017/018 from jsdom-real to browser-verified.
