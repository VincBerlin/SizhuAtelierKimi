# Newsletter-Werkstatt (Operator-Batch #9/#11 — vorbereitet, NICHT aktiviert)

EIN festes Marken-Template (`template.mjs`), jede Ausgabe unterscheidet sich
nur durch ihre Inhaltsblöcke. Zwei Serien geplant: **Shop-News** (Poster,
Angebote) und **Cosmic Pulse FUSION** (Operator 2026-07-17: BaZi + Western,
weil der Shop beide Chart-Welten anbietet — BaZi-Tagessäulen via
`/v1/calculate/bazi`, Planetenstände via `/v1/transit/now`; nichts erfunden).

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
