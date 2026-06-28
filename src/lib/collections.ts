// Per-world collection configuration (REQ-010 / T-15).
//
// One small, declarative config drives the eight MVP collection routes. Each
// entry says: which slug, which products to show (a `product_world` filter axis
// from catalog.ts, or an explicit curated `productIds` list for cross-world
// collections), and the page content (title / intro / SEO / FAQ). The reusable
// <Collection> template renders all of them — no per-collection components, no
// invented inventory (the grid is always real catalog data, REQ-013 AK-3).
//
// RED-line discipline: copy here is honest framing ("symbolic artwork inspired
// by your birth data", "curated knowledge/teaching graphics") — it never claims
// a precise computed chart or any health/cure effect.
import type { ProductWorld } from './catalog'

/** The eight MVP collection slugs (REQ-010 AK-1) — the exact, frozen set. */
export const COLLECTION_SLUGS = [
  'bazi-posters',
  'tcm-posters',
  'wuxing-posters',
  'personalized-posters',
  'compatibility-posters',
  'fire-horse-2026',
  'analysis-pdfs',
  'bundles',
] as const

export type CollectionSlug = (typeof COLLECTION_SLUGS)[number]

export interface CollectionFaq {
  q: string
  a: string
}

export interface CollectionConfig {
  /** URL slug under /collections/. */
  slug: CollectionSlug
  /** Eyebrow / category label above the H1. */
  eyebrow: string
  /** H1. */
  title: string
  /** Intro paragraph under the H1. */
  intro: string
  /**
   * Filter axis: the product world whose catalog entries fill the grid
   * (REQ-013 AK-3). Mutually informative with `productIds` — if `productIds`
   * is set it wins (curated, cross-world collections).
   */
  world?: ProductWorld
  /**
   * Curated, explicit product id list — used by collections that are not a
   * single product world (fire horse, bundles, analysis PDFs). Order is the
   * display order. Falls back to `world` when empty/absent.
   */
  productIds?: number[]
  /** Optional label for the hero/category visual slot. */
  heroLabel: string
  /** SEO text block: an H2 heading + 1–N paragraphs (REQ-010 AK-3 / §16.4). */
  seo: { heading: string; body: string[] }
  /** Collection-specific FAQ (≥1 item). */
  faq: CollectionFaq[]
}

/** Build the production path for a collection slug. */
export function collectionPath(slug: CollectionSlug | string): string {
  return `/collections/${slug}`
}

/**
 * The MVP collection configs. Kept terse and honest; the grid is always sourced
 * from the real catalog (never an invented assortment).
 */
export const COLLECTION_CONFIGS: CollectionConfig[] = [
  {
    slug: 'bazi-posters',
    eyebrow: 'BaZi · Vier Säulen',
    title: 'Personalisierte BaZi-Poster',
    intro:
      'Aus deinem Geburtsdatum, deiner Geburtszeit und deinem Geburtsort komponieren wir ein symbolisches Vier-Säulen-Kunstwerk — inspiriert von deinen Geburtsdaten, kein Standardmotiv.',
    world: 'bazi',
    heroLabel: 'BaZi-Welt',
    seo: {
      heading: 'Personalisierte BaZi-Poster online kaufen',
      body: [
        'Ein BaZi-Poster hält die vier Säulen — Jahr, Monat, Tag und Stunde deiner Geburt — als ruhiges, persönliches Diagramm fest. Es ist ein symbolisches Kunstwerk, inspiriert von deinen Geburtsdaten, kein Wahrsage-Werkzeug.',
        'Jedes Motiv wird auf Bestellung gefertigt: Archiv-Pigmentdruck in Museumsqualität, säurefreies Naturpapier, optional gerahmt. Wähle Format, Rahmen und Hintergrundpalette im Konfigurator mit Live-Vorschau.',
      ],
    },
    faq: [
      {
        q: 'Wie entsteht mein BaZi-Poster?',
        a: 'Aus den Geburtsdaten, die du eingibst, gestalten wir ein symbolisches Vier-Säulen-Layout. Wir erfassen deine Angaben für die geplante Berechnung; das Motiv ist ein Kunstwerk, kein präzises astronomisches Chart.',
      },
      {
        q: 'Welche Daten brauche ich?',
        a: 'Geburtsdatum, möglichst genaue Geburtszeit und Geburtsort. Optional ein Name fürs Poster.',
      },
    ],
  },
  {
    slug: 'tcm-posters',
    eyebrow: 'TCM · Lehrgrafiken',
    title: 'TCM-Poster für Praxis & Wissen',
    intro:
      'Kuratierte Wissens- und Fachgrafiken rund um die Fünf Elemente — gestaltet für Behandlungsräume, Studios und Zuhause. Direkt versandfertig, nicht personalisiert.',
    world: 'tcm',
    heroLabel: 'TCM-Welt',
    seo: {
      heading: 'TCM-Poster für Praxis, Wissen und Wohnraum',
      body: [
        'Unsere TCM-Poster sind kuratierte Wissens- und Fachgrafiken: klare Lehrtafeln der Fünf Elemente, gestaltet für Unterricht, Praxis und Wohnraum. Sie erklären und schmücken — sie sind keine medizinische Beratung und versprechen keine Wirkung.',
        'Standardprodukte ohne Geburtsdaten, direkt versandfertig. Archiv-Pigmentdruck in Museumsqualität, optional mit abwischbarem Museumsglas für hygienesensible Räume.',
      ],
    },
    faq: [
      {
        q: 'Sind die TCM-Poster personalisiert?',
        a: 'Nein. Es sind kuratierte Lehr- und Fachgrafiken — Standardprodukte ohne Geburtsdaten, direkt versandfertig.',
      },
      {
        q: 'Eignen sie sich für Behandlungsräume?',
        a: 'Ja. Ruhige Fernwirkung erdet den Raum; optional mit abwischbarem Museumsglas.',
      },
    ],
  },
  {
    slug: 'wuxing-posters',
    eyebrow: 'Wuxing · Fünf Elemente',
    title: 'Wuxing & die Fünf Elemente',
    intro:
      'Holz, Feuer, Erde, Metall und Wasser im Gleichgewicht — eine lehrreiche, atmosphärische Grafik für Praxis und Zuhause.',
    world: 'wuxing',
    heroLabel: 'Wuxing-Welt',
    seo: {
      heading: 'Wuxing-Poster und die Fünf Elemente',
      body: [
        'Das Wuxing-Poster zeigt den Kreislauf der Fünf Elemente — wie sie einander nähren und kontrollieren. Eine kuratierte Wissensgrafik, ruhig und atmosphärisch, lehrreich für Praxis und Zuhause.',
        'Archiv-Pigmentdruck in Museumsqualität auf nachhaltigem Papier. Kein personalisiertes Motiv — direkt versandfertig.',
      ],
    },
    faq: [
      {
        q: 'Was zeigt das Wuxing-Poster?',
        a: 'Den Kreislauf der Fünf Elemente — Holz, Feuer, Erde, Metall, Wasser — als kuratierte Wissensgrafik.',
      },
    ],
  },
  {
    slug: 'personalized-posters',
    eyebrow: 'Personalisiert',
    title: 'Personalisierte Poster',
    intro:
      'Alle Motive, die wir aus deinen Geburtsdaten komponieren — als symbolisches Kunstwerk, inspiriert von dir.',
    world: 'bazi',
    heroLabel: 'Personalisiert',
    seo: {
      heading: 'Personalisierte Poster aus deinen Geburtsdaten',
      body: [
        'Personalisierte Poster entstehen aus den Geburtsdaten, die du eingibst — ein symbolisches Vier-Säulen-Kunstwerk, inspiriert von dir, kein Standardmotiv und kein Wahrsage-Werkzeug.',
        'Wähle Format, Rahmen und Hintergrundpalette im Konfigurator mit Live-Vorschau. Auf Bestellung gefertigt, nummeriert, in Museumsqualität gedruckt.',
      ],
    },
    faq: [
      {
        q: 'Wie persönlich ist das Motiv?',
        a: 'Jedes Layout basiert auf deinen eingegebenen Geburtsdaten — kein Motiv gleicht dem anderen. Es ist ein Kunstwerk, kein präzises Chart.',
      },
    ],
  },
  {
    slug: 'compatibility-posters',
    eyebrow: 'Für Paare',
    title: 'Kompatibilitäts-Poster für Paare',
    intro:
      'Zwei Geburtscharts auf einem Motiv — ein symbolisches Kunstwerk für Paare, inspiriert von euren Geburtsdaten.',
    // Couple compatibility builds on the personalizable BaZi posters today
    // (curated subset) — honest: no invented "couple SKU".
    productIds: [1, 5, 3],
    heroLabel: 'Kompatibilität',
    seo: {
      heading: 'Kompatibilitäts-Poster für Paare online gestalten',
      body: [
        'Ein Kompatibilitäts-Poster bringt zwei Geburtscharts in einem ruhigen, symbolischen Motiv zusammen — inspiriert von euren Geburtsdaten. Ein persönliches Geschenk zu Hochzeit, Jahrestag oder Einzug.',
        'Beide Geburtsdaten gibst du im Konfigurator ein; das Ergebnis ist ein Kunstwerk, kein präzises astronomisches Chart. Auf Bestellung gefertigt, in Museumsqualität gedruckt.',
      ],
    },
    faq: [
      {
        q: 'Brauche ich beide Geburtsdaten?',
        a: 'Ja — für ein Paar-Motiv erfassen wir beide Geburtsdaten. Das Motiv ist ein symbolisches Kunstwerk.',
      },
    ],
  },
  {
    slug: 'fire-horse-2026',
    eyebrow: 'Limited Edition',
    title: 'Feuerpferd 2026',
    intro:
      'Die limitierte Edition zum Jahr des Feuer-Pferds 2026 — nummeriert und signiert, solange der Vorrat reicht.',
    productIds: [8],
    heroLabel: 'Feuerpferd 2026',
    seo: {
      heading: 'Feuerpferd 2026 — Limited Edition Poster',
      body: [
        'Das Feuerpferd-Poster feiert das Jahr des Feuer-Pferds 2026: kraftvolles Terracotta, nummeriert und signiert. Ein Sammlerstück mit Charakter — kein personalisiertes Motiv, direkt versandfertig.',
        'Limitierte Auflage, solange der Vorrat reicht. Archiv-Pigmentdruck in Museumsqualität.',
      ],
    },
    faq: [
      {
        q: 'Ist das Feuerpferd-Poster personalisiert?',
        a: 'Nein — es ist eine limitierte Jahresedition, nummeriert und signiert, direkt versandfertig.',
      },
    ],
  },
  {
    slug: 'analysis-pdfs',
    eyebrow: 'Digital',
    title: 'Analyse-PDFs',
    intro:
      'Die digitale BaZi-Chart-Analyse als 10–15-seitiges PDF — einzeln oder vergünstigt im Bundle mit einem Poster.',
    // The digital analysis ships alongside the BaZi posters it pairs with;
    // surface those so the grid is real (no invented digital SKUs in catalog).
    productIds: [1, 6, 3],
    heroLabel: 'Analyse-PDFs',
    seo: {
      heading: 'Digitale BaZi-Analyse als PDF',
      body: [
        'Die digitale BaZi-Chart-Analyse fasst die vier Säulen, deinen Tagesmeister und die Balance der Fünf Elemente in einem persönlichen 10–15-seitigen PDF zusammen — eine erfasste Auswertung deiner Eingaben, kein präzises astronomisches Gutachten.',
        'Sofort nach Fertigstellung als Download — einzeln oder vergünstigt im Bundle mit einem Poster.',
      ],
    },
    faq: [
      {
        q: 'Was enthält die Analyse?',
        a: 'Eine persönliche PDF-Auswertung der vier Säulen und der Elemente-Balance, erfasst aus deinen Eingaben.',
      },
    ],
  },
  {
    slug: 'bundles',
    eyebrow: 'Sets',
    title: 'Bundles & Sets',
    intro:
      'Stimmige Poster-Sets für Praxis, Studio und Zuhause — kuratiert und vergünstigt zusammengestellt.',
    // A curated, intentionally mixed set: personalisierbare BaZi-Poster plus die
    // versandfertige Wuxing-Lehrgrafik (#7, personalizable:false), so a set can
    // pair a personal motif with a ready-to-ship knowledge poster.
    productIds: [1, 2, 5, 3, 4, 7],
    heroLabel: 'Bundles',
    seo: {
      heading: 'Poster-Bundles und Sets',
      body: [
        'Unsere Bundles fassen aufeinander abgestimmte Poster zu einem stimmigen Set zusammen — für Behandlung, Empfang und Wartebereich oder als Wellness-Trio. Kuratiert und vergünstigt.',
        'Jedes Poster im Set wird auf Bestellung in Museumsqualität gefertigt.',
      ],
    },
    faq: [
      {
        q: 'Kann ich ein Set individuell zusammenstellen?',
        a: 'Die Bundles sind kuratiert; einzelne Poster lassen sich zusätzlich personalisieren.',
      },
    ],
  },
]

/** Look up a collection config by slug (total — returns undefined if unknown). */
export function getCollectionConfig(slug: string): CollectionConfig | undefined {
  return COLLECTION_CONFIGS.find((c) => c.slug === slug)
}

// ── Offers / Sale / Campaign hub (REQ-024 / T-305) ───────────────────────────
//
// The hub holds SEVERAL curated sections (short text + product slider + CTA),
// so no single promo balloons into its own overloaded landing page (REQ-024
// THESE). Each section is declarative and HONEST:
//   - `productIds` curates a REAL catalog slice (never an invented assortment);
//   - `ctaSlug` points at an EXISTING collection route (no dead link, AT-024-2/4);
//   - copy lives in i18n under `offers.sections.<id>` (eyebrow/title/text/cta).
//
// RED-line discipline: NO invented discounts, NO countdowns, NO "Coming Soon"
// fake. A section's value is "curated for X" — the real per-product anchor/price
// shown on each card is the only price signal, and final figures stay
// operator-owned (OQ-002, RL-PRICES RED). Hub campaign imagery is asset-light
// until OQ-001 (RL-IMAGES RED) — the page renders marked placeholders, never a
// real /images/*.webp visual.

export interface OffersSection {
  /** Stable section id — i18n namespace (`offers.sections.<id>`) + DOM anchor. */
  id: string
  /**
   * Curated, ordered catalog ids that fill this section's product slider.
   * Order is display order; ids with no matching product are skipped downstream
   * (productsByIds is total), so the slider is always real catalog data.
   */
  productIds: number[]
  /** Where the section CTA leads — an EXISTING collection slug (live route). */
  ctaSlug: CollectionSlug
}

/**
 * The curated hub sections (≥2, REQ-024 AC). Each pairs a real catalog slice
 * with a live collection CTA. Kept terse — this is the campaign skeleton; final
 * copy/pricing/imagery are operator/launch-owned (see RED-line note above).
 */
export const OFFERS_SECTIONS: OffersSection[] = [
  // Sets first: the strongest curated "value" framing without inventing a number
  // (each bundle SKU already carries its own honest anchor → price on the card).
  { id: 'bundles', productIds: [1, 2, 5, 3, 4, 7], ctaSlug: 'bundles' },
  // The limited annual edition — a real, time-bound product (no fake countdown).
  { id: 'fire-horse', productIds: [8], ctaSlug: 'fire-horse-2026' },
  // Personalized BaZi — the core personalizable world, surfaced as a slider.
  { id: 'bazi', productIds: [1, 6, 3, 2], ctaSlug: 'bazi-posters' },
  // Ready-to-ship TCM knowledge posters — non-personalized, ships immediately.
  { id: 'tcm', productIds: [11, 12, 13, 14], ctaSlug: 'tcm-posters' },
]
