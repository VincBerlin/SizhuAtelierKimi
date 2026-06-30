import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration — SCAFFOLD ONLY for T-01 (REQ-014).
 *
 * The E2E / real-DOM suites (REQ-007/008/009/010/011/017/018 disclosure,
 * AT-NEG-SAJU, AT-021 LCP) are authored in a LATER iteration. This file +
 * the empty `tests/e2e/` directory exist now so that wiring is ready and the
 * project's test topology is complete, but:
 *   - NO browsers are downloaded in this iteration
 *     (do not run `npx playwright install`).
 *   - `npm test` runs Vitest only; Playwright is invoked separately via
 *     `npx playwright test` once the e2e specs and browsers land.
 *
 * `testDir` is isolated to `tests/e2e` so Playwright never tries to execute the
 * Vitest specs under `tests/smoke|integration|server`, and Vitest's config
 * likewise excludes `tests/e2e`.
 *
 * The dev server is started automatically (vite on :3000) when e2e runs; it is
 * defined here so the later iteration only needs to add specs. Real breakpoints
 * (360/390/430) per REQ-017 are configured per-project below.
 */
const PORT = 3000
// Overridable so the suite can target an already-running server (e.g. a prod build
// on another port) instead of always booting the vite dev server. Default unchanged.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  // No specs yet — an empty run must not fail CI in this iteration.
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  // The InkWave Three.js hero is GPU/CPU-heavy; too many parallel workers against a
  // single dev/prod server starve renders and cause spurious toBeVisible timeouts.
  // Cap local parallelism and give lazy-route content room to paint.
  workers: process.env.CI ? undefined : 2,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-360', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } } },
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'mobile-430', use: { ...devices['Desktop Chrome'], viewport: { width: 430, height: 932 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
