# Gap Closure Report — SizhuAtelier Desenio Exact Architecture

Feature Slug: `sizhuatelier-desenio-exact-architecture`
Branch: `feat/desenio-exact-architecture` (off `2943fb8`)
Status: **architecture correction in progress** (NOT complete, NOT launch, NOT production — REQ-036)
Confirmed: 2026-07-01 (user chose "Bestätigen & M9 starten"); sizes = A3/A2/A1 **non-final** (OQ-001 RED).

This is the living evidence ledger the PRD demands (EV-006 / REQ-035). Every gap
must reach `CLOSED` with a machine-checkable evidence path before any completion
claim. No row may be laundered to CLOSED without the named evidence existing.

## Legend
`OPEN` = not built · `IN-PROGRESS` = building · `TEST-GREEN` = unit/DOM proof exists ·
`CLOSED` = TEST-GREEN **and** real-browser/screenshot evidence exists ·
`RED-CARRY` = blocked on an operator-owned input (real sizes/assets/prices/reviews/chromium).

## Milestone → Requirement → Evidence

| Milestone | REQs | Gap it closes | Evidence artifact (target) | Status |
|---|---|---|---|---|
| **M9** Supersession & Taxonomy | REQ-001, REQ-008(data), REQ-009..012(data) | Stale docs superseded; canonical taxonomy data model (world/style/room/size/set/campaign); no fake sizes | `src/lib/taxonomy.ts` + `tests/unit/exact-taxonomy.test.ts` | **IN-PROGRESS** |
| **M10** Nav & Mega-Menu Matrix | REQ-004, REQ-005, REQ-006, REQ-007, REQ-013 | Desktop mega-menu matrix + mobile drawer taxonomy + visual tiles | `Navbar.tsx` renders taxonomy matrix; `exact-nav-matrix.test.tsx` + migrated `mega-menu`/`tiles`/`inspiration` tests; renderToStaticMarkup smoke 38/0 green in-sandbox; real-browser screenshots (EV-001/EV-002) → RL-CHROMIUM | **TEST-GREEN** (jsdom run + screenshots on dev machine) |
| **M11** Homepage Full Sequence | REQ-003, REQ-014..021, REQ-023, REQ-024 | Full target sequence; remove old below-fold V2 chain; unify campaign row; add New Arrivals; Trust standalone | Home.tsx restructured to target order (hero→bestseller→category→editorial→new-arrivals→campaign-row→inspiration→seo→trust→newsletter); new CampaignBannerRow/NewArrivalsSection/TrustSection; `exact-home-sequence.test.tsx` + migrated coupled tests; renderToStaticMarkup Home smoke 18/0 in-sandbox; screenshots (EV-003) → RL-CHROMIUM | **TEST-GREEN** (jsdom + screenshots on dev machine) |
| **M12** Collection Template & Filters | REQ-025, REQ-026, REQ-027, REQ-031 | Category toolbar + filter matrix (style/room/size/price) + count/pagination | `Collection.tsx` filter matrix (style/room/price functional, size NON-FINAL/OQ-001 → personalizable); `exact-collection-filters.test.tsx`; renderToStaticMarkup collection smoke 19/0 in-sandbox; screenshots (EV-004) → RL-CHROMIUM | **TEST-GREEN** (jsdom + screenshots on dev machine); size axis PARTIAL/non-final |
| **M13** PDP Size/Commerce | REQ-008, REQ-028, REQ-029, REQ-030 | Size selector on ALL PDPs, size→price, BaZi-only gate kept | `ProductView.tsx` standalone size selector for non-personalizable PDPs (non-final/OQ-001) → drives price via the UNCHANGED server money path (server/pricing.js already prices size for any poster id); BaZi gate preserved; `exact-pdp-size.test.tsx`; renderToStaticMarkup PDP+money-path smoke 17/0 in-sandbox; screenshots (EV-005) → RL-CHROMIUM | **TEST-GREEN** (jsdom + screenshots on dev machine); size availability PARTIAL/non-final |
| **M14** Mobile Commerce Repair | REQ-007, REQ-027, REQ-033, REQ-034 | Mobile shell, drawer, sliders, 1–2 col grids, 360/390/430 proof | Playwright mobile matrix 360/390/430 (EV-002) | OPEN · RED-CARRY (RL-CHROMIUM) |
| **M15** Trust/Newsletter/Footer/Evidence | REQ-002, REQ-022, REQ-032, REQ-035, REQ-036 | Honest trust/footer/newsletter; no-fake sweep; this report closed | no-dead-link + no-fake-content sweep, gap report closed (EV-006) | OPEN |

## Standing RED carries (operator-owned, launch-blocking — never laundered)
- **OQ-001** real production poster sizes/prices → size taxonomy stays `non-final` (A3/A2/A1 interim).
- **OQ-002** real product/banner/tile assets → mega tiles + banners stay asset-light placeholders.
- **OQ-003** final regional price table + shipping integration.
- **OQ-004** real review source → reviews stay OFF (service badges only).
- **OQ-005 / RL-CHROMIUM** real-browser + mobile 360/390/430 screenshot evidence (needs a machine where vite/chromium run; the sandbox does not boot vite).
- **OQ-006** (NEW, M9) no backing product for **REQ-010 "Meridian/Organ Clock"** (style) or **REQ-012 "TCM Organ Clock"** (campaign). These MUST sub-requirements are **DEFERRED, not dropped**: they are omitted from `src/lib/taxonomy.ts` rather than fabricated (STOP-001/RISK-002). **REQ-010 and REQ-012 are therefore PARTIAL** — all other styles/campaigns delivered; organ-clock/meridian OPEN pending an **operator decision**: create a real Organ-Clock/Meridian product/collection, or amend the spec to drop it. A future organ/meridian taxonomy entry MUST be `nonFinal`+OQ-006 (test-guarded), never faked launch-final.
- Carried from delta: **RL-STRIPE** (integration-fake), **RL-BAZI** (placeholder chart, `bazi.ts` protected).

## Protected surfaces (out of scope unless explicitly added per-milestone)
`src/components/InkWave.tsx` (Hero, VIS-032 — only mobile-clipping fixes) · `src/lib/bazi.ts` (VIS-033 — read-only; size list is referenced, never mutated).
