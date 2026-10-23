import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Polyfill for jsdom missing APIs used by msw/next
if (typeof global.Headers === 'undefined') {
  // jsdom should have it, but guard
}

// Mock sonner toast to avoid UI side-effects and to spy on toasts
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

// Stub window.location navigation to prevent jsdom "Not implemented: navigation" errors
// triggered by api.ts interceptor doing window.location.href = '/login' on 401
// We preserve an absolute href so that URL('/api/...', window.location.href) keeps working
let _href = 'http://localhost:3000/';
const originalLocation = window.location;
delete (window as any).location;
(window as any).location = {
  href: _href,
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: vi.fn((url: string) => {
    _href = url.startsWith('/') ? `http://localhost:3000${url}` : url;
  }),
  replace: vi.fn((url: string) => {
    _href = url.startsWith('/') ? `http://localhost:3000${url}` : url;
  }),
  reload: vi.fn(),
  toString: () => _href,
  // keep reference to original for any other access
  _original: originalLocation,
};
Object.defineProperty(window.location, 'href', {
  get: () => _href,
  set: (v: string) => {
    // Resolve relative URLs to absolute to keep base valid for msw's new URL(url, base)
    if (v.startsWith('/')) {
      _href = `http://localhost:3000${v}`;
    } else {
      try {
        // If v is relative without leading '/', resolve via URL
        _href = new URL(v, 'http://localhost:3000').href;
      } catch {
        _href = v;
      }
    }
  },
  configurable: true,
});

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

// Silence Next.js router warnings in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Provide import.meta.env compatibility if needed
