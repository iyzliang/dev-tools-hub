import { describe, expect, it } from "vitest";
import {
  ensureTrimmedString,
  getClientIp,
  isRecord,
  safeParseJsonBody,
} from "./api-security";

describe("api-security helpers", () => {
  it("isRecord only accepts non-null objects", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ foo: "bar" })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord("foo")).toBe(false);
  });

  it("ensureTrimmedString trims and caps length", () => {
    expect(ensureTrimmedString("  foo  ")).toBe("foo");
    expect(ensureTrimmedString("")).toBeUndefined();
    expect(ensureTrimmedString("   ")).toBeUndefined();
    expect(ensureTrimmedString(123)).toBeUndefined();

    const long = "a".repeat(2000);
    const result = ensureTrimmedString(long, 100);
    expect(result).toHaveLength(100);
  });

  it("safeParseJsonBody accepts plain objects and arrays", () => {
    expect(safeParseJsonBody({ foo: "bar" })).toEqual({ foo: "bar" });
    expect(safeParseJsonBody([1, 2, 3])).toEqual([1, 2, 3]);
    expect(safeParseJsonBody("foo")).toBeNull();
    expect(safeParseJsonBody(null)).toBeNull();
  });

  it("getClientIp prefers x-forwarded-for then x-real-ip", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "1.2.3.4, 5.6.7.8");

    // We can't easily construct a real NextRequest here, but getClientIp only
    // relies on headers.get, so cast a compatible shape.
    const nextReq = {
      headers: {
        get(name: string) {
          return headers.get(name);
        },
      },
    } as unknown as Parameters<typeof getClientIp>[0];

    expect(getClientIp(nextReq)).toBe("1.2.3.4");

    const headers2 = new Headers();
    headers2.set("x-real-ip", "9.9.9.9");
    const nextReq2 = {
      headers: {
        get(name: string) {
          return headers2.get(name);
        },
      },
    } as unknown as Parameters<typeof getClientIp>[0];

    expect(getClientIp(nextReq2)).toBe("9.9.9.9");

    const nextReq3 = {
      headers: {
        get() {
          return null;
        },
      },
    } as unknown as Parameters<typeof getClientIp>[0];

    expect(getClientIp(nextReq3)).toBe("unknown-ip");
  });
});

