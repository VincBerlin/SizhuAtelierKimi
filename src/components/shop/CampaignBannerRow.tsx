import { Link } from 'react-router'
import { collectionPath, type CollectionSlug } from '../../lib/collections'
import { C, FONT_SERIF, FONT_SANS, CONTAINER } from '../../lib/tokens'
import { useT } from '../../i18n/I18nProvider'

// M11 / REQ-019 — a UNIFIED visual campaign banner row. This SUPERSEDES the three
// separate below-fold text-band sections (Fire Horse / Compatibility / Digital
// Analysis) plus Poster Sets, folding them into one visual grid. Each banner is a
// real link to an existing collection route (no dead links); imagery is
// asset-light (a tinted hatch placeholder, `data-placeholder`) until real assets
// land (OQ-002 / RL-IMAGES RED) — never a fake product photo.
interface Banner {
  key: string
  slug: CollectionSlug
  tint: string
}

const BANNERS: Banner[] = [
  { key: 'fireHorse', slug: 'fire-horse-2026', tint: '#BC7A5E' },
  { key: 'compatibility', slug: 'compatibility-posters', tint: '#C8A98F' },
  { key: 'analysis', slug: 'analysis-pdfs', tint: '#AFBCA6' },
  { key: 'sets', slug: 'bundles', tint: '#C9BCA6' },
]

export default function CampaignBannerRow() {
  const { t } = useT()
  return (
    <section data-testid="home-campaign-row" style={{ maxWidth: CONTAINER, margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.accent, marginBottom: 10 }}>{t('home.campaign.eyebrow')}</div>
        <h2 style={{ fontFamily: FONT_SERIF, fontWeight: 400, fontSize: 'clamp(26px,3.2vw,36px)', color: C.ink, margin: 0 }}>{t('home.campaign.title')}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
        {BANNERS.map(({ key, slug, tint }) => (
          <Link
            key={key}
            data-testid="home-campaign-banner"
            to={collectionPath(slug)}
            className="transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_34px_-22px_rgba(42,38,32,0.45)]"
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.surface, border: `1px solid ${C.border}`, textDecoration: 'none' }}
          >
            {/* asset-light visual band — hatch placeholder, no real /images/*.webp */}
            <span
              data-testid="home-campaign-image"
              data-placeholder="true"
              aria-hidden="true"
              style={{ height: 128, borderBottom: `1px solid ${C.border}`, background: `repeating-linear-gradient(45deg, ${tint} 0 10px, rgba(255,255,255,0.35) 10px 20px)` }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '18px 20px 20px' }}>
              <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 20, color: C.ink, lineHeight: 1.2 }}>{t(`home.campaign.items.${key}.title`)}</span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13.5, color: C.textMuted, lineHeight: 1.55 }}>{t(`home.campaign.items.${key}.sub`)}</span>
              <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.accent, marginTop: 2 }}>{t(`home.campaign.items.${key}.cta`)} →</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
