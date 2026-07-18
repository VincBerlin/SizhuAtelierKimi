// Rabattcode-Newsletter (eigene Serie, Operator 2026-07-18). Bewirbt NUR
// Codes, die zuvor mit create-promo.mjs echt bei Stripe angelegt wurden.
//
// Aufruf: node scripts/newsletter/generate-promo.mjs CODE PROZENT GUELTIG_BIS(YYYY-MM-DD)
import { writeFileSync, mkdirSync } from 'node:fs'
import { renderPromoEdition } from './render-promo.mjs'

const [code, percentArg, until] = process.argv.slice(2)
const percent = Number(percentArg)
if (!code || !Number.isFinite(percent) || !/^\d{4}-\d{2}-\d{2}$/.test(until || '')) {
  console.error('Aufruf: generate-promo.mjs CODE PROZENT GUELTIG_BIS(YYYY-MM-DD)')
  process.exit(2)
}
const SHOP = 'https://sizhuatelier-shop-production.up.railway.app'
const stamp = new Date().toISOString().slice(0, 10)

const COPY = {
  en: { subject: `${percent} % off — your atelier code inside`, title: `Your ${percent} % atelier code`, intro: 'A small thank-you from the atelier — enter this code at checkout:', note: `Valid until ${until} · one use per order · enter at the secure Stripe checkout`, interpretation: '[DRAFT: one warm editorial sentence, to be added before approval]', ctaText: 'Redeem in the shop' },
  de: { subject: `${percent} % Rabatt — dein Atelier-Code liegt bei`, title: `Dein ${percent}-%-Atelier-Code`, intro: 'Ein kleines Dankeschön aus dem Atelier — gib diesen Code an der Kasse ein:', note: `Gültig bis ${until} · einmal pro Bestellung · Eingabe an der sicheren Stripe-Kasse`, interpretation: '[ENTWURF: ein warmer redaktioneller Satz — vor Freigabe ergänzen]', ctaText: 'Im Shop einlösen' },
  fr: { subject: `${percent} % de remise — votre code atelier`, title: `Votre code atelier de ${percent} %`, intro: 'Un petit merci de l’atelier — saisissez ce code au paiement :', note: `Valable jusqu’au ${until} · une utilisation par commande · à saisir au paiement sécurisé Stripe`, interpretation: '[BROUILLON : une phrase éditoriale chaleureuse à ajouter avant validation]', ctaText: 'Utiliser dans la boutique' },
  es: { subject: `${percent} % de descuento — tu código del atelier`, title: `Tu código del atelier del ${percent} %`, intro: 'Un pequeño agradecimiento del atelier — introduce este código al pagar:', note: `Válido hasta ${until} · un uso por pedido · se introduce en el pago seguro de Stripe`, interpretation: '[BORRADOR: una frase editorial cálida pendiente de aprobación]', ctaText: 'Canjear en la tienda' },
}

const content = {
  kind: 'promo',
  date: stamp,
  promo: { code, percent, until },
  ctaHref: SHOP,
  editions: Object.fromEntries(['en', 'de', 'fr', 'es'].map((l) => [l, { eyebrow: 'Atelier', ...COPY[l] }])),
}

mkdirSync('docs/newsletter-drafts', { recursive: true })
const contentPath = `docs/newsletter-drafts/${stamp}-promo.content.json`
writeFileSync(contentPath, JSON.stringify(content, null, 2))
console.log(`Inhaltsdatei: ${contentPath}`)
for (const f of renderPromoEdition(contentPath)) console.log(`Entwurf: ${f}`)
