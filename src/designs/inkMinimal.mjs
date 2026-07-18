// Design "Ink Minimal" — zweites Einzel-Design (Operator 2026-07-14: Beweis,
// dass Design-Templates dauerhaft hinterlegbar sind: neue Datei + EINE
// Registry-Zeile → erscheint automatisch im Wähler, rendert Vorschau UND
// Druck-PDF aus derselben Funktion und läuft durch den Design-TÜV).
//
// Gestaltung: radikal reduziert — großzügiger Weißraum, nur die vier Säulen
// (Tagesmeister umrandet), Tagesmeister-Element/Tier als schmale Fußnote,
// Name klein. Gleicher Datenvertrag wie "klassik" (kind: 'single').
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
  const rule = light ? 'rgba(42,38,32,0.18)' : 'rgba(237,230,214,0.26)'
  const frameW = W * 0.05
  const artX = frameW
  const artY = frameW
  const artW = W - 2 * artX
  const artH = H - 2 * artY
  const colGap = artW / 5.2
  const colXs = [0, 1, 2, 3].map((i) => artX + artW / 2 + (i - 1.5) * colGap)
  const glyphSize = artH * 0.085
  const pillarTop = artY + artH * 0.36
  const pillars = (data.pillars || [])
    .map(
      (p, i) => `
    <text x="${colXs[i]}" y="${pillarTop}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.02}" opacity="0.45" fill="${ink}">${esc(p.label)}</text>
    <text x="${colXs[i]}" y="${pillarTop + glyphSize * 1.35}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.stem)}</text>
    <text x="${colXs[i]}" y="${pillarTop + glyphSize * 2.7}" text-anchor="middle" font-family="Noto Serif SC" font-size="${glyphSize}" fill="${ink}">${esc(p.branch)}</text>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <rect x="0" y="0" width="${W}" height="${H}" fill="${esc(data.frame || '#B98A5E')}"/>
  <rect x="${artX}" y="${artY}" width="${artW}" height="${artH}" fill="${esc(bg)}"/>
  <rect x="${colXs[2] - colGap * 0.44}" y="${pillarTop - artH * 0.045}" width="${colGap * 0.88}" height="${glyphSize * 2.7 + artH * 0.085}" fill="none" stroke="${ink}" stroke-width="0.5"/>
  ${pillars}
  <line x1="${artX + artW * 0.2}" y1="${artY + artH * 0.78}" x2="${artX + artW * 0.8}" y2="${artY + artH * 0.78}" stroke="${rule}" stroke-width="0.3"/>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.845}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.02}" letter-spacing="0.22em" fill="${ink}" opacity="0.7">${esc(String(data.element || '').toUpperCase())} · ${esc(String(data.animal || '').toUpperCase())}</text>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.9}" text-anchor="middle" font-family="Noto Serif SC" font-size="${artH * 0.045}" fill="${ink}">${esc(data.name || '')}</text>
  <text x="${artX + artW / 2}" y="${artY + artH * 0.94}" text-anchor="middle" font-family="Noto Sans" font-size="${artH * 0.018}" letter-spacing="0.26em" fill="${ink}" opacity="0.55">${esc(data.subtitle || 'BAZI · VIER SÄULEN')}</text>
</svg>`
}
