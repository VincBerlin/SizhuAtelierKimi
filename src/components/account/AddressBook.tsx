import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { useT } from '../../i18n/I18nProvider'
import { apiAddresses, apiCreateAddress, apiUpdateAddress, apiDeleteAddress, apiSetDefaultAddress, type Address, type AddressInput } from '../../lib/auth'
import { C, FONT_SANS } from '../../lib/tokens'
import { acctInput, acctCard, acctLabel, acctPrimary, acctGhost, acctLink, sectionTitle } from './ui'

const EMPTY: AddressInput = { full_name: '', line1: '', line2: '', postal_code: '', city: '', region: '', country: '', phone: '' }

// §5.2.2 / §5.2.3 — manage shipping (or billing) addresses: list, add, edit,
// delete, set default. All scoped server-side to the session user.
export default function AddressBook({ type, onChange }: { type: 'shipping' | 'billing'; onChange?: () => void }) {
  const { t } = useT()
  const [list, setList] = useState<Address[]>([])
  const [editing, setEditing] = useState<null | 'new' | number>(null)
  const [form, setForm] = useState<AddressInput>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const errText = (code?: string) => (t(`auth.err.${code}`) !== `auth.err.${code}` ? t(`auth.err.${code}`) : t('auth.err.server_error'))
  const load = async () => { const all = await apiAddresses(); setList(all.filter((a) => a.type === type)) }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startNew = () => { setForm({ ...EMPTY }); setEditing('new') }
  const startEdit = (a: Address) => {
    setForm({ full_name: a.full_name, line1: a.line1, line2: a.line2, postal_code: a.postal_code, city: a.city, region: a.region, country: a.country, phone: a.phone })
    setEditing(a.id)
  }
  const field = (k: keyof AddressInput) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    const body: AddressInput = { ...form, type }
    const r = editing === 'new' ? await apiCreateAddress({ ...body, makeDefault: list.length === 0 }) : await apiUpdateAddress(editing as number, body)
    setBusy(false)
    if (!r.ok) { setErr(errText(r.error)); return }
    setEditing(null); await load(); onChange?.()
  }
  const remove = async (id: number) => { setErr(''); const r = await apiDeleteAddress(id); if (!r.ok) { setErr(errText(r.error)); return } await load(); onChange?.() }
  const makeDefault = async (id: number) => { setErr(''); const r = await apiSetDefaultAddress(id); if (!r.ok) { setErr(errText(r.error)); return } await load(); onChange?.() }

  return (
    <div style={{ ...acctCard, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ ...sectionTitle, marginBottom: 0 }}>{type === 'billing' ? t('account.billingAddress') : t('account.shippingAddresses')}</div>
        {editing === null && <button onClick={startNew} style={acctLink}>+ {t('account.addAddress')}</button>}
      </div>

      {list.length === 0 && editing === null && <div style={{ fontSize: 13, color: C.textMuted3 }}>{t('account.noAddresses')}</div>}

      {editing === null && list.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((a) => (
            <div key={a.id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, color: C.ink }}>
                  {a.full_name || '—'}
                  {a.is_default && <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.accent }}>· {t('account.default')}</span>}
                </div>
                <div>{[a.line1, a.line2].filter(Boolean).join(', ')}</div>
                <div>{[a.postal_code, a.city, a.region, a.country].filter(Boolean).join(' · ')}</div>
                {a.phone && <div>{a.phone}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {!a.is_default && <button onClick={() => makeDefault(a.id)} style={acctLink}>{t('account.setDefault')}</button>}
                <button onClick={() => startEdit(a)} style={acctLink}>{t('account.edit')}</button>
                <button onClick={() => remove(a.id)} style={{ ...acctLink, color: C.strike }}>{t('account.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={acctLabel}>{t('account.fullName')}<input value={form.full_name} onChange={field('full_name')} maxLength={120} style={acctInput} /></label>
          <label style={acctLabel}>{t('account.line1')}<input value={form.line1} onChange={field('line1')} maxLength={120} style={acctInput} /></label>
          <label style={acctLabel}>{t('account.line2')}<input value={form.line2} onChange={field('line2')} maxLength={120} style={acctInput} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <label style={acctLabel}>{t('account.postalCode')}<input value={form.postal_code} onChange={field('postal_code')} maxLength={20} style={acctInput} /></label>
            <label style={acctLabel}>{t('account.city')}<input value={form.city} onChange={field('city')} maxLength={120} style={acctInput} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <label style={acctLabel}>{t('account.region')}<input value={form.region} onChange={field('region')} maxLength={120} style={acctInput} /></label>
            <label style={acctLabel}>{t('account.country')}<input value={form.country} onChange={field('country')} maxLength={2} placeholder="DE" style={acctInput} /></label>
          </div>
          <label style={acctLabel}>{t('account.phone')}<input value={form.phone} onChange={field('phone')} maxLength={40} style={acctInput} /></label>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={busy} className="transition-[filter] hover:brightness-110 disabled:opacity-50" style={acctPrimary}>{busy ? '…' : t('account.save')}</button>
            <button type="button" onClick={() => setEditing(null)} style={acctGhost}>{t('account.cancel')}</button>
          </div>
          <span style={{ fontSize: 11, color: C.textMuted3, fontFamily: FONT_SANS }}>{t(editing === 'new' ? 'account.addAddress' : 'account.editAddress')}</span>
        </form>
      )}
      {err && <p style={{ fontSize: 12.5, color: C.accent, margin: '12px 0 0' }}>{err}</p>}
    </div>
  )
}
