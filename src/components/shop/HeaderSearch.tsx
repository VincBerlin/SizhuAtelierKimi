import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { X } from 'lucide-react'
import { products } from '../../lib/catalog'
import { useT } from '../../i18n/I18nProvider'
import { C, FONT_SANS } from '../../lib/tokens'

interface Entry { key: string; label: string; sub?: string; to: string; kw: string[] }

/**
 * Inline header search (PRD §7): expands within the existing header — NO overlay,
 * NO second header. Live suggestions in a dropdown below the bar; clickable rows
 * route to products / collections / gift ideas / pages. Keyword arrays are
 * multilingual so EN/DE/FR queries match.
 */
export default function HeaderSearch({ onClose }: { onClose: () => void }) {
  const { t } = useT()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onEsc) }
  }, [onClose])

  const index = useMemo<Entry[]>(() => {
    const collections: Entry[] = [
      { key: 'c-bazi', label: t('coll.cards.bazi.title'), to: '/product/1', kw: ['bazi', 'four pillars', 'vier säulen', 'poster'] },
      { key: 'c-birth', label: t('coll.cards.birthchart.title'), to: '/personalize', kw: ['birth chart', 'geburtschart', 'carte du ciel', 'natal', 'star chart'] },
      { key: 'c-couple', label: t('coll.cards.couple.title'), to: '/personalize', kw: ['couple', 'paar', 'compatibility', 'kompatibilität', 'wedding', 'hochzeit', 'mariage', 'anniversary', 'jahrestag', 'love'] },
      { key: 'c-fire', label: t('coll.cards.firehorse.title'), to: '/product/8', kw: ['fire horse', 'feuerpferd', 'cheval de feu', '2026'] },
      { key: 'c-digital', label: t('coll.cards.digital.title'), to: '/digital', kw: ['digital', 'pdf', 'analysis', 'analyse'] },
      { key: 'c-bundles', label: t('coll.cards.bundles.title'), to: '/bundles', kw: ['bundle', 'coffret', 'set', 'combo'] },
      { key: 'c-gifts', label: t('coll.cards.gifts.title'), to: '/gifts', kw: ['gift', 'gifts', 'geschenk', 'cadeau', 'present'] },
    ]
    const gifts: Entry[] = [
      { key: 'g-wedding', label: t('search.gifts.wedding'), to: '/gifts', kw: ['wedding', 'hochzeit', 'mariage', 'marriage'] },
      { key: 'g-birthday', label: t('search.gifts.birthday'), to: '/gifts', kw: ['birthday', 'geburtstag', 'anniversaire'] },
      { key: 'g-anniv', label: t('search.gifts.anniversary'), to: '/gifts', kw: ['anniversary', 'jahrestag', 'anniversaire'] },
      { key: 'g-baby', label: t('search.gifts.baby'), to: '/gifts', kw: ['baby', 'baby shower', 'geburt', 'naissance', 'newborn'] },
      { key: 'g-new', label: t('search.gifts.newbeginning'), to: '/gifts', kw: ['new beginning', 'neuanfang', 'housewarming', 'einzug', 'reset', 'move'] },
      { key: 'g-studio', label: t('search.gifts.studio'), to: '/gifts', kw: ['yoga', 'studio', 'wellness', 'tcm', 'practice', 'praxis', 'spiritual', 'clinic'] },
    ]
    const pages: Entry[] = [
      { key: 'p-faq', label: t('footer.faq'), to: '/faq', kw: ['faq', 'help', 'hilfe', 'questions'] },
      { key: 'p-about', label: t('footer.about'), to: '/about', kw: ['about', 'atelier', 'story'] },
      { key: 'p-ship', label: t('footer.shipping'), to: '/shipping', kw: ['shipping', 'versand', 'livraison'] },
      { key: 'p-return', label: t('footer.returns'), to: '/returns', kw: ['return', 'rückgabe', 'retour', 'refund', 'withdrawal'] },
      { key: 'p-contact', label: t('footer.contact'), to: '/contact', kw: ['contact', 'kontakt'] },
    ]
    const prods: Entry[] = products.map((p) => ({
      key: `prod-${p.id}`, label: String(t(`content.products.${p.id}.title`)), sub: p.category, to: `/product/${p.id}`,
      kw: [String(t(`content.products.${p.id}.title`)).toLowerCase(), p.category.toLowerCase()],
    }))
    return [...collections, ...gifts, ...prods, ...pages]
  }, [t])

  const query = q.trim().toLowerCase()
  const hits = useMemo(() => {
    if (!query) return []
    const seen = new Set<string>()
    return index.filter((e) => {
      if (seen.has(e.to + e.label)) return false
      const match = e.label.toLowerCase().includes(query) || e.kw.some((k) => k.includes(query) || query.includes(k))
      if (match) { seen.add(e.to + e.label); return true }
      return false
    }).slice(0, 8)
  }, [query, index])

  const go = (to: string) => { onClose(); navigate(to); window.scrollTo(0, 0) }

  return (
    <div ref={ref} style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 560, margin: '0 auto', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, padding: '8px 12px' }}>
        <span style={{ fontSize: 16, color: C.textMuted3 }}>⌕</span>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.placeholder')} style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontFamily: FONT_SANS, color: C.ink }} />
        <button onClick={onClose} aria-label={t('nav.close')} className="flex items-center justify-center" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted2, flexShrink: 0 }}>
          <X size={16} strokeWidth={2} />
        </button>
      </div>
      {query.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 4, boxShadow: '0 16px 36px -18px rgba(28,24,18,0.4)', overflow: 'hidden', zIndex: 70 }}>
          {hits.length === 0 ? (
            <div style={{ padding: '14px 14px', fontSize: 13, color: C.textMuted2, fontFamily: FONT_SANS }}>{t('search.noResults')}</div>
          ) : (
            hits.map((e) => (
              <button key={e.key} onClick={() => go(e.to)} className="block w-full text-left transition-colors hover:bg-[#F5F0E6]" style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '11px 14px', fontFamily: FONT_SANS, minHeight: 44 }}>
                <span style={{ fontSize: 14, color: C.ink }}>{e.label}</span>
                {e.sub && <span style={{ fontSize: 12, color: C.textMuted3, marginLeft: 8 }}>{e.sub}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
