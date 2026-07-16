---
description: Erstellt die neue Cosmic-Pulse-Newsletter-Ausgabe aus echten FuFirE-Planetenständen und sendet die Testmail an den Operator
---

Erstelle die neue Cosmic-Pulse-Newsletter-Ausgabe. Arbeite strikt nach
`scripts/newsletter/README.md` (Freigabe-Schleife, Ehrlichkeitsregeln):

1. Führe `node scripts/newsletter/generate-cosmic.mjs` aus — das zieht die
   ECHTEN aktuellen Planetenstände aus unserer eigenen FuFirE-Engine
   (`/v1/transit/now`) und legt 4 Sprach-Entwürfe unter
   `docs/newsletter-drafts/` ab.
2. Ersetze in allen 4 Entwürfen die `[ENTWURF]`-Markierung durch eine kurze,
   seriöse redaktionelle Deutung der angezeigten Stände (2–4 Sätze, Ton:
   ruhig, atelier-typisch). ERLAUBT sind nur Aussagen, die aus den
   angezeigten Fakten folgen (Planet, Zeichen, rückläufig). VERBOTEN:
   Gesundheits-/Heilversprechen, Schicksalsbehauptungen, erfundene Ereignisse.
3. Prüfe jede Sprachfassung auf korrektes HTML (kein kaputtes Layout).
4. Sende die deutsche Fassung als Testmail an den Operator:
   `node scripts/newsletter/send-test.mjs docs/newsletter-drafts/<datei>-de.html $ARGUMENTS`
   (Empfängeradresse als Argument; ohne Argument: nachfragen).
5. Berichte: Welche Stände wurden verarbeitet, welche Deutung wurde ergänzt,
   Testmail-Status. NIEMALS an Abonnenten senden — das ist ein separater,
   manuell freigegebener Schritt.
