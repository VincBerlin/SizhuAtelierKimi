# Product Canvas — SizhuAtelier Webshop Architecture V2

- **Feature Slug:** `sizhuatelier-webshop-architecture-v2`
- **Status:** `user-confirmed`  ← (erlaubt: `draft` | `user-confirmed` | `blocked`)
- **Erstellt:** 2026-06-22 (Orchestrator i. d. Rolle `requirements-analyst`, CORE-Modus)
- **Quelle:** `~/Downloads/sizhuatelier_webshop_architektur_exact_v2.md` (SRC-001..005) + Repo-Recon (Stand `feat/personalization-first-mvp`)
- **Confirmed by user:** yes — re-bestätigt 2026-06-22 nach Council-Amendments A–E mit „Ja, Canvas bestätigt"

> ⚠️ Diese Canvas ist ein **Entwurf**. Kein Agent darf sie selbst bestätigen. PRD-Finalisierung,
> Product Vision und jede Entwicklung sind blockiert, bis der Nutzer sie explizit bestätigt.

## Vom Nutzer entschieden (2026-06-22)
| Entscheidung | Wahl |
|---|---|
| **Scope-Rahmung** (`OQ-SCOPE`) | **Konformitäts-/Lückenschluss-Pass** auf Bestand. Bestehender, performance-getesteter Code bleibt; nur wo nötig anfassen. KEIN Rebuild. |
| **Plattform** (`OQ-001`) | **Bestehender Custom-Stack** (React 19 + Vite + react-router 7 + Express + Stripe). Keine Migration. |
| **BaZi-Engine** (`OQ-004`) | **Platzhalter bleibt vorerst.** `src/lib/bazi.ts` wird NICHT zur echten Engine ausgebaut. Wird ehrlich als Reality-Ledger `*-fake` / RED geführt und NIE als „fertig" berichtet. (Legitime Nutzer-Reklassifizierung des Pfads — kein Laundering.) |
| **Legal** (`OQ-005`) | Rechtstexte (Impressum/AGB/Widerruf) **außerhalb dieses Runs** (Status „nicht launch-fertig", Nutzer liefert echte Daten separat) — **kein Code-Blocker mehr**. ABER: **TCM-Heilversprechen-Content-Review läuft IM Run** (Acceptance-Gate). |
| Inhalts-OQs (`OQ-002/003/006/007/008`) | Als **nicht-code-blockierende Content-TODOs / Platzhalter** geführt (Preise, Fulfillment, Bilder, SEO-Keywords, Ink-Wave-Mobile-Messung). Werden im Reality-Ledger sichtbar gehalten. |

## Council-Gate (Phase 0.16) — adoptierte Amendments (2026-06-22)
Der Council-Challenge-Rat (verifiziert im Code) hat fehlpriorisierte/irreführende Punkte gefunden;
der Nutzer hat gesteuert (kein Agent). Adoptierte Änderungen:

| # | Council-Befund (belegt) | Nutzerentscheid | Konsequenz für Scope |
|---|---|---|---|
| A | **Geburtsort wird verlangt+angezeigt+gespeichert, aber von `computeChart()` (`bazi.ts:26`) verworfen** → aktive Falschdarstellung (UWG §5), von „Platzhalter/RED" NICHT abgedeckt. | **Ehrlich machen** | **NEU IN SCOPE (blocking, truthful-claims). Exakte Umsetzung vom Nutzer bestätigt 2026-06-22 (ADR-002, PRD REQ-004/005/018):** Die Geburts-Eingabefelder (Ort/Datum/Zeit) **bleiben** — sie sind genuine Inputs für eine **geplante** Berechnungs-API; der Personalisierungs-Payload erfasst und reicht `place`/`date`/`time` + ein `birthTimeUnknown`-Flag sauber durch (kein stiller Verlust). **Kein** Entfernen des Ortsfelds und **kein** „Ort variiert das Platzhalter-Bild sichtbar" (gegenstandslos, da Poster = Platzhalter). PLUS Copy-Reframe „dein BaZi-Chart" → „personalisiertes symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten" UND Offenlegung des 12:00-Noon-Fallbacks bei unbekannter Geburtszeit (REQ-018). `bazi.ts` bleibt Platzhalter (RED für ACCURACY), bis die reale API verbunden ist (kein Engine-Ausbau). |
| B | **Server vertraut Client-Preis** (`server/index.js:202`, nur Positiv-Check L204; `shippingCents` Client-seitig L194/L215) → 1-Cent-Checkout möglich. | **„Alles zusammen"** (Sicherheit inkl.) | **NEU IN SCOPE (blocking, security):** server-autoritative Re-Preisung (Preis-Map nach Produkt-ID/Variante) + server-berechneter Versand. Touch `server/index.js`. |
| C | TCM/Wuxing-Health-Claims = HWG/EU-Risiko, aber billiger String-Audit. | im Run (war schon so entschieden) | **Launch-gating String-Sweep**, gebündelt mit dem Truthful-Claims-Pass (A). |
| D | „Modulfolge 1–13 exakt" kollidiert mit gerade gelandeten Hero/Perf-Fixes (Commits `0133437`,`0f8995c`,`d56de04`). | **„Alles zusammen"** (Optik voll drin) | Modulfolge 1–13 **bleibt im Scope**, ABER **harte Nebenbedingung: niemals Hero/LCP regredieren** (Performance-Tests als Guard). Volles Mega-Menü + per-Welt-Collections + Inspiration + Home-SEO-Block bleiben drin. |
| E | Legal war **Fehlalarm** der Canvas: Routen + AGB/Widerruf/Datenschutz existieren als `MISSING()`-Templates (`legal.ts`, `App.tsx:75-79`); Rest = Operator-Dateneingabe + DE/FR-Lokalisierung. | Korrektur akzeptiert | Rechtstext-**Inhalte/Operator-Daten** (Firmenname, USt, Gerichtsstand) bleiben außerhalb; **DE/FR-Lokalisierung vorhandener Rechtstexte** kommt in den Truthful-Claims-Pass. |

**Konzept-Risiken (vom Nutzer zur Kenntnis genommen, nicht run-blockierend):** DACH-Nachfrage
unvalidiert; Moat nur Ästhetik; zwei gegensätzliche Zielgruppen via einer IA. → als Vision-/Retro-
Themen geführt, nicht als Code-Blocker.

---

## 0. Reality-Check (zentral — vor allen Feldern lesen)

Die Architekturdatei ist als **„exakte Architekturübernahme, baue den Shop nach diesem Schema"**
formuliert und führt ein Ledger (Abschnitt 20) mit `OQ-001 Shop-Plattform = MISSING`,
`OQ-004 BaZi-Berechnung = MISSING` usw. — d. h. sie liest sich wie ein **Greenfield-Brief**.

Das Repo widerspricht dieser Rahmung: **der Shop existiert bereits zu großen Teilen** als
lauffähige Full-Stack-Anwendung (React 19 + Vite + react-router 7 + Express + Stripe + optional
Postgres, i18n EN/DE/FR, Ink-Wave-Hero mit Reduced-Motion-Fallback, Personalisierungsflow,
PDP, Cart, Checkout). Saju/Junishi sind **bereits vollständig entfernt**; TCM und Wuxing sind
**bereits integriert**.

**Konsequenz (muss der Nutzer entscheiden, kein Agent):** Diese V2 ist realistisch **kein
Neubau, sondern ein Konformitäts-/Lückenschluss-Pass** auf einer bestehenden, teils erst
kürzlich performance-optimierten Codebasis. Das ist die zentrale OPEN QUESTION dieser Canvas
(siehe `OQ-SCOPE` unten). Bis sie geklärt ist, ist die Bedeutung des Begriffs „exakte
Übernahme" gegen bereits ausgelieferten Code nicht eindeutig.

---

## 1. Problem
**Explicit (SRC-001/002):** Der bestehende SizhuAtelier-Shop soll in Aufbau, Shop-Logik,
Seitenarchitektur, Modulreihenfolge und Gestaltungssystem **dem V2-Architekturschema
entsprechen** — kuratiert, mobile-first, nicht überladen — damit ein Besucher im ersten Screen
das Angebot (personalisierte BaZi-Poster + kuratierte TCM/Wuxing-Fachposter, Premium-Print)
sofort versteht und in den richtigen Kaufpfad findet.

**Reale Lücke (Repo-Recon, das eigentliche zu lösende Problem):** Der bestehende Shop weicht an
mehreren Stellen vom V2-Schema ab — u. a. Homepage-Modulfolge, fehlende Module (Inspiration/
Gallery, Home-SEO-Textblock), kein echtes Mega-Menü (nur einfaches Dropdown), keine
per-Produktwelt-Collection-Routen (`/collections/bazi-posters` etc.; nur `/tcm` existiert).

## 2. Target user / customer
**Explicit (SRC, Abschnitt 2.2):**
- **Primär (B2C):** Käufer:innen personalisierter, ostasiatisch-minimalistischer Wandkunst —
  Geschenk-Käufer, Paare, Menschen mit Interesse an BaZi/Selbstreflexion, Japandi/Wabi-Sabi-Ästhetik.
- **Sekundär:** TCM-Praktiker:innen / Praxisräume / Lernende (TCM-/Wuxing-Fachposter, **nicht**
  personalisiert, Direktkauf).

## 3. Current workaround (Ist-Zustand)
**Explicit (Repo):** Es existiert ein lauffähiger Shop mit Home, PDP (`/product/:id`),
einseitigem Personalisierungsflow (`/personalize`), Collection-Hub (`/collections`),
TCM-Übersicht (`/tcm`), Blog/Wissen, FAQ, Kontakt, Legal, Cart-Drawer, Stripe-Checkout.
Katalog/Content sind **hartkodiert** in `src/lib/catalog.ts` (kein CMS); BaZi-Chart ist
**Platzhalter-Logik** (`src/lib/bazi.ts`). Keine Tests (kein vitest/playwright). Der Shop ist
also nicht „nicht vorhanden", sondern **vorhanden-aber-noch-nicht-V2-konform**.

## 4. Value proposition (Kernnutzenversprechen — darf nicht gebrochen werden)
**Explicit (SRC 2.2 „Red Thread"):** „Dein Geburtsmoment, traditionelle Symbolik und
TCM-Wissen als minimalistisches, ostasiatisch inspiriertes Kunstwerk." Premium, ruhig,
ostasiatisch, kuratiert — **klarer und unaufgeregter als eine große Posterplattform**, aber mit
deren klarer Architektur.

## 5. Success signal (woran erkennen wir Erfüllung?)
**Explicit/Assumption gemischt** (Abschnitt 16 Acceptance Criteria):
- Homepage folgt der V2-Modulfolge 1–13; ≤6 Hauptnav-Einträge; Saju/Junishi nirgends aktiv;
  TCM/Wuxing sauber integriert.
- Mobile zuerst nutzbar (Header → Drawer → Sections → PDP → Flow → Cart), kein Horizontal-Scroll.
- Erster Screen kommuniziert Angebot + Personalisierungs-CTA; jede MVP-Collection hat H1, Intro,
  Grid, SEO-Text, FAQ, interne Links.
- **`ASSUMPTION` (kein messbares Ziel in der Datei):** konkrete Conversion-/Performance-KPIs
  (z. B. CR, Lighthouse-Score-Schwelle) sind **MISSING** → `MEASURE_NEEDED`.

## 6. Core use case
**Explicit:** (a) Besucher landet → versteht Angebot → wählt Produktwelt (BaZi/TCM/Wuxing) →
BaZi: Personalisierungsflow (Geburtsdaten → Chart-Vorschau → Design → Format → Cart);
TCM/Wuxing: Direktkauf (Varianten → Cart) → Checkout.

## 7. Non-goals (explizit ausgeschlossen)
**Explicit (SRC 0, 3.1, 12.3):**
- Saju oder Junishi als aktive Bereiche/Filter/Produkte/Routen/Artikel (bleiben entfernt).
- Freier Umbau der Homepage-Modulfolge ohne neue Freigabe.
- Zusätzliche Hauptnav-Einträge ohne Notwendigkeit (>6).
- Raum-Kategorie-Landingpages (Wohnzimmer/Küche/…), zu viele Größen-/Filter-Indexseiten.
- Heilversprechen bei TCM-Inhalten.
- Analytics mit Fake-Daten (erst nach echtem Event-Konzept).

## 8. Risks / contradictions
- **`CONTRA-CANDIDATE-1` (Scope):** „Exakte Architekturübernahme" vs. bereits ausgelieferter,
  abweichender, performance-optimierter Code (z. B. Home-Modulfolge, Hero). „Exakt" gegen
  Bestand ist mehrdeutig. → siehe `OQ-SCOPE`.
- **`CONTRA-CANDIDATE-2` (Kernwert vs. Fake-Boundary):** Das Kernversprechen ist „dein
  Geburtsmoment als Kunstwerk", aber `src/lib/bazi.ts` ist **Platzhalter-Berechnung**. Ein
  personalisiertes Produkt mit *erfundenem* Chart untergräbt das Value-Promise. (Reality-Ledger:
  `*-fake` an einem wertstiftenden Boundary → RED, bis echt.) `OQ-004` aus der Datei.
- **`BLOCKER` (Recht, OQ-005):** Rückgabe personalisierter Produkte + TCM-Claims rechtlich
  ungeprüft; Legal-Seiten enthalten Platzhalter, DE/FR-Rechtstexte teils noch Englisch.
- **Preis-Manipulation (aus OPERATOR_HANDOFF §2):** `/api/checkout` vertraut client-seitigem
  `unitAmount` → serverseitige Re-Preisung nötig vor echten Zahlungen. (Sicherheits-Risiko.)
- **MISSING-Ledger (SRC 20):** OQ-001 Plattform, OQ-002 Preise, OQ-003 Fulfillment,
  OQ-006 Produktbilder, OQ-007 SEO-Keywords, OQ-008 Ink-Wave-Mobile-Performance-Messung.

## 9. Evidence needed (Reality Ledger — was muss bewiesen werden, nicht nur „grün")
- Echte Reachability der MVP-Routen durch den **Produktions-Composition-Root**
  (`src/App.tsx`/`main.tsx`), nicht nur isolierte Komponenten-Renders.
- Mobile-Bedienbarkeit (Drawer, Stepper, Sticky-CTA) auf realen Breakpoints (360/390/430) —
  `real-boundary-smoke` minimum, nicht nur Unit.
- Ink-Wave-Performance auf Mobile **gemessen** (OQ-008), Reduced-Motion-Pfad verifiziert.
- BaZi-Chart-Korrektheit: ist die Berechnung echt oder Platzhalter? (`OQ-004`).
- Keine Saju/Junishi-Reste in Routen/Daten/SEO (negativer Nachweis).

## 10. Allowed change scope (Phase 0.6 PRIL Scope Guard) — „Alles zusammen"
**Im Scope:**
- `src/pages/**`, `src/components/**`, `src/sections/**` (UI/Seiten/Module, volle V2-Optik:
  Modulfolge 1–13, Mega-Menü, per-Welt-Collections, Inspiration, Home-SEO-Block).
- `src/lib/catalog.ts`, `src/lib/tokens.ts`, `src/i18n/translations.ts` (Content/Tokens/i18n,
  inkl. Copy-Reframe + DE/FR-Lokalisierung vorhandener Rechtstexte).
- `src/App.tsx`, `src/main.tsx` (Routing/Composition-Root).
- `src/lib/bazi.ts` — **eng begrenzte** Änderung: Geburtsort in die **Platzhalter**-Berechnung
  einspeisen (Output ändert sich sichtbar mit dem Ort). **KEIN** echter BaZi-Engine-Ausbau.
- `server/index.js` — **nur die Checkout-Route**: server-autoritative Re-Preisung + Versand
  (Amendment B). Auth/Newsletter/Credits-Logik NICHT anfassen.
- **Test-Infrastruktur neu** (`tests/**`, vitest + playwright config) — money-path & truthful-claims
  zuerst, dann Konformität.

**Außerhalb des Scopes (ohne separate Freigabe NICHT anfassen):**
- Echte BaZi-Engine (korrekte Vier-Säulen-/Solar-Term-Berechnung) — Platzhalter bleibt (`OQ-004`).
- `server/index.js` jenseits der Checkout-Route; DB-Schema-Änderungen.
- **Rechtstext-Inhalte/Operator-Daten** (Firmenname, USt-ID, Gerichtsstand, reale Preise,
  Fulfillment) — Operator liefert separat (`OQ-005`, `OQ-002/003`).

---

## OPEN QUESTIONS / BLOCKERS — Status nach Nutzerentscheid 2026-06-22

| ID | Feld | Status | Auflösung |
|---|---|---|---|
| `OQ-SCOPE` | Scope-Rahmung | ✅ RESOLVED | Konformitäts-/Lückenschluss-Pass auf Bestand. |
| `OQ-001` | Plattform | ✅ RESOLVED | Bestehender Custom-Stack, keine Migration. |
| `OQ-004` | BaZi-Engine | ✅ RESOLVED (RED-geführt) | Platzhalter bleibt; als Reality-Ledger `*-fake`/RED geführt, nie als fertig berichtet. |
| `OQ-005` | Recht | ✅ RESOLVED (entblockt) | Rechtstexte außerhalb Run (nicht launch-fertig); TCM-Claim-Review im Run. Kein Code-Blocker mehr für Phase 1. |
| `OQ-002/003/006/007/008` | Preise/Fulfillment/Bilder/SEO/Perf | ✅ RESOLVED (Content-TODO) | Nicht-code-blockierende Platzhalter; im Reality-Ledger sichtbar. |

**Keine product-critical OPEN QUESTION / BLOCKER mehr offen** → Phase-1-Eintritt nicht mehr durch
Canvas-Lücken blockiert (sobald Canvas user-confirmed + Council-Gate + PRD + Vision durchlaufen).

---

## Traceability (wird in `docs/traceability.md` materialisiert, sobald PRD steht)
- `canvas-link`: dieses Dokument.
- Pflichtfelder pro Top-REQ (folgen mit PRD): `canvas-problem`, `canvas-target-user`,
  `canvas-value-claim`, `canvas-success-signal`, `canvas-risk-status`.
- True-Line-Felder: `vision-link`, `value-check-id`, `true-line-status` (mit Vision).

## Confirmation block
Bestätigung erfolgt **nicht** durch einen Agenten. Der Nutzer bestätigt mit dem exakten Satz:

```
I confirm this Product Vision as the basis for AgileTeam planning.
```
(bzw. die Canvas-spezifische Bestätigung, sobald die OPEN QUESTIONS oben geklärt sind.)
