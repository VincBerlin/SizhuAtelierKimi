---
description: Legt einen echten Stripe-Rabattcode an und erstellt den Rabattcode-Newsletter dazu (Testmail an den Operator)
---

Erstelle einen Rabattcode-Newsletter. EHRLICHKEITS-REGEL: Es wird NUR ein
Code beworben, der wirklich bei Stripe existiert und an der Kasse einlösbar
ist (allow_promotion_codes ist aktiv).

Argumente ($ARGUMENTS): `CODE PROZENT [TAGE] [MAX] [testmail@adresse]`
— fehlen sie, frage den Operator nach Code-Text und Prozent.

1. Code echt anlegen:
   `node scripts/newsletter/create-promo.mjs CODE PROZENT [TAGE] [MAX]`
   (bricht laut ab, wenn Stripe ablehnt — dann NICHT weitermachen).
2. Newsletter erzeugen (Werte aus Schritt-1-Ausgabe):
   `node scripts/newsletter/generate-promo.mjs CODE PROZENT GUELTIG_BIS`
3. Ersetze in der Inhaltsdatei die [ENTWURF]-Markierung durch EINEN warmen
   redaktionellen Satz (kein Druck, keine falsche Knappheit). Neu rendern:
   `node -e "import('./scripts/newsletter/render-promo.mjs').then(m=>m.renderPromoEdition('docs/newsletter-drafts/<datum>-promo.content.json'))"`
4. Kontroll-Oberfläche erwähnen (http://localhost:3220), Testmail an den
   Operator via send-test.mjs.
5. NIEMALS an Abonnenten senden — separater, manuell freigegebener Schritt.
   Hinweis im Bericht: livemode true/false (Test- vs. Live-Code) IMMER nennen.
