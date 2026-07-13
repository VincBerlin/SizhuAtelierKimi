# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**SizhuAtelier** — a full-stack webshop for personalized BaZi (Chinese astrology) posters plus curated TCM/Wuxing art prints. The buyer enters birth data, sees an exactly-personalized poster preview, and after Stripe payment a print-exact PDF is generated and pushed to Gelato (print-on-demand) as a draft order.

A **single Express process** serves the built React SPA *and* the JSON API on the same port. No CMS and no microservices — catalog, taxonomy and content live as TypeScript in `src/lib/`.

## Commands

```bash
npm run dev          # Vite dev server on :3000 — SPA only, see gotcha below
npm run build        # tsc -b && vite build  → dist/
npm start            # node server/index.js — Express on :3000: serves dist/ AND /api/*
npm run lint         # eslint

npm test             # vitest run — all three projects (jsdom, jsdom-isolated, node)
npm run test:unit    # vitest run --project jsdom
npm run coverage     # v8 coverage over src/** + server/**
npm run test:e2e     # playwright (run `npx playwright install` first)
```

Run a single test file — pass the project it belongs to, since the projects are split by path:

```bash
npx vitest run --project jsdom tests/unit/mega-menu.test.tsx
npx vitest run --project node  tests/server/pdf.test.ts
```

`tests/integration/**` and `tests/server/**` are the **node** project (supertest against the real Express routes); everything else under `tests/` plus co-located `src/**` tests are **jsdom**. `tests/e2e/**` is Playwright and is excluded from Vitest.

Live-evidence scripts (require real keys; they write artifacts into `docs/evidence/`):

```bash
FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-smoke.mjs        # live chart vs. frozen fixture
FUFIRE_API_URL=… FUFIRE_API_KEY=… node scripts/evidence/fufire-match-smoke.mjs  # live pair/hehun
node scripts/evidence/pdf-artifact.mjs                                          # print PDF + dimension check
GELATO_API_KEY=… node scripts/evidence/gelato-catalog-verify.mjs                # verify Gelato product UIDs
```

### Environment gotchas

- **`npm run dev` has no API.** There is no Vite proxy, so `/api/*` calls fall through to the SPA. Any API-backed feature (live chart preview, checkout, geocoding) only works against the Express server: `npm run build && npm start`. The same applies to Playwright — its `webServer` boots `npm run dev`, so point `PLAYWRIGHT_BASE_URL` at a built server to exercise API flows.
- **No dotenv.** `npm start` reads only real environment variables. Use `node --env-file=.env server/index.js` or export them into the shell. See `.env.example`.
- **Vitest currently hangs on this machine** (`RL-VITEST-ENV` in the evidence ledger). Reproduced here: a single-file run produces no output and never exits — including for pre-existing, previously-green test files. It is environment-wide and pre-existing, not caused by any branch. Run the suite in CI or a fresh shell; do not chase it as a code bug, and do not claim tests pass without actually running them.

## Architecture

### One process, injectable externals

`server/index.js` (~1040 lines) is static SPA host + JSON API. `createApp({ stripe, pool, fufire, gelato })` is the **test factory**: tests import it to drive the *real* routes with stubbed externals and no live keys, without binding a port (`app.listen` only fires when the file is the process entrypoint).

Every external integration is **env-gated** — the server boots with zero keys and the affected endpoint returns `503`. Never introduce a hard dependency at boot.

### Two chart engines — they are not interchangeable

- `src/lib/bazi.ts` — `computeChart()` is a deterministic **placeholder** (modulo arithmetic). It is a protected surface: do **not** build a real astrological engine here. It still backs the legacy configurator, the `PosterData` types, and the canonical `sizes`/`frames` lists.
- `src/lib/baziClient.ts` + `src/hooks/useBaziChart.ts` → `/api/bazi`, `/api/match` → `server/fufire.js` → the **FuFirE** API. This is the exact, live-verified engine. The browser never talks to FuFirE directly — the API key is server-only.

The calculation convention is **pinned**: `standard=TLST`, `boundary=midnight` (env-overridable, `server/fufire.js`). The canonical fixture is 1990-06-15 12:30 Berlin → 庚午 / 壬午 / 辛亥 / 乙未, Horse / Metal. Every layer (client normalization, route, UI, PDF) is checked against those exact values.

**Honesty rule:** when FuFirE is unreachable the hook yields `status: 'error'` and `chart: null`, and add-to-cart is blocked. Never fall back to the placeholder silently.

### Designs: one SVG source, two outputs

`src/designs/*.mjs` are pure SVG-string functions importable from **both** Vite (browser preview) and Node (print PDF) — one source, two outputs. `src/designs/registry.mjs` is the single list: a new design is a new file plus one line in `DESIGNS`. Never delete entries — `active: false` retires a design while keeping old orders reprintable.

The **Design-TÜV** (`tests/unit/design-registry-tuev.test.ts`) runs automatically against *every* registered design and fails it for dropped personalization fields, unescaped user text (XML injection), or invalid XML.

### Money path is server-authoritative (ADR-001)

`/api/checkout` **ignores** the client-sent `unitAmount` / `shippingCents` and re-prices from `server/pricing.js` using `productId` + `variantId`. An unknown product id is a `400` *before* Stripe is called. Product-id prefixes: `poster:`, `ptype:`, `bundle:`, `addon:`, `digital:`.

### Fulfillment pipeline

Stripe webhook (`checkout.session.completed`) → `server/fulfillment.js` `fulfillOrder()` → print PDF via `server/pdf.js` (pdfkit + svg-to-pdfkit, CJK fonts embedded, bleed from `server/printSpecs.js`) → served at `/prints/:sessionId/:token.pdf` → Gelato draft order (`server/gelato.js`).

`server/gelatoProducts.js` `PRODUCT_UIDS` is **deliberately empty** and `productUidFor()` **throws**. Gelato UIDs are never guessed; they are only filled in from `scripts/evidence/gelato-catalog-verify.mjs` run against the real catalog. A loud error beats a wrong print.

### Frontend

React 19 + Vite 7, react-router 7, shadcn/ui (new-york) on Radix, Tailwind 3.4. State is **React Context only** (`ShopStore`, `AuthProvider`, `I18nProvider`) — no Redux/Zustand. i18n covers EN/DE/FR/ES. `@` aliases `src/`.

`src/lib/taxonomy.ts` is the single source of truth for the nav matrix, mega-menu, collection filters and PDP sizes — the mega-menu, mobile drawer, collection toolbar and PDP size selector all render from it. Do not hand-roll duplicate nav data.

Three.js (`InkWave.tsx`) stays behind a dynamic import and must never enter the entry chunk — `vite.config.ts` `manualChunks` pins only `react-vendor`.

## The honesty discipline

This repo runs an unusually strict evidence culture. It is the thing most likely to trip you up, and it is enforced by tests, not just convention.

- **Evidence ledger** (`docs/evidence/fufire-gelato/ledger.md`): *a claim without an artifact row is not proven.* Proof classes run from `[REAL-BOUNDARY-LIVE]` / `[REAL-BROWSER]` / `[REAL-ARTIFACT]` / `[HUMAN-VERIFIED]` down to the weaker `[INTEGRATION-FAKE]` and `[SHIPPED-SCAN]`. A green test on its own is not proof.
- **RED carries are tracked openly and block launch** — never quietly closed. Currently open: `RL-VITEST-ENV`, `OQ-TLST`, `RL-GELATO`, `RL-STRIPE-CHAIN`, `HERO-ASSET`.
- **Meta-tests police honesty:**
  - `tests/unit/truthful-claims.test.ts` scans the *shipped* i18n and catalog strings in every locale for forbidden claims (no "the chart is calculated" while the placeholder ships, no health/healing claims).
  - `tests/unit/exact-reality-ledger.test.ts` reads the gap-closure doc and fails it for any completion/launch claim while RED carries are open, or for shop copy that invents affordances or social accounts.
  - `tests/unit/delta-cities-source.test.ts` fails if a public geocoder host appears anywhere in `src/`.
- **Never invent social proof.** `REVIEWS_ENABLED` (`src/lib/config.ts`) defaults **off**; the `rating`/`reviews` numbers in `catalog.ts` are placeholders and must not be surfaced. `COMMERCE_ENABLED` is the other flag (defaults on).
- **Fail loud, never silently fake:** `GelatoMappingUnverifiedError`, chart `status: 'error'`, `[MISSING]` operator markers in `src/lib/legal.ts` instead of invented company data.
- **Downgrades come from the operator, not the agent.** A superseded contract gets a documented row in the ledger's *Vertrags-Änderungen* section citing the operator plan — it is never dropped silently.

Change scope is machine-declared in `docs/scope/*.scope.json` (`allowed_change_scope`). `src/components/InkWave.tsx` and `src/lib/bazi.ts` are **protected surfaces**: touching them requires explicit user review.

## Conventions

- **Language:** plans, docs, the ledger and most newer code comments are in **German**; identifiers and commit messages in English. Match the file you are editing.
- **Commits:** conventional (`feat:`, `fix:`, `test:`, `docs:`), attribution disabled.
- **Files under 500 lines.** `server/index.js` is already ~1040 — put new server logic in a new module and add only thin wiring lines there.
- **Deployment:** Railway (NIXPACKS) — build `npm run build`, start `npm start`, auto-deploy from the working branch.

## Reference docs

- `docs/plans/2026-07-12-fufire-personalization-gelato.md` — the current implementation plan (FuFirE + designs + PDF + Gelato).
- `docs/architecture/adr-001-server-repricing.md` — server-authoritative pricing; `adr-002-personalization-input-passthrough.md` — why birth inputs are threaded through rather than discarded.
- `docs/architecture/current-architecture.md` — detailed repo scan, but written 2026-06-26 (pre-FuFirE/Gelato); its "RED status" and "planned chart provider" sections are superseded by the evidence ledger.
- `docs/OPERATOR_HANDOFF.md` — what the operator must do before go-live.

## GBrain Configuration (configured by /setup-gbrain)
- Engine: pglite
- Config file: ~/.gbrain/config.json (mode 0600)
- Setup date: 2026-07-11
- MCP registered: yes (user scope, /Users/vincentschnetzer/.bun/bin/gbrain serve)
- Artifacts repo: https://github.com/VincBerlin/gstack-artifacts-vincentschnetzer
- Artifacts sync: artifacts-only
- Transcript ingest: incremental (47 sessions bulk-ingested 2026-07-11)
- Current repo policy: read-write
- Embedding: zeroentropyai:zembed-1 (1280d schema) — semantic search OFF until
  ZEROENTROPY_API_KEY is set (free key: https://dashboard.zeroentropy.dev),
  then run `gbrain embed --stale`. Keyword search works without it.
- Reference: ~/.claude/skills/gstack/setup-gbrain/memory.md
