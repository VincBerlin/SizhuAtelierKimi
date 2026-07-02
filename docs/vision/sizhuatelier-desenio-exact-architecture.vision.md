# Product Vision: SizhuAtelier Desenio Exact Architecture

Status: `user-confirmed`  (2026-07-01 — user chose "Bestätigen & M9 starten" in the AgileTeam confirmation gate, defined there as the confirmation; supersedes the desenio-delta package)  
Feature Slug: `sizhuatelier-desenio-exact-architecture`  
Confirmation Status: `confirmed`  (2026-07-01, via AgileTeam confirmation gate)  
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

## 2. Supersession Statement

| ID | Statement | Source Type | Source |
|---|---|---|---|
| VIS-001 | This Product Vision supersedes the earlier partial Desenio Delta interpretation. If older artifacts allow only above-fold reorder, unchanged below-fold V2 structure, generic Collections mega-menu, omitted poster sizes, text-band campaign sections or launch-final placeholders, those instructions are invalid for this feature. | EXPLICIT | SRC-USER-001, SRC-SIZ-CURRENT-001 |
| VIS-002 | The intended outcome is structural equivalence to Desenio's architecture, setup and commerce build pattern, adapted to SizhuAtelier products and brand, without copying Desenio protected text, images, logos, product names or brand assets. | EXPLICIT | SRC-USER-001, SRC-DES-LIVE-001 |

## 3. Product Vision Statement

| Area | ID | Value | Source Type | Source | User Decision Needed |
|---|---|---|---|---|---|
| Product Vision Statement | VIS-003 | SizhuAtelier must become a structurally Desenio-equivalent poster commerce shop: same class of global commerce shell, purchase-intent navigation, deep mega-menu matrix, homepage funnel, collection template, PDP sales structure, mobile commerce behavior, trust/newsletter/footer architecture — translated into SizhuAtelier's own product worlds, own copy, own assets and own brand. | EXPLICIT | SRC-USER-001, SRC-DES-LIVE-001, SRC-DES-LIVE-002, SRC-DES-LIVE-003 | no |

## 4. Target Group

| Area | ID | Value | Source Type | Source | User Decision Needed |
|---|---|---|---|---|---|
| Target Group | VIS-004 | Buyers of personalized BaZi posters and non-personalized TCM, Wuxing, Fire Horse, compatibility, digital and set products who need clear commerce paths by product world, style, room/use, size/format, set solution and campaign. | EXPLICIT | SRC-USER-001 | no |
| Target Group | VIS-005 | Mobile buyers who need a true mobile commerce shell, not compressed desktop navigation, with reachable search, drawer taxonomy, cart, filters, PDP gallery and checkout path. | EXPLICIT | SRC-USER-001, SRC-OLD-VIS-001 | no |
| Target Group | VIS-006 | AgileTeam/Claude implementers who need unambiguous, testable architecture contracts and stop conditions so no partial delta is mistaken for Desenio-equivalence again. | EXPLICIT | SRC-USER-001 | no |

## 5. User Needs

| ID | Need | Source Type | Source |
|---|---|---|---|
| VIS-007 | Users need purchase-oriented primary navigation: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote, Poster Sets, Inspiration. | EXPLICIT | SRC-DES-LIVE-001, SRC-USER-001 |
| VIS-008 | Users need full mega-menu paths: quick access, product world/type, theme/style, room/use, size/format, sets/solutions, trends/campaigns and visual tiles. | EXPLICIT | SRC-DES-LIVE-001 |
| VIS-009 | Users need poster size/format as a visible path in navigation, collection filters and PDP size selection. | EXPLICIT | SRC-DES-LIVE-001, SRC-DES-LIVE-003 |
| VIS-010 | Users need homepage flow in commerce order: Hero, Bestseller, large category banners, Atelier/Editorial, New Arrivals, campaign banners, Inspiration, SEO, Trust, Newsletter and Footer. | EXPLICIT | SRC-DES-LIVE-002 |
| VIS-011 | Users need collection pages with breadcrumb, H1, intro, category toolbar, filter/sort, grid, count, pagination, SEO and trust. | EXPLICIT | SRC-DES-LIVE-003 |
| VIS-012 | Users need PDPs with gallery, size/format selection, price, add-to-cart, trust bullets, details, cross-sell, inspiration and no false personalization or fake reviews. | EXPLICIT | SRC-DES-REF-001, SRC-OLD-PRD-001 |
| VIS-013 | Users need non-personalized products to stay non-personalized and BaZi personalization to remain clearly scoped. | EXPLICIT | SRC-OLD-PRD-001 |
| VIS-014 | Users need no fake reviews, no credit system, no patron fold, no coming-soon surfaces and no launch-final looking placeholder images. | EXPLICIT | SRC-OLD-PRD-001, SRC-USER-001 |

## 6. Product Value

| Area | ID | Value | Source Type | Source | User Decision Needed |
|---|---|---|---|---|---|
| Product Value | VIS-015 | The exact architecture correction converts the shop from a technically functional MVP into a commerce-structured poster shop: discover by intent, narrow by taxonomy, compare in collections, select size on PDP, buy with trust. | EXPLICIT | SRC-USER-001, SRC-DES-LIVE-001 | no |
| Product Value | VIS-016 | The correction removes ambiguity caused by the prior partial delta: Claude must build the full architecture, not only a top-of-page reorder or generic navigation. | EXPLICIT | SRC-USER-001, SRC-SIZ-CURRENT-001 | no |

## 7. Business / Project Goals

| ID | Goal | Source Type | Source |
|---|---|---|---|
| VIS-017 | Implement the full global commerce shell and primary purchase nav. | EXPLICIT | SRC-DES-LIVE-001 |
| VIS-018 | Implement full mega-menu matrix for desktop and matching mobile drawer taxonomy. | EXPLICIT | SRC-DES-LIVE-001 |
| VIS-019 | Add size/format as a first-class purchase path in nav, collection and PDP. | EXPLICIT | SRC-DES-LIVE-001, SRC-DES-LIVE-003 |
| VIS-020 | Replace partial homepage reorder with full homepage target sequence. | EXPLICIT | SRC-DES-LIVE-002, SRC-SIZ-CURRENT-001 |
| VIS-021 | Convert text-band legacy sections into visual category/campaign/editorial modules. | EXPLICIT | SRC-DES-LIVE-002, SRC-USER-001 |
| VIS-022 | Build complete collection template and filter matrix. | EXPLICIT | SRC-DES-LIVE-003 |
| VIS-023 | Build complete PDP size/format/sales structure while preserving BaZi-only personalization. | EXPLICIT | SRC-DES-REF-001, SRC-OLD-PRD-001 |
| VIS-024 | Produce evidence for each closed gap; no completion or production claim without evidence. | EXPLICIT | SRC-USER-001, SRC-SIZ-CURRENT-001 |

## 8. Success Signals

| ID | Success Signal | Source Type | Source |
|---|---|---|---|
| VIS-025 | Desktop mega-menus and mobile drawer contain all mandatory taxonomy groups including size/format. | EXPLICIT | SRC-DES-LIVE-001 |
| VIS-026 | Homepage DOM and screenshots show the full target sequence, not the old below-fold V2 chain. | EXPLICIT | SRC-DES-LIVE-002, SRC-SIZ-CURRENT-001 |
| VIS-027 | Collections show breadcrumb, H1, intro, all categories, filter/sort, grid, count, load more/pagination, SEO, trust, newsletter/footer. | EXPLICIT | SRC-DES-LIVE-003 |
| VIS-028 | PDPs show gallery, size/format selector, price, add-to-cart, trust bullets, details and cross-sell; personalization appears only for BaZi. | EXPLICIT | SRC-DES-REF-001, SRC-OLD-PRD-001 |
| VIS-029 | Mobile 360/390/430 px proves true mobile shell, no compressed desktop nav and no three-column product grid under 480 px. | EXPLICIT | SRC-USER-001, SRC-OLD-VIS-001 |
| VIS-030 | Gap Closure Report marks every gap closed/open with evidence path and source type. | EXPLICIT | SRC-USER-001 |

## 9. Boundaries

| ID | Boundary | Source Type | Source |
|---|---|---|---|
| VIS-031 | Do not copy Desenio copy, images, logos, product names, brand assets or protected content. Only architecture, structure, module order, taxonomy and UI contracts are used. | EXPLICIT | SRC-DES-LIVE-001, SRC-USER-001 |
| VIS-032 | InkWave Hero concept remains protected and unchanged; only technical fixes against mobile clipping are permitted. | EXPLICIT | SRC-OLD-VIS-001 |
| VIS-033 | BaZi math remains RED unless a real provider/math implementation is verified. | EXPLICIT | SRC-SIZ-CURRENT-001 |
| VIS-034 | Reviews remain off unless backed by verified real review source. | EXPLICIT | SRC-OLD-VIS-001 |
| VIS-035 | No production, launch or Desenio-equivalent claim without evidence and RED-carry disclosure. | EXPLICIT | SRC-SIZ-CURRENT-001, SRC-USER-001 |

## 10. Assumptions

| ID | Assumption | Source Type | Source |
|---|---|---|---|
| ASM-001 | Existing React/Express stack remains; components are refactored/expanded rather than rebuilt from scratch. | ASSUMPTION | SRC-OLD-CAN-001 |
| ASM-002 | Final SizhuAtelier size taxonomy must come from real product/fulfillment decisions; interim sizes may be data-driven placeholders only if clearly non-final. | ASSUMPTION | SRC-USER-001 |

## 11. Missing Items

| ID | Missing Item | Source Type | Impact |
|---|---|---|---|
| OQ-001 | Final production poster sizes / formats. | MISSING | Blocks final size taxonomy, price matrix and PDP price accuracy. |
| OQ-002 | Final product assets for banners, mega-menu tiles, collections and PDPs. | MISSING | Blocks visual launch sign-off. |
| OQ-003 | Final regional price table and shipping integration. | MISSING | Blocks pricing launch sign-off. |
| OQ-004 | Real review provider/source. | MISSING | Reviews remain disabled. |
| OQ-005 | Real-browser / mobile screenshot evidence. | MISSING | Blocks full architecture completion claim. |

## 12. User Confirmation Block

The assistant must not confirm this vision. For AgileTeam planning, the user must type:

```text
Ich bestätige, dass Product Canvas und Product Vision meine Absicht korrekt wiedergeben und als Grundlage für AgileTeam Planning verwendet werden dürfen.
```
