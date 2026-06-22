# ADR-001 — Server-autoritative Re-Preisung über `productId` + `variantId`

- **Status:** accepted — 2026-06-22 (user-confirmed „ja passt")
- **Feature:** `sizhuatelier-webshop-architecture-v2`
- **Bezug:** PRD REQ-001 / REQ-002 / REQ-015, Ledger ASM-001, Canvas Amendment B
- **Resolves:** ASM-001 (Re-Preis-Identitäts-Mapping)

## Kontext

`/api/checkout` (`server/index.js:197-204`) berechnet den an Stripe übergebenen `unit_amount`
aus dem **client-gelieferten** `it.unitAmount`, und der Versand (`shippingCents`,
`server/index.js:194,215-217`) ist ebenfalls client-seitig. Eine manipulierte Cart-Payload
ermöglicht damit einen 1-Cent-Checkout (Sicherheitsrisiko, Council Amendment B).

Für eine server-autoritative Re-Preisung braucht der Server eine **stabile Identität** je
Cart-Line, um den autoritativen Preis nachzuschlagen. Der aktuelle Client-Payload
(`checkout.ts:33-39`) keyt Lines jedoch nur per **Title** plus `unitAmount`/`meta` — es gibt
keine stabile `productId`/`variantId`. Title-basiertes Mapping ist fragil (i18n, Umbenennung,
Varianten-Kollision).

## Entscheidung

1. Der Client-Checkout-Payload (`checkout.ts`) wird erweitert und sendet pro Line eine stabile
   **`productId`** sowie eine **`variantId`**, die die kaufrelevanten Varianten-Achsen
   (Size / Format / Frame) eindeutig identifiziert. Dies ändert das Client-Checkout-Interface
   bewusst (bisher nur Title-Keying).
2. Der Server ermittelt `unit_amount` **ausschließlich** aus einer **server-eigenen
   Preisquelle** (`productId` + `variantId` → Cent) und **ignoriert** `it.unitAmount`.
3. Der Versand wird server-seitig nach der bestehenden, dokumentierten Regel berechnet
   (Region via CDN-Header; EU-Schwelle `FREE_SHIP_THRESHOLD = 80`; US/UK frei; sonst `4.90`,
   über Schwelle frei) und **ignoriert** das Client-Feld `shippingCents`.
4. Die server-eigene Preisquelle nutzt **vorerst die bestehenden Platzhalterpreise**
   (`catalog.ts` Poster-`price` + `bazi.ts` `sizes[].delta`; `Personalize.tsx`
   `PRODUCT_TYPES[].basePrice` + `PDF_ADDON_PRICE`), bis der Operator reale Preise liefert
   (`OQ-002`). Die Quelle ist **server-owned** (Single Source of Truth), Client-Anzeigewerte
   müssen mit ihr übereinstimmen — Diskrepanz = Testfehler.
5. Unbekannte `productId`/`variantId` → `4xx`, **keine** Stripe-Session.

## Konsequenzen

- **Positiv:** 1-Cent-Checkout-Loch geschlossen; Preis/Versand client-unabhängig; Re-Preisung
  maschinell beweisbar (REQ-015: Tampering-Tests rot ohne Fix, grün mit Fix; Stripe gemockt).
- **Breaking (bewusst):** Das Client-Checkout-Interface (`checkout.ts`) ändert sich
  (Title-Keying → `productId` + `variantId`). Aufrufstellen, die den Payload bauen, müssen die
  IDs mitliefern; bestehende Checkout-Invarianten (Metadaten-Chunking, Gast/Account-Pfad,
  Mengen-Clamping `1..99`) dürfen nicht regredieren (REQ-003).
- **Offen (nicht-blockierend):** Reale Preise/Versandtabellen liefert der Operator separat
  (`OQ-002`/`OQ-003`); bis dahin Platzhalterpreise als autoritative Quelle. Reale Stripe-Session-
  Verifikation gegen echte Keys ist im Run nicht erreichbar — höchste erreichbare Evidenz =
  `integration-fake` (gemockter Stripe).
- **Scope-Disziplin:** Nur die Checkout-Route in `server/index.js` wird angefasst;
  Auth/Newsletter/Credits/Address-Logik und DB-Schema bleiben unberührt.
