// Geteiltes ESM-JS (Browser via Vite UND Node-Server ohne Build-Schritt).
// Jeder Nutzertext in einer SVG-Vorlage MUSS hier durch — der Design-TÜV
// (tests/unit/design-registry-tuev.test.ts) erzwingt das mit einem
// Injektions-Fixture.

export function escapeXml(s) {
  return String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}
