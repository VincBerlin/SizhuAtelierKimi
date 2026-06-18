import { useState, type FormEvent } from 'react'
import { useAuth } from '../../store/AuthProvider'
import { useT, LANGS } from '../../i18n/I18nProvider'
import { apiUpdateProfile, apiChangePassword } from '../../lib/auth'
import { C, FONT_SANS } from '../../lib/tokens'
import { acctInput, acctCard, acctLabel, acctPrimary, sectionTitle } from './ui'

// §5.2.1 — Personal details: name, preferred language, change password.
export default function PersonalDetails() {
  const { user, refresh } = useAuth()
  const { t, lang, setLang } = useT()
  const [name, setName] = useState(user?.name || '')
  const [prefLang, setPrefLang] = useState(((user?.preferredLanguage || lang) as string).toUpperCase())
  const [savedMsg, setSavedMsg] = useState('')
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  const errText = (code?: string) => (t(`auth.err.${code}`) !== `auth.err.${code}` ? t(`auth.err.${code}`) : t('auth.err.server_error'))

  const saveProfile = async () => {
    const r = await apiUpdateProfile(name.trim(), prefLang.toLowerCase())
    if (r.ok) {
      setLang(prefLang as typeof lang)
      await refresh()
      setSavedMsg(t('account.saved'))
      setTimeout(() => setSavedMsg(''), 2000)
    }
  }

  const changePw = async (e: FormEvent) => {
    e.preventDefault(); setPwErr(''); setPwMsg(''); setPwBusy(true)
    const r = await apiChangePassword(cur, next)
    setPwBusy(false)
    if (!r.ok) { setPwErr(errText(r.error)); return }
    setPwMsg(t('account.passwordChanged')); setCur(''); setNext('')
  }

  return (
    <div style={{ ...acctCard, marginBottom: 20 }}>
      <div style={sectionTitle}>{t('account.personalDetails')}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, marginBottom: 12 }}>
        <label style={acctLabel}>{t('account.name')}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('account.namePh')} maxLength={120} style={acctInput} />
        </label>
        <label style={acctLabel}>{t('account.language')}
          <select value={prefLang} onChange={(e) => setPrefLang(e.target.value)} style={acctInput}>
            {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={saveProfile} className="transition-[filter] hover:brightness-110" style={acctPrimary}>{t('account.save')}</button>
        {savedMsg && <span style={{ fontSize: 12, color: C.success }}>{savedMsg}</span>}
      </div>

      <form onSubmit={changePw} style={{ marginTop: 22, borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 12 }}>{t('account.changePassword')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, marginBottom: 12 }}>
          <label style={acctLabel}>{t('account.currentPassword')}
            <input type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} style={acctInput} />
          </label>
          <label style={acctLabel}>{t('account.newPassword')}
            <input type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} style={acctInput} />
          </label>
        </div>
        {pwErr && <p style={{ fontSize: 13, color: C.accent, margin: '0 0 10px' }}>{pwErr}</p>}
        {pwMsg && <p style={{ fontSize: 13, color: C.success, margin: '0 0 10px', fontFamily: FONT_SANS }}>{pwMsg}</p>}
        <button type="submit" disabled={pwBusy || !cur || !next} className="transition-[filter] hover:brightness-110 disabled:opacity-50" style={acctPrimary}>{pwBusy ? '…' : t('account.updatePassword')}</button>
      </form>
    </div>
  )
}
