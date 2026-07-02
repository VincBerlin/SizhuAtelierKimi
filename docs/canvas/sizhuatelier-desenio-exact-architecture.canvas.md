# Product Canvas: SizhuAtelier Desenio Exact Architecture

Status: `user-confirmed`  (2026-07-01 — user chose "Bestätigen & M9 starten" in the AgileTeam confirmation gate, defined there as the confirmation; supersedes the desenio-delta package)  
Feature Slug: `sizhuatelier-desenio-exact-architecture`  
Mode: `PLUMBLINE_READY_PACKAGE`  
Readiness-Level: `READY_FOR_USER_CONFIRMATION`

## 1. Source Map

| Source ID | Source Kind | Summary | Source Type |
|---|---|---|---|
| SRC-DES-LIVE-001 | Live Desenio Extraction 2026-07-01 | Desenio global header: locale, utility bar, checkout shortcut, logo, primary nav, search/cart icons; poster mega-menu with quick access, topics, rooms, sizes, sets, trends, visual tiles. | EXPLICIT |
| SRC-DES-LIVE-002 | Live Desenio Homepage 2026-07-01 | Homepage order: campaign hero, bestseller slider, visual banners, editorial/featured block, new arrivals slider, second banner row, atelier/story, SEO, reviews, trust, newsletter, footer. | EXPLICIT |
| SRC-DES-LIVE-003 | Live Desenio Collection 2026-07-01 | Collection contract: category navigation, filters, sorting, breadcrumb, H1, intro, product grid, load more, product count, pagination, SEO. | EXPLICIT |
| SRC-DES-REF-001 | Local Desenio Architecture Extraction | Prior extracted architecture file with Global Shell, Main Nav, Mega Menu Matrix, Homepage, Collection, PDP, Product Card, Trust, Newsletter and Footer contracts. | EXPLICIT |
| SRC-SIZ-CURRENT-001 | Current SizhuAtelier Architecture Snapshot | `feat/desenio-delta` snapshot documents only above-fold reorder and unchanged below-fold V2 sequence, plus current routes/components/RED carries. | EXPLICIT |
| SRC-OLD-PRD-001 | Previous Desenio Delta PRD | Previous PRD already required complete home target sequence and broad navigation/collection/mobile/trust requirements, but did not encode full Desenio matrix granularly enough. | EXPLICIT |
| SRC-OLD-VIS-001 | Previous Desenio Delta Vision | Previous vision required shop-oriented architecture, complete home sequence, intent-based mega-menus, mobile stability and trust boundaries. | EXPLICIT |
| SRC-OLD-CAN-001 | Previous Desenio Delta Canvas | Previous canvas required conversion-oriented poster-shop architecture, mobile-first UX, region/currency, color and trust cleanup. | EXPLICIT |
| SRC-USER-001 | User Direction | User clarified that the intended outcome is structural equivalence to Desenio architecture, setup and build pattern for SizhuAtelier, not a partial delta or generic inspiration. | EXPLICIT |

## 2. Problem

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Problem | CAN-001 | The current SizhuAtelier implementation is not structurally equivalent to Desenio. It contains useful technical deltas, but the final commerce architecture is incomplete: mega-menu matrix, poster sizes, homepage full sequence, collection contract, PDP size/format logic, mobile shell and evidence gates are not fully closed. | EXPLICIT | SRC-SIZ-CURRENT-001, SRC-USER-001 |
| Problem | CAN-002 | Prior artifacts were broad enough to imply the desired direction, but not sharp enough to prevent a partial implementation being treated as complete. | EXPLICIT | SRC-OLD-PRD-001, SRC-USER-001 |

## 3. Users / Customers

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Users / Customers | CAN-003 | Poster buyers who browse by bestseller, new arrivals, product world, theme/style, room/use, size/format, set solution or campaign. | EXPLICIT | SRC-DES-LIVE-001 |
| Users / Customers | CAN-004 | BaZi buyers who need personalization only where it is valid. | EXPLICIT | SRC-OLD-PRD-001 |
| Users / Customers | CAN-005 | TCM/Wuxing/Fire Horse buyers who need non-personalized PDPs and standard purchase paths. | EXPLICIT | SRC-OLD-PRD-001 |
| Users / Customers | CAN-006 | Mobile buyers who need drawer taxonomy, swipeable sliders, 1–2 column lists, filter sheets and reachable cart/search. | EXPLICIT | SRC-USER-001 |

## 4. Value Promise

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Value Promise | CAN-007 | SizhuAtelier will behave like a mature poster commerce shop structurally: easy discovery, deep taxonomy, proper size and format buying paths, credible collection pages, sales-ready PDPs and clear mobile commerce UX — with SizhuAtelier's own products and brand. | EXPLICIT | SRC-USER-001, SRC-DES-LIVE-001 |

## 5. Current Alternatives

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Current Alternative | CAN-008 | Keeping M1–M8 as final: technically improved, but structurally incomplete and misleading if called Desenio-equivalent. | EXPLICIT | SRC-SIZ-CURRENT-001, SRC-USER-001 |
| Current Alternative | CAN-009 | Full redesign from scratch: unnecessary because existing stack, routes, store and product logic can be extended. | ASSUMPTION | SRC-OLD-CAN-001 |

## 6. Key Capabilities

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Key Capability | CAN-010 | Full global commerce shell: locale, promo bar, header, purchase nav, search, cart and mega-menu layers. | EXPLICIT | SRC-DES-LIVE-001 |
| Key Capability | CAN-011 | Exact primary nav: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote, Poster Sets, Inspiration. | EXPLICIT | SRC-USER-001, SRC-DES-LIVE-001 |
| Key Capability | CAN-012 | Mega-menu matrix: quick access, product world/type, theme/style, room/use, size/format, sets/solutions, trends/campaigns, visual tiles. | EXPLICIT | SRC-DES-LIVE-001 |
| Key Capability | CAN-013 | Poster sizes/formats as first-class architecture across nav, collection and PDP. | EXPLICIT | SRC-DES-LIVE-001, SRC-DES-LIVE-003 |
| Key Capability | CAN-014 | Full homepage sequence: Hero, Bestseller, category banners, Atelier/Editorial, New Arrivals, campaign banners, Inspiration, SEO, Trust, Newsletter, Footer. | EXPLICIT | SRC-DES-LIVE-002 |
| Key Capability | CAN-015 | Complete collection template and filter matrix. | EXPLICIT | SRC-DES-LIVE-003 |
| Key Capability | CAN-016 | Complete PDP template with gallery, size/format selector, price, add-to-cart, trust, details, cross-sell and personalization/review gates. | EXPLICIT | SRC-DES-REF-001 |
| Key Capability | CAN-017 | Mobile commerce architecture: mobile shell, drawer taxonomy, swipe sliders, filter sheets, 1–2 column product layouts, reachable cart/search. | EXPLICIT | SRC-DES-REF-001, SRC-USER-001 |
| Key Capability | CAN-018 | Honest trust architecture: no fake reviews, no credits, no patron, no coming soon, no launch-final placeholder assets. | EXPLICIT | SRC-OLD-PRD-001 |
| Key Capability | CAN-019 | Evidence gating and gap closure report for every requirement. | EXPLICIT | SRC-USER-001 |

## 7. Non-Goals

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Non-Goal | CAN-020 | No copying of Desenio copy, images, logos, product names, marks or protected assets. | EXPLICIT | SRC-DES-LIVE-001 |
| Non-Goal | CAN-021 | No technical full rebuild. | EXPLICIT | SRC-OLD-CAN-001 |
| Non-Goal | CAN-022 | No change to InkWave Hero concept. | EXPLICIT | SRC-OLD-VIS-001 |
| Non-Goal | CAN-023 | No fake reviews, fake discounts, fake bought counts, credits, patron fold or coming-soon surfaces. | EXPLICIT | SRC-OLD-PRD-001 |

## 8. Constraints

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Constraint | CAN-024 | Existing stack and server-authoritative money path remain. | EXPLICIT | SRC-SIZ-CURRENT-001 |
| Constraint | CAN-025 | Real assets, real prices, real reviews and real BaZi math are not provided by these artifacts and remain RED until separately supplied and verified. | EXPLICIT | SRC-SIZ-CURRENT-001 |
| Constraint | CAN-026 | Size taxonomy must not fake unavailable production formats. | EXPLICIT | SRC-USER-001 |

## 9. Risks

| Section | ID | Value | Mitigation | Source Type |
|---|---|---|---|---|
| Risk | RISK-001 | Claude may again treat a partial implementation as complete. | Add supersession, explicit removal rules, stop conditions and gap closure evidence. | EXPLICIT |
| Risk | RISK-002 | Size paths may be filled with invented formats. | Require real catalog/fulfillment source; mark interim sizes as non-final. | EXPLICIT |
| Risk | RISK-003 | Asset-light tiles may look like real products. | Enforce `data-placeholder` and non-final visual treatment until assets exist. | EXPLICIT |
| Risk | RISK-004 | Mobile may still compress desktop nav. | Require 360/390/430 screenshot matrix and DOM assertions. | EXPLICIT |

## 10. Success Signals

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Success Signal | CAN-027 | Primary nav and mega-menu matrix match the canonical taxonomy on desktop and mobile. | EXPLICIT | SRC-DES-LIVE-001 |
| Success Signal | CAN-028 | Size/format exists in mega-menu, collection filters and PDP selector. | EXPLICIT | SRC-DES-LIVE-001, SRC-DES-LIVE-003 |
| Success Signal | CAN-029 | Homepage no longer contains the old below-fold V2 chain as the primary sequence. | EXPLICIT | SRC-SIZ-CURRENT-001 |
| Success Signal | CAN-030 | Collection and PDP pages pass structural acceptance tests. | EXPLICIT | SRC-DES-LIVE-003, SRC-DES-REF-001 |
| Success Signal | CAN-031 | Gap Closure Report and evidence matrix exist before any completion claim. | EXPLICIT | SRC-USER-001 |

## 11. Evidence

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Evidence | EV-001 | Desktop header and mega-menu screenshots + DOM taxonomy test. | MISSING | SOURCE_NEEDED |
| Evidence | EV-002 | Mobile drawer screenshots 360/390/430 + no compressed desktop nav test. | MISSING | SOURCE_NEEDED |
| Evidence | EV-003 | Homepage DOM order + screenshots for full sequence. | MISSING | SOURCE_NEEDED |
| Evidence | EV-004 | Collection template screenshots + filter/sort/count/pagination tests. | MISSING | SOURCE_NEEDED |
| Evidence | EV-005 | PDP size selector and sales structure screenshots/tests. | MISSING | SOURCE_NEEDED |
| Evidence | EV-006 | Gap Closure Report mapping GAP → REQ → AC → evidence path. | MISSING | SOURCE_NEEDED |

## 12. Allowed Change Scope

| Section | ID | Value | Source Type | Source |
|---|---|---|---|---|
| Allowed Scope | CAN-032 | Navigation, mega-menus, mobile drawer, header search/cart/locale, homepage modules, collection templates, PDP structure, product cards, filter data models, size/format taxonomy, trust/newsletter/footer and tests/evidence. | EXPLICIT | SRC-USER-001, SRC-OLD-CAN-001 |

## 13. User Confirmation

`pending-user-confirmation`

The assistant must not confirm this canvas. For AgileTeam planning, the user must type:

```text
Ich bestätige, dass Product Canvas und Product Vision meine Absicht korrekt wiedergeben und als Grundlage für AgileTeam Planning verwendet werden dürfen.
```
