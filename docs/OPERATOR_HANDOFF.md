# SizhuAtelier — Operator Handoff (pre-launch)

Stand: 20.07.2026. Dieses Dokument trennt technische Konfiguration von Angaben
und Freigaben, die nur der Betreiber liefern kann. Es dürfen keine echten
Zahlungen angenommen werden, solange ein Blocker in Abschnitt 1 offen ist.

## 1. Harte Go-live-Blocker

- **Unternehmen und Stripe Live:** Gewerbe/Einzelunternehmen anmelden,
  steuerliche Erfassung abschließen und die von Stripe verlangten echten
  Unternehmens- und Steuerdaten einreichen. Eine private 11-stellige Steuer-ID
  gehört nicht in ein ausdrücklich als `USt-IdNr.` bezeichnetes Feld.
- **Rechtsseiten:** alle `[MISSING — …]`-Marker in `src/lib/legal.ts` mit den
  echten Betreiberangaben, Versandbedingungen und Rückgaberegeln ersetzen und
  rechtlich prüfen lassen.
- **Katalog-Poster:** je Poster und Format eine druckfertige PDF gemäß
  `print-assets/README.md` liefern und in `server/printAssets.js` registrieren.
  Fehlende Dateien führen absichtlich zu einem lauten Fulfillment-Fehler.
- **Verpackungsrecht:** Verantwortlichkeit mit Gelato schriftlich klären. Für
  Deutschland LUCID-/Systembeteiligung vor dem ersten physischen Verkauf
  prüfen; die ab 12.08.2026 geltenden PPWR-Regeln im Ergebnis berücksichtigen.
- **Live-Nachweis:** erst nach den obigen Punkten einen kontrollierten echten
  Kauf vollständig bis zum Gelato-Draft prüfen. Die Stripe-Testkarte `4242 …`
  funktioniert nur im Testmodus, nicht im Live-Modus.

## 2. Railway-Umgebungsvariablen

Referenz: `.env.example`. Geheimnisse nie committen oder in Tickets kopieren.

| Variable | Erforderlich für | Verhalten wenn sie fehlt |
|---|---|---|
| `STRIPE_SECRET_KEY` | Checkout, Stripe-Kunden, Portal | Checkout/Portal nicht verfügbar |
| `STRIPE_WEBHOOK_SECRET` | Signaturprüfung des Zahlungs-Webhooks | Webhook antwortet 503 |
| `DATABASE_URL` | bezahlte Bestellungen, Accounts, Newsletter, Drucke | Webhook antwortet 500, damit Stripe erneut zustellt |
| `PUBLIC_URL` | Redirects, Druckdateien, E-Mail-Links | Railway-Domain/Request-Origin als Fallback; explizit setzen |
| `SESSION_SECRET` | signierte Sitzungen | Authentifizierung deaktiviert |
| `FUFIRE_API_URL` / `FUFIRE_API_KEY` | personalisierte Berechnungen | personalisierte Produktion nicht möglich |
| `GELATO_API_KEY` | Druck und Versand | Gelato-Übergabe deaktiviert |
| `GELATO_ORDER_TYPE` | Freigabemodus | Für den Start ausdrücklich `draft` setzen |
| `FULFILLMENT_RETRY_SECRET` | geschützte manuelle Wiederholung | Retry-Route antwortet 503 |
| `RESEND_API_KEY` | Bestell-, Fehler- und Konto-E-Mails | keine E-Mails |
| `ORDER_FROM_EMAIL` | Absender für Bestellmails | Code-Standardwert |
| `ORDER_NOTIFY_EMAIL` | neue Bestellungen und Fulfillment-Alarme | keine Operator-Alarme |

`SESSION_SECRET` und `FULFILLMENT_RETRY_SECRET` jeweils unabhängig und zufällig
erzeugen, zum Beispiel lokal mit:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## 3. Stripe: sicherer Wechsel von Test auf Live

1. Zuerst prüfen, dass Railway aus dem freigegebenen `main`-Commit deployt und
   `/api/health` für Stripe, DB und E-Mail den erwarteten Zustand meldet.
2. Im Stripe-Testmodus den Checkout und den Webhook
   `checkout.session.completed` erneut mit einer Testbestellung prüfen.
3. Nach erfolgreicher Stripe-Verifizierung in der **Live-Umgebung** einen
   separaten Webhook `POST {PUBLIC_URL}/api/webhook` anlegen und nur
   `checkout.session.completed` abonnieren.
4. In einer Railway-Änderung `STRIPE_SECRET_KEY=sk_live_…` und den zu diesem
   Live-Endpoint gehörenden `STRIPE_WEBHOOK_SECRET=whsec_…` setzen. Test- und
   Live-Secrets niemals mischen. Deployment kontrolliert neu starten.
5. Customer Portal im Live-Modus aktivieren. Danach eine kleine echte
   Eigenbestellung ausführen und Stripe-Ereignis, `orders`-Datensatz,
   Operator-Mail, PDF und Gelato-Draft einzeln belegen.
6. Gelato-Draft manuell prüfen und erst dann freigeben. Vollautomatik
   (`GELATO_ORDER_TYPE=order`) ist eine spätere bewusste Entscheidung.

Bei einem Fehler vor erfolgreicher Datenbank-Speicherung antwortet der Webhook
mit HTTP 500, damit Stripe erneut zustellt. Fulfillment-Fehler nach der
Speicherung werden als fehlgeschlagen markiert, per E-Mail gemeldet und über die
idempotente Retry-Route erneut angestoßen.

## 4. Bereits technisch abgesichert

- Checkout-Preise und Versand werden serverseitig aus Produkt-ID, Variante und
  Region berechnet; vom Client gesendete Beträge werden ignoriert.
- Personalisierte Produkte ohne vollständige Pflichtdaten werden vor Stripe
  blockiert.
- Stripe-Webhook-Signaturen werden gegen den Railway-Secret geprüft.
- Bezahlte Bestellungen müssen persistiert sein, bevor der Webhook HTTP 200
  zurückgibt.
- Druck- und Gelato-Ablauf sind idempotent; fehlende Katalog-PDFs scheitern laut
  und können nach Lieferung des Assets wiederholt werden.
- Gelato-Produkt-UIDs und die unterstützten Druckformate sind im Code zentral
  zugeordnet.

## 5. Restliche Betreiberentscheidungen

- Newsletter-Broadcast: Wochentag, Uhrzeit und Zeitzone festlegen.
- Endpreise und Gratisversand-Schwelle erst nach Testläufen verbindlich
  festlegen; zentrale Quellen sind `src/lib/productTypes.ts` und
  `server/pricing.js`.
- Optionales eigenes Poster-Design in `Shop/design-input/` liefern.
- Premium-PDF der 195-Euro-Analyse als eigener Abnahmeschritt (10–15 Seiten)
  fertigstellen, bevor das Produkt live verkauft wird.

## 6. Finale Freigabe-Checkliste

- [ ] Gewerbe/steuerliche Erfassung und Stripe-Live-Verifizierung abgeschlossen.
- [ ] Rechtsseiten ohne `[MISSING]`, fachlich und sprachlich geprüft.
- [ ] Verpackungsverantwortung/LUCID/Systembeteiligung dokumentiert.
- [ ] Alle Katalog-Druck-PDFs registriert und testgerendert.
- [ ] Build, vollständige Tests und Lint auf dem freigegebenen Commit grün.
- [ ] Railway-Quelle und deployter Commit dokumentiert.
- [ ] Testmodus-End-to-End-Test grün.
- [ ] Live-Secrets und Live-Webhook gemeinsam gesetzt; Customer Portal aktiv.
- [ ] Kontrollierte echte Bestellung bis zum Gelato-Draft belegt.
- [ ] Mobile-Prüfung auf 360/390/430 px an der deployten URL abgeschlossen.
- [ ] Preise, Versandkosten und Gratisversand-Schwelle final freigegeben.
