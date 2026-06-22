# ADR-002 — Personalisierungs-Eingaben durchreichen + offengelegter Noon-Fallback

- **Status:** accepted — 2026-06-22 (user-confirmed „ja passt")
- **Feature:** `sizhuatelier-webshop-architecture-v2`
- **Bezug:** PRD REQ-004 / REQ-005 / REQ-018 / REQ-016, Ledger ASM-002, Canvas Amendment A
- **Resolves:** ASM-002 (Geburtsort einspeisen vs. Feld entfernen) + neues REQ-018 (Noon-Fallback)

## Kontext

Der Personalisierungsflow erhebt Geburts-**Ort**, **Datum** und **Zeit**, zeigt sie an und
speichert sie — aber `computeChart()` (`src/lib/bazi.ts:26`) kennt keinen `place`-Parameter und
**verwirft** den Ort (Council Amendment A: aktive Falschdarstellung, UWG §5). Die ursprüngliche
Canvas hatte zwei Optionen offen gelassen: Ort in die Platzhalter-Berechnung „einspeisen" (so dass
das Bild sichtbar variiert) **oder** das Feld entfernen — mit dem Hinweis, die genaue Umsetzung im
PRD vom Nutzer bestätigen zu lassen.

Zwei Erkenntnisse haben die Entscheidung geschärft:
1. Die Geburts-Eingaben sind **genuine** Inputs für eine **geplante** Hintergrund-Berechnungs-API
   (Ort + Datum + Zeit → persönliches Geburtsbild). Sie sind kein kosmetisches Beiwerk.
2. Die ausgelieferten Poster sind **Platzhalter**. „Ort variiert das Platzhalter-Bild sichtbar"
   ist daher gegenstandslos — es würde keine echte Wertaussage testen.

## Entscheidung

1. **Eingabefelder bleiben.** Ort/Datum/Zeit werden **nicht** entfernt; das Ortsfeld bleibt
   erhalten. Sie sind die genuinen Inputs für die geplante Berechnungs-API.
2. **Sauberes Durchreichen statt Verwerfen.** `computeChart` nimmt `place`/`date`/`time` und ein
   **`birthTimeUnknown`-Flag** als Parameter an und reicht sie verlustfrei in den
   Personalisierungs-Payload / die Cart-Metadaten durch, damit die künftige API ohne Datenverlust
   andocken kann. **Kein** stiller Verlust einer erhobenen Eingabe.
3. **Kein variierendes Platzhalter-Bild.** Es wird **nicht** implementiert, dass der Ort das
   Platzhalter-Bild sichtbar verändert (gegenstandslos, da Poster = Platzhalter).
4. **`bazi.ts` bleibt Platzhalter (RED für ACCURACY).** Kein echter Engine-Ausbau (`OQ-004`); der
   `*-fake`-/RED-Status wird in jedem Report getragen und **nie** als „fertige Engine" berichtet,
   bis die reale API verdrahtet ist.
5. **Noon-Fallback mit Offenlegung (REQ-018).** Ist die Geburtszeit unbekannt
   (`birthTimeUnknown = true`), setzt das System die verarbeitete Zeit deterministisch auf
   **12:00 (Noon)** und **legt dies sichtbar offen** — als Hinweis nahe der Geburtszeit-Eingabe und
   in der Personalisierungs-/Cart-Zusammenfassung, sinngemäß: „Wenn die Geburtszeit unbekannt ist,
   verwenden wir 12:00 Uhr — das kann das Ergebnis beeinflussen." (EN/DE/FR). **Kein stiller
   Default.**
6. **Ehrliche Copy (REQ-005).** Keine Behauptung eines präzisen/exakten berechneten BaZi-Charts,
   solange der Chart Platzhalter ist und/oder der Noon-Fallback aktiv ist.

## Konsequenzen

- **Positiv:** Die „collect-display-discard"-Täuschung (UWG-Risiko) wird **geschlossen, nicht
  launderiert** — über genuine Inputs + saubere Durchreichung + ehrliches Framing + offengelegten
  Noon-Fallback. Die geplante API kann später ohne Schema-Bruch andocken.
- **Maschinell prüfbar:** Payload/Cart-Metadaten enthalten `place`/`date`/`time`/`birthTimeUnknown`
  deterministisch (REQ-016 AK-1); bei gesetztem Flag ist die verarbeitete Zeit `12:00` und der
  Offenlegungs-Hinweis rendert in EN/DE/FR (REQ-016 AK-5).
- **Dauerhaft RED-geführt:** `bazi-chart` bleibt `value-risk` / `*-fake` an einem wertstiftenden
  Boundary, bis die reale Berechnungs-API verbunden ist.
- **Scope-Disziplin:** `bazi.ts`-Änderung eng begrenzt auf Signatur + Durchreichung + Noon-Fallback;
  kein Engine-Ausbau.
