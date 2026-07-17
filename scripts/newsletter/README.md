# Newsletter-Werkstatt (Operator-Batch #9/#11 — vorbereitet, NICHT aktiviert)

EIN festes Marken-Template (`template.mjs`), jede Ausgabe unterscheidet sich
nur durch ihre Inhaltsblöcke. DREI Serien (Operator 2026-07-18), alle über
dieselbe Inhaltsdatei-Struktur + denselben Editor (edit.mjs → :3220):

| Serie | Generator | Inhalt |
|---|---|---|
| **Cosmic Pulse** (Tagesimpuls) | `generate-cosmic.mjs` | Fusion BaZi-Tagessäulen (`/v1/calculate/bazi`) + Planetenstände (`/v1/transit/now`) — nichts erfunden |
| **Angebot der Woche** | `generate-offer.mjs` | Rotation per ISO-Kalenderwoche über kuratierte Shop-SKUs; Preise verbindlich aus `server/pricing.js` |
| **Rabattcode** | `create-promo.mjs` → `generate-promo.mjs` | bewirbt NUR echte, an der Stripe-Kasse einlösbare Codes (allow_promotion_codes aktiv) |

Transaktions-Mails (bereits im Server, Domain verifiziert): Bestellbestätigung
+ Operator-Kopie (orders@), Newsletter-Double-Opt-In (newsletter@),
Passwort-Reset (orders@), Abmeldung via GET /api/newsletter/unsubscribe.

## Ablauf einer Ausgabe (Freigabe-Schleife)

```bash
# 1. Ausgabe erzeugen: editierbare Inhaltsdatei + 4 Sprach-HTMLs
node scripts/newsletter/generate-cosmic.mjs

# 2. MANUELL EINGREIFEN (Operator-Oberfläche): Texte je Sprache bearbeiten,
#    Live-Vorschau, Speichern rendert sofort neu
node scripts/newsletter/edit.mjs        # → http://localhost:3220

#    (alternativ: <datum>-cosmic.content.json editieren und neu rendern:)
node scripts/newsletter/render-cosmic.mjs docs/newsletter-drafts/<datum>-cosmic.content.json

# 3. Testmail NUR an den Operator
node scripts/newsletter/send-test.mjs docs/newsletter-drafts/<datei>-de.html du@deine-mail

# 4. Nach Freigabe: Broadcast an die bestätigten Abonnenten (siehe unten)
```

## Broadcast (VORBEREITET — Aktivierungs-Gate, Stand 2026-07-18)

Server-Route `POST /api/newsletter/broadcast` versendet eine Ausgabe an alle
BESTÄTIGTEN Abonnenten aus der eigenen Datenbank — jede:r in der eigenen
Sprache, mit PERSONALISIERTEM Abmeldelink. Solange
`NEWSLETTER_BROADCAST_SECRET` nicht gesetzt ist, antwortet die Route 503:
**der Broadcast ist damit bewusst deaktiviert.**

Aktivierung (nur der Operator):
1. Starkes Secret erzeugen (z. B. `openssl rand -hex 24`).
2. `NEWSLETTER_BROADCAST_SECRET=…` in `Shop/.env` UND als Railway-Variable.
3. Probelauf (zählt nur, sendet nichts):
   `node scripts/newsletter/broadcast.mjs cosmic 2026-07-17`
4. Echter Versand (bewusstes --send):
   `node scripts/newsletter/broadcast.mjs cosmic 2026-07-17 --send`

## Automatisierung (bewusst noch aus)

Der wöchentliche Lauf wird über einen geplanten Claude-Code-Auftrag (z. B.
`/schedule`, Cron) aktiviert, der Schritt 1 ausführt, den Deutungstext
verfasst und die Testmail an den Operator schickt — **der Versand an
Abonnenten bleibt manuell freigegeben.** Aktivierung erst auf explizite
Operator-Anweisung; dann wird hier der konkrete Zeitplan dokumentiert.

## Ehrlichkeitsregeln

- Planetenstände/Ereignisse kommen ausschließlich aus `/v1/transit/*` —
  der Generator schreibt nur belegbare Fakten plus neutralen Rahmentext.
- Entwürfe tragen eine sichtbare `[ENTWURF]`-Markierung, bis der
  Deutungstext redaktionell ergänzt wurde.
- `send-test.mjs` sendet an genau EINE explizit angegebene Adresse — ein
  Broadcast an echte Abonnenten existiert in diesen Skripten nicht.
