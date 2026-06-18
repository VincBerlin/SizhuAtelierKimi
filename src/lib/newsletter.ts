export interface NewsletterResult {
  ok: boolean
  error?: string
}

// POSTs a newsletter signup to the backend, which persists it to Postgres with a
// pending status + confirm token (double-opt-in ready). No real email is sent in
// the MVP — the backend stores the lead; an ESP/confirm step is wired later.
export async function subscribeNewsletter(email: string, consent: boolean, language: string, source = 'newsletter'): Promise<NewsletterResult> {
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, consent, language, source }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'server_error' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'network_error' }
  }
}
