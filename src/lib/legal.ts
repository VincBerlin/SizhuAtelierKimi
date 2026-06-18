// Legal content (REQ-039/040). IMPORTANT: real company/legal facts are NOT
// invented — every entity-specific value is a clearly-marked [MISSING — …]
// placeholder for the operator to complete before go-live. Content is in English
// as a structural template; localized DE/FR versions and a professional legal
// review are still required (the Legal page shows a banner saying so).

export interface LegalSection {
  heading?: string
  body: string[]
}
export interface LegalDoc {
  key: string
  title: string
  sections: LegalSection[]
}

const MISSING = (what: string) => `[MISSING — ${what}; complete before go-live]`

const impressum: LegalDoc = {
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

const privacy: LegalDoc = {
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
      'To calculate and produce your personalized order and provide customer service (performance of a contract).',
      'To send the newsletter and reserve Celestial Credits (your consent — withdrawable at any time).',
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

const terms: LegalDoc = {
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

const returns: LegalDoc = {
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

const shipping: LegalDoc = {
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

export const LEGAL_DOCS: Record<string, LegalDoc> = { impressum, privacy, terms, returns, shipping }
