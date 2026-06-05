import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/dom';

// Node 26 slows jsdom/userEvent tests enough that waitFor's default 1000ms
// polling window expires under parallel contention, flaking userEvent-heavy
// App.test.tsx tests (element-not-found). Raise it to 5s — the companion to
// vite.config.ts's testTimeout bump — so the /ft-release viz gate stays
// reliable. See FE-053.
configure({ asyncUtilTimeout: 5000 });

// Node 26 defines globalThis.localStorage as undefined (experimental, needs
// --localstorage-file), which causes vitest's populateGlobal to skip copying
// jsdom's Storage implementation. Polyfill here, matching the existing
// scrollTo/matchMedia pattern.
if (typeof window.localStorage === 'undefined') {
  const makeStorage = (): Storage => {
    const store = new Map<string, string>();
    return {
      get length() {
        return store.size;
      },
      key(index: number): string | null {
        return [...store.keys()][index] ?? null;
      },
      getItem(key: string): string | null {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string): void {
        store.set(key, String(value));
      },
      removeItem(key: string): void {
        store.delete(key);
      },
      clear(): void {
        store.clear();
      },
    };
  };
  Object.defineProperty(window, 'localStorage', {
    value: makeStorage(),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: makeStorage(),
    writable: true,
    configurable: true,
  });
}

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

// jsdom 25 ships HTMLDialogElement but not showModal/close behavior.
// Minimal polyfill: toggle the `open` attribute and fire the `close` event.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal: () => void;
    show: () => void;
    close: (returnValue?: string) => void;
  };
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function () {
      this.setAttribute('open', '');
    };
  }
  if (typeof proto.show !== 'function') {
    proto.show = function () {
      this.setAttribute('open', '');
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function (returnValue?: string) {
      this.removeAttribute('open');
      if (returnValue !== undefined) this.setAttribute('returnvalue', returnValue);
      this.dispatchEvent(new Event('close'));
    };
  }
}
