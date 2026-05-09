import '@testing-library/jest-dom/vitest';

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

window.scrollTo = (() => {}) as typeof window.scrollTo;

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class MockEventSource {
  url: string;
  readyState = 0;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  constructor(url: string) {
    this.url = url;
  }
  addEventListener(): void {}
  removeEventListener(): void {}
  close(): void {}
}

if (typeof globalThis.EventSource === 'undefined') {
  (globalThis as unknown as { EventSource: typeof MockEventSource }).EventSource =
    MockEventSource;
}
