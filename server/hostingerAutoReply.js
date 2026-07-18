import { timingSafeEqual } from 'node:crypto'

const API_BASE = 'https://api.mail.hostinger.com/api/v1'
const REPLIED_FLAG = '$sizhu-autoreplied'
const MAILBOX_ID_FALLBACK = 'ACfe4564b6d795816e9eae8f6422b9'

const COPY = {
  de: {
    fallback: 'Wir haben Ihre Nachricht erhalten | Sizhu Atelier',
    greeting: 'Guten Tag,',
    paragraphs: [
      'vielen Dank, dass Sie Sizhu Atelier kontaktiert haben.',
      'Ihre Nachricht ist erfolgreich bei uns eingegangen. Unser Kundenservice prüft Ihr Anliegen und wird Ihnen so schnell wie möglich persönlich antworten.',
      'Falls es um eine Bestellung geht, senden Sie uns bitte – sofern noch nicht angegeben – Ihre Bestellnummer.',
      'Bitte beachten Sie, dass dies eine automatische Empfangsbestätigung ist.',
    ],
    closing: 'Mit freundlichen Grüßen',
    team: 'Ihr Sizhu Atelier Team',
  },
  en: {
    fallback: 'We have received your message | Sizhu Atelier',
    greeting: 'Hello,',
    paragraphs: [
      'Thank you for contacting Sizhu Atelier.',
      'Your message has been received successfully. Our customer service team will review your request and reply personally as soon as possible.',
      'If your message concerns an order, please include your order number if you have not already done so.',
      'Please note that this is an automated acknowledgement of receipt.',
    ],
    closing: 'Kind regards',
    team: 'The Sizhu Atelier Team',
  },
  fr: {
    fallback: 'Nous avons bien reçu votre message | Sizhu Atelier',
    greeting: 'Bonjour,',
    paragraphs: [
      'Nous vous remercions d’avoir contacté Sizhu Atelier.',
      'Votre message nous est bien parvenu. Notre service client va examiner votre demande et vous répondra personnellement dans les meilleurs délais.',
      'Si votre message concerne une commande, veuillez indiquer votre numéro de commande s’il n’est pas déjà mentionné.',
      'Veuillez noter qu’il s’agit d’un accusé de réception automatique.',
    ],
    closing: 'Cordialement',
    team: 'L’équipe Sizhu Atelier',
  },
  es: {
    fallback: 'Hemos recibido su mensaje | Sizhu Atelier',
    greeting: 'Hola,',
    paragraphs: [
      'Gracias por ponerse en contacto con Sizhu Atelier.',
      'Hemos recibido correctamente su mensaje. Nuestro equipo de atención al cliente revisará su consulta y le responderá personalmente lo antes posible.',
      'Si su mensaje está relacionado con un pedido, indíquenos el número de pedido si todavía no lo ha incluido.',
      'Tenga en cuenta que este es un acuse de recibo automático.',
    ],
    closing: 'Atentamente',
    team: 'El equipo de Sizhu Atelier',
  },
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, ' ').trim()
}

export function detectLanguage(value) {
  const text = normalize(value)
  const scores = { de: 0, en: 0, fr: 0, es: 0 }
  const signals = {
    de: ['hallo', 'guten tag', 'danke', 'bestellung', 'lieferung', 'versand', 'ich', 'bitte', 'möchte', 'können'],
    en: ['hello', 'thank you', 'thanks', 'order', 'delivery', 'shipping', 'please', 'would', 'could'],
    fr: ['bonjour', 'merci', 'commande', 'livraison', 's’il vous plaît', "s'il vous plaît", 'cordialement'],
    es: ['hola', 'gracias', 'pedido', 'entrega', 'envío', 'por favor', 'buenos días'],
  }
  for (const [lang, words] of Object.entries(signals)) {
    for (const word of words) if (text.includes(word)) scores[lang] += word.includes(' ') ? 4 : 2
  }
  if (/[äöüß]/.test(text)) scores.de += 5
  if (/[àâçéèêëîïôùûüÿœ]/.test(text)) scores.fr += 5
  if (/[áéíóúñ¿¡]/.test(text)) scores.es += 5
  const [lang, score] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return score > 0 ? lang : 'en'
}

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function buildReply(language, originalSubject) {
  const copy = COPY[language] || COPY.en
  const cleanSubject = String(originalSubject || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 180)
  const subject = cleanSubject ? (/^(re|aw|sv|rv)\s*:/i.test(cleanSubject) ? cleanSubject : `Re: ${cleanSubject}`) : copy.fallback
  const text = [copy.greeting, '', ...copy.paragraphs.flatMap((p) => [p, '']), copy.closing, copy.team, 'hello@sizhuatelier.shop'].join('\n').trim()
  const html = `<!doctype html><html><body style="margin:0;background:#FBF8F1;color:#2C2420;font-family:Arial,Helvetica,sans-serif"><div style="max-width:640px;margin:0 auto;padding:40px 28px"><div style="font-family:Georgia,serif;font-size:25px;margin-bottom:30px">Sizhu Atelier</div><p>${escapeHtml(copy.greeting)}</p>${copy.paragraphs.map((p) => `<p style="line-height:1.65">${escapeHtml(p)}</p>`).join('')}<p style="margin-top:30px;line-height:1.6">${escapeHtml(copy.closing)}<br>${escapeHtml(copy.team)}<br><a href="mailto:hello@sizhuatelier.shop" style="color:#A0522D">hello@sizhuatelier.shop</a></p></div></body></html>`
  return { subject, text, html }
}

function secretMatches(header, expected) {
  const supplied = String(header || '').replace(/^Bearer\s+/i, '')
  if (!supplied || !expected) return false
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function api(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  })
  if (!response.ok) throw new Error(`Hostinger Mail API ${response.status}: ${(await response.text()).slice(0, 300)}`)
  return response.status === 204 ? null : response.json()
}

function locator(payload = {}) {
  const data = payload.data || payload
  const msg = data.message || data.email || data
  return {
    uid: Number(msg.uid ?? data.uid) || null,
    folder: String(msg.path || msg.folder || data.path || data.folder || 'INBOX'),
    from: msg.from?.address || msg.fromAddress || msg.sender?.address || msg.sender || data.from?.address || data.from || '',
    subject: String(msg.subject || data.subject || ''),
    body: typeof (msg.text || msg.body?.text || msg.body || data.text || data.body?.text || data.body) === 'string' ? (msg.text || msg.body?.text || msg.body || data.text || data.body?.text || data.body) : '',
    flags: Array.isArray(msg.flags) ? msg.flags : [],
  }
}

async function loadMessage(payload, token, mailboxId) {
  const direct = locator(payload)
  if (!direct.uid) return direct
  const folder = encodeURIComponent(direct.folder)
  const [meta, text] = await Promise.all([
    api(`/mailboxes/${mailboxId}/folders/${folder}/messages/${direct.uid}`, token),
    api(`/mailboxes/${mailboxId}/folders/${folder}/messages/${direct.uid}/text`, token),
  ])
  const message = meta?.data || {}
  return { ...direct, from: message.from?.address || direct.from, subject: message.subject || direct.subject, body: text?.data?.text || direct.body, flags: Array.isArray(message.flags) ? message.flags : direct.flags }
}

function ignore(message, supportEmail) {
  const from = String(message.from || '').trim().toLowerCase()
  if (!from.includes('@') || from === supportEmail) return true
  if (/(^|[._+-])(no-?reply|do-?not-?reply|mailer-daemon|postmaster)([._+-]|@)/i.test(from)) return true
  return /(automatic reply|auto.?reply|out of office|abwesenheitsnotiz|réponse automatique|respuesta automática|delivery status notification|undeliverable)/i.test(message.subject)
}

export function registerHostingerAutoReply(app) {
  app.post('/api/mail/hostinger', async (req, res) => {
    const secret = process.env.HOSTINGER_WEBHOOK_SECRET || ''
    const token = process.env.HOSTINGER_MAIL_API_TOKEN || ''
    const mailboxId = process.env.HOSTINGER_MAILBOX_RESOURCE_ID || MAILBOX_ID_FALLBACK
    const supportEmail = (process.env.SUPPORT_EMAIL || 'hello@sizhuatelier.shop').toLowerCase()
    if (!secret || !token) return res.status(503).json({ error: 'mail_autoreply_unconfigured' })
    if (!secretMatches(req.headers.authorization, secret)) return res.status(401).json({ error: 'unauthorized' })
    const event = String(req.body?.event || req.body?.type || req.body?.eventType || '')
    if (event && event !== 'message.received') return res.status(202).json({ received: true, ignored: 'unsupported_event' })
    try {
      const message = await loadMessage(req.body || {}, token, mailboxId)
      if (ignore(message, supportEmail)) return res.status(202).json({ received: true, ignored: 'automated_or_invalid_sender' })
      if (message.flags.includes(REPLIED_FLAG)) return res.json({ received: true, duplicate: true })
      const language = detectLanguage(`${message.subject}\n${message.body}`)
      const reply = buildReply(language, message.subject)
      await api(`/mailboxes/${mailboxId}/send`, token, { method: 'POST', body: { to: [String(message.from).trim().toLowerCase()], displayName: process.env.SUPPORT_DISPLAY_NAME || 'Sizhu Atelier', ...reply } })
      if (message.uid) {
        const folder = encodeURIComponent(message.folder || 'INBOX')
        await api(`/mailboxes/${mailboxId}/folders/${folder}/messages/${message.uid}`, token, { method: 'PATCH', body: { addFlags: [REPLIED_FLAG] } })
      }
      console.log(`[mail] automatic acknowledgement sent (${language})`)
      return res.json({ received: true, replied: true, language })
    } catch (error) {
      console.error('[mail] Hostinger automatic acknowledgement failed:', error.message)
      return res.status(500).json({ error: 'mail_autoreply_failed' })
    }
  })
}
