import { useEffect } from 'react'
import { FileText, Check, ShieldCheck } from 'lucide-react'
import { digitalProduct } from '../lib/catalog'
import { useShopStore } from '../store/ShopStore'
import { euro } from '../lib/format'
import { C, FONT_SERIF, FONT_SANS, ACCENT_CTA_SHADOW } from '../lib/tokens'

const bullets = [
  'Vier Säulen & Tagesmeister verständlich erklärt',
  'Balance der fünf Elemente — Stärken & Muster',
  '10–15 Seiten, als PDF zum Download',
  'Einzeln oder vergünstigt im Bundle',
]

export default function DigitalPage() {
  const { addItem, showToast } = useShopStore()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const add = () => {
    addItem({ title: digitalProduct.title, price: digitalProduct.price, qty: 1, poster: null, meta: digitalProduct.subtitle })
    showToast('Zum Warenkorb hinzugefügt')
  }

  return (
    <main style={{ background: C.bg, minHeight: '60vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px 72px' }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.accent, marginBottom: 12 }}>Digital · PDF</div>
        <h1 style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 'clamp(32px,4.5vw,46px)', color: C.ink, margin: '0 0 6px', lineHeight: 1.1 }}>{digitalProduct.title}</h1>
        <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: C.textMuted2, marginBottom: 22 }}>{digitalProduct.subtitle}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <FileText size={48} strokeWidth={1.2} style={{ color: C.accent }} />
            <div style={{ fontFamily: FONT_SERIF, fontSize: 22, color: C.ink, marginTop: 14 }}>BaZi · Persönliche Analyse</div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.textMuted2, marginTop: 4 }}>{digitalProduct.subtitle}</div>
          </div>

          <div>
            {digitalProduct.description.map((p) => (
              <p key={p} style={{ fontFamily: FONT_SANS, fontSize: 16, lineHeight: 1.7, color: '#4A4438', margin: '0 0 14px' }}>{p}</p>
            ))}
            <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {bullets.map((b) => (
                <li key={b} style={{ display: 'flex', gap: 10, fontFamily: FONT_SANS, fontSize: 14, color: '#4A4438', lineHeight: 1.5 }}>
                  <Check size={17} strokeWidth={2} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} />{b}
                </li>
              ))}
            </ul>
            <div style={{ fontFamily: FONT_SANS, fontSize: 28, fontWeight: 600, color: C.ink, marginBottom: 14 }}>{euro(digitalProduct.price)}</div>
            <button onClick={add} className="transition-[filter] hover:brightness-110" style={{ width: '100%', maxWidth: 360, background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: FONT_SANS, boxShadow: ACCENT_CTA_SHADOW }}>
              In den Warenkorb · {euro(digitalProduct.price)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontFamily: FONT_SANS, fontSize: 12.5, color: C.textMuted2 }}>
              <ShieldCheck size={15} strokeWidth={1.6} style={{ color: C.accent }} /> Sichere Zahlung · sofortiger Download nach Fertigstellung
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
