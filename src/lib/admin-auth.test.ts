import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  checkAndIncreaseLoginRateLimit,
  createAdminSessionCookie,
  getClientIdentifier,
  hasValidAdminSessionFromCookie,
  isAdminPasswordValid,
} from "./admin-auth";

describe("admin-auth helpers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("validates admin password against env var", () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "secret";

    expect(isAdminPasswordValid("secret")).toBe(true);
    expect(isAdminPasswordValid("wrong")).toBe(false);
    expect(isAdminPasswordValid(undefined)).toBe(false);
  });

  it("creates admin session cookie with secure attributes", () => {
    const cookie = createAdminSessionCookie();

    expect(cookie.name).toBe("dth_admin_session");
    expect(typeof cookie.value).toBe("string");
    expect(cookie.value.length).toBeGreaterThan(0);
    expect(cookie.options.httpOnly).toBe(true);
    expect(cookie.options.sameSite).toBe("lax");
  });

  it("checks admin session cookie value", () => {
    expect(hasValidAdminSessionFromCookie(undefined)).toBe(false);
    expect(hasValidAdminSessionFromCookie("")).toBe(false);
    expect(hasValidAdminSessionFromCookie("token")).toBe(true);
  });

  it("builds client identifier from ip and user-agent", () => {
    const id = getClientIdentifier("1.2.3.4, 5.6.7.8", "test-agent");
    expect(id).toBe("1.2.3.4|test-agent");

    const idFallback = getClientIdentifier(null, null);
    expect(idFallback).toBe("unknown-ip|unknown-ua");
  });

  it("applies simple rate limiting for login attempts", () => {
    const clientId = "client-1";

    // Consume the allowed attempts
    let last;
    for (let i = 0; i < 10; i += 1) {
      last = checkAndIncreaseLoginRateLimit(clientId);
      expect(last.allowed).toBe(true);
    }

    const blocked = checkAndIncreaseLoginRateLimit(clientId);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});

