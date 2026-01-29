import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  getAnonymousId,
  getInputSizeRange,
  getSessionId,
  trackEvent,
} from "./analytics";

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

type TestWindow = {
  localStorage: StorageLike;
  sessionStorage: StorageLike;
  navigator: {
    userAgent: string;
    language: string;
    sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
  };
  screen: { width: number; height: number };
};

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

let testWindow: TestWindow;

describe("analytics id helpers", () => {
  beforeEach(() => {
    const localStorage = createMemoryStorage();
    const sessionStorage = createMemoryStorage();

    testWindow = {
      localStorage,
      sessionStorage,
      navigator: {
        userAgent: "vitest-agent",
        language: "en-US",
        sendBeacon: vi.fn(() => true),
      },
      screen: { width: 1920, height: 1080 },
    };

    (globalThis as { window?: TestWindow }).window = testWindow;
  });

  afterEach(() => {
    delete (globalThis as { window?: TestWindow }).window;
  });

  it("generates and persists an anonymous id", () => {
    const first = getAnonymousId();
    const second = getAnonymousId();

    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(testWindow.localStorage.getItem("dth_anonymous_id")).toBe(first);
  });

  it("reuses and expires session id based on timeout", () => {
    const t0 = 1_000;
    const first = getSessionId(t0);
    const mid = getSessionId(t0 + 10 * 60_000); // +10min
    const afterTimeout = getSessionId(t0 + 41 * 60_000); // +41min (> 30min since last activity)

    expect(first).toBeTruthy();
    expect(mid).toBe(first);
    expect(afterTimeout).not.toBe(first);
  });
});

describe("trackEvent", () => {
  beforeEach(() => {
    const localStorage = createMemoryStorage();
    const sessionStorage = createMemoryStorage();

    testWindow = {
      localStorage,
      sessionStorage,
      navigator: {
        userAgent: "vitest-agent",
        language: "en-US",
        sendBeacon: vi.fn(() => true),
      },
      screen: { width: 1280, height: 720 },
    };

    (globalThis as { window?: TestWindow }).window = testWindow;
  });

  afterEach(() => {
    delete (globalThis as { window?: TestWindow }).window;
  });

  it("sends event via navigator.sendBeacon when available", async () => {
    await trackEvent("page_view", { foo: "bar" }, { toolName: "json_formatter" });

    expect(testWindow.navigator.sendBeacon).toBeDefined();
    expect(testWindow.navigator.sendBeacon).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when running without window (e.g. SSR)", () => {
    delete (globalThis as { window?: TestWindow }).window;
    return expect(
      trackEvent("page_view", { from: "test" }),
    ).resolves.toBeUndefined();
  });
});

describe("getInputSizeRange", () => {
  it("returns size range labels for input length", () => {
    expect(getInputSizeRange(0)).toBe("empty");
    expect(getInputSizeRange(50)).toBe("0-100");
    expect(getInputSizeRange(100)).toBe("0-100");
    expect(getInputSizeRange(101)).toBe("100-1k");
    expect(getInputSizeRange(1000)).toBe("100-1k");
    expect(getInputSizeRange(1001)).toBe("1k-10k");
    expect(getInputSizeRange(10000)).toBe("1k-10k");
    expect(getInputSizeRange(10001)).toBe("10k-100k");
    expect(getInputSizeRange(100000)).toBe("10k-100k");
    expect(getInputSizeRange(100001)).toBe("100k+");
  });
});

