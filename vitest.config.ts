import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Vitest configuration for SizhuAtelier (REQ-014 / T-01).
 *
 * Two test environments live side by side via Vitest "projects":
 *   - `jsdom`  — component / unit tests for the React client (`src` + the
 *                real-boundary smoke that mounts `src/App.tsx`). Loads the
 *                jest-dom matchers via `tests/setup.ts`.
 *   - `node`   — Express `/api/checkout` integration tests (supertest against
 *                the real app, Stripe SDK stubbed). No DOM, no jsdom overhead.
 *
 * The split is by file location so a test file lands in the right environment
 * automatically:
 *   - tests/integration         -> node     (HTTP / server money-path)
 *   - tests/server             -> node
 *   - everything else in tests -> jsdom    (smoke, component, unit)
 *   - co-located src unit tests -> jsdom
 *
 * The `@` alias mirrors vite.config.ts / tsconfig so imports resolve the same
 * way in tests as they do in the app build.
 */
const alias = { '@': path.resolve(__dirname, './src') }

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    // Coverage applies across both projects.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Only measure the app/server source we actually own; configs, the test
      // harness itself and generated output are excluded.
      include: ['src/**', 'server/**'],
      exclude: [
        'src/main.tsx',
        '**/*.d.ts',
        'tests/**',
        'dist/**',
      ],
    },
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./tests/setup.ts'],
          include: [
            'src/**/*.{test,spec}.{ts,tsx}',
            'tests/**/*.{test,spec}.{ts,tsx}',
          ],
          // The node project owns these; keep them out of the jsdom run.
          // `tests/e2e/**` are Playwright `.spec.ts` files run by Playwright, not
          // Vitest — collecting them here makes `vitest run` fail (no Playwright
          // test runner in this env), so exclude them from the jsdom project too.
          exclude: [
            'tests/integration/**',
            'tests/server/**',
            'tests/e2e/**',
            'node_modules/**',
            'dist/**',
          ],
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          // Real-HTTP boundary tests (supertest) can pay a one-time cold-start
          // cost on the first request in a fresh worker (the large Stripe SDK is
          // transformed/imported lazily). Give them headroom so cold CI runs are
          // not flaky; warm runs finish in well under a second.
          testTimeout: 20000,
          include: [
            'tests/integration/**/*.{test,spec}.{ts,tsx}',
            'tests/server/**/*.{test,spec}.{ts,tsx}',
          ],
          exclude: ['node_modules/**', 'dist/**'],
        },
      },
    ],
  },
})
