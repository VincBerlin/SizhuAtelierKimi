/**
 * Global Vitest setup — loaded once per test worker (see vitest.config.ts
 * `test.setupFiles`). Registers the @testing-library/jest-dom custom matchers
 * (toBeInTheDocument, toHaveTextContent, …) on Vitest's expect, and runs an
 * automatic DOM cleanup after every test so component trees don't leak across
 * test cases.
 *
 * This file is jsdom-only: it is wired in as a setup file for the jsdom
 * (component/unit) project and is a no-op for the node (server/integration)
 * project, which does not import jest-dom.
 */
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { configure } from '@testing-library/dom'

// Lazy-loaded route chunks (code-split Collection routes) mount behind a Suspense
// boundary, so the first `findBy*` for a route can legitimately take longer than
// testing-library's 1000ms default while the chunk resolves — purely a timing
// artefact under CPU contention, not a real failure (the SAME assertion passes on
// rerun, and the isolated projects pass clean). Raising the async-utility timeout
// makes the combined run deterministic without weakening a single assertion: the
// query still has to succeed, it just gets honest headroom to do so.
configure({ asyncUtilTimeout: 5000 })

// Deterministic network boundary for jsdom component tests.
// The real composition root mounts AuthProvider, which fires apiMe() ->
// fetch('/api/auth/me') on mount. Under jsdom a relative URL has no origin to
// resolve against, so a real fetch can hang (never settling) and keep the test
// worker alive past the assertions. We stub fetch to reject fast with a
// network-style error; apiMe() already catches that and resolves to null, so
// the app boots exactly as it would offline — and nothing leaves a dangling
// request. Tests that need a specific HTTP contract override this per-test.
vi.stubGlobal(
  'fetch',
  vi.fn(() => Promise.reject(new Error('fetch is stubbed in jsdom tests'))),
)

// jsdom does not implement matchMedia; some UI code (reduced-motion checks,
// responsive helpers) reads it. Provide a non-matching stub so mounts don't
// throw. (Behavioural reduced-motion tests belong in Playwright, not here.)
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

// jsdom does not implement ResizeObserver. The lazy Home hero mounts an
// @react-three/fiber <Canvas> (InkWave), which measures its container via
// react-use-measure → ResizeObserver and throws under jsdom if it is absent.
// Provide a no-op stub so a real-boundary render of `/` (or any route that
// happens to mount the hero) does not crash. Visual/behavioural hero tests
// (reduced-motion, LCP) belong in Playwright, not here.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// jsdom does not implement IntersectionObserver either. InkWave (the hero canvas)
// uses it to pause/resume rendering when off-screen. A no-op stub keeps a
// real-boundary render of the hero from crashing under jsdom.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverStub {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: ReadonlyArray<number> = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return [] }
  }
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver
}

afterEach(() => {
  cleanup()
})
