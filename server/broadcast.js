// Newsletter-BROADCAST an bestätigte Abonnenten (Operator 2026-07-18:
// „vorbereiten, noch nicht aktivieren").
//
// Aktivierungs-Gate: die Route ist nur nutzbar, wenn der Operator
// NEWSLETTER_BROADCAST_SECRET setzt — ohne Secret antwortet sie 503.
// Jeder Empfänger bekommt die Ausgabe in SEINER Sprache (Fallback en) mit
// PERSONALISIERTEM Abmeldelink (eigene /api/newsletter/unsubscribe-Route).
// dryRun zählt nur und sendet nichts — der Standard des CLI-Wrappers.
import { readFileSync } from 'node:fs'
import path from 'node:path'

const LANGS = ['en', 'de', 'fr', 'es']
export const BROADCAST_SERIES = ['cosmic', 'offer', 'promo']

/** Lädt die 4 Sprachfassungen einer Ausgabe aus docs/newsletter-drafts. */
function loadEdition(draftsDir, series, date) {
  const editions = {}
  for (const lang of LANGS) {
    const file = path.join(draftsDir, `${date}-${series}-${lang}.html`)
    try {
      const html = readFileSync(file, 'utf8')
      const subject = (html.match(/<title>([^<]+)<\/title>/) || [])[1] || 'SizhuAtelier'
      editions[lang] = { html, subject }
    } catch {
      /* Sprachfassung fehlt → Fallback greift beim Zustellen */
    }
  }
  if (!editions.en) throw new Error(`Ausgabe nicht gefunden: ${series} ${date} (mindestens -en.html erforderlich)`)
  return editions
}

/**
 * @returns {Promise<{dryRun:boolean,total:number,sent:number,byLang:Record<string,number>,failures:Array<{email:string,error:string}>}>}
 */
export async function runBroadcast({ pool, resend, publicUrl, from, series, date, dryRun = true, draftsDir = 'docs/newsletter-drafts' }) {
  if (!BROADCAST_SERIES.includes(series)) throw new Error(`unbekannte Serie: ${series}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('date muss YYYY-MM-DD sein')
  const editions = loadEdition(draftsDir, series, date)

  const r = await pool.query(
    `SELECT email, language, confirm_token FROM newsletter_signups WHERE status = 'confirmed' ORDER BY id`,
  )
  const subscribers = r.rows || []
  const byLang = {}
  const failures = []
  let sent = 0

  for (const s of subscribers) {
    const lang = LANGS.includes(String(s.language || '').toLowerCase()) ? String(s.language).toLowerCase() : 'en'
    byLang[lang] = (byLang[lang] || 0) + 1
    if (dryRun) continue
    const ed = editions[lang] || editions.en
    const unsubscribe = `${publicUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(s.confirm_token || '')}`
    const html = ed.html.replaceAll('{{{RESEND_UNSUBSCRIBE_URL}}}', unsubscribe)
    try {
      await resend.emails.send({ from, to: s.email, subject: ed.subject, html })
      sent += 1
    } catch (err) {
      failures.push({ email: s.email, error: err.message })
    }
  }
  return { dryRun, total: subscribers.length, sent, byLang, failures }
}
