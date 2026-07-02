# Plan: Desenio Exact Architecture Correction

Status: `ready-for-user-confirmation`  
Feature Slug: `sizhuatelier-desenio-exact-architecture`  
Readiness-Level: `READY_FOR_USER_CONFIRMATION`

## Purpose

Claude must close the architecture gap. This is not polish. This is a structural correction to make SizhuAtelier architecture, setup and build pattern match the extracted Desenio commerce architecture using SizhuAtelier-owned content.

## Hard Supersession

Before implementation, Claude must mark old conflicting guidance as superseded:

```text
- Above-fold-only reorder is not enough.
- Below-fold V2 unchanged is not acceptable.
- Generic Collections mega-menu is not enough.
- Poster sizes may not be omitted.
- Text-band campaign sections must be converted.
- Mobile compressed desktop nav is not acceptable.
- Build-complete claim is invalid until all gap evidence exists.
```

## Milestones

| Milestone | Name | Scope | Stop Gate |
|---|---|---|---|
| M9 | Supersession & Taxonomy | Replace stale docs/claims; create canonical nav/taxonomy data for product world, style, room/use, size/format, sets, campaigns. | No fake sizes. |
| M10 | Navigation & Mega-Menu Matrix | Desktop mega-menus + mobile drawer with full matrix and visual tiles. | No M11 without size/room/style/sets/trends present. |
| M11 | Homepage Full Sequence | Build full target order; remove old below-fold V2 sequence and text-band modules. | No M12 if DOM order still shows old chain. |
| M12 | Collection Template & Filters | Breadcrumb, H1, intro, category drawer, filters, sort, grid, count, pagination, SEO/trust/newsletter. | No M13 without size filter. |
| M13 | PDP Size/Commerce Structure | Gallery, size selector, price/availability, add-to-cart, trust, details, cross-sell, personalization/review gates. | No M14 without size selector and BaZi-only gate. |
| M14 | Mobile Commerce Repair | Mobile shell, drawer taxonomy, sliders, filter sheets, product grid 1–2 cols max, PDP gallery, cart/search. | No M15 without 360/390/430 evidence. |
| M15 | Trust / Newsletter / Footer / Evidence | No fake content; shop newsletter; footer; gap closure report; reality ledger. | No completion claim without evidence. |

## Claude Execution Rules

```text
1. Test first where possible.
2. No commits without user review.
3. No production or launch claims.
4. Keep RED carries visible.
5. Use own SizhuAtelier content only.
6. Preserve InkWave Hero concept.
7. Stop on missing real sizes/assets/prices if needed for truthful output.
```
