# User Acceptance — SizhuAtelier Webshop Architektur V2

- **Feature Slug:** `sizhuatelier-webshop-architecture-v2`
- **Branch:** `feat/personalization-first-mvp`
- **Stand:** Iter 1..4 implementiert, Gate A/B/C grün, Gate D PLANNED-UNRUN, Gate E (du) offen.
- **Mode:** CORE-manual (PRIL CLIs intentionally stood down).

## 1. Honest summary (1 Absatz)

Die vier geplanten Iterationen sind im Code drin: (1) server-autoritatives Re-Pricing in `/api/checkout` mit gestubbtem Stripe-SDK; (2) wahrheitsgemäße Copy in EN/DE/FR (keine „exakte Engine"-Claims mehr) + Noon-Fallback-Offenlegung; (3) additives V2-Datenmodell + 8 per-Welt-Collection-Routen + Mega-Menü + Inspiration-Seite; (4) Homepage-Modulfolge 02..13 + SEO-Block + Conformance-Smoke. `npm run build` ist grün, `npm test` läuft 282 Tests grün durch 14 Test-Files. **Drei Dinge bleiben aber bewusst RED:** (a) die echte Bazi-Berechnung ist weiterhin ein Platzhalter (`src/lib/bazi.ts`) — die Eingaben (Ort/Datum/Zeit + Unbekannt-Flag) werden korrekt erfasst und im Cart-Metadaten-Pfad mitgetragen, aber bis du eine Berechnungs-API anschließt, ist der Chart symbolisch (BLK-RED-BAZI); (b) der Money-Path ist nur gegen einen Stripe-Stub bewiesen, nicht gegen echte Live-Keys (BLK-STRIPE-REAL), höchste erreichbare Evidenz im Sandbox-Run ist `integration-fake`; (c) die Playwright-E2E-Specs sind geschrieben, aber Chromium ist im Sandbox-Container nicht installiert, daher sind die echten Browser-Pfade NICHT gelaufen — die UI-REQ sind nur über jsdom-Mounts bewiesen. **Kein REQ ist `production-verified` markiert. Punkt.**

## 2. How-to-test runbook (10 Minuten, lokaler Dev-Server)

```bash
# In einem Terminal:
cd /Users/vincentschnetzer/Documents/Playground/Kimi_Agent_SizhuAtelier_Webdesign/app
npm run dev        # → Vite auf http://localhost:5173

# Optional in zweitem Terminal (für /api/checkout-Verhalten gegen echten Express):
npm start          # → Express auf http://localhost:8787 (oder PORT-env)
```

Die 8 kritischen Click-Paths, die du in ~10 Minuten manuell durchgehen kannst:

| # | Was | Wie | Erwartung |
|---|-----|-----|-----------|
| 1 | **Home-Modulfolge** | `/` öffnen, runterscrollen | InkWave-Hero → Featured Collection → Shop-by-World → Bundles → Compatibility → Analysis PDFs → Inspiration-Teaser → FAQ → SEO-Block → Footer (Module 02..13 in Reihenfolge) |
| 2 | **Mega-Menü desktop** | Hover über „Shop" in Navbar | Echtes Mega-Menü öffnet (nicht flaches Dropdown), strukturiert nach Produktwelt; ESC schließt; Tab navigiert |
| 3 | **Mega-Menü mobile** | Browser-Viewport < 768px, Hamburger | Drawer öffnet, Accordion expandiert, Links erreichbar |
| 4 | **Collection-Route** | Direkt `/collections/bazi` aufrufen (oder `/wuxing`, `/sheng-xiao`, …) | H1 + Intro + Grid + interner SEO-Text + FAQ + interne Links — keine dünne Seite, kein 404 |
| 5 | **Inspiration** | `/inspiration` | Galerie-Kacheln laden, sind als **Platzhalter** markiert (keine echten Bilder noch) |
| 6 | **Personalisierung + Noon-Fallback** | Auf einer Personalize-Seite Geburtsdatum eintragen, **„Zeit unbekannt" anhaken** | Hinweis sichtbar: 12:00 wird verwendet — und beim Hinzufügen in den Warenkorb taucht der Disclosure-Hinweis **auch in der Cart-Zusammenfassung** auf (EN/DE/FR via Sprach-Switcher prüfbar) |
| 7 | **Truthful-Copy-Sweep** | EN/DE/FR via Sprach-Switcher durchgehen; Produktseite + FAQ + Footer | Keine Behauptungen wie „exact engine", „BaZi API", „100% precision", „heilt", „behandelt" — nur Reframing zu „symbolic / curated / planned compute" |
| 8 | **Legal DE/FR + Money-Path-Tampering (optional, CLI)** | Legal-Seiten in DE/FR öffnen; dann `npm test tests/integration/checkout.repricing.test.ts` ausführen | Legal lokalisiert mit `[MISSING]`-Marker + Review-Banner; Re-Pricing-Test grün (Tampering `unitAmount: 1` schlägt fehl, Server-Preis siegt) |

## 3. Per-REQ verdicts (kompakt)

| REQ | Was | wired-in-prod? | evidence-class | RED? | Test |
|---|---|---|---|---|---|
| REQ-001 | Server-autoritatives Re-Pricing | yes | integration-fake | 🔴 BLK-STRIPE-REAL | `checkout.repricing` |
| REQ-002 | Server-Versand | yes | integration-fake | 🔴 BLK-STRIPE-REAL | `checkout.repricing` |
| REQ-003 | Checkout-Invarianten | yes | integration-fake | 🔴 BLK-STRIPE-REAL | `checkout.repricing` |
| REQ-004 | Personalisierungs-Inputs durchgereicht | yes | integration-fake | 🔴 BLK-RED-BAZI (accuracy) | `personalization-passthrough` |
| REQ-005 | Copy-Reframe EN/DE/FR | yes | integration-fake | 🔴 needs human eyeball | `truthful-claims` |
| REQ-006 | Heilversprechen-Sweep | yes | integration-fake | 🔴 needs human eyeball | `truthful-claims` |
| REQ-007 | Legal DE/FR | yes | integration-fake | 🔴 `[MISSING]`-Marker bleiben | `legal-localization-render` |
| REQ-008 | Home-Modulfolge 02..13 | yes | integration-fake | 🔴 LCP nicht remessen | `home-module-order` |
| REQ-009 | Mega-Menü + Mobile-Drawer | yes | integration-fake | 🔴 a11y nur jsdom-bewiesen | `mega-menu` |
| REQ-010 | 8 Collection-Routen | yes | integration-fake | 🔴 SEO-Index unverified | `collections-routes` |
| REQ-011 | `/inspiration` | yes | integration-fake | 🔴 echte Imagery OQ-006 | `inspiration-page` |
| REQ-012 | Home-SEO-Block | yes | integration-fake | 🔴 Crawler-Render unverified | `home-seo-block` |
| REQ-013 | V2-Datenmodell additiv | yes | integration-fake | 🔴 only forward compat checked | `catalog-data-model` |
| REQ-014 | Test-Infra | yes | real-boundary-smoke | 🔴 coverage baseline offen | `app-boot.smoke` |
| REQ-015 | Money-Path-Tests | yes | integration-fake | 🔴 BLK-STRIPE-REAL | `checkout.repricing` |
| REQ-016 | Truthful-Claims-Tests | yes | integration-fake | 🔴 needs human eyeball | `truthful-claims`, `noon-fallback-render` |
| REQ-017 | Conformance-Smoke | yes | integration-fake | 🔴 Playwright UNRUN | `conformance-smoke` + 4 weitere |
| REQ-018 | Noon-Fallback-Offenlegung | yes | integration-fake | 🔴 BLK-RED-BAZI (accuracy) | `noon-fallback-render` |

Gesamt: **282 Tests passed, 14 Test-Files, Build: PASS, InkWave-Bundle: 894 kB (gz 242 kB), Playwright: PLANNED-UNRUN.**

## 4. Offene RED-Items — du musst entscheiden

Diese RED-Markierungen sind **echte Begrenzungen, keine Lazyness**. Bevor du committest, brauche ich pro Punkt eine Entscheidung:

1. **BLK-STRIPE-REAL** (REQ-001/002/003/015). Akzeptierst du den Money-Path bei `integration-fake` (gemockter Stripe) und schedulest die Live-Key-Verifikation als separates Ticket? **[accept / block]**
2. **BLK-RED-BAZI** (REQ-004/018). `src/lib/bazi.ts` bleibt Platzhalter. Akzeptierst du, dass der Chart symbolisch ist, bis du eine echte Compute-API anschließt? Copy ist bereits ehrlich reframed. **[accept / block]**
3. **Playwright PLANNED-UNRUN** (REQ-008..013/017). Specs unter `tests/e2e/` sind autoring komplett, aber Chromium fehlt in der Sandbox. Akzeptierst du jsdom-Beweise als Gate-C-Stand und lässt die E2E-Specs lokal/CI auf einer Maschine mit Chromium laufen? **[accept / block]**
4. **Truthful-Copy human review** (REQ-005/006/016). Die banned-phrase-Tests sind grün, aber ein Mensch hat die Copy noch nicht stilistisch durchgesehen. Reichst du die finale Copy-Approval nach? **[approve now / defer to Iter-5]**
5. **Imagery OQ-006** (REQ-011). `/inspiration` zeigt explizit markierte Platzhalter-Kacheln. Du musst echte Bilder beschaffen, das ist nicht im Code-Scope. **[accept placeholder / block until imagery]**

Wenn alle 5 Punkte `accept`/`approve` sind, kannst du committen. Sonst: nenn mir den Block, dann arbeite ich ihn ab.

## 5. Commit-Checklist (du, nicht der Agent)

Der Agent darf **nicht** committen. Wenn du fertig reviewt hast:

- [ ] Lokal `npm run build` einmal ausführen → grün
- [ ] Lokal `npm test` einmal ausführen → 282 passed
- [ ] **Wichtig: `tests/` ist aktuell UNTRACKED** — vor dem Commit explizit hinzufügen:
  ```bash
  git add tests/ playwright.config.ts vitest.config.ts
  git add docs/ server/pricing.js
  git add src/components/shop/AnalysisPdfsSection.tsx \
          src/components/shop/CompatibilitySection.tsx \
          src/components/shop/FeaturedCollectionSection.tsx \
          src/components/shop/InspirationTeaserSection.tsx \
          src/components/shop/SeoTextSection.tsx \
          src/components/shop/ShopByWorldSection.tsx \
          src/lib/collections.ts src/lib/personalization.ts src/lib/productTypes.ts \
          src/pages/Collection.tsx src/pages/Inspiration.tsx
  git add -u   # alle modifizierten tracked files
  ```
- [ ] **Nicht** committen: `test-results/`, `dist/`, `coverage/` (sollten in `.gitignore` stehen — prüfe)
- [ ] Commit-Message: `feat(webshop-v2): personalization-first MVP — iter 1..4, integration-fake, RED tracked`
- [ ] **Kein `git push` solange du nicht happy bist.** Pull-Request optional.

---

**Footer:** Honest-Ledger: `docs/reality/sizhuatelier-webshop-architecture-v2.evidence.jsonl`. Vollständige Matrix: `docs/traceability.md`. Test-Design: `docs/tests/acceptance-design.md`. **Keine Zeile dieses Dokuments behauptet `production-verified`.**
