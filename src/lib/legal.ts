// Legal content (REQ-039/040 + REQ-007). IMPORTANT: real company/legal facts are
// NOT invented — every entity-specific value is a clearly-marked [MISSING — …]
// placeholder for the operator to complete before go-live. The English bodies are
// the structural template; localized DE/FR versions translate the *prose* while
// keeping EVERY [MISSING — …] marker verbatim (never filled with invented operator
// data) and keeping the legally-cautious return/withdrawal wording semantically
// identical across languages. A professional legal review is still required (the
// Legal page renders a per-language review banner saying so).
import type { Lang } from '../i18n/translations'

export interface LegalSection {
  heading?: string
  body: string[]
}
export interface LegalDoc {
  key: string
  title: string
  sections: LegalSection[]
}

// [MISSING — …] markers are IDENTICAL across all languages: the marker text is the
// operator's TODO, not user-facing prose, so it is intentionally left in English in
// every locale. This guarantees AT-007-2 (same marker count/positions per lang) and
// makes the "do not invent operator data" contract auditable.
const MISSING = (what: string) => `[MISSING — ${what}; complete before go-live]`

// ── Per-language review banner (REQ-007 AK-4). Rendered on every legal page in
//    the active language; the next coder reads this from data instead of the
//    English string previously hard-coded in Legal.tsx. ──────────────────────
export const LEGAL_REVIEW_BANNER: Record<Lang, string> = {
  EN: 'This page is a structural template. Items marked [MISSING — …] must be completed with the operator’s real legal details, and a professional legal review (plus localized DE/FR versions) is required before go-live.',
  DE: 'Diese Seite ist eine strukturelle Vorlage. Mit [MISSING — …] markierte Angaben müssen mit den echten rechtlichen Daten des Betreibers ergänzt werden; eine professionelle Rechtsprüfung (inkl. lokalisierter DE/FR-Fassungen) ist vor dem Go-live erforderlich.',
  FR: 'Cette page est un modèle structurel. Les éléments marqués [MISSING — …] doivent être complétés avec les données légales réelles de l’exploitant, et une révision juridique professionnelle (ainsi que les versions localisées DE/FR) est requise avant la mise en ligne.',
  // REQ-015 / T-501 — the ES banner HONESTLY discloses that the ES legal pages
  // still render the English structural template: legal prose is deliberately NOT
  // machine-translated (a wrong legal translation is worse than the reviewed
  // English source). A localized ES legal version is a launch-blocking TODO.
  ES: 'Esta página es una plantilla estructural y, por ahora, se muestra en inglés. Los elementos marcados [MISSING — …] deben completarse con los datos legales reales del operador, y se requiere una revisión jurídica profesional (incluida una versión localizada en español) antes del lanzamiento.',
}

// ═══════════════════════════════════════════════════════════════════════════
// EN — structural template (source of truth for marker positions)
// ═══════════════════════════════════════════════════════════════════════════

const impressum_EN: LegalDoc = {
  key: 'impressum',
  title: 'Impressum / Legal Notice',
  sections: [
    { heading: 'Provider', body: [
      'Information pursuant to applicable disclosure requirements (e.g. § 5 DDG / Impressumspflicht).',
      `Legal business name: ${MISSING('registered company / trader name')}`,
      `Responsible person: ${MISSING('owner / managing director')}`,
      `Business address: ${MISSING('street, postal code, city, country')}`,
    ] },
    { heading: 'Contact', body: [
      'Email: hello@sizhuatelier.shop',
      `Phone: ${MISSING('contact phone, if applicable')}`,
    ] },
    { heading: 'Registration & tax', body: [
      `VAT identification number: ${MISSING('VAT ID, if applicable')}`,
      `Commercial register: ${MISSING('register court and number, if applicable')}`,
    ] },
    { heading: 'Dispute resolution', body: [
      'The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr',
      `We are ${MISSING('willing / not obliged')} to participate in dispute-resolution proceedings before a consumer arbitration board.`,
    ] },
  ],
}

const privacy_EN: LegalDoc = {
  key: 'privacy',
  title: 'Privacy Policy / Datenschutz',
  sections: [
    { heading: 'Controller', body: [
      `The controller for data processing on this site is: ${MISSING('controller name and address — same as the Impressum entity')}.`,
      'Contact for privacy matters: hello@sizhuatelier.shop',
    ] },
    { heading: 'What data we process', body: [
      'Personalization data you submit to create your poster: name(s), date, time and place of birth, and your design choices.',
      'Order data: shipping/billing details and email, collected via our payment provider during checkout.',
      'Newsletter data: your email address, language preference and consent, if you sign up.',
    ] },
    { heading: 'Why we process it (purposes & legal bases)', body: [
      'To produce your personalized order and provide customer service (performance of a contract).',
      'To send the newsletter (your consent — withdrawable at any time).',
      'To operate, secure and improve the shop (legitimate interest).',
    ] },
    { heading: 'Processors & third parties', body: [
      'Payments: Stripe (Stripe processes your payment and checkout contact/shipping details).',
      `Hosting & database: ${MISSING('hosting / Postgres provider, e.g. your Railway or DB host')}.`,
      'Transactional email: Resend (order confirmations), when enabled.',
    ] },
    { heading: 'Retention & your rights', body: [
      'We keep order and personalization data as long as needed for fulfilment and legal/tax obligations, then delete it.',
      'You have the right to access, rectify, erase, restrict and port your data, and to object and withdraw consent. Contact us at hello@sizhuatelier.shop.',
      'You may also lodge a complaint with a supervisory authority.',
    ] },
  ],
}

const terms_EN: LegalDoc = {
  key: 'terms',
  title: 'Terms & Conditions / AGB',
  sections: [
    { heading: 'Scope', body: [
      'These terms govern all orders placed through this shop. By placing an order you accept them.',
    ] },
    { heading: 'Contract & prices', body: [
      'A contract is formed when you complete checkout and we confirm your order. Prices are shown at checkout including applicable VAT; shipping is shown separately.',
      'Payment is handled securely by Stripe.',
    ] },
    { heading: 'Personalized products', body: [
      'Each poster is produced specifically from the birth data and design choices you submit. Because it is made to order, it cannot be returned or cancelled once production has started — see our Return Policy.',
      'This does not affect your statutory rights for items that arrive damaged, defective, incorrect or not as described.',
    ] },
    { heading: 'Governing law', body: [
      `Governing law and place of jurisdiction: ${MISSING('governing law / jurisdiction tied to the business location')}.`,
    ] },
  ],
}

const returns_EN: LegalDoc = {
  key: 'returns',
  title: 'Return Policy / Rückgabe & Widerruf',
  sections: [
    { heading: 'Personalized items', body: [
      // REQ-040 — exact safe wording.
      'Because each personalized artwork is generated and produced specifically from your submitted birth data and design choices, personalized items cannot be returned or cancelled once production has started.',
      'This does not affect your statutory rights if your item arrives damaged, defective, incorrect, or not as described.',
    ] },
    { heading: 'Damaged, defective or incorrect items', body: [
      'If your order arrives damaged, defective, incorrect or not as described, contact us at hello@sizhuatelier.shop within a reasonable period. We will arrange a free replacement or a remedy as required by law.',
    ] },
    { heading: 'Digital products', body: [
      'For digital analysis PDFs, you agree that delivery begins immediately and, where applicable, you consent to the loss of the right of withdrawal once delivery has started.',
    ] },
  ],
}

const shipping_EN: LegalDoc = {
  key: 'shipping',
  title: 'Shipping Policy',
  sections: [
    { heading: 'Production & dispatch', body: [
      'Personalized posters are produced after your order and then dispatched. Production typically takes a few business days before shipping.',
      `Carrier and delivery times: ${MISSING('carriers and per-region delivery estimates')}.`,
    ] },
    { heading: 'Shipping costs', body: [
      `Shipping costs are shown at checkout. Free shipping applies above the threshold shown in your cart. ${MISSING('confirm the free-shipping threshold — the cart logic and the announcement bar should state the same figure')}.`,
    ] },
    { heading: 'Damaged in transit', body: [
      'If your item arrives damaged, contact us at hello@sizhuatelier.shop and we will arrange a replacement (see Return Policy).',
    ] },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// DE — localized prose; markers kept verbatim, return wording kept identical
// ═══════════════════════════════════════════════════════════════════════════

const impressum_DE: LegalDoc = {
  key: 'impressum',
  title: 'Impressum / Rechtliche Hinweise',
  sections: [
    { heading: 'Anbieter', body: [
      'Angaben gemäß den geltenden Informationspflichten (z. B. § 5 DDG / Impressumspflicht).',
      `Rechtlicher Firmenname: ${MISSING('registered company / trader name')}`,
      `Verantwortliche Person: ${MISSING('owner / managing director')}`,
      `Geschäftsanschrift: ${MISSING('street, postal code, city, country')}`,
    ] },
    { heading: 'Kontakt', body: [
      'E-Mail: hello@sizhuatelier.shop',
      `Telefon: ${MISSING('contact phone, if applicable')}`,
    ] },
    { heading: 'Registrierung & Steuer', body: [
      `Umsatzsteuer-Identifikationsnummer: ${MISSING('VAT ID, if applicable')}`,
      `Handelsregister: ${MISSING('register court and number, if applicable')}`,
    ] },
    { heading: 'Streitbeilegung', body: [
      'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr',
      `Wir sind ${MISSING('willing / not obliged')}, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
    ] },
  ],
}

const privacy_DE: LegalDoc = {
  key: 'privacy',
  title: 'Datenschutzerklärung / Privacy Policy',
  sections: [
    { heading: 'Verantwortlicher', body: [
      `Verantwortlich für die Datenverarbeitung auf dieser Website ist: ${MISSING('controller name and address — same as the Impressum entity')}.`,
      'Kontakt für Datenschutzanfragen: hello@sizhuatelier.shop',
    ] },
    { heading: 'Welche Daten wir verarbeiten', body: [
      'Personalisierungsdaten, die du zur Erstellung deines Posters übermittelst: Name(n), Geburtsdatum, -zeit und -ort sowie deine Design-Entscheidungen.',
      'Bestelldaten: Liefer-/Rechnungsangaben und E-Mail, erhoben über unseren Zahlungsdienstleister an der Kasse.',
      'Newsletter-Daten: deine E-Mail-Adresse, Sprachpräferenz und Einwilligung, sofern du dich anmeldest.',
    ] },
    { heading: 'Warum wir sie verarbeiten (Zwecke & Rechtsgrundlagen)', body: [
      'Zur Herstellung deiner personalisierten Bestellung und zur Kundenbetreuung (Vertragserfüllung).',
      'Zum Versand des Newsletters (deine Einwilligung — jederzeit widerrufbar).',
      'Zum Betrieb, zur Sicherung und Verbesserung des Shops (berechtigtes Interesse).',
    ] },
    { heading: 'Auftragsverarbeiter & Dritte', body: [
      'Zahlungen: Stripe (Stripe verarbeitet deine Zahlung sowie die Kontakt-/Lieferangaben an der Kasse).',
      `Hosting & Datenbank: ${MISSING('hosting / Postgres provider, e.g. your Railway or DB host')}.`,
      'Transaktions-E-Mail: Resend (Bestellbestätigungen), sofern aktiviert.',
    ] },
    { heading: 'Aufbewahrung & deine Rechte', body: [
      'Wir bewahren Bestell- und Personalisierungsdaten so lange auf, wie es für die Abwicklung sowie für gesetzliche/steuerliche Pflichten erforderlich ist, und löschen sie danach.',
      'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Übertragbarkeit deiner Daten sowie auf Widerspruch und Widerruf der Einwilligung. Kontaktiere uns unter hello@sizhuatelier.shop.',
      'Du kannst dich außerdem bei einer Aufsichtsbehörde beschweren.',
    ] },
  ],
}

const terms_DE: LegalDoc = {
  key: 'terms',
  title: 'Allgemeine Geschäftsbedingungen / AGB',
  sections: [
    { heading: 'Geltungsbereich', body: [
      'Diese Bedingungen gelten für alle über diesen Shop aufgegebenen Bestellungen. Mit deiner Bestellung erkennst du sie an.',
    ] },
    { heading: 'Vertrag & Preise', body: [
      'Ein Vertrag kommt zustande, wenn du die Bestellung abschließt und wir sie bestätigen. Die Preise werden an der Kasse inklusive geltender Mehrwertsteuer angezeigt; der Versand wird gesondert ausgewiesen.',
      'Die Zahlung wird sicher über Stripe abgewickelt.',
    ] },
    { heading: 'Personalisierte Produkte', body: [
      'Jedes Poster wird eigens aus den von dir übermittelten Geburtsdaten und Design-Entscheidungen gefertigt. Da es auf Bestellung hergestellt wird, kann es nach Produktionsbeginn nicht zurückgegeben oder storniert werden — siehe unsere Rückgaberichtlinie.',
      'Deine gesetzlichen Rechte bei Artikeln, die beschädigt, fehlerhaft, falsch oder nicht wie beschrieben ankommen, bleiben davon unberührt.',
    ] },
    { heading: 'Anwendbares Recht', body: [
      `Anwendbares Recht und Gerichtsstand: ${MISSING('governing law / jurisdiction tied to the business location')}.`,
    ] },
  ],
}

const returns_DE: LegalDoc = {
  key: 'returns',
  title: 'Rückgabe & Widerruf / Return Policy',
  sections: [
    { heading: 'Personalisierte Artikel', body: [
      // REQ-040 — exakter, vorsichtiger Wortlaut, semantisch identisch zu EN/FR.
      'Da jedes personalisierte Kunstwerk eigens aus den von dir übermittelten Geburtsdaten und Design-Entscheidungen erzeugt und gefertigt wird, können personalisierte Artikel nach Produktionsbeginn nicht zurückgegeben oder storniert werden.',
      'Deine gesetzlichen Rechte bleiben unberührt, falls dein Artikel beschädigt, fehlerhaft, falsch oder nicht wie beschrieben ankommt.',
    ] },
    { heading: 'Beschädigte, fehlerhafte oder falsche Artikel', body: [
      'Falls deine Bestellung beschädigt, fehlerhaft, falsch oder nicht wie beschrieben ankommt, kontaktiere uns innerhalb eines angemessenen Zeitraums unter hello@sizhuatelier.shop. Wir veranlassen kostenlos einen Ersatz oder eine gesetzlich vorgesehene Abhilfe.',
    ] },
    { heading: 'Digitale Produkte', body: [
      'Bei digitalen Analyse-PDFs stimmst du zu, dass die Lieferung sofort beginnt, und du willigst, soweit zutreffend, in das Erlöschen des Widerrufsrechts nach Beginn der Lieferung ein.',
    ] },
  ],
}

const shipping_DE: LegalDoc = {
  key: 'shipping',
  title: 'Versandrichtlinie / Shipping Policy',
  sections: [
    { heading: 'Produktion & Versand', body: [
      'Personalisierte Poster werden nach deiner Bestellung gefertigt und anschließend versendet. Die Produktion dauert in der Regel einige Werktage vor dem Versand.',
      `Versanddienstleister und Lieferzeiten: ${MISSING('carriers and per-region delivery estimates')}.`,
    ] },
    { heading: 'Versandkosten', body: [
      `Die Versandkosten werden an der Kasse angezeigt. Ab dem in deinem Warenkorb angezeigten Schwellenwert ist der Versand kostenlos. ${MISSING('confirm the free-shipping threshold — the cart logic and the announcement bar should state the same figure')}.`,
    ] },
    { heading: 'Transportschäden', body: [
      'Falls dein Artikel beschädigt ankommt, kontaktiere uns unter hello@sizhuatelier.shop und wir veranlassen einen Ersatz (siehe Rückgaberichtlinie).',
    ] },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// FR — localized prose; markers kept verbatim, return wording kept identical
// ═══════════════════════════════════════════════════════════════════════════

const impressum_FR: LegalDoc = {
  key: 'impressum',
  title: 'Mentions légales / Impressum',
  sections: [
    { heading: 'Fournisseur', body: [
      'Informations conformément aux obligations légales applicables (p. ex. § 5 DDG / obligation de mentions légales).',
      `Raison sociale : ${MISSING('registered company / trader name')}`,
      `Personne responsable : ${MISSING('owner / managing director')}`,
      `Adresse de l’entreprise : ${MISSING('street, postal code, city, country')}`,
    ] },
    { heading: 'Contact', body: [
      'E-mail : hello@sizhuatelier.shop',
      `Téléphone : ${MISSING('contact phone, if applicable')}`,
    ] },
    { heading: 'Immatriculation & taxes', body: [
      `Numéro de TVA intracommunautaire : ${MISSING('VAT ID, if applicable')}`,
      `Registre du commerce : ${MISSING('register court and number, if applicable')}`,
    ] },
    { heading: 'Règlement des litiges', body: [
      'La Commission européenne met à disposition une plateforme de règlement en ligne des litiges (RLL) : https://ec.europa.eu/consumers/odr',
      `Nous sommes ${MISSING('willing / not obliged')} à participer à une procédure de règlement des litiges devant un organe de médiation de la consommation.`,
    ] },
  ],
}

const privacy_FR: LegalDoc = {
  key: 'privacy',
  title: 'Politique de confidentialité / Datenschutz',
  sections: [
    { heading: 'Responsable du traitement', body: [
      `Le responsable du traitement des données sur ce site est : ${MISSING('controller name and address — same as the Impressum entity')}.`,
      'Contact pour les questions de confidentialité : hello@sizhuatelier.shop',
    ] },
    { heading: 'Quelles données nous traitons', body: [
      'Données de personnalisation que vous soumettez pour créer votre poster : nom(s), date, heure et lieu de naissance, ainsi que vos choix de design.',
      'Données de commande : informations de livraison/facturation et e-mail, collectées via notre prestataire de paiement lors du paiement.',
      'Données de newsletter : votre adresse e-mail, votre préférence de langue et votre consentement, si vous vous inscrivez.',
    ] },
    { heading: 'Pourquoi nous les traitons (finalités & bases légales)', body: [
      'Pour produire votre commande personnalisée et assurer le service client (exécution d’un contrat).',
      'Pour envoyer la newsletter (votre consentement — révocable à tout moment).',
      'Pour exploiter, sécuriser et améliorer la boutique (intérêt légitime).',
    ] },
    { heading: 'Sous-traitants & tiers', body: [
      'Paiements : Stripe (Stripe traite votre paiement et les informations de contact/livraison au paiement).',
      `Hébergement & base de données : ${MISSING('hosting / Postgres provider, e.g. your Railway or DB host')}.`,
      'E-mail transactionnel : Resend (confirmations de commande), lorsqu’il est activé.',
    ] },
    { heading: 'Conservation & vos droits', body: [
      'Nous conservons les données de commande et de personnalisation aussi longtemps que nécessaire à l’exécution et aux obligations légales/fiscales, puis nous les supprimons.',
      'Vous avez le droit d’accéder à vos données, de les rectifier, de les effacer, d’en limiter le traitement et de les porter, ainsi que de vous opposer et de retirer votre consentement. Contactez-nous à hello@sizhuatelier.shop.',
      'Vous pouvez également déposer une réclamation auprès d’une autorité de contrôle.',
    ] },
  ],
}

const terms_FR: LegalDoc = {
  key: 'terms',
  title: 'Conditions générales de vente / CGV',
  sections: [
    { heading: 'Champ d’application', body: [
      'Ces conditions régissent toutes les commandes passées via cette boutique. En passant commande, vous les acceptez.',
    ] },
    { heading: 'Contrat & prix', body: [
      'Un contrat est formé lorsque vous finalisez le paiement et que nous confirmons votre commande. Les prix sont indiqués au paiement, TVA applicable incluse ; la livraison est indiquée séparément.',
      'Le paiement est traité en toute sécurité par Stripe.',
    ] },
    { heading: 'Produits personnalisés', body: [
      'Chaque poster est produit spécifiquement à partir des données de naissance et des choix de design que vous soumettez. Comme il est fabriqué sur commande, il ne peut être retourné ou annulé une fois la production lancée — voir notre politique de retour.',
      'Cela n’affecte pas vos droits légaux pour les articles arrivant endommagés, défectueux, incorrects ou non conformes.',
    ] },
    { heading: 'Droit applicable', body: [
      `Droit applicable et juridiction compétente : ${MISSING('governing law / jurisdiction tied to the business location')}.`,
    ] },
  ],
}

const returns_FR: LegalDoc = {
  key: 'returns',
  title: 'Politique de retour / Rückgabe & Widerruf',
  sections: [
    { heading: 'Articles personnalisés', body: [
      // REQ-040 — formulation prudente, sémantiquement identique à EN/DE.
      'Parce que chaque œuvre personnalisée est générée et produite spécifiquement à partir des données de naissance et des choix de design que vous soumettez, les articles personnalisés ne peuvent être retournés ou annulés une fois la production lancée.',
      'Cela n’affecte pas vos droits légaux si votre article arrive endommagé, défectueux, incorrect ou non conforme.',
    ] },
    { heading: 'Articles endommagés, défectueux ou incorrects', body: [
      'Si votre commande arrive endommagée, défectueuse, incorrecte ou non conforme, contactez-nous à hello@sizhuatelier.shop dans un délai raisonnable. Nous organiserons un remplacement gratuit ou un remède conforme à la loi.',
    ] },
    { heading: 'Produits numériques', body: [
      'Pour les PDF d’analyse numérique, vous acceptez que la livraison commence immédiatement et, le cas échéant, vous consentez à la perte du droit de rétractation une fois la livraison commencée.',
    ] },
  ],
}

const shipping_FR: LegalDoc = {
  key: 'shipping',
  title: 'Politique de livraison / Shipping Policy',
  sections: [
    { heading: 'Production & expédition', body: [
      'Les posters personnalisés sont produits après votre commande, puis expédiés. La production prend généralement quelques jours ouvrés avant l’expédition.',
      `Transporteurs et délais de livraison : ${MISSING('carriers and per-region delivery estimates')}.`,
    ] },
    { heading: 'Frais de livraison', body: [
      `Les frais de livraison sont indiqués au paiement. La livraison est offerte au-delà du seuil indiqué dans votre panier. ${MISSING('confirm the free-shipping threshold — the cart logic and the announcement bar should state the same figure')}.`,
    ] },
    { heading: 'Endommagé pendant le transport', body: [
      'Si votre article arrive endommagé, contactez-nous à hello@sizhuatelier.shop et nous organiserons un remplacement (voir la politique de retour).',
    ] },
  ],
}

// ── Per-language document maps ──────────────────────────────────────────────
export const LEGAL_DOCS_BY_LANG: Record<Lang, Record<string, LegalDoc>> = {
  EN: { impressum: impressum_EN, privacy: privacy_EN, terms: terms_EN, returns: returns_EN, shipping: shipping_EN },
  DE: { impressum: impressum_DE, privacy: privacy_DE, terms: terms_DE, returns: returns_DE, shipping: shipping_DE },
  FR: { impressum: impressum_FR, privacy: privacy_FR, terms: terms_FR, returns: returns_FR, shipping: shipping_FR },
  // REQ-015 / T-501 — ES intentionally reuses the EN structural template (see the
  // ES LEGAL_REVIEW_BANNER): legal prose is NOT machine-translated. The ES banner
  // discloses this; a localized ES legal version is a launch-blocking TODO. The
  // UI i18n dictionary (translations.ES) IS fully localized — only legal prose is
  // held back on purpose.
  ES: { impressum: impressum_EN, privacy: privacy_EN, terms: terms_EN, returns: returns_EN, shipping: shipping_EN },
}

// Backward-compatible flat EN export. The i18n switch is now WIRED in Legal.tsx,
// which reads LEGAL_DOCS_BY_LANG[activeLang] + LEGAL_REVIEW_BANNER[activeLang]
// (EN fallback). This alias is retained only as the EN convenience handle (e.g.
// for tests asserting the EN template is the source of truth for marker counts).
export const LEGAL_DOCS: Record<string, LegalDoc> = LEGAL_DOCS_BY_LANG.EN
