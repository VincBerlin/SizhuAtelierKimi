// Design "Paar-Harmonie" — Partnerschafts-Poster (合婚).
// Vertrag (kind: 'pair'): render(pairData, {widthMm, heightMm}) mit
//   pairData = { nameA, nameB, chartA: {pillars, element, animal},
//                chartB, relationLabel, bg, frame }
// Zwei Säulensätze nebeneinander, Relations-Label als verbindendes Element.
// Ehrlichkeits-Regel: es werden NUR CALCULATED-Fakten dargestellt (die
// Relation kommt vorgefiltert aus server/fufire.js matchHehun).
import { escapeXml as esc } from './svgUtil.mjs'

function luminance(hex) {
  const c = (hex || '#E9DFCB').replace('#', '')
  return (
    (0.299 * parseInt(c.slice(0, 2), 16) + 0.587 * parseInt(c.slice(2, 4), 16) + 0.114 * parseInt(c.slice(4, 6), 16)) / 255
  )
}

function pillarColumn(pillars, cx, top, glyphSize, gap, ink, labelSize) {
  return (pillars || [])
    .map(
      (p, i) => `
    <text x="${cx + (i - 1.5) * gap}" y="${top}" text-anchor="middle" font-family="Noto Serif SC" font-size="${labelSize}" opacity="0.5" fill="${ink}">${esc(p.label)}</text>
    <text x="${cx + (i - 1.5) * gap}" y="${top + glyphSize * 1.25}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.stem)}</text>
    <text x="${cx + (i - 1.5) * gap}" y="${top + glyphSize * 2.5}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.branch)}</text>`,
    )
    .join('')
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
  const chartA = data.chartA || { pillars: [] }
  const chartB = data.chartB || { pillars: [] }
  const glyph = artH * 0.052
  const gap = artW / 9.2
  const cxA = artX + artW * 0.27
  const cxB = artX + artW * 0.73
  const colTop = artY + artH * 0.28
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(data.frame || '#B98A5E')}"/>
  <rect x="${frameW}" y="${frameW}" width="${W - 2 * frameW}" height="${H - 2 * frameW}" fill="#F5F0E4"/>
  <rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" fill="${esc(bg)}"/>
  <text x="${cxA}" y="${artY + artH * 0.08}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.024}" letter-spacing="0.14em" fill="${ink}" opacity="0.78">${esc(String(chartA.element || '').toUpperCase())} · ${esc(String(chartA.animal || '').toUpperCase())}</text>
  <text x="${cxB}" y="${artY + artH * 0.08}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.024}" letter-spacing="0.14em" fill="${ink}" opacity="0.78">${esc(String(chartB.element || '').toUpperCase())} · ${esc(String(chartB.animal || '').toUpperCase())}</text>
  ${pillarColumn(chartA.pillars, cxA, colTop, glyph, gap, ink, artH * 0.018)}
  ${pillarColumn(chartB.pillars, cxB, colTop, glyph, gap, ink, artH * 0.018)}
  <line x1="${artX + artW / 2}" y1="${artY + artH * 0.2}" x2="${artX + artW / 2}" y2="${artY + artH * 0.62}" stroke="${rule}" stroke-width="0.3"/>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.72}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.026}" letter-spacing="0.1em" fill="${ink}" opacity="0.85">${esc(data.relationLabel || '')}</text>
  <line x1="${artX + artW * 0.08}" y1="${artY + artH * 0.8}" x2="${artX + artW * 0.92}" y2="${artY + artH * 0.8}" stroke="${rule}" stroke-width="0.35"/>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.88}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.052}" fill="${ink}">${esc(data.nameA || '')} · ${esc(data.nameB || '')}</text>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.93}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.019}" letter-spacing="0.24em" fill="${ink}" opacity="0.62">BAZI · PARTNERSCHAFT</text>
</svg>`
}
