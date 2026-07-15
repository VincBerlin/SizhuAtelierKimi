import { timingSafeEqual } from 'node:crypto'

const HOSTINGER_API_BASE = 'https://api.mail.hostinger.com/api/v1'
const AUTO_REPLIED_FLAG = '$sizhu-autoreplied'
const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es']

const LANGUAGE_SIGNALS = {
  de: {
    phrases: ['guten tag', 'guten morgen', 'guten abend', 'vielen dank', 'mit freundlichen grüßen'],
    words: ['hallo', 'danke', 'bitte', 'bestellung', 'lieferung', 'versand', 'frage', 'möchte', 'können', 'kann', 'ich', 'wir', 'mein', 'meine', 'eine', 'einen', 'und', 'nicht', 'wann', 'wo', 'warum'],
    diacritics: /[äöüß]/g,
  },
  fr: {
    phrases: ['bonjour', 'bonsoir', 'merci beaucoup', 's’il vous plaît', 's\'il vous plaît', 'cordialement'],
    words: ['merci', 'commande', 'livraison', 'question', 'bonjour', 'bonsoir', 'vous', 'nous', 'je', 'mon', 'ma', 'une', 'avec', 'pour', 'comment', 'quand', 'pourquoi'],
    diacritics: /[àâçéèêëîïôùûüÿœ]/g,
  },
  es: {
    phrases: ['buenos días', 'buenas tardes', 'buenas noches', 'muchas gracias', 'por favor', 'un saludo'],
    words: ['hola', 'gracias', 'pedido', 'entrega', 'envío', 'pregunta', 'usted', 'nosotros', 'yo', 'mi', 'una', 'con', 'para', 'cómo', 'cuando', 'dónde', 'porqué'],
    diacritics: /[áéíóúñ¿¡]/g,
  },
  en: {
    phrases: ['hello', 'good morning', 'good afternoon', 'good evening', 'thank you', 'kind regards'],
    words: ['hello', 'thanks', 'please', 'order', 'delivery', 'shipping', 'question', 'would', 'could', 'can', 'i', 'we', 'my', 'with', 'for', 'how', 'when', 'where', 'why'],
    diacritics: /$^/g,
  },
}

const REPLIES = {
  de: {
    fallbackSubject: 'Wir haben Ihre Nachricht erhalten | Sizhu Atelier',
    greeting: 'Guten Tag,',
    paragraphs: [
      'vielen Dank, dass Sie Sizhu Atelier kontaktiert haben.',
      'Ihre Nachricht ist erfolgreich bei uns eingegangen. Unser Kundenservice prüft Ihr Anliegen und wird Ihnen so schnell wie möglich persönlich antworten.',
      'Falls es um eine Bestellung geht, senden Sie uns bitte – sofern noch nicht angegeben – Ihre Bestellnummer. So können wir Ihr Anliegen schneller zuordnen.',
      'Bitte beachten Sie, dass dies eine automatische Empfangsbestätigung ist.',
    ],
    closing: 'Mit freundlichen Grüßen',
    team: 'Ihr Sizhu Atelier Team',
  },
  en: {
    fallbackSubject: 'We have received your message | Sizhu Atelier',
    greeting: 'Hello,',
    paragraphs: [
      'Thank you for contacting Sizhu Atelier.',
      'Your message has been received successfully. Our customer service team will review your request and reply personally as soon as possible.',
      'If your message concerns an order, please send us your order number if you have not already included it. This will help us process your request more quickly.',
      'Please note that this is an automated acknowledgement of receipt.',
    ],
    closing: 'Kind regards',
    team: 'The Sizhu Atelier Team',
  },
  fr: {
    fallbackSubject: 'Nous avons bien reçu votre message | Sizhu Atelier',
    greeting: 'Bonjour,',
    paragraphs: [
      'Nous vous remercions d’avoir contacté Sizhu Atelier.',
      'Votre message nous est bien parvenu. Notre service client va examiner votre demande et vous répondra personnellement dans les meilleurs délais.',
      'Si votre message concerne une commande, veuillez nous communiquer votre numéro de commande s’il n’est pas déjà indiqué. Cela nous permettra de traiter votre demande plus rapidement.',
      'Veuillez noter qu’il s’agit d’un accusé de réception automatique.',
    ],
    closing: 'Cordialement',
    team: 'L’équipe Sizhu Atelier',
  },
  es: {
    fallbackSubject: 'Hemos recibido su mensaje | Sizhu Atelier',
    greeting: 'Hola,',
    paragraphs: [
      'Gracias por ponerse en contacto con Sizhu Atelier.',
      'Hemos recibido correctamente su mensaje. Nuestro equipo de atención al cliente revisará su consulta y le responderá personalmente lo antes posible.',
      'Si su mensaje está relacionado con un pedido, indíquenos el número de pedido si todavía no lo ha incluido. Esto nos permitirá gestionar su solicitud con mayor rapidez.',
      'Tenga en cuenta que este es un acuse de recibo automático.',
    ],
    closing: 'Atentamente',
    team: 'El equipo de Sizhu Atelier',
  },
}

function normaliseText(value) {
  return String(value || '')
    .toLocaleLowerCase('und')
    .replace(/[’`´]/g, "'")
    .replace(/[^\p{L}\p{N}\s'¿¡-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function detectLanguage(value) {
  const text = normaliseText(value)
  if (!text) return 'en'
  const tokens = text.match(/[\p{L}\p{N}']+/gu) || []
  const scores = Object.fromEntries(SUPPORTED_LANGUAGES.map((lang) => [lang, 0]))

  for (const [lang, signals] of Object.entries(LANGUAGE_SIGNALS)) {
    for (const phrase of signals.phrases) if (text.includes(phrase)) scores[lang] += 7
    const words = new Set(signals.words)
    for (const token of tokens) if (words.has(token)) scores[lang] += token.length <= 2 ? 1 : 2
    const marks = text.match(signals.diacritics)
    if (marks) scores[lang] += Math.min(8, marks.length * 3)
  }

  if (text.includes('¿') || text.includes('¡')) scores.es += 8
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return ranked[0][1] > 0 ? ranked[0][0] : 'en'
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function replySubject(originalSubject, fallbackSubject) {
  const subject = String(originalSubject || '').trim().replace(/[\r\n]+/g, ' ').slice(0, 180)
  if (!subject) return fallbackSubject
  return /^(re|aw|sv|rv)\s*:/i.test(subject) ? subject : `Re: ${subject}`
}

export function buildAutoReply(language, originalSubject = '') {
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'en'
  const copy = REPLIES[lang]
  const text = [
    copy.greeting,
    '',
    ...copy.paragraphs.flatMap((paragraph) => [paragraph, '']),
    copy.closing,
    copy.team,
    'hello@sizhuatelier.shop',
  ].join('\n').trim()

  const html = `<!doctype html><html><body style="margin:0;background:#FBF8F1;color:#2C2420;font-family:Arial,Helvetica,sans-serif"><div style="max-width:640px;margin:0 auto;padding:40px 28px"><div style="font-family:Georgia,serif;font-size:25px;margin-bottom:30px">Sizhu Atelier</div><p>${escapeHtml(copy.greeting)}</p>${copy.paragraphs.map((paragraph) => `<p style="line-height:1.65">${escapeHtml(paragraph)}</p>`).join('')}<p style="margin-top:30px;line-height:1.6">${escapeHtml(copy.closing)}<br>${escapeHtml(copy.team)}<br><a href="mailto:hello@sizhuatelier.shop" style="color:#A0522D">hello@sizhuatelier.shop</a></p></div></body></html>`

  return { language: lang, subject: replySubject(originalSubject, copy.fallbackSubject), text, html }
}

export function extractWebhookMessageLocator(payload = {}) {
  const data = payload.data || payload
  const message = data.message || data.email || data
  const uid = Number(message.uid ?? data.uid ?? payload.uid)
  const folder = String(message.path || message.folder || data.path || data.folder || payload.path || payload.folder || 'INBOX')
  return { uid: Number.isInteger(uid) && uid > 0 ? uid : null, folder }
}

export function shouldIgnoreSender(address) {
  const email = String(address || '').trim().toLowerCase()
  if (!email || !email.includes('@')) return true
  if (email === 'hello@sizhuatelier.shop') return true
  return /(^|[._+-])(no-?reply|do-?not-?reply|mailer-daemon|postmaster)([._+-]|@)/i.test(email)
}

function bearerMatches(header, expected) {
  const supplied = String(header || '').replace(/^Bearer\s+/i, '')
  if (!supplied || !expected) return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function hostingerRequest(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${HOSTINGER_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Hostinger Mail API ${method} ${path} failed: ${response.status} ${detail.slice(0, 300)}`)
  }
  if (response.status === 204) return null
  return response.json()
}

function directMessageFromPayload(payload = {}) {
  const data = payload.data || payload
  const message = data.message || data.email || data
  const from = message.from?.address || message.fromAddress || message.sender?.address || message.sender || data.from?.address || data.from
  const body = message.text || message.body?.text || message.body || data.text || data.body?.text || data.body || ''
  return {
    uid: Number(message.uid || data.uid) || null,
    folder: String(message.path || message.folder || data.path || data.folder || 'INBOX'),
    from: typeof from === 'string' ? from : '',
    subject: String(message.subject || data.subject || ''),
    body: typeof body === 'string' ? body : '',
    flags: Array.isArray(message.flags) ? message.flags : [],
  }
}

async function loadIncomingMessage(payload, { token, mailboxResourceId }) {
  const direct = directMessageFromPayload(payload)
  const locator = extractWebhookMessageLocator(payload)
  if (!locator.uid) return direct

  const folder = encodeURIComponent(locator.folder)
  const [metaResource, textResource] = await Promise.all([
    hostingerRequest(`/mailboxes/${mailboxResourceId}/folders/${folder}/messages/${locator.uid}`, { token }),
    hostingerRequest(`/mailboxes/${mailboxResourceId}/folders/${folder}/messages/${locator.uid}/text`, { token }),
  ])
  const message = metaResource?.data || {}
  const text = textResource?.data || {}
  return {
    uid: locator.uid,
    folder: locator.folder,
    from: message.from?.address || direct.from,
    subject: message.subject || direct.subject,
    body: text.text || direct.body,
    flags: Array.isArray(message.flags) ? message.flags : direct.flags,
  }
}

async function markAutoReplied(message, { token, mailboxResourceId }) {
  if (!message.uid) return
  const folder = encodeURIComponent(message.folder || 'INBOX')
  await hostingerRequest(`/mailboxes/${mailboxResourceId}/folders/${folder}/messages/${message.uid}`, {
    token,
    method: 'PATCH',
    body: { addFlags: [AUTO_REPLIED_FLAG] },
  })
}

function isAutomatedSubject(subject) {
  return /(automatic reply|auto.?reply|out of office|abwesenheitsnotiz|réponse automatique|respuesta automática|delivery status notification|undeliverable)/i.test(String(subject || ''))
}

export function registerHostingerAutoReply(app) {
  app.post('/api/mail/hostinger', async (req, res) => {
    const webhookSecret = process.env.HOSTINGER_WEBHOOK_SECRET || ''
    const token = process.env.HOSTINGER_MAIL_API_TOKEN || ''
    const mailboxResourceId = process.env.HOSTINGER_MAILBOX_RESOURCE_ID || 'ACfe4564b6d795816e9eae8f6422b9'
    const supportEmail = (process.env.SUPPORT_EMAIL || 'hello@sizhuatelier.shop').toLowerCase()

    if (!webhookSecret || !token) return res.status(503).json({ error: 'mail_autoreply_unconfigured' })
    if (!bearerMatches(req.headers.authorization, webhookSecret)) return res.status(401).json({ error: 'unauthorized' })

    const event = String(req.body?.event || req.body?.type || req.body?.eventType || '')
    if (event && event !== 'message.received') return res.status(202).json({ received: true, ignored: 'unsupported_event' })

    try {
      const message = await loadIncomingMessage(req.body || {}, { token, mailboxResourceId })
      const from = String(message.from || '').trim().toLowerCase()
      if (shouldIgnoreSender(from) || from === supportEmail || isAutomatedSubject(message.subject)) {
        return res.status(202).json({ received: true, ignored: 'automated_or_invalid_sender' })
      }
      if (message.flags.includes(AUTO_REPLIED_FLAG)) return res.json({ received: true, duplicate: true })

      const language = detectLanguage(`${message.subject}\n${message.body}`)
      const reply = buildAutoReply(language, message.subject)
      await hostingerRequest(`/mailboxes/${mailboxResourceId}/send`, {
        token,
        method: 'POST',
        body: {
          to: [from],
          displayName: process.env.SUPPORT_DISPLAY_NAME || 'Sizhu Atelier',
          subject: reply.subject,
          text: reply.text,
          html: reply.html,
        },
      })
      await markAutoReplied(message, { token, mailboxResourceId })
      console.log(`[mail] automatic acknowledgement sent to ${from} (${language})`)
      return res.json({ received: true, replied: true, language })
    } catch (error) {
      console.error('[mail] Hostinger automatic acknowledgement failed:', error.message)
      return res.status(500).json({ error: 'mail_autoreply_failed' })
    }
  })
}
