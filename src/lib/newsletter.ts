export interface NewsletterResult {
  ok: boolean
  error?: string
  // Operator-Batch #8 (Double-Opt-In): true, wenn der Server die
  // Bestätigungs-Mail wirklich versendet hat — nur dann darf die UI
  // „prüfe dein Postfach" behaupten (Ehrlichkeitsregel).
  confirmSent?: boolean
}

// POSTs a newsletter signup to the backend, which persists it to Postgres with a
// pending status + confirm token and (when the mailer is configured) sends the
// double-opt-in confirmation email.
export async function subscribeNewsletter(email: string, consent: boolean, language: string, source = 'newsletter'): Promise<NewsletterResult> {
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, consent, language, source }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'server_error' }
    return { ok: true, confirmSent: data.confirmSent === true }
  } catch {
    return { ok: false, error: 'network_error' }
  }
}
