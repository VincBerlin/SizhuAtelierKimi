# Product Vision — SizhuAtelier Webshop Architektur V2

- **Feature Slug:** `sizhuatelier-webshop-architecture-v2`
- **Status:** `user-confirmed`  ← (erlaubt: `draft` | `confirmed`/`user-confirmed` | `blocked`)
- **confirmed-by-user:** `yes — 2026-06-22`
- **Erstellt:** 2026-06-22 · Rolle `product-owner` (Vision-Gate, vor Entwicklung)
- **Canvas (verbindlich, user-confirmed):** [`docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md`](../canvas/sizhuatelier-webshop-architecture-v2.canvas.md)
- **PRD (Entwurf):** [`docs/prd/sizhuatelier-webshop-architecture-v2.prd.md`](../prd/sizhuatelier-webshop-architecture-v2.prd.md)
- **Run-State:** [`docs/context/state.md`](../context/state.md)
- **Branch:** `feat/personalization-first-mvp`

> Diese Vision wurde am **2026-06-22 vom Nutzer bestätigt** („ja passt"), zusammen mit der PRD und
> nach Auflösung von ASM-001 (ADR-001) und ASM-002 (ADR-002). Kein Agent hat sie selbst bestätigt.
> Phase 0 ist abgeschlossen: **PRD UND Product Vision** sind beide user-confirmed (2026-06-22),
> Value-Checks (`VCHK-*`) existieren, keine ungelösten Widersprüche. Diese Vision bleibt konsistent
> zur user-confirmed Canvas (Problem, Zielnutzer, Wertversprechen, Success-Signal).

---

## 0. Warum diese Vision (Rahmung)

Dies ist **kein Neubau**, sondern ein **Konformitäts-/Lückenschluss-Pass** auf einem bereits zu
~70 % gebauten, teils erst kürzlich performance-optimierten Shop. Die Vision misst Erfolg deshalb
**nicht** an „neuen Features", sondern an einer Frage: *Verdient der bestehende Shop am Ende das
Vertrauen der Kund:innen — ist er nicht nur grün, sondern wert-echt und produktions-echt?* Der
Council-Gate (Amendments A–E) hat drei wertschädigende Lücken sichtbar gemacht (Preis-Manipulation,
Geburtsort-Verwerfung, irreführende Präzisions-Claims). Diese Vision macht aus „technisch gebaut"
ein „für den Menschen ehrlich nützlich".

---

## 1. Vision Statement (Kernsatz)

> **Für Menschen, die einem persönlichen oder atmosphärischen Moment einen ruhigen, ostasiatisch-
> minimalistischen Platz an ihrer Wand geben wollen, ist SizhuAtelier ein kuratierter Shop, der
> aus den eigenen Geburtsdaten ein persönliches symbolisches Kunstwerk macht — und aus kuratiertem
> TCM-/Wuxing-Wissen seriöse Fachgrafiken — und der dabei genau das hält, was er sagt: kein
> Versprechen mehr als das Produkt einlöst, kein Preis anders als angezeigt, keine Heilbehauptung,
> keine erhobene Eingabe, die heimlich verworfen wird.**

Der V2-Pass ist erfüllt, wenn der Shop dem Nutzer **dieselbe Klarheit wie eine große Posterplattform**
bietet (Architektur, Navigation, kuratierte Kaufpfade), aber **ruhiger, ehrlicher und
vertrauenswürdiger** bleibt — und wenn jede dieser Eigenschaften am laufenden Produktions-System
(nicht an einem Mock) belegt ist.

---

## 2. Zielnutzer / Kund:in (Wer profitiert?)

Konsistent zu Canvas §2 / PRD §2 (Actors A1/A2):

- **A1 — Primär (B2C):** Käufer:innen personalisierter, ostasiatisch-minimalistischer Wandkunst —
  Geschenk-Käufer:innen, Paare, Menschen mit Interesse an BaZi/Selbstreflexion, Japandi-/Wabi-Sabi-
  Ästhetik. **Was ändert sich für sie?** Sie verstehen im ersten Screen das Angebot, finden in den
  richtigen Kaufpfad; *ihre* Eingaben (inkl. Geburtsort) werden vollständig erfasst und für die
  geplante Berechnungs-API getragen statt heimlich verworfen — kein hohles Versprechen (der Chart
  bleibt bis zur API-Verbindung ehrlich als Platzhalter geführt).
- **A2 — Sekundär:** TCM-Praktiker:innen / Praxisräume / Lernende, die **nicht personalisierte**
  TCM-/Wuxing-Fachposter direkt kaufen. **Was ändert sich für sie?** Sie bekommen seriöse,
  regelkonforme Wissensgrafiken ohne Heilversprechen, in ihrer Sprache (DE/FR).
- **A3 — Operator (mittelbar):** kann gefahrlos live gehen, weil der Kaufpfad nicht mehr unter dem
  echten Preis ausgehebelt werden kann und keine rechtlich gefährdenden Claims ausgeliefert werden.
- **A4 — Angreifer:in (Gegenakteur):** soll **nicht** profitieren — ein manipulierter Cart-Payload
  darf keinen unterpreisigen Kauf mehr erlauben.

---

## 3. Das Nutzerproblem (Warum kümmert es sie? Wann nutzen sie es?)

- **Heute (Ist):** Der Shop existiert und läuft, aber (a) er nimmt den Geburtsort entgegen, zeigt
  und speichert ihn — und **verwirft ihn dann in der Berechnung** (`computeChart()` in
  `src/lib/bazi.ts` kennt keinen `place`-Parameter); zudem fehlt eine offengelegte Behandlung
  unbekannter Geburtszeiten; (b) er bewirbt eine „100 % exakte mathematische BaZi-Berechnung /
  Präzisions-API", die das Produkt nicht hat; (c) er erlaubt technisch einen 1-Cent-Checkout, weil
  der Server den Client-Preis akzeptiert (`server/index.js:202`); (d) DE/FR-Kund:innen landen teils
  auf englischen Rechtstexten; (e) die V2-Architektur (Modulfolge, Mega-Menü, per-Welt-Collections,
  Inspiration, SEO-Block) ist unvollständig.
- **Wann relevant:** beim ersten Eindruck (verstehe ich das Angebot?), beim Personalisieren (werden
  *meine* Eingaben vollständig erfasst und nicht heimlich verworfen — und sehe ich, wenn eine
  Annahme wie der Noon-Fallback getroffen wird?), beim Bezahlen (stimmt der Preis, sind die
  Versandkosten echt?), beim Lesen von Inhalten (werde ich getäuscht oder seriös informiert?).
- **Kern:** Der bestehende Shop ist **vorhanden-aber-noch-nicht-vertrauenswürdig-und-noch-nicht-V2-
  konform** — nicht „nicht vorhanden".

---

## 4. Kernnutzenversprechen (DARF NICHT GEBROCHEN WERDEN)

Das Versprechen aus Canvas §4 („Dein Geburtsmoment, traditionelle Symbolik und TCM-Wissen als
minimalistisches, ostasiatisch inspiriertes Kunstwerk — premium, ruhig, kuratiert"), **verschärft um
die Ehrlichkeitsgrenze**, die dieser Pass durchsetzt:

1. **Ehrliche Personalisierung:** Was der Shop als Eingabe verlangt (Datum, Zeit, **Ort** + ein
   Zeit-unbekannt-Flag), muss vollständig **erfasst und sauber für die geplante Berechnungs-API
   durchgereicht** werden (im Payload / in den Cart-Metadaten nachweisbar). Eine erhobene,
   angezeigte und gespeicherte Eingabe darf **niemals heimlich verworfen** werden. Ist die
   Geburtszeit unbekannt, wird der 12:00-Fallback **offengelegt**, nicht still gesetzt. (Der Chart
   selbst bleibt RED-geführt Platzhalter, bis die API verbunden ist.)
2. **Ehrliche Sprache über das Produkt:** Es darf **keine** exakte mathematische BaZi-Engine / keine
   „Präzisions-API" behauptet werden. Das Produkt ist ein „personalisiertes symbolisches Kunstwerk,
   inspiriert von deinen Geburtsdaten" — und sagt das auch so. (Der Platzhalter-Charakter der
   Berechnung bleibt RED-geführt und wird nie als „fertige Engine" berichtet.)
3. **Ehrlicher Preis:** Der bezahlte Preis und Versand werden **server-autoritativ** bestimmt; der
   Client kann sie nicht diktieren. „Sicherer Checkout" ist ein gehaltenes Versprechen.
4. **Keine Heilversprechen:** TCM-/Wuxing-Inhalte sind kuratierte Wissens-/Fachgrafiken, **keine**
   medizinischen Wirk-/Heilaussagen.
5. **Ruhig & kuratiert statt überladen:** klare Architektur einer großen Plattform, aber unaufgeregt
   — der bestehende performance-optimierte Hero/Einstieg bleibt erhalten.

Bricht das ausgelieferte Produkt **eine** dieser fünf Zeilen, ist die Vision **nicht** erfüllt,
auch wenn alle Tests grün sind.

---

## 5. Success Signals (Woran erkennen wir, dass die Vision erfüllt ist?)

Wert-orientiert (über reine Funktionserfüllung hinaus). Jedes Signal ist an einen Value-Check
`VCHK-*` gekoppelt, den QA später als **Kundennutzen** (nicht nur Funktion) verifizieren muss.

| ID | Success Signal (Kundennutzen) | Verknüpfte REQ / Check |
|---|---|---|
| **VCHK-01** | Die Geburts-Eingaben (**Ort, Datum, Zeit** + Zeit-unbekannt-Flag) werden **vollständig erfasst und sauber durchgereicht** für die geplante Chart-Berechnungs-API — im Personalisierungs-Payload / in den Cart-Metadaten nachweisbar vorhanden, keine erhobene Eingabe wird heimlich verworfen. Der Chart bleibt ehrlich Platzhalter (RED), bis die API verbunden ist. | REQ-004 / REQ-016 AK-1 |
| **VCHK-09** | Kennt der Käufer die Geburtszeit nicht, verwendet das System **12:00 Uhr (Noon)** und **legt diese Annahme sichtbar offen** (Hinweis am Eingabefeld + in der Zusammenfassung, EN/DE/FR) — kein stiller Default. | REQ-018 / REQ-016 AK-5 |
| **VCHK-02** | Nirgends im ausgelieferten Text (EN/DE/FR) wird eine „exakte/präzise BaZi-Berechnung" oder „Präzisions-API" behauptet; das Framing ist ehrlich „symbolisches Kunstwerk". | REQ-005 / REQ-016 AK-2 |
| **VCHK-03** | Ein manipulierter Cart (z. B. `unitAmount: 1`, `shippingCents: 0`) führt **niemals** zu einem unterpreisigen Kauf — Stripe erhält den Serverpreis + Server-Versand. | REQ-001/002/015 |
| **VCHK-04** | TCM-/Wuxing-Inhalte enthalten **kein** Heilversprechen; ein:e TCM-Praktiker:in würde sie als seriöse Fachgrafik einordnen. | REQ-006 / REQ-016 AK-3 |
| **VCHK-05** | DE-/FR-Kund:innen lesen Rechtstexte in ihrer Sprache; ausstehende Operator-Daten sind ehrlich als `[MISSING]` + Review-Banner markiert (kein erfundener Inhalt). | REQ-007 / REQ-016 AK-4 |
| **VCHK-06** | Ein:e Erstbesucher:in versteht im ersten Screen das Angebot und findet mobil (360/390/430) ohne Horizontal-Scroll in den richtigen Kaufpfad; Modulfolge 1–13 + Mega-Menü + per-Welt-Collections + Inspiration + SEO-Block sind über den **Produktions-Composition-Root** (`App.tsx`) real erreichbar. | REQ-008/009/010/011/012 / REQ-017 |
| **VCHK-07** | Der performance-optimierte Hero/InkWave-Einstieg ist **nicht** regrediert (kein LCP-Rückschritt ggü. Baseline-Commits) — Klarheit wurde nicht gegen Geschwindigkeit eingetauscht. | NFR-1/2 / REQ-017 AK-3, T-21 |
| **VCHK-08** | Saju/Junishi tauchen in keiner Route/Daten/SEO mehr auf (negativer Nachweis) — das Angebot bleibt fokussiert. | REQ-008 AK-4 / REQ-017 AK-4 |

> **KPI-Hinweis (`MEASURE_NEEDED`):** Konkrete Conversion-/Lighthouse-Schwellen sind in Canvas/PRD
> als `MISSING` markiert (`KPI-MISSING`, `OQ-008`). Bis der Operator/Recherche sie liefert, gilt
> „keine Regression ggü. Baseline" als Guard. Diese Vision macht **Ehrlichkeit + reale Erreichbarkeit**
> zum primären Erfolgssignal, nicht eine erfundene Zahl.

---

## 6. Explizite Non-Goals (Was diese Vision NICHT verspricht)

Konsistent zu Canvas §7 / PRD §1.2:

- **Keine** echte BaZi-Engine (astronomisch korrekte Vier-Säulen-/Solar-Term-/Längengrad-Berechnung).
  Der Platzhalter bleibt — RED-geführt für ACCURACY (`OQ-004`).
- **Kein** Rebuild und **kein** freier Umbau jenseits des Conformance-Scopes; Bestandscode außerhalb
  der Checkout-Route, Auth/Newsletter/Credits, DB-Schema werden **nicht** angefasst.
- **Keine** erfundenen Operator-Daten (Firmenname, USt-ID, Gerichtsstand, reale Preise, Fulfillment,
  echte Produktbilder, finale SEO-Keywords) — diese liefert der Operator separat (`OQ-002/003/005/006/007`).
- **Keine** Saju-/Junishi-Bereiche, **keine** Raum-Kategorie-Landingpages, **keine** zusätzlichen
  Hauptnav-Einträge (>6), **keine** Analytics mit Fake-Daten.
- **Keine** Aussage „BaZi-Engine fertig" — der `*-fake`-Status wird in jedem Report ehrlich getragen.

---

## 7. Was als FALSCHE oder SCHÄDLICHE Implementierung zählt (konkret)

Diese Liste ist der Maßstab des **Final Value Gate**. Jede dieser Formen ist „grün, aber wertlos
oder wert-schädigend" — und damit ein Vision-Bruch, auch wenn Tests/Review/QA passieren.

1. **Die Fake-Chart als akkurat ausliefern.** Den Platzhalter-`computeChart` so framen, als wäre er
   eine echte astrologische Berechnung — oder das RED/`*-fake`-Etikett aus Reports entfernen, ohne
   dass eine echte Engine existiert. (Konfabulation des Produktstands. **Escalation-Asymmetrie:** nur
   der Nutzer darf dies zur „bekannten Einschränkung" herabstufen — kein Agent.)
2. **Über das 1-Cent-Re-Pricing-Loch verkaufen.** Den Checkout live nehmen, solange der Server den
   Client-Preis oder Client-`shippingCents` akzeptiert (`server/index.js:202,194,215-217`). Eine
   „Re-Preisung", die in Wahrheit nur den Clientwert spiegelt oder gegen einen Mock statt gegen die
   echte Stripe-Line-Item-Übergabe getestet ist, zählt ebenfalls als FALSCH.
3. **TCM-Heilversprechen.** TCM-/Wuxing-Inhalte ausliefern, die „heilt/lindert Krankheit/therapiert/
   cures/treats/guérit" o. Ä. behaupten — oder grenzwertige Wirkversprechen (z. B. „nachweislich
   beruhigend") unentschärft lassen. (HWG/UWG/EU-Risiko, Non-Goal-Verletzung.)
4. **Den Hero für Spec-Treue regredieren.** Die Modulfolge 1–13 / Optik so „exakt" herstellen, dass
   der performance-optimierte Hero/InkWave (Commits `0133437`/`0f8995c`/`d56de04`) langsamer wird,
   das Reduced-Motion-Fallback oder das Lazy-Three.js-Splitting verloren geht. Spec-Fidelity darf
   gemessene Performance/LCP **nicht** schlagen (harte Nebenbedingung NFR-1).
5. **Eingabe-Verwerfung „launderieren".** Das Feld kosmetisch behalten, aber Ort/Datum/Zeit (oder
   das Zeit-unbekannt-Flag) **nicht** in den Personalisierungs-Payload / die Cart-Metadaten
   durchreichen — oder die FAQ „aus Datum, Zeit und **Ort** werden die Säulen **berechnet**" stehen
   lassen, obwohl der Chart Platzhalter bleibt und keine echte Berechnung stattfindet. Ebenso
   FALSCH: den **12:00-Noon-Fallback still** setzen, ohne ihn am Eingabefeld + in der Zusammenfassung
   offenzulegen. (Aktive Falschdarstellung / Verschweigen, Amendment A; REQ-004/REQ-018.)
6. **Scheinbare Reachability.** Collections/Inspiration als isolierte Komponenten „grün" zeigen, die
   über den echten Composition-Root (`App.tsx`) gar nicht erreichbar sind — gebaut, aber nicht
   verdrahtet. (Reality-Ledger-Bruch.)
7. **Erfundener Inhalt als echt.** Platzhalter-Preise, -Bilder oder -Operator-Rechtsdaten als reale
   Daten ausgeben, statt sie als `[MISSING]`/Platzhalter ehrlich zu markieren.

---

## 8. Reality-Check / Gegenthese (Pflicht-Beat — pro Top-Feature)

Für jedes Top-Feature die Frage: *Könnte das voll grün sein und trotzdem null Kundennutzen liefern?*

| Feature | Gegenthese (grün, aber wertlos?) | Reality-Anker / wired-in-prod? |
|---|---|---|
| Eingabe-Durchreichung + Noon-Fallback (REQ-004/REQ-018) | Test prüft nur, dass `place`-Param existiert, aber Payload/Cart-Metadaten verlieren ihn still, oder der Noon-Fallback wird gesetzt ohne Offenlegung. | Assertion, dass `place`/`date`/`time`/`birthTimeUnknown` **im realen Payload / in den Cart-Metadaten** ankommen; bei unbekannter Zeit ist `12:00` gesetzt **und** der Offenlegungs-Hinweis rendert (EN/DE/FR). Chart bleibt RED-Platzhalter. |
| Re-Pricing (REQ-001/002) | Test gegen Stub, der den Clientwert zurückspiegelt → „grün", aber Loch offen. | Assertion auf den **realen** Stripe-Line-Item (`unit_amount` == Serverpreis), Stripe gemockt aber Pfad echt. |
| Copy-Reframe (REQ-005) | Nur Demo-Strings geändert, Live-i18n-Keys bleiben irreführend. | Scan über die **ausgelieferten** EN/DE/FR-Keys, Verbots-Phrasenliste. |
| V2-Konformität (REQ-008/010/011) | Komponenten existieren, sind aber nicht in `App.tsx` verdrahtet. | E2E über **Produktions-Composition-Root** auf realen Breakpoints. |
| Hero (NFR-1) | „kein Regress" nur behauptet, nicht gemessen. | LCP-Vergleich vor/nach; bis Schwelle vorliegt: Baseline-Guard. |

> Trifft ein I/O-/Remote-/External-API-/UI-berührendes Feature auf `*-fake` oder fehlt der
> `wired-in-prod?`-Test, ist das ein **BLOCKER** und darf **nicht** vom Agenten zur „bekannten
> Einschränkung" herabgestuft werden — nur der Nutzer (Escalation-Asymmetrie).

---

## 9. Was QA als Kundennutzen verifizieren muss (VCHK → Tests)

QA prüft nicht „wurde es gebaut?", sondern „entsteht der versprochene Wert?":
- **VCHK-01/02/09** über REQ-016 (Eingabe-Durchreichung, Präzisions-Verbotsliste, Noon-Fallback-Offenlegung) — beweist *ehrliche Personalisierung*.
- **VCHK-03** über REQ-015 (Tampering-Tests, rot ohne Fix) — beweist *ehrlichen Preis*.
- **VCHK-04** über REQ-016 AK-3 (Heilversprechen-Verbotsliste) — beweist *keine Heilversprechen*.
- **VCHK-05** über REQ-016 AK-4 (Legal DE/FR, `[MISSING]` erhalten) — beweist *ehrliche Lokalisierung*.
- **VCHK-06/07/08** über REQ-017 + NFR-1/2 (Conformance-Smoke, Mobile, Hero-Guard, kein Saju/Junishi)
  — beweist *kuratierte, reale, schnelle Erreichbarkeit*.

---

## 10. Link zurück zur Canvas & PRD

- **Canvas (verbindlich):** [`docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md`](../canvas/sizhuatelier-webshop-architecture-v2.canvas.md)
  — Problem (§1), Zielnutzer (§2), Value Proposition (§4), Success Signal (§5), Risks/Contradictions
  (§8), Reality Ledger (§9). Diese Vision ist mit allen vier konsistent und ergänzt die
  Ehrlichkeitsgrenze aus Council-Amendments A–E.
- **PRD (Entwurf):** [`docs/prd/sizhuatelier-webshop-architecture-v2.prd.md`](../prd/sizhuatelier-webshop-architecture-v2.prd.md)
  — REQ-001..017, Akzeptanzkriterien, Traceability-Matrix (§9).

---

## 11. True-Line-Felder (Vision-Ebene)

| Feld | Wert |
|---|---|
| **vision-link** | `docs/vision/sizhuatelier-webshop-architecture-v2.vision.md` (dieses Dokument) |
| **value-check-id** | `VCHK-01..VCHK-09` (siehe §5; pro Top-REQ in §9 zugeordnet; `VCHK-09` = Noon-Fallback-Offenlegung) |
| **true-line-status** | `user-confirmed` (2026-06-22) — Nutzer hat Vision + PRD bestätigt („ja passt"); Plumbline-Watcher-`pass` folgt in Phase 0.5. Wert-Pfad ist freigegeben. |

## 12. Sechs Canvas-Traceability-Pflichtfelder (Vision-Ebene)

| Feld | Wert |
|---|---|
| **canvas-link** | `docs/canvas/sizhuatelier-webshop-architecture-v2.canvas.md` |
| **canvas-problem** | Bestehender Shop ist vorhanden-aber-nicht-vertrauenswürdig + nicht-V2-konform: Geburtsort-Verwerfung, irreführende Präzisions-Claims, 1-Cent-Checkout-Loch, fehlende DE/FR-Rechtstexte, unvollständige V2-Architektur (Canvas §1, §8). |
| **canvas-target-user** | A1 B2C-Käufer:innen personalisierter Wandkunst; A2 TCM-Praktiker:innen/Lernende; mittelbar A3 Operator (Canvas §2). |
| **canvas-value-claim** | „Dein Geburtsmoment + Symbolik + TCM-Wissen als ruhiges, ostasiatisch-minimalistisches Kunstwerk — premium, kuratiert" + Ehrlichkeitsgrenze (kein hohles/irreführendes Versprechen, kein manipulierbarer Preis, keine Heilversprechen) (Canvas §4). |
| **canvas-success-signal** | Modulfolge 1–13, ≤6 Hauptnav, mobil ohne Horizontal-Scroll, erster Screen kommuniziert Angebot + CTA, jede MVP-Collection mit H1/Intro/Grid/SEO/FAQ/Links, real über `App.tsx` erreichbar; Hero/LCP nicht regrediert; Ehrlichkeits-Checks grün (Canvas §5, erweitert in §5 dieser Vision). |
| **canvas-risk-status** | `value-risk` (offen): Kernwert vs. Fake-Boundary (`bazi.ts` Platzhalter, `OQ-004`); Preis-Manipulation; irreführende Claims; Hero-Regressionsrisiko. Wird durch REQ-001..017 + NFR-1 geschlossen bzw. RED-geführt; abschließende Bewertung im Final Value Gate. |

---

## 13. Bestätigungsblock

Bestätigung erfolgt **nicht** durch einen Agenten. Der Nutzer hat **PRD und Vision am 2026-06-22
bestätigt** („ja passt", inkl. der user-confirmed Entscheidungen D1–D5; ASM-001/ASM-002 → ADR-001/
ADR-002). Phase 0 ist damit abgeschlossen.

```
I confirm this Product Vision as the basis for AgileTeam planning.
```

**Status `user-confirmed`, confirmed-by-user: yes — 2026-06-22.** Entwicklung folgt der
Council-Priorisierung (SECURITY + TRUTHFUL-CLAIMS vor V2-CONFORMANCE).
