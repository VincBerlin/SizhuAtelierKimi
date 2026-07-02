# PRD: SizhuAtelier Desenio Exact Architecture

Status: `user-confirmed`  (2026-07-01 — user chose "Bestätigen & M9 starten" in the AgileTeam confirmation gate, defined there as the confirmation; supersedes the desenio-delta package)  
Feature Slug: `sizhuatelier-desenio-exact-architecture`  
Owner: SizhuAtelier / AgileTeam  
User Confirmation Required: yes  
Mode: `PLUMBLINE_READY_PACKAGE`  
Readiness-Level: `READY_FOR_USER_CONFIRMATION`

## 1. Source Summary

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

## 2. Canonical Supersession

This PRD replaces the earlier partial interpretation. Claude/AgileTeam must not use older documents to justify leaving the old below-fold structure unchanged, omitting poster sizes, using a generic Collections-only mega-menu, leaving campaign sections as text bands, or claiming Desenio-equivalence from M1–M8 alone.

| Superseded Item | Required Action | Source Type |
|---|---|---|
| `below-fold V2 unchanged` | Remove as acceptable architecture state; replace with full target sequence. | EXPLICIT |
| `Collections-Mega-Menü` generic | Replace with complete mega-menu matrix. | EXPLICIT |
| Missing poster-size path | Add size/format in nav, collection and PDP. | EXPLICIT |
| Text-band Fire Horse / Compatibility / Digital Analysis | Convert to unified visual campaign banner row. | EXPLICIT |
| Blog/process blocks interrupting purchase path | Move/condense into Editorial, Inspiration, Trust or Footer. | EXPLICIT |
| `Build complete` without full architecture evidence | Replace with `architecture correction in progress` until evidence closes all gaps. | EXPLICIT |

## 3. Problem Statement

| Field | Value | Source Type | Source |
|---|---|---|---|
| Problem Statement | The current build partially improved SizhuAtelier but does not fully match the extracted Desenio architecture. The missing contract areas are navigation depth, mega-menu matrix, size/format path, complete homepage sequence, collection template, PDP size/commerce structure, mobile shell and evidence. | EXPLICIT | SRC-SIZ-CURRENT-001, SRC-USER-001 |
| Scope Correction | The intended implementation is structural equivalence to Desenio's architecture using SizhuAtelier content, not an above-fold patch. | EXPLICIT | SRC-USER-001 |

## 4. Target Users

| ID | User | Source Type | Source |
|---|---|---|---|
| USER-001 | Buyers entering through product world, style, room/use, size/format, set solution, trend or campaign. | EXPLICIT | SRC-DES-LIVE-001 |
| USER-002 | BaZi buyers requiring valid personalization paths only for BaZi. | EXPLICIT | SRC-OLD-PRD-001 |
| USER-003 | TCM/Wuxing/Fire Horse buyers requiring non-personalized purchase paths. | EXPLICIT | SRC-OLD-PRD-001 |
| USER-004 | Mobile buyers using 360/390/430 px screens. | EXPLICIT | SRC-OLD-VIS-001 |
| USER-005 | AgileTeam/Claude implementing from unambiguous architecture contracts. | EXPLICIT | SRC-USER-001 |

## 5. Goals

| ID | Goal | Source Type | Source |
|---|---|---|---|
| GOAL-001 | Build full Desenio-equivalent commerce architecture using SizhuAtelier brand, products and assets. | EXPLICIT | SRC-USER-001 |
| GOAL-002 | Make size/format a mandatory purchase path. | EXPLICIT | SRC-DES-LIVE-001 |
| GOAL-003 | Replace old below-fold and text-band sections with the full homepage commerce funnel. | EXPLICIT | SRC-DES-LIVE-002, SRC-SIZ-CURRENT-001 |
| GOAL-004 | Implement full collection and PDP contracts. | EXPLICIT | SRC-DES-LIVE-003, SRC-DES-REF-001 |
| GOAL-005 | Provide evidence for every closed gap. | EXPLICIT | SRC-USER-001 |

## 6. Non-Goals

| ID | Non-Goal | Source Type | Source |
|---|---|---|---|
| NG-001 | Do not copy Desenio protected content. | EXPLICIT | SRC-DES-LIVE-001 |
| NG-002 | Do not rebuild technical stack from scratch. | EXPLICIT | SRC-OLD-CAN-001 |
| NG-003 | Do not change InkWave Hero concept. | EXPLICIT | SRC-OLD-VIS-001 |
| NG-004 | Do not create fake reviews, fake discounts, fake bought counts, credit system, patron fold or coming-soon claims. | EXPLICIT | SRC-OLD-PRD-001 |
| NG-005 | Do not claim completion, launch or production readiness without evidence and RED-carry disclosure. | EXPLICIT | SRC-SIZ-CURRENT-001 |

## 7. Requirements

| Requirement ID | Requirement | Priority | Source Type | Source |
|---|---|---|---|---|
| REQ-001 | Supersede prior partial-delta artifacts: Claude MUST treat this package as canonical and remove/replace old instructions that permit above-fold-only reorder, unchanged below-fold V2 sequence, generic Collections mega-menu, omitted size paths, text-band campaign modules or launch-final placeholders. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-002 | Do not copy Desenio protected text, images, logos, product names, marks or assets; only architecture, structure, module order, taxonomy and UI contracts may be transferred. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-003 | Preserve the InkWave Hero concept and its first-major-module role; only mobile clipping/technical fixes are allowed. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-004 | Implement the global commerce shell in order: locale/region, utility/promo bar, header/logo, primary nav, search, cart, mega-menu layer, page content, trust/newsletter/footer. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-005 | Implement exact primary nav: Bestseller, Neuheiten, Poster, TCM Poster, Wuxing, Angebote, Poster Sets, Inspiration; FAQ/About/Contact/Blog must not be primary nav entries. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-006 | Implement full desktop mega-menu matrix for Poster, TCM Poster, Wuxing and Poster Sets: quick access, product world/type, theme/style, room/use, size/format, sets/solutions, trends/campaigns and visual tiles. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-007 | Implement matching mobile drawer/accordion taxonomy equivalent to desktop mega-menu; desktop nav must not be compressed into mobile width. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-008 | Implement poster size/format as a first-class purchase path in mega-menu, collection filters and PDP. Do not invent unavailable production sizes; source sizes from catalog/fulfillment or mark as non-final. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-009 | Implement room/use purchase paths in nav and collections: e.g. Wohnzimmer, Schlafzimmer, Home Office, Praxis/Studio, Meditation/Ritual Space, Geschenk. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-010 | Implement theme/style purchase paths in nav and collections: Minimal Ink, Classic Chart, Wabi-Sabi, Elemental/Five Elements, Meridian/Organ Clock, Couples/Compatibility and other real SizhuAtelier styles. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-011 | Implement set/solution purchase paths in nav and collections: Couples Set, TCM Practice Set, Wuxing Set, BaZi + Element Set, Gift Set, Poster Sets. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-012 | Implement trends/campaign paths: Fire Horse 2026, TCM Organ Clock, Wu Xing Five Elements, Compatibility Posters and other real campaigns. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-013 | Mega-menu visual tiles MUST include image field, title, short label, CTA and real link; if real assets are missing, tiles must be visibly non-final and tagged as placeholders. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-014 | Implement full homepage target sequence: Global Shell → InkWave Hero → Bestseller Slider → Large Category Banner Row → Editorial/Atelier Block → New Arrivals Slider → Campaign Banner Row → Inspiration/Gallery → Compact SEO → Trust/Service → Shop Newsletter → Footer. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-015 | Bestseller must be a product slider directly after Hero with product cards, view-all CTA and no static 3-column grid on mobile. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-016 | Large category banners must appear after Bestseller and visually represent BaZi Posters, TCM Posters and Wuxing Posters; they must not be small text cards. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-017 | Editorial/Atelier block must be shop-supporting and concise; standalone HowItWorks/process blocks must be merged or moved so they do not dominate the purchase path. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-018 | New Arrivals must exist as a separate product slider with CTA and product links, not be merged into Bestseller. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-019 | Fire Horse, Compatibility, Digital BaZi Analysis and Poster Sets must be converted into a unified visual campaign banner row, not isolated text bands. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-020 | Inspiration must become a visual gallery/shop-look module with product/context links; blog cards must not interrupt the main purchase path. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-021 | SEO copy must be compact, structured and placed after commerce modules; it must not overload above-fold or campaign areas. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-022 | Trust/reviews must be honest: no fake reviews, fake stars, fake bought counts, credits, patron fold or coming-soon surfaces; reviews only with verified source, otherwise service badges only. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-023 | Newsletter must be shop-oriented: new products, offers, atelier updates and inspiration; Cosmic Pulse / energy notes may be secondary only. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-024 | Footer must contain service/help, legal, social, locale/country and payment/shipping areas; FAQ/About/Contact/Blog move here or secondary service areas. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-025 | Implement complete Collection template: global shell, breadcrumb, H1, intro, visual, category toolbar, filter/sort, product grid, product count, load more/pagination, SEO, trust, newsletter, footer. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-026 | Implement Collection filter matrix: product world, theme/style, room/use, size/format, set/bundle, price, personalization eligibility and color/layout if relevant. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-027 | Collection product grid must show product cards, count and load-more/pagination; mobile grid under 480 px must be one column preferred or two max, never three. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-028 | Implement complete PDP template: breadcrumb, gallery, product summary, type/format, size selection, price, add-to-cart, trust bullets, description, material/print details, cross-sell, inspiration, newsletter/footer. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-029 | PDP size selection must drive price/availability display; unavailable sizes must not be selectable as if purchasable. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-030 | BaZi personalization must appear only for BaZi products; TCM, Wuxing and Fire Horse PDPs must show standard purchase options without birth-data prompts or chart preview. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-031 | Product cards must contain image/placeholder, badge only if real, product type/collection label, title, region price and PDP link; no fake stars, no fake review counts, no fake discounts. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-032 | Offers/Sale architecture must be honest: no fake discounts or fake sale hub; promo bar, cards and offer routes must share real pricing/offer source. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-033 | Mobile 360/390/430 px must prove header, drawer, search, cart, product sliders, filters, PDP gallery and add-to-cart are reachable and not clipped. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-034 | BaZi mobile configurator must keep poster preview visible or directly reachable without blocking inputs; DOB and TOB must not overlap; place autocomplete must return city/country suggestions from approved data source. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-035 | Each closed gap must have evidence: DOM test, Playwright/screenshot evidence, no-dead-link test, taxonomy completeness test and Gap Closure Report entry. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |
| REQ-036 | No completion, launch, production or Desenio-equivalent claim is allowed while RED carries remain open or evidence is missing. | Must | EXPLICIT | SRC-USER-001 / SRC-DES-LIVE-* |

## 8. Acceptance Criteria

| AC ID | Requirement ID | Given | When | Then | Source Type |
|---|---|---|---|---|---|
| AC-001 | REQ-001 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-002 | REQ-002 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-003 | REQ-003 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-004 | REQ-004 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-005 | REQ-005 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-006 | REQ-006 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-007 | REQ-007 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-008 | REQ-008 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-009 | REQ-009 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-010 | REQ-010 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-011 | REQ-011 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-012 | REQ-012 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-013 | REQ-013 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-014 | REQ-014 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-015 | REQ-015 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-016 | REQ-016 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-017 | REQ-017 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-018 | REQ-018 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-019 | REQ-019 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-020 | REQ-020 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-021 | REQ-021 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-022 | REQ-022 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-023 | REQ-023 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-024 | REQ-024 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-025 | REQ-025 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-026 | REQ-026 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-027 | REQ-027 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-028 | REQ-028 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-029 | REQ-029 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-030 | REQ-030 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-031 | REQ-031 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-032 | REQ-032 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-033 | REQ-033 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-034 | REQ-034 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-035 | REQ-035 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |
| AC-036 | REQ-036 | the relevant page/module is opened | QA inspects desktop, mobile, DOM and linked routes | the requirement is visibly satisfied, linked correctly, and has an evidence artifact; otherwise status remains open. | EXPLICIT |

## 9. Evidence Needed

| Evidence ID | Requirement IDs | Evidence Needed | Source Type |
|---|---|---|---|
| EV-001 | REQ-004, REQ-005, REQ-006, REQ-009, REQ-010, REQ-011, REQ-012, REQ-013 | Desktop header and mega-menu screenshots plus DOM/taxonomy completeness tests. | MISSING |
| EV-002 | REQ-007, REQ-033, REQ-034 | Mobile 360/390/430 screenshot matrix plus drawer/search/cart/filter tests. | MISSING |
| EV-003 | REQ-003, REQ-014, REQ-015, REQ-016, REQ-017, REQ-018, REQ-019, REQ-020, REQ-021, REQ-023, REQ-024 | Homepage DOM order test plus screenshots proving full target sequence. | MISSING |
| EV-004 | REQ-025, REQ-026, REQ-027, REQ-031 | Collection screenshots/tests for breadcrumb, filters, sort, count, grid, pagination, SEO, trust. | MISSING |
| EV-005 | REQ-008, REQ-028, REQ-029, REQ-030 | PDP screenshots/tests for gallery, size selector, pricing, add-to-cart, personalization gate. | MISSING |
| EV-006 | REQ-001, REQ-002, REQ-022, REQ-032, REQ-035, REQ-036 | Gap Closure Report, no-dead-link test, no-fake-content sweep, reality ledger update. | MISSING |

## 10. Implementation Areas

| Area | Files / Components | Source Type |
|---|---|---|
| Header / Navigation | `src/components/Navbar.tsx`, `HeaderSearch`, mobile drawer, nav data model | EXPLICIT |
| Taxonomy | size/format, room/use, theme/style, set/solution, campaign/trend data sources | EXPLICIT |
| Homepage | `src/pages/Home.tsx`, shop sections, sliders, banners, editorial, SEO, trust, newsletter | EXPLICIT |
| Collections | `src/pages/Collection.tsx`, `src/pages/Kollektion.tsx`, `src/lib/collections.ts`, filters/sort | EXPLICIT |
| PDP | `src/pages/ProductView.tsx`, product data, size selector, price display, cross-sell, gates | EXPLICIT |
| Mobile | CSS/layout, drawers/sheets, slider behavior, 360/390/430 evidence | EXPLICIT |
| QA | Vitest, Playwright, screenshots, no-dead-links, gap closure, reality ledger | EXPLICIT |

## 11. Stop Conditions

| Stop ID | Condition | Required Response |
|---|---|---|
| STOP-001 | Size/format taxonomy is unavailable or fake. | Stop; ask user/operator for real production sizes or mark as non-final. |
| STOP-002 | Desenio copy/assets are being copied. | Stop; replace with SizhuAtelier-owned content. |
| STOP-003 | Homepage still contains old below-fold chain as primary sequence. | Stop; no completion claim. |
| STOP-004 | Mobile compresses desktop nav under 480 px. | Stop; mobile shell not accepted. |
| STOP-005 | Any REQ lacks traceability or evidence. | Stop; no ready/completion claim. |

## 12. User Confirmation Required

The assistant must not confirm this PRD. Product Canvas and Product Vision still require the user confirmation phrase before AgileTeam planning readiness.
