---
description: Erstellt den wöchentlichen Angebots-Newsletter (Rotations-Produkt der Kalenderwoche) und sendet die Testmail an den Operator
---

Erstelle den Angebots-Newsletter der Woche. Regeln wie in
`scripts/newsletter/README.md` (Freigabe-Schleife, Ehrlichkeit):

1. `node scripts/newsletter/generate-offer.mjs` — wählt deterministisch das
   Rotations-Produkt der aktuellen Kalenderwoche (Preis kommt verbindlich aus
   server/pricing.js) und erzeugt Inhaltsdatei + 4 Sprach-HTMLs.
2. Ersetze in der Inhaltsdatei (`editions.<lang>.interpretation`) die
   [ENTWURF]-Markierung durch 1–2 warme, ehrliche Sätze, warum dieses Stück
   diese Woche hervorgehoben wird (keine erfundenen Knappheits-/Rabatt-
   Behauptungen — es ist ein Wochen-Feature, kein Preisnachlass). Danach:
   `node scripts/newsletter/render-offer-cli.mjs` gibt es nicht — rendere über
   den Editor-Speichern-Knopf ODER mit Node:
   `node -e "import('./scripts/newsletter/render-offer.mjs').then(m=>m.renderOfferEdition('docs/newsletter-drafts/<datum>-offer.content.json'))"`
3. Weise auf die Kontroll-Oberfläche hin (`node scripts/newsletter/edit.mjs`
   → http://localhost:3220).
4. Testmail an den Operator:
   `node scripts/newsletter/send-test.mjs docs/newsletter-drafts/<datum>-offer-de.html $ARGUMENTS`
5. NIEMALS an Abonnenten senden — separater, manuell freigegebener Schritt.
