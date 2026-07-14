// Newsletter-Double-Opt-In (Operator-Batch #8): Bestätigungs-E-Mail + die
// kleine HTML-Bestätigungsseite. Reine Template-/Text-Funktionen — der
// Versand (Resend) und die DB bleiben in server/index.js injizierbar.

const COPY = {
  en: {
    subject: 'Please confirm your SizhuAtelier newsletter signup ✦',
    body: (link) =>
      `Thank you for signing up!\n\nPlease confirm your email address by opening this link:\n${link}\n\nIf you did not request this, simply ignore this email — nothing will be sent.`,
    confirmedTitle: 'Subscription confirmed ✦',
    confirmedBody: 'Thank you — your newsletter subscription is now active.',
    invalidTitle: 'Link invalid or already used',
    invalidBody: 'This confirmation link is invalid or was already confirmed.',
    toShop: 'Back to the shop',
  },
  de: {
    subject: 'Bitte bestätige deine SizhuAtelier-Newsletter-Anmeldung ✦',
    body: (link) =>
      `Danke für deine Anmeldung!\n\nBitte bestätige deine E-Mail-Adresse über diesen Link:\n${link}\n\nFalls du das nicht warst, ignoriere diese E-Mail einfach — es wird nichts versendet.`,
    confirmedTitle: 'Anmeldung bestätigt ✦',
    confirmedBody: 'Danke — dein Newsletter-Abo ist jetzt aktiv.',
    invalidTitle: 'Link ungültig oder bereits verwendet',
    invalidBody: 'Dieser Bestätigungslink ist ungültig oder wurde bereits bestätigt.',
    toShop: 'Zurück zum Shop',
  },
  fr: {
    subject: 'Veuillez confirmer votre inscription à la newsletter SizhuAtelier ✦',
    body: (link) =>
      `Merci pour votre inscription !\n\nVeuillez confirmer votre adresse e-mail en ouvrant ce lien :\n${link}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez simplement cet e-mail.`,
    confirmedTitle: 'Inscription confirmée ✦',
    confirmedBody: 'Merci — votre abonnement à la newsletter est maintenant actif.',
    invalidTitle: 'Lien invalide ou déjà utilisé',
    invalidBody: 'Ce lien de confirmation est invalide ou a déjà été confirmé.',
    toShop: 'Retour à la boutique',
  },
  es: {
    subject: 'Confirma tu suscripción al boletín de SizhuAtelier ✦',
    body: (link) =>
      `¡Gracias por suscribirte!\n\nConfirma tu dirección de correo abriendo este enlace:\n${link}\n\nSi no has solicitado esto, simplemente ignora este correo.`,
    confirmedTitle: 'Suscripción confirmada ✦',
    confirmedBody: 'Gracias — tu suscripción al boletín ya está activa.',
    invalidTitle: 'Enlace no válido o ya utilizado',
    invalidBody: 'Este enlace de confirmación no es válido o ya fue confirmado.',
    toShop: 'Volver a la tienda',
  },
}

const langOf = (language) => (COPY[String(language || '').toLowerCase()] ? String(language).toLowerCase() : 'en')

/** Bestätigungs-E-Mail (subject + text) für die Double-Opt-In-Mail. */
export function buildConfirmEmail({ language, token, publicUrl }) {
  const c = COPY[langOf(language)]
  const link = `${publicUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`
  return { subject: c.subject, text: c.body(link) }
}

/** Selbstständige HTML-Antwortseite für den Confirm-Klick (Markenton, eckig). */
export function confirmResultHtml({ language, ok }) {
  const c = COPY[langOf(language)]
  const title = ok ? c.confirmedTitle : c.invalidTitle
  const body = ok ? c.confirmedBody : c.invalidBody
  return `<!doctype html><html lang="${langOf(language)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<style>body{margin:0;font-family:Georgia,serif;background:#FAF6EE;color:#2A2620;display:flex;min-height:100vh;align-items:center;justify-content:center}
main{max-width:420px;padding:48px 28px;text-align:center}h1{font-weight:500;font-size:26px;margin:0 0 12px}p{font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#6b6459;margin:0 0 24px}
a{display:inline-block;background:#C0492E;color:#fff;text-decoration:none;padding:13px 22px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600}</style></head>
<body><main><h1>${title}</h1><p>${body}</p><a href="/">${c.toShop}</a></main></body></html>`
}
