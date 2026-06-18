import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { products } from '../../lib/catalog'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SANS } from '../../lib/tokens'

// MVP collections (no Saju/Junishi) — each maps to a resolving destination.
const COLLECTION_KEYS = [
  { key: 'bazi', to: '/product/1' },
  { key: 'birthchart', to: '/personalize' },
  { key: 'couple', to: '/personalize' },
  { key: 'firehorse', to: '/product/8' },
  { key: 'digital', to: '/digital' },
  { key: 'bundles', to: '/bundles' },
  { key: 'gifts', to: '/personalize' },
]

/** Minimal premium search (REQ-051): fullscreen overlay, blurred backdrop, live
 *  filtering of products + collections. No Saju/Junishi in the index. */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onEsc); document.body.style.overflow = '' }
  }, [open, onClose])
  useEffect(() => { if (!open) setQ('') }, [open])

  const query = q.trim().toLowerCase()
  const productHits = useMemo(() => {
    if (!query) return []
    return products.filter((p) => String(t(`content.products.${p.id}.title`)).toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
  }, [query, t])
  const collectionHits = useMemo(() => {
    if (!query) return []
    return COLLECTION_KEYS.filter((c) => String(t(`coll.cards.${c.key}.title`)).toLowerCase().includes(query))
  }, [query, t])

  const go = (to: string) => { onClose(); navigate(to); window.scrollTo(0, 0) }

  if (!open) return null
  const hasQuery = query.length > 0
  const hasResults = productHits.length + collectionHits.length > 0

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(28,24,18,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '12px 16px' }}>
          <span style={{ fontSize: 18, color: C.textMuted3 }}>⌕</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.placeholder')} style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontFamily: FONT_SANS, color: C.ink }} />
          <button onClick={onClose} aria-label={t('nav.close')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.textMuted2, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderTop: 'none', borderRadius: '0 0 4px 4px', maxHeight: '60vh', overflowY: 'auto' }}>
          {!hasQuery && <div style={{ padding: '18px 16px', fontSize: 13, color: C.textMuted2 }}>{t('search.hint')}</div>}
          {hasQuery && !hasResults && <div style={{ padding: '18px 16px', fontSize: 14, color: C.textMuted2 }}>{t('search.noResults')}</div>}
          {collectionHits.length > 0 && <Group label={t('search.collections')} />}
          {collectionHits.map((c) => (
            <Row key={'c' + c.key} title={String(t(`coll.cards.${c.key}.title`))} onClick={() => go(c.to)} />
          ))}
          {productHits.length > 0 && <Group label={t('search.products')} />}
          {productHits.map((p) => (
            <Row key={'p' + p.id} title={String(t(`content.products.${p.id}.title`))} sub={p.category} onClick={() => go(`/product/${p.id}`)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Group({ label }: { label: string }) {
  return <div style={{ padding: '12px 16px 6px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textMuted3 }}>{label}</div>
}
function Row({ title, sub, onClick }: { title: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="block w-full text-left transition-colors hover:bg-[#F5F0E6]" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 16px', fontFamily: FONT_SANS }}>
      <span style={{ fontSize: 14, color: C.ink }}>{title}</span>
      {sub && <span style={{ fontSize: 12, color: C.textMuted3, marginLeft: 8 }}>{sub}</span>}
    </button>
  )
}
