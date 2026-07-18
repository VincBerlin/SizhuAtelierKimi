---
description: Erstellt die neue Cosmic-Pulse-Newsletter-Ausgabe aus echten FuFirE-Planetenständen und sendet die Testmail an den Operator
---

Erstelle die neue Cosmic-Pulse-FUSION-Ausgabe (BaZi + Western — der Shop
bietet beide Chart-Welten an). Arbeite strikt nach
`scripts/newsletter/README.md` (Freigabe-Schleife, Ehrlichkeitsregeln):

1. Führe `node scripts/newsletter/generate-cosmic.mjs` aus — das zieht die
   ECHTEN Daten aus unserer eigenen FuFirE-Engine (BaZi-Säulen des heutigen
   Tages via `/v1/calculate/bazi` + westliche Planetenstände via
   `/v1/transit/now`) und legt die editierbare Inhaltsdatei
   (`<datum>-cosmic.content.json`) plus 4 Sprach-HTMLs unter
   `docs/newsletter-drafts/` ab.
2. Ersetze in der Inhaltsdatei (`editions.<lang>.interpretation`) die
   `[ENTWURF]`-Markierung durch eine kurze, seriöse Deutung, die BEIDE
   Traditionen verbindet (2–4 Sätze, Ton: ruhig, atelier-typisch). ERLAUBT
   sind nur Aussagen, die aus den angezeigten Fakten folgen (Säulen-Element/
   Tier, Planet, Zeichen, rückläufig). VERBOTEN: Gesundheits-/Heilversprechen,
   Schicksalsbehauptungen, erfundene Ereignisse. Danach neu rendern:
   `node scripts/newsletter/render-cosmic.mjs docs/newsletter-drafts/<datum>-cosmic.content.json`
3. Prüfe jede Sprachfassung auf korrektes HTML (kein kaputtes Layout).
4. Weise den Operator auf die manuelle Kontroll-Oberfläche hin:
   `node scripts/newsletter/edit.mjs` → http://localhost:3220 (Texte je
   Sprache bearbeiten, Live-Vorschau, Speichern rendert neu).
5. Sende die deutsche Fassung als Testmail an den Operator:
   `node scripts/newsletter/send-test.mjs docs/newsletter-drafts/<datei>-de.html $ARGUMENTS`
   (Empfängeradresse als Argument; ohne Argument: nachfragen).
6. Berichte: Welche Stände/Säulen wurden verarbeitet, welche Deutung wurde
   ergänzt, Testmail-Status. NIEMALS an Abonnenten senden — das ist ein
   separater, manuell freigegebener Schritt.
