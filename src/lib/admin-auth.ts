import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "dth_admin_session";
const ADMIN_SESSION_TTL_MS = 60 * 60 * 1000; // 1 小时

type RateLimitBucket = {
  attempts: number;
  resetAt: number;
};

const loginRateLimitStore = new Map<string, RateLimitBucket>();

export function isAdminPasswordValid(password: string | undefined): boolean {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected || !password) return false;
  return password === expected;
}

export function createAdminSessionCookie(): {
  name: string;
  value: string;
  options: Parameters<ReturnType<typeof cookies>["set"]>[2];
} {
  const token = `admin-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  const expires = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    },
  };
}

export function hasValidAdminSessionFromCookie(cookieValue: string | undefined): boolean {
  return typeof cookieValue === "string" && cookieValue.length > 0;
}

export function hasValidAdminSession(): boolean {
  const cookie = cookies().get(ADMIN_SESSION_COOKIE);
  return hasValidAdminSessionFromCookie(cookie?.value);
}

export function getClientIdentifier(
  ipHeader: string | null,
  userAgent: string | null,
): string {
  const ip = ipHeader?.split(",")[0]?.trim() || "unknown-ip";
  const ua = userAgent || "unknown-ua";
  return `${ip}|${ua}`;
}

export function checkAndIncreaseLoginRateLimit(clientId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const WINDOW_MS = 5 * 60 * 1000; // 5 分钟
  const MAX_ATTEMPTS = 10;

  const bucket = loginRateLimitStore.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    const next: RateLimitBucket = {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    };
    loginRateLimitStore.set(clientId, next);
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: next.resetAt,
    };
  }

  if (bucket.attempts >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  bucket.attempts += 1;
  loginRateLimitStore.set(clientId, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, MAX_ATTEMPTS - bucket.attempts),
    resetAt: bucket.resetAt,
  };
}

