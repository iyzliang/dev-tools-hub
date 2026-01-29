type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface TrackEventOptions {
  toolName?: string;
}

export interface AnalyticsEventPayload {
  anonymous_id: string;
  session_id: string;
  event_name: string;
  tool_name?: string;
  properties?: Record<string, JsonValue>;
  user_agent?: string;
  locale?: string;
  timezone?: string;
  soft_fingerprint?: string;
  created_at: string;
}

const ANONYMOUS_ID_KEY = "dth_anonymous_id";
const SESSION_ID_KEY = "dth_session_id";
const SESSION_LAST_SEEN_KEY = "dth_session_last_seen";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const memoryLocalStorage = new Map<string, string>();
const memorySessionStorage = new Map<string, string>();

function getLocalStorage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key) => memoryLocalStorage.get(key) ?? null,
    setItem: (key, value) => {
      memoryLocalStorage.set(key, value);
    },
    removeItem: (key) => {
      memoryLocalStorage.delete(key);
    },
  };
}

function getSessionStorage(): StorageLike {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return {
    getItem: (key) => memorySessionStorage.get(key) ?? null,
    setItem: (key, value) => {
      memorySessionStorage.set(key, value);
    },
    removeItem: (key) => {
      memorySessionStorage.delete(key);
    },
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function getAnonymousId(): string {
  const storage = getLocalStorage();
  const existing = storage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;

  const id = generateId();
  storage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

export function getSessionId(now: number = Date.now()): string {
  const storage = getSessionStorage();
  const existingId = storage.getItem(SESSION_ID_KEY);
  const lastSeenRaw = storage.getItem(SESSION_LAST_SEEN_KEY);

  const lastSeen =
    typeof lastSeenRaw === "string" ? Number.parseInt(lastSeenRaw, 10) : 0;

  const isExpired =
    !existingId || !lastSeen || Number.isNaN(lastSeen) || now - lastSeen > SESSION_TIMEOUT_MS;

  const id = isExpired ? generateId() : (existingId as string);

  storage.setItem(SESSION_ID_KEY, id);
  storage.setItem(SESSION_LAST_SEEN_KEY, String(now));

  return id;
}

function getRuntimeContext() {
  if (typeof window === "undefined") {
    return {
      userAgent: undefined,
      locale: undefined,
      timezone: undefined,
      screen: undefined as { width: number; height: number } | undefined,
      softFingerprint: undefined as string | undefined,
    };
  }

  const ua = window.navigator?.userAgent;
  const locale = window.navigator?.language;
  let timezone: string | undefined;
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezone = undefined;
  }

  const screenInfo =
    typeof window.screen !== "undefined"
      ? { width: window.screen.width, height: window.screen.height }
      : undefined;

  let softFingerprint: string | undefined;
  try {
    const base = `${ua ?? ""}|${locale ?? ""}|${timezone ?? ""}|${
      screenInfo?.width ?? ""
    }x${screenInfo?.height ?? ""}`;
    if (base && typeof btoa !== "undefined") {
      softFingerprint = btoa(base).slice(0, 32);
    }
  } catch {
    softFingerprint = undefined;
  }

  return {
    userAgent: ua,
    locale,
    timezone,
    screen: screenInfo,
    softFingerprint,
  };
}

function buildEventPayload(
  name: string,
  properties: Record<string, JsonValue> | undefined,
  options: TrackEventOptions,
): AnalyticsEventPayload {
  const anonymousId = getAnonymousId();
  const sessionId = getSessionId();
  const ctx = getRuntimeContext();

  return {
    anonymous_id: anonymousId,
    session_id: sessionId,
    event_name: name,
    tool_name: options.toolName,
    properties,
    user_agent: ctx.userAgent,
    locale: ctx.locale,
    timezone: ctx.timezone,
    soft_fingerprint: ctx.softFingerprint,
    created_at: new Date().toISOString(),
  };
}

export async function trackEvent(
  name: string,
  properties: Record<string, JsonValue> = {},
  options: TrackEventOptions = {},
): Promise<void> {
  if (typeof window === "undefined") {
    // 在 SSR 或测试环境中静默跳过
    return;
  }

  const payload = buildEventPayload(name, properties, options);
  const body = JSON.stringify({ events: [payload] });

  try {
    const nav = window.navigator as Navigator & {
      sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
    };

    if (typeof nav.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      nav.sendBeacon("/api/events", blob);
      return;
    }

    if (typeof fetch === "function") {
      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        keepalive: true,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      // 在开发环境中输出警告，避免影响用户体验
      console.warn("[analytics] trackEvent failed", error);
    }
  }
}

/**
 * 将输入长度映射为大小区间，用于埋点元信息（不上传完整内容）。
 */
export function getInputSizeRange(length: number): string {
  if (length === 0) return "empty";
  if (length <= 100) return "0-100";
  if (length <= 1000) return "100-1k";
  if (length <= 10000) return "1k-10k";
  if (length <= 100000) return "10k-100k";
  return "100k+";
}

