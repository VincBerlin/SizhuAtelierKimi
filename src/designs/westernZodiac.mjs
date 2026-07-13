// Design "Western Zodiac" — westliches Geburtshoroskop (Birth-Chart-Poster,
// Operator 2026-07-14). Vertrag (kind: 'western'):
//   render(data, {widthMm, heightMm}) mit
//   data = { frame, bg, name, subtitle,
//            sun: {sign, deg}, moon: {sign, deg}, ascendant: {sign, deg}|null,
//            planets: [{label, sign, deg, retro}] }
// ALLE Texte kommen bereits LOKALISIERT herein (posterLocale) — das Design
// bleibt dumm. Rein typografisch (keine Astro-Symbole: die eingebetteten
// Druck-Fonts garantieren dafür keine Glyphen — Tofu-Risiko im PDF).
// Der SONNEN-Block ist umrandet: das Sonnenzeichen ist der Kern des
// westlichen Charts (Analog zum umrandeten Tagesmeister im BaZi-Design).
// Ehrlichkeit: ascendant === null (unbekannte Geburtszeit) → die Zeile
// entfällt ersatzlos — nie ein geratener Aszendent.
import { escapeXml as esc } from './svgUtil.mjs'

function luminance(hex) {
  const c = (hex || '#E9DFCB').replace('#', '')
  return (
    (0.299 * parseInt(c.slice(0, 2), 16) + 0.587 * parseInt(c.slice(2, 4), 16) + 0.114 * parseInt(c.slice(4, 6), 16)) / 255
  )
}

const fmtDeg = (deg) => `${String(deg ?? '').replace('.', ',')}°`

export function render(data, { widthMm, heightMm }) {
  const W = widthMm
  const H = heightMm
  const bg = data.bg || '#E9DFCB'
  const light = luminance(bg) > 0.55
  const ink = light ? '#2A2620' : '#EDE6D6'
  const rule = light ? 'rgba(42,38,32,0.22)' : 'rgba(237,230,214,0.30)'
  const frameW = W * 0.05
  const matW = W * 0.065
  const artX = frameW + matW
  const artY = frameW + matW
  const artW = W - 2 * artX
  const artH = H - 2 * artY
  const cx = artX + artW / 2

  // Sonnen-Block (umrandet, der Kern) — Zeichen groß + Grad darunter.
  const sun = data.sun || {}
  const sunTop = artY + artH * 0.12
  const sunBoxW = artW * 0.62
  const sunBoxH = artH * 0.17
  const sunBlock = `
  <rect x="${cx - sunBoxW / 2}" y="${sunTop}" width="${sunBoxW}" height="${sunBoxH}" fill="none" stroke="${ink}" stroke-width="0.5"/>
  <text x="${cx}" y="${sunTop + sunBoxH * 0.30}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.020}" letter-spacing="0.22em" fill="${ink}" opacity="0.65">${esc(String(data.sunLabel || 'SUN').toUpperCase())}</text>
  <text x="${cx}" y="${sunTop + sunBoxH * 0.68}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.052}" fill="${ink}">${esc(String(sun.sign || '—'))}</text>
  <text x="${cx}" y="${sunTop + sunBoxH * 0.90}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.018}" letter-spacing="0.12em" fill="${ink}" opacity="0.7">${esc(fmtDeg(sun.deg))}</text>`

  // Mond + (optional) Aszendent — zweispaltig unter der Sonne.
  const moon = data.moon || {}
  const asc = data.ascendant
  const rowY = sunTop + sunBoxH + artH * 0.075
  const bigRow = (x, label, val) => `
  <text x="${x}" y="${rowY}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.017}" letter-spacing="0.2em" fill="${ink}" opacity="0.6">${esc(String(label).toUpperCase())}</text>
  <text x="${x}" y="${rowY + artH * 0.045}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.03}" fill="${ink}">${esc(String(val.sign || '—'))}</text>
  <text x="${x}" y="${rowY + artH * 0.07}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.015}" fill="${ink}" opacity="0.65">${esc(fmtDeg(val.deg))}</text>`
  const bigThree = asc
    ? bigRow(artX + artW * 0.28, data.moonLabel || 'Moon', moon) + bigRow(artX + artW * 0.72, data.ascLabel || 'Ascendant', asc)
    : bigRow(cx, data.moonLabel || 'Moon', moon)

  // Klassische Planeten Merkur–Saturn als ruhige Tabelle.
  const planets = Array.isArray(data.planets) ? data.planets : []
  const tableTop = rowY + artH * 0.13
  const lineH = artH * 0.042
  const rows = planets
    .map((pl, i) => {
      const y = tableTop + i * lineH
      return `
  <text x="${artX + artW * 0.16}" y="${y}" font-family="Noto Sans" font-size="${artH * 0.018}" letter-spacing="0.1em" fill="${ink}" opacity="0.7">${esc(String(pl.label || '').toUpperCase())}</text>
  <text x="${artX + artW * 0.84}" y="${y}" text-anchor="end" font-family="Noto Sans" font-size="${artH * 0.018}" fill="${ink}">${esc(String(pl.sign || '—'))} · ${esc(fmtDeg(pl.deg))}${pl.retro ? ' R' : ''}</text>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(data.frame || '#B98A5E')}"/>
  <rect x="${frameW}" y="${frameW}" width="${W - 2 * frameW}" height="${H - 2 * frameW}" fill="#F5F0E4"/>
  <rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" fill="${esc(bg)}"/>
  ${sunBlock}
  ${bigThree}
  ${rows}
  <line x1="${artX + artW * 0.08}" y1="${artY + artH * 0.82}" x2="${artX + artW * 0.92}" y2="${artY + artH * 0.82}" stroke="${rule}" stroke-width="0.35"/>
  <text x="${cx}" y="${artY + artH * 0.89}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.07}" fill="${ink}">${esc(data.name || '')}</text>
  <text x="${cx}" y="${artY + artH * 0.94}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.021}" letter-spacing="0.24em" fill="${ink}" opacity="0.62">${esc(data.subtitle || 'WESTERN · BIRTH CHART')}</text>
</svg>`
}
