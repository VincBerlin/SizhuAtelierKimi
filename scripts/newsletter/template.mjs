// Newsletter-Marken-Template (Operator-Batch #9). EIN festes Layout — jede
// Ausgabe unterscheidet sich nur durch ihre Inhaltsblöcke. E-Mail-tauglich:
// Tabellen-Layout, Inline-CSS, keine Webfonts-Pflicht, eckige Kanten wie im
// Shop (Ink-Black #2A2620 / Akzent #C0492E / Sand #FAF6EE).
//
// Blocktypen: heading | text | poster (Bild+Titel+Preis+CTA) | facts
// (Schlüssel/Wert-Zeilen, z. B. Planetenstände) | cta | divider

const INK = '#2A2620'
const ACCENT = '#C0492E'
const SAND = '#FAF6EE'
const MUTED = '#6b6459'
const SHOP_URL = 'https://sizhuatelier-shop-production.up.railway.app'

const FOOTER = {
  en: { imprint: 'Imprint', privacy: 'Privacy', reason: 'You receive this email because you confirmed your SizhuAtelier newsletter subscription.', unsubscribe: 'Unsubscribe' },
  de: { imprint: 'Impressum', privacy: 'Datenschutz', reason: 'Du erhältst diese E-Mail, weil du dein SizhuAtelier-Newsletter-Abo bestätigt hast.', unsubscribe: 'Abmelden' },
  fr: { imprint: 'Mentions légales', privacy: 'Confidentialité', reason: 'Vous recevez cet e-mail car vous avez confirmé votre abonnement à la newsletter SizhuAtelier.', unsubscribe: 'Se désabonner' },
  es: { imprint: 'Aviso legal', privacy: 'Privacidad', reason: 'Recibes este correo porque confirmaste tu suscripción al boletín de SizhuAtelier.', unsubscribe: 'Darse de baja' },
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function renderBlock(b) {
  switch (b.type) {
    case 'heading':
      return `<tr><td style="padding:28px 32px 6px"><h2 style="margin:0;font-family:Georgia,serif;font-weight:500;font-size:22px;line-height:1.3;color:${INK}">${esc(b.text)}</h2></td></tr>`
    case 'text':
      return `<tr><td style="padding:10px 32px"><p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:${MUTED}">${esc(b.text)}</p></td></tr>`
    case 'poster':
      return `<tr><td style="padding:18px 32px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5ddcf;background:#fff">
          ${b.image ? `<tr><td><img src="${esc(b.image)}" alt="${esc(b.title)}" width="536" style="display:block;width:100%;height:auto"/></td></tr>` : ''}
          <tr><td style="padding:16px 18px">
            <div style="font-family:Georgia,serif;font-size:17px;color:${INK}">${esc(b.title)}</div>
            ${b.subtitle ? `<div style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:${MUTED};margin-top:4px">${esc(b.subtitle)}</div>` : ''}
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px"><tr>
              ${b.price ? `<td style="font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:${INK};padding-right:14px">${esc(b.price)}</td>` : ''}
              <td><a href="${esc(b.href || SHOP_URL)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;padding:11px 18px">${esc(b.cta || '→')}</a></td>
            </tr></table>
          </td></tr>
        </table></td></tr>`
    case 'facts':
      return `<tr><td style="padding:14px 32px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};border:1px solid #e5ddcf">
          ${(b.rows || []).map((r) => `<tr>
            <td style="padding:9px 16px;font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:${INK};font-weight:600;border-bottom:1px solid #eee4d4">${esc(r[0])}</td>
            <td style="padding:9px 16px;font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:${MUTED};border-bottom:1px solid #eee4d4">${esc(r[1])}</td>
          </tr>`).join('')}
        </table></td></tr>`
    case 'cta':
      return `<tr><td align="center" style="padding:24px 32px"><a href="${esc(b.href || SHOP_URL)}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;padding:14px 26px">${esc(b.text)}</a></td></tr>`
    case 'divider':
      return `<tr><td style="padding:16px 32px"><div style="height:1px;background:#e5ddcf"></div></td></tr>`
    default:
      throw new Error(`unknown newsletter block type: ${b.type}`)
  }
}

/**
 * @param {{ lang: 'en'|'de'|'fr'|'es', subject: string, preheader?: string,
 *           eyebrow?: string, title: string, blocks: Array<object>,
 *           unsubscribeUrl?: string }} edition
 */
export function renderNewsletterHtml(edition) {
  const f = FOOTER[edition.lang] || FOOTER.en
  const unsub = edition.unsubscribeUrl || '{{{RESEND_UNSUBSCRIBE_URL}}}'
  return `<!doctype html><html lang="${edition.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(edition.subject)}</title></head>
<body style="margin:0;padding:0;background:#efe9dd">
  <div style="display:none;max-height:0;overflow:hidden">${esc(edition.preheader || '')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efe9dd"><tr><td align="center" style="padding:28px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${SAND}">
      <tr><td style="background:${INK};padding:26px 32px">
        <div style="font-family:Georgia,serif;font-size:21px;color:#EDE6D6">SizhuAtelier</div>
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.3em;color:#C9A28E;text-transform:uppercase;margin-top:4px">Astrology · Art · Atelier</div>
      </td></tr>
      ${edition.eyebrow ? `<tr><td style="padding:26px 32px 0"><div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:${ACCENT}">${esc(edition.eyebrow)}</div></td></tr>` : ''}
      <tr><td style="padding:8px 32px 0"><h1 style="margin:0;font-family:Georgia,serif;font-weight:500;font-size:28px;line-height:1.25;color:${INK}">${esc(edition.title)}</h1></td></tr>
      ${edition.blocks.map(renderBlock).join('\n')}
      <tr><td style="background:${INK};padding:22px 32px;margin-top:20px">
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7;color:#8f877b">${f.reason}</div>
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;margin-top:8px">
          <a href="${SHOP_URL}/impressum" style="color:#C9A28E">${f.imprint}</a> ·
          <a href="${SHOP_URL}/privacy" style="color:#C9A28E">${f.privacy}</a> ·
          <a href="${unsub}" style="color:#C9A28E">${f.unsubscribe}</a>
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}
