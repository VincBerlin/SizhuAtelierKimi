// Design "Klassik" — geteilte SVG-Vorlage, portiert vom Poster.tsx-Layout
// (Rahmen → Passepartout → Farbfläche → Kopfzeile Element/Tier → 4 Säulen →
// Fußzeile Name). Wird vom Browser (Live-Vorschau, PosterSvg.tsx) und vom
// Node-Server (Druck-PDF, server/pdf.js) mit IDENTISCHEN Daten gerendert —
// eine Quelle, zwei Ausgaben, keine Vorschau/Druck-Drift.
//
// Einheit: 1 SVG-User-Unit = 1 mm. Font-Familien werden im PDF-Renderer über
// fontCallback auf die eingebetteten Noto-Schnitte gemappt.
import { escapeXml as esc } from './svgUtil.mjs'

function luminance(hex) {
  const c = (hex || '#E9DFCB').replace('#', '')
  return (
    (0.299 * parseInt(c.slice(0, 2), 16) + 0.587 * parseInt(c.slice(2, 4), 16) + 0.114 * parseInt(c.slice(4, 6), 16)) / 255
  )
}

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
  const colGap = artW / 4.6
  const colXs = [0, 1, 2, 3].map((i) => artX + artW / 2 + (i - 1.5) * colGap)
  const glyphSize = artH * 0.095
  const pillarTop = artY + artH * 0.3
  const pillars = (data.pillars || [])
    .map(
      (p, i) => `
    <text x="${colXs[i]}" y="${pillarTop}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.024}" opacity="0.5" fill="${ink}">${esc(p.label)}</text>
    <text x="${colXs[i]}" y="${pillarTop + glyphSize * 1.3}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.stem)}</text>
    <text x="${colXs[i]}" y="${pillarTop + glyphSize * 2.6}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.branch)}</text>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(data.frame || '#B98A5E')}"/>
  <rect x="${frameW}" y="${frameW}" width="${W - 2 * frameW}" height="${H - 2 * frameW}" fill="#F5F0E4"/>
  <rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" fill="${esc(bg)}"/>
  <text x="${artX + artW * 0.06}" y="${artY + artH * 0.07}" font-family="Noto Sans" font-size="${artH * 0.027}" letter-spacing="0.18em" fill="${ink}" opacity="0.78">${esc(String(data.element || '').toUpperCase())}</text>
  <text x="${artX + artW * 0.94}" y="${artY + artH * 0.07}" text-anchor="end" font-family="Noto Sans" font-size="${artH * 0.027}" letter-spacing="0.18em" fill="${ink}" opacity="0.78">${esc(String(data.animal || '').toUpperCase())}</text>
  ${pillars}
  <line x1="${artX + artW * 0.08}" y1="${artY + artH * 0.82}" x2="${artX + artW * 0.92}" y2="${artY + artH * 0.82}" stroke="${rule}" stroke-width="0.35"/>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.89}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.07}" fill="${ink}">${esc(data.name || '')}</text>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.94}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.021}" letter-spacing="0.24em" fill="${ink}" opacity="0.62">${esc(data.subtitle || 'BAZI · VIER SÄULEN')}</text>
</svg>`
}
