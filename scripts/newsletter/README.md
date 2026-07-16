# Newsletter-Werkstatt (Operator-Batch #9 — vorbereitet, NICHT aktiviert)

EIN festes Marken-Template (`template.mjs`), jede Ausgabe unterscheidet sich
nur durch ihre Inhaltsblöcke. Zwei Serien geplant: **Shop-News** (Poster,
Angebote) und **Cosmic Pulse** (echte Planetenstände aus der eigenen
FuFirE-Engine — nichts erfunden).

## Ablauf einer Ausgabe (Freigabe-Schleife)

```bash
# 1. Entwurf erzeugen (4 Sprachen → docs/newsletter-drafts/)
node scripts/newsletter/generate-cosmic.mjs

# 2. Entwurf prüfen/verfeinern (Deutungstext ersetzt die [ENTWURF]-Markierung)

# 3. Testmail NUR an den Operator
node scripts/newsletter/send-test.mjs docs/newsletter-drafts/<datei>.html du@deine-mail

# 4. Nach Freigabe: Versand als Resend-Broadcast an die Audience
#    (Audience-Sync + Broadcast-Schritt folgen in einem eigenen Batch)
```

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
