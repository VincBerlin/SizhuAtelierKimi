import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../store/AuthProvider'
import { apiLogin, apiSignup, apiLogout, apiUpdatePrefs, apiResetRequest, apiResetConfirm, apiOrders, apiBillingPortal, type OrderRow } from '../lib/auth'
import { useT } from '../i18n/I18nProvider'
import { euro } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, CONTAINER, ACCENT_CTA_SHADOW } from '../lib/tokens'
import PersonalDetails from '../components/account/PersonalDetails'
import AddressBook from '../components/account/AddressBook'

const inputStyle: CSSProperties = { border: `1px solid ${C.borderInput}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, fontFamily: FONT_SANS, background: C.surfaceInput, color: C.ink, width: '100%', boxSizing: 'border-box' }
const cardStyle: CSSProperties = { background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }
const primaryBtn: CSSProperties = { width: '100%', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 15, borderRadius: 12, fontSize: 15, fontWeight: 600, fontFamily: FONT_SANS, boxShadow: ACCENT_CTA_SHADOW }
const errBox: CSSProperties = { fontSize: 13, color: C.accent, margin: 0 }

export default function Account() {
  const { user, loading, refresh } = useAuth()
  const [params] = useSearchParams()
  const resetToken = params.get('reset')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <main style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '40px 32px 80px' }}>
      {loading ? <Centered>…</Centered> : resetToken ? <ResetConfirm token={resetToken} /> : user ? <Dashboard /> : <AuthForms onAuthed={refresh} />}
    </main>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted2, fontFamily: FONT_SANS }}>{children}</div>
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(28px,4vw,40px)', color: C.ink, margin: '0 0 6px' }}>{children}</h1>
}

/* ---- logged-out: login / signup + forgot ---- */
function AuthForms({ onAuthed }: { onAuthed: () => Promise<void> }) {
  const { t } = useT()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  const errText = (code?: string) => t(`auth.err.${code}`) !== `auth.err.${code}` ? t(`auth.err.${code}`) : t('auth.err.server_error')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setNotice(''); setBusy(true)
    if (mode === 'forgot') {
      await apiResetRequest(email.trim())
      setBusy(false); setNotice(t('auth.resetSent')); return
    }
    const r = mode === 'login' ? await apiLogin(email.trim(), password) : await apiSignup(email.trim(), password, consent, name.trim())
    setBusy(false)
    if (!r.ok) { setErr(errText(r.error)); return }
    await onAuthed()
  }

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Heading>{mode === 'signup' ? t('auth.createTitle') : mode === 'forgot' ? t('auth.forgotTitle') : t('auth.loginTitle')}</Heading>
        <p style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted, margin: 0 }}>{t('auth.subtitle')}</p>
      </div>
      <form onSubmit={submit} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'signup' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: C.textMuted2 }}>{t('account.name')}
            <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('account.namePh')} maxLength={120} style={inputStyle} />
          </label>
        )}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: C.textMuted2 }}>{t('auth.email')}
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </label>
        {mode !== 'forgot' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: C.textMuted2 }}>{t('auth.password')}
            <input type="password" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </label>
        )}
        {mode === 'signup' && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer', fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.accent, flexShrink: 0 }} />
            <span>{t('auth.marketingConsent')}</span>
          </label>
        )}
        {err && <p style={errBox}>{err}</p>}
        {notice && <p style={{ fontSize: 13, color: C.success, margin: 0 }}>{notice}</p>}
        <button type="submit" disabled={busy} className="transition-[filter] hover:brightness-110 disabled:opacity-60" style={primaryBtn}>
          {busy ? '…' : mode === 'signup' ? t('auth.createCta') : mode === 'forgot' ? t('auth.forgotCta') : t('auth.loginCta')}
        </button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13, fontFamily: FONT_SANS }}>
        {mode === 'login' ? (
          <>
            <button onClick={() => { setMode('signup'); setErr('') }} style={linkBtn}>{t('auth.toSignup')}</button>
            <button onClick={() => { setMode('forgot'); setErr('') }} style={linkBtn}>{t('auth.toForgot')}</button>
          </>
        ) : (
          <button onClick={() => { setMode('login'); setErr('') }} style={linkBtn}>{t('auth.toLogin')}</button>
        )}
      </div>
    </div>
  )
}

const linkBtn: CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontFamily: FONT_SANS, fontSize: 13, padding: 0 }

/* ---- logged-in dashboard ---- */
function Dashboard() {
  const { user, refresh } = useAuth()
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [consent, setConsent] = useState(!!user?.marketingConsent)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => { apiOrders().then(setOrders) }, [])
  useEffect(() => { setConsent(!!user?.marketingConsent) }, [user])

  const logout = async () => { await apiLogout(); await refresh(); navigate('/') }
  const saveConsent = async (next: boolean) => { setConsent(next); await apiUpdatePrefs(next); setSavedMsg(t('auth.saved')); setTimeout(() => setSavedMsg(''), 2000) }

  if (!user) return null
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <Heading>{t('auth.dashboardTitle')}</Heading>
        <button onClick={logout} style={linkBtn}>{t('auth.logout')}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 6 }}>{t('auth.creditBalance')}</div>
          <div style={{ fontFamily: FONT_SERIF, fontSize: 34, color: C.accent }}>{user.points} C.</div>
          <div style={{ fontSize: 12, color: C.textMuted3, marginTop: 4 }}>{t('auth.lifetime')}: {user.lifetime} C.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: C.textMuted2, marginBottom: 6 }}>{t('auth.emailLabel')}</div>
          {user.name && <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{user.name}</div>}
          <div style={{ fontSize: 15, color: C.ink, wordBreak: 'break-word' }}>{user.email}</div>
          <div style={{ fontSize: 12, color: C.textMuted3, marginTop: 8 }}>{t('auth.newsletterStatus')}: {user.newsletterStatus}</div>
        </div>
      </div>

      <PersonalDetails />
      <AddressBook type="shipping" onChange={refresh} />
      <AddressBook type="billing" onChange={refresh} />
      <PaymentSection />

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 12 }}>{t('auth.marketingPrefs')}</div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
          <input type="checkbox" checked={consent} onChange={(e) => saveConsent(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, accentColor: C.accent, flexShrink: 0 }} />
          <span>{t('auth.marketingConsent')}</span>
        </label>
        {savedMsg && <div style={{ fontSize: 12, color: C.success, marginTop: 8 }}>{savedMsg}</div>}
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 12 }}>{t('auth.orderHistory')}</div>
        {orders.length === 0 ? (
          <div style={{ fontSize: 13, color: C.textMuted3 }}>{t('auth.noOrders')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, borderBottom: i < orders.length - 1 ? `1px solid ${C.border}` : 'none', paddingBottom: 8 }}>
                <span style={{ color: C.textMuted }}>{new Date(o.created_at).toLocaleDateString(lang.toLowerCase())} · {(o.items || []).map((it) => it.description).filter(Boolean).join(', ') || '—'}</span>
                <span style={{ fontWeight: 600 }}>{euro((o.amount_total || 0) / 100)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---- payment methods (managed securely via the Stripe billing portal) ---- */
function PaymentSection() {
  const { user } = useAuth()
  const { t } = useT()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const manage = async () => {
    setBusy(true); setErr('')
    const r = await apiBillingPortal()
    setBusy(false)
    if (r.url) { window.location.href = r.url; return }
    setErr(t(`auth.err.${r.error}`) !== `auth.err.${r.error}` ? t(`auth.err.${r.error}`) : t('account.paymentUnavailable'))
  }
  return (
    <div style={{ ...cardStyle, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{t('account.paymentMethods')}</div>
      <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5, margin: '0 0 14px' }}>{t('account.paymentDesc')}</p>
      {!user?.hasPayment && <p style={{ fontSize: 12.5, color: C.textMuted3, margin: '0 0 14px' }}>{t('account.paymentNone')}</p>}
      <button onClick={manage} disabled={busy} className="transition-[filter] hover:brightness-110 disabled:opacity-50" style={{ ...primaryBtn, width: 'auto', padding: '12px 20px' }}>{busy ? '…' : t('account.managePayments')}</button>
      {err && <p style={{ fontSize: 12.5, color: C.accent, margin: '10px 0 0' }}>{err}</p>}
    </div>
  )
}

/* ---- password reset confirm (from email link ?reset=token) ---- */
function ResetConfirm({ token }: { token: string }) {
  const { t } = useT()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    const r = await apiResetConfirm(token, password)
    setBusy(false)
    if (!r.ok) { setErr(t(`auth.err.${r.error}`) !== `auth.err.${r.error}` ? t(`auth.err.${r.error}`) : t('auth.err.server_error')); return }
    setDone(true)
  }

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}><Heading>{t('auth.resetTitle')}</Heading></div>
      {done ? (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: C.success, margin: '0 0 14px' }}>{t('auth.resetDone')}</p>
          <button onClick={() => navigate('/account')} style={primaryBtn}>{t('auth.toLogin')}</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: C.textMuted2 }}>{t('auth.newPassword')}
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          </label>
          {err && <p style={errBox}>{err}</p>}
          <button type="submit" disabled={busy} className="transition-[filter] hover:brightness-110 disabled:opacity-60" style={primaryBtn}>{busy ? '…' : t('auth.resetCta')}</button>
        </form>
      )}
    </div>
  )
}
