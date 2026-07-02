# SizhuAtelier Webshop — Architektur & Struktur (Ist-Stand)

> **Stand:** 2026-06-26 · Branch `feat/personalization-first-mvp` · Commit-Basis `6b0882e` (v2)
> **Quelle:** automatischer Repo-Scan, nicht aus dem Gedächtnis.
> **Live:** https://sizhuatelier-shop-production.up.railway.app/ (Railway, Auto-Deploy vom Branch)

Dieses Dokument beschreibt die **tatsächliche** Struktur des Shops. Ehrlichkeits-Hinweise
(Platzhalter / RED) sind als solche markiert — siehe Abschnitt 11.

---

## 1. Überblick

Ein **Full-Stack-Webshop** für personalisierte BaZi-Poster + kuratierte TCM-/Wuxing-Fachposter.
Kein Headless-CMS, keine Microservices — **ein einzelner Express-Prozess** liefert das gebaute
React-Frontend (statische Assets aus `dist/`) **und** die JSON-API auf **demselben Port**.

```
                         ┌─────────────────────────────────────────────┐
   Browser  ───────────► │  Express  (server/index.js)  · Port 3000     │
   (React SPA)           │                                              │
                         │   ├─ express.static(dist/)   → SPA-Assets    │
                         │   ├─ /api/*                   → JSON-API      │
                         │   └─ GET *  → dist/index.html (SPA-Fallback)  │
                         └──────────────┬───────────────────────────────┘
                                        │ (alles env-gated)
                   ┌────────────────────┼─────────────────────┐
                   ▼                    ▼                     ▼
              Stripe API          Postgres (pg)          Resend (E-Mail)
            (Checkout/Portal)    (Orders/Accounts)     (Bestätigungen)
```

**Designprinzip:** Jede externe Integration ist **env-gated** — der Server bootet ohne
Stripe-/DB-/Mail-Keys, die betroffenen Endpunkte antworten dann kontrolliert mit `503`.

---

## 2. Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend-Framework | **React 19** + TypeScript |
| Build / Dev | **Vite 7** (`tsc -b && vite build`) |
| Routing | **react-router 7** (`BrowserRouter` + `<Routes>`, komponentenbasiert) |
| UI-Primitives | **shadcn/ui** (new-york) auf **Radix UI** (~53 Komponenten in `components/ui/`) |
| Styling | **Tailwind CSS 3.4** + `tailwindcss-animate`; Design-Tokens in `src/lib/tokens.ts` |
| 3D / Hero | **Three.js** via `@react-three/fiber` + `@react-three/drei` (lazy-loaded) |
| State | **React Context** (kein Redux/Zustand) — `ShopStore`, `AuthProvider`, `I18nProvider` |
| Formulare | `react-hook-form` + `zod` |
| i18n | Eigener leichter Provider, **EN / DE / FR** |
| Backend | **Express 4** (ESM, `type: module`) |
| Zahlung | **Stripe** (Hosted Checkout + Webhook + Customer Portal) |
| DB | **Postgres** via `pg` (optional, auto-create der Tabellen beim Boot) |
| E-Mail | **Resend** (optional) |
| Tests | **Vitest** (jsdom + node) + **supertest** + **Playwright** (E2E, authored) |
| Deployment | **Railway** (NIXPACKS, `railway.json`), Auto-Deploy vom Branch |

---

## 3. Verzeichnisstruktur (Ist)

```
app/
├── server/
│   ├── index.js              Express: Static-SPA + API + Auth + Stripe + DB + Mail
│   └── pricing.js            Server-autoritative Preis-/Versand-Tabelle (v2)
├── src/
│   ├── main.tsx              Entry: BrowserRouter → Provider-Kette → App
│   ├── App.tsx               Composition-Root: App-Shell + <Routes> (28 Routen)
│   ├── pages/                20 Seiten-Komponenten (lazy-imported)
│   ├── components/
│   │   ├── Navbar.tsx        Header + Mega-Menü (desktop) + Drawer (mobile)
│   │   ├── InkWave.tsx       Three.js Hero-Shader (lazy, perf-optimiert)
│   │   ├── shop/             26 Shop-Sektionen/-Bausteine
│   │   └── ui/               ~53 shadcn/Radix-Primitives
│   ├── store/
│   │   ├── ShopStore.tsx     Warenkorb + Konfigurator-State (Context, localStorage)
│   │   └── AuthProvider.tsx  Session-/Account-State (Context)
│   ├── lib/                  14 Domänen-/Util-Module (siehe §6)
│   ├── i18n/                 I18nProvider + translations.ts (EN/DE/FR)
│   └── hooks/                Custom Hooks
├── tests/                    21 Dateien: unit/ integration/ smoke/ e2e/
├── docs/                     Architektur, ADRs, PRD, Vision, Canvas, Traceability, …
├── public/                   Statische Bilder (Poster/Kategorien/Atelier — z.T. Platzhalter)
├── dist/                     Build-Output (gitignored)
├── vite.config.ts            Build + manualChunks (react-vendor; Three.js bleibt lazy)
├── vitest.config.ts          2 Projekte: jsdom (UI) + node (Server/Integration)
├── playwright.config.ts      E2E-Config (Browser-Läufe noch ausstehend)
└── railway.json              NIXPACKS build/start
```

---

## 4. Frontend-Architektur

### 4.1 Composition-Root & Provider-Kette
`src/main.tsx` → `BrowserRouter` → `I18nProvider` → `ShopStoreProvider` → `AuthProvider` → `App`.
`src/App.tsx` rendert die **App-Shell** (AnnouncementBar · Navbar · `<Routes>` · SiteFooter ·
CartDrawer · ArticleOverlay · Toast) und ist der **Produktions-Composition-Root**, gegen den
auch die Tests rendern (Reality-Boundary).

### 4.2 Routing (28 Routen, alle lazy-imported)
```
/                         Home (Modulfolge 02..13)
/product/:id              Produktdetailseite (PDP)
/personalize              Personalisierungs-Flow
/checkout · /success · /cancel   Checkout + Ergebnis
/collections              Collection-Hub
/collections/:slug        8 Per-Welt-Collections (eine wiederverwendbare Vorlage)
/inspiration              Galerie/Gallery-Wall
/blog · /blog/:slug       Wissen/Artikel
/gifts /how-it-works /tcm /bundles /digital /about /contact /faq /account
/impressum /privacy /terms /returns /shipping   Legal (1 Komponente, docKey-Prop)
/produkt/:id /kollektion /atelier /kontakt      Legacy-Redirects (alte Slugs)
```

### 4.3 Seiten (`src/pages/`, 20)
`Home · ProductView · Personalize · Checkout · OrderResult · Collection · Kollektion ·
Inspiration · Blog · Article · Gifts · HowItWorks · TcmOverview · BundlesPage · DigitalPage ·
About · Contact · Faq · Account · Legal`

### 4.4 Homepage-Module (`Home.tsx`, V2-Reihenfolge 02..13)
Mit stabilen `data-module="NN"`-Ankern, Hero zuerst & unangetastet:
`02 Hero (InkWave) · 03 Shop-by-World · 04 Featured-Slider · 05 How-it-works ·
06 Fire-Horse · 07 Compatibility · 08 Analysis-PDFs · 09 Inspiration-Teaser ·
10 Wissen · 11 Trust · 12 SEO-Block · 13 Newsletter/Footer`.

### 4.5 Shop-Komponenten (`src/components/shop/`, 26)
Sektionen: `AnnouncementBar · CatalogSection · ShopByWorldSection · FeaturedCollectionSection ·
HowItWorksSection · CompatibilitySection · AnalysisPdfsSection · InspirationTeaserSection ·
WissenSection · PathToPoster (Trust) · SeoTextSection · NewsletterSection · SiteFooter`.
Bausteine: `ProductCard · ProductCarousel · CartDrawer · Configurator · PosterScene (3D-Vorschau) ·
StarRating · HeaderSearch · FaqSection · ApiTrustSection · ArticleOverlay · Toast · BundlesSection`.
*(Hinweis: einige Altbestände wie `CelestialVault` sind ggf. verwaist — Audit empfohlen.)*

### 4.6 State-Management (Context, kein externes Lib)
- **`ShopStore.tsx`** — Warenkorb-Zeilen + Konfigurator-State; persistiert nach `localStorage`
  (`sizhu_cart`); berechnet die Live-Poster-Vorschau über `computeChart()`.
- **`AuthProvider.tsx`** — Session/Account (login/me/logout), env-gated.
- **`I18nProvider`** — Sprache EN/DE/FR, persistiert (`sizhu_lang`), setzt `<html lang>`.

### 4.7 Styling
Tailwind + zentrale Tokens (`src/lib/tokens.ts`: Farben `C`, Fonts, `FREE_SHIP_THRESHOLD`,
Container). shadcn-Primitives unter `components/ui/`.

---

## 5. Datenmodell (Frontend, hartkodiert)

Es gibt **kein CMS** — Katalog/Content leben als TypeScript in `src/lib/`.

### 5.1 Product (`src/lib/catalog.ts`)
Bestandsfelder: `id, title, category, price, anchor, rating, reviews, sold, bullets[],
poster: PosterData, personalizable?, image?, usage?`
**V2-additive Enums** (Iteration 3, bestehende Felder unverändert):
`product_world (bazi|tcm|wuxing|mixed) · personalization_level (single|couple|yearly|none) ·
use_case · design_family (minimal|japandi|wabi_sabi|classic_ink)`.
Helper: `filterByWorld()` (deterministisch/total), `productsByIds()`.

### 5.2 Collection-Konfig (`src/lib/collections.ts`)
Deklarative `COLLECTION_CONFIGS` für 8 MVP-Slugs (bazi-posters, tcm-posters, wuxing-posters,
personalized-posters, compatibility-posters, fire-horse-2026, analysis-pdfs, bundles) —
jeweils Eyebrow/Title/Intro/Hero/World|ProductIds/SEO/FAQ. Eine Vorlage: `pages/Collection.tsx`.

### 5.3 Chart / Personalisierung (`src/lib/bazi.ts`, `src/lib/personalization.ts`)
- `computeChart(date, time, place, birthTimeUnknown) → { pillars, animal, element }`
  **🔴 Platzhalter-Mathe** (Modulo-Arithmetik) — siehe §11 / §12.
- `personalization.ts` — Single-Source-of-Truth `birthTimeMeta()`: 12:00-Noon-Fallback +
  Offenlegungs-Flags; reicht Ort/Datum/Zeit/`birthTimeUnknown` bis in die Cart-Metadaten durch.

### 5.4 Weitere lib-Module
`checkout.ts` (Cart-Zeile→Payload, Identitäts-Helper) · `auth.ts` · `newsletter.ts` ·
`legal.ts` (EN/DE/FR-Rechtstexte + `[MISSING]`-Marker + Review-Banner) ·
`region.ts` · `format.ts` · `config.ts` (Feature-Flags, `COMMERCE_ENABLED`) ·
`productTypes.ts` · `tokens.ts` · `utils.ts`.

---

## 6. Backend-Architektur (`server/index.js` + `server/pricing.js`)

Ein Express-Prozess, **ESM**. Bindet den Port nur als Entrypoint (`npm start`); Tests
importieren `createApp({ stripe, pool })`, um die echten Routen mit gestubbtem Stripe zu fahren.

### 6.1 API-Endpunkte (20)
| Gruppe | Endpunkte |
|---|---|
| Health/Geo | `GET /api/health` · `GET /api/region` |
| **Checkout** | `POST /api/checkout` (server-autoritative Re-Preisung) · `POST /api/webhook` · `GET /api/order/:id` |
| Newsletter | `POST /api/newsletter` |
| Auth | `signup · login · logout · me · orders · preferences · password · reset/request · reset/confirm` |
| Account | `addresses` (GET/POST) · `addresses/:id/default` · `billing-portal` |
| SPA | `GET *` → `dist/index.html` |

### 6.2 Server-autoritative Preisbildung (`server/pricing.js`, v2)
`priceLineItemCents(productId, variantId)` + `computeShippingCents(region, subtotal)`.
`/api/checkout` **ignoriert** den vom Client gesendeten `unitAmount`/`shippingCents` und
re-bepreist server-seitig; unbekannte Produkt-ID → `400` **vor** Stripe.

### 6.3 Persistenz (Postgres, optional)
Tabellen auto-create beim Boot: `users · addresses · orders · newsletter_signups ·
credits_ledger`. Ohne `DATABASE_URL` sind DB-Features aus.

### 6.4 Konfiguration (Env, alle gated)
`STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET · PUBLIC_URL · CURRENCY · DATABASE_URL ·
SESSION_SECRET · RESEND_API_KEY · ORDER_FROM_EMAIL · ORDER_NOTIFY_EMAIL`
(Referenz: `.env.example`). Fehlt eine → betroffener Pfad `503`, Rest läuft.

---

## 7. Kern-Datenflüsse

### 7.1 Personalisierung + Live-Vorschau
```
Eingabe (Datum/Zeit/Ort/„Zeit unbekannt")
  → personalization.birthTimeMeta()  (12:00-Fallback + Offenlegung)
  → computeChart(...)  🔴 Platzhalter
  → PosterScene (Three.js) rendert das Design live
  → "In den Warenkorb": Chart + Rohdaten als personalization-Metadaten an die Cart-Zeile
```

### 7.2 Checkout (manipulationssicher)
```
Cart-Zeile (productId + variantId + personalization)
  → POST /api/checkout
  → server/pricing.js re-bepreist (Client-Preis ignoriert)
  → Stripe-Session  (🔴 im Run nur gestubbt verifiziert)
  → Webhook checkout.session.completed → Order persistiert (wenn DB gesetzt)
```

---

## 8. Build & Deployment

- **Build:** `tsc -b && vite build`. `manualChunks` pinnt `react-vendor`; **Three.js bleibt
  hinter dem dynamischen Import** (lazy Home → lazy InkWave), wird nie modulepreloaded.
- **Start (prod):** `npm start` = `node server/index.js` (liefert `dist/` + API auf einem Port).
- **Railway:** NIXPACKS, Build `npm run build`, Start `npm start`, Auto-Deploy vom Branch
  `feat/personalization-first-mvp`. Postgres-Plugin setzt `DATABASE_URL`.
- **InkWave-Chunk:** 894 KB (gz 242 KB) als eigener Lazy-Chunk — performance-geschützt (NFR-1).

---

## 9. Testarchitektur (21 Dateien)

| Ebene | Ort | Inhalt |
|---|---|---|
| Unit | `tests/unit/` + co-located in `src/` | Datenmodell, Truthful-Claims-Scan, Module-Order, Routen, Noon-Fallback … |
| Integration | `tests/integration/checkout.repricing.test.ts` | Echte `/api/checkout`-Route via supertest, Stripe gestubt |
| Smoke | `tests/smoke/app-boot.smoke.test.tsx` | Mountet echten `App.tsx`-Provider-Stack |
| E2E | `tests/e2e/*.spec.ts` (6) | **Playwright, authored, noch nicht gelaufen** (kein Chromium) |

Lauf: `npm test` (Vitest, jsdom+node Projekte; `tests/e2e/**` excluded). Stand zuletzt:
**282 Tests grün, Build grün.** Coverage v8 ~35% global (bewusst money-path-lastig).

---

## 10. i18n & Recht
- Sprachen **EN / DE / FR** über `src/i18n/translations.ts` + I18nProvider.
- Legal-Seiten per Sprache (`LEGAL_DOCS_BY_LANG`), Operator-Daten als `[MISSING]`-Marker +
  Review-Banner (keine erfundenen Firmendaten).

---

## 11. Ehrlicher Status — was RED / Platzhalter ist

| Bereich | Status |
|---|---|
| **BaZi-Berechnung** (`src/lib/bazi.ts`) | 🔴 **Platzhalter** (`BLK-RED-BAZI`). Ort wird durchgereicht, aber NICHT in den Chart eingerechnet. Siehe §12. |
| **Money-Path** | 🔴 nur gegen **gestubbtes Stripe** bewiesen (`integration-fake`, `BLK-STRIPE-REAL`) — keine Live-Key-Verifikation. |
| **Preise** | 🔴 Platzhalter in `catalog.ts` (Mechanismus fertig, Werte nicht real). |
| **Produktbilder** | 🔴 Platzhalter, als solche markiert (`OQ-006`). |
| **Rechtsdaten** | 🔴 `[MISSING]`-Marker; echte Firmen-/Rechtsdaten fehlen. |
| **E2E (Playwright)** | 🔴 Specs geschrieben, Browser-Läufe ausstehend (Mobile 360/390/430, a11y, LCP). |
| **Fulfillment/Druck** | 🔴 nicht angebunden (`OQ-003`). |

Kein REQ ist `production-verified`. Quelle: `docs/reality/…evidence.jsonl`, `docs/traceability.md`.

---

## 12. Geplante Erweiterung — Chart-Provider-Naht

`computeChart()` ist heute der Platzhalter. Geplant ist eine **Provider-Naht**, damit die
echte API/Middleware ein **Config-Flip + eine Datei** wird (kein Refactor):

```ts
interface ChartProvider { compute(inputs: ChartInputs): Promise<ChartResult> }   // async von Tag 1
// placeholderProvider (jetzt)  →  apiProvider (Middleware, später), per VITE_CHART_PROVIDER
```
- Live-Vorschau: Debounce + Cache + „last good value" (Latenz der API entkoppeln).
- Autoritativer Chart beim Checkout server-/API-seitig (sicher, vertraulich, nicht manipulierbar) —
  die Rohdaten fließen dafür bereits bis in den Checkout durch.

Details: `docs/architecture/adr-002-personalization-input-passthrough.md`.

---

## 13. Referenzen
- ADRs: `docs/architecture/adr-001-server-repricing.md`, `adr-002-personalization-input-passthrough.md`
- Produkt: `docs/canvas/…`, `docs/prd/…`, `docs/vision/…`
- Nachverfolgung: `docs/traceability.md`, `docs/reality/…evidence.jsonl`
- Abnahme/Runbook: `docs/acceptance/…acceptance.md`
- Operator-Aufgaben vor Go-Live: `docs/OPERATOR_HANDOFF.md` *(teilweise veraltet — §2 Re-Pricing ist inzwischen umgesetzt)*
